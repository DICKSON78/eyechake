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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id');
            $table->foreignId('patient_id');
            $table->string('referred_to_name'); // Doctor/Specialist/Facility name
            $table->string('referred_to_type')->nullable(); // Doctor, Specialist, Facility, Hospital, etc.
            $table->text('referral_reason')->nullable();
            $table->text('clinical_summary')->nullable(); // Brief clinical summary for referral
            $table->enum('status', ['Pending', 'Sent', 'Acknowledged', 'Completed'])->default('Pending');
            $table->date('referral_date')->nullable();
            $table->date('appointment_date')->nullable(); // If appointment is scheduled
            $table->text('notes')->nullable(); // Additional notes
            $table->foreignId('created_by')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('consultation_id')
                ->references('id')
                ->on('consultations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('referrals');
    }
};
