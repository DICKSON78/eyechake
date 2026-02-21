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
            if (!Schema::hasColumn('expenses', 'running_cost')) {
                $table->boolean('running_cost')->default(false)->after('description');
            }
            if (!Schema::hasColumn('expenses', 'improvement_cost')) {
                $table->boolean('improvement_cost')->default(false)->after('running_cost');
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
        Schema::table('expenses', function (Blueprint $table) {
            if (Schema::hasColumn('expenses', 'improvement_cost')) {
                $table->dropColumn('improvement_cost');
            }
            if (Schema::hasColumn('expenses', 'running_cost')) {
                $table->dropColumn('running_cost');
            }
        });
    }
};
