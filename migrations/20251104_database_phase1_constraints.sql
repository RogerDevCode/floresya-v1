-- ================================================================
-- MIGRACIÓN FASE 1 - CONSTRAINTS CRÍTICAS
-- Fecha: 2025-11-04
-- Descripción: Agrega constraints críticos con limpieza de datos
-- ================================================================

DO $$
DECLARE
    v_start_time TIMESTAMP := NOW();
    v_errors TEXT := '';
    v_warnings TEXT := '';
BEGIN
    RAISE NOTICE '=== INICIANDO MIGRACIÓN FASE 1 - CONSTRAINTS CRÍTICAS ===';
    RAISE NOTICE 'Tiempo de inicio: %', v_start_time;

    -- ============================================================
    -- 1. CREAR ENUMS NECESARIOS (PRIMERO)
    -- ============================================================
    RAISE NOTICE 'Paso 1: Creando ENUMs...';

    -- Create ENUMs using inline exception handling
    BEGIN
        CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json', 'date');
        RAISE NOTICE '✓ ENUM setting_type creado';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '42710' THEN
            RAISE NOTICE 'ℹ ENUM setting_type ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando setting_type: %', SQLERRM;
        END IF;
    END;

    BEGIN
        CREATE TYPE query_timeout_estado AS ENUM ('timeout', 'success', 'error', 'cancelled');
        RAISE NOTICE '✓ ENUM query_timeout_estado creado';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '42710' THEN
            RAISE NOTICE 'ℹ ENUM query_timeout_estado ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando query_timeout_estado: %', SQLERRM;
        END IF;
    END;

    BEGIN
        CREATE TYPE query_timeout_tipo AS ENUM ('select', 'insert', 'update', 'delete', 'ddl', 'other');
        RAISE NOTICE '✓ ENUM query_timeout_tipo creado';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '42710' THEN
            RAISE NOTICE 'ℹ ENUM query_timeout_tipo ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando query_timeout_tipo: %', SQLERRM;
        END IF;
    END;

    -- ============================================================
    -- 2. LIMPIEZA DE DATOS Y NOT NULL CONSTRAINTS
    -- ============================================================
    RAISE NOTICE 'Paso 2: Aplicando constraints NOT NULL...';

    BEGIN
        UPDATE users SET phone = 'N/A' WHERE phone IS NULL;
        ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
        RAISE NOTICE '✓ users.phone: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en users.phone: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en users.phone: %', SQLERRM;
    END;

    BEGIN
        UPDATE products SET featured = false WHERE featured IS NULL;
        ALTER TABLE products ALTER COLUMN featured SET NOT NULL;
        RAISE NOTICE '✓ products.featured: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en products.featured: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en products.featured: %', SQLERRM;
    END;

    BEGIN
        UPDATE orders SET customer_phone = 'N/A' WHERE customer_phone IS NULL;
        ALTER TABLE orders ALTER COLUMN customer_phone SET NOT NULL;
        RAISE NOTICE '✓ orders.customer_phone: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en orders.customer_phone: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en orders.customer_phone: %', SQLERRM;
    END;

    BEGIN
        UPDATE orders SET delivery_city = 'N/A' WHERE delivery_city IS NULL;
        ALTER TABLE orders ALTER COLUMN delivery_city SET NOT NULL;
        RAISE NOTICE '✓ orders.delivery_city: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en orders.delivery_city: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en orders.delivery_city: %', SQLERRM;
    END;

    BEGIN
        UPDATE orders SET delivery_state = 'N/A' WHERE delivery_state IS NULL;
        ALTER TABLE orders ALTER COLUMN delivery_state SET NOT NULL;
        RAISE NOTICE '✓ orders.delivery_state: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en orders.delivery_state: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en orders.delivery_state: %', SQLERRM;
    END;

    BEGIN
        DELETE FROM order_items WHERE product_id IS NULL;
        ALTER TABLE order_items ALTER COLUMN product_id SET NOT NULL;
        RAISE NOTICE '✓ order_items.product_id: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en order_items.product_id: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en order_items.product_id: %', SQLERRM;
    END;

    BEGIN
        UPDATE occasions SET description = 'Sin descripción' WHERE description IS NULL;
        ALTER TABLE occasions ALTER COLUMN description SET NOT NULL;
        RAISE NOTICE '✓ occasions.description: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en occasions.description: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en occasions.description: %', SQLERRM;
    END;

    BEGIN
        UPDATE product_images SET file_hash = COALESCE(file_hash, MD5(COALESCE(file_path, 'unknown')::text)) WHERE file_hash IS NULL;
        ALTER TABLE product_images ALTER COLUMN file_hash SET NOT NULL;
        RAISE NOTICE '✓ product_images.file_hash: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en product_images.file_hash: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en product_images.file_hash: %', SQLERRM;
    END;

    BEGIN
        UPDATE payment_methods SET description = 'Sin descripción' WHERE description IS NULL;
        ALTER TABLE payment_methods ALTER COLUMN description SET NOT NULL;
        RAISE NOTICE '✓ payment_methods.description: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en payment_methods.description: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en payment_methods.description: %', SQLERRM;
    END;

    BEGIN
        UPDATE settings SET value = '' WHERE value IS NULL;
        ALTER TABLE settings ALTER COLUMN value SET NOT NULL;
        RAISE NOTICE '✓ settings.value: NOT NULL aplicado';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en settings.value: ' || SQLERRM || CHR(10);
        RAISE NOTICE '✗ Error en settings.value: %', SQLERRM;
    END;

    -- Busquedas_log
    BEGIN
        UPDATE busquedas_log SET termino_busqueda = 'sin_termino' WHERE termino_busqueda IS NULL;
        ALTER TABLE busquedas_log ALTER COLUMN termino_busqueda SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.termino_busqueda: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        UPDATE busquedas_log SET resultados = 0 WHERE resultados IS NULL;
        ALTER TABLE busquedas_log ALTER COLUMN resultados SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.resultados: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        UPDATE busquedas_log SET tiempo_ejecucion = 0 WHERE tiempo_ejecucion IS NULL;
        ALTER TABLE busquedas_log ALTER COLUMN tiempo_ejecucion SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.tiempo_ejecucion: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        UPDATE busquedas_log SET ip_cliente = '0.0.0.0' WHERE ip_cliente IS NULL;
        ALTER TABLE busquedas_log ALTER COLUMN ip_cliente SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.ip_cliente: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        UPDATE busquedas_log SET user_agent = 'unknown' WHERE user_agent IS NULL;
        ALTER TABLE busquedas_log ALTER COLUMN user_agent SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.user_agent: ' || SQLERRM || CHR(10);
    END;

    -- Query timeouts log
    BEGIN
        UPDATE query_timeouts_log SET nombre_consulta = 'unnamed_query' WHERE nombre_consulta IS NULL;
        ALTER TABLE query_timeouts_log ALTER COLUMN nombre_consulta SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en query_timeouts_log.nombre_consulta: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        UPDATE query_timeouts_log SET estado = 'error' WHERE estado IS NULL;
        ALTER TABLE query_timeouts_log ALTER COLUMN estado SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en query_timeouts_log.estado: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        UPDATE query_timeouts_log SET tipo = 'other' WHERE tipo IS NULL;
        ALTER TABLE query_timeouts_log ALTER COLUMN tipo SET NOT NULL;
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en query_timeouts_log.tipo: ' || SQLERRM || CHR(10);
    END;

    -- ============================================================
    -- 3. CONSTRAINTS CHECK CRÍTICOS
    -- ============================================================
    RAISE NOTICE 'Paso 3: Agregando constraints CHECK...';

    BEGIN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_password_required_when_active;
        ALTER TABLE users ADD CONSTRAINT users_password_required_when_active
            CHECK (NOT (active = true AND password_hash IS NULL));
        RAISE NOTICE '✓ users: Password requerido';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en users.password: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_full_name_min_length;
        ALTER TABLE users ADD CONSTRAINT users_full_name_min_length
            CHECK (length(full_name) >= 2);
        RAISE NOTICE '✓ users: Full name válido';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en users.full_name: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_max_value;
        ALTER TABLE products ADD CONSTRAINT products_stock_max_value
            CHECK (stock <= 100000);
        RAISE NOTICE '✓ products: Stock máximo';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en products.stock: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_cancelled_date_required;
        ALTER TABLE orders ADD CONSTRAINT orders_cancelled_date_required
            CHECK (status != 'cancelled' OR (cancelled_date IS NOT NULL));
        RAISE NOTICE '✓ orders: Fecha cancelación';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en orders.cancelled_date: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_rate_required;
        ALTER TABLE orders ADD CONSTRAINT orders_currency_rate_required
            CHECK ((total_amount_ves IS NULL) OR (currency_rate IS NOT NULL));
        RAISE NOTICE '✓ orders: Currency rate';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en orders.currency_rate: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_confirmed_date_required;
        ALTER TABLE payments ADD CONSTRAINT payments_confirmed_date_required
            CHECK (status != 'confirmed' OR (confirmed_date IS NOT NULL));
        RAISE NOTICE '✓ payments: Confirmación';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en payments.confirmed: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_transaction_id_required;
        ALTER TABLE payments ADD CONSTRAINT payments_transaction_id_required
            CHECK (status != 'confirmed' OR (transaction_id IS NOT NULL));
        RAISE NOTICE '✓ payments: Transaction ID';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en payments.transaction_id: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_value_type_enum;
        ALTER TABLE settings ADD CONSTRAINT settings_value_type_enum
            CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'date'));
        RAISE NOTICE '✓ settings: Value type enum';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en settings.value_type: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE occasions DROP CONSTRAINT IF EXISTS occasions_slug_format;
        ALTER TABLE occasions ADD CONSTRAINT occasions_slug_format
            CHECK (slug ~ '^[a-z0-9-]+$');
        RAISE NOTICE '✓ occasions: Slug formato';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en occasions.slug: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_max_per_product;
        ALTER TABLE product_images ADD CONSTRAINT product_images_max_per_product
            CHECK (
                (
                    SELECT COUNT(*)
                    FROM product_images pi
                    WHERE pi.product_id = product_id AND pi.active = true
                ) <= 5
            );
        RAISE NOTICE '✓ product_images: Max por producto';
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en product_images.max: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE busquedas_log DROP CONSTRAINT IF EXISTS busquedas_log_termino_length;
        ALTER TABLE busquedas_log ADD CONSTRAINT busquedas_log_termino_length
            CHECK (length(termino_busqueda) >= 2 AND length(termino_busqueda) <= 255);
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.termino: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE busquedas_log DROP CONSTRAINT IF EXISTS busquedas_log_resultados_valid;
        ALTER TABLE busquedas_log ADD CONSTRAINT busquedas_log_resultados_valid
            CHECK (resultados >= 0);
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.resultados: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        ALTER TABLE busquedas_log DROP CONSTRAINT IF EXISTS busquedas_log_tiempo_valid;
        ALTER TABLE busquedas_log ADD CONSTRAINT busquedas_log_tiempo_valid
            CHECK (tiempo_ejecucion >= 0);
    EXCEPTION WHEN OTHERS THEN
        v_errors := v_errors || 'Error en busquedas_log.tiempo: ' || SQLERRM || CHR(10);
    END;

    -- ============================================================
    -- 4. ÍNDICES CRÍTICOS
    -- ============================================================
    RAISE NOTICE 'Paso 4: Creando índices...';

    BEGIN
        -- Only create index if search_vector column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE information_schema.columns.table_name = 'products' AND column_name = 'search_vector') THEN
            CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING gin(search_vector);
            RAISE NOTICE '✓ idx_products_search_vector';
        ELSE
            RAISE NOTICE 'ℹ search_vector column not found in products table, skipping index';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_products_search_vector: ' || SQLERRM || CHR(10);
        RAISE NOTICE '⚠ Warning creating idx_products_search_vector: %', SQLERRM;
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_occasions_active_display_order ON occasions(active, display_order);
        RAISE NOTICE '✓ idx_occasions_active_display_order';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_occasions_active_display_order: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_product_occasions_occasion_id ON product_occasions(occasion_id);
        RAISE NOTICE '✓ idx_product_occasions_occasion_id';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_product_occasions_occasion_id: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_busquedas_ip_fecha ON busquedas_log(ip_cliente, created_at);
        RAISE NOTICE '✓ idx_busquedas_ip_fecha';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_busquedas_ip_fecha: ' || SQLERRM || CHR(10);
    END;

    BEGIN
        CREATE INDEX IF NOT EXISTS idx_busquedas_resultados ON busquedas_log(resultados) WHERE resultados = 0;
        RAISE NOTICE '✓ idx_busquedas_resultados';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_busquedas_resultados: ' || SQLERRM || CHR(10);
    END;

    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRACIÓN FASE 1 COMPLETADA ===';
    RAISE NOTICE 'Duración: % segundos', EXTRACT(EPOCH FROM (NOW() - v_start_time));

    IF length(v_errors) > 0 THEN
        RAISE NOTICE 'ERRORES: %', v_errors;
    END IF;

    IF length(v_warnings) > 0 THEN
        RAISE NOTICE 'WARNINGS: %', v_warnings;
    END IF;

