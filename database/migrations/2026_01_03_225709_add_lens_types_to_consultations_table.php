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
        $lensTypesExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'lens_types'
        ");
        
        $doctorRecommendationsExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'doctor_recommendations'
        ");
        
        $doctorCommentsRemarksExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'doctor_comments_remarks'
        ");
        
        $requireGlassExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'require_glass'
        ");
        
        $remarksExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'remarks'
        ");
        
        Schema::table('consultations', function (Blueprint $table) use ($lensTypesExists, $doctorRecommendationsExists, $doctorCommentsRemarksExists, $requireGlassExists, $remarksExists) {
            // Add lens_types column if it doesn't exist
            if (!$lensTypesExists || $lensTypesExists->count == 0) {
                if ($requireGlassExists && $requireGlassExists->count > 0) {
                    $table->text('lens_types')->nullable()->after('require_glass');
                } else {
                    $table->text('lens_types')->nullable();
                }
            }
            
            // Add doctor_recommendations column if it doesn't exist
            if (!$doctorRecommendationsExists || $doctorRecommendationsExists->count == 0) {
                if ($remarksExists && $remarksExists->count > 0) {
                    $table->text('doctor_recommendations')->nullable()->after('remarks');
                } else {
                    $table->text('doctor_recommendations')->nullable();
                }
            }
            
            // Add doctor_comments_remarks column if it doesn't exist
            if (!$doctorCommentsRemarksExists || $doctorCommentsRemarksExists->count == 0) {
                // doctor_recommendations will exist (either already exists or we're adding it above)
                // So we can always use it as reference
                $table->text('doctor_comments_remarks')->nullable()->after('doctor_recommendations');
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
        $lensTypesExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'lens_types'
        ");
        
        $doctorRecommendationsExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'doctor_recommendations'
        ");
        
        $doctorCommentsRemarksExists = DB::selectOne("
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'consultations' 
            AND COLUMN_NAME = 'doctor_comments_remarks'
        ");
        
        $columnsToDrop = [];
        if ($lensTypesExists && $lensTypesExists->count > 0) {
            $columnsToDrop[] = 'lens_types';
        }
        if ($doctorRecommendationsExists && $doctorRecommendationsExists->count > 0) {
            $columnsToDrop[] = 'doctor_recommendations';
        }
        if ($doctorCommentsRemarksExists && $doctorCommentsRemarksExists->count > 0) {
            $columnsToDrop[] = 'doctor_comments_remarks';
        }
        
        if (!empty($columnsToDrop)) {
            Schema::table('consultations', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }
};
