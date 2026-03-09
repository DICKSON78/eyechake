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

        // Revenue from New Consultation/Patient
        try {
            $newConsultationQuery = DB::table('patient_item_payments as pip')
                ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
                ->join('consultations as c', 'ppci.id', '=', 'c.payment_cache_item_id')
                ->join('users as u', 'pip.created_by', '=', 'u.id')
                ->whereNotNull('pip.created_at')
                ->where('pip.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pip.created_at', '<=', $end_date . ' 23:59:59')
                ->where('pip.amount', '>', 0)
                ->where('c.patient_direction', 'Direct to Doctor');
            
            if ($clinic_id) {
                $newConsultationQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['revenue_new_consultation'] = $newConsultationQuery->sum('pip.amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from new consultation', ['error' => $e->getMessage()]);
            $data['summary']['revenue_new_consultation'] = 0;
        }

        // Revenue from Return Consultation
        try {
            $returnConsultationQuery = DB::table('patient_item_payments as pip')
                ->join('patient_payment_cache_items as ppci', 'pip.id', '=', 'ppci.item_payment_id')
                ->join('consultations as c', 'ppci.id', '=', 'c.payment_cache_item_id')
                ->join('users as u', 'pip.created_by', '=', 'u.id')
                ->whereNotNull('pip.created_at')
                ->where('pip.created_at', '>=', $start_date . ' 00:00:00')
                ->where('pip.created_at', '<=', $end_date . ' 23:59:59')
                ->where('pip.amount', '>', 0)
                ->where('c.patient_to_return', 'Yes');
            
            if ($clinic_id) {
                $returnConsultationQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['revenue_return_consultation'] = $returnConsultationQuery->sum('pip.amount') ?? 0;
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

        // Sales by Product Category (Item Types)
        if ($clinic_id) {
            $data['statistics']['sales_by_category'] = DB::select('
                SELECT 
                    it.item_type_id,
                    itt.name,
                    COALESCE(SUM(ppci.unit_price * ppci.quantity), 0) as total_sales,
                    COUNT(DISTINCT ppci.id) as transaction_count
                FROM patient_payment_cache_items as ppci
                INNER JOIN items as it ON ppci.item_id = it.id
                INNER JOIN item_types as itt ON it.item_type_id = itt.id
                INNER JOIN patient_payment_cache as ppc ON ppci.payment_cache_id = ppc.id
                INNER JOIN users as u ON ppc.created_by = u.id
                WHERE u.clinic_id = ? 
                    AND ppci.status IN (?, ?, ?)
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) >= ?
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) <= ?
                GROUP BY it.item_type_id, itt.name
                ORDER BY total_sales DESC
            ', [$clinic_id, 'Paid', 'Billed', 'Served', $start_date, $end_date]);
        } else {
            $data['statistics']['sales_by_category'] = DB::select('
                SELECT 
                    it.item_type_id,
                    itt.name,
                    COALESCE(SUM(ppci.unit_price * ppci.quantity), 0) as total_sales,
                    COUNT(DISTINCT ppci.id) as transaction_count
                FROM patient_payment_cache_items as ppci
                INNER JOIN items as it ON ppci.item_id = it.id
                INNER JOIN item_types as itt ON it.item_type_id = itt.id
                WHERE ppci.status IN (?, ?, ?)
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) >= ?
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) <= ?
                GROUP BY it.item_type_id, itt.name
                ORDER BY total_sales DESC
            ', ['Paid', 'Billed', 'Served', $start_date, $end_date]);
        }

        // Top Selling Items
        if ($clinic_id) {
            $data['statistics']['top_selling_items'] = DB::select('
                SELECT 
                    it.id,
                    it.name,
                    itt.name as category_name,
                    COALESCE(SUM(ppci.unit_price * ppci.quantity), 0) as total_sales,
                    SUM(ppci.quantity) as total_quantity
                FROM patient_payment_cache_items as ppci
                INNER JOIN items as it ON ppci.item_id = it.id
                INNER JOIN item_types as itt ON it.item_type_id = itt.id
                INNER JOIN patient_payment_cache as ppc ON ppci.payment_cache_id = ppc.id
                INNER JOIN users as u ON ppc.created_by = u.id
                WHERE u.clinic_id = ? 
                    AND ppci.status IN (?, ?, ?)
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) >= ?
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) <= ?
                GROUP BY it.id, it.name, itt.name
                ORDER BY total_sales DESC
                LIMIT 10
            ', [$clinic_id, 'Paid', 'Billed', 'Served', $start_date, $end_date]);
        } else {
            $data['statistics']['top_selling_items'] = DB::select('
                SELECT 
                    it.id,
                    it.name,
                    itt.name as category_name,
                    COALESCE(SUM(ppci.unit_price * ppci.quantity), 0) as total_sales,
                    SUM(ppci.quantity) as total_quantity
                FROM patient_payment_cache_items as ppci
                INNER JOIN items as it ON ppci.item_id = it.id
                INNER JOIN item_types as itt ON it.item_type_id = itt.id
                WHERE ppci.status IN (?, ?, ?)
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) >= ?
                    AND DATE(COALESCE(ppci.served_at, ppci.created_at)) <= ?
                GROUP BY it.id, it.name, itt.name
                ORDER BY total_sales DESC
                LIMIT 10
            ', ['Paid', 'Billed', 'Served', $start_date, $end_date]);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Director Dashboard data retrieved successfully.');
    }
}

