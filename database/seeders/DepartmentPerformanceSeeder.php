<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DepartmentKpiTarget;
use App\Models\DepartmentPerformanceAccess;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DepartmentPerformanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all clinics
        $clinics = DB::table('clinics')->pluck('id');

        foreach ($clinics as $clinicId) {
            // Set default KPI targets for each clinic
            $this->setDefaultTargets($clinicId);
            
            // Grant access to admin users
            $this->grantAdminAccess($clinicId);
        }

        $this->command->info('Department Performance system initialized successfully.');
    }

    /**
     * Set default KPI targets
     */
    private function setDefaultTargets($clinicId)
    {
        $defaultTargets = [
            'Optometry' => [
                'Medicine Sales' => ['value' => 50000, 'unit' => 'currency'],
                'Return Patient % (Monthly)' => ['value' => 30, 'unit' => 'percentage'],
            ],
            'Sales' => [
                'Average Glass Daily Sales' => ['value' => 75000, 'unit' => 'currency'],
                'Glass Customer Conversion Ratio (Daily)' => ['value' => 25, 'unit' => 'percentage'],
            ],
            'CRM' => [
                'Patient Contact Status' => ['value' => 100, 'unit' => 'count'],
                'Marketing Glass Leads' => ['value' => 50, 'unit' => 'count'],
            ],
        ];

        foreach ($defaultTargets as $department => $kpis) {
            foreach ($kpis as $kpiName => $targetData) {
                DepartmentKpiTarget::updateOrCreate(
                    [
                        'department' => $department,
                        'kpi_name' => $kpiName,
                        'clinic_id' => $clinicId,
                    ],
                    [
                        'target_value' => $targetData['value'],
                        'target_unit' => $targetData['unit'],
                        'status' => 'Active',
                        'created_by' => 1, // Default admin user
                    ]
                );
            }
        }
    }

    /**
     * Grant access to admin users
     */
    private function grantAdminAccess($clinicId)
    {
        $adminUsers = User::where('role', 'Admin')
            ->where('clinic_id', $clinicId)
            ->get();

        $departments = ['Optometry', 'Sales', 'CRM'];

        foreach ($adminUsers as $admin) {
            foreach ($departments as $department) {
                DepartmentPerformanceAccess::updateOrCreate(
                    [
                        'user_id' => $admin->id,
                        'department' => $department,
                        'clinic_id' => $clinicId,
                    ],
                    [
                        'access_level' => 'Edit',
                        'granted_by' => 1,
                    ]
                );
            }
        }
    }
}
