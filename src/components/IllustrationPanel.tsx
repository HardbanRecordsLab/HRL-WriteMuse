import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Illustration {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

interface IllustrationPanelProps {
  chapterId?: string;
  isDemoMode?: boolean;
}

export const IllustrationPanel = ({ chapterId, isDemoMode = false }: IllustrationPanelProps) => {
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchIllustrations = async () => {
    if (!chapterId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('illustrations')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched illustrations:', data?.length || 0);
      
      // Generate signed URLs for private bucket images
      const illustrationsWithSignedUrls = await Promise.all(
        (data || []).map(async (illustration) => {
          if (illustration.image_url) {
            // Extract the file path from the full URL
            const urlParts = illustration.image_url.split('/storage/v1/object/public/illustrations/');
            if (urlParts.length > 1) {
              const filePath = urlParts[1];
              // Create a signed URL with 1 hour expiration
              const { data: signedData } = await supabase.storage
                .from('illustrations')
                .createSignedUrl(filePath, 3600);
              
              if (signedData?.signedUrl) {
                return { ...illustration, image_url: signedData.signedUrl };
              }
            }
          }
          return illustration;
        })
      );
      
      setIllustrations(illustrationsWithSignedUrls);
    } catch (error) {
      console.error('Error fetching illustrations:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać ilustracji.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIllustrations();

    const handleIllustrationAdded = () => {
      fetchIllustrations();
    };

    window.addEventListener('illustration-added', handleIllustrationAdded);
    return () => window.removeEventListener('illustration-added', handleIllustrationAdded);
  }, [chapterId]);

  const handleDelete = async (illustrationId: string) => {
    try {
      const { error } = await supabase
        .from('illustrations')
        .delete()
        .eq('id', illustrationId);

      if (error) throw error;

      toast({
        title: 'Ilustracja usunięta',
        description: 'Ilustracja została pomyślnie usunięta.',
      });

      fetchIllustrations();
    } catch (error) {
      console.error('Error deleting illustration:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć ilustracji.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (imageUrl: string, illustrationId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `illustration-${illustrationId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading illustration:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać ilustracji.',
        variant: 'destructive',
      });
    }
  };

  if (!chapterId) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Wybierz rozdział, aby zobaczyć ilustracje</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Ilustracje</h3>
        <p className="text-sm text-muted-foreground">
          {illustrations.length} {illustrations.length === 1 ? 'ilustracja' : 'ilustracji'}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Ładowanie...</div>
        ) : illustrations.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Brak ilustracji</p>
            <p className="text-xs mt-2">Użyj przycisku "Ilustracja" w edytorze</p>
          </div>
        ) : (
          illustrations.map((illustration) => (
            <div
              key={illustration.id}
              className="border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video bg-muted">
                {illustration.image_url && !loadErrors.has(illustration.id) ? (
                  <img
                    src={illustration.image_url}
                    alt={illustration.prompt}
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error('Image failed to load:', illustration.id);
                      setLoadErrors(prev => new Set(prev).add(illustration.id));
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', illustration.id);
                    }}
                  />
                ) : loadErrors.has(illustration.id) ? (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Błąd ładowania obrazu
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Brak obrazu
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {illustration.prompt}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(illustration.image_url, illustration.id)}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Pobierz
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ta operacja jest nieodwracalna. Ilustracja zostanie trwale usunięta.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(illustration.id)}>
                          Usuń
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
