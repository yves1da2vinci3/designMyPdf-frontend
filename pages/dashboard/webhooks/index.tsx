import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconActivity,
  IconAlertCircle,
  IconChartBar,
  IconHistory,
  IconInfoCircle,
  IconLock,
  IconPencil,
  IconPlus,
  IconRefreshAlert,
  IconTrash,
  IconWebhook,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { RequestStatus } from '@/api/request-status.enum';
import { WebhookDTO, webhookApi } from '@/api/webhookApi';
import { eventColor, eventLabel } from '@/constants/webhookEvents';
import { ensureArray } from '@/utils/ensureArray';
import DashboardLayout from '@/layouts/DashboardLayout';

function lastDeliveryText(sub: WebhookDTO): React.ReactNode {
  if (!sub.last_delivery_at)
    return (
      <Text size="sm" c="dimmed">
        No deliveries yet
      </Text>
    );

  const status = sub.last_delivery_status ?? 0;
  const ok = status >= 200 && status < 300;
  const date = new Date(sub.last_delivery_at);
  const diff = Math.round((Date.now() - date.getTime()) / 60000);
  const timeStr = diff < 60 ? `${diff}m ago` : date.toLocaleDateString();

  return (
    <Group gap={6} wrap="nowrap">
      <Box
        w={8}
        h={8}
        style={{ borderRadius: '50%', backgroundColor: ok ? '#12b886' : '#fa5252', flexShrink: 0 }}
      />
      <Text size="sm" c={ok ? 'teal' : 'red'}>
        {ok ? 'Success' : `Failed (${status})`}
      </Text>
      <Text size="xs" c="dimmed">
        {timeStr}
      </Text>
    </Group>
  );
}

