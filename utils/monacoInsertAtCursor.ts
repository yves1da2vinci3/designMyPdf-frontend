import type * as monaco from 'monaco-editor';

/** Insère du texte à la position du curseur (remplace une plage vide). Retourne false si éditeur / modèle / position indisponibles. */
export function insertAtCursor(
  editor: monaco.editor.IStandaloneCodeEditor,
  text: string,
  source: string = 'insert-at-cursor',
): boolean {
  const model = editor.getModel();
  if (!model) return false;
  const position = editor.getPosition();
  if (!position) return false;
  const range = {
    startLineNumber: position.lineNumber,
    startColumn: position.column,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  };
  editor.executeEdits(source, [
    {
      range,
      text,
      forceMoveMarkers: true,
    },
  ]);
  return true;
}

/** Insère du texte à la fin de la dernière ligne du document. */
export function insertAtDocumentEnd(
  editor: monaco.editor.IStandaloneCodeEditor,
  text: string,
  source: string = 'insert-at-end',
): boolean {
  const model = editor.getModel();
  if (!model) return false;
  const lastLine = model.getLineCount();
  const lastLineContent = model.getLineContent(lastLine);
  const range = {
    startLineNumber: lastLine,
    startColumn: lastLineContent.length + 1,
    endLineNumber: lastLine,
    endColumn: lastLineContent.length + 1,
  };
  editor.executeEdits(source, [
    {
      range,
      text,
      forceMoveMarkers: true,
    },
  ]);
  return true;
}
