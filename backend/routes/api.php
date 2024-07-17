<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InvitationCodeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\TeachersController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::prefix('v1')->group(function (){
  Route::post('check_auth', [LoginController::class, 'check_auth']);

  Route::post('login', [LoginController::class, 'login']);
  Route::post('logout', [LoginController::class, 'logout']);

  Route::post('create_inv_code', [InvitationCodeController::class, 'CreateInvitationCode']);
  Route::post('validate_inv_code', [InvitationCodeController::class, 'ValidateInvitationCode']);

  Route::post('admin/signup', [AdminController::class, 'signup']);
  Route::post('teacher/signup', [TeachersController::class, 'signup']);
  Route::post('student/signup', [StudentsController::class, 'signup']);
});
