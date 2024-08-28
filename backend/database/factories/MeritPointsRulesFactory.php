<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MeritPointsRules>
 */
class MeritPointsRulesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
          'name' => $this->faker->word,
          'description' => $this->faker->sentence,
          'points' => $this->faker->numberBetween(1, 10),
          'operation_type' => $this->faker->randomElement(['add', 'deduct']),
        ];
    }
}
