/*
  # Création de la table des clics d'URLs avec analytics détaillées

  1. Nouvelles Tables
    - `url_clicks`
      - `id` (uuid, primary key)
      - `short_url_id` (uuid, foreign key vers shortened_urls)
      - `ip` (text, adresse IP du visiteur)
      - `user_agent` (text, user agent complet)
      - `browser` (text, navigateur détecté)
      - `device` (text, type d'appareil)
      - `os` (text, système d'exploitation)
      - `location_country` (text, pays)
      - `location_city` (text, ville)
      - `referrer` (text, site référent)
      - `clicked_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `url_clicks`
    - Politiques pour que les propriétaires d'URLs voient leurs analytics
*/

-- Créer la table des clics d'URLs
CREATE TABLE IF NOT EXISTS public.url_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_url_id UUID NOT NULL REFERENCES public.shortened_urls(id) ON DELETE CASCADE,
  ip TEXT,
  user_agent TEXT,
  browser TEXT,
  device TEXT,
  os TEXT,
  location_country TEXT,
  location_city TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer des index pour des requêtes rapides
CREATE INDEX IF NOT EXISTS idx_url_clicks_short_url_id ON public.url_clicks(short_url_id);
CREATE INDEX IF NOT EXISTS idx_url_clicks_clicked_at ON public.url_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_url_clicks_country ON public.url_clicks(location_country);
CREATE INDEX IF NOT EXISTS idx_url_clicks_device ON public.url_clicks(device);

-- Activer RLS
ALTER TABLE public.url_clicks ENABLE ROW LEVEL SECURITY;

-- Politique pour que les propriétaires d'URLs voient leurs analytics
CREATE POLICY "Users can view clicks for their URLs" ON public.url_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shortened_urls 
      WHERE shortened_urls.id = url_clicks.short_url_id 
      AND shortened_urls.user_id = auth.uid()
    )
  );

-- Politique pour permettre l'insertion de clics (publique pour les redirections)
CREATE POLICY "Anyone can insert clicks" ON public.url_clicks
  FOR INSERT WITH CHECK (true);