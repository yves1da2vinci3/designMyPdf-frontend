import { LogDTO, logApi } from '@/api/logApi';
import { RequestStatus } from '@/api/request-status.enum';
import DashboardLayout from '@/layouts/DashboardLayout';
import ViewBacktrace from '@/modals/ViewBacktrace/ViewBacktrace';
import { formatDate } from '@/utils/formatDate';
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEye } from '@tabler/icons-react';
import { HttpStatusCode } from 'axios';
import React, { useEffect, useState } from 'react';

export default function Log() {
  const [fetchLogRequestStatus, setFetchLogRequestStatus] = useState(RequestStatus.NotStated);
  const [logs, setLogs] = useState<LogDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [log, setLog] = useState<LogDTO | null>(null);
  const logsPerPage = 10;

  const viewLog = (log: LogDTO) => {
    setLog(log);
    openViewBacktrace();
  };

  const fetchLogs = async () => {
    setFetchLogRequestStatus(RequestStatus.InProgress);
    try {
      const logs = await logApi.getLogs();
      setLogs(logs);
      setFetchLogRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      console.error(error);
      setFetchLogRequestStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const [viewBacktraceOpened, { open: openViewBacktrace, close: closeViewBacktrace }] =
    useDisclosure(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);
  const rows = currentLogs.map((log: LogDTO) => (
    <Table.Tr    key={log.id}>
      <Table.Td>{formatDate(log.called_at)}</Table.Td>
      <Table.Td>{log.template.name}</Table.Td>
      <Table.Td>{log.key.value}</Table.Td>
      <Table.Td>
        {log.status_code === HttpStatusCode.Ok ? (
          <Badge color="green">success</Badge>
        ) : (
          <Badge color="red">failed</Badge>
        )}
      </Table.Td>
      <Table.Td style={{ justifyContent: 'flex-end', display: 'flex' }}>
        <Button onClick={() => viewLog(log)} variant="outline" leftSection={<IconEye />}>
          View backtrace
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      {fetchLogRequestStatus === RequestStatus.InProgress ||
      fetchLogRequestStatus === RequestStatus.NotStated ? (
        <Center h={'95vh'} w={'100%'}>
          <Loader type="bars" size={'xl'} />
        </Center>
      ) : (
        <Stack h={'95vh'}>
          {log && (
            <ViewBacktrace
              Log={log}
              size={'lg'}
              centered
              opened={viewBacktraceOpened}
              onClose={closeViewBacktrace}
            />
          )}

          <Title>Logs</Title>

          {/* Table */}
          <Table   withRowBorders withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Text fw={'bold'} ta={'center'}>
                    Called At
                  </Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={'bold'} ta={'center'}>
                    Template
                  </Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={'bold'} ta={'center'}>
                    API Key Used
                  </Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={'bold'} ta={'center'}>
                    Status
                  </Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={'bold'} ta={'center'}>
                    Actions
                  </Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
          <Box flex={1} />
          <Pagination
            style={{ alignSelf: 'flex-end' }}
            total={Math.ceil(logs.length / logsPerPage)}
            value={currentPage}
            onChange={handlePageChange}
          />
        </Stack>
      )}
    </>
  );
}

Log.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
