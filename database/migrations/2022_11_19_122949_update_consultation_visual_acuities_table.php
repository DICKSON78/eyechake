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
        Schema::table('consultation_visual_acuities', function (Blueprint $table) {
            $table->dropColumn('re_lens');
            $table->string('aided_re_va_description')->nullable()->after('aided_re_va');
            $table->string('aided_le_va_description')->nullable()->after('aided_le_va');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
};
