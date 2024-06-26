import { cssframeworkTypes } from '@/utils/enums';
import { apiClient } from './apiClient';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import notificationService from '@/services/NotificationService';

const defaultVariables = {
  fromCompany: {
    name: 'Example Corp',
    street: '123 Main St',
    city: 'Example City',
    country: 'Example Country',
    zip: '12345',
  },
  toCompany: {
    name: 'Client Corp',
    street: '456 Client St',
    city: 'Client City',
    country: 'Client Country',
    zip: '67890',
  },
  invoiceNumber: 'INV-12345',
  issueDate: '2024-06-10',
  dueDate: '2024-06-24',
  items: [
    { name: 'Service A', quantity: 10, taxes: 5, price: 100 },
    { name: 'Service B', quantity: 5, taxes: 2, price: 50 },
  ],
  prices: {
    subtotal: 150,
    discount: 10,
    taxes: 7,
    total: 147,
  },
  showTerms: true,
};
export interface CreateTemplateDto {
  name: string;
}

export interface UpdateTemplateDto {
  name?: string;
  content?: string;
  fonts?: string[];
  variables?: object;
  framework?: string;
  NamespaceID?: number;
}

export interface TemplateDTO {
  ID: number;
  name: string;
  uuid: string;
  framework: string;
  content: string;
  fonts: string[];
  variables: object; // Use object instead of JSON
  NamespaceID: number;
  CreatedAt: string;
}

export const templateApi = {
  async createTemplate(templateName: string, namespaceId: number): Promise<TemplateDTO> {
    const template = {
      name: templateName,
      content: DEFAULT_TEMPLATE,
      fonts: ['Montserrat'],
      variables: defaultVariables,
      NamespaceID: namespaceId,
      framework: 'tailwind',
    };
    try {
      const createTemplateResponse = await apiClient.post(`/templates/${namespaceId}`, template);
      notificationService.showSuccessNotification('Template created successfully');
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

  async getTemplateById(id: string): Promise<TemplateDTO> {
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
      notificationService.showSuccessNotification('Template updated successfully');
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
      notificationService.showSuccessNotification('template emplacement change successful');
    } catch (error) {
      throw new Error('Error updating template: ' + error);
    }
  },

  async deleteTemplate(id: number): Promise<void> {
    try {
      await apiClient.delete(`/templates/${id}`);
      notificationService.showSuccessNotification('Template deleted successfully');
    } catch (error) {
      throw new Error('Error deleting template: ' + error);
    }
  },
};
