import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutosaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  errorMessage?: string;
  className?: string;
}

export const AutosaveIndicator = ({
  status,
  lastSaved,
  errorMessage,
  className
}: AutosaveIndicatorProps) => {
  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-primary animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Zapisywanie...</span>
          </div>
        );
      
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-500">
            <Check className="w-3.5 h-3.5" />
            <span>
              Zapisano
              {lastSaved && (
                <span className="text-muted-foreground ml-1">
                  {lastSaved.toLocaleTimeString('pl-PL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
            </span>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage || 'Błąd zapisu'}</span>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cloud className="w-3.5 h-3.5" />
            <span>Automatyczny zapis</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("text-xs transition-all duration-200", className)}>
      {getStatusContent()}
    </div>
  );
};
