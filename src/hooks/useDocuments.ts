import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'in_progress' | 'completed' | 'published' | null;
  cover_image_url: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  settings: any;
}

interface UseDocumentsOptions {
  userId: string | null;
  isDemoMode?: boolean;
  demoDocuments?: Document[];
}

export const useDocuments = ({ userId, isDemoMode = false, demoDocuments = [] }: UseDocumentsOptions) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch documents from Supabase
  const fetchDocuments = useCallback(async () => {
    if (isDemoMode) {
      setDocuments(demoDocuments);
      return;
    }

    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się pobrać dokumentów.',
          variant: 'destructive',
        });
        return;
      }

      setDocuments(data || []);
      
      // Auto-select first document if none selected
      if (data && data.length > 0 && !selectedDocument) {
        setSelectedDocument(data[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isDemoMode, demoDocuments, selectedDocument, toast]);

  // Create new document
  const createDocument = useCallback(async (title: string = 'Nowa książka', description: string = 'Opis mojej nowej książki') => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby tworzyć własne książki!',
      });
      return null;
    }

    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title,
          description,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się utworzyć książki.',
          variant: 'destructive',
        });
        return null;
      }

      setDocuments(prev => [data, ...prev]);
      setSelectedDocument(data);
      toast({ title: 'Utworzono nową książkę' });
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  }, [userId, isDemoMode, toast]);

  // Update document
  const updateDocument = useCallback(async (documentId: string, updates: Partial<Document>) => {
    if (isDemoMode) return false;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', documentId);

      if (error) {
        console.error('Error updating document:', error);
        return false;
      }

      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, ...updates } : doc
      ));

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(prev => prev ? { ...prev, ...updates } : null);
      }

      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }, [isDemoMode, selectedDocument]);

  // Delete document
  const deleteDocument = useCallback(async (documentId: string) => {
    if (isDemoMode) return false;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć książki.',
          variant: 'destructive',
        });
        return false;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }

      toast({ title: 'Usunięto książkę' });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }, [isDemoMode, selectedDocument, toast]);

  // Select document
  const selectDocument = useCallback((document: Document | null) => {
    setSelectedDocument(document);
  }, []);

  // Select document by ID
  const selectDocumentById = useCallback((documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setSelectedDocument(doc);
    }
  }, [documents]);

  // Initial fetch
  useEffect(() => {
    if (userId || isDemoMode) {
      fetchDocuments();
    }
  }, [userId, isDemoMode]);

  // Update demo documents when they change
  useEffect(() => {
    if (isDemoMode && demoDocuments.length > 0) {
      setDocuments(demoDocuments);
    }
  }, [isDemoMode, demoDocuments]);

  return {
    documents,
    selectedDocument,
    isLoading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    selectDocument,
    selectDocumentById,
    setSelectedDocument,
  };
};
