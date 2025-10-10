import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Function to fetch image data and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max size
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
    // Silently handle image fetching errors
    throw new Error(`Failed to fetch image from ${url}: ${error.message}`);
  }
}

// Add chart types
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
          },
          {
            label: faker.commerce.department(),
            data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
            borderColor: faker.color.rgb(),
            backgroundColor: faker.color.rgb(),
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

  const eachBlockRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  let eachMatch;
  
  while ((eachMatch = eachBlockRegex.exec(template)) !== null) {
    const arrayName = eachMatch[1];
    const blockContent = eachMatch[2];
    const itemProps = new Set<string>();
    
    const thisRegex = /{{this\.(\w+)}}/g;
    let propMatch;
    
    while ((propMatch = thisRegex.exec(blockContent)) !== null) {
      itemProps.add(propMatch[1]);
    }
    
    const arrayItemStructure = Array.from(itemProps).reduce(
      (obj, prop) => {
        obj[prop] = getExampleValue(prop);
        return obj;
      },
      {} as Record<string, any>,
    );
    
    variables.set(arrayName, {
      type: 'array',
      path: [arrayName],
      arrayItemStructure,
    });
  }

  const variableRegex = /{{(?!#|\/)([\w.]+)(?:\s|}})/g;
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    const rawVariable = match[1].trim();
    
    if (rawVariable && !rawVariable.includes('this.') && !rawVariable.startsWith('if ') && !rawVariable.startsWith('unless ')) {
      const path = rawVariable.split('.');
      const rootVar = path[0];

      if (!variables.has(rootVar)) {
        if (path.length > 1) {
          variables.set(rootVar, { type: 'object', path: [rootVar] });
        } else {
          variables.set(rootVar, { type: 'value', path: [rootVar] });
        }
      }
      
      if (path.length > 1 && !variables.has(rawVariable)) {
        variables.set(rawVariable, { type: 'value', path });
      }
    }
  }

  return variables;
}

function buildVariableStructure(
  variables: Map<
    string,
    { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
  >,
): Record<string, any> {
  const structure: Record<string, any> = {};

  // First pass: Create base structure
  for (const [key, value] of Array.from(variables.entries())) {
    if (value.path.length === 1) {
      if (value.type === 'array') {
        // Generate 2-4 items for the array using the extracted structure
        const itemCount = faker.number.int({ min: 2, max: 4 });
        structure[key] = Array.from({ length: itemCount }, () => {
          const baseItem = value.arrayItemStructure || {};
          // Add some variation to each item
          return Object.entries(baseItem).reduce(
            (obj, [prop]) => {
              obj[prop] = getExampleValue(prop);
              return obj;
            },
            {} as Record<string, any>,
          );
        });
      } else if (value.type === 'object') {
        structure[key] = {};
      } else {
        structure[key] = getExampleValue(key);
      }
    }
  }

  // Second pass: Fill in nested values
  for (const [, value] of Array.from(variables.entries())) {
    if (value.path.length > 1) {
      let current = structure;
      for (const segment of value.path.slice(0, -1)) {
        if (!current[segment]) {
          current[segment] = {};
        }
        current = current[segment];
      }
      current[value.path[value.path.length - 1]] = getExampleValue(
        value.path[value.path.length - 1],
      );
    }
  }

  // Add chart data if template contains chart placeholders
  const chartTypes = Object.keys(CHART_TYPES) as Array<keyof typeof CHART_TYPES>;
  chartTypes.forEach((type) => {
    if (structure.charts?.[type] || structure[`${type}Chart`]) {
      structure.charts = structure.charts || {};
      structure.charts[type] = generateChartData(type);
    }
  });

  return structure;
}

function getExampleValue(prop: string): any {
  const propLower = prop.toLowerCase().replace(/[_\s-]/g, '');

  if (propLower.includes('firstname') || propLower.includes('fname')) {
    return faker.person.firstName();
  }
  if (propLower.includes('lastname') || propLower.includes('lname') || propLower.includes('surname')) {
    return faker.person.lastName();
  }
  if (propLower.includes('fullname') || propLower.includes('name') || propLower.includes('author') || propLower.includes('client')) {
    return faker.person.fullName();
  }
  if (propLower.includes('jobtitle') || propLower.includes('position') || propLower.includes('role')) {
    return faker.person.jobTitle();
  }
  if (propLower.includes('gender') || propLower.includes('sex')) {
    return faker.person.gender();
  }

  if (propLower.includes('email') || propLower.includes('mail')) {
    return faker.internet.email();
  }
  if (propLower.includes('phone') || propLower.includes('tel') || propLower.includes('mobile') || propLower.includes('contact')) {
    return faker.phone.number();
  }
  if (propLower.includes('address')) return faker.location.streetAddress();
  if (propLower.includes('street') || propLower.includes('road') || propLower.includes('avenue')) {
    return faker.location.street();
  }
  if (propLower.includes('city') || propLower.includes('town')) {
    return faker.location.city();
  }
  if (propLower.includes('country') || propLower.includes('nation')) {
    return faker.location.country();
  }
  if (propLower.includes('state') || propLower.includes('province') || propLower.includes('region')) {
    return faker.location.state();
  }
  if (propLower.includes('zipcode') || propLower.includes('zip') || propLower.includes('postal')) {
    return faker.location.zipCode();
  }

  if (propLower.includes('company') || propLower.includes('organization') || propLower.includes('business')) {
    return faker.company.name();
  }
  if (propLower.includes('department') || propLower.includes('division')) {
    return faker.commerce.department();
  }

  if (propLower.includes('price') || propLower.includes('unitprice') || propLower.includes('cost')) {
    return Number(faker.commerce.price());
  }
  if (propLower.includes('amount') && !propLower.includes('qty') && !propLower.includes('quantity')) {
    return Number(faker.commerce.price());
  }
  if (propLower.includes('product') || propLower.includes('item') || propLower.includes('service')) {
    return faker.commerce.productName();
  }
  if (propLower.includes('description') || propLower.includes('details') || propLower.includes('notes')) {
    return faker.commerce.productDescription();
  }
  if (propLower.includes('quantity') || propLower.includes('qty') || propLower.includes('count') || propLower.includes('units')) {
    return faker.number.int({ min: 1, max: 100 });
  }
  if (propLower.includes('total') || propLower.includes('subtotal') || propLower.includes('grandtotal') || propLower.includes('sum')) {
    return Number(faker.commerce.price({ min: 100, max: 1000 }));
  }
  if (propLower.includes('tax') || propLower.includes('vat') || propLower.includes('gst')) {
    return Number(faker.commerce.price({ min: 0, max: 100 }));
  }
  if (propLower.includes('discount') || propLower.includes('rebate') || propLower.includes('reduction')) {
    return Number(faker.commerce.price({ min: 0, max: 50 }));
  }
  if (propLower.includes('currency') || propLower.includes('currencycode')) {
    return faker.finance.currencyCode();
  }

  // Date related fields
  if (propLower.includes('issuedate') || propLower.includes('createdate') || propLower.includes('startdate')) {
    return faker.date.recent({ days: 30 }).toISOString().split('T')[0];
  }
  if (propLower.includes('duedate') || propLower.includes('enddate') || propLower.includes('expirydate')) {
    return faker.date.soon({ days: 30 }).toISOString().split('T')[0];
  }
  if (propLower.includes('date')) {
    return faker.date.recent().toISOString().split('T')[0];
  }
  if (propLower.includes('year')) {
    return faker.date.past().getFullYear();
  }
  if (propLower.includes('month')) return faker.date.month();

  // ID/Reference fields
  if (propLower.includes('invoicenumber') || propLower.includes('invoice_number')) {
    return `INV-${faker.number.int({ min: 10000, max: 99999 })}`;
  }
  if (propLower.includes('ordernumber') || propLower.includes('order_number')) {
    return `ORD-${faker.number.int({ min: 10000, max: 99999 })}`;
  }
  if (propLower.includes('id')) return faker.string.alphanumeric(8).toUpperCase();
  if (propLower.includes('reference')) return faker.string.alphanumeric(10).toUpperCase();
  if (propLower.includes('number')) return faker.number.int({ min: 1000, max: 9999 });

  if (propLower.includes('title') || propLower.includes('heading') || propLower.includes('header')) {
    return faker.lorem.sentence();
  }
  if (propLower.includes('subtitle') || propLower.includes('subheading')) {
    return faker.lorem.sentence();
  }
  if (propLower.includes('summary') || propLower.includes('abstract') || propLower.includes('overview')) {
    return faker.lorem.paragraph();
  }
  if (propLower.includes('content') || propLower.includes('body') || propLower.includes('text')) {
    return faker.lorem.paragraphs();
  }
  if (propLower.includes('image') || propLower.includes('picture') || propLower.includes('photo') || propLower.includes('avatar')) {
    return faker.image.url();
  }
  if (propLower.includes('url') || propLower.includes('link') || propLower.includes('website')) {
    return faker.internet.url();
  }

  if (propLower.startsWith('is') || propLower.startsWith('has') || propLower.startsWith('show') || propLower.includes('enabled') || propLower.includes('visible')) {
    return faker.datatype.boolean();
  }
  if (propLower.includes('status') || propLower.includes('state')) {
    return faker.helpers.arrayElement(['Active', 'Pending', 'Completed', 'Cancelled']);
  }
  if (propLower.includes('type') || propLower.includes('category') || propLower.includes('kind')) {
    return faker.helpers.arrayElement(['Type A', 'Type B', 'Type C']);
  }
  if (propLower.includes('color') || propLower.includes('colour')) {
    return faker.color.human();
  }

  if (propLower.includes('comment') || propLower.includes('message') || propLower.includes('feedback')) {
    return faker.lorem.sentence();
  }

  return faker.lorem.word();
}

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

    // Validate image URLs
    for (const url of imageUrls) {
      if (typeof url !== 'string') {
        return res.status(400).json({ error: 'All image URLs must be strings' });
      }
    }

    try {
      // Prepare image parts for the model
      const imageParts: any[] = await Promise.all(
        imageUrls.map(async (url: string) => {
          let base64Data: string;
          let mimeType: string;

          if (url.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', url);
            if (!fs.existsSync(filePath)) {
              throw new Error(`File not found: ${url}`);
            }
            const fileData = fs.readFileSync(filePath);
            base64Data = Buffer.from(fileData).toString('base64');
            mimeType = `image/${path.extname(url).substring(1)}`;
          } else {
            const fetchedImage = await fetchImageAsBase64(url);
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

      // Create a prompt that includes both text and images
      const templatePrompt = `Generate only the inner HTML content (without <!DOCTYPE>, <html>, <head>, or <body> tags) for a template based on the provided images and this requirement: ${prompt}

Requirements:
1. Use Handlebars syntax for variables: {{variable}}
2. For arrays, use {{#each arrayName}} and {{this.property}}
3. For nested objects, use dot notation: {{object.property}}
4. Use semantic HTML elements
5. Use Tailwind CSS classes for styling
6. Add comments for major sections
7. Make it responsive with Tailwind classes
8. Include Chart.js canvas elements where appropriate (e.g., for statistics, data visualization)
9. Use chart data from the 'charts' object (e.g., {{charts.pie}} for pie chart data)
10. Do not include any <html>, <head>, <body> tags or scripts
11. Only return the inner HTML that would go inside the content div
12. The design should be inspired by the provided images

Example of chart usage:
<canvas id="myChart" data-chart-type="pie" data-chart-data='{{charts.pie}}'></canvas>

Return only the HTML code without any explanation or formatting.`;

      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
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
        throw new Error('Invalid response from AI model');
      }
      const template = msg.content[0].text;

      // Extract and analyze variables from the template
      const extractedVars = extractVariablesFromTemplate(template);
      const suggestedVariables = buildVariableStructure(extractedVars);

      // Return both the template and suggested variables
      return res.status(200).json({
        content: template,
        suggestedVariables,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: 'Failed to generate template from images',
        details: error.message,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to generate template from images',
      details: error.message,
    });
  }
}
