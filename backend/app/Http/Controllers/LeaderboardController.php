<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Points;
use App\Models\Students;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    public function Leaderboard(Request $request)
    {
        $leaderboardType = $request->input('leaderboard', 'alltime');
        $classFilter = $request->input('classfilter', 'all');

        $leaderboard = [];
        if ($leaderboardType == 'alltime') {
            $allTimeLeaderboard = Points::with('student')
                ->when($classFilter !== 'all', function ($query) use ($classFilter) {
                    return $query->whereHas('student', function ($query) use ($classFilter) {
                        $query->where('class', $classFilter);
                    });
                })
                ->orderBy('total_points', 'desc')
                ->get()
                ->map(function ($points) {
                    return [
                        'id' => $points->student->id,
                        'name' => $points->student->name,
                        'points' => $points->total_points,
                        'class' => $points->student->class
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
                ->groupBy('receiver_id')
                ->select('receiver_id', DB::raw('SUM(points) as total_points'))
                ->when($classFilter !== 'all', function ($query) use ($classFilter) {
                    return $query->whereHas('student', function ($query) use ($classFilter) {
                        $query->where('class', $classFilter);
                    });
                })
                ->orderByDesc('total_points')
                ->get();

            $weeklyLeaderboard = $weeklyLeaderboard->map(function ($transaction) {
                $student = Students::find($transaction->receiver_id);
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'points' => $transaction->total_points,
                    'class' => $student->class
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
                ->groupBy('receiver_id')
                ->select('receiver_id', DB::raw('SUM(points) as total_points'))
                ->when($classFilter !== 'all', function ($query) use ($classFilter) {
                    return $query->whereHas('student', function ($query) use ($classFilter) {
                        $query->where('class', $classFilter);
                    });
                })
                ->orderByDesc('total_points')
                ->get();

            $monthlyLeaderboard = $monthlyLeaderboard->map(function ($transaction) {
                $student = Students::find($transaction->receiver_id);
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'points' => $transaction->total_points,
                    'class' => $student->class
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
