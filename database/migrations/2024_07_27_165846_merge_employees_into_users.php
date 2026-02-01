<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        // Add columns only if they don't exist
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'first_name')) {
                $table->string('first_name')->after('id');
            }
            if (!Schema::hasColumn('users', 'middle_name')) {
                $after = Schema::hasColumn('users', 'first_name') ? 'first_name' : null;
                if ($after) {
                    $table->string('middle_name')->nullable()->after($after);
                } else {
                    $table->string('middle_name')->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'last_name')) {
                $after = Schema::hasColumn('users', 'middle_name') ? 'middle_name' : 
                         (Schema::hasColumn('users', 'first_name') ? 'first_name' : null);
                if ($after) {
                    $table->string('last_name')->after($after);
                } else {
                    $table->string('last_name');
                }
            }
            if (!Schema::hasColumn('users', 'department_id')) {
                $after = Schema::hasColumn('users', 'last_name') ? 'last_name' : null;
                if ($after) {
                    $table->foreignId('department_id')->nullable()->after($after);
                } else {
                    $table->foreignId('department_id')->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'job_title_id')) {
                $after = Schema::hasColumn('users', 'department_id') ? 'department_id' : null;
                if ($after) {
                    $table->foreignId('job_title_id')->nullable()->after($after);
                } else {
                    $table->foreignId('job_title_id')->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'employee_number')) {
                $after = Schema::hasColumn('users', 'job_title_id') ? 'job_title_id' : null;
                if ($after) {
                    $table->string('employee_number')->nullable()->after($after);
                } else {
                    $table->string('employee_number')->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'date_of_birth')) {
                $after = Schema::hasColumn('users', 'employee_number') ? 'employee_number' : null;
                if ($after) {
                    $table->date('date_of_birth')->nullable()->after($after);
                } else {
                    $table->date('date_of_birth')->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $after = Schema::hasColumn('users', 'date_of_birth') ? 'date_of_birth' : null;
                if ($after) {
                    $table->enum('gender', ['Male', 'Female'])->nullable()->after($after);
                } else {
                    $table->enum('gender', ['Male', 'Female'])->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'national_id')) {
                $after = Schema::hasColumn('users', 'gender') ? 'gender' : null;
                if ($after) {
                    $table->string('national_id')->nullable()->after($after);
                } else {
                    $table->string('national_id')->nullable();
                }
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $after = Schema::hasColumn('users', 'national_id') ? 'national_id' : null;
                if ($after) {
                    $table->string('phone')->nullable()->after($after);
                } else {
                    $table->string('phone')->nullable();
                }
            }
        });

        // Add foreign keys only if they don't exist
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND CONSTRAINT_NAME LIKE '%department_id%'
        ");
        if (empty($foreignKeys) && Schema::hasColumn('users', 'department_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('department_id')
                    ->references('id')
                    ->on('departments')
                    ->cascadeOnUpdate()
                    ->nullOnDelete();
            });
        }

        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users' 
            AND CONSTRAINT_NAME LIKE '%job_title_id%'
        ");
        if (empty($foreignKeys) && Schema::hasColumn('users', 'job_title_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('job_title_id')
                    ->references('id')
                    ->on('job_titles')
                    ->cascadeOnUpdate()
                    ->nullOnDelete();
            });
        }

        // Only proceed with employee merge if employees table exists
        if (Schema::hasTable('employees')) {
            DB::beginTransaction();

            try {
                // Update users from employees table only if employees table has data
                $employeeCount = DB::table('employees')->count();
                if ($employeeCount > 0) {
                    DB::statement('update users as u inner join employees as e on e.user_id = u.id set u.first_name = e.first_name, u.middle_name = e.middle_name, u.last_name = e.last_name, u.department_id = e.department_id, u.job_title_id = e.job_title_id, u.employee_number = e.employee_number, u.date_of_birth = e.date_of_birth, u.gender = e.gender, u.national_id = e.national_id, u.phone = e.phone');
                }

                // Update patient_payment_cache_items foreign key if table exists
                if (Schema::hasTable('patient_payment_cache_items')) {
                    // Try to drop foreign key if it exists (handle different constraint names)
                    try {
                        // Get all foreign keys on consultant_id column
                        $foreignKeys = DB::select("
                            SELECT CONSTRAINT_NAME 
                            FROM information_schema.KEY_COLUMN_USAGE 
                            WHERE TABLE_SCHEMA = DATABASE() 
                            AND TABLE_NAME = 'patient_payment_cache_items' 
                            AND COLUMN_NAME = 'consultant_id'
                            AND CONSTRAINT_NAME LIKE '%foreign%'
                        ");
                        
                        if (!empty($foreignKeys)) {
                            $constraintName = $foreignKeys[0]->CONSTRAINT_NAME;
                            Schema::table('patient_payment_cache_items', function (Blueprint $table) use ($constraintName) {
                                $table->dropForeign($constraintName);
                            });
                        }
                    } catch (\Exception $e) {
                        // Foreign key might not exist or have different name, continue
                        Log::debug('Could not drop foreign key: ' . $e->getMessage());
                    }

                    // Update consultant_id references if employees table has data
                    if ($employeeCount > 0) {
                        DB::statement('update patient_payment_cache_items as ppci inner join employees as e on ppci.consultant_id = e.id set ppci.consultant_id = e.user_id');
                    }

                    // Add foreign key only if it doesn't exist
                    $existingForeignKeys = DB::select("
                        SELECT CONSTRAINT_NAME 
                        FROM information_schema.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = DATABASE() 
                        AND TABLE_NAME = 'patient_payment_cache_items' 
                        AND COLUMN_NAME = 'consultant_id'
                        AND CONSTRAINT_NAME LIKE '%foreign%'
                    ");
                    if (empty($existingForeignKeys) && Schema::hasColumn('patient_payment_cache_items', 'consultant_id')) {
                        try {
                            Schema::table('patient_payment_cache_items', function (Blueprint $table) {
                                $table->foreign('consultant_id')
                                    ->references('id')
                                    ->on('users')
                                    ->cascadeOnUpdate()
                                    ->nullOnDelete();
                            });
                        } catch (\Exception $e) {
                            // Foreign key might already exist, continue
                            Log::debug('Could not add foreign key: ' . $e->getMessage());
                        }
                    }
                }

                // Drop employees table
                DB::statement('drop table if exists employees');

                DB::commit();
            } catch (\Exception $e) {
                Log::debug($e);
                DB::rollBack();
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
