<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FixPrivilegesCommand extends Command
{
    protected $signature = 'privileges:fix {user=admin : The username to fix privileges for}';
    protected $description = 'Fix user privileges for role-based access';

    public function handle()
    {
        $username = $this->argument('user');
        
        // Get user
        $user = DB::table('users')->where('username', $username)->first();
        if (!$user) {
            $this->error("User '{$username}' not found");
            return 1;
        }

        $this->info("Found user: {$user->username} (ID: {$user->id})");

        // Check current privileges
        $currentPrivileges = DB::table('user_privileges')
            ->where('user_id', $user->id)
            ->pluck('privilege')
            ->toArray();

        $this->info("Current privileges count: " . count($currentPrivileges));

        // Define all required privileges
        $allPrivileges = [
            'dashboard',
            'reception',
            'receptionist_monthly_report',
            'payment_center',
            'cashier_monthly_report',
            'consultation_room',
            'optometrist_monthly_report',
            'optician_center',
            'medicine_center',
            'dispensing',
            'other_dispensing',
            'procedure_room',
            'inventory_management',
            'sales_center',
            'sales_manager_monthly_report',
            'financial_management',
            'employee_management',
            'user_management',
            'settings',
            'clear_pending_bill',
            'customer_relationship_management',
            'marketing',
            'marketing_operations_monthly_report',
            'director',
            'office_calendar',
            'calendar_edit',
        ];

        // Clear existing privileges
        DB::table('user_privileges')->where('user_id', $user->id)->delete();

        // Add all privileges for admin
        foreach ($allPrivileges as $privilege) {
            DB::table('user_privileges')->insert([
                'user_id' => $user->id,
                'privilege' => $privilege,
            ]);
        }

        $this->info("User '{$username}' has been granted all " . count($allPrivileges) . " privileges");

        // Verify
        $newPrivileges = DB::table('user_privileges')
            ->where('user_id', $user->id)
            ->pluck('privilege')
            ->toArray();

        $this->info("New privileges count: " . count($newPrivileges));

        return 0;
    }
}
