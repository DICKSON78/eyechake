<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
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
     * Detect whether the live DB uses row-based (user_id, privilege) or
     * column-based (one boolean column per privilege) schema.
     *
     * Uses information_schema directly to bypass Doctrine DBAL schema caching,
     * which can incorrectly report column existence after a DB restore.
     * Result is cached in a static variable for the request lifetime.
     */
    private static function isRowBasedSchema(): bool
    {
        static $result = null;
        if ($result !== null) {
            return $result;
        }
        try {
            $row = DB::selectOne("
                SELECT COUNT(*) as cnt
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME   = 'user_privileges'
                  AND COLUMN_NAME  = 'privilege'
            ");
            $result = $row && ((int) $row->cnt) > 0;
        } catch (\Exception $e) {
            $result = false;
        }
        return $result;
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
        if (self::isRowBasedSchema()) {
            return DB::table('user_privileges')
                ->where('user_id', $userId)
                ->pluck('privilege')
                ->values()
                ->toArray();
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
        if (self::isRowBasedSchema()) {
            self::where('user_id', $userId)->delete();
            foreach ($privileges as $priv) {
                if (is_string($priv) && $priv !== '') {
                    // Use insert() directly to avoid Eloquent's broken PK assumption
                    // (primaryKey = 'user_id' conflicts with multi-row row-based schema)
                    \Illuminate\Support\Facades\DB::table('user_privileges')->insert([
                        'user_id'   => $userId,
                        'privilege' => $priv,
                    ]);
                }
            }
            return null;
        }

        // Column-based schema: one row per user
        static $cachedColumns = null;

        if ($cachedColumns === null) {
            $cachedColumns = array_values(array_filter(
                Schema::getColumnListing('user_privileges'),
                fn ($column) => $column !== 'user_id'
            ));
        }

        if (empty($cachedColumns)) {
            return null;
        }

        $updateData = ['user_id' => $userId];

        foreach ($cachedColumns as $column) {
            $updateData[$column] = 0;
        }

        foreach ($privileges as $priv) {
            if (in_array($priv, $cachedColumns, true)) {
                $updateData[$priv] = 1;
            }
        }

        $columnsToUpdate = array_values(array_filter(
            array_keys($updateData),
            fn ($column) => $column !== 'user_id'
        ));

        self::upsert([$updateData], ['user_id'], $columnsToUpdate);

        return self::where('user_id', $userId)->first();
    }
}
