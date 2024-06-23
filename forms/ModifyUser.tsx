import { Button, Group, Paper, PasswordInput, TextInput, rem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { RequestStatus } from '@/api/request-status.enum';
import { authApi, updateUserDTO } from '@/api/authApi';

interface ModifyUserProps {
  onSubmit: (values: updateUserDTO) => void;
  requestStatus: RequestStatus;
}

const MARGIN_BOTTOM = 20;
const MARGIN_TOP = 30;

export function ModifyUserForm({ onSubmit, requestStatus }: ModifyUserProps) {
  const form = useForm({
    initialValues: {
      userName: authApi.getUserSession()?.userName,
      password: '',
      confirmPassword: '',
    },

    clearInputErrorOnChange: false,
    validateInputOnBlur: true,

    validate: {
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });
  return (
    <Paper withBorder maw={'100%'} miw={rem(400)} p={30} radius="md">
      <form onSubmit={form.onSubmit((values: updateUserDTO) => onSubmit(values))}>
        <TextInput label="Username" mb={MARGIN_BOTTOM} {...form.getInputProps('userName')} />
        <PasswordInput
          label="New Password"
          mb={MARGIN_BOTTOM}
          placeholder="Your new password"
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label="Confirm Password"
          mb={MARGIN_BOTTOM}
          placeholder="Confirm your new password"
          {...form.getInputProps('confirmPassword')}
        />

        <Group justify="flex-end" mt={MARGIN_TOP}>
          <Button
            type="submit"
            w={'12rem'}
            size="md"
            loading={requestStatus === RequestStatus.InProgress}
          >
            Update
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
