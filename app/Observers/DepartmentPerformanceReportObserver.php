<?php

namespace App\Observers;

use App\Models\DepartmentPerformanceReport;
use App\Models\DepartmentPerformanceAuditLog;
use Illuminate\Support\Facades\Cache;

class DepartmentPerformanceReportObserver
{
    /**
     * Handle the DepartmentPerformanceReport "created" event.
     */
    public function created(DepartmentPerformanceReport $report): void
    {
        // Log the creation
        DepartmentPerformanceAuditLog::logAction(
            $report->department,
            'Created',
            $report->created_by,
            null,
            [
                'report_date' => $report->report_date,
                'kpi_data' => $report->kpi_data,
            ],
            "Report created for {$report->report_date}",
            $report->clinic_id
        );

        // Clear relevant caches
        $this->clearCaches($report->department, $report->clinic_id);
    }

    /**
     * Handle the DepartmentPerformanceReport "updated" event.
     */
    public function updated(DepartmentPerformanceReport $report): void
    {
        // Log the update
        $changes = $report->getDirty();
        
        DepartmentPerformanceAuditLog::logAction(
            $report->department,
            'Updated',
            $report->created_by,
            null,
            $changes,
            "Report updated for {$report->report_date}",
            $report->clinic_id
        );

        // Clear relevant caches
        $this->clearCaches($report->department, $report->clinic_id);
    }

    /**
     * Clear relevant caches
     */
    private function clearCaches($department, $clinicId)
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
}
