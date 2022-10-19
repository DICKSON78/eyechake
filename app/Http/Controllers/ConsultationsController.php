<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\ConsultationExternalExamination;
use App\Models\ConsultationFundoscopy;
use App\Models\ConsultationRefraction;
use App\Models\ConsultationVisualAcuity;
use App\Models\Item;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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
        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $payment_cache_item_id = $request->payment_cache_item_id;
        $consultant_id = $request->consultant_id;
        $patient_id = $request->patient_id;
        $patient_name = $request->patient_name;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $item_payment_mode_id = $request->item_payment_mode_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Consultation::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);

            $query->with(['payment_mode', 'consultant']);
        }, 'creator']);

        if ($status) {
            $data->where('status', $status);
        }

        if ($payment_cache_item_id) {
            $data->where('payment_cache_item_id', $payment_cache_item_id);
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
                $query->where('phone', $patient_phone);
            });
        }

        if ($item_payment_mode_id) {
            $data->whereHas('payment_cache_item', function ($query) use ($item_payment_mode_id) {
                $query->where('payment_mode_id', $item_payment_mode_id);
            });
        }

        if ($start_date) {
            $data->where('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->where('created_at', '<=', $end_date);
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
            'consultant_id' => 'required|exists:users,id',
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
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = Consultation::with(['payment_cache_item' => function ($query) {
            $query->with(['payment_cache.check_in.patient' => function ($query2) {
                $query2->with(['region', 'district', 'ward']);
            }]);

            $query->with(['payment_mode', 'consultant']);
        }, 'creator', 'external_examination', 'visual_acuity', 'refraction', 'fundoscopy'])
            ->findOrFail($id);
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
            'status' => 'nullable|in:Pending,Consulted'
        ]);

        $data = Consultation::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function autoSaveClinicalNotes(Request $request, $id)
    {
        $request->validate([
            'what' => 'required|in:Consultation,Visual Acuity,External Examination,Refraction,Fundoscopy'
        ]);

        $user = $request->user();
        $data = Consultation::findOrFail($id);

        switch ($request->what) {
            case 'Consultation': {
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
