<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OfficeCalendarContactSubmissionsController extends Controller
{
    use ApiResponse;

    /**
     * Get contact submissions
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        $per_page = $request->per_page ?? 25;

        $query = ContactSubmission::query();

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $submissions = $query->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return $this->sendResponse($submissions, Response::HTTP_OK, 'Contact submissions retrieved successfully.');
    }

    /**
     * Store a new contact submission
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $submission = ContactSubmission::create($request->all());

        return $this->sendResponse($submission, Response::HTTP_OK, 'Contact submission received successfully. We will get back to you soon.');
    }
}

