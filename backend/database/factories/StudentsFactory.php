<?php

namespace Database\Factories;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class StudentsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
      $startDate = new \DateTime('2022-01-01');
      $endDate = new \DateTime('2025-12-31');

      $randomDate = $this->faker->dateTimeBetween($startDate, $endDate)->format('Y-m-d');

      return [
          'name' => $this->faker->lastName(), 
          'username' => $this->faker->userName(), 
          'email' => $this->faker->unique()->safeEmail(), 
          'password' => Hash::make('studentPassword'),
          'class' => $this->faker->randomElement(["Year 7B", "Year 8A", "Year 9", "Year 10"]),
          'stream' => $this->faker->randomElement(["Science", "Business", "Art"]), 
          'status' => $this->faker->randomElement(["active", "inactive", "graduated"]), 
          'date_joined' => $randomDate,
      ];
    }
}
