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
  IconShieldCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { keyApi } from '@/api/keyApi';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateWebhookDto, webhookApi } from '@/api/webhookApi';
import { eventLabel } from '@/constants/webhookEvents';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function CreateWebhook() {
  const router = useRouter();
  const clipboard = useClipboard({ timeout: 2000 });

  const [submitStatus, setSubmitStatus] = useState(RequestStatus.NotStated);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [eventDefs, setEventDefs] = useState<string[]>([]);
  const [keyOptions, setKeyOptions] = useState<{ value: string; label: string }[]>([]);

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

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitStatus(RequestStatus.InProgress);
    try {
      const dto: CreateWebhookDto = {
        webhook_uri: values.webhook_uri,
        event_names: values.event_names,
        key_ids: values.key_ids.map(Number),
      };
      const { secret } = await webhookApi.createSubscription(dto);
      setCreatedSecret(secret);
      setSubmitStatus(RequestStatus.Succeeded);
    } catch {
      setSubmitStatus(RequestStatus.Failed);
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

  if (submitStatus === RequestStatus.Succeeded && createdSecret) {
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
        </Group>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Card withBorder radius="md" shadow="xs" p="lg">
                <Title order={4} mb="xs">
                  2. Signing Secret
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                  Copy your signing secret now — it will <strong>not</strong> be shown again.
                </Text>
                <Code block style={{ fontSize: 13, wordBreak: 'break-all' }}>
                  {createdSecret}
                </Code>
                <Group mt="sm">
                  <Button
                    size="xs"
                    variant="light"
                    color={clipboard.copied ? 'teal' : 'blue'}
                    leftSection={
                      clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                    }
                    onClick={() => clipboard.copy(createdSecret)}
                  >
                    {clipboard.copied ? 'Copied!' : 'Copy secret'}
                  </Button>
                </Group>
                <Alert
                  icon={<IconAlertTriangle size={16} />}
                  color="orange"
                  variant="light"
                  mt="md"
                  radius="md"
                >
                  Store this secret securely. You will not be able to view it again — only
                  regenerate it.
                </Alert>
              </Card>

              <Button onClick={() => router.push('/dashboard/webhooks')}>
                Done — Back to Webhooks
              </Button>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>{sidebarContent}</Grid.Col>
        </Grid>
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
        <Title order={3}>Create New Webhook</Title>
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
                <Text size="sm" c="dimmed">
                  A secret will be generated automatically when you save. Copy it immediately after
                  creation.
                </Text>
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
                  Save Endpoint
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

CreateWebhook.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
