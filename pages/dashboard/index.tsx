import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
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
  IconCalendar,
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
  const [recentLogs, setRecentLogs] = useState<LogDTO[]>([]);
  const [fetchLogStatsRequestStatus, setFetchLogStatsRequestStatus] = useState(
    RequestStatus.NotStated,
  );
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const router = useRouter();

  const fetchLogStats = async () => {
    setFetchLogStatsRequestStatus(RequestStatus.InProgress);
    try {
      const apiPeriod = API_PERIOD_MAP[period] || 'week';
      const logStats = await logApi.getLogsStats(apiPeriod);
      const newLogs = logStats || [];
      const filledStats = getFilledStats(newLogs, apiPeriod);
      setLogStats(filledStats);

      const fetchedLogs = await logApi.getLogs();
      setAllLogs(fetchedLogs);
      setRecentLogs(fetchedLogs.slice(0, 3));

      setFetchLogStatsRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      setFetchLogStatsRequestStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchLogStats();
  }, [period]);

  const totalGenerated = LogsStats.reduce((sum, s) => sum + (s.count || 0), 0);

  const errorCount = allLogs.filter((l) => l.status_code !== HttpStatusCode.Ok).length;
  const errorRate =
    allLogs.length > 0 ? `${((errorCount / allLogs.length) * 100).toFixed(2)}%` : '0.00%';

  const chartData = LogsStats.map((s) => ({
    date: s.date,
    Requests: s.count,
  }));

  const isLoading =
    fetchLogStatsRequestStatus === RequestStatus.InProgress ||
    fetchLogStatsRequestStatus === RequestStatus.NotStated;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} fw={700}>
            Overview
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Track your generation performance in real-time.
          </Text>
        </Box>
        <Group gap="xs">
          <SegmentedControl value={period} onChange={setPeriod} data={PERIOD_OPTIONS} size="sm" />
          <Button variant="light" size="sm" px="xs">
            <IconCalendar size={16} />
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={4}>
        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="blue" radius="md">
              <IconReceipt size={16} />
            </ThemeIcon>
            <Badge color="teal" variant="light" size="xs">
              +12%
            </Badge>
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
            <Badge color="teal" variant="light" size="xs">
              -40ms
            </Badge>
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
            320ms
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
            <Text size="xs" c="dimmed">
              Budget
            </Text>
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
            Free
          </Text>
        </Card>
      </SimpleGrid>

      {isLoading ? (
        <Center h={400}>
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Grid gutter="xl">
          <Grid.Col span={8}>
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
              <Grid.Col span={6}>
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
              <Grid.Col span={6}>
                <Card withBorder radius="md" shadow="xs" p="lg" style={{ minHeight: 160 }}>
                  <Group justify="space-between" mb="sm">
                    <Text fw={600} size="sm">
                      Error Log
                    </Text>
                    <Anchor size="xs" onClick={() => router.push(Links.LOGS)}>
                      View all →
                    </Anchor>
                  </Group>
                  {recentLogs.filter((l) => l.status_code !== HttpStatusCode.Ok).length === 0 ? (
                    <Text size="xs" c="dimmed">
                      No recent errors.
                    </Text>
                  ) : (
                    <Stack gap={6} mt={4}>
                      {recentLogs
                        .filter((l) => l.status_code !== HttpStatusCode.Ok)
                        .map((l) => (
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

          <Grid.Col span={4}>
            <Stack gap="md">
              <Card withBorder radius="md" shadow="xs" p="lg">
                <Text fw={600} size="sm" mb="md">
                  Plan Usage
                </Text>
                <Stack gap="sm">
                  <Box>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs">Generations</Text>
                      <Text size="xs" fw={600}>
                        82%
                      </Text>
                    </Group>
                    <Progress value={82} color="blue" radius="xl" size="sm" />
                    <Text size="xs" c="dimmed" mt={4}>
                      41,000 / 50,000 requests
                    </Text>
                  </Box>
                  <Box>
                    <Group justify="space-between" mb={4}>
                      <Text size="xs">S3 Storage</Text>
                      <Text size="xs" fw={600}>
                        45%
                      </Text>
                    </Group>
                    <Progress value={45} color="blue" radius="xl" size="sm" />
                    <Text size="xs" c="dimmed" mt={4}>
                      2.2 GB / 5 GB
                    </Text>
                  </Box>
                </Stack>
                <Button variant="outline" fullWidth mt="lg" size="xs">
                  Upgrade Plan
                </Button>
              </Card>

              <Card withBorder radius="md" shadow="xs" p="lg">
                <Text fw={600} size="sm" mb="md">
                  Infrastructure Status
                </Text>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap={8}>
                      <Box
                        w={8}
                        h={8}
                        style={{ borderRadius: '50%', backgroundColor: '#12b886' }}
                      />
                      <Text size="sm">PDF Engine API</Text>
                    </Group>
                    <Badge color="teal" variant="light" size="xs">
                      Stable
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Group gap={8}>
                      <Box
                        w={8}
                        h={8}
                        style={{ borderRadius: '50%', backgroundColor: '#12b886' }}
                      />
                      <Text size="sm">Template Renderer</Text>
                    </Group>
                    <Badge color="teal" variant="light" size="xs">
                      99.9%
                    </Badge>
                  </Group>
                </Stack>
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
                  Explore Marketplace
                </Text>
                <Text size="xs" c="blue.3" mb="md">
                  Discover premium templates.
                </Text>
                <Anchor size="xs" fw={600} c="blue.4" href="/marketplace">
                  Explore <IconExternalLink size={10} style={{ verticalAlign: 'middle' }} />
                </Anchor>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}

Overview.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
