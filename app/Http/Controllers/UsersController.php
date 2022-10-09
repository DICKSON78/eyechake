<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UsersController extends Controller
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
        $q = $request->q;
        $data = User::query();

        if ($status) {
            $data->where('status', $status);
        }

        if ($q) {
            $data->where(function ($query) use ($q) {
                $query->where('first_name', 'like', '%' . $q . '%');
                $query->orWhere('middle_name', 'like', '%' . $q . '%');
                $query->orWhere('last_name', 'like', '%' . $q . '%');
            });
        }

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
            'name' => 'required|unique:items,name',
            'code' => 'nullable|unique:items,code',
            'item_type_id' => 'required|exists:item_types,id',
            'consultation_type_id' => 'required|exists:consultation_types,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'lens_type_id' => 'nullable|exists:lens_types,id',
            'is_consultation_item' => 'nullable|in:Yes,No',
        ]);

        $data = User::create($request->only(
            'name', 'code', 'item_type_id', 'consultation_type_id',
            'unit_of_measure_id', 'lens_type_id', 'is_consultation_item'
        ));
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
        $data = User::with(['item_type', 'consultation_type', 'unit_of_measure', 'lens_type', 'prices'])->findOrFail($id);
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
            'name' => 'nullable|unique:items,name,' . $id,
            'code' => 'nullable|unique:items,code,' . $id,
            'item_type_id' => 'nullable|exists:item_types,id',
            'consultation_type_id' => 'nullable|exists:consultation_types,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'lens_type_id' => 'nullable|exists:lens_types,id',
            'is_consultation_item' => 'nullable|in:Yes,No',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $data = User::findOrFail($id);
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
        $data = User::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
