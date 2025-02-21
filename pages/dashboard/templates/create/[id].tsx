import React, { useEffect, useState, useRef } from 'react';
import {
  Badge,
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
  TextInput,
  Textarea,
  ActionIcon,
  Tooltip,
  ScrollArea,
  SimpleGrid,
} from '@mantine/core';
import { useRouter, useParams } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  IconChevronLeft,
  IconDownload,
  IconEye,
  IconMinus,
  IconPlus,
  IconWand,
  IconSparkles,
  IconChartDots,
} from '@tabler/icons-react';
import IDE from './CodeEditor';
import Preview, { FormatType } from './Preview';
import AddVariable from '@/modals/AddVariable/AddVariable';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import { useMonaco } from '@monaco-editor/react';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { DEFAULT_FONT, fonts } from '@/constants/fonts';
import { RequestStatus } from '@/api/request-status.enum';
import { TemplateDTO, templateApi } from '@/api/templateApi';
import notificationService from '@/services/NotificationService';

const DEFAULT_FORMAT = 'a4';
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

const CHART_TYPES = {
  line: 'Line Chart',
  bar: 'Bar Chart',
  pie: 'Pie Chart',
  doughnut: 'Doughnut Chart',
  radar: 'Radar Chart',
  polarArea: 'Polar Area',
  bubble: 'Bubble Chart',
  scatter: 'Scatter Plot',
} as const;

