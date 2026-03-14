<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerformanceDashboardController extends Controller
{
    use ApiResponse;

    public function getDepartmentPerformance(Request $request, $department)
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
            $kpis = $this->getDepartmentKPIs($department, $clinic_id, $start_date, $end_date);
            $summary = $this->generateSummary($kpis, $department);
            $recommendations = $this->generateRecommendations($kpis, $department);

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
                DB::table('performance_targets')
                    ->where('department', $department)
                    ->where('kpi_id', $kpiId)
                    ->where('clinic_id', $user->clinic_id)
                    ->update([
                        'target' => $target,
                        'updated_by' => $user->id,
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

    private function getDepartmentKPIs($department, $clinic_id, $start_date, $end_date)
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
            ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
            ->where('i.category', 'Medicine')
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('pci.clinic_id', $clinic_id);
            })
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->sum(DB::raw('ppci.quantity * ppci.unit_price'));

        $medicineSalesTarget = $this->getTarget('optometry', 'medicine_sales', $clinic_id);

        // Return Patient % KPI
        $totalPatients = DB::table('patient_check_ins')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $returnPatients = DB::table('patient_check_ins as pci')
            ->join('patients as p', 'pci.patient_id', '=', 'p.id')
            ->where('pci.created_at', '<', Carbon::parse($start_date))
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('pci.clinic_id', $clinic_id);
            })
            ->whereExists(function ($query) use ($start_date, $clinic_id) {
                $query->select(DB::raw(1))
                    ->from('patient_check_ins as pci2')
                    ->whereRaw('pci2.patient_id = pci.patient_id')
                    ->whereDate('pci2.created_at', '>=', $start_date)
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('pci2.clinic_id', $clinic_id);
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
            ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
            ->where('i.category', 'Glass')
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('pci.clinic_id', $clinic_id);
            })
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->sum(DB::raw('ppci.quantity * ppci.unit_price'));

        $days = Carbon::parse($start_date)->diffInDays(Carbon::parse($end_date)) + 1;
        $averageDailyGlassSales = $glassSales / $days;
        $averageDailyGlassSalesTarget = $this->getTarget('sales', 'average_glass_daily_sales', $clinic_id);

        // Glass Customer Conversion Ratio
        $totalAttendingPatients = DB::table('patient_check_ins')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $glassBuyers = DB::table('patient_payment_cache_items as ppci')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('items as i', 'ppci.item_id', '=', 'i.id')
            ->join('patient_check_ins as pci', 'ppc.check_in_id', '=', 'pci.id')
            ->where('i.category', 'Glass')
            ->where('ppci.status', 'Paid')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('pci.clinic_id', $clinic_id);
            })
            ->whereDate('ppc.created_at', '>=', $start_date)
            ->whereDate('ppc.created_at', '<=', $end_date)
            ->distinct('pci.patient_id')
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
        // Patient Contact Status
        $calledCount = DB::table('patient_calling_status as pcs')
            ->join('patients as p', 'pcs.patient_id', '=', 'p.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('p.clinic_id', $clinic_id);
            })
            ->where('pcs.status', 'Called')
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->count();

        $notCalledCount = DB::table('patient_calling_status as pcs')
            ->join('patients as p', 'pcs.patient_id', '=', 'p.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('p.clinic_id', $clinic_id);
            })
            ->where('pcs.status', 'Need to Call')
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->count();

        $unreachableCount = DB::table('patient_calling_status as pcs')
            ->join('patients as p', 'pcs.patient_id', '=', 'p.id')
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('p.clinic_id', $clinic_id);
            })
            ->where('pcs.status', 'Unreachable')
            ->whereDate('pcs.created_at', '>=', $start_date)
            ->whereDate('pcs.created_at', '<=', $end_date)
            ->count();

        // Marketing Glass Leads
        $glassLeadsCount = DB::table('patients as p')
            ->where('p.is_glass_prospect', 1)
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('p.clinic_id', $clinic_id);
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
    }

    private function getTarget($department, $kpiId, $clinic_id)
    {
        $target = DB::table('performance_targets')
            ->where('department', $department)
            ->where('kpi_id', $kpiId)
            ->where('clinic_id', $clinic_id)
            ->value('target');

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

        switch (strtolower($department)) {
            case 'optometry':
                return "Optometry performance shows {$achievementRate}% target achievement. Medicine sales and patient return rates are key indicators for department success.";
            case 'sales':
                return "Sales department achieved {$achievementRate}% of targets. Glass sales performance and customer conversion ratios demonstrate sales effectiveness.";
            case 'crm':
            case 'marketing':
                return "CRM/Marketing performance indicates {$achievementRate}% target completion. Patient engagement and lead generation are critical metrics.";
            default:
                return "Department performance shows {$achievementRate}% target achievement rate.";
        }
    }

    private function generateRecommendations($kpis, $department)
    {
        $recommendations = [];

        foreach ($kpis as $kpi) {
            if ($kpi['target'] > 0 && $kpi['result'] < $kpi['target']) {
                switch ($kpi['id']) {
                    case 'medicine_sales':
                        $recommendations[] = "Consider promotional campaigns for high-margin medicines and review inventory to ensure popular items are always available.";
                        break;
                    case 'return_patient_percentage':
                        $recommendations[] = "Implement patient follow-up system and improve service quality to increase patient retention rates.";
                        break;
                    case 'average_glass_daily_sales':
                        $recommendations[] = "Train staff on upselling techniques and create attractive glass package deals to boost daily sales.";
                        break;
                    case 'glass_conversion_ratio':
                        $recommendations[] = "Enhance product knowledge and create compelling demonstrations to improve conversion rates.";
                        break;
                    case 'marketing_glass_leads':
                        $recommendations[] = "Expand marketing outreach and implement targeted campaigns to increase qualified glass prospects.";
                        break;
                }
            }
        }

        if (empty($recommendations)) {
            $recommendations[] = "Performance is meeting or exceeding targets. Focus on maintaining current standards and continuous improvement.";
        }

        return implode(' ', $recommendations);
    }
}
