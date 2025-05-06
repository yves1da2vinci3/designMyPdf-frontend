import { authApi } from '@/api/authApi';
import Logo from '@/components/AppLogo/AppLogo';
import { Box, Button, Code, Group } from '@mantine/core';
import {
  IconInfoCircle,
  IconKey,
  IconLogout,
  IconNotebook,
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
        {links}
      </div>

      <div className={classes.footer}>
        <Button
          leftSection={<IconLogout />}
          className={classes.link}
          disabled={isLogoutLoading}
          loading={isLogoutLoading}
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
