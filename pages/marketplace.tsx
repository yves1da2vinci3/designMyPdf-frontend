import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
  Select,
  Badge,
  Stack,
  Card,
  ActionIcon,
  TextInput,
  Avatar,
  Center,
  Loader,
  Anchor,
} from '@mantine/core';
import {
  IconSearch,
  IconBell,
  IconSettings,
  IconDiamondFilled,
  IconShoppingCart,
} from '@tabler/icons-react';
import { templateApi, TemplateDTO } from '@/api/templateApi';
import { authApi } from '@/api/authApi';
import CopyTemplateModal from '@/components/marketplace/CopyTemplateModal';
import PurchaseModal from '@/components/marketplace/PurchaseModal';

const CATEGORIES = [
  { value: '', label: 'All Templates' },
  { value: 'FINANCIAL REPORT', label: 'Financial Reports' },
  { value: 'INVOICE', label: 'Invoices' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'LEGAL', label: 'Legal Docs' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [copyTarget, setCopyTarget] = useState<TemplateDTO | null>(null);
  const [purchaseTarget, setPurchaseTarget] = useState<TemplateDTO | null>(null);

  const session = authApi.getUserSession();
  const userName = session?.userName ?? 'G';
  const initials = userName.slice(0, 2).toUpperCase();

  const fetchTemplates = async (category: string) => {
    setLoading(true);
    try {
      const data = await templateApi.getMarketplaceTemplates(category || undefined);
      setTemplates(data);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(activeCategory);
  }, [activeCategory]);

  const filtered = search
    ? templates.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()))
    : templates;

  const handleBuyNow = (template: TemplateDTO) => {
    if ((template.price ?? 0) === 0) {
      setCopyTarget(template);
    } else {
      setPurchaseTarget(template);
    }
  };

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
            <Anchor
              size="sm"
              fw={600}
              c="blue"
              style={{ borderBottom: '2px solid #228be6', paddingBottom: 2 }}
              onClick={() => router.push('/marketplace')}
            >
              Marketplace
            </Anchor>
            <Anchor size="sm" c="dimmed" ml="lg" onClick={() => router.push('/marketplace/add')}>
              Add Listing
            </Anchor>
          </Group>
        </Group>
        <Group gap="sm">
          <TextInput
            placeholder="Search templates..."
            leftSection={<IconSearch size={14} />}
            size="xs"
            style={{ width: 220 }}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <ActionIcon variant="subtle" color="gray"><IconBell size={18} /></ActionIcon>
          <ActionIcon variant="subtle" color="gray"><IconSettings size={18} /></ActionIcon>
          <Avatar
            size={32}
            radius="xl"
            color="blue"
            variant="filled"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/dashboard/account')}
          >
            {initials}
          </Avatar>
        </Group>
      </Box>

      {/* Hero */}
      <Box px={48} pt={40} pb={24}>
        <Title order={2} fw={700} mb={4}>
          PDF Template Marketplace
        </Title>
        <Text c="dimmed" size="sm" mb={24}>
          Discover and deploy high-performance PDF templates designed for enterprise-scale
          generation and high-density data reporting.
        </Text>

        {/* Category filter + sort */}
        <Group justify="space-between" mb="xl">
          <Group gap={8}>
            {CATEGORIES.map((cat) => (
              <Box
                key={cat.value}
                px="md"
                py={6}
                onClick={() => setActiveCategory(cat.value)}
                style={{
                  borderRadius: 6,
                  cursor: 'pointer',
                  backgroundColor: activeCategory === cat.value ? '#228be6' : '#fff',
                  color: activeCategory === cat.value ? '#fff' : '#495057',
                  border: activeCategory === cat.value ? '1px solid #228be6' : '1px solid #dee2e6',
                  fontWeight: activeCategory === cat.value ? 600 : 400,
                  fontSize: 13,
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </Box>
            ))}
          </Group>
          <Group gap={6}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em' }}>SORT BY:</Text>
            <Select
              size="xs"
              defaultValue="popular"
              data={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
              ]}
              style={{ width: 150 }}
            />
          </Group>
        </Group>

        {/* Template grid */}
        {loading ? (
          <Center h={300}><Loader size="lg" /></Center>
        ) : filtered.length === 0 ? (
          <Center h={300}>
            <Stack align="center" gap="sm">
              <Text c="dimmed">No templates found.</Text>
              <Button variant="light" size="sm" onClick={() => { setActiveCategory(''); setSearch(''); }}>
                Clear filters
              </Button>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={4} spacing="md">
            {filtered.map((template) => (
              <Card key={template.ID} withBorder radius="md" p={0} shadow="xs" style={{ overflow: 'hidden' }}>
                {/* Cover image */}
                <Box style={{ position: 'relative', height: 180, backgroundColor: '#e9ecef', overflow: 'hidden' }}>
                  {template.preview ? (
                    <Image src={template.preview} alt={template.name} h={180} fit="cover" />
                  ) : (
                    <Center h={180} style={{ backgroundColor: '#dee2e6' }}>
                      <Text size="xs" c="dimmed">No preview</Text>
                    </Center>
                  )}
                  {(template.price ?? 0) > 0 && (
                    <Badge
                      style={{ position: 'absolute', top: 8, left: 8 }}
                      color="yellow"
                      variant="filled"
                      size="xs"
                      fw={700}
                    >
                      PREMIUM
                    </Badge>
                  )}
                </Box>

                <Box p="md">
                  <Group justify="space-between" align="flex-start" mb={4}>
                    <Text fw={700} size="sm" lineClamp={1} style={{ flex: 1 }}>{template.name}</Text>
                    <Text fw={700} size="sm" c="blue">
                      {(template.price ?? 0) === 0 ? 'Free' : `$${((template.price ?? 0) / 100).toFixed(0)}`}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={2} mb="md">
                    {template.description || 'No description available.'}
                  </Text>
                  <Group gap={6}>
                    <Button
                      variant="outline"
                      size="xs"
                      flex={1}
                      onClick={() => router.push(`/marketplace/templates/${template.ID}`)}
                    >
                      Detail
                    </Button>
                    <Button
                      size="xs"
                      flex={1}
                      leftSection={<IconShoppingCart size={12} />}
                      onClick={() => handleBuyNow(template)}
                    >
                      {(template.price ?? 0) === 0 ? 'Get Free' : 'Buy Now'}
                    </Button>
                  </Group>
                </Box>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Load more */}
        {!loading && filtered.length > 0 && (
          <Center mt={40}>
            <Stack align="center" gap={8}>
              <Button variant="outline" size="sm" style={{ minWidth: 200 }}>
                Load More Templates
              </Button>
              <Text size="xs" c="dimmed">
                Showing {filtered.length} templates
              </Text>
            </Stack>
          </Center>
        )}
      </Box>

      {/* Footer */}
      <Box
        px={48}
        py={24}
        mt={40}
        style={{ borderTop: '1px solid #e9ecef', backgroundColor: '#fff' }}
      >
        <Group justify="space-between">
          <Group gap={4}>
            <IconDiamondFilled size={14} color="#228be6" />
            <Text size="xs" fw={700} c="blue">Design My PDF</Text>
            <Text size="xs" c="dimmed">© 2024 Enterprise PDF Systems. All rights reserved.</Text>
          </Group>
          <Group gap="lg">
            {['Privacy', 'Terms', 'Security', 'Documentation'].map((link) => (
              <Anchor key={link} size="xs" c="dimmed">{link}</Anchor>
            ))}
          </Group>
        </Group>
      </Box>

      {/* Modals */}
      {copyTarget && (
        <CopyTemplateModal
          opened
          onClose={() => setCopyTarget(null)}
          template={copyTarget}
        />
      )}
      {purchaseTarget && (
        <PurchaseModal
          opened
          onClose={() => setPurchaseTarget(null)}
          template={purchaseTarget}
          onPurchased={() => {
            setPurchaseTarget(null);
            setCopyTarget(purchaseTarget);
          }}
        />
      )}
    </Box>
  );
}
