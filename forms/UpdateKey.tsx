import { Button, Group, Paper, TextInput, useMantineTheme } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { CreateKeyDto, KeyDTO, UpdateKeyDto } from '@/api/keyApi';

interface UpdateKeyProps {
  onClose: () => void;
  onSubmit: (values: UpdateKeyDto) => void;
  requestStatus: RequestStatus;
  Key?: KeyDTO;
}

const MARGIN_BOTTOM = 20;
const MARGIN_TOP = 30;

export function UpdateKeyForm({ onSubmit, Key, onClose, requestStatus }: UpdateKeyProps) {
  const updateKeyForm = useForm<CreateKeyDto>({
    initialValues: {
      name: Key?.name || '',
      key_count: Key?.key_count.toString() || '0',
    },

    clearInputErrorOnChange: false,
    validateInputOnBlur: true,

    validate: {
      name: isNotEmpty('Enter a name '),
      key_count: isNotEmpty('Enter a key count '),
    },
  });

  return (
    <Paper maw={'100%'} p={30} radius="md">
      <form onSubmit={updateKeyForm.onSubmit((values: UpdateKeyDto) => onSubmit({ ...values }))}>
        <TextInput
          label="Name"
          withAsterisk
          mb={MARGIN_BOTTOM}
          placeholder={'My Key '}
          {...updateKeyForm.getInputProps('name')}
        />
        <TextInput
          label="KeyCount"
          withAsterisk
          mb={MARGIN_BOTTOM}
          placeholder={'11'}
          type="number"
          {...updateKeyForm.getInputProps('key_count')}
        />

        <Group justify="flex-end" mt={MARGIN_TOP}>
          <Button onClick={onClose} w={'8rem'} size="md" bg={'gray'}>
            Cancel
          </Button>

          <Button
            type="submit"
            w={'12rem'}
            size="md"
            disabled={!updateKeyForm.isValid()}
            loading={requestStatus === RequestStatus.InProgress}
          >
            Update key
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
