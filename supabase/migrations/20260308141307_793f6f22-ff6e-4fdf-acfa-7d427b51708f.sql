
-- Convert ALL RESTRICTIVE RLS policies to PERMISSIVE across all tables
-- PostgreSQL default is PERMISSIVE; RESTRICTIVE alone blocks all access

-- ===== documents =====
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;

CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===== chapters =====
DROP POLICY IF EXISTS "Users can create chapters in their documents" ON public.chapters;
DROP POLICY IF EXISTS "Users can delete chapters from their documents" ON public.chapters;
DROP POLICY IF EXISTS "Users can update chapters in their documents" ON public.chapters;
DROP POLICY IF EXISTS "Users can view chapters of their documents" ON public.chapters;

CREATE POLICY "Users can create chapters in their documents" ON public.chapters FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = chapters.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can delete chapters from their documents" ON public.chapters FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = chapters.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can update chapters in their documents" ON public.chapters FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = chapters.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can view chapters of their documents" ON public.chapters FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = chapters.document_id AND documents.user_id = auth.uid()));

-- ===== chapter_comments =====
DROP POLICY IF EXISTS "Users can create comments on accessible chapters" ON public.chapter_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.chapter_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.chapter_comments;
DROP POLICY IF EXISTS "Users can view comments on their chapters" ON public.chapter_comments;

CREATE POLICY "Users can create comments on accessible chapters" ON public.chapter_comments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = chapter_comments.chapter_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can delete their own comments" ON public.chapter_comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own comments" ON public.chapter_comments FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view comments on their chapters" ON public.chapter_comments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = chapter_comments.chapter_id AND d.user_id = auth.uid()));

-- ===== chapter_versions =====
DROP POLICY IF EXISTS "Users can create versions for their chapters" ON public.chapter_versions;
DROP POLICY IF EXISTS "Users can view versions of their chapters" ON public.chapter_versions;

CREATE POLICY "Users can create versions for their chapters" ON public.chapter_versions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = chapter_versions.chapter_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can view versions of their chapters" ON public.chapter_versions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = chapter_versions.chapter_id AND d.user_id = auth.uid()));

-- ===== illustrations =====
DROP POLICY IF EXISTS "Users can create illustrations in their chapters" ON public.illustrations;
DROP POLICY IF EXISTS "Users can delete illustrations from their chapters" ON public.illustrations;
DROP POLICY IF EXISTS "Users can update illustrations in their chapters" ON public.illustrations;
DROP POLICY IF EXISTS "Users can view illustrations in their chapters" ON public.illustrations;

CREATE POLICY "Users can create illustrations in their chapters" ON public.illustrations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can delete illustrations from their chapters" ON public.illustrations FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can update illustrations in their chapters" ON public.illustrations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()));
CREATE POLICY "Users can view illustrations in their chapters" ON public.illustrations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM chapters c JOIN documents d ON c.document_id = d.id WHERE c.id = illustrations.chapter_id AND d.user_id = auth.uid()));

-- ===== document_collaborators =====
DROP POLICY IF EXISTS "collaborators_delete_owner" ON public.document_collaborators;
DROP POLICY IF EXISTS "collaborators_insert_owner" ON public.document_collaborators;
DROP POLICY IF EXISTS "collaborators_select_own" ON public.document_collaborators;
DROP POLICY IF EXISTS "collaborators_select_owner" ON public.document_collaborators;
DROP POLICY IF EXISTS "collaborators_update_owner" ON public.document_collaborators;

CREATE POLICY "collaborators_delete_owner" ON public.document_collaborators FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_collaborators.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "collaborators_insert_owner" ON public.document_collaborators FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_collaborators.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "collaborators_select_own" ON public.document_collaborators FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "collaborators_select_owner" ON public.document_collaborators FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_collaborators.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "collaborators_update_owner" ON public.document_collaborators FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_collaborators.document_id AND documents.user_id = auth.uid()));

-- ===== document_covers =====
DROP POLICY IF EXISTS "Users can manage covers for their documents" ON public.document_covers;

CREATE POLICY "Users can manage covers for their documents" ON public.document_covers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_covers.document_id AND documents.user_id = auth.uid()));

-- ===== document_distributions =====
DROP POLICY IF EXISTS "Users can create distributions for their documents" ON public.document_distributions;
DROP POLICY IF EXISTS "Users can delete their document distributions" ON public.document_distributions;
DROP POLICY IF EXISTS "Users can update their document distributions" ON public.document_distributions;
DROP POLICY IF EXISTS "Users can view their document distributions" ON public.document_distributions;

CREATE POLICY "Users can create distributions for their documents" ON public.document_distributions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can delete their document distributions" ON public.document_distributions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can update their document distributions" ON public.document_distributions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "Users can view their document distributions" ON public.document_distributions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = document_distributions.document_id AND documents.user_id = auth.uid()));

-- ===== royalty_splits =====
DROP POLICY IF EXISTS "royalty_splits_delete_owner" ON public.royalty_splits;
DROP POLICY IF EXISTS "royalty_splits_insert_owner" ON public.royalty_splits;
DROP POLICY IF EXISTS "royalty_splits_select_own" ON public.royalty_splits;
DROP POLICY IF EXISTS "royalty_splits_select_owner" ON public.royalty_splits;
DROP POLICY IF EXISTS "royalty_splits_update_owner" ON public.royalty_splits;

CREATE POLICY "royalty_splits_delete_owner" ON public.royalty_splits FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = royalty_splits.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "royalty_splits_insert_owner" ON public.royalty_splits FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM documents WHERE documents.id = royalty_splits.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "royalty_splits_select_own" ON public.royalty_splits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "royalty_splits_select_owner" ON public.royalty_splits FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = royalty_splits.document_id AND documents.user_id = auth.uid()));
CREATE POLICY "royalty_splits_update_owner" ON public.royalty_splits FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = royalty_splits.document_id AND documents.user_id = auth.uid()));

-- ===== payouts =====
DROP POLICY IF EXISTS "Users can view their own payouts" ON public.payouts;

CREATE POLICY "Users can view their own payouts" ON public.payouts FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ===== sales_data =====
DROP POLICY IF EXISTS "Users can view sales data for their documents" ON public.sales_data;

CREATE POLICY "Users can view sales data for their documents" ON public.sales_data FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM documents WHERE documents.id = sales_data.document_id AND documents.user_id = auth.uid()));

-- ===== cover_templates =====
DROP POLICY IF EXISTS "Anyone can view cover templates" ON public.cover_templates;

CREATE POLICY "Anyone can view cover templates" ON public.cover_templates FOR SELECT USING (true);

-- ===== distribution_platforms =====
DROP POLICY IF EXISTS "Anyone can view distribution platforms" ON public.distribution_platforms;

CREATE POLICY "Anyone can view distribution platforms" ON public.distribution_platforms FOR SELECT USING (true);
