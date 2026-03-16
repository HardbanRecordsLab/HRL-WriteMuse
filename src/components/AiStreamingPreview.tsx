import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Check, Sparkles } from 'lucide-react';

interface AiStreamingPreviewProps {
  isVisible: boolean;
  streamedText: string;
  isStreaming: boolean;
  onAccept: () => void;
  onCancel: () => void;
  action: string;
}

const actionLabels: Record<string, string> = {
  improve: 'Ulepszanie tekstu',
  continue: 'Kontynuowanie',
  summarize: 'Streszczanie',
  expand: 'Rozwijanie',
  rewrite: 'Przepisywanie',
  shorten: 'Skracanie',
  lengthen: 'Wydłużanie',
  generate: 'Generowanie',
};

export const AiStreamingPreview = ({
  isVisible,
  streamedText,
  isStreaming,
  onAccept,
  onCancel,
  action,
}: AiStreamingPreviewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as text streams in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col bg-card border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 text-primary ${isStreaming ? 'animate-pulse' : ''}`} />
            <span className="font-medium text-foreground">
              {actionLabels[action] || 'AI'} 
              {isStreaming && <span className="text-muted-foreground ml-2">generuje...</span>}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {streamedText ? (
              <div className="whitespace-pre-wrap font-serif text-foreground leading-relaxed">
                {streamedText}
                {isStreaming && (
                  <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse rounded-sm" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="ml-2">Rozpoczynam generowanie...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {streamedText.split(/\s+/).filter(w => w.length > 0).length} słów
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              {isStreaming ? 'Anuluj' : 'Odrzuć'}
            </Button>
            <Button 
              onClick={onAccept} 
              disabled={isStreaming || !streamedText}
            >
              <Check className="w-4 h-4 mr-2" />
              Zastosuj
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
