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

    protected $fillable = ['user_id', 'privilege', 'dashboard', 'reception', 'payment_center', 'consultation_room', 'optician_center', 'medicine_center', 'procedure_room', 'inventory_management', 'financial_management', 'employee_management', 'settings', 'clear_pending_bill', 'customer_relationship_management', 'marketing', 'user_management', 'director', 'sales_center'];

    // Available privileges (boolean columns in database when using column-based schema)
    public static $availablePrivileges = [
        'dashboard',
        'reception',
        'payment_center',
        'consultation_room',
        'optician_center',
        'medicine_center',
        'procedure_room',
        'inventory_management',
        'financial_management',
        'employee_management',
        'settings',
        'clear_pending_bill',
        'customer_relationship_management',
        'marketing',
        'user_management',
        'director',
        'sales_center',
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
