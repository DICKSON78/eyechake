import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./index";
import { hasPrivilege, hasReportAccess, isAdmin } from "../helpers/privileges";

/**
 * Hook to check user privileges and redirect if unauthorized
 * 
 * Usage in pages:
 * 
 * // For regular pages
 * usePrivilege('reception', '/dashboard');
 * 
 * // For report pages
 * usePrivilege('reception', '/reception/dashboard', 'receptionist_monthly_report');
 * 
 * @param {string} privilege - The privilege key to check (e.g., 'reception', 'payment_center')
 * @param {string} fallbackRoute - Route to redirect to if user doesn't have privilege
 * @param {string} reportPrivilege - Optional report-specific privilege
 * @param {boolean} showError - Whether to show error toast (default: true)
 */
const usePrivilege = (privilege, fallbackRoute = "/dashboard", reportPrivilege = null, showError = true) => {
  const navigate = useNavigate();
  const addToast = useToast();
  
  useEffect(() => {
    // Get user from window (set during login)
    const user = window.user || {};
    
    console.log('usePrivilege - User:', user);
    console.log('usePrivilege - Privilege:', privilege);
    console.log('usePrivilege - Fallback route:', fallbackRoute);
    
    let hasAccess = false;
    
    // Check if user has access
    if (isAdmin(user)) {
      // Admins always have access
      hasAccess = true;
      console.log('usePrivilege - Admin access granted');
    } else if (reportPrivilege && privilege) {
      // For report pages, check both parent and report privileges
      hasAccess = hasReportAccess(user, privilege, reportPrivilege);
      console.log('usePrivilege - Report access:', hasAccess);
    } else if (privilege) {
      // For regular pages, check privilege
      hasAccess = hasPrivilege(user, privilege);
      console.log('usePrivilege - Regular access:', hasAccess);
    } else {
      // No privilege specified, allow access
      hasAccess = true;
      console.log('usePrivilege - No privilege required, access granted');
    }
    
    // Allow access if user is authenticated and has basic admin role
    if (user && (user.role === 'Admin' || user.is_admin === true || user.is_admin === 1)) {
      hasAccess = true;
      console.log('usePrivilege - Admin role bypass granted');
    }
    
    // Only redirect if explicitly denied access and user is not admin
    if (!hasAccess && !(user && (user.role === 'Admin' || user.is_admin === true || user.is_admin === 1))) {
      console.log('usePrivilege - Access denied, redirecting to:', fallbackRoute);
      if (showError) {
        addToast({
          message: "You do not have permission to access this page.",
          severity: "error"
        });
      }
      navigate(fallbackRoute, { replace: true });
    } else {
      console.log('usePrivilege - Access allowed, no redirect');
    }
  }, [privilege, fallbackRoute, reportPrivilege, navigate, addToast, showError]);
};

export default usePrivilege;
