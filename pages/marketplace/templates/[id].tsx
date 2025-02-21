import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
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
} from '@mantine/core';
import { IconCheck, IconChevronLeft, IconShoppingCart } from '@tabler/icons-react';
import { RequestStatus } from '@/api/request-status.enum';
import { DEFAULT_TEMPLATE } from '@/constants/template';

// Import Preview component dynamically to avoid SSR issues
const Preview = dynamic(() => import('@/components/Preview'), {
  ssr: false,
});

interface MarketplaceTemplate {
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
  features: string[];
  content: string;
  variables: any;
  fonts: string[];
}

export default function MarketplaceTemplateDetail() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);
  const [template, setTemplate] = useState<MarketplaceTemplate | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    // Simulating fetching template with fake data
    setIsLoading(RequestStatus.InProgress);
    setTimeout(() => {
      setTemplate({
        id: params.id as string,
        name: 'Sample Template',
        description: 'This is a sample description for the template.',
        price: 1999, // Price in cents
        preview: 'https://placehold.co/600x400?text=Template+Preview',
        rating: 4.5,
        reviewCount: 120,
        author: {
          name: 'John Doe',
          avatar: 'https://placehold.co/100x100?text=Author+Avatar',
        },
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        content: DEFAULT_TEMPLATE,
        variables: {},
        fonts: [],
      });
      setIsLoading(RequestStatus.Succeeded);
    }, 1000);
  }, [params.id]);

  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      // Simulate purchase action
      setTimeout(() => {
        router.push('/dashboard/templates');
      }, 1000);
    } catch (error) {
      console.error('Error purchasing template:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading === RequestStatus.InProgress || !template) {
    return (
      <Box style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  return (
    <Box bg="#1A1B1E" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box py="xl" style={{ borderBottom: '1px solid #373A40' }}>
        <Container size="xl">
          <Group justify="space-between">
            <Group>
              <Button
                onClick={() => router.back()}
                leftSection={<IconChevronLeft size={16} />}
                variant="subtle"
                color="gray"
                styles={{
                  root: {
                    color: '#909296',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#25262B',
                      transform: 'translateX(-2px)',
                    },
                  },
                }}
              >
                Back to Marketplace
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Left Column */}
          <Grid.Col span={8}>
            <Stack gap="xl">
              {/* Preview */}
              <Box
                style={{
                  backgroundColor: '#25262B',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #373A40',
                  height: '600px',
                }}
              >
                <Preview
                  format="a4"
                  htmlContent={template.content}
                  data={template.variables}
                  fonts={template.fonts}
                  isLandscape={false}
                />
              </Box>

              {/* Description */}
              <Box>
                <Text size="xl" fw={600} c="white" mb="md">
                  Description
                </Text>
                <Text c="dimmed" style={{ lineHeight: 1.6 }}>
                  {template.description}
                </Text>
              </Box>

              {/* Features */}
              <Box>
                <Text size="xl" fw={600} c="white" mb="md">
                  Features
                </Text>
                <List
                  spacing="sm"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="teal" size={24} radius="xl">
                      <IconCheck size="1rem" />
                    </ThemeIcon>
                  }
                >
                  {template.features.map((feature, index) => (
                    <List.Item key={index}>
                      <Text c="dimmed">{feature}</Text>
                    </List.Item>
                  ))}
                </List>
              </Box>
            </Stack>
          </Grid.Col>

          {/* Right Column */}
          <Grid.Col span={4}>
            <Box
              p="xl"
              style={{
                backgroundColor: '#25262B',
                borderRadius: '8px',
                border: '1px solid #373A40',
                position: 'sticky',
                top: '2rem',
              }}
            >
              <Stack gap="xl">
                <Box>
                  <Text size="xl" fw={700} c="white">
                    ${(template.price / 100).toFixed(2)}
                  </Text>
                </Box>

                <Divider color="#373A40" />

                <Group>
                  <Avatar src={template.author.avatar} radius="xl" />
                  <Box>
                    <Text size="sm" c="dimmed">
                      Created by
                    </Text>
                    <Text size="sm" fw={500} c="white">
                      {template.author.name}
                    </Text>
                  </Box>
                </Group>

                <Group>
                  <Rating value={template.rating} readOnly color="yellow" />
                  <Text size="sm" c="dimmed">
                    ({template.reviewCount} reviews)
                  </Text>
                </Group>

                <Button
                  fullWidth
                  size="lg"
                  onClick={handlePurchase}
                  loading={isPurchasing}
                  leftSection={<IconShoppingCart size={20} />}
                  variant="gradient"
                  gradient={{ from: '#3B82F6', to: '#60A5FA' }}
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                    },
                  }}
                >
                  Purchase Template
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  Instant delivery • Lifetime access • Source code included
                </Text>
              </Stack>
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
} 