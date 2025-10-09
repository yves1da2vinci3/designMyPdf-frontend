import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { template, variables } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'Template is required' });
    }

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

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      messages: [{ role: 'user', content: improvePrompt }],
    });

    if (msg.content.length === 0 || msg.content[0].type !== 'text') {
      throw new Error('Invalid response from AI model');
    }
    const improvedTemplate = msg.content[0].text;

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
