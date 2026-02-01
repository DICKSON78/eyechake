<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBillPayment;
use App\Models\ExpensePayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class FinancialManagementReportsController extends Controller
{
    use ApiResponse;

    public function getBalanceSheetReport(Request $request)
    {
        $request->validate([
            'report_period' => 'sometimes|in:daily,monthly',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $report_period = $request->report_period ?? 'daily';
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        // Set default date range if not provided
        if (!$start_date || !$end_date) {
            if ($report_period === 'monthly') {
                $start_date = Carbon::now()->startOfMonth()->format('Y-m-d');
                $end_date = Carbon::now()->endOfMonth()->format('Y-m-d');
            } else {
                $start_date = Carbon::today()->format('Y-m-d');
                $end_date = Carbon::today()->format('Y-m-d');
            }
        }

        // Determine date grouping based on report period
        $dateFormat = $report_period === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
        $dateGroupBy = $report_period === 'monthly' 
            ? DB::raw("DATE_FORMAT(created_at, '%Y-%m') as period")
            : DB::raw("DATE(created_at) as period");

        // Get DEBIT (Income/Revenue) - Patient Payments
        $debitQuery = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->select(
                $dateGroupBy,
                DB::raw('SUM(amount) as total_debit'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw("'Patient Payment' as source")
            )
            ->groupBy('period');

        // Get DEBIT (Income/Revenue) - Bill Payments
        $billPaymentQuery = PatientItemBillPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->select(
                $dateGroupBy,
                DB::raw('SUM(amount) as total_debit'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw("'Bill Payment' as source")
            )
            ->groupBy('period');

        // Get CREDIT (Expenses) - Expense Payments
        $creditQuery = ExpensePayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->select(
                $dateGroupBy,
                DB::raw('SUM(amount) as total_credit'),
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw("'Expense Payment' as source")
            )
            ->groupBy('period');

        $debits = $debitQuery->get()->toArray();
        $billPayments = $billPaymentQuery->get()->toArray();
        $credits = $creditQuery->get()->toArray();

        // Combine all debits
        $allDebits = array_merge($debits, $billPayments);

        // Group by period and calculate totals
        $periodData = [];
        
        // Process debits
        foreach ($allDebits as $debit) {
            $period = $debit['period'];
            if (!isset($periodData[$period])) {
                $periodData[$period] = [
                    'period' => $period,
                    'total_debit' => 0,
                    'total_credit' => 0,
                    'balance' => 0,
                    'debit_details' => [],
                    'credit_details' => [],
                ];
            }
            $periodData[$period]['total_debit'] += floatval($debit['total_debit']);
            $periodData[$period]['debit_details'][] = [
                'source' => $debit['source'],
                'amount' => floatval($debit['total_debit']),
                'transaction_count' => intval($debit['transaction_count']),
            ];
        }

        // Process credits
        foreach ($credits as $credit) {
            $period = $credit['period'];
            if (!isset($periodData[$period])) {
                $periodData[$period] = [
                    'period' => $period,
                    'total_debit' => 0,
                    'total_credit' => 0,
                    'balance' => 0,
                    'debit_details' => [],
                    'credit_details' => [],
                ];
            }
            $periodData[$period]['total_credit'] += floatval($credit['total_credit']);
            $periodData[$period]['credit_details'][] = [
                'source' => $credit['source'],
                'amount' => floatval($credit['total_credit']),
                'transaction_count' => intval($credit['transaction_count']),
            ];
        }

        // Calculate balance for each period
        foreach ($periodData as &$data) {
            $data['balance'] = $data['total_debit'] - $data['total_credit'];
        }

        // Sort by period
        ksort($periodData);

        // Calculate grand totals
        $grandTotalDebit = array_sum(array_column($periodData, 'total_debit'));
        $grandTotalCredit = array_sum(array_column($periodData, 'total_credit'));
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
}

