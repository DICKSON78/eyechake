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
        Schema::table('patient_check_ins', function (Blueprint $table) {
            $table->enum('mode', ['checkin', 'bill', 'invoice'])->default('checkin')->after('payment_mode_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('patient_check_ins', function (Blueprint $table) {
            $table->dropColumn('mode');
        });
    }
};
