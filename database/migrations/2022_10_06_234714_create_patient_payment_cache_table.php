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
        Schema::create('patient_payment_cache', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('check_in_id')->unsigned();
            $table->bigInteger('consultation_id')->unsigned()->nullable(); // if items were ordered from consultation
            $table->timestamp('created_at')->nullable();
            $table->bigInteger('created_by')->unsigned()->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('check_in_id')
                ->references('id')
                ->on('patient_check_ins')
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
        Schema::dropIfExists('patient_payment_cache');
    }
};
