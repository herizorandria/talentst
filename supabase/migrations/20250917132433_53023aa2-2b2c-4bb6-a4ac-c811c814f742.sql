-- Phase 1: Critical Security Fixes

-- 1. Create role-based access control system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Auto-assign 'user' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger for automatic role assignment
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 2. Fix Contact Messages - CRITICAL DATA EXPOSURE
-- Drop the dangerous policy that allows all authenticated users to see contact messages
DROP POLICY IF EXISTS "Contact messages are viewable by authenticated users" ON public.contact_messages;

-- Add admin-only policies for contact messages
CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3. Fix Settings Table - Remove public read access
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON public.settings;
DROP POLICY IF EXISTS "Settings are manageable by authenticated users" ON public.settings;

CREATE POLICY "Admins can view settings"
ON public.settings
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 4. Fix Blocked IPs - Admin only access
DROP POLICY IF EXISTS "Blocked IPs are viewable by authenticated users" ON public.blocked_ips;
DROP POLICY IF EXISTS "Blocked IPs are manageable by authenticated users" ON public.blocked_ips;

CREATE POLICY "Admins can view blocked IPs"
ON public.blocked_ips
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage blocked IPs"
ON public.blocked_ips
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. Fix Categories - Admin only management
DROP POLICY IF EXISTS "Categories are manageable by authenticated users" ON public.categories;

CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 6. Fix Photos - Admin only management  
DROP POLICY IF EXISTS "Photos are manageable by authenticated users" ON public.photos;

CREATE POLICY "Admins can manage photos"
ON public.photos
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 7. Fix Social Links - Admin only management
DROP POLICY IF EXISTS "Social links are manageable by authenticated users" ON public.social_links;

CREATE POLICY "Admins can manage social links"
ON public.social_links
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 8. Create policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));