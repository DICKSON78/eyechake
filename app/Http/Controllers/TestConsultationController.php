<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TestConsultationController extends Controller
{
    use ApiResponse;

    public function testQuery()
    {
        try {
            $data = Consultation::with(['payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient']);
            }])
            ->whereHas('payment_cache_item.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', 9025);
            })
            ->get();
            
            return $this->sendResponse($data, Response::HTTP_OK, 'Test successful');
        } catch (\Exception $e) {
            return $this->sendError('Test failed: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
