import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { KeyDTO, UpdateKeyDto } from '@/api/keyApi';

interface UpdateKeyProps {
  onSubmit: (values: UpdateKeyDto) => void;
  Key: KeyDTO | null;
  onClose: () => void;
  requestStatus: RequestStatus;
}

function UpdateKeyForm({ onSubmit, Key, onClose, requestStatus }: UpdateKeyProps) {
  const form = useForm({
    initialValues: {
      name: Key?.name || '',
      key_count: Key?.key_count || 0,
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({ ...values, key_count: String(values.key_count) }),
      )}
    >
      <Stack>
        <TextInput
          withAsterisk
          label="Key Name"
          placeholder="Key name"
          {...form.getInputProps('name')}
        />

        <TextInput
          withAsterisk
          label="Key Count"
          placeholder="Key count"
          type="number"
          {...form.getInputProps('key_count')}
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
