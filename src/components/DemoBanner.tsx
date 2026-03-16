import { Button } from '@/components/ui/button';
import { Play, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface DemoBannerProps {
  onExitDemo: () => void;
  onCreateAccount: () => void;
}

export const DemoBanner = ({ onExitDemo, onCreateAccount }: DemoBannerProps) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 animate-scale-in cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="w-12 h-12 rounded-full editor-gradient flex items-center justify-center shadow-strong hover:scale-110 transition-all">
          <Play className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-4 mb-4 md:mx-auto md:max-w-2xl">
        <div className="p-4 rounded-2xl editor-gradient shadow-strong backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Tryb Demo</p>
                <p className="text-sm text-white/80">Przeglądasz przykładową książkę</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                className="bg-white text-editor-accent hover:bg-white/90"
                onClick={onCreateAccount}
              >
                Załóż Konto
              </Button>
              <Button 
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={onExitDemo}
              >
                Wyjdź
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/20 w-8 h-8"
                onClick={() => setIsMinimized(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
