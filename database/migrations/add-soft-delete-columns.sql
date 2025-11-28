-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ADD SOFT DELETE COLUMNS TO MISSING TABLES
-- Date: 2025-11-26
-- 
-- Fixes schema validation issues for soft delete operations
-- Adds active column and audit trail support to tables that are missing them
--
-- Tables being updated:
-- - expenses
-- - order_items  
-- - orders
-- - payments
-- - product_images
-- - query_timeouts_log
--
-- Security Level: WARN → FIXED
-- Category: SCHEMA VALIDATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- EXPENSES TABLE
-- ================================================================

-- Add basic soft delete support
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Add audit trail columns
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS deletion_ip TEXT;

-- Add reactivation support
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_active ON public.expenses(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at ON public.expenses(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_reactivated_at ON public.expenses(reactivated_at) WHERE reactivated_at IS NOT NULL;

-- ================================================================
-- ORDER_ITEMS TABLE
-- ================================================================

-- Add basic soft delete support
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Add audit trail columns
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS deletion_ip TEXT;

-- Add reactivation support
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_active ON public.order_items(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_order_items_deleted_at ON public.order_items(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_reactivated_at ON public.order_items(reactivated_at) WHERE reactivated_at IS NOT NULL;

-- ================================================================
-- ORDERS TABLE
-- ================================================================

-- Add basic soft delete support
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Add audit trail columns
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deletion_ip TEXT;

-- Add reactivation support
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_active ON public.orders(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON public.orders(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_reactivated_at ON public.orders(reactivated_at) WHERE reactivated_at IS NOT NULL;

-- ================================================================
-- PAYMENTS TABLE
-- ================================================================

-- Add basic soft delete support
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Add audit trail columns
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS deletion_ip TEXT;

-- Add reactivation support
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_active ON public.payments(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_payments_deleted_at ON public.payments(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_reactivated_at ON public.payments(reactivated_at) WHERE reactivated_at IS NOT NULL;

-- ================================================================
-- PRODUCT_IMAGES TABLE
-- ================================================================

-- Add basic soft delete support
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Add audit trail columns
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS deletion_ip TEXT;

-- Add reactivation support
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_active ON public.product_images(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_product_images_deleted_at ON public.product_images(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_images_reactivated_at ON public.product_images(reactivated_at) WHERE reactivated_at IS NOT NULL;

-- ================================================================
-- QUERY_TIMEOUTS_LOG TABLE
-- ================================================================

-- Add basic soft delete support
ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true NOT NULL;

-- Add audit trail columns
ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS deleted_by INTEGER;

ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS deletion_ip TEXT;

-- Add reactivation support
ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.query_timeouts_log 
ADD COLUMN IF NOT EXISTS reactivated_by INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_timeouts_log_active ON public.query_timeouts_log(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_query_timeouts_log_deleted_at ON public.query_timeouts_log(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_query_timeouts_log_reactivated_at ON public.query_timeouts_log(reactivated_at) WHERE reactivated_at IS NOT NULL;

-- ================================================================
-- UPDATE ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Update RLS policies for tables that now have active column

-- Orders RLS policy update
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id AND active = true
  );

-- Order items RLS policy update  
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
      AND orders.active = true
    )
    AND order_items.active = true
  );

-- Payments RLS policy update (if applicable)
-- Note: Add RLS policies for payments table if needed

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify all tables now have soft delete support
SELECT 
  t.table_name,
  CASE WHEN c.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END as has_active_column,
  CASE WHEN c.column_name IS NOT NULL THEN 'SOFT DELETE ENABLED' ELSE 'SOFT DELETE MISSING' END as status
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.column_name = 'active'
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('expenses', 'order_items', 'orders', 'payments', 'product_images', 'query_timeouts_log')
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- Expected output:
-- table_name      | has_active_column | status
-- ----------------+------------------+------------------
-- expenses       | YES              | SOFT DELETE ENABLED
-- order_items     | YES              | SOFT DELETE ENABLED  
-- orders          | YES              | SOFT DELETE ENABLED
-- payments        | YES              | SOFT DELETE ENABLED
-- product_images  | YES              | SOFT DELETE ENABLED
-- query_timeouts_log | YES       | SOFT DELETE ENABLED

-- ================================================================
-- AUDIT TRIGGERS FOR COMPREHENSIVE AUDITING
-- ================================================================

-- Create audit function if not exists
CREATE OR REPLACE FUNCTION public.soft_delete_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Log soft delete operations
  IF TG_OP = 'UPDATE' AND OLD.active = true AND NEW.active = false THEN
    INSERT INTO public.audit_log (
      table_name, 
      operation, 
      record_id, 
      old_data, 
      new_data, 
      user_id, 
      ip_address,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      'SOFT_DELETE',
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      NEW.deleted_by,
      NEW.deletion_ip,
      NOW()
    );
  END IF;

  -- Log reactivation operations
  IF TG_OP = 'UPDATE' AND OLD.active = false AND NEW.active = true THEN
    INSERT INTO public.audit_log (
      table_name, 
      operation, 
      record_id, 
      old_data, 
      new_data, 
      user_id, 
      ip_address,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      'REACTIVATE',
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW),
      NEW.reactivated_by,
      NULL,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit_log table if not exists
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id INTEGER,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_operation ON public.audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_log_record_id ON public.audit_log(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- Apply triggers to all tables with soft delete
CREATE TRIGGER expenses_soft_delete_audit
  AFTER UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_audit_trigger();

CREATE TRIGGER order_items_soft_delete_audit
  AFTER UPDATE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_audit_trigger();

CREATE TRIGGER orders_soft_delete_audit
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_audit_trigger();

CREATE TRIGGER payments_soft_delete_audit
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_audit_trigger();

CREATE TRIGGER product_images_soft_delete_audit
  AFTER UPDATE ON public.product_images
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_audit_trigger();

CREATE TRIGGER query_timeouts_log_soft_delete_audit
  AFTER UPDATE ON public.query_timeouts_log
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_audit_trigger();

COMMENT ON TABLE public.audit_log IS 'Comprehensive audit trail for soft delete and reactivation operations';
COMMENT ON FUNCTION public.soft_delete_audit_trigger() IS 'Audit trigger for soft delete operations across all tables';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MIGRATION COMPLETE
-- 
-- All tables now support soft delete operations with:
-- - Basic active column support
-- - Full audit trail (deleted_at, deleted_by, deletion_reason, deletion_ip)
-- - Reactivation support (reactivated_at, reactivated_by)
-- - Performance indexes
-- - Comprehensive audit logging
-- - Updated RLS policies
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━