import axios, { HttpStatusCode } from 'axios';
import { authApi } from './authApi';
import notificationService from '@/services/NotificationService';
import { AppConfig } from '@/utils/appConfig';

const apiClient = axios.create({
  baseURL: AppConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= HttpStatusCode.Ok && status < HttpStatusCode.BadRequest,
});

apiClient.interceptors.request.use(
  async (config) => {
    if (authApi.isAuthenticated()) {
      const accessToken = authApi.getUserSession()?.accessToken;
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an unauthorized request
    if (error.response && error.response.status === HttpStatusCode.Unauthorized && !originalRequest._retry) {
      console.log('Unauthorized request');

      originalRequest._retry = true; // Mark the request as retried to prevent infinite loops

      try {
        await authApi.refreshAccessToken();
        const accessToken = authApi.getUserSession()?.accessToken;
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('Retrying request');
          return axios(originalRequest);
        } else {
          throw new Error('No access token available after refresh');
        }
      } catch (refreshError) {
        console.error('Error refreshing access token:', refreshError);
        authApi.logout();
        notificationService.showErrorNotification('Your session has expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response && error.response.status >= HttpStatusCode.BadRequest) {
      const message =
        error.response.data?.error || 'An error occurred when processing your request';
      console.log('Request Error notify:', message);
      notificationService.showErrorNotification(message);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
