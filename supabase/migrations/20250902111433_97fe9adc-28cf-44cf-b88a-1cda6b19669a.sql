-- Enable required extension for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove overly permissive public read policy on shortened_urls
DROP POLICY IF EXISTS "Public can access URL for redirection" ON public.shortened_urls;
DROP POLICY IF EXISTS "Public can read URLs by short_code" ON public.shortened_urls;

-- Keep owner-only access
-- (Existing policy "Users can view their own URLs" remains)

-- Secure RPC for public redirection lookup with minimal data exposure
CREATE OR REPLACE FUNCTION public.get_redirect_url(p_code text, p_password text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  original_url text,
  expires_at timestamptz,
  direct_link boolean,
  requires_password boolean,
  blocked_countries text[],
  blocked_ips text[]
) AS $$
DECLARE
  rec public.shortened_urls%ROWTYPE;
  pass_ok boolean := true;
BEGIN
  SELECT * INTO rec
  FROM public.shortened_urls
  WHERE short_code = p_code OR custom_code = p_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN; -- returns no rows
  END IF;

  requires_password := rec.password_hash IS NOT NULL;

  IF requires_password THEN
    IF p_password IS NULL THEN
      pass_ok := false;
    ELSE
      -- Support legacy SHA-256 hex hashes and bcrypt hashes
      IF rec.password_hash LIKE '$2%' THEN
        pass_ok := crypt(p_password, rec.password_hash) = rec.password_hash;
      ELSE
        pass_ok := encode(digest(p_password, 'sha256'), 'hex') = rec.password_hash;
      END IF;
    END IF;
  END IF;

  IF NOT pass_ok THEN
    -- Return only flags and blocking arrays without the URL
    id := rec.id;
    original_url := NULL;
    expires_at := rec.expires_at;
    direct_link := rec.direct_link;
    requires_password := true;
    blocked_countries := rec.blocked_countries;
    blocked_ips := rec.blocked_ips;
    RETURN NEXT;
    RETURN;
  END IF;

  id := rec.id;
  original_url := rec.original_url;
  expires_at := rec.expires_at;
  direct_link := rec.direct_link;
  requires_password := rec.password_hash IS NOT NULL;
  blocked_countries := rec.blocked_countries;
  blocked_ips := rec.blocked_ips;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow anonymous to execute this RPC safely
GRANT EXECUTE ON FUNCTION public.get_redirect_url(text, text) TO anon;
