-- Enhance transactions table to track all user activities
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS activity_type text DEFAULT 'transfer';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS related_entity_id uuid;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS related_entity_type text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Update activity_type column to have proper check constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_activity_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_activity_type_check 
CHECK (activity_type IN (
  'transfer', 'deposit', 'withdrawal', 'contribution', 
  'wallet_created', 'wallet_funded', 'wallet_withdrawal',
  'circle_created', 'circle_joined', 'circle_contribution', 'circle_withdrawal',
  'budget_created', 'budget_funded', 'budget_disbursement',
  'goal_created', 'goal_contribution', 'goal_completed',
  'send', 'receive', 'top_up', 'request_sent', 'request_received'
));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_activity_type ON transactions(activity_type);
CREATE INDEX IF NOT EXISTS idx_transactions_related_entity ON transactions(related_entity_id, related_entity_type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_mode ON transactions(sender_id, mode);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Comments
COMMENT ON COLUMN transactions.activity_type IS 'Type of activity performed (e.g., transfer, deposit, wallet_created)';
COMMENT ON COLUMN transactions.related_entity_id IS 'ID of related entity (wallet_id, circle_id, etc.)';
COMMENT ON COLUMN transactions.related_entity_type IS 'Type of related entity (budget_wallet, goal_wallet, circle)';
COMMENT ON COLUMN transactions.metadata IS 'Additional activity metadata in JSON format';
