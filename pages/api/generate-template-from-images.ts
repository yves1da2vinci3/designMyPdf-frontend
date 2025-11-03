import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Buffer } from 'buffer'; // Explicit import for Buffer

// --- CONFIGURATION ANTHROPIC ---
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});




// --- HELPER FUNCTIONS ---

/**
 * Fetches an image from a URL and converts it to a base64 string.
 * @param url The public URL of the image.
 * @returns An object containing the base64 data and the mime type.
 * @throws Error if fetching fails or content type is not an image.
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max size to prevent OOM
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch image, status code: ${response.status}`);
    }

    const contentType = response.headers['content-type'] || 'image/jpeg';

    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
    }

    const base64Data = Buffer.from(response.data).toString('base64');
    return { data: base64Data, mimeType: contentType };
  } catch (error: any) {
    // Re-throw specific error messages for better debugging
    console.error(`Error fetching image from ${url}:`, error.message);
    throw new Error(`Failed to fetch image from ${url}: ${error.message}`);
  }
}

// Chart types for mock data generation
const CHART_TYPES = {
  line: 'line',
  bar: 'bar',
  pie: 'pie',
  doughnut: 'doughnut',
  radar: 'radar',
  polarArea: 'polarArea',
  bubble: 'bubble',
  scatter: 'scatter',
} as const;

/**
 * Generates mock chart data based on the chart type.
 * @param type The type of chart.
 * @returns Mock data structure compatible with Chart.js.
 */
function generateChartData(type: keyof typeof CHART_TYPES): { labels: string[]; datasets: any[] } {
  const labels = Array.from({ length: 6 }, () => faker.date.month());

  switch (type) {
    case 'line':
    case 'bar':
      return {
        labels,
        datasets: [
          {
            label: faker.commerce.department(),
            data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
            borderColor: faker.color.rgb(),
            backgroundColor: faker.color.rgb(),
            fill: false,
          },
          {
            label: faker.commerce.department(),
            data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
            borderColor: faker.color.rgb(),
            backgroundColor: faker.color.rgb(),
            fill: false,
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
            data: Array.from({ length: 4 }, () => faker.number.int({ min: 10, max: 100 })),
            backgroundColor: Array.from({ length: 4 }, () => faker.color.rgb()),
          },
        ],
      };

    case 'radar':
      return {
        labels: Array.from({ length: 5 }, () => faker.commerce.department()),
        datasets: [
          {
            label: faker.commerce.department(),
            data: Array.from({ length: 5 }, () => faker.number.int({ min: 0, max: 100 })),
            borderColor: faker.color.rgb(),
            backgroundColor: faker.color.rgb(),
            fill: true,
          },
        ],
      };

    case 'bubble':
      return {
        labels: [],
        datasets: [
          {
            label: faker.commerce.department(),
            data: Array.from({ length: 10 }, () => ({
              x: faker.number.int({ min: -100, max: 100 }),
              y: faker.number.int({ min: -100, max: 100 }),
              r: faker.number.int({ min: 5, max: 20 }),
            })),
            backgroundColor: faker.color.rgb(),
          },
        ],
      };

    case 'scatter':
      return {
        labels: [],
        datasets: [
          {
            label: faker.commerce.department(),
            data: Array.from({ length: 10 }, () => ({
              x: faker.number.int({ min: -100, max: 100 }),
              y: faker.number.int({ min: -100, max: 100 }),
            })),
            backgroundColor: faker.color.rgb(),
          },
        ],
      };

    default:
      return {
        labels,
        datasets: [
          {
            label: faker.commerce.department(),
            data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
          },
        ],
      };
  }
}

/**
 * Analyzes the Handlebars template to extract all required variables,
 * including those used within custom helpers like 'if_eq' if possible.
 * @param template The Handlebars template string.
 * @returns A Map detailing all discovered variables and their required structure.
 */
