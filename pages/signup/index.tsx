import { Box, Stack } from '@mantine/core';
import styles from './signup.module.css';
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
import { SignupDto, authApi } from '@/api/authApi';
export default function Signup() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const onSubmit = (loginInfo: SignupDto) => {
    authApi.login(loginInfo);
  };
  return (
    <Box className={styles.container}>
      <Container className={styles.boxContainer} size={420} my={40}>
        <Title ta="center" className={styles.title}>
          Welcome !
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do  have an account ?{' '}
          <Anchor onClick={() => router.push(Links.LOGIN)} size="sm" component="button">
            Login here
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} className={styles.formContainer} radius="md">
          <form onSubmit={form.onSubmit((values: SignupDto) => onSubmit(values))}></form>
          <TextInput
            {...form.getInputProps('email')}
            label="Email"
            placeholder="you@gmail.dev"
            required
          />
          <PasswordInput
            {...form.getInputProps('password')}
            label="Password"
            placeholder="Your password"
            required
            mt="md"
          />
          
          <Button type="submit" disabled={!form.isValid()} fullWidth mt="xl">
            Sign up
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
