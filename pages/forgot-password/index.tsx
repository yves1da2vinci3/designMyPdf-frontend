import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconArrowRight, IconLockOpen } from '@tabler/icons-react';
import { ForgotPasswordDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';

export default function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);

  const form = useForm({
    initialValues: { email: '' },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: ForgotPasswordDto) => {
    setIsLoading(RequestStatus.InProgress);
    try {
      await authApi.forgotPassword(values);
      setIsLoading(RequestStatus.Succeeded);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  return (
    <Stack style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }} gap={0}>
      {/* Top bar */}
      <Box px="xl" py="md" style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#fff' }}>
        <Text fw={700} size="md">
          Design My PDF
        </Text>
      </Box>

      {/* Content */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 64,
        }}
      >
        <Center mb="lg">
          <ThemeIcon size={64} radius="xl" variant="light" color="blue">
            <IconLockOpen size={30} />
          </ThemeIcon>
        </Center>

        <Title order={2} fw={700} ta="center" mb={8}>
          Forgot Password
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="xl" maw={360}>
          Enter your email address to receive a secure reset link.
        </Text>

        <Container size={420} w="100%">
          <Paper withBorder shadow="sm" p={30} radius="md" style={{ backgroundColor: '#fff' }}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Email Address"
                placeholder="name@company.com"
                required
                mb="lg"
                leftSection={<Text size="sm">✉</Text>}
                {...form.getInputProps('email')}
              />
              <Button
                type="submit"
                fullWidth
                loading={isLoading === RequestStatus.InProgress}
                rightSection={<IconArrowRight size={16} />}
              >
                Send Link
              </Button>
            </form>
          </Paper>

          <Center mt="lg">
            <Anchor size="sm" c="blue" onClick={() => router.push(Links.LOGIN)}>
              <Group gap={4} align="center">
                <IconArrowLeft size={14} />
                <span>Back to login</span>
              </Group>
            </Anchor>
          </Center>

          {/* Decorative PDF stack illustration */}
          <Center mt={48}>
            <Box style={{ position: 'relative', width: 140, height: 100 }}>
              {[3, 2, 1, 0].map((i) => (
                <Box
                  key={i}
                  style={{
                    position: 'absolute',
                    width: 100 + i * 8,
                    height: 130 + i * 4,
                    backgroundColor: i === 0 ? '#f1f3f5' : `rgba(255,255,255,${0.7 + i * 0.08})`,
                    border: '1px solid #dee2e6',
                    borderRadius: 4,
                    top: i * 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
              ))}
            </Box>
          </Center>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        py="md"
        px="xl"
        style={{
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text size="xs" c="dimmed">
          © 2024 Design My PDF Enterprise
        </Text>
        <Group gap="lg">
          <Anchor size="xs" c="dimmed">
            Help
          </Anchor>
          <Anchor size="xs" c="dimmed">
            Privacy
          </Anchor>
        </Group>
      </Box>
    </Stack>
  );
}
