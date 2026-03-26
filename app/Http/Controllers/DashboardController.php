<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\ExpensePayment;
use App\Models\Patient;
use App\Models\PatientCheckIn;
use App\Models\PatientItemBill;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use App\Models\Marketing\InformationSource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Safely execute a query and return default value on error
     */
    protected function safeQuery($callback, $default = 0)
    {
        try {
            return $callback();
        } catch (\Exception $e) {
            \Log::error('Dashboard query error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $default;
        }
    }

    /**
     * Get daily cash collection data for main dashboard
     * This method mirrors the logic from PaymentCenterReportsController
     */
    protected function getDailyCashCollectionData($user, $clinic_id, $start_date, $end_date)
    {
        $data = [
            'total_collections' => 0,
            'total_discounts' => 0,
            'total_patients' => 0,
            'total_patient_visits' => 0,
            'total_consulted_patients' => 0,
            'total_glass' => 0,
            'total_medicine' => 0,
            'total_procedures' => 0,
            'total_others' => 0,
            'total_consultations' => 0,
            'total_pending_bills' => 0,
            'sms_balance' => 0,
        ];
        
        // Use the exact same logic as PaymentCenterReportsController::getCashCollectionReport
        try {
            // Item payments query - same as PaymentCenterReportsController
            $item_payments = PatientItemPayment::with(['channel', 'creator'])
                ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'patient_item_payments.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
                ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
                ->where('patient_item_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_payments.amount', '>', 0);
            
            if ($clinic_id) {
                $item_payments->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Bill payments query - same as PaymentCenterReportsController
            $bill_payments = PatientItemBillPayment::with(['channel', 'creator'])
                ->join('patient_item_bills as pib', 'patient_item_bill_payments.bill_id', '=', 'pib.id')
                ->join('patient_payment_cache_items as ppci', 'ppci.bill_id', '=', 'pib.id')
                ->join('items as it', 'ppci.item_id', '=', 'it.id')
                ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
                ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
                ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
                ->where('patient_item_bill_payments.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bill_payments.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_bill_payments.amount', '>', 0);
            
            if ($clinic_id) {
                $bill_payments->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            // Calculate total collections - sum of both item and bill payments
            $item_payments_sum = $item_payments->sum('patient_item_payments.amount') ?? 0;
            $bill_payments_sum = $bill_payments->sum('patient_item_bill_payments.amount') ?? 0;
            $data['total_collections'] = ($item_payments_sum + $bill_payments_sum);
            
            // Calculate total patients (unique patients who made payments)
            $item_patients = $item_payments->distinct('pt.id')->pluck('pt.id');
            $bill_patients = $bill_payments->distinct('pt.id')->pluck('pt.id');
            $all_patients = $item_patients->merge($bill_patients)->unique();
            $data['total_patients'] = $all_patients->count();
            
            // Calculate total patient visits (check-ins with payments)
            $item_visits = $item_payments->distinct('pch.id')->pluck('pch.id');
            $bill_visits = $bill_payments->distinct('pch.id')->pluck('pch.id');
            $all_visits = $item_visits->merge($bill_visits)->unique();
            $data['total_patient_visits'] = $all_visits->count();
            
            // Calculate totals by item category and specific consultation types
            $item_categories = $item_payments
                ->selectRaw('it.category, it.name, SUM(patient_item_payments.amount) as total_amount, COUNT(DISTINCT pt.id) as patient_count')
                ->groupBy('it.category', 'it.name')
                ->get();
            
            $bill_categories = $bill_payments
                ->selectRaw('it.category, it.name, SUM(patient_item_bill_payments.amount) as total_amount, COUNT(DISTINCT pt.id) as patient_count')
                ->groupBy('it.category', 'it.name')
                ->get();
            
            // Merge category and item totals
            $all_categories = [];
            $consultation_new_total = 0;
            $consultation_return_total = 0;
            $consultation_verify_total = 0;
            
            foreach ($item_categories as $item) {
                $category = $item->category;
                $name = $item->name;
                $amount = $item->total_amount;
                
                // Track consultation revenue separately by type
                if ($name === 'General Consultation - New') {
                    $consultation_new_total += $amount;
                } elseif ($name === 'General Consultation - Return') {
                    $consultation_return_total += $amount;
                } elseif ($name === 'General Consultation - Verify') {
                    $consultation_verify_total += $amount;
                }
                
                // Track by category
                if ($category) {
                    $all_categories[$category] = ($all_categories[$category] ?? 0) + $amount;
                }
            }
            
            foreach ($bill_categories as $item) {
                $category = $item->category;
                $name = $item->name;
                $amount = $item->total_amount;
                
                // Track consultation revenue separately by type
                if ($name === 'General Consultation - New') {
                    $consultation_new_total += $amount;
                } elseif ($name === 'General Consultation - Return') {
                    $consultation_return_total += $amount;
                } elseif ($name === 'General Consultation - Verify') {
                    $consultation_verify_total += $amount;
                }
                
                // Track by category
                if ($category) {
                    $all_categories[$category] = ($all_categories[$category] ?? 0) + $amount;
                }
            }
            
            // Assign to specific categories
            $data['total_glass'] = $all_categories['Glass'] ?? 0;
            $data['total_medicine'] = $all_categories['Medicine'] ?? 0;
            $data['total_procedures'] = $all_categories['Procedure'] ?? 0;
            $data['total_others'] = $all_categories['Others'] ?? 0;
            
            // New consultation revenue fields separated by type
            $data['consultation_new_revenue'] = $consultation_new_total;
            $data['consultation_return_revenue'] = $consultation_return_total + $consultation_verify_total; // Return + Verify combined
            $data['consultation_verify_revenue'] = $consultation_verify_total;
            $data['consultation_other_revenue'] = $consultation_return_total + $consultation_verify_total;
            $data['total_consultations'] = $consultation_new_total + $consultation_return_total + $consultation_verify_total;
            
            // Calculate consulted patients for the date range
            $consulted_patients_query = \App\Models\Consultation::query()
                ->where('consultations.created_at', '>=', $start_date . ' 00:00:00')
                ->where('consultations.created_at', '<=', $end_date . ' 23:59:59');
            
            if ($clinic_id) {
                $consulted_patients_query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $data['total_consulted_patients'] = $consulted_patients_query->distinct('patient_id')->count('patient_id');
            
            // Calculate pending bills for the date range (only bills created on this date)
            $pending_bills_query = \App\Models\PatientItemBill::query()
                ->where('patient_item_bills.created_at', '>=', $start_date . ' 00:00:00')
                ->where('patient_item_bills.created_at', '<=', $end_date . ' 23:59:59')
                ->where('patient_item_bills.balance', '>', 0);
            
            if ($clinic_id) {
                $pending_bills_query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->select('id')->from('users')->where('clinic_id', $clinic_id);
                });
            }
            
            $data['total_pending_bills'] = $pending_bills_query->sum('balance');
            
            // Get SMS balance from clinic
            if ($clinic_id) {
                $clinic = \App\Models\Clinic::find($clinic_id);
                $data['sms_balance'] = $clinic->sms_balance ?? 0;
            } else {
                // If no clinic restriction, get total SMS balance across all clinics
                $data['sms_balance'] = \App\Models\Clinic::sum('sms_balance') ?? 0;
            }
            
        } catch (\Exception $e) {
            \Log::error('Dashboard getDailyCashCollectionData error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
        
        return $data;
    }
    
    public function __invoke(Request $request)
    {
        try {
            $request->validate([
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
                'sales_expenses_period' => 'sometimes|in:daily,monthly,yearly',
                'patient_registration_period' => 'sometimes|in:daily,monthly,yearly',
                'load_statistics' => 'sometimes|in:true,false,1,0',
            ]);

            $user = $request->user();
            $today = Carbon::today()->format('Y-m-d');

            // Default allow: if user missing or role unspecified, do not restrict by clinic
            if (!$user || ($user->is_admin ?? false)) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

            // Default to current day if no dates provided
            $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
            $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

            // Get actual data from Daily Cash Collection Report logic
            // This ensures main dashboard matches the Daily Cash Collected Report
            $dailyCollectionData = $this->getDailyCashCollectionData($user, $clinic_id, $start_date, $end_date);
            
            $data = [
                'summary' => [
                    'total_sales' => $dailyCollectionData['total_collections'] ?? 0,
                    'discount' => $dailyCollectionData['total_discounts'] ?? 0,
                    'expenses' => $dailyCollectionData['total_expenses'] ?? 0,
                    'new_patients' => $dailyCollectionData['total_patients'] ?? 0,
                    'patient_visits' => $dailyCollectionData['total_patient_visits'] ?? 0,
                    'consulted_patients' => $dailyCollectionData['total_consulted_patients'] ?? 0,
                    'glass' => $dailyCollectionData['total_glass'] ?? 0,
                    'pharmacy' => $dailyCollectionData['total_medicine'] ?? 0,
                    'procedure' => $dailyCollectionData['total_procedures'] ?? 0,
                    'others' => $dailyCollectionData['total_others'] ?? 0,
                    'consultation' => $dailyCollectionData['total_consultations'] ?? 0,
                    'consultation_new_revenue' => $dailyCollectionData['consultation_new_revenue'] ?? 0,
                    'consultation_return_revenue' => $dailyCollectionData['consultation_return_revenue'] ?? 0,
                    'consultation_verify_revenue' => $dailyCollectionData['consultation_verify_revenue'] ?? 0,
                    'consultation_other_revenue' => $dailyCollectionData['consultation_other_revenue'] ?? 0,
                    'pending_bills' => $dailyCollectionData['total_pending_bills'] ?? 0,
                    'sms_balance' => $dailyCollectionData['sms_balance'] ?? 0,
                ],
                'statistics' => [
                    'expenses_by_category' => [],
                    'payments_by_channel' => [],
                    'consultations_by_item' => [],
                    'top_diagnosis' => [],
                    'yearly' => [],
                    'sales_expenses' => [],
                    'patient_registration' => [],
                    'client_statistics' => [],
                ],
            ];

            // Handle period parameters - can be string or array/object
            $salesExpensesPeriodInput = $request->sales_expenses_period ?? 'yearly';
            $salesExpensesPeriod = is_array($salesExpensesPeriodInput) 
                ? ($salesExpensesPeriodInput['value'] ?? $salesExpensesPeriodInput[0] ?? 'yearly')
                : (is_string($salesExpensesPeriodInput) ? $salesExpensesPeriodInput : 'yearly');
            
            // Validate and sanitize
            if (!in_array($salesExpensesPeriod, ['daily', 'monthly', 'yearly'])) {
                $salesExpensesPeriod = 'yearly';
            }
            
            $patientRegistrationPeriodInput = $request->patient_registration_period ?? 'yearly';
            $patientRegistrationPeriod = is_array($patientRegistrationPeriodInput)
                ? ($patientRegistrationPeriodInput['value'] ?? $patientRegistrationPeriodInput[0] ?? 'yearly')
                : (is_string($patientRegistrationPeriodInput) ? $patientRegistrationPeriodInput : 'yearly');
            
            // Validate and sanitize - also handle cases like "yearly:1" from checkboxes
            $patientRegistrationPeriod = preg_replace('/:.*$/', '', $patientRegistrationPeriod); // Remove ":1" suffix if present
            if (!in_array($patientRegistrationPeriod, ['daily', 'monthly', 'yearly'])) {
                $patientRegistrationPeriod = 'yearly';
            }

            $cacheKey = "dashboard_total_sales_{$clinic_id}_{$start_date}_{$end_date}";
            $data['summary']['total_sales'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                    // Use whereExists to avoid row multiplication from JOINs
                    $paymentsQuery = PatientItemPayment::query()
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
                        $paymentsQuery->whereIn('patient_item_payments.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    }

                    // Use net amount (amount - discount) to match Daily Cash Collection subtotal
                    $paymentsSum = (float) ($paymentsQuery->selectRaw('SUM(patient_item_payments.amount - COALESCE(patient_item_payments.discount, 0)) as net')->first()->net ?? 0);

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

                    $billPaymentsSum = (float) $billPaymentsQuery->sum('patient_item_bill_payments.amount');

                    return $paymentsSum + $billPaymentsSum;
                }, 0);
            });

            $cacheKey = "dashboard_discount_{$clinic_id}_{$start_date}_{$end_date}";
            $data['summary']['discount'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                    return PatientItemPayment::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', '>=', $start_date)
                        ->whereDate('created_at', '<=', $end_date)
                        ->sum('discount');
                }, 0);
            });

            $cacheKey = "dashboard_expenses_{$clinic_id}_{$start_date}_{$end_date}";
            $data['summary']['expenses'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                    return ExpensePayment::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', '>=', $start_date)
                        ->whereDate('created_at', '<=', $end_date)
                        ->sum('amount');
                }, 0);
            });

            // Running Cost & Improvement Cost (by explicit flag OR category name match)
            // Running costs = ongoing operational expenses (maintenance, software)
            // Improvement costs = capital/one-time expenditures (renovation, furniture, importation, events)
            $runningCostCategories = [
                'Cleanless, technical / mechanical meintenance', 
                'Office Software', 
                'Daily expenses', 
                'Electricity', 
                'Ground Floor Rent', 
                'Rent', 
                'Salary', 
                'Staff Allowance & Chakula', 
                'Transport', 
                'SODA', 
                'Marketing', 
                'Government Tax'
            ];
            $improvementCostCategories = [
                'Renovation', 
                'Vifaa & Furnitures', 
                'Importation Cost(Cargo transportation)', 
                'SABASABA 2025', 
                'Outreach Programs', 
                'Parnership Dissolution', 
                'Loan'
            ];
            try {
                $baseRunningQuery = DB::table('expense_payments as expp')
                    ->join('expenses as exp', 'expp.expense_id', '=', 'exp.id')
                    ->join('expense_categories as cat', 'exp.category_id', '=', 'cat.id')
                    ->whereBetween(DB::raw('DATE(expp.created_at)'), [$start_date, $end_date])
                    ->where('expp.amount', '>', 0);

                $baseImprovementQuery = clone $baseRunningQuery;

                if ($clinic_id) {
                    $baseRunningQuery->join('users as u', 'expp.created_by', '=', 'u.id')
                        ->where('u.clinic_id', $clinic_id);
                    $baseImprovementQuery->join('users as u', 'expp.created_by', '=', 'u.id')
                        ->where('u.clinic_id', $clinic_id);
                }

                $runningCostQuery = (clone $baseRunningQuery)->where(function($q) use ($runningCostCategories) {
                    $q->where('exp.running_cost', 1)
                      ->orWhereIn('cat.name', $runningCostCategories);
                });

                $improvementCostQuery = (clone $baseImprovementQuery)->where(function($q) use ($improvementCostCategories) {
                    $q->where('exp.improvement_cost', 1)
                      ->orWhereIn('cat.name', $improvementCostCategories);
                });

                $data['summary']['running_cost'] = (float) $runningCostQuery->sum('expp.amount');
                $data['summary']['improvement_cost'] = (float) $improvementCostQuery->sum('expp.amount');
            } catch (\Exception $e) {
                \Log::error('Error calculating running/improvement costs (dashboard)', ['error' => $e->getMessage()]);
                $data['summary']['running_cost'] = 0;
                $data['summary']['improvement_cost'] = 0;
            }

            $cacheKey = "dashboard_new_patients_{$clinic_id}_{$start_date}_{$end_date}";
            $data['summary']['new_patients'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                    return Patient::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', '>=', $start_date)
                        ->whereDate('created_at', '<=', $end_date)
                        ->count();
                }, 0);
            });

            $cacheKey = "dashboard_patient_visits_{$clinic_id}_{$start_date}_{$end_date}";
            $data['summary']['patient_visits'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                    // Optimized query: Count unique patient-day combinations
                    $query = PatientCheckIn::query()
                        ->selectRaw('COUNT(DISTINCT CONCAT(patient_id, "-", DATE(created_at))) as visits')
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', '>=', $start_date)
                        ->whereDate('created_at', '<=', $end_date);

                    $result = $query->first();
                    return $result ? $result->visits : 0;
                }, 0);
            });

            $data['summary']['consulted_patients'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                // Optimized query: Use join instead of whereHas for better performance
                return Consultation::query()
                    ->join('patient_payment_cache_items', 'consultations.payment_cache_item_id', '=', 'patient_payment_cache_items.id')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('patient_payment_cache_items.status', 'Served')
                    ->whereDate('patient_payment_cache_items.served_at', '>=', $start_date)
                    ->whereDate('patient_payment_cache_items.served_at', '<=', $end_date)
                    ->where('consultations.patient_direction', 'Direct to Doctor')
                    ->where('consultations.status', 'Consulted')
                    ->count();
            }, 0);

            // Department sales: Calculate from actual payments with proportional net amounts
            // For each item paid, calculate: (item_gross / payment_gross_total) * payment_net
            $data['summary']['glass'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                // Cash payments
                $cashSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                    ->where('ct.name', 'Glass')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pmt.amount - COALESCE(pmt.discount, 0))) as net')
                    ->first()->net ?? 0;
                
                // Bill payments
                $billSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                    ->where('ct.name', 'Glass')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pmt.amount) as net')
                    ->first()->net ?? 0;
                
                return $cashSales + $billSales;
            }, 0);

            $data['summary']['pharmacy'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                // Cash payments
                $cashSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                    ->where('ct.name', 'Pharmacy')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pmt.amount - COALESCE(pmt.discount, 0))) as net')
                    ->first()->net ?? 0;
                
                // Bill payments
                $billSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                    ->where('ct.name', 'Pharmacy')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pmt.amount) as net')
                    ->first()->net ?? 0;
                
                return $cashSales + $billSales;
            }, 0);

            $data['summary']['procedure'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                // Cash payments
                $cashSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                    ->where('ct.name', 'Procedure')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pmt.amount - COALESCE(pmt.discount, 0))) as net')
                    ->first()->net ?? 0;
                
                // Bill payments
                $billSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                    ->where('ct.name', 'Procedure')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pmt.amount) as net')
                    ->first()->net ?? 0;
                
                return $cashSales + $billSales;
            }, 0);

            $data['summary']['others'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                // Cash payments
                $cashSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                    ->where('ct.name', 'Others')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pmt.amount - COALESCE(pmt.discount, 0))) as net')
                    ->first()->net ?? 0;
                
                // Bill payments
                $billSales = (float) DB::table('patient_payment_cache_items as ppci')
                    ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                    ->join('consultation_types as ct', 'ppci.consultation_type_id', '=', 'ct.id')
                    ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                    ->where('ct.name', 'Others')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pmt.amount) as net')
                    ->first()->net ?? 0;
                
                return $cashSales + $billSales;
            }, 0);

            $data['summary']['consultation'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                // Cash payments - items linked to consultations with 'Direct to Doctor'
                $cashSales = (float) DB::table('consultations')
                    ->join('patient_payment_cache_items as ppci', 'consultations.payment_cache_item_id', '=', 'ppci.id')
                    ->join('patient_item_payments as pmt', 'ppci.item_payment_id', '=', 'pmt.id')
                    ->join(DB::raw('(SELECT item_payment_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE item_payment_id IS NOT NULL GROUP BY item_payment_id) as totals'), 'ppci.item_payment_id', '=', 'totals.item_payment_id')
                    ->where('consultations.patient_direction', 'Direct to Doctor')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * (pmt.amount - COALESCE(pmt.discount, 0))) as net')
                    ->first()->net ?? 0;
                
                // Bill payments
                $billSales = (float) DB::table('consultations')
                    ->join('patient_payment_cache_items as ppci', 'consultations.payment_cache_item_id', '=', 'ppci.id')
                    ->join('patient_item_bill_payments as pmt', 'ppci.bill_id', '=', 'pmt.bill_id')
                    ->join(DB::raw('(SELECT bill_id, SUM(unit_price * quantity) as gross_total FROM patient_payment_cache_items WHERE bill_id IS NOT NULL GROUP BY bill_id) as totals'), 'ppci.bill_id', '=', 'totals.bill_id')
                    ->where('consultations.patient_direction', 'Direct to Doctor')
                    ->where('pmt.created_at', '>=', $start_date . ' 00:00:00')
                    ->where('pmt.created_at', '<=', $end_date . ' 23:59:59')
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereIn('pmt.created_by', function($q) use ($clinic_id) {
                            $q->select('id')->from('users')->where('clinic_id', $clinic_id);
                        });
                    })
                    ->selectRaw('SUM((ppci.unit_price * ppci.quantity) / NULLIF(totals.gross_total, 0) * pmt.amount) as net')
                    ->first()->net ?? 0;
                
                return $cashSales + $billSales;
            }, 0);

            // Pending bills: total outstanding amount of bills with status 'Pending' created in date range (amount - discount - payments > 0)
            $data['summary']['pending_bills'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                return PatientItemBill::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('status', 'Pending')
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum('amount');
            }, 0);

            $data['summary']['sms_balance'] = ($user && $user->clinic) ? $user->clinic->sms_balance : 0;

            // Load statistics data only when requested (lazy loading)
            $loadStatistics = $request->boolean('load_statistics', false);

            if ($loadStatistics) {
                if ($clinic_id) {
                    $cacheKey = "dashboard_expenses_by_category_{$clinic_id}_{$start_date}_{$end_date}";
                    $data['statistics']['expenses_by_category'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                        return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                            return DB::select('select exp.category_id, cat.name, sum(expp.amount) as amount from expense_payments as expp inner join expenses as exp on expp.expense_id = exp.id inner join expense_categories as cat on exp.category_id = cat.id inner join users as u on expp.created_by = u.id where u.clinic_id = ? and (date(expp.created_at) between ? and ?) group by exp.category_id', [$clinic_id, $start_date, $end_date]);
                        }, []);
                    });
                    $cacheKey = "dashboard_payments_by_channel_{$clinic_id}_{$start_date}_{$end_date}";
                    $data['statistics']['payments_by_channel'] = Cache::remember($cacheKey, 300, function() use ($clinic_id, $start_date, $end_date) {
                        return $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                            return DB::select('select channel_id, name, sum(amount) as amount from ((select pmt.channel_id, pc.name, sum(pmt.amount - pmt.discount) as amount from patient_item_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id inner join users as u on pmt.created_by = u.id where u.clinic_id = ? and (date(pmt.created_at) between ? and ?) group by pmt.channel_id) union (select pmt.channel_id, pc.name, sum(pmt.amount) as amount from patient_item_bill_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id inner join users as u on pmt.created_by = u.id where u.clinic_id = ? and (date(pmt.created_at) between ? and ?) group by pmt.channel_id)) as payments group by name', [$clinic_id, $start_date, $end_date, $clinic_id, $start_date, $end_date]);
                        }, []);
                    });
                    $data['statistics']['consultations_by_item'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                        return DB::select('select it.id, it.name, count(ct.id) as consultations from items as it inner join patient_payment_cache_items as ppci on ppci.item_id = it.id inner join consultations as ct on ct.payment_cache_item_id = ppci.id inner join users as u on ct.created_by = u.id where u.clinic_id = ? and ppci.status = ? and (date(ppci.served_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by ppci.item_id order by consultations desc', [$clinic_id, 'Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
                    }, []);
                    $data['statistics']['top_diagnosis'] = $this->safeQuery(function() use ($clinic_id, $start_date, $end_date) {
                        return DB::select('select ds.id, ds.name, ds.code, count(cd.id) as consultations from diseases as ds inner join consultation_diagnoses as cd on cd.disease_id = ds.id inner join consultations as ct on cd.consultation_id = ct.id inner join patient_payment_cache_items as ppci on ct.payment_cache_item_id = ppci.id inner join users as u on ct.created_by = u.id where u.clinic_id = ? and ppci.status = ? and (date(ppci.served_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by cd.disease_id order by consultations desc limit 10', [$clinic_id, 'Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
                    }, []);
                } else {
                    $data['statistics']['expenses_by_category'] = $this->safeQuery(function() use ($start_date, $end_date) {
                        return DB::select('select exp.category_id, cat.name, sum(expp.amount) as amount from expense_payments as expp inner join expenses as exp on expp.expense_id = exp.id inner join expense_categories as cat on exp.category_id = cat.id where (date(expp.created_at) between ? and ?) group by exp.category_id', [$start_date, $end_date]);
                    }, []);
                    $data['statistics']['payments_by_channel'] = $this->safeQuery(function() use ($start_date, $end_date) {
                        return DB::select('select channel_id, name, sum(amount) as amount from ((select pmt.channel_id, pc.name, sum(pmt.amount - pmt.discount) as amount from patient_item_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id where (date(pmt.created_at) between ? and ?) group by pmt.channel_id) union (select pmt.channel_id, pc.name, sum(pmt.amount) as amount from patient_item_bill_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id where (date(pmt.created_at) between ? and ?) group by pmt.channel_id)) as payments group by name', [$start_date, $end_date, $start_date, $end_date]);
                    }, []);
                    $data['statistics']['consultations_by_item'] = $this->safeQuery(function() use ($start_date, $end_date) {
                        return DB::select('select it.id, it.name, count(ct.id) as consultations from items as it inner join patient_payment_cache_items as ppci on ppci.item_id = it.id inner join consultations as ct on ct.payment_cache_item_id = ppci.id where ppci.status = ? and (date(ppci.served_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by ppci.item_id order by consultations desc', ['Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
                    }, []);
                    $data['statistics']['top_diagnosis'] = $this->safeQuery(function() use ($start_date, $end_date) {
                        return DB::select('select ds.id, ds.name, ds.code, count(cd.id) as consultations from diseases as ds inner join consultation_diagnoses as cd on cd.disease_id = ds.id inner join consultations as ct on cd.consultation_id = ct.id inner join patient_payment_cache_items as ppci on ct.payment_cache_item_id = ppci.id where ppci.status = ? and (date(ppci.served_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by cd.disease_id order by consultations desc limit 10', ['Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
                    }, []);
                }
            } else {
                // Provide placeholder data for lazy loading
                $data['statistics']['expenses_by_category'] = [];
                $data['statistics']['payments_by_category'] = [];
                $data['statistics']['consultations_by_item'] = [];
                $data['statistics']['top_diagnosis'] = [];
            }

            $date = Carbon::today()->subMonths(11);

            if ($loadStatistics) {
                $cacheKey = "dashboard_yearly_stats_{$clinic_id}";
                $data['statistics']['yearly'] = Cache::remember($cacheKey, 900, function() use ($clinic_id) { // Cache for 15 minutes
                $date = Carbon::today()->subMonths(11);
                $yearlyData = [];

                for ($i = 0; $i < 12; $i++) {
                    $month_start = $date->copy()->startOfMonth()->format('Y-m-d');
                    $month_end = $date->copy()->endOfMonth()->format('Y-m-d');

                    $yearlyData[] = [
                    'month' => $date->format('M'),
                        'statistics' => [
                        [
                            'name' => 'total_sales',
                            'amount' => $this->safeQuery(function() use ($clinic_id, $month_start, $month_end) {
                                return PatientItemPayment::query()
                                    ->when($clinic_id, function ($query) use ($clinic_id) {
                                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                                            $query->where('clinic_id', $clinic_id);
                                        });
                                    })
                                    ->whereDate('created_at', '>=', $month_start)
                                    ->whereDate('created_at', '<=', $month_end)
                                    ->sum(DB::raw('amount - discount')) + PatientItemBillPayment::query()
                                    ->when($clinic_id, function ($query) use ($clinic_id) {
                                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                                            $query->where('clinic_id', $clinic_id);
                                        });
                                    })
                                    ->whereDate('created_at', '>=', $month_start)
                                    ->whereDate('created_at', '<=', $month_end)
                                    ->sum('amount');
                            }, 0),
                        ],
                        [
                            'name' => 'discount',
                            'amount' => $this->safeQuery(function() use ($clinic_id, $month_start, $month_end) {
                                return PatientItemPayment::query()
                                    ->when($clinic_id, function ($query) use ($clinic_id) {
                                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                                            $query->where('clinic_id', $clinic_id);
                                        });
                                    })
                                    ->whereDate('created_at', '>=', $month_start)
                                    ->whereDate('created_at', '<=', $month_end)
                                    ->sum('discount');
                            }, 0)
                        ],
                        [
                            'name' => 'expenses',
                            'amount' => $this->safeQuery(function() use ($clinic_id, $month_start, $month_end) {
                                return ExpensePayment::query()
                                    ->when($clinic_id, function ($query) use ($clinic_id) {
                                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                                            $query->where('clinic_id', $clinic_id);
                                        });
                                    })
                                    ->whereDate('created_at', '>=', $month_start)
                                    ->whereDate('created_at', '<=', $month_end)
                                    ->sum('amount');
                            }, 0),
                        ],
                        [
                            'name' => 'new_patients_male',
                            'amount' => $this->safeQuery(function() use ($clinic_id, $month_start, $month_end) {
                                return Patient::query()
                                    ->when($clinic_id, function ($query) use ($clinic_id) {
                                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                                            $query->where('clinic_id', $clinic_id);
                                        });
                                    })
                                    ->where('gender', 'Male')
                                    ->whereDate('created_at', '>=', $month_start)
                                    ->whereDate('created_at', '<=', $month_end)
                                    ->count();
                            }, 0),
                        ],
                        [
                            'name' => 'new_patients_female',
                            'amount' => $this->safeQuery(function() use ($clinic_id, $month_start, $month_end) {
                                return Patient::query()
                                    ->when($clinic_id, function ($query) use ($clinic_id) {
                                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                                            $query->where('clinic_id', $clinic_id);
                                        });
                                    })
                                    ->where('gender', 'Female')
                                    ->whereDate('created_at', '>=', $month_start)
                                    ->whereDate('created_at', '<=', $month_end)
                                    ->count();
                            }, 0),
                        ]
                    ],
                ];

                    $date->addMonthNoOverflow();
                }

                return $yearlyData;
            });

                // Sales vs Expenses and Patient Registration chart data (period-based)
                $data['statistics']['sales_expenses'] = $this->generateSalesExpensesData($clinic_id, $salesExpensesPeriod);
                $data['statistics']['patient_registration'] = $this->generatePatientRegistrationData($clinic_id, $patientRegistrationPeriod);
                $data['statistics']['new_vs_return_patients'] = $this->generateNewVsReturnPatientsData($clinic_id, $patientRegistrationPeriod);
                $data['statistics']['client_statistics'] = $this->generateClientStatistics($clinic_id, $start_date, $end_date);
            } else {
                // Provide placeholder data for lazy loading
                $data['statistics']['sales_expenses'] = [];
                $data['statistics']['patient_registration'] = [];
                $data['statistics']['new_vs_return_patients'] = [];
                $data['statistics']['client_statistics'] = [];
                $data['statistics']['expenses_by_category'] = [];
                $data['statistics']['payments_by_channel'] = [];
                $data['statistics']['consultations_by_item'] = [];
                $data['statistics']['top_diagnosis'] = [];
                $data['statistics']['yearly'] = [];
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Exception $e) {
            \Log::error('DashboardController error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return $this->sendError(
                'An error occurred while fetching dashboard data. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    private function generateSalesExpensesData($clinic_id, $period)
    {
        try {
            $data = [];
            $today = Carbon::today();

        if ($period === 'daily') {
            // Last 30 days
            for ($i = 29; $i >= 0; $i--) {
                $date = $today->copy()->subDays($i);
                $start_date = $date->format('Y-m-d');
                $end_date = $date->format('Y-m-d');

                $sales = PatientItemPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', $start_date)
                    ->sum(DB::raw('amount - discount')) + PatientItemBillPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', $start_date)
                    ->sum('amount');

                $expenses = ExpensePayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', $start_date)
                    ->sum('amount');

                $data[] = [
                    'period' => $date->format('M d'),
                    'sales' => $sales,
                    'expenses' => $expenses,
                ];
            }
        } elseif ($period === 'monthly') {
            // Last 12 months
            $date = $today->copy()->subMonths(11);
            for ($i = 0; $i < 12; $i++) {
                $start_date = $date->copy()->startOfMonth()->format('Y-m-d');
                $end_date = $date->copy()->endOfMonth()->format('Y-m-d');

                $sales = PatientItemPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum(DB::raw('amount - discount')) + PatientItemBillPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum('amount');

                $expenses = ExpensePayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum('amount');

                $data[] = [
                    'period' => $date->format('M Y'),
                    'sales' => $sales,
                    'expenses' => $expenses,
                ];

                $date->addMonthNoOverflow();
            }
        } else { // yearly
            // Last 5 years
            $date = $today->copy()->subYears(4);
            for ($i = 0; $i < 5; $i++) {
                $start_date = $date->copy()->startOfYear()->format('Y-m-d');
                $end_date = $date->copy()->endOfYear()->format('Y-m-d');

                $sales = PatientItemPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum(DB::raw('amount - discount')) + PatientItemBillPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum('amount');

                $expenses = ExpensePayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->sum('amount');

                $data[] = [
                    'period' => $date->format('Y'),
                    'sales' => $sales,
                    'expenses' => $expenses,
                ];

                $date->addYear();
            }
        }

            return $data;
        } catch (\Exception $e) {
            \Log::error('generateSalesExpensesData error', [
                'message' => $e->getMessage(),
                'clinic_id' => $clinic_id,
                'period' => $period,
            ]);
            return [];
        }
    }

    private function generatePatientRegistrationData($clinic_id, $period)
    {
        try {
            $data = [];
            $today = Carbon::today();

        if ($period === 'daily') {
            // Last 30 days
            for ($i = 29; $i >= 0; $i--) {
                $date = $today->copy()->subDays($i);
                $start_date = $date->format('Y-m-d');
                $end_date = $date->format('Y-m-d');

                $male = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('gender', 'Male')
                    ->whereDate('created_at', $start_date)
                    ->count();

                $female = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('gender', 'Female')
                    ->whereDate('created_at', $start_date)
                    ->count();

                $data[] = [
                    'period' => $date->format('M d'),
                    'male' => $male,
                    'female' => $female,
                ];
            }
        } elseif ($period === 'monthly') {
            // Last 12 months
            $date = $today->copy()->subMonths(11);
            for ($i = 0; $i < 12; $i++) {
                $start_date = $date->copy()->startOfMonth()->format('Y-m-d');
                $end_date = $date->copy()->endOfMonth()->format('Y-m-d');

                $male = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('gender', 'Male')
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                $female = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('gender', 'Female')
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                $data[] = [
                    'period' => $date->format('M Y'),
                    'male' => $male,
                    'female' => $female,
                ];

                $date->addMonthNoOverflow();
            }
        } else { // yearly
            // Last 5 years
            $date = $today->copy()->subYears(4);
            for ($i = 0; $i < 5; $i++) {
                $start_date = $date->copy()->startOfYear()->format('Y-m-d');
                $end_date = $date->copy()->endOfYear()->format('Y-m-d');

                $male = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('gender', 'Male')
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                $female = Patient::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('gender', 'Female')
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                $data[] = [
                    'period' => $date->format('Y'),
                    'male' => $male,
                    'female' => $female,
                ];

                $date->addYear();
            }
        }

            return $data;
        } catch (\Exception $e) {
            \Log::error('generatePatientRegistrationData error', [
                'message' => $e->getMessage(),
                'clinic_id' => $clinic_id,
                'period' => $period,
            ]);
            return [];
        }
    }

    private function generateNewVsReturnPatientsData($clinic_id, $period)
    {
        try {
            $data = [];
            $today = Carbon::today();

            if ($period === 'daily') {
                // Last 30 days - count patients who visited (check-ins) on each date
                for ($i = 29; $i >= 0; $i--) {
                    $date = $today->copy()->subDays($i);
                    $start_date = $date->format('Y-m-d');
                    $end_date = $date->format('Y-m-d');

                    // Get all patients who checked in on this date
                    $checkInQuery = PatientCheckIn::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', $start_date);
                    
                    $patientsOnDate = $checkInQuery->pluck('patient_id')->unique();
                    
                    // New patients: patients who checked in on this date with no previous check-ins
                    $newPatients = 0;
                    $returnPatients = 0;
                    
                    foreach ($patientsOnDate as $patientId) {
                        $previousCheckIns = PatientCheckIn::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->where('patient_id', $patientId)
                            ->whereDate('created_at', '<', $start_date)
                            ->count();
                        
                        if ($previousCheckIns > 0) {
                            $returnPatients++;
                        } else {
                            $newPatients++;
                        }
                    }

                    $data[] = [
                        'period' => $date->format('M d'),
                        'new_patients' => $newPatients,
                        'return_patients' => $returnPatients,
                    ];
                }
            } elseif ($period === 'monthly') {
                // Last 12 months - count patients who visited (check-ins) in each month
                $date = $today->copy()->subMonths(11);
                for ($i = 0; $i < 12; $i++) {
                    $start_date = $date->copy()->startOfMonth()->format('Y-m-d');
                    $end_date = $date->copy()->endOfMonth()->format('Y-m-d');

                    // Get all unique patients who checked in during this month
                    $checkInQuery = PatientCheckIn::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', '>=', $start_date)
                        ->whereDate('created_at', '<=', $end_date);
                    
                    $patientsInMonth = $checkInQuery->pluck('patient_id')->unique();
                    
                    // New patients: patients who checked in this month with no previous check-ins
                    $newPatients = 0;
                    $returnPatients = 0;
                    
                    foreach ($patientsInMonth as $patientId) {
                        $previousCheckIns = PatientCheckIn::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->where('patient_id', $patientId)
                            ->whereDate('created_at', '<', $start_date)
                            ->count();
                        
                        if ($previousCheckIns > 0) {
                            $returnPatients++;
                        } else {
                            $newPatients++;
                        }
                    }

                    $data[] = [
                        'period' => $date->format('M Y'),
                        'new_patients' => $newPatients,
                        'return_patients' => $returnPatients,
                    ];

                    $date->addMonthNoOverflow();
                }
            } else { // yearly
                // Last 5 years - count patients who visited (check-ins) in each year
                $date = $today->copy()->subYears(4);
                for ($i = 0; $i < 5; $i++) {
                    $start_date = $date->copy()->startOfYear()->format('Y-m-d');
                    $end_date = $date->copy()->endOfYear()->format('Y-m-d');

                    // Get all unique patients who checked in during this year
                    $checkInQuery = PatientCheckIn::query()
                        ->when($clinic_id, function ($query) use ($clinic_id) {
                            $query->whereHas('creator', function ($query) use ($clinic_id) {
                                $query->where('clinic_id', $clinic_id);
                            });
                        })
                        ->whereDate('created_at', '>=', $start_date)
                        ->whereDate('created_at', '<=', $end_date);
                    
                    $patientsInYear = $checkInQuery->pluck('patient_id')->unique();
                    
                    // New patients: patients who checked in this year with no previous check-ins
                    $newPatients = 0;
                    $returnPatients = 0;
                    
                    foreach ($patientsInYear as $patientId) {
                        $previousCheckIns = PatientCheckIn::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->where('patient_id', $patientId)
                            ->whereDate('created_at', '<', $start_date)
                            ->count();
                        
                        if ($previousCheckIns > 0) {
                            $returnPatients++;
                        } else {
                            $newPatients++;
                        }
                    }

                    $data[] = [
                        'period' => $date->format('Y'),
                        'new_patients' => $newPatients,
                        'return_patients' => $returnPatients,
                    ];

                    $date->addYear();
                }
            }

            return $data;
        } catch (\Exception $e) {
            \Log::error('generateNewVsReturnPatientsData error', [
                'message' => $e->getMessage(),
                'clinic_id' => $clinic_id,
                'period' => $period,
            ]);
            return [];
        }
    }

    private function generateClientStatistics($clinic_id, $start_date, $end_date)
    {
        try {
            // Get all patients who checked in during the period
            $checkInQuery = PatientCheckIn::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', '>=', $start_date)
                ->whereDate('created_at', '<=', $end_date);
            
            $patientsInPeriod = $checkInQuery->pluck('patient_id')->unique();
            
            // New clients: Patients with no previous check-ins before the period
            $newClients = 0;
            $returningClients = 0;
            
            foreach ($patientsInPeriod as $patientId) {
                $previousCheckIns = PatientCheckIn::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($query) use ($clinic_id) {
                            $query->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('patient_id', $patientId)
                    ->whereDate('created_at', '<', $start_date)
                    ->count();
                
                if ($previousCheckIns > 0) {
                    $returningClients++;
                } else {
                    $newClients++;
                }
            }

            // Outside clients: Patients with information source indicating external/referral
            $outsideClients = Patient::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($query) use ($clinic_id) {
                        $query->where('clinic_id', $clinic_id);
                    });
                })
                ->whereIn('id', $patientsInPeriod)
                ->whereHas('information_source', function ($query) {
                    $query->where('name', 'like', '%Referral%')
                        ->orWhere('name', 'like', '%External%')
                        ->orWhere('name', 'like', '%Outside%');
                })
                ->count();

            return [
                ['name' => 'New Client', 'count' => $newClients],
                ['name' => 'Returning Client', 'count' => $returningClients],
                ['name' => 'External', 'count' => $outsideClients],
            ];
        } catch (\Exception $e) {
            \Log::error('generateClientStatistics error', [
                'message' => $e->getMessage(),
                'clinic_id' => $clinic_id,
                'start_date' => $start_date,
                'end_date' => $end_date,
            ]);
            return [
                ['name' => 'New Client', 'count' => 0],
                ['name' => 'Returning Client', 'count' => 0],
                ['name' => 'External', 'count' => 0],
            ];
        }
    }
}
