import notificationService from '@/services/NotificationService';
import { apiClient } from './apiClient';
import { KeyDTO } from './keyApi';
import { TemplateDTO } from './templateApi';


interface ResponseBody {
  path :string
}


export interface LogDTO {
  id: number;
  key: KeyDTO;
  template: TemplateDTO;
  called_at: string;
  request_body: object;
  response_body: ResponseBody;
  status_code: number;
  error_message?: string;
}
export interface LogStatDTO {
  date: string;
  count: number;
}

export const logApi = {
  async getLogs(): Promise<LogDTO[]> {
    try {
      const getKeysResponse = await apiClient.get('/logs');
      return getKeysResponse.data.logs;
    } catch (error) {
      throw new Error('Error fetching keys:' + error);
    }
  },
  async getLogsStats(): Promise<LogStatDTO[]> {
    try {
      const getKeysResponse = await apiClient.get('/logs/stats');
      return getKeysResponse.data.stats;
    } catch (error) {
      throw new Error('Error fetching keys:' + error);
    }
  },
};
