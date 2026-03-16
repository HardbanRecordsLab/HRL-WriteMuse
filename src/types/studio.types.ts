// ============ DTR STUDIO ENGINE v2.0 - STUDIO TYPES ============

export interface StudioProject {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterDNA {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  assets: ChapterAsset[];
  metadata: ChapterMetadata;
}

export interface ChapterAsset {
  id: string;
  type: 'image' | 'audio' | 'video' | 'workcard-html';
  url: string;
  position: number;
  caption?: string;
}

export interface ChapterMetadata {
  estimatedReadTime: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  summary?: string;
}

export interface TypographySettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  paragraphSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
}

export interface LayoutSettings {
  pageSize: 'A4' | 'A5' | 'US-Letter' | 'custom';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  columns: 1 | 2;
  headerEnabled: boolean;
  footerEnabled: boolean;
}

export interface DTPConfig {
  typography: TypographySettings;
  layout: LayoutSettings;
  theme: 'light' | 'dark' | 'sepia';
  coverImage?: string;
}

export interface PreflightCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
  message?: string;
  autoFixable?: boolean;
}

export interface PreflightReport {
  checks: PreflightCheck[];
  overallStatus: 'passed' | 'warning' | 'failed';
  generatedAt: string;
}
