-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;

-- Create new comprehensive RLS policies for user_settings table
CREATE POLICY "Users can view own settings"
ON user_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON user_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
