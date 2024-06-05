import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import React from 'react';
import { BarChart } from '@mantine/charts';
import data from '../../mock/barData';
export default function Overiew() {
  return (
    <Stack>
      <Title>Overview</Title>
      <Title order={4}>4 used out 100</Title>
      <BarChart
        h={600}
        data={data}
        dataKey="month"
        series={[
          { name: 'Smartphones', color: 'violet.6' },
          { name: 'Laptops', color: 'blue.6' },
          { name: 'Tablets', color: 'teal.6' },
        ]}
        tickLine="y"
      />
      <Title>Quick Actions</Title>
      <Group gap={100} >
        {' '}
        <Group>
          {' '}
          <Title order={4}>Create new Template</Title> <Button>create</Button>{' '}
        </Group>{' '}
        <Group>
          {' '}
          <Title order={4}>Usage Logs</Title> <Button>open</Button>{' '}
        </Group>{' '}
      </Group>
    </Stack>
  );
}

Overiew.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
