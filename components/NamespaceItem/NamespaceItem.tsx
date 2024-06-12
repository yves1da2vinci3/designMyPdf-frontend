import { Group, Text, rem, useMantineTheme } from '@mantine/core';
import { IconFolderFilled } from '@tabler/icons-react';
import React, { FC } from 'react';

interface NamespaceItemProps {
  selected: boolean;
}

const NamespaceItem: FC<NamespaceItemProps> = ({ selected = false }) => {
    const theme = useMantineTheme();
  return (
    <Group
      component={'button'}
      style={{ borderRadius: rem(8), borderColor: 'var(--mantine-color-red)' }}
      variant="light"
      c={'white'}
      px={rem(12)}
      h={rem(44)}
      bg={selected ? theme.colors.blue[5] : theme.colors.blue[2]}
    >
      <IconFolderFilled />
      <Text fw={'bold'}>Namespace</Text>
    </Group>
  );
};

export default NamespaceItem;
