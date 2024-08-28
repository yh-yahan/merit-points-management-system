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
        'stage' => 'required|string', 
        'stream' => 'required|string', 
      ]);

      $students = Students::create([
        'name' => $fields['name'], 
        'username' => $fields['username'], 
        'email' => $fields['email'], 
        'password' => Hash::make($fields['password']), 
        'stage' => $fields['stage'], 
        'stream' => $fields['stream'], 
      ]);

      // $token = $students->createToken('studentsToken')->plainTextToken;
      $token = $students->createToken(
        'studentsToken', 
        ['*'], 
        now()->addDays(7)
      )->plainTextToken;

      $cookie = New Cookie('auth_token', $token, now()->addDays(7)->timestamp, '/', null, true, true, false, 'None', true);

      $response = [
        'students' => $students, 
        // 'token' => $token, 
      ];

      return response($response, 201)->withCookie($cookie);
    }
}
