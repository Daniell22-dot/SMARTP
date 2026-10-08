import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearToken } from './auth-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  // The first DB connect after startup can take ~10s; don't give up on the
  // request before the server does.
  timeout: 60000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: <T>(url: string, config?: object) => api.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, data?: object, config?: object) => api.post<T>(url, data, config).then((r) => r.data),
  put: <T>(url: string, data?: object, config?: object) => api.put<T>(url, data, config).then((r) => r.data),
  patch: <T>(url: string, data?: object, config?: object) => api.patch<T>(url, data, config).then((r) => r.data),
  delete: <T>(url: string, config?: object) => api.delete<T>(url, config).then((r) => r.data),
};

export default api;