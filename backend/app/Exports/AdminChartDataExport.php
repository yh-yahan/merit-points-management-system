<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AdminChartDataExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        $sheets = [];

        $lineChartData = app('App\Http\Controllers\AdminExportController')
            ->getLineChartData();
        $barChartAwarded = app('App\Http\Controllers\AdminExportController')
            ->getBarChartData('add');
        $barChartDeducted = app('App\Http\Controllers\AdminExportController')
            ->getBarChartData('deduct');

        $sheets[] = new ChartDataExport($lineChartData, 'Monthly Points Summary');
        $sheets[] = new ChartDataExport($barChartAwarded, 'Top 5 Awarded Rules');
        $sheets[] = new ChartDataExport($barChartDeducted, 'Top 5 Deducted Rules');

        return $sheets;
    }
}
