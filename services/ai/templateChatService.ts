import { createAnthropicSdk } from '@/services/agent/anthropicClient';
import { getAiTextModel } from '@/lib/aiGeneration/models';
import { emitStep, runStep } from '@/lib/aiGeneration/steps';
import { normalizeEditorHtmlFragment } from '@/lib/aiGeneration/cleanHtml';
import {
  extractVariablesFromTemplate,
  buildVariableStructure,
} from '@/services/agent/templateUtils';
import { runTemplateGeneration } from './templateGenerationService';
import type { AiStepEmitter, TemplateGenerationResult } from '@/lib/aiGeneration/types';

export interface ChatTurnRequest {
  message: string;
  currentHtml?: string;
  variables?: Record<string, unknown>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  imageUrls?: string[];
  format?: string;
  isLandscape?: boolean;
  pdfContentPadding?: string;
  /** false = one-shot rapide sans graphe fidélité */
  useFidelityGraph?: boolean;
  maxFidelityIterations?: number;
}

export interface ChatTurnResult extends TemplateGenerationResult {
  responseText: string;
}

function buildModifySystemPrompt(): string {
  return `You are an expert HTML/CSS/Tailwind designer specializing in PDF templates.
You receive the current HTML template and a user request. Make TARGETED, SURGICAL changes.

Rules:
- Preserve ALL {{handlebars}} variables exactly as-is
- Use only Tailwind CSS classes (no custom CSS unless absolutely necessary)
- Never use flex gap-* (PDF constraint) — use space-x-*, space-y-*, or margins
- Never use sticky, fixed, overflow-hidden on page wrappers
- Keep structure intact; only modify what the user asked for
- Return a JSON object with this exact shape:
  {
    "html": "<the complete modified HTML>",
    "explanation": "Brief explanation of what was changed (2-4 sentences, friendly tone)",
    "suggestedVariables": null
  }
- If the user asks to add new dynamic content, also populate suggestedVariables with realistic sample data
- Do NOT wrap the JSON in markdown fences`;
}

function buildModifyUserMessage(
  userMessage: string,
  currentHtml: string,
  variables: Record<string, unknown>,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): string {
  const historyText =
    history.length > 0
      ? `\n\nConversation so far:\n${history
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n')}\n`
      : '';

  return `${historyText}
Current template HTML:
\`\`\`html
${currentHtml}
\`\`\`

Current variables:
${JSON.stringify(variables, null, 2)}

User request: ${userMessage}

Return only the JSON object described in the system prompt.`;
}

function buildVisionPromptFromChat(
  message: string,
  currentHtml?: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): string {
  const historyText =
    history.length > 0
      ? `Conversation:\n${history.map((m) => `${m.role}: ${m.content}`).join('\n')}\n\n`
      : '';
  const htmlNote = currentHtml?.trim()
    ? '\nIgnore le template HTML actuellement dans l’éditeur. Reproduis uniquement la ou les image(s) jointe(s).\n'
    : '';
  return `${historyText}${htmlNote}Demande utilisateur: ${message}`;
}

