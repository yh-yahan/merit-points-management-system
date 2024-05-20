<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\TeachersController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::prefix('v1')->group(function (){
  Route::post('login', [LoginController::class, 'login']);

  Route::post('admin/signup', [AdminController::class, 'signup']);

  Route::post('teacher/signup', [TeachersController::class, 'signup']);

  Route::post('student/signup', [StudentsController::class, 'signup']);
});
