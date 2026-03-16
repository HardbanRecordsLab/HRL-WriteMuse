// ============ DTR STUDIO ENGINE v2.0 - ASSEMBLY VALIDATOR ============

import type { 
  AssemblyManifest, 
  PlaceholderMapping, 
  ValidationResult,
  ValidationError,
  PartialValidationResult
} from '@/types/assembly.types';

export class AssemblyValidator {
  
  private mappings = new Map<string, PlaceholderMapping>();
  private listeners: Array<(result: PartialValidationResult) => void> = [];
  
  /**
   * Initialize with placeholder mappings
   */
  initialize(mappings: PlaceholderMapping[]): void {
    this.mappings.clear();
    mappings.forEach(m => this.mappings.set(m.placeholder, m));
  }
  
  /**
   * Subscribe to validation updates
   */
  onUpdate(callback: (result: PartialValidationResult) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Update single mapping and validate
   */
  updateMapping(placeholder: string, resolved: boolean): PartialValidationResult {
    const mapping = this.mappings.get(placeholder);
    if (!mapping) {
      return {
        placeholder,
        status: 'INCOMPLETE',
        errors: [{ type: 'MISSING_ASSET', placeholder, message: 'Unknown placeholder', severity: 'ERROR' }],
        progress: this.calculateProgress()
      };
    }
    
    mapping.resolved = resolved;
    const validation = this.validateSingle(mapping);
    
    const result: PartialValidationResult = {
      placeholder,
      status: validation.errors.some(e => e.severity === 'ERROR') ? 'INCOMPLETE' : 'COMPLETE',
      errors: validation.errors,
      progress: this.calculateProgress()
    };
    
    this.notifyUpdate(result);
    return result;
  }
  
  /**
   * Validate single mapping
   */
  private validateSingle(mapping: PlaceholderMapping): { errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    
    if (!mapping.resolved) {
      errors.push({
        type: 'MISSING_ASSET',
        placeholder: mapping.placeholder,
        message: `Asset not mapped for ${mapping.placeholder}`,
        severity: 'ERROR'
      });
    }
    
    if (mapping.asset) {
      // Type mismatch check
      const expectedType = this.inferExpectedType(mapping.placeholder);
      if (expectedType && mapping.asset.type !== expectedType) {
        errors.push({
          type: 'UNSUPPORTED_TYPE',
          placeholder: mapping.placeholder,
          message: `Expected ${expectedType}, got ${mapping.asset.type}`,
          severity: 'WARNING'
        });
      }
      
      // Size check (10MB limit)
      if (mapping.asset.size > 10 * 1024 * 1024) {
        errors.push({
          type: 'INVALID_PATH',
          placeholder: mapping.placeholder,
          message: `Asset size ${(mapping.asset.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit`,
          severity: 'WARNING'
        });
      }
    }
    
    return { errors };
  }
  
  /**
   * Infer expected asset type from placeholder name
   */
  private inferExpectedType(placeholder: string): string | null {
    const name = placeholder.toUpperCase();
    if (/WORKCARD|CARD|WORKSHEET|EXERCISE/.test(name)) return 'workcard-html';
    if (/AUDIO|SOUND|MUSIC|MEDITATION|PODCAST/.test(name)) return 'audio';
    if (/IMAGE|IMG|PHOTO|PICTURE|ILLUSTRATION/.test(name)) return 'raster';
    if (/ICON|LOGO|VECTOR/.test(name)) return 'vector';
    return null;
  }
  
  /**
   * Calculate overall progress
   */
  private calculateProgress(): number {
    const total = this.mappings.size;
    const resolved = Array.from(this.mappings.values()).filter(m => m.resolved).length;
    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  }
  
  /**
   * Notify all listeners
   */
  private notifyUpdate(result: PartialValidationResult): void {
    this.listeners.forEach(cb => cb(result));
  }
  
  /**
   * Local validation (without AI)
   */
  static validateLocal(mappings: PlaceholderMapping[]): ValidationResult {
    const errors: ValidationError[] = [];
    
    mappings.forEach(mapping => {
      if (!mapping.resolved) {
        errors.push({
          type: 'MISSING_ASSET',
          placeholder: mapping.placeholder,
          message: `Missing asset for ${mapping.placeholder}`,
          severity: 'ERROR'
        });
      }
    });
    
    const hasErrors = errors.some(e => e.severity === 'ERROR');
    
    return {
      status: hasErrors ? 'INCOMPLETE' : 'COMPLETE',
      total: mappings.length,
      mapped: mappings.filter(m => m.resolved).length,
      missing: mappings.filter(m => !m.resolved),
      orphaned: [],
      errors
    };
  }
  
  /**
   * Full validation with manifest check
   */
  static validateFull(
    manifest: AssemblyManifest,
    mappings: PlaceholderMapping[],
    uploadedFiles: string[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check for missing assets
    mappings.forEach(mapping => {
      if (!mapping.resolved) {
        errors.push({
          type: 'MISSING_ASSET',
          placeholder: mapping.placeholder,
          message: `Missing asset for ${mapping.placeholder}`,
          severity: 'ERROR'
        });
      }
    });
    
    // Find orphaned files (uploaded but not mapped)
    const mappedPaths = new Set(mappings.map(m => m.sourcePath));
    const orphaned = uploadedFiles.filter(f => !mappedPaths.has(f));
    
    if (orphaned.length > 0) {
      errors.push({
        type: 'INVALID_PATH',
        placeholder: '',
        message: `${orphaned.length} uploaded file(s) not mapped to any placeholder`,
        severity: 'WARNING'
      });
    }
    
    const hasErrors = errors.some(e => e.severity === 'ERROR');
    
    return {
      status: hasErrors ? 'INCOMPLETE' : 'COMPLETE',
      total: mappings.length,
      mapped: mappings.filter(m => m.resolved).length,
      missing: mappings.filter(m => !m.resolved),
      orphaned,
      errors
    };
  }
}
