<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserPrivilege;

class AssignTechUserPrivileges extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tech:assign-privileges';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign all privileges to tech user';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Assigning privileges to tech user...');
        
        $techUser = User::where('username', 'tech')->first();
        
        if (!$techUser) {
            $this->error('Tech user not found! Please run: php artisan db:seed --class=CreateTechUserSeeder');
            return 1;
        }
        
        $this->info("Found tech user: {$techUser->first_name} {$techUser->last_name} (ID: {$techUser->id})");
        
        // Define all possible privileges in the system
        $allPrivileges = [
            'dashboard',
            'reception',
            'medicine_center',
            'optician_center',
            'consultation_room',
            'procedure_room',
            'other_dispensing',
            'marketing',
            'financial_management',
            'payment_center',
            'inventory_management',
            'user_management',
            'settings',
            'patient_management',
            'doctor_management',
            'nurse_management',
            'staff_management',
            'clinic_management',
            'report_management',
            'backup_management',
            'system_administration',
            'data_export',
            'data_import',
            'audit_logs',
            'notification_management',
            'communication_management',
            'research_management',
            'marketing_management',
            'financial_reports',
            'patient_reports',
            'inventory_reports',
            'staff_reports',
            'system_reports',
            'emergency_access',
            'maintenance_mode',
            'database_management',
            'file_management',
            'security_management',
            'compliance_management',
            'quality_assurance',
            'training_management',
        ];
        
        // Clear existing privileges and add all privileges
        UserPrivilege::where('user_id', $techUser->id)->delete();
        $this->info('Cleared existing privileges');
        
        foreach ($allPrivileges as $privilege) {
            UserPrivilege::create([
                'user_id' => $techUser->id,
                'privilege' => $privilege
            ]);
        }
        
        $this->info("✅ Assigned " . count($allPrivileges) . " privileges to tech user");
        
        // Verify
        $privilegeCount = UserPrivilege::where('user_id', $techUser->id)->count();
        $this->info("Total privileges: {$privilegeCount}");
        
        // Check if dashboard privilege exists
        $hasDashboard = UserPrivilege::where('user_id', $techUser->id)
            ->where('privilege', 'dashboard')
            ->exists();
        
        if ($hasDashboard) {
            $this->info("✅ Dashboard privilege confirmed");
        } else {
            $this->error("❌ Dashboard privilege missing!");
        }
        
        return 0;
    }
}

