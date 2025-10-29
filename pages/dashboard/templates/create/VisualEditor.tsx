import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button, Modal, TextInput } from '@mantine/core';
import { Editor as TinyMCEEditor } from 'tinymce';

interface VisualEditorProps {
  code: string;
  setCode: (code: string) => void;
}

export function VisualEditor({ code, setCode }: VisualEditorProps) {
  const [variableModalOpened, setVariableModalOpened] = useState(false);
  const [variableName, setVariableName] = useState('');
  const [editorInstance, setEditorInstance] = useState<TinyMCEEditor | null>(null);

  const handleMakeDynamic = () => {
    if (editorInstance) {
      const selectedContent = editorInstance.selection.getContent();
      if (selectedContent) {
        setVariableModalOpened(true);
      }
    }
  };

  const addVariable = () => {
    if (editorInstance && variableName) {
      editorInstance.selection.setContent(`{{${variableName}}}`);
      setVariableName('');
      setVariableModalOpened(false);
    }
  };

  return (
    <>
      <Modal
        opened={variableModalOpened}
        onClose={() => setVariableModalOpened(false)}
        title="Add Variable"
      >
        <TextInput
          label="Variable Name"
          placeholder="Enter variable name"
          value={variableName}
          onChange={(event) => setVariableName(event.currentTarget.value)}
        />
        <Button onClick={addVariable} mt="md">
          Add
        </Button>
      </Modal>
      <Editor
        apiKey="YOUR_API_KEY"
        value={code}
        onEditorChange={(content) => setCode(content)}
        init={{
          height: '100%',
          menubar: false,
          plugins: [
            'advlist',
            'autolink',
            'lists',
            'link',
            'image',
            'charmap',
            'preview',
            'anchor',
            'searchreplace',
            'visualblocks',
            'code',
            'fullscreen',
            'insertdatetime',
            'media',
            'table',
            'help',
            'wordcount',
          ],
          toolbar:
            'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | makeDynamic',
          setup: (editor) => {
            setEditorInstance(editor);
            editor.ui.registry.addButton('makeDynamic', {
              text: 'Make Dynamic',
              onAction: handleMakeDynamic,
            });
          },
        }}
      />
    </>
  );
}
