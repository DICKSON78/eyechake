<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OfficeCalendarSubscribersController extends Controller
{
    use ApiResponse;

    /**
     * Get newsletter subscribers
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

        $query = NewsletterSubscriber::query();

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $subscribers = $query->orderBy('created_at', 'desc')
            ->paginate($per_page);

        return $this->sendResponse($subscribers, Response::HTTP_OK, 'Newsletter subscribers retrieved successfully.');
    }

    /**
     * Store a new newsletter subscriber
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = trim($request->email);

        // Check if email already exists
        $existingSubscriber = NewsletterSubscriber::where('email', $email)->first();
        if ($existingSubscriber) {
            return $this->sendResponse($existingSubscriber, Response::HTTP_OK, 'You are already subscribed to our newsletter!');
        }

        // Create new subscriber
        $subscriber = NewsletterSubscriber::create([
            'email' => $email
        ]);

        return $this->sendResponse($subscriber, Response::HTTP_OK, 'Thank you for subscribing to our newsletter!');
    }
}

