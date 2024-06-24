import { TemplateDTO, templateApi } from '@/api/templateApi';
import { timeAgo } from '@/utils/formatDate';
import { Paper, Box, Menu, rem, Text } from '@mantine/core';
import { IconDots, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';
import { useDrag } from 'react-dnd';
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
  const { name, CreatedAt, content, variables, fonts } = template; // Destructure additional fields as needed
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
      p={20}
      withBorder
      mt={0}
      w={'30%'}
      h={200}
      shadow="sm"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Box style={{ position: 'relative' }}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <IconDots style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }} />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              onClick={() => deleteTemplate()}
              color="red"
              leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Box style={{ cursor: 'pointer' }} onClick={() => navigateToTemplate()}>
          <MiniPreview htmlContent={content} data={variables} fonts={fonts} />
        </Box>
      </Box>
      <Text>{name}</Text>
      <Text c={'gray'}>created {timeAgo(CreatedAt)}</Text>
    </Paper>
  );
}
