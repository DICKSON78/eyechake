<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\UserPrivilege;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
{
    use ApiResponse;

    private function normalizePrivilegesInput($rawPrivileges)
    {
        if (is_string($rawPrivileges)) {
            $decoded = json_decode($rawPrivileges, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $rawPrivileges = $decoded;
            } else {
                $rawPrivileges = [];
            }
        }

        if (!is_array($rawPrivileges)) {
            return [];
        }

        $isAssoc = array_keys($rawPrivileges) !== range(0, count($rawPrivileges) - 1);

        if ($isAssoc) {
            $rawPrivileges = array_keys(array_filter($rawPrivileges, function ($value) {
                return $value === true || $value === 1 || $value === '1' || $value === 'true';
            }));
        }

        $normalized = [];
        foreach ($rawPrivileges as $privilege) {
            if (!is_string($privilege) || trim($privilege) === '') {
                continue;
            }

            $privilege = trim($privilege);

            if ($privilege === 'sales') {
                $privilege = 'sales_center';
            }
            if ($privilege === 'employee_management') {
                $privilege = 'user_management';
            }

            $normalized[] = $privilege;
        }

        return array_values(array_unique($normalized));
    }

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'per_page' => 'sometimes|integer|min:0',
                'page' => 'sometimes|integer|min:1',
            ]);

            $user = $request->user();
            if (!$user) {
                return $this->sendError('Unauthorized', Response::HTTP_UNAUTHORIZED);
            }

            $per_page = $request->per_page ?? 25;
            $clinic_id = $request->clinic_id;
            $status = $request->status;
            $name = $request->name;
            $gender = $request->gender;
            $phone = $request->phone;
            $designation = $request->designation;
            $department_id = $request->department_id;
            $job_title_id = $request->job_title_id;
            $employee_number = $request->employee_number;
            // Don't load 'privileges' relationship - use the accessor instead
            // The getPrivilegesAttribute() accessor returns privileges as an array
            $data = User::with(['department', 'job_title', 'creator']);

        if ($user->is_admin) {
            $data->with(['clinic']);

            if ($clinic_id) {
                $data->where('clinic_id', $clinic_id);
            }
        } else {
            $data->where('clinic_id', $user->clinic_id);
            $data->where('role', '!=', 'Admin');
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($name) {
            $data->fullName('%' . $name . '%');
        }

        if ($gender) {
            $data->where('gender', $gender);
        }

        if ($phone) {
            $data->where('phone', 'like', '%' . $phone . '%');
        }

        if ($designation) {
            $data->where('designation', $designation);
        }

        if ($department_id) {
            $data->where('department_id', $department_id);
        }

        if ($job_title_id) {
            $data->where('job_title_id', $job_title_id);
        }

        if ($employee_number) {
            $data->where('employee_number', $employee_number);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        
        // Ensure privileges are returned as arrays (not relationship collections)
        // The User model's getPrivilegesAttribute accessor handles this automatically
        // But we need to make sure it's not overridden by the relationship

        // Add sales performance data for each user
        if ($data->count() > 0) {
            $start_date = Carbon::now()->startOfMonth()->format('Y-m-d');
            $end_date = Carbon::now()->endOfMonth()->format('Y-m-d');

            $data->getCollection()->transform(function ($user) use ($start_date, $end_date, $clinic_id) {
                // Initiated deals count
                $initiatedCount = \App\Models\PatientPaymentCacheItem::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('payment_cache.check_in.creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('created_by', $user->id)
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                // Closed deals count
                $closedCount = \App\Models\PatientItemPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('created_by', $user->id)
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                $closedBillCount = \App\Models\PatientItemBillPayment::query()
                    ->when($clinic_id, function ($query) use ($clinic_id) {
                        $query->whereHas('creator', function ($q) use ($clinic_id) {
                            $q->where('clinic_id', $clinic_id);
                        });
                    })
                    ->where('created_by', $user->id)
                    ->whereDate('created_at', '>=', $start_date)
                    ->whereDate('created_at', '<=', $end_date)
                    ->count();

                $user->sales_performance = [
                    'initiated_deals' => $initiatedCount,
                    'closed_deals' => $closedCount + $closedBillCount,
                ];

                return $user;
            });
        }

            return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
        } catch (\Exception $e) {
            \Log::error('UsersController index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            
            return $this->sendError(
                'An error occurred while fetching users. Please try again later.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            if ($user->is_admin) {
                $request->validate([
                    'clinic_id' => 'required|exists:clinics,id',
                ]);

                $clinic_id = $request->clinic_id;
            } else {
                $clinic_id = $user->clinic_id;
            }

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
                'role' => 'sometimes|in:Admin,Client',
                'privileges' => 'sometimes|array',
            ];

            $request->validate($validationRules);

            $input = $request->except('password', 'privileges');
            $input['clinic_id'] = $clinic_id;
            $input['password'] = Hash::make($request->password);
            $input['created_by'] = $request->user()->id;
            $data = User::create($input);

            if ($data && $request->has('privileges')) {
                // Set privileges for new user using the boolean column structure
                UserPrivilege::updateFromArray($data->id, $this->normalizePrivilegesInput($request->input('privileges', [])));
            }

            return $this->sendResponse($data, Response::HTTP_OK, 'Created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('User registration validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->except(['password'])
            ]);
            return $this->sendError('Validation failed. Please check all required fields.', Response::HTTP_UNPROCESSABLE_ENTITY, $e->errors());
        } catch (\Exception $e) {
            \Log::error('User registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->sendError('Failed to create user: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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
        // Don't load the relationship as it conflicts with the accessor
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'sometimes|required',
            'last_name' => 'sometimes|required',
            'username' => 'sometimes|required|unique:users,username,' . $id,
            'gender' => 'sometimes|required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'designation' => 'nullable|in:Doctor,Other',
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|unique:users,employee_number,' . $id,
            'status' => 'sometimes|required|in:Active,Inactive',
            'role' => 'sometimes|in:Admin,Client',
            'privileges' => 'sometimes|array',
        ]);

        $data = User::findOrFail($id);
        $input = $request->except('privileges');

        if ($request->password) {
            $input['password'] = Hash::make($request->password);
        }

        $data->update($input);

        if ($request->has('privileges')) {
            // Update privileges using the new boolean column structure
            UserPrivilege::updateFromArray($data->id, $this->normalizePrivilegesInput($request->input('privileges', [])));
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
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
}
