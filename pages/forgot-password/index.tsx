import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import { ForgotPasswordDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/components/Navbar/Navbar';
import classes from './forgotPassword.module.css';

export default function ForgotPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: ForgotPasswordDto) => {
    setIsLoading(RequestStatus.InProgress);
    try {
      await authApi.forgotPassword(values);
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
          Forgot your password?
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
          Enter your email to get a reset link
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Your email"
              placeholder="me@gmail.dev"
              required
              {...form.getInputProps('email')}
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
