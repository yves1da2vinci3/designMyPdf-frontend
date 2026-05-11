import React, { useState, useEffect } from 'react';
import { Modal, Title, Text, TextInput, Button, Group, Stack } from '@mantine/core';
import { TemplateDTO, templateApi } from '@/api/templateApi';

interface RenameTemplateProps {
  template: TemplateDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const RenameTemplate: React.FC<RenameTemplateProps> = ({ template, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.name?.trim() ?? '');
      setError('');
    } else {
      setName('');
    }
  }, [template]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Le nom ne peut pas être vide.');
      return;
    }
    if (!template) return;
    setLoading(true);
    setError('');
    try {
      await templateApi.updateTemplate(template.ID, { name: name.trim() });
      onSuccess();
      onClose();
    } catch {
      setError('Impossible de renommer. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={!!template}
      onClose={onClose}
      centered
      title={
        <Title order={3} my={4}>
          Renommer le template
        </Title>
      }
    >
      <Stack>
        {template?.name ? (
          <Text size="sm" c="dimmed">
            Nom actuel :{' '}
            <Text span fw={600} c="dark">
              {template.name}
            </Text>
          </Text>
        ) : null}
        <TextInput
          label="Nouveau nom"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          error={error}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Renommer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default RenameTemplate;
