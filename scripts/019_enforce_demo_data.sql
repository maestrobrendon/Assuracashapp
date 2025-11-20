-- Function to ensure all demo data exists for a user
DROP FUNCTION IF EXISTS create_demo_data_for_user(UUID);

CREATE OR REPLACE FUNCTION create_demo_data_for_user(new_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_main_wallet_id UUID;
    circle_id UUID;
BEGIN
    -- 1. Main Wallet (Demo)
    -- Ensure it exists
    IF NOT EXISTS (SELECT 1 FROM main_wallets WHERE user_id = new_user_id AND mode = 'demo') THEN
        INSERT INTO main_wallets (user_id, balance, currency, mode, bank_name, bank_account_number)
        VALUES (new_user_id, 500000, 'NGN', 'demo', 'Demo Bank', '0000000000');
    ELSE
        -- If it exists but has 0 balance (e.g. created by trigger without funds), set to 500k
        UPDATE main_wallets 
        SET balance = 500000 
        WHERE user_id = new_user_id AND mode = 'demo' AND balance = 0;
    END IF;

    -- 2. Budget Wallets (Demo) - Create 3 defaults
    -- Monthly Expenses
    IF NOT EXISTS (SELECT 1 FROM budget_wallets WHERE user_id = new_user_id AND mode = 'demo' AND name = 'Monthly Expenses') THEN
        INSERT INTO budget_wallets (user_id, name, balance, currency, mode, purpose, auto_allocation_amount, allocation_frequency, auto_allocation_enabled)
        VALUES (new_user_id, 'Monthly Expenses', 50000, 'NGN', 'demo', 'General monthly expenses', 50000, 'monthly', true);
    END IF;

    -- Entertainment
    IF NOT EXISTS (SELECT 1 FROM budget_wallets WHERE user_id = new_user_id AND mode = 'demo' AND name = 'Entertainment') THEN
        INSERT INTO budget_wallets (user_id, name, balance, currency, mode, purpose, auto_allocation_amount, allocation_frequency, auto_allocation_enabled)
        VALUES (new_user_id, 'Entertainment', 25000, 'NGN', 'demo', 'Fun and leisure', 25000, 'monthly', true);
    END IF;

    -- Transport
    IF NOT EXISTS (SELECT 1 FROM budget_wallets WHERE user_id = new_user_id AND mode = 'demo' AND name = 'Transport') THEN
        INSERT INTO budget_wallets (user_id, name, balance, currency, mode, purpose, auto_allocation_amount, allocation_frequency, auto_allocation_enabled)
        VALUES (new_user_id, 'Transport', 20000, 'NGN', 'demo', 'Commuting costs', 20000, 'monthly', true);
    END IF;

    -- 3. Goal Wallets (Demo) - Create 3 defaults
    -- Emergency Fund
    IF NOT EXISTS (SELECT 1 FROM goal_wallets WHERE user_id = new_user_id AND mode = 'demo' AND name = 'Emergency Fund') THEN
        INSERT INTO goal_wallets (user_id, name, balance, target_amount, mode, purpose, target_date)
        VALUES (new_user_id, 'Emergency Fund', 100000, 500000, 'demo', 'For unexpected expenses', (NOW() + INTERVAL '1 year')::date);
    END IF;

    -- Vacation
    IF NOT EXISTS (SELECT 1 FROM goal_wallets WHERE user_id = new_user_id AND mode = 'demo' AND name = 'Vacation') THEN
        INSERT INTO goal_wallets (user_id, name, balance, target_amount, mode, purpose, target_date)
        VALUES (new_user_id, 'Vacation', 50000, 300000, 'demo', 'Summer trip', (NOW() + INTERVAL '6 months')::date);
    END IF;

    -- Gadgets
    IF NOT EXISTS (SELECT 1 FROM goal_wallets WHERE user_id = new_user_id AND mode = 'demo' AND name = 'Gadgets') THEN
        INSERT INTO goal_wallets (user_id, name, balance, target_amount, mode, purpose, target_date)
        VALUES (new_user_id, 'Gadgets', 20000, 150000, 'demo', 'New phone or laptop', (NOW() + INTERVAL '3 months')::date);
    END IF;

    -- 4. Circles (Demo) - Create 5 defaults
    -- Family Savings
    IF NOT EXISTS (SELECT 1 FROM circles WHERE created_by = new_user_id AND mode = 'demo' AND name = 'Family Savings') THEN
        INSERT INTO circles (created_by, name, description, target_amount, current_balance, mode, category, visibility, max_members)
        VALUES (new_user_id, 'Family Savings', 'Saving together for family goals', 1000000, 0, 'demo', 'Savings', 'private', 10)
        RETURNING id INTO circle_id;

        INSERT INTO circle_members (circle_id, user_id, role, mode, total_contributed)
        VALUES (circle_id, new_user_id, 'admin', 'demo', 0);
    END IF;

    -- Friends Group
    IF NOT EXISTS (SELECT 1 FROM circles WHERE created_by = new_user_id AND mode = 'demo' AND name = 'Friends Group') THEN
        INSERT INTO circles (created_by, name, description, target_amount, current_balance, mode, category, visibility, max_members)
        VALUES (new_user_id, 'Friends Group', 'Fun money with friends', 500000, 0, 'demo', 'Social', 'private', 20)
        RETURNING id INTO circle_id;

        INSERT INTO circle_members (circle_id, user_id, role, mode, total_contributed)
        VALUES (circle_id, new_user_id, 'admin', 'demo', 0);
    END IF;

    -- Office Colleagues
    IF NOT EXISTS (SELECT 1 FROM circles WHERE created_by = new_user_id AND mode = 'demo' AND name = 'Office Colleagues') THEN
        INSERT INTO circles (created_by, name, description, target_amount, current_balance, mode, category, visibility, max_members)
        VALUES (new_user_id, 'Office Colleagues', 'Lunch and events fund', 200000, 0, 'demo', 'Work', 'private', 15)
        RETURNING id INTO circle_id;

        INSERT INTO circle_members (circle_id, user_id, role, mode, total_contributed)
        VALUES (circle_id, new_user_id, 'admin', 'demo', 0);
    END IF;

    -- Investment Club
    IF NOT EXISTS (SELECT 1 FROM circles WHERE created_by = new_user_id AND mode = 'demo' AND name = 'Investment Club') THEN
        INSERT INTO circles (created_by, name, description, target_amount, current_balance, mode, category, visibility, max_members)
        VALUES (new_user_id, 'Investment Club', 'Pooling funds for investment', 5000000, 0, 'demo', 'Investment', 'private', 50)
        RETURNING id INTO circle_id;

        INSERT INTO circle_members (circle_id, user_id, role, mode, total_contributed)
        VALUES (circle_id, new_user_id, 'admin', 'demo', 0);
    END IF;

    -- Holiday Trip
    IF NOT EXISTS (SELECT 1 FROM circles WHERE created_by = new_user_id AND mode = 'demo' AND name = 'Holiday Trip') THEN
        INSERT INTO circles (created_by, name, description, target_amount, current_balance, mode, category, visibility, max_members)
        VALUES (new_user_id, 'Holiday Trip', 'Saving for the big trip', 1500000, 0, 'demo', 'Travel', 'private', 8)
        RETURNING id INTO circle_id;

        INSERT INTO circle_members (circle_id, user_id, role, mode, total_contributed)
        VALUES (circle_id, new_user_id, 'admin', 'demo', 0);
    END IF;

END;
$$;
