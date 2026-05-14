/**
 * Workers Monaco **same-origin** (`new URL('monaco-editor/esm/...', import.meta.url)`),
 * comme [monaco-tailwindcss](https://github.com/remcohaszing/monaco-tailwindcss), + worker
 * Tailwind local. Alignement avec `monaco-editor` npm via `@monaco-editor/loader` :
 * `loader.config({ monaco })` après `import('monaco-editor')` (voir plan).
 */
import loader from '@monaco-editor/loader';

let ensurePromise: Promise<void> | null = null;
let createWebWorkerPatchApplied = false;

function applyMonacoWorkerEnvironment(): void {
  if (typeof window === 'undefined') {
    return;
  }

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

/**
 * À appeler tôt côté client si besoin (avant le premier chunk Monaco). Idempotent.
 */
export function installMonacoWorkersOnce(): void {
  applyMonacoWorkerEnvironment();
}

/**
 * `MonacoEnvironment` synchrone puis import npm + `loader.config` avant le premier `<Editor />`.
 * Réapplique les workers après le chunk Monaco (monaco-editor-webpack-plugin peut écraser l’env).
 */
export function ensureMonacoReady(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  applyMonacoWorkerEnvironment();

  if (!ensurePromise) {
    ensurePromise = (async () => {
      const monaco = await import('monaco-editor');
      applyMonacoWorkerEnvironment();

      // monaco-worker-manager / monaco-tailwindcss appellent `monaco.editor.createWebWorker({ moduleId, label, createData })`.
      // Monaco ≥ 0.55 : seul l’export `createWebWorker` de `editor.main` (workers.js) gère ce format ; `monaco.editor.createWebWorker` attend `opts.worker`.
      if (!createWebWorkerPatchApplied) {
        createWebWorkerPatchApplied = true;
        const shim = monaco.createWebWorker;
        if (typeof shim === 'function') {
          const original = monaco.editor.createWebWorker.bind(monaco.editor);
          monaco.editor.createWebWorker = ((opts: {
            worker?: Worker | Promise<Worker>;
            moduleId?: string;
            label?: string;
            createData?: unknown;
            host?: Record<string, (...args: unknown[]) => unknown>;
            keepIdleModels?: boolean;
          }) => {
            if (opts?.worker != null) {
              return original(opts as Parameters<typeof original>[0]);
            }
            return shim(opts as Parameters<typeof shim>[0]) as ReturnType<typeof original>;
          }) as typeof monaco.editor.createWebWorker;
        }
      }

      loader.config({ monaco });
    })();
  }

  return ensurePromise;
}
