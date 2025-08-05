<?php

namespace Database\Seeders;

use App\Models\StudentExclusion;
use App\Models\Students;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentExclusionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student_ids = Students::inRandomOrder()->limit(5)->pluck('id');

        foreach ($student_ids as $id) {
            StudentExclusion::create([
                'student_id' => $id,
            ]);
        }
    }
}
