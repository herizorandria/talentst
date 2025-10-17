ALTER TABLE public.landing_pages
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN user_name TEXT,
ADD COLUMN user_bio TEXT,
ADD COLUMN button_url TEXT,
ADD COLUMN show_location BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN show_verified_badge BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN countdown_to TIMESTAMP WITH TIME ZONE;
