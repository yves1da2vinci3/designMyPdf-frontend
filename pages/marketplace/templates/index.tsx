import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Text,
  Group,
  Rating,
  Button,
  Card,
  Avatar,
  Badge,
  Stack,
  Center,
  Loader,
} from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { RequestStatus } from '@/api/request-status.enum';
import { TemplateDTO, templateApi } from '@/api/templateApi';
import Preview from '@/components/Preview';

interface MarketplaceTemplate extends TemplateDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  preview: string;
  rating: number;
  reviewCount: number;
  author: {
    name: string;
    avatar: string;
  };
}

export default function MarketplaceTemplates() {
  const router = useRouter();
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(RequestStatus.InProgress);
      const response = await templateApi.getMarketplaceTemplates();
      setTemplates(
        response.map((template: TemplateDTO) => ({
          ...template,
          id: template.ID.toString(),
          name: template.name || 'Untitled Template',
          description: template.description || '',
          price: template.price || 0,
          preview: template.preview || '',
          rating: template.rating || 0,
          reviewCount: template.reviewCount || 0,
          author: template.author || { name: 'Unknown', avatar: '' },
        })),
      );
      setIsLoading(RequestStatus.Succeeded);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  const handleViewDetails = (templateId: string) => {
    router.push(`/marketplace/templates/${templateId}`);
  };

  if (isLoading === RequestStatus.InProgress) {
    return (
      <Box bg="#1A1B1E" style={{ minHeight: '100vh' }}>
        <Center style={{ height: '100vh' }}>
          <Loader size="xl" color="blue" />
        </Center>
      </Box>
    );
  }

  if (isLoading === RequestStatus.Failed) {
    return (
      <Box bg="#1A1B1E" style={{ minHeight: '100vh' }}>
        <Center style={{ height: '100vh' }}>
          <Text c="red" size="lg">
            Failed to load marketplace templates. Please try again later.
          </Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="#1A1B1E" style={{ minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Text size="xl" fw={700} c="white">
            Template Marketplace
          </Text>

          {templates.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed">No templates available in the marketplace yet.</Text>
            </Center>
          ) : (
            <Grid gutter="xl">
              {templates.map((template) => (
                <Grid.Col key={template.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    padding="lg"
                    radius="md"
                    style={{
                      backgroundColor: '#25262B',
                      border: '1px solid #373A40',
                      height: '100%',
                    }}
                  >
                    <Card.Section>
                      <Box
                        style={{
                          height: '200px',
                          overflow: 'hidden',
                          position: 'relative',
                          backgroundColor: 'white',
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
                    </Card.Section>

                    <Stack gap="md" mt="md">
                      <Group justify="space-between" align="flex-start">
                        <Box style={{ flex: 1 }}>
                          <Text size="lg" fw={600} c="white" lineClamp={1}>
                            {template.name}
                          </Text>
                          <Text size="sm" c="dimmed" lineClamp={2}>
                            {template.description}
                          </Text>
                        </Box>
                        <Badge variant="filled" color="blue" size="lg">
                          ${(template.price / 100).toFixed(2)}
                        </Badge>
                      </Group>

                      <Group>
                        <Avatar src={template.author.avatar} radius="xl" size="sm" />
                        <Text size="sm" c="dimmed">
                          {template.author.name}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Group gap="xs">
                          <Rating value={template.rating} readOnly size="sm" />
                          <Text size="sm" c="dimmed">
                            ({template.reviewCount})
                          </Text>
                        </Group>
                        <Button
                          variant="light"
                          color="blue"
                          onClick={() => handleViewDetails(template.id)}
                          rightSection={<IconShoppingCart size={16} />}
                        >
                          View Details
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
