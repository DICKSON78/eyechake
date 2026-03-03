<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PatientsToReturnController extends Controller
{
    use ApiResponse;

    /**
     * Get patients scheduled to return this week
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getThisWeek(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
            ]);

            $user = $request->user();
            
            // Default to today if not provided
            $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

            $clinic_id = ($user && ($user->is_admin ?? false)) ? $request->clinic_id : ($user->clinic_id ?? null);

            // Use a more robust query with joins to get patient data directly
            $query = DB::table('consultations')
                ->join('patient_payment_cache_items', 'consultations.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                ->join('patients', 'patient_check_ins.patient_id', '=', 'patients.id')
                ->leftJoin('payment_modes', 'patients.payment_mode_id', '=', 'payment_modes.id')
                ->leftJoin('users as creators', 'consultations.created_by', '=', 'creators.id')
                ->where('consultations.status', 'Consulted')
                ->where('consultations.patient_to_return', 'Yes')
                ->whereNotNull('consultations.to_return_date')
                ->whereBetween('consultations.to_return_date', [$start_date, $end_date])
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->where('creators.clinic_id', $clinic_id);
                })
                ->select([
                    'consultations.id as consultation_id',
                    'consultations.to_return_date',
                    'consultations.return_reason',
                    'consultations.remarks',
                    'consultations.chief_complaint',
                    'consultations.created_at as consultation_date',
                    'patients.id as patient_id',
                    'patients.first_name',
                    'patients.middle_name',
                    'patients.last_name',
                    'patients.phone',
                    'patients.email',
                    'patients.gender',
                    'patients.date_of_birth',
                    'patients.is_vip',
                    'patients.is_businessperson',
                    'patients.is_outreach',
                    'payment_modes.name as payment_mode_name',
                    DB::raw("CONCAT(COALESCE(creators.first_name, ''), ' ', COALESCE(creators.middle_name, ''), ' ', COALESCE(creators.last_name, '')) as doctor_name"),
                ])
                ->orderBy('consultations.to_return_date')
                ->orderBy('consultations.created_at');

            $results = $query->get();

        // Group by return date
        $grouped = [];
        $today = Carbon::today();
        
        foreach ($results as $row) {
            // Build patient full name
            $patientName = trim(($row->first_name ?? '') . ' ' . ($row->middle_name ?? '') . ' ' . ($row->last_name ?? ''));
            if (empty($patientName)) {
                continue;
            }
            
            // Calculate age
            $age = null;
            if ($row->date_of_birth) {
                try {
                    $age = Carbon::parse($row->date_of_birth)->age;
                } catch (\Exception $e) {
                    // Age calculation failed, leave as null
                }
            }

            $returnDate = Carbon::parse($row->to_return_date);
            $dateKey = $returnDate->format('Y-m-d');
            $dayName = $returnDate->format('l'); // Day name (Monday, Tuesday, etc.)
            
            // Determine status
            $status = 'upcoming';
            if ($returnDate->isToday()) {
                $status = 'today';
            } elseif ($returnDate->isPast()) {
                $status = 'overdue';
            }

            if (!isset($grouped[$dateKey])) {
                $grouped[$dateKey] = [
                    'date' => $dateKey,
                    'date_display' => $returnDate->format('M d, Y'),
                    'day_name' => $dayName,
                    'status' => $status,
                    'count' => 0,
                    'patients' => [],
                ];
            }

            $grouped[$dateKey]['count']++;
            
            // Format consultation date
            $consultationDate = null;
            $consultationDateDisplay = 'N/A';
            if ($row->consultation_date) {
                try {
                    $consultationDate = Carbon::parse($row->consultation_date);
                    $consultationDateDisplay = $consultationDate->format('M d, Y');
                } catch (\Exception $e) {
                    // Date parsing failed
                }
            }
            
            $grouped[$dateKey]['patients'][] = [
                'consultation_id' => $row->consultation_id,
                'patient_id' => $row->patient_id,
                'patient_name' => $patientName,
                'patient_number' => $row->patient_id,
                'phone' => $row->phone,
                'email' => $row->email,
                'gender' => $row->gender,
                'age' => $age,
                'return_date' => $row->to_return_date,
                'to_return_date' => $row->to_return_date,
                'return_date_display' => $returnDate->format('M d, Y'),
                'remarks' => $row->remarks,
                'return_reason' => $row->return_reason,
                'chief_complaint' => $row->chief_complaint,
                'consultation_date' => $row->consultation_date,
                'consultation_date_display' => $consultationDateDisplay,
                'doctor' => $row->doctor_name ?? 'N/A',
                'is_vip' => (bool)($row->is_vip ?? false),
                'is_businessperson' => (bool)($row->is_businessperson ?? false),
                'is_outreach' => (bool)($row->is_outreach ?? false),
                'payment_mode' => $row->payment_mode_name ?? 'N/A',
            ];
        }

        // Sort grouped data by date
        ksort($grouped);

        // Calculate summary
        $summary = [
            'total' => count($results),
            'today' => isset($grouped[$today->format('Y-m-d')]) ? $grouped[$today->format('Y-m-d')]['count'] : 0,
            'this_week' => count($grouped),
            'overdue' => 0,
        ];

        foreach ($grouped as $group) {
            if ($group['status'] === 'overdue') {
                $summary['overdue'] += $group['count'];
            }
        }

            return $this->sendResponse([
                'summary' => $summary,
                'data' => array_values($grouped),
                'start_date' => $start_date,
                'end_date' => $end_date,
            ], Response::HTTP_OK, 'Patients scheduled to return this week retrieved successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('PatientsToReturn validation error', [
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);
            return $this->sendError('Validation failed.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Exception $e) {
            \Log::error('PatientsToReturn getThisWeek error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request' => $request->all()
            ]);
            return $this->sendError(
                'Failed to retrieve patients scheduled to return. Please try again.',
                Response::HTTP_INTERNAL_SERVER_ERROR,
                ['error' => $e->getMessage()]
            );
        }
    }
}


