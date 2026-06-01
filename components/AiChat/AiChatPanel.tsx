import React, { useCallback, useEffect, useRef } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPaperclip, IconRobot, IconSend, IconX } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';
import type { AiStep, ChatMessage } from '@/lib/aiGeneration/types';
import { formatAiBudgetLabel, getChatImageModeHint } from '@/lib/aiGeneration/chatImageMode';
import {
  getAiCreditsUsedPercent,
  getAiCreditsWarningBanner,
  getAiCreditsWarningTier,
} from '@/lib/aiGeneration/aiCreditsWarnings';
import { runChatStream } from '@/lib/aiGeneration/runChatStream';
import AiChatMessage from './AiChatMessage';

interface AiChatPanelProps {
  currentHtml: string;
  variables: Record<string, unknown>;
  format: string;
  isLandscape: boolean;
  pdfContentPadding: string;
  creditsUsed: number;
  creditsLimit: number;
  creditsRemaining: number;
  uploadedUrls: string[];
  isUploading: boolean;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
  onDrop: (files: File[]) => void;
  onClearImages: () => void;
  onRemoveImage?: (index: number) => void;
  onResultApply: (content: string, variables: Record<string, unknown>, landscape: boolean) => void;
  onCreditsRefresh?: () => void;
  onClearConversation?: () => void;
}

const WELCOME_MESSAGE = `Bonjour ! Demande-moi de concevoir ou modifier le document. Je peux éditer le HTML, changer le framework CSS, ajouter des Google Fonts, définir des variables d'exemple, et sauvegarder quand tu es satisfait.`;

