import axios from 'axios';
import { BASE_URL, ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && token !== 'undefined' && token !== 'null' && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest?.url?.includes('/login') ||
      originalRequest?.url?.includes('/register') ||
      originalRequest?.url?.includes('/otp');


    if (
      error.response &&
      error.response.status === 401 &&
      !isAuthRequest
    ) {
      console.warn(
        'Backend rejected authorization token. Clearing local state data...',
      );
      useAuthStore.getState().logout();
      if (window.location.pathname !== ROUTES.LOGIN_INIT) {
        window.location.href = ROUTES.LOGIN_INIT;
      }
    }

    return Promise.reject(error);
  },
);
