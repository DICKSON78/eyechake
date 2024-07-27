<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\ClinicDetail;
use App\Models\Department;
use App\Models\Preference;
use App\Models\UserPrivilege;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $credentials = $request->only('username', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            if ($user->status == 'Inactive') {
                return $this->sendResponse(
                    null,
                    Response::HTTP_FORBIDDEN,
                    'You do not have access to the system.'
                );
            }

            $token = $user->createToken('MyApp')->plainTextToken;

            return $this->sendResponse([
                'token' => $token,
                'user' => $user
            ], Response::HTTP_OK, 'Logged in successfully.');
        } else {
            return $this->sendResponse(
                null,
                Response::HTTP_UNAUTHORIZED,
                'Incorrect username/password combination.'
            );
        }
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required',
        ]);

        $user = $request->user();

        if (Hash::check($request->current_password, $user->password)) {
            $user->password = Hash::make($request->new_password);
            $user->save();

            return $this->sendResponse($user, Response::HTTP_OK, 'Password changed successfully.');
        }

        return $this->sendResponse(
            null,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Incorrect current password.'
        );
    }

    public function getAuthUser(Request $request)
    {
        $user = $request->user();
        $user->department = Department::find($user->department_id);
        $user->job_title_id = Department::find($user->job_title_id);
        $user->clinic = ClinicDetail::first() ?? new \stdClass();
        $user->clinic->preferences = Preference::all();
        $user_privileges = UserPrivilege::where('user_id', $user->id)->get();
        $user_privileges = $user_privileges->map(function ($e) {
            return $e->privilege;
        });

        $user->privileges = new \stdClass();
        foreach ($user_privileges as $privilege) {
            $user->privileges->$privilege = true;
        }

        return $this->sendResponse($user, Response::HTTP_OK, 'Success.');
    }
}
