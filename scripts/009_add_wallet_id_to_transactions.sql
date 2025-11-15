-- Add wallet_id column to transactions table to track which wallet the transaction belongs to
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS wallet_id uuid;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);

-- Add comment to explain the column
COMMENT ON COLUMN transactions.wallet_id IS 'Reference to the wallet (budget/goal) this transaction belongs to';
