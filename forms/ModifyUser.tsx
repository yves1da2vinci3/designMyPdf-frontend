'use client';

import { useEffect } from 'react';
import { Box, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';

interface ModifyUserProps {
  onSubmit: (values: { name: string; password: string }) => void;
  requestStatus: RequestStatus;
}

function ModifyUserForm({ onSubmit, requestStatus }: ModifyUserProps) {
  const form = useForm({
    initialValues: {
      name: '',
      password: '',
    },
  });

  // We intentionally don't include form in dependencies to avoid infinite loops
  // as form.setFieldValue would trigger re-renders
  // eslint-disable-next-line
  useEffect(() => {
    // Check if we're in a browser environment and localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Only access localStorage on the client side
        const storedUser = localStorage.getItem('userSession');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          form.setFieldValue('name', parsedUser.userName || '');
        }
      } catch (error) {
        // Handle JSON parse error silently
        console.error('Error accessing or parsing user session:', error);
      }
    }
  }, []);

  return (
    <Box
      style={{
        backgroundColor: 'white',
        width: '500px',
        padding: '20px',
        borderRadius: '10px',
      }}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Your name"
            {...form.getInputProps('name')}
          />
          <TextInput
            withAsterisk
            label="Password"
            placeholder="Your password"
            {...form.getInputProps('password')}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={requestStatus === RequestStatus.InProgress}>
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}

export default ModifyUserForm;
