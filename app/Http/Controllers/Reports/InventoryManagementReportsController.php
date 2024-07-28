<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCacheItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InventoryManagementReportsController extends Controller
{
    use ApiResponse;

    public function getItemQuantityDispensedReport(Request $request)
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
        $q = $request->q;
        $payment_mode_id = $request->payment_mode_id;
        $consultation_type = $request->consultation_type;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $data = PatientPaymentCacheItem::with(['item.unit_of_measure'])
            ->whereHas('item', function ($query) {
                $query->where('is_stock_item', 'Yes');
            })
            ->where('status', 'Served');

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

        if ($q) {
            $data->whereHas('item', function ($query) use ($q) {
                $query->where('name', 'like', '%' . $q . '%');
                $query->orWhere('code', 'like', '%' . $q . '%');
            });
        }

        if ($payment_mode_id) {
            $data->where('payment_mode_id', $payment_mode_id);
        }

        if ($consultation_type) {
            $consultation_type = explode(',', $consultation_type);
            $data->whereHas('consultation_type', function ($query) use ($consultation_type) {
                $query->whereIn('name', $consultation_type);
            });
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data->groupBy('item_id');
        $data->selectRaw('item_id, sum(quantity) as quantity_dispensed, sum(unit_price * quantity) as dispensed_value');

        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
