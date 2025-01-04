<?php

namespace Database\Factories;

use App\Models\Students;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Points>
 */
class PointsFactory extends Factory
{
    private static $currentIndex = 0;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $studentIds = Students::pluck('id')->toArray();
        $numStudents = count($studentIds);

        if(count($studentIds) > 0){
            $receiver = $studentIds[self::$currentIndex];
            self::$currentIndex = (self::$currentIndex + 1) % $numStudents;
            return [
                'receiver' => $receiver,
                'total_points' => $this->faker->numberBetween(50, 300),
            ];
        }
        else{
            return [];
        }
    }
}
