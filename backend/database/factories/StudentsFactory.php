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
        return [
            'name' => fake()->lastName(), 
            'username' => fake()->userName(), 
            'email' => fake()->unique()->safeEmail(), 
            'password' => Hash::make('student'),
            'stage' => fake()->randomElement(["Year 7", "Year 8", "Year 9", "Year 10"]),
            'stream' => fake()->randomElement(["Science", "Business"]), 
        ];
    }
}
