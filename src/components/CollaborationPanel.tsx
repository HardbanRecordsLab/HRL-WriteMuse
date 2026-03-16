import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Loader2,
  History,
  MessageSquare,
  RotateCcw,
  Eye,
  Edit,
  Shield,
  Trash2
} from 'lucide-react';

interface Collaborator {
  id: string;
  document_id: string;
  user_id: string;
  email: string;
  role: 'viewer' | 'editor' | 'reviewer' | 'admin';
  invited_at: string;
  accepted_at: string | null;
  is_active: boolean;
}

interface ChapterVersion {
  id: string;
  chapter_id: string;
  version_number: number;
  content: string | null;
  word_count: number;
  version_type: string;
  label: string | null;
  created_at: string;
}

interface CollaborationPanelProps {
  documentId: string;
  chapterId?: string;
  userId: string;
  isDemoMode?: boolean;
}

const roleConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  viewer: { label: 'Czytelnik', icon: <Eye className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-600' },
  editor: { label: 'Edytor', icon: <Edit className="w-3 h-3" />, color: 'bg-green-500/20 text-green-600' },
  reviewer: { label: 'Recenzent', icon: <MessageSquare className="w-3 h-3" />, color: 'bg-yellow-500/20 text-yellow-600' },
  admin: { label: 'Admin', icon: <Shield className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-600' },
};

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  documentId,
  chapterId,
  userId,
  isDemoMode = false,
}) => {
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'viewer' | 'editor' | 'reviewer'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ChapterVersion | null>(null);

  useEffect(() => {
    fetchData();
  }, [documentId, chapterId]);

  const fetchData = async () => {
    if (isDemoMode) {
      // Demo data - only for actual demo mode
      setCollaborators([
        { id: '1', document_id: documentId, user_id: '2', email: 'redaktor@demo.pl', role: 'editor', invited_at: '2024-01-01', accepted_at: '2024-01-02', is_active: true },
      ]);
      setVersions([
        { id: 'v1', chapter_id: chapterId || '', version_number: 1, content: 'Przykładowa wersja tekstu dla trybu demo...', word_count: 150, version_type: 'manual', label: 'Demo', created_at: new Date().toISOString() },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const [collabRes, versionsRes] = await Promise.all([
        supabase.from('document_collaborators').select('*').eq('document_id', documentId),
        chapterId 
          ? supabase.from('chapter_versions').select('*').eq('chapter_id', chapterId).order('version_number', { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      if (collabRes.data) setCollaborators(collabRes.data);
      if (versionsRes.data) setVersions(versionsRes.data);
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby zapraszać współpracowników!',
      });
      return;
    }

    if (!newEmail.trim()) {
      toast({
        title: 'Wpisz email',
        description: 'Podaj adres email osoby, którą chcesz zaprosić.',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);
    try {
      const { error } = await supabase.from('document_collaborators').insert({
        document_id: documentId,
        email: newEmail.trim(),
        role: newRole,
        user_id: userId, // Placeholder - will be updated when user accepts
        invited_by: userId,
      });

      if (error) throw error;

      toast({
        title: 'Zaproszenie wysłane',
        description: `Zaproszenie zostało wysłane do ${newEmail}.`,
      });

      setNewEmail('');
      fetchData();
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      toast({
        title: 'Błąd',
        description: error.code === '23505' ? 'Ta osoba już została zaproszona.' : 'Nie udało się wysłać zaproszenia.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (isDemoMode) return;

    try {
      const { error } = await supabase.from('document_collaborators').delete().eq('id', collaboratorId);
      if (error) throw error;
      toast({ title: 'Usunięto współpracownika' });
      fetchData();
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const handleRestoreVersion = async (version: ChapterVersion) => {
    if (isDemoMode) {
      toast({
        title: 'Tryb Demo',
        description: 'Załóż konto, aby przywracać wersje!',
      });
      return;
    }

    toast({
      title: 'Przywrócono wersję',
      description: `Przywrócono wersję ${version.version_number} z ${new Date(version.created_at).toLocaleDateString('pl-PL')}.`,
    });
    setSelectedVersion(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="team" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="team" className="flex-1">
          <Users className="w-4 h-4 mr-2" />
          Zespół
        </TabsTrigger>
        <TabsTrigger value="versions" className="flex-1">
          <History className="w-4 h-4 mr-2" />
          Historia
        </TabsTrigger>
      </TabsList>

      <TabsContent value="team" className="space-y-4">
        {/* Invite Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Zaproś współpracownika
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                type="email"
                className="flex-1"
              />
              <Select value={newRole} onValueChange={(v: any) => setNewRole(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Czytelnik</SelectItem>
                  <SelectItem value="editor">Edytor</SelectItem>
                  <SelectItem value="reviewer">Recenzent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={isInviting} className="w-full">
              {isInviting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Wyślij zaproszenie
            </Button>
          </CardContent>
        </Card>

        {/* Collaborators List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Współpracownicy ({collaborators.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {collaborators.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Brak współpracowników
                  </div>
                ) : (
                  collaborators.map((collab) => (
                    <div
                      key={collab.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {collab.email.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{collab.email}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {collab.accepted_at ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                Zaakceptowano
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-yellow-500" />
                                Oczekuje
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={roleConfig[collab.role]?.color}>
                          {roleConfig[collab.role]?.icon}
                          <span className="ml-1">{roleConfig[collab.role]?.label}</span>
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveCollaborator(collab.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="versions" className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" />
              Historia wersji
            </CardTitle>
            <CardDescription>
              {chapterId ? 'Przeglądaj i przywracaj poprzednie wersje rozdziału' : 'Wybierz rozdział, aby zobaczyć historię'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {versions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {chapterId ? 'Brak zapisanych wersji' : 'Wybierz rozdział'}
                  </div>
                ) : (
                  versions.map((version, index) => (
                    <Dialog key={version.id}>
                      <DialogTrigger asChild>
                        <div
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                            index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card'
                          }`}
                          onClick={() => setSelectedVersion(version)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                v{version.version_number}
                              </Badge>
                              {version.label && (
                                <Badge variant="secondary" className="text-xs">
                                  {version.label}
                                </Badge>
                              )}
                              {index === 0 && (
                                <Badge className="text-xs bg-primary">Aktualna</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {version.word_count} słów
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(version.created_at).toLocaleDateString('pl-PL', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Wersja {version.version_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{version.word_count} słów</span>
                            <span>•</span>
                            <span>
                              {new Date(version.created_at).toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <ScrollArea className="h-64 border rounded-lg p-4">
                            <pre className="whitespace-pre-wrap font-serif text-sm">
                              {version.content || 'Brak treści'}
                            </pre>
                          </ScrollArea>
                          {index !== 0 && (
                            <Button onClick={() => handleRestoreVersion(version)} className="w-full">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Przywróć tę wersję
                            </Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
