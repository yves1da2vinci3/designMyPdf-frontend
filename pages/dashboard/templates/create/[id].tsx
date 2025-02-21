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
  IconBrandGoogle,
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
  const [addVariableOpened, { open: openAddVariable, close: closeAddVariable }] =
    useDisclosure(false);
  const [format, setFormat] = useState<FormatType>(DEFAULT_FORMAT);
  const [isLandScape, setIsLandScape] = useState<boolean>(false);
  const [fontsSelected, setFontsSelected] = useState([DEFAULT_FONT]);
  const [templateContent, setTemplateContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptDrawerOpened, { open: openPromptDrawer, close: closePromptDrawer }] = useDisclosure(false);

  const fetchTemplate = async () => {
    try {
      setIsLoading(RequestStatus.InProgress);
      const template = await templateApi.getTemplateById(params.id as string);
      setTemplate(template);
      setCode(template.content || DEFAULT_TEMPLATE);
      setJsonContent(JSON.stringify(template.variables || data, null, 2));
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
    setVariables(JSON.parse(jsonContent));
  }, [jsonContent]);

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
        body: JSON.stringify({ 
          prompt,
          variables: variables // Send current variables for context
        }),
      });

      const data = await response.json();
      if (data.content) {
        setCode(data.content);
        setTemplateContent(data.content);
        closePromptDrawer();
      }
    } catch (error) {
      console.error('Error generating template:', error);
    } finally {
      setIsGenerating(false);
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
      >
        <Stack gap="md" p="md">
          <Text size="sm" c="dimmed">
            Describe your template and the AI will generate it based on your current variables and requirements.
          </Text>
          
          <Box>
            <Text size="sm" fw="bold" mb={5}>Available Variables</Text>
            <Group gap="xs">
              {Object.entries(variables).map(([varName, value]) => {
                let type = Array.isArray(value) ? 'array' : typeof value === 'object' ? 'object' : 'key-value';
                return <Badge key={varName}>{`${varName} (${type})`}</Badge>;
              })}
            </Group>
          </Box>

          <Textarea
            label="Template Description"
            placeholder="Describe your template (e.g., Create an invoice template with a modern design using the company information and items list...)"
            minRows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <Button
            onClick={generateTemplateFromPrompt}
            loading={isGenerating}
            disabled={!prompt}
            leftSection={<IconWand size={16} />}
          >
            Generate Template
          </Button>
        </Stack>
      </Drawer>

      {/* NavBar */}
      <Group h={rem(40)} px={10} bg={'black'} justify="space-between">
        <Button onClick={handleBack} leftSection={<IconChevronLeft size={14} />} bg={'black'}>
          return to dashboard
        </Button>
        <Text c={'white'}>{template?.name || 'example'}</Text>
        <Group>
          <Button
            onClick={openPromptDrawer}
            size="xs"
            leftSection={<IconWand size={14} />}
            bg={'blue'}
          >
            AI Generate
          </Button>
          <Button
            onClick={() => uploadTemplate(templateContent)}
            size="xs"
            rightSection={<IconEye size={14} />}
            bg={'blue'}
          >
            download template
          </Button>
          <Button
            onClick={updateTemplate}
            size="xs"
            rightSection={<IconDownload size={14} />}
            bg={'blue'}
          >
            save and publish
          </Button>
        </Group>
      </Group>

      {/* Main Content */}
      {isLoading === RequestStatus.InProgress ? (
        <Center h={'95vh'} w={'100%'}>
          <Loader />
        </Center>
      ) : (
        <Group>
          {/* Editing configuration */}
          <Stack w={'18%'} p={10} h={'95vh'} bg={'black'}>
            <Text size="sm" fw={'bold'} c={'white'}>
              Template settings
            </Text>
            <Group>
              <Select
                size="xs"
                w={'45%'}
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
              />
              <Checkbox
                checked={isLandScape}
                c={'white'}
                onChange={(event) => setIsLandScape(event.currentTarget.checked)}
                label="landscape"
              />
            </Group>
            
            {/* Variables */}
            <Group justify="space-between">
              <Text size="sm" fw={'bold'} c={'white'}>
                Template variables
              </Text>
              <Box onClick={handleAddVariable} component="button">
                <IconPlus color="white" />
              </Box>
            </Group>
            <Group>
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

            {/* Fonts */}
            <Group justify="space-between">
              <Text size="sm" fw={'bold'} c={'white'}>
                Fonts
              </Text>
              <Box onClick={addFont} component="button">
                <IconPlus color="white" />
              </Box>
            </Group>
            {fontsSelected.map((font, index) => (
              <Group key={font} justify="space-between">
                <Select
                  w={'55%'}
                  onChange={(_, fontSelected) => handleChangeFont(fontSelected, index)}
                  searchable
                  placeholder={font}
                  defaultValue={font}
                  data={fonts}
                />
                <Box onClick={() => removeFont(font)} component="button">
                  <IconMinus color="white" />
                </Box>
              </Group>
            ))}
          </Stack>
          
          {/* Rest of the existing layout */}
          <Box flex={1} h={'95vh'} ref={drop} style={{ position: 'relative' }}>
            <DndProvider backend={HTML5Backend}>
              <IDE
                onChange={setCode}
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
              backgroundColor: 'black',
            }}
            w={'33%'}
            h={'95vh'}
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
        </Group>
      )}
    </Stack>
  );
}
