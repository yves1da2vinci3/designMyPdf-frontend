import { Paper, rem, Title, Button, Text, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import notificationService from '@/services/NotificationService';

interface ManagedNamespaceItemProps {
  namespace: NamespaceDTO;
  DeleteFromClient: (id: number) => void;
  id: number;
}

const deleteNamespace = async (id: number, DeleteFromClient: (id: number) => void) => {
  try {
    await namespaceApi.deleteNamespace(id);
    DeleteFromClient(id);
  } catch (error) {
    console.error('Error deleting namespace:', error);
    notificationService.showErrorNotification('Failed to delete namespace');
  }
};

const ManagedNamespaceItem: React.FC<ManagedNamespaceItemProps> = ({
  namespace,
  id,
  DeleteFromClient,
}) => {
  const { name, templates } = namespace;

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
      onCancel: () => console.log('Cancel'),
      onConfirm: () => deleteNamespace(id, DeleteFromClient),
    });

  return (
    <Paper h="auto" p={8} w={rem(220)} key={id} bg="blue">
      <Title my={4} c="white" order={4}>
        {name}
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
        rightSection={<IconTrash />}
        onClick={openDeleteModal}
      >
        Delete
      </Button>
    </Paper>
  );
};

export default ManagedNamespaceItem;
