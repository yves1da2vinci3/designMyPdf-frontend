import Editor, { OnMount } from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  defaultValue: string;
  editorDidMount: OnMount;
}

const IDE: React.FC<EditorProps> = ({ onChange, defaultValue, editorDidMount }) => {
  const [value, setValue] = useState<string>(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setValue(newValue);
      onChange(newValue);
    }
  };

  return (
    <Editor
      value={value}
      onChange={handleEditorChange}
      height="100vh"
      defaultLanguage="html"
      onMount={editorDidMount}
    />
  );
};

export default IDE;
