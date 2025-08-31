import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.error || 'Invalid request. Please check your input.');
        case 401:
          throw new Error(data.error || 'Authentication failed. Please check your API key.');
        case 429:
          throw new Error(data.error || 'Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error(data.error || 'Server error. Please try again later.');
        default:
          throw new Error(data.error || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

/**
 * Adjust the tone of text using the Mistral AI API
 * @param {string} text - The text to adjust
 * @param {number} x - X coordinate in the tone matrix (0-2)
 * @param {number} y - Y coordinate in the tone matrix (0-2)
 * @returns {Promise<Object>} - The adjusted text and tone information
 */
export const adjustTone = async (text, x, y) => {
  try {
    const response = await api.post('/adjust-tone', {
      text: text.trim(),
      x: parseInt(x),
      y: parseInt(y)
    });

    return response.data;
  } catch (error) {
    // Re-throw the error with more context
    throw new Error(`Failed to adjust tone: ${error.message}`);
  }
};

/**
 * Check the health status of the API
 * @returns {Promise<Object>} - Health status information
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }
};

/**
 * Test the API connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
export const testConnection = async () => {
  try {
    await checkHealth();
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default api;
