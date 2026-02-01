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
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'is_student')) {
                $table->boolean('is_student')->default(false);
            }
            if (!Schema::hasColumn('patients', 'is_businessperson')) {
                $table->boolean('is_businessperson')->default(false);
            }
            if (!Schema::hasColumn('patients', 'is_outreach')) {
                $table->boolean('is_outreach')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['is_student', 'is_businessperson', 'is_outreach']);
        });
    }
};

