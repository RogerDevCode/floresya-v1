-- Create function to reset sequences in Supabase
-- Run this in Supabase SQL Editor before running seed script

CREATE OR REPLACE FUNCTION reset_sequence(sequence_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_sequence(TEXT) TO authenticated, anon;

-- Test the function (optional)
-- SELECT reset_sequence('orders_id_seq');