export async function runTemplateChatTurn(
  request: ChatTurnRequest,
  emit?: AiStepEmitter,
): Promise<ChatTurnResult> {
  const { message, currentHtml, variables = {}, conversationHistory = [], imageUrls } = request;
  const hasImages = (imageUrls?.length ?? 0) > 0;
  const trimmedHistory = conversationHistory.slice(-6);

  // Images jointes → vision (même si le HTML éditeur n’est pas vide)
  if (hasImages) {
    emitStep(emit, 'generate', 'Génération depuis image(s)', 'running');
    try {
      const result = await runTemplateGeneration(
        {
          prompt: buildVisionPromptFromChat(message, currentHtml, trimmedHistory),
          imageUrls,
          format: request.format,
          isLandscape: request.isLandscape,
          pdfContentPadding: request.pdfContentPadding,
          useAgent: false,
          useFidelityGraph: request.useFidelityGraph === true,
          maxFidelityIterations: request.maxFidelityIterations,
        },
        emit,
      );
      emitStep(emit, 'generate', 'Génération depuis image(s)', 'done');
      return {
        ...result,
        responseText:
          result.layoutSummary ||
          "J'ai généré le design à partir de votre image. Dites-moi si vous souhaitez des ajustements !",
        usageLog: result.usageLog,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        model: result.model,
      };
    } catch (e) {
      emitStep(emit, 'generate', 'Génération depuis image(s)', 'error', String(e));
      throw e;
    }
  }

  // No existing HTML → delegate to generation flow
  if (!currentHtml || currentHtml.trim().length === 0) {
    emitStep(emit, 'generate', 'Génération du template', 'running');
    try {
      const result = await runTemplateGeneration(
        {
          prompt: message,
          imageUrls,
          format: request.format,
          isLandscape: request.isLandscape,
          pdfContentPadding: request.pdfContentPadding,
          useAgent: false,
          useFidelityGraph: request.useFidelityGraph === true,
          maxFidelityIterations: request.maxFidelityIterations,
        },
        emit,
      );
      return {
        ...result,
        responseText:
          result.layoutSummary ||
          "J'ai créé le template en suivant votre description. Dites-moi si vous souhaitez des ajustements !",
      };
    } catch (e) {
      emitStep(emit, 'generate', 'Génération du template', 'error', String(e));
      throw e;
    }
  }

  // Existing HTML → modify mode
  const sdk = createAnthropicSdk();
  const model = getAiTextModel();

  let modifiedHtml = currentHtml;
  let explanation = '';
  let newVariables: Record<string, unknown> | null = null;
  let inputTokens = 0;
  let outputTokens = 0;

  await runStep(emit, 'analyze', 'Analyse de la demande', async () => {
    const userContent = buildModifyUserMessage(message, currentHtml, variables, trimmedHistory);

    const response = await sdk.messages.create({
      model,
      max_tokens: 8192,
      system: buildModifySystemPrompt(),
      messages: [{ role: 'user', content: userContent }],
    });

    inputTokens = response.usage?.input_tokens ?? 0;
    outputTokens = response.usage?.output_tokens ?? 0;

    if (response.content[0]?.type !== 'text') {
      throw new Error('Unexpected response type from AI model');
    }

    let raw = response.content[0].text.trim();

    // Strip markdown fences if model ignored instruction
    if (raw.startsWith('```')) {
      raw = raw
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
    }

    let parsed: {
      html: string;
      explanation: string;
      suggestedVariables?: Record<string, unknown> | null;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Model returned HTML directly instead of JSON — treat entire response as HTML
      modifiedHtml = normalizeEditorHtmlFragment(raw);
      explanation = 'Template mis à jour selon votre demande.';
      return;
    }

    modifiedHtml = normalizeEditorHtmlFragment(parsed.html);
    explanation = parsed.explanation || 'Template mis à jour.';
    newVariables = parsed.suggestedVariables ?? null;
  });

  // Emit rewrite step with character count
  emitStep(emit, 'rewrite', `Réécriture du HTML (${modifiedHtml.length} caractères)`, 'done');

  // Extract variables from modified HTML
  const extractedVarsMap = extractVariablesFromTemplate(modifiedHtml);
  const mergedVariables: Record<string, unknown> = newVariables
    ? { ...variables, ...(newVariables as Record<string, unknown>) }
    : { ...variables };

  // Fill any new vars with sample data
  const newVarsMap = new Map(
    Array.from(extractedVarsMap.entries()).filter(([k]) => !(k in mergedVariables)),
  );
  if (newVarsMap.size > 0) {
    const built = await runStep(emit, 'variables', 'Mise à jour des variables', async () =>
      buildVariableStructure(newVarsMap),
    );
    Object.assign(mergedVariables, built);
  }

  emit?.({
    type: 'text_done',
    text: explanation,
  });

  return {
    content: modifiedHtml,
    suggestedVariables: mergedVariables,
    recommendedLandscape: request.isLandscape ?? false,
    responseText: explanation,
    warnings: [],
    inputTokens,
    outputTokens,
    model,
    usageLog: inputTokens > 0 || outputTokens > 0 ? [{ model, inputTokens, outputTokens }] : [],
  };
}
