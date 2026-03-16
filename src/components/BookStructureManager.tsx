import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookStructureManagerProps {
  documentId: string;
  onChaptersCreated: () => void;
}

const BOOK_SECTIONS = {
  frontMatter: [
    { id: 'copyright', title: 'Copyright', order: 0 },
    { id: 'dedication', title: 'Dedykacja', order: 1 },
    { id: 'epigraph', title: 'Epigraf', order: 2 },
    { id: 'toc', title: 'Spis treści', order: 3 },
    { id: 'foreword', title: 'Przedmowa', order: 4 },
    { id: 'preface', title: 'Wstęp', order: 5 },
    { id: 'acknowledgments', title: 'Podziękowania', order: 6 },
  ],
  body: [
    { id: 'prologue', title: 'Prolog', order: 100 },
    { id: 'introduction', title: 'Wprowadzenie', order: 101 },
    { id: 'chapter-1', title: 'Rozdział 1', order: 102 },
    { id: 'conclusion', title: 'Zakończenie', order: 200 },
    { id: 'epilogue', title: 'Epilog', order: 201 },
    { id: 'afterword', title: 'Posłowie', order: 202 },
  ],
  backMatter: [
    { id: 'notes', title: 'Przypisy', order: 300 },
    { id: 'about-author', title: 'O autorze', order: 301 },
    { id: 'also-by', title: 'Inne książki autora', order: 302 },
  ],
};

export const BookStructureManager = ({ documentId, onChaptersCreated }: BookStructureManagerProps) => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const toggleSection = (sectionId: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(sectionId)) {
      newSelected.delete(sectionId);
    } else {
      newSelected.add(sectionId);
    }
    setSelectedSections(newSelected);
  };

  const createSelectedChapters = async () => {
    if (selectedSections.size === 0) {
      toast({
        title: "Brak sekcji",
        description: "Wybierz przynajmniej jedną sekcję.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    console.log('[BookStructure] Starting chapter creation for document:', documentId);
    console.log('[BookStructure] Selected sections:', Array.from(selectedSections));

    try {
      // Pobierz istniejące rozdziały aby uniknąć duplikatów
      const { data: existingChapters, error: fetchError } = await supabase
        .from('chapters')
        .select('title, order_index')
        .eq('document_id', documentId);

      if (fetchError) {
        console.error('[BookStructure] Error fetching existing chapters:', fetchError);
        throw fetchError;
      }

      console.log('[BookStructure] Existing chapters:', existingChapters);

      const allSections = [
        ...BOOK_SECTIONS.frontMatter,
        ...BOOK_SECTIONS.body,
        ...BOOK_SECTIONS.backMatter,
      ];

      // Filtruj sekcje które już istnieją
      const existingTitles = new Set(existingChapters?.map(ch => ch.title) || []);
      const chaptersToCreate = allSections
        .filter(section => selectedSections.has(section.id))
        .filter(section => !existingTitles.has(section.title))
        .map(section => ({
          document_id: documentId,
          title: section.title,
          content: '',
          order_index: section.order,
        }));

      if (chaptersToCreate.length === 0) {
        toast({
          title: "Sekcje już istnieją",
          description: "Wszystkie wybrane sekcje zostały już dodane do książki.",
        });
        setSelectedSections(new Set());
        return;
      }

      console.log('[BookStructure] Creating chapters:', chaptersToCreate);

      const { data, error } = await supabase
        .from('chapters')
        .insert(chaptersToCreate)
        .select();

      if (error) {
        console.error('[BookStructure] Error inserting chapters:', error);
        throw error;
      }

      console.log('[BookStructure] Successfully created chapters:', data);

      toast({
        title: "Struktura utworzona",
        description: `Dodano ${chaptersToCreate.length} ${chaptersToCreate.length === 1 ? 'sekcję' : chaptersToCreate.length < 5 ? 'sekcje' : 'sekcji'} do książki.`,
      });

      setSelectedSections(new Set());
      onChaptersCreated();
    } catch (error) {
      console.error('[BookStructure] Error creating chapters:', error);
      toast({
        title: "Błąd tworzenia struktury",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć struktury książki.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="w-4 h-4 mr-2" />
          Struktura książki
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Struktura książki</SheetTitle>
          <SheetDescription>
            Wybierz sekcje, które chcesz dodać do swojej książki. Treść możesz wypełnić samodzielnie lub z pomocą AI.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-6">
            {/* Front Matter */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">POCZĄTEK KSIĄŻKI</h3>
              <div className="space-y-2">
                {BOOK_SECTIONS.frontMatter.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.has(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {section.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Body */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">TREŚĆ GŁÓWNA</h3>
              <div className="space-y-2">
                {BOOK_SECTIONS.body.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.has(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {section.title}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Możesz dodać więcej rozdziałów później przyciskiem "Nowy rozdział"
              </p>
            </div>

            <Separator />

            {/* Back Matter */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground">ZAKOŃCZENIE KSIĄŻKI</h3>
              <div className="space-y-2">
                {BOOK_SECTIONS.backMatter.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={selectedSections.has(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                    />
                    <label
                      htmlFor={section.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {section.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t">
          <Button 
            onClick={createSelectedChapters} 
            disabled={isCreating || selectedSections.size === 0}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Tworzenie...' : `Utwórz strukturę (${selectedSections.size})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
