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
  Image,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBolt, IconBuildingFactory2, IconCode, IconDiamondFilled } from '@tabler/icons-react';
import { SignupDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';

const FEATURES = [
  {
    icon: IconCode,
    color: 'blue',
    title: 'Powerful API & SDKs',
    desc: 'Easy integration with JSON-based templates and multi-language support.',
  },
  {
    icon: IconBuildingFactory2,
    color: 'violet',
    title: 'Visual Drag & Drop Editor',
    desc: 'Design beautiful templates without writing a single line of CSS.',
  },
  {
    icon: IconBolt,
    color: 'orange',
    title: 'Blazing Fast Rendering',
    desc: 'Optimized engine that generates complex documents in milliseconds.',
  },
];

export default function Signup() {
  const router = useRouter();
  const form = useForm<SignupDto>({
    initialValues: {
      email: '',
      password: '',
      userName: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      userName: (val) => (val.length === 0 ? 'Enter your username' : null),
      password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);

  const onSubmit = async (signupDto: SignupDto) => {
    setIsLoading(RequestStatus.InProgress);
    try {
      await authApi.signup(signupDto);
      router.push(Links.LOGIN);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  return (
    <Grid gutter={0} style={{ minHeight: '100vh' }}>
      {/* Left — form panel */}
      <Grid.Col
        span={{ base: 12, md: 6 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
          backgroundColor: '#fff',
          minHeight: '100vh',
        }}
      >
        <Box style={{ width: '100%', maxWidth: 420 }}>
          <Group mb="xl" gap="xs">
            <IconDiamondFilled size={22} color="#228be6" />
            <Text fw={700} size="lg">Design My PDF</Text>
          </Group>

          <Title order={3} fw={700} mb={4}>Create your account</Title>
          <Text size="sm" c="dimmed" mb="xl">
            Join Design My PDF and start creating professional documents.
          </Text>

          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              <TextInput
                {...form.getInputProps('userName')}
                label="Username"
                placeholder="Enter your username"
                required
              />
              <TextInput
                {...form.getInputProps('email')}
                label="Email"
                placeholder="name@example.com"
                required
              />
              <PasswordInput
                {...form.getInputProps('password')}
                label="Password"
                placeholder="Create a strong password"
                required
              />
              <Checkbox
                label={
                  <Text size="sm">
                    I agree to the{' '}
                    <Anchor size="sm" href="#">Terms of Service</Anchor>
                    {' '}and{' '}
                    <Anchor size="sm" href="#">Privacy Policy</Anchor>
                  </Text>
                }
              />
              <Button
                type="submit"
                loading={isLoading === RequestStatus.InProgress}
                fullWidth
                mt="xs"
              >
                Create Account
              </Button>
            </Stack>
          </form>

          <Divider label="OR" labelPosition="center" my="lg" />

          <Button
            variant="outline"
            fullWidth
            leftSection={
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
          >
            Sign up with Google
          </Button>

          <Text ta="center" size="sm" c="dimmed" mt="xl">
            Already have an account?{' '}
            <Anchor size="sm" onClick={() => router.push(Links.LOGIN)}>Sign in</Anchor>
          </Text>
        </Box>
      </Grid.Col>

      {/* Right — marketing panel */}
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
        <Box mb="xl" style={{ textAlign: 'right' }}>
          <Box
            style={{
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center',
              backgroundColor: '#e7f5ff',
              borderRadius: 4,
              padding: '4px 10px',
            }}
          >
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.08em" }} c="blue">✦ Developer First</Text>
          </Box>
        </Box>

        <Box
          mb="xl"
          p="xl"
          style={{
            backgroundColor: '#e9ecef',
            borderRadius: 8,
            minHeight: 80,
          }}
        >
          <Text size="xs" c="dimmed" mb="xs" style={{ fontFamily: 'monospace' }}>// template.html</Text>
          <Box w="60%" h={8} mb={6} style={{ backgroundColor: '#adb5bd', borderRadius: 4 }} />
          <Box w="80%" h={8} mb={6} style={{ backgroundColor: '#ced4da', borderRadius: 4 }} />
          <Box w="50%" h={8} style={{ backgroundColor: '#dee2e6', borderRadius: 4 }} />
        </Box>

        <Title order={3} fw={700} mb="xs">Generate PDFs with precision at scale.</Title>
        <Text c="dimmed" mb="xl">
          Join 5,000+ developers and businesses automating their document workflows with our API and visual editor.
        </Text>

        <Stack gap="lg" mb="xl">
          {FEATURES.map((feat) => (
            <Group key={feat.title} align="flex-start" gap="md">
              <ThemeIcon size="lg" radius="md" variant="light" color={feat.color}>
                <feat.icon size={18} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="sm" mb={2}>{feat.title}</Text>
                <Text size="xs" c="dimmed">{feat.desc}</Text>
              </Box>
            </Group>
          ))}
        </Stack>

        <Box
          p="md"
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            border: '1px solid #e9ecef',
          }}
        >
          <Group mb="xs" gap={2}>
            {Array(5).fill(null).map((_, i) => (
              <Text key={i} c="yellow">★</Text>
            ))}
          </Group>
          <Text size="sm" fs="italic" mb="sm">
            &ldquo;The most robust PDF solution we&apos;ve used. The developer experience is unmatched.&rdquo;
          </Text>
          <Group gap="sm">
            <Box
              w={32}
              h={32}
              style={{
                borderRadius: '50%',
                backgroundColor: '#228be6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="xs" fw={700} c="white">AR</Text>
            </Box>
            <Box>
              <Text fw={600} size="sm">Alex Rivera</Text>
              <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>CTO at TechFlow</Text>
            </Box>
          </Group>
        </Box>
      </Grid.Col>
    </Grid>
  );
}
