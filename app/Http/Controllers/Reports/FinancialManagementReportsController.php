<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Requests\BalanceSheetReportRequest;
use App\Models\Clinic;
use App\Models\PatientItemBill;
use App\Models\ExpensePayment;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FinancialManagementReportsController extends Controller
{
    use ApiResponse;

    /**
     * Get balance sheet report for financial management
     */
    public function getBalanceSheetReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
            'report_period' => 'sometimes|in:daily,monthly',
            'clinic_id' => 'sometimes|exists:clinics,id',
        ]);

        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $report_period = $request->report_period ?? 'daily';
        $clinic_id = $request->clinic_id ?? (auth()->check() ? auth()->user()->clinic_id : null);

        // Get patient payment cache items (debit/revenue)
        $debitData = \App\Models\PatientPaymentCacheItem::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->selectRaw('DATE(created_at) as period, SUM(unit_price * quantity) as total_debit, COUNT(*) as debit_count')
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period,
                    'total_debit' => floatval($item->total_debit),
                    'debit_count' => $item->debit_count,
                ];
            })
            ->keyBy('period');

        // Get expense payments (credit/expenses)
        $creditData = \App\Models\ExpensePayment::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->selectRaw('DATE(created_at) as period, SUM(amount) as total_credit, COUNT(*) as credit_count')
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period,
                    'total_credit' => floatval($item->total_credit),
                    'credit_count' => $item->credit_count,
                ];
            })
            ->keyBy('period');

        // Merge debit and credit data by period
        $periodData = [];
        $grandTotalDebit = 0;
        $grandTotalCredit = 0;

        $current = Carbon::parse($start_date);
        $end = Carbon::parse($end_date);

        while ($current <= $end) {
            $period = $current->format('Y-m-d');
            
            $debit = $debitData->get($period, ['total_debit' => 0, 'debit_count' => 0]);
            $credit = $creditData->get($period, ['total_credit' => 0, 'credit_count' => 0]);

            $totalDebit = $debit['total_debit'];
            $totalCredit = $credit['total_credit'];
            $balance = $totalDebit - $totalCredit;

            $grandTotalDebit += $totalDebit;
            $grandTotalCredit += $totalCredit;

            $periodData[] = [
                'period' => $period,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'balance' => $balance,
                'debit_details' => [
                    [
                        'source' => 'Patient Payment',
                        'amount' => $totalDebit,
                        'transaction_count' => $debit['debit_count'],
                    ]
                ],
                'credit_details' => [
                    [
                        'source' => 'Expense Payment',
                        'amount' => $totalCredit,
                        'transaction_count' => $credit['credit_count'],
                    ]
                ],
            ];

            $current->addDay();
        }

        $grandBalance = $grandTotalDebit - $grandTotalCredit;

        // Format period for display
        foreach ($periodData as &$data) {
            if ($report_period === 'monthly') {
                $date = Carbon::createFromFormat('Y-m', $data['period']);
                $data['period_display'] = $date->format('F Y');
            } else {
                $date = Carbon::createFromFormat('Y-m-d', $data['period']);
                $data['period_display'] = $date->format('d M Y');
            }
        }

        // Add summary to each data item for easier access
        $dataWithSummary = array_map(function($item) use ($grandTotalDebit, $grandTotalCredit, $grandBalance) {
            return array_merge($item, [
                'grand_total_debit' => $grandTotalDebit,
                'grand_total_credit' => $grandTotalCredit,
                'grand_balance' => $grandBalance,
            ]);
        }, array_values($periodData));

        $result = [
            'data' => $dataWithSummary,
            'total' => count($dataWithSummary),
            'summary' => [
                'total_debit' => $grandTotalDebit,
                'total_credit' => $grandTotalCredit,
                'balance' => $grandBalance,
                'report_period' => $report_period,
                'start_date' => $start_date,
                'end_date' => $end_date,
            ],
        ];

        return $this->sendResponse($result, Response::HTTP_OK, 'Balance sheet retrieved successfully.');
    }
    
    /**
     * Handle dashboard requests for financial management reports
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'report_period' => 'sometimes|in:daily,monthly',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        // Always run dashboard logic to include additional fields
        $balanceSheetResponse = $this->getBalanceSheetReport($request);
        $balanceSheetData = $balanceSheetResponse->getData()->data;
        
        // Get additional financial data for dashboard
        $pendingBills = $this->getPendingBillsCount();
        $runningCost = $this->getRunningCost();
        $improvementCost = $this->getImprovementCost();
        $expensePayments = $this->getExpensePayments();
        
        // Create new summary object with additional fields
        $newSummaryFields = [
            'pending_bills' => $pendingBills,
            'running_cost' => $runningCost,
            'improvement_cost' => $improvementCost,
            'expense_payments' => $expensePayments,
            'daily_collections' => $this->getDailyCollections(),
            'statistics' => [
                'top_expense_categories' => $this->getTopExpenseCategories(),
                'payment_trends' => $this->getPaymentTrends(),
                'expense_trends' => $this->getExpenseTrends(),
            ],
        ];
        
        // Merge new fields into the existing summary in the result
        $result = [
            'data' => array_values($balanceSheetData->data),
            'total' => $balanceSheetData->total,
            'summary' => array_merge((array)$balanceSheetData->summary, $newSummaryFields),
        ];
        
        return $this->sendResponse($result, Response::HTTP_OK, 'Financial dashboard data retrieved successfully.');
    }
    
    /**
     * Get count of pending bills
     */
    private function getPendingBillsCount($clinic_id = null)
    {
        return \App\Models\PatientItemBill::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->count();
    }
    
    /**
     * Get running cost (total expenses)
     */
    private function getRunningCost($clinic_id = null)
    {
        return \App\Models\ExpensePayment::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', Carbon::today()->startOfMonth()->format('Y-m-d'))
            ->whereDate('created_at', '<=', Carbon::today()->format('Y-m-d'))
            ->sum('amount') ?: 0;
    }
    
    /**
     * Get improvement cost (total of specific improvement expenses)
     */
    private function getImprovementCost($clinic_id = null)
    {
        return \App\Models\ExpensePayment::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('expense', function ($query) {
                $query->whereHas('category', function ($categoryQuery) {
                    $categoryQuery->where('name', 'Improvement');
                });
            })
            ->whereDate('created_at', '>=', Carbon::today()->startOfMonth()->format('Y-m-d'))
            ->whereDate('created_at', '<=', Carbon::today()->format('Y-m-d'))
            ->sum('amount') ?: 0;
    }
    
    /**
     * Get total expense payments
     */
    private function getExpensePayments($clinic_id = null)
    {
        return \App\Models\ExpensePayment::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', Carbon::today()->startOfMonth()->format('Y-m-d'))
            ->whereDate('created_at', '<=', Carbon::today()->format('Y-m-d'))
            ->count();
    }
    
    /**
     * Get top expense categories for the current month
     */
    private function getTopExpenseCategories($clinic_id = null)
    {
        return \App\Models\ExpensePayment::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('expense_payments.created_at', '>=', Carbon::today()->startOfMonth()->format('Y-m-d'))
            ->whereDate('expense_payments.created_at', '<=', Carbon::today()->format('Y-m-d'))
            ->whereHas('expense', function ($query) {
                $query->whereHas('category');
            })
            ->join('expenses', 'expense_payments.expense_id', '=', 'expenses.id')
            ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->selectRaw('expense_categories.name as category, SUM(expense_payments.amount) as total_amount')
            ->groupBy('expense_categories.name')
            ->orderByRaw('total_amount DESC')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category ?? 'Uncategorized',
                    'amount' => floatval($item->total_amount),
                ];
            })
            ->toArray();
    }
    
    /**
     * Get payment trends for the last 7 days
     */
    private function getPaymentTrends($clinic_id = null)
    {
        $trends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $total = \App\Models\ExpensePayment::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', $date->format('Y-m-d'))
            ->sum('amount') ?: 0;
            
            $trends[] = [
                'date' => $date->format('M d'),
                'amount' => floatval($total),
            ];
        }
        
        return $trends;
    }
    
    /**
     * Get expense trends for the last 7 days
     */
    private function getExpenseTrends($clinic_id = null)
    {
        return $this->getPaymentTrends($clinic_id);
    }
    
    /**
     * Get daily collections (total patient payments for today)
     */
    private function getDailyCollections($clinic_id = null)
    {
        return \App\Models\PatientPaymentCacheItem::when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', Carbon::today()->format('Y-m-d'))
            ->selectRaw('SUM(unit_price * quantity) as total')
            ->value('total') ?: 0;
    }
}
