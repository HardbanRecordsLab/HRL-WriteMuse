import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Wand2, 
  Download, 
  Loader2,
  Image as ImageIcon,
  Type,
  Layers,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

interface CoverTemplate {
  id: string;
  name: string;
  category: string;
  preview_url: string | null;
  layout_data: any;
  is_premium: boolean;
}

interface CoverGeneratorProps {
  documentId: string;
  documentTitle: string;
  documentDescription?: string;
  authorName?: string;
  isDemoMode?: boolean;
  onCoverGenerated?: (imageUrl: string) => void;
}

const categoryLabels: Record<string, string> = {
  'romans': 'Romans',
  'thriller': 'Thriller',
  'fantasy': 'Fantasy',
  'poradnik': 'Poradnik',
  'kryminal': 'Kryminał',
  'scifi': 'Sci-Fi',
  'literatura': 'Literatura',
  'dla-dzieci': 'Dla dzieci',
};

export const CoverGenerator: React.FC<CoverGeneratorProps> = ({
  documentId,
  documentTitle,
  documentDescription = '',
  authorName = 'Autor',
  isDemoMode = false,
  onCoverGenerated,
}) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CoverTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CoverTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);

  // Cover customization
  const [coverTitle, setCoverTitle] = useState(documentTitle);
  const [coverSubtitle, setCoverSubtitle] = useState('');
  const [coverAuthor, setCoverAuthor] = useState(authorName);
  const [coverPrompt, setCoverPrompt] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setCoverTitle(documentTitle);
  }, [documentTitle]);

  const fetchTemplates = async () => {
    if (isDemoMode) {
      // Demo data - minimal templates for demo mode
      setTemplates([
        { id: '1', name: 'Romans', category: 'romans', preview_url: null, layout_data: { font: 'Playfair Display', colors: ['#8b5cf6', '#ec4899'], layout: 'centered' }, is_premium: false },
        { id: '2', name: 'Thriller', category: 'thriller', preview_url: null, layout_data: { font: 'Oswald', colors: ['#1f2937', '#ef4444'], layout: 'bold' }, is_premium: false },
        { id: '3', name: 'Fantasy', category: 'fantasy', preview_url: null, layout_data: { font: 'Cinzel', colors: ['#0d9488', '#6366f1'], layout: 'dramatic' }, is_premium: false },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('cover_templates').select('*');
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: CoverTemplate) => {
    setSelectedTemplate(template);
    setSelectedColors(template.layout_data?.colors || []);
  };

  const handleGenerateCover = async () => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby generować okładki AI!',
      });
      return;
    }

    if (!selectedTemplate && !coverPrompt.trim()) {
      toast({
        title: 'Wybierz szablon lub opisz okładkę',
        description: 'Potrzebujesz wybrać szablon lub wpisać prompt dla AI.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Brak autoryzacji');

      // Build the prompt for AI
      const aiPrompt = coverPrompt.trim() || 
        `Professional book cover for "${coverTitle}" by ${coverAuthor}. Genre: ${selectedTemplate?.category || 'literature'}. Style: ${selectedTemplate?.layout_data?.layout || 'elegant'}. The cover should be dramatic and eye-catching with a professional publishing quality.`;

      // userId is extracted from JWT on server side, no need to send it in body
      const response = await supabase.functions.invoke('generate-illustration', {
        body: {
          prompt: aiPrompt,
          chapterId: null,
          type: 'cover',
        },
      });

      if (response.error) throw response.error;

      const imageUrl = response.data?.imageUrl;
      if (imageUrl) {
        setGeneratedCover(imageUrl);
        onCoverGenerated?.(imageUrl);
        toast({
          title: 'Okładka wygenerowana!',
          description: 'Twoja okładka jest gotowa do pobrania.',
        });
      }
    } catch (error) {
      console.error('Error generating cover:', error);
      toast({
        title: 'Błąd generowania',
        description: 'Nie udało się wygenerować okładki. Spróbuj ponownie.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCover = () => {
    if (!generatedCover) return;

    const link = document.createElement('a');
    link.href = generatedCover;
    link.download = `${coverTitle.replace(/\s+/g, '_')}_cover.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = [...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="templates" className="flex-1">
            <Layers className="w-4 h-4 mr-2" />
            Szablony
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Generator AI
          </TabsTrigger>
          <TabsTrigger value="customize" className="flex-1">
            <Type className="w-4 h-4 mr-2" />
            Dostosuj
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wybierz szablon</CardTitle>
              <CardDescription>Profesjonalne szablony dla różnych gatunków</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {/* Template Preview */}
                      <div 
                        className="aspect-[2/3] p-4 flex flex-col justify-between"
                        style={{
                          background: template.layout_data?.colors 
                            ? `linear-gradient(135deg, ${template.layout_data.colors[0]}, ${template.layout_data.colors[1] || template.layout_data.colors[0]})`
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        }}
                      >
                        <div className="text-white/80 text-xs font-medium">
                          {categoryLabels[template.category] || template.category}
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold text-sm mb-1 line-clamp-2">
                            {template.name}
                          </div>
                          <div className="text-white/70 text-xs">
                            {template.layout_data?.font || 'Font'}
                          </div>
                        </div>
                        {template.is_premium && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>

                      {/* Selection indicator */}
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Opisz swoją okładkę
              </CardTitle>
              <CardDescription>
                AI wygeneruje unikalną okładkę na podstawie Twojego opisu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prompt dla AI</Label>
                <Textarea
                  placeholder="np. Mroczny las nocą z tajemniczą sylwetką w oddali, klimat grozy i napięcia, profesjonalna okładka thrillera..."
                  value={coverPrompt}
                  onChange={(e) => setCoverPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Wskazówka: Opisz nastrój, elementy graficzne, kolory i styl, który chcesz uzyskać.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="w-5 h-5" />
                Dane na okładce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tytuł książki</Label>
                <Input
                  value={coverTitle}
                  onChange={(e) => setCoverTitle(e.target.value)}
                  placeholder="Tytuł Twojej książki"
                />
              </div>
              <div className="space-y-2">
                <Label>Podtytuł (opcjonalny)</Label>
                <Input
                  value={coverSubtitle}
                  onChange={(e) => setCoverSubtitle(e.target.value)}
                  placeholder="Podtytuł lub slogan"
                />
              </div>
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input
                  value={coverAuthor}
                  onChange={(e) => setCoverAuthor(e.target.value)}
                  placeholder="Imię i nazwisko autora"
                />
              </div>

              {selectedTemplate && (
                <div className="space-y-2">
                  <Label>Kolory szablonu</Label>
                  <div className="flex gap-2">
                    {selectedTemplate.layout_data?.colors?.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg border-2 border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview & Generate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Podgląd i generowanie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview Area */}
          <div 
            className="aspect-[2/3] rounded-lg overflow-hidden border flex items-center justify-center"
            style={{
              background: generatedCover 
                ? `url(${generatedCover}) center/cover no-repeat`
                : selectedTemplate?.layout_data?.colors 
                  ? `linear-gradient(135deg, ${selectedTemplate.layout_data.colors[0]}, ${selectedTemplate.layout_data.colors[1] || selectedTemplate.layout_data.colors[0]})`
                  : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.7))'
            }}
          >
            {!generatedCover && (
              <div className="text-center p-6">
                <div className="text-white font-bold text-xl mb-2 drop-shadow-lg">
                  {coverTitle || 'Tytuł książki'}
                </div>
                {coverSubtitle && (
                  <div className="text-white/80 text-sm mb-4 drop-shadow">
                    {coverSubtitle}
                  </div>
                )}
                <div className="text-white/70 text-sm drop-shadow">
                  {coverAuthor || 'Autor'}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateCover}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : generatedCover ? (
                <RefreshCw className="w-4 h-4 mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generowanie...' : generatedCover ? 'Generuj ponownie' : 'Generuj okładkę'}
            </Button>
            {generatedCover && (
              <Button variant="outline" onClick={handleDownloadCover}>
                <Download className="w-4 h-4 mr-2" />
                Pobierz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
