/*
  # Création de la table des URLs raccourcies

  1. Nouvelles Tables
    - `shortened_urls`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers auth.users)
      - `original_url` (text, URL originale)
      - `short_code` (text, code court unique)
      - `custom_code` (text, code personnalisé optionnel)
      - `description` (text, description optionnelle)
      - `tags` (text[], tags optionnels)
      - `password_hash` (text, hash du mot de passe optionnel)
      - `expires_at` (timestamp, date d'expiration optionnelle)
      - `direct_link` (boolean, redirection directe)
      - `clicks` (integer, nombre de clics)
      - `last_clicked_at` (timestamp, dernier clic)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `shortened_urls`
    - Politiques pour que les utilisateurs ne voient que leurs propres URLs
*/

-- Créer la table des URLs raccourcies
CREATE TABLE IF NOT EXISTS public.shortened_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  custom_code TEXT,
  description TEXT,
  tags TEXT[],
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  direct_link BOOLEAN DEFAULT false,
  clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer un index sur le short_code pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_shortened_urls_short_code ON public.shortened_urls(short_code);
CREATE INDEX IF NOT EXISTS idx_shortened_urls_user_id ON public.shortened_urls(user_id);

-- Activer RLS
ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own URLs" ON public.shortened_urls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own URLs" ON public.shortened_urls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own URLs" ON public.shortened_urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own URLs" ON public.shortened_urls
  FOR DELETE USING (auth.uid() = user_id);

-- Politique pour permettre la lecture publique des URLs par short_code (pour les redirections)
CREATE POLICY "Public can read URLs by short_code" ON public.shortened_urls
  FOR SELECT USING (true);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_shortened_urls_updated_at
  BEFORE UPDATE ON public.shortened_urls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();