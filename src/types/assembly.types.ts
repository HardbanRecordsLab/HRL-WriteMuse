// ============ DTR STUDIO ENGINE v2.0 - ASSEMBLY TYPES ============

export enum WorkflowMode {
  ASSEMBLY = 'assembly',
  STUDIO = 'studio'
}

export enum AssemblyStep {
  MODE_SELECT = 'mode-select',
  MANIFEST_UPLOAD = 'manifest-upload',
  ASSET_MAPPING = 'asset-mapping',
  ASSEMBLY_VALIDATE = 'assembly-validate',
  EXPORT = 'export'
}

export enum StudioStep {
  MANUSCRIPT_INGEST = 'manuscript-ingest',
  DTP_ORCHESTRATION = 'dtp-orchestration',
  ASSET_CONFIGURATION = 'asset-configuration',
  PREFLIGHT_PROOFING = 'preflight-proofing'
}

// ============ ASSET TYPES ============

export type AssetType = 
  | 'workcard-html'
  | 'audio'
  | 'raster'
  | 'vector'
  | 'source';

export interface ProcessedAsset {
  id: string;
  originalPath: string;
  processedURL: string;
  type: AssetType;
  size: number;
  checksum: string;
  metadata?: {
    inlineCSS?: string;
    sanitized?: boolean;
    originalSize?: number;
    compressionRatio?: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    sampleRate?: number;
    channels?: number;
  };
}

export interface ProcessingConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

// ============ MANIFEST TYPES ============

export interface AssemblyManifest {
  $schema?: string;
  version: '2.0';
  metadata: ManifestMetadata;
  sections: ManifestSection[];
  assets: GlobalAssets;
  config?: AssemblyConfig;
}

export interface ManifestMetadata {
  title: string;
  author: string;
  isbn?: string;
  language: string;
  genre?: string;
  description?: string;
}

export interface ManifestSection {
  id: string;
  chapter: number;
  title: string;
  placeholders: Record<string, string>;
  content?: string;
  metadata?: {
    wordCount?: number;
    duration?: number;
    interactivity?: 'static' | 'interactive';
  };
}

export interface GlobalAssets {
  css?: string[];
  fonts?: string[];
  scripts?: string[];
}

export interface AssemblyConfig {
  strict: boolean;
  inlineCSS: boolean;
  sandboxHTML: boolean;
  optimizeImages: boolean;
}

// ============ PLACEHOLDER TYPES ============

export interface PlaceholderMapping {
  placeholder: string;
  type: AssetType;
  sourcePath: string;
  resolved: boolean;
  asset?: ProcessedAsset;
}

// ============ VALIDATION TYPES ============

export interface ValidationResult {
  status: 'COMPLETE' | 'INCOMPLETE' | 'ERROR';
  total: number;
  mapped: number;
  missing: PlaceholderMapping[];
  orphaned: string[];
  errors: ValidationError[];
}

export interface ValidationError {
  type: 'MISSING_ASSET' | 'INVALID_PATH' | 'UNSUPPORTED_TYPE' | 'SECURITY_VIOLATION';
  placeholder: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface PartialValidationResult {
  placeholder: string;
  status: 'COMPLETE' | 'INCOMPLETE';
  errors: ValidationError[];
  progress: number;
}

// ============ EXPORT TYPES ============

export interface ExportProfile {
  id: string;
  name: string;
  description: string;
  format: 'html' | 'epub' | 'pdf';
  config: ExportProfileConfig;
}

export interface ExportProfileConfig {
  pageSize?: 'A4' | 'A5' | 'US-Letter' | 'Kindle' | 'iPad';
  margins?: { top: number; right: number; bottom: number; left: number };
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  colorMode?: 'color' | 'grayscale' | 'bw';
  compression?: 'none' | 'standard' | 'maximum';
  includeCSS?: boolean;
  includeJS?: boolean;
  embedFonts?: boolean;
  optimizeImages?: boolean;
  accessibility?: boolean;
}

export interface ExportConfig {
  format: 'html' | 'epub' | 'pdf';
  quality: 'draft' | 'print' | 'digital';
  includeMetadata: boolean;
  compression: boolean;
  profile?: string;
}

export interface ExportResult {
  success: boolean;
  format: string;
  size: number;
  downloadURL: string;
  metadata: {
    pages?: number;
    assets: number;
    generatedAt: string;
  };
}

// ============ ASSEMBLY STATE ============

export interface AssemblyState {
  mode: WorkflowMode | null;
  step: AssemblyStep;
  manifest: AssemblyManifest | null;
  mappings: PlaceholderMapping[];
  assets: Map<string, ProcessedAsset>;
  validation: ValidationResult | null;
  isProcessing: boolean;
  error: string | null;
}

// ============ COMMAND PATTERN (UNDO/REDO) ============

export interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
  description: string;
}

export interface CommandStackState {
  stack: Command[];
  pointer: number;
}

// ============ EXPORT PROFILES ============

export const EXPORT_PROFILES: ExportProfile[] = [
  {
    id: 'kindle-standard',
    name: 'Kindle Standard',
    description: 'Optimized for Kindle devices and apps',
    format: 'epub',
    config: {
      pageSize: 'Kindle',
      fontSize: 16,
      lineHeight: 1.5,
      colorMode: 'grayscale',
      compression: 'maximum',
      embedFonts: false,
      optimizeImages: true,
      accessibility: true
    }
  },
  {
    id: 'apple-books',
    name: 'Apple Books',
    description: 'For iBooks/Apple Books store',
    format: 'epub',
    config: {
      pageSize: 'iPad',
      fontSize: 18,
      lineHeight: 1.6,
      colorMode: 'color',
      compression: 'standard',
      embedFonts: true,
      optimizeImages: true,
      accessibility: true
    }
  },
  {
    id: 'web-interactive',
    name: 'Web Interactive',
    description: 'Full HTML with JavaScript interactions',
    format: 'html',
    config: {
      includeCSS: true,
      includeJS: true,
      compression: 'none',
      optimizeImages: false,
      accessibility: true
    }
  },
  {
    id: 'print-ready-a4',
    name: 'Print Ready (A4)',
    description: 'High-quality PDF for professional printing',
    format: 'pdf',
    config: {
      pageSize: 'A4',
      margins: { top: 20, right: 15, bottom: 20, left: 15 },
      fontSize: 12,
      lineHeight: 1.4,
      colorMode: 'color',
      compression: 'none',
      embedFonts: true,
      optimizeImages: false
    }
  },
  {
    id: 'therapy-workbook',
    name: 'Therapy Workbook',
    description: 'Interactive PDF with form fields preserved',
    format: 'pdf',
    config: {
      pageSize: 'A4',
      margins: { top: 25, right: 20, bottom: 25, left: 20 },
      fontSize: 14,
      lineHeight: 1.6,
      colorMode: 'color',
      compression: 'standard',
      embedFonts: true,
      optimizeImages: true,
      accessibility: true
    }
  }
];
