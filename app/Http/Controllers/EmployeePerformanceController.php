<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBillPayment;
use App\Models\PatientPaymentCacheItem;
use App\Models\ExpensePayment;
use App\Models\Consultation;
use App\Models\DoctorTask;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EmployeePerformanceController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'department_id' => 'sometimes|exists:departments,id',
            'job_title_id' => 'sometimes|exists:job_titles,id',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $start_date = $request->start_date ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfMonth()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Get all active users/employees
        $usersQuery = User::query()
            ->with(['department', 'job_title', 'clinic'])
            ->where('status', 'Active');

        if ($clinic_id) {
            $usersQuery->where('clinic_id', $clinic_id);
        }

        if ($request->department_id) {
            $usersQuery->where('department_id', $request->department_id);
        }

        if ($request->job_title_id) {
            $usersQuery->where('job_title_id', $request->job_title_id);
        }

        if ($request->user_id) {
            $usersQuery->where('id', $request->user_id);
        }

        $users = $usersQuery->get();

        $performanceData = [];

        foreach ($users as $employee) {
            $employeeId = $employee->id;

            // Sales Performance - Payments created by employee
            $totalSales = PatientItemPayment::query()
                ->where('created_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->sum(DB::raw('amount - discount'));

            // Bill Payments created by employee
            $billPayments = PatientItemBillPayment::query()
                ->where('created_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->sum('amount');

            $totalSales += $billPayments;

            // Number of transactions
            $transactionCount = PatientItemPayment::query()
                ->where('created_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count() + PatientItemBillPayment::query()
                ->where('created_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Items Served/Dispensed by employee
            $itemsServed = PatientPaymentCacheItem::query()
                ->where('served_by', $employeeId)
                ->where('status', 'Served')
                ->whereNotNull('served_at')
                ->whereDate('served_at', '>=', $start_date)
                ->whereDate('served_at', '<=', $end_date)
                ->count();

            // Total value of items served
            $itemsServedValue = PatientPaymentCacheItem::query()
                ->where('served_by', $employeeId)
                ->where('status', 'Served')
                ->whereNotNull('served_at')
                ->whereDate('served_at', '>=', $start_date)
                ->whereDate('served_at', '<=', $end_date)
                ->sum(DB::raw('unit_price * quantity'));

            // Consultations performed (for doctors)
            $consultationsCount = Consultation::query()
                ->where('created_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Expenses managed
            $expensesManaged = ExpensePayment::query()
                ->where('created_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->sum('amount');

            // Tasks completed
            $tasksCompleted = DoctorTask::query()
                ->where('doctor_id', $employeeId)
                ->where('status', 'completed')
                ->whereNotNull('completed_at')
                ->whereDate('completed_at', '>=', $start_date)
                ->whereDate('completed_at', '<=', $end_date)
                ->count();

            // Tasks assigned (for managers)
            $tasksAssigned = DoctorTask::query()
                ->where('assigned_by', $employeeId)
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();

            // Calculate performance score (weighted)
            $performanceScore = 0;
            $maxScore = 100;

            // Sales weight: 30%
            $salesScore = min(($totalSales / 1000000) * 30, 30); // Normalize to 1M = 30 points

            // Transactions weight: 20%
            $transactionScore = min(($transactionCount / 100) * 20, 20); // Normalize to 100 transactions = 20 points

            // Items served weight: 20%
            $itemsScore = min(($itemsServed / 200) * 20, 20); // Normalize to 200 items = 20 points

            // Consultations weight: 15% (for doctors)
            $consultationScore = min(($consultationsCount / 50) * 15, 15); // Normalize to 50 consultations = 15 points

            // Tasks completed weight: 10%
            $tasksScore = min(($tasksCompleted / 20) * 10, 10); // Normalize to 20 tasks = 10 points

            // Expenses efficiency weight: 5% (lower is better, so inverse)
            $expenseScore = max(0, 5 - (($expensesManaged / 100000) * 5)); // Normalize

            $performanceScore = $salesScore + $transactionScore + $itemsScore + $consultationScore + $tasksScore + $expenseScore;
            $performanceScore = min($performanceScore, $maxScore);

            // Calculate average transaction value
            $avgTransactionValue = $transactionCount > 0 ? ($totalSales / $transactionCount) : 0;

            // Calculate working days in period
            $workingDays = $this->getWorkingDays($start_date, $end_date);
            $avgDailySales = $workingDays > 0 ? ($totalSales / $workingDays) : 0;
            $avgDailyTransactions = $workingDays > 0 ? ($transactionCount / $workingDays) : 0;

            $performanceData[] = [
                'user_id' => $employee->id,
                'employee_name' => $employee->full_name ?? '',
                'employee_number' => $employee->employee_number ?? null,
                'department' => $employee->department ? $employee->department->name : null,
                'job_title' => $employee->job_title ? $employee->job_title->name : null,
                'role' => $employee->role ?? null,
                'designation' => $employee->designation ?? null,
                'metrics' => [
                    'total_sales' => round($totalSales, 2),
                    'transaction_count' => $transactionCount,
                    'avg_transaction_value' => round($avgTransactionValue, 2),
                    'items_served' => $itemsServed,
                    'items_served_value' => round($itemsServedValue, 2),
                    'consultations_count' => $consultationsCount,
                    'expenses_managed' => round($expensesManaged, 2),
                    'tasks_completed' => $tasksCompleted,
                    'tasks_assigned' => $tasksAssigned,
                    'avg_daily_sales' => round($avgDailySales, 2),
                    'avg_daily_transactions' => round($avgDailyTransactions, 2),
                ],
                'performance_score' => round($performanceScore, 2),
                'performance_rating' => $this->getPerformanceRating($performanceScore),
            ];
        }

        // Sort by performance score descending
        usort($performanceData, function ($a, $b) {
            return $b['performance_score'] <=> $a['performance_score'];
        });

        // Paginate manually
        $page = $request->page ?? 1;
        $offset = ($page - 1) * $per_page;
        $paginatedData = array_slice($performanceData, $offset, $per_page);

        $result = [
            'data' => $paginatedData,
            'total' => count($performanceData),
            'per_page' => $per_page,
            'current_page' => $page,
            'last_page' => ceil(count($performanceData) / $per_page),
        ];

        return $this->sendResponse($result, Response::HTTP_OK, 'Employee performance data retrieved successfully.');
    }

    private function getWorkingDays($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $days = 0;

        while ($start <= $end) {
            // Count all days (you can modify this to exclude weekends if needed)
            $days++;
            $start->addDay();
        }

        return max($days, 1); // At least 1 day
    }

    private function getPerformanceRating($score)
    {
        if ($score >= 80) {
            return 'Excellent';
        } elseif ($score >= 60) {
            return 'Good';
        } elseif ($score >= 40) {
            return 'Average';
        } elseif ($score >= 20) {
            return 'Below Average';
        } else {
            return 'Needs Improvement';
        }
    }
}

