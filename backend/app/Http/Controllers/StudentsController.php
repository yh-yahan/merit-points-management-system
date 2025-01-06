<?php

namespace App\Http\Controllers;

use App\Models\Students;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Cookie;

class StudentsController extends Controller
{
    public function SignUp(Request $request){
      $fields = $request->validate([
        'name' => 'required|string', 
        'username' => 'required|string', 
        'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email', 
        'password' => 'required|confirmed|min:6', 
        'class' => 'required|string', 
        'stream' => 'required|string', 
        'invitation_code' => 'required|string'
      ]);

      $students = Students::create([
        'name' => $fields['name'], 
        'username' => $fields['username'], 
        'email' => $fields['email'], 
        'password' => Hash::make($fields['password']), 
        'class' => $fields['class'], 
        'stream' => $fields['stream'], 
        'status' => 'active',
        'date_joined' => now(),
      ]);

      // $token = $students->createToken('studentsToken')->plainTextToken;
      $token = $students->createToken(
        'studentsToken', 
        ['*'], 
        now()->addDays(7)
      )->plainTextToken;

      $cookie = New Cookie('auth_token', $token, now()->addDays(7)->timestamp, '/', null, true, true, false, 'None', true);

      $notification = [
        'title' => "New sign up", 
        'message' => "Student " . $students->name . " has signed up " . "via invitation code of " . "'". $fields['invitation_code'] . "'", 
        'is_read' => false, 
      ];

      app('App\Http\Controllers\AdminController')->Notifications($notification);

      $response = [
        'students' => $students, 
        // 'token' => $token, 
      ];

      return response($response, 201)->withCookie($cookie);
    }
}
