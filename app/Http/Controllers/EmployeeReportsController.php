<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\EmployeeReport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EmployeeReportsController extends Controller
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
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'report_type' => 'sometimes|in:Daily,Weekly,Monthly',
            'status' => 'sometimes|in:Draft,Submitted,Approved,Rejected',
            'employee_id' => 'sometimes|exists:users,id',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d',
        ]);

        try {
            $user = $request->user();
            $per_page = $request->per_page ?? 25;

            // Handle clinic filtering
            if (!$user || ($user->is_admin ?? false)) {
                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id ?? null;
            }

            $query = EmployeeReport::with([
                'employee',
                'submittedBy',
                'approvedBy',
                'rejectedBy',
                'creator',
            ]);

            // If not admin, employees can only see their own reports
            // Managers/admins can see all reports in their clinic
            if ($user && !($user->is_admin ?? false) && !$request->has('employee_id')) {
                $query->where('employee_id', $user->id);
            }

            if ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            }

            if ($request->employee_id) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->report_type) {
                $query->where('report_type', $request->report_type);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->start_date) {
                $query->where('report_date', '>=', $request->start_date);
            }

            if ($request->end_date) {
                $query->where(function ($q) use ($request) {
                    $q->where('report_date', '<=', $request->end_date)
                      ->orWhere(function ($q2) use ($request) {
                          $q2->whereNotNull('end_date')
                             ->where('end_date', '<=', $request->end_date);
                      });
                });
            }

            $reports = $query->orderBy('report_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($per_page);

            return $this->sendResponse($reports, Response::HTTP_OK, 'Employee reports retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('EmployeeReportsController index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching reports.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

        if (!$user) {
            return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        $request->validate([
            'report_type' => 'required|in:Daily,Weekly,Monthly',
            'report_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:report_date',
            'activities_completed' => 'nullable|string',
            'achievements' => 'nullable|string',
            'challenges_faced' => 'nullable|string',
            'tasks_pending' => 'nullable|string',
            'next_period_plans' => 'nullable|string',
            'additional_notes' => 'nullable|string',
            'status' => 'sometimes|in:Draft,Submitted',
            'employee_id' => 'sometimes|exists:users,id', // For admins to create reports for others
        ]);

        $clinic_id = $user->is_admin ? $request->clinic_id : ($user->clinic_id ?? null);
        $employee_id = $request->employee_id ?? $user->id;

        // Validate end_date based on report_type
        $reportDate = Carbon::parse($request->report_date);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : null;

        if ($request->report_type === 'Weekly' && !$endDate) {
            $endDate = $reportDate->copy()->endOfWeek();
        } elseif ($request->report_type === 'Monthly' && !$endDate) {
            $endDate = $reportDate->copy()->endOfMonth();
        } elseif ($request->report_type === 'Daily') {
            $endDate = $reportDate->copy();
        }

        $status = $request->status ?? 'Draft';
        $submittedAt = null;
        $submittedBy = null;

        if ($status === 'Submitted') {
            $submittedAt = Carbon::now();
            $submittedBy = $user->id;
        }

        $report = EmployeeReport::create([
            'clinic_id' => $clinic_id,
            'employee_id' => $employee_id,
            'report_type' => $request->report_type,
            'report_date' => $reportDate,
            'end_date' => $endDate,
            'activities_completed' => $request->activities_completed,
            'achievements' => $request->achievements,
            'challenges_faced' => $request->challenges_faced,
            'tasks_pending' => $request->tasks_pending,
            'next_period_plans' => $request->next_period_plans,
            'additional_notes' => $request->additional_notes,
            'status' => $status,
            'submitted_by' => $submittedBy,
            'submitted_at' => $submittedAt,
            'created_by' => $user->id,
        ]);

        $report->load([
            'employee',
            'submittedBy',
            'approvedBy',
            'rejectedBy',
            'creator',
        ]);

        return $this->sendResponse($report, Response::HTTP_CREATED, 'Employee report created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $report = EmployeeReport::with([
            'employee',
            'submittedBy',
            'approvedBy',
            'rejectedBy',
            'creator',
            'updater',
            'clinic',
        ])->findOrFail($id);

        return $this->sendResponse($report, Response::HTTP_OK, 'Employee report retrieved successfully.');
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

        if (!$user) {
            return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        $report = EmployeeReport::findOrFail($id);

        // Employees can only edit their own reports if status is Draft
        if ($report->employee_id !== $user->id && !$user->is_admin) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'You can only edit your own reports.');
        }

        if ($report->status !== 'Draft' && !$user->is_admin) {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Only draft reports can be edited.');
        }

        $request->validate([
            'report_type' => 'sometimes|required|in:Daily,Weekly,Monthly',
            'report_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:report_date',
            'activities_completed' => 'nullable|string',
            'achievements' => 'nullable|string',
            'challenges_faced' => 'nullable|string',
            'tasks_pending' => 'nullable|string',
            'next_period_plans' => 'nullable|string',
            'additional_notes' => 'nullable|string',
            'status' => 'sometimes|in:Draft,Submitted',
        ]);

        $reportDate = $request->has('report_date') ? Carbon::parse($request->report_date) : $report->report_date;
        $endDate = $request->has('end_date') && $request->end_date ? Carbon::parse($request->end_date) : $report->end_date;
        $reportType = $request->report_type ?? $report->report_type;

        // Recalculate end_date if report_type changed
        if ($request->has('report_type') || $request->has('report_date')) {
            if ($reportType === 'Weekly' && !$endDate) {
                $endDate = $reportDate->copy()->endOfWeek();
            } elseif ($reportType === 'Monthly' && !$endDate) {
                $endDate = $reportDate->copy()->endOfMonth();
            } elseif ($reportType === 'Daily') {
                $endDate = $reportDate->copy();
            }
        }

        $status = $request->status ?? $report->status;
        $submittedAt = $report->submitted_at;
        $submittedBy = $report->submitted_by;

        if ($status === 'Submitted' && $report->status !== 'Submitted') {
            $submittedAt = Carbon::now();
            $submittedBy = $user->id;
        } elseif ($status === 'Draft' && $report->status === 'Submitted') {
            // Allow reverting from Submitted to Draft
            $submittedAt = null;
            $submittedBy = null;
        }

        $report->update([
            'report_type' => $reportType,
            'report_date' => $reportDate,
            'end_date' => $endDate,
            'activities_completed' => $request->has('activities_completed') ? $request->activities_completed : $report->activities_completed,
            'achievements' => $request->has('achievements') ? $request->achievements : $report->achievements,
            'challenges_faced' => $request->has('challenges_faced') ? $request->challenges_faced : $report->challenges_faced,
            'tasks_pending' => $request->has('tasks_pending') ? $request->tasks_pending : $report->tasks_pending,
            'next_period_plans' => $request->has('next_period_plans') ? $request->next_period_plans : $report->next_period_plans,
            'additional_notes' => $request->has('additional_notes') ? $request->additional_notes : $report->additional_notes,
            'status' => $status,
            'submitted_by' => $submittedBy,
            'submitted_at' => $submittedAt,
            'updated_by' => $user->id,
        ]);

        $report->load([
            'employee',
            'submittedBy',
            'approvedBy',
            'rejectedBy',
            'creator',
            'updater',
        ]);

        return $this->sendResponse($report, Response::HTTP_OK, 'Employee report updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $report = EmployeeReport::findOrFail($id);

        // Only allow deletion of draft reports or by admin
        if ($report->status !== 'Draft' && !request()->user()->is_admin) {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Only draft reports can be deleted.');
        }

        $report->delete();

        return $this->sendResponse(null, Response::HTTP_OK, 'Employee report deleted successfully.');
    }

    /**
     * Submit a report (change status from Draft to Submitted)
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function submit($id)
    {
        $user = request()->user();
        
        if (!$user) {
            return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }
        
        $report = EmployeeReport::findOrFail($id);

        if ($report->employee_id !== $user->id && !$user->is_admin) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'You can only submit your own reports.');
        }

        if ($report->status !== 'Draft') {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Only draft reports can be submitted.');
        }

        $report->update([
            'status' => 'Submitted',
            'submitted_by' => $user->id,
            'submitted_at' => Carbon::now(),
        ]);

        $report->load([
            'employee',
            'submittedBy',
            'approvedBy',
            'rejectedBy',
        ]);

        return $this->sendResponse($report, Response::HTTP_OK, 'Report submitted successfully.');
    }

    /**
     * Approve a report (manager action)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function approve(Request $request, $id)
    {
        $user = request()->user();
        $report = EmployeeReport::findOrFail($id);

        if ($report->status !== 'Submitted') {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Only submitted reports can be approved.');
        }

        $report->update([
            'status' => 'Approved',
            'approved_by' => $user->id,
            'approved_at' => Carbon::now(),
            'manager_comments' => $request->manager_comments,
        ]);

        $report->load([
            'employee',
            'submittedBy',
            'approvedBy',
            'rejectedBy',
        ]);

        return $this->sendResponse($report, Response::HTTP_OK, 'Report approved successfully.');
    }

    /**
     * Reject a report (manager action)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function reject(Request $request, $id)
    {
        $user = request()->user();
        $report = EmployeeReport::findOrFail($id);

        $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        if ($report->status !== 'Submitted') {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Only submitted reports can be rejected.');
        }

        $report->update([
            'status' => 'Rejected',
            'rejected_by' => $user->id,
            'rejected_at' => Carbon::now(),
            'rejection_reason' => $request->rejection_reason,
            'manager_comments' => $request->manager_comments,
        ]);

        $report->load([
            'employee',
            'submittedBy',
            'approvedBy',
            'rejectedBy',
        ]);

        return $this->sendResponse($report, Response::HTTP_OK, 'Report rejected successfully.');
    }

    /**
     * Get my reports (for current logged-in employee)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function myReports(Request $request)
    {
        try {
            $user = request()->user();
            
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }

            $request->validate([
                'per_page' => 'sometimes|integer|min:1',
                'page' => 'sometimes|integer|min:1',
                'report_type' => 'sometimes|in:Daily,Weekly,Monthly',
                'status' => 'sometimes|in:Draft,Submitted,Approved,Rejected',
                'start_date' => 'sometimes|date_format:Y-m-d',
                'end_date' => 'sometimes|date_format:Y-m-d',
            ]);

            $per_page = $request->per_page ?? 25;
            // Ensure per_page is at least 1
            if ($per_page < 1) {
                $per_page = 25;
            }

            $query = EmployeeReport::with([
                'submittedBy',
                'approvedBy',
                'rejectedBy',
            ])->where('employee_id', $user->id);

            if ($request->report_type) {
                $query->where('report_type', $request->report_type);
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->start_date) {
                $query->where('report_date', '>=', $request->start_date);
            }

            if ($request->end_date) {
                $query->where(function ($q) use ($request) {
                    $q->where('report_date', '<=', $request->end_date)
                      ->orWhere(function ($q2) use ($request) {
                          $q2->whereNotNull('end_date')
                             ->where('end_date', '<=', $request->end_date);
                      });
                });
            }

            $reports = $query->orderBy('report_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate($per_page);

            return $this->sendResponse($reports, Response::HTTP_OK, 'My reports retrieved successfully.');
        } catch (\Exception $e) {
            \Log::error('EmployeeReportsController myReports error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return $this->sendError('An error occurred while fetching reports.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

