-- ============================================
-- FINAL RLS FIX - Run this script in Supabase SQL Editor
-- This removes the conflicting "ALL" policies that are blocking access
-- ============================================

-- Drop the conflicting "ALL" policies that override specific policies
DROP POLICY IF EXISTS "Budget wallets: user access (ALL)" ON budget_wallets;
DROP POLICY IF EXISTS "Goal wallets: user access (ALL)" ON goal_wallets;
DROP POLICY IF EXISTS "Main wallets: user access (ALL)" ON main_wallets;
DROP POLICY IF EXISTS "Profiles: user access (ALL)" ON profiles;

-- Verify that the specific policies exist (they should already be there)
-- If they don't exist, create them

-- PROFILES policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select'
  ) THEN
    CREATE POLICY "profiles_select" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update'
  ) THEN
    CREATE POLICY "profiles_update" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert'
  ) THEN
    CREATE POLICY "profiles_insert" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- BUDGET_WALLETS policies  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'budget_wallets' AND policyname = 'budget_wallets_select'
  ) THEN
    CREATE POLICY "budget_wallets_select" ON budget_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'budget_wallets' AND policyname = 'budget_wallets_insert'
  ) THEN
    CREATE POLICY "budget_wallets_insert" ON budget_wallets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'budget_wallets' AND policyname = 'budget_wallets_update'
  ) THEN
    CREATE POLICY "budget_wallets_update" ON budget_wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'budget_wallets' AND policyname = 'budget_wallets_delete'
  ) THEN
    CREATE POLICY "budget_wallets_delete" ON budget_wallets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- GOAL_WALLETS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'goal_wallets' AND policyname = 'goal_wallets_select'
  ) THEN
    CREATE POLICY "goal_wallets_select" ON goal_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'goal_wallets' AND policyname = 'goal_wallets_insert'
  ) THEN
    CREATE POLICY "goal_wallets_insert" ON goal_wallets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'goal_wallets' AND policyname = 'goal_wallets_update'
  ) THEN
    CREATE POLICY "goal_wallets_update" ON goal_wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'goal_wallets' AND policyname = 'goal_wallets_delete'
  ) THEN
    CREATE POLICY "goal_wallets_delete" ON goal_wallets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- MAIN_WALLETS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'main_wallets' AND policyname = 'main_wallets_select'
  ) THEN
    CREATE POLICY "main_wallets_select" ON main_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'main_wallets' AND policyname = 'main_wallets_insert'
  ) THEN
    CREATE POLICY "main_wallets_insert" ON main_wallets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'main_wallets' AND policyname = 'main_wallets_update'
  ) THEN
    CREATE POLICY "main_wallets_update" ON main_wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'main_wallets' AND policyname = 'main_wallets_delete'
  ) THEN
    CREATE POLICY "main_wallets_delete" ON main_wallets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Verification query to check that only the correct policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'budget_wallets', 'goal_wallets', 'main_wallets')
ORDER BY tablename, policyname;
