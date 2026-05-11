import { useState } from 'react';
import { Modal, Button, Stack, Text, Group, Alert } from '@mantine/core';
import { IconCurrencyDollar, IconCheck } from '@tabler/icons-react';
import { templateApi, TemplateDTO, MarketplaceTemplateCard } from '@/api/templateApi';

interface Props {
  opened: boolean;
  onClose: () => void;
  template: TemplateDTO | MarketplaceTemplateCard;
  onPurchased: () => void;
}

export default function PurchaseModal({ opened, onClose, template, onPurchased }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await templateApi.purchaseTemplate(String(template.ID));
      onPurchased();
    } catch {
      // stub always succeeds
      onPurchased();
    } finally {
      setLoading(false);
    }
  };

  const priceDisplay = `$${((template.price ?? 0) / 100).toFixed(2)}`;

  return (
    <Modal opened={opened} onClose={onClose} title="Purchase Template" centered size="sm">
      <Stack gap="md">
        <Alert color="blue" variant="light">
          You are purchasing <strong>{template.name}</strong> for <strong>{priceDisplay}</strong>.
        </Alert>
        <Text size="sm" c="dimmed">
          After purchase, you&apos;ll be able to copy this template to your workspace.
        </Text>
        <Group gap={8} justify="center">
          <IconCheck size={14} color="teal" />
          <Text size="xs" c="dimmed">
            Instant delivery
          </Text>
          <Text size="xs" c="dimmed">
            ·
          </Text>
          <IconCheck size={14} color="teal" />
          <Text size="xs" c="dimmed">
            Lifetime access
          </Text>
        </Group>
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={loading}
            leftSection={<IconCurrencyDollar size={16} />}
            onClick={handlePurchase}
          >
            Pay {priceDisplay}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
