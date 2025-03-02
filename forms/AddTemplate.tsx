import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateTemplateDto } from '@/api/templateApi';
import { cssframeworkTypes, cssframeworkTypesMapper } from '@/utils/enums';

interface AddTemplateProps {
  onSubmit: (values: CreateTemplateDto) => void;
  onClose: () => void;
  requestStatus: RequestStatus;
}

const MARGIN_BOTTOM = 20;
const MARGIN_TOP = 30;

const DataForRolesSelect = Array.from(cssframeworkTypesMapper.entries()).map(([value, label]) => ({
  value: value.toString(),
  label,
}));

function AddTemplateForm({ onSubmit, onClose, requestStatus }: AddTemplateProps) {
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
          label="Template Name"
          placeholder="Template name"
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

export default AddTemplateForm;
