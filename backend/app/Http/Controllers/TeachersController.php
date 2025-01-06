<?php

namespace App\Http\Controllers;

use App\Models\Teachers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Cookie;

class TeachersController extends Controller
{
    public function SignUp(Request $request){
      $fields = $request->validate([
        'name' => 'required|string', 
        'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email', 
        'password' => 'required|string|min:6|confirmed', 
        'description' => 'nullable|string', 
        'invitation_code' => 'required|string'
      ]);

      $teacher = Teachers::create([
        'name' => $fields['name'], 
        'email' => $fields['email'], 
        'password' => Hash::make($fields['password']), 
        'description' => $fields['description'], 
      ]);

      // $token = $teacher->createToken('teachersToken')->plainTextToken;
      $token = $teacher->createToken(
        'teachersToken', 
        ['*'], 
        now()->addDays(7)
      )->plainTextToken;

      $cookie = New Cookie('auth_token', $token, now()->addDays(7)->timestamp, '/', null, true, true, false, 'None', true);

      $notification = [
        'title' => "New sign up", 
        'message' => "Teacher " . $teacher->name . " has signed up " . "via invitation code of " . "'". $teacher->invitation_code . "'", 
        'is_read' => false, 
      ];

      app('App\Http\Controllers\AdminController')->Notifications($notification);

      $response = [
        'teacher' => $teacher, 
        // 'token' => $token, 
      ];

      return response($response, 201)->withCookie($cookie);
    }
}
