-- Fix document_collaborators RLS policies: change from RESTRICTIVE to PERMISSIVE for proper OR behavior
-- Drop the existing restrictive SELECT policies
DROP POLICY IF EXISTS "collaborators_select_own" ON public.document_collaborators;
DROP POLICY IF EXISTS "collaborators_select_owner" ON public.document_collaborators;

-- Create new PERMISSIVE SELECT policies (default is permissive, multiple permissive = OR logic)
CREATE POLICY "collaborators_select_own"
ON public.document_collaborators
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "collaborators_select_owner"
ON public.document_collaborators
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM documents
  WHERE documents.id = document_collaborators.document_id
  AND documents.user_id = auth.uid()
));