<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\OfficeCalendarEvent;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OfficeCalendarController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Default to current month if no dates provided
        $start_date = $request->start_date ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfMonth()->format('Y-m-d');

        // Handle clinic filtering
        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $query = OfficeCalendarEvent::with(['creator', 'updater'])
            ->where('status', 'Active')
            ->where(function ($q) use ($start_date, $end_date) {
                $q->whereBetween('start_date', [$start_date, $end_date])
                  ->orWhereBetween('end_date', [$start_date, $end_date])
                  ->orWhere(function ($q2) use ($start_date, $end_date) {
                      $q2->where('start_date', '<=', $start_date)
                         ->where(function ($q3) use ($end_date) {
                             $q3->whereNull('end_date')
                                ->orWhere('end_date', '>=', $end_date);
                         });
                  });
            });

        if ($clinic_id) {
            $query->where('clinic_id', $clinic_id);
        }

        $events = $query->orderBy('start_date', 'asc')->get();

        return $this->sendResponse($events, Response::HTTP_OK, 'Events retrieved successfully.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'event_type' => 'required|in:Meeting,Appointment,Deadline,Task,Reminder,Other',
            'reminder_type' => 'nullable|in:None,15_minutes,30_minutes,1_hour,2_hours,1_day,2_days,1_week',
            'is_all_day' => 'nullable|boolean',
            'is_recurring' => 'nullable|boolean',
            'recurring_pattern' => 'nullable|string|in:daily,weekly,monthly,yearly',
            'recurring_end_date' => 'nullable|date',
        ]);

        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $startDate = Carbon::parse($request->start_date);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : $startDate->copy()->addHour();

        // Calculate reminder time if reminder type is set
        $reminderTime = null;
        if ($request->reminder_type && $request->reminder_type !== 'None') {
            $reminderTime = $this->calculateReminderTime($startDate, $request->reminder_type);
        }

        $event = OfficeCalendarEvent::create([
            'clinic_id' => $clinic_id,
            'title' => $request->title,
            'description' => $request->description,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'location' => $request->location,
            'color' => $request->color ?? '#1976d2',
            'event_type' => $request->event_type,
            'reminder_type' => $request->reminder_type ?? 'None',
            'reminder_time' => $reminderTime,
            'reminder_sent' => false,
            'is_all_day' => $request->is_all_day ?? false,
            'is_recurring' => $request->is_recurring ?? false,
            'recurring_pattern' => $request->recurring_pattern,
            'recurring_end_date' => $request->recurring_end_date ? Carbon::parse($request->recurring_end_date) : null,
            'status' => 'Active',
            'created_by' => $user->id,
        ]);

        $event->load(['creator', 'updater']);

        return $this->sendResponse($event, Response::HTTP_CREATED, 'Event created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $event = OfficeCalendarEvent::with(['creator', 'updater', 'clinic'])->findOrFail($id);
        return $this->sendResponse($event, Response::HTTP_OK, 'Event retrieved successfully.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        $event = OfficeCalendarEvent::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'event_type' => 'sometimes|required|in:Meeting,Meeting,Appointment,Deadline,Task,Reminder,Other',
            'reminder_type' => 'nullable|in:None,15_minutes,30_minutes,1_hour,2_hours,1_day,2_days,1_week',
            'is_all_day' => 'nullable|boolean',
            'is_recurring' => 'nullable|boolean',
            'recurring_pattern' => 'nullable|string|in:daily,weekly,monthly,yearly',
            'recurring_end_date' => 'nullable|date',
            'status' => 'sometimes|in:Active,Cancelled,Completed',
        ]);

        $startDate = $request->has('start_date') ? Carbon::parse($request->start_date) : $event->start_date;
        $endDate = $request->has('end_date') && $request->end_date ? Carbon::parse($request->end_date) : $event->end_date;

        // Recalculate reminder time if reminder type or start date changed
        $reminderTime = $event->reminder_time;
        if (($request->has('reminder_type') || $request->has('start_date')) && 
            ($request->reminder_type ?? $event->reminder_type) !== 'None') {
            $reminderType = $request->reminder_type ?? $event->reminder_type;
            $reminderTime = $this->calculateReminderTime($startDate, $reminderType);
        }

        $event->update([
            'title' => $request->title ?? $event->title,
            'description' => $request->has('description') ? $request->description : $event->description,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'location' => $request->has('location') ? $request->location : $event->location,
            'color' => $request->color ?? $event->color,
            'event_type' => $request->event_type ?? $event->event_type,
            'reminder_type' => $request->reminder_type ?? $event->reminder_type,
            'reminder_time' => $reminderTime,
            'reminder_sent' => false, // Reset reminder when event is updated
            'is_all_day' => $request->has('is_all_day') ? $request->is_all_day : $event->is_all_day,
            'is_recurring' => $request->has('is_recurring') ? $request->is_recurring : $event->is_recurring,
            'recurring_pattern' => $request->has('recurring_pattern') ? $request->recurring_pattern : $event->recurring_pattern,
            'recurring_end_date' => $request->recurring_end_date ? Carbon::parse($request->recurring_end_date) : $event->recurring_end_date,
            'status' => $request->status ?? $event->status,
            'updated_by' => $user->id,
        ]);

        $event->load(['creator', 'updater']);

        return $this->sendResponse($event, Response::HTTP_OK, 'Event updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $event = OfficeCalendarEvent::findOrFail($id);
        $event->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Event deleted successfully.');
    }

    /**
     * Get upcoming reminders
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getUpcomingReminders(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $now = Carbon::now();
        $next24Hours = Carbon::now()->addDay();

        $query = OfficeCalendarEvent::with(['creator'])
            ->where('status', 'Active')
            ->where('reminder_type', '!=', 'None')
            ->whereNotNull('reminder_time')
            ->where('reminder_sent', false)
            ->whereBetween('reminder_time', [$now, $next24Hours]);

        if ($clinic_id) {
            $query->where('clinic_id', $clinic_id);
        }

        $reminders = $query->orderBy('reminder_time', 'asc')->get();

        return $this->sendResponse($reminders, Response::HTTP_OK, 'Upcoming reminders retrieved successfully.');
    }

    /**
     * Mark reminder as sent
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function markReminderSent($id)
    {
        $event = OfficeCalendarEvent::findOrFail($id);
        $event->update(['reminder_sent' => true]);

        return $this->sendResponse($event, Response::HTTP_OK, 'Reminder marked as sent.');
    }

    /**
     * Calculate reminder time based on start date and reminder type
     *
     * @param  Carbon\Carbon  $startDate
     * @param  string  $reminderType
     * @return Carbon\Carbon|null
     */
    private function calculateReminderTime($startDate, $reminderType)
    {
        if ($reminderType === 'None') {
            return null;
        }

        $reminderDate = $startDate->copy();

        switch ($reminderType) {
            case '15_minutes':
                $reminderDate->subMinutes(15);
                break;
            case '30_minutes':
                $reminderDate->subMinutes(30);
                break;
            case '1_hour':
                $reminderDate->subHour();
                break;
            case '2_hours':
                $reminderDate->subHours(2);
                break;
            case '1_day':
                $reminderDate->subDay();
                break;
            case '2_days':
                $reminderDate->subDays(2);
                break;
            case '1_week':
                $reminderDate->subWeek();
                break;
        }

        return $reminderDate;
    }
}
