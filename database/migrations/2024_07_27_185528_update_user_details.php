<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Update admin user details if users table and columns exist
        if (Schema::hasTable('users') && 
            Schema::hasColumn('users', 'first_name') && 
            Schema::hasColumn('users', 'last_name') && 
            Schema::hasColumn('users', 'username')) {
            try {
                DB::statement('update users set first_name = ?, last_name = ? where username = ?', ['Admin', 'Admin', 'admin']);
            } catch (\Exception $e) {
                // User might not exist or update might fail, continue
            }
        }

        // Update user_privileges if table and column exist
        if (Schema::hasTable('user_privileges')) {
            try {
                // Check if privilege column exists using information_schema
                $columnExists = DB::selectOne("
                    SELECT COUNT(*) as count 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'user_privileges' 
                    AND COLUMN_NAME = 'privilege'
                ");
                
                if ($columnExists && $columnExists->count > 0) {
                    // Check if there are any records with the old privilege value
                    $count = DB::selectOne("
                        SELECT COUNT(*) as count 
                        FROM user_privileges 
                        WHERE privilege = ?
                    ", ['employee_management']);
                    
                    if ($count && $count->count > 0) {
                        DB::statement('update user_privileges set privilege = ? where privilege = ?', ['user_management', 'employee_management']);
                    }
                }
            } catch (\Exception $e) {
                // Column might not exist or update might fail, continue silently
                // This is expected if the column doesn't exist in the imported database
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
