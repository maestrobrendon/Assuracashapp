-- Add cash_tag column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cash_tag TEXT UNIQUE;

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS idx_profiles_cash_tag ON public.profiles(cash_tag);

-- Update handle_new_user function to generate cash_tag
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  new_cash_tag TEXT;
  counter INT := 0;
BEGIN
  -- Extract base username from email (part before @)
  base_username := split_part(NEW.email, '@', 1);
  -- Remove any non-alphanumeric characters and lowercase it
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Initial attempt
  new_cash_tag := '@' || base_username;
  
  -- Check for uniqueness and append number if necessary
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE cash_tag = new_cash_tag) LOOP
    counter := counter + 1;
    new_cash_tag := '@' || base_username || counter::TEXT;
  END LOOP;

  -- Insert into profiles table using metadata from signup
  INSERT INTO public.profiles (id, full_name, email, phone, zcash_id, cash_tag)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    'Z' || upper(substring(md5(random()::text) FROM 1 FOR 8)),
    new_cash_tag
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    cash_tag = COALESCE(profiles.cash_tag, EXCLUDED.cash_tag); -- Keep existing if present

  -- Insert into main_wallets table
  INSERT INTO public.main_wallets (user_id, balance, currency)
  VALUES (
    NEW.id,
    0,
    'NGN'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Backfill existing users who don't have a cash_tag
DO $$
DECLARE
  r RECORD;
  base_username TEXT;
  new_tag TEXT;
  counter INT;
BEGIN
  FOR r IN SELECT * FROM public.profiles WHERE cash_tag IS NULL LOOP
    base_username := split_part(r.email, '@', 1);
    base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
    new_tag := '@' || base_username;
    counter := 0;
    
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE cash_tag = new_tag) LOOP
      counter := counter + 1;
      new_tag := '@' || base_username || counter::TEXT;
    END LOOP;
    
    UPDATE public.profiles SET cash_tag = new_tag WHERE id = r.id;
  END LOOP;
END $$;
