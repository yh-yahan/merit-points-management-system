<?php

namespace App\Http\Controllers;

use App\Models\AdminSetting;
use Illuminate\Http\Request;

class LogoController extends Controller
{
    public function GetLogo(){
        $path = AdminSetting::where('setting_name', 'logo')->first();
        return response()->json(['path' => $path->setting_value]);
    }
}
