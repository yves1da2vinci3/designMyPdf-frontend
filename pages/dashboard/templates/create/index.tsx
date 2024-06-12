import { Badge, Box, Button, Checkbox, Group, Select, Stack, Text, rem } from '@mantine/core';
import React, { useEffect, useState, useRef } from 'react';
import IDE from './CodeEditor';
import Preview, { FormatType } from './Preview';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { IconArrowLeft, IconDownload, IconMinus, IconPlus } from '@tabler/icons-react';
import AddVariable from '@/modals/AddVariable/AddVariable';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import { useMonaco } from '@monaco-editor/react';
import { useRouter } from 'next/router';
import { DEFAULT_FONT, fonts } from '../../../../constants/fonts';

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
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATE);
  const [addVariableOpened, { open: openAddVariable, close: closeAddVariable }] =
    useDisclosure(false);
  const router = useRouter();
  const handleAddVariable = () => {
    openAddVariable();
  };
  // Manage variables
  const [jsonContent, setJsonContent] = useState<string>(JSON.stringify(data, null, 2));
  const [variables, setVariables] = useState<any>({});

  const editorRef = useRef<any>(null);

  useEffect(() => {
    setVariables(JSON.parse(jsonContent));
    console.log(JSON.parse(jsonContent));
  }, [jsonContent]);

  // DND Feature
  const monaco = useMonaco();
  const [{ isOver }, drop] = useDrop({
    accept: 'VARIABLE',
    drop: (item: { varName: string; type: 'array' | 'object' | 'key-value' }) => {
      console.log(item);
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
            text = `<% ${item.varName}.forEach((item) => { %>\n\t<%= item.${firstKeyName} %>\n<% }); %>`;
            break;
          case 'object':
            const firstKey = Object.keys(variables[item.varName])[0];
            text = `<%= ${item.varName}.${firstKey} %>`;
            break;
          default:
            text = `<%= ${item.varName} %>`;
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

  const handleBack = () => {
    router.back();
  };

  // handle Format
  const [format, setFormat] = useState<FormatType>(DEFAULT_FORMAT);
  const handleFormat = (format: FormatType) => {
    console.log(format);
    setFormat(format);
  };
  // Handle Font
  const [selectedFont, setSelectedFont] = useState(DEFAULT_FONT);
  const [fontsSelected, setFontsSelected] = useState([DEFAULT_FONT]);

  const addFont = () => { 
    setFontsSelected([...fontsSelected, '--Select--your-font']);
   }

  const removeFont = (fontToRemove:string) => { 
    setFontsSelected(fontsSelected.filter((f) => f !== fontToRemove));
   }
  const handleChangeFont = (selectedOption: any,index: number) => {
    const newFontsSelected = [...fontsSelected];
    newFontsSelected[index] = selectedOption.value;
    setFontsSelected(newFontsSelected);
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
      {/* NavBar */}
      <Group h={rem(40)} px={10} bg={'black'} justify="space-between">
        <Button onClick={() => handleBack()} leftSection={<IconArrowLeft size={14} />} bg={'black'}>
          return to dashoard
        </Button>
        <Text c={'white'}>lolo domine le monde</Text>
        <Button size="xs" rightSection={<IconDownload size={14} />} bg={'blue'}>
          save and publish
        </Button>
      </Group>
      {/* Main Content */}
      <Group>
        {/* Editing configuration */}
        <Stack w={'16%'} p={10} h={'95vh'} bg={'black'}>
          <Text size="sm" fw={'bold'} c={'white'}>
            Template settings
          </Text>
          <Group>
            <Select
              size="xs"
              w={'30%'}
              onChange={(_, formatSelected) => {
                console.log(formatSelected);
                const format = (formatSelected.value as FormatType) || DEFAULT_FORMAT;
                handleFormat(format);
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
            <Checkbox defaultChecked c={'white'} label="landscape" />
          </Group>
          <Group justify="space-between">
            <Text size="sm" fw={'bold'} c={'white'}>
              Template variables
            </Text>
            <Box onClick={() => handleAddVariable()} component="button">
              <IconPlus color="white" />
            </Box>
          </Group>
          {/* Variables */}
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
            <Box onClick={() => addFont()} component="button">
              <IconPlus color="white" />
            </Box>
          </Group>
          {/* Selected Fonts */}
          {fontsSelected.map((font, index) => (
            <Group justify="space-between" >
            <Select
              w={'60%'}
              onChange={(_, fontSelected) => {
                handleChangeFont(fontSelected,index);
              }}
              searchable
              defaultValue={font}
              data={fonts}
            />
            <Box onClick={() => removeFont(font)} component="button">
              <IconMinus color="white" />
            </Box>
          </Group>
          ))}
          
        </Stack>
        {/* Code editor */}
        <Box flex={1} h={'95vh'} bg={'green'} ref={drop} style={{ position: 'relative' }}>
          <DndProvider backend={HTML5Backend}>
            <IDE
              onChange={(newValue) => setCode(newValue)}
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
          w={'35%'}
          h={'95vh'}
        >
          <Preview format={format} htmlContent={code} data={variables} fonts={fontsSelected} />
        </Box>
      </Group>
    </Stack>
  );
}
