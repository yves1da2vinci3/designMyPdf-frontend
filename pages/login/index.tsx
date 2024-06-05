import { Box, Stack } from '@mantine/core';
import styles from './login.module.css';
import {
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
import { useRouter } from 'next/router';
import { Links } from '@/components/Navbar/Navbar';
import { useForm } from '@mantine/form';
import { LoginDto, authApi } from '@/api/authApi';
export default function Login() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const onSubmit = (loginInfo: LoginDto) => {
    authApi.login(loginInfo);
  };
  return (
    <Box className={styles.container}>
      <Container size={420} my={40}>
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
          <form onSubmit={form.onSubmit((values: LoginDto) => onSubmit(values))}></form>
          <TextInput
            {...form.getInputProps('email')}
            label="Email"
            placeholder="you@mantine.dev"
            required
          />
          <PasswordInput
            {...form.getInputProps('password')}
            label="Password"
            placeholder="Your password"
            required
            mt="md"
          />
          <Group justify="space-between" mt="lg">
            <Checkbox {...form.getInputProps('password')} label="Remember me" />
            <Anchor component="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button type="submit" disabled={!form.isValid()} fullWidth mt="xl">
            Sign in
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
