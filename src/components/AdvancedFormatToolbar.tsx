import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Highlighter
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdvancedFormatToolbarProps {
  onFormat: (format: string) => void;
}

export const AdvancedFormatToolbar = ({ onFormat }: AdvancedFormatToolbarProps) => {
  const formatButtons = [
    { icon: Bold, format: 'bold', label: 'Pogrubienie (Ctrl+B)', group: 'style' },
    { icon: Italic, format: 'italic', label: 'Kursywa (Ctrl+I)', group: 'style' },
    { icon: Underline, format: 'underline', label: 'Podkreślenie (Ctrl+U)', group: 'style' },
    { icon: Strikethrough, format: 'strikethrough', label: 'Przekreślenie', group: 'style' },
    { icon: Highlighter, format: 'highlight', label: 'Zaznaczenie', group: 'style' },
    
    { icon: Heading1, format: 'h1', label: 'Nagłówek 1', group: 'heading' },
    { icon: Heading2, format: 'h2', label: 'Nagłówek 2', group: 'heading' },
    
    { icon: List, format: 'ul', label: 'Lista', group: 'list' },
    { icon: ListOrdered, format: 'ol', label: 'Lista numerowana', group: 'list' },
    { icon: Quote, format: 'quote', label: 'Cytat', group: 'list' },
    { icon: Code, format: 'code', label: 'Kod', group: 'list' },
    
    { icon: Link, format: 'link', label: 'Link', group: 'insert' },
    
    { icon: AlignLeft, format: 'align-left', label: 'Wyrównaj do lewej', group: 'align' },
    { icon: AlignCenter, format: 'align-center', label: 'Wyśrodkuj', group: 'align' },
    { icon: AlignRight, format: 'align-right', label: 'Wyrównaj do prawej', group: 'align' },
  ];

  const groupedButtons = formatButtons.reduce((acc, btn) => {
    if (!acc[btn.group]) acc[btn.group] = [];
    acc[btn.group].push(btn);
    return acc;
  }, {} as Record<string, typeof formatButtons>);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 p-2 border-b bg-gradient-to-r from-card/80 to-muted/30 backdrop-blur-sm flex-wrap shadow-sm">
        {Object.entries(groupedButtons).map(([group, buttons], groupIndex) => (
          <div key={group} className="flex items-center gap-0.5">
            {buttons.map((btn) => (
              <Tooltip key={btn.format}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFormat(btn.format)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <btn.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{btn.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {groupIndex < Object.keys(groupedButtons).length - 1 && (
              <div className="w-px h-6 bg-border/50 mx-2" />
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};