import DashboardLayout from '@/layouts/DashboardLayout';
import AddKeyModal from '@/modals/AddKey/AddKey';
import ViewBacktrace from '@/modals/ViewBacktrace/ViewBacktrace';
import { Badge, Box, Button, Group, Modal, Stack, Table, Text, Title, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Editor } from '@monaco-editor/react';
import { IconEye, IconTrash } from '@tabler/icons-react';
import React from 'react';
export default function Log() {
  const tableData = [
    {
      createAt: '2023-02-28',
      name: 'Example Name 1',
      key: 'abcde123fghij456k',
    },
    {
      createAt: '2023-02-27',
      name: 'Example Name 2',
      key: 'fghij456klmno789n',
    },
    {
      createAt: '2023-02-26',
      name: 'Example Name 3',
      key: 'klmno789npqrs890t',
    },
    {
      createAt: '2023-02-25',
      name: 'Example Name 4',
      key: 'pqrs890tuvwxy123z',
    },
  ];

  const [viewBacktraceOpened, { open: openViewBacktrace, close: closeViewBacktrace }] = useDisclosure(false);
  const rows = tableData.map((element) => (
    <Table.Tr key={element.name}>
      <Table.Td>{element.createAt}</Table.Td>
      <Table.Td>{element.name}</Table.Td>
      <Table.Td>{element.key}</Table.Td>
      <Table.Td>
        <Badge bg={'green'}>success</Badge>
      </Table.Td>
      <Table.Td style={{ justifyContent: 'flex-end', display: 'flex' }}>
        <Button onClick={openViewBacktrace} variant="outline" leftSection={<IconEye />}>
          View bracktrace
        </Button>
      </Table.Td>
    </Table.Tr>
  ));
  return (
    <Stack>
      <ViewBacktrace size={'lg'} centered opened={viewBacktraceOpened} onClose={closeViewBacktrace} />

      <Title> Logs</Title>

      {/* Table */}
      <Table withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Called At</Table.Th>
            <Table.Th>Template</Table.Th>
            <Table.Th>api Key used</Table.Th>
            <Table.Th>status</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
}

Log.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
