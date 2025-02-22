import { useRouter } from 'next/router';
import {
  Group,
  Burger,
  Button,
  Text,
  UnstyledButton,
  ThemeIcon,
  rem,
  useMantineTheme,
  Box,
  HoverCard,
  Center,
  Anchor,
  Collapse,
  Divider,
  Drawer,
  ScrollArea,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBook2,
  IconChartPie,
  IconChevronDown,
  IconCodeOff,
  IconCoinBitcoin,
  IconFingerprintScan,
} from '@tabler/icons-react';
import { Logo } from '@/components/AppLogo/AppLogo';
import classes from './NavBar.module.css';

const mockdata = [
  {
    icon: IconCodeOff,
    title: 'API Integration',
    description: 'Seamless integration with our comprehensive API.',
  },
  {
    icon: IconCoinBitcoin,
    title: 'No fee ',
    description: 'No hidden fees. No credit card required.',
  },
  {
    icon: IconBook2,
    title: 'Documentation',
    description: 'Detailed guides and references for developers.',
  },
  {
    icon: IconFingerprintScan,
    title: 'Top-notch Security',
    description: 'Robust security features to protect your data.',
  },
  {
    icon: IconChartPie,
    title: 'Analytics',
    description: 'Powerful analytics to track your performance.',
  },
];

export const Links = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  TEMPLATES: '/dashboard/templates',
  LOGS: '/dashboard/backtrace',
};

export function NavBar() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const router = useRouter();
  const theme = useMantineTheme();
  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon style={{ width: rem(22), height: rem(22) }} color={theme.colors.blue[6]} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group>
            <Logo isWhite={false} width={64} />
          </Group>
          <Group h="100%" gap={0} visibleFrom="sm">
            <a href="#" className={classes.link}>
              Home
            </a>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Features
                    </Box>
                    <IconChevronDown
                      style={{ width: rem(16), height: rem(16) }}
                      color={theme.colors.blue[6]}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Features</Text>
                  <Anchor href="#" fz="xs">
                    View all
                  </Anchor>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} fz="sm">
                        Get Started
                      </Text>
                      <Text size="xs" c="dimmed">
                        Start using our services today.
                      </Text>
                    </div>
                    <Button variant="default">Get Started</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>

          <Group visibleFrom="sm">
            <Button onClick={() => router.push(Links.LOGIN)} variant="default">
              Log in
            </Button>
            <Button onClick={() => router.push(Links.SIGNUP)}>Sign up</Button>
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <a href="#" className={classes.link}>
            Home
          </a>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
              <IconChevronDown
                style={{ width: rem(16), height: rem(16) }}
                color={theme.colors.blue[6]}
              />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <a href="#" className={classes.link}>
            Learn
          </a>
          <a href="#" className={classes.link}>
            Academy
          </a>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Button onClick={() => router.push(Links.LOGIN)} variant="default">
              Log in
            </Button>
            <Button onClick={() => router.push(Links.SIGNUP)}>Sign up</Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
