<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exports\AdminChartDataExport;
use App\Exports\RuleExport;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function AdminChartExport()
    {
        return Excel::download(new AdminChartDataExport, 'dashboard_charts.xlsx');
    }

    public function exportRulesToExcel()
    {
        return Excel::download(new RuleExport, 'merit_rules.xlsx');
    }

    public function exportRulesToCsv()
    {
        return Excel::download(new RuleExport, 'merit_rules.csv');
    }
}
