import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { LoginForm } from '@/components/LoginForm';
import { LandingPage } from '@/components/LandingPage';
import { DemoBanner } from '@/components/DemoBanner';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { DocumentList } from '@/components/DocumentList';
import { WritingEditor } from '@/components/WritingEditor';
import { DocumentSettings } from '@/components/DocumentSettings';
import { IllustrationPanel } from '@/components/IllustrationPanel';
import { ExportMenu } from '@/components/ExportMenu';
import { ImportButton } from '@/components/ImportButton';
import { BookStructureManager } from '@/components/BookStructureManager';
import { Dashboard } from '@/components/Dashboard';
import { WelcomeWizard } from '@/components/WelcomeWizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNavigation, MobileTopBar } from '@/components/MobileNavigation';
import { DistributionPanel } from '@/components/DistributionPanel';
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { CoverGenerator } from '@/components/CoverGenerator';
import { RoyaltiesPanel } from '@/components/RoyaltiesPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, PanelLeft, Pen, Globe, Users, Palette, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDocuments } from '@/hooks/useDocuments';
import { useChapters } from '@/hooks/useChapters';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  DEMO_BOOK, 
  DEMO_CHAPTERS, 
  DEMO_STATS, 
  DEMO_RECENT_DOCUMENTS 
} from '@/data/demoData';

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [activeTab, setActiveTab] = useState<'editor' | 'distribution' | 'collaboration' | 'covers' | 'royalties'>('editor');
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { toast } = useToast();

  // Get effective user ID
  const effectiveUserId = isDemoMode ? 'demo-user-123' : user?.id || null;

  // Use documents hook
  const {
    documents,
    selectedDocument,
    fetchDocuments,
    createDocument,
    selectDocument,
    selectDocumentById,
  } = useDocuments({
    userId: effectiveUserId,
    isDemoMode,
    demoDocuments: DEMO_RECENT_DOCUMENTS as any,
  });

  // Use chapters hook
  const {
    chapters,
    selectedChapterId,
    editorContent,
    setEditorContent,
    fetchChapters,
    createChapter,
    deleteChapter,
    renameChapter,
    saveContent,
    selectChapter,
    getAllChaptersContent,
  } = useChapters({
    documentId: selectedDocument?.id || null,
    isDemoMode,
    demoChapters: DEMO_CHAPTERS as any,
  });

  // Check for demo mode on mount
  useEffect(() => {
    const demoEnabled = localStorage.getItem('demoModeEnabled');
    if (demoEnabled === 'true') {
      enableDemoMode();
    }
  }, []);

  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    localStorage.setItem('demoModeEnabled', 'true');
    setCurrentView('editor');
    toast({
      title: "Tryb Demo aktywny",
      description: "Przeglądasz przykładową książkę. Wszystkie funkcje AI są dostępne!",
    });
  }, [toast]);

  const disableDemoMode = useCallback(() => {
    setIsDemoMode(false);
    localStorage.removeItem('demoModeEnabled');
    setCurrentView('dashboard');
    setShowLogin(false);
  }, []);

  // Check if user should see welcome wizard
  useEffect(() => {
    if (user && documents.length === 0 && !isDemoMode) {
      const wizardCompleted = localStorage.getItem('welcomeWizardCompleted');
      if (!wizardCompleted) {
        setTimeout(() => setShowWelcomeWizard(true), 500);
      }
    }
  }, [user, documents, isDemoMode]);

  // Set demo document when demo mode is enabled
  useEffect(() => {
    if (isDemoMode && !selectedDocument) {
      selectDocument(DEMO_BOOK as any);
    }
  }, [isDemoMode, selectedDocument, selectDocument]);

  const handleWelcomeWizardComplete = async (documentId: string) => {
    console.log('[Index] Welcome wizard completed, opening document:', documentId);
    setShowWelcomeWizard(false);
    
    await fetchDocuments();
    
    const { data: newDoc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (newDoc) {
      selectDocument(newDoc);
      setCurrentView('editor');
    }
  };

  const handleCreateNewDocument = async () => {
    const doc = await createDocument();
    if (doc) {
      setCurrentView('editor');
    }
  };

  const handleSelectDocument = (doc: any) => {
    selectDocument(doc);
    setCurrentView('editor');
    setLibraryOpen(false);
  };

  const handleSelectDocumentById = (docId: string) => {
    selectDocumentById(docId);
    setCurrentView('editor');
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      disableDemoMode();
    } else {
      await signOut();
    }
  };

  const handleSelectChapter = (chapterId: string) => {
    selectChapter(chapterId);
    setMobileSidebarOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl editor-gradient flex items-center justify-center mx-auto shadow-medium animate-pulse-soft">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-muted-foreground">Ładowanie WriterStudio...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users (not in demo mode)
  if (!user && !isDemoMode) {
    if (showLogin) {
      return <LoginForm />;
    }
    return (
      <LandingPage 
        onStartDemo={enableDemoMode}
        onLogin={() => setShowLogin(true)}
      />
    );
  }

  // Get chapters for export
  const chaptersForExport = getAllChaptersContent();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex">
        {/* Demo Banner */}
        {isDemoMode && (
          <DemoBanner 
            onExitDemo={disableDemoMode}
            onCreateAccount={() => {
              disableDemoMode();
              setShowLogin(true);
            }}
          />
        )}

        {/* Mobile Top Bar */}
        <MobileTopBar 
          onMenuOpen={() => setMobileMenuOpen(true)}
          title={currentView === 'editor' && selectedDocument ? selectedDocument.title : 'WriterStudio'}
        />

        {/* Mobile Navigation */}
        <MobileNavigation
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          currentView={currentView}
          onViewChange={setCurrentView}
          onCreateDocument={handleCreateNewDocument}
          onOpenLibrary={() => setLibraryOpen(true)}
          onSignOut={handleSignOut}
          isDemoMode={isDemoMode}
          user={user ? { email: user.email } : null}
        />

        {/* Desktop App Sidebar */}
        <AppSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          onCreateDocument={handleCreateNewDocument}
          onOpenLibrary={() => setLibraryOpen(true)}
          onSignOut={handleSignOut}
          isDemoMode={isDemoMode}
          user={user ? { email: user.email } : null}
          recentDocuments={documents.slice(0, 5)}
          onSelectDocument={handleSelectDocumentById}
          writingStreak={isDemoMode ? DEMO_STATS.writingStreak : 3}
          todayWords={isDemoMode ? DEMO_STATS.wordsToday : editorContent.split(/\s+/).filter(Boolean).length}
          dailyGoal={1000}
        />

        {/* Library Sheet */}
        <Sheet open={libraryOpen} onOpenChange={setLibraryOpen}>
          <SheetContent side="left" className="w-80 bg-sidebar border-sidebar-border p-0">
            <SheetHeader className="p-6 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sidebar-foreground">Biblioteka</SheetTitle>
                {!isDemoMode && (
                  <ImportButton 
                    userId={effectiveUserId || ''}
                    onImportComplete={fetchDocuments}
                  />
                )}
              </div>
            </SheetHeader>
            <DocumentList
              documents={documents}
              selectedDocumentId={selectedDocument?.id || null}
              onSelectDocument={handleSelectDocument}
              onDocumentsChange={isDemoMode ? () => {} : fetchDocuments}
              isDemoMode={isDemoMode}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 pt-14 md:pt-0 flex flex-col min-h-screen">
          {currentView === 'dashboard' ? (
            <Dashboard 
              userId={effectiveUserId || ''} 
              onSelectDocument={handleSelectDocument}
              onCreateDocument={handleCreateNewDocument}
              isDemoMode={isDemoMode}
              demoStats={isDemoMode ? DEMO_STATS : undefined}
              demoDocuments={isDemoMode ? DEMO_RECENT_DOCUMENTS : undefined}
            />
          ) : (
            <div className="flex flex-1 h-full">
              {/* Mobile Sidebar Toggle */}
              {selectedDocument && !isFocusMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden fixed bottom-4 left-4 z-30 bg-sidebar border border-sidebar-border shadow-medium"
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  <PanelLeft className="w-5 h-5" />
                </Button>
              )}

              {/* Mobile Document Sidebar */}
              <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetContent side="left" className="w-80 bg-sidebar border-sidebar-border p-0">
                  <DocumentSidebar
                    document={selectedDocument}
                    chapters={chapters}
                    selectedChapterId={selectedChapterId}
                    onSelectChapter={handleSelectChapter}
                    onCreateChapter={createChapter}
                    onDeleteChapter={deleteChapter}
                    onRenameChapter={renameChapter}
                    onRefreshChapters={isDemoMode ? () => {} : fetchChapters}
                  />
                </SheetContent>
              </Sheet>

              {/* Desktop Document Sidebar */}
              <DocumentSidebar
                document={selectedDocument}
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                onSelectChapter={selectChapter}
                onCreateChapter={createChapter}
                onDeleteChapter={deleteChapter}
                onRenameChapter={renameChapter}
                onRefreshChapters={isDemoMode ? () => {} : fetchChapters}
                className={`hidden md:flex ${isFocusMode ? 'md:hidden' : ''}`}
              />

              <div className={`flex-1 flex flex-col bg-card ${isFocusMode ? 'relative' : ''}`}>
                {selectedDocument && !isFocusMode && (
                  <div className="hidden md:flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card">
                    <div className="min-w-0">
                      <h2 className="text-base md:text-lg font-semibold truncate">{selectedDocument.title}</h2>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{selectedDocument.description}</p>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCurrentView('dashboard')}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <LayoutDashboard className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Panel</span>
                      </Button>
                      {!isDemoMode && (
                        <>
                          <BookStructureManager 
                            documentId={selectedDocument.id}
                            onChaptersCreated={fetchChapters}
                          />
                          <ImportButton 
                            userId={effectiveUserId || ''}
                            onImportComplete={fetchDocuments}
                          />
                        </>
                      )}
                      <ExportMenu 
                        title={selectedDocument.title} 
                        content={editorContent}
                        chapters={chaptersForExport}
                      />
                      {!isDemoMode && (
                        <DocumentSettings
                          documentId={selectedDocument.id}
                          title={selectedDocument.title}
                          description={selectedDocument.description}
                          status={selectedDocument.status}
                          coverImageUrl={selectedDocument.cover_image_url}
                          onUpdate={fetchDocuments}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Document Tabs */}
                {selectedDocument && !isFocusMode && (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
                    <div className="border-b border-border bg-muted/30 px-4">
                      <TabsList className="h-12 bg-transparent gap-1">
                        <TabsTrigger value="editor" className="data-[state=active]:bg-background gap-2">
                          <Pen className="w-4 h-4" />
                          <span className="hidden sm:inline">Edytor</span>
                        </TabsTrigger>
                        <TabsTrigger value="covers" className="data-[state=active]:bg-background gap-2">
                          <Palette className="w-4 h-4" />
                          <span className="hidden sm:inline">Okładka</span>
                        </TabsTrigger>
                        <TabsTrigger value="collaboration" className="data-[state=active]:bg-background gap-2">
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">Zespół</span>
                        </TabsTrigger>
                        <TabsTrigger value="distribution" className="data-[state=active]:bg-background gap-2">
                          <Globe className="w-4 h-4" />
                          <span className="hidden sm:inline">Dystrybucja</span>
                        </TabsTrigger>
                        <TabsTrigger value="royalties" className="data-[state=active]:bg-background gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="hidden sm:inline">Tantiemy</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="editor" className="flex-1 flex m-0 data-[state=inactive]:hidden">
                      <div className="flex-1">
                        <WritingEditor
                          content={editorContent}
                          onChange={setEditorContent}
                          chapterId={selectedChapterId || undefined}
                          onSave={saveContent}
                          onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
                          isFocusMode={isFocusMode}
                          isDemoMode={isDemoMode}
                        />
                      </div>
                      <div className="hidden lg:block w-80 border-l border-border bg-muted/20">
                        <IllustrationPanel chapterId={selectedChapterId} isDemoMode={isDemoMode} />
                      </div>
                    </TabsContent>

                    <TabsContent value="covers" className="flex-1 m-0 overflow-auto data-[state=inactive]:hidden">
                      <div className="max-w-3xl mx-auto p-6">
                        <CoverGenerator
                          documentId={selectedDocument.id}
                          documentTitle={selectedDocument.title}
                          documentDescription={selectedDocument.description || ''}
                          authorName={user?.email?.split('@')[0] || 'Autor'}
                          isDemoMode={isDemoMode}
                          onCoverGenerated={(url) => fetchDocuments()}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="collaboration" className="flex-1 m-0 overflow-auto data-[state=inactive]:hidden">
                      <div className="max-w-3xl mx-auto p-6">
                        <CollaborationPanel
                          documentId={selectedDocument.id}
                          chapterId={selectedChapterId || undefined}
                          userId={effectiveUserId || ''}
                          isDemoMode={isDemoMode}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="flex-1 m-0 overflow-auto data-[state=inactive]:hidden">
                      <div className="max-w-3xl mx-auto p-6">
                        <DistributionPanel
                          documentId={selectedDocument.id}
                          documentTitle={selectedDocument.title}
                          isDemoMode={isDemoMode}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="royalties" className="flex-1 m-0 overflow-auto data-[state=inactive]:hidden">
                      <div className="max-w-4xl mx-auto p-6">
                        <RoyaltiesPanel
                          documentId={selectedDocument.id}
                          documentTitle={selectedDocument.title}
                          userId={effectiveUserId || ''}
                          isDemoMode={isDemoMode}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
                
                {/* Focus mode editor */}
                {isFocusMode && (
                  <div className="absolute inset-0 z-50 bg-background">
                    <WritingEditor
                      content={editorContent}
                      onChange={setEditorContent}
                      chapterId={selectedChapterId || undefined}
                      onSave={saveContent}
                      onFocusModeToggle={() => setIsFocusMode(!isFocusMode)}
                      isFocusMode={isFocusMode}
                      isDemoMode={isDemoMode}
                    />
                  </div>
                )}

                {/* Empty state when no document selected */}
                {!selectedDocument && !isFocusMode && (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-4">
                      <Pen className="w-12 h-12 mx-auto opacity-50" />
                      <p>Wybierz dokument z biblioteki lub utwórz nowy</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Welcome Wizard */}
        {!isDemoMode && (
          <WelcomeWizard
            open={showWelcomeWizard}
            onClose={() => setShowWelcomeWizard(false)}
            onComplete={handleWelcomeWizardComplete}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;