export default function Webhooks() {
  const router = useRouter();
  const [status, setStatus] = useState(RequestStatus.NotStated);
  const [subs, setSubs] = useState<WebhookDTO[]>([]);
  const [securityOpened, { open: openSecurity, close: closeSecurity }] = useDisclosure(false);

  const fetchSubs = async () => {
    setStatus(RequestStatus.InProgress);
    try {
      const data = await webhookApi.getSubscriptions();
      setSubs(ensureArray(data));
      setStatus(RequestStatus.Succeeded);
    } catch {
      setStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const toggleActive = async (sub: WebhookDTO) => {
    try {
      const { subscription } = await webhookApi.updateSubscription(sub.id, {
        is_active: !sub.is_active,
      });
      setSubs((prev) => prev.map((s) => (s.id === sub.id ? { ...s, ...subscription } : s)));
    } catch {
      /* notified by apiClient */
    }
  };

  const deleteSub = async (id: string) => {
    try {
      await webhookApi.deleteSubscription(id);
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } catch {
      /* notified by apiClient */
    }
  };

  const confirmDelete = (sub: WebhookDTO) => {
    modals.openConfirmModal({
      title: 'Delete webhook',
      centered: true,
      children: (
        <Text size="sm">
          Delete <strong>{sub.webhook_uri}</strong>? This cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteSub(sub.id),
    });
  };

  const activeCount = subs.filter((s) => s.is_active).length;
  const failureCount = subs.filter(
    (s) =>
      s.last_delivery_status && (s.last_delivery_status < 200 || s.last_delivery_status >= 300),
  ).length;

  const rows = subs.map((sub) => (
    <Table.Tr key={sub.id}>
      <Table.Td>
        <Switch checked={sub.is_active} onChange={() => toggleActive(sub)} size="sm" />
      </Table.Td>
      <Table.Td>
        <Anchor
          size="sm"
          href={sub.webhook_uri}
          target="_blank"
          rel="noopener noreferrer"
          truncate
          style={{ maxWidth: 260 }}
        >
          {sub.webhook_uri}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Group gap={4} wrap="wrap">
          {sub.event_names.map((ev) => (
            <Badge key={ev} color={eventColor(ev)} variant="light" size="xs" tt="uppercase">
              {eventLabel(ev)}
            </Badge>
          ))}
        </Group>
      </Table.Td>
      <Table.Td>{lastDeliveryText(sub)}</Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => router.push(`/dashboard/webhooks/${sub.id}/edit`)}
            >
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delivery history">
            <ActionIcon
              variant="subtle"
              color="violet"
              onClick={() => router.push(`/dashboard/webhooks/${sub.id}/history`)}
            >
              <IconHistory size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(sub)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const thStyle = {
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#868e96',
  };

  return (
    <>
      <Modal
        opened={securityOpened}
        onClose={closeSecurity}
        title="Security & Best Practices"
        size="md"
        centered
      >
        <Stack gap="md">
          <Box>
            <Group gap="xs" mb={4}>
              <IconLock size={14} color="#228be6" />
              <Text size="sm" fw={600}>
                HMAC Signatures
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              All requests include a <code>Dmp-Webhook-Signature</code> header. Verify it using your
              secret to ensure requests are authentic and prevent replay attacks.
            </Text>
          </Box>
          <Divider />
          <Box>
            <Group gap="xs" mb={4}>
              <IconRefreshAlert size={14} color="#228be6" />
              <Text size="sm" fw={600}>
                Idempotency
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              We may retry delivery on failure. Ensure your endpoint handles duplicate events
              gracefully using the <code>job_id</code> as an idempotency key.
            </Text>
          </Box>
          <Divider />
          <Box>
            <Group gap="xs" mb={4}>
              <IconAlertCircle size={14} color="#228be6" />
              <Text size="sm" fw={600}>
                Response Requirements
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              Your endpoint must return a 2xx status code within 10 seconds. We retry up to 3 times
              with exponential backoff. After 3 consecutive failures the subscription is
              deactivated.
            </Text>
          </Box>
          <Divider />
          <Alert
            icon={<IconWebhook size={16} />}
            color="blue"
            variant="light"
            radius="md"
            title="Inspect deliveries"
          >
            <Text size="xs">
              Use the Delivery History view to inspect request headers, body, and server responses.
            </Text>
          </Alert>
        </Stack>
      </Modal>

      {status === RequestStatus.InProgress || status === RequestStatus.NotStated ? (
        <Center h="95vh">
          <Loader type="bars" size="xl" />
        </Center>
      ) : (
        <Stack gap="xl">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box>
              <Title order={2} fw={700}>
                Webhooks
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                Configure endpoints to receive real-time notifications about your PDF generation
                jobs.
              </Text>
            </Box>
            <Group gap="xs">
              <Tooltip label="Security & Best Practices">
                <ActionIcon variant="subtle" color="blue" size="lg" onClick={openSecurity}>
                  <IconInfoCircle size={20} />
                </ActionIcon>
              </Tooltip>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push('/dashboard/webhooks/create')}
              >
                Add Endpoint
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Active Endpoints
                </Text>
                <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                  <IconWebhook size={12} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl">
                {String(activeCount).padStart(2, '0')}
              </Text>
              <Box
                mt="xs"
                style={{ height: 3, backgroundColor: '#228be6', borderRadius: 2, width: '40%' }}
              />
            </Card>
            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Total Endpoints
                </Text>
                <ThemeIcon size="sm" variant="light" color="violet" radius="xl">
                  <IconChartBar size={12} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl">
                {String(subs.length).padStart(2, '0')}
              </Text>
            </Card>
            <Card withBorder radius="md" p="lg" shadow="xs">
              <Group justify="space-between" mb="xs">
                <Text
                  size="xs"
                  tt="uppercase"
                  fw={600}
                  c="dimmed"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Recent Failures
                </Text>
                <ThemeIcon
                  size="sm"
                  variant="light"
                  color={failureCount > 0 ? 'red' : 'teal'}
                  radius="xl"
                >
                  <IconActivity size={12} />
                </ThemeIcon>
              </Group>
              <Text fw={700} size="xl" c={failureCount > 0 ? 'red' : undefined}>
                {failureCount}
              </Text>
            </Card>
          </SimpleGrid>

          <Paper withBorder radius="md" shadow="xs" style={{ overflow: 'hidden' }}>
            <ScrollArea type="scroll" offsetScrollbars="x" scrollbarSize={8}>
              <Table highlightOnHover style={{ minWidth: 640 }}>
                <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
                  <Table.Tr>
                    <Table.Th style={thStyle}>Status</Table.Th>
                    <Table.Th style={thStyle}>Endpoint URL</Table.Th>
                    <Table.Th style={thStyle}>Events</Table.Th>
                    <Table.Th style={thStyle}>Last Delivery</Table.Th>
                    <Table.Th style={{ ...thStyle, textAlign: 'right' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? (
                    rows
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Center py="xl">
                          <Stack align="center" gap="sm">
                            <ThemeIcon size={48} variant="light" color="gray" radius="xl">
                              <IconWebhook size={24} />
                            </ThemeIcon>
                            <Text fw={600}>No active endpoints</Text>
                            <Text size="sm" c="dimmed" ta="center" maw={300}>
                              Start by adding a production endpoint to receive automated delivery
                              notifications.
                            </Text>
                            <Button
                              size="sm"
                              variant="light"
                              leftSection={<IconPlus size={14} />}
                              onClick={() => router.push('/dashboard/webhooks/create')}
                            >
                              Add Endpoint
                            </Button>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Stack>
      )}
    </>
  );
}

Webhooks.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
