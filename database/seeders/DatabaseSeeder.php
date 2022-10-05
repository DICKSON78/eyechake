<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\ConsultationType;
use App\Models\ItemType;
use App\Models\JobTitle;
use App\Models\PaymentMode;
use App\Models\UnitOfMeasure;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        $now = Carbon::now()->toDateTimeString();

        JobTitle::insert([
            ['name' => 'Receptionist', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Doctor', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cashier', 'created_at' => $now, 'updated_at' => $now],
        ]);

        User::insert([
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'username' => 'admin',
            'password' => Hash::make('1234'),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        ConsultationType::insert([
            ['name' => 'Pharmacy', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Glass', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Procedure', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'created_at' => $now, 'updated_at' => $now],
        ]);

        PaymentMode::insert(['name' => 'Cash', 'created_at' => $now, 'updated_at' => $now]);

        UnitOfMeasure::insert([
            ['name' => 'mg', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Btl', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PC', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Drops', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tube', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kit', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Box', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ltr', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cap', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tin', 'created_at' => $now, 'updated_at' => $now],
        ]);

        ItemType::insert([
            ['name' => 'Service', 'description' => 'Serviced Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pharmaceutical', 'description' => 'Pharmaceutical and Consumable Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Lens', 'description' => 'Lens Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Frame', 'description' => 'Frame Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'description' => 'Other Item', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
