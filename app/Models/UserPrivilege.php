<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class UserPrivilege extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = ['user_id', 'privilege'];

    // Available privileges - dynamically supports any privilege string
    // This list is kept for reference but the row-based schema supports any value
    public static $availablePrivileges = [
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

    /**
     * Get privileges as array format for frontend
     */
    public function getPrivilegeAttribute()
    {
        // Return the privilege name if this is a single privilege record
        // For backward compatibility with existing code that expects 'privilege' field
        foreach (self::$availablePrivileges as $priv) {
            if (isset($this->attributes[$priv]) && $this->attributes[$priv] == 1) {
                return $priv;
            }
        }
        return null;
    }

    /**
     * Convert to array format for frontend.
     * Supports both schemas:
     * - Row-based: table has (user_id, privilege) with one row per privilege
     * - Column-based: one row per user with boolean columns per privilege
     */
    public static function getPrivilegesAsArray($userId)
    {
        if (!Schema::hasTable('user_privileges')) {
            return [];
        }

        // Row-based schema: (user_id, privilege) with multiple rows per user
        if (Schema::hasColumn('user_privileges', 'privilege')) {
            return self::where('user_id', $userId)->pluck('privilege')->values()->toArray();
        }

        // Column-based schema: one row per user, boolean columns
        $record = self::where('user_id', $userId)->first();
        if (!$record) {
            return [];
        }

        $privileges = [];
        foreach (self::$availablePrivileges as $priv) {
            if (isset($record->$priv) && $record->$priv == 1) {
                $privileges[] = $priv;
            }
        }
        return $privileges;
    }

    /**
     * Update privileges from array format.
     * Supports row-based (user_id, privilege) or column-based schema.
     */
    public static function updateFromArray($userId, array $privileges)
    {
        if (!Schema::hasTable('user_privileges')) {
            return null;
        }

        // Row-based schema: replace all rows for user
        if (Schema::hasColumn('user_privileges', 'privilege')) {
            self::where('user_id', $userId)->delete();
            foreach ($privileges as $priv) {
                if (is_string($priv) && $priv !== '') {
                    self::create(['user_id' => $userId, 'privilege' => $priv]);
                }
            }
            return null; // Row-based has multiple rows; no single "record"
        }

        // Column-based schema: one row per user
        $updateData = ['user_id' => $userId];
        foreach (self::$availablePrivileges as $priv) {
            $updateData[$priv] = 0;
        }
        foreach ($privileges as $priv) {
            if (in_array($priv, self::$availablePrivileges)) {
                $updateData[$priv] = 1;
            }
        }
        self::upsert($updateData, ['user_id'], array_filter(array_keys($updateData), fn ($k) => $k !== 'user_id'));
        return self::where('user_id', $userId)->first();
    }
}
