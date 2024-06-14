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

      $tokenExpiration = $fields['remember'] ? 60*24*30 : 60*24;
      $cookie = cookie('auth_token', $token, $tokenExpiration, null, null, true, true, false, "Lax");

      $response = [
        'user' => $user,
        'userType' =>  $userType, 
        'token' => $token
      ];

      return response($response, 201)->cookie($cookie);
    }
}
