// /lib/apiClient.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let logoutHandler: () => void = () => { };

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
