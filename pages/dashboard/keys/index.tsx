import React, { useEffect, useState } from 'react';
import {
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Space,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { KeyDTO, CreateKeyDto, UpdateKeyDto, keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddKeyModal from '@/modals/AddKey/AddKey';
import UpdateKeyModal from '@/modals/UpdateKey/UpdateKey';
import { formatDate } from '@/utils/formatDate';

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
    const updatedRows = keys.map((keyItem) => (
      <Table.Tr key={keyItem.id}>
        <Table.Td ta="left">{formatDate(keyItem.created_at)}</Table.Td>
        <Table.Td ta="left">{keyItem.name}</Table.Td>
        <Table.Td ta="left">{keyItem.value}</Table.Td>
        <Table.Td ta="center">{keyItem.key_count}</Table.Td>
        <Table.Td ta="center">{keyItem.key_count_used}</Table.Td>
        <Table.Td ta="right">
          <Group gap="xs" justify="flex-end">
            <Button
              variant="filled"
              color="red"
              size="xs"
              leftSection={<IconTrash size={16} />}
              onClick={() => deleteConfirmation(keyItem.name, keyItem.id)}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              color="blue"
              size="xs"
              leftSection={<IconPencil size={16} />}
              onClick={() => updateKey(keyItem.id)}
            >
              Update
            </Button>
          </Group>
        </Table.Td>
      </Table.Tr>
    ));
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
        <Center h="calc(100vh - var(--app-shell-header-height, 0px))" w="100%">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Stack p="md" gap="md">
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
          <Title order={2} mb="xs">
            API Keys
          </Title>
          <Paper p="lg" shadow="sm" withBorder>
            <Group justify="space-between" mb="md">
              <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                Your personal API key is used for interacting with our services programmatically.
                Keep your personal key safe.
              </Text>
              <Button onClick={openAddKey} variant="filled">
                Create New API Key
              </Button>
            </Group>

            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <Table.Tr>
                    <Table.Th ta="left" fw="bold">Created At</Table.Th>
                    <Table.Th ta="left" fw="bold">Name</Table.Th>
                    <Table.Th ta="left" fw="bold">Key</Table.Th>
                    <Table.Th ta="center" fw="bold">Key Quota</Table.Th>
                    <Table.Th ta="center" fw="bold">Key Usage</Table.Th>
                    <Table.Th ta="right" fw="bold">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                {rows.length > 0 ? <Table.Tbody>{rows}</Table.Tbody> : null}
              </Table>
            </Table.ScrollContainer>
            {rows.length === 0 && fetchKeysRequestStatus === RequestStatus.Succeeded && (
              <Center p="lg">
                <Text c="dimmed">
                  No API keys found. Click Create New API Key to add one.
                </Text>
              </Center>
            )}
            {fetchKeysRequestStatus === RequestStatus.Failed && (
              <Center p="lg">
                <Text c="red">Failed to load API keys. Please try again later.</Text>
              </Center>
            )}
            {rows.length > 0 && <Space h="lg" />}
          </Paper>
        </Stack>
      )}
    </>
  );
}

Keys.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
