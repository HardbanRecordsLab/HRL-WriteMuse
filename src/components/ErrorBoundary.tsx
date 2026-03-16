import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-editor-bg flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 bg-card border-editor-surface text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Coś poszło nie tak
              </h2>
              <p className="text-muted-foreground text-sm">
                Przepraszamy za niedogodności. Spróbuj odświeżyć stronę lub wróć do strony głównej.
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-left">
              <p className="text-xs text-muted-foreground">
                Wystąpił nieoczekiwany błąd. Skontaktuj się z pomocą techniczną.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Strona główna
              </Button>
              <Button
                onClick={this.handleReload}
                className="editor-gradient gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Odśwież
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
