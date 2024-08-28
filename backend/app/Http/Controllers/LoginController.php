<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Students;
use App\Models\Teachers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Cookie;

class LoginController extends Controller
{
    public function Login(Request $request){
      $fields = $request->validate([
        'email' => 'required|email', 
        'password' => 'required|string|min:6', 
        'remember' => 'boolean|required', 
      ]);

      // rate limiting for login attempts
      $email = $fields['email'];
      $key = 'login-attempt:' . $email;

      if(RateLimiter::tooManyAttempts($key, 5)){
        return response([
          'message' => 'Too many login attempts. Please try again later.'
        ], 429);
      }
      RateLimiter::hit($key, 60);

      // check email
      $user = null;
      $userToken = null;
      $userType = null;

      $adminUser = Admin::where('email', $fields['email'])->first();
      $teacherUser = Teachers::where('email', $fields['email'])->first();
      $studentUser = Students::where('email', $fields['email'])->first();

      if($adminUser){
        $user = $adminUser;
        $userType = "admin";
        $userToken = "adminToken";
      }
      elseif($teacherUser){
        $user = $teacherUser;
        $userType = "teacher";
        $userToken = "teachersToken";
      }
      elseif($studentUser){
        $user = $studentUser;
        $userType = "student";
        $userToken = "studentsToken";
      }

      // check password
      if(!$user || !Hash::check($fields['password'], $user->password)){
        return response([
          'message' => 'Invalid credentials'
        ], 401);
      }

      $remember = $request->boolean('remember');

      // login user
      Auth::guard()->login($user, $remember);

      // Generate token
      $token = $user->createToken(
        $userToken, 
        ['*'], 
        now()->addDays($remember ? 30 : 7)
      )->plainTextToken;

      // set cookie
      $cookieExpiration = $remember ? now()->addDays(30)->timestamp : now()->addDays(7)->timestamp;
      $cookie = New Cookie('auth_token', $token, $cookieExpiration, '/', null, true, true, false, 'None', true);

      $response = [
        'user' => $user,
        'userType' => $userType, 
        // 'token' => $token, 
      ];

      return response($response, 201)->withCookie($cookie);
    }

    function check_auth(Request $request){
      $token = $request->cookie('auth_token');

      $user = PersonalAccessToken::findToken($token);

      if(!$user){
        return response()->json(['message' => 'Invalid token'], 401);
      }

      $userType = null;
      if($user->name == "adminToken"){
        $userType = "admin";
      }
      elseif($user->name == "teachersToken"){
        $userType = "teacher";
      }
      elseif($user->name == "studentsToken"){
        $userType = "student";
      }

      //check if token is expired
      $expired = now()->greaterThan($user->expires_at);

      if($user && !$expired){
        $response = [
          'user' => $user, 
          'userType' => $userType
        ];
      }
      else{
        return response()->json(['message' => 'Invalid token'], 401);
      }

      return response($response, 200);
    }

    public function Logout(Request $request){
      $token = $request->cookie('auth_token');
      $personalAccessToken = PersonalAccessToken::findToken($token);

      if($personalAccessToken){
        $personalAccessToken->delete();

        cookie()->forget('auth_token');

        return response([
          'message' => 'Logged out'
        ], 200);
      }
      else{
        return response([
          'message' => 'Logged out'
        ], 200);
      }
    }
}
