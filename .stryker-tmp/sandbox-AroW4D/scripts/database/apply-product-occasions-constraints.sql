-- ====================================================================
-- APLICAR RESTRICCIONES DE CLAVE FORÁNEA - product_occasions
-- ====================================================================
-- Este script aplica restricciones de clave foránea para prevenir
-- registros huérfanos en la tabla product_occasions.
-- ====================================================================

\echo '==========================================='
\echo 'APLICANDO RESTRICCIONES - product_occasions'
\echo '==========================================='
\echo ''

-- ====================================================================
-- VERIFICAR SI LAS RESTRICCIONES YA EXISTEN
-- ====================================================================
\echo 'Verificando restricciones existentes...'
\echo ''

-- Verificar FK para product_id
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'product_occasions_product_id_fkey'
        ) THEN 'FK product_occasions_product_id_fkey YA EXISTE'
        ELSE 'FK product_occasions_product_id_fkey NO EXISTE - SERÁ CREADA'
    END AS fk_product_status;

\echo ''

-- Verificar FK para occasion_id
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'product_occasions_occasion_id_fkey'
        ) THEN 'FK product_occasions_occasion_id_fkey YA EXISTE'
        ELSE 'FK product_occasions_occasion_id_fkey NO EXISTE - SERÁ CREADA'
    END AS fk_occasion_status;

\echo ''

-- ====================================================================
-- ELIMINAR RESTRICCIONES SI EXISTEN (PARA REAPLICAR)
-- ====================================================================
\echo 'Eliminando restricciones existentes (si las hay)...'
\echo ''

-- Eliminar FK constraint para product_id (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_occasions_product_id_fkey'
    ) THEN
        ALTER TABLE product_occasions DROP CONSTRAINT product_occasions_product_id_fkey;
        RAISE NOTICE 'Eliminado: product_occasions_product_id_fkey';
    END IF;
END $$;

-- Eliminar FK constraint para occasion_id (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_occasions_occasion_id_fkey'
    ) THEN
        ALTER TABLE product_occasions DROP CONSTRAINT product_occasions_occasion_id_fkey;
        RAISE NOTICE 'Eliminado: product_occasions_occasion_id_fkey';
    END IF;
END $$;

\echo ''

-- ====================================================================
-- CREAR RESTRICCIONES DE CLAVE FORÁNEA
-- ====================================================================
\echo 'Creando restricciones de clave foránea...'
\echo ''

-- 1. FK a products(id) con CASCADE DELETE
\echo 'Creando: product_occasions_product_id_fkey'
ALTER TABLE product_occasions
ADD CONSTRAINT product_occasions_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 2. FK a occasions(id) con CASCADE DELETE
\echo 'Creando: product_occasions_occasion_id_fkey'
ALTER TABLE product_occasions
ADD CONSTRAINT product_occasions_occasion_id_fkey
FOREIGN KEY (occasion_id)
REFERENCES occasions(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

\echo ''
\echo 'Restricciones aplicadas exitosamente!'
\echo ''

-- ====================================================================
-- VERIFICAR QUE LAS RESTRICCIONES ESTÁN ACTIVAS
-- ====================================================================
\echo 'Verificando restricciones aplicadas...'
\echo ''

SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    CASE contype
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 'c' THEN 'CHECK'
    END AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname LIKE '%product_occasions%'
  AND conrelid = 'product_occasions'::regclass
ORDER BY contype, conname;

\echo ''
\echo '==========================================='
\echo 'RESTRICCIONES APLICADAS CORRECTAMENTE'
\echo '==========================================='
\echo ''
\echo 'BENEFICIOS:'
\echo '  ✓ No se pueden insertar product_occasions con product_id inexistente'
\echo '  ✓ No se pueden insertar product_occasions con occasion_id inexistente'
\echo '  ✓ Si se elimina un producto, sus relaciones se eliminan automáticamente'
\echo '  ✓ Si se elimina una ocasión, sus relaciones se eliminan automáticamente'
\echo '  ✓ Integridad referencial garantizada por la base de datos'
\echo ''
