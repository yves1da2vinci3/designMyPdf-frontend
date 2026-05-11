import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Anchor,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconBolt, IconDiamondFilled, IconShield } from '@tabler/icons-react';
import { LoginDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';

const FEATURES = [
  {
    icon: IconBolt,
    color: 'blue',
    title: 'Performance',
    desc: 'Ultra-fast instant rendering.',
  },
  {
    icon: IconShield,
    color: 'teal',
    title: 'Security',
    desc: 'End-to-end encryption.',
  },
];

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);

  const loginForm = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validate: {
      email: (val: string) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val: string) =>
        val.length <= 6 ? 'Password should include at least 6 characters' : null,
    },
  });

  const onSubmit = async (loginInfo: LoginDto) => {
    setIsLoading(RequestStatus.InProgress);
    try {
      await authApi.login(loginInfo);
      router.push(Links.DASHBOARD);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  return (
    <Grid gutter={0} style={{ minHeight: '100vh' }}>
      {/* Left panel — brand */}
      <Grid.Col
        span={{ base: 12, md: 6 }}
        visibleFrom="md"
        style={{
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 64px',
          minHeight: '100vh',
        }}
      >
        <Box
          mb={32}
          p="xl"
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            border: '1px solid #e9ecef',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <Group mb="xl" gap="xs">
            <IconDiamondFilled size={22} color="#228be6" />
            <Text fw={700} size="lg">
              Design My PDF
            </Text>
          </Group>

          <Title order={2} fw={800} mb="md" style={{ lineHeight: 1.2 }}>
            Simplify professional document generation.
          </Title>
          <Text size="sm" c="dimmed" mb="xl">
            Join thousands of developers and enterprises automating their document workflow with
            surgical precision.
          </Text>

          <Grid gutter="sm">
            {FEATURES.map((f) => (
              <Grid.Col key={f.title} span={6}>
                <Box
                  p="md"
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: 10,
                    border: '1px solid #e9ecef',
                  }}
                >
                  <ThemeIcon size="sm" variant="light" color={f.color} radius="md" mb="xs">
                    <f.icon size={14} />
                  </ThemeIcon>
                  <Text fw={600} size="sm" mb={2}>
                    {f.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {f.desc}
                  </Text>
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        </Box>
      </Grid.Col>

      {/* Right panel — form */}
      <Grid.Col
        span={{ base: 12, md: 6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 32px',
          backgroundColor: '#fff',
          minHeight: '100vh',
        }}
      >
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box style={{ maxWidth: 440, width: '100%' }}>
            <Title order={2} fw={700} mb={4}>
              Welcome back
            </Title>
            <Text size="sm" c="dimmed" mb="xl">
              Sign in to access your workspace.
            </Text>

            <form onSubmit={loginForm.onSubmit((values: LoginDto) => onSubmit(values))}>
              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="nom@enterprise.fr"
                  required
                  {...loginForm.getInputProps('email')}
                />

                <Box>
                  <Group justify="space-between" mb={4}>
                    <Text size="sm" fw={500}>
                      Password
                    </Text>
                    <Anchor
                      size="xs"
                      onClick={() => router.push(Links.FORGOT_PASSWORD)}
                      component="button"
                      type="button"
                    >
                      Forgot password?
                    </Anchor>
                  </Group>
                  <PasswordInput
                    placeholder="••••••••"
                    required
                    {...loginForm.getInputProps('password')}
                  />
                </Box>

                <Checkbox
                  label="Remember me"
                  {...loginForm.getInputProps('rememberMe', { type: 'checkbox' })}
                />

                <Button
                  type="submit"
                  loading={isLoading === RequestStatus.InProgress}
                  fullWidth
                  rightSection={<IconArrowRight size={16} />}
                >
                  Sign in
                </Button>
              </Stack>
            </form>

            <Divider
              my="xl"
              label={
                <Text
                  size="xs"
                  fw={600}
                  tt="uppercase"
                  style={{ letterSpacing: '0.08em' }}
                  c="dimmed"
                >
                  Or continue with
                </Text>
              }
              labelPosition="center"
            />

            <Grid gutter="sm">
              <Grid.Col span={6}>
                <Button
                  variant="default"
                  fullWidth
                  leftSection={
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  }
                >
                  Google
                </Button>
              </Grid.Col>
              <Grid.Col span={6}>
                <Button
                  variant="default"
                  fullWidth
                  leftSection={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  }
                >
                  GitHub
                </Button>
              </Grid.Col>
            </Grid>

            <Text ta="center" size="sm" c="dimmed" mt="xl">
              Don&apos;t have an account?{' '}
              <Anchor
                size="sm"
                fw={600}
                onClick={() => router.push(Links.SIGNUP)}
                component="button"
                type="button"
              >
                Create account for free
              </Anchor>
            </Text>
          </Box>
        </Box>

        {/* Footer */}
        <Group justify="flex-end" gap="lg" mt="xl">
          <Anchor size="xs" c="dimmed">
            Support
          </Anchor>
          <Anchor size="xs" c="dimmed">
            Privacy
          </Anchor>
          <Anchor size="xs" c="dimmed">
            Terms
          </Anchor>
        </Group>
      </Grid.Col>
    </Grid>
  );
}
