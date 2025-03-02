import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
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
} from '@mantine/core';
import { IconCheck, IconChevronLeft, IconShoppingCart } from '@tabler/icons-react';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { templateService } from '@/services/templateService';
import Preview from '@/components/Preview';
// // Import Preview component dynamically to avoid SSR issues
// const PreviewComponent = dynamic(() => import('@/components/Preview'), {
//   ssr: false,
// });

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

interface Props {
  template: MarketplaceTemplate;
}

export default function MarketplaceTemplateDetail({ template }: Props) {
  const router = useRouter();

  // Handle fallback state
  if (router.isFallback) {
    return (
      <Box
        style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Loader size="lg" />
      </Box>
    );
  }

  const handlePurchase = async () => {
    try {
      // Implement purchase logic
      router.push('/dashboard/templates');
    } catch (error) {
      // Handle error appropriately
    }
  };

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

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Get list of template IDs from your API
    const templates = await templateService.getTemplates({});
    const paths = templates.templates.map((template) => ({
      params: { id: template.id.toString() },
    }));

    return {
      paths,
      fallback: true, // Enable fallback for templates not generated at build time
    };
  } catch (error) {
    // If there's an error fetching templates, return empty paths
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params?.id) {
      return {
        notFound: true,
      };
    }

    // Fetch template data from your API
    const template = await templateService.getTemplate(params.id as string);

    if (!template) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        template: {
          id: template.id,
          name: template?.title || 'Sample Template',
          description: template?.description || 'This is a sample description for the template.',
          price: template?.price || 1999,
          preview: template?.thumbnail || 'https://placehold.co/600x400?text=Template+Preview',
          rating: template?.rating || 4.5,
          reviewCount: template?.reviews || 120,
          author: {
            name: template.author?.name || 'John Doe',
            avatar: template.author?.avatar || 'https://placehold.co/100x100?text=Author+Avatar',
          },
          features: template.features || ['Feature 1', 'Feature 2', 'Feature 3'],
          content: template.content || DEFAULT_TEMPLATE,
          variables: template.variables || {},
          fonts: template.fonts || [],
        },
      },
      revalidate: 60, // Revalidate every minute
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
