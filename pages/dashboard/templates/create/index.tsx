import { Box, Group, Select, Stack, Text } from '@mantine/core';
import React, { useState } from 'react';
import IDE from './CodeEditor';
import Preview from './Preview';
import { DEFAULT_FORMAT } from '@/constants/template';

const data = {
  date: '2024-06-05',
  items: [
    { name: 'Item 1', price: 10.00 },
    { name: 'Item 2', price: 20.00 },
    { name: 'Item 3', price: 30.00 },
    { name: 'Item 4', price: 40.00 },
    { name: 'Item 5', price: 50.00 },
  ],
  total: 150.00,
  contactEmail: 'info@example.com'
};

export default function CreateTemplate() {
    
  const [code, setCode] = useState<string>(DEFAULT_FORMAT);
  const handleEditorChange = (newValue: string) => {
    console.log('Editor content:', newValue);
    setCode(newValue);
  };
  return (
    <Group  style={{ overflow : 'hidden'}} gap={0}>
      {/* Editing configuration */}
      <Stack w={'15%'} p={10} h={'100vh'} bg={'blue'}>
        <Text>Template settings</Text>
        <Group>
            <Select placeholder='A4' data={['a1', 'a2', 'a3', 'a4', 'a5', 'a6']} />
            <Select placeholder='Type' data={['landscape', 'portrait']} />
        </Group>
        <Text>Template variables</Text>
      </Stack>
      {/* Code editor */}
      <Box flex={1} h={'100vh'} bg={'green'}>
        <IDE onChange={handleEditorChange} defaultValue={code} />
      </Box>
      {/* Preview */}
      <Box w={'35%'} h={'100vh'} p={40} >
        <Preview format='a3' htmlContent={code} data={data} />
      </Box>
    </Group>
  );
}
