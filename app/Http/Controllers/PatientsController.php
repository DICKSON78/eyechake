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
        $per_page = $request->per_page ?? 25;
        $q = $request->q;
        $id = $request->id;
        $gender = $request->gender;
        $region_id = $request->region_id;
        $district_id = $request->district_id;
        $ward_id = $request->ward_id;
        $data = Patient::with(['region', 'district', 'ward', 'creator']);

        if ($q) {
            $data->where(function ($query) use ($q) {
                $query->where('first_name', 'like', '%' . $q . '%');
                $query->orWhere('middle_name', 'like', '%' . $q . '%');
                $query->orWhere('last_name', 'like', '%' . $q . '%');
                $query->orWhere('phone', 'like', '%' . $q . '%');
            });
        }

        if ($id) {
            $data->where('id', $id);
        }

        if ($gender) {
            $data->where('gender', $gender);
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
            'region_id' => 'required|exists:regions,id',
            'district_id' => 'required|exists:districts,id',
            'ward_id' => 'nullable|exists:wards,id',
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
        $data = Patient::with(['region', 'district', 'ward', 'creator'])->findOrFail($id);
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
            'region_id' => 'nullable|exists:regions,id',
            'district_id' => 'nullable|exists:districts,id',
            'ward_id' => 'nullable|exists:wards,id',
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
        $data = Patient::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
