-- Remove ONLY the old "ALL" policies that are blocking access
-- Keep the new specific policies that were properly configured

-- Drop old "ALL" policies for budget_wallets
DROP POLICY IF EXISTS "Budget wallets: user access (ALL)" ON budget_wallets;

-- Drop old "ALL" policies for goal_wallets  
DROP POLICY IF EXISTS "Goal wallets: user access (ALL)" ON goal_wallets;

-- Drop old "ALL" policies for main_wallets
DROP POLICY IF EXISTS "Main wallets: user access (ALL)" ON main_wallets;

-- Drop old "ALL" policies for profiles
DROP POLICY IF EXISTS "Profiles: user access (ALL)" ON profiles;

-- Verify that the specific policies exist and are correct
-- If they don't exist, create them

-- Budget wallets policies
DO $$
BEGIN
  -- Check if select policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'budget_wallets' 
    AND policyname = 'budget_wallets_select_policy'
  ) THEN
    CREATE POLICY budget_wallets_select_policy ON budget_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  -- Check if insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'budget_wallets' 
    AND policyname = 'budget_wallets_insert_policy'
  ) THEN
    CREATE POLICY budget_wallets_insert_policy ON budget_wallets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Check if update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'budget_wallets' 
    AND policyname = 'budget_wallets_update_policy'
  ) THEN
    CREATE POLICY budget_wallets_update_policy ON budget_wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  -- Check if delete policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'budget_wallets' 
    AND policyname = 'budget_wallets_delete_policy'
  ) THEN
    CREATE POLICY budget_wallets_delete_policy ON budget_wallets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Goal wallets policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goal_wallets' 
    AND policyname = 'goal_wallets_select_policy'
  ) THEN
    CREATE POLICY goal_wallets_select_policy ON goal_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goal_wallets' 
    AND policyname = 'goal_wallets_insert_policy'
  ) THEN
    CREATE POLICY goal_wallets_insert_policy ON goal_wallets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goal_wallets' 
    AND policyname = 'goal_wallets_update_policy'
  ) THEN
    CREATE POLICY goal_wallets_update_policy ON goal_wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'goal_wallets' 
    AND policyname = 'goal_wallets_delete_policy'
  ) THEN
    CREATE POLICY goal_wallets_delete_policy ON goal_wallets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Main wallets policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'main_wallets' 
    AND policyname = 'main_wallets_select_policy'
  ) THEN
    CREATE POLICY main_wallets_select_policy ON main_wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'main_wallets' 
    AND policyname = 'main_wallets_insert_policy'
  ) THEN
    CREATE POLICY main_wallets_insert_policy ON main_wallets
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'main_wallets' 
    AND policyname = 'main_wallets_update_policy'
  ) THEN
    CREATE POLICY main_wallets_update_policy ON main_wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'main_wallets' 
    AND policyname = 'main_wallets_delete_policy'
  ) THEN
    CREATE POLICY main_wallets_delete_policy ON main_wallets
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'profiles_select_policy'
  ) THEN
    CREATE POLICY profiles_select_policy ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'profiles_update_policy'
  ) THEN
    CREATE POLICY profiles_update_policy ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;
