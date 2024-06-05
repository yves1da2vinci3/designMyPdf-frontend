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
  rem,
  Stack,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import classes from './forgotPassword.module.css';
import { useRouter } from 'next/router';
import { Links } from '@/components/Navbar/Navbar';

export default function ForgotPassword() {
  const router = useRouter();
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
          <TextInput label="Your email" placeholder="me@gmail.dev" required />
          <Group justify="space-between" mt="lg" className={classes.controls}>
            <Anchor
              component="button"
              onClick={() => router.push(Links.LOGIN)}
              c="dimmed"
              size="sm"
              className={classes.control}
            >
              <Center inline>
                <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Anchor>
            <Button className={classes.control}>Reset password</Button>
          </Group>
        </Paper>
      </Container>
    </Stack>
  );
}
