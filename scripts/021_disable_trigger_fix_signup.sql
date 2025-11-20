-- IMMEDIATELY DISABLE THE BLOCKING TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ensure the function exists with the correct parameter name
CREATE OR REPLACE FUNCTION public.create_demo_data_for_user(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_demo_main_wallet_id UUID;
  v_live_main_wallet_id UUID;
  v_demo_transaction_id UUID;
BEGIN
  -- Log execution
  RAISE NOTICE 'Creating demo data for user: %', p_user_id;

  -- 1. Create DEMO main wallet with 500,000 balance
  INSERT INTO public.main_wallets (user_id, balance, mode)
  VALUES (p_user_id, 500000.00, 'demo')
  ON CONFLICT (user_id, mode) 
  DO UPDATE SET balance = CASE 
    WHEN main_wallets.balance = 0 THEN 500000.00 
    ELSE main_wallets.balance 
  END
  RETURNING id INTO v_demo_main_wallet_id;

  -- 2. Create LIVE main wallet with 0 balance
  INSERT INTO public.main_wallets (user_id, balance, mode)
  VALUES (p_user_id, 0, 'live')
  ON CONFLICT (user_id, mode) DO NOTHING
  RETURNING id INTO v_live_main_wallet_id;

  -- 3. Create initial demo transaction
  IF v_demo_main_wallet_id IS NOT NULL THEN
    INSERT INTO public.transactions (
      sender_id, 
      receiver_id, 
      amount, 
      type, 
      description, 
      mode, 
      activity_type,
      status
    )
    VALUES (
      p_user_id,
      p_user_id,
      500000.00,
      'deposit',
      'Welcome bonus - Demo account funding',
      'demo',
      'wallet',
      'completed'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_demo_transaction_id;
  END IF;

  -- 4. Create 3 budget wallets in demo mode
  INSERT INTO public.budget_wallets (user_id, name, balance, spend_limit, mode)
  VALUES 
    (p_user_id, 'Monthly Expenses', 50000.00, 50000.00, 'demo'),
    (p_user_id, 'Entertainment', 25000.00, 25000.00, 'demo'),
    (p_user_id, 'Transport', 15000.00, 15000.00, 'demo')
  ON CONFLICT (user_id, name, mode) DO NOTHING;

  -- 5. Create 3 goal wallets in demo mode
  INSERT INTO public.goal_wallets (user_id, name, balance, target_amount, target_date, mode)
  VALUES 
    (p_user_id, 'Emergency Fund', 100000.00, 500000.00, NOW() + INTERVAL '6 months', 'demo'),
    (p_user_id, 'Vacation', 50000.00, 200000.00, NOW() + INTERVAL '3 months', 'demo'),
    (p_user_id, 'Gadgets', 30000.00, 150000.00, NOW() + INTERVAL '2 months', 'demo')
  ON CONFLICT (user_id, name, mode) DO NOTHING;

  -- 6. Create 5 default circles in demo mode
  INSERT INTO public.circles (name, description, current_balance, member_count, mode, created_by)
  SELECT 
    circle_name,
    circle_description,
    circle_balance,
    1,
    'demo',
    p_user_id
  FROM (VALUES 
    ('Family Savings', 'Save together as a family', 50000.00),
    ('Friends Group', 'Weekend hangouts fund', 30000.00),
    ('Office Colleagues', 'Team lunch savings', 20000.00),
    ('Investment Club', 'Group investment pool', 100000.00),
    ('Holiday Trip', 'Annual vacation fund', 75000.00)
  ) AS circles(circle_name, circle_description, circle_balance)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.circles c
    INNER JOIN public.circle_members cm ON c.id = cm.circle_id
    WHERE cm.user_id = p_user_id 
      AND c.name = circle_name
      AND c.mode = 'demo'
  )
  RETURNING id;

  -- 7. Add user as admin to all their circles
  INSERT INTO public.circle_members (circle_id, user_id, role, mode)
  SELECT c.id, p_user_id, 'admin', 'demo'
  FROM public.circles c
  WHERE c.created_by = p_user_id 
    AND c.mode = 'demo'
  ON CONFLICT (circle_id, user_id, mode) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating demo data for user %: %', p_user_id, SQLERRM;
END;
$$;
