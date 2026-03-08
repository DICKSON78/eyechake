<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\ExpensePayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PaymentCenterReportsController extends Controller
{
    use ApiResponse;

    public function getCashCollectionReport(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $payment_channel_id = $request->payment_channel_id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');
        
        $item_payments = PatientItemPayment::query()
            ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'patient_item_payments.id')
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
            ->leftJoin('payment_channels as pc', 'patient_item_payments.channel_id', '=', 'pc.id')
            ->leftJoin('users as u', 'patient_item_payments.created_by', '=', 'u.id');
            
        $bill_payments = PatientItemBillPayment::query()
            ->join('patient_item_bills as pib', 'patient_item_bill_payments.bill_id', '=', 'pib.id')
            ->join('patient_payment_cache_items as ppci', 'ppci.bill_id', '=', 'pib.id')
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
            ->leftJoin('payment_channels as pc', 'patient_item_bill_payments.channel_id', '=', 'pc.id')
            ->leftJoin('users as u', 'patient_item_bill_payments.created_by', '=', 'u.id');

        if ($user->is_admin) {
            if ($clinic_id) {
                $item_payments->where('u.clinic_id', $clinic_id);
                $bill_payments->where('u.clinic_id', $clinic_id);
            }
        } else {
            $item_payments->where('u.clinic_id', $user->clinic_id);
            $bill_payments->where('u.clinic_id', $user->clinic_id);
        }

        if ($payment_channel_id) {
            $item_payments->where('patient_item_payments.channel_id', $payment_channel_id);
            $bill_payments->where('patient_item_bill_payments.channel_id', $payment_channel_id);
        }

        if ($patient_name) {
            $item_payments->whereRaw('concat(pt.first_name, coalesce(pt.middle_name, ""), pt.last_name) like ?', [str_replace(' ', '', '%' . $patient_name . '%')]);
            $bill_payments->whereRaw('concat(pt.first_name, coalesce(pt.middle_name, ""), pt.last_name) like ?', [str_replace(' ', '', '%' . $patient_name . '%')]);
        }

        if ($patient_id) {
            $item_payments->where('pch.patient_id', $patient_id);
            $bill_payments->where('pch.patient_id', $patient_id);
        }

        if ($patient_gender) {
            $item_payments->where('pt.gender', $patient_gender);
            $bill_payments->where('pt.gender', $patient_gender);
        }

        if ($patient_phone) {
            $item_payments->where('pt.phone', 'like', '%' . $patient_phone . '%');
            $bill_payments->where('pt.phone', 'like', '%' . $patient_phone . '%');
        }

        if ($start_date) {
            $item_payments->whereDate('patient_item_payments.created_at', '>=', $start_date);
            $bill_payments->whereDate('patient_item_bill_payments.created_at', '>=', $start_date);
        }

        if ($end_date) {
            $item_payments->whereDate('patient_item_payments.created_at', '<=', $end_date);
            $bill_payments->whereDate('patient_item_bill_payments.created_at', '<=', $end_date);
        }

        $item_payments->select(
            DB::raw("'Cash' as transaction_type"),
            DB::raw('ANY_VALUE(pt.first_name) as first_name'),
            DB::raw('ANY_VALUE(pt.middle_name) as middle_name'),
            DB::raw('ANY_VALUE(pt.last_name) as last_name'),
            DB::raw('ANY_VALUE(pch.patient_id) as patient_id'),
            DB::raw('ANY_VALUE(patient_item_payments.channel_id) as channel_id'),
            DB::raw('ANY_VALUE(patient_item_payments.amount) as amount'),
            DB::raw('ANY_VALUE(patient_item_payments.discount) as discount'),
            DB::raw('ANY_VALUE(patient_item_payments.created_at) as created_at'),
            DB::raw('ANY_VALUE(patient_item_payments.created_by) as created_by'),
            DB::raw('group_concat(it.name separator ", ") as items'),
            DB::raw('ANY_VALUE(pc.name) as channel_name'),
            DB::raw("ANY_VALUE(CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name)) as creator_name")
        )->groupBy('patient_item_payments.id');
        
        $bill_payments->select(
            DB::raw("'Bill' as transaction_type"),
            DB::raw('ANY_VALUE(pt.first_name) as first_name'),
            DB::raw('ANY_VALUE(pt.middle_name) as middle_name'),
            DB::raw('ANY_VALUE(pt.last_name) as last_name'),
            DB::raw('ANY_VALUE(pch.patient_id) as patient_id'),
            DB::raw('ANY_VALUE(patient_item_bill_payments.channel_id) as channel_id'),
            DB::raw('ANY_VALUE(patient_item_bill_payments.amount) as amount'),
            DB::raw('0 as discount'),
            DB::raw('ANY_VALUE(patient_item_bill_payments.created_at) as created_at'),
            DB::raw('ANY_VALUE(patient_item_bill_payments.created_by) as created_by'),
            DB::raw('group_concat(it.name separator ", ") as items'),
            DB::raw('ANY_VALUE(pc.name) as channel_name'),
            DB::raw("ANY_VALUE(CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name)) as creator_name")
        )->groupBy('patient_item_bill_payments.id');

        $data = $item_payments->unionAll($bill_payments);
        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        
        // Transform the data to match expected frontend structure
        $data->getCollection()->transform(function ($item) {
            $item->channel = (object)[
                'id' => $item->channel_id,
                'name' => $item->channel_name
            ];
            $item->creator = (object)[
                'id' => $item->created_by,
                'full_name' => $item->creator_name
            ];
            return $item;
        });
        
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function getExpenseReport(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $payment_channel_id = $request->payment_channel_id;
        $category_id = $request->category_id;
        $status = $request->status;
        $created_by = $request->created_by;
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        $data = ExpensePayment::query()
            ->join('expenses as e', 'expense_payments.expense_id', '=', 'e.id')
            ->leftJoin('expense_categories as ec', 'e.category_id', '=', 'ec.id')
            ->leftJoin('payment_channels as pc', 'expense_payments.channel_id', '=', 'pc.id')
            ->leftJoin('users as u', 'expense_payments.created_by', '=', 'u.id');

        if ($user->is_admin) {
            if ($clinic_id) {
                $data->where('u.clinic_id', $clinic_id);
            }
        } else {
            $data->where('u.clinic_id', $user->clinic_id);
        }

        if ($payment_channel_id) {
            $data->where('expense_payments.channel_id', $payment_channel_id);
        }

        if ($category_id) {
            $data->where('e.category_id', $category_id);
        }

        if ($created_by) {
            $data->where('expense_payments.created_by', $created_by);
        }

        if ($start_date) {
            $data->whereDate('expense_payments.created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('expense_payments.created_at', '<=', $end_date);
        }

        $data->select(
            'expense_payments.id',
            'expense_payments.expense_id',
            'expense_payments.amount',
            'expense_payments.channel_id',
            'expense_payments.created_by',
            'expense_payments.created_at',
            'e.description',
            'e.category_id',
            'e.expense_date',
            'ec.name as category_name',
            'pc.name as channel_name',
            DB::raw("CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name) as creator_name")
        );

        $data->orderBy('expense_payments.created_at', 'desc');
        $data = $data->paginate($per_page);
        
        // Transform the data to match expected frontend structure
        $data->getCollection()->transform(function ($item) {
            $item->expense = (object)[
                'id' => $item->expense_id,
                'description' => $item->description,
                'category' => (object)[
                    'id' => $item->category_id,
                    'name' => $item->category_name
                ]
            ];
            $item->channel = (object)[
                'id' => $item->channel_id,
                'name' => $item->channel_name
            ];
            $item->creator = (object)[
                'id' => $item->created_by,
                'full_name' => $item->creator_name
            ];
            return $item;
        });

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
