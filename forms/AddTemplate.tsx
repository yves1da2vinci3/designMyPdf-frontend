import { Button, Group, Paper, Select, TextInput, useMantineTheme } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateTemplateDto } from '@/api/templateApi';
import { cssframeworkTypes, cssframeworkTypesMapper } from '@/utils/enums';

interface AddTemplateProps {
  onClose: () => void;
  onSubmit: (values: CreateTemplateDto) => void;
  requestStatus: RequestStatus;
}

const MARGIN_BOTTOM = 20;
const MARGIN_TOP = 30;

const DataForRolesSelect = Array.from(cssframeworkTypesMapper.entries()).map(([value, label]) => ({
  value: value.toString(),
  label,
}));

export function AddTemplateForm({ onSubmit, onClose, requestStatus }: AddTemplateProps) {
  const addTemplateForm = useForm<CreateTemplateDto>({
    initialValues: {
      name: '',
    },

    clearInputErrorOnChange: false,
    validateInputOnBlur: true,

    validate: {
      name: isNotEmpty('Enter a name '),
    },
  });

  return (
    <Paper maw={'100%'} p={30} radius="md">
      <form
        onSubmit={addTemplateForm.onSubmit((values: CreateTemplateDto) => onSubmit({ ...values }))}
      >
        <TextInput
          label="Name"
          withAsterisk
          mb={MARGIN_BOTTOM}
          placeholder={'My Template invoice'}
          {...addTemplateForm.getInputProps('name')}
        />
        <Select
          label="Css Framework"
          withAsterisk
          placeholder="tailwind"
          {...addTemplateForm.getInputProps('cssframework')}
          data={DataForRolesSelect}
        />

        <Group justify="flex-end" mt={MARGIN_TOP}>
          <Button onClick={onClose} w={'8rem'} size="md" bg={'gray'}>
            Cancel
          </Button>

          <Button
            type="submit"
            w={'12rem'}
            size="md"
            disabled={!addTemplateForm.isValid()}
            loading={requestStatus === RequestStatus.InProgress}
          >
            Create an template
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
