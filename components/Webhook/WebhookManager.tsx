import { Alert, Box, Button, Card, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { webhookService } from '../../services/webhook';
import { Webhook } from '../../types/webhook';

export const WebhookManager: React.FC = () => {
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    loadWebhook();
  }, []);

  const loadWebhook = async () => {
    try {
      const data = await webhookService.getWebhook('user123');
      setWebhook(data);
      if (data) {
        setUrl(data.url);
      }
    } catch (err) {
      setError('Erreur lors du chargement du webhook');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (webhook) {
        // Mise à jour
        const updated = await webhookService.updateWebhook({
          id: webhook.id,
          url,
        });
        setWebhook(updated);
        setSuccess('Webhook mis à jour avec succès');
      } else {
        // Création
        const created = await webhookService.createWebhook({
          userId: 'user123',
          url,
        });
        setWebhook(created);
        setSuccess('Webhook créé avec succès');
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde du webhook');
    }
  };

  const handleDelete = async () => {
    if (!webhook) return;
    try {
      await webhookService.deleteWebhook(webhook.id);
      setWebhook(null);
      setUrl('');
      setSuccess('Webhook supprimé avec succès');
      close();
    } catch (err) {
      setError('Erreur lors de la suppression du webhook');
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Confirmation de suppression" centered>
        <Stack>
          <Text>Êtes-vous sûr de vouloir supprimer ce webhook ?</Text>
          <Text size="sm" c="dimmed">
            Cette action est irréversible. Vous ne recevrez plus de notifications pour les
            générations de PDF.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={close}>
              Annuler
            </Button>
            <Button color="red" onClick={handleDelete}>
              Supprimer
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Box>
        <Text size="xl" fw={700} mb="md">
          Configuration du Webhook
        </Text>

        <Card shadow="sm" p="lg" radius="md" withBorder mb="md">
          <Text c="dimmed" mb="md">
            Le webhook vous permet de recevoir des notifications en temps réel lorsqu'une génération
            de PDF est terminée.
          </Text>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" mb="md">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="URL du Webhook"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-domaine.com/webhook"
              />

              <Group justify="flex-start">
                <Button type="submit" color="blue">
                  {webhook ? 'Mettre à jour' : 'Créer'}
                </Button>

                {webhook && (
                  <Button variant="outline" color="red" onClick={open}>
                    Supprimer
                  </Button>
                )}
              </Group>
            </Stack>
          </form>
        </Card>

        {webhook && (
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Text fw={700} mb="xs">
              Informations du Webhook
            </Text>
            <Text>ID: {webhook.id}</Text>
            <Text>Créé le: {new Date(webhook.createdAt).toLocaleDateString()}</Text>
          </Card>
        )}
      </Box>
    </>
  );
};
