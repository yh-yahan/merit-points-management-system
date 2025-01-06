<?php

namespace App\Http\Controllers;

use App\Models\InvitationCodes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class InvitationCodeController extends Controller
{
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
