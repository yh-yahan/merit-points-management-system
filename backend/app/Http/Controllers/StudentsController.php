<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Students;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Cookie;

class StudentsController extends Controller
{
  public function SignUp(Request $request)
  {
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

    $cookie = new Cookie('auth_token', $token, now()->addDays(7)->timestamp, '/', null, true, true, false, 'None', true);

    $notification = [
      'title' => "New sign up",
      'message' => "Student " . $students->name . " has signed up " . "via invitation code of " . "'" . $fields['invitation_code'] . "'",
      'is_read' => false,
    ];

    app('App\Http\Controllers\AdminController')->Notifications($notification);

    $response = [
      'students' => $students,
      // 'token' => $token, 
    ];

    return response($response, 201)->withCookie($cookie);
  }

  public function Dashboard(Request $request)
  {
    $token = $request->cookie('auth_token');
    $accessToken = PersonalAccessToken::findToken($token);
    $studentId = $accessToken->tokenable_id;

    $student = Students::find($studentId);

    $total_points = $student->points->total_points;

    $startOfMonth = Carbon::now()->startOfMonth();
    $endOfMonth = Carbon::now()->endOfMonth();

    $monthly_points_awarded = Transaction::whereBetween('date', [$startOfMonth, $endOfMonth])
      ->where('receiver_id', $studentId)
      ->where('operation_type', 'add')
      ->sum('points');

    $monthly_points_deducted = Transaction::whereBetween('date', [$startOfMonth, $endOfMonth])
      ->where('receiver_id', $studentId)
      ->where('operation_type', 'deduct')
      ->sum('points');

    $activities = Transaction::with(['creator', 'student', 'meritPointRule'])
      ->where('receiver_id', $studentId)
      ->orderBy('created_at', 'desc')
      ->limit(5)
      ->get()
      ->map(function ($activity) {
        $activity->formattedCreatedAt = $activity->created_at->format('H:i:s d/n/y l');
        return $activity;
      });

    $titles = [];
    $diffInWordsList = [];
    $ruleNames = [];
    $descriptions = [];
    $cardSignatures = [];
    $creatorIds = [];
    $studentIds = [];

    foreach ($activities as $activity) {
      if ($activity->operation_type == 'add') {
        $title = $activity->points . " points awarded";
      } else {
        $title = $activity->points . " points deducted";
      }
      $titles[] = $title;

      // Calculate the time difference in human-readable format
      $databaseDateTime = Carbon::parse($activity->created_at);
      $now = Carbon::now();
      $diffInWords = $databaseDateTime->diffForHumans($now);
      $diffInWordsList[] = $diffInWords;

      $ruleName = $activity->meritPointRule ? $activity->meritPointRule->name : 'Others';
      $description = $activity->description ?: ($activity->meritPointRule ? $activity->meritPointRule->description : 'None');
      $cardSignature = "From " . ($activity->creator ? $activity->creator->name : 'Unknown') . " to " . ($activity->student ? $activity->student->name : 'Unknown');

      $ruleNames[] = $ruleName;
      $descriptions[] = $description;
      $cardSignatures[] = $cardSignature;

      if ($activity->creator) {
        $creatorIds[] = $activity->creator->id;
      }
      if ($activity->student) {
        $studentIds[] = $activity->student->id;
      }
    }
    $recentActivityData = [
      'titles' => $titles,
      'diffInWordsList' => $diffInWordsList,
      'ruleNames' => $ruleNames,
      'descriptions' => $descriptions,
      "cardSignatures" => $cardSignatures,
      "creatorIds" => $creatorIds,
      "studentIds" => $studentIds,
      'formattedCreatedAt' => $activities->pluck('formattedCreatedAt'),
    ];

    return response()->json([
      "student" => $student, 
      "totalPoints" => $total_points,
      "monthlyPointsAwarded" => $monthly_points_awarded,
      "monthlyPointsDeducted" => $monthly_points_deducted,
      "recentActivities" => $recentActivityData, 
    ]);
  }
}
