import { Box, Group, Stack } from '@mantine/core';
import React, { useState } from 'react';
import IDE from './CodeEditor';
import Preview from './Preview';

export default function CreateTemplate() {
  const [code, setCode] = useState<string>('<div>Hello world!</div>');
  const handleEditorChange = (newValue: string) => {
    console.log('Editor content:', newValue);
    setCode(newValue);
  };
  return (
    <Group gap={0}>
      {/* Editing configuration */}
      <Stack w={'15%'} h={'100vh'} bg={'red'}></Stack>
      {/* Code editor */}
      <Box flex={1} h={'100vh'} bg={'green'}>
        <IDE onChange={handleEditorChange} defaultValue={code} />
      </Box>
      {/* Preview */}
      <Box w={'35%'} h={'100vh'} p={40} >
        <Preview htmlContent={code} />
      </Box>
    </Group>
  );
}
