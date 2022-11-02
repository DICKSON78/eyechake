<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
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
        $q = $request->q;
        $payment_cache_id = $request->payment_cache_id;
        $payment_mode_id = $request->payment_mode_id;
        $payment_mode_type = $request->payment_mode_type;
        $consultation_type = $request->consultation_type;
        $consultant_id = $request->consultant_id;
        $consultation_id = $request->consultation_id;
        $bill_id = $request->bill_id;
        $with_patient = $request->with_patient;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $sort_direction = $request->sort_direction ?? 'asc';

        $request->validate([
            'sort_direction' => 'nullable|in:asc,desc',
        ]);

        $data = PatientPaymentCacheItem::with(['item.unit_of_measure', 'consultation_type', 'payment_mode', 'creator']);

        if ($status) {
            $statuses = explode(',', $status);
            if (count($statuses) > 1) {
                $data->whereIn('status', $statuses);
            } else {
                $data->where('status', $statuses[0]);
            }
        }

        if ($q) {
            $data->whereHas('item', function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
                $query->orWhere('code', 'like', '%' . $q . '%');
            });
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

        if ($bill_id) {
            $data->where('bill_id', $bill_id);
        }

        if ($with_patient) {
            $data->with(['payment_cache.check_in.patient']);
        }

        if ($patient_name) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', $sort_direction);
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

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'consultant_id' => $item->consultant_id,
                                'created_by' => $user->id,
                            ]);
                        } else {
                            if ($item->item->consultation_type->name == 'Glass') {
                                Consultation::create([
                                    'payment_cache_item_id' => $item->id,
                                    'consultant' => 'Optician',
                                    'consultant_id' => $item->consultant_id,
                                    'created_by' => $user->id,
                                    'status' => 'Consulted',
                                    'sent_to_optician_at' => Carbon::now(),
                                    'sent_to_optician_by' => $user->id,
                                    'optician_status' => 'Pending',
                                ]);
                            }
                        }
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

    public function approveCreditPayment(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $user = $request->user();
        $amount = 0;
        $items = $request->json('items');

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::find($request_item);

            if ($item) {
                $amount += ($item->unit_price * $item->quantity);

                $item->status = 'Paid';
                $item->save();

                // if item was not created from consultation, i.e. on check-in, create consultation
                if (!$item->payment_cache->consultation_id) {
                    if ($item->item->is_consultation_item == 'Yes') {
                        Consultation::create([
                            'payment_cache_item_id' => $item->id,
                            'consultant_id' => $item->consultant_id,
                            'created_by' => $user->id,
                        ]);
                    } else {
                        if ($item->item->consultation_type->name == 'Glass') {
                            Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'consultant' => 'Optician',
                                'consultant_id' => $item->consultant_id,
                                'created_by' => $user->id,
                                'status' => 'Consulted',
                                'sent_to_optician_at' => Carbon::now(),
                                'sent_to_optician_by' => $user->id,
                                'optician_status' => 'Pending',
                            ]);
                        }
                    }
                }
            }
        }

        return $this->sendResponse($items, Response::HTTP_OK, 'Approved successfully.');
    }

    public function createBill(Request $request)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();
        $amount = 0;

        $bill = PatientItemBill::create([
            'amount' => 0,
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($bill) {
            $items = $request->json('items');

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    $item->bill_id = $bill->id;
                    $item->status = 'Billed';
                    $item->save();

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'consultant_id' => $item->consultant_id,
                                'created_by' => $user->id,
                            ]);
                        } else {
                            if ($item->item->consultation_type->name == 'Glass') {
                                Consultation::create([
                                    'payment_cache_item_id' => $item->id,
                                    'consultant' => 'Optician',
                                    'consultant_id' => $item->consultant_id,
                                    'created_by' => $user->id,
                                    'status' => 'Consulted',
                                    'sent_to_optician_at' => Carbon::now(),
                                    'sent_to_optician_by' => $user->id,
                                    'optician_status' => 'Pending',
                                ]);
                            }
                        }
                    }
                }
            }

            $bill->amount = $amount;
            $bill->save();

            return $this->sendResponse($bill, Response::HTTP_OK, 'Bill created successfully.');
        }

        return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Bill could not be created.');
    }

    private function updateStatus(Request $request, $status, $message)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $data = [];
        $user = $request->user();
        $items = $request->json('items');

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::find($request_item);

            if ($item) {
                $item->status = $status;
                $item->served_by = $user->id;
                $item->served_at = Carbon::now();
                $item->save();

                if ($status == 'Served' && $item->item->is_stock_item == 'Yes') {
                    $item->item->balance -= $item->quantity;
                    $item->item->save();
                }

                $data[] = $item;
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, $message);
    }

    public function dispense(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Dispensed successfully.');
    }

    public function complete(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Completed successfully.');
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
            'payment_cache.check_in.patient', 'item.unit_of_measure', 'consultation_type', 'payment_mode', 'creator',
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->update($request->only('comments', 'dosage'));
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
        $data = PatientPaymentCacheItem::findOrFail($id);
        $data->delete();
        return $this->sendResponse($data, Response::HTTP_OK, 'Deleted successfully.');
    }
}
