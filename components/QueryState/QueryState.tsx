import React from 'react';
import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core';
import { RequestStatus } from '@/api/request-status.enum';

interface QueryStateProps {
  status: RequestStatus;
  loading?: React.ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  minHeight?: number | string;
  children: React.ReactNode;
}

export default function QueryState({
  status,
  loading,
  errorMessage = 'Unable to load data. Please try again.',
  onRetry,
  empty = false,
  emptyMessage = 'Nothing to show yet.',
  emptyAction,
  minHeight = 200,
  children,
}: QueryStateProps) {
  if (status === RequestStatus.InProgress || status === RequestStatus.NotStated) {
    return <Center style={{ minHeight }}>{loading ?? <Loader size="lg" />}</Center>;
  }

  if (status === RequestStatus.Failed) {
    return (
      <Center style={{ minHeight }}>
        <Stack align="center" gap="md" maw={420}>
          <Alert color="red" title="Error" variant="light" w="100%">
            {errorMessage}
          </Alert>
          {onRetry ? (
            <Button variant="light" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </Stack>
      </Center>
    );
  }

  if (empty) {
    return (
      <Center style={{ minHeight, flexDirection: 'column' }}>
        <Text c="dimmed" ta="center">
          {emptyMessage}
        </Text>
        {emptyAction}
      </Center>
    );
  }

  return <>{children}</>;
}
