import { useState } from 'react';
import { Group, Code, Box } from '@mantine/core';
import {
  IconKey,
  IconLogout,
  IconWaveSawTool,
  IconReceipt,
  IconNotebook,
  IconUserCircle,
  IconBoxSeam,
} from '@tabler/icons-react';
import classes from './DashboardNav.module.scss';
import { useRouter } from 'next/router';
import { authApi } from '@/api/authApi';
import Logo from '@/components/AppLogo/AppLogo';

const data = [
  { link: '/dashboard/', label: 'Overview', icon: IconWaveSawTool },
  { link: '/dashboard/templates', label: 'Templates', icon: IconReceipt },
  { link: '/dashboard/backtrace', label: 'Logs', icon: IconNotebook },
  { link: '/dashboard/keys', label: 'Api Keys', icon: IconKey },
  { link: '/dashboard/account', label: 'Account', icon: IconUserCircle },
];

function DashboardNav() {
  const [active, setActive] = useState('Overview');
  const router = useRouter();

  const Logout = async () => {
    await authApi.logout();
    router.push('/login');
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
        <Box
          className={classes.link}
          onClick={(event) => {
            event.preventDefault();
            Logout();
          }}
        >
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </Box>
      </div>
    </nav>
  );
}

export default DashboardNav;
