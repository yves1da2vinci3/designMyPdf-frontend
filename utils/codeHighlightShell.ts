/** highlight.js CDN — bundle complet (toutes langues, ex. go). */
export const CODE_HIGHLIGHT_CDN_VERSION = '11.11.1';

/** Thème : github-dark (meilleur contraste Go que atom-one-dark sur fond sombre). */
export const CODE_HIGHLIGHT_THEME = 'github-dark';

/** Classe body : preview + export — code wrap dans les blocs. */
export const CODE_HIGHLIGHT_FIT_BODY_CLASS = 'dmp-code-fit';

/** @deprecated Utiliser CODE_HIGHLIGHT_FIT_BODY_CLASS */
export const CODE_HIGHLIGHT_PDF_BODY_CLASS = CODE_HIGHLIGHT_FIT_BODY_CLASS;

const CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/${CODE_HIGHLIGHT_CDN_VERSION}`;

/** Overrides contraste : Tailwind / template ne doit pas écraser les tokens hljs. */
export function codeHighlightContrastCss(): string {
  return `
      pre > code.hljs,
      pre > code[class*="language-"] {
        background: #0d1117 !important;
        color: #e6edf3 !important;
      }
      pre > code.hljs .hljs-comment,
      pre > code.hljs .hljs-quote { color: #8b949e !important; }
      pre > code.hljs .hljs-keyword,
      pre > code.hljs .hljs-selector-tag,
      pre > code.hljs .hljs-literal { color: #ff7b72 !important; }
      pre > code.hljs .hljs-string,
      pre > code.hljs .hljs-doctag,
      pre > code.hljs .hljs-regexp { color: #a5d6ff !important; }
      pre > code.hljs .hljs-title,
      pre > code.hljs .hljs-section,
      pre > code.hljs .hljs-type,
      pre > code.hljs .hljs-built_in,
      pre > code.hljs .hljs-class .hljs-title { color: #d2a8ff !important; }
      pre > code.hljs .hljs-function,
      pre > code.hljs .hljs-title.function_ { color: #d2a8ff !important; }
      pre > code.hljs .hljs-attr,
      pre > code.hljs .hljs-attribute,
      pre > code.hljs .hljs-variable,
      pre > code.hljs .hljs-template-variable { color: #79c0ff !important; }
      pre > code.hljs .hljs-number,
      pre > code.hljs .hljs-symbol { color: #79c0ff !important; }
      pre > code.hljs .hljs-meta,
      pre > code.hljs .hljs-meta .hljs-keyword { color: #8b949e !important; }
      pre > code.hljs .hljs-params { color: #e6edf3 !important; }
      pre > code.hljs .hljs-name { color: #7ee787 !important; }
    `;
}

/** Code tient dans le bloc — preview + PDF (pas de scroll). */
export function codeHighlightFitCss(): string {
  const body = CODE_HIGHLIGHT_FIT_BODY_CLASS;
  return `
      ${codeHighlightContrastCss()}
      body.${body} *:has(> pre > code[class*="language-"]),
      body.${body} *:has(> pre > code.hljs) {
        overflow: visible !important;
        overflow-x: visible !important;
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      body.${body} pre.hljs-wrap,
      body.${body} pre.hljs,
      body.${body} pre:has(> code[class*="language-"]),
      body.${body} pre:has(> code.hljs) {
        margin: 0.75rem 0;
        padding: 0;
        max-width: 100% !important;
        width: 100% !important;
        box-sizing: border-box !important;
        overflow: visible !important;
        overflow-x: visible !important;
        border-radius: 6px;
        background: #0d1117;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body.${body} pre > code.hljs,
      body.${body} pre > code[class*="language-"] {
        display: block;
        box-sizing: border-box;
        padding: 0.75rem 0.875rem;
        font-size: 0.65rem;
        line-height: 1.5;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        white-space: pre-wrap !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body.${body} pre > code.hljs span,
      body.${body} pre > code.hljs * {
        white-space: inherit !important;
        word-break: inherit !important;
        overflow-wrap: inherit !important;
      }
      @media print {
        body.${body} pre > code.hljs,
        body.${body} pre > code[class*="language-"] {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
      }
    `;
}

/** @deprecated Utiliser codeHighlightFitCss */
export function codeHighlightPdfFitCss(): string {
  return codeHighlightFitCss();
}

/** @deprecated Utiliser codeHighlightFitCss */
export function codeHighlightPreviewCss(): string {
  return codeHighlightFitCss();
}

/** @deprecated Utiliser codeHighlightFitCss */
export function codeHighlightBaseCss(): string {
  return codeHighlightFitCss();
}

/** Tags head : thème + script hljs. */
export function codeHighlightHeadTags(): string {
  return `
    <link rel="stylesheet" href="${CDN_BASE}/styles/${CODE_HIGHLIGHT_THEME}.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="${CDN_BASE}/highlight.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  `;
}

function codeHighlightFitBlocksJs(): string {
  return `
    function fitCodeBlocks() {
      var sel = 'pre > code.hljs, pre > code[class*="language-"]';
      document.querySelectorAll(sel).forEach(function(code) {
        code.style.setProperty('white-space', 'pre-wrap', 'important');
        code.style.setProperty('word-break', 'break-word', 'important');
        code.style.setProperty('overflow-wrap', 'anywhere', 'important');
        code.style.setProperty('width', '100%', 'important');
        code.style.setProperty('max-width', '100%', 'important');
        code.style.setProperty('min-width', '0', 'important');
        code.querySelectorAll('span').forEach(function(span) {
          span.style.setProperty('white-space', 'inherit', 'important');
          span.style.setProperty('word-break', 'inherit', 'important');
          span.style.setProperty('overflow-wrap', 'inherit', 'important');
        });
        var pre = code.parentElement;
        if (pre && pre.tagName === 'PRE') {
          pre.style.setProperty('overflow', 'visible', 'important');
          pre.style.setProperty('overflow-x', 'visible', 'important');
          pre.style.setProperty('max-width', '100%', 'important');
          pre.style.setProperty('width', '100%', 'important');
        }
      });
      document.querySelectorAll('*:has(> pre > code)').forEach(function(el) {
        el.style.setProperty('overflow-x', 'visible', 'important');
        el.style.setProperty('max-width', '100%', 'important');
      });
    }
    function runCodeHighlight() {
      if (typeof window.hljs !== 'undefined' && window.hljs.highlightAll) {
        try {
          window.hljs.highlightAll();
        } catch (e) {
          console.warn('[code-highlight] highlightAll failed', e);
        }
      }
      fitCodeBlocks();
    }
  `;
}

/** Snippet JS réutilisable (preview custom scripts). */
export function codeHighlightRunAndFitJs(): string {
  return codeHighlightFitBlocksJs();
}

/** Preview iframe : highlight + wrap à chaque chargement / rerender. */
export function codeHighlightInitScript(): string {
  return `
(function() {
  ${codeHighlightFitBlocksJs()}
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCodeHighlight);
  } else {
    runCodeHighlight();
  }
})();
`;
}

/** Export PDF : highlight + wrap (async pour Puppeteer). */
export function codeHighlightPdfAwaitScript(): string {
  return `
(function() {
  ${codeHighlightFitBlocksJs()}
  return new Promise(function(resolve) {
    function done() {
      runCodeHighlight();
      setTimeout(resolve, 100);
    }
    done();
  });
})();
`;
}

/** @deprecated Utiliser codeHighlightPdfAwaitScript */
export function codeHighlightAwaitScript(): string {
  return codeHighlightPdfAwaitScript();
}
