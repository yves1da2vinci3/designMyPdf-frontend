import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconActivity,
  IconBook,
  IconChartBar,
  IconCircleCheck,
  IconKey,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { KeyDTO, CreateKeyDto, UpdateKeyDto, keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddKeyModal from '@/modals/AddKey/AddKey';
import UpdateKeyModal from '@/modals/UpdateKey/UpdateKey';
import { formatDate } from '@/utils/formatDate';

const MOCK_LAST_USED = ['2 mins ago', '3 days ago', '1 week ago', 'Never', '5 hours ago'];
const maskKey = (value: string) => {
  if (!value || value.length < 8) return value;
  return `${value.slice(0, 8)}${'•'.repeat(16)}${value.slice(-3)}`;
};

export default function Keys() {
  const [fetchKeysRequestStatus, setFetchKeysRequestStatus] = useState(RequestStatus.NotStated);
  const [keys, setKeys] = useState<KeyDTO[]>([]);
  const [rows, setRows] = useState<React.ReactNode[]>([]);

  const fetchKeys = async () => {
    setFetchKeysRequestStatus(RequestStatus.InProgress);
    try {
      const fetchedKeys = await keyApi.getKeys();
      setFetchKeysRequestStatus(RequestStatus.Succeeded);
      setKeys(fetchedKeys);
    } catch (error) {
      setFetchKeysRequestStatus(RequestStatus.Failed);
    }
  };

  const deleteKey = async (keyId: number) => {
    try {
      await keyApi.deleteKey(keyId);
      setKeys((prevKeys) => prevKeys.filter((k) => k.id !== keyId));
    } catch (error) {
      // Handle error appropriately
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const deleteConfirmation = (name: string, keyId: number) => {
    modals.openConfirmModal({
      title: 'Delete the key',
      centered: true,
      children: (
        <Group gap={0}>
          <Text size="sm">Are you sure you want to delete the key</Text>
          <Text mx={2} fw="bold">
            {name}
          </Text>
          <Text size="sm">
            ? This action is destructive and you will have to contact support to restore your data.
          </Text>
        </Group>
      ),
      labels: { confirm: 'Delete key', cancel: "No, don't delete it" },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteKey(keyId),
    });
  };

  useEffect(() => {
    const updatedRows = keys.map((keyItem, idx) => {
      const isRevoked = idx === keys.length - 1 && keys.length > 1;
      return (
        <Table.Tr key={keyItem.id} style={{ transition: 'background 0.15s' }}>
          <Table.Td>
            <Box>
              <Text fw={600} size="sm">{keyItem.name}</Text>
              <Text size="xs" c="dimmed" ff="monospace">{maskKey(keyItem.value)}</Text>
            </Box>
          </Table.Td>
          <Table.Td>
            <Text size="sm" c="dimmed">{formatDate(keyItem.created_at)}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm" c="dimmed">{MOCK_LAST_USED[idx % MOCK_LAST_USED.length]}</Text>
          </Table.Td>
          <Table.Td>
            <Badge
              color={isRevoked ? 'gray' : 'teal'}
              variant="light"
              radius="sm"
              size="sm"
            >
              {isRevoked ? 'REVOKED' : 'ACTIVE'}
            </Badge>
          </Table.Td>
          <Table.Td>
            <Group gap="xs" justify="flex-end">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => updateKey(keyItem.id)}
                title="Edit"
              >
                <IconPencil size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => deleteConfirmation(keyItem.name, keyItem.id)}
                title="Delete"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    });
    setRows(updatedRows);
  }, [keys]);

  const [addKeyOpened, { open: openAddKey, close: closeAddKey }] = useDisclosure(false);
  const [addKeyRequestStatus, setAddKeyRequestStatus] = useState(RequestStatus.NotStated);
  const addKeyHandler = async (keyData: CreateKeyDto) => {
    setAddKeyRequestStatus(RequestStatus.InProgress);
    try {
      const keyCreated = await keyApi.createKey(keyData);
      setKeys((prevKeys) => [...prevKeys, keyCreated]);
      closeAddKey();
      setAddKeyRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      setAddKeyRequestStatus(RequestStatus.Failed);
    }
  };

  const [updateKeyOpened, { open: openUpdateKey, close: closeUpdateKey }] = useDisclosure(false);
  const [updateKeyRequestStatus, setUpdateKeyRequestStatus] = useState(RequestStatus.NotStated);
  const [keyToUpdate, setKeyToUpdate] = useState<KeyDTO>();

  const updateKey = (keyId: number) => {
    const foundKey = keys.find((k) => k.id === keyId);
    if (foundKey) {
      setKeyToUpdate(foundKey);
      openUpdateKey();
    }
  };

  const updateKeyHandler = async (values: UpdateKeyDto) => {
    try {
      setUpdateKeyRequestStatus(RequestStatus.InProgress);
      const keyId = keyToUpdate?.id || -1;
      const updatedKey = await keyApi.updateKey(values, keyId);
      const keyIndex = keys.findIndex((k) => k.id === updatedKey.id);

      if (keyIndex !== -1) {
        const newKeys = [...keys];
        newKeys[keyIndex] = updatedKey;
        setKeys(newKeys);
      }

      setUpdateKeyRequestStatus(RequestStatus.Succeeded);
      closeUpdateKey();
    } catch (error) {
      setUpdateKeyRequestStatus(RequestStatus.Failed);
    }
  };

  return (
    <>
      {fetchKeysRequestStatus === RequestStatus.InProgress ||
      fetchKeysRequestStatus === RequestStatus.NotStated ? (
        <Center h="95vh" w="100%">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Stack gap="xl">
          <AddKeyModal
            opened={addKeyOpened}
            onClose={closeAddKey}
            addKeyHandler={addKeyHandler}
            addKeyRequestatus={addKeyRequestStatus}
          />
          <UpdateKeyModal
            opened={updateKeyOpened}
            onClose={closeUpdateKey}
            updateKeyHandler={updateKeyHandler}
            updateKeyStatus={updateKeyRequestStatus}
            Key={keyToUpdate}
          />

          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2} fw={700}>API Keys</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Manage your production and staging credentials for the PDF Engine.
              </Text>
            </Box>
            <Button leftSection={<IconPlus size={16} />} onClick={openAddKey}>
              Create New Key
            </Button>
          </Group>

          <SimpleGrid cols={3}>
            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Active Keys</Text>
                <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                  <IconKey size={12} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl">{String(keys.length).padStart(2, '0')}</Text>
              <Box mt="xs" style={{ height: 3, backgroundColor: '#228be6', borderRadius: 2, width: '40%' }} />
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Total Requests (24H)</Text>
                <ThemeIcon size="sm" variant="light" color="violet" radius="xl">
                  <IconChartBar size={12} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl">12,402</Text>
              <Text size="xs" c="teal" mt={4}>↑ 8.4% increase</Text>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Health Status</Text>
                <ThemeIcon size="sm" variant="light" color="teal" radius="xl">
                  <IconActivity size={12} />
                </ThemeIcon>
              </Group>
              <Group gap="xs" align="center">
                <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: '#12b886', flexShrink: 0 }} />
                <Text fw={700} size="lg">All Systems Up</Text>
              </Group>
            </Card>
          </SimpleGrid>

          <Paper withBorder radius="md" shadow="xs" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover>
              <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Name</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Created Date</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Last Used</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Status</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96', textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Paper>

          <Alert
            icon={<IconBook size={18} />}
            color="blue"
            variant="light"
            radius="md"
            title="Need help integrating?"
          >
            <Group justify="space-between" align="center">
              <Text size="sm">Check out our Quickstart Guide or API Reference documentation.</Text>
              <Anchor href="/documentation" size="sm" fw={600}>
                View Docs →
              </Anchor>
            </Group>
          </Alert>
        </Stack>
      )}
    </>
  );
}

Keys.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
