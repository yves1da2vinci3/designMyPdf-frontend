import { Button, Group, Paper, TextInput, useMantineTheme } from "@mantine/core";
import {  isNotEmpty, useForm } from "@mantine/form";
import { RequestStatus } from "@/api/request-status.enum";
import { CreateKeyDto } from "@/api/keyApi";


interface AddKeyProps {
  onClose: () => void;
  onSubmit: (values: CreateKeyDto) => void;
  requestStatus: RequestStatus;
}

const MARGIN_BOTTOM = 20;
const MARGIN_TOP = 30;



export function AddKeyForm({
  onSubmit,
  onClose,
  requestStatus,
}: AddKeyProps) {
  const addKeyForm = useForm<CreateKeyDto>({
    initialValues: {
      name: "",
    },

    clearInputErrorOnChange: false,
    validateInputOnBlur: true,

    validate: {
      name: isNotEmpty("Enter a name "),
    },
  });

  return (
    <Paper maw={"100%"} p={30}  radius="md">
      <form
        onSubmit={addKeyForm.onSubmit((values: CreateKeyDto) =>
          onSubmit({ ...values })
        )}
      >
        <TextInput
          label="Name"
          withAsterisk
          mb={MARGIN_BOTTOM}
          placeholder={"My Key "}
          {...addKeyForm.getInputProps("name")}
        />
     

        <Group justify="flex-end" mt={MARGIN_TOP}>
          <Button onClick={onClose} w={"8rem"} size="md" bg={"gray"}>
            Cancel
          </Button>

          <Button
            type="submit"
            w={"12rem"}
            size="md"
            disabled={!addKeyForm.isValid()}
            loading={requestStatus === RequestStatus.InProgress}
          >
            Create key
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
