import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, File, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

interface Chapter {
  title: string;
  content: string;
}

interface ExportMenuProps {
  title: string;
  content: string;
  chapters?: Chapter[];
}

export const ExportMenu = ({ title, content, chapters }: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      // If we have chapters, export them all
      const contentToExport = chapters && chapters.length > 0
        ? chapters.map(ch => `## ${ch.title}\n\n${ch.content}`).join('\n\n---\n\n')
        : content;

      const lines = doc.splitTextToSize(contentToExport, maxWidth);
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      }

      doc.save(`${title}.pdf`);
      toast({
        title: 'Eksport zakończony',
        description: 'Dokument został wyeksportowany do PDF.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Błąd eksportu',
        description: 'Nie udało się wyeksportować do PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToDOCX = async () => {
    setIsExporting(true);
    try {
      const children: any[] = [
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 48,
            }),
          ],
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 },
        }),
      ];

      // If we have chapters, export them all
      if (chapters && chapters.length > 0) {
        chapters.forEach((chapter, index) => {
          // Chapter title
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: chapter.title,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );

          // Chapter content
          const paragraphs = chapter.content.split('\n\n');
          paragraphs.forEach(text => {
            if (text.trim()) {
              children.push(
                new Paragraph({
                  children: [new TextRun(text)],
                  spacing: { after: 200 },
                })
              );
            }
          });
        });
      } else {
        // Single content export
        const paragraphs = content.split('\n\n');
        paragraphs.forEach(text => {
          if (text.trim()) {
            children.push(
              new Paragraph({
                children: [new TextRun(text)],
                spacing: { after: 200 },
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${title}.docx`);

      toast({
        title: 'Eksport zakończony',
        description: 'Dokument został wyeksportowany do DOCX.',
      });
    } catch (error) {
      console.error('DOCX export error:', error);
      toast({
        title: 'Błąd eksportu',
        description: 'Nie udało się wyeksportować do DOCX.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToTXT = () => {
    setIsExporting(true);
    try {
      let fullText = `${title}\n${'='.repeat(title.length)}\n\n`;
      
      if (chapters && chapters.length > 0) {
        chapters.forEach(chapter => {
          fullText += `${chapter.title}\n${'-'.repeat(chapter.title.length)}\n\n`;
          fullText += `${chapter.content}\n\n`;
        });
      } else {
        fullText += content;
      }

      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${title}.txt`);

      toast({
        title: 'Eksport zakończony',
        description: 'Dokument został wyeksportowany do TXT.',
      });
    } catch (error) {
      console.error('TXT export error:', error);
      toast({
        title: 'Błąd eksportu',
        description: 'Nie udało się wyeksportować do TXT.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToEPUB = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      // mimetype (must be first and uncompressed)
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
      const now = new Date().toISOString();

      // Prepare chapters for EPUB
      const epubChapters = chapters && chapters.length > 0
        ? chapters
        : [{ title: 'Treść', content }];

      // OEBPS/content.opf
      const manifestItems = epubChapters.map((_, i) => 
        `    <item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`
      ).join('\n');

      const spineItems = epubChapters.map((_, i) => 
        `    <itemref idref="chapter${i + 1}"/>`
      ).join('\n');

      zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>pl</dc:language>
    <dc:creator>WriterStudio</dc:creator>
    <meta property="dcterms:modified">${now.slice(0, 19)}Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`);

      // OEBPS/style.css
      zip.file('OEBPS/style.css', `
body {
  font-family: Georgia, serif;
  line-height: 1.6;
  margin: 1em;
  padding: 0;
}
h1 {
  font-size: 1.8em;
  margin-bottom: 1em;
  text-align: center;
}
h2 {
  font-size: 1.4em;
  margin-top: 2em;
  margin-bottom: 0.5em;
}
p {
  text-indent: 1.5em;
  margin: 0.5em 0;
}
`);

      // OEBPS/nav.xhtml (navigation)
      const navItems = epubChapters.map((ch, i) => 
        `        <li><a href="chapter${i + 1}.xhtml">${escapeXml(ch.title)}</a></li>`
      ).join('\n');

      zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Spis treści</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Spis treści</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`);

      // OEBPS/toc.ncx (for older readers)
      const ncxNavPoints = epubChapters.map((ch, i) => `
    <navPoint id="navpoint${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
      <content src="chapter${i + 1}.xhtml"/>
    </navPoint>`
      ).join('');

      zip.file('OEBPS/toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <navMap>${ncxNavPoints}
  </navMap>
</ncx>`);

      // Generate chapter files
      epubChapters.forEach((chapter, i) => {
        const paragraphs = chapter.content
          .split('\n\n')
          .filter(p => p.trim())
          .map(p => `    <p>${escapeXml(p)}</p>`)
          .join('\n');

        zip.file(`OEBPS/chapter${i + 1}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${escapeXml(chapter.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${escapeXml(chapter.title)}</h1>
${paragraphs}
</body>
</html>`);
      });

      // Generate the EPUB file
      const blob = await zip.generateAsync({ 
        type: 'blob',
        mimeType: 'application/epub+zip',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });
      
      saveAs(blob, `${title}.epub`);

      toast({
        title: 'Eksport zakończony',
        description: 'Dokument został wyeksportowany do EPUB. Możesz go otworzyć na Kindle, iBooks i innych czytnikach.',
      });
    } catch (error) {
      console.error('EPUB export error:', error);
      toast({
        title: 'Błąd eksportu',
        description: 'Nie udało się wyeksportować do EPUB.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to escape XML special characters
  const escapeXml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isExporting} className="gap-2">
          <Download className="w-4 h-4" />
          {isExporting ? 'Eksportowanie...' : 'Eksportuj'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={exportToEPUB}>
          <BookOpen className="w-4 h-4 mr-2" />
          Eksportuj do EPUB
          <span className="ml-auto text-xs text-muted-foreground">e-book</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF}>
          <File className="w-4 h-4 mr-2" />
          Eksportuj do PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToDOCX}>
          <FileText className="w-4 h-4 mr-2" />
          Eksportuj do DOCX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToTXT}>
          <FileText className="w-4 h-4 mr-2" />
          Eksportuj do TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
