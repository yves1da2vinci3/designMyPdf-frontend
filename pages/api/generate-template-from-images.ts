import { NextApiRequest, NextApiResponse } from 'next';
import {
  assertCanStartAiRun,
  consumeGenerationCredits,
  runWithAiRunLock,
} from '@/services/ai/aiCreditsGate';
import { runTemplateGeneration } from '@/services/ai/templateGenerationService';
import type { TemplateGenerationRequest } from '@/lib/aiGeneration/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const body = req.body as TemplateGenerationRequest;
  if (!body.prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  if (!body.imageUrls?.length) {
    return res.status(400).json({ error: 'At least one image URL is required' });
  }

  for (const url of body.imageUrls) {
    if (typeof url !== 'string' || !url.match(/^(https?:\/\/|\/uploads\/)/)) {
      return res.status(400).json({ error: `Invalid image URL format: ${url}` });
    }
  }

  try {
    await assertCanStartAiRun(authHeader);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Monthly credit limit reached';
    return res.status(429).json({ error: message });
  }

  try {
    const result = await runWithAiRunLock(authHeader, () =>
      runTemplateGeneration({
        prompt: body.prompt,
        imageUrls: body.imageUrls,
        format: body.format,
        isLandscape: body.isLandscape,
        pdfContentPadding: body.pdfContentPadding,
        useAgent: body.useAgent ?? false,
        useFidelityGraph: body.useFidelityGraph === true,
        useVisualQualityMode: body.useVisualQualityMode === true,
      }),
    );

    const { warnings } = await consumeGenerationCredits(authHeader, result);

    return res.status(200).json({
      content: result.content,
      suggestedVariables: result.suggestedVariables,
      recommendedLandscape: result.recommendedLandscape,
      layoutSummary: result.layoutSummary,
      warnings: warnings.length ? warnings : result.warnings,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate template from images';
    return res.status(500).json({
      error: 'Failed to generate template from images',
      details: message,
    });
  }
}
