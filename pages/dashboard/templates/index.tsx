import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Button,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import TemplateItem from '@/components/TemplateItem/TemplateItem';

const TemplateHome = () => {
  return (
    <Stack>
      <Group justify="space-between">
        <Title>Templates</Title>
        <Button>create new template</Button>
      </Group>
      {/* Templates */}
      <Group>
       <TemplateItem/>
       <TemplateItem/>
      </Group>
    </Stack>
  );
};

TemplateHome.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateHome;
