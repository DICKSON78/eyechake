<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class MarketingDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $today = Carbon::today()->format('Y-m-d');

        if ($user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $start_date = $request->start_date ?? '2000-01-01';
        $end_date = $request->end_date ?? Carbon::today()->addYearsNoOverflow(10)->format('Y-m-d');

        $data = [
            'summary' => [
                'new_patients' => 0,
            ],
            'statistics' => [
                'patients_by_information_source' => [],
                'daily_activities' => [],
                'ideas' => [],
                'appointments' => [],
                'outreach_programmes' => [],
                'communication_logs' => [],
                'yearly' => [],
            ],
            'lists' => [
                'daily_activities' => [],
            ],
        ];

        $data['summary']['new_patients'] = Patient::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', '>=', $start_date)
            ->whereDate('created_at', '<=', $end_date)
            ->count();

        if ($clinic_id) {
            $data['statistics']['patients_by_information_source'] = DB::select('select inf.id, inf.name, count(pt.id) as patients from information_sources as inf inner join patients as pt on pt.info_source_id = inf.id inner join users as u on pt.created_by = u.id where u.clinic_id = ? and (date(pt.created_at) between ? and ?) group by pt.info_source_id', [$clinic_id, $start_date, $end_date]);
            $data['statistics']['daily_activities'] = DB::select('select da.status, count(da.id) as activities from daily_activities as da inner join users as u on da.created_by = u.id where u.clinic_id = ? and (da.activity_date between ? and ?) group by da.status', [$clinic_id, $start_date, $end_date]);
            $data['statistics']['ideas'] = DB::select('select id.status, count(id.id) as ideas from ideas as id inner join users as u on id.created_by = u.id where u.clinic_id = ? and (date(id.created_at) between ? and ?) group by id.status', [$clinic_id, $start_date, $end_date]);
            $data['statistics']['appointments'] = DB::select('select ev.status, count(ev.id) as appointments from events as ev inner join users as u on ev.created_by = u.id where u.clinic_id = ? and ev.event_type = ? and (ev.event_date between ? and ?) group by ev.status', [$clinic_id, 'Appointment', $start_date, $end_date]);
            $data['statistics']['outreach_programmes'] = DB::select('select ev.status, count(ev.id) as programmes from events as ev inner join users as u on ev.created_by = u.id where u.clinic_id = ? and ev.event_type = ? and (ev.event_date between ? and ?) group by ev.status', [$clinic_id, 'Outreach Programme', $start_date, $end_date]);
            $data['statistics']['communication_logs'] = DB::select('select cl.communication_type, count(cl.id) as logs from communication_logs as cl inner join users as u on cl.created_by = u.id where u.clinic_id = ? and (date(cl.created_at) between ? and ?) group by cl.communication_type', [$clinic_id, $start_date, $end_date]);
        } else {
            $data['statistics']['patients_by_information_source'] = DB::select('select inf.id, inf.name, count(pt.id) as patients from information_sources as inf inner join patients as pt on pt.info_source_id = inf.id where (date(pt.created_at) between ? and ?) group by pt.info_source_id', [$start_date, $end_date]);
            $data['statistics']['daily_activities'] = DB::select('select status, count(id) as activities from daily_activities where (activity_date between ? and ?) group by status', [$start_date, $end_date]);
            $data['statistics']['ideas'] = DB::select('select status, count(id) as ideas from ideas where (date(created_at) between ? and ?) group by status', [$start_date, $end_date]);
            $data['statistics']['appointments'] = DB::select('select status, count(id) as appointments from events where event_type = ? and (event_date between ? and ?) group by status', ['Appointment', $start_date, $end_date]);
            $data['statistics']['outreach_programmes'] = DB::select('select status, count(id) as programmes from events where event_type = ? and (event_date between ? and ?) group by status', ['Outreach Programme', $start_date, $end_date]);
            $data['statistics']['communication_logs'] = DB::select('select communication_type, count(id) as logs from communication_logs where (date(created_at) between ? and ?) group by communication_type', [$start_date, $end_date]);
        }

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
                            ->sum('amount'),
                    ],
                    [
                        'name' => 'new_patients_male',
                        'amount' => Patient::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
                            ->where('gender', 'Male')
                            ->whereDate('created_at', '>=', $start_date)
                            ->whereDate('created_at', '<=', $end_date)
                            ->count(),
                    ],
                    [
                        'name' => 'new_patients_female',
                        'amount' => Patient::query()
                            ->when($clinic_id, function ($query) use ($clinic_id) {
                                $query->whereHas('creator', function ($query) use ($clinic_id) {
                                    $query->where('clinic_id', $clinic_id);
                                });
                            })
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
