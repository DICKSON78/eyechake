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
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();
            
            // Check access permissions - Admin and Director have full access
            if (!$user) {
                return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied');
            }
            if (!in_array($user->role, ['Admin', 'Director']) && !$user->is_admin) {
                $privileges = $user->privileges ?? null;
                $privArray = is_object($privileges) ? (array) $privileges : (is_array($privileges) ? $privileges : []);
                $hasAccess = !empty($privArray['optometry_report_card'])
                    || !empty($privArray['sales_report_card'])
                    || !empty($privArray['crm_report_card']);
                if (!$hasAccess) {
                    return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied');
                }
            }

            $start_date = $request->start_date ?? Carbon::today()->startOfMonth()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || $user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

            $kpis = $this->calculateDepartmentKPIs($department, $clinic_id, $start_date, $end_date);
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
                'recommendations' => $recommendations
            ];

            return $this->sendResponse($data, Response::HTTP_OK, 'Performance data retrieved successfully');
            
        } catch (\Exception $e) {
            Log::error('Performance Dashboard Error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error retrieving performance data');
        }
    }

    public function updateTargets(Request $request, $department)
    {
        $user = $request->user();
        
        // Check access permissions
        if (!$user || (!$user->is_admin && !in_array($user->role, ['Admin', 'Director']))) {
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
        $privileges = $user->privileges ?? [];
        
        switch (strtolower($department)) {
            case 'optometry':
                return in_array('optometry_report_card', $privileges);
            case 'sales':
                return in_array('sales_report_card', $privileges);
            case 'crm':
            case 'marketing':
                return in_array('crm_report_card', $privileges);
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
            ->whereIn('p.id', function ($query) use ($start_date, $end_date, $clinic_id) {
                $query->select('pci.patient_id')
                    ->from('patient_check_ins as pci')
                    ->join('users as u', 'pci.created_by', '=', 'u.id')
                    ->whereDate('pci.created_at', '>=', $start_date)
                    ->whereDate('pci.created_at', '<=', $end_date)
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->where('u.clinic_id', $clinic_id);
                    });
            })
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

    private function getCRMKPIs($clinic_id, $start_date, $end_date)
    {
        // Use sample data for now since tables may not exist
        $calledContacts = 85;
        $notCalledContacts = 45;
        $unreachableContacts = 20;
        $glassLeadsCount = 32;

        // Get targets with fallbacks
        $calledTarget = $this->getTarget('crm', 'called_contacts', $clinic_id) ?: 100;
        $glassLeadsTarget = $this->getTarget('crm', 'marketing_glass_leads', $clinic_id) ?: 40;

        return [
            [
                'id' => 'called_contacts',
                'name' => 'Patient Contact Status - Called',
                'target' => $calledTarget,
                'result' => $calledContacts,
                'formatted_target' => number_format($calledTarget),
                'formatted_result' => number_format($calledContacts),
                'unit' => 'count'
            ],
            [
                'id' => 'not_called_contacts',
                'name' => 'Patient Contact Status - Not Called',
                'target' => 0,
                'result' => $notCalledContacts,
                'formatted_target' => '0',
                'formatted_result' => number_format($notCalledContacts),
                'unit' => 'count'
            ],
            [
                'id' => 'unreachable_contacts',
                'name' => 'Patient Contact Status - Unreachable',
                'target' => 0,
                'result' => $unreachableContacts,
                'formatted_target' => '0',
                'formatted_result' => number_format($unreachableContacts),
                'unit' => 'count'
            ],
            [
                'id' => 'marketing_glass_leads',
                'name' => 'Marketing Glass Leads',
                'target' => $glassLeadsTarget,
                'result' => $glassLeadsCount,
                'formatted_target' => number_format($glassLeadsTarget),
                'formatted_result' => number_format($glassLeadsCount),
                'unit' => 'count'
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

        $glassSalesTarget = $this->getTarget('sales', 'average_glass_daily_sales', $clinic_id);

        // Glass Customer Conversion Ratio
        $totalPatients = DB::table('patient_check_ins as pci')
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
            ->distinct('ppci.id')
            ->count();

        $conversionRatio = $totalPatients > 0 ? ($glassBuyers / $totalPatients) * 100 : 0;
        $conversionTarget = $this->getTarget('sales', 'glass_customer_conversion_ratio', $clinic_id);

        return [
            [
                'id' => 'average_glass_daily_sales',
                'name' => 'Average Glass Daily Sales',
                'target' => $glassSalesTarget,
                'result' => $glassSales,
                'formatted_target' => number_format($glassSalesTarget, 2),
                'formatted_result' => number_format($glassSales, 2),
                'unit' => 'TZS'
            ],
            [
                'id' => 'glass_customer_conversion_ratio',
                'name' => 'Glass Customer Conversion Ratio (Daily)',
                'target' => $conversionTarget,
                'result' => $conversionRatio,
                'formatted_target' => number_format($conversionTarget, 1) . '%',
                'formatted_result' => number_format($conversionRatio, 1) . '%',
                'unit' => '%'
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
                    case 'medicine_sales':
                        $recommendations[] = "Increase medicine sales efforts to meet target of {$kpi['target']} TZS.";
                        break;
                    case 'return_patient_percentage':
                        $recommendations[] = "Focus on patient retention strategies to achieve {$kpi['target']}% return rate.";
                        break;
                    case 'average_glass_daily_sales':
                        $recommendations[] = "Enhance glass sales strategies to reach daily target of {$kpi['target']} TZS.";
                        break;
                    case 'glass_customer_conversion_ratio':
                        $recommendations[] = "Improve conversion techniques to achieve {$kpi['target']}% conversion rate.";
                        break;
                    case 'called_contacts':
                        $recommendations[] = "Increase calling efforts to meet contact target of {$kpi['target']}.";
                        break;
                    case 'marketing_glass_leads':
                        $recommendations[] = "Boost marketing activities to generate {$kpi['target']} glass leads.";
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
