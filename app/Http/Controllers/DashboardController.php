<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\Expense;
use App\Models\Patient;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $now = Carbon::now()->format('Y-m-d');
        $start_date = $request->start_date ?? '1970-01-01';
        $end_date = $request->end_date ?? $now;

        $data = [
            'counts' => [
                'total_sales' => 0,
                'discount' => 0,
                'expenses' => 0,
                'new_patients' => 0,
                'consulted_patients' => 0,
                'glass' => 0,
                'pharmacy' => 0,
                'consultation' => 0,
            ],
            'statistics' => [
                'expenses_by_category' => [],
                'payments_by_channel' => [],
            ],
        ];

        $data['counts']['total_sales'] = PatientPaymentCacheItem::query()
            ->whereIn('status', ['Paid', 'Served'])
            ->whereNull('bill_id')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum(DB::raw('unit_price * quantity'));
        $data['counts']['total_sales'] += PatientItemBillPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        $data['counts']['discount'] = PatientItemPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('discount');

        $data['counts']['glass'] = PatientPaymentCacheItem::query()
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Glass');
            })
            ->whereIn('status', ['Paid', 'Served'])
            ->whereNull('bill_id')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum(DB::raw('unit_price * quantity'));

        $data['counts']['pharmacy'] = PatientPaymentCacheItem::query()
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Pharmacy');
            })
            ->whereIn('status', ['Paid', 'Served'])
            ->whereNull('bill_id')
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum(DB::raw('unit_price * quantity'));

        $data['counts']['consultation'] = Consultation::query()->join('patient_payment_cache_items as it', 'consultations.payment_cache_item_id', '=', 'it.id')
            ->where('consultations.consultant', 'Doctor')
            ->whereIn('it.status', ['Paid', 'Served'])
            ->whereNull('it.bill_id')
            ->whereDate('it.created_at', '>=', $start_date)
            ->whereDate('it.created_at', '<=', $end_date)
            ->sum(DB::raw('it.unit_price * it.quantity'));

        $data['counts']['expenses'] = Expense::query()
            ->whereDate('expense_date', '>=', $start_date)
            ->whereDate('expense_date', '<=', $end_date)
            ->sum('paid_amount');

        $data['counts']['new_patients'] = Patient::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();
        $data['counts']['consulted_patients'] = Consultation::query()
            ->where(function ($query) {
                $query->where(function ($query2) {
                    $query2->where('consultant', 'Doctor')->where('status', 'Consulted');
                });
                $query->orWhere(function ($query2) {
                    $query2->where('consultant', 'Optician')->where('optician_status', 'Consulted');
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $data['statistics']['expenses_by_category'] = DB::select('select exp.category_id, cat.name, sum(exp.paid_amount) as amount FROM expenses as exp inner join expense_categories as cat on exp.category_id = cat.id where (date(exp.expense_date) between ? and ?) group by exp.category_id', [$start_date, $end_date]);
        $data['statistics']['payments_by_channel'] = DB::select('select pmt.channel_id, pc.name, sum(pmt.amount) as amount from patient_item_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id where (date(pmt.created_at) between ? and ?) group by pmt.channel_id', [$start_date, $end_date]);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
