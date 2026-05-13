import { Paper, rem, Title, Button, Text, Group, TextInput, Stack } from '@mantine/core';
import { IconTrash, IconPencil } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import notificationService from '@/services/NotificationService';

interface ManagedNamespaceItemProps {
  namespace: NamespaceDTO;
  DeleteFromClient: (id: number) => void;
  RenameInClient: (id: number, newName: string) => void;
  id: number;
}

const deleteNamespace = async (id: number, DeleteFromClient: (id: number) => void) => {
  try {
    await namespaceApi.deleteNamespace(id);
    DeleteFromClient(id);
  } catch (error) {
    notificationService.showErrorNotification('Failed to delete namespace');
  }
};

const ManagedNamespaceItem: React.FC<ManagedNamespaceItemProps> = ({
  namespace,
  id,
  DeleteFromClient,
  RenameInClient,
}) => {
  const { name, templates } = namespace;
  const [renameName, setRenameName] = useState(name);

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete the namespace',
      centered: true,
      children: (
        <Group gap={0}>
          <Text size="sm">Are you sure you want to delete the namespace</Text>
          <Text mx={2} fw="bold">
            {' '}
            {name}
          </Text>{' '}
          <Text size="sm">
            ? This action is destructive and you will have to contact support to restore your data.
          </Text>{' '}
        </Group>
      ),
      labels: { confirm: 'Delete namespace', cancel: "No, don't delete it" },
      confirmProps: { color: 'red' },
      onCancel: () => {},
      onConfirm: () => deleteNamespace(id, DeleteFromClient),
    });

  const openRenameModal = () => {
    let inputValue = name;
    modals.openConfirmModal({
      title: 'Rename namespace',
      centered: true,
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Enter a new name for <b>{name}</b>:
          </Text>
          <TextInput
            defaultValue={name}
            onChange={(e) => {
              inputValue = e.currentTarget.value;
            }}
            placeholder="Namespace name"
            data-autofocus
          />
        </Stack>
      ),
      labels: { confirm: 'Rename', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: async () => {
        if (!inputValue.trim() || inputValue === name) return;
        try {
          await namespaceApi.updateNamespace({ name: inputValue.trim() }, id);
          setRenameName(inputValue.trim());
          RenameInClient(id, inputValue.trim());
        } catch {
          notificationService.showErrorNotification('Failed to rename namespace');
        }
      },
    });
  };

  return (
    <Paper h="auto" p={8} w={rem(220)} key={id} bg="blue">
      <Title my={4} c="white" order={4}>
        {renameName}
      </Title>
      <Title my={4} c="white" order={6}>
        {templates ? templates.length : 0} templates
      </Title>
      <Button
        justify="space-between"
        size="xs"
        c="blue"
        bg="white"
        w={rem(200)}
        mb={4}
        rightSection={<IconPencil size={14} />}
        onClick={openRenameModal}
      >
        Rename
      </Button>
      <Button
        justify="space-between"
        size="xs"
        c="blue"
        bg="white"
        w={rem(200)}
        rightSection={<IconTrash />}
        onClick={openDeleteModal}
      >
        Delete
      </Button>
    </Paper>
  );
};

export default ManagedNamespaceItem;
