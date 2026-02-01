<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        if (Schema::hasTable('employee_reports')) {
            // Table already exists, just add missing columns
            Schema::table('employee_reports', function (Blueprint $table) {
                if (!Schema::hasColumn('employee_reports', 'clinic_id')) {
                    $table->foreignId('clinic_id')->nullable()->after('id');
                }
                if (!Schema::hasColumn('employee_reports', 'employee_id')) {
                    $table->foreignId('employee_id')->after('clinic_id');
                }
                // Add other columns as needed...
            });
            return;
        }
        
        Schema::create('employee_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->foreignId('employee_id'); // The employee who created the report
            $table->enum('report_type', ['Daily', 'Weekly', 'Monthly'])->default('Daily');
            $table->date('report_date'); // For daily reports, this is the date. For weekly/monthly, it's the start date
            $table->date('end_date')->nullable(); // For weekly/monthly reports
            $table->text('activities_completed')->nullable(); // What activities were completed
            $table->text('achievements')->nullable(); // Achievements during the period
            $table->text('challenges_faced')->nullable(); // Challenges encountered
            $table->text('tasks_pending')->nullable(); // Pending tasks
            $table->text('next_period_plans')->nullable(); // Plans for next period
            $table->text('additional_notes')->nullable(); // Any additional notes
            $table->enum('status', ['Draft', 'Submitted', 'Approved', 'Rejected'])->default('Draft');
            $table->foreignId('submitted_by')->nullable(); // Employee who submitted
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('approved_by')->nullable(); // Manager who approved
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable(); // Manager who rejected
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable(); // Reason for rejection
            $table->text('manager_comments')->nullable(); // Manager's comments
            $table->foreignId('created_by')->nullable();
            $table->foreignId('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('employee_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreign('submitted_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('approved_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('rejected_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->foreign('updated_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->index(['employee_id', 'report_type', 'report_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('employee_reports');
    }
};

