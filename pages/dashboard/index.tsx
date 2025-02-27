import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Center, Group, Loader, Select, Stack, Title, rem } from '@mantine/core';
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
    <Stack>
      <Title>Overview</Title>
      <Group justify="space-between">
        <Title order={4}>Period</Title>
        <Select
          onChange={(option) => setPeriod(option || DEFAULT_PERIOD)}
          defaultValue={DEFAULT_PERIOD}
          data={['week', 'month', '3months', '6months', '1year']}
        />
      </Group>
      {fetchLogStatsRequestStatus === RequestStatus.InProgress ||
      fetchLogStatsRequestStatus === RequestStatus.NotStated ? (
        <Center h="95vh" w="100%">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <BarChart
          h={600}
          data={LogsStats}
          withTooltip={false}
          dataKey="date"
          yAxisLabel="count"
          series={[{ name: 'count', color: 'blue.6' }]}
          tickLine="y"
        />
      )}

      <Title>Quick Actions</Title>
      <Group
        style={{
          rowGap: rem(10),
          columnGap: rem(100),
        }}
      >
        <Group>
          <Title order={4}>Create new Template</Title>
          <Button onClick={() => router.push(Links.TEMPLATES)}>create</Button>
        </Group>
        <Group>
          <Title order={4}>Usage Logs</Title>
          <Button onClick={() => router.push(Links.LOGS)}>open</Button>
        </Group>
      </Group>
    </Stack>
  );
}

Overview.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
