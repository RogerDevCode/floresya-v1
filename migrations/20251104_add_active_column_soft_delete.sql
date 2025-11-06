-- ================================================================
-- SOFT DELETE MIGRATION - Phase 2
-- Date: 2025-11-04
-- Purpose: Standardize active/soft-delete columns across all tables
-- ================================================================

DO $$
BEGIN

-- Log migration start
RAISE NOTICE '=== MIGRACIÓN FASE 2: SOFT DELETE INICIADA ===';

-- ================================================================
-- PART 1: RENAME is_active → active (4 tables)
-- ================================================================

RAISE NOTICE 'Parte 1: Renombrando is_active → active';

-- 1. users table
BEGIN
  ALTER TABLE users RENAME COLUMN is_active TO active;
  RAISE NOTICE '✓ users: is_active → active';
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE '⚠ users: is_active no existe (saltando)';
END;

-- 2. occasions table
BEGIN
  ALTER TABLE occasions RENAME COLUMN is_active TO active;
  RAISE NOTICE '✓ occasions: is_active → active';
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE '⚠ occasions: is_active no existe (saltando)';
END;

-- 3. payment_methods table
BEGIN
  ALTER TABLE payment_methods RENAME COLUMN is_active TO active;
  RAISE NOTICE '✓ payment_methods: is_active → active';
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE '⚠ payment_methods: is_active no existe (saltando)';
END;

-- 4. settings table
BEGIN
  ALTER TABLE settings RENAME COLUMN is_active TO active;
  RAISE NOTICE '✓ settings: is_active → active';
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE '⚠ settings: is_active no existe (saltando)';
END;

-- ================================================================
-- PART 2: ADD active COLUMN (8 tables)
-- ================================================================

RAISE NOTICE 'Parte 2: Agregando columna active';

-- 5. orders table
BEGIN
  ALTER TABLE orders ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ orders: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ orders: active ya existe (saltando)';
END;

-- 6. payments table
BEGIN
  ALTER TABLE payments ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ payments: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ payments: active ya existe (saltando)';
END;

-- 7. product_images table
BEGIN
  ALTER TABLE product_images ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ product_images: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ product_images: active ya existe (saltando)';
END;

-- 8. product_occasions table
BEGIN
  ALTER TABLE product_occasions ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ product_occasions: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ product_occasions: active ya existe (saltando)';
END;

-- 9. order_items table
BEGIN
  ALTER TABLE order_items ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ order_items: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ order_items: active ya existe (saltando)';
END;

-- 10. order_status_history table
BEGIN
  ALTER TABLE order_status_history ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ order_status_history: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ order_status_history: active ya existe (saltando)';
END;

-- 11. busquedas_log table
BEGIN
  ALTER TABLE busquedas_log ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ busquedas_log: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ busquedas_log: active ya existe (saltando)';
END;

-- 12. query_timeouts_log table
BEGIN
  ALTER TABLE query_timeouts_log ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  RAISE NOTICE '✓ query_timeouts_log: columna active agregada';
EXCEPTION
  WHEN duplicate_column THEN
    RAISE NOTICE '⚠ query_timeouts_log: active ya existe (saltando)';
END;

-- ================================================================
-- PART 3: ADD INDEXES FOR PERFORMANCE
-- ================================================================

RAISE NOTICE 'Parte 3: Agregando índices para performance';

-- Índices para consultas de soft-delete
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_occasions_active ON occasions(active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(active);
CREATE INDEX IF NOT EXISTS idx_settings_active ON settings(active);
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(active);
CREATE INDEX IF NOT EXISTS idx_payments_active ON payments(active);
CREATE INDEX IF NOT EXISTS idx_product_images_active ON product_images(active);
CREATE INDEX IF NOT EXISTS idx_product_occasions_active ON product_occasions(active);
CREATE INDEX IF NOT EXISTS idx_order_items_active ON order_items(active);
CREATE INDEX IF NOT EXISTS idx_order_status_history_active ON order_status_history(active);
CREATE INDEX IF NOT EXISTS idx_busquedas_log_active ON busquedas_log(active);
CREATE INDEX IF NOT EXISTS idx_query_timeouts_log_active ON query_timeouts_log(active);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

RAISE NOTICE '✓ Índices agregados';

-- ================================================================
-- PART 4: VERIFICATION
-- ================================================================

RAISE NOTICE 'Parte 4: Verificación';

-- Verificar que todas las tablas tienen la columna active
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT information_schema.columns.table_name)
  INTO table_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'active'
    AND information_schema.columns.table_name IN (
      'users', 'occasions', 'payment_methods', 'settings',
      'orders', 'payments', 'product_images', 'product_occasions',
      'order_items', 'order_status_history', 'busquedas_log',
      'query_timeouts_log', 'products'
    );

  RAISE NOTICE 'Tablas con columna active: %/13', table_count;

  IF table_count < 12 THEN
    RAISE WARNING 'Esperado: 12+ tablas con columna active';
  ELSE
    RAISE NOTICE '✓ Verificación exitosa: % tablas con columna active', table_count;
  END IF;
END;

-- Log migration completion
RAISE NOTICE '';
RAISE NOTICE '=== MIGRACIÓN FASE 2: SOFT DELETE COMPLETADA ===';
RAISE NOTICE 'Resumen:';
RAISE NOTICE '  - 4 columnas renombradas: is_active → active';
RAISE NOTICE '  - 8 columnas agregadas: active';
RAISE NOTICE '  - 13 índices de performance creados';
RAISE NOTICE '';
RAISE NOTICE 'PRÓXIMO PASO: Ejecutar refactoring del código';
RAISE NOTICE '  bash scripts/refactoring/rename_is_active_to_active.sh';
RAISE NOTICE '';

END $$;
