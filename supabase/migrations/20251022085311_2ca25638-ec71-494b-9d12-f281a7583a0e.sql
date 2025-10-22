-- Create storage bucket for landing page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-images', 'landing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view landing page images (public bucket)
CREATE POLICY "Landing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-images');

-- Policy: Authenticated users can upload their own landing images
CREATE POLICY "Authenticated users can upload landing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'landing-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own landing images
CREATE POLICY "Users can update their own landing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'landing-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Users can delete their own landing images
CREATE POLICY "Users can delete their own landing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'landing-images' 
  AND auth.role() = 'authenticated'
);