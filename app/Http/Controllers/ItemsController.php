<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ItemsController extends Controller
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
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $q = $request->q;
        $item_type_id = $request->item_type_id;
        $item_type = $request->item_type;
        $lens_type_id = $request->lens_type_id;
        $consultation_type_id = $request->consultation_type_id;
        $consultation_type = $request->consultation_type;
        $is_consultation_item = $request->is_consultation_item;
        $is_stock_item = $request->is_stock_item;
        $payment_mode_id = $request->payment_mode_id;
        $data = Item::with(['item_type', 'consultation_type', 'unit_of_measure', 'lens_type']);

        if ($user->is_admin) {
            $data->with(['clinic']);

            if ($clinic_id) {
                $data->where('clinic_id', $clinic_id);
            }
        } else {
            // $data->where('clinic_id', $user->clinic_id);
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($q) {
            $data->where(function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
                $query->orWhere('code', 'like', '%' . $q . '%');
            });
        }

        if ($item_type_id) {
            $data->where('item_type_id', $item_type_id);
        }

        if ($item_type) {
            $data->whereHas('item_type', function ($query) use ($item_type) {
                $query->where('name', $item_type);
            });
        }

        if ($lens_type_id) {
            $data->where('lens_type_id', $lens_type_id);
        }

        if ($consultation_type_id) {
            $data->where('consultation_type_id', $consultation_type_id);
        }

        if ($consultation_type) {
            $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                $query->where('name', $consultation_type);
            });
        }

        if ($is_consultation_item) {
            $data->where('is_consultation_item', $is_consultation_item);
        }

        if ($is_stock_item) {
            $data->where('is_stock_item', $is_stock_item);
        }

        if ($payment_mode_id) {
            $data->with(['prices' => function ($query) use ($payment_mode_id) {
                $query->where('payment_mode_id', $payment_mode_id);
            }])->whereHas('prices', function ($query) use ($payment_mode_id) {
                $query->where('payment_mode_id', $payment_mode_id);
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
        $user = $request->user();
        if ($user->is_admin) {
            $request->validate([
                'clinic_id' => 'required|exists:clinics,id',
            ]);

            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $request->validate([
            'name' => 'required',
            'code' => 'nullable|unique:items,code',
            'item_type_id' => 'required|exists:item_types,id',
            'consultation_type_id' => 'required|exists:consultation_types,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'lens_type_id' => 'nullable|exists:lens_types,id',
            'is_consultation_item' => 'required|in:Yes,No',
            'is_stock_item' => 'required|in:Yes,No',
        ]);

        $input = $request->only(
            'name',
            'code',
            'item_type_id',
            'consultation_type_id',
            'unit_of_measure_id',
            'lens_type_id',
            'is_consultation_item',
            'is_stock_item',
            'templates',
        );
        $input['clinic_id'] = $clinic_id;
        $data = Item::create($input);
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
        $data = Item::with(['item_type', 'consultation_type', 'unit_of_measure', 'lens_type', 'prices'])->findOrFail($id);
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
            'name' => 'sometimes|required',
            'code' => 'nullable|unique:items,code,' . $id,
            'item_type_id' => 'sometimes|required|exists:item_types,id',
            'consultation_type_id' => 'sometimes|required|exists:consultation_types,id',
            'unit_of_measure_id' => 'nullable|exists:units_of_measure,id',
            'lens_type_id' => 'nullable|exists:lens_types,id',
            'is_consultation_item' => 'sometimes|required|in:Yes,No',
            'is_stock_item' => 'sometimes|required|in:Yes,No',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $data = Item::findOrFail($id);
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
        $data = Item::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
