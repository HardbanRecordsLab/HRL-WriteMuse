import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  LayoutDashboard, 
  Library, 
  Plus, 
  Settings, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  FileText,
  FolderOpen,
  Crown,
  LogOut,
  User,
  HelpCircle,
  PenTool,
  Image,
  Flame,
  BookMarked,
  Target,
  Calendar,
  TrendingUp,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WritingToolsPanel } from './WritingToolsPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface AppSidebarProps {
  currentView: 'dashboard' | 'editor';
  onViewChange: (view: 'dashboard' | 'editor') => void;
  onCreateDocument: () => void;
  onOpenLibrary: () => void;
  onSignOut: () => void;
  isDemoMode: boolean;
  user: {
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  recentDocuments?: Array<{
    id: string;
    title: string;
  }>;
  onSelectDocument?: (docId: string) => void;
  writingStreak?: number;
  todayWords?: number;
  dailyGoal?: number;
}

export const AppSidebar = ({
  currentView,
  onViewChange,
  onCreateDocument,
  onOpenLibrary,
  onSignOut,
  isDemoMode,
  user,
  recentDocuments = [],
  onSelectDocument,
  writingStreak = 0,
  todayWords = 0,
  dailyGoal = 1000,
}: AppSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [writingToolsOpen, setWritingToolsOpen] = useState(false);

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'DM';
  const userName = user?.name || user?.email?.split('@')[0] || 'Demo User';
  const goalProgress = Math.min((todayWords / dailyGoal) * 100, 100);

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div 
        className={cn(
          "hidden md:flex flex-col glass-subtle border-r border-border/50 h-full transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header z logo i toggle */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div 
                key="expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-glow">
                  <img src="/favicon.png" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <span className="font-bold text-base text-foreground font-serif">HRL WriteMuse</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Editor</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center mx-auto shadow-glow"
              >
                <img src="/favicon.png" alt="Logo" className="h-full w-full object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors",
                  isCollapsed && "mx-auto mt-2"
                )}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Rozwiń' : 'Zwiń'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Quick Stats Bar */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-3 py-3 border-b border-border/30 bg-secondary/20 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                {/* Writing Streak */}
                <motion.div 
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gold/10 border border-gold/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Flame className="w-4 h-4 text-gold" />
                  <div>
                    <p className="text-xs font-bold text-gold">{writingStreak}</p>
                    <p className="text-[10px] text-gold/70">dni serii</p>
                  </div>
                </motion.div>
                {/* Today's Progress */}
                <motion.div 
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Target className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-emerald-300">{todayWords}</p>
                    <p className="text-[10px] text-emerald-400/70">dziś słów</p>
                  </div>
                </motion.div>
              </div>
              {/* Daily Goal Progress */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-muted-foreground">Cel dzienny</span>
                  <span className="text-[10px] text-foreground font-medium">{Math.round(goalProgress)}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full gold-gradient rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && writingStreak > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mx-auto my-2 w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-gold" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              {writingStreak} dni serii • {todayWords} słów dziś
            </TooltipContent>
          </Tooltip>
        )}

        <ScrollArea className="flex-1 px-2 py-2">
          {/* Nowa książka - główna akcja */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onCreateDocument}
                  className={cn(
                    "w-full mb-3 editor-gradient text-white hover:opacity-90 transition-all shadow-medium hover:shadow-strong",
                    isCollapsed ? "px-2" : "h-10"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {!isCollapsed && <span className="ml-2 font-medium">Nowa Książka</span>}
                </Button>
              </motion.div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Nowa Książka</TooltipContent>
            )}
          </Tooltip>

          {/* Nawigacja główna */}
          <div className="space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all",
                    currentView === 'dashboard' && "bg-secondary/80 text-foreground shadow-sm border border-border/50",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => onViewChange('dashboard')}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Panel Główny</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Panel Główny</TooltipContent>
              )}
            </Tooltip>

            {/* Biblioteka - collapsible */}
            <Collapsible open={libraryOpen && !isCollapsed} onOpenChange={setLibraryOpen}>
              <CollapsibleTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={() => isCollapsed ? onOpenLibrary() : setLibraryOpen(!libraryOpen)}
                    >
                      <Library className="w-5 h-5" />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 text-left">Biblioteka</span>
                          <Badge variant="secondary" className="text-[10px] h-5 mr-2 bg-secondary border-border/50">
                            {recentDocuments.length}
                          </Badge>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            libraryOpen && "rotate-180"
                          )} />
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">Biblioteka ({recentDocuments.length})</TooltipContent>
                  )}
                </Tooltip>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 space-y-0.5 mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-8"
                  onClick={onOpenLibrary}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Wszystkie Książki
                </Button>
                
                {/* Ostatnie dokumenty */}
                {recentDocuments.slice(0, 4).map((doc) => (
                  <Button
                    key={doc.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 truncate h-8"
                    onClick={() => onSelectDocument?.(doc.id)}
                  >
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => onViewChange('dashboard')}
                >
                  <TrendingUp className="w-5 h-5" />
                  {!isCollapsed && <span className="ml-3">Statystyki</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">Statystyki</TooltipContent>
              )}
            </Tooltip>
          </div>

          <Separator className="my-3 bg-border/30" />

          {/* Narzędzia AI - collapsible */}
          <Collapsible open={toolsOpen && !isCollapsed} onOpenChange={setToolsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Wand2 className="w-5 h-5" />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">Narzędzia AI</span>
                    <Badge className="text-[10px] h-5 mr-2 bg-gold/20 text-gold border-0 font-medium">
                      PRO
                    </Badge>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      toolsOpen && "rotate-180"
                    )} />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 space-y-0.5 mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-8"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Asystent Pisania
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-8"
              >
                <Image className="w-4 h-4 mr-2" />
                Generator Ilustracji
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-8"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Kreator Okładek
              </Button>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3 bg-border/30" />

          {/* Writing Tools Panel - słownik, synonimy, cytat */}
          <Collapsible open={writingToolsOpen && !isCollapsed} onOpenChange={setWritingToolsOpen}>
            <CollapsibleTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">Narzędzia Pisarza</span>
                        <Badge variant="outline" className="text-[10px] h-5 mr-2 border-border/50">
                          API
                        </Badge>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          writingToolsOpen && "rotate-180"
                        )} />
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">Narzędzia Pisarza</TooltipContent>
                )}
              </Tooltip>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 border border-border/30 rounded-lg overflow-hidden glass-subtle">
              <WritingToolsPanel isCollapsed={isCollapsed} />
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-3 bg-border/30" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Settings className="w-5 h-5" />
                {!isCollapsed && <span className="ml-3">Ustawienia</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Ustawienia</TooltipContent>
            )}
          </Tooltip>
        </ScrollArea>

        {/* Demo Badge */}
        <AnimatePresence>
          {isDemoMode && !isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mx-2 mb-2 px-3 py-2 rounded-lg glass border border-gold/30"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-gold" />
                <div>
                  <span className="text-xs font-medium text-gold">Tryb Demo</span>
                  <p className="text-[10px] text-muted-foreground">Utwórz konto, aby zapisać</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Menu */}
        <div className="border-t border-border/30 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-secondary/50",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Avatar className="h-9 w-9 border-2 border-gold/30">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'demo@writerstudio.app'}</p>
                  </div>
                )}
                {!isCollapsed && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 glass border-border/50 z-50"
              side="top"
            >
              <DropdownMenuLabel className="text-foreground">Moje Konto</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-secondary/50">
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-secondary/50">
                <Settings className="w-4 h-4 mr-2" />
                Ustawienia
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-secondary/50">
                <Calendar className="w-4 h-4 mr-2" />
                Plan pisania
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground cursor-pointer hover:bg-secondary/50">
                <HelpCircle className="w-4 h-4 mr-2" />
                Pomoc
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/30" />
              {isDemoMode && (
                <DropdownMenuItem className="text-gold cursor-pointer hover:bg-gold/10">
                  <Crown className="w-4 h-4 mr-2" />
                  Utwórz Konto
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={onSignOut}
                className="text-destructive cursor-pointer focus:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isDemoMode ? 'Wyjdź z Demo' : 'Wyloguj się'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
