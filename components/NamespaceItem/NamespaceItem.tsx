import React from 'react';
import { useDrop } from 'react-dnd';
import { Group, Text, Paper, useMantineTheme } from '@mantine/core';
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
  const theme = useMantineTheme();
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
          ? theme.colors.green[0]
          : selected
            ? theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background
            : 'transparent'
      }
      style={{
        cursor: 'pointer',
        borderRadius: theme.radius.sm,
        transition: 'background-color 0.2s',
      }}
      onClick={() => setNamespaceId(namespace.ID)}
    >
      <Group gap="xs">
        <IconFolderFilled
          size={18}
          color={selected ? theme.colors[theme.primaryColor][6] : theme.colors.gray[6]}
        />
        <Text size="sm" fw={selected ? 500 : 400}>
          {name}
        </Text>
      </Group>
    </Paper>
  );
}

export default NamespaceItem;
