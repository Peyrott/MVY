const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  const token = localStorage.getItem('sb-access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

/**
 * HTTP methods
 */
export const api = {
  /**
   * GET request
   * @param {string} endpoint
   * @param {Object} params
   * @returns {Promise<any>}
   */
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return fetchApi(url, { method: 'GET' });
  },

  /**
   * POST request
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<any>}
   */
  post: (endpoint, data) => {
    return fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * PUT request
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<any>}
   */
  put: (endpoint, data) => {
    return fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  /**
   * PATCH request
   * @param {string} endpoint
   * @param {Object} data
   * @returns {Promise<any>}
   */
  patch: (endpoint, data) => {
    return fetchApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * DELETE request
   * @param {string} endpoint
   * @returns {Promise<any>}
   */
  delete: (endpoint) => {
    return fetchApi(endpoint, { method: 'DELETE' });
  }
};

export default api;
