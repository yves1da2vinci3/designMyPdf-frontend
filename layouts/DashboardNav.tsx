import { authApi } from '@/api/authApi';
import Logo from '@/components/AppLogo/AppLogo';
import { Avatar, Box, Button, Code, Group, Text } from '@mantine/core';
import {
  IconInfoCircle,
  IconKey,
  IconLogout,
  IconNotebook,
  IconPlus,
  IconReceipt,
  IconUserCircle,
  IconWaveSawTool,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import classes from './DashboardNav.module.scss';

const data = [
  { link: '/dashboard/', label: 'Overview', icon: IconWaveSawTool },
  { link: '/dashboard/templates', label: 'Templates', icon: IconReceipt },
  { link: '/dashboard/backtrace', label: 'Logs', icon: IconNotebook },
  { link: '/dashboard/keys', label: 'Api Keys', icon: IconKey },
  { link: '/dashboard/account', label: 'Account', icon: IconUserCircle },
  { link: '/documentation', label: 'Documentation API', icon: IconInfoCircle },
];

function DashboardNav() {
  const [active, setActive] = useState('Overview');
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const router = useRouter();
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

  const navigate = (label: string, link: string) => {
    router.push(link);
    setActive(label);
  };

  const links = data.map((item) => (
    <Box
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        navigate(item.label, item.link);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Box>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Logo isWhite width={80} />
          <Code fw={700} className={classes.version}>
            v0.5.2
          </Code>
        </Group>

        <Button
          leftSection={<IconPlus size={16} />}
          fullWidth
          mb="md"
          onClick={() => router.push('/dashboard/templates')}
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          New Template
        </Button>

        {links}
      </div>

      <div className={classes.footer}>
        <Group mb="sm" px="xs">
          <Avatar size={36} radius="xl" color="blue" variant="filled">
            {initials}
          </Avatar>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={600} c="white" lh={1.2} truncate>{userName}</Text>
            <Text size="xs" c="blue.2" truncate>{userEmail}</Text>
          </Box>
        </Group>
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
      </div>
    </nav>
  );
}

export default DashboardNav;
