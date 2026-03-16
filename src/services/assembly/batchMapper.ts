// ============ DTR STUDIO ENGINE v2.0 - BATCH MAPPER ============

import type { PlaceholderMapping } from '@/types/assembly.types';

export class BatchMapper {
  
  /**
   * Auto-map files by naming convention
   */
  static autoMapByNaming(
    placeholders: PlaceholderMapping[],
    files: File[]
  ): Map<string, File> {
    const mappings = new Map<string, File>();
    
    for (const placeholder of placeholders) {
      const parts = this.parsePlaceholder(placeholder.placeholder);
      
      // Find best matching file
      const match = files.find(file => {
        const fileName = file.name.toLowerCase().replace(/\.[^.]+$/, '');
        return parts.every(part => fileName.includes(part));
      });
      
      if (match) {
        mappings.set(placeholder.placeholder, match);
      }
    }
    
    return mappings;
  }
  
  /**
   * Map files by pattern
   */
  static mapByPattern(
    placeholders: PlaceholderMapping[],
    files: File[],
    pattern: string // e.g., "workcard_{num}.html"
  ): Map<string, File> {
    const mappings = new Map<string, File>();
    
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\{(\w+)\}/g, '(?<$1>[\\w\\-]+)')
      .replace(/\./g, '\\.');
    
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    
    for (const file of files) {
      const match = file.name.match(regex);
      if (!match?.groups) continue;
      
      // Find placeholder with matching groups
      const matchingPlaceholder = placeholders.find(p => {
        const parts = this.parsePlaceholder(p.placeholder);
        return Object.values(match.groups!).some(v => 
          parts.includes(v.toLowerCase())
        );
      });
      
      if (matchingPlaceholder) {
        mappings.set(matchingPlaceholder.placeholder, file);
      }
    }
    
    return mappings;
  }
  
  /**
   * Map files by exact placeholder name match
   */
  static mapByExactName(
    placeholders: PlaceholderMapping[],
    files: File[]
  ): Map<string, File> {
    const mappings = new Map<string, File>();
    
    for (const placeholder of placeholders) {
      const expectedName = this.parsePlaceholder(placeholder.placeholder).join('_');
      
      const match = files.find(file => {
        const fileName = file.name.toLowerCase().replace(/\.[^.]+$/, '');
        return fileName === expectedName || fileName.replace(/[-\s]/g, '_') === expectedName;
      });
      
      if (match) {
        mappings.set(placeholder.placeholder, match);
      }
    }
    
    return mappings;
  }
  
  /**
   * Parse placeholder name to parts
   */
  private static parsePlaceholder(placeholder: string): string[] {
    return placeholder
      .replace(/[{}]/g, '')
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter(Boolean);
  }
  
  /**
   * Get mapping suggestions with confidence scores
   */
  static getSuggestions(
    placeholder: PlaceholderMapping,
    files: File[]
  ): Array<{ file: File; confidence: number }> {
    const parts = this.parsePlaceholder(placeholder.placeholder);
    const suggestions: Array<{ file: File; confidence: number }> = [];
    
    for (const file of files) {
      const fileName = file.name.toLowerCase().replace(/\.[^.]+$/, '');
      const fileParts = fileName.split(/[_\s-]+/);
      
      // Calculate match score
      let matchCount = 0;
      for (const part of parts) {
        if (fileParts.some(fp => fp.includes(part) || part.includes(fp))) {
          matchCount++;
        }
      }
      
      const confidence = parts.length > 0 ? matchCount / parts.length : 0;
      
      if (confidence > 0) {
        suggestions.push({ file, confidence });
      }
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
  
  /**
   * Validate batch mapping completeness
   */
  static validateBatchMapping(
    placeholders: PlaceholderMapping[],
    mappings: Map<string, File>
  ): { complete: boolean; missing: string[]; extra: string[] } {
    const missing = placeholders
      .filter(p => !mappings.has(p.placeholder))
      .map(p => p.placeholder);
    
    const expectedKeys = new Set(placeholders.map(p => p.placeholder));
    const extra = Array.from(mappings.keys()).filter(k => !expectedKeys.has(k));
    
    return {
      complete: missing.length === 0,
      missing,
      extra
    };
  }
}
