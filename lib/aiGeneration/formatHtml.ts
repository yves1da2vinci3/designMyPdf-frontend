import { html as htmlBeautify } from 'js-beautify';

/** Indente le fragment HTML pour l’éditeur Monaco. */
export function formatEditorHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return html;

  try {
    return htmlBeautify(trimmed, {
      indent_size: 2,
      indent_inner_html: true,
      wrap_line_length: 0,
      preserve_newlines: false,
      max_preserve_newlines: 1,
      indent_handlebars: true,
      extra_liners: [],
    }).trim();
  } catch {
    return trimmed;
  }
}
