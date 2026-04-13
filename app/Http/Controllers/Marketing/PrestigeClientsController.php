<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PrestigeClientsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'q' => 'sometimes|string',
                'high_value' => 'sometimes|integer',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $user->is_admin ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);

            // 1. First, get all potential VIP patients
            // We use a scope or explicit where to include 'Yes', 1, and true
            $query = Patient::query()
                ->where(function($q) {
                    $q->where('is_vip', true)
                      ->orWhere('is_vip', 'Yes')
                      ->orWhere('is_vip', '1');
                });

            // 2. Filter by clinic if applicable (via check-ins)
            if ($clinic_id) {
                $query->whereHas('check_ins', function ($q2) use ($clinic_id) {
                    $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                        $q3->where('clinic_id', $clinic_id);
                    });
                });
            }

            // 3. Search filter
            if ($request->q) {
                $term = $request->q;
                $query->where(function ($q) use ($term) {
                    $q->where('first_name', 'like', '%' . $term . '%')
                      ->orWhere('middle_name', 'like', '%' . $term . '%')
                      ->orWhere('last_name', 'like', '%' . $term . '%')
                      ->orWhere('phone', 'like', '%' . $term . '%');
                });
            }

            // 4. Calculate total payments for these patients
            // We reuse the logic from HighValuePatientsController but focused on our subset
            $patientIds = (clone $query)->pluck('id')->toArray();
            
            $totalPaymentsMap = [];
            if (!empty($patientIds)) {
                // Direct payments
                $directSums = DB::table('patient_item_payments as pip')
                    ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
                    ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                    ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
                    ->whereIn('pci.patient_id', $patientIds)
                    ->select('pci.patient_id', DB::raw('SUM(pip.amount - COALESCE(pip.discount, 0)) as total'))
                    ->groupBy('pci.patient_id')
                    ->get()
                    ->pluck('total', 'patient_id');

                // Bill payments
                $billSums = DB::table('patient_item_bill_payments as pibp')
                    ->join('patient_item_bills as pib', 'pibp.bill_id', '=', 'pib.id')
                    ->join('patient_payment_cache_items as ppci', 'pib.id', '=', 'ppci.bill_id')
                    ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                    ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
                    ->whereIn('pci.patient_id', $patientIds)
                    ->select('pci.patient_id', DB::raw('SUM(pibp.amount) as total'))
                    ->groupBy('pci.patient_id')
                    ->get()
                    ->pluck('total', 'patient_id');

                // Merge sums
                foreach ($patientIds as $id) {
                    $totalPaymentsMap[$id] = ($directSums[$id] ?? 0) + ($billSums[$id] ?? 0);
                }
            }

            // 5. Apply high value filter if requested (filter calculation after fetching IDs)
            if ($request->high_value) {
                $threshold = (int) $request->high_value;
                $patientIds = array_filter($patientIds, function($id) use ($totalPaymentsMap, $threshold) {
                    return ($totalPaymentsMap[$id] ?? 0) >= $threshold;
                });
                $query->whereIn('id', $patientIds);
            }

            // 6. Fetch final paginated list with details
            $patients = $query->with(['region', 'district', 'ward', 'information_source', 'calling_status'])
                ->orderBy('created_at', 'desc')
                ->paginate($per_page);

            // 7. Append the calculated total_payments to each model
            $patients->getCollection()->transform(function ($patient) use ($totalPaymentsMap) {
                $patient->total_payments = $totalPaymentsMap[$patient->id] ?? 0;
                return $patient;
            });

            return $this->sendResponse($patients, Response::HTTP_OK, 'Prestige clients retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('PrestigeClientsController error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            
            return $this->sendError(
                'An error occurred while fetching prestige clients. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
