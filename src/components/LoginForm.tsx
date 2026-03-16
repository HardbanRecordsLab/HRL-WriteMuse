import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, Sparkles } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Witamy z powrotem!",
        description: "Pomyślnie zalogowano do edytora.",
      });
    } catch (error: any) {
      toast({
        title: "Błąd logowania",
        description: error.message || "Sprawdź email i hasło.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password);
      toast({
        title: "Konto utworzone!",
        description: "Możesz teraz zalogować się do edytora.",
      });
    } catch (error: any) {
      toast({
        title: "Błąd rejestracji",
        description: error.message || "Nie udało się utworzyć konta.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-editor-accent to-purple-600 rounded-2xl mb-4 shadow-strong">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-editor-text mb-2">
            WriteMuse Pro
          </h1>
          <p className="text-editor-text-muted">
            Edytor AI do pisania książek z automatycznymi ilustracjami
          </p>
        </div>

        <Card className="bg-card border-editor-surface shadow-medium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-editor-text">Zaloguj się</CardTitle>
            <CardDescription className="text-editor-text-muted">
              Wprowadź swoje dane aby uzyskać dostęp do edytora
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Logowanie</TabsTrigger>
                <TabsTrigger value="signup">Rejestracja</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-editor-text">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-editor-surface border-editor-surface text-editor-text"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-editor-text">Hasło</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Twoje hasło"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-editor-surface border-editor-surface text-editor-text"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full editor-gradient text-white hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Zaloguj się
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-editor-text">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="twoj@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-editor-surface border-editor-surface text-editor-text"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-editor-text">Hasło</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 6 znaków"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-editor-surface border-editor-surface text-editor-text"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full editor-gradient text-white hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Utwórz konto
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-editor-surface">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 text-editor-text-muted">
                  <Sparkles className="w-4 h-4 text-editor-accent" />
                  <span>AI Assistant do pisania i edycji</span>
                </div>
                <div className="flex items-center gap-2 text-editor-text-muted">
                  <BookOpen className="w-4 h-4 text-editor-accent" />
                  <span>Automatyczne generowanie ilustracji</span>
                </div>
                <div className="flex items-center gap-2 text-editor-text-muted">
                  <Sparkles className="w-4 h-4 text-editor-accent" />
                  <span>Eksport do PDF, DOCX i innych formatów</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};