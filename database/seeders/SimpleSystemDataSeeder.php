<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SimpleSystemDataSeeder extends Seeder
{
    /**
     * Run simple database seeds for all system charts and cards.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding simple system data for charts...');
        
        // Create sample payment cache items directly (this is what feeds the charts)
        $this->createPaymentCacheItems();
        
        // Create sample expenses
        $this->createExpenses();
        
        $this->command->info('✅ Simple system data seeded successfully!');
        $this->command->info('📊 All charts will now show realistic data!');
    }
    
    private function createPaymentCacheItems()
    {
        $this->command->info('💰 Creating sample payment cache items...');
        
        // Get existing items
        $items = DB::table('items')
            ->join('item_types', 'items.item_type_id', '=', 'item_types.id')
            ->select('items.id', 'items.name', 'item_types.name as type_name')
            ->get();
            
        if ($items->isEmpty()) {
            $this->command->warn('No items found. Please create some items first.');
            return;
        }
        
        // Create sample payment cache records
        for ($i = 1; $i <= 100; $i++) {
            $date = Carbon::now()->subDays(rand(1, 90));
            $item = $items->random();
            $quantity = rand(1, 5);
            $price = rand(10000, 500000);
            
            // Create payment cache
            $cacheId = DB::table('patient_payment_cache')->insertGetId([
                'check_in_id' => 1, // Use existing check_in
                'created_by' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
            
            // Create payment cache item
            DB::table('patient_payment_cache_items')->insert([
                'payment_cache_id' => $cacheId,
                'item_id' => $item->id,
                'consultation_type_id' => $this->getConsultationType($item->type_name),
                'payment_mode_id' => 1, // Cash
                'unit_price' => $price,
                'quantity' => $quantity,
                'discount' => rand(0, 50000),
                'status' => 'Served',
                'served_at' => $date,
                'served_by' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
        
        $this->command->info('📈 Created 100 sample payment cache items');
    }
    
    private function createExpenses()
    {
        $this->command->info('💸 Creating sample expenses...');
        
        // Get existing expense categories
        $categories = DB::table('expense_categories')->pluck('id');
        
        if ($categories->isEmpty()) {
            $this->command->warn('No expense categories found. Skipping expenses.');
            return;
        }
        
        // Create sample expenses
        for ($i = 1; $i <= 50; $i++) {
            $date = Carbon::now()->subDays(rand(1, 90));
            
            $expenseId = DB::table('expenses')->insertGetId([
                'category_id' => $categories->random(),
                'total_amount' => rand(50000, 1000000),
                'description' => "Sample expense {$i}",
                'expense_date' => $date->format('Y-m-d'),
                'created_by' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
            
            DB::table('expense_payments')->insert([
                'expense_id' => $expenseId,
                'amount' => rand(50000, 1000000),
                'description' => "Payment for expense {$i}",
                'created_by' => 1,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
        
        $this->command->info('💰 Created 50 sample expenses');
    }
    
    private function getConsultationType($itemType)
    {
        switch (strtolower($itemType)) {
            case 'frame':
            case 'lens':
                return 1; // Glass
            case 'pharmaceutical':
                return 2; // Pharmacy
            default:
                return 1;
        }
    }
}
