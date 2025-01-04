<?php

namespace Database\Factories;

use App\Models\Teachers;
use App\Models\Students;
use App\Models\MeritPointsRules;
use Illuminate\Database\Eloquent\Factories\Factory;
use DateTime;
use DateInterval;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
          'created_by_id' => Teachers::inRandomOrder()->first()->id, 
          'created_by_type' => $this->faker->randomElement(["App\Models\Admin", "App\Models\Teachers"]), 
          'receiver_id' => $this->faker->randomElement(Students::pluck('id')),
          'rule_id' => $this->faker->randomElement(MeritPointsRules::pluck('id')),
          'description' => $this->faker->sentence,
          'points' => $this->faker->numberBetween(1, 20),
          'operation_type' => $this->faker->randomElement(['add', 'deduct']),
          'date' => function(){
            $start = new DateTime('2023-01-01');
            $end = new DateTime('2025-12-31');
            $interval = $start->diff($end);
            $days = $interval->days;
            $randomDay = rand(0, $days);
            $start->add(new DateInterval("P{$randomDay}D"));
            return $start->format('Y-m-d');
          }
        ];
    }
}
