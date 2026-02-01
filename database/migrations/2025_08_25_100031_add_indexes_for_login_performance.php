<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check if an index exists on a table
     */
    private function indexExists($tableName, $indexName)
    {
        $result = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = ? 
            AND INDEX_NAME = ?
        ", [$tableName, $indexName]);
        
        return $result && $result->count > 0;
    }

    public function up()
    {
        // Add indexes for better login performance
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                // Check and add indexes only if columns exist and index doesn't exist
                if (Schema::hasColumn('users', 'status') && !$this->indexExists('users', 'users_status_index')) {
                    $table->index('status');
                }
                
                if (Schema::hasColumn('users', 'username') && Schema::hasColumn('users', 'status') && 
                    !$this->indexExists('users', 'users_username_status_index')) {
                    $table->index(['username', 'status']);
                }
                
                if (Schema::hasColumn('users', 'department_id') && !$this->indexExists('users', 'users_department_id_index')) {
                    $table->index('department_id');
                }
                
                if (Schema::hasColumn('users', 'job_title_id') && !$this->indexExists('users', 'users_job_title_id_index')) {
                    $table->index('job_title_id');
                }
                
                if (Schema::hasColumn('users', 'clinic_id') && !$this->indexExists('users', 'users_clinic_id_index')) {
                    $table->index('clinic_id');
                }
            });
        }

        // Add indexes for user privileges table
        if (Schema::hasTable('user_privileges')) {
            // Check if columns exist using direct database query
            $userIdExists = DB::selectOne("
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'user_privileges' 
                AND COLUMN_NAME = 'user_id'
            ");
            
            $privilegeExists = DB::selectOne("
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'user_privileges' 
                AND COLUMN_NAME = 'privilege'
            ");
            
            Schema::table('user_privileges', function (Blueprint $table) use ($userIdExists, $privilegeExists) {
                // Check if user_id column exists and index doesn't exist
                if (($userIdExists && $userIdExists->count > 0) && !$this->indexExists('user_privileges', 'user_privileges_user_id_index')) {
                    $table->index('user_id');
                }
                
                // Check if both user_id and privilege columns exist before creating composite index
                if (($userIdExists && $userIdExists->count > 0) && ($privilegeExists && $privilegeExists->count > 0) &&
                    !$this->indexExists('user_privileges', 'user_privileges_user_id_privilege_index')) {
                    $table->index(['user_id', 'privilege']);
                }
            });
        }

        // Add indexes for preferences table
        if (Schema::hasTable('preferences')) {
            Schema::table('preferences', function (Blueprint $table) {
                // Check if clinic_id column exists and index doesn't exist
                if (Schema::hasColumn('preferences', 'clinic_id') && !$this->indexExists('preferences', 'preferences_clinic_id_index')) {
                    $table->index('clinic_id');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove indexes only if they exist
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                try {
                    if (Schema::hasColumn('users', 'status')) {
                        $table->dropIndex(['status']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
                
                try {
                    if (Schema::hasColumn('users', 'username') && Schema::hasColumn('users', 'status')) {
                        $table->dropIndex(['username', 'status']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
                
                try {
                    if (Schema::hasColumn('users', 'department_id')) {
                        $table->dropIndex(['department_id']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
                
                try {
                    if (Schema::hasColumn('users', 'job_title_id')) {
                        $table->dropIndex(['job_title_id']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
                
                try {
                    if (Schema::hasColumn('users', 'clinic_id')) {
                        $table->dropIndex(['clinic_id']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            });
        }

        if (Schema::hasTable('user_privileges')) {
            Schema::table('user_privileges', function (Blueprint $table) {
                try {
                    if (Schema::hasColumn('user_privileges', 'user_id')) {
                        $table->dropIndex(['user_id']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
                
                try {
                    if (Schema::hasColumn('user_privileges', 'user_id') && Schema::hasColumn('user_privileges', 'privilege')) {
                        $table->dropIndex(['user_id', 'privilege']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            });
        }

        if (Schema::hasTable('preferences')) {
            Schema::table('preferences', function (Blueprint $table) {
                try {
                    if (Schema::hasColumn('preferences', 'clinic_id')) {
                        $table->dropIndex(['clinic_id']);
                    }
                } catch (\Exception $e) {
                    // Index might not exist, continue
                }
            });
        }
    }
};
