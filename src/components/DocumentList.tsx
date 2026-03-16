import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Clock, Trash2, MoreVertical, FileEdit, Copy, Send, Download, Eye, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface Document {
  id: string;
  title: string;
  description: string;
  cover_image_url?: string;
  status: string;
  updated_at: string;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onDocumentsChange?: () => void;
  isDemoMode?: boolean;
}

export const DocumentList = ({ 
  documents, 
  selectedDocumentId, 
  onSelectDocument,
  onDocumentsChange,
  isDemoMode = false
}: DocumentListProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const handleDelete = async (doc: Document) => {
    if (isDemoMode) {
      toast({
        title: 'Tryb demo',
        description: 'W trybie demo nie można usuwać książek.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .eq('document_id', doc.id);

      if (chaptersError) throw chaptersError;

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast({
        title: 'Książka usunięta',
        description: 'Książka i wszystkie rozdziały zostały usunięte.',
      });

      onDocumentsChange?.();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć książki.',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleDuplicate = async (doc: Document) => {
    if (isDemoMode) {
      toast({
        title: 'Tryb demo',
        description: 'W trybie demo nie można duplikować książek.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Duplikowanie...',
      description: 'Tworzenie kopii książki.',
    });

    // TODO: Implement duplicate functionality
    toast({
      title: 'Wkrótce dostępne',
      description: 'Funkcja duplikowania będzie dostępna wkrótce.',
    });
  };

  const handleShare = (doc: Document) => {
    toast({
      title: 'Udostępnianie',
      description: 'Funkcja udostępniania będzie dostępna wkrótce.',
    });
  };

  const handleExport = (doc: Document) => {
    onSelectDocument(doc);
    toast({
      title: 'Eksport',
      description: 'Wybierz książkę i użyj menu eksportu w edytorze.',
    });
  };

  const handlePreview = (doc: Document) => {
    onSelectDocument(doc);
    toast({
      title: 'Podgląd',
      description: 'Otwarto książkę w trybie podglądu.',
    });
  };

  const handleSettings = (doc: Document) => {
    onSelectDocument(doc);
    toast({
      title: 'Ustawienia',
      description: 'Użyj panelu ustawień dokumentu w edytorze.',
    });
  };

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`relative group rounded-lg transition-all duration-200 ${
                selectedDocumentId === doc.id
                  ? 'bg-editor-accent-soft border border-editor-accent shadow-soft'
                  : 'hover:bg-editor-surface border border-transparent'
              }`}
            >
              <button
                onClick={() => onSelectDocument(doc)}
                className="w-full text-left p-3"
              >
                <div className="flex items-start gap-3">
                  {doc.cover_image_url ? (
                    <img 
                      src={doc.cover_image_url} 
                      alt={doc.title}
                      className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-editor-surface rounded flex items-center justify-center flex-shrink-0">
                      <Book className="w-5 h-5 text-editor-text-muted" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="text-sm font-medium text-editor-text truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-editor-text-muted mt-1 line-clamp-1">
                      {doc.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-editor-text-muted" />
                      <span className="text-xs text-editor-text-muted">
                        {formatDistanceToNow(new Date(doc.updated_at), { 
                          addSuffix: true,
                          locale: pl 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
              
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-editor-surface"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4 text-editor-text-muted" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 bg-editor-bg border-editor-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem 
                      onClick={() => onSelectDocument(doc)}
                      className="cursor-pointer"
                    >
                      <FileEdit className="w-4 h-4 mr-2" />
                      Edytuj
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handlePreview(doc)}
                      className="cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Podgląd
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-editor-border" />
                    <DropdownMenuItem 
                      onClick={() => handleDuplicate(doc)}
                      className="cursor-pointer"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplikuj
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport(doc)}
                      className="cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Eksportuj
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleShare(doc)}
                      className="cursor-pointer"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Udostępnij
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-editor-border" />
                    <DropdownMenuItem 
                      onClick={() => handleSettings(doc)}
                      className="cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Ustawienia
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-editor-border" />
                    <DropdownMenuItem 
                      onClick={() => {
                        setDocumentToDelete(doc);
                        setDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          
          {documents.length === 0 && (
            <div className="text-center py-12 text-editor-text-muted">
              <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Brak dokumentów</p>
              <p className="text-xs mt-1">Utwórz swoją pierwszą książkę</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-editor-bg border-editor-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno usunąć?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Książka "{documentToDelete?.title}" i wszystkie jej rozdziały zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => documentToDelete && handleDelete(documentToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
