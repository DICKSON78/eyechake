<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class LeadGenerationController extends Controller
{
    use ApiResponse;

    /**
     * Display lead generation report data
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id;
            }

            // Get all patients with their information sources and check-ins
            // For lead generation, we want all patients (leads), filtered by clinic if needed
            $patientsQuery = Patient::with(['information_source', 'check_ins.creator', 'creator'])
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    // Filter by either the patient creator's clinic or any check-in creator's clinic
                    $q->where(function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q2) use ($clinic_id) {
                            $q2->where('clinic_id', $clinic_id);
                        })->orWhereHas('check_ins', function ($q2) use ($clinic_id) {
                            $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                                $q3->where('clinic_id', $clinic_id);
                            });
                        });
                    });
                });

            $patients = $patientsQuery->get();

            // Calculate total leads (all patients)
            $totalLeads = $patients->count();

            // Calculate new leads (patients created in the last 30 days)
            $newLeads = $patients->filter(function ($patient) {
                return $patient->created_at && $patient->created_at->greaterThan(now()->subDays(30));
            })->count();

            // Calculate qualified leads (patients with consultations or check-ins)
            $qualifiedLeads = $patients->filter(function ($patient) {
                return $patient->check_ins && $patient->check_ins->count() > 0;
            })->count();

            // Calculate conversion rate (qualified leads / total leads)
            $conversionRate = $totalLeads > 0 ? ($qualifiedLeads / $totalLeads) : 0;

            // Group leads by information source
            $leadsBySource = [];
            $sourceGroups = $patients->groupBy('info_source_id');

            foreach ($sourceGroups as $sourceId => $sourcePatients) {
                $source = $sourcePatients->first()->information_source;
                $count = $sourcePatients->count();
                $percentage = $totalLeads > 0 ? ($count / $totalLeads) : 0;

                $leadsBySource[] = [
                    'source' => $source ? $source->name : 'Unknown',
                    'count' => $count,
                    'percentage' => $percentage,
                ];
            }

            // Sort by count descending
            usort($leadsBySource, function ($a, $b) {
                return $b['count'] - $a['count'];
            });

            // Group leads by status (based on whether they have consultations/check-ins)
            $leadsByStatus = [];
            
            // Active leads (have check-ins)
            $activeLeads = $patients->filter(function ($patient) {
                return $patient->check_ins && $patient->check_ins->count() > 0;
            })->count();

            // Inactive leads (no check-ins)
            $inactiveLeads = $totalLeads - $activeLeads;

            if ($activeLeads > 0) {
                $leadsByStatus[] = [
                    'status' => 'Active',
                    'count' => $activeLeads,
                    'percentage' => $totalLeads > 0 ? ($activeLeads / $totalLeads) : 0,
                ];
            }

            if ($inactiveLeads > 0) {
                $leadsByStatus[] = [
                    'status' => 'Inactive',
                    'count' => $inactiveLeads,
                    'percentage' => $totalLeads > 0 ? ($inactiveLeads / $totalLeads) : 0,
                ];
            }

            // Calculate average lead quality (based on conversion rate)
            $averageLeadQuality = $conversionRate;

            $data = [
                'summary' => [
                    'total_leads' => $totalLeads,
                    'new_leads' => $newLeads,
                    'qualified_leads' => $qualifiedLeads,
                    'conversion_rate' => $conversionRate,
                    'average_lead_quality' => $averageLeadQuality,
                ],
                'leads_by_source' => $leadsBySource,
                'leads_by_status' => $leadsByStatus,
            ];

            return $this->sendResponse($data, Response::HTTP_OK, 'Lead generation data retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('LeadGenerationController error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching lead generation data.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
