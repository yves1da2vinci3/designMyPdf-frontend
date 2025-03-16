import React from 'react';
import { useDrop } from 'react-dnd';
import { Group, Text, Paper } from '@mantine/core';
import { IconFolderFilled } from '@tabler/icons-react';
import { NamespaceDTO } from '@/api/namespaceApi';
import { templateApi } from '@/api/templateApi';

interface NamespaceItemProps {
  id: number;
  selected: boolean;
  namespace: NamespaceDTO;
  setNamespaceId: (id: number) => void;
  updateOnClient: (id: number, namespaceId: number) => void;
}

function NamespaceItem({
  id,
  namespace,
  setNamespaceId,
  updateOnClient,
  selected = false,
}: NamespaceItemProps) {
  const { name } = namespace;

  const [{ isOver }, drop] = useDrop(() => ({
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
    } catch (error) {
      // Handle error if needed
    }
  };

  return (
    <Paper
      ref={drop}
      p="xs"
      withBorder={selected}
      bg={
        isOver
          ? 'green.0'
          : selected
            ? 'blue.0'
            : 'transparent'
      }
      style={{
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
      }}
      onClick={() => setNamespaceId(namespace.ID)}
    >
      <Group>
        <IconFolderFilled
          size={18}
          color={selected ? '#228be6' : '#868e96'}
        />
        <Text size="sm">{name}</Text>
      </Group>
    </Paper>
  );
}

export default NamespaceItem;
