<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\SmsCampaignRecipient;
use App\Models\PatientCallingStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UnreachableNumbersController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'source' => 'sometimes|in:sms,calling',
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $data = collect();

        // Get unreachable from SMS campaigns
        if (!$request->source || $request->source === 'sms') {
            $smsUnreachable = SmsCampaignRecipient::with(['patient', 'campaign'])
                ->where('status', 'unreachable')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('patient.check_ins', function ($q2) use ($clinic_id) {
                        $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                            $q3->where('clinic_id', $clinic_id);
                        });
                    });
                })
                ->get()
                ->map(function ($recipient) {
                    return [
                        'id' => $recipient->id,
                        'source' => 'sms',
                        'phone_number' => $recipient->phone_number,
                        'patient_name' => $recipient->recipient_name ?? $recipient->patient->full_name ?? 'Unknown',
                        'patient_id' => $recipient->patient_id,
                        'campaign_title' => $recipient->campaign->title ?? 'N/A',
                        'error_message' => $recipient->error_message,
                        'created_at' => $recipient->created_at,
                    ];
                });
            
            $data = $data->merge($smsUnreachable);
        }

        // Get unreachable from calling status
        if (!$request->source || $request->source === 'calling') {
            $callingUnreachable = PatientCallingStatus::with(['patient'])
                ->where('status', 'unreachable')
                ->when($clinic_id, function ($q) use ($clinic_id) {
                    $q->whereHas('patient.check_ins', function ($q2) use ($clinic_id) {
                        $q2->whereHas('creator', function ($q3) use ($clinic_id) {
                            $q3->where('clinic_id', $clinic_id);
                        });
                    });
                })
                ->get()
                ->map(function ($status) {
                    return [
                        'id' => $status->id,
                        'source' => 'calling',
                        'phone_number' => $status->patient->phone ?? 'N/A',
                        'patient_name' => $status->patient->full_name ?? 'Unknown',
                        'patient_id' => $status->patient_id,
                        'campaign_title' => 'N/A',
                        'error_message' => $status->notes,
                        'created_at' => $status->created_at,
                    ];
                });
            
            $data = $data->merge($callingUnreachable);
        }

        // Paginate manually
        $total = $data->count();
        $page = $request->page ?? 1;
        $perPage = $per_page;
        $offset = ($page - 1) * $perPage;
        $items = $data->slice($offset, $perPage)->values();

        return $this->sendResponse([
            'data' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'last_page' => ceil($total / $perPage),
        ], Response::HTTP_OK, 'Unreachable numbers retrieved successfully.');
    }
}

