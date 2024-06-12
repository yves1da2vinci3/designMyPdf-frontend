import { updateUserDTO } from '@/api/authApi';
import { RequestStatus } from '@/api/request-status.enum';
import ManagedNamespaceItem from '@/components/ManageNamespaceItem/ManagedNamespaceItem';
import { ModifyUserForm } from '@/forms/ModifyUser';
import DashboardLayout from '@/layouts/DashboardLayout';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import {
  Button,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
  IconUserCircle,
  IconFolderFilled,
  IconTrashFilled,
  IconTrash,
} from '@tabler/icons-react';
import React, { useState } from 'react';

const ACCOUNT_TAB_NAME = 'account';
const NAMESPACE_TAB_NAME = 'namespace';
export default function Account() {
  const theme = useMantineTheme();

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
  const updateUserHandler = (updateUser: updateUserDTO) => {
    console.log(updateUser);
  };

  // Management namspace
  const [addNamespaceOpened, { open: openAddNamespace, close: closeAddNamespace }] =
    useDisclosure(false);
  const [selectedTabName, setSelectedTabName] = useState<string | null>(ACCOUNT_TAB_NAME);
  return (
    <Tabs flex={1} onChange={(value) => setSelectedTabName(value)} defaultValue={ACCOUNT_TAB_NAME}>
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
        <AddNamespace opened={addNamespaceOpened} onClose={closeAddNamespace} />

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
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
           <ManagedNamespaceItem />
          </Group>
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
}
Account.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
