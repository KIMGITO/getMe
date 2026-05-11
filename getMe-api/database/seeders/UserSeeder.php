<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'client user',
            'email' => 'client@test.com',
            'phone' => '0712345678',
            'pin' => '1234'
        ]);
        User::create([
            'name' => 'Rider',
            'email' => 'rider@test.com',
            'phone' => '0702345678',
            'pin' => '1234',
            'role' => 'rider'
        ]);
    }
}
