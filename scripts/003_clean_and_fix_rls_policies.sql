-- Clean up duplicate RLS policies and ensure proper access control

-- ====================
-- GOAL WALLETS
-- ====================
-- Drop ALL existing policies for goal_wallets
DROP POLICY IF EXISTS "Goal wallets: user access (ALL)" ON public.goal_wallets;
DROP POLICY IF EXISTS "Goal wallets: user can select own" ON public.goal_wallets;
DROP POLICY IF EXISTS "Goal wallets: user can insert own" ON public.goal_wallets;
DROP POLICY IF EXISTS "Goal wallets: user can update own" ON public.goal_wallets;
DROP POLICY IF EXISTS "Goal wallets: user can delete own" ON public.goal_wallets;

-- Create new specific policies for goal_wallets
CREATE POLICY "goal_wallets_select_policy"
ON public.goal_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "goal_wallets_insert_policy"
ON public.goal_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goal_wallets_update_policy"
ON public.goal_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goal_wallets_delete_policy"
ON public.goal_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- ====================
-- BUDGET WALLETS
-- ====================
-- Drop ALL existing policies for budget_wallets
DROP POLICY IF EXISTS "Budget wallets: user access (ALL)" ON public.budget_wallets;
DROP POLICY IF EXISTS "Budget wallets: user can select own" ON public.budget_wallets;
DROP POLICY IF EXISTS "Budget wallets: user can insert own" ON public.budget_wallets;
DROP POLICY IF EXISTS "Budget wallets: user can update own" ON public.budget_wallets;
DROP POLICY IF EXISTS "Budget wallets: user can delete own" ON public.budget_wallets;

-- Create new specific policies for budget_wallets
CREATE POLICY "budget_wallets_select_policy"
ON public.budget_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "budget_wallets_insert_policy"
ON public.budget_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_wallets_update_policy"
ON public.budget_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_wallets_delete_policy"
ON public.budget_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- ====================
-- MAIN WALLETS
-- ====================
-- Drop ALL existing policies for main_wallets
DROP POLICY IF EXISTS "Main wallets: user access (ALL)" ON public.main_wallets;
DROP POLICY IF EXISTS "Main wallets: user can select own" ON public.main_wallets;
DROP POLICY IF EXISTS "Main wallets: user can insert own" ON public.main_wallets;
DROP POLICY IF EXISTS "Main wallets: user can update own" ON public.main_wallets;
DROP POLICY IF EXISTS "Main wallets: user can delete own" ON public.main_wallets;

-- Create new specific policies for main_wallets
CREATE POLICY "main_wallets_select_policy"
ON public.main_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "main_wallets_insert_policy"
ON public.main_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "main_wallets_update_policy"
ON public.main_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "main_wallets_delete_policy"
ON public.main_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- ====================
-- PROFILES
-- ====================
-- Drop ALL existing policies for profiles
DROP POLICY IF EXISTS "Profiles: user access (ALL)" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user can select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user can update own" ON public.profiles;

-- Create new specific policies for profiles
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
