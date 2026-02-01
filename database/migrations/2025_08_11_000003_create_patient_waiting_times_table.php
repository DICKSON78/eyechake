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
        // Drop table if it exists from a previous failed migration
        // Disable foreign key checks to allow dropping even if constraints exist
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Manually drop the table using raw SQL to ensure complete removal
        if (Schema::hasTable('patient_waiting_times')) {
            DB::statement('DROP TABLE IF EXISTS `patient_waiting_times`');
        }
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create the table with foreign keys
        Schema::create('patient_waiting_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnUpdate()->cascadeOnDelete();
            $table->timestamp('registration_time')->nullable();
            $table->timestamp('treatment_start_time')->nullable();
            $table->timestamp('treatment_end_time')->nullable();
            $table->integer('waiting_duration_minutes')->nullable(); // Auto-calculated
            $table->integer('treatment_duration_minutes')->nullable(); // Auto-calculated
            $table->string('status')->default('waiting'); // waiting, in_treatment, completed
            $table->foreignId('doctor_id')->nullable()->constrained('users')->cascadeOnUpdate()->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'registration_time']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('patient_waiting_times');
    }
};