// ============ DTR STUDIO ENGINE v2.0 - ASSET PROCESSOR ============

import type { ProcessedAsset, AssetType, ProcessingConfig } from '@/types/assembly.types';
import { HTMLSanitizer } from './htmlSanitizer';
import { ManifestService } from './manifestService';

export class AssetProcessor {
  
  /**
   * Process uploaded file into ProcessedAsset
   */
  static async process(
    file: File,
    type?: AssetType,
    config: ProcessingConfig = {}
  ): Promise<ProcessedAsset> {
    const detectedType = type || ManifestService.detectAssetType(file.name);
    
    switch (detectedType) {
      case 'workcard-html':
        return this.processHTML(file, config);
      case 'raster':
        return this.processImage(file, config);
      case 'audio':
        return this.processAudio(file);
      case 'vector':
        return this.processSVG(file);
      default:
        return this.processGeneric(file);
    }
  }
  
  /**
   * Process HTML workcard file
   */
  private static async processHTML(
    file: File, 
    config: ProcessingConfig
  ): Promise<ProcessedAsset> {
    const html = await file.text();
    
    // Extract CSS
    const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    const inlineCSS = cssMatch ? cssMatch.join('\n') : '';
    
    // Remove document wrappers
    let bodyContent = html
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '');
    
    // Sanitize content
    const sanitized = HTMLSanitizer.sanitize(bodyContent);
    
    // Create blob
    const blob = new Blob([sanitized], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return {
      id: this.generateAssetId(),
      originalPath: file.name,
      processedURL: url,
      type: 'workcard-html',
      size: blob.size,
      checksum: await this.generateChecksum(blob),
      metadata: {
        inlineCSS,
        sanitized: true,
        originalSize: file.size
      }
    };
  }
  
  /**
   * Process raster image with optimization
   */
  private static async processImage(
    file: File,
    config: ProcessingConfig
  ): Promise<ProcessedAsset> {
    const maxWidth = config.maxWidth || 1920;
    const maxHeight = config.maxHeight || 1080;
    const quality = config.quality || 0.85;
    const format = config.format || 'image/webp';
    
    return new Promise(async (resolve, reject) => {
      try {
        const img = await createImageBitmap(file);
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Use OffscreenCanvas if available, fallback to regular canvas
        let blob: Blob;
        
        if (typeof OffscreenCanvas !== 'undefined') {
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          blob = await canvas.convertToBlob({ type: format, quality });
        } else {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          blob = await new Promise<Blob>((res, rej) => {
            canvas.toBlob(
              (b) => b ? res(b) : rej(new Error('Failed to create blob')),
              format,
              quality
            );
          });
        }
        
        const url = URL.createObjectURL(blob);
        
        resolve({
          id: this.generateAssetId(),
          originalPath: file.name,
          processedURL: url,
          type: 'raster',
          size: blob.size,
          checksum: await this.generateChecksum(blob),
          metadata: {
            originalSize: file.size,
            compressionRatio: ((1 - blob.size / file.size) * 100).toFixed(1) + '%',
            dimensions: { width, height }
          }
        });
      } catch (error) {
        // Fallback: use original file
        const url = URL.createObjectURL(file);
        resolve({
          id: this.generateAssetId(),
          originalPath: file.name,
          processedURL: url,
          type: 'raster',
          size: file.size,
          checksum: await this.generateChecksum(file),
          metadata: {
            originalSize: file.size
          }
        });
      }
    });
  }
  
  /**
   * Process audio file
   */
  private static async processAudio(file: File): Promise<ProcessedAsset> {
    const url = URL.createObjectURL(file);
    
    // Try to get audio metadata
    let duration: number | undefined;
    let sampleRate: number | undefined;
    let channels: number | undefined;
    
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      duration = audioBuffer.duration;
      sampleRate = audioBuffer.sampleRate;
      channels = audioBuffer.numberOfChannels;
      
      await audioContext.close();
    } catch {
      // Audio metadata extraction failed, continue without it
    }
    
    return {
      id: this.generateAssetId(),
      originalPath: file.name,
      processedURL: url,
      type: 'audio',
      size: file.size,
      checksum: await this.generateChecksum(file),
      metadata: {
        duration,
        sampleRate,
        channels
      }
    };
  }
  
  /**
   * Process SVG file
   */
  private static async processSVG(file: File): Promise<ProcessedAsset> {
    const svg = await file.text();
    
    // Basic SVG sanitization
    let clean = svg
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    const blob = new Blob([clean], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    return {
      id: this.generateAssetId(),
      originalPath: file.name,
      processedURL: url,
      type: 'vector',
      size: blob.size,
      checksum: await this.generateChecksum(blob)
    };
  }
  
  /**
   * Process generic file (pass-through)
   */
  private static async processGeneric(file: File): Promise<ProcessedAsset> {
    const url = URL.createObjectURL(file);
    
    return {
      id: this.generateAssetId(),
      originalPath: file.name,
      processedURL: url,
      type: 'source',
      size: file.size,
      checksum: await this.generateChecksum(file)
    };
  }
  
  /**
   * Generate unique asset ID
   */
  private static generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate SHA-256 checksum
   */
  private static async generateChecksum(blob: Blob): Promise<string> {
    try {
      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return `fallback_${Date.now()}`;
    }
  }
  
  /**
   * Revoke all blob URLs for cleanup
   */
  static revokeAssets(assets: ProcessedAsset[]): void {
    assets.forEach(asset => {
      if (asset.processedURL.startsWith('blob:')) {
        URL.revokeObjectURL(asset.processedURL);
      }
    });
  }
  
  /**
   * Get human-readable file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
