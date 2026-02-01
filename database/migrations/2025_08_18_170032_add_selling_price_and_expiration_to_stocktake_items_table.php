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
        Schema::table('stocktake_items', function (Blueprint $table) {
            if (!Schema::hasColumn('stocktake_items', 'selling_price')) {
                $table->double('selling_price')->unsigned()->nullable();
            }
            if (!Schema::hasColumn('stocktake_items', 'expiration_date')) {
                $table->date('expiration_date')->nullable();
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
        Schema::table('stocktake_items', function (Blueprint $table) {
            $table->dropColumn(['selling_price', 'expiration_date']);
        });
    }
};
