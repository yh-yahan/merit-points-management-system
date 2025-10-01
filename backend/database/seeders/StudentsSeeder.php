<?php

namespace Database\Seeders;

use App\Models\Students;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class StudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Students::factory()->count(40)->create();
        Students::factory()->create([
            'name' => 'John',
            'username' => 'studentUsername',
            'email' => 'studentEmail@example.com', 
            'password' => Hash::make('studentPassword'), 
            'class' => '10A',
            'stream' => 'Science', 
            'status' => "active", 
            'date_joined' => date("Y-m-d"),
        ]);
    }
}
