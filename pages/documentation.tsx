import { useState } from 'react';
import { useRouter } from 'next/router';
import { CodeHighlight } from '@mantine/code-highlight';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  List,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconThumbDown,
  IconThumbUp,
} from '@tabler/icons-react';
import Head from 'next/head';

const NAV_SECTIONS = [
  {
    label: 'GETTING STARTED',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'authentication', label: 'Authentication' },
      { id: 'quickstart', label: 'Quickstart Guide' },
    ],
  },
  {
    label: 'CORE RESOURCES',
    items: [
      { id: 'pdf-generation', label: 'PDF Generation' },
      { id: 'templates-api', label: 'Template Variables' },
      { id: 'optimizations', label: 'Best Practices' },
      { id: 'error-codes', label: 'Error Codes' },
      { id: 'marketplace', label: 'Marketplace Integrations' },
      { id: 'webhooks', label: 'Webhooks' },
    ],
  },
  {
    label: 'SDKs & TOOLS',
    items: [
      { id: 'nodejs', label: 'Node.js SDK' },
      { id: 'python', label: 'Python Client' },
      { id: 'cli', label: 'CLI Reference' },
    ],
  },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const SDK_IN_DEV_ALERT = (
  <Alert color="orange" variant="light" radius="md" mb="lg" title="In Development">
    <Text size="sm">
      This SDK is currently in development and not yet available for public use. In the meantime,
      you can use the REST API directly with any HTTP client.
    </Text>
  </Alert>
);

