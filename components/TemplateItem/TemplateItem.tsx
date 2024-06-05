import { Paper, Box, Menu, rem, Avatar, Text } from '@mantine/core';
import { IconDots, IconTrash } from '@tabler/icons-react';
import React from 'react';

export default function TemplateItem() {
  return (
    <Paper p={20} withBorder shadow="sm">
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
        <Avatar w={'100%'} h={152} radius={0} />
      </Box>
      <Text>lolo domine le monde</Text>
      <Text c={'gray'}>crée il y a 5 minutes</Text>
    </Paper>
  );
}
