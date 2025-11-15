-- Fix the main_wallets unique constraint to support multiple modes per user
-- Drop the existing unique constraint on user_id alone
ALTER TABLE main_wallets DROP CONSTRAINT IF EXISTS main_wallets_user_id_key;

-- Add a new unique constraint on the combination of user_id and mode
ALTER TABLE main_wallets ADD CONSTRAINT main_wallets_user_id_mode_key UNIQUE (user_id, mode);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_main_wallets_user_mode ON main_wallets(user_id, mode);
