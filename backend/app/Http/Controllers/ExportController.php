<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exports\AdminChartDataExport;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function AdminChartExport() {
        return Excel::download(new AdminChartDataExport, 'dashboard_charts.xlsx');
    }
}
