import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  ActionIcon,
  Input,
  Flex,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  IconPlus,
  IconSearch,
  IconHelp,
} from '@tabler/icons-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TemplateItem from '@/components/TemplateItem/TemplateItem';
import AddTemplate from '@/modals/AddTemplate/AddTemplate';
import NamespaceItem from '@/components/NamespaceItem/NamespaceItem';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import { CreateTemplateDto, TemplateDTO, templateApi } from '@/api/templateApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import { manuallyStartTour } from '@/utils/tourUtils';
import { useLocalStorage } from '@/utils/useLocalStorage';
import 'driver.js/dist/driver.css';

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
  const [showTourButton, setShowTourButton] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenTemplatesDashboardTour', false);

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
    ? filteredTemplates.filter((template) =>
        template.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
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

  // Initialize the tour when the component mounts
  useEffect(() => {
    // Only start the tour after the templates have loaded
    if (fetchTemplatesRequestStatus === RequestStatus.Succeeded) {
      // Use setTimeout to ensure the DOM is fully rendered
      const tourTimeout = setTimeout(() => {
        // Check if tour target elements exist
        const elements = [
          '#templates-header',
          '#create-template-button',
          '#create-folder-button',
          '#folders-section',
          '#search-templates',
          '#templates-grid',
        ];

        // Verify all elements exist
        const allElementsExist = elements.every((selector) => {
          const el = document.querySelector(selector);
          return !!el;
        });

        if (!allElementsExist) {
          return;
        }

        try {
          // Only show the tour if the user hasn't seen it before
          if (!hasSeenTour) {
            manuallyStartTour(() => {
              setHasSeenTour(true);
            }, 'dashboard');
          }
        } catch (error) {
          // Silently handle tour errors
        }

        setShowTourButton(true);
      }, 1500); // Increased timeout to ensure DOM is fully rendered

      return () => clearTimeout(tourTimeout);
    }
    return undefined;
  }, [fetchTemplatesRequestStatus, hasSeenTour, setHasSeenTour]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/driver.js@1.3.5/dist/driver.css"
        />
      </Head>
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
        <Group
          p="md"
          justify="space-between"
          style={{ borderBottom: '1px solid #eaeaea' }}
          id="templates-header"
          align="center"
        >
          <Box>
            <Title order={2} fw={700}>Template Library</Title>
            <Text size="sm" c="dimmed">Manage and organize your PDF generation logic.</Text>
          </Box>
          <Group>
            <Input
              id="search-templates"
              leftSection={<IconSearch size={16} />}
              placeholder="Search templates or folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ width: '260px' }}
            />
            <Button
              id="create-template-button"
              leftSection={<IconPlus size={16} />}
              onClick={openAddTemplate}
              variant="filled"
            >
              New Template
            </Button>
            {showTourButton && (
              <Tooltip label="Show guided tour">
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={() => {
                    manuallyStartTour(() => {
                      setHasSeenTour(true);
                    }, 'dashboard');
                  }}
                >
                  <IconHelp size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {/* Main content */}
        <Flex style={{ flex: 1 }}>
          {/* Sidebar */}
          <Box
            id="folders-section"
            w={240}
            p="md"
            style={{
              borderRight: '1px solid #eaeaea',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: '0.05em' }}
              c="dimmed"
              mb="sm"
            >
              Folders
            </Text>
            <Stack gap={4} mb="xl">
              {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
                <Center>
                  <Loader size="sm" />
                </Center>
              ) : (
                <>
                  <Box
                    px="sm"
                    py={6}
                    mb={4}
                    style={{
                      borderRadius: 6,
                      backgroundColor: selectedNamespaceId === null ? '#e7f5ff' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onClick={() => setSelectedNamespaceId(null)}
                  >
                    <Text size="sm" fw={selectedNamespaceId === null ? 600 : 400} c={selectedNamespaceId === null ? 'blue' : 'inherit'}>
                      All Templates
                    </Text>
                  </Box>
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
                  <Box
                    px="sm"
                    py={6}
                    id="create-folder-button"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={openAddNamespace}
                  >
                    <Text size="sm" c="blue">+ New Folder</Text>
                  </Box>
                </>
              )}
            </Stack>

            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: '0.05em' }}
              c="dimmed"
              mb="sm"
            >
              Tags
            </Text>
            <Group gap={6}>
              {['DRAFT', 'PROD', 'LEGACY'].map((tag) => (
                <Box
                  key={tag}
                  px="sm"
                  py={4}
                  style={{
                    borderRadius: 4,
                    border: '1px solid #dee2e6',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#495057',
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  {tag}
                </Box>
              ))}
            </Group>
          </Box>

          {/* Main content area */}
          <Box style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {/* Templates grid */}
            {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
              <Center style={{ height: '200px' }}>
                <Loader size="lg" />
              </Center>
            ) : searchedTemplates.length === 0 ? (
              <Center style={{ height: '200px', flexDirection: 'column' }}>
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
              <>
                <Grid id="templates-grid" gutter="md">
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
              </>
            )}

            {/* Pagination */}
            {searchedTemplates.length > 0 && (
              <Group justify="space-between" mt="xl" align="center">
                <Text size="sm" c="dimmed">
                  Showing 1 to {Math.min(searchedTemplates.length, 12)} of{' '}
                  {searchedTemplates.length} templates
                </Text>
                <Pagination total={Math.ceil(searchedTemplates.length / 12)} size="sm" />
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
