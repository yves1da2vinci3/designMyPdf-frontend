import React from 'react';
import { Avatar, Box, Group, Text } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';
import type { ChatMessage } from '@/lib/aiGeneration/types';
import ToolCallPills from './ToolCallPills';

interface AiChatMessageProps {
  message: ChatMessage;
}

export default function AiChatMessage({ message }: AiChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'flex-end' }} mb={12}>
        <Box
          px="md"
          py="sm"
          style={{
            backgroundColor: '#3B82F6',
            borderRadius: '18px 18px 4px 18px',
            maxWidth: '80%',
          }}
        >
          <Text size="sm" c="white" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content}
          </Text>
          {message.imageUrls && message.imageUrls.length > 0 && (
            <Text size="xs" c="rgba(255,255,255,0.7)" mt={4}>
              {message.imageUrls.length} image{message.imageUrls.length > 1 ? 's' : ''} jointe
              {message.imageUrls.length > 1 ? 's' : ''}
            </Text>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box mb={16}>
      <Group align="flex-start" gap="xs" wrap="nowrap">
        <Avatar
          size={32}
          radius="xl"
          style={{ backgroundColor: '#25262B', border: '1px solid #373A40', flexShrink: 0 }}
        >
          <IconRobot size={18} color="#909296" />
        </Avatar>
        <Box style={{ flex: 1, minWidth: 0 }}>
          {message.toolCalls && message.toolCalls.length > 0 && (
            <ToolCallPills steps={message.toolCalls} />
          )}
          {message.content && (
            <Text
              size="sm"
              c="dimmed"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
            >
              {message.content}
            </Text>
          )}
        </Box>
      </Group>
    </Box>
  );
}
