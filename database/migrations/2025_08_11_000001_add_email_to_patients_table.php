<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        // Check if columns exist using direct database query
        $emailExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'patients' 
            AND COLUMN_NAME = 'email'
        ");
        
        $isVipExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'patients' 
            AND COLUMN_NAME = 'is_vip'
        ");
        
        $phoneExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'patients' 
            AND COLUMN_NAME = 'phone'
        ");
        
        $infoSourceIdExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'patients' 
            AND COLUMN_NAME = 'info_source_id'
        ");
        
        Schema::table('patients', function (Blueprint $table) use ($emailExists, $isVipExists, $phoneExists, $infoSourceIdExists) {
            // Add email column if it doesn't exist
            if (!$emailExists || $emailExists->count == 0) {
                if ($phoneExists && $phoneExists->count > 0) {
                    $table->string('email')->nullable()->after('phone');
                } else {
                    $table->string('email')->nullable();
                }
            }
            
            // Add is_vip column if it doesn't exist
            if (!$isVipExists || $isVipExists->count == 0) {
                if ($infoSourceIdExists && $infoSourceIdExists->count > 0) {
                    $table->boolean('is_vip')->default(false)->after('info_source_id');
                } else {
                    $table->boolean('is_vip')->default(false);
                }
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
        // Check if columns exist before dropping
        $emailExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'patients' 
            AND COLUMN_NAME = 'email'
        ");
        
        $isVipExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'patients' 
            AND COLUMN_NAME = 'is_vip'
        ");
        
        $columnsToDrop = [];
        if ($emailExists && $emailExists->count > 0) {
            $columnsToDrop[] = 'email';
        }
        if ($isVipExists && $isVipExists->count > 0) {
            $columnsToDrop[] = 'is_vip';
        }
        
        if (!empty($columnsToDrop)) {
            Schema::table('patients', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }
};