function extractVariablesFromTemplate(
  template: string,
): Map<
  string,
  { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
> {
  const variables = new Map<
    string,
    { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
  >();

  // Regex to capture {{#each someArray}} blocks
  const eachBlockRegex = /{{#each\s+([\w\.]+)}}\s*([\s\S]*?)\s*{{\/each}}/g;
  let eachMatch;

  while ((eachMatch = eachBlockRegex.exec(template)) !== null) {
    const arrayPath = eachMatch[1]; // e.g., 'items' or 'company.users'
    const blockContent = eachMatch[2];
    const itemProps = new Set<string>();

    // Detect properties accessed via 'this.prop' or 'prop' within the each block
    // Also captures variables used in helpers like {{#if_eq @index ../this.level 'lt'}}
    const thisPropRegex = /{{(?:this\.)?([\w\.]+)(?:\s|$|}})/g; // Captures 'this.prop' or 'prop' up to a space or closing braces
    let propMatch;

    while ((propMatch = thisPropRegex.exec(blockContent)) !== null) {
      // Exclude Handlebars keywords and common helpers, and internal Handlebars variables
      const propName = propMatch[1].split('.')[0]; // Only take the root property name for now
      if (!['if', 'unless', 'else', 'each', 'this', 'times', 'if_eq', '@index', '@key', '@first', '@last'].includes(propName)) {
        itemProps.add(propName);
      }
    }

    const arrayItemStructure = Array.from(itemProps).reduce(
      (obj, prop) => {
        obj[prop] = getExampleValue(prop); // Generates a mock value for the property
        return obj;
      },
      {} as Record<string, any>,
    );

    variables.set(arrayPath, {
      type: 'array',
      path: arrayPath.split('.'),
      arrayItemStructure,
    });
  }

  // Regex to capture general variables like {{variable}}, {{user.name}}
  // Excludes #, /, else, !, @, and content within #each blocks (already handled)
  const variableRegex = /\{\{(?!#|\/|else|!|@)([^{}\s]+?)(?:\s|$|}})/g;
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    const content = match[1].trim();
    const rawVariable = content.split(/\s/)[0]; // Takes the first part if there are spaces

    if (rawVariable && !variables.has(rawVariable) && !rawVariable.startsWith('@')) {
      const varPath = rawVariable.split('.');
      const rootVar = varPath[0];

      if (!variables.has(rootVar)) {
        if (varPath.length > 1) {
          variables.set(rootVar, { type: 'object', path: [rootVar] });
        } else {
          variables.set(rootVar, { type: 'value', path: [rootVar] });
        }
      }

      // For nested properties like user.name or company.address.city
      if (varPath.length > 1) {
        let currentPath = '';
        for (let i = 0; i < varPath.length - 1; i++) {
          currentPath += (currentPath ? '.' : '') + varPath[i];
          if (!variables.has(currentPath)) {
            variables.set(currentPath, { type: 'object', path: currentPath.split('.') });
          }
        }
        // Add the leaf variable
        if (!variables.has(rawVariable)) {
          variables.set(rawVariable, { type: 'value', path: varPath });
        }
      }
    }
  }

  return variables;
}

/**
 * Builds a mock JSON data structure based on the extracted variables.
 * @param variables The map of extracted variables.
 * @param template The original template (optional, used to detect chart requirements).
 * @returns A mock data object.
 */
function buildVariableStructure(
  variables: Map<
    string,
    { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
  >,
  template?: string,
): Record<string, any> {
  const structure: Record<string, any> = {};

  // Helper to safely set nested properties
  const setNestedProperty = (obj: Record<string, any>, path: string[], value: any) => {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (!current[segment] || typeof current[segment] !== 'object' || Array.isArray(current[segment])) {
        current[segment] = {}; // Initialize as object if not already
      }
      current = current[segment];
    }
    current[path[path.length - 1]] = value;
  };

  // First pass: Initialize root level objects and arrays and direct values
  for (const [varKey, varInfo] of Array.from(variables.entries())) {
    if (varInfo.path.length === 1) { // Only process root-level variables initially
      if (varInfo.type === 'array') {
        const itemCount = faker.number.int({ min: 2, max: 4 });
        const items = Array.from({ length: itemCount }, () => {
          const baseItem = varInfo.arrayItemStructure || {};
          return Object.entries(baseItem).reduce(
            (obj, [prop]) => {
              // Only generate value if it's not a nested object that will be filled later
              if (varInfo.arrayItemStructure && typeof varInfo.arrayItemStructure[prop] !== 'object') {
                 obj[prop] = getExampleValue(prop);
              } else if (varInfo.arrayItemStructure && typeof varInfo.arrayItemStructure[prop] === 'object' && varInfo.arrayItemStructure[prop] !== null) {
                 obj[prop] = {}; // Initialize nested object
              }
              return obj;
            },
            {} as Record<string, any>,
          );
        });
        structure[varKey] = items;
      } else if (varInfo.type === 'object') {
        structure[varKey] = {};
      } else { // type === 'value' for root-level simple values
        structure[varKey] = getExampleValue(varKey);
      }
    }
  }

  // Second pass: Fill in all nested values for objects, for both direct access and array items
  for (const [varKey, varInfo] of Array.from(variables.entries())) {
    if (varInfo.path.length > 1) {
      if (varInfo.type === 'value') {
        setNestedProperty(structure, varInfo.path, getExampleValue(varInfo.path[varInfo.path.length - 1]));
      } else if (varInfo.type === 'object') {
        setNestedProperty(structure, varInfo.path, {}); // Just ensure the object path exists
      }
    }
  }

  // Third pass: Add chart data if detected in the template
  // This part remains largely the same as it's Chart.js specific
  if (template) {
    const chartRegex = /data-chart-type=["'](\w+)["']\s+data-chart-data=["']{{charts\.(\w+)}}["']/g;
    let chartMatch;
    const detectedCharts = new Map<string, string>();

    while ((chartMatch = chartRegex.exec(template)) !== null) {
      const chartType = chartMatch[1];
      const chartName = chartMatch[2];
      detectedCharts.set(chartName, chartType);
    }

    if (detectedCharts.size > 0 || variables.has('charts')) {
      structure.charts = structure.charts || {};

      Array.from(detectedCharts.entries()).forEach(([chartName, chartType]) => {
        if (chartType && CHART_TYPES[chartType as keyof typeof CHART_TYPES]) {
          structure.charts[chartName] = generateChartData(chartType as keyof typeof CHART_TYPES);
        }
      });

      // Fallback for when 'charts' is just referenced without data-chart-type
      if (Object.keys(structure.charts).length === 0 && variables.has('charts')) {
        structure.charts.salesChart = generateChartData('bar');
        structure.charts.statsChart = generateChartData('pie');
      }
    }
  }

  return structure;
}


/**
 * Generates a mock value based on the property name using faker-js.
 * Prioritizes more specific CV-related properties.
 * @param prop The variable name (e.g., 'firstName', 'invoiceNumber').
 * @returns A generated mock value.
 */
function getExampleValue(prop: string): any {
  // Normalize property name for pattern matching
  const propLower = prop.toLowerCase().replace(/[_\s-]/g, '');

  // --- CV SPECIFIC MAPPING ---
  if (propLower === 'name' || propLower.includes('fullname')) return faker.person.fullName();
  if (propLower.includes('title') || propLower.includes('jobtitle')) return faker.person.jobTitle();
  if (propLower.includes('location') || propLower.includes('city')) return faker.location.city();
  if (propLower.includes('phone') || propLower.includes('contact')) return faker.phone.number();
  if (propLower.includes('email')) return faker.internet.email();
  if (propLower.includes('presentation') || propLower.includes('summary')) return faker.lorem.paragraph(3);
  if (propLower.includes('company') || propLower.includes('institution')) return faker.company.name();
  if (propLower.includes('duration') || propLower.includes('years')) return `${faker.date.past({years: 5}).getFullYear()} – ${faker.date.future({years: 1}).getFullYear()}`;
  if (propLower.includes('degree') || propLower.includes('qualification')) return faker.helpers.arrayElement(['Bachelor of Science', 'Master of Business Administration', 'Doctor of Philosophy', 'Bachelor of Arts']);
  if (propLower.includes('description') || propLower.includes('details')) return faker.lorem.paragraphs(2);
  if (propLower === 'level' || propLower.includes('rating')) return faker.number.int({ min: 1, max: 6 }); // For skill/language levels
  if (propLower.includes('url') || propLower.includes('link')) return faker.internet.url();
  if (propLower.includes('interest') || propLower.includes('hobby')) return faker.lorem.word(); // For array items in interests
  if (propLower.includes('skill') || propLower.includes('language')) return faker.lorem.word(); // For array items in skills/languages
  // --- END CV SPECIFIC MAPPING ---


  // --- GENERAL FAKER MAPPING ---
  // Person/Contact
  if (propLower.includes('firstname') || propLower.includes('fname')) return faker.person.firstName();
  if (propLower.includes('lastname') || propLower.includes('lname') || propLower.includes('surname')) return faker.person.lastName();
  if (propLower.includes('gender') || propLower.includes('sex')) return faker.person.gender();

  // Internet/Address
  if (propLower.includes('address') || propLower.includes('street')) return faker.location.streetAddress();
  if (propLower.includes('country') || propLower.includes('nation')) return faker.location.country();
  if (propLower.includes('zipcode') || propLower.includes('zip') || propLower.includes('postal')) return faker.location.zipCode();

  // Company/Business
  if (propLower.includes('organization') || propLower.includes('business')) return faker.company.name();
  if (propLower.includes('department') || propLower.includes('division')) return faker.commerce.department();

  // Finance/Commerce
  if (propLower.includes('price') || propLower.includes('unitprice') || propLower.includes('cost') || propLower.includes('amount')) return Number(faker.commerce.price());
  if (propLower.includes('product') || propLower.includes('item') || propLower.includes('service')) return faker.commerce.productName();
  if (propLower.includes('quantity') || propLower.includes('qty') || propLower.includes('count') || propLower.includes('units')) return faker.number.int({ min: 1, max: 100 });
  if (propLower.includes('total') || propLower.includes('subtotal') || propLower.includes('grandtotal') || propLower.includes('sum')) return Number(faker.commerce.price({ min: 100, max: 1000 }));
  if (propLower.includes('tax') || propLower.includes('vat') || propLower.includes('gst')) return Number(faker.commerce.price({ min: 0, max: 100 }));
  if (propLower.includes('currency') || propLower.includes('currencycode')) return faker.finance.currencyCode();

  // Date/Time
  if (propLower.includes('issuedate') || propLower.includes('createdate')) return faker.date.recent({ days: 30 }).toISOString().split('T')[0];
  if (propLower.includes('duedate') || propLower.includes('enddate')) return faker.date.soon({ days: 30 }).toISOString().split('T')[0];
  if (propLower.includes('date')) return faker.date.recent().toISOString().split('T')[0];

  // ID/Reference
  if (propLower.includes('invoicenumber') || propLower.includes('invoice_number')) return `INV-${faker.number.int({ min: 10000, max: 99999 })}`;
  if (propLower.includes('ordernumber') || propLower.includes('order_number')) return `ORD-${faker.number.int({ min: 10000, max: 99999 })}`;
  if (propLower.includes('id')) return faker.string.alphanumeric(8).toUpperCase();
  if (propLower.includes('reference')) return faker.string.alphanumeric(10).toUpperCase();
  if (propLower.includes('number')) return faker.number.int({ min: 1000, max: 9999 });

  // Text/Content
  if (propLower.includes('summary') || propLower.includes('abstract') || propLower.includes('overview')) return faker.lorem.paragraph();
  if (propLower.includes('content') || propLower.includes('body') || propLower.includes('text')) return faker.lorem.paragraphs();

  // Visual/URL
  if (propLower.includes('image') || propLower.includes('picture') || propLower.includes('photo') || propLower.includes('avatar')) return faker.image.url();

  // Boolean/Status
  if (propLower.startsWith('is') || propLower.startsWith('has') || propLower.startsWith('show')) return faker.datatype.boolean();
  if (propLower.includes('status') || propLower.includes('state')) return faker.helpers.arrayElement(['Active', 'Pending', 'Completed', 'Cancelled']);

  // Default fallback
  return faker.lorem.word();
}

// --- MAIN HANDLER ---

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrls } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ error: 'At least one image URL is required' });
    }

    // Basic URL validation
    for (const url of imageUrls) {
      if (typeof url !== 'string' || !url.match(/^(https?:\/\/|\/uploads\/)/)) {
        return res.status(400).json({ error: `Invalid image URL format: ${url}` });
      }
    }

    let template: string;
    try {
      // Prepare image parts for the model
      const imageParts: any[] = await Promise.all(
        imageUrls.map(async (url: string) => {
          let base64Data: string;
          let mimeType: string;

          if (url.startsWith('/uploads/')) {
            // Local file path handling (e.g., from public folder in Next.js)
            const filePath = path.join(process.cwd(), 'public', url);
            if (!fs.existsSync(filePath)) {
              console.error(`File not found at local path: ${filePath} for URL: ${url}`);
              throw new Error(`Local file not found: ${url}`);
            }
            const fileData = fs.readFileSync(filePath);
            base64Data = Buffer.from(fileData).toString('base64');
            mimeType = `image/${path.extname(url).substring(1)}`; // Basic mime type from extension
          } else {
            // Remote URL fetching
            const fetchedImage = await fetchImageAsBase64(url); // This function now throws detailed errors
            base64Data = fetchedImage.data;
            mimeType = fetchedImage.mimeType;
          }

          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Data,
            },
          };
        }),
      );

      // --- PROMPT OPTIMISÉ POUR FIDÉLITÉ MAXIMALE AU DESIGN ---
      const templatePrompt = `You are an EXPERT UI/UX designer specialized in generating production-ready HTML templates using Tailwind CSS and Handlebars. Your SOLE goal is to create a **PERFECT, PIXEL-PERFECT, STUNNING reproduction** of the provided image(s).

**CRITICAL GUIDELINES FOR MAXIMAL FIDELITY & CODE QUALITY:**
1.  **ABSOLUTE DESIGN FIDELITY:** Reproduce **EVERY SINGLE VISUAL DETAIL**. This includes exact colors, precise spacing, font weights, sizes, border radii, shadows, and alignment.
2.  **NO SIMPLIFICATION, NO ABBREVIATION:** Generate **ALL** necessary code, including the most detailed Tailwind CSS classes. **NEVER use ellipsis (...) or omit parts of the HTML/Tailwind.** The generated code must be complete and standalone.
3.  **FLUID AND RESPONSIVE:** The template must be fluid and responsive, **WITHOUT fixed page size constraints** (like A4). Use relative units (rem, %, vw) for font sizes and spacing where appropriate for adaptability.

User requirement: ${prompt}

---
🎨 **DESIGN ANALYSIS & TYPOGRAPHY HIERARCHY:**
-   **Exact Colors:** Extract and use **EXACT color values** (e.g., bg-blue-600, text-gray-900). If a specific color is used (e.g., \`#FF00FF\`), represent it with a custom Tailwind class or direct style if no existing class matches.
-   **Typography Hierarchy:** Use semantic HTML tags (H1, H2, H3, P, UL/OL) to reproduce the exact structure, font families, weights (e.g., font-extrabold), sizes (e.g., text-4xl), and line heights.
-   **Images/Icons:** For all images (logos, avatars, icons), **ALWAYS** use an \`<img>\` tag or SVG with a Handlebars \`src\` attribute. Example: \`<img src="{{company.logoUrl}}" alt="Logo" class="h-12 w-auto">\`. **NEVER embed specific image URLs (Base64 or external) directly in the HTML.**

---
📐 **LAYOUT AND STRUCTURE - CRITICAL PRECISION:**
1.  **STRICT SEMANTICS:** **NEVER** use \`div\` for titles, lists, or headers. Use \`h1\`, \`h2\`, \`ul\`/\`ol\`, \`header\`, \`footer\`, \`table\`, etc., as appropriate.
2.  **PERFECT ALIGNMENT:** Use \`flex\` or \`grid\` de manière cohérente. **ALL** list items (e.g., invoice lines, table rows) must be perfectly aligned horizontally and vertically as per the image.
3.  **EXACT SPACING AND DEPTH:** Replicate spacing (margins, padding, gap) and visual depth (shadows, rounded corners) with **EXTREME PRECISION**.
4.  **DOCUMENT COMPLETION:** The footer and all final elements must be as detailed and stylized as the header (check spacing, fonts, and borders).

---
🔧 **HANDLEBARS & DATA (MANDATORY):**
You must use Handlebars variables for **ALL** dynamic content.

-   **CRITICAL: Use Provided Handlebars Helpers:** For numerical loops (e.g., generating skill level stars \`◆\`) or conditional comparisons, utilize the standard Handlebars syntax. Assume \`{{#times N}}\` and \`{{#if_eq v1 v2 operator}}\` helpers are available and use them appropriately. Example for skill levels:
    \`\`\`html
    <div class="flex space-x-0.5">
        {{#times 6}}
            <span class="{{#if_eq @index ../this.level 'lt'}}text-black{{else}}text-gray-300{{/if_eq}}">◆</span>
        {{/times}}
    </div>
    \`\`\`
-   **Variable Formatting (CRITICAL):** To assist the rendering tool, you **MUST** add a Handlebars comment above variables requiring specific formatting (currency or date).
    -   Example Currency: \`{{! format as EUR }}\`{{invoice.total}}
    -   Example Date: \`{{! format as YYYY-MM-DD }}\`{{invoice.dueDate}}
-   **Required Variable Access:** \`{{variable}}\`, \`{{user.name}}\`, \`{{#each items}}{{this.name}}{{/each}}\`.

---
📊 **CHARTS & DATA VISUALIZATION:**
Use the specialized \`<canvas>\` syntax for charts if the image contains any:
\`<canvas id="uniqueId" data-chart-type="[type]" data-chart-data='{{charts.chartName}}'></canvas>\`

---
🎯 **ABSOLUTE QUALITY REQUIREMENTS:**
✓ Code generated from A to Z (no ellipses \`...\` or placeholders).
✓ Layout perfectly structured, aligned, and pixel-perfect.
✓ Consistent and precise use of Tailwind CSS classes, even for minute details.
✓ Code is ready to be injected directly into a \`<div>\` without external JS or \`<html>\`/\`<body>\` tags.

OUTPUT FORMAT:
-   The OUTPUT MUST START AND END WITH AN HTML TAG. For example, start with \`<div class="...">\` and end with \`</div>\`.
-   ONLY inner HTML (no DOCTYPE, html, head, body).
-   NO JavaScript, NO explanations, NO markdown code fences (\`\`\`html).
-   Clean semantic HTML5.
-   Professional Tailwind CSS classes.
-   Brief section comments ONLY.

**DELIVER A STUNNING, PROFESSIONAL, PIXEL-PERFECT DESIGN. Your job depends on it. Return HTML now:**`;
      // --- FIN PROMPT OPTIMISÉ ---


      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              ...imageParts,
              {
                type: 'text',
                text: templatePrompt,
              },
            ],
          },
        ],
      });

      if (msg.content.length === 0 || msg.content[0].type !== 'text') {
        throw new Error('Invalid response from AI model: No text content received.');
      }
      template = msg.content[0].text.trim();

      // Clean up markdown block if present in the response
      // This is crucial if the AI still occasionally adds code fences despite the prompt
      if (template.startsWith('```html')) {
        template = template
          .replace(/^```html\n?/g, '') // Remove starting ```html
          .replace(/```\s*$/g, '') // Remove ending ```
          .trim();
      } else if (template.startsWith('```')) {
        template = template
          .replace(/^```\n?/g, '')
          .replace(/```\s*$/g, '')
          .trim();
      }

      const extractedVars = extractVariablesFromTemplate(template);
      const suggestedVariables = buildVariableStructure(extractedVars, template);

      return res.status(200).json({
        content: template,
        suggestedVariables,
      });
    } catch (error: any) {
      console.error('Error generating template from images:', error);
      return res.status(500).json({
        error: 'Failed to generate template from images',
        details: error?.message || 'Unknown error',
      });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error?.message || 'Unknown error',
    });
  }
}