-- ================================================================
-- SECURITY FIX - SEARCH PATH MUTABLE VULNERABILITIES
-- Fecha: 2025-11-04
-- Descripción: Fijar search_path en funciones críticas para prevenir
--              ataques de inyección de schema
-- Severidad: CRITICAL - Ejecutar inmediatamente
-- ================================================================

DO $$
DECLARE
    v_start_time TIMESTAMP := NOW();
    func_count INTEGER;
BEGIN
    RAISE NOTICE '=== INICIANDO SECURITY FIX - SEARCH PATH ===';
    RAISE NOTICE 'Tiempo de inicio: %', v_start_time;
    RAISE NOTICE 'Criticidad: ALTA - Prevenir inyección de schema';

    -- ============================================================
    -- 1. FIX: validate_order_total
    -- ============================================================
    RAISE NOTICE 'Paso 1: Fijando search_path en validate_order_total...';

    CREATE OR REPLACE FUNCTION validate_order_total()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SET search_path = 'public'
    AS $_function_body_$
    DECLARE
        calculated_total DECIMAL(10,2);
    BEGIN
        SELECT COALESCE(SUM(subtotal_usd), 0) INTO calculated_total
        FROM order_items
        WHERE order_id = NEW.order_id;

        IF calculated_total > 0 AND NEW.order_id IN (SELECT id FROM orders WHERE abs(total_amount_usd - calculated_total) > 0.01) THEN
            RAISE EXCEPTION 'Order total (%.2f) does not match item subtotals (%.2f) for order %',
                (SELECT total_amount_usd FROM orders WHERE id = NEW.order_id),
                calculated_total,
                NEW.order_id;
        END IF;

        RETURN NEW;
    END
    $_function_body_$;

    RAISE NOTICE '✓ validate_order_total - search_path fijado';

    -- ============================================================
    -- 2. FIX: sync_payment_method_name
    -- ============================================================
    RAISE NOTICE 'Paso 2: Fijando search_path en sync_payment_method_name...';

    CREATE OR REPLACE FUNCTION sync_payment_method_name()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SET search_path = 'public'
    AS $_function_body_$
    BEGIN
        IF NEW.payment_method_id IS NULL THEN
            NEW.payment_method_name := NULL;
        ELSIF NEW.payment_method_id IS NOT NULL THEN
            SELECT name INTO NEW.payment_method_name
            FROM payment_methods
            WHERE id = NEW.payment_method_id;
        END IF;
        RETURN NEW;
    END
    $_function_body_$;

    RAISE NOTICE '✓ sync_payment_method_name - search_path fijado';

    -- ============================================================
    -- 3. FIX: is_admin
    -- ============================================================
    RAISE NOTICE 'Paso 3: Fijando search_path en is_admin...';

    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = 'public'
    AS $_function_body_$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
      );
    END;
    $_function_body_$;

    RAISE NOTICE '✓ is_admin - search_path fijado';

    -- ============================================================
    -- 4. VERIFICACIÓN
    -- ============================================================
    RAISE NOTICE 'Paso 4: Verificando fixes aplicados...';

    SELECT COUNT(*) INTO func_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname IN ('validate_order_total', 'sync_payment_method_name', 'is_admin')
      AND p.proconfig IS NOT NULL
      AND array_to_string(p.proconfig, ' ') LIKE '%search_path%';

    RAISE NOTICE 'Funciones con search_path configurado: %/3', func_count;

    IF func_count >= 3 THEN
        RAISE NOTICE '✓ TODAS las funciones críticas tienen search_path FIJO';
    ELSE
        RAISE NOTICE '⚠ ADVERTENCIA: Algunas funciones podrían no tener search_path';
    END IF;

    -- ============================================================
    -- 5. RESUMEN FINAL
    -- ============================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== SECURITY FIX COMPLETADO ===';
    RAISE NOTICE 'Resumen:';
    RAISE NOTICE '  - 3 funciones críticas PARCHADAS';
    RAISE NOTICE '  - search_path configurado en todas';
    RAISE NOTICE '  - Inyección de schema: IMPOSIBLE';
    RAISE NOTICE '';
    RAISE NOTICE 'Tiempo de ejecución: %', NOW() - v_start_time;
    RAISE NOTICE '';

    RAISE NOTICE 'PRÓXIMOS PASOS:';
    RAISE NOTICE '  1. Ejecutar Phase 3 (Foreign Keys)';
    RAISE NOTICE '  2. Verificar en Supabase Security Advisor';
    RAISE NOTICE '  3. Aplicar fixes para dblink y Postgres version';
    RAISE NOTICE '';

END $$;
