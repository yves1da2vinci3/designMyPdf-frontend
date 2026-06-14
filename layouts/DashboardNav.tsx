import Link from 'next/link';
import { authApi } from '@/api/authApi';
import { ActionIcon, Avatar, Box, Button, Group, Text, Tooltip, Anchor } from '@mantine/core';
import {
  IconInfoCircle,
  IconKey,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconNotebook,
  IconPlus,
  IconReceipt,
  IconShoppingBag,
  IconUserCircle,
  IconWaveSawTool,
  IconWebhook,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import classes from './DashboardNav.module.scss';

const data = [
  { link: '/dashboard/', label: 'Overview', icon: IconWaveSawTool },
  { link: '/dashboard/templates', label: 'Templates', icon: IconReceipt },
  { link: '/dashboard/marketplace', label: 'Marketplace', icon: IconShoppingBag },
  { link: '/dashboard/backtrace', label: 'Logs', icon: IconNotebook },
  { link: '/dashboard/keys', label: 'Api Keys', icon: IconKey },
  { link: '/dashboard/webhooks', label: 'Webhooks', icon: IconWebhook },
  { link: '/dashboard/account', label: 'Account', icon: IconUserCircle },
  { link: '/documentation', label: 'Documentation API', icon: IconInfoCircle },
];

interface DashboardNavProps {
  onToggleDesktop: () => void;
  desktopOpened: boolean;
  /** Fermer le drawer / navbar mobile après navigation */
  onMobileNavigate?: () => void;
}

function labelForPathname(pathname: string): string {
  if (pathname.startsWith('/dashboard/templates')) return 'Templates';
  if (pathname.startsWith('/dashboard/marketplace')) return 'Marketplace';
  if (pathname.startsWith('/dashboard/backtrace')) return 'Logs';
  if (pathname.startsWith('/dashboard/keys')) return 'Api Keys';
  if (pathname.startsWith('/dashboard/webhooks')) return 'Webhooks';
  if (pathname.startsWith('/dashboard/account')) return 'Account';
  if (pathname.startsWith('/documentation')) return 'Documentation API';
  if (pathname.startsWith('/dashboard')) return 'Overview';
  return 'Overview';
}

function DashboardNav({ onToggleDesktop, desktopOpened, onMobileNavigate }: DashboardNavProps) {
  const [active, setActive] = useState('Overview');
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setActive(labelForPathname(router.pathname));
  }, [router.pathname]);
  const session = authApi.getUserSession();
  const userName = session?.userName ?? 'Guest';
  const userEmail = session?.email ?? '';
  const initials = userName.includes(' ')
    ? (userName.split(' ')[0][0] + userName.split(' ')[1][0]).toUpperCase()
    : userName.slice(0, 2).toUpperCase();

  const Logout = async () => {
    try {
      setIsLogoutLoading(true);
      await authApi.logout();
      router.push('/login');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const goNewTemplate = () => {
    router.push('/dashboard/templates?create=1');
    onMobileNavigate?.();
  };

  const links = data.map((item) => {
    const isActive = item.label === active;
    const linkEl = (
      <Anchor
        component={Link}
        href={item.link}
        className={classes.link}
        data-active={isActive || undefined}
        aria-current={isActive ? 'page' : undefined}
        key={item.label}
        onClick={() => {
          setActive(item.label);
          onMobileNavigate?.();
        }}
        style={!desktopOpened ? { justifyContent: 'center', padding: '10px 0' } : undefined}
        underline="never"
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        {desktopOpened && <span>{item.label}</span>}
      </Anchor>
    );

    return desktopOpened ? (
      linkEl
    ) : (
      <Tooltip key={item.label} label={item.label} position="right" withArrow>
        {linkEl}
      </Tooltip>
    );
  });

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        {desktopOpened ? (
          <Button
            leftSection={<IconPlus size={16} />}
            fullWidth
            mb="md"
            onClick={goNewTemplate}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            New Template
          </Button>
        ) : (
          <Tooltip label="New Template" position="right" withArrow>
            <ActionIcon
              size="lg"
              mb="md"
              onClick={goNewTemplate}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                width: '100%',
                borderRadius: 6,
              }}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {links}
      </div>

      <div className={classes.footer}>
        <Group mb="xs" px="xs" justify={desktopOpened ? 'flex-end' : 'center'}>
          <Tooltip
            label={desktopOpened ? 'Collapse sidebar' : 'Expand sidebar'}
            position="right"
            withArrow
          >
            <ActionIcon
              variant="filled"
              color="blue"
              size="md"
              radius="md"
              onClick={onToggleDesktop}
              visibleFrom="sm"
            >
              {desktopOpened ? (
                <IconLayoutSidebarLeftCollapse size={16} />
              ) : (
                <IconLayoutSidebarLeftExpand size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>

        {desktopOpened ? (
          <Group mb="sm" px="xs">
            <Avatar size={36} radius="xl" color="blue" variant="filled">
              {initials}
            </Avatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} c="white" lh={1.2} truncate>
                {userName}
              </Text>
              <Text size="xs" c="blue.2" truncate>
                {userEmail}
              </Text>
            </Box>
          </Group>
        ) : (
          <Tooltip label={userName} position="right" withArrow>
            <Group mb="sm" justify="center">
              <Avatar size={36} radius="xl" color="blue" variant="filled">
                {initials}
              </Avatar>
            </Group>
          </Tooltip>
        )}

        {desktopOpened ? (
          <Button
            leftSection={<IconLogout size={16} />}
            className={classes.link}
            disabled={isLogoutLoading}
            loading={isLogoutLoading}
            variant="subtle"
            color="white"
            fullWidth
            onClick={(event) => {
              event.preventDefault();
              Logout();
            }}
          >
            Logout
          </Button>
        ) : (
          <Tooltip label="Logout" position="right" withArrow>
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              style={{ width: '100%' }}
              disabled={isLogoutLoading}
              loading={isLogoutLoading}
              onClick={(event) => {
                event.preventDefault();
                Logout();
              }}
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
    </nav>
  );
}

export default DashboardNav;
