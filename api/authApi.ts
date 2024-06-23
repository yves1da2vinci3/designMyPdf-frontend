import { apiClient } from './apiClient';
import notificationService from '@/services/NotificationService';
import { get } from 'lodash';

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

      localStorage.setItem('userSession', JSON.stringify(userSession));
      notificationService.showSuccessNotification('Login successful');
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
  async ForgotPassword(forgotPasswordDTO: ForgotPasswordDto): Promise<void> {
    try {
      const ForgotResponse = await apiClient.post('/auth/forgot-password', forgotPasswordDTO);
      notificationService.showSuccessNotification('an email has been sent to your email');
    } catch (error) {
      console.error('Password change error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {
        refreshToken: this.getUserSession()?.refreshToken,
      });
      localStorage.clear();
      notificationService.showSuccessNotification('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },
  async Signup(signupDTO: SignupDto): Promise<void> {
    try {
      await apiClient.post('/auth/register', signupDTO);
      notificationService.showSuccessNotification('register successful');
    } catch (error) {
      throw error; // Rethrow the error to propagate it further if needed
    }
  },
  async update(updateDTO: updateUserDTO): Promise<void> {
    try {
      const updateResponse = await apiClient.put('/auth/update', updateDTO);
      const userName = get(updateResponse, 'data.data.user_name');
      localStorage.setItem('userSession', JSON.stringify({ ...this.getUserSession(), userName }));
      notificationService.showSuccessNotification('user successful');
    } catch (error) {
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  clearSession(): void {
    localStorage.clear();
    notificationService.showSuccessNotification('Session cleared.');
  },

  async refreshAccessToken(): Promise<void> {
    try {
      const refreshTokenResponse = await apiClient.post('/auth/refresh-token', {
        refreshToken: this.getUserSession()?.refreshToken,
      });

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
