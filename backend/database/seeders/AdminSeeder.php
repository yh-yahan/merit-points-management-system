<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin::factory()->count(2)->create();
        $hashed = Hash::make('adminPassword');

        Admin::insert(array(
            'name' => 'admin', 
            'email' => 'adminEmail@example.com', 
            'password' => $hashed
        ));
    }
}
