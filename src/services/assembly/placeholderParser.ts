// ============ DTR STUDIO ENGINE v2.0 - PLACEHOLDER PARSER ============

import type { ProcessedAsset } from '@/types/assembly.types';

export class PlaceholderParser {
  
  /**
   * Detect all {{PLACEHOLDERS}} in text content
   */
  static detectInText(text: string): string[] {
    const regex = /\{\{([A-Z0-9_]+)\}\}/g;
    const matches = [...text.matchAll(regex)];
    return [...new Set(matches.map(m => `{{${m[1]}}}`))];
  }
  
  /**
   * Replace placeholders with actual content
   */
  static async injectContent(
    text: string,
    mappings: Map<string, ProcessedAsset>
  ): Promise<string> {
    let result = text;
    
    for (const [placeholder, asset] of mappings) {
      const replacement = await this.generateReplacement(asset);
      result = result.split(placeholder).join(replacement);
    }
    
    return result;
  }
  
  /**
   * Generate HTML replacement based on asset type
   */
  private static async generateReplacement(asset: ProcessedAsset): Promise<string> {
    switch (asset.type) {
      case 'workcard-html':
        try {
          const response = await fetch(asset.processedURL);
          const htmlContent = await response.text();
          return `
            <section 
              data-workcard-id="${this.escapeAttr(asset.id)}"
              data-checksum="${this.escapeAttr(asset.checksum)}"
              class="workcard-inject"
              style="isolation: isolate; contain: layout style paint;"
            >
              ${htmlContent}
            </section>
          `;
        } catch {
          return `<!-- ERROR: Failed to load workcard ${asset.id} -->`;
        }
      
      case 'audio':
        return `
          <figure data-asset-id="${this.escapeAttr(asset.id)}" class="audio-inject">
            <audio 
              controls 
              preload="metadata"
              class="w-full"
            >
              <source src="${this.escapeAttr(asset.processedURL)}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            ${asset.metadata?.duration ? `<figcaption class="text-sm text-muted-foreground mt-2">Duration: ${Math.floor(asset.metadata.duration / 60)}:${String(Math.floor(asset.metadata.duration % 60)).padStart(2, '0')}</figcaption>` : ''}
          </figure>
        `;
      
      case 'raster':
        const dimensions = asset.metadata?.dimensions;
        return `
          <figure data-asset-id="${this.escapeAttr(asset.id)}" class="image-inject">
            <img 
              src="${this.escapeAttr(asset.processedURL)}" 
              alt="Asset ${this.escapeAttr(asset.id)}"
              loading="lazy"
              ${dimensions ? `width="${dimensions.width}" height="${dimensions.height}"` : ''}
              class="max-w-full h-auto rounded-lg"
            />
          </figure>
        `;
      
      case 'vector':
        return `
          <figure data-asset-id="${this.escapeAttr(asset.id)}" class="svg-inject">
            <img 
              src="${this.escapeAttr(asset.processedURL)}" 
              alt="Asset ${this.escapeAttr(asset.id)}"
              class="max-w-full h-auto"
            />
          </figure>
        `;
      
      default:
        return `<!-- UNSUPPORTED ASSET TYPE: ${asset.type} for ${asset.id} -->`;
    }
  }
  
  /**
   * Escape HTML attributes
   */
  private static escapeAttr(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  /**
   * Count placeholders in text
   */
  static countPlaceholders(text: string): number {
    return this.detectInText(text).length;
  }
  
  /**
   * Validate all placeholders have mappings
   */
  static validateMappings(
    text: string, 
    mappings: Map<string, ProcessedAsset>
  ): { valid: boolean; missing: string[] } {
    const placeholders = this.detectInText(text);
    const missing = placeholders.filter(p => !mappings.has(p));
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
  
  /**
   * Extract placeholder name without braces
   */
  static extractName(placeholder: string): string {
    return placeholder.replace(/[{}]/g, '');
  }
  
  /**
   * Create placeholder string from name
   */
  static createPlaceholder(name: string): string {
    return `{{${name.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}}}`;
  }
}
