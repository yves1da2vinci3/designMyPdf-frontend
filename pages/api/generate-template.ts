/* eslint-disable max-len */
import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import notificationService from '@/services/NotificationService';
import { TEMPLATE_DESIGN_GUIDE } from '@/services/agent/pdfConstraints';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, useAgent } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Si useAgent est activé, utiliser l'agent
    if (useAgent) {
      const { generateTemplateWithAgent } = await import('@/services/agent/agentGraph');
      const result = await generateTemplateWithAgent(prompt);
      return res.status(200).json({
        content: result.content,
        suggestedVariables: result.suggestedVariables,
        warnings: result.warnings,
      });
    }

    const templatePrompt = `You are an EXPERT UI/UX designer. Create a PROFESSIONAL, BEAUTIFUL template for: ${prompt}

🎨 DESIGN EXCELLENCE:

1. **Color Palette** (Restrained & Professional):
   - Primary: bg-blue-600
   - Neutral: bg-gray-50, bg-gray-100, text-gray-900, text-gray-700
   - Accents: pick ONE from bg-emerald-500, bg-rose-500, bg-amber-500
   - Max 5 color classes total; NO gradients, NO opacity modifiers (bg-blue-500/10)

2. **Typography Hierarchy**:
   - Headers: font-bold text-2xl or text-3xl tracking-tight
   - Subheaders: font-semibold text-xl, font-medium text-lg
   - Body: text-base leading-relaxed, text-sm
   - Labels: text-xs font-medium uppercase tracking-wide text-gray-500
   - Line height: leading-tight for headers, leading-relaxed for body

3. **Spacing & Layout** (PDF-SAFE):
   - Root wrapper: p-0 (scaffold already adds outer padding — do NOT add your own)
   - Section padding: py-3 or py-4 only
   - Section spacing: space-y-4, space-y-6 (NEVER gap-*)
   - Container: max-w-5xl mx-auto

4. **Visual Depth**:
   - Cards: bg-white rounded-lg shadow-sm p-4
   - Shadows: shadow-sm, shadow-md only
   - Borders: border border-gray-200
   - Rounded: rounded-lg, rounded-xl

5. **Elements**:
   - Accent colors for CTAs: bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg
   - Stat cards: bg-white rounded-lg p-4 shadow-sm with large numbers text-2xl font-bold

📊 CHARTS & VISUALIZATIONS:
- Canvas: <canvas id="uniqueId" data-chart-type="[type]" data-chart-data='{{charts.chartName}}'></canvas>
- Types: bar, pie, line, doughnut, radar, polarArea, bubble, scatter
- Examples: {{charts.salesChart}}, {{charts.monthlyRevenue}}, {{charts.userGrowth}}
- Stat cards: {{totalSales}}, {{activeUsers}}, {{conversionRate}}

🔧 HANDLEBARS TEMPLATES (MANDATORY):
You MUST use Handlebars variables for ALL dynamic content:
- Simple values: {{variable}} - for any text, numbers, dates
- Object properties: {{user.name}}, {{company.address}}, {{invoice.number}}
- Arrays/Lists: {{#each items}}{{this.name}} {{this.price}}{{/each}}
- Conditionals: {{#if showSection}}...{{/if}}

IMPORTANT: Do NOT use hardcoded values. Use variables for:
- Names, addresses, dates, numbers, prices, quantities
- All text content that should be dynamic
- Product/item lists, company info, user data
- Statistics, metrics, totals

Examples:
- Company name: {{companyName}} NOT "Acme Corp"
- Date: {{invoiceDate}} NOT "2024-01-01"
- Items list: {{#each products}}{{this.name}} - {{this.price}}{{/each}}

📐 LAYOUT:
- Grid: grid grid-cols-2 (NEVER gap-*, use space-x-4 between columns)
- Flex: flex items-center justify-between
- No responsive breakpoints needed (PDF is fixed width)

✨ PROFESSIONAL TOUCHES:
- Spacing: py-3 or py-4 for sections, mb-4 between elements
- Clear visual hierarchy
- Subtle dividers: border-b border-gray-200
- Balanced composition

${TEMPLATE_DESIGN_GUIDE}

OUTPUT:
- ONLY inner HTML (no DOCTYPE, html, head, body)
- NO scripts, NO explanations
- Semantic HTML5
- Professional Tailwind CSS

CREATE SOMETHING BEAUTIFUL. Return HTML now:`;

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: templatePrompt }],
    });

    if (msg.content.length === 0 || msg.content[0].type !== 'text') {
      throw new Error('Invalid response from AI model');
    }
    let template = msg.content[0].text.trim();

    if (template.startsWith('```html')) {
      template = template
        .replace(/^```html\n?/g, '')
        .replace(/```\s*$/g, '')
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
    notificationService.showErrorNotification(error?.message || 'Failed to generate template');
    return res.status(500).json({ error: 'Failed to generate template' });
  }
}
