-- Add is_active column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for is_active column for performance
CREATE INDEX IF NOT EXISTS idx_settings_is_active 
ON public.settings (is_active);

-- Update existing settings to be active by default
UPDATE public.settings 
SET is_active = true 
WHERE is_active IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.settings.is_active 
IS 'Soft-delete flag - false means setting is deactivated';