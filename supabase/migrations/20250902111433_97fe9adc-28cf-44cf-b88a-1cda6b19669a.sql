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
  blocked_ips text[],
  is_blocked boolean
) AS $$
DECLARE
  rec public.shortened_urls%ROWTYPE;
  pass_ok boolean := true;
  client_ip_text text := NULL;
  client_inet inet := NULL;
  ip_blocked boolean := false;
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

  -- Resolve client IP (as seen by the DB connection) and check blocked_ips safely
  BEGIN
    client_ip_text := inet_client_addr()::text;
    client_inet := inet_client_addr();
  EXCEPTION WHEN OTHERS THEN
    client_ip_text := NULL;
    client_inet := NULL;
  END;

  IF rec.blocked_ips IS NOT NULL AND client_inet IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM unnest(rec.blocked_ips) AS b
      WHERE b IS NOT NULL AND (
        b = client_ip_text
        OR (b ~ '^[0-9]{1,3}(\.[0-9]{1,3}){3}/[0-9]{1,2}$' AND client_inet <<= b::cidr)
        OR (b ~ '^[0-9]{1,3}(\.[0-9]{1,3}){3}$' AND b::inet = client_inet)
      )
    ) INTO ip_blocked;
  END IF;

  IF ip_blocked THEN
    -- If IP is blocked, return blocked status immediately (no original URL)
    id := rec.id;
    original_url := NULL;
    expires_at := rec.expires_at;
    direct_link := rec.direct_link;
    requires_password := rec.password_hash IS NOT NULL;
    blocked_countries := rec.blocked_countries;
    blocked_ips := rec.blocked_ips;
    is_blocked := true;
    RETURN NEXT;
    RETURN;
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
    is_blocked := false;
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
  is_blocked := false;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Allow anonymous to execute this RPC safely
GRANT EXECUTE ON FUNCTION public.get_redirect_url(text, text) TO anon;
