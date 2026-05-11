import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Badge,
  Anchor,
  ActionIcon,
  Avatar,
  Center,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import {
  IconDiamondFilled,
  IconBell,
  IconSettings,
  IconUpload,
  IconPhoto,
} from '@tabler/icons-react';
import { templateApi, TemplateDTO } from '@/api/templateApi';
import { authApi } from '@/api/authApi';

const CATEGORIES = [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'FINANCIAL REPORT', label: 'Financial Report' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'OTHER', label: 'Other' },
];

export default function AddListingPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [features, setFeatures] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const session = authApi.getUserSession();
  const userName = session?.userName ?? 'G';
  const initials = userName.slice(0, 2).toUpperCase();

  useEffect(() => {
    templateApi.getTemplates().then(setTemplates).catch(() => {});
  }, []);

  const handleImageDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await templateApi.uploadCoverImage(file);
      setCoverImageUrl(url);
      notifications.show({ title: 'Uploaded', message: 'Cover image uploaded', color: 'teal' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to upload image', color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedTemplateId) {
      notifications.show({ title: 'Error', message: 'Select a template to publish', color: 'red' });
      return;
    }
    if (!title || !category || !description) {
      notifications.show({ title: 'Error', message: 'Fill in all required fields', color: 'red' });
      return;
    }
    setPublishing(true);
    try {
      await templateApi.publishToMarketplace({
        templateId: Number(selectedTemplateId),
        price: Math.round(price * 100),
        description,
        category: category!,
        features: features.split(',').map((f) => f.trim()).filter(Boolean),
        coverImageURL: coverImageUrl,
      });
      notifications.show({ title: 'Published!', message: 'Template is now live on the marketplace', color: 'teal' });
      router.push('/marketplace');
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to publish template', color: 'red' });
    } finally {
      setPublishing(false);
    }
  };

  const featureBadges = features.split(',').map((f) => f.trim()).filter(Boolean);
  const previewPrice = price > 0 ? `$${price.toFixed(2)}` : '$0.00';

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Box
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e9ecef',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Group gap="xl">
          <Group gap={6} style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/')}>
            <IconDiamondFilled size={18} color="#228be6" />
            <Text fw={700} size="sm">Design My PDF</Text>
          </Group>
          <Group gap={0}>
            <Anchor size="sm" c="dimmed" onClick={() => router.push('/marketplace')}>
              Marketplace
            </Anchor>
            <Anchor
              size="sm"
              fw={600}
              c="blue"
              ml="lg"
              style={{ borderBottom: '2px solid #228be6', paddingBottom: 2 }}
            >
              Add Listing
            </Anchor>
          </Group>
        </Group>
        <Group gap="sm">
          <Button size="xs" onClick={() => router.push('/dashboard/templates')}>Create New</Button>
          <ActionIcon variant="subtle" color="gray"><IconBell size={18} /></ActionIcon>
          <ActionIcon variant="subtle" color="gray"><IconSettings size={18} /></ActionIcon>
          <Avatar size={32} radius="xl" color="blue" variant="filled">{initials}</Avatar>
        </Group>
      </Box>

      {/* Content */}
      <Box px={48} py={32}>
        <Title order={3} fw={700} mb={4}>Create New Marketplace Listing</Title>
        <Text c="dimmed" size="sm" mb={32}>
          Configure your document template details and technical specifications for the marketplace.
        </Text>

        <Grid gutter="xl">
          {/* Form */}
          <Grid.Col span={8}>
            <Card withBorder radius="md" p="xl" shadow="xs">
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <TextInput
                      label="Template Title"
                      placeholder="e.g. Modern Professional Invoice"
                      value={title}
                      onChange={(e) => setTitle(e.currentTarget.value)}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Category"
                      placeholder="Select category"
                      data={CATEGORIES}
                      value={category}
                      onChange={setCategory}
                      required
                    />
                  </Grid.Col>
                </Grid>

                <Select
                  label="Select Template to Publish"
                  placeholder="Choose from your templates..."
                  data={templates.map((t) => ({ value: String(t.ID), label: t.name }))}
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  required
                />

                <Textarea
                  label="Detailed Description"
                  placeholder="Describe the template structure, intended use cases, and design philosophy..."
                  minRows={4}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  required
                />

                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Price ($)"
                      placeholder="0.00"
                      value={price}
                      onChange={(v) => setPrice(Number(v) || 0)}
                      min={0}
                      decimalScale={2}
                      prefix="$ "
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Features (comma separated)"
                      placeholder="Auto-pagination, Dynamic Tables, SVG support..."
                      value={features}
                      onChange={(e) => setFeatures(e.currentTarget.value)}
                    />
                  </Grid.Col>
                </Grid>

                {/* Cover image dropzone */}
                <Box>
                  <Text size="sm" fw={500} mb={6}>Template Preview Thumbnail</Text>
                  {coverImageUrl ? (
                    <Box style={{ position: 'relative' }}>
                      <Image src={coverImageUrl} radius="md" h={180} fit="cover" alt="Cover" />
                      <Button
                        size="xs"
                        variant="light"
                        mt={8}
                        onClick={() => setCoverImageUrl('')}
                      >
                        Remove image
                      </Button>
                    </Box>
                  ) : (
                    <Dropzone
                      onDrop={handleImageDrop}
                      accept={IMAGE_MIME_TYPE}
                      maxSize={10 * 1024 * 1024}
                      loading={uploading}
                      style={{
                        border: '1.5px dashed #ced4da',
                        borderRadius: 8,
                        padding: 32,
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Center>
                        <Stack align="center" gap={8}>
                          <Dropzone.Accept><IconUpload size={32} color="#228be6" /></Dropzone.Accept>
                          <Dropzone.Reject><IconPhoto size={32} color="red" /></Dropzone.Reject>
                          <Dropzone.Idle><IconPhoto size={32} color="#adb5bd" /></Dropzone.Idle>
                          <Text fw={600} size="sm">Drop thumbnail here or click to browse</Text>
                          <Text size="xs" c="dimmed">PNG or JPEG up to 10MB. Recommended ratio 4:3.</Text>
                        </Stack>
                      </Center>
                    </Dropzone>
                  )}
                </Box>
              </Stack>

              <Box style={{ borderTop: '1px solid #e9ecef', marginTop: 24, paddingTop: 20 }}>
                <Group justify="flex-end" gap="md">
                  <Button variant="subtle" c="dimmed" onClick={() => router.back()}>
                    Discard Draft
                  </Button>
                  <Button
                    loading={publishing}
                    rightSection={<span>▷</span>}
                    onClick={handlePublish}
                  >
                    Publish Template
                  </Button>
                </Group>
              </Box>
            </Card>
          </Grid.Col>

          {/* Live preview */}
          <Grid.Col span={4}>
            <Stack gap="md">
              <Box>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs" style={{ letterSpacing: '0.05em' }}>
                  REAL-TIME PREVIEW
                </Text>
                <Card withBorder radius="md" shadow="xs" p={0} style={{ overflow: 'hidden' }}>
                  {coverImageUrl ? (
                    <Image src={coverImageUrl} h={160} fit="cover" alt="preview" />
                  ) : (
                    <Box
                      h={160}
                      style={{
                        backgroundColor: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Stack align="center" gap={4}>
                        <Box
                          style={{
                            width: 80,
                            height: 100,
                            backgroundColor: '#dee2e6',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text size="xs" c="dimmed" ta="center">PREVIEWING LAYOUT</Text>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                  <Box p="md">
                    <Group justify="space-between" mb={8}>
                      <Badge color="gray" variant="light" size="xs">UNPUBLISHED</Badge>
                      <Text fw={700} size="sm" c="blue">{previewPrice}</Text>
                    </Group>
                    <Text fw={700} size="sm" mb={4}>{title || 'Document Title'}</Text>
                    <Text size="xs" c="dimmed" lineClamp={3}>
                      {description || 'Template description will appear here as you type. Ensure your description highlights the technical benefits and ease of integration.'}
                    </Text>
                    {featureBadges.length > 0 && (
                      <Group gap={4} mt={8}>
                        {featureBadges.slice(0, 3).map((f) => (
                          <Badge key={f} size="xs" variant="outline" color="gray">{f}</Badge>
                        ))}
                      </Group>
                    )}
                  </Box>
                </Card>
              </Box>

              <Card withBorder radius="md" shadow="xs" p="md">
                <Group gap={6} mb="sm">
                  <Box w={16} h={16} style={{ borderRadius: '50%', backgroundColor: '#228be6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text size="xs" c="white" fw={700}>✓</Text>
                  </Box>
                  <Text size="sm" fw={600} c="blue">Marketplace Guidelines</Text>
                </Group>
                <Stack gap={6}>
                  {[
                    'Ensure all dynamic variables follow the {{VARIABLE}} syntax.',
                    'Thumbnails must be original and represent the final output.',
                    'Payouts are processed 14 days after a successful transaction.',
                  ].map((g) => (
                    <Group key={g} gap={6} align="flex-start">
                      <Text size="xs" c="dimmed">→</Text>
                      <Text size="xs" c="dimmed">{g}</Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
