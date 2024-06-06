import { Button, Modal, ModalProps, Stack, Title, rem } from '@mantine/core';
import { Editor } from '@monaco-editor/react';
import React, { useState } from 'react';

interface AddVariableModalProps extends ModalProps {
  jsonContent: string;
  setJsonContent: (value: string) => void;
}

const AddVariable: React.FC<AddVariableModalProps> = ({
  onClose,
  jsonContent,
  setJsonContent,
  ...modalProps
}) => {
  const [modifiedContent, setModifiedContent] = useState(jsonContent);
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setModifiedContent(value);
    }
  };
  const handleSave = () => {
    setJsonContent(modifiedContent);
    onClose();
  };
  return (
    <Modal
      centered
      onClose={onClose}
      size={'lg'}
      {...modalProps}
      title={
        <Title order={3} my={4}>
          variable management
        </Title>
      }
    >
      <Stack>
        <Editor
          height="400px"
          defaultLanguage="json"
          value={jsonContent}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
        <Button onClick={()=> handleSave()} w={rem(130)} style={{ alignSelf: 'flex-end' }}>
          Save
        </Button>
      </Stack>
    </Modal>
  );
};

export default AddVariable;
