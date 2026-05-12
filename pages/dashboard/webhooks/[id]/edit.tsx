import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Grid,
  Group,
  Loader,
  Center,
  MultiSelect,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useClipboard } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconLock,
  IconRefreshAlert,
  IconShieldCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import { UpdateWebhookDto, webhookApi } from '@/api/webhookApi';
import { eventLabel } from '@/constants/webhookEvents';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function EditWebhook() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const clipboard = useClipboard({ timeout: 2000 });

  const [loadStatus, setLoadStatus] = useState(RequestStatus.NotStated);
  const [submitStatus, setSubmitStatus] = useState(RequestStatus.NotStated);
  const [regeneratedSecret, setRegeneratedSecret] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [eventDefs, setEventDefs] = useState<string[]>([]);
  const [keyOptions, setKeyOptions] = useState<{ value: string; label: string }[]>([]);

  const form = useForm({
    initialValues: {
      webhook_uri: '',
      description: '',
      event_names: [] as string[],
      key_ids: [] as string[],
    },
    validate: {
      webhook_uri: (v: string) => (v.trim() === '' ? 'Endpoint URL is required' : null),
      event_names: (v: string[]) => (v.length === 0 ? 'Select at least one event' : null),
    },
  });

  useEffect(() => {
    webhookApi
      .getEventDefinitions()
      .then(setEventDefs)
      .catch(() => {});
    keyApi
      .getKeys()
      .then((keys) => {
        setKeyOptions(keys.map((k) => ({ value: String(k.id), label: k.name })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadStatus(RequestStatus.InProgress);
    webhookApi
      .getSubscription(id)
      .then((sub) => {
        form.setValues({
          webhook_uri: sub.webhook_uri,
          description: '',
          event_names: sub.event_names,
          key_ids: sub.keys.map((k) => String(k.key_id)),
        });
        setLoadStatus(RequestStatus.Succeeded);
      })
      .catch(() => {
        setLoadStatus(RequestStatus.Failed);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitStatus(RequestStatus.InProgress);
    try {
      const dto: UpdateWebhookDto = {
        webhook_uri: values.webhook_uri,
        event_names: values.event_names,
        key_ids: values.key_ids.map(Number),
      };
      await webhookApi.updateSubscription(id, dto);
      setSubmitStatus(RequestStatus.Succeeded);
      router.push('/dashboard/webhooks');
    } catch {
      setSubmitStatus(RequestStatus.Failed);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const { secret } = await webhookApi.updateSubscription(id, { regenerate_secret: true });
      if (secret) setRegeneratedSecret(secret);
    } catch {
      /* notified by apiClient */
    } finally {
      setRegenerating(false);
    }
  };

  const sidebarContent = (
    <Card withBorder radius="md" shadow="xs" p="lg">
      <Group gap="xs" mb="md">
        <IconInfoCircle size={16} color="#228be6" />
        <Text size="sm" fw={700} c="blue">
          Implementation Guide
        </Text>
      </Group>
      <Stack gap="md">
        <Box>
          <Group gap="xs" mb={4}>
            <IconShieldCheck size={14} color="#228be6" />
            <Text size="sm" fw={600}>
              Signature Verification
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Each payload is signed with a <code>Dmp-Webhook-Signature</code> header. Use your secret
            to compute an HMAC-SHA256 hash and compare it to prevent replay attacks.
          </Text>
        </Box>
        <Box>
          <Group gap="xs" mb={4}>
            <IconInfoCircle size={14} color="#228be6" />
            <Text size="sm" fw={600}>
              Response Requirements
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            Your endpoint must return a 2xx status code within 10 seconds. If a failure occurs, we
            will retry up to 3 times with exponential backoff.
          </Text>
        </Box>
      </Stack>
    </Card>
  );

  if (loadStatus === RequestStatus.InProgress || loadStatus === RequestStatus.NotStated) {
    return (
      <Center h="60vh">
        <Loader type="bars" size="xl" />
      </Center>
    );
  }

  if (loadStatus === RequestStatus.Failed) {
    return (
      <Stack gap="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/dashboard/webhooks')}
        >
          Back to Webhooks
        </Button>
        <Alert color="red" title="Failed to load webhook">
          Could not fetch subscription. It may have been deleted or you may not have access.
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack gap="xl">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/dashboard/webhooks')}
        >
          Back to Webhooks
        </Button>
        <Title order={3}>Edit Webhook</Title>
      </Group>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Card withBorder radius="md" shadow="xs" p="lg">
                <Title order={4} mb="md">
                  1. Endpoint Details
                </Title>
                <Stack gap="sm">
                  <TextInput
                    label="Endpoint URL"
                    placeholder="https://your-api.com/webhooks"
                    required
                    {...form.getInputProps('webhook_uri')}
                  />
                  <Textarea
                    label="Description"
                    labelProps={{
                      children: (
                        <>
                          Description{' '}
                          <Text span size="xs" c="dimmed">
                            (Optional)
                          </Text>
                        </>
                      ),
                    }}
                    placeholder="Production event handler for invoice generation"
                    rows={3}
                    {...form.getInputProps('description')}
                  />
                </Stack>
              </Card>

              <Card withBorder radius="md" shadow="xs" p="lg">
                <Group gap="xs" mb="xs">
                  <IconLock size={16} color="#868e96" />
                  <Title order={4}>2. Signing Secret</Title>
                </Group>

                {regeneratedSecret ? (
                  <Stack gap="sm">
                    <Text size="sm" c="dimmed">
                      New secret generated. Copy it now — it will <strong>not</strong> be shown
                      again.
                    </Text>
                    <Code block style={{ fontSize: 13, wordBreak: 'break-all' }}>
                      {regeneratedSecret}
                    </Code>
                    <Group>
                      <Button
                        size="xs"
                        variant="light"
                        color={clipboard.copied ? 'teal' : 'blue'}
                        leftSection={
                          clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                        }
                        onClick={() => clipboard.copy(regeneratedSecret)}
                      >
                        {clipboard.copied ? 'Copied!' : 'Copy secret'}
                      </Button>
                    </Group>
                    <Alert
                      icon={<IconAlertTriangle size={16} />}
                      color="orange"
                      variant="light"
                      radius="md"
                    >
                      Store this secret securely. You will not be able to view it again — only
                      regenerate it.
                    </Alert>
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    <Code block style={{ fontSize: 13, letterSpacing: '0.1em', color: '#868e96' }}>
                      whsec_••••••••••••••••••••••••••••••••
                    </Code>
                    <Group>
                      <Button
                        size="xs"
                        variant="light"
                        color="orange"
                        leftSection={<IconRefreshAlert size={14} />}
                        loading={regenerating}
                        onClick={handleRegenerate}
                      >
                        Regenerate secret
                      </Button>
                    </Group>
                    <Alert
                      icon={<IconAlertTriangle size={16} />}
                      color="yellow"
                      variant="light"
                      radius="md"
                    >
                      Regenerating invalidates the current secret immediately. All pending requests
                      signed with the old secret will be rejected.
                    </Alert>
                  </Stack>
                )}
              </Card>

              <Card withBorder radius="md" shadow="xs" p="lg">
                <Title order={4} mb="md">
                  3. Event Selection
                </Title>
                <Checkbox.Group
                  {...form.getInputProps('event_names')}
                  error={form.errors.event_names}
                >
                  <Grid gutter="sm">
                    {eventDefs.map((ev) => (
                      <Grid.Col span={{ base: 12, sm: 6 }} key={ev}>
                        <Checkbox
                          value={ev}
                          label={
                            <Box>
                              <Text size="sm" fw={500}>
                                {eventLabel(ev)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {ev === 'PdfJobQueued' && 'Fired when a new PDF job is queued.'}
                                {ev === 'PdfJobCompleted' &&
                                  'Fired when the PDF generation is successful.'}
                                {ev === 'PdfJobFailed' &&
                                  'Fired if the job reaches a terminal failure state.'}
                              </Text>
                            </Box>
                          }
                          styles={{ body: { alignItems: 'flex-start' }, input: { marginTop: 3 } }}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Checkbox.Group>

                <Box mt="md">
                  <Text size="sm" fw={500} mb={4}>
                    Key Scope
                  </Text>
                  <Text size="xs" c="dimmed" mb="xs">
                    Leave empty to receive events for all API keys, or select specific keys.
                  </Text>
                  <MultiSelect
                    placeholder="All keys (default)"
                    data={keyOptions}
                    clearable
                    searchable
                    {...form.getInputProps('key_ids')}
                  />
                </Box>
              </Card>

              <Group justify="flex-end">
                <Button variant="outline" onClick={() => router.push('/dashboard/webhooks')}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitStatus === RequestStatus.InProgress}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>{sidebarContent}</Grid.Col>
        </Grid>
      </form>
    </Stack>
  );
}

EditWebhook.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
