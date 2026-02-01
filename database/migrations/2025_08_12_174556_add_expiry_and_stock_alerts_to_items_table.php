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
        $expiryDateExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'expiry_date'
        ");
        
        $minimumStockExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'minimum_stock'
        ");
        
        $hasExpiryExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'has_expiry'
        ");
        
        $unitBuyingPriceExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'unit_buying_price'
        ");
        
        Schema::table('items', function (Blueprint $table) use ($expiryDateExists, $minimumStockExists, $hasExpiryExists, $unitBuyingPriceExists) {
            // Add expiry_date column if it doesn't exist
            if (!$expiryDateExists || $expiryDateExists->count == 0) {
                if ($unitBuyingPriceExists && $unitBuyingPriceExists->count > 0) {
                    $table->date('expiry_date')->nullable()->after('unit_buying_price');
                } else {
                    $table->date('expiry_date')->nullable();
                }
            }
            
            // Add minimum_stock column if it doesn't exist
            if (!$minimumStockExists || $minimumStockExists->count == 0) {
                // expiry_date will exist (either already exists or we're adding it above)
                // So we can always use it as reference
                $table->double('minimum_stock')->default(0)->after('expiry_date');
            }
            
            // Add has_expiry column if it doesn't exist
            if (!$hasExpiryExists || $hasExpiryExists->count == 0) {
                // minimum_stock will exist (either already exists or we're adding it above)
                // So we can always use it as reference
                $table->enum('has_expiry', ['Yes', 'No'])->default('No')->after('minimum_stock');
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
        $expiryDateExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'expiry_date'
        ");
        
        $minimumStockExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'minimum_stock'
        ");
        
        $hasExpiryExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'items' 
            AND COLUMN_NAME = 'has_expiry'
        ");
        
        $columnsToDrop = [];
        if ($expiryDateExists && $expiryDateExists->count > 0) {
            $columnsToDrop[] = 'expiry_date';
        }
        if ($minimumStockExists && $minimumStockExists->count > 0) {
            $columnsToDrop[] = 'minimum_stock';
        }
        if ($hasExpiryExists && $hasExpiryExists->count > 0) {
            $columnsToDrop[] = 'has_expiry';
        }
        
        if (!empty($columnsToDrop)) {
            Schema::table('items', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }
};
