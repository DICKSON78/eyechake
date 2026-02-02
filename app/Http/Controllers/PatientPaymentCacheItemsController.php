<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use App\Models\PatientItemBill;
use App\Models\PatientItemPayment;
use App\Models\PatientPaymentCache;
use App\Models\PatientPaymentCacheItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

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
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
                'sort_direction' => 'sometimes|in:asc,desc',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $status = $request->status;
            $q = $request->q;
            $payment_cache_id = $request->payment_cache_id;
            $payment_mode_id = $request->payment_mode_id;
            $transaction_type = $request->transaction_type;
            $consultation_type = $request->consultation_type;
            $is_stock_item = $request->is_stock_item;
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

            $data = PatientPaymentCacheItem::with([
            'item' => function($query) {
                $query->select('id', 'name', 'code', 'templates', 'unit_of_measure_id', 'consultation_type_id', 'is_consultation_item', 'is_stock_item', 'balance', 'unit_buying_price', 'status');
            },
            'item.unit_of_measure', 
            'consultation_type', 
            'payment_mode', 
            'creator', 
            'server'
        ]);

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            if ($user->clinic_id) {
                $data->whereHas('creator', function ($query) use ($user) {
                    $query->where('clinic_id', $user->clinic_id);
                });
            } else {
                // If user has no clinic_id, return empty result
                $data->whereRaw('1 = 0');
            }
        }

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

        if ($transaction_type) {
            $data->whereHas('payment_mode', function ($query) use ($transaction_type) {
                $query->where('payment_type', $transaction_type);
            });
        }

        if ($consultation_type) {
            $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                $query->where('name', $consultation_type);
            });
        }

        if ($is_stock_item) {
            $data->whereHas('item', function ($query) use ($is_stock_item) {
                $query->where('is_stock_item', $is_stock_item);
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

        if ($with_patient == 'Yes') {
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
            if ($status) {
                $statuses = explode(',', $status);
                if (in_array('Served', $statuses)) {
                    $data->whereDate('served_at', '>=', $start_date);
                } else {
                    $data->whereDate('created_at', '>=', $start_date);
                }
            } else {
                $data->whereDate('created_at', '>=', $start_date);
            }
        }

        if ($end_date) {
            if ($status) {
                $statuses = explode(',', $status);
                if (in_array('Served', $statuses)) {
                    $data->whereDate('served_at', '<=', $end_date);
                } else {
                    $data->whereDate('created_at', '<=', $end_date);
                }
            } else {
                $data->whereDate('created_at', '<=', $end_date);
            }
        }

        $data->orderBy('created_at', $sort_direction);
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('PatientPaymentCacheItemsController index query error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('Database query error occurred', Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (\Exception $e) {
            \Log::error('PatientPaymentCacheItemsController index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->sendError('An error occurred while fetching data', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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
            'discount' => $request->discount ?? 0,
            'created_by' => $user->id,
        ]);

        if ($payment) {
            $items = $request->json('items');
            $hasGlassItems = false;
            $consultation = null;
            $patient = null;
            $paymentCache = null;

            foreach ($items as &$request_item) {
                $item = PatientPaymentCacheItem::with(['item.consultation_type', 'item.item_type', 'payment_cache.check_in.patient'])
                    ->find($request_item);

                if ($item) {
                    $amount += ($item->unit_price * $item->quantity);

                    $item->item_payment_id = $payment->id;
                    $item->status = 'Paid';
                    $item->save();

                    // Get payment cache and patient for later use
                    if (!$paymentCache) {
                        $paymentCache = $item->payment_cache;
                    }
                    if (!$patient && $paymentCache && $paymentCache->check_in) {
                        $patient = $paymentCache->check_in->patient;
                    }

                    // Check if this is a glass/spectacle item
                    $isGlassItem = false;
                    if ($item->item && $item->item->consultation_type) {
                        $isGlassItem = $item->item->consultation_type->name === 'Glass';
                    }
                    
                    if ($isGlassItem) {
                        $hasGlassItems = true;
                    }

                    // if item was not created from consultation, i.e. on check-in, create consultation
                    if (!$item->payment_cache->consultation_id) {
                        if ($item->item->is_consultation_item == 'Yes') {
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'created_by' => $user->id,
                            ]);
                            
                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        } elseif ($isGlassItem) {
                            // Create consultation for glass/spectacle items
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'patient_direction' => 'Sent to Optician',
                                'created_by' => $user->id,
                                'require_glass' => 'Yes',
                                'sent_to_optician_at' => now(),
                                'sent_to_optician_by' => $user->id,
                            ]);

                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                            
                            \Log::info('Glass item consultation created during payment', [
                                'consultation_id' => $consultation->id,
                                'item_id' => $item->id,
                                'payment_id' => $payment->id,
                                'user_id' => $user->id
                            ]);
                        }
                    } else {
                        // Consultation already exists, check if it needs to be updated for glass items
                        $existingConsultation = Consultation::find($item->payment_cache->consultation_id);
                        if ($existingConsultation && $isGlassItem) {
                            // Update existing consultation to mark as sent to optician
                            $updateData = [
                                'require_glass' => 'Yes',
                                'patient_direction' => 'Sent to Optician',
                            ];
                            
                            // Only set sent_to_optician_at if not already set
                            if (!$existingConsultation->sent_to_optician_at) {
                                $updateData['sent_to_optician_at'] = now();
                                $updateData['sent_to_optician_by'] = $user->id;
                            }
                            
                            $existingConsultation->update($updateData);
                            $consultation = $existingConsultation;
                            
                            \Log::info('Existing consultation updated for glass item during payment', [
                                'consultation_id' => $existingConsultation->id,
                                'item_id' => $item->id,
                                'payment_id' => $payment->id,
                                'user_id' => $user->id
                            ]);
                        }
                    }
                }
            }

            $payment->amount = $amount;
            $payment->save();

            $payment->items = PatientPaymentCacheItem::with(['item.unit_of_measure'])
                ->where('item_payment_id', $payment->id)
                ->get();

            // If patient has glass items and consultation was created/updated, move patient to optician
            if ($hasGlassItems && $consultation && $patient) {
                try {
                    $waitingTime = $patient->current_waiting_time;
                    if ($waitingTime) {
                        $waitingTime->sendToConsultation();
                        \Log::info('Patient with glass items moved to optician after payment', [
                            'patient_id' => $patient->id,
                            'patient_name' => $patient->full_name ?? 'Unknown',
                            'consultation_id' => $consultation->id,
                            'payment_id' => $payment->id,
                            'sent_by' => $user->id
                        ]);
                    } else {
                        \Log::warning('No waiting time found for patient when sending to optician after payment', [
                            'patient_id' => $patient->id,
                            'consultation_id' => $consultation->id,
                            'payment_id' => $payment->id
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to move patient to optician department after payment', [
                        'consultation_id' => $consultation->id,
                        'payment_id' => $payment->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Don't fail the entire request, just log the error
                }
            }

            // Clear notification cache and trigger refresh for real-time updates
            try {
                $user = $request->user();
                $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
                \Cache::forget($cacheKey);
                event(new \App\Events\NotificationUpdate());
                \Log::info('Payment completed - notification cache cleared and refresh triggered', [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                    'has_glass_items' => $hasGlassItems
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to clear notification cache and trigger refresh after payment', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($payment, Response::HTTP_OK, 'Payment made successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Payment could not be made.'
        );
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
        $hasGlassItems = false;
        $consultation = null;
        $patient = null;
        $paymentCache = null;

        // Find or create Credit payment channel
        $creditChannel = \App\Models\PaymentChannel::where('name', 'Credit')->first();
        if (!$creditChannel) {
            // Try alternative names
            $creditChannel = \App\Models\PaymentChannel::whereIn('name', ['Credit', 'Credit Payment', 'Credit Payments'])->first();
            if (!$creditChannel) {
                // Create default Credit channel if it doesn't exist
                $creditChannel = \App\Models\PaymentChannel::create([
                    'name' => 'Credit',
                    'description' => 'Credit payments',
                    'status' => 'Active',
                    'clinic_id' => $user->clinic_id ?? null,
                ]);
            }
        }

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::with(['item.consultation_type', 'item.item_type', 'payment_cache.check_in.patient'])
                ->find($request_item);

            if ($item) {
                $amount += ($item->unit_price * $item->quantity);

                $item->status = 'Paid';
                $item->save();

                // Get payment cache and patient for later use
                if (!$paymentCache) {
                    $paymentCache = $item->payment_cache;
                }
                if (!$patient && $paymentCache && $paymentCache->check_in) {
                    $patient = $paymentCache->check_in->patient;
                }

                // Check if this is a glass/spectacle item
                $isGlassItem = false;
                if ($item->item && $item->item->consultation_type) {
                    $isGlassItem = $item->item->consultation_type->name === 'Glass';
                }
                
                if ($isGlassItem) {
                    $hasGlassItems = true;
                }

                // if item was not created from consultation, i.e. on check-in, create consultation
                if (!$item->payment_cache->consultation_id) {
                    if ($item->item->is_consultation_item == 'Yes') {
                        $consultation = Consultation::create([
                            'payment_cache_item_id' => $item->id,
                            'created_by' => $user->id,
                        ]);
                        
                        $item->payment_cache->consultation_id = $consultation->id;
                        $item->payment_cache->save();
                    } elseif ($isGlassItem) {
                        // Create consultation for glass/spectacle items
                        $consultation = Consultation::create([
                            'payment_cache_item_id' => $item->id,
                            'patient_direction' => 'Sent to Optician',
                            'created_by' => $user->id,
                            'require_glass' => 'Yes',
                            'sent_to_optician_at' => now(),
                            'sent_to_optician_by' => $user->id,
                        ]);

                        $item->payment_cache->consultation_id = $consultation->id;
                        $item->payment_cache->save();
                        
                        \Log::info('Glass item consultation created during credit payment approval', [
                            'consultation_id' => $consultation->id,
                            'item_id' => $item->id,
                            'user_id' => $user->id
                        ]);
                    }
                } else {
                    // Consultation already exists, check if it needs to be updated for glass items
                    $existingConsultation = Consultation::find($item->payment_cache->consultation_id);
                    if ($existingConsultation && $isGlassItem) {
                        // Update existing consultation to mark as sent to optician
                        $updateData = [
                            'require_glass' => 'Yes',
                            'patient_direction' => 'Sent to Optician',
                        ];
                        
                        // Only set sent_to_optician_at if not already set
                        if (!$existingConsultation->sent_to_optician_at) {
                            $updateData['sent_to_optician_at'] = now();
                            $updateData['sent_to_optician_by'] = $user->id;
                        }
                        
                        $existingConsultation->update($updateData);
                        $consultation = $existingConsultation;
                        
                        \Log::info('Existing consultation updated for glass item during credit payment approval', [
                            'consultation_id' => $existingConsultation->id,
                            'item_id' => $item->id,
                            'user_id' => $user->id
                        ]);
                    }
                }
            }
        }

        // Create payment record for credit payment
        if ($amount > 0 && $creditChannel) {
            $payment = \App\Models\PatientItemPayment::create([
                'channel_id' => $creditChannel->id,
                'amount' => $amount,
                'discount' => 0,
                'created_by' => $user->id,
            ]);

            // Link items to the payment
            foreach ($items as &$request_item) {
                $item = \App\Models\PatientPaymentCacheItem::find($request_item);
                if ($item && $item->status === 'Paid') {
                    $item->item_payment_id = $payment->id;
                    $item->save();
                }
            }

            \Log::info('Credit payment record created', [
                'payment_id' => $payment->id,
                'amount' => $amount,
                'items_count' => count($items),
                'user_id' => $user->id
            ]);
        }

        // If patient has glass items and consultation was created/updated, move patient to optician
        if ($hasGlassItems && $consultation && $patient) {
            try {
                $waitingTime = $patient->current_waiting_time;
                if ($waitingTime) {
                    $waitingTime->sendToConsultation();
                    \Log::info('Patient with glass items moved to optician after credit payment approval', [
                        'patient_id' => $patient->id,
                        'patient_name' => $patient->full_name ?? 'Unknown',
                        'consultation_id' => $consultation->id,
                        'sent_by' => $user->id
                    ]);
                } else {
                    \Log::warning('No waiting time found for patient when sending to optician after credit payment approval', [
                        'patient_id' => $patient->id,
                        'consultation_id' => $consultation->id
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Failed to move patient to optician department after credit payment approval', [
                    'consultation_id' => $consultation->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Don't fail the entire request, just log the error
            }
        }

        // Trigger notification refresh for real-time updates
        try {
            event(new \App\Events\NotificationUpdate());
            \Log::info('Credit payment approved - notification refresh triggered', [
                'items_count' => count($items),
                'has_glass_items' => $hasGlassItems
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to trigger notification refresh after credit payment approval', [
                'error' => $e->getMessage()
            ]);
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
                            $consultation = Consultation::create([
                                'payment_cache_item_id' => $item->id,
                                'created_by' => $user->id,
                            ]);
                            
                            $item->payment_cache->consultation_id = $consultation->id;
                            $item->payment_cache->save();
                        } else {
                            if ($item->item->consultation_type->name == 'Glass' && $item->item->item_type->name == 'Lens') {
                                $consultation = Consultation::create([
                                    'payment_cache_item_id' => $item->id,
                                    'patient_direction' => 'Direct to Optician',
                                    'created_by' => $user->id,
                                    'require_glass' => 'Yes',
                                ]);

                                $item->payment_cache->consultation_id = $consultation->id;
                                $item->payment_cache->save();
                            }
                        }
                    }
                }
            }

            $bill->amount = $amount;
            $bill->save();

            // Clear notification cache and trigger refresh for real-time updates (especially for spectacle patients)
            try {
                $user = $request->user();
                $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
                \Cache::forget($cacheKey);
                event(new \App\Events\NotificationUpdate());
                \Log::info('Bill created - notification cache cleared and refresh triggered', [
                    'bill_id' => $bill->id,
                    'items_count' => count($items)
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to clear notification cache and trigger refresh after bill creation', [
                    'error' => $e->getMessage()
                ]);
            }

            return $this->sendResponse($bill, Response::HTTP_OK, 'Bill created successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            'An error occurred. Bill could not be created.'
        );
    }

    private function updateStatus(Request $request, $status, $message, $callback)
    {
        $request->validate([
            'payment_cache_id' => 'required|exists:patient_payment_cache,id',
            'items' => 'required|array',
            'items.*' => 'required|integer',
        ]);

        $payment_cache = PatientPaymentCache::find($request->payment_cache_id);
        $data = [];
        $user = $request->user();
        $items = $request->json('items');

        foreach ($items as &$request_item) {
            $item = PatientPaymentCacheItem::find($request_item);

            if ($item) {
                $item->status = $status;

                if ($status == 'Served') {
                    $item->served_by = $user->id;
                    $item->served_at = Carbon::now();

                    if ($item->item->is_stock_item == 'Yes') {
                        $item->item->balance -= $item->quantity;
                        $item->item->save();
                    }
                }

                $item->save();
                $data[] = $item;
            }
        }

        if ($callback) {
            $callback($payment_cache);
        }

        // Clear notification cache and trigger refresh for real-time updates
        try {
            $user = $request->user();
            $cacheKey = "notifications_user_{$user->id}_clinic_" . ($user->clinic_id ?? 'null');
            Cache::forget($cacheKey);
            event(new \App\Events\NotificationUpdate());
            \Log::info('Cleared notification cache and triggered refresh after payment cache item update', [
                'user_id' => $user->id,
                'cache_key' => $cacheKey,
                'status' => $status,
                'payment_cache_id' => $request->payment_cache_id
            ]);
        } catch (\Exception $e) {
            \Log::warning('Failed to clear notification cache and trigger refresh after payment update', [
                'error' => $e->getMessage()
            ]);
        }

        return $this->sendResponse($data, Response::HTTP_OK, $message);
    }

    public function dispense(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Dispensed successfully.', function ($payment_cache) use ($request) {
            $user = $request->user();

            // check if dispensing a glass item and change its consultation status
            $consultation = Consultation::find($request->consultation_id);
            if ($consultation) {
                // Mark as Consulted if Direct to Optician
                if ($consultation->patient_direction == 'Direct to Optician') {
                    $consultation->update(['status' => 'Consulted']);

                    // update consultant
                    $consultation->payment_cache_item->consultant_id = $user->id;
                    $consultation->payment_cache_item->save();
                }

                // Only mark optician as completed if ALL glass items are dispensed
                // Check if there are any remaining glass items that are not yet served
                $remainingGlassItems = PatientPaymentCacheItem::whereHas('payment_cache', function($q) use ($consultation) {
                        $q->where('consultation_id', $consultation->id);
                    })
                    ->whereHas('item.consultation_type', function($q) {
                        $q->where('name', 'Glass');
                    })
                    ->where('status', '!=', 'Served')
                    ->count();

                // If no remaining glass items, mark optician work as complete
                if ($remainingGlassItems == 0) {
                    $consultation->update(['optician_completed_at' => now()]);
                    \Log::info('All glass items dispensed - marking optician completed', [
                        'consultation_id' => $consultation->id,
                        'completed_at' => now()
                    ]);
                } else {
                    \Log::info('Glass items dispensed but more remain', [
                        'consultation_id' => $consultation->id,
                        'remaining_items' => $remainingGlassItems
                    ]);
                }
            }

            // Check if patient has unpaid items after dispensing
            $unpaidItems = PatientPaymentCacheItem::where('payment_cache_id', $payment_cache->id)
                ->whereIn('status', ['Pending', 'Billed'])
                ->count();
            
            if ($unpaidItems > 0) {
                \Log::info('Patient has unpaid items after dispensing - should go to cashier', [
                    'payment_cache_id' => $payment_cache->id,
                    'unpaid_items_count' => $unpaidItems
                ]);
                
                // Update patient waiting time to send them to cashier
                if ($payment_cache->check_in && $payment_cache->check_in->patient) {
                    $waitingTime = $payment_cache->check_in->patient->current_waiting_time;
                    if ($waitingTime) {
                        $waitingTime->sendToCashier();
                        \Log::info('Patient redirected to cashier after dispensing', [
                            'patient_id' => $payment_cache->check_in->patient->id,
                            'waiting_time_id' => $waitingTime->id
                        ]);
                    }
                }
            }
        });
    }

    public function complete(Request $request)
    {
        return $this->updateStatus($request, 'Served', 'Completed successfully.', null);
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
            'payment_cache.check_in.patient',
            'item.unit_of_measure',
            'consultation_type',
            'payment_mode',
            'creator',
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
