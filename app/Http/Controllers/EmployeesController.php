<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Employee;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class EmployeesController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
        ]);

        $per_page = $request->per_page ?? 25;
        $status = $request->status;
        $name = $request->name;
        $gender = $request->gender;
        $phone = $request->phone;
        $designation = $request->designation;
        $department_id = $request->department_id;
        $job_title_id = $request->job_title_id;
        $employee_number = $request->employee_number;
        $data = Employee::with(['department', 'job_title', 'user.privileges', 'creator']);

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
        $request->validate([
            'first_name' => 'required',
            'last_name' => 'required',
            'username' => 'required|unique:users,username',
            'gender' => 'required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'designation' => 'nullable|in:Doctor,Other',
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|unique:employees,employee_number',
            'password' => 'required',
            'privileges' => 'required|array',
        ]);

        $input = $request->except('username', 'password', 'privileges');
        $input['created_by'] = $request->user()->id;
        $data = Employee::create($input);

        if ($data) {
            $input = $request->only('username', 'password');
            $input['password'] = Hash::make($request->password);
            $input['created_by'] = $request->user()->id;
            $user = User::create($input);
            if ($user) {
                $privileges = array_map(function ($e) use ($user) {
                    return ['user_id' => $user->id, 'privilege' => $e];
                }, $request->json('privileges'));

                UserPrivilege::insert($privileges);

                $data->user_id = $user->id;
                $data->save();
            }
        }

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
        $data = User::with(['job_title', 'user.privileges', 'creator'])->findOrFail($id);
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
            'gender' => 'sometimes|required|in:Male,Female',
            'date_of_birth' => 'nullable|date_format:Y-m-d',
            'designation' => 'nullable|in:Doctor,Other',
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|unique:employees,employee_number,' . $id,
            'status' => 'sometimes|required|in:Active,Inactive',
            'privileges' => 'sometimes|required|array',
        ]);

        $data = Employee::findOrFail($id);
        $data->update($request->except('username', 'password', 'privileges'));

        $user = User::find($data->user_id);
        if (!$user) {
            if ($request->username && $request->password) {
                $request->validate([
                    'username' => 'unique:users,username',
                ]);
                $input = $request->only('username', 'password', 'status');
                $input['password'] = Hash::make($request->password);
                $input['created_by'] = $request->user()->id;
                $user = User::create($input);
            }
        } else {
            $request->validate([
                'username' => 'sometimes|required|unique:users,username,' . $user->id,
            ]);
            $input = $request->only('username', 'status');

            if ($request->password) {
                $input['password'] = Hash::make($request->password);
            }
            $user->update($input);
        }

        if ($user) {
            if ($request->privileges) {
                // delete and reinsert privileges
                UserPrivilege::where('user_id', $user->id)->delete();
                $privileges = array_map(function ($e) use ($user) {
                    return ['user_id' => $user->id, 'privilege' => $e];
                }, $request->json('privileges'));

                UserPrivilege::insert($privileges);
            }

            $data->user_id = $user->id;
            $data->save();
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
