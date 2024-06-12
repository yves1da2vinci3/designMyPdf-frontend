import { Group, Text, rem, useMantineTheme } from '@mantine/core';
import { IconFolderFilled } from '@tabler/icons-react';
import React, { FC } from 'react';
import { useDrop } from 'react-dnd';


interface NamespaceItemProps {
  id : number
  selected : boolean
}
const NamespaceItem : FC<NamespaceItemProps> = ({ id, selected = false }) => {
  const theme = useMantineTheme();
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'TEMPLATE',
    drop: (item:{id:number}) => handleDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleDrop = (templateId:number) => {
    console.log(`Dropped template ${templateId} into namespace ${id}`);
    // Handle the drop action here (e.g., update state or dispatch an action)
  };

  return (
    <Group
      ref={drop}
      component={'button'}
      style={{
        borderRadius: rem(8),
        borderColor: 'var(--mantine-color-red)',
        backgroundColor: isOver ? 'lightgreen' : selected ? theme.colors.blue[5] : theme.colors.blue[2],
      }}
      variant="light"
      c={'white'}
      px={rem(12)}
      h={rem(44)}
    >
      <IconFolderFilled />
      <Text fw={'bold'}>Namespace</Text>
    </Group>
  );
};

export default NamespaceItem;
