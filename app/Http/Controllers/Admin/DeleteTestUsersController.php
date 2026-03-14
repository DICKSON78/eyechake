<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DeleteTestUsersController extends Controller
{
    use ApiResponse;

    public function destroy(Request $request)
    {
        // Only admins can delete test users
        $user = $request->user();
        if (!$user->is_admin) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Only administrators can delete test users.');
        }

        // Delete users with test indicators
        $testUserIndicators = [
            'test',
            'demo',
            'example',
            'sample',
            'dummy',
            'temp',
            'trial',
            'dev',
            'development'
        ];

        $deletedCount = 0;
        
        foreach ($testUserIndicators as $indicator) {
            $count = User::where(function ($query) use ($indicator) {
                $query->where('username', 'like', '%' . $indicator . '%')
                      ->orWhere('email', 'like', '%' . $indicator . '%')
                      ->orWhere('first_name', 'like', '%' . $indicator . '%')
                      ->orWhere('last_name', 'like', '%' . $indicator . '%');
            })->delete();
            
            $deletedCount += $count;
        }

        // Also delete users with specific test patterns
        $count = User::where('email', 'like', '%@test%')
            ->orWhere('email', 'like', '%@example%')
            ->orWhere('email', 'like', '%@demo%')
            ->orWhere('phone', 'like', '%123456%')
            ->orWhere('phone', 'like', '%000000%')
            ->delete();
            
        $deletedCount += $count;

        return $this->sendResponse([
            'deleted_test_users_count' => $deletedCount,
            'message' => 'Test users deleted successfully'
        ], Response::HTTP_OK, 'Success.');
    }

    public function index(Request $request)
    {
        // Only admins can view test users
        $user = $request->user();
        if (!$user->is_admin) {
            return $this->sendResponse(null, Response::HTTP_FORBIDDEN, 'Only administrators can view test users.');
        }

        $testUserIndicators = [
            'test',
            'demo',
            'example',
            'sample',
            'dummy',
            'temp',
            'trial',
            'dev',
            'development'
        ];

        $testUsers = User::where(function ($query) use ($testUserIndicators) {
            foreach ($testUserIndicators as $indicator) {
                $query->orWhere('username', 'like', '%' . $indicator . '%')
                      ->orWhere('email', 'like', '%' . $indicator . '%')
                      ->orWhere('first_name', 'like', '%' . $indicator . '%')
                      ->orWhere('last_name', 'like', '%' . $indicator . '%');
            }
        })
        ->orWhere('email', 'like', '%@test%')
        ->orWhere('email', 'like', '%@example%')
        ->orWhere('email', 'like', '%@demo%')
        ->orWhere('phone', 'like', '%123456%')
        ->orWhere('phone', 'like', '%000000%')
        ->select('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

        return $this->sendResponse($testUsers, Response::HTTP_OK, 'Success.');
    }
}
