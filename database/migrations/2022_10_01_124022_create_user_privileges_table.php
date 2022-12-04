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
        Schema::create('user_privileges', function (Blueprint $table) {
            $table->foreignId('user_id')->primary();
            $table->boolean('dashboard')->default(0);
            $table->boolean('reception')->default(0);
            $table->boolean('payment_center')->default(0);
            $table->boolean('consultation_room')->default(0);
            $table->boolean('optician_center')->default(0);
            $table->boolean('medicine_center')->default(0);
            $table->boolean('procedure_room')->default(0);
            $table->boolean('inventory_management')->default(0);
            $table->boolean('financial_management')->default(0);
            $table->boolean('employee_management')->default(0);
            $table->boolean('settings')->default(0);

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_privileges');
    }
};
