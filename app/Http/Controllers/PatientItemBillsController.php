<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientItemBillsController extends Controller
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
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $id = $request->id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $with_items = $request->with_items;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = PatientItemBill::with(['first_item', 'creator'])->whereHas('first_item');

        if ($status) {
            $data->where('status', $status);
        }

        if ($id) {
            $data->where('id', $id);
        }

        if ($patient_name) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($with_items) {
            $data->with(['items' => function ($query) {
                $query->with(['item.unit_of_measure', 'payment_mode', 'creator']);
            }]);
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
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

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientItemBill::with(['creator', 'clearer'])->findOrFail($id);
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
        $data = PatientItemBill::findOrFail($id);
        $data->update($request->only('discount'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function clear(Request $request, $id)
    {

        $data = PatientItemBill::findOrFail($id);
        $data->update([
            'status' => 'Cleared',
            'cleared_at' => Carbon::now(),
            'cleared_by' => $request->user()->id,
        ]);
        return $this->sendResponse($data, Response::HTTP_OK, 'Cleared successfully.');
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
