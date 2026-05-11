import React, { useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  rem,
  Loader,
  Center,
  Drawer,
  Textarea,
  ActionIcon,
  Tooltip,
  ScrollArea,
  SimpleGrid,
  Image,
  Menu,
  Divider,
  Card,
  Badge,
  TextInput,
  Tabs,
  Modal,
} from '@mantine/core';
import { useRouter, useParams } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import {
  IconChevronLeft,
  IconDownload,
  IconMinus,
  IconPlus,
  IconWand,
  IconChartDots,
  IconShoppingCart,
  IconPhoto,
  IconUpload,
  IconX,
  IconTrash,
  IconChevronRight,
  IconFileExport,
  IconDotsVertical,
  IconHelp,
  IconFileText,
  IconFileInvoice,
  IconUser,
  IconReport,
  IconBriefcase,
  IconGavel,
  IconPresentation,
  IconReceipt,
  IconCertificate,
  IconSearch,
  IconLock,
  IconEye,
} from '@tabler/icons-react';

import { Editor } from '@monaco-editor/react';
import IDE from './CodeEditor';
import Preview from './Preview';
import AddVariable from '@/modals/AddVariable/AddVariable';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { DEFAULT_FONT, fonts } from '@/constants/fonts';
import { RequestStatus } from '@/api/request-status.enum';
import { TemplateDTO, templateApi, MarketplaceTemplateCard } from '@/api/templateApi';
import notificationService from '@/services/NotificationService';
import { FormatType } from '../../../../utils/types';
import {
  CHART_TYPES,
  generateChartData,
  processChartData,
  replaceChartDataPlaceholders,
  extractChartBindingsFromTemplate,
  parseChartJsonFile,
  parseChartCsvWithPapa,
  parseChartExcelFile,
  isChartDataValidForType,
} from '../../../../utils/chartUtils';
import { DEFAULT_FORMAT } from '../../../../utils/paperUtils';
import { manuallyStartTour } from '../../../../utils/tourUtils';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import { REFERENCE_TEMPLATES } from '@/services/agent/templateLibrary';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';
import type { ReferenceTemplate } from '@/services/agent/types';
import 'driver.js/dist/driver.css';

function splitChartsFromVariables(raw: Record<string, any> | null | undefined): {
  rest: Record<string, any>;
  charts: Record<string, unknown>;
} {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { rest: {}, charts: {} };
  }
  const { charts, ...rest } = raw as Record<string, any> & { charts?: Record<string, unknown> };
  const chartMap =
    charts && typeof charts === 'object' && !Array.isArray(charts) ? { ...charts } : {};
  return { rest: { ...rest }, charts: chartMap };
}

const data = {
  fromCompany: {
    name: 'Example Corp',
    street: '123 Main St',
    city: 'Example City',
    country: 'Example Country',
    zip: '12345',
  },
  toCompany: {
    name: 'Client Corp',
    street: '456 Client St',
    city: 'Client City',
    country: 'Client Country',
    zip: '67890',
  },
  invoiceNumber: 'INV-12345',
  issueDate: '2024-06-10',
  dueDate: '2024-06-24',
  items: [
    { name: 'Service A', quantity: 10, taxes: 5, price: 100 },
    { name: 'Service B', quantity: 5, taxes: 2, price: 50 },
  ],
  prices: {
    subtotal: 150,
    discount: 10,
    taxes: 7,
    total: 147,
  },
  showTerms: true,
};

