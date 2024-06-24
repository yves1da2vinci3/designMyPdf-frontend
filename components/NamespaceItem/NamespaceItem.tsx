import { NamespaceDTO } from '@/api/namespaceApi';
import { templateApi } from '@/api/templateApi';
import { limitText } from '@/utils/formatDate';
import { Group, Text, rem, useMantineTheme } from '@mantine/core';
import { IconFolderFilled } from '@tabler/icons-react';
import React, { FC } from 'react';
import { useDrop } from 'react-dnd';

interface NamespaceItemProps {
  id: number;
  selected: boolean;
  namespace: NamespaceDTO;
  setNamespaceId: (id: number) => void;
  updateOnClient : (id :number,namespaceId :number) => void;
}
const NamespaceItem: FC<NamespaceItemProps> = ({
  id,
  namespace,
  setNamespaceId,
  updateOnClient,
  selected = false,
}: NamespaceItemProps) => {
  const theme = useMantineTheme();
  const { name } = namespace;
  console.log('from namespace : ', namespace);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'TEMPLATE',
    drop: (item: { id: number }) => handleDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleDrop = async (templateId: number) => {
    try {
      await templateApi.changeTemplateNamespace(templateId, id);
      updateOnClient(templateId, id);
    } catch (error) {}
    console.log(`Dropped template ${templateId} into namespace ${id}`);
  };

  return (
    <Group
      onClick={() => setNamespaceId(namespace.ID)}
      ref={drop}
      component={'button'}
      style={{
        borderRadius: rem(8),
        borderColor: 'var(--mantine-color-red)',
        backgroundColor: isOver
          ? 'lightgreen'
          : selected
            ? theme.colors.blue[5]
            : theme.colors.blue[2],
      }}
      variant="light"
      c={'white'}
      px={rem(12)}
      h={rem(44)}
    >
      <IconFolderFilled />
      <Text fw={'bold'}>{limitText(name, 10)}</Text>
    </Group>
  );
};

export default NamespaceItem;
