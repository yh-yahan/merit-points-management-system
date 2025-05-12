<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MeritPointsRulesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
      DB::table('merit_points_rules')->insert([
        [
            'name' => 'Score A*',
            'description' => 'Scored A* in exam',
            'points' => 10,
            'operation_type' => 'add',
        ],
        [
            'name' => 'Score A',
            'description' => 'Scored A in exam',
            'points' => 5,
            'operation_type' => 'add',
        ],
        [
            'name' => 'Late to class',
            'description' => 'Late to class (more than twice per month)',
            'points' => 1,
            'operation_type' => 'deduct',
        ],
        [
            'name' => 'Failure to complete homework',
            'description' => 'Failure to complete homework despite first warning',
            'points' => 2,
            'operation_type' => 'deduct',
        ],
      ]);
    }
}
