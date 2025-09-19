-- Fix security issue: Remove overly permissive UPDATE policy on contact_messages
-- This policy allows any authenticated user to modify all contact messages
DROP POLICY "Contact messages are manageable by authenticated users" ON public.contact_messages;

-- The existing "Admins can update contact messages" policy remains intact
-- and properly restricts updates to admin users only