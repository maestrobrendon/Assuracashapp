-- Fix RLS policies for all wallet tables to allow proper user access

-- Drop existing policies
DROP POLICY IF EXISTS "Goal wallets: user access (ALL)" ON public.goal_wallets;
DROP POLICY IF EXISTS "Budget wallets: user access (ALL)" ON public.budget_wallets;
DROP POLICY IF EXISTS "Main wallets: user access (ALL)" ON public.main_wallets;

-- Goal Wallets: Allow users to manage their own goal wallets
CREATE POLICY "Goal wallets: user can select own"
ON public.goal_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Goal wallets: user can insert own"
ON public.goal_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Goal wallets: user can update own"
ON public.goal_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Goal wallets: user can delete own"
ON public.goal_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- Budget Wallets: Allow users to manage their own budget wallets
CREATE POLICY "Budget wallets: user can select own"
ON public.budget_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Budget wallets: user can insert own"
ON public.budget_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Budget wallets: user can update own"
ON public.budget_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Budget wallets: user can delete own"
ON public.budget_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- Main Wallets: Allow users to manage their own main wallet
CREATE POLICY "Main wallets: user can select own"
ON public.main_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Main wallets: user can insert own"
ON public.main_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Main wallets: user can update own"
ON public.main_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Main wallets: user can delete own"
ON public.main_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- Profiles: Allow users to manage their own profile
DROP POLICY IF EXISTS "Profiles: user access (ALL)" ON public.profiles;

CREATE POLICY "Profiles: user can select own"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Profiles: user can update own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
