import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button, Group, Pagination, Stack, Title, rem, Loader, Center } from '@mantine/core';
import TemplateItem from '@/components/TemplateItem/TemplateItem';
import AddTemplate from '@/modals/AddTemplate/AddTemplate';
import { useDisclosure } from '@mantine/hooks';
import NamespaceItem from '@/components/NamespaceItem/NamespaceItem';
import AddNamespace from '@/modals/AddNamespace/AddNamespace';
import { CreateTemplateDto, TemplateDTO, templateApi } from '@/api/templateApi';
import { CreateNamespaceDto, NamespaceDTO, namespaceApi } from '@/api/namespaceApi';
import { RequestStatus } from '@/api/request-status.enum';
import { useRouter } from 'next/router';

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
      setSelectedNamespaceId(namespaces[0].ID);
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

  // Template management

  const updateTemplateOnClient = (id: number, namespaceId: number) => {
    const newTemplates = templates.map((template) => {
      if (template.ID === id) {
        return { ...template, NamespaceID: namespaceId };
      }
      return template;
    });
    setTemplates(newTemplates);
  };

  // add Template
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
      router.push(`/dashboard/templates/create/${newTemplate.ID}`);
      closeAddTemplate();
    } catch (error) {
      setAddTemplateRequestStatus(RequestStatus.Failed);
    }
  };

  const DeleteTemplateFromClient = (id: number) => {
    setTemplates(templates.filter((template) => template.ID !== id));
  };

  return (
    <Stack h={'98vh'}>
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
      <Group style={{ borderBottom: 2, borderColor: 'red' }} justify="space-between">
        <Title>Templates</Title>
        <Button onClick={openAddTemplate}>Create New Template</Button>
      </Group>
      <Group gap={4} flex={1}>
        {/* NameSpaces management */}
        <Stack px={rem(12)} gap={2} flex={1} w={'100%'} h={'100%'}>
          {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
            <Center>
              <Loader size="lg" />
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
              <Button onClick={openAddNamespace} size="xs" bg={'dark'} w={rem(164)}>
                Add Namespace
              </Button>
              <Button
                onClick={() => router.push('/dashboard/account?tabName=namespace')}
                size="xs"
                bg={'dark'}
                w={rem(164)}
              >
                Manage Namespaces
              </Button>
            </>
          )}
        </Stack>
        {/* Templates element */}
        <Stack h={'100%'} flex={4}>
          {fetchTemplatesRequestStatus === RequestStatus.InProgress ? (
            <Center>
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              <Group flex={1} align="flex-start" justify="flex-start" gap={6}>
                {filteredTemplates.map((template) => (
                  <TemplateItem
                    key={template?.ID}
                    DeleteTemplateFromClient={DeleteTemplateFromClient}
                    id={template?.ID}
                    template={template}
                  />
                ))}
              </Group>
              <Pagination
                style={{ alignSelf: 'self-end' }}
                total={Math.ceil(filteredTemplates.length / 10)}
              />
            </>
          )}
        </Stack>
      </Group>
    </Stack>
  );
};

TemplateHome.getLayout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default TemplateHome;
