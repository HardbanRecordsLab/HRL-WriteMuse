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
      console.error('[generate-illustration] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      console.error('[generate-illustration] Invalid JWT token:', authError);
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

    const { prompt, style = "realistic", chapterId }: { 
      prompt: string; 
      style?: string;
      chapterId: string;
    } = await req.json();

    // Input validation: enforce length limits
    const MAX_PROMPT = 4000;
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
    if (!chapterId || typeof chapterId !== 'string') {
      return new Response(JSON.stringify({ error: 'Nieprawidłowy chapterId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Initialize Supabase client with service role for storage operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // SECURITY: Validate user has access to this chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('document_id, documents!inner(user_id)')
      .eq('id', chapterId)
      .single();

    if (chapterError || !chapter) {
      console.error('[generate-illustration] Chapter not found:', chapterError);
      return new Response(
        JSON.stringify({ error: 'Chapter not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // @ts-ignore - TypeScript doesn't recognize the joined field
    if (chapter.documents.user_id !== userId) {
      console.error('[generate-illustration] User does not own this chapter');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You do not have access to this chapter' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[generate-illustration] Generating for chapter:', chapterId, 'verified user:', userId);

    // Określenie stylu ilustracji
    const stylePrompts: Record<string, string> = {
      realistic: "photorealistic, highly detailed, professional photography style",
      artistic: "digital art, artistic illustration, creative composition",
      minimalist: "minimalist design, clean lines, simple composition",
      fantasy: "fantasy art, magical atmosphere, dreamy composition",
      technical: "technical illustration, diagram style, educational"
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style] || stylePrompts.artistic}, high quality, ultra detailed, 16:9 aspect ratio`;

    console.log('Calling AI gateway with prompt:', enhancedPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: "Przekroczono limit żądań, spróbuj ponownie za chwilę." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ 
          error: "Wymagane doładowanie środków w Lovable AI." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`Błąd AI gateway: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received, checking for images...');
    
    // Sprawdź czy odpowiedź zawiera obrazy
    if (!data.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
      console.error('No image in AI response:', JSON.stringify(data));
      throw new Error("AI nie zwróciło obrazu");
    }

    const base64Image = data.choices[0].message.images[0].image_url.url;
    console.log('Base64 image received, length:', base64Image.length);
    
    // Wyciągnij dane base64 (usuń prefix data:image/png;base64,)
    const base64Data = base64Image.split(',')[1];
    
    // Konwertuj base64 na blob
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    console.log('Image bytes created, size:', imageBytes.length);
    
    // Nazwa pliku - używamy timestamp i losowej części
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(7);
    const fileName = `${userId}/${chapterId}_${timestamp}_${random}.png`;
    
    console.log('Uploading to storage:', fileName);

    // Upload do storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('illustrations')
      .upload(fileName, imageBytes, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Błąd zapisu do storage: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);

    // Pobierz publiczny URL
    const { data: urlData } = supabase
      .storage
      .from('illustrations')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL:', publicUrl);

    return new Response(JSON.stringify({ 
      imageUrl: publicUrl,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-illustration function:', error);
    return new Response(JSON.stringify({ 
      error: 'Wewnętrzny błąd serwera',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
