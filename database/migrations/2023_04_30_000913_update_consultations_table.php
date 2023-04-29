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
        Schema::table('consultations', function (Blueprint $table) {
            $table->text('general_health')->nullable()->after('family_history');
            $table->text('family_ocular_history')->nullable()->after('general_health');
            $table->text('family_general_history')->nullable()->after('family_ocular_history');
            $table->text('pupils')->nullable()->after('family_general_history');
            $table->text('extra_ocular_muscles')->nullable()->after('pupils');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
