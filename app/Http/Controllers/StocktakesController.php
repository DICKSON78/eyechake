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
        $per_page = $request->per_page ?? 25;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = Stocktake::with(['creator']);

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
            'reason' => 'required',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_buying_price' => 'nullable|numeric|min:1',
            'items.*.expiry_date' => 'nullable|date_format:Y-m-d',
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
                    $stocktake_item = StocktakeItem::create([
                        'stocktake_id' => $data->id,
                        'item_id' => $item->id,
                        'quantity' => $input_item['quantity'],
                        'unit_buying_price' => $input_item['unit_buying_price'],
                        'expiry_date' => $input_item['expiry_date'],
                    ]);

                    if ($stocktake_item) {
                        $item->update([
                            'balance' => $stocktake_item->quantity,
                            'unit_buying_price' => $stocktake_item->unit_buying_price,
                            'expiry_date' => $stocktake_item->expiry_date
                        ]);
                    }
                }
            }
        }

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
