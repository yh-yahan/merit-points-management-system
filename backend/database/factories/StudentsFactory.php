<?php

namespace Database\Factories;

use App\Models\StudentClass;
use App\Models\StudentStream;
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
    $endDate = new \DateTime('2025-09-01');

    $randomDate = $this->faker->dateTimeBetween($startDate, $endDate)->format('Y-m-d');

    return [
      'name' => $this->faker->lastName(),
      'username' => $this->faker->userName(),
      'email' => $this->faker->unique()->safeEmail(),
      'password' => Hash::make('studentPassword'),
      'class' => StudentClass::inRandomOrder()->value('class'),
      'stream' => StudentStream::inRandomOrder()->value('stream'),
      'status' => $this->faker->randomElement(["Active", "Inactive", "Graduated"]),
      'date_joined' => $randomDate,
    ];
  }
}
