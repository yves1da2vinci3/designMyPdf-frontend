import Editor from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  defaultValue: string;
}

const IDE: React.FC<EditorProps> = ({ onChange, defaultValue }) => {
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
      onChange={(newValue) => handleEditorChange(newValue)}
      height="100vh"
      defaultLanguage="html"
    />
  );
};

export default IDE;
