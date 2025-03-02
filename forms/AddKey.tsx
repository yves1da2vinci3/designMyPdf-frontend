import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateKeyDto } from '@/api/keyApi';

interface AddKeyProps {
  onSubmit: (values: CreateKeyDto) => void;
  onClose: () => void;
  requestStatus: RequestStatus;
}

function AddKeyForm({ onSubmit, onClose, requestStatus }: AddKeyProps) {
  const form = useForm({
    initialValues: {
      name: '',
    },
  });
  const handleSubmit = (values: { name: string }) => {
    onSubmit({ name: values.name, key_count: 1 });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Key Name"
          placeholder="Key name"
          {...form.getInputProps('name')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={requestStatus === RequestStatus.InProgress}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default AddKeyForm;
