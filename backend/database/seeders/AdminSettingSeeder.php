<?php

namespace Database\Seeders;

use App\Models\AdminSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // AdminSetting::insert([
        //     [
        //         'setting_name' => 'initial_point',
        //         'setting_value' => '', 
        //         'created_at' => now(),
        //         'updated_at' => now(),
        //     ]
        // ]);
        AdminSetting::insert([
            ['setting_name' => 'initial_point', 'setting_value' => 60], 
            ['setting_name' => 'disable_leaderboard','setting_value' => false], 
            ['setting_name' => 'student_opt_out_leaderboard', 'setting_value' => false], 
            ['setting_name' => 'leaderboard_visibility', 'setting_value' => 'username'],
            ['setting_name' => 'primary_color', 'setting_value' => '#0275d8'], 
        ]);
    }
}
