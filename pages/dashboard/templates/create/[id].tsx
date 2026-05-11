import React, { useEffect, useState, useRef } from 'react';
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
} from '@tabler/icons-react';

import { useMonaco } from '@monaco-editor/react';
import IDE from './CodeEditor';
import Preview from './Preview';
import AddVariable from '@/modals/AddVariable/AddVariable';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { DEFAULT_FONT, fonts } from '@/constants/fonts';
import { RequestStatus } from '@/api/request-status.enum';
import { TemplateDTO, templateApi } from '@/api/templateApi';
import notificationService from '@/services/NotificationService';
import { FormatType } from '../../../../utils/types';
import {
  CHART_TYPES,
  generateChartData,
  processChartData,
  replaceChartDataPlaceholders,
} from '../../../../utils/chartUtils';
import { exportPdfDocument } from '../../../../utils/pdfUtils';
import { DEFAULT_FORMAT, getPageDimensions } from '../../../../utils/paperUtils';
import { manuallyStartTour } from '../../../../utils/tourUtils';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import { REFERENCE_TEMPLATES } from '@/services/agent/templateLibrary';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';
import type { ReferenceTemplate } from '@/services/agent/types';
import 'driver.js/dist/driver.css';

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
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

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
  const [isPublishing, setIsPublishing] = useState(false);
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

  const fetchTemplate = async () => {
    try {
      setIsLoading(RequestStatus.InProgress);
      const fetchedTemplate = await templateApi.getTemplateById(params.id as string);
      setTemplate(fetchedTemplate);
      setCode(fetchedTemplate.content || DEFAULT_TEMPLATE);
      setJsonContent(JSON.stringify(fetchedTemplate.variables || data, null, 2));
      setVariables(fetchedTemplate.variables || data);
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
      const parsedVariables = JSON.parse(jsonContent);
      setVariables(parsedVariables);
    } catch (error) {
      // Silently handle JSON parsing errors
    }
  }, [jsonContent]);

  const handleVariablesUpdate = (newVariables: any) => {
    setVariables(newVariables);
    setJsonContent(JSON.stringify(newVariables, null, 2));
  };

  const handleTemplateSelect = (templateItem: ReferenceTemplate) => {
    // Charger le code HTML du template
    setCode(templateItem.code);

    // Extraire les variables Handlebars du code
    const extractedVars = extractVariablesFromTemplate(templateItem.code);

    // Générer les variables par défaut avec des valeurs réalistes
    const defaultVariables = buildVariableStructure(extractedVars, templateItem.code);

    // Mettre à jour les variables
    handleVariablesUpdate(defaultVariables);
    setSelectedTemplateId(templateItem.id);
    closeTemplateDrawer();

    notificationService.showSuccessNotification(
      `Template "${templateItem.name}" loaded successfully`,
    );
  };

  const mergeSuggestedVariables = () => {
    if (suggestedVariables) {
      const mergedVariables = { ...variables, ...suggestedVariables };
      handleVariablesUpdate(mergedVariables);
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
        variables: JSON.parse(jsonContent),
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
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column,
        );
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
            handleVariablesUpdate(responseData.suggestedVariables);
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
            handleVariablesUpdate(generatedData.suggestedVariables);
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

  const publishToMarketplace = async (): Promise<void> => {
    try {
      setIsPublishing(true);
      await templateApi.publishToMarketplace({
        templateId: Number(template?.ID),
        price: 499,
        description: template?.description || '',
        category: 'OTHER',
        features: [],
        coverImageURL: template?.preview || '',
      });
      notificationService.showSuccessNotification('Template published to marketplace successfully');
    } catch (error: any) {
      notificationService.showErrorNotification(
        error?.message || 'Error publishing to marketplace',
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const exportPdf = async (): Promise<void> => {
    try {
      if (!template) return;

      // Use Handlebars to render the template with variables
      const { default: Handlebars } = await import('handlebars');
      await import('../../../../utils/handlebarsHelpers');

      // Process the template to handle chart data
      const processedCode = processChartData(code);
      const compiledTemplate = Handlebars.compile(processedCode);
      let renderedContent = compiledTemplate(variables);

      // Replace chart data placeholders with actual data
      renderedContent = replaceChartDataPlaceholders(renderedContent, variables);

      // Get page dimensions based on format and orientation
      const { width: pageWidth, height: pageHeight } = getPageDimensions(format, isLandScape);

      // Call the extracted PDF export function
      await exportPdfDocument({
        template,
        format,
        isLandScape,
        pageWidth,
        pageHeight,
        fontsSelected,
        variables,
        renderedContent,
      });
    } catch (error) {
      notificationService.showErrorNotification(
        'Failed to prepare document for export. Please try again.',
      );
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
        title="Choose a Template"
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
        <ScrollArea h="calc(100vh - 80px)">
          <Stack gap="xl" p="xl">
            <Text size="sm" c="dimmed">
              Select a template to start with. The template code and default variables will be
              loaded automatically.
            </Text>

            {/* Helper function to get icon for template type */}
            {(() => {
              const getTypeIcon = (type: string) => {
                switch (type) {
                  case 'invoice':
                    return <IconFileInvoice size={20} />;
                  case 'resume':
                    return <IconUser size={20} />;
                  case 'report':
                    return <IconReport size={20} />;
                  default:
                    return <IconFileText size={20} />;
                }
              };

              const getTypeColor = (type: string) => {
                switch (type) {
                  case 'invoice':
                    return 'blue';
                  case 'resume':
                    return 'green';
                  case 'report':
                    return 'purple';
                  default:
                    return 'gray';
                }
              };

              const getTypeLabel = (type: string) => {
                switch (type) {
                  case 'invoice':
                    return 'Invoices';
                  case 'resume':
                    return 'Resumes';
                  case 'report':
                    return 'Reports';
                  default:
                    return 'Other Documents';
                }
              };

              // Group templates by type
              const templatesByType = {
                invoice: REFERENCE_TEMPLATES.filter((t) => t.type === 'invoice'),
                resume: REFERENCE_TEMPLATES.filter((t) => t.type === 'resume'),
                report: REFERENCE_TEMPLATES.filter((t) => t.type === 'report'),
                other: REFERENCE_TEMPLATES.filter((t) => t.type === 'other'),
              };

              // Sub-categorize "other" templates
              const otherTemplates = {
                commercial: templatesByType.other.filter((t) =>
                  ['proposal-business', 'quote-estimate', 'purchase-order'].includes(t.id),
                ),
                legal: templatesByType.other.filter((t) =>
                  ['contract-agreement', 'nda-confidentiality'].includes(t.id),
                ),
                presentation: templatesByType.other.filter((t) =>
                  ['presentation-slide', 'pitch-deck'].includes(t.id),
                ),
                administrative: templatesByType.other.filter((t) =>
                  ['receipt-payment', 'delivery-note'].includes(t.id),
                ),
                certificate: templatesByType.other.filter((t) =>
                  ['certificate-achievement'].includes(t.id),
                ),
              };

              return (
                <>
                  {/* Invoices */}
                  {templatesByType.invoice.length > 0 && (
                    <Box>
                      <Group mb="md">
                        {getTypeIcon('invoice')}
                        <Text size="sm" fw={600} c="white">
                          {getTypeLabel('invoice')}
                        </Text>
                        <Badge size="sm" color={getTypeColor('invoice')}>
                          {templatesByType.invoice.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {templatesByType.invoice.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                              <Group gap="xs" mt="xs">
                                {templateItem.metadata.colors.slice(0, 3).map((color, idx) => {
                                  // Map Tailwind colors to hex values
                                  const colorMap: Record<string, string> = {
                                    'blue-600': '#2563eb',
                                    'gray-900': '#111827',
                                    'gray-600': '#4b5563',
                                    'blue-50': '#eff6ff',
                                    'indigo-600': '#4f46e5',
                                    'purple-600': '#9333ea',
                                    'green-600': '#16a34a',
                                    'orange-600': '#ea580c',
                                    'teal-600': '#0d9488',
                                    'slate-900': '#0f172a',
                                    'yellow-400': '#facc15',
                                    'yellow-600': '#ca8a04',
                                  };
                                  const hexColor = colorMap[color] || '#6b7280';
                                  return (
                                    <Box
                                      key={idx}
                                      style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: hexColor,
                                      }}
                                    />
                                  );
                                })}
                              </Group>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Resumes */}
                  {templatesByType.resume.length > 0 && (
                    <Box>
                      <Group mb="md">
                        {getTypeIcon('resume')}
                        <Text size="sm" fw={600} c="white">
                          {getTypeLabel('resume')}
                        </Text>
                        <Badge size="sm" color={getTypeColor('resume')}>
                          {templatesByType.resume.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {templatesByType.resume.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Reports */}
                  {templatesByType.report.length > 0 && (
                    <Box>
                      <Group mb="md">
                        {getTypeIcon('report')}
                        <Text size="sm" fw={600} c="white">
                          {getTypeLabel('report')}
                        </Text>
                        <Badge size="sm" color={getTypeColor('report')}>
                          {templatesByType.report.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {templatesByType.report.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Commercial Documents */}
                  {otherTemplates.commercial.length > 0 && (
                    <Box>
                      <Group mb="md">
                        <IconBriefcase size={20} />
                        <Text size="sm" fw={600} c="white">
                          Commercial Documents
                        </Text>
                        <Badge size="sm" color="teal">
                          {otherTemplates.commercial.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {otherTemplates.commercial.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Legal Documents */}
                  {otherTemplates.legal.length > 0 && (
                    <Box>
                      <Group mb="md">
                        <IconGavel size={20} />
                        <Text size="sm" fw={600} c="white">
                          Legal Documents
                        </Text>
                        <Badge size="sm" color="orange">
                          {otherTemplates.legal.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {otherTemplates.legal.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Presentation Documents */}
                  {otherTemplates.presentation.length > 0 && (
                    <Box>
                      <Group mb="md">
                        <IconPresentation size={20} />
                        <Text size="sm" fw={600} c="white">
                          Presentation Documents
                        </Text>
                        <Badge size="sm" color="pink">
                          {otherTemplates.presentation.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {otherTemplates.presentation.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Administrative Documents */}
                  {otherTemplates.administrative.length > 0 && (
                    <Box>
                      <Group mb="md">
                        <IconReceipt size={20} />
                        <Text size="sm" fw={600} c="white">
                          Administrative Documents
                        </Text>
                        <Badge size="sm" color="cyan">
                          {otherTemplates.administrative.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {otherTemplates.administrative.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}

                  {/* Certificates */}
                  {otherTemplates.certificate.length > 0 && (
                    <Box>
                      <Group mb="md">
                        <IconCertificate size={20} />
                        <Text size="sm" fw={600} c="white">
                          Certificates
                        </Text>
                        <Badge size="sm" color="yellow">
                          {otherTemplates.certificate.length}
                        </Badge>
                      </Group>
                      <SimpleGrid cols={2} spacing="md">
                        {otherTemplates.certificate.map((templateItem) => (
                          <Card
                            key={templateItem.id}
                            padding="md"
                            radius="md"
                            withBorder
                            styles={{
                              root: {
                                borderColor:
                                  selectedTemplateId === templateItem.id ? '#3B82F6' : '#373A40',
                                backgroundColor: '#25262B',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#3B82F6',
                                  transform: 'translateY(-2px)',
                                },
                              },
                            }}
                            onClick={() => handleTemplateSelect(templateItem)}
                          >
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" fw={500} c="white" lineClamp={1}>
                                  {templateItem.name}
                                </Text>
                                {selectedTemplateId === templateItem.id && (
                                  <Badge size="xs" color="blue">
                                    Selected
                                  </Badge>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed" lineClamp={2}>
                                {templateItem.metadata.style} • {templateItem.metadata.complexity}
                              </Text>
                            </Stack>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  )}
                </>
              );
            })()}
          </Stack>
        </ScrollArea>
      </Drawer>

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
                  onClick={publishToMarketplace}
                  disabled={isPublishing}
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
            w={sidebarCollapsed ? '40px' : '18%'}
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
                <Stack id="charts-section" h={300}>
                  <Box p="xs">
                    <Text size="sm" fw={600} c="white" mb="md" tt="uppercase">
                      Charts
                    </Text>
                    <Text size="xs" c="dimmed" mb="md">
                      Click on a chart type to add it to your template
                    </Text>
                    <SimpleGrid cols={2} spacing="xs">
                      {Object.entries(CHART_TYPES).map(([type, label]) => (
                        <Box
                          key={type}
                          onClick={() => {
                            if (editorRef.current) {
                              const editor = editorRef.current;
                              const model = editor.getModel();
                              if (!model) return;

                              const lastLine = model.getLineCount();
                              const lastLineContent = model.getLineContent(lastLine);
                              const chartId = `${type}Chart${Math.random().toString(36).substr(2, 9)}`;
                              const chartData = generateChartData(type as keyof typeof CHART_TYPES);

                              // Update variables with new chart data
                              const updatedVariables = {
                                ...variables,
                                charts: {
                                  ...(variables.charts || {}),
                                  [chartId]: chartData,
                                },
                              };
                              handleVariablesUpdate(updatedVariables);

                              // Insert chart canvas element at the end
                              const text = `\n\n<!-- Chart Section -->
<div class="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-8">
  <canvas 
    id="${chartId}"
    data-chart-type="${type}"
    data-chart-data='${JSON.stringify(chartData).replace(/'/g, '&apos;')}'
    class="w-full aspect-[16/9]"
  ></canvas>
</div>`;

                              const position = {
                                lineNumber: lastLine,
                                column: lastLineContent.length + 1,
                              };

                              const range = new monaco.Range(
                                position.lineNumber,
                                position.column,
                                position.lineNumber,
                                position.column,
                              );

                              const op = {
                                identifier: { major: 1, minor: 1 },
                                range,
                                text,
                                forceMoveMarkers: true,
                              };

                              editor.executeEdits('chart-insert', [op]);
                            }
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
              width: sidebarCollapsed ? 'calc(60% - 20px)' : '50%',
              height: '100%',
              transition: 'width 0.3s ease',
              flexShrink: 0,
              flexGrow: 0,
            }}
            ref={drop}
          >
            <DndProvider backend={HTML5Backend}>
              <IDE
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
              width: sidebarCollapsed ? 'calc(40% - 20px)' : '32%',
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
                data={variables}
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
