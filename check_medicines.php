<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

// Get all medicines from database
$medicines = DB::table('items as i')
    ->where('i.category', 'Medicine')
    ->whereExists(function ($query) {
        $query->select(DB::raw(1))
            ->from('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->whereRaw('ppci.item_id = i.id')
            ->where('ppci.status', 'Paid');
    })
    ->distinct()
    ->orderBy('i.name')
    ->pluck('i.name')
    ->toArray();

echo "=== ALL MEDICINES IN DATABASE ===\n";
echo "Total Count: " . count($medicines) . "\n\n";

foreach ($medicines as $index => $medicine) {
    echo ($index + 1) . ". " . $medicine . "\n";
}

echo "\n=== TOTAL MEDICINES: " . count($medicines) . " ===\n";
?>
