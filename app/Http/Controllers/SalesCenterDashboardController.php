<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCacheItem;
use App\Models\PatientItemPayment;
use App\Models\UserPrivilege;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class SalesCenterDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d'
            ]);

            $user = $request->user();
            
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }
            
            // Check if user has sales_center privilege or is admin
            $hasPrivilege = $user->is_admin;
            if (!$hasPrivilege) {
                // Check user privileges
                $hasPrivilegeColumn = DB::selectOne("
                    SELECT COUNT(*) as count 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'user_privileges' 
                    AND COLUMN_NAME = 'privilege'
                ");
                
                if ($hasPrivilegeColumn && $hasPrivilegeColumn->count > 0) {
                    // New structure: privilege column exists
                    $hasPrivilege = UserPrivilege::where('user_id', $user->id)
                        ->where('privilege', 'sales_center')
                        ->exists();
                } else {
                    // Old structure: individual boolean columns
                    $privilegeRow = DB::table('user_privileges')
                        ->where('user_id', $user->id)
                        ->first();
                    
                    if ($privilegeRow && (
                        (isset($privilegeRow->sales_center) && $privilegeRow->sales_center) ||
                        (isset($privilegeRow->customer_relationship_management) && $privilegeRow->customer_relationship_management)
                    )) {
                        $hasPrivilege = true;
                    }
                }
            }
            
            if (!$hasPrivilege) {
                return $this->sendError('You do not have permission to access Sales Center', Response::HTTP_FORBIDDEN);
            }
            
            // Default to today if no dates provided
            $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if ($user->is_admin) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

            $data = [
                'summary' => [
                    'total_sales' => 0,
                    'sales_today' => 0,
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                    'total_discounts' => 0,
                    'items_sold' => 0,
                ],
                'statistics' => [
                    'sales_by_category' => [],
                    'sales_by_day' => [],
                    'sales_trend' => [],
                    'top_customers' => [],
                    'clients_consulted_vs_sales' => [],
                    'prescription_demand' => [],
                ],
            ];

            // Robust Sales Calculation (including item payments and bill payments)
            $itemPaymentsQuery = PatientItemPayment::query()
                ->where('patient_item_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.item_payment_id', 'patient_item_payments.id');
                })
                ->whereDate('patient_item_payments.created_at', '>=', $start_date)
                ->whereDate('patient_item_payments.created_at', '<=', $end_date);
            
            $billPaymentsQuery = \App\Models\PatientItemBillPayment::query()
                ->where('patient_item_bill_payments.amount', '>', 0)
                ->whereExists(function($q) {
                    $q->select(DB::raw(1))
                      ->from('patient_payment_cache_items as ppci')
                      ->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id');
                })
                ->whereDate('patient_item_bill_payments.created_at', '>=', $start_date)
                ->whereDate('patient_item_bill_payments.created_at', '<=', $end_date);

            if ($clinic_id) {
                $itemPaymentsQuery->whereIn('patient_item_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
                $billPaymentsQuery->whereIn('patient_item_bill_payments.created_by', function($q) use ($clinic_id) {
                    $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }

            $itemSalesTotal = (float) ($itemPaymentsQuery->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0);
            $billSalesTotal = (float) $billPaymentsQuery->sum('amount');
            
            $data['summary']['total_sales'] = $itemSalesTotal + $billSalesTotal;

            // Sales today
            $today = Carbon::today()->format('Y-m-d');
            $data['summary']['sales_today'] = 0;
            try {
                $todayItemSales = PatientItemPayment::query()
                    ->whereDate('created_at', $today)
                    ->where('amount', '>', 0)
                    ->whereExists(function($q) {
                        $q->select(DB::raw(1))->from('patient_payment_cache_items as ppci')->whereColumn('ppci.item_payment_id', 'patient_item_payments.id');
                    })
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('created_by', function($q) use ($clinic_id) { $q->select('id')->from('users')->where('clinic_id', $clinic_id); });
                    })
                    ->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')
                    ->first()->net ?? 0;
                
                $todayBillSales = \App\Models\PatientItemBillPayment::query()
                    ->whereDate('created_at', $today)
                    ->where('amount', '>', 0)
                    ->whereExists(function($q) {
                        $q->select(DB::raw(1))->from('patient_payment_cache_items as ppci')->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id');
                    })
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('created_by', function($q) use ($clinic_id) { $q->select('id')->from('users')->where('clinic_id', $clinic_id); });
                    })
                    ->sum('amount');
                
                $data['summary']['sales_today'] = (float) $todayItemSales + (float) $todayBillSales;
            } catch (\Exception $e) {
                \Log::error('Error calculating sales today', ['error' => $e->getMessage()]);
            }

            // Total revenue (same as total sales)
            $data['summary']['total_revenue'] = $data['summary']['total_sales'];

            // Total transactions
            $data['summary']['total_transactions'] = $itemPaymentsQuery->count() + $billPaymentsQuery->count();

            // Average transaction
            if ($data['summary']['total_transactions'] > 0) {
                $data['summary']['average_transaction'] = $data['summary']['total_sales'] / $data['summary']['total_transactions'];
            }

            // Items sold
            $data['summary']['items_sold'] = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Served')
                ->whereDate('served_at', '>=', $start_date)
                ->whereDate('served_at', '<=', $end_date)
                ->sum('quantity');

            // Sales trend (last 7 days)
            $data['statistics']['sales_trend'] = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->format('Y-m-d');
                $sales = PatientItemPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', $date)
                    ->sum('amount');

                $data['statistics']['sales_trend'][] = [
                    'date' => $date,
                    'sales' => $sales
                ];
            }

            // Clients Consulted vs Successful Sales (daily breakdown for the period)
            $clientsConsultedVsSales = [];
            $currentDate = Carbon::parse($start_date);
            $endDate = Carbon::parse($end_date);
            
            while ($currentDate->lte($endDate)) {
                $dateStr = $currentDate->format('Y-m-d');
                
                // Clients consulted on this date
                $clientsConsulted = Consultation::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('payment_cache_item.creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('status', 'Consulted')
                    ->whereDate('created_at', $dateStr)
                    ->distinct('payment_cache_item_id')
                    ->count('payment_cache_item_id');
                
                // Successful sales (payments made) on this date
                $successfulSales = PatientItemPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', $dateStr)
                    ->count();
                
                // Sales amount on this date (net)
                $salesDateItem = PatientItemPayment::query()
                    ->whereDate('created_at', $dateStr)
                    ->where('amount', '>', 0)
                    ->whereExists(function($q) { $q->select(DB::raw(1))->from('patient_payment_cache_items as ppci')->whereColumn('ppci.item_payment_id', 'patient_item_payments.id'); })
                    ->when($clinic_id, function ($query) use ($clinic_id) { $query->whereIn('created_by', function($q) use ($clinic_id) { $q->select('id')->from('users')->where('clinic_id', $clinic_id); }); })
                    ->selectRaw('SUM(amount - COALESCE(discount, 0)) as net')->first()->net ?? 0;
                
                $salesDateBill = \App\Models\PatientItemBillPayment::query()
                    ->whereDate('created_at', $dateStr)
                    ->where('amount', '>', 0)
                    ->whereExists(function($q) { $q->select(DB::raw(1))->from('patient_payment_cache_items as ppci')->whereColumn('ppci.bill_id', 'patient_item_bill_payments.bill_id'); })
                    ->when($clinic_id, function ($query) use ($clinic_id) { $query->whereIn('created_by', function($q) use ($clinic_id) { $q->select('id')->from('users')->where('clinic_id', $clinic_id); }); })
                    ->sum('amount');
                
                $salesAmount = (float) $salesDateItem + (float) $salesDateBill;
                
                $clientsConsultedVsSales[] = [
                    'date' => $dateStr,
                    'clients_consulted' => $clientsConsulted,
                    'successful_sales' => $successfulSales,
                    'sales_amount' => $salesAmount,
                ];
                
                $currentDate->addDay();
            }
            
            $data['statistics']['clients_consulted_vs_sales'] = $clientsConsultedVsSales;

            // Prescription Demand (pharmacy items sold by date)
            $prescriptionDemand = [];
            $currentDate = Carbon::parse($start_date);
            $endDate = Carbon::parse($end_date);
            
            while ($currentDate->lte($endDate)) {
                $dateStr = $currentDate->format('Y-m-d');
                
                // Pharmacy items sold on this date
                $pharmacyItems = PatientPaymentCacheItem::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Pharmacy');
                    })
                    ->where('status', 'Served')
                    ->whereDate('served_at', $dateStr)
                    ->sum('quantity');
                
                // Pharmacy revenue on this date
                $pharmacyRevenue = PatientPaymentCacheItem::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereHas('consultation_type', function ($query) {
                        $query->where('name', 'Pharmacy');
                    })
                    ->where('status', 'Served')
                    ->whereDate('served_at', $dateStr)
                    ->selectRaw('SUM(unit_price * quantity) as total')
                    ->value('total') ?? 0;
                
                $prescriptionDemand[] = [
                    'date' => $dateStr,
                    'quantity' => $pharmacyItems,
                    'revenue' => $pharmacyRevenue,
                ];
                
                $currentDate->addDay();
            }
            
            $data['statistics']['prescription_demand'] = $prescriptionDemand;

            // Sales by category
            $data['statistics']['sales_by_category'] = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->where('status', 'Served')
                ->whereDate('served_at', '>=', $start_date)
                ->whereDate('served_at', '<=', $end_date)
                ->join('consultation_types', 'patient_payment_cache_items.consultation_type_id', '=', 'consultation_types.id')
                ->select(
                    'consultation_types.name',
                    DB::raw('SUM(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_sales'),
                    DB::raw('SUM(patient_payment_cache_items.quantity) as total_quantity')
                )
                ->groupBy('consultation_types.id', 'consultation_types.name')
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'total_sales' => (float) $item->total_sales,
                        'total_quantity' => (int) $item->total_quantity,
                    ];
                });

            // Top customers
            $data['statistics']['top_customers'] = PatientItemPayment::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->join('patient_payment_cache_items', 'patient_payment_cache_items.item_payment_id', '=', 'patient_item_payments.id')
                ->join('patient_payment_cache', 'patient_payment_cache_items.payment_cache_id', '=', 'patient_payment_cache.id')
                ->join('patient_check_ins', 'patient_payment_cache.check_in_id', '=', 'patient_check_ins.id')
                ->join('patients', 'patient_check_ins.patient_id', '=', 'patients.id')
                ->whereDate('patient_item_payments.created_at', '>=', $start_date)
                ->whereDate('patient_item_payments.created_at', '<=', $end_date)
                ->select(
                    'patients.id',
                    'patients.first_name',
                    'patients.last_name',
                    DB::raw('CONCAT(patients.first_name, " ", patients.last_name) as customer_name'),
                    DB::raw('SUM(patient_item_payments.amount) as total_paid')
                )
                ->groupBy('patients.id', 'patients.first_name', 'patients.last_name')
                ->orderBy('total_paid', 'desc')
                ->limit(5)
                ->get();

            return $this->sendResponse($data, Response::HTTP_OK, 'Sales Center Dashboard data retrieved successfully.');
            
        } catch (\Throwable $e) {
            \Log::error('SalesCenterDashboard failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return safe default data instead of 500 error
            return $this->sendResponse([
                'summary' => [
                    'total_sales' => 0,
                    'sales_today' => 0,
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                    'total_discounts' => 0,
                    'items_sold' => 0,
                ],
                'statistics' => [
                    'sales_by_category' => [],
                    'sales_by_day' => [],
                    'sales_trend' => [],
                    'top_customers' => [],
                    'clients_consulted_vs_sales' => [],
                    'prescription_demand' => [],
                ],
            ], Response::HTTP_OK, 'Dashboard data temporarily unavailable.');
        }
    }
}

