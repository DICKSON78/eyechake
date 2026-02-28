<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration populates unit_buying_price for items that don't have one,
     * based on average transaction selling price with appropriate margins.
     *
     * @return void
     */
    public function up()
    {
        // For consultation items (consultation_type_id = 4), set buying price to 0
        // These are services with no material cost
        DB::statement("
            UPDATE items 
            SET unit_buying_price = 0 
            WHERE unit_buying_price IS NULL 
            AND consultation_type_id = 4
        ");

        // For pharmacy items (consultation_type_id = 1), estimate 50% of average selling price
        DB::statement("
            UPDATE items i
            SET unit_buying_price = (
                SELECT ROUND(AVG(ppci.unit_price) * 0.5, 0)
                FROM patient_payment_cache_items ppci
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
            WHERE i.unit_buying_price IS NULL 
            AND i.consultation_type_id = 1
            AND EXISTS (
                SELECT 1 FROM patient_payment_cache_items ppci 
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
        ");

        // For glass items (consultation_type_id = 2), estimate 40% of average selling price
        // Glass typically has higher markup
        DB::statement("
            UPDATE items i
            SET unit_buying_price = (
                SELECT ROUND(AVG(ppci.unit_price) * 0.4, 0)
                FROM patient_payment_cache_items ppci
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
            WHERE i.unit_buying_price IS NULL 
            AND i.consultation_type_id = 2
            AND EXISTS (
                SELECT 1 FROM patient_payment_cache_items ppci 
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
        ");

        // For frames (item_type_id = 4), estimate 50% of average selling price
        DB::statement("
            UPDATE items i
            SET unit_buying_price = (
                SELECT ROUND(AVG(ppci.unit_price) * 0.5, 0)
                FROM patient_payment_cache_items ppci
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
            WHERE i.unit_buying_price IS NULL 
            AND i.item_type_id = 4
            AND EXISTS (
                SELECT 1 FROM patient_payment_cache_items ppci 
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
        ");

        // For procedure items (consultation_type_id = 3), estimate 30% of average selling price
        // Procedures have high labor component
        DB::statement("
            UPDATE items i
            SET unit_buying_price = (
                SELECT ROUND(AVG(ppci.unit_price) * 0.3, 0)
                FROM patient_payment_cache_items ppci
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
            WHERE i.unit_buying_price IS NULL 
            AND i.consultation_type_id = 3
            AND EXISTS (
                SELECT 1 FROM patient_payment_cache_items ppci 
                WHERE ppci.item_id = i.id AND ppci.status = 'Served'
            )
        ");

        // For any remaining items with no transactions, set to 0
        DB::statement("
            UPDATE items 
            SET unit_buying_price = 0 
            WHERE unit_buying_price IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Note: This will reset all estimated buying prices to NULL
        // Only use this if you want to re-run the estimation
        // DB::statement("UPDATE items SET unit_buying_price = NULL WHERE unit_buying_price IS NOT NULL");
    }
};
