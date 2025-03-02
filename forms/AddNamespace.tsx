import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateNamespaceDto } from '@/api/namespaceApi';

interface AddNamespaceProps {
  onSubmit: (values: CreateNamespaceDto) => void;
  onClose: () => void;
  requestStatus: RequestStatus;
}

function AddNamespaceForm({ onSubmit, onClose, requestStatus }: AddNamespaceProps) {
  const form = useForm({
    initialValues: {
      name: '',
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Namespace Name"
          placeholder="Namespace name"
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

export default AddNamespaceForm;
