-- ================================================================
-- VERIFICACIÓN SIMPLE DE RESTRICCIONES - product_occasions
-- ================================================================

-- Verificar restricciones FK existentes
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname LIKE '%product_occasions%'
  AND contype = 'f'
ORDER BY conname;

-- Verificar si existen restricciones
SELECT
    'Constraints found' AS check_type,
    COUNT(*) AS count
FROM pg_constraint
WHERE conname LIKE '%product_occasions%'
  AND contype = 'f';

-- Verificar estructura de la tabla
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'product_occasions'
ORDER BY ordinal_position;
