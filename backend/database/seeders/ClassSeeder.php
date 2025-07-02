<?php

namespace Database\Seeders;

use App\Models\Students;
use App\Models\StudentClass;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StudentClass::insert([
            ['class' => '7A'],
            ['class' => '7B'],
            ['class' => '8A'],
            ['class' => '9A'],
            ['class' => '10A'],
            ['class' => '10B'],
        ]);
    }
}
