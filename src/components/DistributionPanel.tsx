import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Upload, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2,
  Store,
  BookOpen,
  Headphones,
  ExternalLink,
  Send
} from 'lucide-react';

interface DistributionPlatform {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  formats: string[];
  is_active: boolean;
}

interface DocumentDistribution {
  id: string;
  document_id: string;
  platform_id: string;
  status: string;
  external_url: string | null;
  submitted_at: string | null;
  published_at: string | null;
}

interface DistributionPanelProps {
  documentId: string;
  documentTitle: string;
  isDemoMode?: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  'amazon-kdp': <Store className="w-5 h-5" />,
  'google-play': <BookOpen className="w-5 h-5" />,
  'apple-books': <BookOpen className="w-5 h-5" />,
  'kobo': <BookOpen className="w-5 h-5" />,
  'empik': <Store className="w-5 h-5" />,
  'legimi': <BookOpen className="w-5 h-5" />,
  'storytel': <Headphones className="w-5 h-5" />,
  'audible': <Headphones className="w-5 h-5" />,
  'draft2digital': <Globe className="w-5 h-5" />,
  'ingram-spark': <Store className="w-5 h-5" />,
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Szkic', color: 'bg-muted text-muted-foreground', icon: <Clock className="w-3 h-3" /> },
  pending: { label: 'W trakcie', color: 'bg-yellow-500/20 text-yellow-600', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  published: { label: 'Opublikowane', color: 'bg-green-500/20 text-green-600', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'Odrzucone', color: 'bg-red-500/20 text-red-600', icon: <XCircle className="w-3 h-3" /> },
  archived: { label: 'Zarchiwizowane', color: 'bg-muted text-muted-foreground', icon: <Clock className="w-3 h-3" /> },
};

export const DistributionPanel: React.FC<DistributionPanelProps> = ({
  documentId,
  documentTitle,
  isDemoMode = false,
}) => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<DistributionPlatform[]>([]);
  const [distributions, setDistributions] = useState<DocumentDistribution[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [documentId]);

  const fetchData = async () => {
    if (isDemoMode) {
      // Demo data - minimal for demo mode
      setPlatforms([
        { id: '1', name: 'Amazon KDP', slug: 'amazon-kdp', description: 'Największa platforma e-booków', formats: ['epub', 'mobi', 'pdf'], is_active: true },
        { id: '2', name: 'Empik', slug: 'empik', description: 'Największy polski sprzedawca', formats: ['epub', 'mobi', 'pdf'], is_active: true },
        { id: '3', name: 'Legimi', slug: 'legimi', description: 'Polska usługa subskrypcyjna', formats: ['epub', 'mobi'], is_active: true },
      ]);
      setDistributions([]);
      setIsLoading(false);
      return;
    }

    try {
      const [platformsRes, distributionsRes] = await Promise.all([
        supabase.from('distribution_platforms').select('*').eq('is_active', true),
        supabase.from('document_distributions').select('*').eq('document_id', documentId),
      ]);

      if (platformsRes.data) setPlatforms(platformsRes.data);
      if (distributionsRes.data) setDistributions(distributionsRes.data);
    } catch (error) {
      console.error('Error fetching distribution data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDistributionForPlatform = (platformId: string) => {
    return distributions.find(d => d.platform_id === platformId);
  };

  const togglePlatformSelection = (platformId: string) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platformId)) {
      newSelected.delete(platformId);
    } else {
      newSelected.add(platformId);
    }
    setSelectedPlatforms(newSelected);
  };

  const handleSubmitToSelected = async () => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby dystrybuować książki!',
      });
      return;
    }

    if (selectedPlatforms.size === 0) {
      toast({
        title: 'Wybierz platformy',
        description: 'Zaznacz co najmniej jedną platformę do dystrybucji.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newDistributions = Array.from(selectedPlatforms)
        .filter(platformId => !getDistributionForPlatform(platformId))
        .map(platformId => ({
          document_id: documentId,
          platform_id: platformId,
          status: 'pending' as const,
          submitted_at: new Date().toISOString(),
        }));

      if (newDistributions.length > 0) {
        const { error } = await supabase.from('document_distributions').insert(newDistributions);
        if (error) throw error;
      }

      toast({
        title: 'Wysłano do dystrybucji',
        description: `Książka "${documentTitle}" została wysłana do ${selectedPlatforms.size} platform.`,
      });

      setSelectedPlatforms(new Set());
      fetchData();
    } catch (error) {
      console.error('Error submitting distributions:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać do dystrybucji.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const publishedCount = distributions.filter(d => d.status === 'published').length;
  const pendingCount = distributions.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
            <div className="text-xs text-muted-foreground">Opublikowane</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">W trakcie</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{platforms.length}</div>
            <div className="text-xs text-muted-foreground">Dostępne</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="w-5 h-5" />
            Szybka dystrybucja
          </CardTitle>
          <CardDescription>
            Wybierz platformy i wyślij książkę jednym kliknięciem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {platforms.map((platform) => {
                const distribution = getDistributionForPlatform(platform.id);
                const isSelected = selectedPlatforms.has(platform.id);
                const isDistributed = !!distribution;

                return (
                  <div
                    key={platform.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary/40' : 'bg-card hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected || isDistributed}
                        onCheckedChange={() => !isDistributed && togglePlatformSelection(platform.id)}
                        disabled={isDistributed}
                      />
                      <div className="flex items-center gap-2">
                        {platformIcons[platform.slug] || <Globe className="w-5 h-5" />}
                        <div>
                          <div className="font-medium text-sm">{platform.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {platform.formats.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {distribution && (
                        <>
                          <Badge 
                            variant="secondary" 
                            className={statusConfig[distribution.status]?.color}
                          >
                            {statusConfig[distribution.status]?.icon}
                            <span className="ml-1">{statusConfig[distribution.status]?.label}</span>
                          </Badge>
                          {distribution.external_url && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={distribution.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Button 
            onClick={handleSubmitToSelected}
            disabled={selectedPlatforms.size === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Wyślij do {selectedPlatforms.size || '...'} platform
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
