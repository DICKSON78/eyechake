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
        // Check if role column exists using direct database query
        $roleExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'role'
        ");
        
        if (!$roleExists || $roleExists->count == 0) {
            // Determine where to place the column using direct database query
            $rememberTokenExists = DB::selectOne("
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = 'remember_token'
            ");
            
            $passwordExists = DB::selectOne("
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = 'password'
            ");
            
            $usernameExists = DB::selectOne("
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'users' 
                AND COLUMN_NAME = 'username'
            ");
            
            Schema::table('users', function (Blueprint $table) use ($rememberTokenExists, $passwordExists, $usernameExists) {
                // Determine where to place the column
                if ($rememberTokenExists && $rememberTokenExists->count > 0) {
                    $table->enum('role', ['Admin', 'Client'])->default('Client')->after('remember_token');
                } elseif ($passwordExists && $passwordExists->count > 0) {
                    $table->enum('role', ['Admin', 'Client'])->default('Client')->after('password');
                } elseif ($usernameExists && $usernameExists->count > 0) {
                    $table->enum('role', ['Admin', 'Client'])->default('Client')->after('username');
                } else {
                    // Just add it without after clause if we can't find a reference column
                    $table->enum('role', ['Admin', 'Client'])->default('Client');
                }
            });
        }

        // Update admin user role if users table and columns exist
        $roleColumnExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'role'
        ");
        
        $usernameColumnExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'username'
        ");
        
        if (($roleColumnExists && $roleColumnExists->count > 0) && 
            ($usernameColumnExists && $usernameColumnExists->count > 0)) {
            try {
                DB::statement('update users set role = ? where username = ?', ['Admin', 'admin']);
            } catch (\Exception $e) {
                // User might not exist or update might fail, continue
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
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }
};
