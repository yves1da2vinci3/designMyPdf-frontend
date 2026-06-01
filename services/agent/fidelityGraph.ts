/**
 * Graphe LangGraph fidélité image: Analyst → Coder → Render → Critic → (loop max 1) → PDF harden
 */
import { StateGraph, END, START } from '@langchain/langgraph';
import type { FidelityAgentState } from './types';
import { runFidelityAnalyst, buildLayoutSummaryFromAnalysis } from './fidelityAnalyst';
import { runFidelityCoder } from './fidelityCoder';
import { renderFidelityHtmlToPng } from './fidelityRender';
import { runFidelityCritic } from './fidelityCritic';
import { extractVariablesFromTemplate, buildVariableStructure } from './templateUtils';
import type { AiStepEmitter } from '@/lib/aiGeneration/types';
import { emitStep, runStep } from '@/lib/aiGeneration/steps';
import { fontsStepLabel } from '@/lib/aiGeneration/detectFonts';
import type { TemplateGenerationRequest, TemplateGenerationResult } from '@/lib/aiGeneration/types';
import type { ProcessedImage } from './types';
import type { UsageRecord } from '@/services/ai/usageTypes';
import { mergeUsageLogs, sumUsage } from '@/services/ai/usageTypes';
import { getAiVisionModel } from '@/lib/aiGeneration/models';
import {
  detectLandscapeFromImages,
  resolveEffectiveLandscape,
} from '@/lib/aiGeneration/orientation';

let stepEmitter: AiStepEmitter | undefined;

function appendUsage(state: FidelityAgentState, entry: UsageRecord): UsageRecord[] {
  return mergeUsageLogs([...(state.usageLog ?? []), entry]);
}

async function analystNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  const { analysis, usage } = await runStep(
    stepEmitter,
    'analyst',
    'Analyse structurelle de la maquette',
    () => runFidelityAnalyst(state.prompt, state.images),
  );
  return { analysis, usageLog: appendUsage(state, usage) };
}

async function coderNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  if (!state.analysis) {
    throw new Error('Analyse requise avant génération');
  }
  const isRefine = Boolean(state.criticNotes || state.criticDeltas?.length);
  const stepId = !isRefine ? 'generate_faithful' : 'refine_code';
  const label = !isRefine
    ? 'Génération HTML fidèle'
    : `Affinage du code (passe ${state.iteration})`;

  const { html, suggestedVariables, usage } = await runStep(stepEmitter, stepId, label, () =>
    runFidelityCoder({
      prompt: state.prompt,
      analysis: state.analysis!,
      images: state.images,
      generationOptions: state.generationOptions,
      criticNotes: state.criticNotes,
      criticDeltas: state.criticDeltas,
      previousCode: state.generatedCode,
      renderPngBase64: isRefine ? state.renderPngBase64 : undefined,
      iteration: state.iteration,
    }),
  );

  return {
    generatedCode: html,
    draftVariables: { ...(state.draftVariables ?? {}), ...suggestedVariables },
    criticNotes: undefined,
    criticDeltas: undefined,
    usageLog: appendUsage(state, usage),
  };
}

async function renderNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  if (!state.generatedCode) {
    throw new Error('Code HTML requis pour le rendu');
  }
  const png = await runStep(stepEmitter, 'render_preview', 'Capture du rendu HTML', () =>
    renderFidelityHtmlToPng(
      state.generatedCode!,
      state.draftVariables ?? {},
      state.generationOptions,
      state.analysis,
    ),
  );
  return { renderPngBase64: png };
}

async function criticNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  if (!state.renderPngBase64) {
    throw new Error('Capture requise pour la critique');
  }
  const result = await runStep(stepEmitter, 'visual_critique', 'Critique visuelle', () =>
    runFidelityCritic(state.images, state.renderPngBase64!),
  );

  const nextLog = appendUsage(state, result.usage);

  if (result.passed) {
    return { criticPassed: true, usageLog: nextLog };
  }

  return {
    criticPassed: false,
    criticNotes: result.corrections || 'Corriger les écarts visuels par rapport à la maquette.',
    criticDeltas: result.deltas,
    iteration: state.iteration + 1,
    usageLog: nextLog,
  };
}

