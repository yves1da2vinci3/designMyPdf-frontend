import { useDrag } from 'react-dnd';
import {
  Paper,
  Box,
  Menu,
  Text,
  Group,
  ActionIcon,
  Image,
  Modal,
  Button,
  Tooltip,
} from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconCheck,
  IconCopy,
  IconDots,
  IconTrash,
  IconEdit,
  IconExternalLink,
  IconPencil,
  IconArrowsMaximize,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';
import { TemplateDTO, templateApi } from '@/api/templateApi';
import { timeAgo } from '@/utils/formatDate';
import notificationService from '@/services/NotificationService';

import MiniPreview from '../MiniPreview/MiniPreview';
import MiniPreviewBook from '../MiniPreview/MiniPreviewBook';

interface TemplateItemProps {
  id: number;
  template: TemplateDTO;
  DeleteTemplateFromClient: (id: number) => void;
  onRename?: (template: TemplateDTO) => void;
}

export default function TemplateItem({
  id,
  template,
  DeleteTemplateFromClient,
  onRename,
}: TemplateItemProps) {
  const { name, CreatedAt, content, variables, fonts, uuid, preview, cover_image_url } = template;
  const thumbnailSrc = (cover_image_url || preview || '').trim();
  const clipboardUUID = useClipboard({ timeout: 1500 });
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TEMPLATE',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const router = useRouter();
  const [previewOpen, { open: openPreview, close: closePreview }] = useDisclosure(false);

  const navigateToTemplate = () => {
    router.push(`/dashboard/templates/create/${uuid}`);
  };

  const openInNewTab = () => {
    if (!uuid) return;
    window.open(`/dashboard/templates/create/${uuid}`, '_blank', 'noopener,noreferrer');
  };

  const deleteTemplate = async () => {
    try {
      await templateApi.deleteTemplate(id);
      DeleteTemplateFromClient(id);
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Unable to delete template';
      notificationService.showErrorNotification(message);
    }
  };

  const confirmDelete = () => {
    modals.openConfirmModal({
      title: 'Delete template',
      centered: true,
      children: (
        <Text size="sm">
          Delete <strong>{name || 'this template'}</strong>? This cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => void deleteTemplate(),
    });
  };

  return (
    <Paper
      ref={drag}
      p="sm"
      withBorder
      shadow="xs"
      radius="md"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
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
      <Group justify="space-between" mb={4}>
        <Text fw={500} lineClamp={1} style={{ flex: 1 }}>
          {name || 'Unnamed Template'}
        </Text>
        <Menu shadow="md" width={200} position="bottom-end" id="template-actions">
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              aria-label="Template actions"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
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
            <Menu.Item
              leftSection={<IconExternalLink size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                openInNewTab();
              }}
            >
              Open in new tab
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPencil size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onRename?.(template);
              }}
            >
              Rename
            </Menu.Item>
            <Menu.Item
              leftSection={
                clipboardUUID.copied ? <IconCheck size={14} color="teal" /> : <IconCopy size={14} />
              }
              onClick={(e) => {
                e.stopPropagation();
                clipboardUUID.copy(uuid);
              }}
            >
              {clipboardUUID.copied ? 'Copied!' : 'Copy template ID'}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete();
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Box
        h={112}
        mb={4}
        style={{
          position: 'relative',
          flexShrink: 0,
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #eaeaea',
          background: '#f9f9f9',
        }}
      >
        <Tooltip label="Aperçu plein écran">
          <ActionIcon
            variant="filled"
            color="dark"
            size="sm"
            aria-label="Aperçu plein écran"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              zIndex: 2,
              opacity: 0.9,
            }}
            onClick={(e) => {
              e.stopPropagation();
              openPreview();
            }}
          >
            <IconArrowsMaximize size={14} />
          </ActionIcon>
        </Tooltip>
        {thumbnailSrc ? (
          <Image src={thumbnailSrc} alt="" fit="cover" h="100%" w="100%" />
        ) : (
          <MiniPreview htmlContent={content || ''} data={variables || {}} fonts={fonts || []} />
        )}
      </Box>

      <Modal
        opened={previewOpen}
        onClose={closePreview}
        fullScreen
        title={name || 'Aperçu'}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        transitionProps={{ onEntered: () => window.dispatchEvent(new Event('resize')) }}
      >
        <Box
          style={{
            height: 'calc(100dvh - 120px)',
            minHeight: 400,
            border: '1px solid #eaeaea',
            borderRadius: 8,
            overflow: 'hidden',
            background: '#e9ecef',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {previewOpen ? (
            content?.trim() ? (
              <MiniPreviewBook
                key={`book-${id}`}
                htmlContent={content}
                data={(variables as Record<string, unknown>) || {}}
                fonts={fonts || []}
              />
            ) : thumbnailSrc ? (
              <Image src={thumbnailSrc} alt="" fit="contain" h="100%" w="100%" />
            ) : null
          ) : null}
        </Box>
        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={closePreview}>
            Fermer
          </Button>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => {
              closePreview();
              navigateToTemplate();
            }}
          >
            Éditer
          </Button>
        </Group>
      </Modal>

      <Text size="xs" c="dimmed" mt={2}>
        {timeAgo(CreatedAt || new Date().toISOString())}
      </Text>
    </Paper>
  );
}
