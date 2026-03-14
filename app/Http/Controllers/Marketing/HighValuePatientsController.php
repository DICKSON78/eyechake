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
                // Support a high_value filter with explicit ranges
                'high_value' => 'sometimes|string|in:500000-1000000,1000000+',
                'threshold' => 'sometimes|in:500000,1000000',
                'class' => 'sometimes|string|in:class1,class2,all',
                'q' => 'sometimes|string',
            ]);

            $user = $request->user();
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }
            
            $per_page = $request->per_page ?? 25;
            $clinic_id = $user->is_admin ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);
            // Determine min/max filters for lifetime value
            $minValue = null;
            $maxValue = null;

            if ($request->has('high_value')) {
                $hv = $request->high_value;
                if ($hv === '500000-1000000') {
                    $minValue = 500000;
                    $maxValue = 1000000; // exclusive upper bound
                } elseif ($hv === '1000000+') {
                    $minValue = 1000000;
                }
            }

            // Backwards compatibility with threshold/class params
            if (is_null($minValue)) {
                $thresholdRaw = $request->threshold ?? 500000;
                if ($request->has('class')) {
                    if ($request->class === 'class2') $thresholdRaw = 1000000;
                    else if ($request->class === 'class1') $thresholdRaw = 500000;
                }
                $minValue = (int) $thresholdRaw;
            }

            // 1. Calculate DIRECT payments per patient
            $directPaymentMap = DB::table('patient_item_payments as pip')
                ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
                ->select('pip.id as payment_id', 'pci.patient_id', 'pip.amount', 'pip.discount')
                ->distinct();

            $directSums = DB::table(function ($query) use ($directPaymentMap) {
                $query->fromSub($directPaymentMap, 'dpm');
            }, 'sub')
            ->select('patient_id', DB::raw('SUM(amount - COALESCE(discount, 0)) as amount'))
            ->groupBy('patient_id');

            // 2. Calculate BILL payments per patient
            $billToPatientMap = DB::table('patient_item_bills as pib')
                ->join('patient_payment_cache_items as ppci', 'pib.id', '=', 'ppci.bill_id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
                ->select('pib.id as bill_id', 'pci.patient_id')
                ->distinct();

            $billSums = DB::table('patient_item_bill_payments as pibp')
                ->joinSub($billToPatientMap, 'b2p', 'pibp.bill_id', '=', 'b2p.bill_id')
                ->select('b2p.patient_id', DB::raw('SUM(pibp.amount) as amount'))
                ->groupBy('b2p.patient_id');

            // 3. Union and Total Sum
            $allSums = DB::table(function ($query) use ($directSums, $billSums) {
                $query->fromSub($directSums, 'ds')
                      ->unionAll($billSums);
            }, 'unioned_sums')
            ->select('patient_id', DB::raw('SUM(amount) as total_lifetime_value'))
            ->groupBy('patient_id');

            // Apply having filters for min/max lifetime value
            if (!is_null($minValue)) {
                $allSums->havingRaw('SUM(amount) >= ?', [$minValue]);
            }
            if (!is_null($maxValue)) {
                // make upper bound exclusive so 1,000,000 goes to the 1M+ bucket
                $allSums->havingRaw('SUM(amount) < ?', [$maxValue]);
            }

            // 4. Get the patient IDs and Values
            $highValuePatients = $allSums->get()->keyBy('patient_id');
            $patientIds = $highValuePatients->keys()->toArray();

            if (empty($patientIds)) {
                return $this->sendResponse([
                    'data' => [],
                    'total' => 0,
                    'page' => $request->page ?? 1,
                    'per_page' => $per_page,
                    'last_page' => 1
                ], Response::HTTP_OK);
            }

            // 5. Fetch Patient Details
            $patientsQuery = Patient::whereIn('id', $patientIds)
                ->with(['region', 'district', 'information_source']);

            if ($request->q) {
                $term = $request->q;
                $patientsQuery->where(function ($query) use ($term) {
                    $query->where('first_name', 'like', '%' . $term . '%')
                          ->orWhere('middle_name', 'like', '%' . $term . '%')
                          ->orWhere('last_name', 'like', '%' . $term . '%')
                          ->orWhere('phone', 'like', '%' . $term . '%');
                });
            }

            $patients = $patientsQuery->paginate($per_page);

            // 6. Map and Transform
            $transformedData = $patients->getCollection()->map(function ($patient) use ($highValuePatients) {
                $val = $highValuePatients[$patient->id]->total_lifetime_value ?? 0;
                
                $className = 'Class 1';
                if ($val > 1000000) {
                    $className = 'Class 2';
                }

                return [
                    'id' => $patient->id,
                    'full_name' => $patient->full_name ?? ($patient->first_name . ' ' . $patient->last_name),
                    'phone' => $patient->phone,
                    'email' => $patient->email,
                    'total_payments' => (float) $val,
                    'patient_class' => $className,
                    'region' => $patient->region->name ?? 'N/A',
                    'district' => $patient->district->name ?? 'N/A',
                    'information_source' => $patient->information_source->name ?? 'N/A',
                    'is_vip' => (bool)$patient->is_vip,
                    'is_businessperson' => (bool)$patient->is_businessperson,
                ];
            });

            // Sort by value desc
            $transformedData = $transformedData->sortByDesc('total_payments')->values();

            return $this->sendResponse([
                'data' => $transformedData,
                'total' => $patients->total(),
                'page' => $patients->currentPage(),
                'per_page' => $patients->perPage(),
                'last_page' => $patients->lastPage(),
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

