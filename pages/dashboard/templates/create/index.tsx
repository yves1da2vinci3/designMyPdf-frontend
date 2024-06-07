import { Badge, Box, Button, Group, Select, Stack, Text, rem } from '@mantine/core';
import React, { useEffect, useState, useRef } from 'react';
import IDE from './CodeEditor';
import Preview, { FormatType } from './Preview';
import { DEFAULT_TEMPLATE } from '@/constants/template';
import { IconArrowLeft, IconDownload, IconPlus } from '@tabler/icons-react';
import AddVariable from '@/modals/AddVariable/AddVariable';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import { useMonaco } from '@monaco-editor/react';
import { Router, useRouter } from 'next/router';
import { DEFAULT_FONT, fonts } from './fonts';

const DEFAULT_FORMAT = 'a4';
const data = {
  date: '2024-06-05',
  items: [
    { name: 'Item 1', price: 10.0 },
    { name: 'Item 2', price: 20.0 },
    { name: 'Item 3', price: 30.0 },
    { name: 'Item 4', price: 40.0 },
    { name: 'Item 5', price: 50.0 },
  ],
  total: 150.0,
  contactEmail: 'info@example.com',
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
  const handleChangeFont = (selectedOption: any) => {
    setSelectedFont(selectedOption.value);
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
          save
        </Button>
      </Group>
      {/* Main Content */}
      <Group>
        {/* Editing configuration */}
        <Stack w={'15%'} p={10} h={'95vh'} bg={'black'}>
          <Text c={'white'}>Template settings</Text>
          <Group>
            <Select
              onChange={(_, formatSelected) => {
                console.log(formatSelected);
                const format = (formatSelected.value as FormatType) || DEFAULT_FORMAT;
                handleFormat(format);
              }}
              defaultValue={DEFAULT_FORMAT}
              data={['a1', 'a2', 'a3', 'a4', 'a5', 'a6']}
            />
            <Select placeholder="Type" data={['landscape', 'portrait']} />
          </Group>
          <Group justify="space-between">
            <Text c={'white'}>Template variables</Text>
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
          <Text c={'white'}>Fonts</Text>
          <Select
            onChange={(_, fontSelected) => {
              handleChangeFont(fontSelected);
            }}
            searchable
            defaultValue={DEFAULT_FONT}
            data={fonts}
          />
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
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          w={'35%'}
          h={'95vh'}
        >
          <Preview format={format} htmlContent={code} data={variables} font={selectedFont} />
        </Box>
      </Group>
    </Stack>
  );
}
