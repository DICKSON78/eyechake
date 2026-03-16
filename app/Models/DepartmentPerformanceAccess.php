<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentPerformanceAccess extends Model
{
    use HasFactory;

    protected $fillable = [
        'department', 'user_id', 'clinic_id', 'access_level', 'granted_by'
    ];

    protected $casts = [
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

    public function grantedByUser()
    {
        return $this->belongsTo(User::class, 'granted_by');
    }

    /**
     * Check if user has access to department report
     */
    public static function hasAccess($userId, $department, $clinicId = null, $requiredLevel = 'View')
    {
        // Admin users have access to all reports
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        if ($user->is_admin) {
            return true;
        }

        // Map department to privilege name
        $privilegeMap = [
            'Optometry' => 'optometry_report_card',
            'Sales' => 'sales_report_card',
            'CRM' => 'crm_report_card',
        ];

        $requiredPrivilege = $privilegeMap[$department] ?? null;

        if ($requiredPrivilege) {
            $userPrivileges = UserPrivilege::getPrivilegesAsArray($userId);
            if (in_array($requiredPrivilege, $userPrivileges)) {
                return true;
            }
        }

        // Check explicit access table as fallback
        return self::where('user_id', $userId)
            ->where('department', $department)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->where(function ($query) use ($requiredLevel) {
                if ($requiredLevel === 'Edit') {
                    $query->where('access_level', 'Edit');
                } else {
                    $query->whereIn('access_level', ['View', 'Edit']);
                }
            })
            ->exists();
    }

    /**
     * Get departments user has access to
     */
    public static function getUserDepartments($userId, $clinicId = null)
    {
        $user = User::find($userId);
        if (!$user) {
            return [];
        }
        
        // Admin users have access to all departments
        if ($user->is_admin) {
            return ['Optometry', 'Sales', 'CRM'];
        }

        $departments = [];
        $userPrivileges = UserPrivilege::getPrivilegesAsArray($userId);

        $privilegeMap = [
            'optometry_report_card' => 'Optometry',
            'sales_report_card' => 'Sales',
            'crm_report_card' => 'CRM',
        ];

        foreach ($privilegeMap as $privilege => $dept) {
            if (in_array($privilege, $userPrivileges)) {
                $departments[] = $dept;
            }
        }

        // Merge with explicit access from table
        $explicitDepartments = self::where('user_id', $userId)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->distinct()
            ->pluck('department')
            ->toArray();

        return array_unique(array_merge($departments, $explicitDepartments));
    }

    /**
     * Grant access to user for department
     */
    public static function grantAccess($userId, $department, $accessLevel = 'View', $clinicId = null)
    {
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'department' => $department,
                'clinic_id' => $clinicId,
            ],
            [
                'access_level' => $accessLevel,
                'granted_by' => auth()->id() ?? 1,
            ]
        );
    }

    /**
     * Revoke access from user for department
     */
    public static function revokeAccess($userId, $department, $clinicId = null)
    {
        return self::where('user_id', $userId)
            ->where('department', $department)
            ->when($clinicId, function ($query) use ($clinicId) {
                $query->where('clinic_id', $clinicId);
            })
            ->delete();
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }
}
