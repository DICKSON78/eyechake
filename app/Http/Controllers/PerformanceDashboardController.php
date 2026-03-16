<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class PerformanceDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request, $department)
    {
        return $this->getDepartmentKPIs($request, $department);
    }

    public function getDepartmentKPIs(Request $request, $department)
    {
        $user = $request->user();
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;
        
        // Check access permissions
        if (!$this->hasDepartmentAccess($user, $department)) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied');
        }

        $start_date = $request->start_date ?? Carbon::today()->startOfMonth()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        try {
            Log::info('getDepartmentKPIs starting', [
                'department' => $department,
                'clinic_id' => $clinic_id,
                'start_date' => $start_date,
                'end_date' => $end_date
            ]);
            
            $kpis = $this->calculateDepartmentKPIs($department, $clinic_id, $start_date, $end_date);
            Log::info('calculateDepartmentKPIs returned', ['kpis' => $kpis]);
            
            $summary = $this->generateSummary($kpis, $department);
            Log::info('generateSummary returned', ['summary' => $summary]);
            
            $recommendations = $this->generateRecommendations($kpis, $department);
            Log::info('generateRecommendations returned', ['recommendations' => $recommendations]);

            $data = [
                'department' => $department,
                'period' => [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ],
                'kpis' => $kpis,
                'summary' => $summary,
                'recommendations' => $recommendations,
                'updated_at' => now()->toISOString()
            ];
            
            Log::info('Final data to return', ['data_structure' => array_keys($data), 'kpis_count' => count($kpis)]);

            return $this->sendResponse($data, Response::HTTP_OK, 'Success');
        } catch (\Exception $e) {
            Log::error('Performance Dashboard Error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error loading performance data');
        }
    }

    public function updateTargets(Request $request, $department)
    {
        $user = $request->user();
        
        // Check access permissions
        if (!$this->hasDepartmentAccess($user, $department)) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied');
        }

        $request->validate([
            'targets' => 'required|array',
            'targets.*' => 'required|numeric|min:0'
        ]);

        try {
            foreach ($request->targets as $kpiId => $target) {
                $query = DB::table('performance_targets')
                    ->where('department', $department)
                    ->where('kpi_key', $kpiId);

                // Only add clinic_id filter if the column exists
                if (Schema::hasColumn('performance_targets', 'clinic_id') && $user->clinic_id) {
                    $query->where('clinic_id', $user->clinic_id);
                }

                $query->update([
                    'target_value' => $target,
                    'updated_at' => now()
                ]);
            }

            return $this->sendResponse(null, Response::HTTP_OK, 'Targets updated successfully');
        } catch (\Exception $e) {
            Log::error('Performance Target Update Error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error updating targets');
        }
    }

    private function hasDepartmentAccess($user, $department)
    {
        if ($user->is_admin) return true;

        $privileges = $user->privileges ?? [];
        
        switch (strtolower($department)) {
            case 'optometry':
                return in_array('consultation_room', $privileges);
            case 'sales':
                return in_array('sales_center', $privileges);
            case 'crm':
            case 'marketing':
                return in_array('marketing', $privileges);
            default:
                return false;
        }
    }

    private function calculateDepartmentKPIs($department, $clinic_id, $start_date, $end_date)
    {
        switch (strtolower($department)) {
            case 'optometry':
                return $this->getOptometryKPIs($clinic_id, $start_date, $end_date);
            case 'sales':
                return $this->getSalesKPIs($clinic_id, $start_date, $end_date);
            case 'crm':
            case 'marketing':
                return $this->getCRMKPIs($clinic_id, $start_date, $end_date);
            default:
                return [];
        }
    }

    private function getOptometryKPIs($clinic_id, $start_date, $end_date)
    {
        // Medicine Sales KPI
        $medicineSales = DB::table('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'ppci.created_by', '=', 'u.id')
            ->where('i.category', 'Medicine')
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->sum(DB::raw('ppci.quantity * ppci.unit_price'));

        $medicineSalesTarget = $this->getTarget('optometry', 'medicine_sales', $clinic_id);

        // Return Patient % KPI
        $totalPatients = DB::table('patient_check_ins as pci')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereDate('pci.created_at', '>=', $start_date)
            ->whereDate('pci.created_at', '<=', $end_date)
            ->count();

        $returnPatients = DB::table('patient_check_ins as pci')
            ->join('patients as p', 'pci.patient_id', '=', 'p.id')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->where('pci.created_at', '<', Carbon::parse($start_date))
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereExists(function ($query) use ($start_date, $clinic_id) {
                $query->select(DB::raw(1))
                    ->from('patient_check_ins as pci2')
                    ->join('users as u2', 'pci2.created_by', '=', 'u2.id')
                    ->whereRaw('pci2.patient_id = pci.patient_id')
                    ->whereDate('pci2.created_at', '>=', $start_date)
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('u2.clinic_id', $clinic_id);
                    });
            })
            ->distinct('pci.patient_id')
            ->count();

        $returnPatientPercentage = $totalPatients > 0 ? ($returnPatients / $totalPatients) * 100 : 0;
        $returnPatientTarget = $this->getTarget('optometry', 'return_patient_percentage', $clinic_id);

        return [
            [
                'id' => 'medicine_sales',
                'name' => 'Medicine Sales',
                'target' => $medicineSalesTarget,
                'result' => $medicineSales,
                'formatted_target' => number_format($medicineSalesTarget, 2),
                'formatted_result' => number_format($medicineSales, 2),
                'unit' => 'TZS'
            ],
            [
                'id' => 'return_patient_percentage',
                'name' => 'Return Patient % (Monthly)',
                'target' => $returnPatientTarget,
                'result' => $returnPatientPercentage,
                'formatted_target' => number_format($returnPatientTarget, 1) . '%',
                'formatted_result' => number_format($returnPatientPercentage, 1) . '%',
                'unit' => '%'
            ]
        ];
    }

    private function getSalesKPIs($clinic_id, $start_date, $end_date)
    {
        // Average Glass Daily Sales
        $glassSales = DB::table('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'ppci.created_by', '=', 'u.id')
            ->where('i.category', 'Glass')
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->sum(DB::raw('ppci.quantity * ppci.unit_price'));

        $days = Carbon::parse($start_date)->diffInDays(Carbon::parse($end_date)) + 1;
        $averageDailyGlassSales = $glassSales / $days;
        $averageDailyGlassSalesTarget = $this->getTarget('sales', 'average_glass_daily_sales', $clinic_id);

        // Glass Customer Conversion Ratio
        $totalAttendingPatients = DB::table('patient_check_ins as pci')
            ->join('users as u', 'pci.created_by', '=', 'u.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereDate('pci.created_at', '>=', $start_date)
            ->whereDate('pci.created_at', '<=', $end_date)
            ->count();

        $glassBuyers = DB::table('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('users as u', 'ppci.created_by', '=', 'u.id')
            ->where('i.category', 'Glass')
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->distinct('ppc.check_in_id')
            ->count();

        $conversionRatio = $totalAttendingPatients > 0 ? ($glassBuyers / $totalAttendingPatients) * 100 : 0;
        $conversionRatioTarget = $this->getTarget('sales', 'glass_conversion_ratio', $clinic_id);

        return [
            [
                'id' => 'average_glass_daily_sales',
                'name' => 'Average Glass Daily Sales',
                'target' => $averageDailyGlassSalesTarget,
                'result' => $averageDailyGlassSales,
                'formatted_target' => number_format($averageDailyGlassSalesTarget, 2),
                'formatted_result' => number_format($averageDailyGlassSales, 2),
                'unit' => 'TZS'
            ],
            [
                'id' => 'glass_conversion_ratio',
                'name' => 'Glass Customer Conversion Ratio (Daily)',
                'target' => $conversionRatioTarget,
                'result' => $conversionRatio,
                'formatted_target' => number_format($conversionRatioTarget, 1) . '%',
                'formatted_result' => number_format($conversionRatio, 1) . '%',
                'unit' => '%'
            ]
        ];
    }

    private function getCRMKPIs($clinic_id, $start_date, $end_date)
    {
        Log::info('getCRMKPIs called', [
            'clinic_id' => $clinic_id,
            'start_date' => $start_date,
            'end_date' => $end_date
        ]);

        // Patient Contact Status
        $calledCount = DB::table('patient_calling_statuses as pcs')
            ->join('patients as p', 'pcs.patient_id', '=', 'p.id')
            ->join('users as u', 'p.created_by', '=', 'u.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->where('pcs.status', 'called')
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->count();

        $notCalledCount = DB::table('patient_calling_statuses as pcs')
            ->join('patients as p', 'pcs.patient_id', '=', 'p.id')
            ->join('users as u', 'p.created_by', '=', 'u.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->where('pcs.status', 'need_to_call')
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->count();

        $unreachableCount = DB::table('patient_calling_statuses as pcs')
            ->join('patients as p', 'pcs.patient_id', '=', 'p.id')
            ->join('users as u', 'p.created_by', '=', 'u.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->where('pcs.status', 'unreachable')
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->count();

        // Marketing Glass Leads
        $glassLeadsCount = DB::table('patients as p')
            ->join('users as u', 'p.created_by', '=', 'u.id')
            ->where('p.is_glass_prospect', 1)
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('u.clinic_id', $clinic_id);
            })
            ->whereDate('p.created_at', '>=', $start_date)
            ->whereDate('p.created_at', '<=', $end_date)
            ->count();

        return [
            [
                'id' => 'patient_contact_status',
                'name' => 'Patient Contact Status',
                'target' => 0, // Not applicable for status
                'result' => $calledCount,
                'formatted_target' => 'N/A',
                'formatted_result' => "Called: {$calledCount}, Not Called: {$notCalledCount}, Unreachable: {$unreachableCount}",
                'unit' => 'count'
            ],
            [
                'id' => 'marketing_glass_leads',
                'name' => 'Marketing Glass Leads',
                'target' => $this->getTarget('crm', 'marketing_glass_leads', $clinic_id),
                'result' => $glassLeadsCount,
                'formatted_target' => number_format($this->getTarget('crm', 'marketing_glass_leads', $clinic_id)),
                'formatted_result' => number_format($glassLeadsCount),
                'unit' => 'count'
            ]
        ];

        Log::info('getCRMKPIs returning', [
            'calledCount' => $calledCount,
            'notCalledCount' => $notCalledCount,
            'unreachableCount' => $unreachableCount,
            'glassLeadsCount' => $glassLeadsCount,
            'kpis_count' => count([
                [
                    'id' => 'patient_contact_status',
                    'name' => 'Patient Contact Status',
                    'target' => 0,
                    'result' => $calledCount,
                    'formatted_target' => 'N/A',
                    'formatted_result' => "Called: {$calledCount}, Not Called: {$notCalledCount}, Unreachable: {$unreachableCount}",
                    'unit' => 'count'
                ],
                [
                    'id' => 'marketing_glass_leads',
                    'name' => 'Marketing Glass Leads',
                    'target' => $this->getTarget('crm', 'marketing_glass_leads', $clinic_id),
                    'result' => $glassLeadsCount,
                    'formatted_target' => number_format($this->getTarget('crm', 'marketing_glass_leads', $clinic_id)),
                    'formatted_result' => number_format($glassLeadsCount),
                    'unit' => 'count'
                ]
            ])
        ]);

        return [
            [
                'id' => 'patient_contact_status',
                'name' => 'Patient Contact Status',
                'target' => 0,
                'result' => $calledCount,
                'formatted_target' => 'N/A',
                'formatted_result' => "Called: {$calledCount}, Not Called: {$notCalledCount}, Unreachable: {$unreachableCount}",
                'unit' => 'count'
            ],
            [
                'id' => 'marketing_glass_leads',
                'name' => 'Marketing Glass Leads',
                'target' => $this->getTarget('crm', 'marketing_glass_leads', $clinic_id),
                'result' => $glassLeadsCount,
                'formatted_target' => number_format($this->getTarget('crm', 'marketing_glass_leads', $clinic_id)),
                'formatted_result' => number_format($glassLeadsCount),
                'unit' => 'count'
            ]
        ];
    }

    private function getTarget($department, $kpiId, $clinic_id = null)
    {
        $query = DB::table('performance_targets')
            ->where('department', $department)
            ->where('kpi_key', $kpiId);

        // Only add clinic_id filter if the column exists
        if (Schema::hasColumn('performance_targets', 'clinic_id') && $clinic_id) {
            $query->where('clinic_id', $clinic_id);
        }

        $target = $query->value('target_value');

        return $target ?? 0;
    }

    private function generateSummary($kpis, $department)
    {
        $achievedCount = 0;
        $totalCount = 0;

        foreach ($kpis as $kpi) {
            if ($kpi['target'] > 0) {
                $totalCount++;
                if ($kpi['result'] >= $kpi['target']) {
                    $achievedCount++;
                }
            }
        }

        $achievementRate = $totalCount > 0 ? ($achievedCount / $totalCount) * 100 : 0;

        return "Achieved {$achievedCount} out of {$totalCount} targets ({$achievementRate}% completion rate).";
    }

    private function generateRecommendations($kpis, $department)
    {
        $recommendations = [];

        foreach ($kpis as $kpi) {
            if ($kpi['target'] > 0 && $kpi['result'] < $kpi['target']) {
                switch ($kpi['id']) {
                    case 'marketing_glass_leads':
                        $recommendations[] = "Increase marketing efforts to meet glass leads target of {$kpi['target']}.";
                        break;
                }
            }
        }

        if (empty($recommendations)) {
            $recommendations[] = "All targets are being met. Keep up the good work!";
        }

        return implode(' ', $recommendations);
    }
}
