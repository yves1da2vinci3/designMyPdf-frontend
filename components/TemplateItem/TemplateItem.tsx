import { TemplateDTO } from '@/api/templateApi';
import { timeAgo } from '@/utils/formatDate';
import { Paper, Box, Menu, rem, Avatar, Text } from '@mantine/core';
import { IconDots, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';
import { useDrag } from 'react-dnd';

interface TemplateItemProps {
  id: number;
  template: TemplateDTO;
}

export default function TemplateItem({ id, template }: TemplateItemProps) {
  const { name, CreatedAt } = template;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEMPLATE',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const router = useRouter();
  const navigateToTemplate = () => {
    router.push(`/dashboard/templates/create/${id}`);
  };
  return (
    <Paper
      ref={drag}
      p={20}
      withBorder
      mt={0}
      shadow="sm"
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'pointer' }}
      onClick={() => navigateToTemplate()}
    >
      <Box style={{ position: 'relative' }}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <IconDots style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }} />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              color="red"
              leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Avatar w={'100%'} h={122} radius={0} />
      </Box>
      <Text>{name}</Text>
      <Text c={'gray'}>created {timeAgo(CreatedAt)}</Text>
    </Paper>
  );
}
