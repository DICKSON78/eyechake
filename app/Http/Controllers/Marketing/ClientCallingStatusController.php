<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use App\Models\PatientCallingStatus;
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
            'status' => 'sometimes|in:need_to_call,called,unreachable',
            'q' => 'sometimes|string',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $query = Patient::with(['region', 'district', 'information_source', 'calling_status.called_by_user'])
            ->when($clinic_id, function ($q) use ($clinic_id) {
                $q->whereHas('check_ins', function ($q2) use ($clinic_id) {
                    $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                        $q3->where('clinic_id', $clinic_id);
                    });
                });
            })
            ->when($request->q, function ($q) use ($request) {
                $q->where(function ($query) use ($request) {
                    $query->where('first_name', 'like', '%' . $request->q . '%')
                          ->orWhere('middle_name', 'like', '%' . $request->q . '%')
                          ->orWhere('last_name', 'like', '%' . $request->q . '%')
                          ->orWhere('phone', 'like', '%' . $request->q . '%');
                });
            });

        // Filter by calling status
        if ($request->status) {
            $query->whereHas('calling_status', function ($q) use ($request) {
                $q->where('status', $request->status);
            });
        }
        // If no status filter, show all patients (with() will handle null calling_status automatically)

        $data = $query->orderBy('created_at', 'desc')->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Client calling status retrieved successfully.');
    }

    public function update(Request $request, $patientId)
    {
        try {
            $request->validate([
                'status' => 'required|in:need_to_call,called,unreachable',
                'notes' => 'nullable|string|max:1000',
            ]);

            $user = $request->user();

            // Verify patient exists
            $patient = Patient::find($patientId);
            if (!$patient) {
                return $this->sendError('Patient not found.', Response::HTTP_NOT_FOUND);
            }

            \Log::info('Updating calling status', [
                'patient_id' => $patientId,
                'status' => $request->status,
                'notes' => $request->notes,
                'user_id' => $user->id
            ]);

            $status = PatientCallingStatus::updateOrCreate(
                ['patient_id' => $patientId],
                [
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'called_by' => $request->status === 'called' ? $user->id : null,
                    'called_at' => $request->status === 'called' ? now() : null,
                    'created_by' => $user->id,
                ]
            );

            \Log::info('Calling status updated successfully', [
                'patient_id' => $patientId,
                'status_id' => $status->id
            ]);

            return $this->sendResponse(
                $status->load(['patient', 'called_by_user']),
                Response::HTTP_OK,
                'Calling status updated successfully.'
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error updating calling status', [
                'patient_id' => $patientId,
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return $this->sendError('Validation failed: ' . implode(', ', array_flatten($e->errors())), Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            \Log::error('Error updating calling status', [
                'patient_id' => $patientId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return $this->sendError('Failed to update calling status. Please try again.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'patient_ids' => 'required|array',
            'patient_ids.*' => 'required|exists:patients,id',
            'status' => 'required|in:need_to_call,called,unreachable',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        foreach ($request->patient_ids as $patientId) {
            PatientCallingStatus::updateOrCreate(
                ['patient_id' => $patientId],
                [
                    'status' => $request->status,
                    'notes' => $request->notes,
                    'called_by' => $request->status === 'called' ? $user->id : null,
                    'called_at' => $request->status === 'called' ? now() : null,
                    'created_by' => $user->id,
                ]
            );
        }

        return $this->sendResponse(null, Response::HTTP_OK, 'Calling statuses updated successfully.');
    }
}

