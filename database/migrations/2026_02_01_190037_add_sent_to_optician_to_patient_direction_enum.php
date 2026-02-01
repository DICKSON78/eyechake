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
        // Modify the patient_direction enum to add 'Sent to Optician' value
        DB::statement("ALTER TABLE consultations MODIFY COLUMN patient_direction ENUM('Direct to Doctor', 'Direct to Optician', 'Sent to Optician') DEFAULT 'Direct to Doctor'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE consultations MODIFY COLUMN patient_direction ENUM('Direct to Doctor', 'Direct to Optician') DEFAULT 'Direct to Doctor'");
    }
};
