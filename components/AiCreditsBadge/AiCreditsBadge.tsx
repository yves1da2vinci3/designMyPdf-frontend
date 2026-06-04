import React from 'react';
import { Badge, Card, Group, Progress, Stack, Text } from '@mantine/core';
import { formatAiBudgetLabel, getAiMonthlyBudgetHint } from '@/lib/aiGeneration/chatImageMode';
import {
  getAiCreditsProgressColor,
  getAiCreditsUsedPercent,
  getAiCreditsWarningBanner,
  getAiCreditsWarningTier,
} from '@/lib/aiGeneration/aiCreditsWarnings';

interface AiCreditsBadgeProps {
  remaining: number;
  limit: number;
  used: number;
  month?: string;
  loading?: boolean;
  variant?: 'compact' | 'card';
}

export default function AiCreditsBadge({
  remaining,
  limit,
  used,
  month,
  loading,
  variant = 'compact',
}: AiCreditsBadgeProps) {
  const usedPercent = getAiCreditsUsedPercent(used, limit);
  const color = getAiCreditsProgressColor(usedPercent);
  const warningTier = getAiCreditsWarningTier(usedPercent);
  const warningBanner = warningTier ? getAiCreditsWarningBanner(warningTier) : null;

  if (loading) {
    return variant === 'compact' ? (
      <Badge variant="light" color="gray" size="sm">
        Budget IA…
      </Badge>
    ) : (
      <Text size="sm" c="dimmed">
        Chargement du budget IA…
      </Text>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge variant="light" color={color} size="sm">
        {formatAiBudgetLabel(remaining, limit)}
      </Badge>
    );
  }

  return (
    <Card withBorder radius="md" shadow="xs" p="lg">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={600} size="sm">
            Budget génération IA
          </Text>
          {month ? (
            <Text size="xs" c="dimmed">
              {month}
            </Text>
          ) : null}
        </Group>
        <Text size="lg" fw={700}>
          {formatAiBudgetLabel(remaining, limit)}
        </Text>
        <Progress value={usedPercent} color={color} size="sm" />
        {warningBanner ? (
          <Text size="xs" c={warningBanner.textColor}>
            ⚠ {warningBanner.message}
          </Text>
        ) : null}
        <Text size="xs" c="dimmed">
          {getAiMonthlyBudgetHint()} Chaque génération déduit selon les tokens consommés.
        </Text>
      </Stack>
    </Card>
  );
}
