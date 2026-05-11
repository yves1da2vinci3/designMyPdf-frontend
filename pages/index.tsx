'use client';

import { Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '@/api/authApi';
import classes from './index.module.scss';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    const session = authApi.getUserSession();
    if (session?.accessToken) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
    // Intentionnel : une seule redirection au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Stack className={classes.container}>
      <Text>Redirection en cours…</Text>
    </Stack>
  );
}
