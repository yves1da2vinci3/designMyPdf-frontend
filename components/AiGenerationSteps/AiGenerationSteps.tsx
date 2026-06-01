import React from 'react';
import { Box, Group, Loader, Paper, Stack, Text } from '@mantine/core';
import { IconCheck, IconTool, IconX } from '@tabler/icons-react';
import type { AiStep } from '@/lib/aiGeneration/types';

interface AiGenerationStepsProps {
  steps: AiStep[];
  layoutSummary?: string;
}

function StepIcon({ status }: { status: AiStep['status'] }) {
  if (status === 'running') return <Loader size={14} color="blue" />;
  if (status === 'done') return <IconCheck size={14} color="#40c057" />;
  if (status === 'error') return <IconX size={14} color="#fa5252" />;
  return <IconTool size={14} color="#909296" />;
}

export default function AiGenerationSteps({ steps, layoutSummary }: AiGenerationStepsProps) {
  if (steps.length === 0 && !layoutSummary) {
    return null;
  }

  return (
    <Stack gap="sm">
      {steps.length > 0 && (
        <Stack gap={6}>
          {steps.map((step) => (
            <Paper
              key={step.id}
              px="sm"
              py={6}
              radius="md"
              style={{
                border: '1px solid #373A40',
                backgroundColor: step.status === 'running' ? '#2C2E33' : '#25262B',
              }}
            >
              <Group gap="xs" wrap="nowrap">
                <StepIcon status={step.status} />
                <Text size="sm" c={step.status === 'error' ? 'red' : 'dimmed'}>
                  {step.label}
                </Text>
              </Group>
              {step.detail && step.status === 'error' && (
                <Text size="xs" c="red" mt={4} ml={22}>
                  {step.detail}
                </Text>
              )}
            </Paper>
          ))}
        </Stack>
      )}
      {layoutSummary && (
        <Box
          p="sm"
          style={{
            borderRadius: 8,
            border: '1px solid #373A40',
            backgroundColor: '#25262B',
          }}
        >
          <Text size="xs" fw={600} c="dimmed" mb={6}>
            Résumé de la mise en page
          </Text>
          <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
            {layoutSummary}
          </Text>
        </Box>
      )}
    </Stack>
  );
}
