/**
 * Types pour l'architecture d'agent de génération de templates PDF
 */

/**
 * Image traitée pour l'analyse visuelle
 */
export interface ProcessedImage {
  url: string;
  base64: string;
  mimeType: string;
  width?: number;
  height?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
}

/**
 * Section d'un document
 */
export interface DocumentSection {
  name: string;
  components: string[];
  style: {
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    border?: string;
  };
}

/**
 * Plan de template généré par le planificateur
 */
export interface TemplatePlan {
  documentType: 'invoice' | 'resume' | 'report' | 'other';
  sections: DocumentSection[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  typography: {
    headers: string;
    subheaders: string;
    body: string;
    labels?: string;
  };
  selectedTemplate?: string;
  pdfConstraints: {
    avoidFlexGap: boolean;
    useMargins: boolean;
    avoidSticky: boolean;
    useExplicitWidths: boolean;
  };
  recommendedPageOrientation?: 'landscape' | 'portrait';
  imageAnalysis?: {
    detectedColors: string[];
    layout: string;
    components: string[];
    imageDimensions?: Array<{
      width: number;
      height: number;
      orientation: string;
    }>;
  };
}

export interface AgentGenerationOptions {
  format?: string;
  isLandscape?: boolean;
  pdfContentPadding?: string;
  apiKey?: string;
}

/**
 * Code généré par le générateur
 */
export interface GeneratedCode {
  html: string;
  blocks?: {
    header?: string;
    body?: string;
    footer?: string;
  };
}

/**
 * Résultat de la révision
 */
export interface ReviewedCode {
  correctedCode: string;
  corrections: string[];
  isValid: boolean;
  warnings?: string[];
  usage?: { model: string; inputTokens: number; outputTokens: number };
}

/**
 * Template de référence de la bibliothèque
 */
export interface ReferenceTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'resume' | 'report' | 'other';
  code: string;
  metadata: {
    colors: string[];
    style: string;
    complexity: 'simple' | 'medium' | 'complex';
  };
  variables: string[];
}

/**
 * État de l'agent LangGraph
 */
export interface AgentState {
  prompt: string;
  images?: ProcessedImage[];
  generationOptions?: AgentGenerationOptions;
  plan?: TemplatePlan;
  generatedCode?: string;
  corrections?: string[];
  iteration: number;
  maxIterations: number;
  finalTemplate?: string;
  suggestedVariables?: Record<string, any>;
  warnings?: string[];
}

/**
 * Résultat final de la génération
 */
export interface FinalTemplateResult {
  content: string;
  suggestedVariables: Record<string, any>;
  warnings?: string[];
}

export interface UiTypographyEntry {
  element: string;
  classes: string;
}

export interface UiDomNode {
  id: string;
  role: string;
  layout: string;
  children?: string[];
}

export interface UiSpacingEntry {
  zone: string;
  classes: string;
}

export interface UiColorZone {
  zoneId: string;
  hex: string;
  tailwind: string;
}

export interface CriticDelta {
  zone: string;
  probleme: string;
  fix: string;
}

/** Analyse structurelle JSON (nœud Analyst). */
export interface UiAnalysis {
  palette_couleurs: string[];
  typographie: UiTypographyEntry[];
  structure_dom: UiDomNode[];
  espacements: UiSpacingEntry[];
  icones?: 'lucide' | 'fontawesome' | 'none' | string;
  viewport_recommande?: { width: number; height: number };
  dimensions_maquette?: { width: number; height: number };
  couleurs_par_zone?: UiColorZone[];
}

export interface FidelityAgentState {
  prompt: string;
  images: ProcessedImage[];
  generationOptions: AgentGenerationOptions;
  analysis?: UiAnalysis;
  generatedCode?: string;
  draftVariables?: Record<string, unknown>;
  renderPngBase64?: string;
  criticNotes?: string;
  criticDeltas?: CriticDelta[];
  criticPassed?: boolean;
  usageLog?: Array<{ model: string; inputTokens: number; outputTokens: number }>;
  iteration: number;
  maxIterations: number;
  finalTemplate?: string;
  suggestedVariables?: Record<string, unknown>;
  warnings?: string[];
}
