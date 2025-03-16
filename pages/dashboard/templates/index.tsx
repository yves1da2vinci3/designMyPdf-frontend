import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Group,
  Pagination,
  Stack,
  Title,
  Loader,
  Center,
  Text,
  Box,
  Grid,
  Paper,
  Tabs,
  ActionIcon,
  Menu,
  Input,
  Flex
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DashboardLayout from '@/layouts/DashboardLayout';
import TemplateItem from '@/components/TemplateItem/TemplateItem';
import AddTemplate from '@/modals/AddTemplate/AddTemplate';
import NamespaceItem from '@/components/NamespaceItem/NamespaceItem';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import { CreateTemplateDto, TemplateDTO, templateApi } from '@/api/templateApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import {
  IconFolderFilled,
  IconPlus,
  IconSearch,
  IconFilter,
  IconDotsVertical,
  IconFileText,
  IconFolderPlus
} from '@tabler/icons-react';

function TemplatesPage() {
  const router = useRouter();
  const [addTemplateOpened, { open: openAddTemplate, close: closeAddTemplate }] =
    useDisclosure(false);
  const [addNamespaceOpened, { open: openAddNamespace, close: closeAddNamespace }] =
    useDisclosure(false);
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceDTO[]>([]);
  const [fetchTemplatesRequestStatus, setFetchTemplatesRequestStatus] = useState(
    RequestStatus.NotStated,
  );
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('all');

  const fetchTemplatesAndNamespaces = async () => {
    setFetchTemplatesRequestStatus(RequestStatus.InProgress);
    try {
      const templatesData = await templateApi.getTemplates();
      const namespacesData = await namespaceApi.getNamespaces();
      setTemplates(templatesData);
      setNamespaces(namespacesData);
      setSelectedNamespaceId(namespacesData[0]?.ID || null);
      setFetchTemplatesRequestStatus(RequestStatus.Succeeded);
    } catch (error) {
      setFetchTemplatesRequestStatus(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchTemplatesAndNamespaces();
  }, []);

  const handleNamespaceSelect = (id: number) => {
    setSelectedNamespaceId(id);
  };

  const filteredTemplates = selectedNamespaceId
    ? templates.filter((template) => template.NamespaceID === selectedNamespaceId)
    : templates;

  // Filter templates by search query
  const searchedTemplates = searchQuery 
    ? filteredTemplates.filter(template => 
        template.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredTemplates;

  // Namespace Management
  const [addNamespaceRequestStatus, setAddNameSpaceRequestStatus] = useState(
    RequestStatus.NotStated,
  );

  const updateTemplateOnClient = (id: number, namespaceId: number) => {
    const newTemplates = templates.map((template) => {
      if (template.ID === id) {
        return { ...template, NamespaceID: namespaceId };
      }
      return template;
    });
    setTemplates(newTemplates);
  };

  const AddNamespaceHandler = async (nameSpaceDTO: CreateNamespaceDto) => {
    try {
      setAddNameSpaceRequestStatus(RequestStatus.InProgress);
      const namespace = await namespaceApi.createNamespace(nameSpaceDTO);
      setAddNameSpaceRequestStatus(RequestStatus.Succeeded);
      const newNamespaces = [...namespaces, namespace];
      if (newNamespaces.length === 1) {
        setSelectedNamespaceId(namespace.ID);
      }
      setNamespaces(newNamespaces);
      closeAddNamespace();
    } catch (error) {
      setAddNameSpaceRequestStatus(RequestStatus.Failed);
    }
  };

  // Template management
  const [addTemplateRequestStatus, setAddTemplateRequestStatus] = useState(RequestStatus.NotStated);

  const AddTemplateHandler = async (template: CreateTemplateDto) => {
    try {
      setAddTemplateRequestStatus(RequestStatus.InProgress);
      const newTemplate = await templateApi.createTemplate(
        template.name,
        selectedNamespaceId as number,
      );
      setAddTemplateRequestStatus(RequestStatus.Succeeded);
      setTemplates([...templates, newTemplate]);
      router.push(`/dashboard/templates/create/${newTemplate.uuid}`);
      closeAddTemplate();
    } catch (error) {
      setAddTemplateRequestStatus(RequestStatus.Failed);
    }
  };

  const DeleteTemplateFromClient = (id: number) => {
    setTemplates(templates.filter((template) => template.ID !== id));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Stack h="98vh">
        <AddTemplate
          opened={addTemplateOpened}
          onClose={closeAddTemplate}
          addTemplateHandler={AddTemplateHandler}
          addTemplateRequestatus={addTemplateRequestStatus}
        />
        <AddNamespace
          opened={addNamespaceOpened}
          onClose={closeAddNamespace}
          addNamespaceHandler={AddNamespaceHandler}
          addNamespaceRequestatus={addNamespaceRequestStatus}
        />
        
        {/* Header */}
        <Group p="md" justify="space-between" style={{ borderBottom: '1px solid #eaeaea' }}>
          <Title order={2}>Templates</Title>
          <Group>
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={openAddTemplate}
              variant="filled"
            >
              New template
            </Button>
            <Button 
              leftSection={<IconFolderPlus size={16} />} 
              onClick={openAddNamespace}
              variant="outline"
            >
              New folder
            </Button>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg">
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => router.push('/dashboard/account?tabName=namespace')}>
                  Manage folders
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Main content */}
        <Flex style={{ flex: 1 }}>
          {/* Sidebar */}
          <Box 
            w={250} 
            p="md" 
            style={{ 
              borderRight: '1px solid #eaeaea',
              height: '100%',
              overflowY: 'auto'
            }}
          >
            <Text fw={600} mb="md">Folders</Text>
            <Stack>
              {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
                <Center>
                  <Loader size="sm" />
                </Center>
              ) : (
                <>
                  {namespaces.map((namespace) => (
                    <NamespaceItem
                      key={namespace.ID}
                      id={namespace.ID}
                      selected={namespace.ID === selectedNamespaceId}
                      setNamespaceId={() => handleNamespaceSelect(namespace.ID)}
                      updateOnClient={updateTemplateOnClient}
                      namespace={namespace}
                    />
                  ))}
                </>
              )}
            </Stack>
          </Box>

          {/* Main content area */}
          <Box style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {/* Search and filters */}
            <Group mb="md" justify="space-between">
              <Input
                leftSection={<IconSearch size={16} />}
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ width: '300px' }}
              />
              <Group>
                <Tabs value={activeTab} onChange={setActiveTab}>
                  <Tabs.List>
                    <Tabs.Tab value="all">All files</Tabs.Tab>
                    <Tabs.Tab value="recent">Recently modified</Tabs.Tab>
                  </Tabs.List>
                </Tabs>
                <ActionIcon variant="subtle">
                  <IconFilter size={18} />
                </ActionIcon>
              </Group>
            </Group>

            {/* Templates grid */}
            {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
              <Center style={{ height: '200px' }}>
                <Loader size="lg" />
              </Center>
            ) : searchedTemplates.length === 0 ? (
              <Center style={{ height: '200px', flexDirection: 'column' }}>
                <IconFileText size={48} color="#868e96" style={{ opacity: 0.5 }} />
                <Text c="dimmed" mt="md">
                  {searchQuery ? 'No templates match your search' : 'No templates in this folder'}
                </Text>
                <Button 
                  variant="light" 
                  mt="md" 
                  leftSection={<IconPlus size={16} />}
                  onClick={openAddTemplate}
                >
                  Create new template
                </Button>
              </Center>
            ) : (
              <Grid gutter="md">
                {searchedTemplates.map((template) => (
                  <Grid.Col key={template.ID} span={4}>
                    <TemplateItem
                      DeleteTemplateFromClient={DeleteTemplateFromClient}
                      id={template?.ID}
                      template={template}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {searchedTemplates.length > 0 && (
              <Group justify="flex-end" mt="xl">
                <Pagination total={Math.ceil(searchedTemplates.length / 12)} />
              </Group>
            )}
          </Box>
        </Flex>
      </Stack>
    </DndProvider>
  );
}

TemplatesPage.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplatesPage;
