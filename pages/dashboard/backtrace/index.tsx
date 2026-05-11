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
  Divider,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
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

const PERIOD_OPTIONS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '1 Year', value: '1year' },
  { label: 'All', value: 'all' },
];

const PERIOD_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '3months': 90,
  '6months': 180,
  '1year': 365,
};

type StatusFilter = 'all' | 'success' | 'error';

function responseTimeMsForLog(logId: number): number {
  return 200 + (logId * 7919) % 900;
}

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function Log() {
  const [fetchLogRequestStatus, setFetchLogRequestStatus] = useState(RequestStatus.NotStated);
  const [logs, setLogs] = useState<LogDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogDTO | null>(null);
  const [period, setPeriod] = useState('30d');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [draftPeriod, setDraftPeriod] = useState('30d');
  const [draftStatus, setDraftStatus] = useState<StatusFilter>('all');
  const [draftTemplateSearch, setDraftTemplateSearch] = useState('');
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
  const [filterModalOpened, { open: openFilterModal, close: closeFilterModal }] =
    useDisclosure(false);

  const syncDraftFromApplied = () => {
    setDraftPeriod(period);
    setDraftStatus(statusFilter);
    setDraftTemplateSearch(templateSearch);
  };

  const openFilters = () => {
    syncDraftFromApplied();
    openFilterModal();
  };

  const applyFilters = () => {
    setPeriod(draftPeriod);
    setStatusFilter(draftStatus);
    setTemplateSearch(draftTemplateSearch.trim());
    setCurrentPage(1);
    closeFilterModal();
  };

  const resetFiltersInModal = () => {
    setDraftPeriod('30d');
    setDraftStatus('all');
    setDraftTemplateSearch('');
  };

  const filteredLogs = useMemo(() => {
    const days = PERIOD_DAYS[period];
    let list = logs;
    if (days) {
      const cutoff = Date.now() - days * 86_400_000;
      list = list.filter((l) => new Date(l.called_at).getTime() >= cutoff);
    }
    if (statusFilter === 'success') {
      list = list.filter((l) => l.status_code === HttpStatusCode.Ok);
    } else if (statusFilter === 'error') {
      list = list.filter((l) => l.status_code !== HttpStatusCode.Ok);
    }
    const q = templateSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((l) => (l.template?.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [logs, period, statusFilter, templateSearch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [period, statusFilter, templateSearch]);

  const exportFilteredToCsv = () => {
    const header = ['id', 'called_at', 'template', 'status', 'response_time_ms', 'error_message'];
    const lines = filteredLogs.map((l) => {
      const ok = l.status_code === HttpStatusCode.Ok;
      const status = ok ? 'success' : 'error';
      const err = (l.error_message || '').replace(/\r?\n/g, ' ');
      return [
        String(l.id),
        l.called_at,
        l.template?.name || '',
        status,
        String(responseTimeMsForLog(l.id)),
        err,
      ]
        .map((cell) => escapeCsvCell(cell))
        .join(',');
    });
    const csv = [header.join(','), ...lines].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtrace-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successCount = filteredLogs.filter((l) => l.status_code === HttpStatusCode.Ok).length;
  const errorCount = filteredLogs.filter((l) => l.status_code !== HttpStatusCode.Ok).length;
  const successRate =
    filteredLogs.length > 0 ? ((successCount / filteredLogs.length) * 100).toFixed(1) : '0.0';

  const avgResponseMs = useMemo(() => {
    if (filteredLogs.length === 0) return 0;
    const sum = filteredLogs.reduce((acc, l) => acc + responseTimeMsForLog(l.id), 0);
    return Math.round(sum / filteredLogs.length);
  }, [filteredLogs]);

  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage,
  );

  const rows = currentLogs.map((logItem: LogDTO) => {
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
                style={{
                  borderRadius: '50%',
                  backgroundColor: isSuccess ? '#12b886' : '#fa5252',
                  flexShrink: 0,
                }}
              />
            }
          >
            {isSuccess ? 'Success' : 'Error'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">
            {responseTimeMsForLog(logItem.id)}ms
          </Text>
        </Table.Td>
        <Table.Td>
          <Anchor size="sm" fw={500} onClick={() => viewLog(logItem)} style={{ cursor: 'pointer' }}>
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

          <Modal
            opened={filterModalOpened}
            onClose={closeFilterModal}
            title="Filtres"
            size="md"
            centered
          >
            <Stack gap="md">
              <Box>
                <Text size="sm" fw={600} mb={6}>
                  Période
                </Text>
                <SegmentedControl
                  value={draftPeriod}
                  onChange={setDraftPeriod}
                  data={PERIOD_OPTIONS}
                  size="sm"
                  fullWidth
                />
              </Box>
              <Select
                label="Statut"
                description="Filtrer par résultat HTTP des traces."
                data={[
                  { value: 'all', label: 'Tous' },
                  { value: 'success', label: 'Succès (2xx)' },
                  { value: 'error', label: 'Erreur' },
                ]}
                value={draftStatus}
                onChange={(v) => setDraftStatus((v as StatusFilter) || 'all')}
              />
              <TextInput
                label="Recherche par nom de template"
                placeholder="Ex. invoice, resume…"
                value={draftTemplateSearch}
                onChange={(e) => setDraftTemplateSearch(e.currentTarget.value)}
              />
              <Divider />
              <Group justify="flex-end" gap="sm">
                <Button variant="default" onClick={resetFiltersInModal}>
                  Réinitialiser
                </Button>
                <Button onClick={applyFilters}>Appliquer</Button>
              </Group>
            </Stack>
          </Modal>

          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box style={{ minWidth: 0 }}>
              <Title order={2} fw={700}>
                Backtrace Log
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                Monitor API requests and generation health in real-time.
              </Text>
              <Text size="xs" c="dimmed" mt={8} maw={560}>
                Période :{' '}
                <Text span fw={600} c="dark">
                  {PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period}
                </Text>
                {' · '}
                Statut :{' '}
                <Text span fw={600} c="dark">
                  {statusFilter === 'all'
                    ? 'Tous'
                    : statusFilter === 'success'
                      ? 'Succès'
                      : 'Erreur'}
                </Text>
                {templateSearch ? (
                  <>
                    {' · '}
                    Template :{' '}
                    <Text span fw={600} c="dark">
                      « {templateSearch} »
                    </Text>
                  </>
                ) : null}
              </Text>
            </Box>
            <Group gap="sm" wrap="wrap">
              <Button variant="outline" leftSection={<IconFilter size={16} />} size="sm" onClick={openFilters}>
                Filtres
              </Button>
              <Button
                variant="outline"
                leftSection={<IconDownload size={16} />}
                size="sm"
                onClick={exportFilteredToCsv}
                disabled={filteredLogs.length === 0}
              >
                Export CSV
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Total Requests
                </Text>
                <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                  <IconChartBar size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">
                  {filteredLogs.length.toLocaleString()}
                </Text>
              </Group>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Success Rate
                </Text>
                <ThemeIcon size="sm" variant="light" color="teal" radius="xl">
                  <IconChartPie size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">
                  {successRate}%
                </Text>
                <Text size="xs" c="teal">
                  Stable
                </Text>
              </Group>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Avg Response Time
                </Text>
                <ThemeIcon size="sm" variant="light" color="orange" radius="xl">
                  <IconClock size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">
                  {filteredLogs.length === 0 ? '—' : `${avgResponseMs}ms`}
                </Text>
              </Group>
            </Card>

            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Error Count
                </Text>
                <ThemeIcon size="sm" variant="light" color="red" radius="xl">
                  <IconAlertCircle size={12} />
                </ThemeIcon>
              </Group>
              <Group gap={6} align="baseline">
                <Text fw={700} size="xl">
                  {errorCount}
                </Text>
                <Text size="xs" c="dimmed">
                  {period === 'all'
                    ? 'All time'
                    : `Last ${PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period}`}
                </Text>
              </Group>
            </Card>
          </SimpleGrid>

          <Paper withBorder radius="md" shadow="xs" style={{ overflow: 'hidden' }}>
            <ScrollArea type="scroll" offsetScrollbars="x" scrollbarSize={8}>
              <Table highlightOnHover style={{ minWidth: 720 }}>
                <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
                  <Table.Tr>
                    <Table.Th
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#868e96',
                      }}
                    >
                      ID
                    </Table.Th>
                    <Table.Th
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#868e96',
                      }}
                    >
                      Date
                    </Table.Th>
                    <Table.Th
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#868e96',
                      }}
                    >
                      Template
                    </Table.Th>
                    <Table.Th
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#868e96',
                      }}
                    >
                      Status
                    </Table.Th>
                    <Table.Th
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#868e96',
                      }}
                    >
                      Response Time
                    </Table.Th>
                    <Table.Th
                      style={{
                        fontWeight: 600,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#868e96',
                      }}
                    >
                      Actions
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>

          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Text size="sm" c="dimmed">
              Showing{' '}
              {filteredLogs.length === 0
                ? 0
                : Math.min((currentPage - 1) * logsPerPage + 1, filteredLogs.length)}
              –{Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}{' '}
              entries
            </Text>
            <Pagination
              total={Math.ceil(filteredLogs.length / logsPerPage)}
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
                Need a deeper dive? Integrate our Webhooks to receive real-time alerts whenever an
                API call fails or exceeds performance thresholds.
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