function generateChartData(type: keyof typeof CHART_TYPES) {
  const labels = Array.from({ length: 6 }, (_, i) => `Label ${i + 1}`);

  switch (type) {
    case 'line':
    case 'bar':
      return {
        labels,
        datasets: [
          {
            label: 'Dataset 1',
            data: labels.map(() => Math.floor(Math.random() * 100)),
            borderColor: '#3B82F6',
            backgroundColor: '#60A5FA',
          },
          {
            label: 'Dataset 2',
            data: labels.map(() => Math.floor(Math.random() * 100)),
            borderColor: '#10B981',
            backgroundColor: '#34D399',
          },
        ],
      };

    case 'pie':
    case 'doughnut':
    case 'polarArea':
      return {
        labels: labels.slice(0, 4),
        datasets: [
          {
            data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#3B82F6', '#10B981', '#6366F1', '#EC4899'],
          },
        ],
      };

    case 'radar':
      return {
        labels: Array.from({ length: 5 }, (_, i) => `Category ${i + 1}`),
        datasets: [
          {
            label: 'Dataset',
            data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          },
        ],
      };

    case 'bubble':
      return {
        datasets: [
          {
            label: 'Dataset',
            data: Array.from({ length: 10 }, () => ({
              x: Math.floor(Math.random() * 200) - 100,
              y: Math.floor(Math.random() * 200) - 100,
              r: Math.floor(Math.random() * 15) + 5,
            })),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      };

    case 'scatter':
      return {
        datasets: [
          {
            label: 'Dataset',
            data: Array.from({ length: 10 }, () => ({
              x: Math.floor(Math.random() * 200) - 100,
              y: Math.floor(Math.random() * 200) - 100,
            })),
            backgroundColor: '#3B82F6',
          },
        ],
      };

    default:
      return {
        labels,
        datasets: [
          {
            label: 'Dataset',
            data: labels.map(() => Math.floor(Math.random() * 100)),
          },
        ],
      };
  }
}

export default function CreateTemplate() {
  const params = useParams();
  const router = useRouter();
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(RequestStatus.NotStated);
  const [template, setTemplate] = useState<TemplateDTO | null>(null);
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATE);
  const [jsonContent, setJsonContent] = useState<string>(JSON.stringify(data, null, 2));
  const [variables, setVariables] = useState<any>({});
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
  const [isImproving, setIsImproving] = useState(false);

  const fetchTemplate = async () => {
    try {
      setIsLoading(RequestStatus.InProgress);
      const template = await templateApi.getTemplateById(params.id as string);
      setTemplate(template);
      setCode(template.content || DEFAULT_TEMPLATE);
      setJsonContent(JSON.stringify(template.variables || data, null, 2));
      setVariables(template.variables || data);
      setFontsSelected(template.fonts || [DEFAULT_FONT]);
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
      console.error('Error parsing JSON content:', error);
    }
  }, [jsonContent]);

  const handleVariablesUpdate = (newVariables: any) => {
    setVariables(newVariables);
    setJsonContent(JSON.stringify(newVariables, null, 2));
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

  const handleChangeFont = (selectedOption: any, index: number) => {
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
        framework: 'tailwind',
        fonts: fontsSelected,
      });
    } catch (error) {}
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'VARIABLE',
    drop: (item: { varName: string; type: 'array' | 'object' | 'key-value' }) => {
      if (editorRef.current) {
        const position = editorRef.current.getPosition();
        const range = new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        );
        const id = { major: 1, minor: 1 }; // unique identifier for the op
        let text = '';

        switch (item.type) {
          case 'array':
            const objectConcerned = variables[item.varName][0];
            const firstKeyName = Object.keys(objectConcerned)[0];
            text = `{{#each ${item.varName}}}\n\t{{this.${firstKeyName}}}\n{{/each}}`;
            break;
          case 'object':
            const firstKey = Object.keys(variables[item.varName])[0];
            text = `{{${item.varName}.${firstKey}}}`;
            break;
          default:
            text = `{{${item.varName}}}`;
            break;
        }

        const op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
        editorRef.current.executeEdits('my-source', [op]);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  function uploadTemplate(text: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template${Math.random()}.hbs`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleAddVariable = () => {
    openAddVariable();
  };

  const generateTemplateFromPrompt = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.content) {
        if (data.suggestedVariables) {
          handleVariablesUpdate(data.suggestedVariables);
          setSuggestedVariables(data.suggestedVariables);
        }

        setCode(data.content);
        closePromptDrawer();
      }
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error generating template');
      console.error('Error generating template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const improveTemplateUI = async () => {
    if (!code) return;

    setIsImproving(true);
    try {
      const response = await fetch('/api/improve-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: code,
          variables: variables,
        }),
      });

      const data = await response.json();
      if (data.content) {
        setCode(data.content);
      }
    } catch (error: any) {
      notificationService.showErrorNotification(error?.message || 'Error improving template');
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Stack style={{ overflow: 'hidden' }} gap={0}>
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
            Describe your template and the AI will generate it along with suggested variables. The
            existing variables will be replaced with AI-generated ones with realistic sample data.
          </Text>

          <Textarea
            label="Template Description"
            description="Be specific about the layout, sections, and design elements you want"
            placeholder="Create a modern invoice template with a clean header, company details section, itemized table with calculations, and a professional footer..."
            minRows={4}
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
          <Tooltip label="Improve design with AI">
            <Button
              onClick={improveTemplateUI}
              loading={isImproving}
              leftSection={<IconSparkles size={16} />}
              variant="light"
              color="teal"
              styles={{
                root: {
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                },
              }}
            >
              Improve Design
            </Button>
          </Tooltip>
          <Tooltip label="Generate with AI">
            <Button
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
          <Button
            onClick={() => uploadTemplate(templateContent)}
            leftSection={<IconDownload size={16} />}
            variant="light"
            color="gray"
            styles={{
              root: {
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)' },
              },
            }}
          >
            Download
          </Button>
          <Button
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
            Save and publish
          </Button>
        </Group>
      </Group>

      {/* Main Content */}
      {isLoading === RequestStatus.InProgress ? (
        <Center h={'calc(100vh - 60px)'} w={'100%'}>
          <Loader size="lg" color="blue" />
        </Center>
      ) : (
        <Group gap={0} style={{ height: 'calc(100vh - 60px)', flexWrap: 'nowrap' }}>
          {/* Sidebar */}
          <Stack
            component={ScrollArea}
            w={'18%'}
            p="xl"
            h={'100%'}
            bg="#1A1B1E"
            style={{ borderRight: '1px solid #373A40' }}
            gap="xl"
          >
            <Box>
              <Text size="sm" fw={600} c="white" mb="md" fs="uppercase">
                Template settings
              </Text>

              {/* Paper size and orientation */}
              <Group align="center" mb="lg">
                <Select
                  size="sm"
                  label="Paper Size"
                  w={120}
                  onChange={(_, formatSelected) => {
                    const format = (formatSelected.value as FormatType) || DEFAULT_FORMAT;
                    setFormat(format);
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
            </Box>

            {/* Variables section */}
            <Box>
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
            <Box>
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
                      onChange={(value) => handleChangeFont({ value }, index)}
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
            <Stack h={300}>
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
    data-chart-data='${JSON.stringify(chartData).replace(/'/g, "&apos;")}'
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
                            position.column
                          );

                          const op = {
                            identifier: { major: 1, minor: 1 },
                            range: range,
                            text: text,
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
                      }}
                      sx={{
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          backgroundColor: '#2C2E33',
                          borderColor: '#3B82F6',
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
          </Stack>

          {/* Code editor */}
          <Box style={{ width: '49%', height: '100%' }} ref={drop}>
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
            style={{
              width: '33%',
              height: '100%',
              backgroundColor: '#1A1B1E',
              borderLeft: '1px solid #373A40',
              position: 'relative',
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
}
