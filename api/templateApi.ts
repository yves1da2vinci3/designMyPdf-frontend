import { cssframeworkTypes } from '@/utils/enums';
import { apiClient } from './apiClient';

export interface CreateTemplateDto {
  name: string;
  content: string;
  fonts: string[];
  variables: object; // Use object instead of JSON
  NamespaceID: number;
}

export interface UpdateTemplateDto {
  id: number;
  name?: string;
  content?: string;
  fonts?: string[];
  variables?: object;
  NamespaceID?: number;
}

export interface TemplateDTO {
  ID: number;
  name: string;
  framework: string;
  content: string;
  fonts: string[];
  variables: object; // Use object instead of JSON
  NamespaceID: number;
  CreatedAt : string
}

export const templateApi = {
  async createTemplate(template: CreateTemplateDto, namespaceId: number): Promise<TemplateDTO> {
    try {
      const createTemplateResponse = await apiClient.post(`'/templates/${namespaceId}`, template);
      return createTemplateResponse.data.template;
    } catch (error) {
      throw new Error('Error creating template: ' + error);
    }
  },

  async getTemplates(): Promise<TemplateDTO[]> {
    try {
      const getTemplatesResponse = await apiClient.get('/templates');
      return getTemplatesResponse.data.templates;
    } catch (error) {
      throw new Error('Error fetching templates: ' + error);
    }
  },

  async getTemplateById(id: number): Promise<TemplateDTO> {
    try {
      const getTemplateResponse = await apiClient.get(`/templates/${id}`);
      return getTemplateResponse.data.template;
    } catch (error) {
      throw new Error('Error fetching template: ' + error);
    }
  },

  async updateTemplate(id: number, template: UpdateTemplateDto): Promise<TemplateDTO> {
    try {
      const updateTemplateResponse = await apiClient.put(`/templates/${id}`, template);
      return updateTemplateResponse.data.template;
    } catch (error) {
      throw new Error('Error updating template: ' + error);
    }
  },
  async changeTemplateNamespace(id: number, namespaceId: number): Promise<void> {
    try {
      const updateTemplateResponse = await apiClient.put(
        `/templates/${id}/namespace/${namespaceId}`
      );
    } catch (error) {
      throw new Error('Error updating template: ' + error);
    }
  },

  async deleteTemplate(id: number): Promise<void> {
    try {
      await apiClient.delete(`/templates/${id}`);
    } catch (error) {
      throw new Error('Error deleting template: ' + error);
    }
  },
};
