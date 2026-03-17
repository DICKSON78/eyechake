<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\Patient;
use App\Models\PatientItem;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryDashboardTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding inventory dashboard test data...');
        
        // Get existing frames and medicines
        $frames = DB::table('items')
            ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
            ->where('item_types.name', 'Frame')
            ->select('items.id', 'items.name')
            ->limit(15)
            ->get();
            
        $medicines = DB::table('items')
            ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
            ->where('item_types.name', 'Pharmaceutical')
            ->select('items.id', 'items.name')
            ->limit(15)
            ->get();

        if ($frames->isEmpty()) {
            $this->command->warn('No frames found. Please ensure you have frames in your items table.');
            return;
        }
        
        if ($medicines->isEmpty()) {
            $this->command->warn('No medicines found. Please ensure you have medicines in your items table.');
            return;
        }

        // Create sample payment cache records for the last 30 days
        $this->createSampleSales($frames, $medicines);
        
        $this->command->info('✅ Inventory dashboard test data seeded successfully!');
        $this->command->info('📊 Pie charts will now show realistic data');
    }
    
    private function createSampleSales($frames, $medicines)
    {
        // Create sample patients if needed
        $patients = DB::table('patients')->limit(20)->get();
        if ($patients->isEmpty()) {
            $this->command->warn('No patients found. Creating sample patients...');
            for ($i = 1; $i <= 10; $i++) {
                DB::table('patients')->insert([
                    'first_name' => "Test Patient {$i}",
                    'last_name' => "Sample",
                    'phone' => "2551234567" . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'email' => "test{$i}@example.com",
                    'gender' => $i % 2 === 0 ? 'Male' : 'Female',
                    'date_of_birth' => Carbon::now()->subYears(25 + $i * 2),
                    'status' => 'Active',
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                    'updated_at' => Carbon::now(),
                ]);
            }
            $patients = DB::table('patients')->limit(10)->get();
        }

        // Create sample sales data for the last 30 days
        $paymentCacheId = 1;
        
        foreach (range(1, 30) as $day) {
            $date = Carbon::now()->subDays($day);
            $dailySales = rand(5, 15); // 5-15 sales per day
            
            for ($i = 1; $i <= $dailySales; $i++) {
                $patient = $patients->random();
                $isFrame = rand(1, 2) === 1; // 50% frames, 50% medicines
                
                $item = $isFrame ? $frames->random() : $medicines->random();
                $quantity = rand(1, 3);
                $price = rand(50000, 500000); // 50,000 - 500,000 TZS
                
                // Create payment cache
                $cacheId = DB::table('patient_payment_cache')->insertGetId([
                    'check_in_id' => 1, // Using a default check_in_id
                    'consultation_id' => null,
                    'created_by' => 1, // Assuming user ID 1 exists
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
                
                // Create payment cache item
                DB::table('patient_payment_cache_items')->insert([
                    'payment_cache_id' => $cacheId,
                    'item_id' => $item->id,
                    'consultation_type_id' => $isFrame ? 1 : 2, // 1 for Glass, 2 for Pharmacy
                    'payment_mode_id' => 1, // Cash payment mode
                    'unit_price' => $price,
                    'quantity' => $quantity,
                    'discount' => 0,
                    'status' => 'Served',
                    'served_at' => $date,
                    'served_by' => 1,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
        
        $this->command->info("📈 Created sample sales data for the last 30 days");
    }
}
