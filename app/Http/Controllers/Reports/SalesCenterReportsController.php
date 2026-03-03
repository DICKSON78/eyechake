<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SalesCenterReportsController extends Controller
{
    use ApiResponse;

    public function getSalesReport(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        
        // Default to today if no dates provided
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Summary statistics
        $total_sales = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        $total_revenue = $total_sales; // Same as total sales for now

        $total_transactions = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Detailed sales by item
        $details = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Served')
            ->whereDate('served_at', '>=', $start_date)
            ->whereDate('served_at', '<=', $end_date)
            ->with(['item', 'payment_cache.check_in.patient', 'consultation_type'])
            ->select(
                'patient_payment_cache_items.*',
                DB::raw('unit_price * quantity as total_amount')
            )
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'patient_name' => $item->payment_cache->check_in->patient->full_name ?? 'N/A',
                    'patient_number' => $item->payment_cache->check_in->patient->id ?? 'N/A',
                    'item_name' => $item->item->name ?? 'N/A',
                    'consultation_type' => $item->consultation_type->name ?? 'N/A',
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_amount' => $item->unit_price * $item->quantity,
                    'served_at' => $item->served_at ? Carbon::parse($item->served_at)->format('Y-m-d H:i:s') : null,
                ];
            });

        $data = [
            'summary' => [
                'total_sales' => (float) $total_sales,
                'total_revenue' => (float) $total_revenue,
                'total_transactions' => (int) $total_transactions,
            ],
            'details' => $details,
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Sales report retrieved successfully.');
    }
}

