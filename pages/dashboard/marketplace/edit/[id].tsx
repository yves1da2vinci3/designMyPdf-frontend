import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Image,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Center,
  Loader,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { MarketplaceFeaturesTags } from '@/components/marketplace/MarketplaceFeaturesTags';
import { templateApi, TemplateDTO } from '@/api/templateApi';
import { MARKETPLACE_CATEGORIES, validateMarketplaceListingInput } from '@/constants/marketplace';

export default function EditMarketplaceListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const templateId = typeof id === 'string' ? id : '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<TemplateDTO | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [price, setPrice] = useState<number>(0);
  const [featureTags, setFeatureTags] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (!router.isReady || !templateId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const t = await templateApi.getTemplateById(templateId);
        if (cancelled) return;
        if (!t.is_marketplace) {
          setTemplate(null);
          setLoading(false);
          return;
        }
        setTemplate(t);
        setTitle(t.name || '');
        setDescription(t.description || '');
        setCategory(t.category || null);
        const paid = t.price != null && t.price > 0;
        setIsPaid(paid);
        setPrice(paid && t.price != null ? t.price / 100 : 0);
        setFeatureTags(t.features?.length ? [...t.features] : []);
        revokeCoverPreview();
        setCoverImageUrl(t.cover_image_url || '');
        setIsPublished(!!t.is_published);
      } catch {
        if (!cancelled) setTemplate(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, templateId, revokeCoverPreview]);

  useEffect(
    () => () => {
      setCoverPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    },
    [],
  );

  const handleImageDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingCoverFile(file);
  };

  const handleSave = async () => {
    if (!template) return;
    const validationErrors = validateMarketplaceListingInput({
      title,
      category,
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
    setSaving(true);
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

      await templateApi.updateMarketplaceListing(template.ID, {
        name: title.trim(),
        price: isPaid ? Math.round(price * 100) : 0,
        description: description.trim(),
        category: category!,
        features: featureTags.map((f) => f.trim()).filter(Boolean),
        coverImageURL: finalCoverUrl,
        isPublished,
      });
      notifications.show({
        title: 'Enregistré',
        message: 'Annonce marketplace mise à jour.',
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
        message: msg || 'Mise à jour impossible.',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!router.isReady || !templateId) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  if (loading) {
    return (
      <Center h={280}>
        <Loader type="bars" />
      </Center>
    );
  }

  if (!template) {
    return (
      <Stack gap="md">
        <Alert color="yellow" title="Annonce introuvable">
          Ce template n’est pas une annonce marketplace ou n’existe pas. Publiez-le d’abord depuis
          le formulaire dédié.
        </Alert>
        <Button variant="light" onClick={() => router.push('/marketplace/add')}>
          Nouvelle annonce
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap" gap="md">
        <Box style={{ minWidth: 0 }}>
          <Title order={2}>Modifier l’annonce</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Template #{template.ID} — {template.name}
          </Text>
        </Box>
        <Button variant="default" onClick={() => router.push('/dashboard/marketplace')}>
          Annuler
        </Button>
      </Group>

      <Card withBorder p="lg">
        <Stack gap="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Titre"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Catégorie"
                data={[...MARKETPLACE_CATEGORIES]}
                value={category}
                onChange={setCategory}
                required
              />
            </Grid.Col>
          </Grid>

          <Textarea
            label="Description"
            description="Optionnel."
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />

          <Switch
            label="Annonce payante"
            description="Désactivé = gratuit (prix à 0)."
            checked={isPaid}
            onChange={(e) => {
              const v = e.currentTarget.checked;
              setIsPaid(v);
              if (!v) setPrice(0);
            }}
          />

          {isPaid ? (
            <Grid gutter="md">
              <Grid.Col span={12}>
                <NumberInput
                  label="Prix ($)"
                  value={price}
                  onChange={(v) => setPrice(Number(v) || 0)}
                  min={0}
                  decimalScale={2}
                  prefix="$ "
                />
              </Grid.Col>
            </Grid>
          ) : null}

          <MarketplaceFeaturesTags
            label="Fonctionnalités"
            value={featureTags}
            onChange={setFeatureTags}
          />

          <Switch
            label="Publié sur le marketplace"
            description="Désactiver pour retirer l’annonce de la vitrine publique."
            checked={isPublished}
            onChange={(e) => setIsPublished(e.currentTarget.checked)}
          />

          <Box>
            <Text size="sm" fw={500} mb={6}>
              Image de couverture (obligatoire)
            </Text>
            {hasCoverVisual ? (
              <Box>
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
                    alt=""
                    fit="cover"
                    w="100%"
                    h="100%"
                    style={{ objectFit: 'cover' }}
                  />
                </Box>
                <Button size="xs" variant="light" mt={8} onClick={clearCover}>
                  Retirer
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
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <Center>
                  <Stack align="center" gap={8}>
                    <Dropzone.Accept>
                      <IconUpload size={28} color="#228be6" />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconPhoto size={28} color="red" />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconPhoto size={28} color="#adb5bd" />
                    </Dropzone.Idle>
                    <Text size="sm">Déposer une image ou cliquer</Text>
                  </Stack>
                </Center>
              </Dropzone>
            )}
          </Box>

          <Group justify="flex-end">
            <Button loading={saving || uploading} onClick={handleSave}>
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

EditMarketplaceListingPage.getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);
