-- Create storage bucket for illustrations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'illustrations',
  'illustrations',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for illustrations bucket
CREATE POLICY "Users can view illustration images"
ON storage.objects FOR SELECT
USING (bucket_id = 'illustrations');

CREATE POLICY "Users can upload illustration images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their illustration images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their illustration images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'illustrations' AND
  (storage.foldername(name))[1] = auth.uid()::text
);