<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class MarketingDepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Marketing department
        Department::create([
            'name' => 'Marketing',
            'description' => 'Marketing Department for marketing activities',
            'status' => 'Active',
        ]);
    }
}
