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
} from 'lucide-react';

interface FormatToolbarProps {
  onFormat: (format: string) => void;
}

export const FormatToolbar = ({ onFormat }: FormatToolbarProps) => {
  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('bold')}
        title="Pogrubienie (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('italic')}
        title="Kursywa (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('underline')}
        title="Podkreślenie (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('h1')}
        title="Nagłówek 1"
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('h2')}
        title="Nagłówek 2"
      >
        <Heading2 className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('ul')}
        title="Lista punktowana"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('ol')}
        title="Lista numerowana"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('quote')}
        title="Cytat"
      >
        <Quote className="w-4 h-4" />
      </Button>
    </div>
  );
};
