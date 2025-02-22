import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper,
  Title,
  Button,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  Stack,
  PasswordInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import { ResetPasswordDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/components/Navbar/Navbar';
import classes from './resetPassword.module.css';

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
      // Optionally, redirect or show success message
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  return (
    <Stack className={classes.container}>
      <Container size={460} my={30}>
        <Title className={classes.title} ta="center">
          Enter your new Password
        </Title>

        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <PasswordInput
              label="New Password"
              placeholder="New password"
              required
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm password"
              required
              {...form.getInputProps('confirmPassword')}
            />
            <Group justify="space-between" mt="lg" className={classes.controls}>
              <Anchor
                component="button"
                onClick={() => router.push(Links.LOGIN)}
                c="dimmed"
                size="sm"
                className={classes.control}
              >
                <Center inline>
                  <IconArrowLeft style={{ width: 12, height: 12 }} stroke={1.5} />
                  <Box ml={5}>Back to the login page</Box>
                </Center>
              </Anchor>
              <Button
                type="submit"
                className={classes.control}
                loading={isLoading === RequestStatus.InProgress}
              >
                Reset password
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
    </Stack>
  );
}
