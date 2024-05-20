<?php

namespace App\Http\Controllers;

use App\Models\Students;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentsController extends Controller
{
    public function signup(Request $request){
      $fields = $request->validate([
        'name' => 'required|string', 
        'username' => 'required|string', 
        'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email', 
        'password' => 'required|confirmed|min:6', 
        'stage' => 'required|string', 
        'stream' => 'nullable|string', 
      ]);

      $students = Students::create([
        'name' => $fields['name'], 
        'username' => $fields['username'], 
        'email' => $fields['email'], 
        'password' => Hash::make($fields['password']), 
        'stage' => $fields['stage'], 
        'stream' => $fields['stream'], 
      ]);

      $token = $students->createToken('studentsToken')->plainTextToken;

      $response = [
        'students' => $students, 
        'token' => $token, 
      ];

      return response($response, 201);
    }
}
