/**
 * Privilege checking utilities
 * Provides consistent privilege checking across the application
 */

/**
 * Check if a privilege value is granted
 * @param {*} value - The privilege value to check
 * @returns {boolean} - True if privilege is granted
 */
export const isPrivilegeGranted = (value) => {
  if (value === true || value === 1 || value === "1" || value === "true" || value === "Yes" || value === "yes") {
    return true;
  }
  return false;
};

/**
 * Check if user is an admin
 * @param {Object} user - User object
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  if (!user) return false;
  return user.role === "Admin" || 
         user.is_admin === true || 
         user.is_admin === 1 || 
         user.is_admin === "1";
};

const PRIVILEGE_ALIASES = {
  sales_center: ["sales"],
  sales: ["sales_center"],
  user_management: ["employee_management"],
  employee_management: ["user_management"],
};

const ROLE_FALLBACK_PRIVILEGES = {
  admin: ["dashboard", "reception", "payment_center", "consultation_room", "sales_center", "medicine_center", "optician_center", "inventory_management", "financial_management", "employee_management", "director", "settings", "calendar"],
  director: ["dashboard", "reception", "payment_center", "consultation_room", "sales_center", "medicine_center", "optician_center", "inventory_management", "financial_management", "director", "settings", "calendar"],
  receptionist: ["dashboard", "reception", "patient_registration", "reception_reports", "website_appointments"],
  cashier: ["dashboard", "payment_center", "credit_patients_approval", "patient_bills", "invoices", "expenses", "payment_center_reports"],
  doctor: ["dashboard", "consultation_room", "consultation_reports"],
  optometrist: ["dashboard", "consultation_room", "consultation_reports"],
  "sales manager": ["sales_center", "sales"],
  sales: ["sales_center", "sales"],
  pharmacist: ["dashboard", "medicine_center", "pharmacy_reports", "dispensing_reports"],
  optician: ["dashboard", "optician_center", "workshop_reports"],
  workshop: ["dashboard", "optician_center", "workshop_reports"],
  storekeeper: ["dashboard", "inventory_management", "inventory_reports"],
  inventory: ["dashboard", "inventory_management", "inventory_reports"],
  accountant: ["dashboard", "financial_management", "financial_reports"],
  finance: ["dashboard", "financial_management", "financial_reports", "cash_collection"],
  hr: ["dashboard", "employee_management", "user_management", "employee_reports"],
  "employee management": ["dashboard", "employee_management", "user_management", "employee_reports"],
  dispensing: ["dashboard", "dispensing"],
  "procedure room": ["dashboard", "consultation_room", "procedure_requests"],
  "other dispensing": ["dashboard", "dispensing"],
  "clinic admin": ["dashboard", "settings"]
};

const normalizePrivilegePayload = (payload) => {
  if (!payload) return {};

  let normalized = payload;

  if (typeof normalized === "string") {
    try {
      normalized = JSON.parse(normalized);
    } catch (e) {
      return {};
    }
  }

  if (Array.isArray(normalized)) {
    const result = {};
    normalized.forEach((item) => {
      if (typeof item === "string") {
        result[item] = true;
        return;
      }
      if (item && typeof item === "object") {
        if (typeof item.privilege === "string") {
          result[item.privilege] = true;
          return;
        }
        Object.keys(item).forEach((key) => {
          result[key] = item[key];
        });
      }
    });
    return result;
  }

  if (normalized && typeof normalized === "object") {
    if (
      normalized.original &&
      typeof normalized.original === "object" &&
      Object.keys(normalized).length === 1
    ) {
      return normalizePrivilegePayload(normalized.original);
    }
    return normalized;
  }

  return {};
};

const getNormalizedPrivileges = (user) => {
  const rawPrivileges =
    user?.privileges ?? user?.access ?? user?.user_privileges ?? {};

  const normalized = normalizePrivilegePayload(rawPrivileges);
  const hasAnyExplicitPrivilege = Object.keys(normalized).length > 0;

  if (!hasAnyExplicitPrivilege) {
    const roleKey = (user?.role || "").toString().trim().toLowerCase();
    const fallbackPrivileges = ROLE_FALLBACK_PRIVILEGES[roleKey] || [];
    fallbackPrivileges.forEach((privilege) => {
      normalized[privilege] = true;
    });
  }

  return normalized;
};

/**
 * Check if user has a specific privilege
 * Admins always have access to all privileges
 * @param {Object} user - User object
 * @param {string} privilegeKey - The privilege key to check (e.g., 'dashboard', 'reception')
 * @returns {boolean} - True if user has the privilege
 */
