// ============ DTR STUDIO ENGINE v2.0 - HTML SANITIZER ============

import type { ValidationError } from '@/types/assembly.types';

// Security error class
export class SecurityError extends Error {
  constructor(
    public code: string,
    public severity: 'ERROR' | 'WARNING',
    message: string
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class HTMLSanitizer {
  
  private static ALLOWED_TAGS = [
    'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'input', 'textarea', 'label', 'button', 'select', 'option',
    'img', 'audio', 'video', 'source', 'canvas',
    'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
    'a', 'blockquote', 'pre', 'code',
    'figure', 'figcaption', 'section', 'article', 'header', 'footer',
    'form', 'fieldset', 'legend'
  ];
  
  private static ALLOWED_ATTRS = [
    'class', 'id', 'style', 'data-*', 
    'type', 'value', 'placeholder', 'name', 'for',
    'src', 'alt', 'width', 'height', 'loading',
    'href', 'target', 'rel',
    'controls', 'autoplay', 'loop', 'muted', 'preload',
    'rows', 'cols', 'required', 'disabled', 'readonly',
    'min', 'max', 'step', 'pattern',
    'colspan', 'rowspan', 'scope'
  ];
  
  private static FORBIDDEN_PATTERNS = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /<script[\s>]/gi,
    /<\/script>/gi,
    /<iframe[\s>]/gi,
    /<object[\s>]/gi,
    /<embed[\s>]/gi,
    /<link[\s>]/gi,
    /<meta[\s>]/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /url\s*\(\s*['"]*javascript/gi
  ];
  
  /**
   * Sanitize HTML content before injection
   */
  static sanitize(html: string, strict: boolean = true): string {
    // Check for forbidden patterns
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(html)) {
        throw new SecurityError(
          'SECURITY_VIOLATION',
          'ERROR',
          `Forbidden pattern detected in HTML content`
        );
      }
    }
    
    // Remove dangerous tags
    let clean = html;
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'];
    for (const tag of dangerousTags) {
      clean = clean.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
      clean = clean.replace(new RegExp(`<${tag}[^>]*\\/?>`, 'gi'), '');
    }
    
    // Remove event handlers
    clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');
    
    // Remove javascript: URLs
    clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    clean = clean.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
    
    // Wrap in sandboxed container
    return `
      <div 
        class="workcard-sandbox" 
        data-sanitized="true"
        style="
          all: initial;
          display: block;
          isolation: isolate;
          contain: layout style paint;
          font-family: inherit;
          color: inherit;
        "
      >
        ${clean}
      </div>
    `;
  }
  
  /**
   * Validate HTML without modifying it
   */
  static validate(html: string): ValidationError[] {
    const errors: ValidationError[] = [];
    
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(html)) {
        errors.push({
          type: 'SECURITY_VIOLATION',
          placeholder: '',
          message: `Forbidden pattern detected: ${pattern.source}`,
          severity: 'ERROR'
        });
      }
    }
    
    // Check for inline styles with dangerous properties
    const styleRegex = /style\s*=\s*["']([^"']*)["']/gi;
    let match;
    while ((match = styleRegex.exec(html)) !== null) {
      const style = match[1].toLowerCase();
      if (style.includes('expression') || style.includes('javascript')) {
        errors.push({
          type: 'SECURITY_VIOLATION',
          placeholder: '',
          message: 'Dangerous CSS expression detected in inline style',
          severity: 'ERROR'
        });
      }
    }
    
    return errors;
  }
  
  /**
   * Extract and scope CSS from HTML
   */
  static extractAndScopeCSS(html: string, scopeClass: string): { html: string; css: string } {
    const cssBlocks: string[] = [];
    
    // Extract style tags
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = styleRegex.exec(html)) !== null) {
      let css = match[1];
      // Scope all selectors
      css = css.replace(/([^{}]+)\{/g, (_, selector) => {
        const scopedSelector = selector
          .split(',')
          .map((s: string) => `.${scopeClass} ${s.trim()}`)
          .join(', ');
        return `${scopedSelector} {`;
      });
      cssBlocks.push(css);
    }
    
    // Remove style tags from HTML
    const cleanHtml = html.replace(styleRegex, '');
    
    return {
      html: cleanHtml,
      css: cssBlocks.join('\n')
    };
  }
  
  /**
   * Check if HTML is safe (quick check)
   */
  static isSafe(html: string): boolean {
    for (const pattern of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(html)) {
        return false;
      }
    }
    return true;
  }
}
