<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Expense;
use App\Models\PatientItemPayment;
use App\Models\Capital;
use Carbon\Carbon;

class GenerateBalanceSheet extends Command
{
    protected $signature = 'report:generateBalanceSheet {period=daily}';
    protected $description = 'Generate a balance sheet including income, expenses, and capital';

    public function handle()
    {
        $period = $this->argument('period');

        // Determine date range based on period
        $dates = $this->getDateRange($period);

        $income = PatientItemPayment::whereBetween('created_at', [$dates['start'], $dates['end']])->sum('amount');
        $expenses = Expense::whereBetween('expense_date', [$dates['start'], $dates['end']])->sum('total_amount');
        $capital = Capital::whereBetween('created_at', [$dates['start'], $dates['end']])->sum('amount');

        $expenseDetails = Expense::select('category', DB::raw('sum(total_amount) as total'))
            ->whereBetween('expense_date', [$dates['start'], $dates['end']])
            ->groupBy('category')
            ->get();

        $incomeDetails = PatientItemPayment::select('source', DB::raw('sum(amount) as total'))
            ->whereBetween('created_at', [$dates['start'], $dates['end']])
            ->groupBy('source')
            ->get();

        $balanceSheet = [
            'income' => $income,
            'expenses' => $expenses,
            'capital' => $capital,
            'net_balance' => $income - $expenses + $capital,
            'expense_details' => $expenseDetails,
            'income_details' => $incomeDetails,
        ];

        // Here you would generate the PDF and store it

        $this->info("Balance Sheet Generated Successfully!");
    }

    private function getDateRange($period)
    {
        switch ($period) {
            case 'weekly':
                return [
                    'start' => Carbon::now()->startOfWeek()->format('Y-m-d'),
                    'end' => Carbon::now()->endOfWeek()->format('Y-m-d'),
                ];
            case 'monthly':
                return [
                    'start' => Carbon::now()->startOfMonth()->format('Y-m-d'),
                    'end' => Carbon::now()->endOfMonth()->format('Y-m-d'),
                ];
            case 'quarterly':
                return [
                    'start' => Carbon::now()->firstOfQuarter()->format('Y-m-d'),
                    'end' => Carbon::now()->lastOfQuarter()->format('Y-m-d'),
                ];
            case 'yearly':
                return [
                    'start' => Carbon::now()->startOfYear()->format('Y-m-d'),
                    'end' => Carbon::now()->endOfYear()->format('Y-m-d'),
                ];
            default: // daily
                return [
                    'start' => Carbon::today()->format('Y-m-d'),
                    'end' => Carbon::today()->format('Y-m-d'),
                ];
        }
    }
}
