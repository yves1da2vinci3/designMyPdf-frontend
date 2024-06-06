import { Badge, Box, Group, Select, Stack, Text } from '@mantine/core';
import React, { useEffect, useState, useRef } from 'react';
import IDE from './CodeEditor';
import Preview from './Preview';
import { DEFAULT_FORMAT } from '@/constants/template';
import { IconPlus } from '@tabler/icons-react';
import AddVariable from '@/modals/AddVariable/AddVariable';
import { useDisclosure } from '@mantine/hooks';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import VariableBadge from '@/components/VariableBadge/VariableBadge';
import { useMonaco } from '@monaco-editor/react';

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
  const [code, setCode] = useState<string>(DEFAULT_FORMAT);
  const [addVariableOpened, { open: openAddVariable, close: closeAddVariable }] =
    useDisclosure(false);
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

  return (
    <Group style={{ overflow: 'hidden' }} gap={0}>
      {/* Manage variable */}
      <AddVariable
        opened={addVariableOpened}
        onClose={closeAddVariable}
        jsonContent={jsonContent}
        setJsonContent={setJsonContent}
      />
      {/* Editing configuration */}
      <Stack w={'15%'} p={10} h={'100vh'} bg={'black'}>
        <Text c={'white'}>Template settings</Text>
        <Group>
          <Select placeholder="A4" data={['a1', 'a2', 'a3', 'a4', 'a5', 'a6']} />
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
            return <VariableBadge key={varName} varName={varName} type={type}  />;
          })}
        </Group>
      </Stack>
      {/* Code editor */}
      <Box flex={1} h={'100vh'} bg={'green'} ref={drop} style={{ position: 'relative' }}>
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
      <Box w={'35%'} h={'100vh'} p={40}>
        <Preview format="a3" htmlContent={code} data={variables} />
      </Box>
    </Group>
  );
}
