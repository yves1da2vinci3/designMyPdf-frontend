import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Grid,
  Group,
  List,
  PasswordInput,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowRight, IconCheck, IconCircleCheck, IconDiamondFilled } from '@tabler/icons-react';
import { ResetPasswordDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';

export default function ResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);

  const form = useForm({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value: string) =>
        value.length < 6 ? 'Password must be at least 6 characters' : null,
      confirmPassword: (value: string, values: ResetPasswordDto) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: ResetPasswordDto) => {
    setIsLoading(RequestStatus.InProgress);
    const changePasswordDto = {
      password: values.newPassword,
      token: router.query.token as string,
    };
    try {
      await authApi.changePassword(changePasswordDto);
      setIsLoading(RequestStatus.Succeeded);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  return (
    <Grid gutter={0} style={{ minHeight: '100vh' }}>
      {/* Left panel — form */}
      <Grid.Col
        span={6}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 64px',
          backgroundColor: '#fff',
        }}
      >
        <Box style={{ maxWidth: 440 }}>
          <Group mb="xl" gap="xs">
            <IconDiamondFilled size={20} color="#228be6" />
            <Text fw={700}>Design My PDF</Text>
          </Group>

          <Alert
            icon={<IconCircleCheck size={18} />}
            color="blue"
            variant="light"
            radius="md"
            mb="xl"
          >
            Your reset token has been verified successfully. You can now choose a new password.
          </Alert>

          <Title order={3} fw={700} mb={4}>New Password</Title>
          <Text size="sm" c="dimmed" mb="xl">
            Please enter your new secure password to complete your account recovery.
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <PasswordInput
                label="New Password"
                placeholder="••••••••"
                required
                {...form.getInputProps('newPassword')}
              />
              <PasswordInput
                label="Confirm Password"
                placeholder="••••••••"
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Box
                p="md"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: 8,
                  border: '1px solid #e9ecef',
                }}
              >
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.05em" }} mb="xs" c="dimmed">
                  Security Criteria:
                </Text>
                <List
                  spacing={4}
                  size="xs"
                  icon={
                    <ThemeIcon size={14} radius="xl" color="teal" variant="light">
                      <IconCheck size={10} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>Minimum 8 characters</List.Item>
                  <List.Item>One special character (!@#$%)</List.Item>
                </List>
              </Box>

              <Button
                type="submit"
                loading={isLoading === RequestStatus.InProgress}
                fullWidth
                rightSection={<IconArrowRight size={16} />}
                mt="xs"
              >
                Update Password
              </Button>
            </Stack>
          </form>

          <Text ta="center" size="xs" c="dimmed" mt="xl">
            Need help?{' '}
            <Anchor size="xs">Contact support</Anchor>
          </Text>
        </Box>
      </Grid.Col>

      {/* Right panel — brand */}
      <Grid.Col
        span={6}
        style={{
          backgroundColor: '#eef4ff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 64px',
        }}
      >
        <Box
          mb={6}
          style={{
            width: 40,
            height: 4,
            backgroundColor: '#228be6',
            borderRadius: 2,
          }}
        />
        <Title order={1} fw={800} mb="md" style={{ lineHeight: 1.1, fontSize: 40 }}>
          Uncompromising Generation.
        </Title>
        <Text size="md" c="dimmed" mb={48}>
          The most reliable PDF infrastructure for your enterprise applications.
        </Text>

        {/* Device mockup */}
        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            p="lg"
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              border: '1px solid #dee2e6',
              width: 280,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <Box mb="md" style={{ display: 'flex', gap: 6 }}>
              {[1,2,3].map(i => (
                <Box key={i} h={6} style={{ flex: 1, backgroundColor: '#e9ecef', borderRadius: 3 }} />
              ))}
            </Box>
            <Box h={80} mb="md" style={{ backgroundColor: '#f1f3f5', borderRadius: 6 }} />
            <Box h={10} mb={6} style={{ backgroundColor: '#e9ecef', borderRadius: 4, width: '80%' }} />
            <Box h={10} mb={6} style={{ backgroundColor: '#e9ecef', borderRadius: 4, width: '60%' }} />
            <Box h={32} mt="md" style={{ backgroundColor: '#228be6', borderRadius: 6, width: '50%' }} />
          </Box>
        </Box>
      </Grid.Col>
    </Grid>
  );
}
