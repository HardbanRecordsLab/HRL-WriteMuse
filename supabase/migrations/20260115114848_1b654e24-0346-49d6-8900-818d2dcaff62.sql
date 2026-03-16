-- Fix security issues: replace overly permissive ALL policies with granular policies

-- Drop existing policies on royalty_splits (use IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Document owners can manage royalty splits" ON public.royalty_splits;
DROP POLICY IF EXISTS "Users can view their own royalty splits" ON public.royalty_splits;
DROP POLICY IF EXISTS "Document owners can view document royalty splits" ON public.royalty_splits;
DROP POLICY IF EXISTS "Document owners can insert royalty splits" ON public.royalty_splits;
DROP POLICY IF EXISTS "Document owners can update royalty splits" ON public.royalty_splits;
DROP POLICY IF EXISTS "Document owners can delete royalty splits" ON public.royalty_splits;

-- Create granular policies for royalty_splits
-- Users can view their own royalty split entries
CREATE POLICY "royalty_splits_select_own" 
ON public.royalty_splits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Document owners can view splits for their documents
CREATE POLICY "royalty_splits_select_owner" 
ON public.royalty_splits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = royalty_splits.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Document owners can insert royalty splits
CREATE POLICY "royalty_splits_insert_owner" 
ON public.royalty_splits 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = royalty_splits.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Document owners can update royalty splits
CREATE POLICY "royalty_splits_update_owner" 
ON public.royalty_splits 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = royalty_splits.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Document owners can delete royalty splits
CREATE POLICY "royalty_splits_delete_owner" 
ON public.royalty_splits 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = royalty_splits.document_id 
    AND documents.user_id = auth.uid()
  )
);

-- Drop existing policies on document_collaborators
DROP POLICY IF EXISTS "Document owners can manage collaborators" ON public.document_collaborators;
DROP POLICY IF EXISTS "Collaborators can view their collaborations" ON public.document_collaborators;
DROP POLICY IF EXISTS "Document owners can insert collaborators" ON public.document_collaborators;
DROP POLICY IF EXISTS "Document owners can update collaborators" ON public.document_collaborators;
DROP POLICY IF EXISTS "Document owners can delete collaborators" ON public.document_collaborators;
DROP POLICY IF EXISTS "Document owners can view document collaborators" ON public.document_collaborators;
DROP POLICY IF EXISTS "Collaborators can view own collaboration" ON public.document_collaborators;

-- Create granular policies for document_collaborators
-- Document owners can view all collaborators on their documents
CREATE POLICY "collaborators_select_owner"
ON public.document_collaborators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_collaborators.document_id
    AND documents.user_id = auth.uid()
  )
);

-- Collaborators can only view their own collaboration entry
CREATE POLICY "collaborators_select_own"
ON public.document_collaborators
FOR SELECT
USING (auth.uid() = user_id);

-- Document owners can insert collaborators
CREATE POLICY "collaborators_insert_owner"
ON public.document_collaborators
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_collaborators.document_id
    AND documents.user_id = auth.uid()
  )
);

-- Document owners can update collaborators
CREATE POLICY "collaborators_update_owner"
ON public.document_collaborators
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_collaborators.document_id
    AND documents.user_id = auth.uid()
  )
);

-- Document owners can delete collaborators
CREATE POLICY "collaborators_delete_owner"
ON public.document_collaborators
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = document_collaborators.document_id
    AND documents.user_id = auth.uid()
  )
);