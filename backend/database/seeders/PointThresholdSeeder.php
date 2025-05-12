<?php

namespace Database\Seeders;

use App\Models\PointsThreshold;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PointThresholdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PointsThreshold::insert([ 
        [
            'points' => 200,
            'actions' => 'Give appreciation badge', 
            'created_at' => now(),
            'updated_at' => now(),
        ], 
        [
            'points' => 50,
            'actions' => 'Meet parents', 
            'created_at' => now(),
            'updated_at' => now(),
        ], 
        [
            'points' => 40,
            'actions' => 'Meet parents', 
            'created_at' => now(),
            'updated_at' => now(),
        ], 
        [
            'points' => 30,
            'actions' => 'Expel', 
            'created_at' => now(),
            'updated_at' => now(),
        ]]);
    }
}
