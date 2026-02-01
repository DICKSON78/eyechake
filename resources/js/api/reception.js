/**
 * API functions for reception module
 */

/**
 * Fetch dashboard metrics for reception
 * @returns {Promise<{sentToDoctor: number, waiting: number, served: number}>}
 */
export const fetchDashboardMetrics = async () => {
  try {
    const response = await window.axios.get('/api/reception/dashboard-metrics');
    return response.data.data || { sentToDoctor: 0, waiting: 0, served: 0 };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return { sentToDoctor: 0, waiting: 0, served: 0 };
  }
};

