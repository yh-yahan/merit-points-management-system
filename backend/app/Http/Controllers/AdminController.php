<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Admin;
use App\Models\Points;
use App\Models\Students;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\InvitationCodes;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\RateLimiter;

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

      // $token = $admin->createToken('adminToken')->plainTextToken;
      
      $token = $admin->createToken(
        'adminToken', 
        ['*'], 
        now()->addDays(7)
      )->plainTextToken;

      $response = [
        'admin' => $admin, 
        // 'token' => $token, 
      ];

      return response($response, 201);
    }

    public function CreateInvitationCode(Request $request){
      $fields = $request->validate([
        'for_user_type' => "required|string", 
        'valid_until' => "required|date|after:today", 
      ]);

      // check who created the invitation code
      // get token from request
      $token = $request->bearerToken();
      if(!$token){
        return response()->json(['error' => 'Token not provided'], 401);
      }
      // find token from PersonalAccessToken
      $accessToken = PersonalAccessToken::findToken($token);
      if(!$accessToken){
        return response()->json(['error' => 'Invalid token'], 401);
      }
      // Check if the accessToken matches 'adminToken'
      if($accessToken->name !== 'adminToken'){
        return response()->json(['error' => 'Invalid token'], 401);
      }

      if($accessToken){
        $created_by = $accessToken->tokenable_id;
      }
      else{
        return response()->json(['error' => 'Invalid token'], 401); 
      }

      // generate code
      $prefix = "INV-";
      $length = 4;

      function generateUniquePart($characters, $length){
        $randomString = '';
        for($i = 0; $i < $length; $i++){
          $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
      }

      $characters = 'BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz46789';
      $uniquePart = generateUniquePart($characters, $length) . '-' . generateUniquePart($characters, $length);
      $code = $prefix . $uniquePart;

      while(InvitationCodes::where('code', $code)->exists()){
        $uniquePart = generateUniquePart($characters, $length) . '-' . generateUniquePart($characters, $length);
        $code = $prefix . $uniquePart;
      }

      // store in database
      $invitationCode = InvitationCodes::create([
        'code' => $code, 
        'for_user_type' => $fields['for_user_type'], 
        'created_by' => $created_by, 
        'valid_until' => $fields['valid_until']
      ]);

      $admin = InvitationCodes::with('admin')->find($created_by);

      $response = [
        'invitationCode' => $invitationCode, 
        'code' => $code, 
        'created_by' => $created_by, 
        // 'admin' => $admin, 
      ];

      return response($response, 201);
    }

    public function ValidateInvitationCode(Request $request){
      $fields = $request->validate([
        'invitationCode' => "required|string"
      ]);

      // add rate limits
      $maxAttempts = 5;
      $decayMinutes = 1;
      $key = 'validate-invitation-code:' . $request->ip();
      if(RateLimiter::tooManyAttempts($key, $maxAttempts)){
        $seconds = RateLimiter::availableIn($key);
        return response([
          // 'message' => 'Too many attempts. Please try again in ' . $seconds . ' seconds.'
          'message' => 'Too many attempts. Please try again later.'
        ], 429);
      }
      RateLimiter::hit($key, $decayMinutes * 60);

      $result = InvitationCodes::where('code', $fields['invitationCode'])->first();

      if(!$result){
        return response([
          'message' => 'Invalid invitation code'
      ], 401);
      }
      
      return response([
        'result' => $result
      ], 200);
    }

    public function Overview(){
      $currentYear = date('Y');
      $currentMonth = date('m');
      $startDate = "$currentYear-$currentMonth-01";
      $endDate = date('Y-m-t', strtotime($startDate)); // last date of month
      $totalAddedPoints = Transaction::whereBetween('date', [$startDate, $endDate])
      ->where('operation_type', 'add')
      ->sum('points');
      $totalDeductedPoints = Transaction::whereBetween('date', [$startDate, $endDate])
      ->where('operation_type', 'deduct')
      ->sum('points');
      $totalStudentsPoint = Points::sum('total_points');
      $studentCount = Points::count();
      $avgPointPerStudent = $studentCount > 0 ? round($totalStudentsPoint/$studentCount) : 0;
      $totalStudents = Students::count();

      // data for statistics
      // line chart(total points awarded & deducted every month)
      $currentYear = Carbon::now()->year;
      // get summary for every month
      $monthlySummary = Transaction::selectRaw('
        YEAR(date) as year,
        MONTH(date) as month,
        SUM(CASE WHEN operation_type = "add" THEN points ELSE 0 END) as total_awarded,
        SUM(CASE WHEN operation_type = "deduct" THEN points ELSE 0 END) as total_deducted
      ')
      ->whereYear('date', $currentYear)
      ->groupBy(DB::raw('YEAR(date)'), DB::raw('MONTH(date)'))
      ->orderBy('month')
      ->get()
      ->each(function($item) use (&$monthlyPoints){
        $monthlyPoints[$item->month] = [
          'total_awarded' => $item->total_awarded,
          'total_deducted' => $item->total_deducted,
        ];
      });
      // Convert the data into separate arrays for total_awarded and total_deducted
      $totalAwarded = array_column($monthlyPoints, 'total_awarded');
      $totalDeducted = array_column($monthlyPoints, 'total_deducted');

      // bar chart(top 5 most awarded point rules every mouth)
      $topAwarded = Transaction::select(
        DB::raw('MONTH(date) as month'),
        'transaction.rule_id',
        DB::raw('SUM(transaction.points) as total_points'),
        'merit_points_rules.name'
      )
      ->join('merit_points_rules', 'transaction.rule_id', '=', 'merit_points_rules.id')
      ->where('transaction.operation_type', 'add')
      ->whereYear('transaction.date', $currentYear)
      ->groupBy(DB::raw('MONTH(date)'), 'rule_id', 'merit_points_rules.name')
      ->orderBy(DB::raw('MONTH(date)'))
      ->get()
      ->groupBy('month')
      ->map(function($items){
        return $items->sortByDesc('total_points')->take(5);
      });
      // bar chart(top 5 most deducted point rules every mouth)
      $topDeducted = Transaction::select(
        DB::raw('MONTH(date) as month'),
        'transaction.rule_id',
        DB::raw('SUM(transaction.points) as total_points'),
        'merit_points_rules.name'
      )
      ->join('merit_points_rules', 'transaction.rule_id', '=', 'merit_points_rules.id')
      ->where('transaction.operation_type', 'deduct')
      ->whereYear('transaction.date', $currentYear)
      ->groupBy(DB::raw('MONTH(date)'), 'rule_id', 'merit_points_rules.name')
      ->orderBy(DB::raw('MONTH(date)'))
      ->get()
      ->groupBy('month')
      ->map(function($items){
        return $items->sortByDesc('total_points')->take(5);
      });

      // recent activities
      $activities = Transaction::with(['creator', 'student', 'meritPointRule'])
      ->orderBy('created_at', 'desc')
      ->limit(5)
      ->get();

      $titles = [];
      $diffInWordsList = [];
      $ruleNames = [];
      $descriptions = [];
      $cardSignatures = [];
      $creatorIds = [];
      $studentIds = [];

      foreach($activities as $activity){
        // Determine the title based on operation type
        if($activity->operation_type == 'add'){
          $title = $activity->points . " points awarded";
        }
        else{
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
        if($activity->creator){
          $creatorIds[] = $activity->creator->id;
        }
        if($activity->student){
          $studentIds[] = $activity->student->id;
        }
      }
      
      $overview = [
        'totalAddedPoints' => $totalAddedPoints, 
        'totalDeductedPoints' => $totalDeductedPoints, 
        'avgPointPerStudent' => $avgPointPerStudent, 
        'totalStudents' => $totalStudents, 
      ];
      $lineChartStat = [
        'totalAwarded' => $totalAwarded, 
        'totalDeducted' => $totalDeducted, 
      ];
      $recentActivityData = [
        'titles' => $titles, 
        'diffInWordsList' => $diffInWordsList, 
        'ruleNames' => $ruleNames, 
        'descriptions' => $descriptions, 
        "cardSignatures" => $cardSignatures, 
        "creatorIds" => $creatorIds, 
        "studentIds" => $studentIds, 
      ];

      return response([
        $overview, $lineChartStat, $topAwarded, $topDeducted, $recentActivityData
      ], 200);
    }
}
