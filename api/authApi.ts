import { apiClient } from './apiClient';
import notificationService from '@/services/NotificationService';
import { get } from 'lodash';

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  newConfirmPassword: string;
}

export interface UserSession {
  accessToken: string;
  email: string;
  userName: string;
}

export const authApi = {
  async login(loginDto: LoginDto): Promise<void> {
    try {
      const loginResponse = await apiClient.post('/auth/login', loginDto);
      const userSession: UserSession = {
        accessToken: get(loginResponse, 'data.accessToken'),
        email: get(loginResponse, 'data.data.email'),
        userName: get(loginResponse, 'data.data.user_name'),
      };

      localStorage.setItem('userSession', JSON.stringify(userSession));
      notificationService.showSuccessNotification('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      notificationService.showErrorNotification('Login failed. Please check your credentials.');
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    try {
      const changeResponse = await apiClient.put('/auth/reset-password', changePasswordDto);
      console.log('Password changed successfully:', changeResponse);
      notificationService.showSuccessNotification('Your password has been updated.');
    } catch (error) {
      console.error('Password change error:', error);
      notificationService.showErrorNotification('Your password has not been updated.');
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      localStorage.clear();
      notificationService.showSuccessNotification('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      notificationService.showErrorNotification('Logout failed.');
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  clearSession(): void {
    localStorage.clear();
    notificationService.showSuccessNotification('Session cleared.');
  },

  async refreshAccessToken(): Promise<void> {
    try {
      const refreshTokenResponse = await apiClient.post(
        '/auth/refresh-token',
        {},
        {
          withCredentials: true,
        }
      );

      const userSession = authApi.getUserSession();
      if (userSession) {
        userSession.accessToken = get(refreshTokenResponse, 'data.accessToken');
        localStorage.setItem('userSession', JSON.stringify(userSession));
        notificationService.showSuccessNotification('Access token refreshed.');
      } else {
        throw new Error('No user session found.');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      authApi.logout();
      document.location.href = '/auth/login';
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  getUserSession(): UserSession | null {
    const userSession = localStorage.getItem('userSession');
    return userSession ? (JSON.parse(userSession) as UserSession) : null;
  },

  isAuthenticated(): boolean {
    const userSession = authApi.getUserSession();
    return !!userSession?.accessToken;
  },
};
