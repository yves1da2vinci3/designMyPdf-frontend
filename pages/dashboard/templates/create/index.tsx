import { Box, Group, Select, Stack, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import IDE from './CodeEditor';
import Preview from './Preview';
import { DEFAULT_FORMAT } from '@/constants/template';
import { IconPlus } from '@tabler/icons-react';
import AddVariable from '@/modals/AddVariable/AddVariable';
import { useDisclosure } from '@mantine/hooks';

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
  const handleEditorChange = (newValue: string) => {
    console.log('Editor content:', newValue);
    setCode(newValue);
  };
  const [addVariableOpened, { open: openAddVariable, close: closeAddVariable }] =
    useDisclosure(false);
  const handleAddVariable = () => {
    openAddVariable();
  };
  // Manage variables
  const [jsonContent, setJsonContent] = useState<string>(JSON.stringify(data, null, 2));
  const [variables, setVariables] = useState<any>({});

  useEffect(() => {
    setVariables(JSON.parse(jsonContent));
    console.log(JSON.parse(jsonContent));
  }, [jsonContent]);
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
      <Stack w={'15%'} p={10} h={'100vh'} bg={'blue'}>
        <Text>Template settings</Text>
        <Group>
          <Select placeholder="A4" data={['a1', 'a2', 'a3', 'a4', 'a5', 'a6']} />
          <Select placeholder="Type" data={['landscape', 'portrait']} />
        </Group>
        <Group justify="space-between">
          <Text>Template variables</Text>
          <Box onClick={() => handleAddVariable()} component="button">
            <IconPlus />
          </Box>
        </Group>
      </Stack>
      {/* Code editor */}
      <Box flex={1} h={'100vh'} bg={'green'}>
        <IDE onChange={handleEditorChange} defaultValue={code} />
      </Box>
      {/* Preview */}
      <Box w={'35%'} h={'100vh'} p={40}>
        <Preview format="a3" htmlContent={code} data={variables} />
      </Box>
    </Group>
  );
}
