import { Paper, Box, Menu, rem, Avatar, Text } from '@mantine/core';
import { IconDots, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useDrag } from 'react-dnd';

export default function TemplateItem({ id }: { id: number }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEMPLATE',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Paper ref={drag} p={20} withBorder mt={0} shadow="sm" style={{ opacity: isDragging ? 0.5 : 1 }}>
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
      <Text>lolo domine le monde</Text>
      <Text c={'gray'}>crée il y a 5 minutes</Text>
    </Paper>
  );
}
