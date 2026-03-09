import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import notificationEvents from '../utils/notificationEvents';
import { useNotificationRefresh } from '../hooks/useNotificationRefresh';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    patients_sent_to_cashier: 0,
    credit_patients_approval: 0,
    patients_sent_to_doctor: 0,
    patients_sent_to_optician: 0,
    glass_patients: 0,
    dispensing_requests: 0,
    procedure_requests: 0,
    other_dispensing_requests: 0,
    patients_to_return: 0,
    glass_dispensing_requests: 0,
    vip_patients: 0,
    spectacle_patients: 0,
    waiting_patients: 0,
    patients_sent_to_sales: 0,
    website_appointments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentParams, setCurrentParams] = useState({});
  // Keep previous snapshot to avoid abrupt zeroing
  const [previousNotifications, setPreviousNotifications] = useState(null);
  // Stabilization window per key to prevent flicker right after actions
  const [stabilizeUntil, setStabilizeUntil] = useState({}); // { key: timestampMs }
  // Require two consecutive zeros before clearing a badge
  const [zeroStreak, setZeroStreak] = useState({}); // { key: count }
  // Prevent server from overwriting page-driven updates for a short time
  const [stickyUntil, setStickyUntil] = useState({}); // { key: timestampMs }
  // Hard locks per key while on a page
  const [lockedKeys, setLockedKeys] = useState({}); // { key: true }

  // Use notification refresh hook
  useNotificationRefresh(() => {
    console.log('Notification refresh triggered from context');
    fetchNotifications(currentParams);
  });

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      console.log('NotificationContext: Starting to fetch notifications...');
      setLoading(true);
      setCurrentParams(params);
      
      // Check if user is authenticated before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('NotificationContext: No token found, skipping fetch');
        setLoading(false);
        return null;
      }
      
      // Use the globally configured axios instance (with auth/interceptors)
      // Ensure axios is available and properly initialized before making the request
      if (!window.axios) {
        console.error('NotificationContext: axios is not available');
        setLoading(false);
        return null;
      }
      
      // Check if axios methods are available
      if (typeof window.axios.get !== 'function') {
        console.error('NotificationContext: axios.get is not a function. Axios may not be properly initialized.');
        setLoading(false);
        return null;
      }
      
      console.log('NotificationContext: Making API call to /api/notifications');
      
      // Create a safe axios call with proper error handling
      // Use the exact same pattern as other hooks - normalize the URI and use params
      const normalizedUri = 'api/notifications'.replace(/^\/+/, '');
      let response;
      try {
        response = await window.axios.get('/' + normalizedUri, {
          params: {},
        });
      } catch (axiosError) {
        // Handle axios errors - check if it's a response error or a network/configuration error
        if (axiosError.response) {
          // Response was received but status code is out of 2xx range
          response = axiosError.response;
        } else if (axiosError.request) {
          // Request was made but no response received
          console.error('NotificationContext: No response received:', axiosError);
          setLoading(false);
          return null;
        } else {
          // Something else happened (likely axios configuration issue)
          console.error('NotificationContext: Axios configuration error:', axiosError.message);
          setLoading(false);
          return null;
        }
      }
      console.log('NotificationContext: API response received:', response);
      
      // Check if response is HTML (error page) instead of JSON
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
        console.error('NotificationContext: Received HTML instead of JSON - likely authentication error');
        setLoading(false);
        return null;
      }
      
      // Check for error status codes
      if (response.status >= 400) {
        console.error('NotificationContext: API returned error status:', response.status);
        setLoading(false);
        return null;
      }
      
      if (response.data && response.data.data) {
        const serverData = response.data.data;
        console.log('Fetched notifications:', serverData);
        
        // Ensure all required keys exist with default values
        const defaultNotifications = {
          patients_sent_to_cashier: 0,
          credit_patients_approval: 0,
          patients_sent_to_doctor: 0,
          patients_sent_to_optician: 0,
          glass_patients: 0,
          dispensing_requests: 0,
          procedure_requests: 0,
          other_dispensing_requests: 0,
          patients_to_return: 0,
          glass_dispensing_requests: 0,
          vip_patients: 0,
          spectacle_patients: 0,
          waiting_patients: 0,
          patients_sent_to_sales: 0,
          website_appointments: 0,
        };
        
        // Merge server data with defaults to ensure all keys exist
        const mergedServerData = { ...defaultNotifications, ...serverData };
        
        // Set notifications with stabilization to prevent flickering
        setNotifications(prev => {
          // Only update if the data has actually changed
          const hasChanged = !prev || Object.keys(mergedServerData).some(key => 
            prev[key] !== mergedServerData[key]
          );
          
          if (hasChanged) {
            console.log('Notifications updated:', { prev, serverData: mergedServerData });
            setPreviousNotifications(prev);
            // If certain keys are locked, preserve current values for those keys
            const finalData = { ...mergedServerData };
            Object.keys(lockedKeys || {}).forEach((key) => {
              if (lockedKeys[key] && prev && typeof prev[key] !== 'undefined') {
                finalData[key] = prev[key];
              }
            });
            return finalData;
          }
          return prev;
        });
        
        return mergedServerData;
      }
    } catch (error) {
      console.error('NotificationContext: Failed to fetch notifications:', error);
      
      // Check if error response is HTML (error page)
      if (error.response && typeof error.response.data === 'string' && error.response.data.trim().startsWith('<!DOCTYPE')) {
        console.error('NotificationContext: Received HTML error page - likely authentication or routing issue');
      } else {
        console.error('NotificationContext: Error details:', error.response?.data || error.message);
      }
      
      // Set default values on error to prevent undefined state
      setNotifications({
        patients_sent_to_cashier: 0,
        credit_patients_approval: 0,
        patients_sent_to_doctor: 0,
        patients_sent_to_optician: 0,
        glass_patients: 0,
        dispensing_requests: 0,
        procedure_requests: 0,
        other_dispensing_requests: 0,
        patients_to_return: 0,
        glass_dispensing_requests: 0,
        vip_patients: 0,
        spectacle_patients: 0,
        waiting_patients: 0,
        patients_sent_to_sales: 0,
        website_appointments: 0,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [lockedKeys]);

  const refreshNotifications = useCallback(() => {
    // Defer by one tick to allow pages to lock keys first
    return new Promise((resolve) => {
      setTimeout(() => resolve(fetchNotifications(currentParams)), 0);
    });
  }, [fetchNotifications, currentParams]);

  // Immediate notification refresh for critical updates
  const refreshNotificationsImmediately = useCallback(() => {
    console.log('Immediate notification refresh triggered');
    // Clear any cached data to force fresh fetch
    const cacheKey = 'notifications_' + (window.user?.id || 'default');
    try {
      if (window.cache && typeof window.cache.delete === 'function') {
        window.cache.delete(cacheKey);
      }
    } catch (e) {
      // Ignore cache errors
    }
    // Fetch immediately without params to get fresh data
    return fetchNotifications({});
  }, [fetchNotifications]);

  // One-time initial fetch for basic notifications
  useEffect(() => {
    // Check if user is authenticated before fetching notifications
    const token = localStorage.getItem('token');
    const user = window.user; // Get user from window object set by Default layout
    if (token && user && user.privileges) {
      console.log('NotificationContext: User authenticated, fetching notifications...');
      fetchNotifications({});
    } else {
      console.log('NotificationContext: User not authenticated or no privileges, skipping fetch');
      setLoading(false);
    }
    // Expose events globally so layouts can trigger refresh on auth ready
    window.notificationEvents = notificationEvents;
  }, []); // Empty dependency array - run only once

  // WebSocket listener for real-time notifications (replaces polling)
  useEffect(() => {
    // Check if Echo is available
    if (!window.Echo) {
      console.warn('Echo not initialized, WebSocket notifications disabled');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('NotificationContext: No token, skipping WebSocket subscription');
      return;
    }

    console.log('NotificationContext: Subscribing to notification channel via WebSocket...');
    
    const channel = window.Echo.channel('notifications')
      .listen('.notification.update', (data) => {
        console.log('✅ Notification update received via WebSocket:', data);
        // Fetch fresh notifications when broadcast is received
        fetchNotifications({});
      });

    return () => {
      console.log('NotificationContext: Unsubscribing from notification channel');
      try {
        window.Echo.leave('notifications');
      } catch (e) {
        console.warn('Error leaving notification channel:', e);
      }
    };
  }, [fetchNotifications]);

  // Fallback polling (only if WebSocket unavailable) - much less frequent
  useEffect(() => {
    // Only use polling as fallback if Echo is not available
    if (window.Echo) {
      console.log('NotificationContext: WebSocket active, polling disabled');
      return;
    }

    console.log('NotificationContext: WebSocket unavailable, using fallback polling');
    
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    let pollCount = 0;
    const pollInterval = 30000; // Poll every 30 seconds as fallback (instead of 2 seconds)

    const pollNotifications = () => {
      if (!loading) {
        console.log(`NotificationContext: Fallback polling (attempt ${pollCount + 1})`);
        fetchNotifications({})
          .then(() => {
            pollCount++;
          })
          .catch((error) => {
            console.warn('NotificationContext: Fallback polling failed:', error);
          });
      }
    };

    // Initial poll
    pollNotifications();

    // Set up polling interval
    const intervalId = setInterval(pollNotifications, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchNotifications, loading]);

  // Listen to notification refresh events with improved debouncing and immediate response
  useEffect(() => {
    let timeoutId;
    let immediateTimeoutId;
    let lastFetchTime = 0;
    const MIN_FETCH_INTERVAL = 500; // Reduced to 500ms for more responsive updates
    
    const unsubscribe = notificationEvents.subscribe(() => {
      console.log('NotificationContext: Event-triggered refresh received');

      // Clear any pending timeouts
      clearTimeout(timeoutId);
      clearTimeout(immediateTimeoutId);

        const now = Date.now();

      // For immediate response to user actions, trigger quickly
        if (now - lastFetchTime >= MIN_FETCH_INTERVAL && !loading) {
          lastFetchTime = now;
        console.log('NotificationContext: Triggering immediate notification refresh');
        // Immediate refresh for user-triggered events
        immediateTimeoutId = setTimeout(() => {
          refreshNotifications();
        }, 100); // Very short delay for immediate feel

        // Follow-up refresh to ensure consistency
        timeoutId = setTimeout(() => {
          if (!loading) {
            console.log('NotificationContext: Triggering follow-up notification refresh');
            refreshNotifications();
          }
        }, 2000); // Follow-up after 2 seconds
      } else {
        // If too soon since last fetch, queue it for later
        timeoutId = setTimeout(() => {
          if (!loading) {
            console.log('NotificationContext: Triggering queued notification refresh');
            refreshNotifications();
          }
        }, MIN_FETCH_INTERVAL - (now - lastFetchTime));
      }
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(immediateTimeoutId);
      unsubscribe();
    };
  }, [refreshNotifications, loading]);

  // Listen for authentication changes and fetch notifications when user logs in
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue) {
        console.log('NotificationContext: Token detected, fetching notifications...');
        fetchNotifications({});
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes within the same tab
    const checkToken = () => {
      const token = localStorage.getItem('token');
      // Only fetch if we have a token and notifications are empty or all zeros
      // Also add a flag to prevent multiple simultaneous requests
      if (token && (!notifications || Object.values(notifications).every(v => v === 0))) {
        // Check if we're already loading to prevent duplicate requests
        if (!loading) {
          console.log('NotificationContext: Token found, fetching notifications...');
          fetchNotifications({});
        }
      }
    };

    // Check every 10 seconds for token changes (reduced from 2 seconds to prevent spam)
    const interval = setInterval(checkToken, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [fetchNotifications, notifications]);

  const setNotificationField = useCallback((key, value, ttlMs = 0) => {
    // Only update if the value has actually changed to prevent flickering
    setNotifications((prev) => {
      if (prev && prev[key] === value) {
        return prev;
      }
      return { ...(prev || {}), [key]: value };
    });
  }, []);

  // Expose lock/unlock functions for pages
  const lockNotificationKey = useCallback((key) => {
    setLockedKeys((prev) => ({ ...prev, [key]: true }));
  }, []);

  const unlockNotificationKey = useCallback((key) => {
    setLockedKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = {
    notifications,
    loading,
    fetchNotifications,
    refreshNotifications,
    refreshNotificationsImmediately,
    setNotificationField,
    lockNotificationKey,
    unlockNotificationKey
  };

  // Expose refresh function globally for debugging and manual refresh
  useEffect(() => {
    window.refreshNotifications = () => {
      console.log('Manual notification refresh triggered');
      return refreshNotifications();
    };
    window.forceNotificationRefresh = () => {
      console.log('Force notification refresh triggered - bypassing loading check');
      return fetchNotifications({});
    };
    window.debugNotifications = () => {
      console.log('Current notifications:', notifications);
      console.log('Loading:', loading);
      console.log('Last fetch params:', currentParams);
      return { notifications, loading, currentParams };
    };
  }, [refreshNotifications, fetchNotifications, notifications, loading, currentParams]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};