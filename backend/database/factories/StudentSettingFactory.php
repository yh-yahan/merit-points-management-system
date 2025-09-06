<?php

namespace Database\Factories;

use App\Models\Students;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentSetting>
 */
class StudentSettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 'student_id' => Students::inRandomOrder()->value('id'),
            'opt_out_lb' => $this->faker->boolean(),
            'name_preference_lb' => $this->faker->randomElement(['name', 'username']),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
