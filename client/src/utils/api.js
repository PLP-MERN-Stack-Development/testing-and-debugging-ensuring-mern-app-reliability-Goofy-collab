import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          toast.error(data.error || 'Bad request');
          break;
        case 401:
          toast.error('Please login to continue');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('You don\'t have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later');
          break;
        default:
          toast.error(data.error || 'Something went wrong');
      }

      console.error('API Error:', {
        status,
        message: data.error,
        url: error.config.url,
      });
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection');
      console.error('Network error:', error.request);
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;