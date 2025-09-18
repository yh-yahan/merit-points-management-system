<?php

namespace App\Exports;

use App\Models\MeritPointsRules;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromCollection;

class RuleExport implements FromCollection, WithHeadings
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $rules = MeritPointsRules::select(
            'id',
            'name',
            'description',
            'points',
            'operation_type'
        )->get();

        return $rules->map(function ($rule) {
            $points = $rule->operation_type === 'deduct'
                ? -abs($rule->points)
                : $rule->points;

            return [
                'ID' => $rule->id,
                'Name' => $rule->name,
                'Description' => $rule->description,
                'Points' => $points,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Description',
            'Points'
        ];
    }
}
