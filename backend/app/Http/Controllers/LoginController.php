<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Students;
use App\Models\Teachers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class LoginController extends Controller
{
    public function login(Request $request){
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

      // check email
      $user = null;
      $userToken = null;

      if($user = Admin::where('email', $fields['email'])->first()){
        $userToken = "adminToken";
      }
      elseif($user = Teachers::where('email', $fields['email'])->first()){
        $userToken = "teachersToken";
      }
      elseif($user = Students::where('email', $fields['email'])->first()){
        $userToken = "studentsToken";
      }

      // check password
      if(!$user || !Hash::check($fields['password'], $user->password)){
        RateLimiter::hit($key, 60); // Increase the count of login attempts
        // Log::warning('Failed login attempt', ['email' => $email]);
        return response([
            'message' => 'Invalid credentials'
        ], 401);
      }

      $remember = $request->boolean('remember');

      // login user
      Auth::guard()->login($user, $remember);

      // Generate token
      $token = $user->createToken($userToken)->plainTextToken;

      $response = [
          'user' => $user,
          'token' => $token
      ];

      return response($response, 201);
    }
}
