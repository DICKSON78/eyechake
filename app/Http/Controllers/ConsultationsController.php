<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Jobs\SendConsultationMessageJob;
use App\Models\CataractSurgeryRecord;
use App\Models\Consultation;
use App\Models\ConsultationExternalExamination;
use App\Models\ConsultationFunctionalTest;
use App\Models\ConsultationFundoscopy;
use App\Models\ConsultationRefraction;
use App\Models\ConsultationVisualAcuity;
use App\Models\Item;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use App\Models\SurgeryRecordReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use stdClass;

class ConsultationsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
            'to_return_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $require_glass = $request->require_glass;
        $payment_cache_item_id = $request->payment_cache_item_id;
        $patient_direction = $request->patient_direction;
        $consultant_id = $request->consultant_id;
        $patient_id = $request->patient_id;
        $patient_name = $request->patient_name;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $patient_to_return = $request->patient_to_return;
        $to_return_date = $request->to_return_date;
        $item_payment_mode_id = $request->item_payment_mode_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Consultation::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);

            $query->with(['payment_mode', 'consultant']);
        }, 'creator', 'to_optician_sender']);

        if ($status) {
            if ($status === 'Awaiting Glass') {
                $data->where('require_glass', 'Yes')->whereNull('sent_to_optician_at');
            } else if ($status === 'Sent to Optician') {
                $data->where('require_glass', 'Yes')
                    ->whereNotNull('sent_to_optician_at')
                    ->whereHas('payment_cache.items', function ($query) {
                        $query->whereHas('consultation_type', function ($query2) {
                            $query2->where('name', 'Glass');
                        });

                        $query->where('status', '!=', 'Served');
                    });
            } else {
                $data->where('status', $status);
            }
        }

        if ($require_glass) {
            $data->where('require_glass', $require_glass);
        }

        if ($payment_cache_item_id) {
            $data->where('payment_cache_item_id', $payment_cache_item_id);
        }

        if ($patient_direction) {
            $data->where('patient_direction', $patient_direction);
        }

        if ($consultant_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($consultant_id) {
                $query->where('consultant_id', $consultant_id);
            });
        }

        if ($patient_id) {
            $data->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_name) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache_item.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($patient_to_return) {
            $now = Carbon::now()->format('Y-m-d');
            $data->where('patient_to_return', $patient_to_return)
                ->where(function ($query) use ($to_return_date, $now) {
                    $query->whereNotNull('to_return_date');

                    if ($to_return_date) {
                        $query->where('to_return_date', $to_return_date);
                    } else {
                        $query->where('to_return_date', '>=', $now);
                    }
                });
        }

        if ($item_payment_mode_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_payment_mode_id) {
                $query->where('payment_mode_id', $item_payment_mode_id);
            });
        }

        if ($start_date) {
            if ($status === 'Awaiting Glass') {
                $data->where(function ($query) use ($start_date) {
                    $query->where(function ($query2) use ($start_date) {
                        $query2->where('patient_direction', 'Direct to Optician');
                        $query2->whereDate('created_at', '>=', $start_date);
                    });
                    $query->orWhere(function ($query2) use ($start_date) {
                        $query2->where('patient_direction', 'Direct to Doctor');
                        $query2->whereHas('payment_cache_item', function ($query3) use ($start_date) {
                            $query3->whereNotNull('served_at');
                            $query3->whereDate('served_at', '>=', $start_date);
                        });
                    });
                });
            } elseif ($status === 'Sent to Optician') {
                $data->where(function ($query) use ($start_date) {
                    $query->whereNotNull('sent_to_optician_at');
                    $query->whereDate('sent_to_optician_at', '>=', $start_date);
                });
            } elseif ($status === 'Consulted') {
                $data->whereHas('payment_cache_item', function ($query) use ($start_date) {
                    $query->whereNotNull('served_at');
                    $query->whereDate('served_at', '>=', $start_date);
                });
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status === 'Awaiting Glass') {
                $data->where(function ($query) use ($end_date) {
                    $query->where(function ($query2) use ($end_date) {
                        $query2->where('patient_direction', 'Direct to Optician');
                        $query2->whereDate('created_at', '<=', $end_date);
                    });
                    $query->orWhere(function ($query2) use ($end_date) {
                        $query2->where('patient_direction', 'Direct to Doctor');
                        $query2->whereHas('payment_cache_item', function ($query3) use ($end_date) {
                            $query3->whereNotNull('served_at');
                            $query3->whereDate('served_at', '<=', $end_date);
                        });
                    });
                });
            } elseif ($status === 'Sent to Optician') {
                $data->where(function ($query) use ($end_date) {
                    $query->whereNotNull('sent_to_optician_at');
                    $query->whereDate('sent_to_optician_at', '<=', $end_date);
                });
            } elseif ($status === 'Consulted') {
                $data->whereHas('payment_cache_item', function ($query) use ($end_date) {
                    $query->whereNotNull('served_at');
                    $query->whereDate('served_at', '<=', $end_date);
                });
            } else {
                $data->whereDate('created_at', '<=', $end_date);
            }
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'item_id' => 'required|exists:items,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'consultant_id' => 'nullable|exists:employees,id',
            'quantity' => 'required|numeric|min:1',
        ]);

        $data = null;
        $user = $request->user();

        // if item has price for the provided payment mode, continue
        $item = Item::where('id', $request->item_id)
            ->whereHas('prices', function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            })
            ->with(['prices' => function ($query) use ($request) {
                $query->where('payment_mode_id', $request->payment_mode_id);
            }])
            ->first();

        if ($item) {
            // if this consultation has payment cache for this user use the existing one, otherwise create new
            $payment_cache = PatientPaymentCache::where('consultation_id', $request->consultation_id)
                ->where('created_by', $user->id)
                ->first();

            if (!$payment_cache) {
                $consultation = Consultation::find($request->consultation_id);
                $payment_cache = PatientPaymentCache::create([
                    'check_in_id' => $consultation->payment_cache_item->payment_cache->check_in_id,
                    'consultation_id' => $request->consultation_id,
                    'created_by' => $user->id,
                ]);
            } else {
                $payment_cache->update(['created_at' => Carbon::now()]);
            }

            $data = PatientPaymentCacheItem::create([
                'payment_cache_id' => $payment_cache->id,
                'item_id' => $item->id,
                'consultation_type_id' => $item->consultation_type_id,
                'consultant_id' => $request->consultant_id,
                'payment_mode_id' => $request->payment_mode_id,
                'unit_price' => $item->prices[0]->unit_price,
                'quantity' => $request->quantity,
                'dosage' => $request->dosage,
                'comments' => $request->comments,
                'created_by' => $user->id,
            ]);
            $data->item = $item;
            $data->status = 'Pending';
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Added successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param Request $request
     * @param  int $id
     * @return Response
     */
    public function show(Request $request, $id)
    {
        $with_diagnoses = $request->with_diagnoses;
        $with_items = $request->with_items;
        $with_item_templates = $request->with_item_templates;
        $data = Consultation::with([
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient' => function ($query2) {
                    $query2->with(['region', 'district', 'ward']);
                }]);

                $query->with(['payment_mode', 'consultant', 'server']);
            }, 'creator', 'external_examination', 'functional_tests', 'visual_acuity', 'refraction', 'fundoscopy',
            'to_optician_sender',
        ]);

        if ($with_diagnoses) {
            $data->with(['diagnoses.disease']);
        }

        $data = $data->findOrFail($id);

        if ($with_items) {
            $data->items = PatientPaymentCacheItem::with(['item.unit_of_measure', 'consultation_type', 'payment_mode', 'creator', 'server'])
                ->whereHas('payment_cache', function ($query) use ($id) {
                    $query->where('consultation_id', $id);
                })
                ->get();
        }

        if ($with_item_templates) {
            $data->templates = new stdClass();
            $data->templates->surgery_record_report = SurgeryRecordReport::with(['creator'])
                ->whereHas('payment_cache_item.payment_cache', function ($query) use ($id) {
                    $query->where('consultation_id', $id);
                })
                ->first();
            $data->templates->cataract_surgery_record = CataractSurgeryRecord::with(['creator'])
                ->whereHas('payment_cache_item.payment_cache', function ($query) use ($id) {
                    $query->where('consultation_id', $id);
                })
                ->first();
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'patient_to_return' => 'sometimes|required|in:Yes,No',
            'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
            'status' => 'sometimes|required|in:Pending,Consulted',
            'require_glass' => 'sometimes|required|in:Yes,No',
        ]);

        $data = Consultation::findOrFail($id);
        $data->update($request->all());

        if ($request->send_to_optician == 'Yes') {
            $data->update([
                'sent_to_optician_at' => Carbon::now(),
                'sent_to_optician_by' => $request->user()->id,
            ]);
        }

        if ($request->refraction) {
            $data->refraction->updateOrCreate($request->refraction);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function autoSaveClinicalNotes(Request $request, $id)
    {
        $request->validate([
            'what' => 'required|in:Consultation,Visual Acuity,External Examination,Functional Test,Refraction,Fundoscopy'
        ]);

        $user = $request->user();
        $data = Consultation::findOrFail($id);

        switch ($request->what) {
            case 'Consultation': {
                    $request->validate([
                        'patient_to_return' => 'sometimes|required|in:Yes,No',
                        'to_return_date' => 'nullable|date_format:Y-m-d',
                    ]);
                    $data->update($request->except('what'));
                }
                break;
            case 'External Examination': {
                    if ($data->external_examination) {
                        $data->external_examination->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationExternalExamination::create($input);
                    }
                }
                break;
            case 'Functional Test': {
                    if ($data->functional_tests) {
                        $data->functional_tests->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFunctionalTest::create($input);
                    }
                }
                break;
            case 'Visual Acuity': {
                    if ($data->visual_acuity) {
                        $data->visual_acuity->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationVisualAcuity::create($input);
                    }
                }
                break;
            case 'Refraction': {
                    if ($data->refraction) {
                        $data->refraction->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationRefraction::create($input);
                    }
                }
                break;
            case 'Fundoscopy': {
                    if ($data->fundoscopy) {
                        $data->fundoscopy->update($request->except('what'));
                    } else {
                        $input = $request->except('what');
                        $input['consultation_id'] = $id;
                        $input['created_by'] = $user->id;
                        ConsultationFundoscopy::create($input);
                    }
                }
                break;
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function completeClinicalNotes(Request $request, $id)
    {
        $request->validate([
            'patient_to_return' => 'sometimes|required|in:Yes,No',
            'to_return_date' => 'nullable|required_if:patient_to_return,Yes|date_format:Y-m-d',
            'require_glass' => 'sometimes|required|in:Yes,No',
        ]);

        $user = $request->user();
        $data = Consultation::findOrFail($id);
        $input = $request->only('chief_complaint', 'history_present_illness', 'family_history', 'general_health', 'family_ocular_history', 'family_general_history', 'pupils', 'extra_ocular_muscles', 'patient_to_return', 'to_return_date', 'remarks', 'require_glass');
        $input['status'] = 'Consulted';

        $data->update($input);

        if ($request->visual_acuity) {
            $data->visual_acuity->updateOrCreate($request->visual_acuity);
        }

        if ($request->external_examination) {
            $data->external_examination->updateOrCreate($request->external_examination);
        }

        if ($request->functional_tests) {
            $data->functional_tests->updateOrCreate($request->functional_tests);
        }

        if ($request->refraction) {
            $data->refraction->updateOrCreate($request->refraction);
        }

        if ($request->fundoscopy) {
            $data->fundoscopy->updateOrCreate($request->fundoscopy);
        }

        // update item if it is not dispensable
        if ($data->payment_cache_item->item->is_stock_item == 'No') {
            $data->payment_cache_item->update([
                'status' => 'Served',
                'served_at' => Carbon::now(),
                'served_by' => $user->id,
            ]);
        }

        // update consultant
        if ($user->employee) {
            $data->payment_cache_item->consultant_id = $user->employee->id;
            $data->payment_cache_item->save();
        }

        // send message to patient
        if ($data->patient_direction == 'Direct to Doctor') {
            SendConsultationMessageJob::dispatch($data);
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
