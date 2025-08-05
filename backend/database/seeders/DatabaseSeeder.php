<?php

namespace Database\Seeders;

use App\Models\Students;
use App\Models\Points;
use App\Models\MeritPointsRules;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // DB::table('transaction')->truncate();
        // DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->call([
          AdminSeeder::class, 
          TeachersSeeder::class, 
          StudentsSeeder::class, 
          MeritPointsRulesSeeder::class, 
          TransactionSeeder::class, 
          PointsSeeder::class, 
          AdminSettingSeeder::class, 
          StudentSettingSeeder::class, 
          PointThresholdSeeder::class, 
          StreamSeeder::class, 
          ClassSeeder::class, 
          StudentExclusionSeeder::class, 
        ]);
    }
}
