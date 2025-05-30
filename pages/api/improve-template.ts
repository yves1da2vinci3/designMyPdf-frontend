import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const { template, variables } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'Template is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const improvePrompt = `Improve this HTML template by making it more visually appealing and modern. The template uses Handlebars variables and Tailwind CSS.

Current template:
${template}

Available variables:
${JSON.stringify(variables, null, 2)}

Requirements:
1. Keep all existing Handlebars variables ({{variable}})
2. Use only Tailwind CSS classes for styling
3. Add modern design elements like:
   - Subtle shadows
   - Rounded corners
   - Professional typography
   - Proper spacing and alignment
   - Visual hierarchy
   - Responsive design
4. Add micro-interactions using Tailwind's hover/focus states
5. Ensure the template remains functional and maintains its original structure
6. Add comments for major sections
7. Only return the improved HTML without any explanation

Return only the HTML code without any explanation or formatting.`;

    const result = await model.generateContent(improvePrompt);
    const response = await result.response;
    const improvedTemplate = response.text();

    return res.status(200).json({
      content: improvedTemplate,
    });
  } catch (error: any) {
    const errorMessage = error?.message || 'Failed to improve template';
    return res.status(500).json({
      error: 'Failed to improve template',
      details: errorMessage,
    });
  }
}
