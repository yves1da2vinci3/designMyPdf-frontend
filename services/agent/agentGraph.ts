/**
 * Graphe LangGraph pour orchestrer les phases de l'agent
 */
import { StateGraph, END, START } from '@langchain/langgraph';
import type { AgentState } from './types';
import { planTemplate } from './planner';
import { generateCode } from './generator';
import { reviewAndCorrect } from './reviewer';
import { processImagesForAnalysis } from './imageProcessor';
import { extractVariablesFromTemplate, buildVariableStructure } from './templateUtils';

// Note: extractVariablesFromTemplate et buildVariableStructure doivent être importés
// depuis les utilitaires existants. Si elles n'existent pas, on les créera.

/**
 * Nœud Planificateur
 */
async function plannerNode(state: AgentState): Promise<Partial<AgentState>> {
  const plan = await planTemplate(state.prompt, state.images);
  return {
    plan,
    iteration: state.iteration + 1,
  };
}

/**
 * Nœud Générateur
 */
async function generatorNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.plan) {
    throw new Error('Plan is required for generation');
  }

  const generatedCode = await generateCode(state.plan, state.images);
  return {
    generatedCode,
  };
}

/**
 * Nœud Reviewer
 */
async function reviewerNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.generatedCode || !state.plan) {
    throw new Error('Generated code and plan are required for review');
  }

  const review = await reviewAndCorrect(state.generatedCode, state.plan);
  return {
    corrections: review.corrections,
    generatedCode: review.correctedCode,
    warnings: review.warnings,
  };
}

/**
 * Nœud Finalizer - Extrait les variables et finalise le template
 */
async function finalizerNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.generatedCode) {
    throw new Error('Generated code is required for finalization');
  }

  // Extraire les variables Handlebars du template
  const extractedVars = extractVariablesFromTemplate(state.generatedCode);
  const suggestedVariables = buildVariableStructure(extractedVars, state.generatedCode);

  return {
    finalTemplate: state.generatedCode,
    suggestedVariables,
  };
}

/**
 * Condition de transition : décider si on corrige ou on finalise
 */
function shouldCorrect(state: AgentState): string {
  if (
    state.corrections &&
    state.corrections.length > 0 &&
    state.iteration < state.maxIterations
  ) {
    return 'correct';
  }
  return 'finalize';
}

/**
 * Construction du graphe avec définition des canaux
 */
const workflow = new StateGraph<AgentState>({
  channels: {
    prompt: {
      reducer: (x: string, y: string | undefined) => y ?? x,
    },
    images: {
      reducer: (x: any, y: any) => y ?? x,
    },
    plan: {
      reducer: (x: any, y: any) => y ?? x,
    },
    generatedCode: {
      reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    },
    corrections: {
      reducer: (x: string[] | undefined, y: string[] | undefined) => y ?? x,
    },
    iteration: {
      reducer: (x: number, y: number | undefined) => y ?? x,
    },
    maxIterations: {
      reducer: (x: number, y: number | undefined) => y ?? x,
    },
    finalTemplate: {
      reducer: (x: string | undefined, y: string | undefined) => y ?? x,
    },
    suggestedVariables: {
      reducer: (x: any, y: any) => y ?? x,
    },
    warnings: {
      reducer: (x: string[] | undefined, y: string[] | undefined) => y ?? x,
    },
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
    correct: 'generator', // Retour au générateur pour corriger
    finalize: 'finalizer',
  })
  .addEdge('finalizer', END);

/**
 * Compilation du graphe
 */
const app = workflow.compile();

/**
 * Fonction principale pour générer un template avec l'agent
 */
export async function generateTemplateWithAgent(
  prompt: string,
  imageUrls?: string[],
): Promise<{ content: string; suggestedVariables: Record<string, any>; warnings?: string[] }> {
  // Traiter les images si présentes
  const processedImages = imageUrls ? await processImagesForAnalysis(imageUrls) : undefined;

  // État initial
  const initialState: AgentState = {
    prompt,
    images: processedImages,
    iteration: 0,
    maxIterations: 3, // Maximum 3 itérations de correction
  };

  // Exécuter le graphe
  const result = await app.invoke(initialState);

  return {
    content: result.finalTemplate || '',
    suggestedVariables: result.suggestedVariables || {},
    warnings: result.warnings,
  };
}
