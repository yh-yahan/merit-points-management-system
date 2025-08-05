<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Points;
use App\Models\Students;
use App\Models\Transaction;
use App\Models\AdminSetting;
use App\Models\StudentExclusion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
  public function Leaderboard(Request $request)
  {
    $disabled = AdminSetting::where('setting_name', 'disable_leaderboard')->value('setting_value');

    if ($disabled == 'true') {
      return response()->json([
        'status' => 'error',
        'message' => 'Leaderboard is disabled'
      ], 403);
    } else {
      $excludedStudentIds = StudentExclusion::pluck('student_id')->toArray();
      $leaderboardType = $request->input('leaderboard', 'alltime');
      $classFilter = $request->input('classfilter', 'all');

      $leaderboardVisibility = AdminSetting::where('setting_name', 'leaderboard_visibility')->value('setting_value');
      $leaderboard = [];

      if ($leaderboardType == 'alltime') {
        $allTimeLeaderboard = Students::with('points')
          ->withSum('points as total_points', 'total_points')
          ->whereNotIn('id', $excludedStudentIds)
          ->when($classFilter !== 'all', function ($query) use ($classFilter) {
            $query->where('class', $classFilter);
          })
          ->orderBy('total_points', 'desc')
          ->get()
          ->map(function ($student) use ($leaderboardVisibility) {
            $field = $leaderboardVisibility === 'username' ? $student->username : $student->name;

            return [
              'id' => $student->id,
              'name_or_username' => $field,
              'points' => $student->total_points ?? 0,
              'class' => $student->class,
            ];
          });

        $allTimeLeaderboard = $allTimeLeaderboard->map(function ($entry, $index) {
          $entry['rank'] = $index + 1;
          return $entry;
        });

        $leaderboard = $allTimeLeaderboard;
      } elseif ($leaderboardType == 'weekly') {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $weeklyLeaderboard = Transaction::whereBetween('date', [$startOfWeek, $endOfWeek])
          ->whereNotIn('id', $excludedStudentIds)
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

        $weeklyLeaderboard = $weeklyLeaderboard->map(function ($transaction, $points) use ($leaderboardVisibility) {
          $student = Students::find($transaction->receiver_id);
          $field = $leaderboardVisibility === 'username' ? $student->username : $student->name;
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
          ->whereNotIn('id', $excludedStudentIds)
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

        $monthlyLeaderboard = $monthlyLeaderboard->map(function ($transaction, $points) use ($leaderboardVisibility) {
          $student = Students::find($transaction->receiver_id);
          $field = $leaderboardVisibility === 'username' ? $student->username : $student->name;
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
  }
}
