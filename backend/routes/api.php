<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InvitationCodeController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\TeachersController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ColorSchemeController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\LogoController;
use App\Http\Middleware\EnsureIsAdmin;
use App\Http\Middleware\EnsureIsStudent;
use App\Http\Middleware\EnsureIsTeacher;
use App\Http\Middleware\EnsureTokenIsValid;

Route::prefix('v1')->group(function () {
  Route::post('check-auth', [LoginController::class, 'CheckAuth']);
  Route::post('login', [LoginController::class, 'Login']);
  Route::post('logout', [LoginController::class, 'Logout']);
  Route::get('leaderboard', [LeaderboardController::class, 'Leaderboard']);
  Route::post('validate-inv-code', [InvitationCodeController::class, 'ValidateInvitationCode']);
  Route::post('teacher/signup', [TeachersController::class, 'SignUp']);
  Route::post('student/signup', [StudentsController::class, 'SignUp']);
  Route::get('logo', [LogoController::class, 'GetLogo']);
  Route::get('primary-color', [ColorSchemeController::class, 'PrimaryColor']);

  Route::middleware([EnsureTokenIsValid::class])->group(function () {
    Route::middleware([EnsureIsAdmin::class])->prefix('admin')->group(function () {
      Route::post('signup', [AdminController::class, 'SignUp']);
      Route::post('new-admin', [AdminController::class, 'NewAdmin']);
      Route::post('create-inv-code', [AdminController::class, 'CreateInvitationCode']);
  
      Route::get('overview', [AdminController::class, 'Overview']);
      Route::get('transaction-history', [AdminController::class, 'TransactionHistory']);
      Route::get('manage-students', [AdminController::class, 'ManageStudents']);
      Route::delete('manage-students/{id}', [AdminController::class, 'DeleteStudent']);
      Route::put('manage-students/bulk-edit', [AdminController::class, 'ManageStudentsBulkEdit']);
      Route::get('manage-teachers', [AdminController::class, 'ManageTeachers']);
      Route::delete('manage-teachers/{id}', [AdminController::class, 'DeleteTeacher']);
      Route::get('manage-merit-points', [AdminController::class, 'ManageMeritPointRule']);
      Route::post('add-rule', [AdminController::class, 'AddMeritPointRule']);
      Route::patch('edit-rule', [AdminController::class, 'EditMeritPointRule']);
      Route::delete('merit-point/{id}', [AdminController::class, 'DeleteMeritPointRule']);
      Route::get('student-by-class', [AdminController::class, 'GetStudentByClass']);
      Route::post('student-details', [AdminController::class, 'GetStudentDetails']);
      Route::patch('point/{receiver_id}', [AdminController::class, 'UpdatePoint']);
      Route::get('academic-structure', [AdminController::class, 'AcademicStructure']);
      Route::post('class', [AdminController::class, 'AddStudentClass']);
      Route::post('stream', [AdminController::class, 'AddStudentStream']);
      Route::delete('class/{id}', [AdminController::class, 'ClassDeletion']);
      Route::delete('stream/{id}', [AdminController::class, 'StreamDeletion']);
  
      Route::get('notification', [AdminController::class, 'GetNotification']);
      Route::patch('mark-notification-as-read', [AdminController::class, 'MarkNotificationAsRead']);
  
      Route::get('setting', [AdminController::class, 'GetSetting']);
      Route::post('setting', [AdminController::class, 'Setting']);
      Route::get('exclude-student', [AdminController::class, 'ExcludedStudent']);
      Route::post('exclude-student', [AdminController::class, 'ExcludeStudent']);
      Route::delete('exclude-student/{id}', [AdminController::class, 'DeleteExcludedStudent']);
      Route::post('initial', [AdminController::class, 'SetInitial']);
      Route::get('initial', [AdminController::class, 'GetInitial']);
      Route::get('point-threshold', [AdminController::class, 'GetPointThreshold']);
      Route::patch('point-threshold', [AdminController::class, 'EditPointThreshold']);
      Route::post('point-threshold', [AdminController::class, 'AddPointThreshold']);
      Route::delete('point-threshold/{id}', [AdminController::class, 'DeletePointThreshold']);
      Route::patch('user-info', [AdminController::class, 'ChangeBasicInfo']);
      Route::patch('update-password', [AdminController::class, 'UpdatePassword']);
      Route::post('logo', [AdminController::class, 'UploadLogo']);
  
      Route::get('invitation-code', [AdminController::class, 'GetInvitationCode']);
      Route::delete('invitation-code/{id}', [AdminController::class, 'DeleteInvitationCode']);
  
      Route::post('import/rules', [ImportController::class, 'ImportRules']);
  
      Route::get('export/chart', [ExportController::class, 'AdminChartExport']);
      Route::get('export/rules/excel', [ExportController::class, 'exportRulesToExcel']);
      Route::get('export/rules/csv', [ExportController::class, 'exportRulesToCsv']);
  
      Route::post('search-student', [AdminController::class, 'SearchStudent']);
    });

    Route::middleware([EnsureIsTeacher::class])->prefix('teacher')->group(function () {
      Route::get('recent-transactions', [TeachersController::class, 'RecentTransactions']);
      Route::get('student-by-class', [TeachersController::class, 'GetStudentByClass']);
      Route::post('student-details', [TeachersController::class, 'GetStudentDetails']);
      Route::patch('point/{receiver_id}', [TeachersController::class, 'UpdatePoint']);
      Route::post('search-student', [TeachersController::class, 'SearchStudent']);
      Route::get('merit-point/rules', [TeachersController::class, 'MeritPointRule']);
      Route::get('merit-point/threshold', [TeachersController::class, 'MeritPointThreshold']);
      Route::get('setting', [TeachersController::class, 'GetSetting']);
      Route::post('setting', [TeachersController::class, 'ChangeBasicInfo']);
      Route::patch('update-password', [TeachersController::class, 'UpdatePassword']);
    });
  
    Route::middleware([EnsureIsStudent::class])->prefix('student')->group(function () {
      Route::get('dashboard', [StudentsController::class, 'Dashboard']);
      Route::get('leaderboard', [StudentsController::class, 'Leaderboard']);
      Route::get('merit-point/rules', [StudentsController::class, 'MeritPointRule']);
      Route::get('merit-point/threshold', [StudentsController::class, 'MeritPointThreshold']);
      Route::get('settings', [StudentsController::class, 'GetSettings']);
      Route::post('settings', [StudentsController::class, 'Setting']);
      Route::patch('user-info', [StudentsController::class, 'ChangeBasicInfo']);
      Route::patch('update-password', [StudentsController::class, 'UpdatePassword']);
      Route::get('academic-structure', [StudentsController::class, 'AcademicStructure']);
    });
  });
});
