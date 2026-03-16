<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentPerformanceAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'department', 'action', 'old_values', 'new_values', 
        'notes', 'user_id', 'clinic_id'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'clinic_id');
    }

    /**
     * Log an action for audit trail
     */
    public static function logAction($department, $action, $userId, $oldValues = null, $newValues = null, $notes = null, $clinicId = null)
    {
        return self::create([
            'department' => $department,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'notes' => $notes,
            'user_id' => $userId,
            'clinic_id' => $clinicId,
        ]);
    }

    /**
     * Get audit logs for a department
     */
    public static function getDepartmentLogs($department, $clinicId = null, $limit = 50)
    {
        return self::where('department', $department)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
