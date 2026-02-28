<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemPayment;
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
        
        // Default to current week if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');

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
            ->whereDate('created_at', Carbon::today())
            ->count();

        // Total Patients Registered (all time)
        $data['summary']['total_patients_registered'] = Patient::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('checkIns', function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->count();

        // Web Appointment Bookings (all time)
        $data['summary']['web_appointment_bookings'] = Appointment::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                // Assuming appointments are clinic-specific or we can add clinic filtering later
                // For now, return all web appointments
            })
            ->count();

        // Total Sales (from payments and bill payments)
        try {
            $itemPaymentsQuery = PatientItemPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
            
            if ($clinic_id) {
                $itemPaymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $itemPayments = $itemPaymentsQuery->sum(DB::raw('COALESCE(amount, 0) - COALESCE(discount, 0)')) ?? 0;
            
            $billPaymentsQuery = PatientItemBillPayment::query()
                ->whereNotNull('created_at')
                ->where('created_at', '>=', $start_date . ' 00:00:00')
                ->where('created_at', '<=', $end_date . ' 23:59:59')
                ->where('amount', '>', 0);
            
            if ($clinic_id) {
                $billPaymentsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $billPayments = $billPaymentsQuery->sum('amount') ?? 0;
            
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

        // Revenue from New Consultation/Patient
        try {
            $newConsultationQuery = PatientItemPayment::query()
                ->join('patient_payment_cache_items', 'patient_item_payments.id', '=', 'patient_payment_cache_items.item_payment_id')
                ->join('consultations', 'patient_payment_cache_items.id', '=', 'consultations.payment_cache_item_id')
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0)
                ->where('consultations.patient_direction', 'Direct to Doctor');
            
            if ($clinic_id) {
                $newConsultationQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['revenue_new_consultation'] = $newConsultationQuery->sum('patient_item_payments.amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from new consultation', ['error' => $e->getMessage()]);
            $data['summary']['revenue_new_consultation'] = 0;
        }

        // Revenue from Return Consultation
        try {
            $returnConsultationQuery = PatientItemPayment::query()
                ->join('patient_payment_cache_items', 'patient_item_payments.id', '=', 'patient_payment_cache_items.item_payment_id')
                ->join('consultations', 'patient_payment_cache_items.id', '=', 'consultations.payment_cache_item_id')
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0)
                ->where('consultations.patient_to_return', 'Yes');
            
            if ($clinic_id) {
                $returnConsultationQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['revenue_return_consultation'] = $returnConsultationQuery->sum('patient_item_payments.amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from return consultation', ['error' => $e->getMessage()]);
            $data['summary']['revenue_return_consultation'] = 0;
        }

        // Total Revenue from All Consultations
        try {
            $allConsultationsQuery = PatientItemPayment::query()
                ->join('patient_payment_cache_items', 'patient_item_payments.id', '=', 'patient_payment_cache_items.item_payment_id')
                ->join('consultations', 'patient_payment_cache_items.id', '=', 'consultations.payment_cache_item_id')
                ->whereNotNull('patient_item_payments.created_at')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0);
            
            if ($clinic_id) {
                $allConsultationsQuery->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
            
            $data['summary']['revenue_all_consultations'] = $allConsultationsQuery->sum('patient_item_payments.amount') ?? 0;
        } catch (\Exception $e) {
            \Log::error('Error calculating revenue from all consultations', ['error' => $e->getMessage()]);
            $data['summary']['revenue_all_consultations'] = 0;
        }

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
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
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
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
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
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
                ->where('ppci.consultation_type_id', 1);
            
            if ($clinic_id) {
                $pharmacySalesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['pharmacy'] = $pharmacySalesQuery->sum(DB::raw('ppci.unit_price * ppci.quantity')) ?? 0;
            
            // Pharmacy Purchases (COGS)
            $pharmacyPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
                ->where('ppci.consultation_type_id', 1);
            
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
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
                ->where('ppci.consultation_type_id', 2)
                ->where('it.item_type_id', '!=', 4); // Exclude frames
            
            if ($clinic_id) {
                $glassSalesQuery->where('u.clinic_id', $clinic_id);
            }
            
            $data['summary']['glass'] = $glassSalesQuery->sum(DB::raw('ppci.unit_price * ppci.quantity')) ?? 0;
            
            // Glass Purchases (COGS)
            $glassPurchasesQuery = DB::table('patient_payment_cache_items as ppci')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('users as u', 'ppc.created_by', '=', 'u.id')
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
                ->where('ppci.consultation_type_id', 2)
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
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
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
                ->where('ppci.status', 'Served')
                ->whereDate('ppci.served_at', '>=', $start_date)
                ->whereDate('ppci.served_at', '<=', $end_date)
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

        // Calculate Total Purchases as sum of all COGS categories
        $data['summary']['total_purchases'] = 
            ($data['summary']['consultation_purchases'] ?? 0) +
            ($data['summary']['pharmacy_purchases'] ?? 0) +
            ($data['summary']['glass_purchases'] ?? 0) +
            ($data['summary']['frame_purchases'] ?? 0);

        // Recalculate Net Profit to account for COGS
        $data['summary']['net_profit'] = $data['summary']['total_sales'] - $data['summary']['total_purchases'] - $data['summary']['total_expenses'];

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
                    AND ppci.status = ?
                    AND DATE(ppci.served_at) >= ?
                    AND DATE(ppci.served_at) <= ?
                GROUP BY it.item_type_id, itt.name
                ORDER BY total_sales DESC
            ', [$clinic_id, 'Served', $start_date, $end_date]);
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
                WHERE ppci.status = ?
                    AND DATE(ppci.served_at) >= ?
                    AND DATE(ppci.served_at) <= ?
                GROUP BY it.item_type_id, itt.name
                ORDER BY total_sales DESC
            ', ['Served', $start_date, $end_date]);
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
                    AND ppci.status = ?
                    AND DATE(ppci.served_at) >= ?
                    AND DATE(ppci.served_at) <= ?
                GROUP BY it.id, it.name, itt.name
                ORDER BY total_sales DESC
                LIMIT 10
            ', [$clinic_id, 'Served', $start_date, $end_date]);
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
                WHERE ppci.status = ?
                    AND DATE(ppci.served_at) >= ?
                    AND DATE(ppci.served_at) <= ?
                GROUP BY it.id, it.name, itt.name
                ORDER BY total_sales DESC
                LIMIT 10
            ', ['Served', $start_date, $end_date]);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Director Dashboard data retrieved successfully.');
    }
}

