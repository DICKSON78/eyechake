<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ClinicDetail;
use App\Models\Consultation;
use App\Models\ExpensePayment;
use App\Models\Patient;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $today = Carbon::today()->format('Y-m-d');
        $start_date = $request->start_date ?? '2000-01-01';
        $end_date = $request->end_date ?? $today;

        $data = [
            'counts' => [
                'total_sales' => 0,
                'discount' => 0,
                'expenses' => 0,
                'new_patients' => 0,
                'consulted_patients' => 0,
                'sms_balance' => 0,
            ],
            'statistics' => [
                'expenses_by_category' => [],
                'payments_by_channel' => [],
                'consultations_by_item' => [],
                'top_diagnosis' => [],
                'yearly' => [],
            ],
        ];

        $data['counts']['total_sales'] = PatientItemPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum(DB::raw('amount - discount')) + PatientItemBillPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        $data['counts']['discount'] = PatientItemPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('discount');

        $data['counts']['expenses'] = ExpensePayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->sum('amount');

        $data['counts']['new_patients'] = Patient::query()
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();
        $data['counts']['consulted_patients'] = Consultation::query()
            ->where(function ($query) {
                $query->where('patient_direction', 'Direct to Doctor')->where('status', 'Consulted');
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        $clinic_details = ClinicDetail::first();
        if ($clinic_details) {
            $data['counts']['sms_balance'] = $clinic_details->sms_balance;
        }

        $data['statistics']['expenses_by_category'] = DB::select('select exp.category_id, cat.name, sum(expp.amount) as amount from expense_payments as expp inner join expenses as exp on expp.expense_id = exp.id inner join expense_categories as cat on exp.category_id = cat.id where (date(expp.created_at) between ? and ?) group by exp.category_id', [$start_date, $end_date]);
        $data['statistics']['payments_by_channel'] = DB::select('select channel_id, name, sum(amount) as amount from ((select pmt.channel_id, pc.name, sum(pmt.amount - pmt.discount) as amount from patient_item_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id where (date(pmt.created_at) between ? and ?) group by pmt.channel_id) union (select pmt.channel_id, pc.name, sum(pmt.amount) as amount from patient_item_bill_payments as pmt inner join payment_channels as pc on pmt.channel_id = pc.id where (date(pmt.created_at) between ? and ?) group by pmt.channel_id)) as payments group by name', [$start_date, $end_date, $start_date, $end_date]);
        $data['statistics']['consultations_by_item'] = DB::select('select it.id, it.name, count(ct.id) as consultations from items as it inner join patient_payment_cache_items as ppci on ppci.item_id = it.id inner join consultations as ct on ct.payment_cache_item_id = ppci.id where ppci.status = ? and (date(ppci.served_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by ppci.item_id order by consultations desc', ['Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
        $data['statistics']['top_diagnosis'] = DB::select('select ds.id, ds.name, ds.code, count(cd.id) as consultations from diseases as ds inner join consultation_diagnoses as cd on cd.disease_id = ds.id inner join consultations as ct on cd.consultation_id = ct.id inner join patient_payment_cache_items as ppci on ct.payment_cache_item_id = ppci.id where ppci.status = ? and (date(ppci.served_at) between ? and ?) and ct.patient_direction = ? and ct.status = ? group by cd.disease_id order by consultations desc limit 6', ['Served', $start_date, $end_date, 'Direct to Doctor', 'Consulted']);
        
        $date = Carbon::today()->subMonths(11);

        for ($i = 0; $i < 12; $i++) {
            $start_date = $date->copy()->startOfMonth()->format('Y-m-d');
            $end_date = $date->copy()->endOfMonth()->format('Y-m-d');

            $data['statistics']['yearly'][] = [
                'month' => $date->format('M'),
                'statistics' => [
                    [
                        'name' => 'total_sales',
                        'amount' => PatientItemPayment::query()
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum(DB::raw('amount - discount')) + PatientItemBillPayment::query()
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum('amount'),
                    ],
                    [
                        'name' => 'discount',
                        'amount' => PatientItemPayment::query()
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum('discount')
                    ],
                    [
                        'name' => 'expenses',
                        'amount' => ExpensePayment::query()
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->sum('amount'),
                    ],
                    [
                        'name' => 'new_patients_male',
                        'amount' => Patient::query()
                            ->where('gender', 'Male')
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->count(),
                    ],
                    [
                        'name' => 'new_patients_female',
                        'amount' => Patient::query()
                            ->where('gender', 'Female')
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->count(),
                    ]
                ],
            ];

            $date->addMonthNoOverflow();
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
