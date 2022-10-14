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
        Schema::create('patient_payment_cache_items', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('payment_cache_id')->unsigned();
            $table->bigInteger('item_id')->unsigned();
            $table->bigInteger('consultation_type_id')->unsigned();
            $table->bigInteger('consultant_id')->unsigned()->nullable();
            $table->bigInteger('payment_mode_id')->unsigned();
            $table->double('unit_price')->unsigned();
            $table->double('quantity')->unsigned();
            $table->bigInteger('item_payment_id')->unsigned()->nullable();
            $table->bigInteger('bill_id')->unsigned()->nullable();
            $table->timestamp('created_at')->nullable();
            $table->bigInteger('created_by')->unsigned()->nullable();
            $table->text('dosage')->nullable();
            $table->text('comments')->nullable();
            $table->enum('status', ['Pending', 'Paid', 'Billed', 'Served'])->default('Pending');
            $table->bigInteger('served_by')->unsigned()->nullable();
            $table->dateTime('served_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('payment_cache_id')
                ->references('id')
                ->on('patient_payment_cache')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('item_id')
                ->references('id')
                ->on('items')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('consultation_type_id')
                ->references('id')
                ->on('consultation_types')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('consultant_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('payment_mode_id')
                ->references('id')
                ->on('payment_modes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreign('served_by')
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
        Schema::dropIfExists('patient_payment_cache_items');
    }
};
