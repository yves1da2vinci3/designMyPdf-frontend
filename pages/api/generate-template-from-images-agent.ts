/**
 * Endpoint API pour générer un template depuis des images avec l'agent LangGraph
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { generateTemplateWithAgent } from '@/services/agent/agentGraph';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
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

    // Validation des URLs
    for (const url of imageUrls) {
      if (typeof url !== 'string' || !url.match(/^(https?:\/\/|\/uploads\/)/)) {
        return res.status(400).json({ error: `Invalid image URL format: ${url}` });
      }
    }

    // Générer le template avec l'agent
    const result = await generateTemplateWithAgent(prompt, imageUrls);

    return res.status(200).json({
      content: result.content,
      suggestedVariables: result.suggestedVariables,
      warnings: result.warnings,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error generating template from images with agent:', error);
    return res.status(500).json({
      error: 'Failed to generate template from images',
      details: error?.message || 'Unknown error',
    });
  }
}
