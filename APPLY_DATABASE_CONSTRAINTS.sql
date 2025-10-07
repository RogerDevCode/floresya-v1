-- =====================================================
-- SCRIPT SEGURO PARA APLICAR CONSTRAINTS A FLORESYA
-- =====================================================
-- Ejecutar en orden y con rollback automático si hay errores

-- =====================================================
-- CONFIGURACIÓN INICIAL
-- =====================================================

-- Iniciar transacción
BEGIN;

-- Configurar timeouts
SET statement_timeout = '30s';
SET lock_timeout = '10s';

-- =====================================================
-- BACKUP DE CONSTRAINTS EXISTENTES
-- =====================================================

DO $$
DECLARE
    constraint_record RECORD;
    sql_backup TEXT := '';
BEGIN
    -- Crear tabla temporal para backup de constraints
    CREATE TEMP TABLE constraints_backup AS
    SELECT
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        cc.check_clause,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
    LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('products', 'orders', 'order_items', 'users', 'payments', 'product_images', 'occasions', 'settings', 'payment_methods');

    RAISE NOTICE 'Backup de constraints creado exitosamente';
END $$;

-- =====================================================
-- VALIDACIÓN PREVIA (DRY RUN)
-- =====================================================

DO $$
DECLARE
    table_name TEXT;
    constraint_name TEXT;
    check_clause TEXT;
    violation_count INTEGER;
BEGIN
    RAISE NOTICE '=== VALIDACIÓN PREVIA DE CONSTRAINTS ===';

    -- Verificar productos
    SELECT COUNT(*) INTO violation_count FROM products WHERE price_usd <= 0;
    IF violation_count > 0 THEN
        RAISE WARNING 'Productos con price_usd <= 0: %', violation_count;
    END IF;

    SELECT COUNT(*) INTO violation_count FROM products WHERE stock < 0;
    IF violation_count > 0 THEN
        RAISE WARNING 'Productos con stock < 0: %', violation_count;
    END IF;

    -- Verificar órdenes
    SELECT COUNT(*) INTO violation_count FROM orders WHERE total_amount_usd <= 0;
    IF violation_count > 0 THEN
        RAISE WARNING 'Órdenes con total_amount_usd <= 0: %', violation_count;
    END IF;

    -- Verificar order_items
    SELECT COUNT(*) INTO violation_count FROM order_items WHERE quantity <= 0;
    IF violation_count > 0 THEN
        RAISE WARNING 'Order items con quantity <= 0: %', violation_count;
    END IF;

    SELECT COUNT(*) INTO violation_count FROM order_items WHERE unit_price_usd <= 0;
    IF violation_count > 0 THEN
        RAISE WARNING 'Order items con unit_price_usd <= 0: %', violation_count;
    END IF;

    RAISE NOTICE '=== VALIDACIÓN PREVIA COMPLETADA ===';
END $$;

-- =====================================================
-- APLICAR CONSTRAINTS NUEVOS (NOT VALID)
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== APLICANDO CONSTRAINTS NUEVOS ===';

    -- Products constraints
    BEGIN
        ALTER TABLE products ADD CONSTRAINT products_price_usd_positive
           CHECK (price_usd > 0) NOT VALID;
        RAISE NOTICE '✓ products_price_usd_positive aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando products_price_usd_positive: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE products ADD CONSTRAINT products_price_ves_positive
           CHECK (price_ves IS NULL OR price_ves > 0) NOT VALID;
        RAISE NOTICE '✓ products_price_ves_positive aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando products_price_ves_positive: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE products ADD CONSTRAINT products_carousel_order_range
           CHECK (carousel_order IS NULL OR (carousel_order >= 0 AND carousel_order <= 7)) NOT VALID;
        RAISE NOTICE '✓ products_carousel_order_range aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando products_carousel_order_range: %', SQLERRM;
    END;

    -- Orders constraints
    BEGIN
        ALTER TABLE orders ADD CONSTRAINT orders_customer_email_format
           CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') NOT VALID;
        RAISE NOTICE '✓ orders_customer_email_format aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando orders_customer_email_format: %', SQLERRM;
    END;

    BEGIN
        ALTER TABLE orders ADD CONSTRAINT orders_total_amount_positive
           CHECK (total_amount_usd > 0) NOT VALID;
        RAISE NOTICE '✓ orders_total_amount_positive aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando orders_total_amount_positive: %', SQLERRM;
    END;

    -- Order items constraints
    BEGIN
        ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_positive
           CHECK (unit_price_usd > 0) NOT VALID;
        RAISE NOTICE '✓ order_items_unit_price_positive aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando order_items_unit_price_positive: %', SQLERRM;
    END;

    -- Users constraints
    BEGIN
        ALTER TABLE users ADD CONSTRAINT users_email_format
           CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') NOT VALID;
        RAISE NOTICE '✓ users_email_format aplicado';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error aplicando users_email_format: %', SQLERRM;
    END;

    RAISE NOTICE '=== CONSTRAINTS NUEVOS APLICADOS ===';
END $$;

-- =====================================================
-- VALIDAR CONSTRAINTS (CHECK MODE)
-- =====================================================

DO $$
DECLARE
    constraint_violations INTEGER;
