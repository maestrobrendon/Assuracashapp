-- Add 5 diverse sample circles with members and transactions
DO $$
DECLARE
  user_id_var uuid;
  circle1_id uuid;
  circle2_id uuid;
  circle3_id uuid;
  circle4_id uuid;
  circle5_id uuid;
BEGIN
  -- Get current authenticated user ID
  SELECT user_id INTO user_id_var FROM public.profiles ORDER BY created_at DESC LIMIT 1;

  IF user_id_var IS NULL THEN
    SELECT id INTO user_id_var FROM auth.users ORDER BY created_at DESC LIMIT 1;
  END IF;

  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'No users found. Please register a user first.';
  END IF;

  RAISE NOTICE 'Creating circles for user: %', user_id_var;

  -- Circle 1: Family Vacation Fund
  INSERT INTO circles (
    id, name, description, purpose, category, 
    visibility, current_balance, target_amount, 
    member_count, created_by, allow_external_contributions,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(), 
    'Family Vacation Fund',
    'Saving together for our December holiday in Dubai',
    'Pool funds for luxury family vacation including flights, hotels, and activities',
    'Group Savings',
    'private',
    420000,
    1500000,
    5,
    user_id_var,
    false,
    NOW() - INTERVAL '7 months',
    NOW()
  ) RETURNING id INTO circle1_id;

  INSERT INTO circle_members (id, circle_id, user_id, role, total_contributed, joined_at)
  VALUES (gen_random_uuid(), circle1_id, user_id_var, 'admin', 120000, NOW() - INTERVAL '7 months');

  INSERT INTO circle_transactions (id, circle_id, user_id, type, amount, description, status, created_at)
  VALUES 
    (gen_random_uuid(), circle1_id, user_id_var, 'contribution', 50000, 'January contribution', 'completed', NOW() - INTERVAL '5 days'),
    (gen_random_uuid(), circle1_id, user_id_var, 'contribution', 40000, 'December contribution', 'completed', NOW() - INTERVAL '1 month'),
    (gen_random_uuid(), circle1_id, user_id_var, 'contribution', 30000, 'November contribution', 'completed', NOW() - INTERVAL '2 months');

  -- Circle 2: University Friends Investment Club
  INSERT INTO circles (
    id, name, description, purpose, category, 
    visibility, current_balance, target_amount, 
    member_count, created_by, allow_external_contributions,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Unilag Alumni Investment Club',
    'Monthly investment contributions for collective wealth building',
    'Pool resources to invest in stocks, mutual funds, and real estate opportunities together',
    'Investment Pool',
    'private',
    2850000,
    5000000,
    12,
    user_id_var,
    false,
    NOW() - INTERVAL '1 year',
    NOW()
  ) RETURNING id INTO circle2_id;

  INSERT INTO circle_members (id, circle_id, user_id, role, total_contributed, joined_at)
  VALUES (gen_random_uuid(), circle2_id, user_id_var, 'admin', 250000, NOW() - INTERVAL '1 year');

  INSERT INTO circle_transactions (id, circle_id, user_id, type, amount, description, status, created_at)
  VALUES 
    (gen_random_uuid(), circle2_id, user_id_var, 'contribution', 25000, 'January monthly contribution', 'completed', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), circle2_id, user_id_var, 'contribution', 25000, 'December monthly contribution', 'completed', NOW() - INTERVAL '1 month'),
    (gen_random_uuid(), circle2_id, user_id_var, 'withdrawal', 500000, 'Invested in Dangote Cement shares', 'completed', NOW() - INTERVAL '2 months');

  -- Circle 3: Emergency Medical Fund
  INSERT INTO circles (
    id, name, description, purpose, category, 
    visibility, current_balance, target_amount, 
    member_count, created_by, allow_external_contributions,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Tunde''s Medical Emergency Fund',
    'Help Tunde cover urgent surgery expenses',
    'Community fundraiser to support Tunde Ogunleye with medical bills for emergency surgery',
    'Medical/Emergency',
    'public',
    780000,
    2000000,
    47,
    user_id_var,
    true,
    NOW() - INTERVAL '3 weeks',
    NOW()
  ) RETURNING id INTO circle3_id;

  INSERT INTO circle_members (id, circle_id, user_id, role, total_contributed, joined_at)
  VALUES (gen_random_uuid(), circle3_id, user_id_var, 'admin', 50000, NOW() - INTERVAL '3 weeks');

  INSERT INTO circle_transactions (id, circle_id, user_id, type, amount, description, status, created_at)
  VALUES 
    (gen_random_uuid(), circle3_id, user_id_var, 'contribution', 50000, 'Initial donation', 'completed', NOW() - INTERVAL '3 weeks'),
    (gen_random_uuid(), circle3_id, user_id_var, 'contribution', 15000, 'Additional support', 'completed', NOW() - INTERVAL '1 week');

  -- Circle 4: Wedding Aso-Ebi Group
  INSERT INTO circles (
    id, name, description, purpose, category, 
    visibility, current_balance, target_amount, 
    member_count, created_by, allow_external_contributions,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Kemi & Segun Wedding - Aso-Ebi',
    'Pooling funds for matching Aso-Ebi and coordination',
    'Collective purchase of premium Aso-Ebi materials, tailoring, and gele for the wedding party',
    'Events',
    'private',
    560000,
    750000,
    15,
    user_id_var,
    false,
    NOW() - INTERVAL '2 months',
    NOW()
  ) RETURNING id INTO circle4_id;

  INSERT INTO circle_members (id, circle_id, user_id, role, total_contributed, joined_at)
  VALUES (gen_random_uuid(), circle4_id, user_id_var, 'moderator', 40000, NOW() - INTERVAL '2 months');

  INSERT INTO circle_transactions (id, circle_id, user_id, type, amount, description, status, created_at)
  VALUES 
    (gen_random_uuid(), circle4_id, user_id_var, 'contribution', 40000, 'Aso-Ebi and tailoring contribution', 'completed', NOW() - INTERVAL '1 month');

  -- Circle 5: Small Business Co-op
  INSERT INTO circles (
    id, name, description, purpose, category, 
    visibility, current_balance, target_amount, 
    member_count, created_by, allow_external_contributions,
    created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    'Tejuosho Market Traders Esusu',
    'Rotating savings and credit for market traders',
    'Weekly contribution pool where members take turns collecting the total sum for business expansion',
    'Ajo/Esusu',
    'private',
    320000,
    400000,
    8,
    user_id_var,
    false,
    NOW() - INTERVAL '6 months',
    NOW()
  ) RETURNING id INTO circle5_id;

  INSERT INTO circle_members (id, circle_id, user_id, role, total_contributed, joined_at)
  VALUES (gen_random_uuid(), circle5_id, user_id_var, 'member', 80000, NOW() - INTERVAL '6 months');

  INSERT INTO circle_transactions (id, circle_id, user_id, type, amount, description, status, created_at)
  VALUES 
    (gen_random_uuid(), circle5_id, user_id_var, 'contribution', 10000, 'Weekly contribution', 'completed', NOW() - INTERVAL '2 days'),
    (gen_random_uuid(), circle5_id, user_id_var, 'contribution', 10000, 'Weekly contribution', 'completed', NOW() - INTERVAL '1 week'),
    (gen_random_uuid(), circle5_id, user_id_var, 'contribution', 10000, 'Weekly contribution', 'completed', NOW() - INTERVAL '2 weeks');

  RAISE NOTICE 'Successfully created 5 sample circles!';
  RAISE NOTICE 'Circle IDs: %, %, %, %, %', circle1_id, circle2_id, circle3_id, circle4_id, circle5_id;
END $$;
