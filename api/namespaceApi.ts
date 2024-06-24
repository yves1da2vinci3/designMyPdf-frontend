import notificationService from '@/services/NotificationService';
import { apiClient } from './apiClient';

export interface CreateNamespaceDto {
  name: string;
}

export interface UpdateNamespaceDto {
  name: string;
}

export interface NamespaceDTO {
  ID: number;
  name: string;
  templates: any[];
}

export const namespaceApi = {
  async createNamespace(namespace: CreateNamespaceDto): Promise<NamespaceDTO> {
    try {
      const nameResponse = await apiClient.post('/namespaces', namespace);
      notificationService.showSuccessNotification('Namespace has been created.');
      return nameResponse.data.namespace;
    } catch (error) {
      console.error('Namespace creation error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async updateNamespace(namespace: UpdateNamespaceDto, id: number): Promise<void> {
    try {
      const nameResponse = await apiClient.put(`/namespaces/${id}`, namespace);
      notificationService.showSuccessNotification('Namespace has been updated.');
    } catch (error) {
      console.error('Namespace update error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async deleteNamespace(id: number): Promise<void> {
    try {
      const nameResponse = await apiClient.delete(`/namespaces/${id}`);
      notificationService.showSuccessNotification('Namespace has been deleted.');
    } catch (error) {
      console.error('Namespace delete error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },

  async getNamespaces(): Promise<NamespaceDTO[]> {
    try {
      const nameResponse = await apiClient.get(`/namespaces/`);
      return nameResponse.data.namepsaces;
    } catch (error) {
      console.error('Namespace fetch error:', error);
      throw error; // Rethrow the error to propagate it further if needed
    }
  },
};
