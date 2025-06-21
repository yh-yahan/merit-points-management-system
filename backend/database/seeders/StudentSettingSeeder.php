<?php

namespace Database\Seeders;

use App\Models\Students;
use App\Models\StudentSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Students::all()->each(function ($student) {
            StudentSetting::factory()->create([
                'student_id' => $student->id
            ]);
        });
    }
}
