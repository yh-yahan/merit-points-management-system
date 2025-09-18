<?php

namespace App\Imports;

use App\Models\MeritPointsRules;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RuleImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $collection
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            MeritPointsRules::create([
                'name' => $row['rule_name'],
                'description' => $row['description'],
                'points' => abs((int) str_replace('+', '', $row['points'])),
                'operation_type' => $row['points'] < 0 ? 'deduct' : 'add',
            ]);
        }
    }
}
