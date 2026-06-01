/**
 * Graphe LangGraph pour orchestrer les phases de l'agent
 */
import { StateGraph, END, START } from '@langchain/langgraph';
import type { AgentState, AgentGenerationOptions } from './types';
import { planTemplate } from './planner';
import { generateCode } from './generator';
import { reviewAndCorrect } from './reviewer';
import { processImagesForAnalysis } from './imageProcessor';
import { extractVariablesFromTemplate, buildVariableStructure } from './templateUtils';
import type { AiStepEmitter } from '@/lib/aiGeneration/types';
import { emitStep, runStep } from '@/lib/aiGeneration/steps';
import {
  detectLandscapeFromImages,
  resolveEffectiveLandscape,
  buildLayoutSummaryFromPlan,
} from '@/lib/aiGeneration/orientation';
import { fontsStepLabel } from '@/lib/aiGeneration/detectFonts';

let stepEmitter: AiStepEmitter | undefined;

async function plannerNode(state: AgentState): Promise<Partial<AgentState>> {
  const plan = await runStep(stepEmitter, 'plan_layout', 'Plan de la mise en page', () =>
    planTemplate(state.prompt, state.images, state.generationOptions),
  );
  return {
    plan,
    iteration: state.iteration + 1,
  };
}

async function generatorNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.plan) {
    throw new Error('Plan is required for generation');
  }
  const generatedCode = await runStep(stepEmitter, 'generate_html', 'Génération du HTML', () =>
    generateCode(state.plan!, state.images, state.generationOptions),
  );
  return { generatedCode };
}

async function reviewerNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.generatedCode || !state.plan) {
    throw new Error('Generated code and plan are required for review');
  }
  const review = await runStep(stepEmitter, 'review_html', 'Revue des contraintes PDF', () =>
    reviewAndCorrect(state.generatedCode!, state.plan!, state.generationOptions),
  );
  return {
    corrections: review.corrections,
    generatedCode: review.correctedCode,
    warnings: review.warnings,
  };
}

async function finalizerNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.generatedCode) {
    throw new Error('Generated code is required for finalization');
  }
  const suggestedVariables = await runStep(
    stepEmitter,
    'extract_variables',
    'Mise à jour des variables d’exemple',
    async () => {
      const extractedVars = extractVariablesFromTemplate(state.generatedCode!);
      return buildVariableStructure(extractedVars, state.generatedCode!);
    },
  );
  emitStep(stepEmitter, 'fonts', fontsStepLabel(state.generatedCode!), 'done');
  return {
    finalTemplate: state.generatedCode,
    suggestedVariables,
  };
}

function shouldCorrect(state: AgentState): string {
  if (state.corrections && state.corrections.length > 0 && state.iteration < state.maxIterations) {
    return 'correct';
  }
  return 'finalize';
}

const workflow = new StateGraph<AgentState>({
  channels: {
    prompt: { reducer: (x: string, y: string | undefined) => y ?? x },
    images: { reducer: (x: any, y: any) => y ?? x },
    plan: { reducer: (x: any, y: any) => y ?? x },
    generatedCode: { reducer: (x: string | undefined, y: string | undefined) => y ?? x },
    corrections: { reducer: (x: string[] | undefined, y: string[] | undefined) => y ?? x },
    iteration: { reducer: (x: number, y: number | undefined) => y ?? x },
    maxIterations: { reducer: (x: number, y: number | undefined) => y ?? x },
    finalTemplate: { reducer: (x: string | undefined, y: string | undefined) => y ?? x },
    suggestedVariables: { reducer: (x: any, y: any) => y ?? x },
    warnings: { reducer: (x: string[] | undefined, y: string[] | undefined) => y ?? x },
    generationOptions: { reducer: (x: any, y: any) => y ?? x },
  },
})
  .addNode('planner', plannerNode)
  .addNode('generator', generatorNode)
  .addNode('reviewer', reviewerNode)
  .addNode('finalizer', finalizerNode)
  .addEdge(START, 'planner')
  .addEdge('planner', 'generator')
  .addEdge('generator', 'reviewer')
  .addConditionalEdges('reviewer', shouldCorrect, {
    correct: 'generator',
    finalize: 'finalizer',
  })
  .addEdge('finalizer', END);

const app = workflow.compile();

export async function generateTemplateWithAgent(
  prompt: string,
  imageUrls?: string[],
  options?: AgentGenerationOptions,
  emit?: AiStepEmitter,
): Promise<{
  content: string;
  suggestedVariables: Record<string, unknown>;
  warnings?: string[];
  recommendedLandscape?: boolean;
  layoutSummary?: string;
}> {
  stepEmitter = emit;

  const processedImages = imageUrls?.length
    ? await runStep(emit, 'analyze_images', 'Analyse des images de référence', () =>
        processImagesForAnalysis(imageUrls),
      )
    : undefined;

  const detectedLandscape = processedImages ? detectLandscapeFromImages(processedImages) : false;
  const effectiveLandscape = resolveEffectiveLandscape(
    options?.isLandscape === true,
    Boolean(processedImages?.length),
    detectedLandscape,
  );

  emitStep(
    emit,
    'detect_orientation',
    effectiveLandscape ? 'Orientation paysage' : 'Orientation portrait',
    'done',
  );

  const generationOptions: AgentGenerationOptions = {
    ...options,
    isLandscape: effectiveLandscape,
  };

  const initialState: AgentState = {
    prompt,
    images: processedImages,
    generationOptions,
    iteration: 0,
    maxIterations: 3,
  };

  const result = await app.invoke(initialState);
  stepEmitter = undefined;

  const plan = result.plan;
  const recommendedLandscape =
    plan?.recommendedPageOrientation === 'landscape' || effectiveLandscape;

  return {
    content: result.finalTemplate || '',
    suggestedVariables: result.suggestedVariables || {},
    warnings: result.warnings,
    recommendedLandscape,
    layoutSummary: plan ? buildLayoutSummaryFromPlan(plan) : undefined,
  };
}
