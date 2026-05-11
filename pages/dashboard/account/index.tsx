import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  PasswordInput,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconFolderFilled, IconUserCircle } from '@tabler/icons-react';
import { authApi, updateUserDTO } from '@/api/authApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import ManagedNamespaceItem from '@/components/ManageNamespaceItem/ManagedNamespaceItem';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';

const ACCOUNT_TAB_NAME = 'account';
const NAMESPACE_TAB_NAME = 'namespace';

export default function Account() {
  const theme = useMantineTheme();
  const router = useRouter();
  const isMdUp = useMediaQuery('(min-width: 62em)');
  const sidebarDividerStyle = isMdUp ? { borderRight: '1px solid #e9ecef' as const } : {};

  const iconStyle = { width: rem(20), height: rem(20) };
  const iconStyleSelected = { width: rem(20), height: rem(20), color: 'white' };
  const selectedStyle = {
    backgroundColor: theme.colors.blue[5],
    color: 'white',
    fontWeight: 'bold',
  };
  const notselectedStyle = {
    color: 'black',
    fontWeight: 'bold',
  };

  // UserManagement
  const [updateUserRequestStatus, setUserRequestStatus] = useState<RequestStatus>(
    RequestStatus.NotStated,
  );
  const [fetchNamespacesRequestStatus, SetfetchNamespacesRequestStatus] = useState<RequestStatus>(
    RequestStatus.NotStated,
  );
  const updateUserHandler = async (updateUser: updateUserDTO) => {
    setUserRequestStatus(RequestStatus.InProgress);
    try {
      await authApi.update(updateUser);
      setUserRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      setUserRequestStatus(RequestStatus.Failed);
    }
  };

  // Management namspace
  const [addNamespaceOpened, { open: openAddNamespace, close: closeAddNamespace }] =
    useDisclosure(false);
  const tabName = useMemo(() => router.query.tabName, [router.query.tabName]) || ACCOUNT_TAB_NAME;
  const [selectedTabName, setSelectedTabName] = useState<string | null>(tabName as string);

  // nameSpace management
  const [namespaces, setNamespaces] = useState<NamespaceDTO[]>([]);
  const fetchNamespaces = async () => {
    SetfetchNamespacesRequestStatus(RequestStatus.InProgress);
    try {
      const fetchedNamespaces = await namespaceApi.getNamespaces();
      setNamespaces(fetchedNamespaces);
      SetfetchNamespacesRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      SetfetchNamespacesRequestStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const DeleteFromClient = (id: number) => {
    setNamespaces(namespaces.filter((ns) => ns.ID !== id));
  };

  // Add namespace
  const [addNamespaceRequestStatus, setAddNameSpaceRequestStatus] = useState(
    RequestStatus.NotStated,
  );
  const AddNamespaceHandler = async (nameSpaceDTO: CreateNamespaceDto) => {
    try {
      setAddNameSpaceRequestStatus(RequestStatus.InProgress);
      const newNamespace = await namespaceApi.createNamespace(nameSpaceDTO);
      setAddNameSpaceRequestStatus(RequestStatus.Succeeded);
      setNamespaces([...namespaces, newNamespace]);
      closeAddNamespace();
    } catch (error) {
      setAddNameSpaceRequestStatus(RequestStatus.Failed);
    }
  };

  const profileForm = useForm({
    initialValues: { name: '', email: '' },
  });

  const passwordForm = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      newPassword: (v: string) => (v.length < 6 ? 'At least 6 characters' : null),
      confirmPassword: (
        v: string,
        vals: { newPassword: string; confirmPassword: string; currentPassword: string },
      ) => (v !== vals.newPassword ? 'Passwords do not match' : null),
    },
  });

  const handleProfileSubmit = (values: { name: string; email: string }) => {
    updateUserHandler({ userName: values.name, password: '' });
  };

  const handlePasswordSubmit = (values: { currentPassword: string; newPassword: string }) => {
    updateUserHandler({ userName: '', password: values.newPassword });
  };

  return (
    <>
      <LoadingOverlay
        visible={
          fetchNamespacesRequestStatus === RequestStatus.InProgress ||
          fetchNamespacesRequestStatus === RequestStatus.NotStated
        }
      />

      <Box mb="xl">
        <Title order={2} fw={700}>
          Account Settings
        </Title>
        <Text c="dimmed" size="sm" mt={4}>
          Manage your personal information and file organization.
        </Text>
      </Box>

      <Tabs
        onChange={(value) => setSelectedTabName(value)}
        defaultValue={selectedTabName || ACCOUNT_TAB_NAME}
      >
        <Tabs.List mb="xl">
          <Tabs.Tab
            value={ACCOUNT_TAB_NAME}
            style={() => (selectedTabName === ACCOUNT_TAB_NAME ? selectedStyle : notselectedStyle)}
            leftSection={
              <IconUserCircle
                style={selectedTabName === ACCOUNT_TAB_NAME ? iconStyleSelected : iconStyle}
              />
            }
          >
            Account
          </Tabs.Tab>
          <Tabs.Tab
            value={NAMESPACE_TAB_NAME}
            style={() =>
              selectedTabName === NAMESPACE_TAB_NAME ? selectedStyle : notselectedStyle
            }
            leftSection={
              <IconFolderFilled
                style={selectedTabName === NAMESPACE_TAB_NAME ? iconStyleSelected : iconStyle}
              />
            }
          >
            Folders (Namespaces)
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={ACCOUNT_TAB_NAME}>
          <Stack gap="xl">
            <Card withBorder radius="md" shadow="xs" p={0} style={{ overflow: 'hidden' }}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, md: 4 }} p="xl" style={sidebarDividerStyle}>
                  <Title order={5} mb={8}>
                    User Profile
                  </Title>
                  <Text size="sm" c="dimmed">
                    Update your username and public contact email address.
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }} p="xl">
                  <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
                    <Stack gap="md">
                      <TextInput
                        label="Username"
                        placeholder="your_username"
                        {...profileForm.getInputProps('name')}
                      />
                      <TextInput
                        label="Contact Email"
                        placeholder="you@example.com"
                        {...profileForm.getInputProps('email')}
                      />
                      <Group justify="flex-end">
                        <Button
                          type="submit"
                          loading={updateUserRequestStatus === RequestStatus.InProgress}
                        >
                          Save Changes
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Grid.Col>
              </Grid>
            </Card>

            <Divider />

            <Card withBorder radius="md" shadow="xs" p={0} style={{ overflow: 'hidden' }}>
              <Grid gutter={0}>
                <Grid.Col span={{ base: 12, md: 4 }} p="xl" style={sidebarDividerStyle}>
                  <Title order={5} mb={8}>
                    Security
                  </Title>
                  <Text size="sm" c="dimmed">
                    Change your password to keep your account secure.
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }} p="xl">
                  <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
                    <Stack gap="md">
                      <PasswordInput
                        label="Current Password"
                        placeholder="••••••••"
                        {...passwordForm.getInputProps('currentPassword')}
                      />
                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <PasswordInput
                            label="New Password"
                            placeholder="••••••••"
                            {...passwordForm.getInputProps('newPassword')}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <PasswordInput
                            label="Confirm Password"
                            placeholder="••••••••"
                            {...passwordForm.getInputProps('confirmPassword')}
                          />
                        </Grid.Col>
                      </Grid>
                      <Group justify="flex-end">
                        <Button variant="outline" type="submit">
                          Update Password
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value={NAMESPACE_TAB_NAME}>
          <AddNamespace
            opened={addNamespaceOpened}
            onClose={closeAddNamespace}
            addNamespaceHandler={AddNamespaceHandler}
            addNamespaceRequestatus={addNamespaceRequestStatus}
          />

          <Stack gap="lg">
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
              <Box style={{ minWidth: 0 }}>
                <Title order={4}>Folders (Namespaces)</Title>
                <Text size="sm" c="dimmed">
                  Organize your templates into separate namespaces.
                </Text>
              </Box>
              <Button onClick={openAddNamespace}>New Folder</Button>
            </Group>

            <Group wrap="wrap">
              {fetchNamespacesRequestStatus === RequestStatus.Succeeded && namespaces.length > 0 ? (
                namespaces.map((namespace) => (
                  <ManagedNamespaceItem
                    namespace={namespace}
                    id={namespace.ID}
                    key={namespace.ID}
                    DeleteFromClient={DeleteFromClient}
                  />
                ))
              ) : fetchNamespacesRequestStatus === RequestStatus.Failed ? (
                <Text c="red">Failed to fetch folders.</Text>
              ) : (
                <Text c="dimmed">No folders yet.</Text>
              )}
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

Account.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
