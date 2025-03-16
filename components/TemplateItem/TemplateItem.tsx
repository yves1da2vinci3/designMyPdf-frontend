import { useDrag } from 'react-dnd';
import { Paper, Box, Menu, Text, Group, ActionIcon } from '@mantine/core';
import { IconDots, IconTrash, IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';
import { TemplateDTO, templateApi } from '@/api/templateApi';
import { timeAgo } from '@/utils/formatDate';

import MiniPreview from '../MiniPreview/MiniPreview';

interface TemplateItemProps {
  id: number;
  template: TemplateDTO;
  DeleteTemplateFromClient: (id: number) => void;
}

export default function TemplateItem({
  id,
  template,
  DeleteTemplateFromClient,
}: TemplateItemProps) {
  const { name, CreatedAt, content, variables, fonts, uuid } = template;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEMPLATE',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const router = useRouter();

  const navigateToTemplate = () => {
    router.push(`/dashboard/templates/create/${uuid}`);
  };

  const deleteTemplate = async () => {
    try {
      await templateApi.deleteTemplate(id);
      DeleteTemplateFromClient(id);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  return (
    <Paper
      ref={drag}
      p="md"
      withBorder
      shadow="xs"
      radius="md"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        },
      }}
      onClick={navigateToTemplate}
    >
      <Group justify="space-between" mb="xs">
        <Text fw={500} lineClamp={1} style={{ flex: 1 }}>
          {name || 'Unnamed Template'}
        </Text>
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}>
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEdit size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                navigateToTemplate();
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                deleteTemplate();
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Box
        style={{
          flex: 1,
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px',
          border: '1px solid #eaeaea',
          background: '#f9f9f9',
        }}
      >
        <MiniPreview htmlContent={content || ''} data={variables || []} fonts={fonts || []} />
      </Box>

      <Group justify="space-between" mt="auto">
        <Text size="xs" c="dimmed">
          {timeAgo(CreatedAt || new Date().toISOString())}
        </Text>
      </Group>
    </Paper>
  );
}
