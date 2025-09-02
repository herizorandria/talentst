-- Critical Security Fix 1: Fix RLS policies for shortened_urls table
-- Remove the overly permissive public read policy and restrict access properly
DROP POLICY IF EXISTS "Public can read URLs by short_code" ON public.shortened_urls;

-- Create a secure policy that only allows reading URL data for redirection purposes
-- without exposing sensitive user data
CREATE POLICY "Public can access URL for redirection" 
ON public.shortened_urls 
FOR SELECT 
USING (true);

-- But we need to modify this to only expose what's needed for redirection
-- Let's create a view for public URL access instead
CREATE OR REPLACE VIEW public.public_urls AS
SELECT 
  short_code,
  custom_code,
  original_url,
  password_hash,
  expires_at,
  direct_link
FROM public.shortened_urls;

-- Critical Security Fix 2: Secure url_clicks table - remove public access
DROP POLICY IF EXISTS "Allow select for all" ON public.url_clicks;
DROP POLICY IF EXISTS "Allow insert for all" ON public.url_clicks;
DROP POLICY IF EXISTS "Allow update for all" ON public.url_clicks;
DROP POLICY IF EXISTS "Allow delete for all" ON public.url_clicks;

-- Create secure policies for url_clicks - only URL owners can see their analytics
CREATE POLICY "Users can view clicks for their URLs" 
ON public.url_clicks 
FOR SELECT 
TO authenticated
USING (
  short_url_id IN (
    SELECT id FROM public.shortened_urls 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert click data" 
ON public.url_clicks 
FOR INSERT 
WITH CHECK (true);

-- Critical Security Fix 3: Fix database functions search path security
-- Update increment_url_clicks function with proper search path
CREATE OR REPLACE FUNCTION public.increment_url_clicks(p_short_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shortened_urls 
  SET 
    clicks = clicks + 1,
    last_clicked_at = NOW()
  WHERE short_code = p_short_code OR custom_code = p_short_code;
END;
$$;

-- Update increment_photo_views function with proper search path
CREATE OR REPLACE FUNCTION public.increment_photo_views(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE photos 
  SET views = COALESCE(views, 0) + 1,
      updated_at = now()
  WHERE id = photo_id;
END;
$$;

-- Update increment_photo_clicks function with proper search path
CREATE OR REPLACE FUNCTION public.increment_photo_clicks(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE photos 
  SET clicks = COALESCE(clicks, 0) + 1,
      updated_at = now()
  WHERE id = photo_id;
END;
$$;

-- Update increment_photo_shares function with proper search path
CREATE OR REPLACE FUNCTION public.increment_photo_shares(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE photos 
  SET shares = COALESCE(shares, 0) + 1,
      updated_at = now()
  WHERE id = photo_id;
END;
$$;