import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ImportButtonProps {
  userId: string;
  onImportComplete?: () => void;
}

export const ImportButton = ({ userId, onImportComplete }: ImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromTXT = async (file: File): Promise<string> => {
    return await file.text();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (!['pdf', 'docx', 'doc', 'txt'].includes(fileExtension || '')) {
      toast({
        title: 'Nieobsługiwany format',
        description: 'Obsługiwane formaty: PDF, DOCX, DOC, TXT',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Importowanie...',
      description: 'Proszę czekać, przetwarzam plik...',
    });

    try {
      let extractedText = '';

      switch (fileExtension) {
        case 'pdf':
          extractedText = await extractTextFromPDF(file);
          break;
        case 'docx':
        case 'doc':
          extractedText = await extractTextFromDOCX(file);
          break;
        case 'txt':
          extractedText = await extractTextFromTXT(file);
          break;
      }

      if (!extractedText.trim()) {
        throw new Error('Nie udało się wyodrębnić tekstu z pliku');
      }

      // Create a new document
      const bookTitle = fileName.replace(/\.[^/.]+$/, '');
      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert({
          title: bookTitle,
          description: `Zaimportowano z pliku ${fileName}`,
          user_id: userId,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Split text into chapters (every 5000 characters or by double line breaks)
      const chapterSize = 5000;
      const chapters: string[] = [];
      
      if (extractedText.includes('\n\n\n')) {
        // If there are clear chapter breaks, use them
        chapters.push(...extractedText.split('\n\n\n').filter(ch => ch.trim()));
      } else {
        // Otherwise split by size
        for (let i = 0; i < extractedText.length; i += chapterSize) {
          chapters.push(extractedText.substring(i, i + chapterSize));
        }
      }

      // Create chapters
      const chapterInserts = chapters.map((content, index) => ({
        document_id: newDoc.id,
        title: `Rozdział ${index + 1}`,
        content: content.trim(),
        order_index: index,
      }));

      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapterInserts);

      if (chaptersError) throw chaptersError;

      toast({
        title: 'Import zakończony',
        description: `Utworzono książkę \"${bookTitle}\" z ${chapters.length} rozdziałami.`,
      });

      onImportComplete?.();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Błąd importu',
        description: 'Nie udało się zaimportować pliku. Spróbuj ponownie.',
        variant: 'destructive',
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Importuj
      </Button>
    </>
  );
};
