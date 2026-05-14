/**
 * Workers Monaco + worker Tailwind (sans importer `monaco-editor` : évite les CSS globaux Next).
 * Les plugins Tailwind / Emmet sont enregistrés dans `TemplateHtmlEditor` via `beforeMount`.
 */
let done = false;

export function bootstrapMonacoEditor(): void {
  if (typeof window === 'undefined' || done) {
    return;
  }
  done = true;

  const w = self as unknown as {
    MonacoEnvironment?: { getWorker: (_moduleId: string, label: string) => Worker };
  };

  w.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      switch (label) {
        case 'json':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
          );
        case 'css':
        case 'scss':
        case 'less':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url),
          );
        case 'html':
        case 'handlebars':
        case 'razor':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url),
          );
        case 'typescript':
        case 'javascript':
          return new Worker(
            new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
          );
        case 'tailwindcss':
          // Chemin relatif : Next refuse `new URL('monaco-tailwindcss/…')` sur paquet ESM.
          return new Worker(
            new URL('../node_modules/monaco-tailwindcss/tailwindcss.worker.js', import.meta.url),
          );
        default:
          return new Worker(
            new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          );
      }
    },
  };
}
