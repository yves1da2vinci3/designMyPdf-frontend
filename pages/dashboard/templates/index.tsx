import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Button,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import TemplateItem from '@/components/TemplateItem/TemplateItem';
import AddTemplate from '@/modals/AddTemplate/AddTemplate';
import { useDisclosure } from '@mantine/hooks';

const TemplateHome = () => {
  const [
    addTemplateOpened,
    { open: openAddTemplate, close: closeAddTemplate },
  ] = useDisclosure(false);
  return (
    <Stack>
      <AddTemplate opened={addTemplateOpened} onClose={closeAddTemplate}/>
      <Group justify="space-between">
        <Title>Templates</Title>
        <Button onClick={() => openAddTemplate()} >create new template</Button>
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
