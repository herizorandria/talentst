-- Add background image source and bucket path columns to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS background_image_source text DEFAULT 'url',
ADD COLUMN IF NOT EXISTS background_image_bucket_path text;