'use client';

import { get } from 'lodash';
import { apiClient } from './apiClient';
import notificationService from '@/services/NotificationService';

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupDto {
  email: string;
  password: string;
  userName: string;
}

export interface updateUserDTO {
  userName?: string;
  password?: string;
}

export interface ChangePasswordDto {
  password: string;
  token: string;
}

export interface ResetPasswordDto {
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  email: string;
  userName: string;
}

export const authApi = {
  async login(loginDto: LoginDto): Promise<void> {
    try {
      const loginResponse = await apiClient.post('/auth/login', loginDto);
      console.log('login Response : ', loginResponse);
      const userSession: UserSession = {
        accessToken: get(loginResponse, 'data.accessToken'),
        refreshToken: get(loginResponse, 'data.refreshToken'),
        email: get(loginResponse, 'data.data.email'),
        userName: get(loginResponse, 'data.data.user_name'),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('userSession', JSON.stringify(userSession));
        notificationService.showSuccessNotification('Login successful');
      }
    } catch (error) {
      console.error('Login error:', error);
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

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDto): Promise<void> {
    try {
      const forgotResponse = await apiClient.post('/auth/forgot-password', forgotPasswordDTO);
      notificationService.showSuccessNotification('An email has been sent to your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {
        refreshToken: this.getUserSession()?.refreshToken,
      });

      if (typeof window !== 'undefined') {
        localStorage.clear();
        notificationService.showSuccessNotification('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async signup(signupDTO: SignupDto): Promise<void> {
    try {
      await apiClient.post('/auth/register', signupDTO);
      notificationService.showSuccessNotification('Register successful');
    } catch (error) {
      console.error('Signup error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async update(updateDTO: updateUserDTO): Promise<void> {
    try {
      const updateResponse = await apiClient.put('/auth/update', updateDTO);
      const userName = get(updateResponse, 'data.data.user_name');

      if (typeof window !== 'undefined') {
        const userSession = this.getUserSession();
        if (userSession) {
          userSession.userName = userName;
          localStorage.setItem('userSession', JSON.stringify(userSession));
        }
        notificationService.showSuccessNotification('User update successful');
      }
    } catch (error) {
      console.error('User update error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      notificationService.showSuccessNotification('Session cleared.');
    }
  },

  async refreshAccessToken(): Promise<void> {
    try {
      const refreshTokenResponse = await apiClient.post('/auth/refresh-token', {
        refreshToken: this.getUserSession()?.refreshToken,
      });

      if (typeof window !== 'undefined') {
        const userSession = this.getUserSession();
        if (userSession) {
          userSession.accessToken = get(refreshTokenResponse, 'data.accessToken');
          localStorage.setItem('userSession', JSON.stringify(userSession));
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearSession();
      document.location.href = '/login';
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  getUserSession(): UserSession | null {
    if (typeof window !== 'undefined') {
      const userSession = localStorage.getItem('userSession');
      return userSession ? (JSON.parse(userSession) as UserSession) : null;
    }
    return null;
  },

  isAuthenticated(): boolean {
    const userSession = this.getUserSession();
    return !!userSession?.accessToken;
  },
};
