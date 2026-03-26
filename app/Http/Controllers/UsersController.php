<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UsersController extends Controller
{
    use \App\Http\Traits\ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $data = User::with(['job_title', 'department', 'creator'])
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->where('clinic_id', $clinic_id);
            })
            ->when($request->designation, function ($query) use ($request) {
                $query->where('designation', $request->designation);
            })
            ->when($request->status, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->q, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('first_name', 'like', '%' . $request->q . '%')
                      ->orWhere('last_name', 'like', '%' . $request->q . '%')
                      ->orWhere('username', 'like', '%' . $request->q . '%')
                      ->orWhere('phone', 'like', '%' . $request->q . '%');
                });
            })
            ->orderBy('first_name', 'asc')
            ->paginate($per_page);

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $clinic_id = $user->is_admin ? $request->clinic_id : $user->clinic_id;

        $validationRules = [
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|unique:users,username|max:255',
            'gender' => 'required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'phone' => 'nullable|string|max:20',
            'national_id' => 'nullable|string|max:50',
            'designation' => 'nullable|in:Doctor,Other',
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|string|unique:users,employee_number|max:50',
            'password' => 'required|string|min:6',
            'role' => 'sometimes|string|max:50',
            'privileges' => 'sometimes|array',
            'status' => 'sometimes|required|in:Active,Inactive',
        ];

        $request->validate($validationRules);

        $input = $request->except('password', 'privileges');
        $input['clinic_id'] = $clinic_id;
        $input['created_by'] = $user->id;
        $input['password'] = \Illuminate\Support\Facades\Hash::make($request->password);

        $data = DB::transaction(function () use ($input, $request) {
            $user = User::create($input);

            if ($user && $request->has('privileges')) {
                $normalized = $this->normalizePrivilegesInput($request->input('privileges', []));
                Log::info('Saving privileges for new user', [
                    'user_id'    => $user->id,
                    'username'   => $user->username,
                    'privileges' => $normalized,
                ]);
                UserPrivilege::updateFromArray($user->id, $normalized);
            }

            return $user;
        });

        return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = User::with(['job_title', 'creator'])->findOrFail($id);
        // Privileges are returned as array via the getPrivilegesAttribute accessor
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'first_name'      => 'sometimes|required',
                'last_name'       => 'sometimes|required',
                'username'        => 'sometimes|required|unique:users,username,' . $id,
                'gender'          => 'sometimes|required|in:Male,Female',
                'date_of_birth'   => 'sometimes|nullable|date_format:Y-m-d',
                'phone'          => 'sometimes|nullable|string|max:20',
                'national_id'     => 'sometimes|nullable|string|max:50',
                'designation'     => 'sometimes|nullable|in:Doctor,Other',
                'department_id'   => 'sometimes|nullable|exists:departments,id',
                'job_title_id'    => 'sometimes|nullable|exists:job_titles,id',
                'employee_number' => 'sometimes|nullable|unique:users,employee_number,' . $id,
                'status'          => 'sometimes|required|in:Active,Inactive',
                'role'            => 'sometimes|string|max:50',
                'privileges'      => 'sometimes|array',
                'password'        => 'sometimes|nullable|string|min:6',
            ]);

            $data = User::findOrFail($id);

            // Never let password silently overwrite via mass-assignment.
            // Always exclude it from the general update; handle it explicitly below.
            $input = $request->except(['privileges', 'password']);

            // Only update password when caller explicitly sends a non-empty value.
            if ($request->filled('password') && strlen($request->password) >= 6) {
                $input['password'] = Hash::make($request->password);
            }

            $data->update($input);

            if ($request->has('privileges')) {
                $normalized = $this->normalizePrivilegesInput($request->input('privileges', []));
                Log::info('Updating privileges for user', [
                    'user_id'    => $data->id,
                    'username'   => $data->username,
                    'privileges' => $normalized,
                ]);
                UserPrivilege::updateFromArray($data->id, $normalized);
                $saved = UserPrivilege::getPrivilegesAsArray($data->id);
                Log::info('Privileges updated successfully', [
                    'user_id' => $data->id,
                    'saved'   => $saved,
                ]);
            }

            return $data;
        } catch (ValidationException $e) {
            Log::warning('User update validation failed', [
                'user_id' => $id,
                'errors' => $e->errors(),
                'request_data' => $request->except(['password', 'privileges']),
            ]);
            return $this->sendError(
                'Validation failed. Please check all required fields.',
                Response::HTTP_UNPROCESSABLE_ENTITY,
                $e->errors()
            );
        } catch (Exception $e) {
            Log::error('User update failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return $this->sendError(
                'Failed to save changes: ' . $e->getMessage(),
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Normalize privileges input for storage.
     *
     * @param  array|string $privileges
     * @return array
     */
    private function normalizePrivilegesInput($privileges, $default = [])
    {
        if (is_string($privileges)) {
            $privileges = explode(',', $privileges);
        }

        return array_map('trim', $privileges);
    }

    /**
     * Get default privileges based on role
     */
    private function getDefaultPrivilegesForRole(string $role): array
    {
        $rolePrivileges = [
            'Admin'             => ['dashboard', 'reception', 'payment_center', 'consultation_room', 'optician_center', 'medicine_center', 'procedure_room', 'inventory_management', 'financial_management', 'employee_management', 'settings', 'marketing', 'sales_center', 'sales_management', 'director', 'office_calendar', 'dispensing', 'other_dispensing', 'receptionist_monthly_report', 'cashier_monthly_report', 'optometrist_monthly_report', 'sales_manager_monthly_report', 'marketing_operations_monthly_report', 'optometry_report_card', 'sales_report_card', 'crm_report_card', 'crm_reports', 'user_management', 'clear_pending_bill'],
            'Director'          => ['dashboard', 'reception', 'payment_center', 'consultation_room', 'optician_center', 'medicine_center', 'procedure_room', 'inventory_management', 'financial_management', 'employee_management', 'settings', 'marketing', 'sales_center', 'sales_management', 'director', 'office_calendar', 'dispensing', 'other_dispensing', 'receptionist_monthly_report', 'cashier_monthly_report', 'optometrist_monthly_report', 'sales_manager_monthly_report', 'marketing_operations_monthly_report', 'optometry_report_card', 'sales_report_card', 'crm_report_card', 'crm_reports', 'user_management', 'clear_pending_bill'],
            'Receptionist'      => ['dashboard', 'reception', 'receptionist_monthly_report'],
            'Cashier'           => ['dashboard', 'payment_center', 'cashier_monthly_report', 'clear_pending_bill'],
            'Doctor'            => ['dashboard', 'consultation_room', 'optometrist_monthly_report', 'optometry_report_card', 'consultation_reports'],
            'Optometrist'       => ['dashboard', 'consultation_room', 'optometrist_monthly_report', 'optometry_report_card', 'consultation_reports'],
            'Optician'          => ['dashboard', 'optician_center', 'dispensing'],
            'Pharmacist'        => ['dashboard', 'medicine_center', 'dispensing'],
            'Sales Manager'     => ['dashboard', 'sales_center', 'sales_management', 'sales_manager_monthly_report', 'sales_report_card'],
            'Sales'             => ['dashboard', 'sales_center', 'sales_management', 'sales_report_card'],
            'Storekeeper'       => ['dashboard', 'inventory_management'],
            'Inventory Manager' => ['dashboard', 'inventory_management'],
            'Accountant'        => ['dashboard', 'financial_management'],
            'Finance Manager'   => ['dashboard', 'financial_management'],
            'HR'                => ['dashboard', 'employee_management', 'user_management'],
            'Marketing'         => ['dashboard', 'marketing', 'marketing_operations_monthly_report', 'office_calendar', 'crm_reports'],
            'Marketing Manager' => ['dashboard', 'marketing', 'marketing_operations_monthly_report', 'office_calendar', 'crm_reports'],
            'Client'            => ['dashboard'],
        ];

        return $rolePrivileges[$role] ?? ['dashboard'];
    }
}
