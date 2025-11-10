-- Add custom_theme column to profiles table to store user's custom color palette
ALTER TABLE public.profiles 
ADD COLUMN custom_theme jsonb DEFAULT NULL;

COMMENT ON COLUMN public.profiles.custom_theme IS 'Stores user custom theme colors as JSON object with HSL values';