BEGIN
    RAISE NOTICE '=== VALIDANDO CONSTRAINTS ===';

    -- Contar violaciones por tabla
    SELECT COUNT(*) INTO constraint_violations
    FROM products
    WHERE price_usd <= 0 OR price_ves < 0 OR stock < 0;

    IF constraint_violations > 0 THEN
        RAISE EXCEPTION 'Violaciones encontradas en products: %', constraint_violations;
    END IF;

    SELECT COUNT(*) INTO constraint_violations
    FROM orders
    WHERE total_amount_usd <= 0 OR customer_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

    IF constraint_violations > 0 THEN
        RAISE EXCEPTION 'Violaciones encontradas en orders: %', constraint_violations;
    END IF;

    SELECT COUNT(*) INTO constraint_violations
    FROM order_items
    WHERE quantity <= 0 OR unit_price_usd <= 0;

    IF constraint_violations > 0 THEN
        RAISE EXCEPTION 'Violaciones encontradas en order_items: %', constraint_violations;
    END IF;

    SELECT COUNT(*) INTO constraint_violations
    FROM users
    WHERE email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

    IF constraint_violations > 0 THEN
        RAISE EXCEPTION 'Violaciones encontradas en users: %', constraint_violations;
    END IF;

    RAISE NOTICE '✓ Todas las validaciones pasaron exitosamente';
END $$;

-- =====================================================
-- HACER VALID LOS CONSTRAINTS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== HACIENDO VALID LOS CONSTRAINTS ===';

    -- Products
    ALTER TABLE products VALIDATE CONSTRAINT products_price_usd_positive;
    RAISE NOTICE '✓ products_price_usd_positive validado';

    ALTER TABLE products VALIDATE CONSTRAINT products_price_ves_positive;
    RAISE NOTICE '✓ products_price_ves_positive validado';

    ALTER TABLE products VALIDATE CONSTRAINT products_carousel_order_range;
    RAISE NOTICE '✓ products_carousel_order_range validado';

    -- Orders
    ALTER TABLE orders VALIDATE CONSTRAINT orders_customer_email_format;
    RAISE NOTICE '✓ orders_customer_email_format validado';

    ALTER TABLE orders VALIDATE CONSTRAINT orders_total_amount_positive;
    RAISE NOTICE '✓ orders_total_amount_positive validado';

    -- Order items
    ALTER TABLE order_items VALIDATE CONSTRAINT order_items_unit_price_positive;
    RAISE NOTICE '✓ order_items_unit_price_positive validado';

    -- Users
    ALTER TABLE users VALIDATE CONSTRAINT users_email_format;
    RAISE NOTICE '✓ users_email_format validado';

    RAISE NOTICE '=== TODOS LOS CONSTRAINTS VALIDADOS ===';
END $$;

-- =====================================================
-- CREAR ÍNDICES ADICIONALES
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== CREANDO ÍNDICES ADICIONALES ===';

    -- Índices para búsquedas optimizadas
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search
       ON products (name_normalized, description_normalized)
       WHERE active = true;
    RAISE NOTICE '✓ idx_products_search creado';

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_in_stock
       ON products (id, name, price_usd, stock)
       WHERE active = true AND stock > 0;
    RAISE NOTICE '✓ idx_products_in_stock creado';

    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_date_status
       ON orders (created_at DESC, status)
       WHERE status IN ('pending', 'verified', 'preparing');
    RAISE NOTICE '✓ idx_orders_date_status creado';

    RAISE NOTICE '=== ÍNDICES CREADOS ===';
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

DO $$
DECLARE
    total_constraints INTEGER;
    new_constraints INTEGER;
BEGIN
    -- Contar constraints antes y después
    SELECT COUNT(*) INTO total_constraints
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND constraint_type = 'CHECK';

    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    RAISE NOTICE 'Total de constraints CHECK: %', total_constraints;

    -- Verificar que constraints están activos
    RAISE NOTICE 'Constraints activos:';
    FOR total_constraints IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND constraint_type = 'CHECK'
        AND table_name IN ('products', 'orders', 'order_items', 'users')
        ORDER BY table_name, constraint_name
    LOOP
        RAISE NOTICE '  ✓ %', total_constraints;
    END LOOP;

    RAISE NOTICE '=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===';
END $$;

-- =====================================================
-- COMMIT DE CAMBIOS
-- =====================================================

COMMIT;

RAISE NOTICE '🎉 TODOS LOS CONSTRAINTS APLICADOS EXITOSAMENTE';
RAISE NOTICE '📊 La base de datos ahora tiene mayor integridad y confiabilidad';
RAISE NOTICE '🔒 Los datos están protegidos contra valores inválidos';

-- =====================================================
-- ROLLBACK (SI ES NECESARIO)
-- =====================================================

/*
-- Para rollback en caso de emergencia:
BEGIN;
-- Eliminar constraints nuevos
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_usd_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_ves_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_carousel_order_range;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_email_format;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_positive;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format;

-- Eliminar índices nuevos
DROP INDEX IF EXISTS idx_products_search;
DROP INDEX IF EXISTS idx_products_in_stock;
DROP INDEX IF EXISTS idx_orders_date_status;

COMMIT;
RAISE NOTICE 'Rollback completado';
*/

-- =====================================================
-- MANTENIMIENTO POST-MIGRACIÓN
-- =====================================================

-- 1. Monitorear performance de nuevos índices
-- 2. Revisar logs para constraint violations
-- 3. Actualizar documentación
-- 4. Probar aplicación con nuevos constraints

-- Query para monitorear:
-- SELECT * FROM constraint_violations WHERE violations > 0;

RAISE NOTICE '=== SCRIPT COMPLETADO ===';
RAISE NOTICE 'Los constraints están ahora activos y protegiendo la integridad de los datos';