/**
 * Utility functions for chart handling in the application
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const CHART_TYPES = {
  line: 'Line Chart',
  bar: 'Bar Chart',
  pie: 'Pie Chart',
  doughnut: 'Doughnut Chart',
  radar: 'Radar Chart',
  polarArea: 'Polar Area',
  bubble: 'Bubble Chart',
  scatter: 'Scatter Plot',
} as const;

export type ParsedChartTabular = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
};

/**
 * JavaScript snippet for iframe / PDF export. Must stay aligned with {@link isChartDataValidForType}.
 */
export const CHART_DATA_VALIDATION_SCRIPT_SNIPPET = `
function normalizeChartType(t) {
  return String(t == null ? '' : t).trim().toLowerCase();
}
function isChartDataValidForType(chartData, chartTypeRaw) {
  var t = normalizeChartType(chartTypeRaw);
  if (!chartData || typeof chartData !== 'object') return false;
  var cd = chartData;
  if (!Array.isArray(cd.datasets) || cd.datasets.length === 0) return false;
  if (t === 'scatter' || t === 'bubble') return true;
  if (!Array.isArray(cd.labels) || cd.labels.length === 0) return false;
  return true;
}
`.trim();

export function normalizeChartType(chartType: string | null | undefined): string {
  return String(chartType ?? '')
    .trim()
    .toLowerCase();
}

/** Chart.js `data` object: datasets required; labels required (non-empty) except scatter/bubble. */
export function isChartDataValidForType(chartData: unknown, chartType: string | null): boolean {
  if (!chartData || typeof chartData !== 'object') return false;
  const o = chartData as { labels?: unknown; datasets?: unknown };
  if (!Array.isArray(o.datasets) || o.datasets.length === 0) return false;
  const t = normalizeChartType(chartType);
  if (t === 'scatter' || t === 'bubble') return true;
  if (!Array.isArray(o.labels) || o.labels.length === 0) return false;
  return true;
}

/**
 * Generates sample chart data based on the chart type
 * @param type The type of chart to generate data for
 * @returns Sample chart data appropriate for the chart type
 */
export function generateChartData(type: keyof typeof CHART_TYPES) {
  const labels = Array.from({ length: 6 }, (_, i) => `Label ${i + 1}`);

  switch (type) {
    case 'line':
    case 'bar':
      return {
        labels,
        datasets: [
          {
            label: 'Dataset 1',
            data: labels.map(() => Math.floor(Math.random() * 100)),
            borderColor: '#3B82F6',
            backgroundColor: '#60A5FA',
          },
          {
            label: 'Dataset 2',
            data: labels.map(() => Math.floor(Math.random() * 100)),
            borderColor: '#10B981',
            backgroundColor: '#34D399',
          },
        ],
      };

    case 'pie':
    case 'doughnut':
    case 'polarArea':
      return {
        labels: labels.slice(0, 4),
        datasets: [
          {
            data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100)),
            backgroundColor: ['#3B82F6', '#10B981', '#6366F1', '#EC4899'],
          },
        ],
      };

    case 'radar':
      return {
        labels: Array.from({ length: 5 }, (_, i) => `Category ${i + 1}`),
        datasets: [
          {
            label: 'Dataset',
            data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
          },
        ],
      };

    case 'bubble':
      return {
        datasets: [
          {
            label: 'Dataset',
            data: Array.from({ length: 10 }, () => ({
              x: Math.floor(Math.random() * 200) - 100,
              y: Math.floor(Math.random() * 200) - 100,
              r: Math.floor(Math.random() * 15) + 5,
            })),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
        ],
      };

    case 'scatter':
      return {
        datasets: [
          {
            label: 'Dataset',
            data: Array.from({ length: 10 }, () => ({
              x: Math.floor(Math.random() * 200) - 100,
              y: Math.floor(Math.random() * 200) - 100,
            })),
            backgroundColor: '#3B82F6',
          },
        ],
      };

    default:
      return {
        labels,
        datasets: [
          {
            label: 'Dataset',
            data: labels.map(() => Math.floor(Math.random() * 100)),
          },
        ],
      };
  }
}

/**
 * Processes a template to handle chart data in Handlebars templates
 * @param code The template code
 * @returns The processed template with placeholders for chart data
 */
