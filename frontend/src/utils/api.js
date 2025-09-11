import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Create axios instance
const api = axios.create({
  baseURL: 'https://mindgarden-backend.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common response patterns
api.interceptors.response.use(
  (response) => {
    // Handle empty data responses
    if (response.data === '' || (response.data && Object.keys(response.data).length === 0)) {
      // Return a default empty object for empty responses
      return { ...response, data: {} };
    }
    return response;
  },
  (error) => {
    // Don't show error for 404s or empty responses
    if (error.response?.status === 404) {
      return Promise.resolve({ data: {} });
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({ ...error, message: 'Network error. Please check your connection.' });
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return Promise.reject({ ...error, message: errorMessage });
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
      } else if (error.response.status === 403) {
        // Forbidden - user doesn't have permission
        toast.error('You do not have permission to perform this action.');
      } else if (error.response.status >= 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
