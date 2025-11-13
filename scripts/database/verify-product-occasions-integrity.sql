-- ====================================================================
-- VERIFICACIÓN DE INTEGRIDAD REFERENCIAL - TABLA product_occasions
-- ====================================================================
-- Este script verifica que no existen registros huérfanos en la tabla
-- product_occasions y aplica restricciones de clave foránea si no existen.
-- ====================================================================

-- Configurar formato de salida
\echo '==========================================='
\echo 'VERIFICACIÓN DE INTEGRIDAD - product_occasions'
\echo '==========================================='
\echo ''

-- ====================================================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
-- ====================================================================
\echo '1. ESTRUCTURA DE LA TABLA:'
\echo '---'
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'product_occasions'
ORDER BY ordinal_position;
\echo ''

-- ====================================================================
-- 2. VERIFICAR RESTRICCIONES DE CLAVE FORÁNEA EXISTENTES
-- ====================================================================
\echo '2. RESTRICCIONES DE CLAVE FORÁNEA:'
\echo '---'
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname LIKE '%product_occasions%'
  AND contype = 'f';
\echo ''

-- ====================================================================
-- 3. CONTEO TOTAL DE REGISTROS
-- ====================================================================
\echo '3. CONTEO TOTAL DE REGISTROS:'
\echo '---'
SELECT COUNT(*) AS total_records FROM product_occasions;
\echo ''

-- ====================================================================
-- 4. BUSCAR REGISTROS HUÉRFANOS - PRODUCTOS
-- ====================================================================
\echo '4. REGISTROS HUÉRFANOS - product_id que no existe en products:'
\echo '---'
SELECT
    po.product_id,
    COUNT(*) AS count
FROM product_occasions po
LEFT JOIN products p ON po.product_id = p.id
WHERE p.id IS NULL
GROUP BY po.product_id;

-- Contar registros huérfanos por producto
SELECT
    'Product orphans count' AS check_name,
    COUNT(*) AS orphan_count
FROM product_occasions po
LEFT JOIN products p ON po.product_id = p.id
WHERE p.id IS NULL;
\echo ''

-- ====================================================================
-- 5. BUSCAR REGISTROS HUÉRFANOS - OCASIONES
-- ====================================================================
\echo '5. REGISTROS HUÉRFANOS - occasion_id que no existe en occasions:'
\echo '---'
SELECT
    po.occasion_id,
    COUNT(*) AS count
FROM product_occasions po
LEFT JOIN occasions o ON po.occasion_id = o.id
WHERE o.id IS NULL
GROUP BY po.occasion_id;

-- Contar registros huérfanos por ocasión
SELECT
    'Occasion orphans count' AS check_name,
    COUNT(*) AS orphan_count
FROM product_occasions po
LEFT JOIN occasions o ON po.occasion_id = o.id
WHERE o.id IS NULL;
\echo ''

-- ====================================================================
-- 6. VERIFICAR DUPLICADOS
-- ====================================================================
\echo '6. VERIFICAR DUPLICADOS (product_id, occasion_id):'
\echo '---'
SELECT
    product_id,
    occasion_id,
    COUNT(*) AS duplicate_count
FROM product_occasions
GROUP BY product_id, occasion_id
HAVING COUNT(*) > 1;

-- Contar duplicados totales
SELECT
    'Duplicate pairs count' AS check_name,
    COUNT(*) AS duplicate_count
FROM (
    SELECT product_id, occasion_id
    FROM product_occasions
    GROUP BY product_id, occasion_id
    HAVING COUNT(*) > 1
) AS duplicates;
\echo ''

-- ====================================================================
-- 7. VERIFICAR PRODUCTOS SIN OCASIONES
-- ====================================================================
\echo '7. PRODUCTOS QUE TIENEN 0 OCASIONES:'
\echo '---'
SELECT
    p.id,
    p.name,
    p.active AS product_active
FROM products p
LEFT JOIN product_occasions po ON p.id = po.product_id
WHERE po.id IS NULL
  AND p.active = true
LIMIT 10;

SELECT
    'Products without occasions' AS check_name,
    COUNT(*) AS count
FROM products p
LEFT JOIN product_occasions po ON p.id = po.product_id
WHERE po.id IS NULL
  AND p.active = true;
\echo ''

-- ====================================================================
-- 8. VERIFICAR OCASIONES SIN PRODUCTOS
-- ====================================================================
\echo '8. OCASIONES QUE TIENEN 0 PRODUCTOS:'
\echo '---'
SELECT
    o.id,
    o.name,
    o.active AS occasion_active
FROM occasions o
LEFT JOIN product_occasions po ON o.id = po.occasion_id
WHERE po.id IS NULL
  AND o.active = true
LIMIT 10;

SELECT
    'Occasions without products' AS check_name,
    COUNT(*) AS count
FROM occasions o
LEFT JOIN product_occasions po ON o.id = po.occasion_id
WHERE po.id IS NULL
  AND o.active = true;
\echo ''

-- ====================================================================
-- 9. RESUMEN FINAL
-- ====================================================================
\echo '9. RESUMEN FINAL:'
\echo '---'
SELECT
    'Total product_occasions' AS metric,
    COUNT(*) AS value
FROM product_occasions
UNION ALL
SELECT
    'Total products with occasions' AS metric,
    COUNT(DISTINCT product_id) AS value
FROM product_occasions
UNION ALL
SELECT
    'Total occasions with products' AS metric,
    COUNT(DISTINCT occasion_id) AS value
FROM product_occasions
UNION ALL
SELECT
    'Orphaned product_id records' AS metric,
    COUNT(*) AS value
FROM product_occasions po
LEFT JOIN products p ON po.product_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT
    'Orphaned occasion_id records' AS metric,
    COUNT(*) AS value
FROM product_occasions po
LEFT JOIN occasions o ON po.occasion_id = o.id
WHERE o.id IS NULL;

\echo ''
\echo '==========================================='
\echo 'VERIFICACIÓN COMPLETADA'
\echo '==========================================='
