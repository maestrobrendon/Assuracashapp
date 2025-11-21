-- Add field to track if user has seen the welcome popup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_seen_welcome_popup BOOLEAN DEFAULT FALSE;

-- Update existing users to have seen the popup (so it only shows for new users)
UPDATE public.profiles
SET has_seen_welcome_popup = TRUE
WHERE has_seen_welcome_popup IS NULL OR has_seen_welcome_popup = FALSE;
