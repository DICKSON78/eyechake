import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from "../hooks";
import { hasPrivilege, hasReportAccess, isAdmin } from "../helpers/privileges";

/**
 * ProtectedRoute component that checks user privileges before rendering
 * 
 * Usage:
 * <ProtectedRoute 
 *   privilege="reception" 
 *   element={<ReceptionDashboard />} 
 *   fallbackRoute="/dashboard"
 * />
 * 
 * For report pages:
 * <ProtectedRoute 
 *   parentPrivilege="reception"
 *   reportPrivilege="receptionist_monthly_report"
 *   element={<ReceptionistMonthlyReport />} 
 *   fallbackRoute="/reception/dashboard"
 * />
 */
const ProtectedRoute = ({ 
  element, 
  privilege, 
  parentPrivilege, 
  reportPrivilege,
  fallbackRoute = "/dashboard",
  showError = true 
}) => {
  const location = useLocation();
  const addToast = useToast();
  
  // Get user from window (set during login)
  const user = window.user || {};
  
  useEffect(() => {
    // Check if user has access
    let hasAccess = false;
    
    if (isAdmin(user)) {
      // Admins always have access
      hasAccess = true;
    } else if (reportPrivilege && parentPrivilege) {
      // For report pages, check both parent and report privileges
      hasAccess = hasReportAccess(user, parentPrivilege, reportPrivilege);
    } else if (privilege) {
      // For regular pages, check the privilege
      hasAccess = hasPrivilege(user, privilege);
    } else {
      // No privilege specified, allow access (for public routes)
      hasAccess = true;
    }
    
    // If no access and error should be shown, display toast
    if (!hasAccess && showError) {
      addToast({
        message: "You do not have permission to access this page.",
        severity: "error"
      });
    }
  }, [user, privilege, parentPrivilege, reportPrivilege, addToast, showError]);
  
  // Check access
  let hasAccess = false;
  
  if (isAdmin(user)) {
    hasAccess = true;
  } else if (reportPrivilege && parentPrivilege) {
    hasAccess = hasReportAccess(user, parentPrivilege, reportPrivilege);
  } else if (privilege) {
    hasAccess = hasPrivilege(user, privilege);
  } else {
    // No privilege specified, allow access
    hasAccess = true;
  }
  
  // If user doesn't have access, redirect to fallback route
  if (!hasAccess) {
    return <Navigate to={fallbackRoute} replace state={{ from: location }} />;
  }
  
  // User has access, render the element
  return element;
};

export default ProtectedRoute;
