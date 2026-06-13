import notificationService from '@/services/NotificationService';
import { ensureArray } from '@/utils/ensureArray';
import { apiClient } from './apiClient';

export interface WebhookKeyDTO {
  subscription_id: string;
  key_id: number;
}

export interface WebhookDTO {
  id: string;
  webhook_uri: string;
  is_active: boolean;
  event_names: string[];
  extra_headers: Record<string, string>;
  created_at: string;
  updated_at: string;
  keys: WebhookKeyDTO[];
  last_delivery_status?: number;
  last_delivery_at?: string;
}

export interface CreateWebhookDto {
  webhook_uri: string;
  event_names: string[];
  extra_headers?: Record<string, string>;
  key_ids?: number[];
}

export interface UpdateWebhookDto {
  webhook_uri?: string;
  event_names?: string[];
  extra_headers?: Record<string, string>;
  key_ids?: number[];
  is_active?: boolean;
  regenerate_secret?: boolean;
}

export interface DeliveryAttemptDTO {
  id: string;
  webhook_event_id: string;
  subscription_id: string;
  http_status: number;
  response_snippet: string;
  error: string;
  attempt_no: number;
  created_at: string;
  event_name: string;
  payload_json: string;
}

function parseEventNames(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeSubscription(s: Record<string, unknown>): WebhookDTO {
  return {
    ...(s as unknown as WebhookDTO),
    event_names: parseEventNames(s.event_names),
    extra_headers:
      typeof s.extra_headers === 'string'
        ? JSON.parse(s.extra_headers || '{}')
        : ((s.extra_headers as Record<string, string>) ?? {}),
    keys: ensureArray(s.keys as WebhookKeyDTO[]),
  };
}

export const webhookApi = {
  async getEventDefinitions(): Promise<string[]> {
    const res = await apiClient.get('/webhook-events/definitions');
    return ensureArray(res.data.events);
  },

  async getSubscriptions(): Promise<WebhookDTO[]> {
    const res = await apiClient.get('/webhook-subscriptions');
    return ensureArray<Record<string, unknown>>(res.data.subscriptions).map(normalizeSubscription);
  },

  async getSubscription(id: string): Promise<WebhookDTO> {
    const res = await apiClient.get(`/webhook-subscriptions/${id}`);
    return normalizeSubscription(res.data.subscription ?? res.data);
  },

  async createSubscription(
    dto: CreateWebhookDto,
  ): Promise<{ subscription: WebhookDTO; secret: string }> {
    const res = await apiClient.post('/webhook-subscriptions', dto);
    notificationService.showSuccessNotification('Webhook subscription created.');
    return {
      subscription: normalizeSubscription(res.data.subscription),
      secret: res.data.secret ?? '',
    };
  },

  async updateSubscription(
    id: string,
    dto: UpdateWebhookDto,
  ): Promise<{ subscription: WebhookDTO; secret?: string }> {
    const res = await apiClient.patch(`/webhook-subscriptions/${id}`, dto);
    notificationService.showSuccessNotification('Webhook subscription updated.');
    return {
      subscription: normalizeSubscription(res.data.subscription),
      secret: res.data.secret,
    };
  },

  async deleteSubscription(id: string): Promise<void> {
    await apiClient.delete(`/webhook-subscriptions/${id}`);
    notificationService.showSuccessNotification('Webhook subscription deleted.');
  },

  async getDeliveries(id: string): Promise<{ attempts: DeliveryAttemptDTO[]; total: number }> {
    const res = await apiClient.get(`/webhook-subscriptions/${id}/deliveries`);
    return { attempts: ensureArray(res.data.attempts), total: res.data.total ?? 0 };
  },
};
