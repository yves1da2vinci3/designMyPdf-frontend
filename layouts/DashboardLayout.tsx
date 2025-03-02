import { AppShell, Group, ScrollArea, Stack } from '@mantine/core';
import React, { ReactNode } from 'react';
import DashboardNav from './DashboardNav';
import { useDisclosure } from '@mantine/hooks';

interface DashboardLayoutProps {
  children: ReactNode;
}

const HEADER_HEIGHT = 60;
const NAVBAR_WIDTH = 300;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      navbar={{
        width: NAVBAR_WIDTH,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Navbar
        style={{
          overflow: 'hidden',
        }}
      >
        <AppShell.Section>
          <DashboardNav />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