export function processChartData(code: string) {
  // Process the template to properly stringify chart data
  let processedCode = code;

  // Find all instances of data-chart-data='{{...}}' and replace with stringified JSON
  const chartDataRegex = /data-chart-data=['"]{{([^}]+)}}/g;
  let match;
  while ((match = chartDataRegex.exec(code)) !== null) {
    const path = match[1].trim();
    // Create a placeholder that we can replace with actual stringified data
    const placeholder = `__CHART_DATA_${path.replace(/\./g, '_')}__`;
    processedCode = processedCode.replace(match[0], `data-chart-data='${placeholder}'`);
  }

  return processedCode;
}

/**
 * Replaces chart data placeholders in rendered content with actual stringified data
 * @param renderedContent The rendered content with placeholders
 * @param variables The variables containing chart data
 * @returns The content with placeholders replaced by actual data
 */
export function replaceChartDataPlaceholders(
  renderedContent: string,
  variables: Record<string, any>,
) {
  let result = renderedContent;
  const placeholderRegex = /__CHART_DATA_([^_]+(?:_[^_]+)*)__/g;
  let match;

  while ((match = placeholderRegex.exec(renderedContent)) !== null) {
    const path = match[1].replace(/_/g, '.');
    const pathParts = path.split('.');

    // Navigate to the data
    let chartData: any = variables;
    for (const part of pathParts) {
      if (chartData && typeof chartData === 'object' && part in chartData) {
        chartData = chartData[part];
      } else {
        chartData = {};
        break;
      }
    }

    // Replace placeholder with stringified data
    if (chartData) {
      result = result.replace(match[0], JSON.stringify(chartData).replace(/'/g, "\\'"));
    }
  }

  return result;
}

/** Parse JSON file content into Chart.js `data` (minimal validation). */
export function parseChartJsonFile(text: string): unknown {
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Le fichier doit contenir un objet JSON.');
  }
  const o = parsed as { datasets?: unknown };
  if (!Array.isArray(o.datasets) || o.datasets.length === 0) {
    throw new Error('Le JSON doit contenir "datasets" : tableau non vide (format Chart.js).');
  }
  return parsed;
}

function parseChartGridRows(rows: string[][]): ParsedChartTabular {
  const data = rows
    .map((r) => r.map((c) => String(c ?? '').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')))
    .filter((r) => r.some((c) => c.length > 0));
  if (data.length < 2) {
    throw new Error('Tableau : au moins une ligne d’en-tête et une ligne de données.');
  }
  const header = data[0];
  if (header.length < 2) {
    throw new Error('Colonne 1 = libellé, colonnes suivantes = valeurs numériques par série.');
  }
  const labels: string[] = [];
  const datasetCount = header.length - 1;
  const series: number[][] = Array.from({ length: datasetCount }, () => []);
  for (let i = 1; i < data.length; i++) {
    const cells = data[i];
    labels.push(cells[0] ?? '');
    for (let j = 0; j < datasetCount; j++) {
      const n = parseFloat(String(cells[j + 1] ?? '').replace(',', '.'));
      series[j].push(Number.isFinite(n) ? n : 0);
    }
  }
  const palette = ['#3B82F6', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#14B8A6'];
  const datasets = header.slice(1).map((label, idx) => ({
    label,
    data: series[idx],
    borderColor: palette[idx % palette.length],
    backgroundColor: palette[idx % palette.length],
  }));
  return { labels, datasets };
}

/**
 * CSV / TSV tabulaire via PapaParse : ligne 1 = en-têtes, colonne 1 = libellés, suivantes = séries.
 */
export function parseChartCsvWithPapa(csvText: string): ParsedChartTabular {
  const trimmed = csvText.trim();
  if (!trimmed) {
    throw new Error('Fichier vide.');
  }
  const firstLine = trimmed.split(/\r?\n/).find((l) => l.trim().length > 0) ?? '';
  const delim = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
  const result = Papa.parse<string[]>(trimmed, {
    delimiter: delim,
    header: false,
    skipEmptyLines: 'greedy',
  });
  if (result.errors?.length) {
    const msg = result.errors[0]?.message || 'CSV invalide';
    throw new Error(msg);
  }
  const raw = (result.data as string[][]).filter((row) =>
    row.some((cell) => String(cell ?? '').trim().length > 0),
  );
  return parseChartGridRows(raw);
}

/**
 * @deprecated Utiliser {@link parseChartCsvWithPapa}. Conservé pour compatibilité d’import.
 */
export function parseChartCsvToData(csvText: string): ParsedChartTabular {
  return parseChartCsvWithPapa(csvText);
}

/** Première feuille Excel → même grille que CSV. */
export function parseChartExcelFile(buffer: ArrayBuffer): ParsedChartTabular {
  const wb = XLSX.read(buffer, { type: 'array' });
  if (!wb.SheetNames.length) {
    throw new Error('Excel : aucune feuille.');
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as string[][];
  return parseChartGridRows(rows);
}

export type ChartBinding = { chartId: string; chartType?: string };

/** Liste les graphiques référencés dans le HTML (placeholders {{charts.id}}). */
export function extractChartBindingsFromTemplate(html: string): ChartBinding[] {
  const re = /data-chart-data=['"]\{\{charts\.([^}]+)}}['"]/g;
  const seen = new Set<string>();
  const out: ChartBinding[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const chartId = m[1].trim();
    if (!chartId || seen.has(chartId)) continue;
    seen.add(chartId);
    const escaped = chartId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRe1 = new RegExp(
      `<canvas[^>]*id=["']${escaped}["'][^>]*data-chart-type=["']([^"']+)["']`,
      'i',
    );
    const blockRe2 = new RegExp(
      `<canvas[^>]*data-chart-type=["']([^"']+)["'][^>]*id=["']${escaped}["']`,
      'i',
    );
    const mt = html.match(blockRe1) || html.match(blockRe2);
    out.push({ chartId, chartType: mt?.[1] });
  }
  return out;
}
