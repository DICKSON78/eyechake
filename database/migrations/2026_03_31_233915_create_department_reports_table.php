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
        Schema::create('department_reports', function (Blueprint $table) {
            $table->id();
            $table->string('department'); // sales, crm, optometry
            $table->date('date'); // Report date
            $table->text('remarks')->nullable(); // Admin/Director remarks
            $table->text('recommendations')->nullable(); // Admin/Director recommendations
            $table->unsignedBigInteger('updated_by')->nullable(); // Who updated
            $table->timestamps();
            
            // Indexes
            $table->index(['department', 'date']);
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('department_reports');
    }
};
