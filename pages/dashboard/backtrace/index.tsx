import React, { useEffect, useState } from 'react';
import { HttpStatusCode } from 'axios';
import {
  Badge,
  Box,
  Button,
  Center,
  Loader,
  Pagination,
  Paper,
  Space,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEye } from '@tabler/icons-react';
import { LogDTO, logApi } from '@/api/logApi';
import { RequestStatus } from '@/api/request-status.enum';
import DashboardLayout from '@/layouts/DashboardLayout';
import ViewBacktrace from '@/modals/ViewBacktrace/ViewBacktrace';
import { formatDate } from '@/utils/formatDate';

export default function Log() {
  const [fetchLogRequestStatus, setFetchLogRequestStatus] = useState(RequestStatus.NotStated);
  const [logs, setLogs] = useState<LogDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogDTO | null>(null);
  const logsPerPage = 10;

  const viewLog = (logItem: LogDTO) => {
    setSelectedLog(logItem);
    openViewBacktrace();
  };

  const fetchLogs = async () => {
    setFetchLogRequestStatus(RequestStatus.InProgress);
    try {
      const fetchedLogs = await logApi.getLogs();
      setLogs(fetchedLogs);
      setFetchLogRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
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
  const rows = currentLogs.map((logItem: LogDTO) => (
    <Table.Tr key={logItem.id}>
      <Table.Td ta="left">{formatDate(logItem.called_at)}</Table.Td>
      <Table.Td ta="left">{logItem.template.name}</Table.Td>
      <Table.Td ta="left">{logItem.key.value}</Table.Td>
      <Table.Td ta="left">
        {logItem.status_code === HttpStatusCode.Ok ? (
          <Badge color="green" variant="light">
            Success
          </Badge>
        ) : (
          <Badge color="red" variant="light">
            Failed
          </Badge>
        )}
      </Table.Td>
      <Table.Td ta="right">
        <Button
          onClick={() => viewLog(logItem)}
          variant="outline"
          leftSection={<IconEye size={16} />}
          size="xs"
        >
          View backtrace
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      {fetchLogRequestStatus === RequestStatus.InProgress ||
      fetchLogRequestStatus === RequestStatus.NotStated ? (
        <Center h="calc(100vh - var(--app-shell-header-height, 0px))" w="100%">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Stack p="md" gap="md">
          {selectedLog && (
            <ViewBacktrace
              Log={selectedLog}
              size="lg"
              centered
              opened={viewBacktraceOpened}
              onClose={closeViewBacktrace}
            />
          )}

          <Title order={2} mb="xs">
            Logs
          </Title>

          <Paper shadow="sm" p="lg" withBorder>
            <Table.ScrollContainer minWidth={600}>
              <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <Table.Tr>
                    <Table.Th ta="left" fw="bold">
                      Called At
                    </Table.Th>
                    <Table.Th ta="left" fw="bold">
                      Template
                    </Table.Th>
                    <Table.Th ta="left" fw="bold">
                      API Key Used
                    </Table.Th>
                    <Table.Th ta="left" fw="bold">
                      Status
                    </Table.Th>
                    <Table.Th ta="right" fw="bold">
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                {rows.length > 0 ? <Table.Tbody>{rows}</Table.Tbody> : null}
              </Table>
            </Table.ScrollContainer>
            {rows.length === 0 && fetchLogRequestStatus === RequestStatus.Succeeded && (
              <Center p="lg">
                <Text c="dimmed">No logs found.</Text>
              </Center>
            )}
            {fetchLogRequestStatus === RequestStatus.Failed && (
              <Center p="lg">
                <Text c="red">Failed to load logs. Please try again later.</Text>
              </Center>
            )}
            {(rows.length > 0 || fetchLogRequestStatus === RequestStatus.InProgress) && <Space h="lg" />}
            <Pagination
              style={{ alignSelf: 'flex-end', display: rows.length > 0 ? 'flex' : 'none' }}
              total={Math.ceil(logs.length / logsPerPage)}
              value={currentPage}
              onChange={handlePageChange}
              size="sm"
            />
          </Paper>
        </Stack>
      )}
    </>
  );
}

Log.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
