<?php

namespace Database\Seeders;

use App\Models\StudentStream;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StreamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StudentStream::insert([
            ['stream' => 'Science'], 
            ['stream' => 'Commerce'], 
        ]);
    }
}
