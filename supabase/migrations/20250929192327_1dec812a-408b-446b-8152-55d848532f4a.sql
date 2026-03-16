-- Enumeracje dla statusów i typów
CREATE TYPE document_status AS ENUM ('draft', 'in_progress', 'completed', 'published');
CREATE TYPE illustration_status AS ENUM ('pending', 'generating', 'completed', 'failed');

-- Tabela dokumentów/książek
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    status document_status DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela rozdziałów
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela ilustracji
CREATE TABLE public.illustrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    image_url TEXT,
    prompt TEXT NOT NULL,
    position_in_chapter INTEGER,
    status illustration_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Włączenie RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illustrations ENABLE ROW LEVEL SECURITY;

-- Polityki RLS dla documents
CREATE POLICY "Users can view their own documents" 
ON public.documents FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents FOR DELETE 
USING (auth.uid() = user_id);

-- Polityki RLS dla chapters
CREATE POLICY "Users can view chapters of their documents" 
ON public.chapters FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = chapters.document_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create chapters in their documents" 
ON public.chapters FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = chapters.document_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update chapters in their documents" 
ON public.chapters FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = chapters.document_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete chapters from their documents" 
ON public.chapters FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = chapters.document_id AND user_id = auth.uid()
));

-- Polityki RLS dla illustrations
CREATE POLICY "Users can view illustrations in their chapters" 
ON public.illustrations FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.chapters c
    JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can create illustrations in their chapters" 
ON public.illustrations FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.chapters c
    JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can update illustrations in their chapters" 
ON public.illustrations FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.chapters c
    JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can delete illustrations from their chapters" 
ON public.illustrations FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.chapters c
    JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()
));

-- Funkcja aktualizacji timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggery dla automatycznej aktualizacji timestamp
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
    BEFORE UPDATE ON public.chapters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_illustrations_updated_at
    BEFORE UPDATE ON public.illustrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Indeksy dla lepszej wydajności
CREATE INDEX idx_chapters_document_id_order ON public.chapters(document_id, order_index);
CREATE INDEX idx_illustrations_chapter_id ON public.illustrations(chapter_id);
CREATE INDEX idx_documents_user_id_updated ON public.documents(user_id, updated_at DESC);