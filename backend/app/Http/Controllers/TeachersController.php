<?php

namespace App\Http\Controllers;

use App\Models\InvitationCodes;
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
use Illuminate\Support\Facades\RateLimiter;

class TeachersController extends Controller
{
  public function SignUp(Request $request)
  {
    $fields = $request->validate([
      'name' => 'required|string',
      'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email',
      'password' => 'required|string|min:6|confirmed',
      'description' => 'nullable|string',
      'invitation_code' => 'required|string'
    ]);

    $maxAttempts = 5;
    $decayMinutes = 1;
    $key = 'teacher signup: ' . $request->ip();
    if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
      $seconds = RateLimiter::availableIn($key);
      return response([
        // 'message' => 'Too many attempts. Please try again in ' . $seconds . ' seconds.'
        'message' => 'Too many attempts. Please try again later.'
      ], 429)->header('Retry-After', $seconds);;
    }
    RateLimiter::hit($key, $decayMinutes * 60);

    $current_date = Carbon::now()->toDateString();

    $result = InvitationCodes::where('code', $fields['invitation_code'])
      ->whereDate('valid_until', '>=', $current_date)
      ->first();

    if ($result) {
      if ($result->for_user_type == 'teacher') {
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
          'message' => "Teacher " . $teacher->name . " has signed up " . "via invitation code of " . "'" . $fields['invitation_code'] . "'",
          'is_read' => false,
        ];
    
        app('App\Http\Controllers\AdminController')->Notifications($notification);
    
        $response = [
          'teacher' => $teacher,
          // 'token' => $token, 
        ];
    
        return response($response, 201)->withCookie($cookie);
      } else {
        return response(["message" => "Invalid invitation code"], 401);
      }
    } else {
      return response(["message" => "Invalid invitation code"], 401);
    }
  }

  public function RecentTransactions()
  {
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

  public function GetStudentByClass()
  {
    $students = Students::select('id', 'name', 'class')
      ->where('status', 'active')
      ->get();

    $groupedStudents = $students->groupBy('class');

    $groupedStudentsWithId = $groupedStudents->map(function ($students, $className) {
      $classId = strtolower(str_replace(' ', '-', $className));

      return [
        'classId' => $classId,
        'students' => $students
      ];
    });

    return $groupedStudentsWithId;
  }

  public function SearchStudent(Request $request)
  {
    $search = $request->input('search', '');
    $query = Students::select('id', 'name', 'username', 'class', 'stream');

    if ($search) {
      $query->where(function ($q) use ($search) {
        $q->where('name', 'LIKE', "%{$search}%")
          ->orWhere('username', 'LIKE', "%{$search}%")
          ->orWhere('class', 'LIKE', "%{$search}%")
          ->orWhere('stream', 'LIKE', "%{$search}%");
      });
    }

    $students = $query->get();

    return response()->json($students);
  }

  public function GetStudentDetails(Request $request)
  {
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

  public function UpdatePoint(Request $request, $receiver_id)
  {
    $fields = $request->validate([
      'operation' => 'required|string|in:add,deduct',
      'points' => 'required|numeric',
      'description' => 'nullable|string',
      'receiver_id' => 'numeric|required',
      'rule_id' => 'numeric|required'
    ]);

    $token = $request->cookie('auth_token');
    $accessToken = PersonalAccessToken::findToken($token);
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

    if ($pointsRecord) {
      if ($fields['operation'] == 'add') {
        $pointsRecord->total_points += $pointsToAdjust;
      } elseif ($fields['operation'] == 'deduct') {
        $pointsRecord->total_points -= $pointsToAdjust;
      }
      $pointsRecord->save();
    } else {
      return response()->json(['error' => 'Receiver not found'], 404);
    }

    $currentPoint = $pointsRecord->total_points;

    return response()->json([
      'currentPoint' => $currentPoint
    ]);
  }

  public function MeritPointRule(Request $request) {
    return $this->GetMeritPointRule($request);
  }

  public function MeritPointThreshold(Request $request) {
    return $this->GetPointThreshold();
  }

  public function GetSetting(Request $request)
  {
    $token = $request->cookie('auth_token');
    $accessToken = PersonalAccessToken::findToken($token);
    $tokenableId = $accessToken->tokenable_id;
    
    $settings = Teachers::where('id', $tokenableId)
    ->select(
      'id',
      'email',
      'name',
      // 'password',
      'description',
      'profile_pic'
    )->get();

    return response($settings, 200);
  }

  public function ChangeBasicInfo(Request $request)
  {
    $fields = $request->validate([
      'name' => 'required|string',
      'email' => 'required|email',
      'description' => 'nullable|string', 
      'profile_pic' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
    ]);

    $token = $request->cookie('auth_token');
    $accessToken = PersonalAccessToken::findToken($token);
    if (!$accessToken) {
      return response()->json(['error' => 'Unauthorized'], 401);
    }
    $tokenableId = $accessToken->tokenable_id;

    $teacher = Teachers::find($tokenableId);
    if (!$teacher) {
      return response()->json(['error' => 'Teacher not found'], 404);
    }

    if ($request->hasFile('profile_pic')) {
      $file = $request->file('profile_pic');
      $filename = time() . '_' . $file->getClientOriginalName();
      $path = $file->storeAs('profile_pics', $filename, 'public');

      $teacher->profile_pic = $path;
    }

    // update teacher's information
    $teacher->name = $fields['name'];
    $teacher->email = $fields['email'];
    $teacher->description = $fields['description'] ?? null;

    $teacher->save();

    return response()->json([
      // 'message' => 'Updated successfully', 
      'teacher' => [
        'id' => $teacher->id,
        'name' => $teacher->name,
        'email' => $teacher->email,
        'description' => $teacher->description, 
        'profilePic' => $teacher->profile_pic, 
      ]
    ], 200);
  }

  public function UpdatePassword(Request $request)
  {
    $fields = $request->validate([
      'old_password' => 'required|string',
      'new_password' => 'required|string|min:6|confirmed'
    ]);

    $token = $request->cookie('auth_token');
    $accessToken = PersonalAccessToken::findToken($token);
    $tokenableId = $accessToken->tokenable_id;

    $teacher = Teachers::find($tokenableId);
    if (!$teacher) {
      return response()->json(['error' => 'Teacher not found'], 404);
    }

    if (!Hash::check($fields['old_password'], $teacher->password)) {
      return response()->json(['error' => 'Old password is incorrect'], 401);
    }
    elseif (Hash::check($fields['new_password'], $teacher->password)) {
      return response(['message' => 'New password cannot be the same as the current password'], 400);
    }
    else {
      Teachers::where('id', $tokenableId)
      ->update(['password' => Hash::make($fields['new_password'])]);
      if($accessToken){
        $accessToken->delete();

        cookie()->queue(cookie()->forget('auth_token'));
      }
      return response(['message' => 'Password updated successfully. Please log in again.'], 200);
    }
  }
}
