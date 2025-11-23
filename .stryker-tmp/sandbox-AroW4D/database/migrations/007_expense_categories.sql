-- ============================================================================
-- Migration 007: Expense Categories Management
-- ============================================================================
-- Description: Add expense_categories table for customizable categories
-- Date: 2025-11-19
-- Author: FloresYa Dev Team
-- ============================================================================

-- 1. Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon class name
  color VARCHAR(20), -- hex color for UI
  is_default BOOLEAN DEFAULT FALSE, -- system defaults cannot be deleted
  active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add index for active categories lookup
CREATE INDEX idx_expense_categories_active ON expense_categories(active) WHERE active = TRUE;

-- 3. Insert default categories
INSERT INTO expense_categories (name, description, icon, color, is_default, active) VALUES
  ('flores', 'Compra de flores y plantas', '🌸', '#ec4899', TRUE, TRUE),
  ('transporte', 'Gastos de envío y logística', '🚚', '#3b82f6', TRUE, TRUE),
  ('empaque', 'Materiales de embalaje', '📦', '#8b5cf6', TRUE, TRUE),
  ('personal', 'Salarios y beneficios', '👥', '#10b981', TRUE, TRUE),
  ('servicios', 'Servicios públicos y alquiler', '💡', '#f59e0b', TRUE, TRUE),
  ('marketing', 'Publicidad y promoción', '📢', '#ef4444', TRUE, TRUE),
  ('otros', 'Gastos varios', '🔧', '#6b7280', TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Add foreign key to expenses table
ALTER TABLE expenses 
  DROP CONSTRAINT IF EXISTS fk_expenses_category,
  ADD CONSTRAINT fk_expenses_category 
  FOREIGN KEY (category) 
  REFERENCES expense_categories(name) 
  ON UPDATE CASCADE;

-- 5. RLS Policies for expense_categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY admin_all_expense_categories ON expense_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::integer 
      AND users.role = 'admin'
    )
  );

-- Everyone can view active categories (for dropdown lists)
CREATE POLICY view_active_expense_categories ON expense_categories
  FOR SELECT
  USING (active = TRUE);

-- 6. Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_expense_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_expense_categories_timestamp();

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
-- To rollback this migration:
-- 1. ALTER TABLE expenses DROP CONSTRAINT fk_expenses_category;
-- 2. DROP TABLE expense_categories CASCADE;
