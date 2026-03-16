-- Fix illustrations storage bucket security
-- Make bucket private and restrict access to owners only

UPDATE storage.buckets SET public = false WHERE id = 'illustrations';

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view illustration images" ON storage.objects;

-- Create restricted SELECT policy - users can only view their own illustrations
CREATE POLICY "Users can view their own illustration images" ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Update INSERT policy to be more explicit
DROP POLICY IF EXISTS "Users can upload illustration images" ON storage.objects;
CREATE POLICY "Users can upload their own illustration images" ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add UPDATE policy for users to update their own illustrations
DROP POLICY IF EXISTS "Users can update illustration images" ON storage.objects;
CREATE POLICY "Users can update their own illustration images" ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add DELETE policy for users to delete their own illustrations
DROP POLICY IF EXISTS "Users can delete illustration images" ON storage.objects;
CREATE POLICY "Users can delete their own illustration images" ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);