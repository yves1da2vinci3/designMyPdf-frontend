import React from 'react';
import { useRouter } from 'next/router';
import { Anchor, Avatar, Box, Group, Text, TextInput } from '@mantine/core';
import { IconDiamondFilled, IconSearch } from '@tabler/icons-react';
import { authApi } from '@/api/authApi';

interface MarketplacePublicLayoutProps {
  children: React.ReactNode;
  /** Optional search field shown in header (catalogue page). */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  activeNav?: 'marketplace' | 'add';
}

export default function MarketplacePublicLayout({
  children,
  search,
  activeNav = 'marketplace',
}: MarketplacePublicLayoutProps) {
  const router = useRouter();
  const session = authApi.getUserSession();
  const userName = session?.userName ?? 'G';
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Box
        component="header"
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
          <Group
            gap={6}
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/dashboard/')}
            role="link"
            aria-label="Retour au tableau de bord"
          >
            <IconDiamondFilled size={18} color="#228be6" />
            <Text fw={700} size="sm">
              Design My PDF
            </Text>
          </Group>
          <Group gap={0}>
            <Anchor
              size="sm"
              fw={600}
              c={activeNav === 'marketplace' ? 'blue' : 'dimmed'}
              style={
                activeNav === 'marketplace'
                  ? { borderBottom: '2px solid #228be6', paddingBottom: 2 }
                  : undefined
              }
              onClick={() => router.push('/marketplace')}
            >
              Marketplace
            </Anchor>
            <Anchor
              size="sm"
              c={activeNav === 'add' ? 'blue' : 'dimmed'}
              ml="lg"
              fw={activeNav === 'add' ? 600 : 400}
              onClick={() => router.push('/marketplace/add')}
            >
              Add Listing
            </Anchor>
          </Group>
        </Group>
        <Group gap="sm">
          {search ? (
            <TextInput
              placeholder={search.placeholder ?? 'Search templates...'}
              leftSection={<IconSearch size={14} />}
              size="xs"
              style={{ width: 220 }}
              value={search.value}
              onChange={(e) => search.onChange(e.currentTarget.value)}
              aria-label="Rechercher des templates"
            />
          ) : null}
          <Avatar
            size={32}
            radius="xl"
            color="blue"
            variant="filled"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/dashboard/account')}
            aria-label="Compte utilisateur"
          >
            {initials}
          </Avatar>
        </Group>
      </Box>

      <Box component="main">{children}</Box>

      <Box
        component="footer"
        px={48}
        py={24}
        mt={40}
        style={{ borderTop: '1px solid #e9ecef', backgroundColor: '#fff' }}
      >
        <Group justify="space-between">
          <Group gap={4}>
            <IconDiamondFilled size={14} color="#228be6" />
            <Text size="xs" fw={700} c="blue">
              Design My PDF
            </Text>
            <Text size="xs" c="dimmed">
              © 2024 Enterprise PDF Systems. All rights reserved.
            </Text>
          </Group>
          <Group gap="lg">
            <Anchor size="xs" c="dimmed" href="/documentation">
              Documentation
            </Anchor>
            <Anchor size="xs" c="dimmed" href="/documentation">
              Terms
            </Anchor>
            <Anchor size="xs" c="dimmed" href="/documentation">
              Privacy
            </Anchor>
          </Group>
        </Group>
      </Box>
    </Box>
  );
}
