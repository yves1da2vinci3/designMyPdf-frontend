import { Webhook } from '../types/webhook';

// Données factices pour la démonstration
const dummyWebhook: Webhook = {
  id: '1',
  userId: 'user123',
  url: 'https://api.example.com/webhook',
  createdAt: new Date(),
};

export const webhookService = {
  getWebhook: async (userId: string): Promise<Webhook | null> => {
    // Simulation d'un appel API
    return dummyWebhook;
  },

  createWebhook: async (webhook: Omit<Webhook, 'id' | 'createdAt'>): Promise<Webhook> => {
    // Simulation d'un appel API
    return {
      ...webhook,
      id: Math.random().toString(),
      createdAt: new Date(),
    };
  },

  updateWebhook: async (webhook: Partial<Webhook> & { id: string }): Promise<Webhook> => {
    // Simulation d'un appel API
    return {
      ...dummyWebhook,
      ...webhook,
    };
  },

  deleteWebhook: async (id: string): Promise<void> => {
    // Simulation d'un appel API
    return Promise.resolve();
  },
};
