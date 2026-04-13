<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class DepartmentKpiTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'department', 'kpi_name', 'target_value', 'target_unit', 
        'status', 'clinic_id', 'created_by'
    ];

    protected $casts = [
        'target_value' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get target value for a specific KPI from the consolidated performance_targets table
     */
    public static function getTarget($department, $kpiName, $clinicId = null)
    {
        // Mapping from descriptive report card names to kpi_id in performance_targets
        $kpiMapping = [
            'Medicine Sales' => 'medicine_sales',
            'Return Patient % (Monthly)' => 'return_patient_percentage',
            'Average Glass Daily Sales' => 'average_glass_daily_sales',
            'Glass Customer Conversion Ratio (Daily)' => 'glass_conversion_ratio',
            'Patient Contact Status' => 'called_contacts',
            'Marketing Glass Leads' => 'marketing_glass_leads',
        ];

        $kpiId = $kpiMapping[$kpiName] ?? str_replace(' ', '_', strtolower($kpiName));

        $target = DB::table('performance_targets')
            ->where('department', strtolower($department))
            ->where('kpi_id', $kpiId)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->value('target');

        // Fallback to internal department_kpi_targets if not found in performance_targets
        if ($target === null) {
            $target = self::where('department', $department)
                ->where('kpi_name', $kpiName)
                ->where('status', 'Active')
                ->when($clinicId, function ($query) use ($clinicId) {
                    $query->where('clinic_id', $clinicId);
                })
                ->value('target_value');
        }

        return [
            'value' => (float) ($target ?? 0),
            'unit' => str_contains(strtolower($kpiName), 'percentage') || str_contains(strtolower($kpiName), '%') ? 'percentage' : (str_contains(strtolower($kpiName), 'sales') ? 'currency' : 'count'),
        ];
    }

    /**
     * Set default targets for all departments
     */
    public static function setDefaultTargets($clinicId = null)
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
                self::updateOrCreate(
                    [
                        'department' => $department,
                        'kpi_name' => $kpiName,
                        'clinic_id' => $clinicId,
                    ],
                    [
                        'target_value' => $targetData['value'],
                        'target_unit' => $targetData['unit'],
                        'status' => 'Active',
                        'created_by' => auth()->id() ?? 1,
                    ]
                );
            }
        }
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
