import notificationService from '@/services/NotificationService';
import { apiClient } from './apiClient';

export interface CreateKeyDto {
  name: string;
  key_count: number;
}
export interface UpdateKeyDto {
  name?: string;
  key_count?: string;
}

export interface KeyDTO {
  id: number;
  name: string;
  value: string;
  key: string;
  key_count: number;
  key_count_used: number;
  created_at: string;
}

export const keyApi = {
  async createKey(key: CreateKeyDto): Promise<KeyDTO> {
    try {
      const keyResponse = await apiClient.post('/keys', {
        ...key,
        key_count: Number(key.key_count),
      });
      notificationService.showSuccessNotification('key has been created.');
      return keyResponse.data.key;
    } catch (error) {
      console.error('key creation error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async updateKey(key: UpdateKeyDto, id: number): Promise<KeyDTO> {
    try {
      const keyResponse = await apiClient.put(`/keys/${id}`, {
        ...key,
        key_count: Number(key.key_count),
      });
      notificationService.showSuccessNotification('key has been updated.');
      return keyResponse.data.key;
    } catch (error) {
      console.error('key update error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },
  async deleteKey(id: number): Promise<KeyDTO> {
    try {
      const keyResponse = await apiClient.delete(`/keys/${id}`);
      notificationService.showSuccessNotification('key has been deleted.');
      return keyResponse.data.key;
    } catch (error) {
      console.error('key delete error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },
  async getKeys(): Promise<KeyDTO[]> {
    try {
      const getKeysResponse = await apiClient.get('/keys');
      return getKeysResponse.data.keys;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  },
};
