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
        Schema::create('sms_campaign_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sms_campaign_id')->constrained('sms_campaigns')->onDelete('cascade');
            $table->foreignId('patient_id')->nullable()->constrained('patients')->onDelete('cascade');
            $table->string('phone_number');
            $table->string('recipient_name')->nullable();
            $table->enum('status', ['pending', 'sent', 'failed', 'unreachable'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('sms_campaign_id');
            $table->index('patient_id');
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
        Schema::dropIfExists('sms_campaign_recipients');
    }
};

