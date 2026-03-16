// ============ DTR STUDIO ENGINE v2.0 - MANIFEST SERVICE ============

import type { 
  AssemblyManifest, 
  PlaceholderMapping, 
  AssetType,
  ValidationError 
} from '@/types/assembly.types';

export class ManifestService {
  
  /**
   * Parse and validate manifest JSON file
   */
  static async parseManifest(file: File): Promise<AssemblyManifest> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate required fields
      if (!data.version || data.version !== '2.0') {
        throw new Error('Invalid manifest version. Expected "2.0"');
      }
      
      if (!data.metadata?.title || !data.metadata?.author || !data.metadata?.language) {
        throw new Error('Missing required metadata fields: title, author, language');
      }
      
      if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
        throw new Error('Manifest must contain at least one section');
      }
      
      // Validate sections
      for (const section of data.sections) {
        if (!section.id || !section.chapter || !section.title) {
          throw new Error(`Invalid section: missing required fields (id, chapter, title)`);
        }
        if (!section.placeholders || typeof section.placeholders !== 'object') {
          throw new Error(`Section ${section.id} must have a placeholders object`);
        }
      }
      
      return data as AssemblyManifest;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format in manifest file');
      }
      throw error;
    }
  }
  
  /**
   * Extract all placeholders from manifest
   */
  static extractPlaceholders(manifest: AssemblyManifest): PlaceholderMapping[] {
    const mappings: PlaceholderMapping[] = [];
    const seen = new Set<string>();
    
    manifest.sections.forEach(section => {
      Object.entries(section.placeholders).forEach(([key, path]) => {
        if (seen.has(key)) {
          console.warn(`Duplicate placeholder detected: ${key}`);
          return;
        }
        seen.add(key);
        
        mappings.push({
          placeholder: key,
          type: this.detectAssetType(path),
          sourcePath: path,
          resolved: false
        });
      });
    });
    
    return mappings;
  }
  
  /**
   * Detect asset type from file extension
   */
  static detectAssetType(path: string): AssetType {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    
    if (['html', 'htm'].includes(ext)) return 'workcard-html';
    if (['mp3', 'wav', 'ogg', 'm4a', 'webm'].includes(ext)) return 'audio';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'raster';
    if (['svg'].includes(ext)) return 'vector';
    
    return 'source';
  }
  
  /**
   * Validate manifest structure without AI
   */
  static validateStructure(manifest: AssemblyManifest): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check sections order
    const chapters = manifest.sections.map(s => s.chapter);
    for (let i = 1; i < chapters.length; i++) {
      if (chapters[i] < chapters[i - 1]) {
        errors.push({
          type: 'INVALID_PATH',
          placeholder: 'sections',
          message: `Chapter ordering error: chapter ${chapters[i]} appears after ${chapters[i-1]}`,
          severity: 'WARNING'
        });
        break;
      }
    }
    
    // Check for duplicate section IDs
    const sectionIds = manifest.sections.map(s => s.id);
    const duplicateIds = sectionIds.filter((id, i) => sectionIds.indexOf(id) !== i);
    if (duplicateIds.length > 0) {
      errors.push({
        type: 'INVALID_PATH',
        placeholder: duplicateIds[0],
        message: `Duplicate section ID: ${duplicateIds[0]}`,
        severity: 'ERROR'
      });
    }
    
    // Check for duplicate placeholders
    const allPlaceholders = manifest.sections.flatMap(s => Object.keys(s.placeholders));
    const duplicatePlaceholders = allPlaceholders.filter((p, i) => allPlaceholders.indexOf(p) !== i);
    if (duplicatePlaceholders.length > 0) {
      errors.push({
        type: 'INVALID_PATH',
        placeholder: duplicatePlaceholders[0],
        message: `Duplicate placeholder: ${duplicatePlaceholders[0]}`,
        severity: 'ERROR'
      });
    }
    
    // Check placeholder format
    const placeholderRegex = /^\{\{[A-Z0-9_]+\}\}$/;
    for (const section of manifest.sections) {
      for (const key of Object.keys(section.placeholders)) {
        if (!placeholderRegex.test(key)) {
          errors.push({
            type: 'INVALID_PATH',
            placeholder: key,
            message: `Invalid placeholder format: ${key}. Expected {{UPPERCASE_WITH_UNDERSCORES}}`,
            severity: 'ERROR'
          });
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Create a default manifest template
   */
  static createDefaultManifest(): AssemblyManifest {
    return {
      version: '2.0',
      metadata: {
        title: 'New Workbook',
        author: 'Author Name',
        language: 'pl'
      },
      sections: [
        {
          id: 'chapter-1',
          chapter: 1,
          title: 'Chapter 1',
          placeholders: {}
        }
      ],
      assets: {
        css: [],
        fonts: [],
        scripts: []
      },
      config: {
        strict: true,
        inlineCSS: true,
        sandboxHTML: true,
        optimizeImages: true
      }
    };
  }
  
  /**
   * Export manifest to JSON
   */
  static exportManifest(manifest: AssemblyManifest): string {
    return JSON.stringify(manifest, null, 2);
  }
  
  /**
   * Get total placeholder count
   */
  static getPlaceholderCount(manifest: AssemblyManifest): number {
    return manifest.sections.reduce((total, section) => {
      return total + Object.keys(section.placeholders).length;
    }, 0);
  }
}
