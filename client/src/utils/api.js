// client/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
    if (import.meta.env.DEV) {
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
    if (import.meta.env.DEV) {
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
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('Bad request:', data.error);
          break;
        case 401:
          console.error('Unauthorized. Please login.');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden:', data.error);
          break;
        case 404:
          console.error('Not found:', data.error);
          break;
        case 500:
          console.error('Server error:', data.error);
          break;
        default:
          console.error('Error:', data.error || 'Something went wrong');
      }
    } else if (error.request) {
      console.error('Network error. Please check your connection');
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;