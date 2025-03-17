<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Points;
use App\Models\Students;
use App\Models\Teachers;
use App\Models\Transaction;
use App\Models\MeritPointsRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Cookie;
use Laravel\Sanctum\PersonalAccessToken;

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

  public function GetStudentByClass(){
    $students = Students::select('id', 'name', 'class')
      ->where('status', 'active')
      ->get();
    
      $groupedStudents = $students->groupBy('class');

      $groupedStudentsWithId = $groupedStudents->map(function ($students, $className){
        $classId = strtolower(str_replace(' ', '-', $className));
        
        return [
          'classId' => $classId,
          'students' => $students
        ];
      });
      
      return $groupedStudentsWithId;
  }

  public function SearchStudent(Request $request){
    $search = $request->input('search', '');
    $query = Students::select('id', 'name', 'username', 'class', 'stream');

    if($search){
      $query->where(function($q) use ($search){
        $q->where('name', 'LIKE', "%{$search}%")
          ->orWhere('username', 'LIKE', "%{$search}%")
          ->orWhere('class', 'LIKE', "%{$search}%")
          ->orWhere('stream', 'LIKE', "%{$search}%");
      });
    }

    $students = $query->get();

    return response()->json($students);
  }

  public function GetStudentDetails(Request $request){
    $student_id = $request->validate([
      'id' => 'required|numeric'
    ]);
    $student_id = (int) $student_id['id'];

    $student = Students::select('id', 'name', 'username', 'class', 'stream', 'status')
    // ->where('status', 'active')
    ->where('id', $student_id)
    ->first();

    $transactions = Transaction::with('creator', 'student', 'meritPointRule')
    ->orderBy('created_at', 'desc')
    ->limit(3)
    ->where('receiver_id', $student_id)
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
    foreach ($transactions as $transaction) {
      $databaseDateTime = Carbon::parse($transaction->created_at);
      $now = Carbon::now();
      $diffInWords = $databaseDateTime->diffForHumans($now);
      $diffInWordsList[] = $diffInWords;
  
      $titles[] = $transaction->operation_type == 'add' ? $transaction->points . " point(s) awarded" : $transaction->points . " point(s) deducted";
      $descriptions[] = $transaction->meritPointRule->description ?? "N/A";
  
      $ruleNames[] = $transaction->meritPointRule->name ?? "N/A";
      $cardSignature = "From " . ($transaction->creator ? $transaction->creator->name : 'Unknown') . " to " . ($transaction->student ? $transaction->student->name : 'Unknown');
      $cardSignatures[] = $cardSignature;
    }
    $recentActivity = [
      'titles' => $titles,
      'diffInWordsList' => $diffInWordsList,
      'ruleNames' => $ruleNames,
      'descriptions' => $descriptions,
      'cardSignatures' => $cardSignatures,
      'formattedCreatedAt' => $transactions->pluck('formattedCreatedAt')
    ];

    $totalPoints = Points::where('receiver', $student_id)->sum('total_points');

    $meritPointRules = MeritPointsRules::all();

    return response()->json([
      "student" => $student,
      "totalPoints" => $totalPoints,
      "recentActivity" => $recentActivity,
      "meritPointRules" => $meritPointRules
    ]);
  }

  public function UpdatePoint(Request $request, $receiver_id){
    $fields = $request->validate([
      'operation' => 'required|string|in:add,deduct', 
      'points' => 'required|numeric', 
      'description' => 'nullable|string', 
      'receiver_id' => 'numeric|required', 
      'rule_id' => 'numeric|required'
    ]);

    $token = $request->cookie('auth_token');
    $accessToken = PersonalAccessToken::findToken($token);
    if(!$accessToken){
      return response()->json(['error' => 'Unauthorized'], 401);
    }
    // insert a new record, transactions table
    $created_by = $accessToken->tokenable_id;
    $created_by_type = get_class($accessToken->tokenable);
    $transaction = [
      'created_by_id' => $created_by, 
      'created_by_type' => $created_by_type, 
      'receiver_id' => $receiver_id,
      'rule_id' => $fields['rule_id'],
      'description' => $fields['description'] ?? 'No description provided', 
      'points' => $fields['points'], 
      'operation_type' => $fields['operation'], 
      'date' => now()->format('Y-m-d'), 
    ];
    Transaction::create($transaction);
    // update points table
    $pointsToAdjust = $fields['points'];
    $pointsRecord = Points::where('receiver', $receiver_id)->first();

    if($pointsRecord){
      if($fields['operation'] == 'add'){
        $pointsRecord->total_points += $pointsToAdjust;
      }
      elseif($fields['operation'] == 'deduct'){
        $pointsRecord->total_points -= $pointsToAdjust;
      }
      $pointsRecord->save();
    }
    else{
      return response()->json(['error' => 'Receiver not found'], 404);
    }

    $currentPoint = $pointsRecord->total_points;

    return response()->json([
      'currentPoint' => $currentPoint
    ]);
  }
}
