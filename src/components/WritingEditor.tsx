import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  PenTool, 
  Sparkles, 
  Image, 
  Wand2, 
  RefreshCw,
  Save,
  Zap,
  BookOpen,
  Maximize2,
  Target,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormatToolbar } from './FormatToolbar';
import { AdvancedFormatToolbar } from './AdvancedFormatToolbar';
import { Progress } from '@/components/ui/progress';
import { AiLoadingIndicator } from './AiLoadingIndicator';
import { AiStreamingPreview } from './AiStreamingPreview';
import { useAiStreaming } from '@/hooks/useAiStreaming';
import { motion, AnimatePresence } from 'framer-motion';

interface WritingEditorProps {
  content: string;
  onChange: (content: string) => void;
  chapterId?: string;
  onSave?: () => void;
  onFocusModeToggle?: () => void;
  isFocusMode?: boolean;
  isDemoMode?: boolean;
}

export const WritingEditor = ({ content, onChange, chapterId, onSave, onFocusModeToggle, isFocusMode, isDemoMode = false }: WritingEditorProps) => {
  const [selectedText, setSelectedText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [currentAiAction, setCurrentAiAction] = useState<string>('');
  const [isIllustrationLoading, setIsIllustrationLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordGoal, setWordGoal] = useState<number | null>(null);
  const [showStreamingPreview, setShowStreamingPreview] = useState(false);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleStreamComplete = useCallback((fullText: string) => {
    console.log('[WritingEditor] Stream complete, text length:', fullText.length);
  }, []);

  const handleStreamError = useCallback((error: string) => {
    toast({
      title: "Błąd generowania AI",
      description: error,
      variant: "destructive",
    });
    setShowStreamingPreview(false);
    setIsAiLoading(false);
    setCurrentAiAction('');
  }, [toast]);

  const { isStreaming, streamedText, streamAiWriter, cancelStream } = useAiStreaming({
    onDelta: () => {},
    onComplete: handleStreamComplete,
    onError: handleStreamError,
  });

  // Autosave logic
  useEffect(() => {
    if (!chapterId || !content || isDemoMode) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaving(true);
      try {
        const { error } = await supabase
          .from('chapters')
          .update({ content, updated_at: new Date().toISOString() })
          .eq('id', chapterId);

        if (!error) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Autosave error:', error);
      } finally {
        setAutoSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, chapterId, isDemoMode]);

  // Load word goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem(`wordGoal_${chapterId}`);
    if (savedGoal) {
      setWordGoal(parseInt(savedGoal));
    }
  }, [chapterId]);

  const toggleWordGoal = () => {
    if (wordGoal) {
      setWordGoal(null);
      localStorage.removeItem(`wordGoal_${chapterId}`);
    } else {
      const goal = 1000;
      setWordGoal(goal);
      localStorage.setItem(`wordGoal_${chapterId}`, goal.toString());
    }
  };

  const handleTextSelection = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      setSelectedText(selected);
      setSelectionRange({ start, end });
    }
  };

  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';

    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'underline':
        replacement = `__${selectedText}__`;
        break;
      case 'strikethrough':
        replacement = `~~${selectedText}~~`;
        break;
      case 'highlight':
        replacement = `==${selectedText}==`;
        break;
      case 'h1':
        replacement = `# ${selectedText}`;
        break;
      case 'h2':
        replacement = `## ${selectedText}`;
        break;
      case 'h3':
        replacement = `### ${selectedText}`;
        break;
      case 'ul':
        replacement = `- ${selectedText}`;
        break;
      case 'ol':
        replacement = `1. ${selectedText}`;
        break;
      case 'quote':
        replacement = `> ${selectedText}`;
        break;
      case 'code':
        replacement = `\`${selectedText}\``;
        break;
      case 'link':
        replacement = `[${selectedText}](url)`;
        break;
      case 'align-left':
        replacement = `<div style="text-align: left">${selectedText}</div>`;
        break;
      case 'align-center':
        replacement = `<div style="text-align: center">${selectedText}</div>`;
        break;
      case 'align-right':
        replacement = `<div style="text-align: right">${selectedText}</div>`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  const callAiWriter = async (action: string, prompt?: string) => {
    setIsAiLoading(true);
    setCurrentAiAction(action);
    setShowStreamingPreview(true);
    console.log('[WritingEditor] Calling AI writer with action:', action);
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('[WritingEditor] User not authenticated:', userError);
        toast({
          title: "Błąd autoryzacji",
          description: "Musisz być zalogowany aby używać AI.",
          variant: "destructive",
        });
        setShowStreamingPreview(false);
        setIsAiLoading(false);
        setCurrentAiAction('');
        return;
      }

      console.log('[WritingEditor] Calling AI writer for authenticated user');

      await streamAiWriter(
        action,
        prompt || selectedText,
        content.substring(0, 500),
        selectedText
      );

    } catch (error) {
      console.error('[WritingEditor] AI Writer error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAcceptStreamedText = () => {
    if (!streamedText) return;
    
    const textarea = textareaRef.current;
    if (textarea && selectedText && selectionRange) {
      const newContent = content.substring(0, selectionRange.start) + streamedText + content.substring(selectionRange.end);
      onChange(newContent);
    } else {
      onChange(content + '\n\n' + streamedText);
    }
    
    setShowStreamingPreview(false);
    setCurrentAiAction('');
    setSelectedText('');
    setSelectionRange(null);
    
    toast({
      title: "AI zakończył pracę",
      description: "Tekst został zastosowany pomyślnie.",
    });
  };

  const handleCancelStream = () => {
    cancelStream();
    setShowStreamingPreview(false);
    setIsAiLoading(false);
    setCurrentAiAction('');
  };

  const generateIllustration = async () => {
    if (!chapterId) {
      toast({
        title: "Brak rozdziału",
        description: "Wybierz rozdział przed generowaniem ilustracji.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedText && !content) {
      toast({
        title: "Brak tekstu",
        description: "Zaznacz tekst lub napisz treść do ilustracji.",
        variant: "destructive",
      });
      return;
    }

    setIsIllustrationLoading(true);
    try {
      const textToIllustrate = selectedText || content.substring(0, 300);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('Nie jesteś zalogowany');
      }
      
      console.log('Calling generate-illustration function...');
      const { data, error } = await supabase.functions.invoke('generate-illustration', {
        body: {
          prompt: `Stwórz ilustrację książkową na podstawie tego tekstu: "${textToIllustrate}". Styl artystyczny, wysokiej jakości, profesjonalny.`,
          style: 'artistic',
          chapterId: chapterId
        }
      });

      if (error) {
        console.error('Illustration generation error:', error);
        throw new Error(error.message || 'Błąd podczas generowania ilustracji');
      }

      if (!data?.success || !data?.imageUrl) {
        console.error('No image URL in response:', data);
        throw new Error(data?.error || 'Nie otrzymano URL obrazu');
      }

      console.log('Image URL received:', data.imageUrl);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('illustrations')
        .insert({
          chapter_id: chapterId,
          image_url: data.imageUrl,
          prompt: textToIllustrate,
          status: 'completed'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database error:', insertError);
        throw new Error('Nie udało się zapisać ilustracji do bazy danych');
      }

      console.log('Illustration saved to database:', insertedData?.id);

      toast({
        title: "Ilustracja wygenerowana",
        description: "Nowa ilustracja została dodana. Zobacz panel ilustracji po prawej.",
      });

      window.dispatchEvent(new CustomEvent('illustration-added'));
    } catch (error) {
      console.error('Full illustration error:', error);
      toast({
        title: "Błąd generowania ilustracji",
        description: error instanceof Error ? error.message : "Nie udało się wygenerować ilustracji.",
        variant: "destructive",
      });
    } finally {
      setIsIllustrationLoading(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const goalProgress = wordGoal ? (wordCount / wordGoal) * 100 : 0;

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {!isFocusMode && <AdvancedFormatToolbar onFormat={handleFormat} />}
      
      <motion.div 
        className={`flex items-center gap-2 p-3 border-b border-border/30 glass-subtle overflow-x-auto ${isFocusMode ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-1 px-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs font-medium text-muted-foreground">AI Asystent</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('improve')}
          disabled={!selectedText || isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <Wand2 className="w-3 h-3 mr-1.5" />
          Ulepsz
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('continue')}
          disabled={isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <PenTool className="w-3 h-3 mr-1.5" />
          Kontynuuj
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('summarize')}
          disabled={!selectedText || isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Streszcz
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('expand')}
          disabled={!selectedText || isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <Zap className="w-3 h-3 mr-1.5" />
          Rozwiń
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('rewrite')}
          disabled={!selectedText || isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <RefreshCw className="w-3 h-3 mr-1.5" />
          Przepisz
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('shorten')}
          disabled={!selectedText || isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <Zap className="w-3 h-3 mr-1.5" />
          Skróć
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => callAiWriter('lengthen')}
          disabled={!selectedText || isAiLoading}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <BookOpen className="w-3 h-3 mr-1.5" />
          Wydłuż
        </Button>
        
        <div className="w-px h-5 bg-border/50 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={generateIllustration}
          disabled={isIllustrationLoading || !chapterId}
          className="text-sm whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <Image className="w-3 h-3 mr-1.5" />
          {isIllustrationLoading ? 'Generowanie...' : 'Ilustracja'}
        </Button>
        
        <div className="flex-1" />

        {onFocusModeToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFocusModeToggle}
            className="whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
          >
            <Maximize2 className="w-3 h-3 mr-1.5" />
            {isFocusMode ? 'Wyjdź' : 'Tryb focus'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleWordGoal}
          className="whitespace-nowrap hover:bg-secondary/50 hover:text-foreground"
        >
          <Target className="w-3 h-3 mr-1.5" />
          {wordGoal ? `Cel: ${wordGoal}` : 'Ustaw cel'}
        </Button>
        
        {onSave && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              className="whitespace-nowrap editor-gradient text-white shadow-medium"
            >
              <Save className="w-3 h-3 mr-1.5" />
              Zapisz
            </Button>
          </motion.div>
        )}
      </motion.div>

      <div className="flex-1 p-8 overflow-auto bg-gradient-to-b from-background to-secondary/10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onSelect={handleTextSelection}
            placeholder="Zacznij pisać swoją książkę... Wybierz tekst, aby użyć funkcji AI lub formatowania."
            className="w-full min-h-[calc(100vh-20rem)] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none text-lg leading-relaxed font-serif"
          />
        </motion.div>
      </div>

      {/* AI Loading Indicator */}
      <AiLoadingIndicator isLoading={isAiLoading && !showStreamingPreview} action={currentAiAction} />

      {/* AI Streaming Preview */}
      <AiStreamingPreview
        isVisible={showStreamingPreview}
        streamedText={streamedText}
        isStreaming={isStreaming}
        onAccept={handleAcceptStreamedText}
        onCancel={handleCancelStream}
        action={currentAiAction}
      />

      {/* Status bar */}
      <motion.div 
        className={`border-t border-border/30 glass-subtle ${isFocusMode ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <AnimatePresence>
          {wordGoal && (
            <motion.div 
              className="px-6 py-1.5 border-b border-border/30"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Postęp dzisiejszego celu</span>
                <span className="font-medium text-foreground">
                  {wordCount} / {wordGoal} słów ({Math.min(Math.round(goalProgress), 100)}%)
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full gold-gradient rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center justify-between px-6 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gold" />
              <span className="font-semibold text-foreground">{wordCount}</span>
              <span>słów</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{content.length}</span>
              <span>znaków</span>
            </div>
            {selectedText && (
              <motion.div 
                className="flex items-center gap-1.5 text-primary"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span>Zaznaczono:</span>
                <span className="font-medium">{selectedText.length}</span>
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {autoSaving && (
                <motion.div 
                  key="saving"
                  className="flex items-center gap-2 text-gold"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <Save className="w-3.5 h-3.5 animate-pulse" />
                  <span>Zapisywanie...</span>
                </motion.div>
              )}
              {!autoSaving && lastSaved && (
                <motion.div 
                  key="saved"
                  className="flex items-center gap-2 text-emerald-400"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Zapisano {lastSaved.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                </motion.div>
              )}
            </AnimatePresence>
            {isAiLoading && (
              <motion.div 
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="text-gold font-medium">AI pracuje...</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
