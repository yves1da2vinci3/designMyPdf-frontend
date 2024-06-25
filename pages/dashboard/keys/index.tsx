import React, { useEffect, useState } from 'react';
import { KeyDTO, CreateKeyDto, UpdateKeyDto, keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddKeyModal from '@/modals/AddKey/AddKey';
import UpdateKeyModal from '@/modals/UpdateKey/UpdateKey';
import { formatDate } from '@/utils/formatDate';
import { Button, Center, Group, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPencil, IconTrash } from '@tabler/icons-react';

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
      setKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyId));
    } catch (error) {
      console.error('Failed to delete key', error);
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
          </Text>{' '}
          <Text size="sm">
            ? This action is destructive and you will have to contact support to restore your data.
          </Text>{' '}
        </Group>
      ),
      labels: { confirm: 'Delete key', cancel: "No, don't delete it" },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteKey(keyId),
    });
  };

  useEffect(() => {
    const updatedRows = keys.map((key) => (
      <Table.Tr key={key.id}>
        <Table.Td width="10%">{formatDate(key.created_at)}</Table.Td>
        <Table.Td width="20%">{key.name}</Table.Td>
        <Table.Td width="31%">{key.value}</Table.Td>
        <Table.Td width="7%">{key.key_count}</Table.Td>
        <Table.Td width="7%">{key.key_count_used}</Table.Td>
        <Table.Td width="25%">
          <Group>
            <Button
              variant="outline"
              color="red"
              leftSection={<IconTrash />}
              onClick={() => deleteConfirmation(key.name, key.id)}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              color="blue"
              leftSection={<IconPencil />}
              onClick={() => updateKey(key.id)}
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
  const addKeyHandler = async (key: CreateKeyDto) => {
    setAddKeyRequestStatus(RequestStatus.InProgress);
    try {
      const keyCreated = await keyApi.createKey(key);
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
    const key = keys.find((key) => key.id === keyId);
    if (key) {
      setKeyToUpdate(key);
      openUpdateKey();
    }
  };

  const updateKeyHandler = async (values: UpdateKeyDto) => {
    try {
      setUpdateKeyRequestStatus(RequestStatus.InProgress);

      // Use default keyId if keyToUpdate.id is undefined or null
      const keyId = keyToUpdate?.id || -1;

      // Make API call to update the key
      const updatedKey = await keyApi.updateKey(values, keyId);

      // Find the index of the updated key in the keys array
      const keyIndex = keys.findIndex((key) => key.id === updatedKey.id);

      if (keyIndex !== -1) {
        // Update the keys array with the updated key
        const newKeys = [...keys];
        newKeys[keyIndex] = updatedKey;
        setKeys(newKeys);
      }

      // Update request status to succeeded
      setUpdateKeyRequestStatus(RequestStatus.Succeeded);

      // Close the update modal
      closeUpdateKey();
    } catch (error) {
      // Handle API call errors
      console.error('Failed to update key:', error);
      setUpdateKeyRequestStatus(RequestStatus.Failed);
    }
  };

  return (
    <>
      {fetchKeysRequestStatus === RequestStatus.InProgress ||
      fetchKeysRequestStatus === RequestStatus.NotStated ? (
        <Center h={'95vh'} w={'100%'}>
          <Loader type="bars" size={'xl'} />
        </Center>
      ) : (
        <Stack>
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
          <Title>API Keys</Title>
          <Group justify="space-between">
            <Text>
              Your personal API key is used for interacting with our services programmatically. Keep
              your personal key safe.
            </Text>
            <Button onClick={openAddKey}>Create new API key</Button>
          </Group>

          {/* Table */}
          <Table withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Key</Table.Th>
                <Table.Th>Key Quota</Table.Th>
                <Table.Th>Key Usage</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Stack>
      )}
    </>
  );
}

Keys.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
