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
        Schema::create('email_alert_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->boolean('email_alerts_enabled')->default(false);
            $table->string('smtp_host')->nullable();
            $table->string('smtp_port')->nullable();
            $table->string('smtp_username')->nullable();
            $table->string('smtp_password')->nullable();
            $table->enum('smtp_encryption', ['tls', 'ssl', 'none'])->default('tls');
            $table->string('from_email')->nullable();
            $table->string('from_name')->nullable();
            $table->boolean('appointment_notifications')->default(false);
            $table->boolean('patient_registration_notifications')->default(false);
            $table->boolean('consultation_reminders')->default(false);
            $table->boolean('prescription_ready_notifications')->default(false);
            $table->boolean('bill_reminders')->default(false);
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->unique('clinic_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('email_alert_settings');
    }
};

