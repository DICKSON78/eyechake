<?php

namespace App\Http\Controllers\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PrestigeClientsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
                'q' => 'sometimes|string',
            ]);

            $user = $request->user();
            $per_page = $request->per_page ?? 25;
            $clinic_id = $user->is_admin ? ($request->clinic_id ?? null) : ($user->clinic_id ?? null);

            // Only return patients where is_vip = true (Prestige clients)
            $data = Patient::with(['region', 'district', 'ward', 'information_source', 'calling_status'])
                ->where('is_vip', true)
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
                })
                ->orderBy('created_at', 'desc')
                ->paginate($per_page);

            return $this->sendResponse($data, Response::HTTP_OK, 'Prestige clients retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('PrestigeClientsController error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            
            return $this->sendError(
                'An error occurred while fetching prestige clients. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
