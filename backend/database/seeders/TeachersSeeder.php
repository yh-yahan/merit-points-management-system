<?php

namespace Database\Seeders;

use App\Models\Teachers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TeachersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Teachers::factory()->count(10)->create();
        Teachers::factory()->create([
            'name' => 'John Smith',
            'email' => 'teacherEmail@example.com', 
            'password' => Hash::make('teacherPassword'), 
            'description' => 'This is a description for the teacher.', 
            'profile_pic' => "", 
        ]);
    }
}
