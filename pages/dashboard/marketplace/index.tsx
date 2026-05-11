import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconShoppingBag,
  IconUsers,
  IconCurrencyDollar,
  IconExternalLink,
  IconEyeOff,
  IconArrowUpRight,
  IconPlus,
  IconPencil,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import DashboardLayout from '@/layouts/DashboardLayout';
import { templateApi, MarketplaceListingDTO } from '@/api/templateApi';
import { RequestStatus } from '@/api/request-status.enum';

export default function PublisherDashboard() {
  const router = useRouter();
  const [listings, setListings] = useState<MarketplaceListingDTO[]>([]);
  const [status, setStatus] = useState(RequestStatus.NotStated);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setStatus(RequestStatus.InProgress);
    try {
      const data = await templateApi.getMyListings();
      setListings(data);
      setStatus(RequestStatus.Succeeded);
    } catch {
      setStatus(RequestStatus.Failed);
    }
  };

  const handleUnpublish = (listing: MarketplaceListingDTO) => {
    modals.openConfirmModal({
      title: 'Retirer du marketplace public ?',
      children: (
        <Text size="sm">
          L’annonce restera dans « Mes annonces » mais ne sera plus visible sur le catalogue public.
        </Text>
      ),
      labels: { confirm: 'Retirer', cancel: 'Annuler' },
      confirmProps: { color: 'orange' },
      onConfirm: async () => {
        try {
          await templateApi.unpublishMarketplaceListing(listing.id);
          notifications.show({
            title: 'Mis à jour',
            message: 'L’annonce n’est plus publiée.',
            color: 'teal',
          });
          await fetchListings();
        } catch (err: unknown) {
          const msg =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
              : undefined;
          notifications.show({
            title: 'Erreur',
            message: msg || 'Impossible de retirer la publication.',
            color: 'red',
          });
        }
      },
    });
  };

  const isLoading = status === RequestStatus.InProgress || status === RequestStatus.NotStated;

  const totalListings = listings.length;
  const totalUses = listings.reduce((sum, l) => sum + (l.uses_count ?? 0), 0);
  const totalRevenue = listings.reduce((sum, l) => sum + (l.revenue ?? 0), 0);

  const rows = listings.map((listing) => (
    <Table.Tr key={String(listing.id)}>
      <Table.Td>
        <Box
          w={48}
          h={36}
          style={{ borderRadius: 4, overflow: 'hidden', backgroundColor: '#e9ecef' }}
        >
          {listing.cover_image_url ? (
            <Image src={listing.cover_image_url} h={36} w={48} fit="cover" alt="" />
          ) : (
            <Center h={36}>
              <Text size="xs" c="dimmed">
                IMG
              </Text>
            </Center>
          )}
        </Box>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500} lineClamp={1}>
          {listing.name}
        </Text>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {listing.description || '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge size="xs" variant="outline" color="gray">
          {listing.category || '—'}
        </Badge>
      </Table.Td>
      <Table.Td>
        {(listing.price ?? 0) === 0 ? (
          <Badge color="teal" variant="light" size="sm">
            Free
          </Badge>
        ) : (
          <Text size="sm" fw={600} c="blue">
            ${((listing.price ?? 0) / 100).toFixed(2)}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{listing.uses_count ?? 0}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500} c={(listing.revenue ?? 0) > 0 ? 'teal' : 'dimmed'}>
          {(listing.revenue ?? 0) > 0 ? `$${((listing.revenue ?? 0) / 100).toFixed(2)}` : '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        {listing.is_published ? (
          <Badge color="teal" variant="light" size="sm">
            Published
          </Badge>
        ) : (
          <Badge color="gray" variant="light" size="sm">
            Draft
          </Badge>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          <Tooltip label="Modifier l’annonce">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => router.push(`/dashboard/marketplace/edit/${listing.id}`)}
            >
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Voir sur le marketplace">
            <ActionIcon
              size="sm"
              variant="subtle"
              onClick={() => router.push(`/marketplace/templates/${listing.id}`)}
            >
              <IconExternalLink size={14} />
            </ActionIcon>
          </Tooltip>
          {listing.is_published ? (
            <Tooltip label="Retirer de la vitrine publique">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="orange"
                onClick={() => handleUnpublish(listing)}
              >
                <IconEyeOff size={14} />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} fw={700}>
            My Marketplace Listings
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Track your published templates, usage and revenue.
          </Text>
        </Box>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push('/marketplace/add')}
        >
          Add New Listing
        </Button>
      </Group>

      {/* Stat cards */}
      <SimpleGrid cols={3}>
        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="blue" radius="md">
              <IconShoppingBag size={16} />
            </ThemeIcon>
            <Badge color="blue" variant="light" size="xs">
              <IconArrowUpRight size={10} /> Total
            </Badge>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Total Listings
          </Text>
          <Text fw={700} fz={26}>
            {isLoading ? '—' : totalListings}
          </Text>
        </Card>

        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="cyan" radius="md">
              <IconUsers size={16} />
            </ThemeIcon>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Total Uses
          </Text>
          <Text fw={700} fz={26}>
            {isLoading ? '—' : totalUses.toLocaleString()}
          </Text>
        </Card>

        <Card withBorder radius="md" p="lg" shadow="xs">
          <Group justify="space-between" mb="xs">
            <ThemeIcon size="md" variant="light" color="teal" radius="md">
              <IconCurrencyDollar size={16} />
            </ThemeIcon>
          </Group>
          <Text
            size="xs"
            tt="uppercase"
            fw={600}
            c="dimmed"
            style={{ letterSpacing: '0.05em' }}
            mb={4}
          >
            Total Revenue
          </Text>
          <Text fw={700} fz={26}>
            {isLoading ? '—' : `$${(totalRevenue / 100).toFixed(2)}`}
          </Text>
        </Card>
      </SimpleGrid>

      {/* Listings table */}
      {isLoading ? (
        <Center h={200}>
          <Loader type="bars" size="lg" />
        </Center>
      ) : listings.length === 0 ? (
        <Card withBorder radius="md" p="xl" shadow="xs">
          <Center>
            <Stack align="center" gap="md">
              <ThemeIcon size="xl" radius="xl" variant="light" color="blue">
                <IconShoppingBag size={24} />
              </ThemeIcon>
              <Text fw={600}>No marketplace listings yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Publish your first template to the marketplace and start earning.
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push('/marketplace/add')}
              >
                Publish your first template
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Card withBorder radius="md" shadow="xs" p={0}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 60 }}>Cover</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Uses</Table.Th>
                <Table.Th>Revenue</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}

PublisherDashboard.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
