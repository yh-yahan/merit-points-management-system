<?php

namespace App\Http\Controllers;

use App\Models\Teachers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Cookie;

class TeachersController extends Controller
{
    public function signup(Request $request){
      $fields = $request->validate([
        'name' => 'required|string', 
        'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email', 
        'password' => 'required|string|min:6|confirmed', 
        'description' => 'nullable|string'
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

      $response = [
        'teacher' => $teacher, 
        // 'token' => $token, 
      ];

      return response($response, 201)->withCookie($cookie);
    }
}
