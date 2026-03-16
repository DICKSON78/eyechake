<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DepartmentPerformanceReport;
use App\Models\DepartmentKpiTarget;
use App\Models\DepartmentPerformanceAccess;
use App\Models\DepartmentPerformanceAuditLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DepartmentPerformanceController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        // Apply middleware for access control
        $this->middleware(function ($request, $next) {
            $user = $request->user();
            $department = $request->route('department');
            
            if ($department && !DepartmentPerformanceAccess::hasAccess($user->id, $department, $user->clinic_id)) {
                return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Access denied to department performance report.');
            }
            
            return $next($request);
        })->only(['show', 'update', 'generate']);
    }

    /**
     * Get available departments for current user
     */
    public function getDepartments(Request $request)
    {
        $user = $request->user();
        $departments = DepartmentPerformanceAccess::getUserDepartments($user->id, $user->clinic_id);
        
        return $this->sendResponse($departments, Response::HTTP_OK, 'Departments retrieved successfully.');
    }

    /**
     * Get department performance report
     */
    public function show(Request $request, $department)
    {
        $request->validate([
            'report_date' => 'sometimes|date_format:Y-m-d',
            'regenerate' => 'sometimes|boolean',
        ]);

        $user = $request->user();
        $reportDate = $request->report_date ?? Carbon::today()->format('Y-m-d');
        $regenerate = $request->regenerate ?? false;

        try {
            // Try to get existing report
            $report = DepartmentPerformanceReport::getLatestReport($department, $user->clinic_id);
            
            // Regenerate if requested or if no report exists or report is outdated
            if ($regenerate || !$report || $report->report_date->format('Y-m-d') !== $reportDate) {
                $report = $this->generateReport($department, $reportDate, $user->clinic_id, $user->id);
            }

            // Log view action
            DepartmentPerformanceAuditLog::logAction(
                $department,
                'Viewed',
                $user->id,
                null,
                null,
                "Viewed report for {$reportDate}",
                $user->clinic_id
            );

            return $this->sendResponse($report, Response::HTTP_OK, 'Department performance report retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('Error retrieving department performance report', [
                'department' => $department,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error retrieving report: ' . $e->getMessage());
        }
    }

    /**
     * Generate new department performance report
     */
    public function generate(Request $request, $department)
    {
        $request->validate([
            'report_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $reportDate = $request->report_date ?? Carbon::today()->format('Y-m-d');

        try {
            $report = $this->generateReport($department, $reportDate, $user->clinic_id, $user->id);

            // Log generation action
            DepartmentPerformanceAuditLog::logAction(
                $department,
                'Generated',
                $user->id,
                null,
                ['report_date' => $reportDate],
                "Generated new report for {$reportDate}",
                $user->clinic_id
            );

            return $this->sendResponse($report, Response::HTTP_OK, 'Department performance report generated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error generating department performance report', [
                'department' => $department,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error generating report: ' . $e->getMessage());
        }
    }

    /**
     * Update KPI targets (edit access required)
     */
    public function update(Request $request, $department)
    {
        $request->validate([
            'targets' => 'required|array',
            'targets.*.kpi_name' => 'required|string',
            'targets.*.target_value' => 'required|numeric|min:0',
            'targets.*.target_unit' => 'required|string',
        ]);

        $user = $request->user();
        
        // Check edit access
        if (!DepartmentPerformanceAccess::hasAccess($user->id, $department, $user->clinic_id, 'Edit')) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Edit access required to update targets.');
        }

        try {
            $updatedTargets = [];
            
            foreach ($request->targets as $targetData) {
                $oldTarget = DepartmentKpiTarget::where('department', $department)
                    ->where('kpi_name', $targetData['kpi_name'])
                    ->where('clinic_id', $user->clinic_id)
                    ->first();

                $newTarget = DepartmentKpiTarget::updateOrCreate(
                    [
                        'department' => $department,
                        'kpi_name' => $targetData['kpi_name'],
                        'clinic_id' => $user->clinic_id,
                    ],
                    [
                        'target_value' => $targetData['target_value'],
                        'target_unit' => $targetData['target_unit'],
                        'status' => 'Active',
                        'created_by' => $user->id,
                    ]
                );

                // Log target change
                DepartmentPerformanceAuditLog::logAction(
                    $department,
                    'Target_Changed',
                    $user->id,
                    $oldTarget ? ['target_value' => $oldTarget->target_value] : null,
                    ['target_value' => $newTarget->target_value],
                    "Updated target for {$targetData['kpi_name']}",
                    $user->clinic_id
                );

                $updatedTargets[] = $newTarget;
            }

            // Clear relevant caches
            $this->clearReportCache($department, $user->clinic_id);

            return $this->sendResponse($updatedTargets, Response::HTTP_OK, 'KPI targets updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error updating KPI targets', [
                'department' => $department,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error updating targets: ' . $e->getMessage());
        }
    }

    /**
     * Get KPI targets for department
     */
    public function getTargets(Request $request, $department)
    {
        $user = $request->user();
        
        $targets = DepartmentKpiTarget::where('department', $department)
            ->where('status', 'Active')
            ->when($user->clinic_id, function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            })
            ->get();

        return $this->sendResponse($targets, Response::HTTP_OK, 'KPI targets retrieved successfully.');
    }

    /**
     * Get audit logs for department
     */
    public function getAuditLogs(Request $request, $department)
    {
        $request->validate([
            'limit' => 'sometimes|integer|min:1|max:100',
        ]);

        $user = $request->user();
        $limit = $request->limit ?? 50;

        $logs = DepartmentPerformanceAuditLog::getDepartmentLogs($department, $user->clinic_id, $limit);

        return $this->sendResponse($logs, Response::HTTP_OK, 'Audit logs retrieved successfully.');
    }

    /**
     * Generate report data
     */
    private function generateReport($department, $reportDate, $clinicId, $userId)
    {
        // Generate KPI data based on department
        switch ($department) {
            case 'Optometry':
                $kpiData = DepartmentPerformanceReport::generateOptometryKPI($clinicId, $reportDate);
                break;
            case 'Sales':
                $kpiData = DepartmentPerformanceReport::generateSalesKPI($clinicId, $reportDate);
                break;
            case 'CRM':
                $kpiData = DepartmentPerformanceReport::generateCrmKPI($clinicId, $reportDate);
                break;
            default:
                throw new \InvalidArgumentException("Invalid department: {$department}");
        }

        // Calculate performance colors and add to KPI data
        foreach ($kpiData as $key => &$kpi) {
            $kpi['color'] = DepartmentPerformanceReport::calculatePerformanceColor(
                $kpi['value'],
                $kpi['target']['value'] ?? 0,
                $kpi['target']['unit'] ?? 'currency'
            );
        }

        // Generate summary and recommendations (basic implementation)
        $summary = $this->generateSummary($department, $kpiData);
        $recommendations = $this->generateRecommendations($department, $kpiData);

        // Create or update report
        $report = DepartmentPerformanceReport::updateOrCreate(
            [
                'department' => $department,
                'report_date' => $reportDate,
                'clinic_id' => $clinicId,
            ],
            [
                'report_name' => "{$department} Performance Report - " . Carbon::parse($reportDate)->format('M j, Y'),
                'kpi_data' => $kpiData,
                'summary' => $summary,
                'recommendations' => $recommendations,
                'status' => 'Active',
                'created_by' => $userId,
            ]
        );

        // Clear caches
        $this->clearReportCache($department, $clinicId);

        return $report;
    }

    /**
     * Generate performance summary with comparison to previous period
     */
    private function generateSummary($department, $kpiData)
    {
        $reportDate = Carbon::today();
        $previousDate = (clone $reportDate)->subDay();
        
        $previousReport = DepartmentPerformanceReport::where('department', $department)
            ->where('report_date', $previousDate->format('Y-m-d'))
            ->first();

        $summaryParts = [];
        $improvements = [];
        $declines = [];

        foreach ($kpiData as $key => $kpi) {
            $currentValue = $kpi['value'];
            
            // Handle array values (CRM Contact Status)
            if (is_array($currentValue)) {
                $currentValue = (float) ($currentValue['called'] ?? 0);
            } else {
                $currentValue = (float) $currentValue;
            }

            $prevValue = $previousReport->kpi_data[$key]['value'] ?? null;
            if (is_array($prevValue)) {
                $prevValue = (float) ($prevValue['called'] ?? 0);
            } elseif ($prevValue !== null) {
                $prevValue = (float) $prevValue;
            }

            if ($prevValue !== null && $prevValue > 0) {
                $change = (($currentValue - $prevValue) / $prevValue) * 100;
                if ($change > 5) {
                    $improvements[] = "{$kpi['name']} increased by " . round($change, 1) . "%";
                } elseif ($change < -5) {
                    $declines[] = "{$kpi['name']} decreased by " . abs(round($change, 1)) . "%";
                }
            }
        }

        if (!empty($improvements)) {
            $summaryParts[] = "Positive trends: " . implode(', ', $improvements) . ".";
        }
        if (!empty($declines)) {
            $summaryParts[] = "Performance declines: " . implode(', ', $declines) . ".";
        }

        // Achievement status
        $achieved = count(array_filter($kpiData, fn($k) => in_array($k['color'], ['green', 'blue'])));
        $total = count($kpiData);
        $summaryParts[] = "Currently meeting targets for {$achieved} out of {$total} tracked KPIs.";

        return implode(' ', $summaryParts) ?: "Report summary is being calculated based on current database metrics.";
    }

    /**
     * Generate actionable report recommendations based on performance data
     */
    private function generateRecommendations($department, $kpiData)
    {
        $recommendations = [];
        
        // Simple, data-based recommendations only
        foreach ($kpiData as $kpi) {
            if ($kpi['target']['value'] > 0 && $kpi['value'] < $kpi['target']['value']) {
                switch ($kpi['name']) {
                    case 'Marketing Glass Leads':
                        $recommendations[] = "Increase marketing efforts to meet glass leads target.";
                        break;
                    case 'Patient Contact Status':
                        $recommendations[] = "Focus on improving patient contact rates.";
                        break;
                }
            }
        }
        
        if (empty($recommendations)) {
            $recommendations[] = "Current performance is optimal. Continue monitoring existing protocols and focus on maintaining high service standards.";
        }

        return array_unique($recommendations);
    }

    /**
     * Clear report cache
     */
    private function clearReportCache($department, $clinicId)
    {
        $cacheKeys = [
            "department_report_{$department}_{$clinicId}",
            "department_kpi_{$department}_{$clinicId}",
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Initialize default targets and access
     */
    public function initialize(Request $request)
    {
        $user = $request->user();
        
        try {
            // Set default targets
            DepartmentKpiTarget::setDefaultTargets($user->clinic_id);
            
            // Grant access to admin users
            if ($user->is_admin) {
                $departments = ['Optometry', 'Sales', 'CRM'];
                foreach ($departments as $department) {
                    DepartmentPerformanceAccess::grantAccess($user->id, $department, 'Edit', $user->clinic_id);
                }
            }

            return $this->sendResponse(null, Response::HTTP_OK, 'Department performance system initialized successfully.');
        } catch (\Exception $e) {
            \Log::error('Error initializing department performance system', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error initializing system: ' . $e->getMessage());
        }
    }
}
