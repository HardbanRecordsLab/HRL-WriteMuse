import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  BookOpen,
  Image,
  PenTool,
  Target,
  Zap,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  target?: string; // CSS selector for element to highlight
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Witaj w WriterStudio!',
    description: 'Pokażemy Ci najważniejsze funkcje, które pomogą Ci pisać szybciej i lepiej. To zajmie tylko minutę.',
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'ai-assistant',
    title: 'Asystent AI',
    description: 'Zaznacz dowolny tekst i użyj przycisków AI: Ulepsz, Kontynuuj, Rozwiń, Przepisz lub Skróć. AI pomoże Ci w każdym aspekcie pisania.',
    icon: Zap,
    position: 'top-left'
  },
  {
    id: 'illustrations',
    title: 'Generowanie ilustracji',
    description: 'Zaznacz fragment tekstu i kliknij "Ilustracja" - AI stworzy profesjonalną grafikę pasującą do Twojej treści.',
    icon: Image,
    position: 'top-right'
  },
  {
    id: 'focus-mode',
    title: 'Tryb Focus',
    description: 'Kliknij "Tryb Focus" aby ukryć wszystkie rozpraszacze i skupić się wyłącznie na pisaniu.',
    icon: Target,
    position: 'top-right'
  },
  {
    id: 'chapters',
    title: 'Zarządzanie rozdziałami',
    description: 'W panelu bocznym możesz tworzyć, edytować i organizować rozdziały swojej książki. Wszystko zapisuje się automatycznie!',
    icon: BookOpen,
    position: 'bottom-left'
  },
  {
    id: 'done',
    title: 'Gotowe!',
    description: 'Teraz wiesz wszystko, co potrzebne do rozpoczęcia. Twórz niesamowite historie z pomocą AI!',
    icon: CheckCircle,
    position: 'center'
  }
];

interface OnboardingTutorialProps {
  onComplete: () => void;
  isVisible: boolean;
}

export const OnboardingTutorial = ({ onComplete, isVisible }: OnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  const Icon = step.icon;

  const getPositionClasses = () => {
    switch (step.position) {
      case 'top-left':
        return 'top-24 left-8';
      case 'top-right':
        return 'top-24 right-8';
      case 'bottom-left':
        return 'bottom-24 left-8';
      case 'bottom-right':
        return 'bottom-24 right-8';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Tutorial Card */}
      <Card 
        className={cn(
          "absolute w-full max-w-md p-6 surface-gradient border-editor-accent/30 shadow-strong transition-all duration-300",
          getPositionClasses(),
          isAnimating && "opacity-0 scale-95"
        )}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={handleSkip}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl editor-gradient flex items-center justify-center mb-4 shadow-medium">
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
        <p className="text-muted-foreground mb-6">{step.description}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {TUTORIAL_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentStep 
                  ? "w-6 bg-editor-accent" 
                  : idx < currentStep 
                    ? "bg-editor-accent/50" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={isFirstStep ? handleSkip : handlePrev}
            className="text-muted-foreground"
          >
            {isFirstStep ? (
              'Pomiń'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Wstecz
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            className="editor-gradient text-white hover:opacity-90"
          >
            {isLastStep ? (
              <>
                Zacznij pisać
                <Sparkles className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Dalej
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Spotlight effect for non-center positions */}
      {step.position !== 'center' && (
        <div 
          className={cn(
            "absolute w-32 h-32 rounded-full border-2 border-editor-accent/50 animate-pulse pointer-events-none",
            step.position === 'top-left' && "top-16 left-72",
            step.position === 'top-right' && "top-16 right-72",
            step.position === 'bottom-left' && "bottom-16 left-72",
            step.position === 'bottom-right' && "bottom-16 right-72"
          )}
        />
      )}
    </div>
  );
};

// Hook to manage tutorial state
export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('tutorialCompleted');
    if (!tutorialSeen) {
      // Show tutorial after a delay for better UX
      const timer = setTimeout(() => setShowTutorial(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTutorial = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem('tutorialCompleted');
    setShowTutorial(true);
  };

  return { showTutorial, completeTutorial, resetTutorial };
};
