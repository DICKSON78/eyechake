<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientCallingStatus;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CrmReportCardController extends Controller
{
    use ApiResponse;

    /**
     * Get CRM report card data with real counts from database
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getCrmReportCardData(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
            ]);

            $user = $request->user();
            
            // Default to month-to-date if no dates provided
            $start_date = $request->start_date ?? Carbon::now()->startOfMonth()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::now()->format('Y-m-d');

            $clinic_id = ($user && ($user->is_admin ?? false)) ? $request->clinic_id : ($user->clinic_id ?? null);

            // Get real counts from patient_calling_statuses table
            $crmData = $this->safeQuery(function () use ($clinic_id, $start_date, $end_date) {
                
                // Get all patients created in the period
                $patientsQuery = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date);

                $totalPatients = $patientsQuery->count();

                // Get calling status counts for patients created in the period
                $callingStatusCounts = DB::table('patients as p')
                    ->leftJoin('patient_calling_statuses as pcs', 'p.id', '=', 'pcs.patient_id')
                    ->join('users as u', 'p.created_by', '=', 'u.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('u.clinic_id', $clinic_id);
                    })
                    ->whereDate('p.created_at', '>=', $start_date)
                    ->whereDate('p.created_at', '<=', $end_date)
                    ->selectRaw('
                        COUNT(CASE WHEN pcs.status = "called" THEN 1 END) as called,
                        COUNT(CASE WHEN pcs.status = "need_to_call" OR pcs.status IS NULL THEN 1 END) as not_called,
                        COUNT(CASE WHEN pcs.status = "unreachable" THEN 1 END) as unreachable,
                        COUNT(*) as total
                    ')
                    ->first();

                return [
                    'called' => (int) $callingStatusCounts->called,
                    'not_called' => (int) $callingStatusCounts->not_called,
                    'unreachable' => (int) $callingStatusCounts->unreachable,
                    'total' => (int) $callingStatusCounts->total,
                    'period' => [
                        'start_date' => $start_date,
                        'end_date' => $end_date
                    ]
                ];
            }, [
                'called' => 0,
                'not_called' => 0,
                'unreachable' => 0,
                'total' => 0,
                'period' => [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]
            ]);

            // Get marketing glass leads count
            $glassLeadsData = $this->safeQuery(function () use ($clinic_id, $start_date, $end_date) {
                $glassLeads = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->where(function ($query) {
                        $query->where('needs_glasses', true)
                            ->orWhere('is_glass_patient', true);
                    })
                    ->count();

                return [
                    'glass_leads' => $glassLeads,
                    'period' => [
                        'start_date' => $start_date,
                        'end_date' => $end_date
                    ]
                ];
            }, [
                'glass_leads' => 0,
                'period' => [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]
            ]);

            $data = [
                'crm_data' => $crmData,
                'glass_leads' => $glassLeadsData['glass_leads'],
                'period' => $crmData['period']
            ];

            return $this->sendResponse($data, Response::HTTP_OK, 'CRM report card data retrieved successfully.');
        } catch (\Exception $e) {
            return $this->sendError('Failed to retrieve CRM report card data', Response::HTTP_INTERNAL_SERVER_ERROR, $e->getMessage());
        }
    }

    /**
     * Safe query wrapper to handle database errors
     */
    private function safeQuery($callback, $default = [])
    {
        try {
            return $callback();
        } catch (\Exception $e) {
            \Log::error('CRM Report Card query error', ['error' => $e->getMessage()]);
            return $default;
        }
    }
}
