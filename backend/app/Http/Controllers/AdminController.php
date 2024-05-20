<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function SignUp(Request $request){
      $fields = $request->validate([
        'name' => 'required|string', 
        'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email', 
        'password' => 'required|confirmed|string|min:6', 
      ]);

      $admin = Admin::create([
        'name' => $fields['name'], 
        'email' => $fields['email'], 
        'password' => Hash::make($fields['password']), 
      ]);

      $token = $admin->createToken('adminToken')->plainTextToken;

      $response = [
        'admin' => $admin, 
        'token' => $token, 
      ];

      return response($response, 201);
    }
}
