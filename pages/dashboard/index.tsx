import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Card,
  Grid,
  Stack,
  Text,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { LogStatDTO, logApi } from '@/api/logApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';
import DashboardLayout from '@/layouts/DashboardLayout';
import getFilledStats from '@/utils/filledStats';

const DEFAULT_PERIOD = 'week';

export default function Overview() {
  const [LogsStats, setLogStats] = useState<LogStatDTO[]>([]);
  const [fetchLogStatsRequestStatus, setFetchLogStatsRequestStatus] = useState(
    RequestStatus.NotStated,
  );
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const router = useRouter();
  const theme = useMantineTheme();

  const fetchLogStats = async () => {
    setFetchLogStatsRequestStatus(RequestStatus.InProgress);
    try {
      const logStats = await logApi.getLogsStats(period);
      const newLogs = logStats || [];
      const filledStats = getFilledStats(newLogs, period);
      setLogStats(filledStats);
      setFetchLogStatsRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      setFetchLogStatsRequestStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchLogStats();
  }, [period]);

  return (
    <Stack p="md" gap="lg">
      <Title order={2} mb="xs">
        Overview
      </Title>
      <Paper p="md" shadow="sm" withBorder>
        <Group justify="space-between" align="center">
          <Title order={5} mb="xs">
            Select Period
          </Title>
          <Select
            onChange={(option) => setPeriod(option || DEFAULT_PERIOD)}
            defaultValue={DEFAULT_PERIOD}
            data={['week', 'month', '3months', '6months', '1year']}
            style={{ width: rem(200) }}
          />
        </Group>
      </Paper>
      {fetchLogStatsRequestStatus === RequestStatus.InProgress ||
      fetchLogStatsRequestStatus === RequestStatus.NotStated ? (
        <Center h="calc(100vh - var(--app-shell-header-height, 0px) - 200px)" w="100%">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Paper p="md" shadow="sm" withBorder>
          <Title order={3} mb="md">
            Usage Statistics
          </Title>
          <BarChart
            h={300}
            data={LogsStats}
            withTooltip
            dataKey="date"
            yAxisLabel="API Calls"
            series={[{ name: 'count', color: theme.colors.blue[6] }]}
            tickLine="y"
          />
        </Paper>
      )}

      <Title order={3} mt="lg" mb="md">
        Quick Actions
      </Title>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={4} mb="sm">
              Create New Template
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Start building powerful and reusable message templates.
            </Text>
            <Button
              variant="light"
              color="blue"
              fullWidth
              mt="md"
              radius="md"
              onClick={() => router.push(Links.TEMPLATES)}
            >
              Create Template
            </Button>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={4} mb="sm">
              View Usage Logs
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Review your API call history and monitor your usage.
            </Text>
            <Button
              variant="light"
              color="blue"
              fullWidth
              mt="md"
              radius="md"
              onClick={() => router.push(Links.LOGS)}
            >
              Open Logs
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

Overview.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