async function pdfHardenNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  if (!state.generatedCode || !state.analysis) {
    throw new Error('Code et analyse requis pour la passe PDF');
  }
  const warnings: string[] = [...(state.warnings ?? [])];
  if (!state.criticPassed && state.iteration >= state.maxIterations) {
    warnings.push(
      'Fidélité visuelle : 2 passes maximum atteintes (1 génération + 1 correction). Résultat conservé au mieux.',
    );
  }

  const code = state.generatedCode!;
  emitStep(stepEmitter, 'pdf_harden', 'Finalisation', 'done');

  const suggestedVariables = await runStep(
    stepEmitter,
    'extract_variables',
    "Mise à jour des variables d'exemple",
    async () => {
      const extracted = extractVariablesFromTemplate(code);
      const built = buildVariableStructure(extracted, code);
      return { ...state.draftVariables, ...built };
    },
  );

  emitStep(stepEmitter, 'fonts', fontsStepLabel(code), 'done');

  return {
    finalTemplate: code,
    suggestedVariables,
    warnings,
    usageLog: [],
  };
}

function routeAfterCritic(state: FidelityAgentState): 'coder' | 'pdfHarden' {
  if (state.criticPassed) {
    return 'pdfHarden';
  }
  if (state.iteration >= state.maxIterations) {
    return 'pdfHarden';
  }
  return 'coder';
}

const workflow = new StateGraph<FidelityAgentState>({
  channels: {
    prompt: { reducer: (x: string, y?: string) => y ?? x },
    images: { reducer: (x: ProcessedImage[], y?: ProcessedImage[]) => y ?? x },
    generationOptions: { reducer: (x, y) => y ?? x },
    analysis: { reducer: (x, y) => y ?? x },
    generatedCode: { reducer: (x, y) => y ?? x },
    draftVariables: { reducer: (x, y) => ({ ...(x ?? {}), ...(y ?? {}) }) },
    renderPngBase64: { reducer: (x, y) => y ?? x },
    criticNotes: { reducer: (x, y) => y ?? x },
    criticDeltas: { reducer: (x, y) => y ?? x },
    criticPassed: { reducer: (x, y) => y ?? x },
    usageLog: {
      reducer: (x, y) => (y && y.length > 0 ? mergeUsageLogs([...(x ?? []), ...y]) : (x ?? [])),
    },
    iteration: { reducer: (x, y) => (y !== undefined ? y : x) },
    maxIterations: { reducer: (x, y) => (y !== undefined ? y : x) },
    finalTemplate: { reducer: (x, y) => y ?? x },
    suggestedVariables: { reducer: (x, y) => y ?? x },
    warnings: { reducer: (x, y) => y ?? x },
  },
})
  .addNode('analyst', analystNode)
  .addNode('coder', coderNode)
  .addNode('render', renderNode)
  .addNode('critic', criticNode)
  .addNode('pdfHarden', pdfHardenNode)
  .addEdge(START, 'analyst')
  .addEdge('analyst', 'coder')
  .addEdge('coder', 'render')
  .addEdge('render', 'critic')
  .addConditionalEdges('critic', routeAfterCritic, {
    coder: 'coder',
    pdfHarden: 'pdfHarden',
  })
  .addEdge('pdfHarden', END);

const fidelityApp = workflow.compile();

export async function runFidelityGraph(
  req: TemplateGenerationRequest,
  processedImages: ProcessedImage[],
  emit?: AiStepEmitter,
): Promise<TemplateGenerationResult> {
  stepEmitter = emit;

  const format = (req.format || 'a4').toLowerCase();
  const detectedLandscape = detectLandscapeFromImages(processedImages);
  const effectiveLandscape = resolveEffectiveLandscape(
    req.isLandscape === true,
    true,
    detectedLandscape,
  );

  emitStep(
    emit,
    'detect_orientation',
    effectiveLandscape ? 'Orientation paysage' : 'Orientation portrait',
    'done',
  );

  const maxIterations = req.maxFidelityIterations ?? 2;

  const initialState: FidelityAgentState = {
    prompt: req.prompt,
    images: processedImages,
    generationOptions: {
      format,
      isLandscape: effectiveLandscape,
      pdfContentPadding: req.pdfContentPadding,
    },
    iteration: 0,
    maxIterations,
    warnings: [],
    usageLog: [],
  };

  try {
    const result = await fidelityApp.invoke(initialState);
    const content = result.finalTemplate || result.generatedCode || '';
    const analysis = result.analysis;
    const usageLog = mergeUsageLogs(result.usageLog ?? []);
    const totals = sumUsage(usageLog);
    const visionModel = getAiVisionModel();

    return {
      content,
      suggestedVariables: result.suggestedVariables ?? {},
      recommendedLandscape: effectiveLandscape,
      layoutSummary: analysis ? buildLayoutSummaryFromAnalysis(analysis) : undefined,
      warnings: result.warnings,
      usageLog,
      model: visionModel,
      inputTokens: totals.inputTokens,
      outputTokens: totals.outputTokens,
    };
  } finally {
    stepEmitter = undefined;
  }
}
