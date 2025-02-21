import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { faker } from '@faker-js/faker';
import notificationService from '@/services/NotificationService';
// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function extractVariablesFromTemplate(template: string) {
  const variableRegex = /{{([^}]+)}}/g;
  const variables = new Map<string, { type: 'array' | 'object' | 'value'; path: string[] }>();
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    let variable = match[1].trim();
    
    // Remove helpers like #each, #if, else, /if, /each
    variable = variable.replace(/^#|^\/|else/g, '');
    
    // Get the variable name before any operators or spaces
    variable = variable.split(' ')[0];
    
    if (variable && !variable.includes('this.')) {
      // Check if it's inside an #each block
      const eachBlockRegex = new RegExp(`{{#each\\s+${variable.split('.')[0]}}}([\\s\\S]*?){{/each}}`, 'g');
      const isArray = eachBlockRegex.test(template);

      // Split the path and store the structure
      const path = variable.split('.');
      if (!variables.has(path[0])) {
        if (isArray) {
          variables.set(path[0], { type: 'array', path: [path[0]] });
        } else if (path.length > 1) {
          variables.set(path[0], { type: 'object', path: [path[0]] });
        } else {
          variables.set(path[0], { type: 'value', path: [path[0]] });
        }
      }

      // Store nested paths
      if (path.length > 1) {
        const parentVar = variables.get(path[0]);
        if (parentVar && parentVar.type === 'object') {
          variables.set(variable, { type: 'value', path });
        }
      }
    }
  }

  return variables;
}

function buildVariableStructure(variables: Map<string, { type: 'array' | 'object' | 'value'; path: string[] }>) {
  const structure: Record<string, any> = {};

  // First pass: Create base structure
  for (const [key, value] of variables.entries()) {
    if (value.path.length === 1) {
      if (value.type === 'array') {
        structure[key] = [];
      } else if (value.type === 'object') {
        structure[key] = {};
      } else {
        structure[key] = getExampleValue(key);
      }
    }
  }

  // Second pass: Fill in nested values
  for (const [key, value] of variables.entries()) {
    if (value.path.length > 1) {
      let current = structure;
      const lastIndex = value.path.length - 1;
      
      // Navigate the path
      for (let i = 0; i < lastIndex; i++) {
        const segment = value.path[i];
        if (!current[segment]) {
          current[segment] = {};
        }
        current = current[segment];
      }

      // Set the value
      const lastSegment = value.path[lastIndex];
      current[lastSegment] = getExampleValue(lastSegment);
    }
  }

  // Third pass: Handle arrays
  for (const [key, value] of variables.entries()) {
    if (value.type === 'array') {
      // Find all properties used in the array items
      const arrayProps = new Set<string>();
      for (const [varKey, varValue] of variables.entries()) {
        if (varValue.path[0] === key && varValue.path.length > 1) {
          arrayProps.add(varValue.path[1]);
        }
      }

      // Create array items with all properties
      const arrayItem = Array.from(arrayProps).reduce((obj, prop) => {
        obj[prop] = getExampleValue(prop);
        return obj;
      }, {} as Record<string, any>);

      // Generate 2-3 items for the array
      structure[key] = Array.from({ length: faker.number.int({ min: 2, max: 3 }) }, () => ({
        ...arrayItem,
      }));
    }
  }

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
  if (propLower.includes('price') || propLower.includes('amount')) return Number(faker.commerce.price());
  if (propLower.includes('product')) return faker.commerce.productName();
  if (propLower.includes('description')) return faker.commerce.productDescription();
  if (propLower.includes('quantity') || propLower.includes('count')) return faker.number.int({ min: 1, max: 100 });
  if (propLower.includes('total')) return Number(faker.commerce.price({ min: 100, max: 1000 }));
  if (propLower.includes('currency')) return faker.finance.currencyCode();

  // Date related fields
  if (propLower.includes('date')) return faker.date.recent().toISOString().split('T')[0];
  if (propLower.includes('year')) return faker.date.past().getFullYear();
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate the template first
    const templatePrompt = `Generate only the inner HTML content (without <!DOCTYPE>, <html>, <head>, or <body> tags) for a template with this requirement: ${prompt}

Requirements:
1. Use Handlebars syntax for variables: {{variable}}
2. For arrays, use {{#each arrayName}} and {{this.property}}
3. For nested objects, use dot notation: {{object.property}}
4. Use semantic HTML elements
5. Use Tailwind CSS classes for styling
6. Add comments for major sections
7. Make it responsive with Tailwind classes
8. Do not include any <html>, <head>, <body> tags or scripts
9. Only return the inner HTML that would go inside the content div

Return only the HTML code without any explanation or formatting.`;

    const templateResult = await model.generateContent(templatePrompt);
    const templateResponse = await templateResult.response;
    const template = templateResponse.text();

    // Extract and analyze variables from the template
    const extractedVars = extractVariablesFromTemplate(template);
    const suggestedVariables = buildVariableStructure(extractedVars);

    // Return both the template and suggested variables
    return res.status(200).json({
      content: template,
      suggestedVariables: suggestedVariables,
    });
  } catch (error: any) {
    notificationService.showErrorNotification(error?.message || 'Failed to generate template');
    console.error('Error generating template:', error);
    return res.status(500).json({ error: 'Failed to generate template' });
  }
}
