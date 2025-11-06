-- ================================================================
-- MIGRACIÓN FASE 3 - FOREIGN KEYS & INTEGRITY CONSTRAINTS
-- Fecha: 2025-11-04
-- Descripción: Agregar Foreign Keys y constraints únicos para integridad
-- ================================================================

DO $$
DECLARE
    v_start_time TIMESTAMP := NOW();
    v_errors TEXT := '';
    v_warnings TEXT := '';
BEGIN
    RAISE NOTICE '=== INICIANDO MIGRACIÓN FASE 3 - FOREIGN KEYS ===';
    RAISE NOTICE 'Tiempo de inicio: %', v_start_time;

    -- ============================================================
    -- 1. FOREIGN KEYS CRÍTICOS
    -- ============================================================
    RAISE NOTICE 'Paso 1: Creando Foreign Keys...';

    -- Foreign Key: orders.user_id → users.id
    BEGIN
        ALTER TABLE orders
        ADD CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL;

        RAISE NOTICE '✓ FK orders.user_id → users.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK orders.user_id: existen órdenes con user_id inválido';
            RAISE NOTICE '   Recomendación: Limpiar datos huérfanos antes de aplicar FK';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK orders.user_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK orders.user_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_orders_user: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: order_items.order_id → orders.id
    BEGIN
        ALTER TABLE order_items
        ADD CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✓ FK order_items.order_id → orders.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK order_items.order_id: items huérfanos';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK order_items.order_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK order_items.order_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_order_items_order: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: order_items.product_id → products.id
    BEGIN
        ALTER TABLE order_items
        ADD CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT;

        RAISE NOTICE '✓ FK order_items.product_id → products.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK order_items.product_id: productos huérfanos';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK order_items.product_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK order_items.product_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_order_items_product: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: payments.order_id → orders.id
    BEGIN
        ALTER TABLE payments
        ADD CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✓ FK payments.order_id → orders.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK payments.order_id: pagos huérfanos';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK payments.order_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK payments.order_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_payments_order: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: payments.payment_method_id → payment_methods.id
    BEGIN
        ALTER TABLE payments
        ADD CONSTRAINT fk_payments_payment_method
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
        ON DELETE SET NULL;

        RAISE NOTICE '✓ FK payments.payment_method_id → payment_methods.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK payments.payment_method_id: métodos huérfanos';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK payments.payment_method_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK payments.payment_method_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_payments_payment_method: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: product_images.product_id → products.id
    BEGIN
        ALTER TABLE product_images
        ADD CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✓ FK product_images.product_id → products.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK product_images.product_id: imágenes huérfanas';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK product_images.product_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK product_images.product_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_product_images_product: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: product_occasions.product_id → products.id
    BEGIN
        ALTER TABLE product_occasions
        ADD CONSTRAINT fk_product_occasions_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✓ FK product_occasions.product_id → products.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK product_occasions.product_id: relaciones huérfanas';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK product_occasions.product_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK product_occasions.product_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_product_occasions_product: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: product_occasions.occasion_id → occasions.id
    BEGIN
        ALTER TABLE product_occasions
        ADD CONSTRAINT fk_product_occasions_occasion
        FOREIGN KEY (occasion_id) REFERENCES occasions(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✓ FK product_occasions.occasion_id → occasions.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK product_occasions.occasion_id: ocasiones huérfanas';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK product_occasions.occasion_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK product_occasions.occasion_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_product_occasions_occasion: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Foreign Key: order_status_history.order_id → orders.id
    BEGIN
        ALTER TABLE order_status_history
        ADD CONSTRAINT fk_order_status_history_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE;

        RAISE NOTICE '✓ FK order_status_history.order_id → orders.id';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Violación de FK order_status_history.order_id: history huérfana';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ FK order_status_history.order_id ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando FK order_status_history.order_id: %', SQLERRM;
            v_errors := v_errors || 'Error fk_order_status_history_order: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- ============================================================
    -- 2. CONSTRAINTS ÚNICOS
    -- ============================================================
    RAISE NOTICE 'Paso 2: Creando constraints únicos...';

    -- Unique: users.email (case-insensitive usando normalized)
    BEGIN
        ALTER TABLE users
        ADD CONSTRAINT users_email_unique
        UNIQUE (email_normalized);

        RAISE NOTICE '✓ UNIQUE users.email_normalized';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Email duplicado encontrado en users';
            SELECT email_normalized, COUNT(*) as count
            FROM users
            GROUP BY email_normalized
            HAVING COUNT(*) > 1;
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ UNIQUE users.email_normalized ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando UNIQUE users.email_normalized: %', SQLERRM;
            v_errors := v_errors || 'Error users_email_unique: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Unique: products.sku (case-insensitive usando índice único)
    BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx
        ON products (UPPER(sku)) WHERE sku IS NOT NULL;

        RAISE NOTICE '✓ UNIQUE INDEX products.sku (case-insensitive)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ SKU duplicado encontrado en products';
            SELECT UPPER(sku) as sku_upper, COUNT(*) as count
            FROM products
            WHERE sku IS NOT NULL
            GROUP BY UPPER(sku)
            HAVING COUNT(*) > 1;
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ UNIQUE INDEX products.sku ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando UNIQUE INDEX products.sku: %', SQLERRM;
            v_errors := v_errors || 'Error products_sku_unique: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Unique: occasions.name (case-insensitive usando índice único)
    BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS occasions_name_unique_idx
        ON occasions (UPPER(name));

        RAISE NOTICE '✓ UNIQUE INDEX occasions.name (case-insensitive)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Nombre duplicado encontrado en occasions';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ UNIQUE INDEX occasions.name ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando UNIQUE INDEX occasions.name: %', SQLERRM;
            v_errors := v_errors || 'Error occasions_name_unique: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Unique: payment_methods.name (case-insensitive usando índice único)
    BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS payment_methods_name_unique_idx
        ON payment_methods (UPPER(name));

        RAISE NOTICE '✓ UNIQUE INDEX payment_methods.name (case-insensitive)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Nombre duplicado encontrado en payment_methods';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ UNIQUE INDEX payment_methods.name ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando UNIQUE INDEX payment_methods.name: %', SQLERRM;
            v_errors := v_errors || 'Error payment_methods_name_unique: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- Unique: settings.key (case-insensitive usando índice único)
    BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS settings_key_unique_idx
        ON settings (UPPER(key));

        RAISE NOTICE '✓ UNIQUE INDEX settings.key (case-insensitive)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '23505' THEN
            RAISE NOTICE '⚠ Key duplicado encontrado en settings';
        ELSIF SQLSTATE = '42723' THEN
            RAISE NOTICE '⚠ UNIQUE INDEX settings.key ya existe (saltando)';
        ELSE
            RAISE NOTICE '✗ Error creando UNIQUE INDEX settings.key: %', SQLERRM;
            v_errors := v_errors || 'Error settings_key_unique: ' || SQLERRM || CHR(10);
        END IF;
    END;

    -- ============================================================
    -- 3. VALORES POR DEFECTO Y NOT NULL ADICIONALES
    -- ============================================================
    RAISE NOTICE 'Paso 3: Agregando defaults y NOT NULL...';

    -- orders.status: set default if not exists
    BEGIN
        ALTER TABLE orders
        ALTER COLUMN status SET DEFAULT 'pending'::public.order_status;

        RAISE NOTICE '✓ DEFAULT orders.status = pending';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠ Error estableciendo DEFAULT orders.status: %', SQLERRM;
    END;

    -- orders.currency_rate: set default to 1.0 if not exists
    BEGIN
        ALTER TABLE orders
        ALTER COLUMN currency_rate SET DEFAULT 1.0;

        RAISE NOTICE '✓ DEFAULT orders.currency_rate = 1.0';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠ Error estableciendo DEFAULT orders.currency_rate: %', SQLERRM;
    END;

    -- users.email_verified: set default to false if not exists
    BEGIN
        ALTER TABLE users
        ALTER COLUMN email_verified SET DEFAULT false;

        RAISE NOTICE '✓ DEFAULT users.email_verified = false';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠ Error estableciendo DEFAULT users.email_verified: %', SQLERRM;
    END;

    -- ============================================================
    -- 4. ÍNDICES ADICIONALES DE PERFORMANCE
    -- ============================================================
    RAISE NOTICE 'Paso 4: Creando índices adicionales...';

    -- Índice para búsquedas frecuentes de usuarios
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        RAISE NOTICE '✓ idx_users_email';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_users_email: ' || SQLERRM || CHR(10);
    END;

    -- Índice para teléfono de usuarios
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
        RAISE NOTICE '✓ idx_users_phone';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_users_phone: ' || SQLERRM || CHR(10);
    END;

    -- Índice para SKU de productos
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_products_sku ON products(UPPER(sku)) WHERE sku IS NOT NULL;
        RAISE NOTICE '✓ idx_products_sku';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_products_sku: ' || SQLERRM || CHR(10);
    END;

    -- Índice compuesto para productos destacados
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_products_featured_active ON products(featured, active) WHERE featured = true AND active = true;
        RAISE NOTICE '✓ idx_products_featured_active';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_products_featured_active: ' || SQLERRM || CHR(10);
    END;

    -- Índice para ordenes por estado y fecha
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
        RAISE NOTICE '✓ idx_orders_status_created';
    EXCEPTION WHEN OTHERS THEN
        v_warnings := v_warnings || 'Warning idx_orders_status_created: ' || SQLERRM || CHR(10);
    END;

    -- ============================================================
    -- 5. VERIFICACIÓN FINAL
    -- ============================================================
    RAISE NOTICE 'Paso 5: Verificación final...';

    DECLARE
        fk_count INTEGER;
        unique_count INTEGER;
        index_count INTEGER;
    BEGIN
        -- Contar Foreign Keys
        SELECT COUNT(*) INTO fk_count
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND constraint_type = 'FOREIGN KEY';

        RAISE NOTICE 'Foreign Keys creados: %', fk_count;

        -- Contar Unique Constraints
        SELECT COUNT(*) INTO unique_count
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'public'
          AND constraint_type = 'UNIQUE';

        RAISE NOTICE 'Constraints únicos: %', unique_count;

        -- Contar índices nuevos
        SELECT COUNT(*) INTO index_count
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname LIKE 'idx_%';

        RAISE NOTICE 'Índices totales: %', index_count;
    END;

    -- ============================================================
    -- 6. RESUMEN Y FINALIZACIÓN
    -- ============================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRACIÓN FASE 3 COMPLETADA ===';
    RAISE NOTICE 'Resumen:';
    RAISE NOTICE '  - Foreign Keys agregados (verificación arriba)';
    RAISE NOTICE '  - Constraints únicos aplicados';
    RAISE NOTICE '  - Valores por defecto establecidos';
    RAISE NOTICE '  - Índices adicionales creados';
    RAISE NOTICE '';
    RAISE NOTICE 'Tiempo de ejecución: %', NOW() - v_start_time;
    RAISE NOTICE '';

    IF v_errors <> '' THEN
        RAISE NOTICE 'ERRORES ENCONTRADOS:';
        RAISE NOTICE '%', v_errors;
    END IF;

    IF v_warnings <> '' THEN
        RAISE NOTICE 'WARNINGS:';
        RAISE NOTICE '%', v_warnings;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMO PASO: Verificar integridad de datos';
    RAISE NOTICE '  - Ejecutar queries de verificación';
    RAISE NOTICE '  - Ejecutar tests de aplicación';
    RAISE NOTICE '';

END $$;
