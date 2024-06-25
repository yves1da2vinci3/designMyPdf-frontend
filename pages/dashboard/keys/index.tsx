import DashboardLayout from '@/layouts/DashboardLayout';
import AddKeyModal from '@/modals/AddKey/AddKey';
import { Button, Group, Stack, Table, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
export default function Keys() {
  const tableData = [
    {
      createAt: '2023-02-28',
      name: 'Example Name 1',
      keyCount: '15',
      keyCountUsed: '10',
      key: 'abcde123fghij456k',
    },
    {
      createAt: '2023-02-27',
      name: 'Example Name 2',
      keyCount: '15',
      keyCountUsed: '10',
      key: 'fghij456klmno789n',
    },
    {
      createAt: '2023-02-26',
      name: 'Example Name 3',
      keyCount: '15',
      keyCountUsed: '10',
      key: 'klmno789npqrs890t',
    },
    {
      createAt: '2023-02-25',
      name: 'Example Name 4',
      keyCount: '15',
      keyCountUsed: '10',
      key: 'pqrs890tuvwxy123z',
    },
  ];

  const rows = tableData.map((element) => (
    <Table.Tr key={element.name}>
      <Table.Td width={'10%'}>{element.createAt}</Table.Td>
      <Table.Td width={'20%'}>{element.name}</Table.Td>
      <Table.Td width={'36%'}>{element.key}</Table.Td>
      <Table.Td width={'10%'}>{element.keyCount}</Table.Td>
      <Table.Td width={'10%'}>{element.keyCountUsed}</Table.Td>
      <Table.Td width={'14%'}>
        <Button variant="outline" color="red" leftSection={<IconTrash />}>
          Delete
        </Button>
      </Table.Td>
    </Table.Tr>
  ));
  const [addKeyOpened, { open: openAddKey, close: closeAddKey }] = useDisclosure(false);
  return (
    <Stack>
      <AddKeyModal opened={addKeyOpened} onClose={closeAddKey} />
      <Title>Api Keys</Title>
      <Group justify="space-between">
        <Text>
          Your personal API key is used for interacting with our services programmatically. Keep
          your personal key safe.
        </Text>
        <Button onClick={openAddKey}>create new api key</Button>
      </Group>

      {/* Table */}
      <Table withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Create At</Table.Th>
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
  );
}

Keys.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
