<?php

namespace Database\Seeders;

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $startDate = Carbon::create(2023, 1, 1);
    $endDate = Carbon::create(2025, 9, 1);

    while ($startDate <= $endDate) {
      $randomDay = rand(1, $startDate->daysInMonth);
      $date = $startDate->copy()->day($randomDay)->format('Y-m-d');

      Transaction::factory()->create([
        'date' => $date,
      ]);

      $startDate->addMonth();
    }
  }
}
