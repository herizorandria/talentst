-- Create landing_pages table for customizable redirect pages
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_url_id UUID NOT NULL REFERENCES public.shortened_urls(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Design configuration
  background_type TEXT NOT NULL DEFAULT 'gradient', -- 'gradient', 'solid', 'image'
  background_color TEXT DEFAULT '#f59e0b',
  background_gradient_start TEXT DEFAULT '#f59e0b',
  background_gradient_end TEXT DEFAULT '#d97706',
  background_image_url TEXT,
  
  -- Layout configuration
  layout_type TEXT NOT NULL DEFAULT 'center', -- 'center', 'split', 'card'
  logo_url TEXT,
  title TEXT NOT NULL DEFAULT 'Redirection en cours...',
  subtitle TEXT,
  description TEXT,
  
  -- Functionality configuration
  redirect_mode TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'button'
  redirect_delay INTEGER DEFAULT 3, -- delay in seconds for auto redirect
  button_text TEXT DEFAULT 'Continuer',
  button_color TEXT DEFAULT '#f59e0b',
  
  -- Additional settings
  show_countdown BOOLEAN DEFAULT true,
  show_url_preview BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on landing_pages
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for landing_pages
CREATE POLICY "Users can view landing pages for their URLs"
  ON public.landing_pages
  FOR SELECT
  USING (
    short_url_id IN (
      SELECT id FROM public.shortened_urls WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert landing pages for their URLs"
  ON public.landing_pages
  FOR INSERT
  WITH CHECK (
    short_url_id IN (
      SELECT id FROM public.shortened_urls WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update landing pages for their URLs"
  ON public.landing_pages
  FOR UPDATE
  USING (
    short_url_id IN (
      SELECT id FROM public.shortened_urls WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete landing pages for their URLs"
  ON public.landing_pages
  FOR DELETE
  USING (
    short_url_id IN (
      SELECT id FROM public.shortened_urls WHERE user_id = auth.uid()
    )
  );

-- Public can view enabled landing pages (for display purposes)
CREATE POLICY "Public can view enabled landing pages"
  ON public.landing_pages
  FOR SELECT
  USING (enabled = true);

-- Create index for faster lookups
CREATE INDEX idx_landing_pages_short_url_id ON public.landing_pages(short_url_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();