END $$;

-- ============================================================
-- TRIGGERS (Fuera del DO block para evitar problemas)
-- ============================================================

-- Trigger function for validating order totals using deferrable constraint
CREATE OR REPLACE FUNCTION validate_order_total()
RETURNS TRIGGER AS $$
DECLARE
    calculated_total DECIMAL(10,2);
BEGIN
    -- Calculate total from all order_items for this order
    SELECT COALESCE(SUM(subtotal_usd), 0) INTO calculated_total
    FROM order_items
    WHERE order_id = NEW.order_id;

    -- Compare with the order's total (with 0.01 tolerance for rounding)
    IF calculated_total > 0 AND NEW.order_id IN (SELECT id FROM orders WHERE abs(total_amount_usd - calculated_total) > 0.01) THEN
        RAISE EXCEPTION 'Order total (%.2f) does not match item subtotals (%.2f) for order %',
            (SELECT total_amount_usd FROM orders WHERE id = NEW.order_id),
            calculated_total,
            NEW.order_id;
    END IF;

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS trigger_validate_order_total ON order_items;

-- Create deferrable trigger to avoid deadlocks
-- This will execute at the end of the transaction
CREATE TRIGGER trigger_validate_order_total
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH STATEMENT
    EXECUTE FUNCTION validate_order_total();

CREATE OR REPLACE FUNCTION sync_payment_method_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Clear payment_method_name if payment_method_id is NULL
    IF NEW.payment_method_id IS NULL THEN
        NEW.payment_method_name := NULL;
    -- Sync name if payment_method_id is provided
    ELSIF NEW.payment_method_id IS NOT NULL THEN
        SELECT name INTO NEW.payment_method_name
        FROM payment_methods
        WHERE id = NEW.payment_method_id;
    END IF;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_payment_method_name ON payments;
CREATE TRIGGER trigger_sync_payment_method_name
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION sync_payment_method_name();

