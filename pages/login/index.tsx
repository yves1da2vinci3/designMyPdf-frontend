import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { LoginDto, authApi } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import { Links } from '@/constants/routes';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
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

  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);
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
    <Box className={styles.container}>
      <Container className={styles.boxContainer} size={420} my={40}>
        <Title ta="center" className={styles.title}>
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{' '}
          <Anchor onClick={() => router.push(Links.SIGNUP)} size="sm" component="button">
            Create account
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} className={styles.formContainer} radius="md">
          <form onSubmit={loginForm.onSubmit((values: LoginDto) => onSubmit(values))}>
            <TextInput
              {...loginForm.getInputProps('email')}
              label="Email"
              placeholder="you@gmail.dev"
              required
            />
            <PasswordInput
              {...loginForm.getInputProps('password')}
              label="Password"
              placeholder="Your password"
              required
              mt="md"
            />
            <Group justify="space-between" mt="lg">
              <Checkbox
                {...loginForm.getInputProps('rememberMe', { type: 'checkbox' })}
                label="Remember me"
              />
              <Anchor
                onClick={() => router.push(Links.FORGOT_PASSWORD)}
                component="button"
                size="sm"
              >
                Forgot password?
              </Anchor>
            </Group>
            <Button
              type="submit"
              loading={isLoading === RequestStatus.InProgress}
              disabled={!loginForm.isValid()}
              fullWidth
              mt="xl"
            >
              Sign in
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
