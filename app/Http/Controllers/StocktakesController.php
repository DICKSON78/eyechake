<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Item;
use App\Models\Stocktake;
use App\Models\StocktakeItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StocktakesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return Response
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
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Stocktake::with(['creator']);

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
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
        try {
            $request->validate([
                'reason' => 'required',
                'items' => 'required|array',
                'items.*.item_id' => 'required|exists:items,id',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.unit_buying_price' => 'nullable|numeric|min:0',
                'items.*.selling_price' => 'nullable|numeric|min:0',
                'items.*.expiration_date' => 'nullable|date',
                'items.*.category' => 'nullable|string|max:255',
            ]);

            $user = $request->user();
            $input = $request->only('reason');
            $input['created_by'] = $user->id;
            $data = Stocktake::create($input);

            if ($data) {
                $input_items = $request->json('items');

                foreach ($input_items as &$input_item) {
                    // if this item is a stock item, continue
                    $item = Item::where('id', $input_item['item_id'])
                        ->where('is_stock_item', 'Yes')
                        ->first();

                    if ($item) {
                        $input_item['stocktake_id'] = $data->id;
                        $stocktake_item = StocktakeItem::create($input_item);

                        if ($stocktake_item) {
                            $updateData = [
                                'balance' => $stocktake_item->quantity, // Update balance to stocktake quantity
                                'unit_buying_price' => $stocktake_item->unit_buying_price,
                            ];
                            
                            // Update category if provided
                            if (isset($input_item['category']) && !empty($input_item['category'])) {
                                $updateData['category'] = $input_item['category'];
                            }
                            
                             $updateData['new_balance'] = $stocktake_item->quantity; // Sync new_balance
                             $item->update($updateData);

                             // Clear relevant dashboard caches to ensure real-time update
                             try {
                                 $clinic_id = $item->clinic_id ?? $user->clinic_id;
                                 if ($clinic_id) {
                                     $today = \Carbon\Carbon::today()->format('Y-m-d');
                                     \Illuminate\Support\Facades\Cache::forget("dashboard_total_items_{$clinic_id}");
                                     \Illuminate\Support\Facades\Cache::forget("dashboard_total_items_{$clinic_id}_{$today}_{$today}");
                                 }
                             } catch (\Exception $e) {
                                 \Log::warning('Failed to clear dashboard cache after stocktake', ['error' => $e->getMessage()]);
                             }
                        }
                    }
                }

                $data->update(['status' => 'Applied']);
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
        } catch (\Exception $e) {
            \Log::error('Stocktake creation error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error creating stocktake: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = Stocktake::with(['items.item', 'creator'])->findOrFail($id);
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
     * Apply a stocktake (move new_balance to balance for all items)
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function apply($id)
    {
        try {
            $stocktake = Stocktake::with(['items.item'])->findOrFail($id);
            
            if ($stocktake->status === 'Applied') {
                return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Stocktake has already been applied.');
            }

            foreach ($stocktake->items as $stocktakeItem) {
                if ($stocktakeItem->item) {
                    $stocktakeItem->item->update([
                        'balance' => $stocktakeItem->quantity, // Use stocktake quantity directly
                        'new_balance' => $stocktakeItem->quantity, // Sync new_balance
                    ]);

                    // Clear relevant dashboard caches
                    try {
                        $clinic_id = $stocktakeItem->item->clinic_id;
                        if ($clinic_id) {
                            $today = \Carbon\Carbon::today()->format('Y-m-d');
                            \Illuminate\Support\Facades\Cache::forget("dashboard_total_items_{$clinic_id}");
                            \Illuminate\Support\Facades\Cache::forget("dashboard_total_items_{$clinic_id}_{$today}_{$today}");
                        }
                    } catch (\Exception $e) {}
                }
            }

            $stocktake->update(['status' => 'Applied']);

            return $this->sendResponse($stocktake, Response::HTTP_OK, 'Stocktake applied successfully.');
        } catch (\Exception $e) {
            \Log::error('Stocktake application error: ' . $e->getMessage());
            return $this->sendResponse(null, Response::HTTP_INTERNAL_SERVER_ERROR, 'Error applying stocktake: ' . $e->getMessage());
        }
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
