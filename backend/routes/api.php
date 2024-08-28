<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InvitationCodeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\TeachersController;

Route::prefix('v1')->group(function (){
  Route::post('check_auth', [LoginController::class, 'check_auth']);

  Route::post('login', [LoginController::class, 'Login']);
  Route::post('logout', [LoginController::class, 'Logout']);

  Route::prefix('admin')->group(function(){
    Route::post('signup', [AdminController::class, 'SignUp']);
    Route::post('create_inv_code', [AdminController::class, 'CreateInvitationCode']);
    Route::post('validate_inv_code', [AdminController::class, 'ValidateInvitationCode']);
    // admin dashboard routes
    Route::get('overview', [AdminController::class, 'Overview']);
  });
  Route::post('teacher/signup', [TeachersController::class, 'SignUp']);
  Route::post('student/signup', [StudentsController::class, 'SignUp']);
});
