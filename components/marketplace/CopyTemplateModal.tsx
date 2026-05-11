import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Modal, Select, Button, Stack, Text, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { templateApi, TemplateDTO } from '@/api/templateApi';
import { namespaceApi, NamespaceDTO } from '@/api/namespaceApi';

interface Props {
  opened: boolean;
  onClose: () => void;
  template: TemplateDTO;
}

export default function CopyTemplateModal({ opened, onClose, template }: Props) {
  const router = useRouter();
  const [namespaces, setNamespaces] = useState<NamespaceDTO[]>([]);
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      namespaceApi.getNamespaces().then((ns) => {
        setNamespaces(ns);
        if (ns.length > 0) setSelectedNamespaceId(String(ns[0].ID));
      });
    }
  }, [opened]);

  const handleCopy = async () => {
    if (!selectedNamespaceId) return;
    setLoading(true);
    try {
      await templateApi.copyFreeTemplate(String(template.ID), Number(selectedNamespaceId));
      notifications.show({ title: 'Success', message: 'Template copied to your library!', color: 'teal' });
      onClose();
      router.push('/dashboard/templates');
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to copy template.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Copy to my templates" centered size="sm">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Select which folder to save <strong>{template.name}</strong> into:
        </Text>
        <Select
          label="Folder"
          placeholder="Select a folder..."
          value={selectedNamespaceId}
          onChange={setSelectedNamespaceId}
          data={namespaces.map((ns) => ({ value: String(ns.ID), label: ns.name }))}
        />
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button loading={loading} disabled={!selectedNamespaceId} onClick={handleCopy}>
            Copy to my templates
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
