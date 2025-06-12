import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUserCircle, IconFolderFilled } from '@tabler/icons-react';
import { authApi, updateUserDTO } from '@/api/authApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import ManagedNamespaceItem from '@/components/ManageNamespaceItem/ManagedNamespaceItem';
import ModifyUserForm from '@/forms/ModifyUser';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import styles from './AccountPage.module.scss';

const ACCOUNT_TAB_NAME = 'account';
const NAMESPACE_TAB_NAME = 'namespace';

export default function Account() {
  const theme = useMantineTheme();
  const router = useRouter();

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

  return (
    <>
      <LoadingOverlay
        visible={
          fetchNamespacesRequestStatus === RequestStatus.InProgress ||
          fetchNamespacesRequestStatus === RequestStatus.NotStated
        }
      />
      <Tabs
        flex={1}
        onChange={(value) => setSelectedTabName(value)}
        defaultValue={selectedTabName || ACCOUNT_TAB_NAME}
      >
        <Tabs.List>
          <Tabs.Tab
            value={ACCOUNT_TAB_NAME}
            className={selectedTabName === ACCOUNT_TAB_NAME ? styles.tabSelected : styles.tab}
            leftSection={
              <IconUserCircle
                className={selectedTabName === ACCOUNT_TAB_NAME ? styles.iconSelected : styles.icon}
              />
            }
          >
            Account
          </Tabs.Tab>
          <Tabs.Tab
            value={NAMESPACE_TAB_NAME}
            className={selectedTabName === NAMESPACE_TAB_NAME ? styles.tabSelected : styles.tab}
            leftSection={
              <IconFolderFilled
                className={selectedTabName === NAMESPACE_TAB_NAME ? styles.iconSelected : styles.icon}
              />
            }
          >
            Namespaces
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={ACCOUNT_TAB_NAME}>
          <Stack flex={1} h="90vh" justify="center" align="center" p="md">
            <Paper shadow="xs" p="xl" withBorder>
              <ModifyUserForm
                onSubmit={(values) =>
                  updateUserHandler({
                  userName: values.name,
                  password: values.password,
                })
              }
              requestStatus={updateUserRequestStatus}
            />
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value={NAMESPACE_TAB_NAME}>
          <AddNamespace
            opened={addNamespaceOpened}
            onClose={closeAddNamespace}
            addNamespaceHandler={AddNamespaceHandler}
            addNamespaceRequestatus={addNamespaceRequestStatus}
          />

          <Stack flex={1} p="md" mt={8}>
            <Group justify="space-between" pb="md" style={{ borderBottom: `1px solid ${theme.colors.gray[3]}` }}>
              <Title order={3}>Namespaces</Title>
              <Button onClick={openAddNamespace} variant="outline">
                Create New Namespace
              </Button>
            </Group>
            <Text size="sm" c="dimmed" py="sm">
              Separate your templates into namespaces for better organization.
            </Text>
            <Grid>
              {fetchNamespacesRequestStatus === RequestStatus.Succeeded && namespaces.length > 0 ? (
                namespaces.map((namespace) => (
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={namespace.ID}>
                    <Paper shadow="xs" p="md" withBorder>
                      <ManagedNamespaceItem
                        namespace={namespace}
                        id={namespace.ID}
                        DeleteFromClient={DeleteFromClient}
                      />
                    </Paper>
                  </Grid.Col>
                ))
              ) : fetchNamespacesRequestStatus === RequestStatus.Failed ? (
                <Grid.Col span={12}>
                  <Text c="red">Failed to fetch namespaces.</Text>
                </Grid.Col>
              ) : (
                <Grid.Col span={12}>
                  <Text>No namespaces found. Create one to get started!</Text>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}

Account.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
