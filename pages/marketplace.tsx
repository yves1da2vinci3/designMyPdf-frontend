import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
  Badge,
  Card,
  Pagination,
} from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { templateApi, MarketplaceTemplateCard, marketplaceCoverUrl } from '@/api/templateApi';
import { RequestStatus } from '@/api/request-status.enum';
import { MARKETPLACE_PUBLIC_FILTERS } from '@/constants/marketplace';
import { ensureArray } from '@/utils/ensureArray';
import QueryState from '@/components/QueryState/QueryState';
import CopyTemplateModal from '@/components/marketplace/CopyTemplateModal';
import PurchaseModal from '@/components/marketplace/PurchaseModal';
import MarketplacePublicLayout from '@/layouts/MarketplacePublicLayout';

const PAGE_SIZE = 12;

export default function MarketplacePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<MarketplaceTemplateCard[]>([]);
  const [status, setStatus] = useState(RequestStatus.NotStated);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copyTarget, setCopyTarget] = useState<MarketplaceTemplateCard | null>(null);
  const [purchaseTarget, setPurchaseTarget] = useState<MarketplaceTemplateCard | null>(null);

  const fetchTemplates = async (category: string) => {
    setStatus(RequestStatus.InProgress);
    try {
      const data = await templateApi.getMarketplaceTemplates(category || undefined);
      setTemplates(ensureArray(data));
      setStatus(RequestStatus.Succeeded);
    } catch {
      setStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    void fetchTemplates(activeCategory);
    setPage(1);
  }, [activeCategory]);

  const filtered = useMemo(() => {
    const list = search
      ? templates.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()))
      : templates;
    return list;
  }, [templates, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleBuyNow = (template: MarketplaceTemplateCard) => {
    if ((template.price ?? 0) === 0) {
      setCopyTarget(template);
    } else {
      setPurchaseTarget(template);
    }
  };

  return (
    <MarketplacePublicLayout
      activeNav="marketplace"
      search={{
        value: search,
        placeholder: 'Search templates...',
        onChange: (value) => {
          setSearch(value);
          setPage(1);
        },
      }}
    >
      <Box px={48} pt={40} pb={24}>
        <Title order={2} fw={700} mb={4}>
          PDF Template Marketplace
        </Title>
        <Text c="dimmed" size="sm" mb={24}>
          Discover and deploy high-performance PDF templates designed for enterprise-scale
          generation and high-density data reporting.
        </Text>

        <Group mb="xl">
          <Group gap={8} style={{ flexWrap: 'wrap' }}>
            {MARKETPLACE_PUBLIC_FILTERS.map((cat) => (
              <Box
                key={cat.value || 'all'}
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
        </Group>

        <QueryState
          status={status}
          errorMessage="Unable to load marketplace templates. Please try again."
          onRetry={() => void fetchTemplates(activeCategory)}
          empty={filtered.length === 0}
          emptyMessage="No templates found."
          emptyAction={
            <Button
              variant="light"
              size="sm"
              mt="sm"
              onClick={() => {
                setActiveCategory('');
                setSearch('');
              }}
            >
              Clear filters
            </Button>
          }
          minHeight={300}
        >
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {pageItems.map((template) => {
              const coverSrc = marketplaceCoverUrl(template);
              return (
                <Card
                  key={template.ID}
                  withBorder
                  radius="md"
                  p={0}
                  shadow="xs"
                  style={{ overflow: 'hidden' }}
                >
                  <Box
                    style={{
                      position: 'relative',
                      height: 180,
                      backgroundColor: '#e9ecef',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {coverSrc ? (
                      <Image src={coverSrc} alt={template.name || ''} h={180} fit="cover" />
                    ) : (
                      <Text size="sm" c="dimmed" ta="center" px="md">
                        {template.description || 'Aperçu non disponible'}
                      </Text>
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
                      <Text fw={700} size="sm" lineClamp={1} style={{ flex: 1 }}>
                        {template.name}
                      </Text>
                      <Text fw={700} size="sm" c="blue">
                        {(template.price ?? 0) === 0
                          ? 'Free'
                          : `$${((template.price ?? 0) / 100).toFixed(0)}`}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={2} mb="md">
                      {template.description || 'No description available.'}
                    </Text>
                    <Text size="xs" c="dimmed" mb="sm">
                      By {template.author_user_name || 'Unknown'}
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
              );
            })}
          </SimpleGrid>

          {filtered.length > PAGE_SIZE ? (
            <Group justify="space-between" mt="xl" align="center">
              <Text size="sm" c="dimmed">
                Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} templates
              </Text>
              <Pagination value={page} onChange={setPage} total={totalPages} size="sm" />
            </Group>
          ) : filtered.length > 0 ? (
            <Text size="xs" c="dimmed" ta="center" mt="xl">
              Showing {filtered.length} template{filtered.length === 1 ? '' : 's'}
            </Text>
          ) : null}
        </QueryState>
      </Box>

      {copyTarget && (
        <CopyTemplateModal opened onClose={() => setCopyTarget(null)} template={copyTarget} />
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
    </MarketplacePublicLayout>
  );
}
