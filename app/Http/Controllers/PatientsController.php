<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientsController extends Controller
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

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $id = $request->id;
        $name = $request->name;
        $gender = $request->gender;
        $phone = $request->phone;
        $region_id = $request->region_id;
        $district_id = $request->district_id;
        $ward_id = $request->ward_id;
        $payment_mode_id = $request->payment_mode_id;
        $info_source_id = $request->info_source_id;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Patient::with(['payment_mode', 'information_source', 'creator']);

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            });
        }

        if ($id) {
            $data->where('id', $id);
        }

        if ($name) {
            $data->fullName('%' . $name . '%');
        }

        if ($gender) {
            $data->where('gender', $gender);
        }

        if ($phone) {
            $data->where('phone', 'like', '%' . $phone . '%');
        }

        if ($region_id) {
            $data->where('region_id', $region_id);
        }

        if ($district_id) {
            $data->where('district_id', $district_id);
        }

        if ($ward_id) {
            $data->where('ward_id', $ward_id);
        }

        if ($payment_mode_id) {
            $data->where('payment_mode_id', $payment_mode_id);
        }

        if ($info_source_id) {
            $data->where('info_source_id', $info_source_id);
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
        $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'gender' => 'required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'region_id' => 'nullable|exists:regions,id',
            'district_id' => 'nullable|exists:districts,id',
            'ward_id' => 'nullable|exists:wards,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'info_source_id' => 'nullable|exists:information_sources,id',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = Patient::create($input);
        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = Patient::with(['payment_mode', 'information_source', 'creator'])->findOrFail($id);
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
            'first_name' => 'sometimes|required',
            'last_name' => 'sometimes|required',
            'gender' => 'sometimes|required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'region_id' => 'nullable|exists:regions,id',
            'district_id' => 'nullable|exists:districts,id',
            'ward_id' => 'nullable|exists:wards,id',
            'payment_mode_id' => 'sometimes|required|exists:payment_modes,id',
            'info_source_id' => 'nullable|exists:information_sources,id',
        ]);

        $data = Patient::findOrFail($id);
        $data->update($request->all());
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
