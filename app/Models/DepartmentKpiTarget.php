<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
     * Get target value for a specific KPI
     */
    public static function getTarget($department, $kpiName, $clinicId = null)
    {
        $target = self::where('department', $department)
            ->where('kpi_name', $kpiName)
            ->where('status', 'Active')
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->first();

        return $target ? [
            'value' => (float) $target->target_value,
            'unit' => $target->target_unit,
        ] : [
            'value' => 0,
            'unit' => 'currency',
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
