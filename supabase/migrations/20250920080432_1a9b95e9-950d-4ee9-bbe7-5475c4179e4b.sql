-- Fix RLS policy for url_clicks to allow authenticated users to see their own data
DROP POLICY IF EXISTS "Block anonymous access to click analytics" ON public.url_clicks;

-- Allow authenticated users to see clicks for their own URLs
-- The existing policy "Users can view clicks for their URLs" should work
-- But let's make sure it's not conflicting

-- Ensure authenticated users can see their click data
CREATE POLICY "Authenticated users can view clicks for their URLs" 
ON public.url_clicks 
FOR SELECT 
TO authenticated
USING (short_url_id IN ( 
  SELECT shortened_urls.id
  FROM shortened_urls
  WHERE shortened_urls.user_id = auth.uid()
));

-- Block only anonymous access
CREATE POLICY "Block anonymous access to click analytics" 
ON public.url_clicks 
FOR SELECT 
TO anon
USING (false);