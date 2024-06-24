import { authApi, updateUserDTO } from '@/api/authApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import ManagedNamespaceItem from '@/components/ManageNamespaceItem/ManagedNamespaceItem';
import { ModifyUserForm } from '@/forms/ModifyUser';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import {
  Button,
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
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

const ACCOUNT_TAB_NAME = 'account';
const NAMESPACE_TAB_NAME = 'namespace';
export default function Account() {
  const theme = useMantineTheme();
  const router = useRouter();

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
    RequestStatus.NotStated
  );
  const [fetchNamespacesRequestStatus, SetfetchNamespacesRequestStatus] = useState<RequestStatus>(
    RequestStatus.NotStated
  );
  const updateUserHandler = async (updateUser: updateUserDTO) => {
    setUserRequestStatus(RequestStatus.InProgress);
    try {
      await authApi.update(updateUser);
      setUserRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      setUserRequestStatus(RequestStatus.Failed);
    }
    console.log(updateUser);
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
      const namespaces = await namespaceApi.getNamespaces();
      setNamespaces(namespaces);
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
    RequestStatus.NotStated
  );
  const AddNamespaceHandler = async (nameSpaceDTO: CreateNamespaceDto) => {
    try {
      setAddNameSpaceRequestStatus(RequestStatus.InProgress);
      const namespace = await namespaceApi.createNamespace(nameSpaceDTO);
      setAddNameSpaceRequestStatus(RequestStatus.Succeeded);
      setNamespaces([...namespaces, namespace]);
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
            style={(style) =>
              selectedTabName === ACCOUNT_TAB_NAME ? selectedStyle : notselectedStyle
            }
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
            style={(style) =>
              selectedTabName === NAMESPACE_TAB_NAME ? selectedStyle : notselectedStyle
            }
            leftSection={
              <IconFolderFilled
                style={selectedTabName === NAMESPACE_TAB_NAME ? iconStyleSelected : iconStyle}
              />
            }
          >
            Namespaces
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={ACCOUNT_TAB_NAME}>
          <Stack
            flex={1}
            h={'90vh'}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <ModifyUserForm onSubmit={updateUserHandler} requestStatus={updateUserRequestStatus} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value={NAMESPACE_TAB_NAME}>
          <AddNamespace
            opened={addNamespaceOpened}
            onClose={closeAddNamespace}
            addNamespaceHandler={AddNamespaceHandler}
            addNamespaceRequestatus={addNamespaceRequestStatus}
          />

          <Stack flex={1} h={'90vh'} mt={8}>
            <Group px={12} style={{ borderBottom: 2, borderColor: 'red' }} justify="space-between">
              <Title order={5}>Namespaces</Title>
              <Button onClick={openAddNamespace}>create new nameSpace</Button>
            </Group>
            {/* Tite */}
            <Text mx={12} c={'gray'}>
              Separate your templates into namespace
            </Text>
            {/* Namespaces  */}
            <Group>
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
                <Title>Failed to fetch namespaces</Title>
              ) : (
                <Title>No Namespaces</Title>
              )}
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
Account.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
