import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  NumberInput,
  ScrollArea,
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
import { useElementSize, useMediaQuery } from '@mantine/hooks';
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
import {
  MARKETPLACE_CATEGORIES,
  MIN_MARKETPLACE_DESCRIPTION_LENGTH,
  validateMarketplaceListingInput,
} from '@/constants/marketplace';

export default function AddListingPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [features, setFeatures] = useState('');
  /** URL HTTPS après chargement template ou après upload au publish */
  const [coverImageUrl, setCoverImageUrl] = useState('');
  /** Fichier choisi au drop — upload Backblaze uniquement au publish */
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  /** Prévisualisation locale (Object URL) */
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const coverDisplaySrc = coverPreviewUrl || coverImageUrl;
  const hasCoverVisual = Boolean(coverDisplaySrc);

  const revokeCoverPreview = useCallback(() => {
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingCoverFile(null);
  }, []);

  const clearCover = useCallback(() => {
    revokeCoverPreview();
    setCoverImageUrl('');
  }, [revokeCoverPreview]);

  const isMdUp = useMediaQuery('(min-width: 62em)');
  const { ref: formMeasureRef, height: formColumnHeight } = useElementSize();
  const previewMaxHeight =
    isMdUp && formColumnHeight > 0 ? formColumnHeight : undefined;

  const session = authApi.getUserSession();
  const userName = session?.userName ?? 'G';
  const initials = userName.slice(0, 2).toUpperCase();

  useEffect(() => {
    templateApi
      .getTemplates()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const tid = router.query.templateId;
    if (typeof tid !== 'string' || !tid) return;
    setSelectedTemplateId(tid);
    templateApi
      .getTemplateById(tid)
      .then((t) => {
        setTitle(t.name || '');
        if (t.description) setDescription(t.description);
        if (t.category) setCategory(t.category);
        if (t.price != null && t.price > 0) setPrice(t.price / 100);
        if (t.features?.length) setFeatures(t.features.join(', '));
        revokeCoverPreview();
        setCoverImageUrl(t.cover_image_url || '');
      })
      .catch(() => {});
  }, [router.isReady, router.query.templateId, revokeCoverPreview]);

  const lockTemplateSelect = typeof router.query.templateId === 'string' && router.query.templateId.length > 0;

  const handleImageDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingCoverFile(file);
  };

  useEffect(
    () => () => {
      setCoverPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    },
    [],
  );

  const handlePublish = async () => {
    if (!selectedTemplateId) {
      notifications.show({
        title: 'Champs manquants',
        message: 'Sélectionnez un template à publier.',
        color: 'red',
      });
      return;
    }
    const validationErrors = validateMarketplaceListingInput({
      title,
      category,
      description,
      coverImageUrl,
      hasPendingCoverFile: !!pendingCoverFile,
      featuresRaw: features,
    });
    if (validationErrors.length > 0) {
      notifications.show({
        title: 'Formulaire incomplet',
        message: validationErrors.join(' '),
        color: 'red',
        autoClose: 9000,
      });
      return;
    }
    setPublishing(true);
    try {
      let finalCoverUrl = coverImageUrl.trim();
      if (pendingCoverFile) {
        setUploading(true);
        try {
          const { url } = await templateApi.uploadCoverImage(pendingCoverFile);
          finalCoverUrl = url.trim();
          setCoverImageUrl(finalCoverUrl);
          revokeCoverPreview();
        } catch {
          notifications.show({
            title: 'Erreur',
            message: 'Échec du téléversement de la couverture.',
            color: 'red',
          });
          return;
        } finally {
          setUploading(false);
        }
      }

      await templateApi.publishToMarketplace({
        templateId: Number(selectedTemplateId),
        name: title.trim(),
        price: Math.round(price * 100),
        description: description.trim(),
        category: category!,
        features: features
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean),
        coverImageURL: finalCoverUrl,
      });
      notifications.show({
        title: 'Publié',
        message: 'Le template est en ligne sur le marketplace.',
        color: 'teal',
      });
      router.push('/dashboard/marketplace');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      notifications.show({
        title: 'Erreur',
        message: msg || 'Publication impossible.',
        color: 'red',
      });
    } finally {
      setPublishing(false);
    }
  };

  const featureBadges = features
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  const previewPrice = price > 0 ? `$${price.toFixed(2)}` : '$0.00';

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Box
        px={{ base: 16, sm: 24, md: 32 }}
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #e9ecef',
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md" w="100%" py="xs">
          <Group gap="xl" wrap="wrap">
            <Group gap={6} style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/')}>
              <IconDiamondFilled size={18} color="#228be6" />
              <Text fw={700} size="sm">
                Design My PDF
              </Text>
            </Group>
            <Group gap={0} wrap="wrap">
              <Anchor size="sm" c="dimmed" onClick={() => router.push('/marketplace')}>
                Marketplace
              </Anchor>
              <Anchor
                size="sm"
                fw={600}
                c="blue"
                ml={{ base: 'md', sm: 'lg' }}
                style={{ borderBottom: '2px solid #228be6', paddingBottom: 2 }}
              >
                Add Listing
              </Anchor>
            </Group>
          </Group>
          <Group gap="sm" wrap="wrap">
            <Button size="xs" onClick={() => router.push('/dashboard/templates')}>
              Create New
            </Button>
            <ActionIcon variant="subtle" color="gray">
              <IconBell size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="gray">
              <IconSettings size={18} />
            </ActionIcon>
            <Avatar size={32} radius="xl" color="blue" variant="filled">
              {initials}
            </Avatar>
          </Group>
        </Group>
      </Box>

      {/* Content */}
      <Box px={{ base: 16, sm: 32, lg: 48 }} py={{ base: 20, md: 32 }}>
        <Title order={3} fw={700} mb={4}>
          Create New Marketplace Listing
        </Title>
        <Text c="dimmed" size="sm" mb={32}>
          Configure your document template details and technical specifications for the marketplace.
        </Text>

        <Grid gutter="xl" align="flex-start">
          {/* Form */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Box ref={formMeasureRef}>
              <Card withBorder radius="md" p="xl" shadow="xs">
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Template Title"
                      placeholder="e.g. Modern Professional Invoice"
                      value={title}
                      onChange={(e) => setTitle(e.currentTarget.value)}
                      required
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Category"
                      placeholder="Select category"
                      data={[...MARKETPLACE_CATEGORIES]}
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
                  disabled={lockTemplateSelect}
                  description={
                    lockTemplateSelect
                      ? 'Template pré-sélectionné depuis l’éditeur.'
                      : undefined
                  }
                />

                <Textarea
                  label="Detailed Description"
                  placeholder="Describe the template structure, intended use cases, and design philosophy..."
                  description={`Minimum ${MIN_MARKETPLACE_DESCRIPTION_LENGTH} caractères (${description.trim().length}/${MIN_MARKETPLACE_DESCRIPTION_LENGTH}).`}
                  minRows={4}
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  required
                />

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
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
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Features (comma separated)"
                      placeholder="Auto-pagination, Dynamic Tables, SVG support..."
                      value={features}
                      onChange={(e) => setFeatures(e.currentTarget.value)}
                      required
                      description="Au moins une fonctionnalité, séparées par des virgules."
                    />
                  </Grid.Col>
                </Grid>

                {/* Cover image dropzone */}
                <Box>
                  <Text size="sm" fw={500} mb={6}>
                    Template Preview Thumbnail
                  </Text>
                  {hasCoverVisual ? (
                    <Box style={{ position: 'relative' }}>
                      <Box
                        h={200}
                        w="100%"
                        pos="relative"
                        style={{
                          overflow: 'hidden',
                          borderRadius: 8,
                          border: '1px solid #e9ecef',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <Image
                          src={coverDisplaySrc}
                          alt="Cover"
                          fit="cover"
                          w="100%"
                          h="100%"
                          style={{ objectFit: 'cover' }}
                        />
                      </Box>
                      <Button size="xs" variant="light" mt={8} onClick={clearCover}>
                        Remove image
                      </Button>
                    </Box>
                  ) : (
                    <Dropzone
                      onDrop={handleImageDrop}
                      accept={IMAGE_MIME_TYPE}
                      maxSize={10 * 1024 * 1024}
                      loading={false}
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
                          <Dropzone.Accept>
                            <IconUpload size={32} color="#228be6" />
                          </Dropzone.Accept>
                          <Dropzone.Reject>
                            <IconPhoto size={32} color="red" />
                          </Dropzone.Reject>
                          <Dropzone.Idle>
                            <IconPhoto size={32} color="#adb5bd" />
                          </Dropzone.Idle>
                          <Text fw={600} size="sm">
                            Drop thumbnail here or click to browse
                          </Text>
                          <Text size="xs" c="dimmed">
                            PNG or JPEG up to 10MB. Recommended ratio 4:3.
                          </Text>
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
                    loading={publishing || uploading}
                    rightSection={<span>▷</span>}
                    onClick={handlePublish}
                  >
                    Publish Template
                  </Button>
                </Group>
              </Box>
            </Card>
            </Box>
          </Grid.Col>

          {/* Live preview */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <ScrollArea
              type="auto"
              scrollbarSize={8}
              style={{ maxHeight: previewMaxHeight }}
              offsetScrollbars="y"
            >
            <Stack gap="md">
              <Box>
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  c="dimmed"
                  mb="xs"
                  style={{ letterSpacing: '0.05em' }}
                >
                  REAL-TIME PREVIEW
                </Text>
                <Card withBorder radius="md" shadow="xs" p={0} style={{ overflow: 'hidden' }}>
                  {hasCoverVisual ? (
                    <Box
                      h={160}
                      pos="relative"
                      style={{
                        overflow: 'hidden',
                        backgroundColor: '#e9ecef',
                      }}
                    >
                      <Image
                        src={coverDisplaySrc}
                        alt="preview"
                        fit="cover"
                        w="100%"
                        h="100%"
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
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
                          <Text size="xs" c="dimmed" ta="center">
                            PREVIEWING LAYOUT
                          </Text>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                  <Box p="md">
                    <Group justify="space-between" mb={8}>
                      <Badge color="gray" variant="light" size="xs">
                        UNPUBLISHED
                      </Badge>
                      <Text fw={700} size="sm" c="blue">
                        {previewPrice}
                      </Text>
                    </Group>
                    <Text fw={700} size="sm" mb={4}>
                      {title || 'Document Title'}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={3}>
                      {description ||
                        'Template description will appear here as you type. Ensure your description highlights the technical benefits and ease of integration.'}
                    </Text>
                    {featureBadges.length > 0 && (
                      <Group gap={4} mt={8}>
                        {featureBadges.slice(0, 3).map((f) => (
                          <Badge key={f} size="xs" variant="outline" color="gray">
                            {f}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Box>
                </Card>
              </Box>

              <Card withBorder radius="md" shadow="xs" p="md">
                <Group gap={6} mb="sm">
                  <Box
                    w={16}
                    h={16}
                    style={{
                      borderRadius: '50%',
                      backgroundColor: '#228be6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text size="xs" c="white" fw={700}>
                      ✓
                    </Text>
                  </Box>
                  <Text size="sm" fw={600} c="blue">
                    Marketplace Guidelines
                  </Text>
                </Group>
                <Stack gap={6}>
                  {[
                    'Ensure all dynamic variables follow the {{VARIABLE}} syntax.',
                    'Thumbnails must be original and represent the final output.',
                    'Payouts are processed 14 days after a successful transaction.',
                  ].map((g) => (
                    <Group key={g} gap={6} align="flex-start">
                      <Text size="xs" c="dimmed">
                        →
                      </Text>
                      <Text size="xs" c="dimmed">
                        {g}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Stack>
            </ScrollArea>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
