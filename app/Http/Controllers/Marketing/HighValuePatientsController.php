<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class HighValuePatientsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'threshold' => 'sometimes|in:500000,1000000',
                'q' => 'sometimes|string',
            ]);

            $user = $request->user();
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }
            
            $per_page = $request->per_page ?? 25;
            $clinic_id = $user->is_admin ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);
            $threshold = $request->threshold ?? 500000;

        // Get all patients first (with optional filtering)
        $patientQuery = Patient::query()
            ->when($request->q, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('first_name', 'like', '%' . $request->q . '%')
                          ->orWhere('middle_name', 'like', '%' . $request->q . '%')
                          ->orWhere('last_name', 'like', '%' . $request->q . '%')
                          ->orWhere('phone', 'like', '%' . $request->q . '%');
                });
            });
        
        // Limit initial query to avoid loading too many patients at once
        $allPatients = $patientQuery->with(['region', 'district', 'information_source'])->get();

        // Calculate total payments for each patient
        $patientData = $allPatients->map(function ($patient) use ($clinic_id) {
            // Calculate total payments from patient_item_payments
            $totalPayments = DB::table('patient_item_payments')
                ->join('patient_payment_cache_items', 'patient_payment_cache_items.item_payment_id', '=', 'patient_item_payments.id')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                ->join('users', 'patient_item_payments.created_by', '=', 'users.id')
                ->where('patient_check_ins.patient_id', $patient->id)
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('users.clinic_id', $clinic_id);
                })
                ->sum('patient_item_payments.amount');

            // Calculate total bill payments from patient_item_bill_payments
            $totalBillPayments = DB::table('patient_item_bill_payments')
                ->join('patient_item_bills', 'patient_item_bill_payments.bill_id', '=', 'patient_item_bills.id')
                ->join('patient_payment_cache_items', 'patient_item_bills.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                ->join('users', 'patient_item_bill_payments.created_by', '=', 'users.id')
                ->where('patient_check_ins.patient_id', $patient->id)
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('users.clinic_id', $clinic_id);
                })
                ->sum('patient_item_bill_payments.amount');

            $total = (float) $totalPayments + (float) $totalBillPayments;
            
            return [
                'id' => $patient->id,
                'full_name' => $patient->full_name,
                'phone' => $patient->phone,
                'email' => $patient->email,
                'total_payments' => $total,
                'region' => $patient->region && $patient->region->name ? $patient->region->name : 'N/A',
                'district' => $patient->district && $patient->district->name ? $patient->district->name : 'N/A',
                'information_source' => $patient->information_source && $patient->information_source->name ? $patient->information_source->name : 'N/A',
                'is_vip' => (bool) $patient->is_vip,
                'is_businessperson' => (bool) $patient->is_businessperson,
            ];
        })
        ->filter(function ($patient) use ($threshold) {
            return $patient['total_payments'] >= $threshold;
        })
        ->sortByDesc('total_payments')
        ->values();

        // Manual pagination
        $total = $patientData->count();
        $page = $request->page ?? 1;
        $perPage = $per_page;
        $offset = ($page - 1) * $perPage;
        $paginated = $patientData->slice($offset, $perPage)->values();

            return $this->sendResponse([
                'data' => $paginated,
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'last_page' => ceil($total / $perPage),
            ], Response::HTTP_OK, 'High-value patients retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('HighValuePatientsController error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            
            return $this->sendError(
                'An error occurred while fetching high-value patients. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}

