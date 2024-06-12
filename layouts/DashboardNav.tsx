import { useState } from 'react';
import { Group, Code, Title, Box } from '@mantine/core';
import {
  IconKey,
  IconSwitchHorizontal,
  IconLogout,
  IconWaveSawTool,
  IconReceipt,
  IconNotebook,
  IconSettingsAutomation,
  IconUserCircle,
  IconBoxSeam,
} from '@tabler/icons-react';
import classes from './DashboardNav.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

const data = [
  { link: '/dashboard/', label: 'Overview', icon: IconWaveSawTool },
  { link: '/dashboard/templates', label: 'Templates', icon: IconReceipt },
  { link: '/dashboard/backtrace', label: 'Logs', icon: IconNotebook },
  { link: '/dashboard/keys', label: 'Api Keys', icon: IconKey },
  { link: '/dashboard/account', label: 'Account', icon: IconUserCircle },
];

export function DashboardNav() {
  const [active, setActive] = useState('Overview');
  const router = useRouter();

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
          <IconBoxSeam style={{color : 'white'}} size={40} />
          <Code fw={700} className={classes.version}>
            v0.5.2
          </Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <Link href={'/login'} className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </Link>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}
