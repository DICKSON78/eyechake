<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPrivilege
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @param  string  $privilege
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next, string $privilege)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();
        
        // Check if user is admin (has all privileges)
        if ($user->role === 'Admin' || $user->is_admin) {
            return $next($request);
        }

        // Check user privileges
        $userPrivileges = $this->getUserPrivileges($user);
        
        if (!$this->hasPrivilege($userPrivileges, $privilege)) {
            return response()->json(['message' => 'Unauthorized - Required privilege: ' . $privilege], 403);
        }

        return $next($request);
    }

    /**
     * Get user privileges from database
     */
    private function getUserPrivileges($user)
    {
        $privileges = [];
        
        // Get privileges from user_privileges table
        $userPrivileges = \App\Models\UserPrivilege::where('user_id', $user->id)->first();
        
        if ($userPrivileges) {
            // Convert JSON to array
            $privileges = json_decode($userPrivileges->privileges, true) ?: [];
        }
        
        // Add role-based fallback privileges
        $rolePrivileges = $this->getRoleFallbackPrivileges($user->role);
        $privileges = array_merge($privileges, $rolePrivileges);
        
        return $privileges;
    }

    /**
     * Get role-based fallback privileges
     */
    private function getRoleFallbackPrivileges($role)
    {
        $roleMap = [
            'receptionist' => ['reception', 'patient_registration'],
            'cashier' => ['payment_center', 'patient_bills', 'invoices'],
            'doctor' => ['consultation_room', 'consultation_reports'],
            'optometrist' => ['consultation_room', 'consultation_reports'],
            'pharmacist' => ['medicine_center', 'pharmacy_reports'],
            'optician' => ['optician_center', 'workshop_reports'],
            'sales manager' => ['sales_center', 'sales'],
            'storekeeper' => ['inventory_management', 'inventory_reports'],
            'accountant' => ['financial_management', 'financial_reports'],
            'marketing officer' => ['marketing', 'marketing_reports'],
            'hr' => ['employee_management', 'user_management'],
            'director' => ['director', 'financial_reports'],
        ];
        
        return $roleMap[strtolower($role)] ?? [];
    }

    /**
     * Check if user has specific privilege
     */
    private function hasPrivilege($privileges, $requiredPrivilege)
    {
        return in_array($requiredPrivilege, $privileges) || 
               isset($privileges[$requiredPrivilege]) && $privileges[$requiredPrivilege];
    }
}
