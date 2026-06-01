export type AiStepStatus = 'pending' | 'running' | 'done' | 'error';

export interface AiStep {
  id: string;
  label: string;
  status: AiStepStatus;
  detail?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: AiStep[];
  layoutSummary?: string;
  imageUrls?: string[];
  timestamp: number;
}

export type AiStreamEvent =
  | { type: 'step'; id: string; label: string; status: AiStepStatus; detail?: string }
  | { type: 'text_delta'; delta: string }
  | { type: 'text_done'; text: string }
  | {
      type: 'done';
      content: string;
      suggestedVariables: Record<string, unknown>;
      recommendedLandscape: boolean;
      layoutSummary?: string;
      responseText?: string;
      warnings?: string[];
    }
  | { type: 'error'; message: string };

export interface TemplateGenerationRequest {
  prompt: string;
  imageUrls?: string[];
  format?: string;
  isLandscape?: boolean;
  pdfContentPadding?: string;
  useAgent?: boolean;
  /** true = ancien pipeline multi-passes (opt-in / tests) ; défaut = une passe vision */
  useFidelityGraph?: boolean;
  maxFidelityIterations?: number;
}

export interface AiUsageRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface TemplateGenerationResult {
  content: string;
  suggestedVariables: Record<string, unknown>;
  recommendedLandscape: boolean;
  layoutSummary?: string;
  warnings?: string[];
  tokensUsed?: number;
  inputTokens?: number;
  outputTokens?: number;
  model?: string;
  usageLog?: AiUsageRecord[];
}

export type AiStepEmitter = (event: AiStreamEvent) => void;
