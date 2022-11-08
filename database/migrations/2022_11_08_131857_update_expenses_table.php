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
        Schema::table('expenses', function (Blueprint $table) {
            $table->double('total_amount')->unsigned()->after('amount');
            $table->double('paid_amount')->unsigned()->default(0)->after('total_amount');
        });

        \Illuminate\Support\Facades\DB::update('update expenses set total_amount = amount where 1');

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('amount');
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
