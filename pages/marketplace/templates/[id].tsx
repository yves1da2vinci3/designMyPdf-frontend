import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Group,
  Stack,
  Text,
  Rating,
  Grid,
  Container,
  List,
  ThemeIcon,
  Avatar,
  Divider,
  Loader,
  Center,
  Image,
  Badge,
} from '@mantine/core';
import { IconCheck, IconChevronLeft, IconShoppingCart, IconDownload } from '@tabler/icons-react';
import { templateApi, TemplateDTO } from '@/api/templateApi';
import Preview from '@/components/Preview';
import CopyTemplateModal from '@/components/marketplace/CopyTemplateModal';
import PurchaseModal from '@/components/marketplace/PurchaseModal';

export default function MarketplaceTemplateDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<TemplateDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyOpen, setCopyOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    templateApi
      .getMarketplaceTemplate(String(id))
      .then(setTemplate)
      .catch(() => setTemplate(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!template) {
    return (
      <Center style={{ height: '100vh' }}>
        <Stack align="center" gap="md">
          <Text c="dimmed">Template not found.</Text>
          <Button variant="subtle" onClick={() => router.push('/marketplace')}>
            Back to Marketplace
          </Button>
        </Stack>
      </Center>
    );
  }

  const isFree = (template.price ?? 0) === 0;
  const priceDisplay = isFree ? 'Free' : `$${((template.price ?? 0) / 100).toFixed(2)}`;

  const handleGetOrBuy = () => {
    if (isFree) {
      setCopyOpen(true);
    } else {
      setPurchaseOpen(true);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Box py="md" style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#fff' }}>
        <Container size="xl">
          <Group justify="space-between">
            <Button
              onClick={() => router.back()}
              leftSection={<IconChevronLeft size={16} />}
              variant="subtle"
              color="gray"
            >
              Back to Marketplace
            </Button>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Left Column */}
          <Grid.Col span={8}>
            <Stack gap="xl">
              {/* Image de couverture marketplace si présente ; sinon vignette legacy ; sinon rendu du template auteur. */}
              {template.cover_image_url?.trim() ? (
                <Box style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e9ecef' }}>
                  <Image
                    src={template.cover_image_url.trim()}
                    alt={template.name || ''}
                    radius="md"
                  />
                </Box>
              ) : template.preview?.trim() ? (
                <Box style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e9ecef' }}>
                  <Image src={template.preview.trim()} alt={template.name || ''} radius="md" />
                </Box>
              ) : (
                <Box
                  style={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid #e9ecef',
                    minHeight: 320,
                    backgroundColor: '#fff',
                  }}
                >
                  <Preview
                    format="a4"
                    htmlContent={template.content || ''}
                    data={template.variables || {}}
                    fonts={template.fonts || []}
                    isLandscape={false}
                  />
                </Box>
              )}

              {/* Description */}
              {template.description && (
                <Box>
                  <Text size="lg" fw={600} mb="sm">
                    Description
                  </Text>
                  <Text c="dimmed" style={{ lineHeight: 1.6 }}>
                    {template.description}
                  </Text>
                </Box>
              )}

              {/* Features */}
              {template.features && template.features.length > 0 && (
                <Box>
                  <Text size="lg" fw={600} mb="sm">
                    Features
                  </Text>
                  <List
                    spacing="sm"
                    size="sm"
                    center
                    icon={
                      <ThemeIcon color="teal" size={22} radius="xl">
                        <IconCheck size="0.9rem" />
                      </ThemeIcon>
                    }
                  >
                    {template.features.map((feature: string, index: number) => (
                      <List.Item key={index}>
                        <Text c="dimmed">{feature}</Text>
                      </List.Item>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          </Grid.Col>

          {/* Right Column */}
          <Grid.Col span={4}>
            <Box
              p="xl"
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                border: '1px solid #e9ecef',
                position: 'sticky',
                top: '2rem',
              }}
            >
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Text size="xl" fw={700}>
                    {priceDisplay}
                  </Text>
                  {isFree && (
                    <Badge color="teal" variant="light">
                      Free
                    </Badge>
                  )}
                  {!isFree && (
                    <Badge color="yellow" variant="light">
                      PREMIUM
                    </Badge>
                  )}
                </Group>

                <Divider />

                {template.author && (
                  <Group>
                    <Avatar src={template.author.avatar} radius="xl" size="sm" />
                    <Box>
                      <Text size="xs" c="dimmed">
                        Created by
                      </Text>
                      <Text size="sm" fw={500}>
                        {template.author.name}
                      </Text>
                    </Box>
                  </Group>
                )}

                {template.rating !== undefined && (
                  <Group>
                    <Rating value={template.rating} readOnly color="yellow" size="sm" />
                    <Text size="sm" c="dimmed">
                      ({template.reviewCount ?? 0} reviews)
                    </Text>
                  </Group>
                )}

                {template.category && (
                  <Group>
                    <Text size="xs" c="dimmed">
                      Category:
                    </Text>
                    <Badge size="xs" variant="outline">
                      {template.category}
                    </Badge>
                  </Group>
                )}

                <Button
                  fullWidth
                  size="md"
                  onClick={handleGetOrBuy}
                  leftSection={isFree ? <IconDownload size={18} /> : <IconShoppingCart size={18} />}
                >
                  {isFree ? 'Get Free Template' : `Buy for ${priceDisplay}`}
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  {isFree
                    ? 'Free · Copy to your workspace instantly'
                    : 'Instant delivery · Lifetime access'}
                </Text>
              </Stack>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>

      {copyOpen && template && (
        <CopyTemplateModal opened onClose={() => setCopyOpen(false)} template={template} />
      )}
      {purchaseOpen && template && (
        <PurchaseModal
          opened
          onClose={() => setPurchaseOpen(false)}
          template={template}
          onPurchased={() => {
            setPurchaseOpen(false);
            setCopyOpen(true);
          }}
        />
      )}
    </Box>
  );
}
