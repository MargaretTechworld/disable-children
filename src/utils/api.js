import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  withCredentials: true, // This is important for cookies to be sent
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    
    // Ensure credentials are included
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('API Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      // You might want to show a network error message to the user
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('API Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      // Clear any invalid tokens
      localStorage.removeItem('token');
      // You might want to redirect to login page here
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