export default function AiChatPanel({
  currentHtml,
  variables,
  format,
  isLandscape,
  pdfContentPadding,
  creditsUsed,
  creditsLimit,
  creditsRemaining,
  uploadedUrls,
  isUploading,
  messages,
  setMessages,
  inputText,
  setInputText,
  onDrop,
  onClearImages,
  onRemoveImage,
  onResultApply,
  onCreditsRefresh,
  onClearConversation,
}: AiChatPanelProps) {
  const creditsUsedPercent = getAiCreditsUsedPercent(creditsUsed, creditsLimit);
  const creditsWarningTier = getAiCreditsWarningTier(creditsUsedPercent);
  const creditsWarningBanner = creditsWarningTier
    ? getAiCreditsWarningBanner(creditsWarningTier)
    : null;
  const [isGenerating, setIsGenerating] = React.useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropzoneOpenRef = useRef<() => void>(null);

  const imageModeHint = getChatImageModeHint(uploadedUrls.length);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversationHistory = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isGenerating) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      imageUrls: uploadedUrls.length > 0 ? [...uploadedUrls] : undefined,
      timestamp: Date.now(),
    };

    const assistantId = uuidv4();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputText('');
    setIsGenerating(true);

    const updateAssistant = (patch: Partial<ChatMessage>) => {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)));
    };

    try {
      const result = await runChatStream(
        {
          message: text,
          currentHtml: currentHtml || undefined,
          variables,
          conversationHistory,
          imageUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
          format,
          isLandscape,
          pdfContentPadding,
        },
        (steps: AiStep[]) => {
          updateAssistant({ toolCalls: steps });
        },
        (fullText: string) => {
          updateAssistant({ content: fullText });
        },
      );

      updateAssistant({
        content: result.responseText || '',
        toolCalls: result.toolCalls,
      });

      onResultApply(result.content, result.suggestedVariables, result.recommendedLandscape);
      onCreditsRefresh?.();

      if (uploadedUrls.length > 0) {
        onClearImages();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.';
      updateAssistant({ content: `❌ ${message}`, toolCalls: [] });
    } finally {
      setIsGenerating(false);
    }
  }, [
    inputText,
    isGenerating,
    uploadedUrls,
    currentHtml,
    variables,
    conversationHistory,
    format,
    isLandscape,
    pdfContentPadding,
    onResultApply,
    onClearImages,
    setMessages,
    setInputText,
    onCreditsRefresh,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 60px)',
        backgroundColor: '#1A1B1E',
      }}
    >
      {/* Credits + mode strip */}
      <Box
        px="md"
        py={8}
        style={{
          borderBottom: '1px solid #373A40',
          backgroundColor: '#25262B',
        }}
      >
        <Group justify="space-between" gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed">
            {formatAiBudgetLabel(creditsRemaining, creditsLimit)}
          </Text>
          {messages.length > 0 && onClearConversation ? (
            <Text
              size="xs"
              c="blue.4"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={onClearConversation}
            >
              Nouvelle conversation
            </Text>
          ) : null}
        </Group>
      </Box>

      {/* Message area */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem 1.25rem',
          scrollbarWidth: 'thin',
          scrollbarColor: '#373A40 transparent',
        }}
      >
        {isEmpty ? (
          <Stack align="center" gap="md" pt="xl">
            <Avatar
              size={52}
              radius="xl"
              style={{ backgroundColor: '#25262B', border: '1px solid #373A40' }}
            >
              <IconRobot size={28} color="#909296" />
            </Avatar>
            <Text size="sm" c="dimmed" ta="center" style={{ maxWidth: 340, lineHeight: 1.6 }}>
              {WELCOME_MESSAGE}
            </Text>
          </Stack>
        ) : (
          <Stack gap={0}>
            {messages.map((msg) => (
              <AiChatMessage key={msg.id} message={msg} />
            ))}
          </Stack>
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Credits warning banner (50 % / 75 % / 95 %) */}
      {creditsWarningBanner && (
        <Box
          px="md"
          py={8}
          style={{
            backgroundColor: creditsWarningBanner.backgroundColor,
            borderTop: `1px solid ${creditsWarningBanner.borderColor}`,
            borderBottom: `1px solid ${creditsWarningBanner.borderColor}`,
          }}
        >
          <Group gap="xs" justify="space-between">
            <Text size="xs" c={creditsWarningBanner.textColor}>
              ⚠ {creditsWarningBanner.message} {formatAiBudgetLabel(creditsRemaining, creditsLimit)}
            </Text>
            <Group gap="xs">
              <Text size="xs" c="blue.4" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Acheter des crédits
              </Text>
              <Text size="xs" c="blue.4" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                Améliorer mon plan
              </Text>
            </Group>
          </Group>
        </Box>
      )}

      {/* Image mode hint */}
      <Box px="md" py={6} style={{ borderTop: '1px solid #373A40', backgroundColor: '#1A1B1E' }}>
        <Badge
          size="sm"
          variant="light"
          color={uploadedUrls.length > 0 ? 'teal' : 'gray'}
          fullWidth
          styles={{ root: { textTransform: 'none', whiteSpace: 'normal', height: 'auto' } }}
        >
          {imageModeHint}
        </Badge>
      </Box>

      {/* Attached images strip */}
      {uploadedUrls.length > 0 && (
        <Box px="md" py={8} style={{ borderTop: '1px solid #373A40', backgroundColor: '#25262B' }}>
          <Group gap="xs" wrap="nowrap" style={{ overflowX: 'auto' }}>
            {uploadedUrls.map((url, i) => (
              <Box key={i} pos="relative" style={{ flexShrink: 0 }}>
                <ActionIcon
                  size={16}
                  color="red"
                  variant="filled"
                  radius="xl"
                  style={{ position: 'absolute', top: -4, right: -4, zIndex: 10 }}
                  onClick={() => onRemoveImage?.(i)}
                >
                  <IconX size={10} />
                </ActionIcon>
                <img
                  src={url}
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: 'cover',
                    borderRadius: 6,
                    border: '1px solid #373A40',
                  }}
                />
              </Box>
            ))}
            <ActionIcon
              size={48}
              variant="subtle"
              color="gray"
              radius="md"
              onClick={onClearImages}
              title="Supprimer toutes les images"
              style={{ border: '1px dashed #373A40', flexShrink: 0 }}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Box>
      )}

      {/* Input area */}
      <Box p="md" style={{ borderTop: '1px solid #373A40', backgroundColor: '#1A1B1E' }}>
        <Dropzone
          openRef={dropzoneOpenRef}
          onDrop={onDrop}
          accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']}
          maxSize={5 * 1024 * 1024}
          maxFiles={5}
          activateOnClick={false}
          style={{ padding: 0, border: 'none', background: 'transparent' }}
          styles={{ inner: { pointerEvents: 'all' } }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              backgroundColor: '#25262B',
              border: '1px solid #373A40',
              borderRadius: 24,
              padding: '8px 8px 8px 16px',
              transition: 'border-color 0.2s',
            }}
          >
            <Textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Demande à l'assistant…"
              autosize
              minRows={1}
              maxRows={6}
              disabled={isGenerating}
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: 0,
                  resize: 'none',
                  fontSize: 14,
                  lineHeight: 1.5,
                  '&:focus': { outline: 'none' },
                  '&::placeholder': { color: '#5C5F66' },
                },
                wrapper: { flex: 1 },
              }}
            />
            <Group gap={6} style={{ flexShrink: 0, marginBottom: 2 }}>
              <Tooltip label="Joindre une image" position="top">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  size="md"
                  onClick={() => dropzoneOpenRef.current?.()}
                  loading={isUploading}
                >
                  <IconPaperclip size={16} />
                </ActionIcon>
              </Tooltip>
              <ActionIcon
                variant="filled"
                color="blue"
                radius="xl"
                size="md"
                onClick={sendMessage}
                disabled={!inputText.trim() || isGenerating}
                loading={isGenerating}
              >
                <IconSend size={14} />
              </ActionIcon>
            </Group>
          </Box>
        </Dropzone>
      </Box>
    </Box>
  );
}
