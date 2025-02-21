import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Group, Stack, Loader, Center, Tabs, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateTemplateDto, TemplateDTO, templateApi } from '@/api/templateApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import { useRouter } from 'next/router';
import { TemplateGrid } from '@/components/TemplateGrid/TemplateGrid';
import AddTemplate from '@/modals/AddTemplate/AddTemplate';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import { IconFolder } from '@tabler/icons-react';

const TemplateHome = () => {
  const router = useRouter();
  const [addTemplateOpened, { open: openAddTemplate, close: closeAddTemplate }] =
    useDisclosure(false);
  const [addNamespaceOpened, { open: openAddNamespace, close: closeAddNamespace }] =
    useDisclosure(false);
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceDTO[]>([]);
  const [fetchTemplatesRequestStatus, setFetchTemplatesRequestStatus] = useState(
    RequestStatus.NotStated
  );
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<number | null>(null);

  const fetchTemplatesAndNamespaces = async () => {
    setFetchTemplatesRequestStatus(RequestStatus.InProgress);
    try {
      const templates = await templateApi.getTemplates();
      const namespaces = await namespaceApi.getNamespaces();
      setTemplates(templates);
      setNamespaces(namespaces);
      setSelectedNamespaceId(namespaces[0]?.ID || null);
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

  // Namespace Management
  const [addNamespaceRequestStatus, setAddNameSpaceRequestStatus] = useState(
    RequestStatus.NotStated
  );
  
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
        selectedNamespaceId as number
      );
      setAddTemplateRequestStatus(RequestStatus.Succeeded);
      setTemplates([...templates, newTemplate]);
      router.push(`/dashboard/templates/create/${newTemplate.uuid}`);
      closeAddTemplate();
    } catch (error) {
      setAddTemplateRequestStatus(RequestStatus.Failed);
    }
  };

  const handleTemplateSelect = (template: TemplateDTO) => {
    router.push(`/dashboard/templates/create/${template.uuid}`);
  };

  const handleTemplateDelete = async (id: number) => {
    try {
      await templateApi.deleteTemplate(id);
      setTemplates(templates.filter((template) => template.ID !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  return (
    <Stack h="100vh" p="md">
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

      {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
        <Center style={{ height: '100%' }}>
          <Loader size="lg" />
        </Center>
      ) : (
        <Group align="flex-start" h="100%" spacing="lg">
          <Stack style={{ width: rem(250) }}>
            <Tabs
              variant="outline"
              value={selectedNamespaceId?.toString()}
              onChange={(value) => handleNamespaceSelect(Number(value))}
            >
              <Tabs.List>
                {namespaces.map((namespace) => (
                  <Tabs.Tab
                    key={namespace.ID}
                    value={namespace.ID.toString()}
                    leftSection={<IconFolder size={rem(16)} />}
                  >
                    {namespace.name}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </Stack>

          <Stack style={{ flex: 1 }}>
            <TemplateGrid
              templates={filteredTemplates}
              onCreateTemplate={openAddTemplate}
              onTemplateSelect={handleTemplateSelect}
              onTemplateDelete={handleTemplateDelete}
            />
          </Stack>
        </Group>
      )}
    </Stack>
  );
};

TemplateHome.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateHome;
