<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientPaymentCache;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationsController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $user = $request->user();
        $clinic_id = $request->clinic_id;
        $start_date = Carbon::today()->startOfDay()->format('Y-m-d');
        $end_date = Carbon::today()->endOfDay()->format('Y-m-d');

        $data = [
            'patients_sent_to_cashier' => 0,
            'credit_patients_approval' => 0,
            'patients_sent_to_doctor' => 0,
            'patients_sent_to_optician' => 0,
            'glass_patients' => 0,
            'dispensing_requests' => 0,
            'procedure_requests' => 0,
            'other_dispensing_requests' => 0,
            'patients_to_return' => 0,
        ];

        $data['patients_sent_to_cashier'] = PatientPaymentCache::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('payment_mode', function ($query2) {
                    $query2->where('transaction_type', 'Cash');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['credit_patients_approval'] = PatientPaymentCache::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->whereHas('items', function ($query) {
                $query->where('status', 'Pending');
                $query->whereHas('payment_mode', function ($query2) {
                    $query2->where('transaction_type', 'Credit');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['patients_sent_to_doctor'] = Consultation::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->where('status', 'Pending')
            ->where('patient_direction', 'Direct to Doctor')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['patients_sent_to_optician'] = Consultation::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->where('require_glass', 'Yes')
            ->whereNotNull('sent_to_optician_at')
            ->whereHas('payment_cache.items', function ($query) {
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Glass');
                });

                $query->where('status', '!=', 'Served');
            })
            ->where(function ($query) use ($start_date, $end_date) {
                $query->whereNotNull('sent_to_optician_at');
                $query->whereDate('sent_to_optician_at', '>=', $start_date);
                $query->whereDate('sent_to_optician_at', '<=', $end_date);
            })
            ->count();

        $data['glass_patients'] = Consultation::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->where('require_glass', 'Yes')
            ->whereNull('sent_to_optician_at')
            ->where(function ($query) use ($start_date, $end_date) {
                $query->where(function ($query2) use ($start_date, $end_date) {
                    $query2->where('patient_direction', 'Direct to Optician');
                    $query2->whereDate('created_at', '>=', $start_date);
                    $query2->whereDate('created_at', '<=', $end_date);
                });
                $query->orWhere(function ($query2) use ($start_date, $end_date) {
                    $query2->where('patient_direction', 'Direct to Doctor');
                    $query2->whereHas('payment_cache_item', function ($query3) use ($start_date, $end_date) {
                        $query3->whereNotNull('served_at');
                        $query3->whereDate('served_at', '>=', $start_date);
                        $query3->whereDate('served_at', '<=', $end_date);
                    });
                });
            })
            ->count();

        $data['dispensing_requests'] = PatientPaymentCache::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Pharmacy');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['procedure_requests'] = PatientPaymentCache::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Procedure');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['other_dispensing_requests'] = PatientPaymentCache::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->whereHas('items', function ($query) {
                $query->whereIn('status', ['Pending', 'Paid', 'Billed']);
                $query->whereHas('consultation_type', function ($query2) {
                    $query2->where('name', 'Others');
                });
                $query->whereHas('item', function ($query2) {
                    $query2->where('is_stock_item', 'Yes');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['patients_to_return'] = Consultation::when($clinic_id, function ($query) use ($clinic_id) {
            // $query->whereHas('creator', function ($query) use ($clinic_id) {
            //     $query->where('clinic_id', $clinic_id);
            // });
        })
            ->where('status', 'Consulted')
            ->whereNotNull('to_return_date')
            ->where('to_return_date', '>=', $start_date)
            ->where('to_return_date', '<=', $end_date)
            ->count();

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
