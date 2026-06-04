import type { NextApiRequest, NextApiResponse } from 'next';
import {
  assertCanStartAiRun,
  consumeGenerationCredits,
  runWithAiRunLock,
} from '@/services/ai/aiCreditsGate';
import { runTemplateChatTurn } from '@/services/ai/templateChatService';
import { initSseResponse, writeSseEvent, endSse } from '@/lib/aiGeneration/sse';
import type { ChatTurnRequest } from '@/services/ai/templateChatService';

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

  const body = req.body as ChatTurnRequest;

  try {
    await assertCanStartAiRun(authHeader);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Monthly credit limit reached';
    const status =
      error instanceof Error && (error as Error & { statusCode?: number }).statusCode === 429
        ? 429
        : 401;
    res.status(status).json({ error: message });
    return;
  }

  initSseResponse(res);

  try {
    const result = await runWithAiRunLock(authHeader, () =>
      runTemplateChatTurn(body, (event) => {
        writeSseEvent(res, event);
      }),
    );

    const { warnings, creditsDeducted } = await consumeGenerationCredits(authHeader, result);

    writeSseEvent(res, {
      type: 'done',
      content: result.content,
      suggestedVariables: result.suggestedVariables,
      recommendedLandscape: result.recommendedLandscape,
      layoutSummary: result.layoutSummary,
      responseText: result.responseText,
      warnings: warnings.length ? warnings : result.warnings,
      creditsDeducted: creditsDeducted > 0 ? creditsDeducted : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process request';
    writeSseEvent(res, { type: 'error', message });
  }

  endSse(res);
}
