import { Paper, rem, Title, Button, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
const ManagedNamespaceItem = () => {
  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete the namespace',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the namespace? This action is destructive and you will
          have to contact support to restore your data.
        </Text>
      ),
      labels: { confirm: 'Delete account', cancel: "No don't delete it" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Confirmed'),
    });
  return (
    <Paper h={'auto'} p={8} w={rem(220)} bg={'blue'}>
      <Title my={4} c={'white'} order={4}>
        Drety
      </Title>
      <Title my={4} c={'white'} order={6}>
        3 templates
      </Title>
      <Button
        justify="space-between"
        size="xs"
        c={'blue'}
        bg={'white'}
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
