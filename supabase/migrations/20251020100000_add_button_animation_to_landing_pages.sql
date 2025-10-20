-- Add button_animation to landing_pages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'landing_pages' AND column_name = 'button_animation'
  ) THEN
    ALTER TABLE public.landing_pages ADD COLUMN button_animation TEXT NULL;
  END IF;
END $$;
