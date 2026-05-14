import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import { emmetHTML } from 'emmet-monaco-es';
import { configureMonacoTailwindcss, tailwindcssData } from 'monaco-tailwindcss';
import type * as MonacoEditor from 'monaco-editor';
import React, { useEffect, useState } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  defaultValue: string;
  editorDidMount: OnMount;
}

let monacoPluginsRegistered = false;

const beforeMountMonaco: BeforeMount = (monaco) => {
  if (monacoPluginsRegistered) {
    return;
  }
  monacoPluginsRegistered = true;

  const cssContribution = monaco.languages.css as unknown as {
    cssDefaults: {
      setOptions: (opts: {
        data: { dataProviders: { tailwindcssData: typeof tailwindcssData } };
      }) => void;
    };
  };
  cssContribution.cssDefaults.setOptions({
    data: {
      dataProviders: {
        tailwindcssData,
      },
    },
  });

  const fullMonaco = monaco as unknown as typeof MonacoEditor;

  configureMonacoTailwindcss(fullMonaco);
  emmetHTML(fullMonaco, ['html']);
};

const TemplateHtmlEditor: React.FC<EditorProps> = ({ onChange, defaultValue, editorDidMount }) => {
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
      height="100%"
      defaultLanguage="html"
      beforeMount={beforeMountMonaco}
      onMount={editorDidMount}
      options={{
        quickSuggestions: { other: true, comments: false, strings: true },
        suggest: { snippetsPreventQuickSuggestions: false },
        tabSize: 2,
      }}
    />
  );
};

export default TemplateHtmlEditor;
