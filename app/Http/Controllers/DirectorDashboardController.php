<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\ExpensePayment;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Consultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DirectorDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        
        // Default to today if no dates provided
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Default allow: if user missing or role unspecified, do not restrict by clinic
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $data = [
            'summary' => [],
            'statistics' => [],
        ];

        // Today's Patients count
        $data['summary']['today_patients'] = Patient::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('checkIns', function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Total Patients Registered in date range
        $data['summary']['total_patients_registered'] = Patient::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('checkIns', function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Web Appointment Bookings in date range
        $data['summary']['web_appointment_bookings'] = Appointment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                // Assuming appointments are clinic-specific or we can add clinic filtering later
                // For now, return all web appointments
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Total Revenue (actual payments linked to cache items, no orphans)
        try {
            $revenueQuery = PatientItemPayment::query()
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.item_payment_id', 'patient_item_payments.id');
                });
            
            if ($clinic_id) {
                $revenueQuery->whereIn('patient_item_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Use net amount (amount - discount) to match Daily Cash Collection subtotal
            $itemPayments = (float) ($revenueQuery->selectRaw('SUM(patient_item_payments.amount - COALESCE(patient_item_payments.discount, 0)) as net')->first()->net ?? 0);
            
            // Add actual bill payments (not bill face values)
            $billPaymentsQuery = PatientItemBillPayment::query()
                ->whereNotNull('patient_item_bill_payments.created_at')
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id');
                });
            
            if ($clinic_id) {
                $billPaymentsQuery->whereIn('patient_item_bill_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $billPayments = (float) $billPaymentsQuery->sum('patient_item_bill_payments.amount');
            
            $data['summary']['total_sales'] = $itemPayments + $billPayments;
        } catch (\Exception $e) {
            \Log::error('Error calculating total sales', ['error' => $e->getMessage()]);
            $data['summary']['total_sales'] = 0;
        }

        // Total Expenses
        try {
            $expensesQuery = ExpensePayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
            
            if ($clinic_id) {
                $expensesQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['total_expenses'] = $expensesQuery->sum('amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating total expenses', ['error' => $e->getMessage()]);
            $data['summary']['total_expenses'] = 0;
        }

        // Note: total_purchases will be calculated later as sum of all COGS categories
        $data['summary']['total_purchases'] = 0;

        // Net Profit (will be recalculated later after COGS)
        $data['summary']['net_profit'] = $data['summary']['total_sales'] - $data['summary']['total_expenses'];

        // Alias total_revenue for Financial Management compatibility
        $data['summary']['total_revenue'] = $data['summary']['total_sales'];

        // Daily collections: actual payments linked to cache items
        try {
            $dailyItemQuery = PatientItemPayment::query()
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.item_payment_id', 'patient_item_payments.id');
                });
            
            if ($clinic_id) {
                $dailyItemQuery->whereIn('patient_item_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Use net amount (amount - discount) to match Daily Cash Collection subtotal
            $dailyCollections = (float) ($dailyItemQuery->selectRaw('SUM(patient_item_payments.amount - COALESCE(patient_item_payments.discount, 0)) as net')->first()->net ?? 0);

            // Add bill payments
            $dailyBillQuery = PatientItemBillPayment::query()
                ->whereNotNull('patient_item_bill_payments.created_at')
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id');
                });
            
            if ($clinic_id) {
                $dailyBillQuery->whereIn('patient_item_bill_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $billPaymentsCollections = (float) $dailyBillQuery->sum('patient_item_bill_payments.amount');
            $data['summary']['daily_collections'] = $dailyCollections + $billPaymentsCollections;
        } catch (\Exception $e) {
            \Log::error('Error calculating daily collections', ['error' => $e->getMessage()]);
            $data['summary']['daily_collections'] = 0;
        }

        // Pending bills: total amount of bills with status 'Pending' created in date range
        $data['summary']['pending_bills'] = PatientItemBill::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        // Running Cost & Improvement Cost (by expense category name match) - matching Financial Management
        try {
            if ($clinic_id) {
                $runningCostQuery = DB::table('expense_payments as expp')
                    ->join('expenses as exp', 'expp.expense_id', '=', 'exp.id')
                    ->join('expense_categories as cat', 'exp.category_id', '=', 'cat.id')
                    ->join('users as u', 'expp.created_by', '=', 'u.id')
                    ->where('u.clinic_id', $clinic_id)
                    ->whereBetween(DB::raw('DATE(expp.created_at)'), [$start_date, $end_date])
                    ->where('expp.amount', '>', 0)
                    ->whereRaw('LOWER(cat.name) LIKE ?', ['%running%']);

                $improvementCostQuery = DB::table('expense_payments as expp')
                    ->join('expenses as exp', 'expp.expense_id', '=', 'exp.id')
                    ->join('expense_categories as cat', 'exp.category_id', '=', 'cat.id')
                    ->join('users as u', 'expp.created_by', '=', 'u.id')
                    ->where('u.clinic_id', $clinic_id)
                    ->whereBetween(DB::raw('DATE(expp.created_at)'), [$start_date, $end_date])
                    ->where('expp.amount', '>', 0)
                    ->whereRaw('LOWER(cat.name) LIKE ?', ['%improvement%']);
            } else {
                $runningCostQuery = DB::table('expense_payments as expp')
                    ->join('expenses as exp', 'expp.expense_id', '=', 'exp.id')
                    ->join('expense_categories as cat', 'exp.category_id', '=', 'cat.id')
                    ->whereBetween(DB::raw('DATE(expp.created_at)'), [$start_date, $end_date])
                    ->where('expp.amount', '>', 0)
                    ->whereRaw('LOWER(cat.name) LIKE ?', ['%running%']);

                $improvementCostQuery = DB::table('expense_payments as expp')
                    ->join('expenses as exp', 'expp.expense_id', '=', 'exp.id')
                    ->join('expense_categories as cat', 'exp.category_id', '=', 'cat.id')
                    ->whereBetween(DB::raw('DATE(expp.created_at)'), [$start_date, $end_date])
                    ->where('expp.amount', '>', 0)
                    ->whereRaw('LOWER(cat.name) LIKE ?', ['%improvement%']);
            }

            $data['summary']['running_cost'] = (float) $runningCostQuery->sum('expp.amount');
            $data['summary']['improvement_cost'] = (float) $improvementCostQuery->sum('expp.amount');
        } catch (\Exception $e) {
            \Log::error('Error calculating running/improvement costs', ['error' => $e->getMessage()]);
            $data['summary']['running_cost'] = 0;
            $data['summary']['improvement_cost'] = 0;
        }

        // Expense payments total (alias for Financial Management compatibility)
        $data['summary']['expense_payments'] = $data['summary']['total_expenses'];

        // Revenue from New Consultation/Patient - sum consultation item amounts, not full payment
        try {
            // Cash payments - calculate proportional amount for consultation items
            $newCashQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_payments as pip', 'ppci.item_payment_id', '=', 'pip.id')
                ->join('consultations as c', 'ppci.id', '=', 'c.payment_cache_item_id')
                ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                ->whereNotNull('pip.created_at')
                ->where('pip.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pip.created_at', '<=', $end_date . ' 23:59:59')
                ->where('c.patient_direction', 'Direct to Doctor');
            
            if ($clinic_id) {
                $newCashQuery->whereIn('pip.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $newCash = (float) ($newCashQuery->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pip.amount - COALESCE(pip.discount, 0))) as net')->first()->net ?? 0);

            // Bill payments
            $newBillQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_bill_payments as pip', 'ppci.bill_id', '=', 'pip.bill_id')
                ->join('consultations as c', 'ppci.id', '=', 'c.payment_cache_item_id')
                ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                ->whereNotNull('pip.created_at')
                ->where('pip.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pip.created_at', '<=', $end_date . ' 23:59:59')
                ->where('c.patient_direction', 'Direct to Doctor');
            
            if ($clinic_id) {
                $newBillQuery->whereIn('pip.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $newBill = (float) ($newBillQuery->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pip.amount) as net')->first()->net ?? 0);

            $data['summary']['revenue_new_consultation'] = $newCash + $newBill;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from new consultation', ['error' => $e->getMessage()]);
            $data['summary']['revenue_new_consultation'] = 0;
        }

        // Revenue from Return Consultation - sum return consultation item amounts, not full payment
        try {
            // Cash payments
            $returnCashQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_payments as pip', 'ppci.item_payment_id', '=', 'pip.id')
                ->join('consultations as c', 'ppci.id', '=', 'c.payment_cache_item_id')
                ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                ->whereNotNull('pip.created_at')
                ->where('pip.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pip.created_at', '<=', $end_date . ' 23:59:59')
                ->where('c.patient_to_return', 'Yes');
            
            if ($clinic_id) {
                $returnCashQuery->whereIn('pip.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $returnCash = (float) ($returnCashQuery->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pip.amount - COALESCE(pip.discount, 0))) as net')->first()->net ?? 0);

            // Bill payments
            $returnBillQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('patient_item_bill_payments as pip', 'ppci.bill_id', '=', 'pip.bill_id')
                ->join('consultations as c', 'ppci.id', '=', 'c.payment_cache_item_id')
                ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                ->whereNotNull('pip.created_at')
                ->where('pip.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pip.created_at', '<=', $end_date . ' 23:59:59')
                ->where('c.patient_to_return', 'Yes');
            
            if ($clinic_id) {
                $returnBillQuery->whereIn('pip.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $returnBill = (float) ($returnBillQuery->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pip.amount) as net')->first()->net ?? 0);

            $data['summary']['revenue_return_consultation'] = $returnCash + $returnBill;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from return consultation', ['error' => $e->getMessage()]);
            $data['summary']['revenue_return_consultation'] = 0;
        }

        // Total Revenue from All Consultations (must equal New + Return consultation cards)
        $data['summary']['revenue_all_consultations'] =
            ($data['summary']['revenue_new_consultation'] ?? 0)
            + ($data['summary']['revenue_return_consultation'] ?? 0);

        // Total Discount
        try {
            $discountQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('discount', '>', 0);
            
            if ($clinic_id) {
                $discountQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['discount'] = $discountQuery->sum('discount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating total discount', ['error' => $e->getMessage()]);
            $data['summary']['discount'] = 0;
        }

        // Consultation Revenue (consultation_type_id = 4 = 'Others' in database)
        try {
            $consultationSalesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->where('ppci.consultation_type_id', 4);
            
            if ($clinic_id) {
                $consultationSalesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['consultation'] = $consultationSalesQuery->sum(DB::raw('ppci.unit_price * ppci.quantity')) ?? 0;
            
            // Consultation Purchases (COGS)
            $consultationPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->where('ppci.consultation_type_id', 4);
            
            if ($clinic_id) {
                $consultationPurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['consultation_purchases'] = $consultationPurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['consultation_profit'] = $data['summary']['consultation'] - $data['summary']['consultation_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating consultation sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['consultation'] = 0;
            $data['summary']['consultation_purchases'] = 0;
            $data['summary']['consultation_profit'] = 0;
        }

        // Pharmacy Sales (consultation_type_id = 1 = 'Pharmacy')
        try {
            $pharmacySalesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->whereRaw('LOWER(ct.name) = ?', ['pharmacy']);
            
            if ($clinic_id) {
                $pharmacySalesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['pharmacy'] = $pharmacySalesQuery->sum(DB::raw('ppci.unit_price * ppci.quantity')) ?? 0;
            
            // Pharmacy Purchases (COGS)
            $pharmacyPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->whereRaw('LOWER(ct.name) = ?', ['pharmacy']);
            
            if ($clinic_id) {
                $pharmacyPurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['pharmacy_purchases'] = $pharmacyPurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['pharmacy_profit'] = $data['summary']['pharmacy'] - $data['summary']['pharmacy_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating pharmacy sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['pharmacy'] = 0;
            $data['summary']['pharmacy_purchases'] = 0;
            $data['summary']['pharmacy_profit'] = 0;
        }

        // Glass Sales (consultation_type_id = 2 = 'Glass')
        try {
            $glassSalesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->whereRaw('LOWER(ct.name) = ?', ['glass'])
                ->where('it.item_type_id', '!=', 4); // Exclude frames
            
            if ($clinic_id) {
                $glassSalesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['glass'] = $glassSalesQuery->sum(DB::raw('ppci.unit_price * ppci.quantity')) ?? 0;
            
            // Glass Purchases (COGS)
            $glassPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->whereRaw('LOWER(ct.name) = ?', ['glass'])
                ->where('it.item_type_id', '!=', 4); // Exclude frames
            
            if ($clinic_id) {
                $glassPurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['glass_purchases'] = $glassPurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['glass_profit'] = $data['summary']['glass'] - $data['summary']['glass_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating glass sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['glass'] = 0;
            $data['summary']['glass_purchases'] = 0;
            $data['summary']['glass_profit'] = 0;
        }

        // Frame Sales (item_type_id = 4 = 'Frame')
        try {
            $frameSalesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->where('it.item_type_id', 4);
            
            if ($clinic_id) {
                $frameSalesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['frame'] = $frameSalesQuery->sum(DB::raw('ppci.unit_price * ppci.quantity')) ?? 0;
            
            // Frame Purchases (COGS)
            $framePurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->whereIn('ppci.status', ['Paid', 'Billed', 'Served'])
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '>=', $start_date)
                ->whereDate(DB::raw('COALESCE(ppci.served_at, ppci.created_at)'), '<=', $end_date)
                ->where('it.item_type_id', 4);
            
            if ($clinic_id) {
                $framePurchasesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['frame_purchases'] = $framePurchasesQuery->sum(DB::raw('COALESCE(it.unit_buying_price, 0) * ppci.quantity')) ?? 0;
            $data['summary']['frame_profit'] = $data['summary']['frame'] - $data['summary']['frame_purchases'];
            
        } catch (\Exception $e) {
            \Log::error('Error calculating frame sales/purchases', ['error' => $e->getMessage()]);
            $data['summary']['frame'] = 0;
            $data['summary']['frame_purchases'] = 0;
            $data['summary']['frame_profit'] = 0;
        }

        // Calculate Total Purchases as sum of all COGS categories (for display only)
        $data['summary']['total_purchases'] = 
            ($data['summary']['consultation_purchases'] ?? 0) +
            ($data['summary']['pharmacy_purchases'] ?? 0) +
            ($data['summary']['glass_purchases'] ?? 0) +
            ($data['summary']['frame_purchases'] ?? 0);

        // Net Profit = Revenue - Expenses (simple formula matching Financial Management)
        // Note: COGS is tracked separately for reporting but not deducted from net profit

        // Consulted Patients (patients who have been consulted)
        try {
            $data['summary']['consulted_patients'] = Consultation::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Consulted')
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date)
                ->count();
        } catch (\Exception $e) {
            \Log::error('Error calculating consulted patients', ['error' => $e->getMessage()]);
            $data['summary']['consulted_patients'] = 0;
        }

        // Total Transactions
        $data['summary']['total_transactions'] = PatientItemPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count() + PatientItemBillPayment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        // Sales by Product Category (Item Types) - Calculate from actual payments with proportional net amounts
        if ($clinic_id) {
            $data['statistics']['sales_by_category'] = DB::select("
                SELECT 
                    category_name as name,
                    SUM(net_amount) as total_sales,
                    COUNT(*) as transaction_count
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pip.amount - COALESCE(pip.discount, 0)) as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                        AND pip.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pibp.amount as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                        AND pibp.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                ) as combined
                GROUP BY category_name
                ORDER BY total_sales DESC
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id, $start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id]);
        } else {
            $data['statistics']['sales_by_category'] = DB::select("
                SELECT 
                    category_name as name,
                    SUM(net_amount) as total_sales,
                    COUNT(*) as transaction_count
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pip.amount - COALESCE(pip.discount, 0)) as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pibp.amount as net_amount
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                ) as combined
                GROUP BY category_name
                ORDER BY total_sales DESC
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);
        }

        // Top Selling Items - Calculate from actual payments with proportional net amounts
        if ($clinic_id) {
            $data['statistics']['top_selling_items'] = DB::select("
                SELECT 
                    item_id as id,
                    item_name as name,
                    category_name,
                    SUM(net_amount) as total_sales,
                    SUM(qty) as total_quantity
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pip.amount - COALESCE(pip.discount, 0)) as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                        AND pip.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pibp.amount as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                        AND pibp.created_by IN (SELECT id FROM users WHERE clinic_id = ?)
                ) as combined
                GROUP BY item_id, item_name, category_name
                ORDER BY total_sales DESC
                LIMIT 10
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id, $start_date . ' 00:00:00', $end_date . ' 23:59:59', $clinic_id]);
        } else {
            $data['statistics']['top_selling_items'] = DB::select("
                SELECT 
                    item_id as id,
                    item_name as name,
                    category_name,
                    SUM(net_amount) as total_sales,
                    SUM(qty) as total_quantity
                FROM (
                    -- Cash payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pip.amount - COALESCE(pip.discount, 0)) as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_payments as pip ON ppci.item_payment_id = pip.id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT item_payment_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE item_payment_id IS NOT NULL 
                        GROUP BY item_payment_id
                    ) as totals ON ppci.item_payment_id = totals.item_payment_id
                    WHERE pip.created_at >= ? AND pip.created_at <= ?
                    
                    UNION ALL
                    
                    -- Bill payments with proportional allocation
                    SELECT 
                        it.id as item_id,
                        it.name as item_name,
                        itt.name as category_name,
                        (ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pibp.amount as net_amount,
                        ppci.quantity as qty
                    FROM patient_payment_cache_items as ppci
                    INNER JOIN patient_item_bill_payments as pibp ON ppci.bill_id = pibp.bill_id
                    INNER JOIN items as it ON ppci.item_id = it.id
                    INNER JOIN item_types as itt ON it.item_type_id = itt.id
                    INNER JOIN (
                        SELECT bill_id, SUM(unit_price * quantity) as gross_total 
                        FROM patient_payment_cache_items 
                        WHERE bill_id IS NOT NULL 
                        GROUP BY bill_id
                    ) as totals ON ppci.bill_id = totals.bill_id
                    WHERE pibp.created_at >= ? AND pibp.created_at <= ?
                ) as combined
                GROUP BY item_id, item_name, category_name
                ORDER BY total_sales DESC
                LIMIT 10
            ", [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Director Dashboard data retrieved successfully.');
    }
}

