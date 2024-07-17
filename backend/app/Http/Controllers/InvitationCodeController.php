<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\InvitationCodes;
// use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\RateLimiter;

class InvitationCodeController extends Controller
{
    public function CreateInvitationCode(Request $request){
      $fields = $request->validate([
        'for_user_type' => "required|string", 
        'valid_until' => "required|date|after:today", 
      ]);

      // check who created the invitation code
      // get token from request
      $token = $request->bearerToken();
      if(!$token){
        return response()->json(['error' => 'Token not provided'], 401);
      }
      // find token from PersonalAccessToken
      $accessToken = PersonalAccessToken::findToken($token);
      if (!$accessToken) {
        return response()->json(['error' => 'Invalid token'], 401);
      }
      // Check if the accessToken matches 'adminToken'
      if ($accessToken->name !== 'adminToken') {
        return response()->json(['error' => 'Invalid token'], 401);
      }

      if($accessToken){
        $created_by = $accessToken->tokenable_id;
      }
      else{
        return response()->json(['error' => 'Invalid token'], 401); 
      }

      // generate code
      $prefix = "INV-";
      $length = 4;

      function generateUniquePart($characters, $length){
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
          $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
      }

      $characters = 'BCDFGHJKLMNPQRSTVWXYZ346789';
      $uniquePart = generateUniquePart($characters, $length) . '-' . generateUniquePart($characters, $length);
      $code = $prefix . $uniquePart;

      while(InvitationCodes::where('code', $code)->exists()){
        $uniquePart = generateUniquePart($characters, $length) . '-' . generateUniquePart($characters, $length);
        $code = $prefix . $uniquePart;
      }

      // store in database
      $invitationCode = InvitationCodes::create([
        'code' => $code, 
        'for_user_type' => $fields['for_user_type'], 
        'created_by' => $created_by, 
        'valid_until' => $fields['valid_until']
      ]);

      $admin = InvitationCodes::with('admin')->find($created_by);

      $response = [
        'invitationCode' => $invitationCode, 
        'code' => $code, 
        'created_by' => $created_by, 
        // 'admin' => $admin, 
      ];

      return response($response, 201);
    }

    public function ValidateInvitationCode(Request $request){
      $fields = $request->validate([
        'invitationCode' => "required|string"
      ]);

      // add rate limits
      $maxAttempts = 5;
      $decayMinutes = 1;
      $key = 'validate-invitation-code:' . $request->ip();
      if(RateLimiter::tooManyAttempts($key, $maxAttempts)){
        $seconds = RateLimiter::availableIn($key);
        return response([
          // 'message' => 'Too many attempts. Please try again in ' . $seconds . ' seconds.'
          'message' => 'Too many attempts. Please try again later.'
        ], 429);
      }
      RateLimiter::hit($key, $decayMinutes * 60);

      $result = InvitationCodes::where('code', $fields['invitationCode'])->first();

      if(!$result){
        return response([
          'message' => 'Invalid invitation code'
      ], 401);
      }
      
      return response([
        'result' => $result
      ], 200);
    }
}
