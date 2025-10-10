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

    const improvePrompt = `You are an EXPERT UI/UX designer. Transform this template into something STUNNING and BEAUTIFUL while preserving ALL functionality.

Current template:
${template}

Available variables:
${JSON.stringify(variables, null, 2)}

🎨 DESIGN TRANSFORMATION:

1. **Enhanced Colors**:
   - Upgrade to professional palette: bg-blue-600, bg-indigo-600, bg-slate-100
   - Add gradients: bg-gradient-to-r from-blue-500 to-purple-600
   - Use opacity: bg-blue-500/10, text-gray-700/80
   - Accent colors for important elements

2. **Improved Typography**:
   - Headers: font-extrabold text-4xl tracking-tight
   - Subheaders: font-semibold text-xl
   - Body: text-base leading-relaxed
   - Labels: text-xs font-medium uppercase tracking-wide
   - Create clear visual hierarchy

3. **Enhanced Spacing**:
   - More generous: p-8, p-12, py-16 instead of p-4
   - Section spacing: space-y-8, space-y-12, space-y-16
   - Grid/Flex gaps: gap-8, gap-12
   - Better margins: mb-8, mt-12

4. **Visual Polish**:
   - Upgrade shadows: shadow-lg, shadow-xl, shadow-2xl
   - Better borders: border border-gray-200 with rounded-xl
   - Smooth transitions: transition-all duration-300 ease-in-out
   - Rich hovers: hover:shadow-2xl hover:scale-105 hover:-translate-y-1

5. **Modern Elements**:
   - Card elevation: bg-white rounded-xl shadow-lg p-8
   - CTAs: bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg
   - Backgrounds: bg-gradient-to-br from-gray-50 to-blue-50
   - Dividers: border-b border-gray-200

6. **Layout Enhancements**:
   - Better grid spacing: gap-6, gap-8
   - Improved alignment: items-center, justify-between
   - Responsive: sm:, md:, lg:, xl: breakpoints
   - Container: max-w-7xl mx-auto

🔧 CRITICAL RULES:
✓ Keep ALL Handlebars variables EXACTLY as they are
✓ Maintain original structure and functionality
✓ Use ONLY Tailwind CSS
✓ Ensure responsive design
✓ Add smooth transitions and hover effects

🎯 QUALITY GOALS:
- Make it 3-5x more beautiful
- Professional, modern aesthetic
- Generous spacing and whitespace
- Clear visual hierarchy
- Smooth interactions
- Balanced composition

OUTPUT:
- Return ONLY the improved HTML
- NO explanations
- Keep existing comments

TRANSFORM THIS INTO SOMETHING STUNNING. Return HTML now:`;

    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
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
