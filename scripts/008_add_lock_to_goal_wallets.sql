-- Add lock fields to goal_wallets table
ALTER TABLE goal_wallets
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lock_duration_days INTEGER;

-- Add comment for clarity
COMMENT ON COLUMN goal_wallets.is_locked IS 'Indicates if the goal wallet is currently locked';
COMMENT ON COLUMN goal_wallets.locked IS 'Redundant field for backward compatibility';
COMMENT ON COLUMN goal_wallets.lock_until IS 'The timestamp until which the wallet is locked';
COMMENT ON COLUMN goal_wallets.lock_duration_days IS 'The duration in days for which the wallet is locked';
