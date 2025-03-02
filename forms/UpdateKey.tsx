import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { KeyDTO, UpdateKeyDto } from '@/api/keyApi';

interface UpdateKeyProps {
  onSubmit: (values: UpdateKeyDto) => void;
  Key: KeyDTO;
  onClose: () => void;
  requestStatus: RequestStatus;
}

function UpdateKeyForm({ onSubmit, Key, onClose, requestStatus }: UpdateKeyProps) {
  const form = useForm({
    initialValues: {
      name: Key.name,
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
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
            Update
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default UpdateKeyForm;
