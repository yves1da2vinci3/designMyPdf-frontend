/**
 * Endpoint API pour générer un template avec l'agent LangGraph
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { generateTemplateWithAgent } from '@/services/agent/agentGraph';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Générer le template avec l'agent
    const result = await generateTemplateWithAgent(prompt);

    return res.status(200).json({
      content: result.content,
      suggestedVariables: result.suggestedVariables,
      warnings: result.warnings,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error generating template with agent:', error);
    return res.status(500).json({
      error: 'Failed to generate template',
      details: error?.message || 'Unknown error',
    });
  }
}
