import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DocumentSettingsProps {
  documentId: string;
  title: string;
  description?: string;
  status?: string;
  coverImageUrl?: string;
  onUpdate: () => void;
}

export const DocumentSettings = ({
  documentId,
  title: initialTitle,
  description: initialDescription,
  status: initialStatus,
  coverImageUrl: initialCoverImageUrl,
  onUpdate,
}: DocumentSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || '');
  const [status, setStatus] = useState<'draft' | 'in_progress' | 'published' | 'completed'>(
    (initialStatus as 'draft' | 'in_progress' | 'published' | 'completed') || 'draft'
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverImageUrl || '');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title,
          description,
          status,
          cover_image_url: coverImageUrl,
        })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Ustawienia zapisane',
        description: 'Zmiany zostały pomyślnie zapisane.',
      });

      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać zmian.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-illustration', {
        body: {
          prompt: `Profesjonalna okładka książki o tytule "${title}". ${description}. Styl artystyczny, atrakcyjny wizualnie.`,
          style: 'cover',
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setCoverImageUrl(data.imageUrl);
        toast({
          title: 'Okładka wygenerowana',
          description: 'Nowa okładka została utworzona.',
        });
      }
    } catch (error) {
      console.error('Cover generation error:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wygenerować okładki.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingCover(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Ustawienia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ustawienia dokumentu</DialogTitle>
          <DialogDescription>
            Zarządzaj podstawowymi informacjami o dokumencie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł dokumentu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis książki"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'in_progress' | 'published' | 'completed')}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Szkic</SelectItem>
                <SelectItem value="in_progress">W trakcie</SelectItem>
                <SelectItem value="published">Opublikowane</SelectItem>
                <SelectItem value="completed">Ukończone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Okładka</Label>
            {coverImageUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img
                  src={coverImageUrl}
                  alt="Okładka"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="URL okładki"
              />
              <Button
                onClick={handleGenerateCover}
                disabled={isGeneratingCover}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isGeneratingCover ? 'Generowanie...' : 'Wygeneruj'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>Zapisz zmiany</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
