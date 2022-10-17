<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\PatientCheckIn;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientPaymentCacheController extends Controller
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
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $gender = $request->gender;
        $phone = $request->phone;
        $item_status = $request->item_status;
        $item_payment_mode_id = $request->item_payment_mode_id;
        $item_payment_mode_type = $request->item_payment_mode_type;
        $item_consultation_type = $request->item_consultation_type;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = PatientPaymentCache::with(['check_in.patient' => function ($query) {
            $query->with(['region', 'district']);
        }, 'check_in.payment_mode', 'creator']);

        if ($patient_name) {
            $data->whereHas('patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($gender) {
            $data->whereHas('patient', function ($query) use ($gender) {
                $query->where('gender', $gender);
            });
        }

        if ($phone) {
            $data->whereHas('patient', function ($query) use ($phone) {
                $query->where('phone', 'like', '%' . $phone . '%');
            });
        }

        if ($item_status) {
            $data->whereHas('items', function ($query) use ($item_status) {
                $query->where('status', $item_status);
            });
        }

        if ($item_payment_mode_id) {
            $data->whereHas('items.payment_mode', function ($query) use ($item_payment_mode_id) {
                $query->where('id', $item_payment_mode_id);
            });
        }

        if ($item_payment_mode_type) {
            $data->whereHas('items.payment_mode', function ($query) use ($item_payment_mode_type) {
                $query->where('payment_type', $item_payment_mode_type);
            });
        }

        if ($item_consultation_type) {
            $data->whereHas('items.consultation_type', function ($query) use ($item_consultation_type) {
                $query->where('name', $item_consultation_type);
            });
        }

        if ($start_date) {
            $data->where('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->where('created_at', '<=', $end_date);
        }

        $data->orderBy('created_by', 'desc');
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

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientPaymentCache::with(['check_in.patient', 'items', 'creator'])->findOrFail($id);
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
        //
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
