import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';

interface ModifyUserProps {
  onSubmit: (values: { name: string; email: string }) => void;
  requestStatus: RequestStatus;
}

function ModifyUserForm({ onSubmit, requestStatus }: ModifyUserProps) {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
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
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
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
