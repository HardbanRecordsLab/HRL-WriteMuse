import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify user from JWT token instead of trusting client-supplied userId
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[ai-writer] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('[ai-writer] Invalid JWT token:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use verified userId from JWT, ignore any userId from request body
    const userId = user.id;

    const { action, prompt, context, selectedText, stream = false } = await req.json();

    // Input validation: enforce length limits
    const MAX_PROMPT = 4000;
    const MAX_CONTEXT = 2000;
    const MAX_SELECTED_TEXT = 4000;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy prompt' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (prompt.length > MAX_PROMPT) {
      return new Response(JSON.stringify({ error: 'Prompt jest zbyt długi (max 4000 znaków)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (context && typeof context === 'string' && context.length > MAX_CONTEXT) {
      return new Response(JSON.stringify({ error: 'Kontekst jest zbyt długi (max 2000 znaków)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (selectedText && typeof selectedText === 'string' && selectedText.length > MAX_SELECTED_TEXT) {
      return new Response(JSON.stringify({ error: 'Zaznaczony tekst jest zbyt długi (max 4000 znaków)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[ai-writer] Request from verified user:', userId, 'action:', action, 'stream:', stream);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    
    switch (action) {
      case 'improve':
        systemPrompt = `Jesteś doświadczonym redaktorem i pisarzem. Ulepsz podany tekst, zachowując jego oryginalny sens, ale poprawiając styl, klarowność i płynność. Napisz w języku polskim.`;
        break;
      case 'continue':
        systemPrompt = `Jesteś utalentowanym pisarzem. Kontynuuj podany tekst w naturalny sposób, zachowując styl i ton narracji. Napisz w języku polskim, dodając około 200-300 słów.`;
        break;
      case 'summarize':
        systemPrompt = `Jesteś ekspertem w streszczaniu tekstów. Stwórz zwięzłe, ale pełne streszczenie podanego tekstu, zachowując najważniejsze punkty. Napisz w języku polskim.`;
        break;
      case 'expand':
        systemPrompt = `Jesteś utalentowanym pisarzem. Rozwiń podany tekst, dodając więcej szczegółów, opisów i kontekstu. Zachowaj oryginalny ton i styl. Napisz w języku polskim.`;
        break;
      case 'rewrite':
        systemPrompt = `Jesteś kreatywnym pisarzem. Przepisz podany tekst całkowicie na nowo, zachowując główną ideę, ale zmieniając strukturę, słownictwo i styl. Napisz w języku polskim.`;
        break;
      case 'shorten':
        systemPrompt = `Jesteś ekspertem w kondensacji tekstów. Skróć podany tekst do połowy jego długości, zachowując najważniejsze informacje i sens. Napisz w języku polskim.`;
        break;
      case 'lengthen':
        systemPrompt = `Jesteś utalentowanym pisarzem. Wydłuż podany tekst, dodając więcej szczegółów, przykładów i rozwinięć. Podwój długość zachowując jakość i spójność. Napisz w języku polskim.`;
        break;
      case 'generate':
        systemPrompt = `Jesteś kreatywnym pisarzem i ekspertem w tworzeniu treści edukacyjnych. Na podstawie podanego tematu stwórz angażującą i wartościową treść. Napisz w języku polskim.`;
        break;
      default:
        systemPrompt = `Jesteś pomocnym asystentem pisarskim. Pomóż użytkownikowi z jego zadaniem związanym z pisaniem. Odpowiadaj w języku polskim.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: selectedText 
          ? `Tekst do przetworzenia: "${selectedText}"\n\nInstrukcje: ${prompt}`
          : prompt 
      }
    ];

    if (context) {
      messages.splice(1, 0, { 
        role: "user", 
        content: `Kontekst dokumentu: ${context}` 
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: stream,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Przekroczono limit żądań, spróbuj ponownie za chwilę." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Wymagane doładowanie środków w Lovable AI." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Błąd AI gateway");
    }

    // If streaming, return the stream directly
    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming response
    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ text: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-writer function:', error);
    return new Response(JSON.stringify({ 
      error: 'Wewnętrzny błąd serwera' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
