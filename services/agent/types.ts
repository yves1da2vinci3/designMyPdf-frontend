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
  imageAnalysis?: {
    detectedColors: string[];
    layout: string;
    components: string[];
  };
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
