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
        Schema::create('patient_item_payments', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('channel_id')->unsigned()->nullable();
            $table->double('amount')->unsigned();
            $table->double('discount')->unsigned()->default(0);
            $table->timestamp('created_at')->nullable();
            $table->bigInteger('created_by')->unsigned()->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('channel_id')
                ->references('id')
                ->on('payment_channels')
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
        Schema::dropIfExists('patient_item_payments');
    }
};
