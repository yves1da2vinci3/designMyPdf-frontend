import React from 'react';
import { Badge, Group, Loader } from '@mantine/core';
import { IconCheck, IconTool, IconX } from '@tabler/icons-react';
import type { AiStep } from '@/lib/aiGeneration/types';

interface ToolCallPillsProps {
  steps: AiStep[];
}

function PillIcon({ status }: { status: AiStep['status'] }) {
  if (status === 'running') return <Loader size={11} color="blue" />;
  if (status === 'done') return <IconTool size={11} />;
  if (status === 'error') return <IconX size={11} />;
  return <IconCheck size={11} />;
}

export default function ToolCallPills({ steps }: ToolCallPillsProps) {
  if (steps.length === 0) return null;

  return (
    <Group gap={6} wrap="wrap" mb={8}>
      {steps.map((step) => (
        <Badge
          key={step.id}
          size="sm"
          variant="light"
          color={step.status === 'error' ? 'red' : step.status === 'running' ? 'blue' : 'gray'}
          leftSection={<PillIcon status={step.status} />}
          style={{ fontWeight: 400, textTransform: 'none', maxWidth: 240 }}
          title={step.detail}
        >
          {step.label}
        </Badge>
      ))}
    </Group>
  );
}
