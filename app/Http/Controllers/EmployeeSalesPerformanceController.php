<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBillPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EmployeeSalesPerformanceController extends Controller
{
    use ApiResponse;

    /**
     * Get sales performance for a specific employee
     *
     * @param Request $request
     * @param int $employeeId
     * @return \Illuminate\Http\Response
     */
    public function getEmployeeSalesPerformance(Request $request, $employeeId)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $start_date = $request->start_date ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfMonth()->format('Y-m-d');

        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        // Initiated deals: Items created by this employee (items added to patient carts)
        $initiatedDeals = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('payment_cache.check_in.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('created_by', $employeeId)
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->select(
                DB::raw('COUNT(*) as deal_count'),
                DB::raw('SUM(unit_price * quantity) as total_value')
            )
            ->first();

        // Closed deals: Payments created by this employee
        $closedPayments = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('created_by', $employeeId)
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->select(
                DB::raw('COUNT(*) as deal_count'),
                DB::raw('SUM(amount - discount) as total_value')
            )
            ->first();

        // Closed deals: Bill payments created by this employee
        $closedBillPayments = PatientItemBillPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('created_by', $employeeId)
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->select(
                DB::raw('COUNT(*) as deal_count'),
                DB::raw('SUM(amount) as total_value')
            )
            ->first();

        $initiatedDealsCount = $initiatedDeals->deal_count ?? 0;
        $initiatedDealsValue = $initiatedDeals->total_value ?? 0;
        $closedDealsCount = ($closedPayments->deal_count ?? 0) + ($closedBillPayments->deal_count ?? 0);
        $closedDealsValue = ($closedPayments->total_value ?? 0) + ($closedBillPayments->total_value ?? 0);

        // Conversion rate
        $conversionRate = $initiatedDealsCount > 0 
            ? round(($closedDealsCount / $initiatedDealsCount) * 100, 2) 
            : 0;

        return $this->sendResponse([
            'employee_id' => $employeeId,
            'period' => [
                'start_date' => $start_date,
                'end_date' => $end_date,
            ],
            'initiated_deals' => [
                'count' => $initiatedDealsCount,
                'total_value' => $initiatedDealsValue,
            ],
            'closed_deals' => [
                'count' => $closedDealsCount,
                'total_value' => $closedDealsValue,
            ],
            'conversion_rate' => $conversionRate,
        ], Response::HTTP_OK, 'Employee sales performance retrieved successfully.');
    }

    /**
     * Get sales performance for all employees
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function getAllEmployeesSalesPerformance(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $user = $request->user();
        $start_date = $request->start_date ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfMonth()->format('Y-m-d');
        $per_page = $request->per_page ?? 25;

        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        // Get all employees
        $employees = \App\Models\User::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            })
            ->where('status', 'Active')
            ->where('role', '!=', 'Admin')
            ->with(['department', 'job_title'])
            ->get();

        $performanceData = $employees->map(function ($employee) use ($start_date, $end_date, $clinic_id) {
            // Initiated deals
            $initiatedDeals = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('payment_cache.check_in.creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('created_by', $employee->id)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->select(
                    DB::raw('COUNT(*) as deal_count'),
                    DB::raw('SUM(unit_price * quantity) as total_value')
                )
                ->first();

            // Closed deals - Payments
            $closedPayments = PatientItemPayment::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('created_by', $employee->id)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->select(
                    DB::raw('COUNT(*) as deal_count'),
                    DB::raw('SUM(amount - discount) as total_value')
                )
                ->first();

            // Closed deals - Bill Payments
            $closedBillPayments = PatientItemBillPayment::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('created_by', $employee->id)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->select(
                    DB::raw('COUNT(*) as deal_count'),
                    DB::raw('SUM(amount) as total_value')
                )
                ->first();

            $initiatedCount = $initiatedDeals->deal_count ?? 0;
            $initiatedValue = $initiatedDeals->total_value ?? 0;
            $closedCount = ($closedPayments->deal_count ?? 0) + ($closedBillPayments->deal_count ?? 0);
            $closedValue = ($closedPayments->total_value ?? 0) + ($closedBillPayments->total_value ?? 0);

            $conversionRate = $initiatedCount > 0 
                ? round(($closedCount / $initiatedCount) * 100, 2) 
                : 0;

            return [
                'employee_id' => $employee->id,
                'employee_name' => $employee->full_name,
                'employee_number' => $employee->employee_number,
                'department' => $employee->department->name ?? 'N/A',
                'job_title' => $employee->job_title->name ?? 'N/A',
                'initiated_deals' => [
                    'count' => $initiatedCount,
                    'total_value' => $initiatedValue,
                ],
                'closed_deals' => [
                    'count' => $closedCount,
                    'total_value' => $closedValue,
                ],
                'conversion_rate' => $conversionRate,
            ];
        })->sortByDesc(function ($item) {
            return $item['closed_deals']['total_value'];
        })->values();

        $total = $performanceData->count();
        $paginatedData = $performanceData->forPage($request->page ?? 1, $per_page)->values();

        return $this->sendResponse([
            'data' => $paginatedData,
            'total' => $total,
            'page' => (int) ($request->page ?? 1),
            'per_page' => (int) $per_page,
            'period' => [
                'start_date' => $start_date,
                'end_date' => $end_date,
            ],
        ], Response::HTTP_OK, 'All employees sales performance retrieved successfully.');
    }
}

