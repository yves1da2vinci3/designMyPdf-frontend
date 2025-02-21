import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // First, generate a structure of variables that would be needed
    const variablesPrompt = `Based on this template requirement: "${prompt}"
    Generate a JSON structure of variables that would be needed to make this template dynamic.
    The response should be valid JSON only, with example values.
    Include arrays for repeatable elements and nested objects for grouped data.
    Do not include any explanation, just the JSON.`;

    const variablesResult = await model.generateContent(variablesPrompt);
    const variablesResponse = await variablesResult.response;
    let suggestedVariables;
    try {
      suggestedVariables = JSON.parse(variablesResponse.text());
    } catch (e) {
      console.error('Failed to parse variables JSON:', e);
      suggestedVariables = {};
    }

    // Then generate the template using these variables
    const templatePrompt = `Generate only the inner HTML content (without <!DOCTYPE>, <html>, <head>, or <body> tags) for a template with this requirement: ${prompt}

Use these variables in your template (using Handlebars syntax):
${JSON.stringify(suggestedVariables, null, 2)}

Requirements:
1. Use Handlebars syntax for variables: {{variable}}
2. For arrays, use {{#each arrayName}} helper
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

    // Return both the template and suggested variables
    return res.status(200).json({
      content: template,
      suggestedVariables: suggestedVariables
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return res.status(500).json({ error: 'Failed to generate template' });
  }
} 