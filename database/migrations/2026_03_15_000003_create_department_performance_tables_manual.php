<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create department performance tables if they don't exist
        if (!Schema::hasTable('department_performance_reports')) {
            Schema::create('department_performance_reports', function (Blueprint $table) {
                $table->id();
                $table->string('department', 50);
                $table->string('report_name', 100);
                $table->date('report_date');
                $table->json('kpi_data');
                $table->text('summary')->nullable();
                $table->text('recommendations')->nullable();
                $table->enum('status', ['Active', 'Archived'])->default('Active');
                $table->foreignId('clinic_id')->nullable()->constrained('clinics')->onDelete('cascade');
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->timestamps();
                $table->index(['department', 'report_date', 'clinic_id'], 'dept_perf_reports_dept_date_clinic');
                $table->index(['status', 'report_date'], 'dept_perf_reports_status_date');
            });
        }

        if (!Schema::hasTable('department_kpi_targets')) {
            Schema::create('department_kpi_targets', function (Blueprint $table) {
                $table->id();
                $table->string('department', 50);
                $table->string('kpi_name', 100);
                $table->decimal('target_value', 15, 2);
                $table->string('target_unit', 20)->nullable();
                $table->enum('status', ['Active', 'Inactive'])->default('Active');
                $table->foreignId('clinic_id')->nullable()->constrained('clinics')->onDelete('cascade');
                $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
                $table->timestamps();
                $table->unique(['department', 'kpi_name', 'clinic_id'], 'dept_kpi_targets_dept_kpi_clinic');
                $table->index(['department', 'status'], 'dept_kpi_targets_dept_status');
            });
        }

        if (!Schema::hasTable('department_performance_access')) {
            Schema::create('department_performance_access', function (Blueprint $table) {
                $table->id();
                $table->string('department', 50);
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('clinic_id')->nullable()->constrained('clinics')->onDelete('cascade');
                $table->enum('access_level', ['View', 'Edit'])->default('View');
                $table->foreignId('granted_by')->constrained('users')->onDelete('cascade');
                $table->timestamps();
                $table->unique(['department', 'user_id', 'clinic_id'], 'dept_perf_access_dept_user_clinic');
                $table->index(['department', 'access_level'], 'dept_perf_access_dept_level');
            });
        }

        if (!Schema::hasTable('department_performance_audit_logs')) {
            Schema::create('department_performance_audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('department', 50);
                $table->string('action', 50);
                $table->json('old_values')->nullable();
                $table->json('new_values')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('clinic_id')->nullable()->constrained('clinics')->onDelete('cascade');
                $table->timestamps();
                $table->index(['department', 'action', 'created_at'], 'dept_audit_logs_dept_action_date');
                $table->index(['user_id', 'created_at'], 'dept_audit_logs_user_date');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('department_performance_audit_logs');
        Schema::dropIfExists('department_performance_access');
        Schema::dropIfExists('department_kpi_targets');
        Schema::dropIfExists('department_performance_reports');
    }
};
