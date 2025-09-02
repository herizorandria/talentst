-- Ajout des règles de blocage par pays et par IP au niveau des URLs
-- Sécurisé pour ré-exécution: vérifier l'existence des colonnes
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shortened_urls'
        AND column_name = 'blocked_countries'
) THEN
ALTER TABLE public.shortened_urls
ADD COLUMN blocked_countries text [] NULL;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'shortened_urls'
        AND column_name = 'blocked_ips'
) THEN
ALTER TABLE public.shortened_urls
ADD COLUMN blocked_ips text [] NULL;
END IF;
END $$;