<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class UsersController extends Controller
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
        $per_page = $request->per_page ?? 25;
        $id = $request->id;
        $name = $request->name;
        $gender = $request->gender;
        $phone = $request->phone;
        $department_id = $request->department_id;
        $job_title_id = $request->job_title_id;
        $employee_number = $request->employee_number;
        $data = User::with(['department', 'job_title', 'privileges', 'creator']);

        if ($id) {
            $data->where('id', $id);
        }

        if ($name) {
            $data->fullName('%' . $name . '%');
        }

        if ($gender) {
            $data->where('gender', $gender);
        }

        if ($phone) {
            $data->where('phone', $phone);
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
            'department_id' => 'required|exists:departments,id',
            'job_title_id' => 'required|exists:job_titles,id',
            'employee_number' => 'nullable|unique:users,employee_number',
            'password' => 'required',
            'privileges' => 'required',
            'privileges.dashboard' => 'nullable|boolean',
            'privileges.reception' => 'nullable|boolean',
            'privileges.payment_center' => 'nullable|boolean',
            'privileges.consultation_room' => 'nullable|boolean',
            'privileges.optician_center' => 'nullable|boolean',
            'privileges.medicine_center' => 'nullable|boolean',
            'privileges.procedure_room' => 'nullable|boolean',
            'privileges.inventory_management' => 'nullable|boolean',
            'privileges.financial_management' => 'nullable|boolean',
            'privileges.employee_management' => 'nullable|boolean',
            'privileges.settings' => 'nullable|boolean',
        ]);

        $input = $request->all();
        $input['created_by'] = $request->user()->id;
        $data = User::create($input);

        if ($data) {
            UserPrivilege::create(array_merge([
                'user_id' => $data->id,
            ], $request->json('privileges')));
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
        $data = User::with(['department', 'job_title', 'privileges', 'creator'])->findOrFail($id);
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
            'username' => 'nullable|unique:users,username,' . $id,
            'department_id' => 'nullable|exists:departments,id',
            'job_title_id' => 'nullable|exists:job_titles,id',
            'employee_number' => 'nullable|unique:users,employee_number,' . $id,
            'status' => 'nullable|in:Active,Inactive',
            'privileges.dashboard' => 'nullable|boolean',
            'privileges.reception' => 'nullable|boolean',
            'privileges.payment_center' => 'nullable|boolean',
            'privileges.consultation_room' => 'nullable|boolean',
            'privileges.optician_center' => 'nullable|boolean',
            'privileges.medicine_center' => 'nullable|boolean',
            'privileges.procedure_room' => 'nullable|boolean',
            'privileges.inventory_management' => 'nullable|boolean',
            'privileges.financial_management' => 'nullable|boolean',
            'privileges.employee_management' => 'nullable|boolean',
            'privileges.settings' => 'nullable|boolean',
        ]);

        $data = User::findOrFail($id);
        $input = $request->all();

        if ($request->password) {
            $input['password'] = Hash::make($request->password);
        }

        if ($request->privileges) {
            $user_privileges = UserPrivilege::find($id);
            if ($user_privileges) {
                $user_privileges->update($request->json('privileges'));
            } else {
                UserPrivilege::create(array_merge([
                    'user_id' => $id,
                ], $request->json('privileges')));
            }
        }

        $data->update($input);
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
