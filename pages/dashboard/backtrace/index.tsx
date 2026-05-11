import React, { useEffect, useMemo, useState } from 'react';
import { HttpStatusCode } from 'axios';
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconChartBar,
  IconChartPie,
  IconClock,
  IconDownload,
  IconFilter,
} from '@tabler/icons-react';
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
  const logsPerPage = 5;

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

  const successCount = logs.filter((l) => l.status_code === HttpStatusCode.Ok).length;
  const errorCount = logs.filter((l) => l.status_code !== HttpStatusCode.Ok).length;
  const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : '0.0';

  const mockResponseTimes = useMemo(
    () => logs.map(() => Math.floor(Math.random() * 1200) + 41),
    [logs.length],
  );

  const currentLogs = logs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const rows = currentLogs.map((logItem: LogDTO, idx: number) => {
    const globalIdx = (currentPage - 1) * logsPerPage + idx;
    const isSuccess = logItem.status_code === HttpStatusCode.Ok;
    return (
      <Table.Tr key={logItem.id}>
        <Table.Td>
          <Anchor size="sm" fw={500} c="blue">
            #gen-{logItem.id}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{formatDate(logItem.called_at)}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{logItem.template.name}</Text>
        </Table.Td>
        <Table.Td>
          <Badge
            color={isSuccess ? 'teal' : 'red'}
            variant="light"
            radius="sm"
            size="sm"
            leftSection={
              <Box
                w={6}
                h={6}
                style={{ borderRadius: '50%', backgroundColor: isSuccess ? '#12b886' : '#fa5252', flexShrink: 0 }}
              />
            }
          >
            {isSuccess ? 'Success' : 'Error'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">{mockResponseTimes[globalIdx] ?? 0}ms</Text>
        </Table.Td>
        <Table.Td>
          <Anchor
            size="sm"
            fw={500}
            onClick={() => viewLog(logItem)}
            style={{ cursor: 'pointer' }}
          >
            View trace
          </Anchor>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      {fetchLogRequestStatus === RequestStatus.InProgress ||
      fetchLogRequestStatus === RequestStatus.NotStated ? (
        <Center h="95vh" w="100%">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Stack gap="xl">
          {selectedLog && (
            <ViewBacktrace
              Log={selectedLog}
              size="lg"
              centered
              opened={viewBacktraceOpened}
              onClose={closeViewBacktrace}
            />
          )}

          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2} fw={700}>Backtrace Log</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Monitor API requests and generation health in real-time.
              </Text>
            </Box>
            <Group gap="sm">
              <Button variant="outline" leftSection={<IconFilter size={16} />} size="sm">
                Filter
              </Button>
              <Button variant="outline" leftSection={<IconDownload size={16} />} size="sm">
                Export CSV
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={4}>
            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Total Requests</Text>
                <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                  <IconChartBar size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">{logs.length.toLocaleString()}</Text>
                <Text size="xs" c="teal">+12%</Text>
              </Group>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Success Rate</Text>
                <ThemeIcon size="sm" variant="light" color="teal" radius="xl">
                  <IconChartPie size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">{successRate}%</Text>
                <Text size="xs" c="teal">Stable</Text>
              </Group>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Avg Response Time</Text>
                <ThemeIcon size="sm" variant="light" color="orange" radius="xl">
                  <IconClock size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">428ms</Text>
                <Text size="xs" c="orange">+45ms</Text>
              </Group>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: "0.05em" }}>Error Count</Text>
                <ThemeIcon size="sm" variant="light" color="red" radius="xl">
                  <IconAlertCircle size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">{errorCount}</Text>
                <Text size="xs" c="dimmed">Last 24h</Text>
              </Group>
            </Card>
          </SimpleGrid>

          <Paper withBorder radius="md" shadow="xs" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover>
              <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>ID</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Date</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Template</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Status</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Response Time</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#868e96' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Paper>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Showing {Math.min((currentPage - 1) * logsPerPage + 1, logs.length)}–{Math.min(currentPage * logsPerPage, logs.length)} of {logs.length} entries
            </Text>
            <Pagination
              total={Math.ceil(logs.length / logsPerPage)}
              value={currentPage}
              onChange={handlePageChange}
              size="sm"
            />
          </Group>

          <Alert
            icon={<IconChartBar size={18} />}
            color="blue"
            variant="light"
            radius="md"
            title="Detailed Analytics"
          >
            <Group justify="space-between" align="center">
              <Text size="sm">
                Need a deeper dive? Integrate our Webhooks to receive real-time alerts whenever an API call fails or exceeds performance thresholds.
              </Text>
              <Anchor href="/documentation" size="sm" fw={600}>
                Explore Integration Docs →
              </Anchor>
            </Group>
          </Alert>
        </Stack>
      )}
    </>
  );
}

Log.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
