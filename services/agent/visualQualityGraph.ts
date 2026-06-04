/**
 * Boucle fidélité allégée : vision → render → critic → 1 refine max (sans Analyst JSON).
 */
import { StateGraph, END, START } from '@langchain/langgraph';
import type { FidelityAgentState } from './types';
import type { UiAnalysis } from './types';
import { runFidelityCoder } from './fidelityCoder';
import { renderFidelityHtmlToPng } from './fidelityRender';
import { runFidelityCritic } from './fidelityCritic';
import { extractVariablesFromTemplate, buildVariableStructure } from './templateUtils';
import type { AiStepEmitter } from '@/lib/aiGeneration/types';
import { emitStep, runStep } from '@/lib/aiGeneration/steps';
import { fontsStepLabel } from '@/lib/aiGeneration/detectFonts';
import type { TemplateGenerationRequest, TemplateGenerationResult } from '@/lib/aiGeneration/types';
import type { ProcessedImage } from './types';
import { mergeUsageLogs, sumUsage } from '@/services/ai/usageTypes';
import { getAiVisionModel } from '@/lib/aiGeneration/models';
import {
  detectLandscapeFromImages,
  resolveEffectiveLandscape,
} from '@/lib/aiGeneration/orientation';
import { runSinglePassImageGeneration } from '@/services/ai/imageVisionGeneration';
import { buildImageViewportHint } from '@/lib/aiGeneration/pdfPromptContext';

let stepEmitter: AiStepEmitter | undefined;

function appendUsage(
  state: FidelityAgentState,
  entry: { model: string; inputTokens: number; outputTokens: number },
): Array<{ model: string; inputTokens: number; outputTokens: number }> {
  return mergeUsageLogs([...(state.usageLog ?? []), entry]);
}

function minimalAnalysisFromImages(images: ProcessedImage[]): UiAnalysis {
  const img = images[0];
  const w = img?.width ?? 800;
  const h = img?.height ?? 600;
  return {
    palette_couleurs: [],
    typographie: [],
    structure_dom: [],
    espacements: [],
    couleurs_par_zone: [],
    icones: 'none',
    dimensions_maquette: { width: w, height: h },
    viewport_recommande: { width: w, height: h },
  };
}

async function generateNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  const viewportHint = buildImageViewportHint(
    state.generationOptions?.format || 'a4',
    state.generationOptions?.isLandscape ?? false,
    state.generationOptions?.pdfContentPadding,
  );
  const { html, suggestedVariables, usage } = await runSinglePassImageGeneration({
    prompt: state.prompt,
    processedImages: state.images,
    viewportHint,
    emit: stepEmitter,
  });
  return {
    generatedCode: html,
    analysis: minimalAnalysisFromImages(state.images),
    draftVariables: { ...(state.draftVariables ?? {}), ...suggestedVariables },
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
      state.generationOptions!,
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

async function refineNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  if (!state.analysis || !state.generatedCode) {
    throw new Error('Analyse et code requis pour affinage');
  }
  const { html, suggestedVariables, usage } = await runStep(
    stepEmitter,
    'refine_code',
    'Affinage visuel (1 passe)',
    () =>
      runFidelityCoder({
        prompt: state.prompt,
        analysis: state.analysis!,
        images: state.images,
        generationOptions: state.generationOptions!,
        criticNotes: state.criticNotes,
        criticDeltas: state.criticDeltas,
        previousCode: state.generatedCode,
        renderPngBase64: state.renderPngBase64,
        iteration: 1,
        imageFirst: true,
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

async function finalizeNode(state: FidelityAgentState): Promise<Partial<FidelityAgentState>> {
  const warnings: string[] = [...(state.warnings ?? [])];
  if (!state.criticPassed && state.iteration >= state.maxIterations) {
    warnings.push(
      'Mode qualité : affinage maximum atteint. Résultat conservé au mieux par rapport à la maquette.',
    );
  }
  const code = state.generatedCode || '';
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

function routeAfterCritic(state: FidelityAgentState): 'refine' | 'finalize' {
  if (state.criticPassed) return 'finalize';
  if (state.iteration >= state.maxIterations) return 'finalize';
  return 'refine';
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
  .addNode('generate', generateNode)
  .addNode('render', renderNode)
  .addNode('critic', criticNode)
  .addNode('refine', refineNode)
  .addNode('finalize', finalizeNode)
  .addEdge(START, 'generate')
  .addEdge('generate', 'render')
  .addEdge('render', 'critic')
  .addConditionalEdges('critic', routeAfterCritic, {
    refine: 'refine',
    finalize: 'finalize',
  })
  .addEdge('refine', 'finalize')
  .addEdge('finalize', END);

const visualQualityApp = workflow.compile();

export async function runVisualQualityGraph(
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

  const initialState: FidelityAgentState = {
    prompt: req.prompt,
    images: processedImages,
    generationOptions: {
      format,
      isLandscape: effectiveLandscape,
      pdfContentPadding: req.pdfContentPadding,
    },
    iteration: 0,
    maxIterations: 1,
    warnings: [],
    usageLog: [],
  };

  try {
    const result = await visualQualityApp.invoke(initialState);
    const content = result.finalTemplate || result.generatedCode || '';
    const usageLog = mergeUsageLogs(result.usageLog ?? []);
    const totals = sumUsage(usageLog);
    const visionModel = getAiVisionModel();

    return {
      content,
      suggestedVariables: result.suggestedVariables ?? {},
      recommendedLandscape: effectiveLandscape,
      layoutSummary: `- **Mode qualité** : vision + critique visuelle (1 affinage max).\n- **Orientation** : ${effectiveLandscape ? 'paysage' : 'portrait'}\n- ${processedImages.length} image(s) de référence.`,
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
