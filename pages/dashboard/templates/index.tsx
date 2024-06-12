import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Group, Pagination, Stack, Title, rem } from '@mantine/core';
import TemplateItem from '@/components/TemplateItem/TemplateItem';
import AddTemplate from '@/modals/AddTemplate/AddTemplate';
import { useDisclosure } from '@mantine/hooks';
import NamespaceItem from '@/components/NamespaceItem/NamespaceItem';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';

const TemplateHome = () => {
  const [addTemplateOpened, { open: openAddTemplate, close: closeAddTemplate }] =
    useDisclosure(false);
  const [addNamespaceOpened, { open: openAddNamespace, close: closeAddNamespace }] =
    useDisclosure(false);
  return (
    <Stack h={'98vh'}>
      <AddTemplate opened={addTemplateOpened} onClose={closeAddTemplate} />
      <AddNamespace opened={addNamespaceOpened} onClose={closeAddNamespace} />
      <Group style={{ borderBottom : 2 ,borderColor : 'red' }} justify="space-between">
        <Title>Templates</Title>
        <Button onClick={() => openAddTemplate()}>create new template</Button>
      </Group>
      {/* Templates */}
      <Group  gap={4} flex={1}>
        {/* NameSpaces management */}
        <Stack px={rem(12)} gap={2} flex={1} w={'100%'}   h={'100%'}>
          {/* NameSpaces */}
          <NamespaceItem selected={false} />
          <NamespaceItem selected={true} />
          <NamespaceItem selected={false} />
          {/* NameSpaces management */}
          <Button onClick={openAddNamespace} size="xs" bg={'dark'} w={rem(164)}>
            Add namespace
          </Button>
          <Button size="xs" bg={'dark'} w={rem(164)}>
            Manage namespaces
          </Button>
        </Stack>
        {/* Templates element */}
        <Stack h={'100%'} flex={4}>
          <Group justify='flex-start' gap={6}>
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            <TemplateItem />
            {/* Pagination */}
          </Group>
          <Pagination style={{alignSelf : 'self-end'}}  total={10} />
        </Stack>
      </Group>
    </Stack>
  );
};

TemplateHome.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateHome;
