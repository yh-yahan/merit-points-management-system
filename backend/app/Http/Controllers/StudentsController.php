<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Students;
use App\Models\Transaction;
use App\Models\AdminSetting;
use App\Models\InvitationCodes;
use App\Models\StudentSetting;
use App\Models\StudentClass;
use App\Models\StudentExclusion;
use App\Models\StudentStream;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Cookie;
use Illuminate\Support\Facades\RateLimiter;

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

        $maxAttempts = 5;
        $decayMinutes = 1;
        $key = 'student signup: ' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            return response([
                // 'message' => 'Too many attempts. Please try again in ' . $seconds . ' seconds.'
                'message' => 'Too many attempts. Please try again later.'
            ], 429)->header('Retry-After', $seconds);;
        }
        RateLimiter::hit($key, $decayMinutes * 60);

        $currentDate = Carbon::now()->toDatestring();

        $result = InvitationCodes::where('code', $fields['invitation_code'])
            ->whereDate('valid_until', '>=', $currentDate)
            ->first();

        if ($result) {
            if ($result->for_user_type == 'student') {
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

                StudentSetting::create([
                    'student_id' => $students->id,
                    'opt_out_lb' => 0,
                    'name_preference_lb' => "name"
                ]);

                $initialPoints = AdminSetting::where('setting_name', 'initial_point')->first();

                $students->points()->create([
                    'total_points' => $initialPoints->setting_value,
                ]);

                $token = $students->createToken(
                    'studentsToken',
                    ['student'],
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
                ];

                return response($response, 201)->withCookie($cookie);
            } else {
                return response(["message" => "Invalid invitation code"], 401);
            }
        } else {
            return response(["message" => "Invalid invitation code"], 401);
        }
    }

    public function Dashboard(Request $request)
    {
        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $studentId = $accessToken->tokenable_id;

        $student = Students::find($studentId);

        $totalPoints = $student->points->total_points;

        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthlyPointsAwarded = Transaction::whereBetween('date', [$startOfMonth, $endOfMonth])
            ->where('receiver_id', $studentId)
            ->where('operation_type', 'add')
            ->sum('points');

        $monthlyPointsDeducted = Transaction::whereBetween('date', [$startOfMonth, $endOfMonth])
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
            "totalPoints" => $totalPoints,
            "monthlyPointsAwarded" => $monthlyPointsAwarded,
            "monthlyPointsDeducted" => $monthlyPointsDeducted,
            "recentActivities" => $recentActivityData,
        ]);
    }

    public function Leaderboard(Request $request)
    {
        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);

        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $studentId = $accessToken->tokenable_id;
        $currentStudent = Students::find($studentId);

        if (!$currentStudent || $currentStudent->status !== 'active') {
            return response()->json(['message' => 'Student not active or not found'], 403);
        }

        $disabled = AdminSetting::where('setting_name', 'disable_leaderboard')->value('setting_value');
        if ($disabled === 'true') {
            return response()->json(['message' => 'Leaderboard is disabled']);
        }

        $allowOptOut = AdminSetting::where('setting_name', 'allow_students_to_opt_out_leaderboard')
            ->value('setting_value');

        $optedOutStudentIds = [];
        if ($allowOptOut === 'true') {
            $optedOutStudentIds = StudentSetting::where('opt_out_lb', 1)->pluck('student_id')->toArray();
        }

        $excludedStudentIds = StudentExclusion::pluck('student_id')->toArray();

        $blockedStudentIds = array_merge($excludedStudentIds, $optedOutStudentIds);

        $leaderboardType = $request->input('leaderboard', 'alltime');
        $classFilter     = $request->input('classfilter', 'all');
        $leaderboardVisibility = AdminSetting::where('setting_name', 'leaderboard_visibility')
            ->value('setting_value');

        $activeStudentIds = Students::where('status', 'active')->pluck('id');
        $studentSettings = StudentSetting::whereIn('student_id', $activeStudentIds)
            ->get()
            ->keyBy('student_id');

        $leaderboard = collect();

        if ($leaderboardType === 'alltime') {
            $leaderboard = Students::where('status', 'active')
                ->whereNotIn('id', $blockedStudentIds)
                ->withSum('points as total_points', 'total_points')
                ->when($classFilter !== 'all', fn($q) => $q->where('class', $classFilter))
                ->orderByDesc('total_points')
                ->get()
                ->map(function ($student) use ($leaderboardVisibility, $studentSettings, $studentId) {
                    $displayName = $this->getStudentDisplayName($student, $leaderboardVisibility, $studentSettings);

                    return [
                        'id'              => $student->id,
                        'name_or_username' => $displayName,
                        'points'          => $student->total_points ?? 0,
                        'class'           => $student->class,
                        'is_current_user' => $student->id == $studentId,
                    ];
                })
                ->map(fn($entry, $index) => $entry + ['rank' => $index + 1]);
        } elseif ($leaderboardType === 'weekly') {
            $start = Carbon::now()->startOfWeek();
            $end   = Carbon::now()->endOfWeek();

            $data = Transaction::whereBetween('date', [$start, $end])
                ->whereHas('student', fn($q) => $q->where('status', 'active'))
                ->whereNotIn('receiver_id', $blockedStudentIds)
                ->when($classFilter !== 'all', fn($q) => $q->whereHas('student', fn($qq) => $qq->where('class', $classFilter)))
                ->groupBy('receiver_id')
                ->selectRaw("
                receiver_id,
                SUM(CASE WHEN operation_type = 'add' THEN points WHEN operation_type = 'deduct' THEN -points ELSE 0 END) as total_points
            ")
                ->orderByDesc('total_points')
                ->get();

            $leaderboard = $data->map(function ($row) use ($leaderboardVisibility, $studentSettings, $studentId) {
                $student = Students::find($row->receiver_id);
                if (!$student || $student->status !== 'active') return null;

                $displayName = $this->getStudentDisplayName($student, $leaderboardVisibility, $studentSettings);

                return [
                    'id' => $student->id,
                    'name_or_username' => $displayName,
                    'points' => (int) $row->total_points,
                    'class' => $student->class,
                    'is_current_user' => $student->id == $studentId,
                ];
            })
                ->filter()
                ->values()
                ->map(fn($entry, $index) => $entry + ['rank' => $index + 1]);
        } elseif ($leaderboardType === 'monthly') {
            $start = Carbon::now()->startOfMonth();
            $end   = Carbon::now()->endOfMonth();

            $data = Transaction::whereBetween('date', [$start, $end])
                ->whereHas('student', fn($q) => $q->where('status', 'active'))
                ->whereNotIn('receiver_id', $blockedStudentIds)
                ->when($classFilter !== 'all', fn($q) => $q->whereHas('student', fn($qq) => $qq->where('class', $classFilter)))
                ->groupBy('receiver_id')
                ->selectRaw("
                receiver_id,
                SUM(CASE WHEN operation_type = 'add' THEN points WHEN operation_type = 'deduct' THEN -points ELSE 0 END) as total_points
            ")
                ->orderByDesc('total_points')
                ->get();

            $leaderboard = $data->map(function ($row) use ($leaderboardVisibility, $studentSettings, $studentId) {
                $student = Students::find($row->receiver_id);
                if (!$student || $student->status !== 'active') return null;

                $displayName = $this->getStudentDisplayName($student, $leaderboardVisibility, $studentSettings);

                return [
                    'id'              => $student->id,
                    'name_or_username' => $displayName,
                    'points'          => (int) $row->total_points,
                    'class'           => $student->class,
                    'is_current_user' => $student->id == $studentId,
                ];
            })
                ->filter()
                ->values()
                ->map(fn($entry, $index) => $entry + ['rank' => $index + 1]);
        }

        return response()->json([
            'students'     => $leaderboard,
            'studentClass' => $currentStudent->class,
        ]);
    }

    private function getStudentDisplayName($student, $leaderboardVisibility, $studentSettings)
    {
        if ($leaderboardVisibility === 'name') {
            return $student->name;
        }

        if ($leaderboardVisibility === 'username') {
            return $student->username;
        }

        if ($leaderboardVisibility === 'choose') {
            $setting = $studentSettings[$student->id] ?? null;
            $preference = $setting?->name_preference_lb;

            if ($preference === 'username') {
                return $student->username;
            } else {
                return $student->name;
            }
        }

        return $student->name;
    }

    public function MeritPointRule(Request $request)
    {
        return $this->GetMeritPointRule($request);
    }

    public function MeritPointThreshold(Request $request)
    {
        return $this->GetPointThreshold();
    }

    public function GetSettings(Request $request)
    {
        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $studentId = $accessToken->tokenable_id;

        $leaderboard_settings = [];
        $allow_student_opt_out_leaderboard = AdminSetting::where('setting_name', 'allow_students_to_opt_out_leaderboard')
            ->first();
        $leaderboard_visibility = AdminSetting::where('setting_name', 'leaderboard_visibility')
            ->first();

        $optOutEnabled = $allow_student_opt_out_leaderboard->setting_value === "true";
        $visibilityEnabled = $leaderboard_visibility->setting_value === "choose";
        $student_setting = StudentSetting::where('student_id', $studentId)->first();

        if ($optOutEnabled && $visibilityEnabled) {
            $opt_out_lb = $student_setting->opt_out_lb;
            $lb_visibility = $student_setting->name_preference_lb;

            $leaderboard_settings = [
                'opt_out_lb' => $opt_out_lb,
                'lb_visibility' => $lb_visibility
            ];
        } elseif ($optOutEnabled) {
            $opt_out_lb = $student_setting->opt_out_lb;
            $leaderboard_settings = [
                'opt_out_lb' => $opt_out_lb,
            ];
        } elseif ($visibilityEnabled) {
            $lb_visibility = $student_setting->name_preference_lb;

            $leaderboard_settings = [
                'lb_visibility' => $lb_visibility
            ];
        } else {
            $leaderboard_settings = [];
        }

        $student = Students::select('name', 'username', 'email', 'class', 'stream')
            ->where('id', $studentId)
            ->first();

        return response()->json([
            'leaderboard_settings' => $leaderboard_settings,
            'student' => $student,
        ]);
    }

    public function Setting(Request $request)
    {
        $fields = $request->validate([
            'opt_out_lb' => 'sometimes|boolean',
            'name_preference_lb' => 'sometimes|in:name,username'
        ]);

        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $studentId = $accessToken->tokenable_id;

        $setting = StudentSetting::where('student_id', $studentId)->first();

        if ($setting) {
            $setting->update($fields);
        } else {
            $fields['student_id'] = $studentId;
            $setting = StudentSetting::create($fields);
        }

        return response()->json(['setting' => $setting]);
    }

    public function ChangeBasicInfo(Request $request)
    {
        $fields = $request->validate([
            'student_name' => 'required',
            'student_username' => 'required',
            'student_email' => 'required|email',
            'student_class' => 'required',
            'student_stream' => 'required',
        ]);

        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $studentId = $accessToken->tokenable_id;

        Students::where('id', $studentId)
            ->update([
                'name' => $fields['student_name'],
                'username' => $fields['student_username'],
                'email' => $fields['student_email'],
                'class' => $fields['student_class'],
                'stream' => $fields['student_stream'],
            ]);

        $student = Students::select('id', 'name', 'username', 'email', 'class', 'stream')
            ->where('id', $studentId)->get();

        return response()->json([
            'student' => $student,
        ]);
    }

    public function UpdatePassword(Request $request)
    {
        $fields = $request->validate([
            'current_password' => 'required',
            'password' => 'required|confirmed|string|min:6'
        ]);

        $token = $request->cookie('auth_token');
        $accessToken = PersonalAccessToken::findToken($token);
        $student_id = $accessToken->tokenable_id;

        $student_password = Students::where('id', $student_id)->value('password');

        if (!Hash::check($fields['current_password'], $student_password)) {
            return response(['message' => 'Incorrect password'], 401);
        } elseif (Hash::check($fields['password'], $student_password)) {
            return response(['message' => 'New password cannot be the same as the current password'], 400);
        }

        Students::where('id', $student_id)
            ->update(['password' => Hash::make($fields['password'])]);

        if ($accessToken) {
            $accessToken->delete();

            cookie()->queue(cookie()->forget('auth_token'));
        }

        return response(['message' => 'Password updated successfully. Please log in again.'], 200);
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
}
