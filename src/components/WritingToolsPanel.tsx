import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  BookOpen, 
  Quote, 
  RefreshCw, 
  Volume2,
  Loader2,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import { useWritingTools } from '@/hooks/useWritingTools';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WritingToolsPanelProps {
  isCollapsed?: boolean;
}

export const WritingToolsPanel = ({ isCollapsed = false }: WritingToolsPanelProps) => {
  const [searchWord, setSearchWord] = useState('');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const {
    dailyQuote,
    isLoadingQuote,
    fetchDailyQuote,
    dictionaryResult,
    isLoadingDict,
    lookupWord,
    synonyms,
    isLoadingSynonyms,
    fetchSynonyms
  } = useWritingTools();

  const handleSearch = () => {
    if (searchWord.trim()) {
      lookupWord(searchWord);
      fetchSynonyms(searchWord);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWord(text);
    toast.success('Skopiowano do schowka');
    setTimeout(() => setCopiedWord(null), 2000);
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Daily Quote */}
      <div className="p-3 border-b border-sidebar-border bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-sidebar-foreground">Inspiracja Dnia</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={fetchDailyQuote}
            disabled={isLoadingQuote}
          >
            <RefreshCw className={cn("w-3 h-3", isLoadingQuote && "animate-spin")} />
          </Button>
        </div>
        {dailyQuote && (
          <div className="space-y-1">
            <p className="text-xs italic text-sidebar-foreground/80 leading-relaxed">
              "{dailyQuote.content}"
            </p>
            <p className="text-xs text-primary font-medium">— {dailyQuote.author}</p>
          </div>
        )}
      </div>

      {/* Word Tools */}
      <div className="flex-1 p-3">
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Szukaj słowa..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-8 text-xs bg-sidebar-accent/50 border-sidebar-border"
          />
          <Button 
            size="sm" 
            onClick={handleSearch}
            disabled={isLoadingDict || isLoadingSynonyms}
            className="h-8 px-3"
          >
            {(isLoadingDict || isLoadingSynonyms) ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Search className="w-3 h-3" />
            )}
          </Button>
        </div>

        <Tabs defaultValue="definition" className="flex-1">
          <TabsList className="w-full h-7 bg-sidebar-accent/50">
            <TabsTrigger value="definition" className="text-xs flex-1 h-6">
              <BookOpen className="w-3 h-3 mr-1" />
              Definicja
            </TabsTrigger>
            <TabsTrigger value="synonyms" className="text-xs flex-1 h-6">
              <Quote className="w-3 h-3 mr-1" />
              Synonimy
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[200px] mt-2">
            <TabsContent value="definition" className="mt-0">
              {dictionaryResult ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-sidebar-foreground">
                      {dictionaryResult.word}
                    </span>
                    {dictionaryResult.phonetic && (
                      <span className="text-xs text-sidebar-foreground/60">
                        {dictionaryResult.phonetic}
                      </span>
                    )}
                  </div>
                  {dictionaryResult.meanings.slice(0, 3).map((meaning, idx) => (
                    <div key={idx} className="space-y-1">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {meaning.partOfSpeech}
                      </Badge>
                      {meaning.definitions.slice(0, 2).map((def, defIdx) => (
                        <div key={defIdx} className="text-xs text-sidebar-foreground/80 pl-2 border-l-2 border-primary/30">
                          <p>{def.definition}</p>
                          {def.example && (
                            <p className="italic text-sidebar-foreground/60 mt-1">
                              "{def.example}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-sidebar-foreground/50 text-center py-8">
                  Wpisz słowo, aby zobaczyć definicję
                </div>
              )}
            </TabsContent>

            <TabsContent value="synonyms" className="mt-0">
              {synonyms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {synonyms.map((syn, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-primary/20 transition-colors group"
                      onClick={() => copyToClipboard(syn.word)}
                    >
                      {syn.word}
                      {copiedWord === syn.word ? (
                        <Check className="w-3 h-3 ml-1 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-sidebar-foreground/50 text-center py-8">
                  Wpisz słowo, aby zobaczyć synonimy
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};
