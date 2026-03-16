-- ========================================
-- DYSTRYBUCJA - tabela platform dystrybucyjnych
-- ========================================
CREATE TYPE public.distribution_status AS ENUM ('draft', 'pending', 'published', 'rejected', 'archived');

CREATE TABLE public.distribution_platforms (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_url TEXT,
    description TEXT,
    formats TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.document_distributions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.distribution_platforms(id) ON DELETE CASCADE,
    status public.distribution_status DEFAULT 'draft',
    external_id TEXT,
    external_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(document_id, platform_id)
);

-- ========================================
-- WSPÓŁPRACA I WERSJONOWANIE
-- ========================================
CREATE TYPE public.collaborator_role AS ENUM ('viewer', 'editor', 'reviewer', 'admin');
CREATE TYPE public.version_type AS ENUM ('auto', 'manual', 'milestone');
CREATE TYPE public.comment_status AS ENUM ('open', 'resolved', 'rejected');

CREATE TABLE public.document_collaborators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    role public.collaborator_role DEFAULT 'viewer',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(document_id, email)
);

CREATE TABLE public.chapter_versions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT,
    word_count INTEGER DEFAULT 0,
    version_type public.version_type DEFAULT 'auto',
    label TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(chapter_id, version_number)
);

CREATE TABLE public.chapter_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    position_start INTEGER,
    position_end INTEGER,
    quoted_text TEXT,
    status public.comment_status DEFAULT 'open',
    parent_id UUID REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- OKŁADKI
-- ========================================
CREATE TYPE public.cover_status AS ENUM ('draft', 'generating', 'completed', 'failed');

CREATE TABLE public.cover_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    preview_url TEXT,
    layout_data JSONB DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.document_covers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.cover_templates(id),
    title TEXT,
    subtitle TEXT,
    author_name TEXT,
    background_image_url TEXT,
    design_data JSONB DEFAULT '{}',
    status public.cover_status DEFAULT 'draft',
    final_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- TANTIEMY I ANALITYKA
-- ========================================
CREATE TYPE public.royalty_status AS ENUM ('pending', 'confirmed', 'paid');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE public.sales_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES public.distribution_platforms(id),
    sale_date DATE NOT NULL,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    royalty_amount DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    country TEXT,
    format TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.royalty_splits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    role TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.payouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status public.payment_status DEFAULT 'pending',
    payout_method TEXT,
    reference TEXT,
    period_start DATE,
    period_end DATE,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ========================================
-- RLS POLICIES
-- ========================================

-- document_distributions
ALTER TABLE public.document_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their document distributions" ON public.document_distributions
FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create distributions for their documents" ON public.document_distributions
FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update their document distributions" ON public.document_distributions
FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete their document distributions" ON public.document_distributions
FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()
));

-- distribution_platforms (public read)
ALTER TABLE public.distribution_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view distribution platforms" ON public.distribution_platforms FOR SELECT USING (true);

-- document_collaborators
ALTER TABLE public.document_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can manage collaborators" ON public.document_collaborators
FOR ALL USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = document_collaborators.document_id AND documents.user_id = auth.uid()
));

CREATE POLICY "Collaborators can view their collaborations" ON public.document_collaborators
FOR SELECT USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- chapter_versions
ALTER TABLE public.chapter_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of their chapters" ON public.chapter_versions
FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.chapters c JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = chapter_versions.chapter_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can create versions for their chapters" ON public.chapter_versions
FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.chapters c JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = chapter_versions.chapter_id AND d.user_id = auth.uid()
));

-- chapter_comments
ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their chapters" ON public.chapter_comments
FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.chapters c JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = chapter_comments.chapter_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can create comments on accessible chapters" ON public.chapter_comments
FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.chapters c JOIN public.documents d ON c.document_id = d.id
    WHERE c.id = chapter_comments.chapter_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can update their own comments" ON public.chapter_comments
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON public.chapter_comments
FOR DELETE USING (user_id = auth.uid());

