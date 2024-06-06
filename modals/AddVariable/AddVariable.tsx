import { Modal, ModalProps, Title } from '@mantine/core';
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
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setJsonContent(value);
    }
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
    </Modal>
  );
};

export default AddVariable;
