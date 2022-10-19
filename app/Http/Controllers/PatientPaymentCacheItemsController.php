<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientPaymentCacheItemsController extends Controller
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
        $payment_cache_id = $request->payment_cache_id;
        $payment_mode_id = $request->payment_mode_id;
        $payment_mode_type = $request->payment_mode_type;
        $consultation_type = $request->consultation_type;
        $consultant_id = $request->consultant_id;
        $consultation_id = $request->consultation_id;
        $data = PatientPaymentCacheItem::with(['item', 'consultation_type', 'payment_mode', 'creator']);

        if ($status) {
            $data->where('status', $status);
        }

        if ($payment_cache_id) {
            $data->where('payment_cache_id', $payment_cache_id);
        }

        if ($payment_mode_id) {
            $data->where('payment_mode_id', $payment_mode_id);
        }

        if ($payment_mode_type) {
            $data->whereHas('payment_mode', function ($query) use ($payment_mode_type) {
                $query->where('payment_type', $payment_mode_type);
            });
        }

        if ($consultation_type) {
            $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                $query->where('name', $consultation_type);
            });
        }

        if ($consultant_id) {
            $data->where('consultant_id', $consultant_id);
        }

        if ($consultation_id) {
            $data->whereHas('payment_cache', function ($query) use ($consultation_id) {
                $query->where('consultation_id', $consultation_id);
            });
        }

        $data->orderBy('created_at', 'asc');
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

    public function makeCashPayment(Request $request)
    {
        $request->validate([
            'payment_channel_id' => 'required|exists:payment_channels,id',
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        $amount = 0;

        $payment = PatientItemPayment::create([
            'channel_id' => $request->payment_channel_id,
            'amount' => 0,
            'discount' => $request->discount,
            'created_by' => $user->id,
        ]);

        if ($payment) {
            $items = $request->json('items');

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    $item->item_payment_id = $payment->id;
                    $item->status = 'Paid';
                    $item->save();

                    if ($item->item->is_consultation_item == 'Yes') {
                        Consultation::create([
                            'payment_cache_item_id' => $item->id,
                            'consultant_id' => $item->consultant_id,
                            'created_by' => $user->id,
                        ]);
                    }
                }
            }

            $payment->amount = $amount;
            $payment->save();

            return $this->sendResponse($payment, Response::HTTP_OK, 'Payment made successfully.');
        }

        return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Payment could not be made.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientPaymentCacheItem::with([
            'payment_cache.check_in.patient', 'item', 'consultation_type', 'payment_mode', 'creator',
        ])
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
