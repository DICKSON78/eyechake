/**
 * API functions for patients module
 */

/**
 * Fetch returning patients
 * @returns {Promise<{data: Array}>}
 */
export const fetchReturningPatients = async () => {
  try {
    const response = await window.axios.get('/api/patients/returning');
    return response.data || { data: [] };
  } catch (error) {
    console.error('Error fetching returning patients:', error);
    return { data: [] };
  }
};

