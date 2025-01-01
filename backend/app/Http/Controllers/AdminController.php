<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Admin;
use App\Models\AdminSetting;
use App\Models\Points;
use App\Models\Students;
use App\Models\Teachers;
use App\Models\Transaction;
use App\Models\PointsThreshold;
use Illuminate\Http\Request;
use App\Models\InvitationCodes;
use App\Models\MeritPointsRules;
use Database\Seeders\AdminSeeder;
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
      $monthlyPoints = [];
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
      ->groupBy('month');
      $barChartData = [];
      foreach($topAwarded as $month => $items){
        foreach($items as $item){
          // Initialize the month entry for this name if not set
          if(!isset($barChartData[$item->name])){
            $barChartData[$item->name] = array_fill(0, 12, 0);
          }
          // Assign the total points to the appropriate month
          $barChartData[$item->name][$month - 1] = $item->total_points;
        }
      }
      $barChartDataAwarded = [];
      foreach($barChartData as $name => $data) {
        $formattedKey = $name;
        $barChartDataAwarded[$formattedKey] = $data;
      }
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
      ->groupBy('month');

      $barChartData2 = [];
      foreach($topDeducted as $month => $items){
        foreach($items as $item){
          // Initialize the month entry for this name if not set
          if(!isset($barChartData2[$item->name])) {
            $barChartData2[$item->name] = array_fill(0, 12, 0);
          }
          // Assign the total points to the appropriate month
          $barChartData2[$item->name][$month - 1] = $item->total_points;
        }
      }
      $barChartDataDeducted = [];
      foreach($barChartData as $name => $data) {
        $formattedKey = $name;
        $barChartDataDeducted[$formattedKey] = $data;
      }

      // recent activities
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
        'formattedCreatedAt' => $activities->pluck('formattedCreatedAt'),
      ];

      return response([
        $overview, 
        $lineChartStat, 
        'barChartDataAwarded' => $barChartDataAwarded, 
        'barChartDataDeducted' => $barChartDataDeducted, 
        'recentActivityData' => $recentActivityData,
      ], 200);
    }

    public function TransactionHistory(Request $request){
      $sortDirection = $request->input('sort', 'desc'); // sorting by date
      $search = $request->input('search', '');

      $query = Transaction::with(['student', 'meritPointRule']) 
      ->select(
        'id', 
        'date', 
        'points', 
        'operation_type', 
        'description', 
        'receiver_id', 
        'rule_id', 
        'created_at', 
        'updated_at'
      );

      if($search){
        $query->where(function($q) use ($search) {
          $q->where('description', 'like', '%' . $search . '%')
            ->orWhereHas('student', function($q) use ($search) {
              $q->where('name', 'like', '%' . $search . '%');
          });
        });
      }

      $transactions = $query->orderBy('date', $sortDirection)->paginate(15);

      $transformedTransactions = $transactions->getCollection()->transform(function ($transaction) use (&$totalPoints) {
        return [
          'id' => $transaction->id,
          'date' => $transaction->date,
          'points' => $transaction->points,
          'operation_type' => $transaction->operation_type, 
          'description' => $transaction->description,
          'from' => optional($transaction->creator)->name,
          'to' => optional($transaction->student)->name,
        ];
      });
      return response()->json([
        'current_page' => $transactions->currentPage(),
        'data' => $transformedTransactions,
        'first_page_url' => url('api/v1/transaction-history?page=1'),
        'last_page' => $transactions->lastPage(),
        'last_page_url' => url('api/v1/transaction-history?page=' . $transactions->lastPage()),
        'next_page_url' => $transactions->hasMorePages() ? url('api/v1/transaction-history?page=' . ($transactions->currentPage() + 1)) : null,
        'prev_page_url' => $transactions->previousPageUrl(),
        'from' => $transactions->firstItem(),
        'to' => $transactions->lastItem(),
        'total' => $transactions->total(),
      ]);
    }

    public function ManageStudents(Request $request){
      $sort = $request->input('sort', 'date_joined_desc');
      $search = $request->input('search', '');
      $filter = $request->input('filter', 'none');

      $query = Students::with(['points']) 
      ->select(
        'students.id', 
        'name', 
        'class', 
        'stream', 
        'status', 
        'date_joined', 
        'email'
      );

      if($search){
        $query->where(function($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%")
              ->orWhere('class', 'LIKE', "%{$search}%")
              ->orWhere('stream', 'LIKE', "%{$search}%");
        });
      }

      if($filter && $filter !== 'none'){
        $query->where('status', $filter);
      }

      switch($sort){
        case 'nameAsc':
          $query->orderBy('name', 'asc');
          break;
        case 'nameDesc':
          $query->orderBy('name', 'desc');
          break;
        case 'pointsAsc':
          $query->leftJoin('points', 'students.id', '=', 'points.id')
                ->orderBy('points.total_points', 'asc');
          break;
        case 'pointsDesc':
          $query->leftJoin('points', 'students.id', '=', 'points.id')
                ->orderBy('points.total_points', 'desc');
          break;
        case 'dateAsc':
          $query->orderBy('date_joined', 'asc');
          break;
        case 'dateDesc':
        default:
          $query->orderBy('date_joined', 'desc');
          break;
      }

      $totalStudents = Students::count();
      $students = $query->paginate(15);
      $transformedStudents = $students->getCollection()->transform(function($student){
        return [
          'id' => $student->id,
          'name' => $student->name,
          'class' => $student->class,
          'stream' => $student->stream, 
          'status' => $student->status,
          'date_joined' => $student->date_joined,
          'points' => $student->points ? $student->points->total_points : 0, 
          'email' => $student->email
        ];
      });
      return response()->json([
        'totalStudents' => $totalStudents, 
        'current_page' => $students->currentPage(),
        'data' => $transformedStudents,
        'first_page_url' => url('api/v1/manage-students?page=1'),
        'last_page' => $students->lastPage(),
        'last_page_url' => url('api/v1/manage-students?page=' . $students->lastPage()),
        'next_page_url' => $students->hasMorePages() ? url('api/v1/manage-students?page=' . ($students->currentPage() + 1)) : null,
        'prev_page_url' => $students->previousPageUrl(),
        'from' => $students->firstItem(),
        'to' => $students->lastItem(),
        'total' => $students->total(),
      ]);
    }

    public function ManageTeachers(Request $request){
      $search = $request->input('search', '');
      $query = Teachers::select(
        'id', 
        'name', 
        'email', 
        'description', 
        'profile_pic', 
        'created_at'
      );

      $totalTeachers = Teachers::count();

      if($search){
        $query->where(function($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%");
        });
      }

      $teachers = $query->paginate(15);

      return response()->json([
        'totalTeachers' => $totalTeachers, 
        'current_page' => $teachers->currentPage(),
        'data' => $teachers,
        'first_page_url' => url('api/v1/manage-teachers?page=1'),
        'last_page' => $teachers->lastPage(),
        'last_page_url' => url('api/v1/manage-teachers?page=' . $teachers->lastPage()),
        'next_page_url' => $teachers->hasMorePages() ? url('api/v1/manage-teachers?page=' . ($teachers->currentPage() + 1)) : null,
        'prev_page_url' => $teachers->previousPageUrl(),
        'from' => $teachers->firstItem(),
        'to' => $teachers->lastItem(),
        'total' => $teachers->total(),
      ]);
    }

    public function ManageMeritPoints(Request $request){
      $search = $request->input('search', '');

      $query = MeritPointsRules::select(
        'id', 
        'name', 
        'description', 
        'points', 
        'operation_type',
      );

      if($search){
        $query->where(function($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%");
        });
      }

      $rules = $query->get();
      $totalRules = MeritPointsRules::count();

      return response()->json([
        "totalRules" => $totalRules, 
        "rules" => $rules
      ]);
    }

    public function SetInitial(Request $request){
      $validated = $request->validate([
        'initial' => 'required'
      ]);

      $initial = $validated['initial'];

      $currentSetting = AdminSetting::where('setting_name', 'initial_point')->first();
      if($currentSetting && $currentSetting->setting_value !== $initial){
        $currentSetting->setting_value = $initial;
        $currentSetting->save();
      }
    }

    public function GetInitial(){
      $initial = AdminSetting::where('setting_name', 'initial_point')->first();
      if (!$initial) {
        return response()->json(['message' => 'Initial point setting not found'], 404);
      }
      return $initial->setting_value;
    }

    public function GetPointThreshold(){
      $data = PointsThreshold::select('points', 'actions')
      ->orderBy('points', 'desc')
      ->get();

      return response()->json($data);
    }

    public function GetStudentByClass(Request $request){
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
