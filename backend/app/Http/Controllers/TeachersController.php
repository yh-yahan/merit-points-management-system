<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Teachers;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Cookie;

class TeachersController extends Controller{
  public function SignUp(Request $request){
    $fields = $request->validate([
      'name' => 'required|string',
      'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email',
      'password' => 'required|string|min:6|confirmed',
      'description' => 'nullable|string',
      'invitation_code' => 'required|string'
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

    $cookie = new Cookie('auth_token', $token, now()->addDays(7)->timestamp, '/', null, true, true, false, 'None', true);

    $notification = [
      'title' => "New sign up",
      'message' => "Teacher " . $teacher->name . " has signed up " . "via invitation code of " . "'" . $teacher->invitation_code . "'",
      'is_read' => false,
    ];

    app('App\Http\Controllers\AdminController')->Notifications($notification);

    $response = [
      'teacher' => $teacher,
      // 'token' => $token, 
    ];

    return response($response, 201)->withCookie($cookie);
  }

  public function RecentTransactions(){
    $activities = Transaction::with(['creator', 'student', 'meritPointRule'])
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
      // Determine the title based on operation type
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
      // Collect rule name, description, and card signature
      $ruleName = $activity->meritPointRule ? $activity->meritPointRule->name : 'Others';
      $description = $activity->description ?: ($activity->meritPointRule ? $activity->meritPointRule->description : 'None');
      $cardSignature = "From " . ($activity->creator ? $activity->creator->name : 'Unknown') . " to " . ($activity->student ? $activity->student->name : 'Unknown');

      $ruleNames[] = $ruleName;
      $descriptions[] = $description;
      $cardSignatures[] = $cardSignature;

      // Collect IDs
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

    return response($recentActivityData, 200);
  }
}
