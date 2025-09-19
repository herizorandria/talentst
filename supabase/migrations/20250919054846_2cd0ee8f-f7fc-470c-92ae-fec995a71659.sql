-- Fix critical security vulnerabilities identified in security scan

-- 1. Fix profiles table: Block anonymous access, only allow authenticated users to see their own data
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix contact_messages table: Block anonymous read access completely
CREATE POLICY "Block anonymous access to contact messages" 
ON public.contact_messages 
FOR SELECT 
TO anon
USING (false);

-- 3. Add additional privacy protection for url_clicks table
CREATE POLICY "Block anonymous access to click analytics" 
ON public.url_clicks 
FOR SELECT 
TO anon
USING (false);

-- 4. Ensure blocked_ips table is properly protected from anonymous access
CREATE POLICY "Block anonymous access to blocked IPs" 
ON public.blocked_ips 
FOR SELECT 
TO anon
USING (false);

-- 5. Add policy to prevent anonymous access to user_roles
CREATE POLICY "Block anonymous access to user roles" 
ON public.user_roles 
FOR SELECT 
TO anon
USING (false);