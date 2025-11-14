-- =====================================================
-- FINAL COMPREHENSIVE RLS FIX FOR ASSURA CASH
-- This script completely removes all existing policies
-- and creates fresh, working policies for all tables
-- =====================================================

-- Drop ALL existing RLS policies to start fresh
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Profiles: user access (ALL)" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Main wallets policies  
DROP POLICY IF EXISTS "Main wallets: user access (ALL)" ON public.main_wallets;
DROP POLICY IF EXISTS "main_wallets_select_policy" ON public.main_wallets;
DROP POLICY IF EXISTS "main_wallets_insert_policy" ON public.main_wallets;
DROP POLICY IF EXISTS "main_wallets_update_policy" ON public.main_wallets;
DROP POLICY IF EXISTS "main_wallets_delete_policy" ON public.main_wallets;

-- Budget wallets policies
DROP POLICY IF EXISTS "Budget wallets: user access (ALL)" ON public.budget_wallets;
DROP POLICY IF EXISTS "budget_wallets_select_policy" ON public.budget_wallets;
DROP POLICY IF EXISTS "budget_wallets_insert_policy" ON public.budget_wallets;
DROP POLICY IF EXISTS "budget_wallets_update_policy" ON public.budget_wallets;
DROP POLICY IF EXISTS "budget_wallets_delete_policy" ON public.budget_wallets;

-- Goal wallets policies
DROP POLICY IF EXISTS "Goal wallets: user access (ALL)" ON public.goal_wallets;
DROP POLICY IF EXISTS "goal_wallets_select_policy" ON public.goal_wallets;
DROP POLICY IF EXISTS "goal_wallets_insert_policy" ON public.goal_wallets;
DROP POLICY IF EXISTS "goal_wallets_update_policy" ON public.goal_wallets;
DROP POLICY IF EXISTS "goal_wallets_delete_policy" ON public.goal_wallets;

-- Create fresh, working RLS policies
-- =====================================================

-- PROFILES TABLE
-- =====================================================
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- MAIN WALLETS TABLE
-- =====================================================
CREATE POLICY "main_wallets_select"
  ON public.main_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "main_wallets_insert"
  ON public.main_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "main_wallets_update"
  ON public.main_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "main_wallets_delete"
  ON public.main_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- BUDGET WALLETS TABLE
-- =====================================================
CREATE POLICY "budget_wallets_select"
  ON public.budget_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "budget_wallets_insert"
  ON public.budget_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_wallets_update"
  ON public.budget_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_wallets_delete"
  ON public.budget_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- GOAL WALLETS TABLE
-- =====================================================
CREATE POLICY "goal_wallets_select"
  ON public.goal_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "goal_wallets_insert"
  ON public.goal_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goal_wallets_update"
  ON public.goal_wallets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goal_wallets_delete"
  ON public.goal_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- Verify RLS is enabled on all tables
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_wallets ENABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All RLS policies have been reset and configured correctly!';
  RAISE NOTICE '✅ Users can now access their own data securely.';
END $$;
