import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ActionIcon,
  Alert,
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
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { IconArrowLeft, IconCheck, IconCircle, IconRefresh, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { RequestStatus } from '@/api/request-status.enum';
import { DeliveryAttemptDTO, WebhookDTO, webhookApi } from '@/api/webhookApi';
import { eventColor, eventLabel } from '@/constants/webhookEvents';
import DashboardLayout from '@/layouts/DashboardLayout';

function isJSON(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}

function statusBadge(httpStatus: number | undefined, error: string | undefined) {
  if (!httpStatus && error) {
    return (
      <Badge color="red" variant="light" size="sm">
        Network Error
      </Badge>
    );
  }
  if (!httpStatus)
    return (
      <Badge color="gray" variant="light" size="sm">
        —
      </Badge>
    );
  const ok = httpStatus >= 200 && httpStatus < 300;
  return (
    <Badge color={ok ? 'teal' : 'red'} variant="light" size="sm">
      {httpStatus} {ok ? 'OK' : 'ERR'}
    </Badge>
  );
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  const diff = Math.round((Date.now() - d.getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return d.toLocaleDateString();
}

export default function WebhookHistory() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [fetchStatus, setFetchStatus] = useState(RequestStatus.NotStated);
  const [refreshing, setRefreshing] = useState(false);
  const [sub, setSub] = useState<WebhookDTO | null>(null);
  const [attempts, setAttempts] = useState<DeliveryAttemptDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<DeliveryAttemptDTO | null>(null);
  const [inspectOpened, { open: openInspect, close: closeInspect }] = useDisclosure(false);

  const load = useCallback(
    async (initial = false) => {
      if (!id) return;
      if (initial) {
        setFetchStatus(RequestStatus.InProgress);
      } else {
        setRefreshing(true);
      }
      try {
        const [subData, deliveries] = await Promise.all([
          webhookApi.getSubscription(id),
          webhookApi.getDeliveries(id),
        ]);
        setSub(subData);
        setAttempts(deliveries.attempts);
        setTotal(deliveries.total);
        setFetchStatus(RequestStatus.Succeeded);
      } catch {
        setFetchStatus(RequestStatus.Failed);
      } finally {
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const successCount = attempts.filter((a) => a.http_status >= 200 && a.http_status < 300).length;
  const failureCount = attempts.filter((a) => !a.http_status || a.http_status >= 300).length;
  const successRate = attempts.length > 0 ? Math.round((successCount / attempts.length) * 100) : 0;

  const thStyle = {
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#868e96',
  };

  const rows = attempts.map((a) => {
    const ok = a.http_status >= 200 && a.http_status < 300;
    return (
      <Table.Tr key={a.id} style={{ cursor: 'pointer' }}>
        <Table.Td>
          <Box
            w={10}
            h={10}
            style={{
              borderRadius: '50%',
              backgroundColor: ok ? '#12b886' : '#fa5252',
              margin: '0 auto',
            }}
          />
        </Table.Td>
        <Table.Td>
          <Badge color={eventColor(a.event_name)} variant="light" size="xs" tt="uppercase">
            {eventLabel(a.event_name)}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="xs" c="dimmed">
            {formatTs(a.created_at)}
          </Text>
        </Table.Td>
        <Table.Td>{statusBadge(a.http_status, a.error)}</Table.Td>
        <Table.Td>
          {a.attempt_no > 1 && (
            <Badge color="orange" variant="dot" size="xs">
              Retry {a.attempt_no - 1} of 3
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Button
            size="xs"
            variant="subtle"
            color="blue"
            onClick={() => {
              setSelected(a);
              openInspect();
            }}
          >
            Inspect
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  let payloadParsed: string | null = null;
  if (selected?.payload_json) {
    try {
      payloadParsed = JSON.stringify(JSON.parse(selected.payload_json), null, 2);
    } catch {
      payloadParsed = selected.payload_json;
    }
  }

  if (fetchStatus === RequestStatus.InProgress || fetchStatus === RequestStatus.NotStated) {
    return (
      <Center h="60vh">
        <Loader type="bars" size="xl" />
      </Center>
    );
  }

  if (fetchStatus === RequestStatus.Failed) {
    return (
      <Stack gap="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/dashboard/webhooks')}
        >
          Back to Webhooks
        </Button>
        <Alert color="red" title="Failed to load history">
          Could not fetch delivery history for this webhook.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Modal
        opened={inspectOpened}
        onClose={closeInspect}
        title="Inspect Delivery"
        size="xl"
        styles={{
          body: { overflowY: 'auto', maxHeight: 'calc(85vh - 80px)' },
        }}
      >
        {selected && (
          <Stack gap="md">
            <Box>
              <Text
                size="xs"
                tt="uppercase"
                fw={700}
                c="dimmed"
                mb={6}
                style={{ letterSpacing: '0.06em' }}
              >
                Event
              </Text>
              <Group gap="xs">
                <Badge
                  color={eventColor(selected.event_name)}
                  variant="light"
                  size="sm"
                  tt="uppercase"
                >
                  {eventLabel(selected.event_name)}
                </Badge>
                <Text size="xs" c="dimmed">
                  {new Date(selected.created_at).toLocaleString()}
                </Text>
              </Group>
            </Box>

            <Divider />

            <Box>
              <Text
                size="xs"
                tt="uppercase"
                fw={700}
                c="dimmed"
                mb={6}
                style={{ letterSpacing: '0.06em' }}
              >
                Request Headers
              </Text>
              <Stack gap={4}>
                <Group gap="xs">
                  <Text size="xs" fw={600} c="blue" ff="monospace">
                    Content-Type:
                  </Text>
                  <Text size="xs" ff="monospace">
                    application/json
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="xs" fw={600} c="blue" ff="monospace">
                    Dmp-Webhook-Signature:
                  </Text>
                  <Text size="xs" ff="monospace" c="dimmed">
                    sha256=&lt;hmac&gt;
                  </Text>
                </Group>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Text
                size="xs"
                tt="uppercase"
                fw={700}
                c="dimmed"
                mb={6}
                style={{ letterSpacing: '0.06em' }}
              >
                Request Body
              </Text>
              {payloadParsed ? (
                <Box style={{ border: '1px solid #e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                  <MonacoEditor
                    height={220}
                    language="json"
                    value={payloadParsed}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'off',
                      folding: true,
                      wordWrap: 'on',
                      renderLineHighlight: 'none',
                    }}
                  />
                </Box>
              ) : (
                <Text size="xs" c="dimmed">
                  No payload recorded
                </Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Text
                size="xs"
                tt="uppercase"
                fw={700}
                c="dimmed"
                mb={6}
                style={{ letterSpacing: '0.06em' }}
              >
                Server Response
              </Text>
              <Group gap="xs" mb={6}>
                {statusBadge(selected.http_status, selected.error)}
              </Group>
              {selected.error ? (
                <Alert color="red" variant="light" radius="sm" icon={<IconX size={14} />}>
                  <Text size="xs" ff="monospace">
                    {selected.error}
                  </Text>
                </Alert>
              ) : selected.response_snippet ? (
                <Box style={{ border: '1px solid #e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                  <MonacoEditor
                    height={120}
                    language={isJSON(selected.response_snippet) ? 'json' : 'plaintext'}
                    value={selected.response_snippet}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 12,
                      lineNumbers: 'off',
                      renderLineHighlight: 'none',
                    }}
                  />
                </Box>
              ) : (
                <Text size="xs" c="dimmed">
                  No response body recorded
                </Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Text
                size="xs"
                tt="uppercase"
                fw={700}
                c="dimmed"
                mb={6}
                style={{ letterSpacing: '0.06em' }}
              >
                Retry Policy
              </Text>
              {selected.http_status >= 200 && selected.http_status < 300 ? (
                <Group gap={6}>
                  <IconCheck size={14} color="#12b886" />
                  <Text size="xs">Delivered successfully on attempt {selected.attempt_no}</Text>
                </Group>
              ) : (
                <Text size="xs" c="dimmed">
                  Attempt {selected.attempt_no} of 3
                </Text>
              )}
            </Box>
          </Stack>
        )}
      </Modal>

      <Group justify="space-between" wrap="wrap" gap="md">
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/dashboard/webhooks')}
          >
            Back to Webhooks
          </Button>
          <Box>
            <Title order={3}>Delivery History</Title>
            {sub && (
              <Text size="xs" c="dimmed" truncate maw={400}>
                {sub.webhook_uri}
              </Text>
            )}
          </Box>
        </Group>
        <Tooltip label="Refresh">
          <ActionIcon variant="light" size="lg" loading={refreshing} onClick={() => load(false)}>
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Card withBorder radius="md" p="md" shadow="xs">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Success Rate
          </Text>
          <Text fw={700} size="xl" c={successRate < 80 ? 'red' : 'teal'}>
            {successRate}%
          </Text>
        </Card>
        <Card withBorder radius="md" p="md" shadow="xs">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Total Deliveries
          </Text>
          <Text fw={700} size="xl">
            {total}
          </Text>
        </Card>
        <Card withBorder radius="md" p="md" shadow="xs">
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.05em' }}>
            Shown
          </Text>
          <Text fw={700} size="xl">
            {attempts.length}
          </Text>
        </Card>
        <Card withBorder radius="md" p="md" shadow="xs">
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c={failureCount > 0 ? 'red' : 'dimmed'}
            style={{ letterSpacing: '0.05em' }}
          >
            Failures
          </Text>
          <Text fw={700} size="xl" c={failureCount > 0 ? 'red' : undefined}>
            {failureCount}
          </Text>
        </Card>
      </SimpleGrid>

      <Paper withBorder radius="md" shadow="xs" style={{ overflow: 'hidden' }}>
        <ScrollArea type="scroll" offsetScrollbars="x" scrollbarSize={8}>
          <Table highlightOnHover style={{ minWidth: 560 }}>
            <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
              <Table.Tr>
                <Table.Th style={{ ...thStyle, width: 32 }}></Table.Th>
                <Table.Th style={thStyle}>Event</Table.Th>
                <Table.Th style={thStyle}>Time</Table.Th>
                <Table.Th style={thStyle}>Response</Table.Th>
                <Table.Th style={thStyle}>Retry</Table.Th>
                <Table.Th style={thStyle}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Center py="xl">
                      <Stack align="center" gap="sm">
                        <IconCircle size={32} color="#ced4da" />
                        <Text fw={600} c="dimmed">
                          No deliveries yet
                        </Text>
                        <Text size="sm" c="dimmed" ta="center" maw={300}>
                          Events will appear here once your endpoint receives its first delivery.
                        </Text>
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
  );
}

WebhookHistory.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
