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
    
    let hasAccess = false;
    
    // Check if user has access
    if (isAdmin(user)) {
      // Admins always have access
      hasAccess = true;
    } else if (reportPrivilege && privilege) {
      // For report pages, check both parent and report privileges
      hasAccess = hasReportAccess(user, privilege, reportPrivilege);
    } else if (privilege) {
      // For regular pages, check the privilege
      hasAccess = hasPrivilege(user, privilege);
    } else {
      // No privilege specified, allow access
      hasAccess = true;
    }
    
    // If user doesn't have access, redirect
    if (!hasAccess) {
      if (showError) {
        addToast({
          message: "You do not have permission to access this page.",
          severity: "error"
        });
      }
      navigate(fallbackRoute, { replace: true });
    }
  }, [privilege, fallbackRoute, reportPrivilege, navigate, addToast, showError]);
};

export default usePrivilege;