const Documentation = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Head>
        <title>Documentation | DesignMyPDF</title>
        <meta name="description" content="DesignMyPDF API documentation" />
      </Head>

      <Box style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        {/* Sidebar */}
        <Box
          style={{
            width: sidebarOpen ? 220 : 0,
            flexShrink: 0,
            borderRight: sidebarOpen ? '1px solid #e9ecef' : 'none',
            paddingTop: sidebarOpen ? 24 : 0,
            paddingBottom: 24,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'width 0.2s ease, border 0.2s ease, padding 0.2s ease',
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <Box key={section.label} mb="lg" px="md" style={{ whiteSpace: 'nowrap' }}>
              <Text
                size="xs"
                fw={700}
                tt="uppercase"
                style={{ letterSpacing: '0.05em' }}
                c="dimmed"
                mb="xs"
              >
                {section.label}
              </Text>
              {section.items.map((item) => (
                <Box
                  key={item.id}
                  py={6}
                  px="xs"
                  mb={2}
                  style={{
                    borderRadius: 4,
                    cursor: 'pointer',
                    backgroundColor: activeSection === item.id ? '#e7f5ff' : 'transparent',
                  }}
                  onClick={() => {
                    setActiveSection(item.id);
                    scrollTo(item.id);
                  }}
                >
                  <Text
                    size="sm"
                    c={activeSection === item.id ? 'blue' : 'inherit'}
                    fw={activeSection === item.id ? 600 : 400}
                  >
                    {item.label}
                  </Text>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {/* Main content */}
        <Box style={{ flex: 1, padding: '32px 48px', maxWidth: 860, overflowY: 'auto' }}>
          <Group mb="md" gap="xs">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? (
                <IconLayoutSidebarLeftCollapse size={18} />
              ) : (
                <IconLayoutSidebarLeftExpand size={18} />
              )}
            </ActionIcon>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.back()}
              style={{ paddingLeft: 0 }}
            >
              Back
            </Button>
          </Group>

          <Badge
            variant="light"
            color="blue"
            mb="md"
            size="xs"
            tt="uppercase"
            style={{ letterSpacing: '0.08em' }}
          >
            Documentation
          </Badge>

          {/* Introduction */}
          <Title order={1} fw={700} mb="md" id="introduction">
            DesignMyPDF API Documentation
          </Title>

          <Text c="dimmed" mb="md">
            Learn to generate dynamic PDFs in minutes with our simple and powerful API.
          </Text>

          <Text mb="xl">
            The DesignMyPDF API lets you generate dynamic PDF documents from custom HTML templates.
            To use the API, you need a valid API key — obtain one from the{' '}
            <Anchor href="/dashboard/keys">API Keys</Anchor> section of your dashboard.
          </Text>

          <Divider my="xl" />

          {/* Authentication */}
          <Title order={2} fw={700} mb="md" id="authentication">
            Authentication
          </Title>

          <Text mb="md">
            All API requests require your API key sent in the <code>dmp_KEY</code> request header.
            You can view and manage your API keys in the{' '}
            <Anchor href="/dashboard/keys">Dashboard</Anchor>. Keep your keys secure — they carry
            full access to your account.
          </Text>

          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Authentication Header
              </Text>
            </Group>
            <CodeHighlight
              code={`fetch('https://dmpbackendapi.yvesdavinci.tech/api/generate-pdf/YOUR_TEMPLATE_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'dmp_KEY': 'YOUR_API_KEY'
  },
  body: JSON.stringify({ /* your data */ })
})`}
              language="javascript"
            />
          </Card>

          {/* Quickstart */}
          <Title order={2} fw={700} mb="md" id="quickstart">
            Quickstart Guide
          </Title>

          <Box mb="xl">
            {[
              {
                step: '1',
                title: 'Create a template',
                desc: 'Start with an HTML template using Handlebars variables. Our system uses the Handlebars template engine for dynamic content injection.',
              },
              {
                step: '2',
                title: 'Get the template ID',
                desc: 'Each template receives a unique identifier. You will use this ID in the URL of your API requests.',
              },
              {
                step: '3',
                title: 'Send an API request',
                desc: 'Make a POST request to /generate-pdf/:templateId with a JSON body containing the data to inject.',
              },
              {
                step: '4',
                title: 'Retrieve the generated PDF',
                desc: 'The API returns a JSON object with a "path" property — a URL to the generated PDF you can download or display.',
              },
            ].map((item) => (
              <Group key={item.step} align="flex-start" mb="md" gap="md">
                <Box
                  w={28}
                  h={28}
                  style={{
                    borderRadius: '50%',
                    backgroundColor: '#e7f5ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text size="xs" fw={700} c="blue">
                    {item.step}
                  </Text>
                </Box>
                <Box>
                  <Text fw={600} size="sm" mb={2}>
                    {item.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {item.desc}
                  </Text>
                </Box>
              </Group>
            ))}
          </Box>

          <Divider my="xl" />

          {/* PDF Generation */}
          <Title order={2} fw={700} mb="md" id="pdf-generation">
            PDF Generation
          </Title>
          <Alert
            color="orange"
            variant="light"
            radius="md"
            mb="md"
            title="Deprecation Notice"
            icon={<IconAlertTriangle size={16} />}
          >
            <Text size="sm">
              Synchronous PDF generation is deprecated and will be removed in a future version. Use{' '}
              <code>POST /api/generate-pdf/:templateId/async</code> combined with webhooks or job
              polling instead — see the{' '}
              <Anchor href="#webhooks" size="sm" fw={600}>
                Webhooks
              </Anchor>{' '}
              section.
            </Text>
          </Alert>
          <Text c="dimmed" mb="md">
            Endpoint for converting a template and dynamic data into a downloadable PDF.
          </Text>

          <Group mb="sm" gap="xs">
            <Badge color="blue" variant="filled" radius="sm" size="sm">
              POST
            </Badge>
            <Text ff="monospace" size="sm">
              /generate-pdf/:templateId
            </Text>
          </Group>

          <Text fw={600} size="sm" mb="sm">
            Parameters
          </Text>

          <Box mb="xs" pb="sm" style={{ borderBottom: '1px solid #f1f3f5' }}>
            <Group gap="xs" mb={2}>
              <Text ff="monospace" size="sm" c="blue">
                templateId
              </Text>
              <Text size="xs" c="dimmed">
                URI parameter
              </Text>
              <Badge color="red" variant="light" size="xs">
                REQUIRED
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" pl="xs">
              The unique identifier of the template to use.
            </Text>
          </Box>

          <Box mb="xs" pb="sm" style={{ borderBottom: '1px solid #f1f3f5' }}>
            <Group gap="xs" mb={2}>
              <Text ff="monospace" size="sm" c="blue">
                format
              </Text>
              <Text size="xs" c="dimmed">
                query string, optional
              </Text>
            </Group>
            <Text size="xs" c="dimmed" pl="xs">
              PDF page format: A4, A3, A2, etc. Default: A4.
            </Text>
          </Box>

          <Box mb="xs" pb="sm" style={{ borderBottom: '1px solid #f1f3f5' }}>
            <Group gap="xs" mb={2}>
              <Text ff="monospace" size="sm" c="blue">
                dmp_KEY
              </Text>
              <Text size="xs" c="dimmed">
                header
              </Text>
              <Badge color="red" variant="light" size="xs">
                REQUIRED
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" pl="xs">
              Your API key.
            </Text>
          </Box>

          <Box mb="xl" pb="sm">
            <Group gap="xs" mb={2}>
              <Text ff="monospace" size="sm" c="blue">
                body
              </Text>
              <Text size="xs" c="dimmed">
                JSON object
              </Text>
              <Badge color="red" variant="light" size="xs">
                REQUIRED
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" pl="xs">
              JSON object containing the data to inject into the template variables.
            </Text>
          </Box>

          <Card withBorder radius="md" p={0} mb="md" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Example Request
              </Text>
            </Group>
            <CodeHighlight
              code={`fetch('https://dmpbackendapi.yvesdavinci.tech/api/generate-pdf/YOUR_TEMPLATE_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'dmp_KEY': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    items: [
      { product: 'Product A', price: 19.99 },
      { product: 'Product B', price: 29.99 }
    ]
  })
})
.then(response => response.json())
.then(data => {
  console.log('PDF URL:', data.path);
})
.catch(error => console.error('Error:', error));`}
              language="javascript"
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Response
              </Text>
            </Group>
            <CodeHighlight
              code={`{
  "path": "https://storage.backblazeb2.com/file/your-bucket/templates/generated-pdf-file.pdf"
}`}
              language="json"
            />
          </Card>

          {/* Template Variables */}
          <Divider my="xl" id="templates-api" />

          <Title order={2} fw={700} mb="md">
            Template Variables
          </Title>
          <Text mb="md">Our templates use Handlebars syntax. Here are some examples:</Text>

          <Grid mb="xl">
            <Grid.Col span={6}>
              <Card withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
                <Box
                  px="md"
                  py="xs"
                  style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
                >
                  <Text size="xs" fw={600} c="dimmed">
                    Simple Variables
                  </Text>
                </Box>
                <CodeHighlight
                  code={'<p>Hello, {{name}}!</p>\n<p>Your email: {{email}}</p>'}
                  language="html"
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
                <Box
                  px="md"
                  py="xs"
                  style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
                >
                  <Text size="xs" fw={600} c="dimmed">
                    Conditionals
                  </Text>
                </Box>
                <CodeHighlight
                  code={
                    '{{#if premium}}\n  <p>You are a premium user!</p>\n{{else}}\n  <p>Upgrade to premium!</p>\n{{/if}}'
                  }
                  language="html"
                />
              </Card>
            </Grid.Col>
            <Grid.Col span={12}>
              <Card withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
                <Box
                  px="md"
                  py="xs"
                  style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
                >
                  <Text size="xs" fw={600} c="dimmed">
                    Loops
                  </Text>
                </Box>
                <CodeHighlight
                  code={
                    '<table>\n' +
                    '  <tr><th>Product</th><th>Price</th></tr>\n' +
                    '  {{#each items}}\n' +
                    '  <tr>\n' +
                    '    <td>{{this.product}}</td>\n' +
                    '    <td>{{this.price}} €</td>\n' +
                    '  </tr>\n' +
                    '  {{/each}}\n' +
                    '</table>'
                  }
                  language="html"
                />
              </Card>
            </Grid.Col>
          </Grid>

          {/* Best Practices */}
          <Divider my="xl" id="optimizations" />

          <Title order={2} fw={700} mb="md">
            Best Practices
          </Title>

          <Text fw={600} size="sm" mb="sm">
            Performance Optimizations
          </Text>
          <List spacing="sm" mb="xl" size="sm">
            <List.Item>
              <Text size="sm" fw={500} mb={2}>
                Reuse templates
              </Text>
              <Text size="sm" c="dimmed">
                Create reusable templates for different scenarios rather than creating a new
                template for each use case.
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" fw={500} mb={2}>
                Optimize images
              </Text>
              <Text size="sm" c="dimmed">
                Compress your images before including them in your template to reduce generation
                time.
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" fw={500} mb={2}>
                Cache generated PDFs
              </Text>
              <Text size="sm" c="dimmed">
                Cache frequently generated PDFs rather than regenerating them on every request.
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" fw={500} mb={2}>
                Send only necessary data
              </Text>
              <Text size="sm" c="dimmed">
                Only include data in your request that is actually needed by the template variables.
              </Text>
            </List.Item>
          </List>

          {/* Error Codes */}
          <Divider my="xl" id="error-codes" />

          <Title order={2} fw={700} mb="md">
            Error Codes
          </Title>
          <Alert color="orange" variant="light" radius="md" mb="xl">
            <Box>
              {[
                {
                  code: '401',
                  msg: 'Unauthorized — Check that your API key is valid and correctly sent in the dmp_KEY header.',
                },
                {
                  code: '400',
                  msg: 'Bad Request — Ensure the request format is correct and all required data is provided.',
                },
                {
                  code: '404',
                  msg: 'Not Found — Verify that the templateId is correct.',
                },
                {
                  code: '429',
                  msg: 'Too Many Requests — You have exceeded your usage limit. Check your quota in the dashboard.',
                },
                {
                  code: '500',
                  msg: 'Internal Server Error — Contact support if the problem persists.',
                },
              ].map((e) => (
                <Group key={e.code} mb="xs" align="flex-start" gap="sm">
                  <Text ff="monospace" size="sm" fw={700}>
                    {e.code}
                  </Text>
                  <Text size="sm">{e.msg}</Text>
                </Group>
              ))}
            </Box>
          </Alert>

          {/* Marketplace */}
          <Divider my="xl" id="marketplace" />
          <Title order={2} fw={700} mb="md">
            Marketplace Integrations
          </Title>
          <Text c="dimmed" mb="md">
            Connect Design My PDF with your existing tools and services through our growing
            marketplace of integrations.
          </Text>
          <Alert color="blue" variant="light" radius="md" mb="xl">
            <Group align="center" gap="sm">
              <Badge color="blue" variant="filled" size="xs">
                Coming Soon
              </Badge>
              <Text size="sm">
                Integrations with Zapier, Make (Integromat), and direct platform connectors are in
                active development.{' '}
                <Anchor href="/dashboard" size="sm">
                  Get notified →
                </Anchor>
              </Text>
            </Group>
          </Alert>

          {/* Webhooks */}
          <Divider my="xl" id="webhooks" />
          <Title order={2} fw={700} mb="md">
            Webhooks
          </Title>
          <Text c="dimmed" mb="md">
            Receive real-time HTTP POST notifications when PDF generation jobs change state. Combine
            async generation with webhooks to avoid polling entirely.
          </Text>
          <Alert
            color="blue"
            variant="light"
            radius="md"
            mb="xl"
            title="Recommended approach"
            icon={<IconAlertTriangle size={16} />}
          >
            <Text size="sm">
              Async generation + webhooks is the recommended way to generate PDFs. Synchronous
              generation (<code>POST /api/generate-pdf/:templateId</code>) is deprecated and will be
              removed in a future version.
            </Text>
          </Alert>

          {/* ── Async generation ── */}
          <Title order={3} fw={600} mb="xs">
            Async PDF Generation
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            Use the async endpoint to queue a job and get a <code>job_id</code> immediately, without
            waiting for rendering to complete. Then receive a webhook on completion, or poll the job
            status endpoint.
          </Text>

          <Card withBorder radius="md" p={0} mb="sm" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                POST /api/generate-pdf/:templateId/async
              </Text>
              <Badge color="blue" variant="light" size="xs">
                JWT required
              </Badge>
            </Group>
            <CodeHighlight
              language="javascript"
              code={`// Request
fetch('/api/generate-pdf/YOUR_TEMPLATE_UUID/async', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Alice', total: 149.99 }),
});

// Response 202
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued"
}`}
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                GET /api/pdf-jobs/:jobId — poll job status
              </Text>
              <Badge color="blue" variant="light" size="xs">
                JWT required
              </Badge>
            </Group>
            <CodeHighlight
              language="json"
              code={`// Response — completed
{
  "job": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "result_path": "https://storage.example.com/pdfs/output.pdf",
    "created_at": "2024-01-15T10:29:55Z",
    "updated_at": "2024-01-15T10:30:02Z"
  }
}

// status values: "queued" | "running" | "completed" | "failed"`}
            />
          </Card>

          {/* ── Webhook subscriptions ── */}
          <Title order={3} fw={600} mb="xs">
            Webhook Subscription Endpoints
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            All subscription endpoints require a JWT (Bearer token). Subscriptions belong to the
            authenticated user.
          </Text>

          <Card withBorder radius="md" p={0} mb="sm" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                GET /api/webhook-events/definitions — list available events
              </Text>
              <Badge color="blue" variant="light" size="xs">
                JWT required
              </Badge>
            </Group>
            <CodeHighlight
              language="json"
              code={`// Response 200
{ "events": ["PdfJobQueued", "PdfJobCompleted", "PdfJobFailed"] }`}
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="sm" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                POST /api/webhook-subscriptions — create subscription
              </Text>
              <Badge color="green" variant="light" size="xs">
                201 Created
              </Badge>
            </Group>
            <CodeHighlight
              language="javascript"
              code={`// Request body
{
  "webhook_uri": "https://your-api.com/webhooks",
  "event_names": ["PdfJobCompleted", "PdfJobFailed"],
  "key_ids": [42]          // optional — omit to receive events for ALL keys
}

// Response 201 — secret shown ONCE, store it immediately
{
  "subscription": { "id": "...", "webhook_uri": "...", "is_active": true, ... },
  "secret": "whsec_abc123..."
}`}
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="sm" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                GET /api/webhook-subscriptions — list subscriptions
              </Text>
              <Badge color="blue" variant="light" size="xs">
                JWT required
              </Badge>
            </Group>
            <CodeHighlight
              language="json"
              code={`// Response 200
{
  "subscriptions": [
    {
      "id": "550e8400-...",
      "webhook_uri": "https://your-api.com/webhooks",
      "is_active": true,
      "event_names": ["PdfJobCompleted"],
      "keys": [{ "subscription_id": "...", "key_id": 42 }],
      "last_delivery_status": 200,
      "last_delivery_at": "2024-01-15T10:30:02Z",
      "created_at": "2024-01-10T08:00:00Z"
    }
  ]
}`}
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="sm" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                PATCH /api/webhook-subscriptions/:id — update / regenerate secret
              </Text>
              <Badge color="orange" variant="light" size="xs">
                Partial update
              </Badge>
            </Group>
            <CodeHighlight
              language="javascript"
              code={`// All fields optional
{
  "webhook_uri": "https://new-url.com/hook",
  "event_names": ["PdfJobQueued", "PdfJobCompleted", "PdfJobFailed"],
  "key_ids": [],            // empty = all keys
  "is_active": false,       // pause delivery without deleting

  "regenerate_secret": true // if true → response includes new "secret" field
}

// Response when regenerate_secret is true
{ "subscription": { ... }, "secret": "whsec_newvalue..." }`}
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="sm" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                DELETE /api/webhook-subscriptions/:id — delete subscription
              </Text>
              <Badge color="red" variant="light" size="xs">
                204 No Content
              </Badge>
            </Group>
            <CodeHighlight
              language="javascript"
              code={`fetch('/api/webhook-subscriptions/550e8400-...', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer YOUR_JWT' },
});
// Response 204 — no body`}
            />
          </Card>

          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              justify="space-between"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                GET /api/webhook-subscriptions/:id/deliveries — delivery history
              </Text>
              <Badge color="blue" variant="light" size="xs">
                JWT required
              </Badge>
            </Group>
            <CodeHighlight
              language="json"
              code={`// Response 200
{
  "attempts": [
    {
      "id": "...",
      "subscription_id": "...",
      "event_name": "PdfJobCompleted",
      "http_status": 200,
      "response_snippet": "ok",
      "error": "",
      "attempt_no": 1,
      "payload_json": "{ \"event\": \"PdfJobCompleted\", ... }",
      "created_at": "2024-01-15T10:30:02Z"
    }
  ],
  "total": 1
}`}
            />
          </Card>

          {/* ── Event types ── */}
          <Title order={3} fw={600} mb="sm">
            Event Types
          </Title>
          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Table>
              <Table.Thead style={{ backgroundColor: '#f8f9fa' }}>
                <Table.Tr>
                  <Table.Th style={{ fontWeight: 600, fontSize: 12 }}>Event name</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 12 }}>Trigger</Table.Th>
                  <Table.Th style={{ fontWeight: 600, fontSize: 12 }}>status field</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <code>PdfJobQueued</code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      Job accepted and queued for processing
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <code>queued</code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <code>PdfJobCompleted</code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      PDF rendered and uploaded to storage
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <code>completed</code>
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <code>PdfJobFailed</code>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      Generation failed after all retries
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <code>failed</code>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Card>

          {/* ── Payload ── */}
          <Title order={3} fw={600} mb="sm">
            Webhook Payload
          </Title>
          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                POST to your endpoint — body (PdfJobCompleted)
              </Text>
            </Group>
            <CodeHighlight
              language="json"
              code={`{
  "event": "PdfJobCompleted",
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "key_id": 42,
  "template_uuid": "abc123",
  "status": "completed",
  "path": "https://storage.example.com/pdfs/output.pdf",
  "occurred_at": "2024-01-15T10:30:00Z"
}`}
            />
          </Card>

          {/* ── Signature ── */}
          <Title order={3} fw={600} mb="sm">
            Signature Verification
          </Title>
          <Text size="sm" c="dimmed" mb="sm">
            Every request includes a <code>Dmp-Webhook-Signature: sha256=&lt;hex&gt;</code> header.
            Compute HMAC-SHA256 of the raw request body using your signing secret and compare with
            the header value. Always use <code>timingSafeEqual</code> to prevent timing attacks.
          </Text>
          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Node.js — signature verification
              </Text>
            </Group>
            <CodeHighlight
              language="javascript"
              code={`const crypto = require('crypto');

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signatureHeader)
  );
}

// Express example
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['dmp-webhook-signature'];
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.body);
  // handle event.event: "PdfJobQueued" | "PdfJobCompleted" | "PdfJobFailed"
  res.sendStatus(200);
});`}
            />
          </Card>

          <Alert color="blue" variant="light" radius="md" mb="xl" title="Manage Subscriptions">
            <Text size="sm">
              Create and manage webhook endpoints from the{' '}
              <Anchor href="/dashboard/webhooks" size="sm" fw={600}>
                Dashboard → Webhooks
              </Anchor>{' '}
              page. Each endpoint can be scoped to specific API keys and event types.
            </Text>
          </Alert>

          {/* Node.js SDK */}
          <Divider my="xl" id="nodejs" />
          <Title order={2} fw={700} mb="md">
            Node.js SDK
          </Title>
          <Text c="dimmed" mb="md">
            The official Node.js SDK provides a simple, typed interface for all Design My PDF API
            endpoints.
          </Text>
          {SDK_IN_DEV_ALERT}
          <Card withBorder radius="md" p={0} mb="md" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Installation
              </Text>
            </Group>
            <CodeHighlight code="npm install @designmypdf/node" language="javascript" />
          </Card>
          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Node.js / Usage
              </Text>
            </Group>
            <CodeHighlight
              code={`import { DesignMyPDF } from '@designmypdf/node';

const client = new DesignMyPDF('YOUR_API_KEY');

const pdf = await client.generate({
  templateId: 'YOUR_TEMPLATE_ID',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    items: [{ product: 'Product A', price: 19.99 }],
  },
});

// pdf.path — download link
console.log(pdf.path);`}
              language="javascript"
            />
          </Card>

          {/* Python Client */}
          <Divider my="xl" id="python" />
          <Title order={2} fw={700} mb="md">
            Python Client
          </Title>
          <Text c="dimmed" mb="md">
            Use the Python client to integrate PDF generation into data pipelines, Django, Flask, or
            FastAPI applications.
          </Text>
          {SDK_IN_DEV_ALERT}
          <Card withBorder radius="md" p={0} mb="md" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Installation
              </Text>
            </Group>
            <CodeHighlight code="pip install designmypdf" language="javascript" />
          </Card>
          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Python / Usage
              </Text>
            </Group>
            <CodeHighlight
              code={`from designmypdf import DesignMyPDF

client = DesignMyPDF("YOUR_API_KEY")

pdf = client.generate(
    template_id="YOUR_TEMPLATE_ID",
    data={
        "name": "John Doe",
        "email": "john@example.com",
        "items": [{"product": "Product A", "price": 19.99}],
    }
)

print(pdf["path"])  # download link`}
              language="javascript"
            />
          </Card>

          {/* CLI Reference */}
          <Divider my="xl" id="cli" />
          <Title order={2} fw={700} mb="md">
            CLI Reference
          </Title>
          <Text c="dimmed" mb="md">
            The Design My PDF CLI lets you generate PDFs, manage templates, and test your
            integration directly from the terminal.
          </Text>
          {SDK_IN_DEV_ALERT}
          <Card withBorder radius="md" p={0} mb="md" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                Installation
              </Text>
            </Group>
            <CodeHighlight code="npm install -g @designmypdf/cli" language="javascript" />
          </Card>
          <Card withBorder radius="md" p={0} mb="xl" style={{ overflow: 'hidden' }}>
            <Group
              px="md"
              py="xs"
              style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}
            >
              <Text size="xs" fw={600} c="dimmed">
                CLI / Commands
              </Text>
            </Group>
            <CodeHighlight
              code={`# Authenticate
dmpdf auth login --key YOUR_API_KEY

# Generate a PDF from a template
dmpdf generate \\
  --template YOUR_TEMPLATE_ID \\
  --data '{"name": "John Doe"}' \\
  --output invoice.pdf

# List templates
dmpdf templates list

# View recent generation logs
dmpdf logs --limit 10`}
              language="javascript"
            />
          </Card>

          <Group justify="space-between" align="center">
            <Box>
              <Text size="xs" c="dimmed">
                Last updated May 2025
              </Text>
            </Box>
            <Group gap="sm">
              <Text size="sm" c="dimmed">
                Was this helpful?
              </Text>
              <Button variant="light" size="xs" leftSection={<IconThumbUp size={14} />}>
                Yes
              </Button>
              <Button variant="light" size="xs" leftSection={<IconThumbDown size={14} />}>
                No
              </Button>
            </Group>
          </Group>
        </Box>
      </Box>
    </>
  );
};

export default Documentation;
