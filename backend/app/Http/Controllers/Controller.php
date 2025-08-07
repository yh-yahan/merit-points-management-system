<?php

namespace App\Http\Controllers;

use App\Models\MeritPointsRules;
use App\Models\PointsThreshold;
use Illuminate\Http\Request;

abstract class Controller
{
    public function GetMeritPointRule(Request $request)
    {
        $search = $request->input('search', '');

        $query = MeritPointsRules::select(
            'id',
            'name',
            'description',
            'points',
            'operation_type',
        );

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $rules = $query->get();
        $totalRules = MeritPointsRules::count();

        return response()->json([
            "totalRules" => $totalRules,
            "rules" => $rules
        ]);
    }

    public function GetPointThreshold()
    {
        $data = PointsThreshold::select('id', 'points', 'actions')
            ->orderBy('points', 'desc')
            ->get();

        return response()->json($data);
    }
}
