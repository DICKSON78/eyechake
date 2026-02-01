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
        // Check if users table exists before trying to alter it
        if (Schema::hasTable('users')) {
            // Check if email column already exists
            if (!Schema::hasColumn('users', 'email')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('email')->nullable()->after('phone');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }
};