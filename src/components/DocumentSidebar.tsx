import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  FileText, 
  Settings, 
  Trash2, 
  Edit3,
  ChevronRight,
  Book
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Chapter {
  id: string;
  title: string;
  content: string;
  order_index: number;
}

interface Document {
  id: string;
  title: string;
  description: string;
  cover_image_url?: string;
  status: string;
}

interface DocumentSidebarProps {
  document: Document | null;
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onCreateChapter: () => void;
  onDeleteChapter: (chapterId: string) => void;
  onRenameChapter: (chapterId: string, newTitle: string) => void;
  onRefreshChapters: () => void;
  className?: string;
}

export const DocumentSidebar = ({
  document,
  chapters,
  selectedChapterId,
  onSelectChapter,
  onCreateChapter,
  onDeleteChapter,
  onRenameChapter,
  onRefreshChapters,
  className = '',
}: DocumentSidebarProps) => {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { toast } = useToast();

  const startEditing = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingTitle(chapter.title);
  };

  const saveEditing = async () => {
    if (editingChapterId && editingTitle.trim()) {
      try {
        const { error } = await supabase
          .from('chapters')
          .update({ title: editingTitle.trim() })
          .eq('id', editingChapterId);

        if (error) throw error;

        onRenameChapter(editingChapterId, editingTitle.trim());
        setEditingChapterId(null);
        setEditingTitle('');
        
        toast({
          title: "Zmieniono tytuł",
          description: "Tytuł rozdziału został zaktualizowany.",
        });
      } catch (error) {
        console.error('Error updating chapter title:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zmienić tytułu rozdziału.",
          variant: "destructive",
        });
      }
    }
  };

  const cancelEditing = () => {
    setEditingChapterId(null);
    setEditingTitle('');
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      onDeleteChapter(chapterId);
      
      toast({
        title: "Rozdział usunięty",
        description: "Rozdział został pomyślnie usunięty.",
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć rozdziału.",
        variant: "destructive",
      });
    }
  };

  if (!document) {
    return (
      <motion.div 
        className={`w-80 glass-subtle border-r border-border/30 flex items-center justify-center ${className}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center text-muted-foreground">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Book className="w-12 h-12 mx-auto mb-4 opacity-50 text-gold" />
          </motion.div>
          <p>Wybierz lub utwórz dokument</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`w-80 glass-subtle border-r border-border/30 flex flex-col ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header dokumentu */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-start gap-3">
          {document.cover_image_url ? (
            <motion.img 
              src={document.cover_image_url} 
              alt="Okładka"
              className="w-12 h-16 object-cover rounded-md shadow-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            />
          ) : (
            <motion.div 
              className="w-12 h-16 bg-secondary rounded-md flex items-center justify-center border border-border/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Book className="w-6 h-6 text-gold" />
            </motion.div>
          )}
          
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate font-serif">
              {document.title}
            </h2>
            {document.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {document.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded-full border border-gold/20 font-medium">
                {document.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {chapters.length} rozdziałów
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista rozdziałów */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/30">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onCreateChapter}
              className="w-full editor-gradient text-white hover:opacity-90 transition-opacity shadow-medium"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowy rozdział
            </Button>
          </motion.div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <AnimatePresence>
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`group relative mb-2 rounded-lg transition-all duration-200 ${
                    selectedChapterId === chapter.id
                      ? 'glass border border-gold/30 shadow-medium'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center p-3">
                    <FileText className={`w-4 h-4 mr-3 flex-shrink-0 ${selectedChapterId === chapter.id ? 'text-gold' : 'text-muted-foreground'}`} />
                    
                    {editingChapterId === chapter.id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        onBlur={saveEditing}
                        className="flex-1 h-auto py-1 px-2 text-sm border-gold/50 bg-secondary/50"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => onSelectChapter(chapter.id)}
                        className={`flex-1 text-left text-sm transition-colors truncate ${
                          selectedChapterId === chapter.id 
                            ? 'text-foreground font-medium' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {chapter.title}
                      </button>
                    )}

                    {/* Opcje rozdziału */}
                    <div className="flex items-center gap-1 transition-opacity ml-2 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(chapter)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Wskaźnik wybranego rozdziału */}
                  {selectedChapterId === chapter.id && (
                    <motion.div
                      layoutId="chapter-indicator"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                    >
                      <ChevronRight className="w-4 h-4 text-gold" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {chapters.length === 0 && (
              <motion.div 
                className="text-center py-8 px-4 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gold" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Brak rozdziałów</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Twoja książka jest pusta. Dodaj pierwszy rozdział, aby zacząć pisać.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={onCreateChapter}
                    size="sm"
                    className="editor-gradient text-white shadow-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Dodaj rozdział
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <Settings className="w-4 h-4 mr-2" />
          Ustawienia dokumentu
        </Button>
      </div>
    </motion.div>
  );
};
