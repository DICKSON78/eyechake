<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\PatientCheckIn;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;

class PatientCheckInsController extends Controller
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
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $gender = $request->gender;
        $phone = $request->phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = PatientCheckIn::with(['patient' => function ($query) {
            $query->with(['region', 'district']);
        }, 'payment_mode', 'creator']);

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
            'patient_id' => 'required|exists:patients,id',
            'payment_mode_id' => 'required|exists:payment_modes,id',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.consultant_id' => 'nullable|exists:employees,id',
            'items.*.payment_mode_id' => 'required|exists:payment_modes,id',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        $user = $request->user();
        $input = $request->only('patient_id', 'payment_mode_id');
        $input['created_by'] = $user->id;
        $data = PatientCheckIn::create($input);

        if ($data) {
            $payment_cache = PatientPaymentCache::create([
                'check_in_id' => $data->id,
                'created_by' => $user->id,
            ]);

            if ($payment_cache) {
                $input_items = $request->json('items');

                foreach ($input_items as &$input_item) {
                    // if this item has price for the provided payment mode, continue
                    $item = Item::where('id', $input_item['item_id'])
                        ->whereHas('prices', function ($query) use ($input_item) {
                            $query->where('payment_mode_id', $input_item['payment_mode_id']);
                        })
                        ->with(['prices' => function ($query) use ($input_item) {
                            $query->where('payment_mode_id', $input_item['payment_mode_id']);
                        }])
                        ->first();

                    if ($item) {
                        PatientPaymentCacheItem::create([
                            'payment_cache_id' => $payment_cache->id,
                            'item_id' => $item->id,
                            'consultation_type_id' => $item->consultation_type_id,
                            'consultant_id' => Arr::get($input_item, 'consultant_id'),
                            'payment_mode_id' => $input_item['payment_mode_id'],
                            'unit_price' => $item->prices[0]->unit_price,
                            'quantity' => $input_item['quantity'],
                            'created_by' => $user->id,
                        ]);
                    }
                }
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Checked in successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientCheckIn::with(['patient', 'payment_mode', 'creator'])->findOrFail($id);
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
