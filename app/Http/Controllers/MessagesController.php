<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MessagesController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $per_page = $request->per_page ?? 25;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $phone = $request->phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = Message::with(['patient']);

        if ($patient_name) {
            $data->whereHas('patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->where('patient_id', $patient_id);
        }

        if ($phone) {
            $data->where('phone', 'like', '%' . $phone . '%');
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
}
