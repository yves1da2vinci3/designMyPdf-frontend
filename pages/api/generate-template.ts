import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, variables } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a description of available variables
    const variableDescriptions = Object.entries(variables || {}).map(([key, value]) => {
      const type = Array.isArray(value) ? 'array' : typeof value === 'object' ? 'object' : 'key-value';
      const example = JSON.stringify(value, null, 2);
      return `${key} (${type}): ${example}`;
    }).join('\n');

    // Create the prompt for generating an HTML template
    const templatePrompt = `Generate a Handlebars HTML template for the following requirement: ${prompt}. 

Available variables and their structure:
${variableDescriptions}

The template should:
1. Use the provided variables with proper Handlebars syntax ({{variable}})
2. For arrays, use {{#each}} helper
3. For nested objects, use dot notation (e.g., {{company.name}})
4. Use modern HTML5 and CSS
5. Be responsive
6. Follow best practices for accessibility
7. Include appropriate semantic HTML tags
8. Use Tailwind CSS classes for styling
9. Be well-structured and properly indented
10. Include appropriate comments for major sections

Only return the Handlebars template code without any explanation or markdown formatting.`;

    // Generate the template
    const result = await model.generateContent(templatePrompt);
    const response = await result.response;
    const template = response.text();

    // Return the generated template
    return res.status(200).json({ content: template });
  } catch (error) {
    console.error('Error generating template:', error);
    return res.status(500).json({ error: 'Failed to generate template' });
  }
} 