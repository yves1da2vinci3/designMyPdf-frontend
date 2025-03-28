import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, InlineDataPart } from '@google/generative-ai';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Initialize the Google Generative AI client with proper error handling
let genAI: GoogleGenerativeAI;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  genAI = new GoogleGenerativeAI(apiKey);
} catch (error) {
  // Log initialization error but don't crash the server
  // We'll handle this in the API route
  genAI = null as any;
}

// Function to fetch image data and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    console.log(`Fetching image from: ${url}`);
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
    console.log(`Image content type: ${contentType}`);

    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
    }

    const base64Data = Buffer.from(response.data).toString('base64');
    return { data: base64Data, mimeType: contentType };
  } catch (error: any) {
    console.error(`Error fetching image from ${url}:`, error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    }
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
  const variableRegex = /{{([^}]+)}}/g;
  const variables = new Map<
    string,
    { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
  >();
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    const [rawVariable] = match[1]
      .trim()
      .replace(/^#|^\/|else/g, '')
      .split(' ');
    if (rawVariable && !rawVariable.includes('this.')) {
      const varPath = rawVariable.split('.');
      const rootVar = varPath[0];

      // Check if it's inside an #each block
      const eachBlockRegex = new RegExp(`{{#each\\s+${rootVar}}}([\\s\\S]*?){{/each}}`, 'g');
      const eachMatch = eachBlockRegex.exec(template);

      if (eachMatch) {
        // Extract array item structure
        const blockContent = eachMatch[1];
        const itemProps = new Set<string>();
        const thisRegex = /{{this\.(\w+)}}/g;
        let propMatch;

        while ((propMatch = thisRegex.exec(blockContent)) !== null) {
          itemProps.add(propMatch[1]);
        }

        // Create array item structure
        const arrayItemStructure = Array.from(itemProps).reduce(
          (obj, prop) => {
            obj[prop] = getExampleValue(prop);
            return obj;
          },
          {} as Record<string, any>,
        );

        variables.set(rootVar, {
          type: 'array',
          path: [rootVar],
          arrayItemStructure,
        });
      } else if (varPath.length > 1) {
        // Handle nested object
        if (!variables.has(rootVar)) {
          variables.set(rootVar, { type: 'object', path: [rootVar] });
        }
        variables.set(rawVariable, { type: 'value', path: varPath });
      } else {
        variables.set(rawVariable, { type: 'value', path: [rawVariable] });
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
  const propLower = prop.toLowerCase();

  // Person related fields
  if (propLower.includes('name') || propLower.includes('author')) {
    return faker.person.fullName();
  }
  if (propLower.includes('firstname')) return faker.person.firstName();
  if (propLower.includes('lastname')) return faker.person.lastName();
  if (propLower.includes('jobtitle')) return faker.person.jobTitle();
  if (propLower.includes('gender')) return faker.person.gender();

  // Contact/Address related fields
  if (propLower.includes('email')) return faker.internet.email();
  if (propLower.includes('phone')) return faker.phone.number();
  if (propLower.includes('address')) return faker.location.streetAddress();
  if (propLower.includes('street')) return faker.location.street();
  if (propLower.includes('city')) return faker.location.city();
  if (propLower.includes('country')) return faker.location.country();
  if (propLower.includes('zipcode') || propLower.includes('zip')) return faker.location.zipCode();

  // Company related fields
  if (propLower.includes('company')) return faker.company.name();
  if (propLower.includes('department')) return faker.commerce.department();
  if (propLower.includes('position')) return faker.person.jobTitle();

  // Commerce related fields
  if (propLower.includes('price') || propLower.includes('amount')) {
    return Number(faker.commerce.price());
  }
  if (propLower.includes('product')) {
    return faker.commerce.productName();
  }
  if (propLower.includes('description')) {
    return faker.commerce.productDescription();
  }
  if (propLower.includes('quantity') || propLower.includes('count')) {
    return faker.number.int({ min: 1, max: 100 });
  }
  if (propLower.includes('total')) {
    return Number(faker.commerce.price({ min: 100, max: 1000 }));
  }
  if (propLower.includes('currency')) {
    return faker.finance.currencyCode();
  }

  // Date related fields
  if (propLower.includes('date')) {
    return faker.date.recent().toISOString().split('T')[0];
  }
  if (propLower.includes('year')) {
    return faker.date.past().getFullYear();
  }
  if (propLower.includes('month')) return faker.date.month();

  // ID/Reference fields
  if (propLower.includes('id')) return faker.string.alphanumeric(8).toUpperCase();
  if (propLower.includes('reference')) return faker.string.alphanumeric(10).toUpperCase();
  if (propLower.includes('number')) return faker.number.int({ min: 1000, max: 9999 });

  // Content related fields
  if (propLower.includes('title')) return faker.lorem.sentence();
  if (propLower.includes('subtitle')) return faker.lorem.sentence();
  if (propLower.includes('summary')) return faker.lorem.paragraph();
  if (propLower.includes('content') || propLower.includes('body')) return faker.lorem.paragraphs();
  if (propLower.includes('image')) return faker.image.url();
  if (propLower.includes('url') || propLower.includes('link')) return faker.internet.url();

  // Status fields
  if (propLower.startsWith('is') || propLower.startsWith('has')) return faker.datatype.boolean();
  if (propLower.includes('status')) {
    return faker.helpers.arrayElement(['Active', 'Pending', 'Completed', 'Cancelled']);
  }

  // Default to lorem word if no specific match
  return faker.lorem.word();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Gemini API is properly initialized
    if (!genAI) {
      return res.status(500).json({
        error:
          'Google Generative AI client not initialized. Please check your GEMINI_API_KEY environment variable.',
      });
    }

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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare image parts for the model
    try {
      const imageParts: InlineDataPart[] = await Promise.all(
        imageUrls.map(async (url: string) => {
          try {
            // For local images, we need to read them from the filesystem
            if (url.startsWith('/uploads/')) {
              const filePath = path.join(process.cwd(), 'public', url);

              // Check if file exists
              if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${url}`);
              }

              const fileData = fs.readFileSync(filePath);
              const mimeType = `image/${path.extname(url).substring(1)}`;
              return {
                inlineData: {
                  data: Buffer.from(fileData).toString('base64'),
                  mimeType,
                },
              } as InlineDataPart;
            }

            // For external URLs (including Cloudinary), fetch the image and convert to base64
            const { data, mimeType } = await fetchImageAsBase64(url);
            return {
              inlineData: {
                data,
                mimeType,
              },
            } as InlineDataPart;
          } catch (error: any) {
            // Log the error but continue with other images
            throw new Error(`Error processing image ${url}: ${error.message}`);
          }
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

      // Generate content with both text and images
      try {
        console.log(`Sending ${imageParts.length} images to Gemini API`);
        const templateResult = await model.generateContent([templatePrompt, ...imageParts]);
        const templateResponse = await templateResult.response;
        const template = templateResponse.text();

        // Extract and analyze variables from the template
        const extractedVars = extractVariablesFromTemplate(template);
        const suggestedVariables = buildVariableStructure(extractedVars);

        // Return both the template and suggested variables
        return res.status(200).json({
          content: template,
          suggestedVariables,
        });
      } catch (error: any) {
        console.error('Gemini API error:', error);
        let errorMessage = error.message || 'Unknown error';

        // Check if the error is related to the image format or size
        if (errorMessage.includes('image') || errorMessage.includes('file')) {
          errorMessage = `Image processing error: ${errorMessage}. Try using a different image format (JPG or PNG) or a smaller image size.`;
        }

        return res.status(500).json({
          error: 'Failed to generate template from images',
          details: errorMessage,
        });
      }
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
