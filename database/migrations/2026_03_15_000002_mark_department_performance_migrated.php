<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // This migration is just to mark the department performance tables as migrated
        // since they were already created manually
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
