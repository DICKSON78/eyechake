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
        Schema::create('occupations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->nullable();
            $table->string('name');
            $table->string('description')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->foreign('clinic_id')
                ->references('id')
                ->on('clinics')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->unique(['clinic_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('occupations');
    }
};

