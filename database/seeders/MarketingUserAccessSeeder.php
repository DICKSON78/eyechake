<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Department;
use App\Models\UserPrivilege;

class MarketingUserAccessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get marketing department
        $marketingDept = Department::where('name', 'Marketing')->first();
        
        if ($marketingDept) {
            // Get all users who should have marketing access
            $marketingUsers = User::where('designation', 'Marketing Officer')->get();
            
            foreach ($marketingUsers as $user) {
                // Grant employee_management privilege which includes marketing access
                UserPrivilege::create([
                    'user_id' => $user->id,
                    'employee_management' => 1,
                    'dashboard' => 0,
                    'reception' => 0,
                    'payment_center' => 0,
                    'consultation_room' => 0,
                    'optician_center' => 0,
                    'medicine_center' => 0,
                    'procedure_room' => 0,
                    'inventory_management' => 0,
                    'financial_management' => 0,
                    'settings' => 0,
                    'clear_pending_bill' => 0,
                    'customer_relationship_management' => 0,
                ]);
            }
        }
    }
}
