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
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === HttpStatusCode.Forbidden && !originalRequest._retry) {
      console.log('Unauthorized request');

      await authApi.refreshAccessToken();
      originalRequest._retry = true;
      const accessToken = authApi?.getUserSession()?.accessToken;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      console.log('Retrying request');
      return axios(originalRequest);
    }

    if (error.response.status >= HttpStatusCode.BadRequest) {
      const message = error?.response?.data?.message;

      console.log('Request Error notify', message);
      notificationService.showErrorNotification(
        message || 'An error occurred when processing your request'
      );
    }

    return Promise.reject(error);
  }
);

export { apiClient };
