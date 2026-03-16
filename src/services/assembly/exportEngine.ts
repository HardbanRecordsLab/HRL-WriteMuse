// ============ DTR STUDIO ENGINE v2.0 - EXPORT ENGINE ============

import type { 
  AssemblyManifest, 
  ProcessedAsset, 
  ExportConfig,
  ExportResult,
  ExportProfile,
  EXPORT_PROFILES
} from '@/types/assembly.types';
import { PlaceholderParser } from './placeholderParser';
import JSZip from 'jszip';

export class ExportEngine {
  
  /**
   * Export assembled content to specified format
   */
  static async export(
    manifest: AssemblyManifest,
    assembledContent: string,
    assets: ProcessedAsset[],
    config: ExportConfig
  ): Promise<ExportResult> {
    switch (config.format) {
      case 'html':
        return this.exportHTML(manifest, assembledContent, assets);
      case 'epub':
        return this.exportEPUB(manifest, assembledContent, assets);
      case 'pdf':
        return this.exportPDF(manifest, assembledContent, config);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }
  
  /**
   * Export to single HTML file
   */
  static async exportHTML(
    manifest: AssemblyManifest,
    assembledContent: string,
    assets: ProcessedAsset[]
  ): Promise<ExportResult> {
    const html = `<!DOCTYPE html>
<html lang="${manifest.metadata.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="author" content="${this.escapeHtml(manifest.metadata.author)}">
  <meta name="description" content="${this.escapeHtml(manifest.metadata.description || '')}">
  <title>${this.escapeHtml(manifest.metadata.title)}</title>
  <style>
    :root {
      --primary: hsl(262 83% 58%);
      --background: hsl(15 23% 11%);
      --foreground: hsl(210 20% 98%);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--background);
      color: var(--foreground);
      line-height: 1.6;
      padding: 2rem;
    }
    .ebook-container { max-width: 800px; margin: 0 auto; }
    .workcard-sandbox {
      background: hsl(217 32% 17%);
      border-radius: 1rem;
      padding: 2rem;
      margin: 2rem 0;
    }
    .audio-inject { margin: 2rem 0; }
    .audio-inject audio { width: 100%; border-radius: 0.5rem; }
    .image-inject { margin: 2rem 0; text-align: center; }
    .image-inject img { max-width: 100%; border-radius: 0.75rem; }
    h1, h2, h3 { margin: 1.5rem 0 1rem; }
    p { margin: 0.75rem 0; }
  </style>
</head>
<body>
  <main class="ebook-container">
    <header>
      <h1>${this.escapeHtml(manifest.metadata.title)}</h1>
      <p>by ${this.escapeHtml(manifest.metadata.author)}</p>
    </header>
    ${assembledContent}
  </main>
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      format: 'html',
      size: blob.size,
      downloadURL: url,
      metadata: {
        assets: assets.length,
        generatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Export to EPUB format
   */
  static async exportEPUB(
    manifest: AssemblyManifest,
    assembledContent: string,
    assets: ProcessedAsset[]
  ): Promise<ExportResult> {
    const zip = new JSZip();
    
    // mimetype (must be first, uncompressed)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    
    // META-INF/container.xml
    zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
    
    // Generate unique ID
    const bookId = `urn:uuid:${crypto.randomUUID()}`;
    const modifiedDate = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    
    // OEBPS/content.opf
    const manifestItems = manifest.sections.map((s, i) => 
      `    <item id="chapter${i+1}" href="chapter${i+1}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n');
    
    const spineItems = manifest.sections.map((_, i) => 
      `    <itemref idref="chapter${i+1}"/>`
    ).join('\n');
    
    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${this.escapeXml(manifest.metadata.title)}</dc:title>
    <dc:creator>${this.escapeXml(manifest.metadata.author)}</dc:creator>
    <dc:language>${manifest.metadata.language}</dc:language>
    <meta property="dcterms:modified">${modifiedDate}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`);
    
    // OEBPS/nav.xhtml
    const navItems = manifest.sections.map((s, i) => 
      `        <li><a href="chapter${i+1}.xhtml">${this.escapeXml(s.title)}</a></li>`
    ).join('\n');
    
    zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc">
    <h1>Table of Contents</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`);
    
    // OEBPS/style.css
    zip.file('OEBPS/style.css', `
body { font-family: serif; line-height: 1.6; margin: 1em; }
h1, h2, h3 { margin: 1em 0 0.5em; }
p { margin: 0.5em 0; text-indent: 1.5em; }
.workcard-sandbox { background: #f5f5f5; padding: 1em; margin: 1em 0; border-radius: 0.5em; }
.image-inject { text-align: center; margin: 1em 0; }
.image-inject img { max-width: 100%; }
`);
    
    // Chapter files
    manifest.sections.forEach((section, index) => {
      const chapterContent = section.content || `<p>Chapter ${section.chapter}: ${section.title}</p>`;
      
      zip.file(`OEBPS/chapter${index+1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${this.escapeXml(section.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <section>
    <h1>${this.escapeXml(section.title)}</h1>
    ${chapterContent}
  </section>
</body>
</html>`);
    });
    
    // Generate EPUB
    const epubBlob = await zip.generateAsync({ 
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    const url = URL.createObjectURL(epubBlob);
    
    return {
      success: true,
      format: 'epub',
      size: epubBlob.size,
      downloadURL: url,
      metadata: {
        assets: assets.length,
        generatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Export to PDF format (basic implementation)
   */
  static async exportPDF(
    manifest: AssemblyManifest,
    assembledContent: string,
    config: ExportConfig
  ): Promise<ExportResult> {
    // For now, create a print-ready HTML that can be printed to PDF
    const printHtml = `<!DOCTYPE html>
<html lang="${manifest.metadata.language}">
<head>
  <meta charset="UTF-8">
  <title>${this.escapeHtml(manifest.metadata.title)}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    @media print {
      body { font-size: 12pt; }
      .page-break { page-break-after: always; }
    }
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.5;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    h1 { font-size: 24pt; margin-bottom: 0.5cm; }
    h2 { font-size: 18pt; margin-top: 1cm; }
    p { text-align: justify; margin: 0.5cm 0; }
    .workcard-sandbox {
      border: 1px solid #ccc;
      padding: 1cm;
      margin: 1cm 0;
      background: #f9f9f9;
    }
  </style>
</head>
<body>
  <h1>${this.escapeHtml(manifest.metadata.title)}</h1>
  <p><em>by ${this.escapeHtml(manifest.metadata.author)}</em></p>
  <hr/>
  ${assembledContent}
  <script>window.print();</script>
</body>
</html>`;
    
    const blob = new Blob([printHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return {
      success: true,
      format: 'pdf',
      size: blob.size,
      downloadURL: url,
      metadata: {
        generatedAt: new Date().toISOString(),
        assets: 0
      }
    };
  }
  
  /**
   * Escape HTML entities
   */
  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Escape XML entities
   */
  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Trigger download of export result
   */
  static triggerDownload(result: ExportResult, filename: string): void {
    const a = document.createElement('a');
    a.href = result.downloadURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
