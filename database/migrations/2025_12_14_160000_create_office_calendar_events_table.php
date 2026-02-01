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
        Schema::create('office_calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date')->nullable();
            $table->string('location')->nullable();
            $table->string('color', 7)->default('#1976d2'); // Hex color for calendar display
            $table->enum('event_type', [
                'Meeting',
                'Appointment',
                'Deadline',
                'Task',
                'Reminder',
                'Other'
            ])->default('Other');
            $table->enum('reminder_type', [
                'None',
                '15_minutes',
                '30_minutes',
                '1_hour',
                '2_hours',
                '1_day',
                '2_days',
                '1_week'
            ])->default('None');
            $table->dateTime('reminder_time')->nullable();
            $table->boolean('reminder_sent')->default(false);
            $table->boolean('is_all_day')->default(false);
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_pattern')->nullable(); // daily, weekly, monthly, yearly
            $table->date('recurring_end_date')->nullable();
            $table->enum('status', ['Active', 'Cancelled', 'Completed'])->default('Active');
            $table->foreignId('created_by')->nullable();
            $table->foreignId('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
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

            $table->index(['start_date', 'end_date']);
            $table->index('reminder_time');
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
        Schema::dropIfExists('office_calendar_events');
    }
};

