-- Create a function to initialize demo data for new users
-- This is called from the auth callback to ensure users get their demo data
CREATE OR REPLACE FUNCTION create_demo_data_for_user(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_wallet_id UUID;
  budget_wallet_1_id UUID;
  budget_wallet_2_id UUID;
  goal_wallet_1_id UUID;
  goal_wallet_2_id UUID;
  circle_id UUID;
BEGIN
  -- Create demo main wallet with ₦500,000
  INSERT INTO main_wallets (user_id, balance, mode)
  VALUES (user_id_param, 500000, 'demo')
  ON CONFLICT (user_id, mode) DO NOTHING
  RETURNING id INTO demo_wallet_id;

  -- Create live main wallet with ₦0
  INSERT INTO main_wallets (user_id, balance, mode)
  VALUES (user_id_param, 0, 'live')
  ON CONFLICT (user_id, mode) DO NOTHING;

  -- Create Budget Wallet 1: Monthly Expenses
  INSERT INTO budget_wallets (
    user_id, name, balance, budget_amount, mode, icon, color
  )
  VALUES (
    user_id_param, 
    'Monthly Expenses', 
    50000, 
    100000, 
    'demo',
    'wallet',
    '#FF6B6B'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO budget_wallet_1_id;

  -- Create Budget Wallet 2: Entertainment
  INSERT INTO budget_wallets (
    user_id, name, balance, budget_amount, mode, icon, color
  )
  VALUES (
    user_id_param, 
    'Entertainment', 
    25000, 
    50000, 
    'demo',
    'film',
    '#4ECDC4'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO budget_wallet_2_id;

  -- Create Goal Wallet 1: Emergency Fund
  INSERT INTO goal_wallets (
    user_id, name, current_amount, target_amount, target_date, mode, icon, color
  )
  VALUES (
    user_id_param,
    'Emergency Fund',
    150000,
    500000,
    CURRENT_DATE + INTERVAL '6 months',
    'demo',
    'shield',
    '#95E1D3'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO goal_wallet_1_id;

  -- Create Goal Wallet 2: Vacation Savings
  INSERT INTO goal_wallets (
    user_id, name, current_amount, target_amount, target_date, mode, icon, color
  )
  VALUES (
    user_id_param,
    'Vacation Savings',
    80000,
    300000,
    CURRENT_DATE + INTERVAL '4 months',
    'demo',
    'plane',
    '#FFE66D'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO goal_wallet_2_id;

  -- Create a default circle: Family Savings Circle
  INSERT INTO circles (
    name,
    description,
    creator_id,
    target_amount,
    target_date,
    balance,
    mode,
    visibility,
    category
  )
  VALUES (
    'Family Savings Circle',
    'Saving together for our family goals',
    user_id_param,
    1000000,
    CURRENT_DATE + INTERVAL '1 year',
    250000,
    'demo',
    'private',
    'savings'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO circle_id;

  -- Add user as admin of the circle
  IF circle_id IS NOT NULL THEN
    INSERT INTO circle_members (circle_id, user_id, role, contribution_amount)
    VALUES (circle_id, user_id_param, 'admin', 250000)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Log the account creation activity
  INSERT INTO transactions (
    sender_id,
    type,
    amount,
    status,
    description,
    mode,
    activity_type,
    metadata
  )
  VALUES (
    user_id_param,
    'deposit',
    500000,
    'completed',
    'Account created with demo balance',
    'demo',
    'account_created',
    jsonb_build_object(
      'initial_balance', 500000,
      'wallets_created', jsonb_build_object(
        'budget_wallets', 2,
        'goal_wallets', 2,
        'circles', 1
      )
    )
  )
  ON CONFLICT DO NOTHING;

  RAISE LOG 'Demo data created successfully for user: %', user_id_param;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating demo data for user %: %', user_id_param, SQLERRM;
    -- Don't block the signup, just log the error
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_demo_data_for_user(UUID) TO authenticated;
