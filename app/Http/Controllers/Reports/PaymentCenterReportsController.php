<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\ExpensePayment;
use App\Models\User;
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
        $item_payments = PatientItemPayment::with(['channel', 'creator'])
            ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'patient_item_payments.id')
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id');
        $bill_payments = PatientItemBillPayment::with(['channel', 'creator'])
            ->join('patient_item_bills as pib', 'patient_item_bill_payments.bill_id', '=', 'pib.id')
            ->join('patient_payment_cache_items as ppci', 'ppci.bill_id', '=', 'pib.id')
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id');

        $item_payments->with(['creator.clinic']);

        // Align cashier behavior with admin: only filter by clinic when explicitly requested
        // so pagination+union stays stable for non-admins as well.
        $effective_clinic_id = $clinic_id; // apply clinic scoping only when provided
        if ($effective_clinic_id) {
            $item_payments->whereIn('patient_item_payments.created_by', function($q) use ($effective_clinic_id) {
                $q->select('id')->from('users')->where('clinic_id', $effective_clinic_id);
            });
            $bill_payments->whereIn('patient_item_bill_payments.created_by', function($q) use ($effective_clinic_id) {
                $q->select('id')->from('users')->where('clinic_id', $effective_clinic_id);
            });
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

        $item_payments->select(DB::raw("'Cash' as transaction_type"), 'pt.first_name', 'pt.middle_name', 'pt.last_name', 'pch.patient_id', 'channel_id', 'patient_item_payments.amount', 'patient_item_payments.discount', 'patient_item_payments.created_at', 'patient_item_payments.created_by', DB::raw('group_concat(it.name separator ", ") as items'))->groupBy('patient_item_payments.id');
        $bill_payments->select(DB::raw("'Bill' as transaction_type"), 'pt.first_name', 'pt.middle_name', 'pt.last_name', 'pch.patient_id', 'channel_id', 'patient_item_bill_payments.amount', DB::raw('0 as discount'), 'patient_item_bill_payments.created_at', 'patient_item_bill_payments.created_by', DB::raw('group_concat(it.name separator ", ") as items'))->groupBy('patient_item_bill_payments.id');
        

        
        $union = $item_payments->unionAll($bill_payments);
        $union->orderBy('created_at', 'desc');
        $data = $union->paginate($per_page);

        // Calculate grand totals from all pages
        $allItems = $item_payments->unionAll($bill_payments)->get();
        $totalAmount = $allItems->sum('amount');
        $totalDiscount = $allItems->sum('discount');

        // Attach totals to paginated response
        $result = $data->toArray();
        $result['totals'] = [
            'amount' => $totalAmount,
            'discount' => $totalDiscount,
            'net' => max(0, $totalAmount - $totalDiscount),
        ];

        return $this->sendResponse($result, Response::HTTP_OK, 'Success.');
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

        $data = ExpensePayment::with(['expense.category', 'channel', 'creator'])
            ->join('expenses as e', 'expense_payments.expense_id', '=', 'e.id');

        $data->with(['creator.clinic']);

        // Mirror financial-management behavior: admins can scope by clinic_id; cashiers are scoped to their clinic
        $effective_clinic_id = $user->is_admin ? $clinic_id : $user->clinic_id;
        if ($effective_clinic_id) {
            $data->whereIn('expense_payments.created_by', function($q) use ($effective_clinic_id) {
                $q->select('id')->from('users')->where('clinic_id', $effective_clinic_id);
            });
        } elseif (!$user->is_admin) {
            $data->where('expense_payments.created_by', $user->id);
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
            'e.expense_date'
        );

        $data->orderBy('expense_payments.created_at', 'desc');
        $data = $data->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