-- cover_templates (public read)
ALTER TABLE public.cover_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cover templates" ON public.cover_templates FOR SELECT USING (true);

-- document_covers
ALTER TABLE public.document_covers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage covers for their documents" ON public.document_covers
FOR ALL USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = document_covers.document_id AND documents.user_id = auth.uid()
));

-- sales_data
ALTER TABLE public.sales_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sales data for their documents" ON public.sales_data
FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = sales_data.document_id AND documents.user_id = auth.uid()
));

-- royalty_splits
ALTER TABLE public.royalty_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can manage royalty splits" ON public.royalty_splits
FOR ALL USING (EXISTS (
    SELECT 1 FROM public.documents WHERE documents.id = royalty_splits.document_id AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can view their own royalty splits" ON public.royalty_splits
FOR SELECT USING (user_id = auth.uid());

-- payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payouts" ON public.payouts
FOR SELECT USING (user_id = auth.uid());

-- ========================================
-- SEED DATA - platformy dystrybucyjne
-- ========================================
INSERT INTO public.distribution_platforms (name, slug, description, formats) VALUES
('Amazon KDP', 'amazon-kdp', 'Największa platforma e-booków i druku na żądanie', ARRAY['epub', 'mobi', 'pdf', 'paperback']),
('Google Play Books', 'google-play', 'Sklep z e-bookami Google', ARRAY['epub', 'pdf']),
('Apple Books', 'apple-books', 'Platforma e-booków Apple', ARRAY['epub']),
('Kobo', 'kobo', 'Międzynarodowa platforma e-booków', ARRAY['epub', 'pdf']),
('Empik', 'empik', 'Największy polski sprzedawca książek', ARRAY['epub', 'mobi', 'pdf']),
('Legimi', 'legimi', 'Polska usługa subskrypcyjna e-booków', ARRAY['epub', 'mobi']),
('Storytel', 'storytel', 'Platforma audiobooków', ARRAY['mp3', 'audiobook']),
('Audible', 'audible', 'Platforma audiobooków Amazon', ARRAY['audiobook']),
('Draft2Digital', 'draft2digital', 'Agregator dystrybucji', ARRAY['epub', 'pdf']),
('IngramSpark', 'ingram-spark', 'Druk na żądanie i dystrybucja', ARRAY['epub', 'pdf', 'hardcover', 'paperback']);

-- ========================================
-- SEED DATA - szablony okładek
-- ========================================
INSERT INTO public.cover_templates (name, category, layout_data) VALUES
('Klasyczny Romans', 'romans', '{"font": "Playfair Display", "colors": ["#8b5cf6", "#ec4899"], "layout": "centered"}'),
('Thriller Noir', 'thriller', '{"font": "Oswald", "colors": ["#1f2937", "#ef4444"], "layout": "bold"}'),
('Fantasy Epicki', 'fantasy', '{"font": "Cinzel", "colors": ["#0d9488", "#6366f1"], "layout": "dramatic"}'),
('Poradnik Biznesowy', 'poradnik', '{"font": "Montserrat", "colors": ["#2563eb", "#f59e0b"], "layout": "clean"}'),
('Kryminał Skandynawski', 'kryminal', '{"font": "Source Sans Pro", "colors": ["#374151", "#3b82f6"], "layout": "minimal"}'),
('Sci-Fi Kosmiczny', 'scifi', '{"font": "Orbitron", "colors": ["#7c3aed", "#0ea5e9"], "layout": "futuristic"}'),
('Literatura Piękna', 'literatura', '{"font": "Cormorant Garamond", "colors": ["#78350f", "#a3e635"], "layout": "elegant"}'),
('Dla Dzieci', 'dla-dzieci', '{"font": "Fredoka One", "colors": ["#f97316", "#22c55e", "#8b5cf6"], "layout": "playful"}');