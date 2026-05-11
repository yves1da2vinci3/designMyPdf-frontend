import { AppShell } from '@mantine/core';
import React, { ReactNode } from 'react';
import DashboardNav from './DashboardNav';
import { useDisclosure } from '@mantine/hooks';

interface DashboardLayoutProps {
  children: ReactNode;
}

const NAVBAR_EXPANDED = 280;
const NAVBAR_COLLAPSED = 68;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [opened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  return (
    <AppShell
      navbar={{
        width: desktopOpened ? NAVBAR_EXPANDED : NAVBAR_COLLAPSED,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Navbar style={{ overflow: 'hidden', transition: 'width 200ms ease' }}>
        <AppShell.Section style={{ height: '100%' }}>
          <DashboardNav onToggleDesktop={toggleDesktop} desktopOpened={desktopOpened} />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
