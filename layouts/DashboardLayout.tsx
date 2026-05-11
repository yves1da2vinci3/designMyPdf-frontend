import { AppShell, Burger, Code, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { ReactNode } from 'react';
import Logo from '@/components/AppLogo/AppLogo';
import DashboardNav from './DashboardNav';
import classes from './DashboardNav.module.scss';

interface DashboardLayoutProps {
  children: ReactNode;
}

const NAVBAR_EXPANDED = 280;
const NAVBAR_COLLAPSED = 68;
const HEADER_HEIGHT = 64;

const HEADER_LOGO_WIDTH = 52;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [opened, { toggle: toggleMobile, close: closeMobileNav }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: desktopOpened ? NAVBAR_EXPANDED : NAVBAR_COLLAPSED,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        root: { display: 'flex', flexDirection: 'column', minHeight: '100dvh' },
        main: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
        },
      }}
    >
      <AppShell.Header
        bg="var(--mantine-color-blue-filled)"
        style={{ borderBottom: '1px solid var(--mantine-color-blue-7)' }}
      >
        <Group h="100%" px="md" justify="space-between" wrap="nowrap" gap="md">
          <Group gap="sm" wrap="nowrap" align="center" style={{ flex: 1, minWidth: 0 }}>
            <Burger
              opened={opened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
              color="white"
              aria-label="Ouvrir la navigation"
            />
            <Logo isWhite width={HEADER_LOGO_WIDTH} />
            <Code
              fw={700}
              className={classes.version}
              style={!desktopOpened ? { fontSize: 10, flexShrink: 0 } : { flexShrink: 0 }}
            >
              {desktopOpened ? 'v0.5.2' : 'v0.5'}
            </Code>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar style={{ overflow: 'hidden', transition: 'width 200ms ease' }}>
        <AppShell.Section style={{ height: '100%' }}>
          <DashboardNav
            onToggleDesktop={toggleDesktop}
            desktopOpened={desktopOpened}
            onMobileNavigate={closeMobileNav}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main style={{ minWidth: 0, overflowX: 'hidden' }}>{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
