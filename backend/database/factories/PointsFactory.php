<?php

namespace Database\Factories;

use App\Models\Students;
use App\Models\Transaction;
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

        if($numStudents > 0){
            $receiverId = $studentIds[self::$currentIndex];
            self::$currentIndex = (self::$currentIndex + 1) % $numStudents;

            $transactions = Transaction::where('receiver_id', $receiverId)->get();
            $total_points = $transactions->reduce(function ($carry, $transaction) {
                if ($transaction->operation_type === 'add') {
                    return $carry + $transaction->points;
                } elseif ($transaction->operation_type === 'deduct') {
                    return $carry - $transaction->points;
                }
                return $carry;
            }, 0);

            return [
                'receiver' => $receiverId,
                'total_points' => $total_points,
            ];
        } else{
            return [];
        }
    }
}
