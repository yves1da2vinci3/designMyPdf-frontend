import React from 'react';
import { AppShell, Container, Group, Text } from '@mantine/core';
import Link from 'next/link';

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="xl">
          <Group h="100%" px="md" justify="space-between">
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Text size="xl" fw={700}>
                DesignMyPDF
              </Text>
            </Link>
            <Group>
              <Link href="/marketplace" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Text>Marketplace</Text>
              </Link>
              <Link href="/marketplace/add" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Text>Add Template</Text>
              </Link>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default MainLayout;