const CreateTemplate: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const editorRef = useRef<any>(null);
  /** Force Monaco remount after loading external HTML so model + editorRef stay in sync. */
  const [editorSessionKey, setEditorSessionKey] = useState(0);

  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);
  const [template, setTemplate] = useState<TemplateDTO | null>(null);
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATE);
  const [jsonContent, setJsonContent] = useState<string>(JSON.stringify(data, null, 2));
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [suggestedVariables, setSuggestedVariables] = useState<any>(null);
  const [addVariableOpened, { open: openAddVariable, close: closeAddVariable }] =
    useDisclosure(false);
  const [format, setFormat] = useState<FormatType>(DEFAULT_FORMAT);
  const [isLandScape, setIsLandScape] = useState<boolean>(false);
  const [fontsSelected, setFontsSelected] = useState([DEFAULT_FONT]);
  const [templateContent, setTemplateContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptDrawerOpened, { open: openPromptDrawer, close: closePromptDrawer }] =
    useDisclosure(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ url: string; fileName: string; fileId: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const openRef = useRef<() => void>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTourButton, setShowTourButton] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useLocalStorage('hasSeenTemplateEditorTour', false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateDrawerOpened, { open: openTemplateDrawer, close: closeTemplateDrawer }] =
    useDisclosure(false);
  const [templateTab, setTemplateTab] = useState<string>('default');
  const [templateSearch, setTemplateSearch] = useState('');
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplateCard[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceLoaded, setMarketplaceLoaded] = useState(false);

  const [chartDatasets, setChartDatasets] = useState<Record<string, unknown>>({});
  const [chartJsonModalOpened, { open: openChartJsonModal, close: closeChartJsonModal }] =
    useDisclosure(false);
  const [chartsHubOpened, { open: openChartsHub, close: closeChartsHub }] = useDisclosure(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [chartEditId, setChartEditId] = useState<string | null>(null);
  const [chartEditJson, setChartEditJson] = useState('');
  const chartFileInputRef = useRef<HTMLInputElement>(null);
  const chartImportTargetIdRef = useRef<string | null>(null);

  const mergedTemplateData = useMemo(
    () => ({ ...variables, charts: chartDatasets }),
    [variables, chartDatasets],
  );

  const fetchTemplate = async () => {
    try {
      setIsLoading(RequestStatus.InProgress);
      const fetchedTemplate = await templateApi.getTemplateById(params.id as string);
      setTemplate(fetchedTemplate);
      setCode(fetchedTemplate.content || DEFAULT_TEMPLATE);
      const { rest, charts } = splitChartsFromVariables(
        (fetchedTemplate.variables as Record<string, any>) || data,
      );
      setChartDatasets(charts);
      setVariables(rest);
      setJsonContent(JSON.stringify(rest, null, 2));
      setFontsSelected(fetchedTemplate.fonts || [DEFAULT_FONT]);
      setIsLoading(RequestStatus.Succeeded);
    } catch (error) {
      setIsLoading(RequestStatus.Failed);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    try {
      const parsedVariables = JSON.parse(jsonContent) as Record<string, any>;
      const { rest } = splitChartsFromVariables(parsedVariables);
      setVariables(rest);
    } catch (error) {
      // Silently handle JSON parsing errors
    }
  }, [jsonContent]);

  const handleVariablesUpdate = (newVariables: any) => {
    const { rest } = splitChartsFromVariables(newVariables || {});
    setVariables(rest);
    setJsonContent(JSON.stringify(rest, null, 2));
  };

  const handleTemplateSelect = (templateItem: ReferenceTemplate) => {
    // Charger le code HTML du template
    setCode(templateItem.code);
    setEditorSessionKey((k) => k + 1);

    // Extraire les variables Handlebars du code
    const extractedVars = extractVariablesFromTemplate(templateItem.code);

    // Générer les variables par défaut avec des valeurs réalistes
    const defaultVariables = buildVariableStructure(extractedVars, templateItem.code);
    const { rest, charts } = splitChartsFromVariables(defaultVariables);
    setChartDatasets(charts);
    handleVariablesUpdate(rest);
    setSelectedTemplateId(templateItem.id);
    closeTemplateDrawer();

    notificationService.showSuccessNotification(
      `Template "${templateItem.name}" loaded successfully`,
    );
  };

  const loadMarketplaceTemplates = async () => {
    if (marketplaceLoaded) return;
    setMarketplaceLoading(true);
    try {
      const results = await templateApi.getMarketplaceTemplates();
      setMarketplaceTemplates(results);
      setMarketplaceLoaded(true);
    } catch {
      // Silently handle
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleMarketplaceSelect = async (tpl: MarketplaceTemplateCard) => {
    try {
      const full = await templateApi.getMarketplaceTemplate(String(tpl.ID));
      setCode(full.content || DEFAULT_TEMPLATE);
      setEditorSessionKey((k) => k + 1);
      const extractedVars = extractVariablesFromTemplate(full.content || '');
      const defaultVariables = buildVariableStructure(extractedVars, full.content || '');
      const { rest, charts } = splitChartsFromVariables(defaultVariables);
      setChartDatasets(charts);
      handleVariablesUpdate(rest);
      setSelectedTemplateId(String(tpl.ID));
      closeTemplateDrawer();
      notificationService.showSuccessNotification(`Template "${tpl.name}" loaded successfully`);
    } catch {
      notificationService.showErrorNotification('Failed to load marketplace template');
    }
  };

  const mergeSuggestedVariables = () => {
    if (suggestedVariables) {
      const mergedPayload = { ...variables, ...suggestedVariables };
      const { rest, charts } = splitChartsFromVariables(mergedPayload);
      setChartDatasets((prev) => ({ ...prev, ...charts }));
      handleVariablesUpdate(rest);
      setSuggestedVariables(null);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/templates');
  };

  const addFont = () => {
    setFontsSelected([...fontsSelected, '--Select--your-font']);
  };

  const removeFont = (fontToRemove: string) => {
    setFontsSelected(fontsSelected.filter((f) => f !== fontToRemove));
  };

  const handleChangeFont = (selectedOption: { value: string }, index: number) => {
    const newFontsSelected = [...fontsSelected];
    newFontsSelected[index] = selectedOption.value;
    setFontsSelected(newFontsSelected);
  };

  const updateTemplate = async () => {
    try {
      await templateApi.updateTemplate(template?.ID as number, {
        ...template,
        content: code,
        variables: mergedTemplateData,
        fonts: fontsSelected,
      });
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error updating template');
    }
  };

  const [, drop] = useDrop({
    accept: 'VARIABLE',
    drop: (item: { varName: string; type: 'array' | 'object' | 'key-value' }) => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        };
        const id = { major: 1, minor: 1 }; // unique identifier for the op
        let text = '';

        switch (item.type) {
          case 'array': {
            const objectConcerned = variables[item.varName][0];
            const firstKeyName = Object.keys(objectConcerned)[0];
            text = `{{#each ${item.varName}}}\n\t{{this.${firstKeyName}}}\n{{/each}}`;
            break;
          }
          case 'object': {
            const firstKey = Object.keys(variables[item.varName])[0];
            text = `{{${item.varName}.${firstKey}}}`;
            break;
          }
          default: {
            text = `{{${item.varName}}}`;
            break;
          }
        }

        const op = { identifier: id, range, text, forceMoveMarkers: true };
        editorRef.current.executeEdits('my-source', [op]);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const uploadTemplate = (text: string): void => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template${Math.random()}.hbs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddVariable = (): void => {
    openAddVariable();
  };

  const handleDrop = (acceptedFiles: FileWithPath[]) => {
    // Limit to 5 files
    const newFiles = [...files, ...acceptedFiles].slice(0, 5);
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await response.json();
      if (uploadData.urls && Array.isArray(uploadData.urls) && uploadData.files) {
        setUploadedUrls(uploadData.urls);
        setUploadedFiles(
          uploadData.files.map((file: any) => ({
            url: file.url,
            fileName: file.fileName,
            fileId: file.public_id,
          })),
        );
        setFiles([]);
        notificationService.showSuccessNotification('Images uploaded successfully');
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    const fileToRemove = uploadedFiles[index];

    if (fileToRemove && fileToRemove.fileName && fileToRemove.fileId) {
      fetch('/api/delete-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: fileToRemove.fileName,
          fileId: fileToRemove.fileId,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result.success) {
            notificationService.showErrorNotification('Failed to delete image from Backblaze');
          }
        })
        .catch(() => {
          notificationService.showErrorNotification('Error deleting image from Backblaze');
        });
    }

    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    uploadedFiles.forEach((file) => {
      if (file && file.fileName && file.fileId) {
        fetch('/api/delete-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.fileName,
            fileId: file.fileId,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (!result.success) {
              notificationService.showErrorNotification('Failed to delete image from Backblaze');
            }
          })
          .catch(() => {
            notificationService.showErrorNotification('Error deleting image from Backblaze');
          });
      }
    });

    setUploadedUrls([]);
    setUploadedFiles([]);
  };

  const generateTemplateFromPrompt = async (): Promise<void> => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      // If we have uploaded images, use the generate-template-from-images endpoint
      if (uploadedUrls.length > 0) {
        const response = await fetch('/api/generate-template-from-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            imageUrls: uploadedUrls,
          }),
        });

        // Check if the response is ok before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Failed to generate template';

          try {
            // Try to parse the error as JSON
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.details || errorMessage;
          } catch (parseError) {
            // If parsing fails, use the raw text
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        if (responseData.content) {
          if (responseData.suggestedVariables) {
            const { rest, charts } = splitChartsFromVariables(responseData.suggestedVariables);
            setChartDatasets((prev) => ({ ...prev, ...charts }));
            handleVariablesUpdate(rest);
            setSuggestedVariables(responseData.suggestedVariables);
          }
          setCode(responseData.content);
          closePromptDrawer();
        }
      } else {
        // Otherwise use the regular generate-template endpoint
        const response = await fetch('/api/generate-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        // Check if the response is ok before trying to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Failed to generate template';

          try {
            // Try to parse the error as JSON
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.details || errorMessage;
          } catch (parseError) {
            // If parsing fails, use the raw text
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const generatedData = await response.json();
        if (generatedData.content) {
          if (generatedData.suggestedVariables) {
            const { rest, charts } = splitChartsFromVariables(generatedData.suggestedVariables);
            setChartDatasets((prev) => ({ ...prev, ...charts }));
            handleVariablesUpdate(rest);
            setSuggestedVariables(generatedData.suggestedVariables);
          }
          setCode(generatedData.content);
          closePromptDrawer();
        }
      }
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error generating template');
    } finally {
      setIsGenerating(false);
    }
  };

  const goToMarketplacePublishForm = (): void => {
    if (!template?.ID) return;
    router.push(`/marketplace/add?templateId=${template.ID}`);
  };

  const exportPdf = async (): Promise<void> => {
    try {
      if (!template) return;

      const { default: Handlebars } = await import('handlebars');
      await import('../../../../utils/handlebarsHelpers');

      const processedCode = processChartData(code);
      const compiledTemplate = Handlebars.compile(processedCode);
      let renderedContent = compiledTemplate(mergedTemplateData);
      renderedContent = replaceChartDataPlaceholders(renderedContent, mergedTemplateData);

      const exportId = String(template.uuid ?? template.ID);
      const blob = await templateApi.exportTemplate({
        templateId: exportId,
        format: 'pdf',
        variables: mergedTemplateData,
        paperSize: format,
        isLandscape: isLandScape,
        fonts: fontsSelected,
        renderedHtml: renderedContent,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(template.name || 'export').replace(/[^\w.-]+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notificationService.showSuccessNotification('PDF exporté');
    } catch (error) {
      notificationService.showErrorNotification(
        'Failed to prepare document for export. Please try again.',
      );
    }
  };

  const openChartJsonEditor = (chartId: string) => {
    setChartEditId(chartId);
    setChartEditJson(JSON.stringify(chartDatasets[chartId] ?? {}, null, 2));
    closeChartsHub();
    openChartJsonModal();
  };

  const applyChartJsonEdit = () => {
    if (!chartEditId) return;
    try {
      const parsed = parseChartJsonFile(chartEditJson) as unknown;
      setChartDatasets((prev) => ({ ...prev, [chartEditId]: parsed }));
      closeChartJsonModal();
      notificationService.showSuccessNotification('Données du graphique mises à jour');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'JSON invalide';
      notificationService.showErrorNotification(msg);
    }
  };

  const beginChartFileImport = (chartId: string) => {
    chartImportTargetIdRef.current = chartId;
    closeChartsHub();
    chartFileInputRef.current?.click();
  };

  const onChartFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chartId = chartImportTargetIdRef.current;
    const file = e.target.files?.[0];
    e.target.value = '';
    chartImportTargetIdRef.current = null;
    if (!chartId || !file) return;
    try {
      const lower = file.name.toLowerCase();
      let payload: unknown;
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
        const buf = await file.arrayBuffer();
        payload = parseChartExcelFile(buf);
      } else if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
        const text = await file.text();
        payload = parseChartCsvWithPapa(text);
      } else {
        const text = await file.text();
        payload = parseChartJsonFile(text);
      }
      setChartDatasets((prev) => ({ ...prev, [chartId]: payload }));
      notificationService.showSuccessNotification('Données du graphique importées');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Import impossible';
      notificationService.showErrorNotification(msg);
    }
  };

  // Initialize the tour when the component mounts
  useEffect(() => {
    // Only start the tour after the template has loaded
    if (isLoading === RequestStatus.Succeeded) {
      // Use setTimeout to ensure the DOM is fully rendered
      const tourTimeout = setTimeout(() => {
        // Check if tour target elements exist
        const elements = [
          '#editor-container',
          '#preview-container',
          '#variables-section',
          '#paper-settings',
          '#fonts-section',
          '#charts-section',
          '#sidebar-export-button',
          '#ai-generate-button',
          '#action-icon',
          '#save-button',
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
            });
          }
        } catch (error) {
          // Silently handle tour errors
        }

        setShowTourButton(true);
      }, 1500); // Increased timeout to ensure DOM is fully rendered

      return () => clearTimeout(tourTimeout);
    }
    return undefined;
  }, [isLoading, hasSeenTour, setHasSeenTour]);

  return (
    <Stack style={{ overflow: 'hidden' }} gap={0}>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/driver.js@1.3.5/dist/driver.css"
        />
      </Head>
      {/* Manage variable */}
      <AddVariable
        opened={addVariableOpened}
        onClose={closeAddVariable}
        jsonContent={jsonContent}
        setJsonContent={setJsonContent}
      />

      {/* AI Prompt Drawer */}
      <Drawer
        opened={promptDrawerOpened}
        onClose={closePromptDrawer}
        title="Generate Template with AI"
        position="right"
        size="lg"
        styles={{
          header: {
            backgroundColor: '#1A1B1E',
            color: 'white',
            padding: '1rem',
            borderBottom: '1px solid #373A40',
          },
          content: {
            backgroundColor: '#1A1B1E',
            color: 'white',
          },
          close: {
            color: 'white',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        <Stack gap="xl" p="xl">
          <Text size="sm" c="dimmed">
            Describe your template and the AI will generate it along with suggested variables. You
            can also upload images to help the AI understand your design requirements.
          </Text>

          {/* Image Upload Section */}
          {uploadedUrls.length > 0 ? (
            <Box>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  Uploaded Images
                </Text>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  leftSection={<IconTrash size={14} />}
                  onClick={clearImages}
                >
                  Clear All
                </Button>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                {uploadedUrls.map((url, index) => (
                  <Box key={index} pos="relative">
                    <ActionIcon
                      color="red"
                      variant="filled"
                      radius="xl"
                      size="sm"
                      style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                      onClick={() => removeUploadedImage(index)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                    <Image
                      src={url}
                      height={120}
                      fit="cover"
                      radius="md"
                      style={{ border: '1px solid #373A40' }}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          ) : (
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Upload Images (Optional)
              </Text>
              <Dropzone
                onDrop={handleDrop}
                accept={['image/png', 'image/jpeg', 'image/gif', 'image/webp']}
                maxSize={5 * 1024 * 1024}
                maxFiles={5}
                openRef={openRef}
                styles={{
                  root: {
                    borderColor: '#373A40',
                    backgroundColor: '#25262B',
                    '&:hover': {
                      borderColor: '#3B82F6',
                    },
                  },
                }}
              >
                <Group justify="center" gap="xl" style={{ minHeight: 100, pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={40} stroke={1.5} color="#3B82F6" />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={40} stroke={1.5} color="#ff0000" />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={40} stroke={1.5} color="#909296" />
                  </Dropzone.Idle>

                  <Stack gap="xs" style={{ textAlign: 'center' }}>
                    <Text size="sm" inline c="white">
                      Drag images here or click to select files
                    </Text>
                    <Text size="xs" c="dimmed" inline>
                      Upload up to 5 images, each file should not exceed 5MB
                    </Text>
                  </Stack>
                </Group>
              </Dropzone>

              {files.length > 0 && (
                <Box mt="md">
                  <Text size="sm" fw={500} mb="xs">
                    Selected Images
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                    {files.map((file, index) => (
                      <Box key={index} pos="relative">
                        <ActionIcon
                          color="red"
                          variant="filled"
                          radius="xl"
                          size="sm"
                          style={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}
                          onClick={() => removeFile(index)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                        <Image
                          src={URL.createObjectURL(file)}
                          height={120}
                          fit="cover"
                          radius="md"
                          style={{ border: '1px solid #373A40' }}
                          onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>

                  <Group justify="flex-end" mt="md">
                    <Button variant="subtle" color="gray" onClick={() => setFiles([])}>
                      Clear
                    </Button>
                    <Button
                      onClick={uploadFiles}
                      loading={isUploading}
                      leftSection={<IconUpload size={16} />}
                      color="blue"
                    >
                      Upload
                    </Button>
                  </Group>
                </Box>
              )}
            </Box>
          )}

          <Textarea
            label="Template Description"
            description="Be specific about the layout, sections, and design elements you want"
            placeholder="Create a modern invoice template with a clean header, company details section, itemized table with calculations, and a professional footer..."
            minRows={4}
            autosize
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            styles={{
              root: {
                '& label': {
                  color: 'white',
                  marginBottom: '0.5rem',
                },
                '& .mantine-Textarea-description': {
                  color: '#909296',
                },
              },
              input: {
                backgroundColor: '#25262B',
                color: 'white',
                border: '1px solid #373A40',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: '#3B82F6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                },
              },
            }}
          />

          <Button
            onClick={generateTemplateFromPrompt}
            loading={isGenerating}
            loaderProps={{ type: 'dots' }}
            disabled={!prompt}
            leftSection={<IconWand size={16} />}
            variant="filled"
            color="blue"
            fullWidth
            styles={{
              root: {
                height: '2.75rem',
                transition: 'all 0.2s ease',
                '&:not(:disabled):hover': {
                  transform: 'translateY(-1px)',
                },
              },
            }}
          >
            Generate Template
          </Button>

          {suggestedVariables && (
            <Box
              style={{
                backgroundColor: '#25262B',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #373A40',
              }}
            >
              <Text size="sm" fw={500} c="white" mb="md">
                Suggested Variables
              </Text>
              <Text size="xs" c="dimmed" mb="md">
                The AI has generated a set of variables with realistic sample data. You can review
                and modify them in the variables panel.
              </Text>
              <Button
                onClick={mergeSuggestedVariables}
                variant="light"
                color="blue"
                fullWidth
                styles={{
                  root: {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  },
                }}
              >
                Use Suggested Variables
              </Button>
            </Box>
          )}
        </Stack>
      </Drawer>

      {/* Template Selection Drawer */}
      <Drawer
        opened={templateDrawerOpened}
        onClose={closeTemplateDrawer}
        title="Choisir un modèle"
        position="right"
        size="lg"
        styles={{
          header: {
            backgroundColor: '#1A1B1E',
            color: 'white',
            padding: '1rem',
            borderBottom: '1px solid #373A40',
          },
          content: {
            backgroundColor: '#1A1B1E',
            color: 'white',
          },
          close: { color: 'white' },
        }}
      >
        <Box px="md" pt="md" pb="xs">
          <TextInput
            placeholder="Rechercher un modèle..."
            leftSection={<IconSearch size={14} />}
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.currentTarget.value)}
            styles={{
              input: { backgroundColor: '#25262B', borderColor: '#373A40', color: 'white' },
            }}
            mb="sm"
          />
          <Tabs
            value={templateTab}
            onChange={(v) => {
              setTemplateTab(v || 'default');
              if (v === 'marketplace') loadMarketplaceTemplates();
            }}
            styles={{
              tab: { color: '#909296' },
              list: { borderColor: '#373A40' },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="default">Défaut ({REFERENCE_TEMPLATES.length})</Tabs.Tab>
              <Tabs.Tab value="marketplace">Marketplace</Tabs.Tab>
            </Tabs.List>

            {/* ─── Default tab ─────────────────────────── */}
            <Tabs.Panel value="default">
              <ScrollArea h="calc(100vh - 200px)" mt="md">
                {(() => {
                  const q = templateSearch.toLowerCase();
                  const filtered = q
                    ? REFERENCE_TEMPLATES.filter((t) => t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q))
                    : REFERENCE_TEMPLATES;

                  const groups: Record<string, typeof filtered> = {};
                  filtered.forEach((t) => {
                    if (!groups[t.type]) groups[t.type] = [];
                    groups[t.type].push(t);
                  });

                  const typeLabel: Record<string, string> = {
                    invoice: 'Factures',
                    resume: 'CV',
                    report: 'Rapports',
                    other: 'Autres documents',
                  };
                  const typeColor: Record<string, string> = {
                    invoice: 'blue',
                    resume: 'green',
                    report: 'violet',
                    other: 'gray',
                  };

                  if (filtered.length === 0) {
                    return (
                      <Center h={200}>
                        <Text c="dimmed" size="sm">Aucun modèle trouvé</Text>
                      </Center>
                    );
                  }

                  return (
                    <Stack gap="xl">
                      {Object.entries(groups).map(([type, items]) => (
                        <Box key={type}>
                          <Group mb="sm">
                            <Text size="sm" fw={600} c="white">{typeLabel[type] || type}</Text>
                            <Badge size="sm" color={typeColor[type] || 'gray'}>{items.length}</Badge>
                          </Group>
                          <SimpleGrid cols={2} spacing="sm">
                            {items.map((templateItem) => (
                              <Card
                                key={templateItem.id}
                                padding="sm"
                                radius="md"
                                withBorder
                                styles={{
                                  root: {
                                    borderColor: selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                    backgroundColor: '#25262B',
                                    cursor: 'pointer',
                                  },
                                }}
                                onClick={() => handleTemplateSelect(templateItem)}
                              >
                                <Group justify="space-between" wrap="nowrap">
                                  <Text size="sm" fw={500} c="white" lineClamp={1} style={{ flex: 1 }}>
                                    {templateItem.name}
                                  </Text>
                                  {selectedTemplateId === templateItem.id && (
                                    <Badge size="xs" color="blue">✓</Badge>
                                  )}
                                </Group>
                                <Text size="xs" c="dimmed" mt={4}>
                                  {templateItem.metadata.style} · {templateItem.metadata.complexity}
                                </Text>
                              </Card>
                            ))}
                          </SimpleGrid>
                        </Box>
                      ))}
                    </Stack>
                  );
                })()}
              </ScrollArea>
            </Tabs.Panel>

            {/* ─── Marketplace tab ─────────────────────── */}
            <Tabs.Panel value="marketplace">
              <ScrollArea h="calc(100vh - 200px)" mt="md">
                {marketplaceLoading ? (
                  <Center h={200}><Loader color="blue" /></Center>
                ) : (() => {
                  const q = templateSearch.toLowerCase();
                  const filtered = q
                    ? marketplaceTemplates.filter(
                        (t) =>
                          t.name?.toLowerCase().includes(q) ||
                          t.category?.toLowerCase().includes(q) ||
                          (t.description && t.description.toLowerCase().includes(q)),
                      )
                    : marketplaceTemplates;

                  if (!marketplaceLoaded) {
                    return (
                      <Center h={200}>
                        <Text c="dimmed" size="sm">Ouvrez l'onglet pour charger les modèles</Text>
                      </Center>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <Center h={200}>
                        <Text c="dimmed" size="sm">
                          {q ? 'Aucun modèle trouvé' : 'Aucun modèle disponible sur le Marketplace'}
                        </Text>
                      </Center>
                    );
                  }

                  return (
                    <Stack gap="xs" maw={300} mx="auto">
                      {filtered.map((tpl) => {
                        const isFree = !tpl.price || tpl.price === 0;
                        const cover = tpl.cover_image_url?.trim();
                        return (
                          <Card
                            key={tpl.ID}
                            padding={0}
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor: selectedTemplateId === String(tpl.ID) ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: isFree ? 'pointer' : 'default',
                                opacity: isFree ? 1 : 0.7,
                                overflow: 'hidden',
                                maxWidth: '100%',
                              },
                            }}
                            onClick={() => isFree && handleMarketplaceSelect(tpl)}
                          >
                            <Box
                              pos="relative"
                              h={56}
                              style={{ overflow: 'hidden' }}
                            >
                              {cover ? (
                                <>
                                  <Image
                                    src={cover}
                                    alt={tpl.name || 'Cover'}
                                    h={56}
                                    w="100%"
                                    fit="cover"
                                    fallbackSrc="https://placehold.co/400x200?text=Template"
                                  />
                                  <ActionIcon
                                    size="sm"
                                    variant="filled"
                                    color="dark"
                                    radius="md"
                                    aria-label="Aperçu de la couverture"
                                    style={{
                                      position: 'absolute',
                                      bottom: 6,
                                      right: 6,
                                      boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                                    }}
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      setCoverPreviewUrl(cover);
                                    }}
                                  >
                                    <IconEye size={16} />
                                  </ActionIcon>
                                </>
                              ) : (
                                <Box
                                  h="100%"
                                  style={{
                                    background: 'linear-gradient(135deg, #373A40 0%, #1A1B1E 100%)',
                                  }}
                                />
                              )}
                            </Box>
                            <Box p="xs">
                              <Group justify="space-between" wrap="nowrap" gap={6} mb={4}>
                                <Text size="xs" fw={600} c="white" lineClamp={1} style={{ flex: 1 }}>
                                  {tpl.name}
                                </Text>
                                {isFree ? (
                                  <Badge size="xs" color="green">Gratuit</Badge>
                                ) : (
                                  <Badge size="xs" color="orange" leftSection={<IconLock size={10} />}>
                                    {tpl.price}€
                                  </Badge>
                                )}
                              </Group>
                              {tpl.description?.trim() ? (
                                <Text size="xs" c="dimmed" lineClamp={2} mb={4}>
                                  {tpl.description.trim()}
                                </Text>
                              ) : null}
                              {tpl.category && (
                                <Text size="xs" c="dimmed">{tpl.category}</Text>
                              )}
                            </Box>
                          </Card>
                        );
                      })}
                    </Stack>
                  );
                })()}
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Drawer>

      <input
        ref={chartFileInputRef}
        type="file"
        accept=".json,.csv,.txt,.xlsx,.xls,application/json,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        style={{ display: 'none' }}
        onChange={onChartFileSelected}
      />

      <Modal
        opened={coverPreviewUrl != null}
        onClose={() => setCoverPreviewUrl(null)}
        title="Aperçu"
        fullScreen
        styles={{
          body: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0d0d0f',
            minHeight: '70vh',
          },
        }}
      >
        {coverPreviewUrl ? (
          <Image
            src={coverPreviewUrl}
            alt="Couverture"
            maw="100%"
            mah="calc(100vh - 80px)"
            w="auto"
            h="auto"
            fit="contain"
            style={{ objectFit: 'contain' }}
          />
        ) : null}
      </Modal>

      <Modal
        opened={chartsHubOpened}
        onClose={closeChartsHub}
        title="Données des graphiques"
        size="md"
        centered
      >
        <ScrollArea mah={480}>
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              CSV / Excel (1re feuille) : 1re colonne = libellés, colonnes suivantes = séries numériques.
              Scatter / bubble : JSON Chart.js recommandé.
            </Text>
            {extractChartBindingsFromTemplate(code).map(({ chartId, chartType }) => {
              const raw = chartDatasets[chartId];
              const hasData = raw != null;
              const valid =
                hasData && isChartDataValidForType(raw, chartType ?? null);
              let statusLabel = 'Manquant';
              let statusColor: 'teal' | 'orange' | 'red' = 'orange';
              if (hasData && valid) {
                statusLabel = 'OK';
                statusColor = 'teal';
              } else if (hasData && !valid) {
                statusLabel = 'Invalide';
                statusColor = 'red';
              }
              return (
                <Box
                  key={chartId}
                  p="xs"
                  style={{
                    border: '1px solid #373A40',
                    borderRadius: 8,
                    background: '#25262B',
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" gap={6}>
                    <Text size="xs" c="white" lineClamp={1} style={{ flex: 1 }}>
                      {chartId}
                      {chartType ? ` · ${chartType}` : ''}
                    </Text>
                    <Badge size="xs" color={statusColor}>
                      {statusLabel}
                    </Badge>
                  </Group>
                  <Group gap={6} mt={8}>
                    <Button size="xs" variant="light" onClick={() => openChartJsonEditor(chartId)}>
                      Modifier JSON
                    </Button>
                    <Button size="xs" variant="default" onClick={() => beginChartFileImport(chartId)}>
                      Importer fichier
                    </Button>
                  </Group>
                </Box>
              );
            })}
          </Stack>
        </ScrollArea>
      </Modal>

      <Modal
        opened={chartJsonModalOpened}
        onClose={closeChartJsonModal}
        title={chartEditId ? `Données Chart.js — ${chartEditId}` : 'Données graphique'}
        size="90%"
        centered
        styles={{
          content: { maxWidth: 1120 },
          body: { maxHeight: 'calc(100vh - 100px)' },
        }}
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Objet au format Chart.js : propriétés <code>labels</code> (sauf scatter/bubble) et{' '}
            <code>datasets</code> non vide.
          </Text>
          <Box
            style={{
              border: '1px solid #373A40',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Editor
              key={chartEditId ?? 'chart-json'}
              height="clamp(380px, 62vh, 720px)"
              language="json"
              theme="vs-dark"
              value={chartEditJson}
              onChange={(v) => setChartEditJson(v ?? '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontSize: 13,
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </Box>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeChartJsonModal}>
              Annuler
            </Button>
            <Button onClick={applyChartJsonEdit}>Appliquer</Button>
          </Group>
        </Stack>
      </Modal>

      {/* NavBar */}
      <Group
        h={rem(60)}
        px="xl"
        bg="#1A1B1E"
        justify="space-between"
        style={{ borderBottom: '1px solid #373A40' }}
      >
        <Group gap="md">
          <Button
            onClick={handleBack}
            leftSection={<IconChevronLeft size={16} />}
            variant="subtle"
            color="gray"
            styles={{
              root: {
                color: '#909296',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#25262B',
                  transform: 'translateX(-2px)',
                },
              },
            }}
          >
            Return to dashboard
          </Button>
          <Text c="dimmed" span>
            /
          </Text>
          <Text c="white" style={{ fontWeight: 500 }}>
            {template?.name || 'Report_template'}
          </Text>
        </Group>

        <Group gap="md">
          {showTourButton && (
            <Tooltip label="Show guided tour">
              <Button
                onClick={() => {
                  manuallyStartTour(() => {
                    setHasSeenTour(true);
                  });
                }}
                leftSection={<IconHelp size={16} />}
                variant="subtle"
                color="blue"
                styles={{
                  root: {
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-1px)' },
                  },
                }}
              >
                Help Tour
              </Button>
            </Tooltip>
          )}

          <Tooltip label="Choose a template model">
            <Button
              id="models-button"
              onClick={openTemplateDrawer}
              leftSection={<IconFileText size={16} />}
              variant="light"
              color="purple"
              styles={{
                root: {
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                },
              }}
            >
              Models
            </Button>
          </Tooltip>
          <Tooltip label="Generate with AI">
            <Button
              id="ai-generate-button"
              onClick={openPromptDrawer}
              leftSection={<IconWand size={16} />}
              variant="light"
              color="blue"
              styles={{
                root: {
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                },
              }}
            >
              AI Generate
            </Button>
          </Tooltip>

          {/* Actions Menu */}
          <Box id="action-icon">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  variant="light"
                  color="gray"
                  leftSection={<IconDotsVertical size={16} />}
                  styles={{
                    root: {
                      transition: 'all 0.2s ease',
                      '&:hover': { transform: 'translateY(-1px)' },
                    },
                  }}
                >
                  Actions
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Document</Menu.Label>
                <Menu.Item
                  leftSection={<IconDownload size={16} />}
                  onClick={() => uploadTemplate(templateContent)}
                >
                  Download Template
                </Menu.Item>

                <Menu.Label>Export PDF</Menu.Label>
                <Menu.Item leftSection={<IconFileExport size={16} />} onClick={exportPdf}>
                  Export as {format.toUpperCase()} PDF
                </Menu.Item>

                <Divider />

                <Menu.Label>Marketplace</Menu.Label>
                <Menu.Item
                  leftSection={<IconShoppingCart size={16} />}
                  onClick={goToMarketplacePublishForm}
                >
                  Publish to Marketplace
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>

          <Button
            id="save-button"
            onClick={updateTemplate}
            variant="filled"
            color="blue"
            styles={{
              root: {
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)' },
              },
            }}
          >
            Save
          </Button>
        </Group>
      </Group>

      {/* Main Content */}
      {isLoading === RequestStatus.InProgress ? (
        <Center h="calc(100vh - 60px)" w="100%">
          <Loader size="lg" color="blue" />
        </Center>
      ) : (
        <Group gap={0} style={{ height: 'calc(100vh - 60px)', flexWrap: 'nowrap' }}>
          {/* Sidebar */}
          <Stack
            component={ScrollArea}
            w={sidebarCollapsed ? '40px' : '22%'}
            p={sidebarCollapsed ? 'xs' : 'xl'}
            h="100%"
            bg="#1A1B1E"
            style={{
              borderRight: '1px solid #373A40',
              transition: 'width 0.3s ease, padding 0.3s ease',
              overflow: 'hidden',
              flexShrink: 0,
            }}
            gap="xl"
          >
            {sidebarCollapsed ? (
              <Center>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => setSidebarCollapsed(false)}
                  style={{
                    marginTop: '10px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconChevronRight size={20} />
                </ActionIcon>
              </Center>
            ) : (
              <>
                <Group justify="space-between">
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Template settings
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => setSidebarCollapsed(true)}
                    style={{
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <IconChevronLeft size={16} />
                  </ActionIcon>
                </Group>

                {/* Paper size and orientation */}
                <Group id="paper-settings" align="center" mb="lg">
                  <Select
                    size="sm"
                    label="Paper Size"
                    w={120}
                    onChange={(_, selectedFormat) => {
                      const formatValue = (selectedFormat.value as FormatType) || DEFAULT_FORMAT;
                      setFormat(formatValue);
                    }}
                    defaultValue={DEFAULT_FORMAT}
                    data={[
                      { label: 'A1', value: 'a1' },
                      { label: 'A2', value: 'a2' },
                      { label: 'A3', value: 'a3' },
                      { label: 'A4', value: 'a4' },
                      { label: 'A5', value: 'a5' },
                      { label: 'A6', value: 'a6' },
                    ]}
                    styles={{
                      root: { marginBottom: 0 },
                      input: {
                        backgroundColor: '#25262B',
                        border: '1px solid #373A40',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#3B82F6',
                        },
                      },
                      label: {
                        color: '#909296',
                        fontSize: '0.75rem',
                        marginBottom: '0.25rem',
                      },
                      dropdown: {
                        backgroundColor: '#25262B',
                        border: '1px solid #373A40',
                      },
                      option: {
                        '&[data-selected]': {
                          '&, &:hover': {
                            backgroundColor: '#3B82F6',
                            color: 'white',
                          },
                        },
                      },
                    }}
                  />
                  <Checkbox
                    checked={isLandScape}
                    onChange={(event) => setIsLandScape(event.currentTarget.checked)}
                    label="Landscape"
                    styles={{
                      label: {
                        color: '#909296',
                      },
                    }}
                  />
                </Group>

                {/* Export format */}
                <Box>
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Export Settings
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    PDF export will use the paper size and orientation selected above.
                  </Text>
                  <Button
                    id="sidebar-export-button"
                    fullWidth
                    leftSection={<IconFileExport size={16} />}
                    onClick={exportPdf}
                    variant="light"
                    color="blue"
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-1px)' },
                      },
                    }}
                    mb="md"
                  >
                    Export as {format.toUpperCase()} PDF
                  </Button>
                </Box>

                {/* Start from Template section */}
                <Box>
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Templates
                  </Text>
                  <Text size="xs" c="dimmed" mb="md">
                    Start from a pre-built template
                  </Text>
                  <Button
                    fullWidth
                    leftSection={<IconFileText size={16} />}
                    onClick={openTemplateDrawer}
                    variant="light"
                    color="purple"
                    styles={{
                      root: {
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-1px)' },
                      },
                    }}
                    mb="md"
                  >
                    Start from Template
                  </Button>
                  {selectedTemplateId && (
                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                      Template selected
                    </Text>
                  )}
                </Box>

                {/* Variables section */}
                <Box id="variables-section">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={600} c="white" fs="uppercase">
                      Variables
                    </Text>
                    <Tooltip label="Add variables">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={handleAddVariable}
                        style={{
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Text size="xs" c="dimmed" mb="md">
                    How to use variables?
                  </Text>

                  {/* Variables list */}
                  <Box
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      padding: '0.5rem',
                      backgroundColor: '#25262B',
                      borderRadius: '8px',
                    }}
                  >
                    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                      {Object.entries(variables).map(([varName, value]) => {
                        let type = 'object';
                        if (Array.isArray(value)) {
                          type = 'array';
                        } else if (typeof value === 'object' && value !== null) {
                          type = 'object';
                        } else {
                          type = 'key-value';
                        }
                        return <VariableBadge key={varName} varName={varName} type={type} />;
                      })}
                    </Group>
                  </Box>
                </Box>

                {/* Stylesheet section */}
                <Box>
                  <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                    Stylesheet
                  </Text>
                  <Select
                    value="tailwind"
                    data={[{ value: 'tailwind', label: 'Tailwind CSS' }]}
                    styles={{
                      input: {
                        backgroundColor: '#25262B',
                        border: '1px solid #373A40',
                        color: 'white',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#3B82F6',
                        },
                      },
                      dropdown: {
                        backgroundColor: '#25262B',
                        border: '1px solid #373A40',
                      },
                      option: {
                        '&[data-selected]': {
                          '&, &:hover': {
                            backgroundColor: '#3B82F6',
                            color: 'white',
                          },
                        },
                      },
                    }}
                  />
                </Box>

                {/* Fonts section */}
                <Box id="fonts-section">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={600} c="white" fs="uppercase">
                      Fonts
                    </Text>
                    <Tooltip label="Add font">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={addFont}
                        style={{
                          transition: 'all 0.2s ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Stack gap="xs">
                    {fontsSelected.map((font, index) => (
                      <Group key={font} align="center">
                        <Select
                          size="sm"
                          value={font}
                          onChange={(value) => handleChangeFont({ value: value || '' }, index)}
                          data={fonts}
                          style={{ flex: 1 }}
                          styles={{
                            input: {
                              backgroundColor: '#25262B',
                              border: '1px solid #373A40',
                              color: 'white',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#3B82F6',
                              },
                            },
                            dropdown: {
                              backgroundColor: '#25262B',
                              border: '1px solid #373A40',
                            },
                            option: {
                              '&[data-selected]': {
                                '&, &:hover': {
                                  backgroundColor: '#3B82F6',
                                  color: 'white',
                                },
                              },
                            },
                          }}
                        />
                        {index !== 0 && (
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => removeFont(font)}
                            style={{
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'scale(1.1)' },
                            }}
                          >
                            <IconMinus size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    ))}
                  </Stack>
                </Box>

                {/* Charts section */}
                <Stack id="charts-section" gap="sm" mah={520} style={{ overflow: 'auto' }}>
                  <Box p="xs">
                    <Text size="sm" fw={600} c="white" mb="xs" tt="uppercase">
                      Graphiques
                    </Text>
                    <Text size="xs" c="dimmed" mb="sm">
                      Ajoutez un type ci-dessous. Les données sont séparées du JSON « variables » (panneau
                      ci-dessous).
                    </Text>
                    {(() => {
                      const bindings = extractChartBindingsFromTemplate(code);
                      if (bindings.length === 0) return null;
                      return (
                        <Button
                          fullWidth
                          size="xs"
                          variant="light"
                          leftSection={<IconChartDots size={14} />}
                          onClick={openChartsHub}
                          mb="md"
                        >
                          Gérer les données des graphiques ({bindings.length})
                        </Button>
                      );
                    })()}
                    <SimpleGrid cols={2} spacing="xs">
                      {Object.entries(CHART_TYPES).map(([type, label]) => (
                        <Box
                          key={type}
                          onClick={() => {
                              const editor = editorRef.current;
                              if (!editor) {
                                notificationService.showErrorNotification(
                                  'Éditeur non prêt — réessayez dans une seconde.',
                                );
                                return;
                              }
                              const model = editor.getModel();
                              if (!model) {
                                notificationService.showErrorNotification('Modèle éditeur introuvable.');
                                return;
                              }

                              const lastLine = model.getLineCount();
                              const lastLineContent = model.getLineContent(lastLine);
                              const chartId = `${type}Chart${Math.random().toString(36).substr(2, 9)}`;
                              const chartData = generateChartData(type as keyof typeof CHART_TYPES);

                              setChartDatasets((prev) => ({
                                ...prev,
                                [chartId]: chartData,
                              }));

                              const text = `\n\n<!-- Chart Section -->
<div class="w-full py-4" style="display:flex;justify-content:center;align-items:center;">
  <canvas
    id="${chartId}"
    data-chart-type="${type}"
    data-chart-data='{{charts.${chartId}}}'
    style="display:block;margin:0 auto;max-width:min(100%,42rem);width:100%;height:auto;"
  ></canvas>
</div>`;

                              const position = {
                                lineNumber: lastLine,
                                column: lastLineContent.length + 1,
                              };

                              const range = {
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                              };

                              const op = {
                                identifier: { major: 1, minor: 1 },
                                range,
                                text,
                                forceMoveMarkers: true,
                              };

                              editor.executeEdits('chart-insert', [op]);
                          }}
                          style={{
                            backgroundColor: '#25262B',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: '1px solid #373A40',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Stack gap={4} align="center">
                            <IconChartDots size={24} style={{ color: '#3B82F6' }} />
                            <Text size="xs" c="white" ta="center">
                              {label}
                            </Text>
                          </Stack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Stack>
              </>
            )}
          </Stack>

          {/* Code editor */}
          <Box
            id="editor-container"
            style={{
              width: sidebarCollapsed ? 'calc(61% - 20px)' : '46%',
              height: '100%',
              transition: 'width 0.3s ease',
              flexShrink: 0,
              flexGrow: 0,
            }}
            ref={drop}
          >
            <DndProvider backend={HTML5Backend}>
              <IDE
                key={editorSessionKey}
                onChange={(newCode) => {
                  setCode(newCode);
                  setTemplateContent(newCode);
                }}
                defaultValue={code}
                editorDidMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </DndProvider>
          </Box>

          {/* Preview */}
          <Box
            id="preview-container"
            style={{
              width: sidebarCollapsed ? 'calc(39% - 20px)' : '30%',
              height: '100%',
              backgroundColor: '#1A1B1E',
              borderLeft: '1px solid #373A40',
              position: 'relative',
              transition: 'width 0.3s ease',
              flexShrink: 0,
              flexGrow: 0,
            }}
          >
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'auto',
                padding: '1rem',
              }}
            >
              <Preview
                format={format}
                htmlContent={code}
                data={mergedTemplateData}
                isLandscape={isLandScape}
                fonts={fontsSelected}
                setTemplateContent={setTemplateContent}
              />
            </Box>
          </Box>
        </Group>
      )}
    </Stack>
  );
};

export default CreateTemplate;
