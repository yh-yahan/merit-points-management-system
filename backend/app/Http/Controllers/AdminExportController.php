<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class AdminExportController extends Controller
{
    public function getLineChartData()
    {
        $currentYear = now()->year;

        $monthlySummary = Transaction::selectRaw('
        MONTH(date) as month,
        SUM(CASE WHEN operation_type = "add" THEN points ELSE 0 END) as total_awarded,
        SUM(CASE WHEN operation_type = "deduct" THEN points ELSE 0 END) as total_deducted
    ')
            ->whereYear('date', $currentYear)
            ->groupByRaw('MONTH(date)')
            ->orderBy('month')
            ->get();

        $data = [['Month', 'Total Awarded', 'Total Deducted']];

        foreach ($monthlySummary as $row) {
            $monthName = Carbon::create()->month($row->month)->format('F');
            $data[] = [$monthName, $row->total_awarded, $row->total_deducted];
        }

        return $data;
    }

    public function getBarChartData($type = 'add')
    {
        $currentYear = now()->year;

        $raw = Transaction::select(
            DB::raw('MONTH(date) as month'),
            'transaction.rule_id',
            DB::raw('SUM(transaction.points) as total_points'),
            'merit_points_rules.name'
        )
            ->join('merit_points_rules', 'transaction.rule_id', '=', 'merit_points_rules.id')
            ->where('transaction.operation_type', $type)
            ->where('merit_points_rules.operation_type', $type)
            ->whereYear('transaction.date', $currentYear)
            ->groupBy(DB::raw('MONTH(date)'), 'rule_id', 'merit_points_rules.name')
            ->orderBy(DB::raw('MONTH(date)'))
            ->get()
            ->groupBy('month');

        $final = [['Month', 'Rule', 'Points']];

        foreach ($raw as $month => $items) {
            $top5 = $items->sortByDesc('total_points')->take(5);
            foreach ($top5 as $item) {
                $monthName = Carbon::create()->month($month)->format('F');
                $final[] = [$monthName, $item->name, $item->total_points];
            }
        }

        return $final;
    }
}
