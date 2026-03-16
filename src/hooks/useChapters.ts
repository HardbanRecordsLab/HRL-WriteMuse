import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: string;
  document_id: string;
  title: string;
  content: string | null;
  order_index: number;
  created_at: string | null;
  updated_at: string | null;
}

interface UseChaptersOptions {
  documentId: string | null;
  isDemoMode?: boolean;
  demoChapters?: Chapter[];
}

export const useChapters = ({ documentId, isDemoMode = false, demoChapters = [] }: UseChaptersOptions) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch chapters from Supabase
  const fetchChapters = useCallback(async () => {
    if (isDemoMode) {
      const filtered = demoChapters.filter(ch => ch.document_id === documentId);
      setChapters(filtered.length > 0 ? filtered : demoChapters);
      if (filtered.length > 0 && !selectedChapterId) {
        setSelectedChapterId(filtered[0].id);
        setEditorContent(filtered[0].content || '');
      }
      return;
    }

    if (!documentId) {
      setChapters([]);
      setSelectedChapterId(null);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('document_id', documentId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching chapters:', error);
        return;
      }

      setChapters(data || []);
      
      // Auto-select first chapter if none selected
      if (data && data.length > 0 && !selectedChapterId) {
        setSelectedChapterId(data[0].id);
        setEditorContent(data[0].content || '');
      }
    } finally {
      setIsLoading(false);
    }
  }, [documentId, isDemoMode, demoChapters, selectedChapterId]);

  // Load chapter content
  const loadChapterContent = useCallback(async (chapterId: string) => {
    if (isDemoMode) {
      const chapter = demoChapters.find(ch => ch.id === chapterId);
      if (chapter) {
        setEditorContent(chapter.content || '');
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('content')
        .eq('id', chapterId)
        .single();

      if (!error && data) {
        setEditorContent(data.content || '');
      }
    } catch (error) {
      console.error('Error loading chapter content:', error);
    }
  }, [isDemoMode, demoChapters]);

  // Create new chapter
  const createChapter = useCallback(async (title?: string) => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby tworzyć własne rozdziały!',
      });
      return null;
    }

    if (!documentId) return null;

    const maxOrder = chapters.reduce((max, ch) => Math.max(max, ch.order_index), -1);
    const newTitle = title || `Rozdział ${chapters.length + 1}`;

    try {
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          document_id: documentId,
          title: newTitle,
          content: '',
          order_index: maxOrder + 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chapter:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się utworzyć rozdziału.',
          variant: 'destructive',
        });
        return null;
      }

      setChapters(prev => [...prev, data]);
      setSelectedChapterId(data.id);
      setEditorContent('');
      toast({ title: 'Utworzono nowy rozdział' });
      return data;
    } catch (error) {
      console.error('Error creating chapter:', error);
      return null;
    }
  }, [documentId, isDemoMode, chapters, toast]);

  // Update chapter
  const updateChapter = useCallback(async (chapterId: string, updates: Partial<Chapter>) => {
    if (isDemoMode) return false;

    try {
      const { error } = await supabase
        .from('chapters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', chapterId);

      if (error) {
        console.error('Error updating chapter:', error);
        return false;
      }

      setChapters(prev => prev.map(ch =>
        ch.id === chapterId ? { ...ch, ...updates } : ch
      ));

      return true;
    } catch (error) {
      console.error('Error updating chapter:', error);
      return false;
    }
  }, [isDemoMode]);

  // Delete chapter
  const deleteChapter = useCallback(async (chapterId: string) => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby edytować własne książki!',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) {
        console.error('Error deleting chapter:', error);
        return false;
      }

      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
      
      if (selectedChapterId === chapterId) {
        const remaining = chapters.filter(ch => ch.id !== chapterId);
        setSelectedChapterId(remaining[0]?.id || null);
        setEditorContent(remaining[0]?.content || '');
      }

      toast({ title: 'Usunięto rozdział' });
      return true;
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return false;
    }
  }, [isDemoMode, selectedChapterId, chapters, toast]);

  // Rename chapter
  const renameChapter = useCallback(async (chapterId: string, newTitle: string) => {
    if (isDemoMode) return false;
    return updateChapter(chapterId, { title: newTitle });
  }, [isDemoMode, updateChapter]);

  // Save content
  const saveContent = useCallback(async () => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'W trybie demo zmiany nie są zapisywane. Załóż konto!',
      });
      return false;
    }

    if (!selectedChapterId) return false;

    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          content: editorContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedChapterId);

      if (error) {
        console.error('Error saving content:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zapisać treści.',
          variant: 'destructive',
        });
        return false;
      }

      toast({ title: 'Zapisano', description: 'Treść została zapisana.' });
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      return false;
    }
  }, [isDemoMode, selectedChapterId, editorContent, toast]);

  // Select chapter
  const selectChapter = useCallback((chapterId: string | null) => {
    setSelectedChapterId(chapterId);
    if (chapterId) {
      loadChapterContent(chapterId);
    } else {
      setEditorContent('');
    }
  }, [loadChapterContent]);

  // Get all chapters content for export
  const getAllChaptersContent = useCallback(() => {
    return chapters.map(ch => ({
      title: ch.title,
      content: ch.content || '',
    }));
  }, [chapters]);

  // Fetch chapters when document changes
  useEffect(() => {
    if (documentId) {
      fetchChapters();
    } else {
      setChapters([]);
      setSelectedChapterId(null);
      setEditorContent('');
    }
  }, [documentId]);

  // Update demo chapters when they change
  useEffect(() => {
    if (isDemoMode && demoChapters.length > 0 && documentId) {
      fetchChapters();
    }
  }, [isDemoMode, demoChapters, documentId]);

  return {
    chapters,
    selectedChapterId,
    editorContent,
    isLoading,
    setEditorContent,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    renameChapter,
    saveContent,
    selectChapter,
    getAllChaptersContent,
  };
};
