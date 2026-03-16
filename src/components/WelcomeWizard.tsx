import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { BookOpen, Sparkles, Image, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WelcomeWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (documentId: string) => void;
}

const BOOK_TEMPLATES = [
  {
    id: 'novel',
    title: 'Powieść',
    description: 'Klasyczna struktura narracyjna z prologiem, rozdziałami i epilogiem',
    icon: BookOpen,
    chapters: [
      { title: 'Prolog', content: 'Tutaj możesz rozpocząć swoją historię...', order: 0 },
      { title: 'Rozdział 1', content: '', order: 1 },
      { title: 'Rozdział 2', content: '', order: 2 },
      { title: 'Rozdział 3', content: '', order: 3 },
      { title: 'Epilog', content: '', order: 4 },
    ]
  },
  {
    id: 'guide',
    title: 'Poradnik',
    description: 'Struktura edukacyjna z wprowadzeniem, rozdziałami tematycznymi i podsumowaniem',
    icon: FileText,
    chapters: [
      { title: 'Wprowadzenie', content: 'Witaj czytelniku! W tym poradniku dowiesz się...', order: 0 },
      { title: 'Podstawy', content: '', order: 1 },
      { title: 'Zaawansowane techniki', content: '', order: 2 },
      { title: 'Praktyczne przykłady', content: '', order: 3 },
      { title: 'Podsumowanie', content: '', order: 4 },
    ]
  },
  {
    id: 'blank',
    title: 'Pusta książka',
    description: 'Zacznij od czystej karty i stwórz własną strukturę',
    icon: Sparkles,
    chapters: [
      { title: 'Nowy rozdział', content: '', order: 0 },
    ]
  }
];

export const WelcomeWizard = ({ open, onClose, onComplete }: WelcomeWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const progress = (step / 3) * 100;

  const createBookFromTemplate = async () => {
    if (!selectedTemplate || !bookTitle.trim()) return;

    setIsCreating(true);
    console.log('[WelcomeWizard] Creating book with template:', selectedTemplate);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          title: bookTitle,
          user_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (docError) throw docError;
      console.log('[WelcomeWizard] Document created:', document.id);

      // Get template chapters
      const template = BOOK_TEMPLATES.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      // Create chapters
      const chaptersToCreate = template.chapters.map(ch => ({
        document_id: document.id,
        title: ch.title,
        content: ch.content,
        order_index: ch.order
      }));

      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chaptersToCreate);

      if (chaptersError) throw chaptersError;
      console.log('[WelcomeWizard] Chapters created');

      // Mark wizard as completed
      localStorage.setItem('welcomeWizardCompleted', 'true');

      toast({
        title: "Książka utworzona!",
        description: `"${bookTitle}" jest gotowa do pisania.`,
      });

      onComplete(document.id);
    } catch (error) {
      console.error('[WelcomeWizard] Error creating book:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć książki.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      createBookFromTemplate();
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (step === 2) return selectedTemplate !== null;
    if (step === 3) return bookTitle.trim().length > 0;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !isCreating && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Witaj w AI Writer!</DialogTitle>
          <DialogDescription>
            Przejdźmy przez szybkie wprowadzenie, aby pomóc Ci rozpocząć pisanie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Krok {step} z 3</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Welcome & Features */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <BookOpen className="w-16 h-16 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Twoja platforma do pisania</h3>
                <p className="text-muted-foreground">
                  AI Writer pomaga Ci pisać książki szybciej i lepiej dzięki potędze sztucznej inteligencji
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">AI Asystent pisania</h4>
                  <p className="text-sm text-muted-foreground">
                    Generuj treść, poprawiaj styl, kontynuuj narrację
                  </p>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Image className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Ilustracje AI</h4>
                  <p className="text-sm text-muted-foreground">
                    Twórz profesjonalne ilustracje do swoich rozdziałów
                  </p>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Struktura książki</h4>
                  <p className="text-sm text-muted-foreground">
                    Organizuj rozdziały i zarządzaj całą treścią
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Choose Template */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Wybierz typ książki</h3>
                <p className="text-muted-foreground">
                  Wybierz szablon, który najlepiej pasuje do Twojego projektu
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {BOOK_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate === template.id;
                  
                  return (
                    <Card
                      key={template.id}
                      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Icon className="w-8 h-8 text-primary" />
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{template.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {template.chapters.length} rozdziałów
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Book Title */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Nazwij swoją książkę</h3>
                <p className="text-muted-foreground">
                  Możesz to zmienić później w ustawieniach
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <label htmlFor="book-title" className="text-sm font-medium">
                    Tytuł książki
                  </label>
                  <input
                    id="book-title"
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="np. Moja pierwsza powieść"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>

                {selectedTemplate && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="text-sm font-medium">Twoja książka będzie zawierać:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {BOOK_TEMPLATES.find(t => t.id === selectedTemplate)?.chapters.map((ch, idx) => (
                        <li key={idx}>• {ch.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              disabled={isCreating}
            >
              {step === 1 ? 'Pomiń' : 'Wstecz'}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isCreating}
            >
              {isCreating ? 'Tworzenie...' : step === 3 ? 'Utwórz książkę' : 'Dalej'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
