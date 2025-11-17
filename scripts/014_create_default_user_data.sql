-- Enhanced handle_new_user function that creates default data for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_zcash_id TEXT;
BEGIN
  -- Generate unique ZCash ID
  new_zcash_id := 'Z' || upper(substring(md5(random()::text) from 1 for 8));

  -- Insert into profiles table with metadata
  INSERT INTO public.profiles (id, full_name, email, phone, zcash_id, account_mode)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    new_zcash_id,
    'demo'  -- Default to demo mode
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email),
    phone = coalesce(excluded.phone, profiles.phone);

  -- Create demo main wallet with 500k balance
  INSERT INTO public.main_wallets (user_id, balance, currency, mode)
  VALUES (
    new.id,
    500000.00,  -- 500k demo balance
    'NGN',
    'demo'
  );

  -- Create live main wallet with 0 balance
  INSERT INTO public.main_wallets (user_id, balance, currency, mode)
  VALUES (
    new.id,
    0,
    'NGN',
    'live'
  );

  -- Create default user settings
  INSERT INTO public.user_settings (user_id, mode)
  VALUES (new.id, 'demo');

  INSERT INTO public.user_settings (user_id, mode)
  VALUES (new.id, 'live');

  -- Create 2 default budget wallets for demo mode
  INSERT INTO public.budget_wallets (
    user_id, name, purpose, balance, spend_limit, mode, currency
  ) VALUES (
    new.id,
    'Monthly Expenses',
    'Budget for daily expenses and bills',
    50000.00,
    100000.00,
    'demo',
    'NGN'
  );

  INSERT INTO public.budget_wallets (
    user_id, name, purpose, balance, spend_limit, mode, currency
  ) VALUES (
    new.id,
    'Entertainment & Fun',
    'Budget for leisure and entertainment',
    25000.00,
    50000.00,
    'demo',
    'NGN'
  );

  -- Create 2 default goal wallets for demo mode
  INSERT INTO public.goal_wallets (
    user_id, name, purpose, balance, target_amount, target_date, mode, progress_percentage
  ) VALUES (
    new.id,
    'Emergency Fund',
    'Building a financial safety net',
    150000.00,
    500000.00,
    CURRENT_DATE + INTERVAL '6 months',
    'demo',
    30.00
  );

  INSERT INTO public.goal_wallets (
    user_id, name, purpose, balance, target_amount, target_date, mode, progress_percentage
  ) VALUES (
    new.id,
    'Vacation Savings',
    'Saving for a dream vacation',
    80000.00,
    300000.00,
    CURRENT_DATE + INTERVAL '1 year',
    'demo',
    26.67
  );

  -- Create a default demo circle
  INSERT INTO public.circles (
    created_by, name, description, target_amount, current_balance, mode, visibility, member_count
  ) VALUES (
    new.id,
    'Family Savings Circle',
    'Collective savings for family goals',
    1000000.00,
    250000.00,
    'demo',
    'private',
    1
  );

  -- Add user as admin of the circle they just created
  INSERT INTO public.circle_members (
    circle_id, user_id, role, total_contributed, mode
  ) SELECT 
    id, 
    new.id, 
    'admin', 
    250000.00,
    'demo'
  FROM public.circles 
  WHERE created_by = new.id 
  AND mode = 'demo'
  ORDER BY created_at DESC 
  LIMIT 1;

  RETURN new;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
