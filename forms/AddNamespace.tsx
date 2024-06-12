import { Button, Group, Paper, TextInput, useMantineTheme } from "@mantine/core";
import {  isNotEmpty, useForm } from "@mantine/form";
import { RequestStatus } from "@/api/request-status.enum";
import { CreateNamespaceDto } from "@/api/namespaceApi";


interface AddNamespaceProps {
  onClose: () => void;
  onSubmit: (values: CreateNamespaceDto) => void;
  requestStatus: RequestStatus;
}

const MARGIN_BOTTOM = 20;
const MARGIN_TOP = 30;



export function AddNamespaceForm({
  onSubmit,
  onClose,
  requestStatus,
}: AddNamespaceProps) {
  const addNamespaceForm = useForm<CreateNamespaceDto>({
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
        onSubmit={addNamespaceForm.onSubmit((values: CreateNamespaceDto) =>
          onSubmit({ ...values })
        )}
      >
        <TextInput
          label="Name"
          withAsterisk
          mb={MARGIN_BOTTOM}
          placeholder={"My Namespace "}
          {...addNamespaceForm.getInputProps("name")}
        />
     

        <Group justify="flex-end" mt={MARGIN_TOP}>
          <Button onClick={onClose} w={"8rem"} size="md" bg={"gray"}>
            Cancel
          </Button>

          <Button
            type="submit"
            w={"12rem"}
            size="md"
            disabled={!addNamespaceForm.isValid()}
            loading={requestStatus === RequestStatus.InProgress}
          >
            Create 
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
