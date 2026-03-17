<?php

namespace App\Services;

use App\Models\DepartmentPerformanceReport;
use App\Models\DepartmentPerformanceAuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DepartmentPerformanceUpdateService
{
    /**
     * Trigger update when payment is confirmed
     */
    public static function triggerPaymentUpdate($paymentType, $amount, $clinicId = null)
    {
        $departments = [];
        
        // Determine which departments to update based on payment type
        if ($paymentType === 'medicine') {
            $departments[] = 'Optometry';
        } elseif ($paymentType === 'glass') {
            $departments[] = 'Sales';
        }

        foreach ($departments as $department) {
            self::updateDepartmentReport($department, $clinicId, 'Payment confirmed: ' . $paymentType);
        }
    }

    /**
     * Trigger update when patient visit is registered
     */
    public static function triggerPatientVisitUpdate($clinicId = null)
    {
        $departments = ['Optometry', 'Sales', 'CRM'];
        
        foreach ($departments as $department) {
            self::updateDepartmentReport($department, $clinicId, 'New patient visit registered');
        }
    }

    /**
     * Trigger update when marketing status is modified
     */
    public static function triggerMarketingStatusUpdate($clinicId = null)
    {
        self::updateDepartmentReport('CRM', $clinicId, 'Marketing status modified');
    }

    /**
     * Trigger update when target values are edited
     */
    public static function triggerTargetUpdate($department, $clinicId = null)
    {
        self::updateDepartmentReport($department, $clinicId, 'Target values updated');
    }

    /**
     * Update department report and clear caches
     */
    private static function updateDepartmentReport($department, $clinicId, $reason)
    {
        try {
            $reportDate = Carbon::today()->format('Y-m-d');
            
            // Get current report or create new one
            $report = DepartmentPerformanceReport::where('department', $department)
                ->where('report_date', $reportDate)
                ->when($clinicId, function ($query) use ($clinicId) {
                    $query->where('clinic_id', $clinicId);
                })
                ->first();

            if ($report) {
                // Regenerate KPI data
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
                }

                // Calculate performance colors
                foreach ($kpiData as $key => &$kpi) {
                    $kpi['color'] = DepartmentPerformanceReport::calculatePerformanceColor(
                        $kpi['value'],
                        $kpi['target']['value'] ?? 0,
                        $kpi['target']['unit'] ?? 'currency'
                    );
                }

                // Update report
                $report->update([
                    'kpi_data' => $kpiData,
                    'updated_at' => now(),
                ]);

                // Log the automatic update
                DepartmentPerformanceAuditLog::logAction(
                    $department,
                    'Auto_Updated',
                    1, // System user
                    null,
                    ['reason' => $reason],
                    "Auto-update triggered: {$reason}",
                    $clinicId
                );
            }

            // Clear caches
            self::clearCaches($department, $clinicId);
            
        } catch (\Exception $e) {
            \Log::error('Error updating department performance report', [
                'department' => $department,
                'clinic_id' => $clinicId,
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Clear relevant caches
     */
    private static function clearCaches($department, $clinicId)
    {
        $cacheKeys = [
            "department_report_{$department}_{$clinicId}",
            "department_kpi_{$department}_{$clinicId}",
            "dashboard_performance_{$department}_{$clinicId}",
        ];

        foreach ($cacheKeys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Get cached department report
     */
    public static function getCachedReport($department, $clinicId = null, $reportDate = null)
    {
        $reportDate = $reportDate ?? Carbon::today()->format('Y-m-d');
        $cacheKey = "department_report_{$department}_{$clinicId}_{$reportDate}";
        
        return Cache::remember($cacheKey, 300, function () use ($department, $clinicId, $reportDate) {
            return DepartmentPerformanceReport::where('department', $department)
                ->where('report_date', $reportDate)
                ->when($clinicId, function ($query) use ($clinicId) {
                    $query->where('clinic_id', $clinicId);
                })
                ->first();
        });
    }
}
