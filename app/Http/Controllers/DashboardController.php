<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\Expense;
use App\Models\Patient;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use App\Models\PaymentChannel;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $past_days = $request->past_days ?? 7;

        $data = [
            'counts' => [
                'cash_collection' => 0,
                'expenses' => 0,
                'new_patients' => 0,
                'consulted_patients' => 0,
            ],
            'statistics' => [
                'cash_collection_by_channel' => [],
                'expenses_by_category' => [],
                'cash_collection_by_consultation_type' => [],
            ],
        ];

        $now = Carbon::now();
        $start_date = $now->subDays($past_days);

        $a = PatientItemPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->sum(DB::raw('amount - discount'));
        $b = PatientItemBillPayment::query()
            ->whereDate('created_at', '>=', $start_date)
            ->sum('amount');
        $data['counts']['cash_collection'] = $a + $b;

        $data['counts']['expenses'] = Expense::query()
            ->whereDate('expense_date', '>=', $start_date)
            ->sum('paid_amount');
        $data['counts']['new_patients'] = Patient::query()
            ->whereDate('created_at', '>=', $start_date)
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
            ->count();

        $data['statistics']['expenses_by_category'] = DB::select('select exp.category_id, cat.name, sum(exp.paid_amount) as amount FROM expenses as exp inner join expense_categories as cat on exp.category_id = cat.id where date(exp.expense_date) >= ? group by exp.category_id', [$start_date]);
        $data['statistics']['cash_collection_by_consultation_type'] = DB::select('select pct.consultation_type_id, cnt.name, sum(pct.unit_price * pct.quantity) as amount from patient_payment_cache_items as pct inner join consultation_types as cnt on pct.consultation_type_id = cnt.id inner join payment_modes as pmd on pct.payment_mode_id = pmd.id where pmd.name = "Cash" and pct.status in ("Paid","Served") and date(pct.created_at) >= ? group by pct.consultation_type_id', [$start_date]);

        $channels = PaymentChannel::query()->where('status', 'Active')->get();

        foreach ($channels as &$channel) {
            $a = PatientItemPayment::query()
                ->where('channel_id', $channel->id)
                ->whereDate('created_at', '>=', $start_date)
                ->sum(DB::raw('amount - discount'));
            $b = PatientItemBillPayment::query()
                ->where('channel_id', $channel->id)
                ->whereDate('created_at', '>=', $start_date)
                ->sum('amount');
            $sum = $a + $b;

            if (($sum) > 0) {
                $data['statistics']['cash_collection_by_channel'][] = [
                    'channel_id' => $channel->id,
                    'name' => $channel->name,
                    'amount' => $sum,
                ];
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
