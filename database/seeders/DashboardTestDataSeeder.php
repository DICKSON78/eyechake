<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardTestDataSeeder extends Seeder
{
    /**
     * Run database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding dashboard test data...');
        
        // Create sample items with different categories
        $this->createSampleItems();
        
        // Create sample expenses
        $this->createSampleExpenses();
        
        $this->command->info('✅ Dashboard test data seeded successfully!');
    }
    
    private function createSampleItems()
    {
        // Sample frames
        $frames = [
            ['Ray-Ban Aviator', 'Frame', 150000, 50],
            ['Oakley Holbrook', 'Frame', 120000, 35],
            ['Tom Ford FT5282', 'Frame', 200000, 25],
            ['Gucci GG0061S', 'Frame', 180000, 30],
            ['Prada PR 16WV', 'Frame', 220000, 20],
        ];
        
        // Sample medicines
        $medicines = [
            ['Paracetamol 500mg', 'Pharmaceutical', 5000, 100],
            ['Amoxicillin 500mg', 'Pharmaceutical', 8000, 80],
            ['Ibuprofen 400mg', 'Pharmaceutical', 6000, 90],
            ['Ciprofloxacin 500mg', 'Pharmaceutical', 12000, 60],
            ['Azithromycin 250mg', 'Pharmaceutical', 15000, 40],
        ];
        
        // Get consultation type IDs
        $glassType = DB::table('consultation_types')->where('name', 'Glass')->first();
        $pharmacyType = DB::table('consultation_types')->where('name', 'Pharmacy')->first();
        
        $frameType = DB::table('item_types')->where('name', 'Frame')->first();
        $pharmaType = DB::table('item_types')->where('name', 'Pharmaceutical')->first();
        
        foreach ($frames as $frame) {
            DB::table('items')->insert([
                'name' => $frame[0],
                'item_type_id' => $frameType->id ?? 1,
                'consultation_type_id' => $glassType->id ?? 1,
                'unit_price' => $frame[2],
                'balance' => $frame[3],
                'minimum_stock' => 10,
                'is_stock_item' => 'Yes',
                'status' => 'Active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
        
        foreach ($medicines as $medicine) {
            DB::table('items')->insert([
                'name' => $medicine[0],
                'item_type_id' => $pharmaType->id ?? 2,
                'consultation_type_id' => $pharmacyType->id ?? 2,
                'unit_price' => $medicine[2],
                'balance' => $medicine[3],
                'minimum_stock' => 20,
                'is_stock_item' => 'Yes',
                'has_expiry' => 'Yes',
                'expiry_date' => Carbon::now()->addMonths(12),
                'status' => 'Active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
        
        $this->command->info('📦 Created sample items');
    }
    
    private function createSampleExpenses()
    {
        // Get expense categories
        $categories = DB::table('expense_categories')->pluck('id')->toArray();
        
        if (empty($categories)) {
            $this->command->warn('No expense categories found');
            return;
        }
        
        // Create sample expenses for last 30 days
        foreach (range(1, 30) as $day) {
            $date = Carbon::now()->subDays($day);
            $dailyExpenses = rand(1, 3);
            
            for ($i = 1; $i <= $dailyExpenses; $i++) {
                DB::table('expenses')->insert([
                    'expense_category_id' => $categories[array_rand($categories)],
                    'amount' => rand(50000, 500000),
                    'description' => 'Sample expense ' . $i,
                    'created_by' => 1,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
                
                // Create expense payment
                $expenseId = DB::getPdo()->lastInsertId();
                DB::table('expense_payments')->insert([
                    'expense_id' => $expenseId,
                    'amount' => rand(50000, 500000),
                    'payment_method' => 'Cash',
                    'created_by' => 1,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
        
        $this->command->info('💰 Created sample expenses');
    }
}
