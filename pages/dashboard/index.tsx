import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Anchor,
  Box,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import {
  IconAlertCircle,
  IconClock,
  IconCurrencyDollar,
  IconExternalLink,
  IconFileText,
  IconReceipt,
} from '@tabler/icons-react';
import { HttpStatusCode } from 'axios';
import { LogDTO, LogStatDTO, logApi } from '@/api/logApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';
import DashboardLayout from '@/layouts/DashboardLayout';
import getFilledStats from '@/utils/filledStats';
import { filterLogsByApiPeriod } from '@/utils/logPeriodFilter';
import { ensureArray } from '@/utils/ensureArray';
import QueryState from '@/components/QueryState/QueryState';
import { useAiCredits } from '@/hooks/useAiCredits';
import AiCreditsBadge from '@/components/AiCreditsBadge/AiCreditsBadge';

const DEFAULT_PERIOD = '7d';

const PERIOD_OPTIONS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '1 Year', value: '1year' },
];

const API_PERIOD_MAP: Record<string, string> = {
  '7d': 'week',
  '30d': 'month',
  '3months': '3months',
  '6months': '6months',
  '1year': '1year',
};

export default function Overview() {
  const [LogsStats, setLogStats] = useState<LogStatDTO[]>([]);
  const [allLogs, setAllLogs] = useState<LogDTO[]>([]);
  const [fetchLogStatsRequestStatus, setFetchLogStatsRequestStatus] = useState(
    RequestStatus.NotStated,
  );
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const router = useRouter();
  const aiCredits = useAiCredits();

  const fetchLogStats = useCallback(async () => {
    setFetchLogStatsRequestStatus(RequestStatus.InProgress);
    try {
      const apiPeriod = API_PERIOD_MAP[period] || 'week';
      const [logStats, fetchedLogs] = await Promise.all([
        logApi.getLogsStats(apiPeriod),
        logApi.getLogs(),
      ]);
      const newLogs = ensureArray(logStats);
      const filledStats = getFilledStats(newLogs, apiPeriod);
      setLogStats(filledStats);
      setAllLogs(ensureArray(fetchedLogs));
      setFetchLogStatsRequestStatus(RequestStatus.Succeeded);
    } catch {
      setFetchLogStatsRequestStatus(RequestStatus.Failed);
    }
  }, [period]);

  useEffect(() => {
    void fetchLogStats();
  }, [fetchLogStats]);

  const totalGenerated = LogsStats.reduce((sum, s) => sum + (s.count || 0), 0);

  const apiPeriodForFilter = API_PERIOD_MAP[period] || 'week';
  const logsInPeriod = useMemo(
    () => filterLogsByApiPeriod(allLogs, apiPeriodForFilter),
    [allLogs, apiPeriodForFilter],
  );

  const errorCount = useMemo(
    () => logsInPeriod.filter((l) => l.status_code !== HttpStatusCode.Ok).length,
    [logsInPeriod],
  );

  const errorRate = useMemo(() => {
    if (logsInPeriod.length === 0) return '0.00%';
    return `${((errorCount / logsInPeriod.length) * 100).toFixed(2)}%`;
  }, [logsInPeriod, errorCount]);

  const recentErrorLogs = useMemo(
    () =>
      [...logsInPeriod]
        .filter((l) => l.status_code !== HttpStatusCode.Ok)
        .sort((a, b) => new Date(b.called_at).getTime() - new Date(a.called_at).getTime())
        .slice(0, 3),
    [logsInPeriod],
  );

  const chartData = LogsStats.map((s) => ({
    date: s.date,
    Requests: s.count,
  }));

  const isLoading =
    fetchLogStatsRequestStatus === RequestStatus.InProgress ||
    fetchLogStatsRequestStatus === RequestStatus.NotStated;
  const isFailed = fetchLogStatsRequestStatus === RequestStatus.Failed;

  if (isFailed) {
    return (
      <Stack gap="xl">
        <Title order={2} fw={700}>
          Overview
        </Title>
        <QueryState
          status={RequestStatus.Failed}
          errorMessage="Unable to load overview statistics. Please try again."
          onRetry={() => void fetchLogStats()}
          minHeight={240}
        >
          {null}
        </QueryState>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Box style={{ minWidth: 0 }}>
          <Title order={2} fw={700}>
            Overview
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Track your generation performance in real-time.
          </Text>
        </Box>
        <Group gap="xs" wrap="wrap" style={{ flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            data={PERIOD_OPTIONS}
            size="sm"
            fullWidth
            maw={{ base: '100%', sm: 420 }}
          />
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="blue" radius="md">
              <IconReceipt size={16} />
            </ThemeIcon>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Total PDFs Generated
          </Text>
          <Text fw={700} fz={26}>
            {isLoading ? '—' : totalGenerated.toLocaleString()}
          </Text>
        </Card>

        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="cyan" radius="md">
              <IconClock size={16} />
            </ThemeIcon>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Avg Render Time
          </Text>
          <Text fw={700} fz={26}>
            —
          </Text>
          <Text size="xs" c="dimmed" mt={6}>
            La durée des appels n&apos;est pas enregistrée par l&apos;API.
          </Text>
        </Card>

        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="orange" radius="md">
              <IconAlertCircle size={16} />
            </ThemeIcon>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Error Rate
          </Text>
          <Text fw={700} fz={26}>
            {isLoading ? '—' : errorRate}
          </Text>
        </Card>

        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="grape" radius="md">
              <IconCurrencyDollar size={16} />
            </ThemeIcon>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Estimated Cost
          </Text>
          <Text fw={700} fz={26}>
            —
          </Text>
          <Text size="xs" c="dimmed" mt={6}>
            Aucune donnée de facturation n&apos;est exposée pour l&apos;instant.
          </Text>
        </Card>
      </SimpleGrid>

      {isLoading ? (
        <Center h={400}>
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder radius="md" shadow="xs" p="lg">
              <Box mb="md">
                <Text fw={600} size="sm">
                  Generation Activity
                </Text>
                <Text size="xs" c="dimmed">
                  Hourly volumes over the selected period
                </Text>
              </Box>
              <BarChart
                h={300}
                data={chartData}
                withTooltip
                dataKey="date"
                series={[{ name: 'Requests', color: 'blue.6' }]}
                tickLine="y"
              />
            </Card>

            <Grid mt="xl" gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Card withBorder radius="md" shadow="xs" p="lg" style={{ minHeight: 160 }}>
                  <Group justify="space-between" mb="sm">
                    <Text fw={600} size="sm">
                      Your Templates
                    </Text>
                    <Anchor size="xs" onClick={() => router.push(Links.TEMPLATES)}>
                      View all →
                    </Anchor>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Manage and organize your PDF generation templates.
                  </Text>
                  <Button
                    size="xs"
                    variant="light"
                    mt="md"
                    onClick={() => router.push(Links.TEMPLATES)}
                    leftSection={<IconFileText size={14} />}
                  >
                    Open Templates
                  </Button>
                </Card>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Card withBorder radius="md" shadow="xs" p="lg" style={{ minHeight: 160 }}>
                  <Group justify="space-between" mb="sm">
                    <Text fw={600} size="sm">
                      Error Log
                    </Text>
                    <Anchor size="xs" onClick={() => router.push(Links.LOGS)}>
                      View all →
                    </Anchor>
                  </Group>
                  {recentErrorLogs.length === 0 ? (
                    <Text size="xs" c="dimmed">
                      No recent errors.
                    </Text>
                  ) : (
                    <Stack gap={6} mt={4}>
                      {recentErrorLogs.map((l) => (
                        <Group key={l.id} gap={6}>
                          <IconAlertCircle size={12} color="red" />
                          <Text size="xs" c="red">
                            {l.status_code}: {l.error_message || 'Error'}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  )}
                </Card>
              </Grid.Col>
            </Grid>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <AiCreditsBadge
                variant="card"
                remaining={aiCredits.remaining}
                limit={aiCredits.limit}
                used={aiCredits.used}
                month={aiCredits.month}
                loading={aiCredits.loading}
              />

              <Card withBorder radius="md" shadow="xs" p="lg">
                <Text fw={600} size="sm" mb="sm">
                  Infrastructure
                </Text>
                <Text size="sm" c="dimmed">
                  Aucun état d&apos;infrastructure ni taux de disponibilité n&apos;est remonté au
                  tableau de bord.
                </Text>
              </Card>

              <Paper
                radius="md"
                p="lg"
                style={{
                  background: 'linear-gradient(135deg, #1a1b2e 0%, #16213e 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 120,
                    height: 120,
                    background: 'radial-gradient(circle, rgba(34,139,230,0.3) 0%, transparent 70%)',
                  }}
                />
                <Text fw={700} size="sm" c="white" mb={4}>
                  Marketplace
                </Text>
                <Text size="xs" c="blue.3" mb="md">
                  Catalogue public ou gestion de vos annonces.
                </Text>
                <Group gap="md">
                  <Anchor size="xs" fw={600} c="blue.4" href={Links.MARKETPLACE}>
                    Mes annonces <IconExternalLink size={10} style={{ verticalAlign: 'middle' }} />
                  </Anchor>
                  <Anchor size="xs" fw={600} c="blue.1" href="/marketplace">
                    Catalogue <IconExternalLink size={10} style={{ verticalAlign: 'middle' }} />
                  </Anchor>
                </Group>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}

Overview.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
