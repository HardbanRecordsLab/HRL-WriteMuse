import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Library, 
  Plus, 
  BarChart3, 
  Settings,
  Sparkles,
  Crown,
  LogOut,
  User,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}

export const MobileNavigation = ({
  open,
  onOpenChange,
  currentView,
  onViewChange,
  onCreateDocument,
  onOpenLibrary,
  onSignOut,
  isDemoMode,
  user,
}: MobileNavigationProps) => {
  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'DM';
  const userName = user?.name || user?.email?.split('@')[0] || 'Demo User';

  const handleNavClick = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 bg-sidebar border-sidebar-border p-0">
        <SheetHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg editor-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-sidebar-foreground text-left">WriterStudio</SheetTitle>
              <p className="text-xs text-sidebar-foreground/70">AI-Powered Writing</p>
            </div>
          </div>
        </SheetHeader>
        
        <div className="p-4 space-y-2">
          {/* Główna akcja */}
          <Button
            onClick={() => handleNavClick(onCreateDocument)}
            className="w-full editor-gradient text-white hover:opacity-90 transition-opacity shadow-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowa Książka
          </Button>

          <Separator className="my-4 bg-sidebar-border" />

          {/* Nawigacja */}
          <Button
            variant="ghost"
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
              currentView === 'dashboard' ? 'bg-sidebar-accent' : ''
            }`}
            onClick={() => handleNavClick(() => onViewChange('dashboard'))}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Panel Główny
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => handleNavClick(onOpenLibrary)}
          >
            <Library className="w-5 h-5 mr-3" />
            Biblioteka
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Statystyki
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Sparkles className="w-5 h-5 mr-3" />
            Narzędzia AI
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Settings className="w-5 h-5 mr-3" />
            Ustawienia
          </Button>
        </div>

        {/* Demo Badge */}
        {isDemoMode && (
          <div className="mx-4 px-3 py-2 rounded-lg bg-primary/20 border border-primary/30">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Tryb Demo - Funkcje ograniczone</span>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-sidebar-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-editor-accent text-white text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 text-left flex-1">
                  <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                  <p className="text-xs text-sidebar-foreground/70">{user?.email || 'demo@writerstudio.app'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-56 bg-popover border-border z-50"
              side="top"
            >
              <DropdownMenuLabel className="text-popover-foreground">Moje Konto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-popover-foreground">
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-popover-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Ustawienia
              </DropdownMenuItem>
              <DropdownMenuItem className="text-popover-foreground">
                <HelpCircle className="w-4 h-4 mr-2" />
                Pomoc
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isDemoMode && (
                <DropdownMenuItem className="text-primary">
                  <Crown className="w-4 h-4 mr-2" />
                  Utwórz Konto
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={onSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isDemoMode ? 'Wyjdź z Demo' : 'Wyloguj się'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const MobileTopBar = ({
  onMenuOpen,
  title = "WriterStudio",
}: {
  onMenuOpen: () => void;
  title?: string;
}) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuOpen}
        className="text-sidebar-foreground"
      >
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-md editor-gradient flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sidebar-foreground">{title}</span>
      </div>
    </div>
  );
};
