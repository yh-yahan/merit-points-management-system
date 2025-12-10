<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Points;
use App\Models\Students;
use App\Models\Transaction;
use App\Models\AdminSetting;
use App\Models\StudentExclusion;
use App\Models\StudentSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function Leaderboard(Request $request)
    {
        $disabled = AdminSetting::where('setting_name', 'disable_leaderboard')->value('setting_value');
        $allowStudentOptOutLeaderboard = AdminSetting::where('setting_name', 'allow_students_to_opt_out_leaderboard')->value('setting_value');
        $optedOutStudentIds = [];
        if ($allowStudentOptOutLeaderboard == 'true') {
            $optedOutStudentIds = StudentSetting::where('opt_out_lb', 1)
                ->pluck('student_id');
        }

        if ($disabled == 'true') {
            return response()->json([
                'status' => 'error',
                'message' => 'Leaderboard is disabled'
            ], 403);
        }

        $excludedStudentIds = StudentExclusion::pluck('student_id')->toArray();
        $leaderboardType = $request->input('leaderboard', 'alltime');
        $classFilter = $request->input('classfilter', 'all');

        $studentIds = Students::pluck('id')->toArray();
        $studentSettings = StudentSetting::whereIn('student_id', $studentIds)->get()->keyBy('student_id');
        $leaderboardVisibility = AdminSetting::where('setting_name', 'leaderboard_visibility')->value('setting_value');
        $leaderboard = [];

        $activeStudentsQuery = Students::where('status', 'active')
            ->whereNotIn('id', $excludedStudentIds)
            ->whereNotIn('id', $optedOutStudentIds);

        if ($leaderboardType == 'alltime') {
            $leaderboard = $activeStudentsQuery->clone()
                ->withSum('points as total_points', 'total_points')
                ->when($classFilter !== 'all', fn($q) => $q->where('class', $classFilter))
                ->orderByDesc('total_points')
                ->get()
                ->map(function ($student) use ($leaderboardVisibility, $studentSettings) {
                    $displayName = $this->getStudentDisplayName($student, $leaderboardVisibility, $studentSettings);

                    return [
                        'id' => $student->id,
                        'name_or_username' => $displayName,
                        'points' => $student->total_points ?? 0,
                        'class' => $student->class,
                    ];
                })
                ->map(fn($entry, $index) => $entry + ['rank' => $index + 1]);
        } elseif ($leaderboardType == 'weekly') {
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek = Carbon::now()->endOfWeek();

            $weeklyLeaderboard = Transaction::whereBetween('date', [$startOfWeek, $endOfWeek])
                ->whereHas('student', fn($q) => $q->where('status', 'active'))
                ->whereNotIn('receiver_id', $excludedStudentIds)
                ->whereNotIn('receiver_id', $optedOutStudentIds)
                ->groupBy('receiver_id')
                ->select('receiver_id', DB::raw("
                SUM(CASE 
                  WHEN operation_type = 'add' THEN points 
                  WHEN operation_type = 'deduct' THEN -points 
                  ELSE 0 
                END) as total_points
              "))
                ->when($classFilter !== 'all', function ($query) use ($classFilter) {
                    return $query->whereHas('student', function ($query) use ($classFilter) {
                        $query->where('class', $classFilter);
                    });
                })
                ->orderByDesc('total_points')
                ->get();

            $weeklyLeaderboard = $weeklyLeaderboard->map(function ($transaction, $key) use ($leaderboardVisibility, $studentSettings) {
                $student = Students::find($transaction->receiver_id);
                $field = $this->getStudentDisplayName($student, $leaderboardVisibility, $studentSettings);
                return [
                    'id' => $student->id,
                    'name_or_username' => $field,
                    'points' => $transaction->total_points,
                    'class' => $student->class,
                ];
            });

            $weeklyLeaderboard = $weeklyLeaderboard->map(function ($entry, $index) {
                $entry['rank'] = $index + 1;
                return $entry;
            });

            $leaderboard = $weeklyLeaderboard;
        } elseif ($leaderboardType == 'monthly') {
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();

            $monthlyLeaderboard = Transaction::whereBetween('date', [$startOfMonth, $endOfMonth])
                ->whereHas('student', fn($q) => $q->where('status', 'active'))
                ->whereNotIn('receiver_id', $excludedStudentIds)
                ->whereNotIn('receiver_id', $optedOutStudentIds)
                ->groupBy('receiver_id')
                ->select('receiver_id', DB::raw("
            SUM(CASE 
              WHEN operation_type = 'add' THEN points 
              WHEN operation_type = 'deduct' THEN -points 
              ELSE 0 
            END) as total_points
          "))
                ->when($classFilter !== 'all', function ($query) use ($classFilter) {
                    return $query->whereHas('student', function ($query) use ($classFilter) {
                        $query->where('class', $classFilter);
                    });
                })
                ->orderByDesc('total_points')
                ->get();

            $monthlyLeaderboard = $monthlyLeaderboard->map(function ($transaction, $key) use ($leaderboardVisibility, $studentSettings) {
                $student = Students::find($transaction->receiver_id);
                $field = $this->getStudentDisplayName($student, $leaderboardVisibility, $studentSettings);
                return [
                    'id' => $student->id,
                    'name_or_username' => $field,
                    'points' => $transaction->total_points,
                    'class' => $student->class,
                ];
            });

            $monthlyLeaderboard = $monthlyLeaderboard->map(function ($entry, $index) {
                $entry['rank'] = $index + 1;
                return $entry;
            });

            $leaderboard = $monthlyLeaderboard;
        }

        $allClasses = Students::select('class')->distinct()->get()->map(function ($student) {
            return $student->class;
        });

        return response()->json([
            'students' => $leaderboard,
            'allClasses' => $allClasses,
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
}