export const hasPrivilege = (user, privilegeKey) => {
  if (!user || !privilegeKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[hasPrivilege] Missing user or privilegeKey:`, { user: !!user, privilegeKey });
    }
    return false;
  }
  
  // First check if user has explicit privileges (this should work for ALL roles)
  const privileges = user.privileges || {};
  const normalizedPrivileges = getNormalizedPrivileges(user);
  
  // If user has privileges defined, check them directly (regardless of role)
  if (Object.keys(normalizedPrivileges).length > 0) {
    const privilegeValue = normalizedPrivileges[privilegeKey];
    let granted = isPrivilegeGranted(privilegeValue);
    
    // Check aliases if not granted
    if (!granted) {
      const aliasKeys = PRIVILEGE_ALIASES[privilegeKey] || [];
      for (const aliasKey of aliasKeys) {
        if (isPrivilegeGranted(normalizedPrivileges[aliasKey])) {
          granted = true;
          break;
        }
      }
    }
    
    // Debug logging
    if (!granted) {
      console.log(`[hasPrivilege] Access denied for ${privilegeKey}:`, {
        user: user.username || user.id,
        role: user.role || 'No role',
        privilegeValue,
        normalizedPrivileges,
        hasPrivileges: Object.keys(privileges).length > 0
      });
    }
    
    return granted;
  }
  
  // Admins always have access (fallback for system admin)
  if (isAdmin(user)) {
    return true;
  }
  
  // If no explicit privileges and not admin, check role-based fallback
  const roleKey = (user?.role || "").toString().trim().toLowerCase();
  const fallbackPrivileges = ROLE_FALLBACK_PRIVILEGES[roleKey] || [];
  const hasFallbackPrivilege = fallbackPrivileges.includes(privilegeKey);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[hasPrivilege] No explicit privileges, checking role fallback for ${privilegeKey}:`, {
      user: user.username || user.id,
      role: user.role || 'No role',
      roleKey,
      fallbackPrivileges,
      hasFallbackPrivilege
    });
  }
  
  return hasFallbackPrivilege;
};

/**
 * Check if user has access to a specific report page
 * Access is granted if:
 * 1. User is admin OR
 * 2. User has the parent section privilege (e.g., "reception") OR
 * 3. User has the specific report privilege (e.g., "receptionist_monthly_report")
 * @param {Object} user - User object
 * @param {string} parentPrivilege - Parent section privilege (e.g., "reception")
 * @param {string} reportPrivilege - Specific report privilege (e.g., "receptionist_monthly_report")
 * @returns {boolean} - True if user has access
 */
export const hasReportAccess = (user, parentPrivilege, reportPrivilege) => {
  if (!user) return false;
  
  // Admins always have access
  if (isAdmin(user)) {
    return true;
  }
  
  const normalizedPrivileges = getNormalizedPrivileges(user);
  
  // Check parent privilege OR specific report privilege
  const hasParent = (() => {
    if (isPrivilegeGranted(normalizedPrivileges[parentPrivilege])) return true;
    const aliasKeys = PRIVILEGE_ALIASES[parentPrivilege] || [];
    return aliasKeys.some((k) => isPrivilegeGranted(normalizedPrivileges[k]));
  })();
  const hasReport = reportPrivilege ? isPrivilegeGranted(normalizedPrivileges[reportPrivilege]) : false;
  
  return hasParent || hasReport;
};

/**
 * Get the default route for a user based on their privileges
 * @param {Object} user - User object
 * @returns {string} - Default route path
 */
export const getDefaultRoute = (user) => {
  if (!user) return "/login";
  
  // Admins always go to main dashboard
  if (isAdmin(user)) {
    return "/dashboard";
  }
  
  const normalizedPrivileges = getNormalizedPrivileges(user);
  
  // Priority order for routes
  const routeCandidates = [
    { privilege: 'dashboard', route: '/dashboard' },
    { privilege: 'reception', route: '/reception/dashboard' },
    { privilege: 'payment_center', route: '/payment-center/dashboard' },
    { privilege: 'consultation_room', route: '/consultation-room/dashboard' },
    { privilege: 'optician_center', route: '/optician-center/dashboard' },
    { privilege: 'medicine_center', route: '/medicine-center/dashboard' },
    { privilege: 'procedure_room', route: '/procedure-room/dashboard' },
    { privilege: 'inventory_management', route: '/inventory-management/dashboard' },
    { privilege: 'sales_center', route: '/sales-management/dashboard' },
    { privilege: 'financial_management', route: '/financial-management/dashboard' },
    { privilege: 'user_management', route: '/user-management/users' },
    { privilege: 'settings', route: '/settings/preferences' },
  ];
  
  // Find first route user has access to
  for (const candidate of routeCandidates) {
    if (hasPrivilege({ ...user, privileges: normalizedPrivileges }, candidate.privilege)) {
      return candidate.route;
    }
  }
  
  // Fallback: allow access to dashboard even without privileges
  // This prevents users from being stuck in a login loop
  return "/dashboard";
};
