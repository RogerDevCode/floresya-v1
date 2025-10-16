-- Migration: Add transactional function to replace product occasions
-- Author: FloresYa Dev Team
-- Date: 2025-01-15
-- Description: Creates a PostgreSQL function to atomically replace all occasions for a product

-- Drop existing function if exists
DROP FUNCTION IF EXISTS replace_product_occasions(INTEGER, INTEGER[]);

-- Create transactional function
CREATE OR REPLACE FUNCTION replace_product_occasions(
  p_product_id INTEGER,
  p_occasion_ids INTEGER[]
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  deleted_count INTEGER;
  inserted_count INTEGER;
  v_product_exists BOOLEAN;
BEGIN
  -- Validate product exists
  SELECT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) INTO v_product_exists;
  
  IF NOT v_product_exists THEN
    RAISE EXCEPTION 'Product % not found', p_product_id;
  END IF;

  -- 1. Delete all existing product_occasions for this product
  DELETE FROM product_occasions
  WHERE product_id = p_product_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- 2. Insert new occasion links (if any)
  inserted_count := 0;
  IF p_occasion_ids IS NOT NULL AND array_length(p_occasion_ids, 1) > 0 THEN
    -- Validate all occasions exist and are active
    IF EXISTS (
      SELECT 1 
      FROM unnest(p_occasion_ids) AS occ_id
      WHERE NOT EXISTS (
        SELECT 1 FROM occasions 
        WHERE id = occ_id AND is_active = true
      )
    ) THEN
      RAISE EXCEPTION 'One or more occasion IDs are invalid or inactive';
    END IF;

    -- Insert new links
    INSERT INTO product_occasions (product_id, occasion_id)
    SELECT p_product_id, unnest(p_occasion_ids);
    
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
  END IF;

  -- 3. Return detailed result
  result := json_build_object(
    'product_id', p_product_id,
    'deleted_count', deleted_count,
    'inserted_count', inserted_count,
    'occasion_ids', COALESCE(p_occasion_ids, ARRAY[]::INTEGER[]),
    'success', true,
    'message', format('Replaced occasions for product %s: deleted %s, inserted %s', 
                      p_product_id, deleted_count, inserted_count)
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback is automatic in PostgreSQL for exceptions
    RAISE EXCEPTION 'Failed to replace occasions for product %: %', p_product_id, SQLERRM;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION replace_product_occasions(INTEGER, INTEGER[]) IS 
'Transactionally replaces all occasions for a product. Deletes existing links and inserts new ones atomically. Returns JSON with operation details.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION replace_product_occasions(INTEGER, INTEGER[]) TO authenticated;
