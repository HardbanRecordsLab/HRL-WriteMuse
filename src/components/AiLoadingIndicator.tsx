import { useState, useEffect } from 'react';
import { Sparkles, Brain, Lightbulb, PenTool } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AiLoadingIndicatorProps {
  isLoading: boolean;
  action?: string;
}

const loadingMessages: Record<string, string[]> = {
  improve: [
    'Analizuję tekst...',
    'Szukam lepszych sformułowań...',
    'Poprawiam styl...',
    'Dopracowuję szczegóły...',
  ],
  continue: [
    'Analizuję kontekst...',
    'Generuję kontynuację...',
    'Tworzę kolejny akapit...',
    'Rozwijam historię...',
  ],
  summarize: [
    'Czytam tekst...',
    'Wyodrębniam kluczowe punkty...',
    'Tworzę streszczenie...',
    'Finalizuję podsumowanie...',
  ],
  expand: [
    'Analizuję treść...',
    'Dodaję szczegóły...',
    'Rozbudowuję opis...',
    'Wzbogacam narrację...',
  ],
  rewrite: [
    'Analizuję oryginalny tekst...',
    'Szukam nowych perspektyw...',
    'Przepisuję treść...',
    'Dopracowuję brzmienie...',
  ],
  shorten: [
    'Analizuję tekst...',
    'Identyfikuję najważniejsze elementy...',
    'Kondensuję treść...',
    'Optymalizuję długość...',
  ],
  lengthen: [
    'Analizuję tekst...',
    'Szukam elementów do rozwinięcia...',
    'Dodaję treść...',
    'Rozszerzam narrację...',
  ],
  default: [
    'AI pracuje...',
    'Przetwarzam tekst...',
    'Generuję odpowiedź...',
    'Niemal gotowe...',
  ],
};

const icons = [Sparkles, Brain, Lightbulb, PenTool];

export const AiLoadingIndicator = ({ isLoading, action = 'default' }: AiLoadingIndicatorProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  const messages = loadingMessages[action] || loadingMessages.default;
  const CurrentIcon = icons[iconIndex];

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      setProgress(0);
      setIconIndex(0);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
      setIconIndex(prev => (prev + 1) % icons.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading, messages.length]);

  if (!isLoading) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-card/95 backdrop-blur-md border border-primary/20 rounded-xl shadow-xl shadow-primary/10 px-6 py-4 min-w-[280px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative bg-gradient-to-br from-primary to-primary/60 p-2 rounded-full">
              <CurrentIcon className={cn(
                "w-5 h-5 text-primary-foreground transition-transform duration-300",
                "animate-pulse"
              )} />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              AI Asystent
            </p>
            <p className="text-xs text-muted-foreground animate-pulse">
              {messages[messageIndex]}
            </p>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Generowanie</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
