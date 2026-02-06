<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Cleanup ALL pending items and stale waiting times to reset notification counts to zero.
     */
    public function up(): void
    {
        \Log::info('Starting notification cleanup - clearing ALL notifications');

        // 1. Mark ALL pending payment cache items as "Cancelled"
        $updatedItems = DB::table('patient_payment_cache_items')
            ->whereIn('status', ['Pending', 'Billed'])
            ->whereNull('item_payment_id')
            ->update([
                'status' => 'Cancelled',
                'updated_at' => now()
            ]);
        \Log::info("Cancelled {$updatedItems} pending payment cache items");

        // 2. Mark ALL waiting patients as "completed"
        $updatedWaiting = DB::table('patient_waiting_times')
            ->whereIn('status', ['waiting', 'in_treatment'])
            ->update([
                'status' => 'completed',
                'updated_at' => now()
            ]);
        \Log::info("Completed {$updatedWaiting} waiting time records");

        // 3. Update ALL "Pending" consultations to "Consulted"
        $updatedConsultations = DB::table('consultations')
            ->where('status', 'Pending')
            ->update([
                'status' => 'Consulted',
                'updated_at' => now()
            ]);
        \Log::info("Updated {$updatedConsultations} pending consultations");

        // 4. Insert diseases from JSON file
        $diseasesJson = file_get_contents(base_path('diseases_from_sql.json'));
        $diseases = json_decode($diseasesJson, true);
        
        if ($diseases && is_array($diseases)) {
            // Prepare diseases for insertion (remove id, add timestamps)
            $diseasesData = array_map(function($disease) {
                return [
                    'name' => $disease['name'],
                    'code' => $disease['code'],
                    'status' => $disease['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }, $diseases);
            
            // Insert in chunks to avoid memory issues
            $chunks = array_chunk($diseasesData, 100);
            $totalInserted = 0;
            
            foreach ($chunks as $chunk) {
                DB::table('diseases')->insert($chunk);
                $totalInserted += count($chunk);
            }
            
            \Log::info("Inserted {$totalInserted} diseases into diseases table");
        }

        // 5. Clear notification cache
        cache()->flush();
        \Log::info('Notification cache cleared');

        // 6. Log summary
        \Log::info('Notification cleanup completed', [
            'items_cancelled' => $updatedItems,
            'waiting_times_completed' => $updatedWaiting,
            'consultations_updated' => $updatedConsultations,
            'diseases_inserted' => $totalInserted ?? 0
        ]);
    }

    /**
     * Reverse the migrations (optional - marks items back as pending).
     */
    public function down(): void
    {
        // Cannot reliably reverse this operation
        \Log::warning('Notification cleanup migration cannot be reversed');
    }
};
