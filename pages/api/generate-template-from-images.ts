import { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Buffer } from 'buffer'; // Explicit import for Buffer
import { PDF_SURVIVAL_GUIDE, TEMPLATE_DESIGN_GUIDE } from '@/services/agent/pdfConstraints';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';

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

    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType : 'image/jpeg';

    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
    }

    const base64Data = Buffer.from(response.data).toString('base64');
    return { data: base64Data, mimeType: contentType };
  } catch (error: any) {
    throw new Error(`Failed to fetch image from ${url}: ${error.message}`);
  }
}

// --- inline helpers removed: use templateUtils instead ---

// --- MAIN HANDLER ---

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, imageUrls, useAgent } = req.body;

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

    // Si useAgent est activé, utiliser l'agent
    if (useAgent) {
      const { generateTemplateWithAgent } = await import('@/services/agent/agentGraph');
      const result = await generateTemplateWithAgent(prompt, imageUrls);
      return res.status(200).json({
        content: result.content,
        suggestedVariables: result.suggestedVariables,
        warnings: result.warnings,
      });
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
3.  **EXACT SPACING AND DEPTH:** Replicate spacing (margins, padding) and visual depth (shadows, rounded corners) with precision — but NEVER use \`gap-*\` (use \`space-x-*\`/\`space-y-*\` or margin utilities instead); root wrapper must be \`p-0\` (scaffold adds outer padding).
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

${PDF_SURVIVAL_GUIDE}
${TEMPLATE_DESIGN_GUIDE}

OUTPUT FORMAT:
-   The OUTPUT MUST START AND END WITH AN HTML TAG. For example, start with \`<div class="p-0">\` and end with \`</div>\`.
-   ONLY inner HTML (no DOCTYPE, html, head, body).
-   NO JavaScript, NO explanations, NO markdown code fences (\`\`\`html).
-   Clean semantic HTML5.
-   Professional Tailwind CSS classes.
-   Brief section comments ONLY.

**DELIVER A PROFESSIONAL, PIXEL-PERFECT DESIGN. Return HTML now:**`;
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
      return res.status(500).json({
        error: 'Failed to generate template from images',
        details: error?.message || 'Unknown error',
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to process request',
      details: error?.message || 'Unknown error',
    });
  }
}
