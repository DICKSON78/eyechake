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
  
  // Admins always have access
  if (isAdmin(user)) {
    return true;
  }
  
  // Check privileges object
  const privileges = user.privileges || {};
  
  // Handle string privileges (if backend sends as JSON string)
  let normalizedPrivileges = privileges;
  if (typeof privileges === "string") {
    try {
      normalizedPrivileges = JSON.parse(privileges);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[hasPrivilege] Failed to parse privileges string:`, e);
      }
      normalizedPrivileges = {};
    }
  }
  
  // Handle array format (if backend sends as array)
  if (Array.isArray(normalizedPrivileges)) {
    const arrayPrivileges = {};
    normalizedPrivileges.forEach(priv => {
      arrayPrivileges[priv] = true;
    });
    normalizedPrivileges = arrayPrivileges;
  }
  
  const privilegeValue = normalizedPrivileges[privilegeKey];
  let granted = isPrivilegeGranted(privilegeValue);

  if (!granted) {
    const aliases = {
      sales_center: ['sales'],
      sales: ['sales_center'],
      user_management: ['employee_management'],
      employee_management: ['user_management'],
    };

    const aliasKeys = aliases[privilegeKey] || [];
    for (const aliasKey of aliasKeys) {
      if (isPrivilegeGranted(normalizedPrivileges[aliasKey])) {
        granted = true;
        break;
      }
    }
  }
  
  // Debug logging (always log for debugging privilege issues)
  if (!granted) {
    console.log(`[hasPrivilege] Access denied for ${privilegeKey}:`, {
      user: user.username || user.id,
      privilegeValue,
      normalizedPrivileges,
      privilegesType: typeof privileges,
      isAdmin: isAdmin(user)
    });
  } else {
    console.log(`[hasPrivilege] Access granted for ${privilegeKey}:`, {
      user: user.username || user.id,
      privilegeValue,
      isAdmin: isAdmin(user)
    });
  }
  
  return granted;
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
  
  const privileges = user.privileges || {};
  
  // Handle string privileges
  let normalizedPrivileges = privileges;
  if (typeof privileges === "string") {
    try {
      normalizedPrivileges = JSON.parse(privileges);
    } catch (e) {
      normalizedPrivileges = {};
    }
  }
  
  // Check parent privilege OR specific report privilege
  const hasParent = (() => {
    if (isPrivilegeGranted(normalizedPrivileges[parentPrivilege])) return true;
    const aliases = {
      sales_center: ['sales'],
      sales: ['sales_center'],
      user_management: ['employee_management'],
      employee_management: ['user_management'],
    };
    const aliasKeys = aliases[parentPrivilege] || [];
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
  
  const privileges = user.privileges || {};
  
  // Handle string privileges
  let normalizedPrivileges = privileges;
  if (typeof privileges === "string") {
    try {
      normalizedPrivileges = JSON.parse(privileges);
    } catch (e) {
      normalizedPrivileges = {};
    }
  }
  
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
    { privilege: 'sales', route: '/sales-center/dashboard' },
    { privilege: 'marketing', route: '/marketing/dashboard' },
    { privilege: 'financial_management', route: '/financial-management/dashboard' },
    { privilege: 'user_management', route: '/user-management/users' },
    { privilege: 'settings', route: '/settings/preferences' },
  ];
  
  // Find first route user has access to
  for (const candidate of routeCandidates) {
    if (hasPrivilege(user, candidate.privilege)) {
      return candidate.route;
    }
  }
  
  // Fallback: allow access to dashboard even without privileges
  // This prevents users from being stuck in a login loop
  return "/dashboard";
};
