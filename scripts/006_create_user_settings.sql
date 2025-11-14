-- Create user_settings table for storing preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Biometric & Security
  biometric_enabled BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  
  -- Display Preferences
  show_dashboard_balances BOOLEAN DEFAULT true,
  hide_balances BOOLEAN DEFAULT false,
  dark_mode_enabled BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'NGN',
  
  -- Privacy Settings
  default_shielded BOOLEAN DEFAULT true,
  encrypt_memos BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'private',
  
  -- Savings & Interest
  interest_enabled BOOLEAN DEFAULT true,
  automatic_savings_enabled BOOLEAN DEFAULT false,
  
  -- Notifications
  transaction_alerts BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  goal_milestones BOOLEAN DEFAULT true,
  circle_updates BOOLEAN DEFAULT true,
  security_alerts BOOLEAN DEFAULT true,
  marketing_communications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  
  -- Account Info  bvn TEXT,
  nin TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  next_of_kin_name TEXT,
  next_of_kin_phone TEXT,
  next_of_kin_relationship TEXT,
  
  -- Other
  rewards_points INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS user_settings_user_id_idx ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

-- Create RLS policies
CREATE POLICY "Users can read own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to auto-create settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create settings
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();
