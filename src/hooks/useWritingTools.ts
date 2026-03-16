import { useState, useEffect, useCallback } from 'react';

// Free Dictionary API
export interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

// Datamuse API for synonyms
export interface SynonymResult {
  word: string;
  score: number;
}

// Quote API
export interface Quote {
  content: string;
  author: string;
}

export const useWritingTools = () => {
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryResult | null>(null);
  const [synonyms, setSynonyms] = useState<SynonymResult[]>([]);
  const [isLoadingDict, setIsLoadingDict] = useState(false);
  const [isLoadingSynonyms, setIsLoadingSynonyms] = useState(false);

  // Fetch daily inspirational quote
  const fetchDailyQuote = useCallback(async () => {
    setIsLoadingQuote(true);
    try {
      // Using quotable.io API
      const response = await fetch('https://api.quotable.io/random?tags=inspirational|wisdom|success');
      if (response.ok) {
        const data = await response.json();
        setDailyQuote({
          content: data.content,
          author: data.author
        });
      } else {
        // Fallback quotes for writers
        const fallbackQuotes = [
          { content: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
          { content: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
          { content: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
          { content: "The first draft is just you telling yourself the story.", author: "Terry Pratchett" },
          { content: "Write what should not be forgotten.", author: "Isabel Allende" },
        ];
        setDailyQuote(fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]);
      }
    } catch (error) {
      // Fallback on error
      const fallbackQuotes = [
        { content: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
        { content: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
        { content: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
      ];
      setDailyQuote(fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]);
    } finally {
      setIsLoadingQuote(false);
    }
  }, []);

  // Lookup word definition
  const lookupWord = useCallback(async (word: string) => {
    if (!word.trim()) return;
    
    setIsLoadingDict(true);
    setDictionaryResult(null);
    
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data[0]) {
          setDictionaryResult({
            word: data[0].word,
            phonetic: data[0].phonetic,
            meanings: data[0].meanings || []
          });
        }
      }
    } catch (error) {
      console.error('Dictionary lookup failed:', error);
    } finally {
      setIsLoadingDict(false);
    }
  }, []);

  // Fetch synonyms using Datamuse API
  const fetchSynonyms = useCallback(async (word: string) => {
    if (!word.trim()) return;
    
    setIsLoadingSynonyms(true);
    setSynonyms([]);
    
    try {
      const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word.trim())}&max=10`);
      if (response.ok) {
        const data = await response.json();
        setSynonyms(data);
      }
    } catch (error) {
      console.error('Synonym fetch failed:', error);
    } finally {
      setIsLoadingSynonyms(false);
    }
  }, []);

  // Fetch related words (rhymes, sounds like, etc.)
  const fetchRelatedWords = useCallback(async (word: string, type: 'rhyme' | 'sounds' | 'means') => {
    if (!word.trim()) return [];
    
    try {
      let endpoint = '';
      switch (type) {
        case 'rhyme':
          endpoint = `https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=10`;
          break;
        case 'sounds':
          endpoint = `https://api.datamuse.com/words?sl=${encodeURIComponent(word)}&max=10`;
          break;
        case 'means':
          endpoint = `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=10`;
          break;
      }
      
      const response = await fetch(endpoint);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Related words fetch failed:', error);
    }
    return [];
  }, []);

  // Load daily quote on mount
  useEffect(() => {
    fetchDailyQuote();
  }, [fetchDailyQuote]);

  return {
    dailyQuote,
    isLoadingQuote,
    fetchDailyQuote,
    dictionaryResult,
    isLoadingDict,
    lookupWord,
    synonyms,
    isLoadingSynonyms,
    fetchSynonyms,
    fetchRelatedWords
  };
};
