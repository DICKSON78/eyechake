<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientCallingStatus;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClientCallingStatusController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string|in:Need to Call,Called,Unreachable',
            'patient_name' => 'sometimes|string',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;
        $status = $request->status;
        $patient_name = $request->patient_name;
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = PatientCallingStatus::with(['patient', 'called_by_user', 'creator'])
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->when($status, function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->when($patient_name, function ($query) use ($patient_name) {
                $query->whereHas('patient', function ($q) use ($patient_name) {
                    $q->whereRaw('concat(first_name, coalesce(middle_name, ""), last_name) like ?', ['%' . $patient_name . '%']);
                });
            })
            ->when($start_date, function ($query) use ($start_date) {
                $query->whereDate('created_at', '>=', $start_date);
            })
            ->when($end_date, function ($query) use ($end_date) {
                $query->whereDate('created_at', '<=', $end_date);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'status' => 'required|string|in:Need to Call,Called,Unreachable',
            'notes' => 'nullable|string'
        ]);

        $user = $request->user();
        $input = $request->only('patient_id', 'status', 'notes');
        $input['created_by'] = $user->id;

        $data = PatientCallingStatus::create($input);
        return $this->sendResponse($data, Response::HTTP_CREATED, 'Created successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Need to Call,Called,Unreachable',
            'notes' => 'nullable|string'
        ]);

        $user = $request->user();
        $callingStatus = PatientCallingStatus::findOrFail($id);
        
        $input = $request->only('status', 'notes');
        $input['called_by'] = $user->id;
        $input['called_at'] = now();

        $callingStatus->update($input);
        return $this->sendResponse($callingStatus, Response::HTTP_OK, 'Updated successfully.');
    }

    public function destroy($id)
    {
        $callingStatus = PatientCallingStatus::findOrFail($id);
        $callingStatus->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }

    public function getCallingStats(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $stats = PatientCallingStatus::when($clinic_id, function ($query) use ($clinic_id) {
            $query->whereHas('creator', function ($q) use ($clinic_id) {
                $q->where('clinic_id', $clinic_id);
            });
        })
        ->selectRaw('status, COUNT(*) as count')
        ->groupBy('status')
        ->pluck('count', 'status');

        return $this->sendResponse($stats, Response::HTTP_OK, 'Success.');
    }
}
