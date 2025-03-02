'use client';

import { Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import classes from './index.module.scss';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/login');
  }, []);
  return (
    <Stack className={classes.container}>
      <Text>you are going to be redirected to the login page...</Text>
    </Stack>
  );
}
