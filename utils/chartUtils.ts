/**
 * Utility functions for chart handling in the application
 */

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
export function replaceChartDataPlaceholders(renderedContent: string, variables: Record<string, any>) {
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
      result = result.replace(
        match[0],
        JSON.stringify(chartData).replace(/'/g, "\\'")
      );
    }
  }

  return result;
} 