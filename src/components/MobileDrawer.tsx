import { ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MobileDrawerProps {
  title: string;
  children: ReactNode;
  trigger?: ReactNode;
  side?: 'left' | 'right';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MobileDrawer = ({
  title,
  children,
  trigger,
  side = 'left',
  open,
  onOpenChange
}: MobileDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        side={side} 
        className="w-[85vw] max-w-sm bg-editor-sidebar border-editor-surface p-0"
      >
        <SheetHeader className="p-4 border-b border-editor-surface">
          <SheetTitle className="text-editor-text">{title}</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-5rem)] overflow-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
