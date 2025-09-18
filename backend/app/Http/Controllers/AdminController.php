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
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Models\InvitationCodes;
use App\Models\MeritPointsRules;
use App\Models\StudentClass;
use App\Models\StudentExclusion;
use App\Models\StudentStream;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function SignUp(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email',
            'password' => 'required|confirmed|string|min:6',
        ]);

        // setup and assign default settings for the admin
        AdminSetting::create([
            ['setting_name' => 'initial_point', 'setting_value' => 60],
            ['setting_name' => 'disable_leaderboard', 'setting_value' => false],
            ['setting_name' => 'allow_students_to_opt_out_leaderboard', 'setting_value' => false],
            ['setting_name' => 'leaderboard_visibility', 'setting_value' => 'username'],
            ['setting_name' => 'primary_color', 'setting_value' => '#0275d8'],
            ['setting_name' => 'logo', 'setting_value' => ''],
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
        ];

        return response($response, 201);
    }

    public function CreateInvitationCode(Request $request)
    {
        $fields = $request->validate([
            'for_user_type' => "required|string|in:student,teacher",
            'validity_period' => "required",
        ]);

        if ($fields['validity_period'] == "oneDay") {
            $validUntil = Carbon::now()->addDay();
        } else if ($fields['validity_period'] == "twoDays") {
            $validUntil = Carbon::now()->addDays(2);
        } else if ($fields['validity_period'] == "oneWeek") {
            $validUntil = Carbon::now()->addWeek();
        }

        // check who created the invitation code
        $token = $request->cookie('auth_token');
        // find token from PersonalAccessToken
        $accessToken = PersonalAccessToken::findToken($token);

        if ($accessToken) {
            $createdBy = $accessToken->tokenable_id;
        } else {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        // generate code
        $prefix = "INV-";
        $length = 4;

        function generateUniquePart($characters, $length)
        {
            $randomString = '';
            $maxIndex = strlen($characters) - 1;
            for ($i = 0; $i < $length; $i++) {
                $randomString .= $characters[random_int(0, $maxIndex)];
            }

            return $randomString;
        }

        $characters = 'BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz46789';
        $uniquePart = generateUniquePart($characters, $length) . '-' . generateUniquePart($characters, $length);
        $code = $prefix . $uniquePart;

        while (InvitationCodes::where('code', $code)->exists()) {
            $uniquePart = generateUniquePart($characters, $length) . '-' . generateUniquePart($characters, $length);
            $code = $prefix . $uniquePart;
        }

        // store in database
        $invitationCode = InvitationCodes::create([
            'code' => $code,
            'for_user_type' => $fields['for_user_type'],
            'created_by' => $createdBy,
            'valid_until' => $validUntil
        ]);

        $admin = InvitationCodes::with('admin')->find($createdBy);

        $response = [
            'invitationCode' => $invitationCode,
            'code' => $code,
            'created_by' => $createdBy,
            // 'admin' => $admin, 
        ];

        return response($response, 201);
    }

    public function Overview()
    {
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
        $avgPointPerStudent = $studentCount > 0 ? round($totalStudentsPoint / $studentCount) : 0;
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
            ->each(function ($item) use (&$monthlyPoints) {
                $monthlyPoints[$item->month] = [
                    'total_awarded' => $item->total_awarded,
                    'total_deducted' => $item->total_deducted,
                ];
            });
        // Convert the data into separate arrays for total_awarded and total_deducted
        $totalAwarded = array_column($monthlyPoints, 'total_awarded');
        $totalDeducted = array_column($monthlyPoints, 'total_deducted');

        // bar chart(top 5 most awarded point rules every mouth)
        $topAwardedRaw = Transaction::select(
            DB::raw('MONTH(date) as month'),
            'transaction.rule_id',
            DB::raw('SUM(transaction.points) as total_points'),
            'merit_points_rules.name'
        )
            ->join('merit_points_rules', 'transaction.rule_id', '=', 'merit_points_rules.id')
            ->where('transaction.operation_type', 'add')
            ->where('merit_points_rules.operation_type', 'add')
            ->whereYear('transaction.date', $currentYear)
            ->groupBy(DB::raw('MONTH(date)'), 'rule_id', 'merit_points_rules.name')
            ->orderBy(DB::raw('MONTH(date)'))
            ->get()
            ->groupBy('month');
        $barChartData = [];
        $topAwarded = $topAwardedRaw->map(function ($items) {
            return $items->sortByDesc('total_points')->take(5);
        });
        foreach ($topAwarded as $month => $items) {
            foreach ($items as $item) {
                // Initialize the month entry for this name if not set
                if (!isset($barChartData[$item->name])) {
                    $barChartData[$item->name] = array_fill(0, 12, 0);
                }
                // Assign the total points to the appropriate month
                $barChartData[$item->name][$month - 1] = $item->total_points;
            }
        }
        $barChartDataAwarded = [];
        foreach ($barChartData as $name => $data) {
            $formattedKey = $name;
            $barChartDataAwarded[$formattedKey] = $data;
        }
        // bar chart(top 5 most deducted point rules every mouth)
        $topDeductedRaw = Transaction::select(
            DB::raw('MONTH(date) as month'),
            'transaction.rule_id',
            DB::raw('SUM(transaction.points) as total_points'),
            'merit_points_rules.name'
        )
            ->join('merit_points_rules', 'transaction.rule_id', '=', 'merit_points_rules.id')
            ->where('transaction.operation_type', 'deduct')
            ->where('merit_points_rules.operation_type', 'deduct')
            ->whereYear('transaction.date', $currentYear)
            ->groupBy(DB::raw('MONTH(date)'), 'rule_id', 'merit_points_rules.name')
            ->orderBy(DB::raw('MONTH(date)'))
            ->get()
            ->groupBy('month');

        $barChartData2 = [];
        $topDeducted = $topDeductedRaw->map(function ($items) {
            return $items->sortByDesc('total_points')->take(5);
        });
        foreach ($topDeducted as $month => $items) {
            foreach ($items as $item) {
                // Initialize the month entry for this name if not set
                if (!isset($barChartData2[$item->name])) {
                    $barChartData2[$item->name] = array_fill(0, 12, 0);
                }
                // Assign the total points to the appropriate month
                $barChartData2[$item->name][$month - 1] = $item->total_points;
            }
        }
        $barChartDataDeducted = [];
        foreach ($barChartData2 as $name => $data) {
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

    public function TransactionHistory(Request $request)
    {
        $sortDirection = $request->input('sort', 'desc'); // sorting by date
        $search = $request->input('search', '');

        $query = Transaction::with(['student', 'meritPointRule', 'creator'])
            ->select(
                'id',
                'created_by_type',
                'created_by_id',
                'date',
                'points',
                'operation_type',
                'description',
                'receiver_id',
                'rule_id',
                'created_at',
                'updated_at'
            );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                    ->orWhereHas('student', function ($q) use ($search) {
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

    public function ManageStudents(Request $request)
    {
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

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('class', 'LIKE', "%{$search}%")
                    ->orWhere('stream', 'LIKE', "%{$search}%");
            });
        }

        if ($filter && $filter !== 'none') {
            $query->where('status', $filter);
        }

        switch ($sort) {
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
        $transformedStudents = $students->getCollection()->transform(function ($student) {
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

    public function ManageStudentsBulkEdit(Request $request)
    {
        $fields = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'integer',
            'class' => 'nullable|string',
            'stream' => 'nullable|string',
            'status' => 'nullable|string|in:Active,Inactive,Graduated',
        ]);

        $updates = [];
        if ($fields['class']) $updates['class'] = $fields['class'];
        if ($fields['stream']) $updates['stream'] = $fields['stream'];
        if ($fields['status']) $updates['status'] = $fields['status'];

        if (count($updates)) {
            Students::whereIn('id', $fields['student_ids'])->update($updates);
        }

        return response([
            'message' => 'Students updated successfully.'
        ], 200);
    }

    public function DeleteStudent($id)
    {
        $student = Students::find($id);
        if (!$student) {
            return response(['message' => 'Student not found'], 404);
        }
        $student->delete();

        return response(['message' => 'Deleted successfully'], 200);
    }

    public function ManageTeachers(Request $request)
    {
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

        if ($search) {
            $query->where(function ($q) use ($search) {
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

    public function DeleteTeacher($id)
    {
        $teacher = Teachers::find($id);
        if (!$teacher) {
            return response(['message' => 'Teacher not found'], 404);
        }
        $teacher->delete();

        return response(['message' => 'Deleted successfully'], 200);
    }

    public function ManageMeritPointRule(Request $request)
    {
        $search = $request->input('search', '');

        $query = MeritPointsRules::select(
            'id',
            'name',
            'description',
            'points',
            'operation_type',
        );

        if ($search) {
            $query->where(function ($q) use ($search) {
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

    public function EditMeritPointRule(Request $request)
    {
        $fields = $request->validate([
            'id' => 'required',
            'name' => 'sometimes|string',
            'description' => 'sometimes|string',
            'points' => 'sometimes|numeric',
        ]);

        $updateData = [];

        if (isset($fields['name'])) {
            $updateData['name'] = $fields['name'];
        }

        if (isset($fields['description'])) {
            $updateData['description'] = $fields['description'];
        }

        if (isset($fields['points'])) {
            $points = abs($fields['points']);
            $operationType = $fields['points'] < 0 ? 'deduct' : 'add';

            $updateData['points'] = $points;
            $updateData['operation_type'] = $operationType;
        }

        MeritPointsRules::where('id', $fields['id'])->update($updateData);

        $rule = MeritPointsRules::find($fields['id']);

        return response()->json([
            'rule' => $rule
        ]);
    }

    public function AddMeritPointRule(Request $request)
    {
        $fields = $request->validate([
            'ruleName' => 'required|string',
            'description' => 'required|string',
            'points' => 'required|numeric',
            'addDuplicate' => 'required|boolean'
        ]);

        if (!$fields['addDuplicate']) {
            $existingRule = MeritPointsRules::whereRaw('LOWER(name) = ?', [strtolower($fields['ruleName'])])->first();
            if ($existingRule) {
                return response()->json([
                    'message' => 'A rule with the name "' . $fields['ruleName'] . '" already exists.',
                ], 409);
            }
        }

        $points = abs($fields['points']);
        $operationType = $fields['points'] < 0 ? 'deduct' : 'add';

        MeritPointsRules::create([
            'name' => $fields['ruleName'],
            'description' => $fields['description'],
            'points' => $points,
            'operation_type' => $operationType,
        ]);

        $rules = MeritPointsRules::all();

        $totalRules = MeritPointsRules::count();

        return response()->json([
            "totalRules" => $totalRules,
            "rules" => $rules
        ]);
    }

    public function DeleteMeritPointRule($id)
    {
        MeritPointsRules::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Rule deleted successfully.',
        ]);
    }

    public function SetInitial(Request $request)
    {
        $validated = $request->validate([
            'initial' => 'required'
        ]);

        $initial = $validated['initial'];

        $currentSetting = AdminSetting::where('setting_name', 'initial_point')->first();
        if ($currentSetting && $currentSetting->setting_value !== $initial) {
            $currentSetting->setting_value = $initial;
            $currentSetting->save();
        }
    }

    public function GetInitial()
    {
        $initial = AdminSetting::where('setting_name', 'initial_point')->first();
        if (!$initial) {
            return response()->json(['message' => 'Initial point setting not found'], 404);
        }
        return $initial->setting_value;
    }

    public function GetPointThreshold()
    {
        $data = PointsThreshold::select('id', 'points', 'actions')
            ->orderBy('points', 'desc')
            ->get();

        return response()->json($data);
    }

    public function AddPointThreshold(Request $request)
    {
        $fields = $request->validate([
            'points' => 'required|numeric',
            'actions' => 'required|string'
        ]);

        PointsThreshold::create([
            'points' => $fields['points'],
            'actions' => $fields['actions'],
        ]);

        $pointsThreshold = PointsThreshold::select('id', 'points', 'actions')
            ->orderBy('points', 'desc')
            ->get();

        return response()->json($pointsThreshold);
    }

    public function EditPointThreshold(Request $request)
    {
        $fields = $request->validate([
            'id' => 'required',
            'points' => 'sometimes|numeric',
            'actions' => 'sometimes|string'
        ]);

        $updateData = [];

        if (isset($fields['points'])) {
            $updateData['points'] = $fields['points'];
        }

        if (isset($fields['actions'])) {
            $updateData['actions'] = $fields['actions'];
        }

        PointsThreshold::where('id', $fields['id'])
            ->update($updateData);

        $pointsThreshold = PointsThreshold::select('id', 'points', 'actions')
            ->orderBy('points', 'desc')
            ->get();

        return response()->json($pointsThreshold);
    }

    public function DeletePointThreshold($id)
    {
        PointsThreshold::where('id', $id)->delete();

        $pointsThreshold = PointsThreshold::select('id', 'points', 'actions')
            ->orderBy('points', 'desc')
            ->get();

        return response()->json($pointsThreshold);
    }

    public function GetStudentByClass(Request $request)
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
        $studentId = $request->validate([
            'id' => 'required|numeric'
        ]);
        $studentId = (int) $studentId['id'];

        $student = Students::select('id', 'name', 'username', 'class', 'stream', 'status')
            // ->where('status', 'active')
            ->where('id', $studentId)
            ->first();

        $transactions = Transaction::with('creator', 'student', 'meritPointRule')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->where('receiver_id', $studentId)
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

        $totalPoints = Points::where('receiver', $studentId)->sum('total_points');

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
        $createdBy = $accessToken->tokenable_id;
        $createdByType = get_class($accessToken->tokenable);
        $transaction = [
            'created_by_id' => $createdBy,
            'created_by_type' => $createdByType,
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

    public function AcademicStructure()
    {
        $studentClass = StudentClass::all();
        $studentStream = StudentStream::all();

        return response([
            'studentClass' => $studentClass,
            'studentStream' => $studentStream,
        ], 200);
    }

    public function AddStudentClass(Request $request)
    {
        $fields = $request->validate([
            'class' => 'required|string',
        ]);

        StudentClass::create([
            'class' => $fields['class'],
        ]);

        $studentClass = StudentClass::all();

        return response([$studentClass], 200);
    }

    public function AddStudentStream(Request $request)
    {
        $fields = $request->validate([
            'stream' => 'required|string',
        ]);

        StudentStream::create([
            'stream' => $fields['stream'],
        ]);

        $studentStream = StudentStream::all();

        return response([$studentStream], 200);
    }

    public function ClassDeletion($id)
    {
        StudentClass::where('id', $id)->delete();

        $studentClass = StudentClass::select('id', 'class')->get();

        return response(['studentClass' => $studentClass], 200);
    }

    public function StreamDeletion($id)
    {
        StudentStream::where('id', $id)->delete();

        $studentStream = StudentStream::select('id', 'stream')->get();

        return response(['studentStream' => $studentStream], 200);
    }

    public function Notifications($notification)
    {
        $notification = Notification::create($notification);
    }

    public function GetNotification(Request $request)
    {
        $search = $request->input('search', '');

        $query = Notification::select('id', 'title', 'message', 'is_read', 'created_at')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('message', 'LIKE', "%{$search}%")
                    ->orWhere('created_at', 'LIKE', "%{$search}%");
            });
        }

        $notifications = $query->get();

        $formattedNotifications = $notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'time' => Carbon::parse($notification->created_at)->diffForHumans(),
                'new' => !$notification->is_read
            ];
        });

        return response()->json([
            'messages' => $formattedNotifications
        ]);
    }

    public function MarkNotificationAsRead()
    {
        Notification::where('is_read', false)->update(['is_read' => true]);
    }

    public function GetSetting(Request $request)
    {
        $settings = AdminSetting::all();
        $accountSettings = Admin::select('id', 'name', 'email')->get();
        return response()->json([
            'settings' => $settings,
            'accountSettings' => $accountSettings
        ]);
    }

    public function Setting(Request $request)
    {
        $fields = $request->validate([
            'setting_name' => 'required|string',
            'setting_value' => 'required|string'
        ]);

        $setting = AdminSetting::where('setting_name', $fields['setting_name'])->first();
        if ($setting) {
            $setting->setting_value = $fields['setting_value'];
            $setting->save();
            return response()->json(['setting' => $setting]);
        } else {
            AdminSetting::create([
                'setting_name' => $fields['setting_name'],
                'setting_value' => $fields['setting_value']
            ]);
            return response()->json(['setting' => $setting]);
        }
    }

    public function ExcludedStudent()
    {
        $excludedStudents = StudentExclusion::with('student')->get();
        $students = [];

        foreach ($excludedStudents as $excludedStudent) {
            if ($excludedStudent->student) {
                $students[] = [
                    "id" => $excludedStudent->student->id,
                    "name" => $excludedStudent->student->name,
                    "email" => $excludedStudent->student->email,
                    "class" => $excludedStudent->student->class,
                    "stream" => $excludedStudent->student->stream
                ];
            }
        }

        return response($students, 200);
    }

    public function ExcludeStudent(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email'
        ]);

        $studentId = Students::where('email', $fields['email'])->value('id');

        if (!$studentId) {
            return response(["message" => "Student not found."], 404);
        }

        $alreadyExcluded = StudentExclusion::where('student_id', $studentId)->exists();

        if ($alreadyExcluded) {
            return response(["message" => "Student is already in the exclusion list."], 409);
        }

        StudentExclusion::create([
            'student_id' => $studentId
        ]);

        return response(["message" => "Student excluded from leaderboard successfully"], 201);
    }

    public function DeleteExcludedStudent($id)
    {
        StudentExclusion::where('student_id', $id)->delete();

        return response(["message" => "Student deleted from exclusion list"], 200);
    }

    public function ChangeBasicInfo(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email'
        ]);

        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $adminId = $accessToken->tokenable_id;

        Admin::where('id', $adminId)
            ->update(['name' => $fields['name'], 'email' => $fields['email']]);

        $admin = Admin::select('id', 'name', 'email')->where('id', $adminId)->get();

        return response()->json([
            $admin
        ]);
    }

    public function UpdatePassword(Request $request)
    {
        $fields = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|confirmed|string|min:6'
        ]);

        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $adminId = $accessToken->tokenable_id;

        $adminPassword = Admin::select('password')->where('id', $adminId)->pluck('password')->first();

        if (!Hash::check($fields['current_password'], $adminPassword)) {
            return response(['message' => 'Incorrect password'], 401);
        } elseif (Hash::check($fields['password'], $adminPassword)) {
            return response(['message' => 'New password cannot be the same as the current password'], 400);
        }

        Admin::where('id', $adminId)
            ->update(['password' => Hash::make($fields['password'])]);

        $token = $request->cookie('auth_token');
        $personalAccessToken = PersonalAccessToken::findToken($token);
        if ($personalAccessToken) {
            $personalAccessToken->delete();

            cookie()->queue(cookie()->forget('auth_token'));
        }

        return response(['message' => 'Password updated successfully. Please log in again.'], 200);
    }

    public function NewAdmin(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|unique:admins,email|unique:teachers,email|unique:students,email|email',
            'password' => 'required|confirmed|string|min:6'
        ]);

        if (!Admin::where('email', $fields['email'])->exists()) {
            Admin::create([
                'name' => $fields['name'],
                'email' => $fields['email'],
                'password' => Hash::make($fields['password'])
            ]);
        } else {
            return response(['message' => 'User already exists'], 400);
        }

        return response(['message' => 'User created successfully'], 201);
    }

    public function UploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        if ($request->hasfile('logo')) {
            $file = $request->file('logo');
            $path = $file->store('uploads', 'public');

            AdminSetting::where('setting_name', 'logo')->update(['setting_value' => url(Storage::url($path))]);

            return response(['path' => url(Storage::url($path))], 200);
        } else {
            return response(['message' => 'No file uploaded'], 400);
        }
    }

    public function GetInvitationCode()
    {
        $invitationCodes = InvitationCodes::orderBy('created_at', 'desc')->get();
        return response()->json($invitationCodes);
    }

    public function DeleteInvitationCode($id)
    {
        $invitationCode = InvitationCodes::find($id);
        if ($invitationCode) {
            $invitationCode->delete();
            return response()->json(['message' => 'Invitation code deleted successfully']);
        } else {
            return response()->json(['message' => 'Invitation code not found'], 404);
        }
    }
}
