import type { NextApiRequest, NextApiResponse } from 'next';
import {
  assertCanStartAiRun,
  consumeGenerationCredits,
  runWithAiRunLock,
} from '@/services/ai/aiCreditsGate';
import { runTemplateGeneration } from '@/services/ai/templateGenerationService';
import { initSseResponse, writeSseEvent, endSse } from '@/lib/aiGeneration/sse';
import type { TemplateGenerationRequest } from '@/lib/aiGeneration/types';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const body = req.body as TemplateGenerationRequest;
  const hasImages = Boolean(body.imageUrls?.length);

  try {
    await assertCanStartAiRun(authHeader);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Monthly credit limit reached';
    res.status(429).json({ error: message });
    return;
  }

  initSseResponse(res);

  try {
    const result = await runWithAiRunLock(authHeader, () =>
      runTemplateGeneration(
        {
          prompt: body.prompt,
          imageUrls: body.imageUrls,
          format: body.format,
          isLandscape: body.isLandscape,
          pdfContentPadding: body.pdfContentPadding,
          useAgent: body.useAgent ?? false,
          useFidelityGraph: body.useFidelityGraph === true,
          useVisualQualityMode: body.useVisualQualityMode === true,
        },
        (event) => {
          if (event.type === 'step') {
            writeSseEvent(res, event);
          }
        },
      ),
    );

    const { warnings, creditsDeducted } = await consumeGenerationCredits(authHeader, result);

    writeSseEvent(res, {
      type: 'done',
      content: result.content,
      suggestedVariables: result.suggestedVariables,
      recommendedLandscape: result.recommendedLandscape,
      layoutSummary: result.layoutSummary,
      warnings: warnings.length ? warnings : result.warnings,
      creditsDeducted: creditsDeducted > 0 ? creditsDeducted : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate template';
    writeSseEvent(res, { type: 'error', message });
  }

  endSse(res);
}
