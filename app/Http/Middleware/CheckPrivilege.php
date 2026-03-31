<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserPrivilege;

class CheckPrivilege
{
    public function handle(Request $request, Closure $next, string $privilege)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();

        // Admin and Director have full access
        if ($user->role === 'Admin' || $user->role === 'Director' || $user->is_admin) {
            return $next($request);
        }

        // Check if user has privileges as array/object
        $hasPrivilegesAttribute = array_key_exists('privileges', $user->attributes);
        $privileges = $hasPrivilegesAttribute ? $user->privileges : [];
        
        // For backward compatibility, also check old string privilege format
        $hasStringPrivilege = !empty($user->privilege);
        
        // Check if user has the required privilege (either as string or in array)
        $hasRequiredPrivilege = $hasStringPrivilege ? $user->hasPrivilege($privilege) : in_array($privilege, $privileges);
        
        if (!$hasRequiredPrivilege) {
            return response()->json([
                'message' => 'Access denied. Insufficient privileges.',
                'required_privilege' => $privilege,
                'user_privileges' => $privileges,
                'user_privilege' => $user->privilege,
                'debug' => [
                    'has_privileges_attribute' => $hasPrivilegesAttribute,
                    'privileges_type' => gettype($privileges),
                    'checking_privilege' => $privilege
                ]
            ], 403);
        }
        
        // Check role-based privileges first
        $rolePrivileges = $this->getRoleFallbackPrivileges($user->role);
        if (in_array($privilege, $rolePrivileges)) {
            return $next($request);
        }

        // Check database privileges (column-based)
        $userPrivileges = UserPrivilege::where('user_id', $user->id)->first();
        if ($userPrivileges && isset($userPrivileges->$privilege) && $userPrivileges->$privilege == 1) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized - Required privilege: ' . $privilege], 403);
    }

    private function getRoleFallbackPrivileges($role)
    {
        $roleMap = [
            'Admin'            => ['*'],
            'Director'         => ['*'],
            'Receptionist'     => ['dashboard', 'reception', 'receptionist_monthly_report'],
            'Cashier'          => ['dashboard', 'payment_center', 'cashier_monthly_report', 'clear_pending_bill'],
            'Doctor'           => ['dashboard', 'consultation_room', 'optometrist_monthly_report', 'optometry_report_card'],
            'Optometrist'      => ['dashboard', 'consultation_room', 'optometrist_monthly_report', 'optometry_report_card'],
            'Optician'         => ['dashboard', 'optician_center', 'dispensing'],
            'Pharmacist'       => ['dashboard', 'medicine_center', 'dispensing'],
            'Sales Manager'    => ['dashboard', 'sales_center', 'sales_management', 'sales', 'sales_manager_monthly_report', 'sales_report_card'],
            'Sales'            => ['dashboard', 'sales_center', 'sales_management', 'sales', 'sales_report_card'],
            'Storekeeper'      => ['dashboard', 'inventory_management'],
            'Inventory Manager'=> ['dashboard', 'inventory_management'],
            'Accountant'       => ['dashboard', 'financial_management'],
            'Finance Manager'  => ['dashboard', 'financial_management'],
            'HR'               => ['dashboard', 'employee_management', 'user_management'],
            'Marketing'        => ['dashboard', 'marketing', 'marketing_operations_monthly_report', 'office_calendar', 'crm_reports'],
            'Marketing Manager'=> ['dashboard', 'marketing', 'marketing_operations_monthly_report', 'office_calendar', 'crm_reports'],
        ];

        return $roleMap[$role] ?? ['dashboard'];
    }
}
