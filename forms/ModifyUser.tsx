import { Button, Group, Stack, TextInput } from '@mantine/core';
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

  return (
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
          placeholder="your password"
          {...form.getInputProps('password')}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={requestStatus === RequestStatus.InProgress}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default ModifyUserForm;
