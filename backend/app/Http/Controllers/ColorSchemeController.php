<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdminSetting;

class ColorSchemeController extends Controller
{
    public function PrimaryColor(){
        $primary_color = AdminSetting::where('setting_name', 'primary_color')
        ->select('setting_value')
        ->first();

        return response()->json([
            'primary_color' => $primary_color->setting_value,
        ]);
    }
}
