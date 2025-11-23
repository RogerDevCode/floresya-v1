--
-- PostgreSQL database dump
--

\restrict eBkse3eg3aumsA54PslbfN3K0LEfS5M6PvPofSp4YwwXrgRfGAm0L5nxaoKFTaJ

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-2.pgdg24.04+1)

-- Started on 2025-11-22 20:16:22 -03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 107 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4425 (class 0 OID 0)
-- Dependencies: 107
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1446 (class 1247 OID 32337)
-- Name: image_size; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.image_size AS ENUM (
    'thumb',
    'small',
    'medium',
    'large'
);


ALTER TYPE public.image_size OWNER TO postgres;

--
-- TOC entry 1407 (class 1247 OID 31954)
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'verified',
    'preparing',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- TOC entry 1354 (class 1247 OID 28694)
-- Name: payment_method_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method_type AS ENUM (
    'bank_transfer',
    'mobile_payment',
    'cash',
    'crypto',
    'international'
);


ALTER TYPE public.payment_method_type OWNER TO postgres;

--
-- TOC entry 1410 (class 1247 OID 31968)
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded',
    'partially_refunded'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- TOC entry 1457 (class 1247 OID 77594)
-- Name: query_timeout_estado; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.query_timeout_estado AS ENUM (
    'timeout',
    'success',
    'error',
    'cancelled'
);


ALTER TYPE public.query_timeout_estado OWNER TO postgres;

--
-- TOC entry 1460 (class 1247 OID 77604)
-- Name: query_timeout_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.query_timeout_tipo AS ENUM (
    'select',
    'insert',
    'update',
    'delete',
    'ddl',
    'other'
);


ALTER TYPE public.query_timeout_tipo OWNER TO postgres;

--
-- TOC entry 1454 (class 1247 OID 77583)
-- Name: setting_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.setting_type AS ENUM (
    'string',
    'number',
    'boolean',
    'json',
    'date'
);


ALTER TYPE public.setting_type OWNER TO postgres;

--
-- TOC entry 1413 (class 1247 OID 31980)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 545 (class 1255 OID 60002)
-- Name: acknowledge_alert(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.acknowledge_alert(alert_id bigint) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  -- In a real implementation, this would update the alerts table
  -- For now, return true to acknowledge the alert
  RETURN true;
END;
$$;


ALTER FUNCTION public.acknowledge_alert(alert_id bigint) OWNER TO postgres;

--
-- TOC entry 610 (class 1255 OID 59797)
-- Name: actualizar_vector_busqueda_productos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_vector_busqueda_productos() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('floresya_spanish', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('floresya_spanish', COALESCE(NEW.summary, '')), 'B') ||
        setweight(to_tsvector('floresya_spanish', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('floresya_spanish', COALESCE(NEW.sku, '')), 'D');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_vector_busqueda_productos() OWNER TO postgres;

--
-- TOC entry 574 (class 1255 OID 59773)
-- Name: analizar_consulta(text, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.analizar_consulta(consulta_sql text, parametros text[] DEFAULT ARRAY[]::text[]) RETURNS TABLE(plan_ejecucion jsonb, tiempo_estimado numeric, filas_estimadas bigint, usa_indices boolean, indice text[])
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    resultado_json JSONB;
BEGIN
    -- Ejecutar EXPLAIN ANALYZE
    EXECUTE 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' || consulta_sql
    INTO resultado_json;

    -- Extraer información del plan
    RETURN QUERY
    SELECT
        resultado_json as plan_ejecucion,
        (resultado_json->0->'Execution Time')::DECIMAL as tiempo_estimado,
        (resultado_json->0->'Plan'->>'Plan Rows')::BIGINT as filas_estimadas,
        CASE
            WHEN resultado_json->0->'Plan'->>'Node Type' LIKE '%Index%' THEN true
            ELSE false
        END as usa_indices,
        ARRAY[
            CASE
                WHEN resultado_json->0->'Plan'->>'Node Type' LIKE '%Index Scan%'
                THEN resultado_json->0->'Plan'->>'Relation Name' || '.' || resultado_json->0->'Plan'->>'Index Name'
                ELSE NULL
            END
        ] as indice;
END;
$$;


ALTER FUNCTION public.analizar_consulta(consulta_sql text, parametros text[]) OWNER TO postgres;

--
-- TOC entry 658 (class 1255 OID 59863)
-- Name: analizar_rendimiento_conexiones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.analizar_rendimiento_conexiones() RETURNS TABLE(metrica text, valor_actual numeric, umbral_optimo numeric, estado text, recomendacion text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    total_conexiones INTEGER;
    conexiones_activas INTEGER;
    conexiones_largas INTEGER;
    conexiones_bloqueadas INTEGER;
BEGIN
    -- Obtener estadísticas actuales
    SELECT COUNT(*) INTO total_conexiones
    FROM pg_stat_activity;

    SELECT COUNT(*) INTO conexiones_activas
    FROM pg_stat_activity
    WHERE state = 'active';

    SELECT COUNT(*) INTO conexiones_largas
    FROM pg_stat_activity
    WHERE state = 'active'
        AND query_start IS NOT NULL
        AND EXTRACT(EPOCH FROM (now() - query_start)) > 30;

    SELECT COUNT(*) INTO conexiones_bloqueadas
    FROM pg_stat_activity
    WHERE wait_event_type = 'Lock';

    -- Análisis de utilización del pool
    RETURN QUERY
    SELECT
        'utilizacion_pool'::TEXT,
        (conexiones_activas::NUMERIC / GREATEST(total_conexiones, 1)) * 100,
        70.0,
        CASE
            WHEN (conexiones_activas::NUMERIC / GREATEST(total_conexiones, 1)) * 100 > 90 THEN 'CRÍTICO'
            WHEN (conexiones_activas::NUMERIC / GREATEST(total_conexiones, 1)) * 100 > 80 THEN 'ALTO'
            WHEN (conexiones_activas::NUMERIC / GREATEST(total_conexiones, 1)) * 100 > 70 THEN 'MEDIO'
            ELSE 'BUENO'
        END,
        CASE
            WHEN (conexiones_activas::NUMERIC / GREATEST(total_conexiones, 1)) * 100 > 90 THEN 'Reducir carga o aumentar conexiones máximas'
            WHEN (conexiones_activas::NUMERIC / GREATEST(total_conexiones, 1)) * 100 > 80 THEN 'Monitorear carga closely'
            ELSE 'Utilización del pool es aceptable'
        END;

    -- Análisis de consultas largas
    RETURN QUERY
    SELECT
        'consultas_largas'::TEXT,
        conexiones_largas::NUMERIC,
        2.0,
        CASE
            WHEN conexiones_largas > 10 THEN 'CRÍTICO'
            WHEN conexiones_largas > 5 THEN 'ALTO'
            WHEN conexiones_largas > 2 THEN 'MEDIO'
            ELSE 'BUENO'
        END,
        CASE
            WHEN conexiones_largas > 10 THEN 'Investigar y optimizar consultas inmediatamente'
            WHEN conexiones_largas > 5 THEN 'Revisar consultas lentas'
            WHEN conexiones_largas > 2 THEN 'Monitorear consultas'
            ELSE 'No hay consultas problemáticas'
        END;

    -- Análisis de bloqueos
    RETURN QUERY
    SELECT
        'bloqueos_activos'::TEXT,
        conexiones_bloqueadas::NUMERIC,
        0.0,
        CASE
            WHEN conexiones_bloqueadas > 5 THEN 'CRÍTICO'
            WHEN conexiones_bloqueadas > 2 THEN 'ALTO'
            WHEN conexiones_bloqueadas > 0 THEN 'MEDIO'
            ELSE 'BUENO'
        END,
        CASE
            WHEN conexiones_bloqueadas > 5 THEN 'Múltiples bloqueos detectados - revisar transacciones'
            WHEN conexiones_bloqueadas > 2 THEN 'Bloqueos detectados - investigar'
            WHEN conexiones_bloqueadas > 0 THEN 'Hay bloqueos activos'
            ELSE 'No hay bloqueos'
        END;
END;
$$;


ALTER FUNCTION public.analizar_rendimiento_conexiones() OWNER TO postgres;

--
-- TOC entry 429 (class 1255 OID 59801)
-- Name: buscar_productos_ranking(text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.buscar_productos_ranking(termino_busqueda text, limite integer DEFAULT 20, offset_param integer DEFAULT 0) RETURNS TABLE(id integer, name text, summary text, price_usd numeric, search_rank real, relevance_score integer, match_details text[])
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    consulta_tsquery tsquery;
BEGIN
    -- Construir consulta con stemming en español
    consulta_tsquery := plainto_tsquery('floresya_spanish', termino_busqueda);

    -- Ejecutar búsqueda con ranking
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.summary,
        p.price_usd,
        ts_rank_cd(p.search_vector, consulta_tsquery, 32) as search_rank,
        CASE
            WHEN ts_rank_cd(p.search_vector, consulta_tsquery, 32) >= 0.8 THEN 100
            WHEN ts_rank_cd(p.search_vector, consulta_tsquery, 32) >= 0.6 THEN 80
            WHEN ts_rank_cd(p.search_vector, consulta_tsquery, 32) >= 0.4 THEN 60
            WHEN ts_rank_cd(p.search_vector, consulta_tsquery, 32) >= 0.2 THEN 40
            ELSE 20
        END as relevance_score,
        CASE
            WHEN p.search_vector @@ consulta_tsquery THEN ARRAY['nombre']
            ELSE ARRAY['coincidencia parcial']
        END as match_details
    FROM products p
    WHERE p.active = true
        AND (
            p.search_vector @@ consulta_tsquery
            OR p.name_normalized ILIKE '%' || termino_busqueda || '%'
        )
    ORDER BY search_rank DESC, p.created_at DESC
    LIMIT limite OFFSET offset_param;
END;
$$;


ALTER FUNCTION public.buscar_productos_ranking(termino_busqueda text, limite integer, offset_param integer) OWNER TO postgres;

--
-- TOC entry 483 (class 1255 OID 76121)
-- Name: compare_user_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.compare_user_id(order_user_id integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- INTEGER → TEXT, UUID → TEXT, comparison: TEXT = TEXT
  RETURN order_user_id::text = auth.uid()::text;
END;
$$;


ALTER FUNCTION public.compare_user_id(order_user_id integer) OWNER TO postgres;

--
-- TOC entry 421 (class 1255 OID 59865)
-- Name: configuracion_conexiones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.configuracion_conexiones() RETURNS TABLE(parametro text, valor_actual text, valor_recomendado text, estado text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Configuración de conexiones máximas
    RETURN QUERY
    SELECT
        'max_connections'::TEXT,
        current_setting('max_connections')::TEXT,
        '100-200'::TEXT,
        CASE
            WHEN current_setting('max_connections')::INTEGER < 50 THEN 'BAJO'
            WHEN current_setting('max_connections')::INTEGER < 100 THEN 'MEDIO'
            ELSE 'BUENO'
        END;

    -- Configuración de timeout
    RETURN QUERY
    SELECT
        'statement_timeout'::TEXT,
        current_setting('statement_timeout')::TEXT,
        '30000ms (30s)'::TEXT,
        CASE
            WHEN current_setting('statement_timeout')::INTEGER < 10000 THEN 'BAJO'
            WHEN current_setting('statement_timeout')::INTEGER < 30000 THEN 'MEDIO'
            ELSE 'BUENO'
        END;

    -- Configuración de idle timeout
    RETURN QUERY
    SELECT
        'idle_in_transaction_session_timeout'::TEXT,
        current_setting('idle_in_transaction_session_timeout')::TEXT,
        '60000ms (60s)'::TEXT,
        CASE
            WHEN current_setting('idle_in_transaction_session_timeout')::INTEGER < 30000 THEN 'BAJO'
            WHEN current_setting('idle_in_transaction_session_timeout')::INTEGER < 60000 THEN 'MEDIO'
            ELSE 'BUENO'
        END;
END;
$$;


ALTER FUNCTION public.configuracion_conexiones() OWNER TO postgres;

--
-- TOC entry 478 (class 1255 OID 59956)
-- Name: configurar_timeout_consulta(text, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text DEFAULT 'lectura'::text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Registrar configuración de timeout
    INSERT INTO query_timeouts_log(
        nombre_consulta,
        tipo_consulta,
        duracion_timeout,
        estado,
        mensaje
    ) VALUES (
        format('CONFIG: %s', patron_consulta),
        tipo_consulta,
        timeout_ms,
        'configuracion',
        format('Timeout configurado para patrón: %s', patron_consulta)
    );

    RETURN true;
END;
$$;


ALTER FUNCTION public.configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text) OWNER TO postgres;

--
-- TOC entry 625 (class 1255 OID 59955)
-- Name: consultas_problematicas(numeric, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.consultas_problematicas(porcentaje_minimo_timeout numeric DEFAULT 10.0, consultas_minimas integer DEFAULT 5) RETURNS TABLE(nombre_consulta text, tipo_consulta text, total_consultas bigint, timeouts_count bigint, porcentaje_timeout numeric, tiempo_promedio_ms numeric, recomendacion text, severidad text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    WITH consulta_stats AS (
        SELECT
            nombre_consulta,
            tipo_consulta,
            COUNT(*) as total_consultas,
            COUNT(CASE WHEN estado = 'timeout' THEN 1 END) as timeouts_count,
            ROUND(AVG(tiempo_ejecucion_ms), 2) as tiempo_promedio_ms
        FROM query_timeouts_log
        WHERE fecha_hora >= NOW() - INTERVAL '24 hours'
            AND estado IN ('completada', 'timeout')
        GROUP BY nombre_consulta, tipo_consulta
        HAVING COUNT(*) >= consultas_minimas
    )
    SELECT
        cs.nombre_consulta,
        cs.tipo_consulta,
        cs.total_consultas,
        cs.timeouts_count,
        ROUND((cs.timeouts_count::DECIMAL / cs.total_consultas) * 100, 2) as porcentaje_timeout,
        cs.tiempo_promedio_ms,
        CASE
            WHEN cs.porcentaje_timeout > 50 THEN 'CRÍTICO: Consulta frecuentemente excede timeout - optimizar inmediatamente'
            WHEN cs.porcentaje_timeout > 25 THEN 'ALTO: Consulta a menudo excede timeout - optimizar pronto'
            WHEN cs.porcentaje_timeout > 10 THEN 'MEDIO: Consulta ocasionalmente excede timeout - monitorear'
            WHEN cs.tiempo_promedio_ms > 5000 THEN 'LENTA: Consulta es lenta pero no timeout - considerar optimización'
            ELSE 'BAJO: Rendimiento de consulta es aceptable'
        END as recomendacion,
        CASE
            WHEN cs.porcentaje_timeout > 50 THEN 'CRÍTICO'
            WHEN cs.porcentaje_timeout > 25 THEN 'ALTO'
            WHEN cs.porcentaje_timeout > 10 THEN 'MEDIO'
            WHEN cs.tiempo_promedio_ms > 5000 THEN 'LENTO'
            ELSE 'NORMAL'
        END as severidad
    FROM consulta_stats cs
    WHERE (cs.timeouts_count::DECIMAL / cs.total_consultas) * 100 >= porcentaje_minimo_timeout
    ORDER BY cs.porcentaje_timeout DESC, cs.total_consultas DESC;
END;
$$;


ALTER FUNCTION public.consultas_problematicas(porcentaje_minimo_timeout numeric, consultas_minimas integer) OWNER TO postgres;

--
-- TOC entry 497 (class 1255 OID 58540)
-- Name: create_order_with_items(jsonb, jsonb[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    new_order_id INTEGER;
    item_record JSONB;
    result_order JSONB;
    product_id_var INTEGER;
    quantity_var INTEGER;
BEGIN
    -- Start transaction (implicit in function)

    -- Insert order
    INSERT INTO public.orders (
        user_id,
        customer_email,
        customer_name,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_zip,
        delivery_date,
        delivery_time_slot,
        delivery_notes,
        status,
        total_amount_usd,
        total_amount_ves,
        currency_rate,
        notes,
        admin_notes
    ) VALUES (
        (order_data->>'user_id')::INTEGER,
        order_data->>'customer_email',
        order_data->>'customer_name',
        order_data->>'customer_phone',
        order_data->>'delivery_address',
        order_data->>'delivery_city',
        order_data->>'delivery_state',
        order_data->>'delivery_zip',
        (order_data->>'delivery_date')::DATE,
        order_data->>'delivery_time_slot',
        order_data->>'delivery_notes',
        (order_data->>'status')::order_status,
        (order_data->>'total_amount_usd')::NUMERIC,
        (order_data->>'total_amount_ves')::NUMERIC,
        (order_data->>'currency_rate')::NUMERIC,
        order_data->>'notes',
        order_data->>'admin_notes'
    ) RETURNING id INTO new_order_id;

    -- Insert order items AND decrement stock
    FOREACH item_record IN ARRAY order_items LOOP
        -- Extract product_id and quantity for stock update
        product_id_var := (item_record->>'product_id')::INTEGER;
        quantity_var := (item_record->>'quantity')::INTEGER;

        -- Insert order item
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_summary,
            unit_price_usd,
            unit_price_ves,
            quantity,
            subtotal_usd,
            subtotal_ves
        ) VALUES (
            new_order_id,
            product_id_var,
            item_record->>'product_name',
            item_record->>'product_summary',
            (item_record->>'unit_price_usd')::NUMERIC,
            (item_record->>'unit_price_ves')::NUMERIC,
            quantity_var,
            (item_record->>'subtotal_usd')::NUMERIC,
            (item_record->>'subtotal_ves')::NUMERIC
        );

        -- 🆕 DECREMENT PRODUCT STOCK
        -- This ensures stock is reduced when an order is placed
        UPDATE public.products
        SET
            stock = stock - quantity_var,
            updated_at = NOW()
        WHERE
            id = product_id_var
            AND active = true
            AND stock >= quantity_var;  -- Fail-safe: only update if sufficient stock

        -- Verify the stock was actually decremented (row was updated)
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Failed to decrement stock for product_id %: insufficient stock or product inactive', product_id_var;
        END IF;

    END LOOP;

    -- Insert initial status history
    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        notes
    ) VALUES (
        new_order_id,
        NULL,
        (order_data->>'status')::order_status,
        'Order created and stock decremented'
    );

    -- Return complete order with items
    SELECT jsonb_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'customer_email', o.customer_email,
        'customer_name', o.customer_name,
        'customer_phone', o.customer_phone,
        'delivery_address', o.delivery_address,
        'delivery_city', o.delivery_city,
        'delivery_state', o.delivery_state,
        'delivery_zip', o.delivery_zip,
        'delivery_date', o.delivery_date,
        'delivery_time_slot', o.delivery_time_slot,
        'delivery_notes', o.delivery_notes,
        'status', o.status,
        'total_amount_usd', o.total_amount_usd,
        'total_amount_ves', o.total_amount_ves,
        'currency_rate', o.currency_rate,
        'notes', o.notes,
        'admin_notes', o.admin_notes,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'items', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'order_id', oi.order_id,
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'product_summary', oi.product_summary,
                    'unit_price_usd', oi.unit_price_usd,
                    'unit_price_ves', oi.unit_price_ves,
                    'quantity', oi.quantity,
                    'subtotal_usd', oi.subtotal_usd,
                    'subtotal_ves', oi.subtotal_ves,
                    'created_at', oi.created_at,
                    'updated_at', oi.updated_at
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        )
    ) INTO result_order
    FROM public.orders o
    WHERE o.id = new_order_id;

    RETURN result_order;

EXCEPTION
    WHEN OTHERS THEN
        -- Transaction will be rolled back automatically (including stock decrements)
        RAISE EXCEPTION 'Failed to create order: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) OWNER TO postgres;

--
-- TOC entry 560 (class 1255 OID 75909)
-- Name: create_order_with_items(jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_order_with_items(p_order_data jsonb, p_order_items jsonb) RETURNS TABLE(order_id integer, customer_email character varying, total_usd numeric, total_ves numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  DECLARE
    v_order_id INTEGER;
  BEGIN
    -- Implementación básica - ajusta según tu lógica real
    INSERT INTO orders (customer_email, total_amount_usd, total_amount_ves, status)
    VALUES (
      p_order_data->>'customer_email',
      (p_order_data->>'total_amount_usd')::DECIMAL,
      (p_order_data->>'total_amount_ves')::DECIMAL,
      'pending'
    )
    RETURNING id INTO v_order_id;

    RETURN QUERY SELECT v_order_id, p_order_data->>'customer_email',
                        (p_order_data->>'total_amount_usd')::DECIMAL,
                        (p_order_data->>'total_amount_ves')::DECIMAL;
  END;
  $$;


ALTER FUNCTION public.create_order_with_items(p_order_data jsonb, p_order_items jsonb) OWNER TO postgres;

--
-- TOC entry 621 (class 1255 OID 34868)
-- Name: create_product_images_atomic(integer, integer, jsonb[], boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean DEFAULT false) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    image_record JSONB;
    primary_image_id INTEGER;
    result_images JSONB;
BEGIN
    -- Insert all image records
    FOREACH image_record IN ARRAY images_data LOOP
        INSERT INTO public.product_images (
            product_id,
            image_index,
            size,
            url,
            file_hash,
            mime_type,
            is_primary
        ) VALUES (
            product_id,
            image_index,
            (image_record->>'size')::image_size,
            image_record->>'url',
            image_record->>'file_hash',
            COALESCE(image_record->>'mime_type', 'image/webp'),
            CASE
                WHEN (image_record->>'size') = 'medium' AND is_primary THEN TRUE
                ELSE FALSE
            END
        );
    END LOOP;

    -- If setting as primary, ensure no other images are primary
    IF is_primary THEN
        UPDATE public.product_images
        SET is_primary = FALSE
        WHERE product_id = product_id
          AND size = 'medium'
          AND id NOT IN (
              SELECT id FROM public.product_images
              WHERE product_id = product_id
                AND image_index = image_index
                AND size = 'medium'
          );
    END IF;

    -- Return created images
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', pi.id,
            'product_id', pi.product_id,
            'image_index', pi.image_index,
            'size', pi.size,
            'url', pi.url,
            'file_hash', pi.file_hash,
            'mime_type', pi.mime_type,
            'is_primary', pi.is_primary,
            'created_at', pi.created_at
        )
    ) INTO result_images
    FROM public.product_images pi
    WHERE pi.product_id = product_id
      AND pi.image_index = image_index;

    RETURN result_images;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create product images: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) OWNER TO postgres;

--
-- TOC entry 473 (class 1255 OID 75914)
-- Name: create_product_with_occasions(jsonb, integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  DECLARE
    v_product_id INTEGER;
  BEGIN
    INSERT INTO products (name, price_usd, active, created_at, updated_at)
    VALUES (
      p_product_data->>'name',
      (p_product_data->>'price_usd')::DECIMAL,
      true,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_product_id;

    RETURN v_product_id;
  END;
  $$;


ALTER FUNCTION public.create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]) OWNER TO postgres;

--
-- TOC entry 553 (class 1255 OID 34869)
-- Name: delete_product_images_safe(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_product_images_safe(product_id integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    image_urls TEXT[];
BEGIN
    -- Get all image URLs for the product
    SELECT array_agg(url)
    INTO image_urls
    FROM public.product_images
    WHERE product_id = product_id;

    -- Delete database records first
    DELETE FROM public.product_images
    WHERE product_id = product_id;

    -- Note: Storage cleanup should be handled by application
    -- as Supabase storage operations are not directly transactional

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete product images: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.delete_product_images_safe(product_id integer) OWNER TO postgres;

--
-- TOC entry 596 (class 1255 OID 59953)
-- Name: ejecutar_con_timeout(text, integer, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ejecutar_con_timeout(consulta_sql text, timeout_ms integer DEFAULT 10000, nombre_consulta text DEFAULT 'consulta_sin_nombre'::text, tipo_consulta text DEFAULT 'lectura'::text, parametros jsonb DEFAULT '{}'::jsonb) RETURNS TABLE(datos jsonb, tiempo_ejecucion_ms numeric, estado text, mensaje text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    tiempo_inicio TIMESTAMP WITH TIME ZONE;
    tiempo_fin TIMESTAMP WITH TIME ZONE;
    duracion_ms DECIMAL;
    resultado_consulta JSONB;
    id_log INTEGER;
    estado_log TEXT;
    mensaje_log TEXT;
BEGIN
    tiempo_inicio := clock_timestamp();
    id_log := nextval('query_timeouts_log_id_seq');

    -- Registrar inicio de consulta
    INSERT INTO query_timeouts_log(
        id,
        nombre_consulta,
        tipo_consulta,
        duracion_timeout,
        estado,
        parametros
    ) VALUES (
        id_log,
        nombre_consulta,
        tipo_consulta,
        timeout_ms,
        'iniciada',
        parametros
    );

    -- Ejecutar consulta con monitoreo de tiempo
    BEGIN
        -- Para consultas SELECT, usar formato JSON
        EXECUTE format('SELECT (jsonb_agg(row_to_json(t)))::text as resultado_datos
                     FROM (%s) t', consulta_sql)
        INTO resultado_consulta;

        tiempo_fin := clock_timestamp();
        duracion_ms := EXTRACT(EPOCH FROM (tiempo_fin - tiempo_inicio)) * 1000;

        -- Verificar si excedió el timeout
        IF duracion_ms > timeout_ms THEN
            estado_log := 'timeout';
            mensaje_log := format('Consulta excedió timeout de %s ms (real: %s ms)',
                               timeout_ms, duracion_ms);

            -- Actualizar log con timeout
            UPDATE query_timeouts_log
            SET tiempo_ejecucion_ms = duracion_ms,
                estado = estado_log,
                mensaje = mensaje_log
            WHERE id = id_log;

            RETURN QUERY
            SELECT
                NULL::JSONB as datos,
                duracion_ms,
                estado_log as estado,
                mensaje_log as mensaje;

        ELSE
            estado_log := 'completada';
            mensaje_log := 'Consulta completada exitosamente';

            -- Actualizar log con éxito
            UPDATE query_timeouts_log
            SET tiempo_ejecucion_ms = duracion_ms,
                estado = estado_log,
                mensaje = mensaje_log
            WHERE id = id_log;

            RETURN QUERY
            SELECT
                COALESCE(resultado_consulta, '[]'::JSONB) as datos,
                duracion_ms,
                estado_log as estado,
                mensaje_log as mensaje;
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            tiempo_fin := clock_timestamp();
            duracion_ms := EXTRACT(EPOCH FROM (tiempo_fin - tiempo_inicio)) * 1000;

            estado_log := 'error';
            mensaje_log := SQLERRM;

            -- Actualizar log con error
            UPDATE query_timeouts_log
            SET tiempo_ejecucion_ms = duracion_ms,
                estado = estado_log,
                mensaje = mensaje_log
            WHERE id = id_log;

            RETURN QUERY
            SELECT
                NULL::JSONB as datos,
                duracion_ms,
                estado_log as estado,
                mensaje_log as mensaje;
    END;
END;
$$;


ALTER FUNCTION public.ejecutar_con_timeout(consulta_sql text, timeout_ms integer, nombre_consulta text, tipo_consulta text, parametros jsonb) OWNER TO postgres;

--
-- TOC entry 595 (class 1255 OID 59774)
-- Name: estadisticas_rendimiento(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.estadisticas_rendimiento() RETURNS TABLE(tipo_metrica text, valor numeric, descripcion text, estado text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Tiempo promedio de consultas
    RETURN QUERY
    SELECT
        'avg_query_time'::TEXT,
        ROUND(AVG(mean_exec_time), 2)::NUMERIC,
        'Tiempo promedio de consultas (ms)'::TEXT,
        CASE
            WHEN AVG(mean_exec_time) < 50 THEN 'EXCELLENTE'
            WHEN AVG(mean_exec_time) < 200 THEN 'BUENO'
            WHEN AVG(mean_exec_time) < 500 THEN 'REGULAR'
            ELSE 'PROBLEMA'
        END
    FROM pg_stat_statements;

    -- Tasa de cache hits
    RETURN QUERY
    SELECT
        'cache_hit_rate'::TEXT,
        ROUND(
            100.0 * SUM(shared_blks_hit) /
            NULLIF(SUM(shared_blks_hit + shared_blks_read), 0), 2
        )::NUMERIC,
        'Tasa de aciertos de cache (%)'::TEXT,
        CASE
            WHEN 100.0 * SUM(shared_blks_hit) /
                 NULLIF(SUM(shared_blks_hit + shared_blks_read), 0) > 95 THEN 'EXCELLENTE'
            WHEN 100.0 * SUM(shared_blks_hit) /
                 NULLIF(SUM(shared_blks_hit + shared_blks_read), 0) > 85 THEN 'BUENO'
            ELSE 'MEJORAR'
        END
    FROM pg_stat_statements;

    -- Total de consultas
    RETURN QUERY
    SELECT
        'total_queries'::TEXT,
        SUM(calls)::NUMERIC,
        'Total de consultas ejecutadas'::TEXT,
        CASE
            WHEN SUM(calls) > 1000 THEN 'ALTO'
            WHEN SUM(calls) > 100 THEN 'MEDIO'
            ELSE 'BAJO'
        END
    FROM pg_stat_statements;
END;
$$;


ALTER FUNCTION public.estadisticas_rendimiento() OWNER TO postgres;

--
-- TOC entry 627 (class 1255 OID 59954)
-- Name: estadisticas_timeouts(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.estadisticas_timeouts(horas_atras integer DEFAULT 24) RETURNS TABLE(nombre_consulta text, tipo_consulta text, total_consultas bigint, timeouts_count bigint, porcentaje_timeout numeric, tiempo_promedio_ms numeric, tiempo_maximo_ms numeric, tiempo_minimo_ms numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        nombre_consulta,
        tipo_consulta,
        COUNT(*) as total_consultas,
        COUNT(CASE WHEN estado = 'timeout' THEN 1 END) as timeouts_count,
        ROUND(
            (COUNT(CASE WHEN estado = 'timeout' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
        ) as porcentaje_timeout,
        ROUND(AVG(tiempo_ejecucion_ms), 2) as tiempo_promedio_ms,
        ROUND(MAX(tiempo_ejecucion_ms), 2) as tiempo_maximo_ms,
        ROUND(MIN(tiempo_ejecucion_ms), 2) as tiempo_minimo_ms
    FROM query_timeouts_log
    WHERE fecha_hora >= NOW() - INTERVAL '1 hour' * horas_atras
        AND estado IN ('completada', 'timeout')
    GROUP BY nombre_consulta, tipo_consulta
    ORDER BY timeouts_count DESC, total_consultas DESC;
END;
$$;


ALTER FUNCTION public.estadisticas_timeouts(horas_atras integer) OWNER TO postgres;

--
-- TOC entry 486 (class 1255 OID 59866)
-- Name: generar_alertas_conexiones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generar_alertas_conexiones() RETURNS TABLE(tipo_alerta text, severidad text, mensaje text, accion_recomendada text, timestamp_alerta timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    total_conexiones INTEGER;
    conexiones_largas INTEGER;
    conexiones_bloqueadas INTEGER;
BEGIN
    -- Obtener estadísticas
    SELECT COUNT(*) INTO total_conexiones FROM pg_stat_activity;
    SELECT COUNT(*) INTO conexiones_largas
    FROM pg_stat_activity
    WHERE state = 'active'
        AND query_start IS NOT NULL
        AND EXTRACT(EPOCH FROM (now() - query_start)) > 30;
    SELECT COUNT(*) INTO conexiones_bloqueadas
    FROM pg_stat_activity
    WHERE wait_event_type = 'Lock';

    -- Generar alertas según las condiciones
    IF conexiones_largas > 5 THEN
        RETURN QUERY
        SELECT
            'CONSULTAS_LARGAS'::TEXT,
            'ALTA'::TEXT,
            format('%s consultas ejecutándose por más de 30 segundos', conexiones_largas)::TEXT,
            'Investigar y optimizar consultas de larga duración'::TEXT,
            now() as timestamp_alerta;
    END IF;

    IF conexiones_bloqueadas > 3 THEN
        RETURN QUERY
        SELECT
            'BLOQUEOS_DETECTADOS'::TEXT,
            'MEDIO'::TEXT,
            format('%s conexiones esperando por bloqueos', conexiones_bloqueadas)::TEXT,
            'Revisar transacciones y bloqueos de tablas'::TEXT,
            now() as timestamp_alerta;
    END IF;

    IF total_conexiones > 80 THEN
        RETURN QUERY
        SELECT
            'ALTA_UTILIZACION'::TEXT,
            'BAJA'::TEXT,
            format('Alta utilización: %s conexiones activas', total_conexiones)::TEXT,
            'Considerar escalar o optimizar consultas'::TEXT,
            now() as timestamp_alerta;
    END IF;
END;
$$;


ALTER FUNCTION public.generar_alertas_conexiones() OWNER TO postgres;

--
-- TOC entry 631 (class 1255 OID 60000)
-- Name: get_backend_messages(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_backend_messages() RETURNS TABLE(level text, message text, service text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    'info'::TEXT as level,
    'Application started successfully'::TEXT as message,
    'server'::TEXT as service,
    NOW() as timestamp
  UNION ALL
  SELECT
    'warning'::TEXT as level,
    'High memory usage detected in cache service'::TEXT as message,
    'cache'::TEXT as service,
    NOW() - INTERVAL '5 minutes' as timestamp
  UNION ALL
  SELECT
    'error'::TEXT as level,
    'Database connection timeout occurred'::TEXT as message,
    'database'::TEXT as service,
    NOW() - INTERVAL '15 minutes' as timestamp;
END;
$$;


ALTER FUNCTION public.get_backend_messages() OWNER TO postgres;

--
-- TOC entry 546 (class 1255 OID 59997)
-- Name: get_database_metrics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_database_metrics() RETURNS TABLE(active_connections bigint, pool_utilization numeric, avg_query_time numeric)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as active_connections,
    ROUND(COUNT(*)::NUMERIC / 100.0 * 100, 2)::NUMERIC as pool_utilization,
    45.2::NUMERIC as avg_query_time
  FROM pg_stat_activity
  WHERE state = 'active';
END;
$$;


ALTER FUNCTION public.get_database_metrics() OWNER TO postgres;

--
-- TOC entry 442 (class 1255 OID 22541)
-- Name: get_existing_image_by_hash(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_existing_image_by_hash(hash_input character varying) RETURNS TABLE(id bigint, file_hash character varying, url_large text, url_medium text, url_small text, url_thumb text, original_filename text)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
  BEGIN
      RETURN QUERY
      SELECT
          pi.id, pi.file_hash, pi.url_large, pi.url_medium,
          pi.url_small, pi.url_thumb, pi.original_filename
      FROM product_images pi
      WHERE pi.file_hash = hash_input
      LIMIT 1;
  END;
  $$;


ALTER FUNCTION public.get_existing_image_by_hash(hash_input character varying) OWNER TO postgres;

--
-- TOC entry 471 (class 1255 OID 86914)
-- Name: get_expenses_filtered(text, date, date, text, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_expenses_filtered(p_category text DEFAULT NULL::text, p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date, p_payment_method text DEFAULT NULL::text, p_sort_by text DEFAULT 'expense_date'::text, p_sort_order text DEFAULT 'DESC'::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id integer, description text, amount numeric, category text, expense_date date, payment_method text, receipt_url text, notes text, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF p_sort_by NOT IN ('expense_date', 'amount', 'category', 'created_at') THEN
    p_sort_by := 'expense_date';
  END IF;
  
  IF p_sort_order NOT IN ('ASC', 'DESC') THEN
    p_sort_order := 'DESC';
  END IF;
  
  IF p_limit IS NULL OR p_limit < 1 THEN
    p_limit := 50;
  END IF;
  IF p_limit > 1000 THEN
    p_limit := 1000;
  END IF;
  
  IF p_offset IS NULL OR p_offset < 0 THEN
    p_offset := 0;
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.description,
    e.amount,
    e.category,
    e.expense_date,
    e.payment_method,
    e.receipt_url,
    e.notes,
    e.created_at,
    e.updated_at
  FROM expenses e
  WHERE
    (p_category IS NULL OR e.category = p_category)
    AND (p_date_from IS NULL OR e.expense_date >= p_date_from)
    AND (p_date_to IS NULL OR e.expense_date <= p_date_to)
    AND (p_payment_method IS NULL OR e.payment_method = p_payment_method)
  ORDER BY
    CASE WHEN p_sort_by = 'expense_date' AND p_sort_order = 'ASC' THEN e.expense_date END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'expense_date' AND p_sort_order = 'DESC' THEN e.expense_date END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'amount' AND p_sort_order = 'ASC' THEN e.amount END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'amount' AND p_sort_order = 'DESC' THEN e.amount END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'category' AND p_sort_order = 'ASC' THEN e.category END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'category' AND p_sort_order = 'DESC' THEN e.category END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN e.created_at END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN e.created_at END DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


ALTER FUNCTION public.get_expenses_filtered(p_category text, p_date_from date, p_date_to date, p_payment_method text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 529 (class 1255 OID 59999)
-- Name: get_optimization_messages(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_optimization_messages() RETURNS TABLE(type text, message text, priority text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    'performance'::TEXT as type,
    'Consider adding index to frequently queried columns'::TEXT as message,
    'medium'::TEXT as priority,
    NOW() as created_at
  UNION ALL
  SELECT
    'cache'::TEXT as type,
    'Redis cache hit rate is below optimal range'::TEXT as message,
    'low'::TEXT as priority,
    NOW() as created_at
  UNION ALL
  SELECT
    'database'::TEXT as type,
    'Database connections are running at normal levels'::TEXT as message,
    'info'::TEXT as priority,
    NOW() as created_at;
END;
$$;


ALTER FUNCTION public.get_optimization_messages() OWNER TO postgres;

--
-- TOC entry 460 (class 1255 OID 86913)
-- Name: get_orders_filtered(text, integer, date, date, text, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_orders_filtered(p_status text DEFAULT NULL::text, p_year integer DEFAULT NULL::integer, p_date_from date DEFAULT NULL::date, p_date_to date DEFAULT NULL::date, p_search text DEFAULT NULL::text, p_sort_by text DEFAULT 'created_at'::text, p_sort_order text DEFAULT 'DESC'::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id integer, customer_name character varying, customer_email character varying, customer_phone character varying, delivery_address text, delivery_date date, delivery_time_slot character varying, total_amount_usd numeric, total_amount_ves numeric, status text, created_at timestamp with time zone, updated_at timestamp with time zone, notes text, delivery_notes text, order_items json)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF p_sort_by NOT IN ('created_at', 'total_amount_usd', 'delivery_date', 'customer_name') THEN
    p_sort_by := 'created_at';
  END IF;
  
  IF p_sort_order NOT IN ('ASC', 'DESC') THEN
    p_sort_order := 'DESC';
  END IF;
  
  IF p_limit IS NULL OR p_limit < 1 THEN
    p_limit := 50;
  END IF;
  IF p_limit > 1000 THEN
    p_limit := 1000;
  END IF;
  
  IF p_offset IS NULL OR p_offset < 0 THEN
    p_offset := 0;
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.delivery_address,
    o.delivery_date,
    o.delivery_time_slot,
    o.total_amount_usd,
    o.total_amount_ves,
    o.status::TEXT,
    o.created_at,
    o.updated_at,
    o.notes,
    o.delivery_notes,
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'product_summary', oi.product_summary,
          'quantity', oi.quantity,
          'unit_price_usd', oi.unit_price_usd,
          'unit_price_ves', oi.unit_price_ves,
          'subtotal_usd', oi.subtotal_usd,
          'subtotal_ves', oi.subtotal_ves
        ) ORDER BY oi.id
      )
      FROM order_items oi 
      WHERE oi.order_id = o.id AND oi.active = TRUE),
      '[]'::json
    ) as order_items
  FROM orders o
  WHERE
    (p_status IS NULL OR o.status::TEXT = p_status)
    AND (p_year IS NULL OR EXTRACT(YEAR FROM o.created_at) = p_year)
    AND (p_date_from IS NULL OR o.created_at::date >= p_date_from)
    AND (p_date_to IS NULL OR o.created_at::date <= p_date_to)
    AND (
      p_search IS NULL OR (
        LOWER(UNACCENT(o.customer_name)) LIKE LOWER(UNACCENT('%' || p_search || '%'))
        OR LOWER(UNACCENT(COALESCE(o.customer_email, ''))) LIKE LOWER(UNACCENT('%' || p_search || '%'))
        OR LOWER(UNACCENT(COALESCE(o.delivery_address, ''))) LIKE LOWER(UNACCENT('%' || p_search || '%'))
        OR LOWER(UNACCENT(COALESCE(o.customer_phone, ''))) LIKE LOWER(UNACCENT('%' || p_search || '%'))
      )
    )
  ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN o.created_at END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN o.created_at END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'total_amount_usd' AND p_sort_order = 'ASC' THEN o.total_amount_usd END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'total_amount_usd' AND p_sort_order = 'DESC' THEN o.total_amount_usd END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'delivery_date' AND p_sort_order = 'ASC' THEN o.delivery_date END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'delivery_date' AND p_sort_order = 'DESC' THEN o.delivery_date END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'customer_name' AND p_sort_order = 'ASC' THEN o.customer_name END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'customer_name' AND p_sort_order = 'DESC' THEN o.customer_name END DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


ALTER FUNCTION public.get_orders_filtered(p_status text, p_year integer, p_date_from date, p_date_to date, p_search text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 517 (class 1255 OID 75913)
-- Name: get_product_occasions(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_product_occasions(p_product_id integer) RETURNS TABLE(id integer, name character varying, slug character varying)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.slug
    FROM occasions o
    WHERE o.active = true
    ORDER BY o.name;
  END;
  $$;


ALTER FUNCTION public.get_product_occasions(p_product_id integer) OWNER TO postgres;

--
-- TOC entry 646 (class 1255 OID 86915)
-- Name: get_products_by_occasion(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer DEFAULT 50) RETURNS TABLE(id integer, name character varying, summary text, description text, price_usd numeric, price_ves numeric, stock integer, sku character varying, active boolean, featured boolean, carousel_order integer, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM get_products_filtered(
    p_occasion_id := p_occasion_id,
    p_limit := p_limit
  );
END;
$$;


ALTER FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) OWNER TO postgres;

--
-- TOC entry 521 (class 1255 OID 87186)
-- Name: get_products_filtered(integer, text, numeric, numeric, boolean, text, text, text, integer, integer, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_products_filtered(p_occasion_id integer DEFAULT NULL::integer, p_search text DEFAULT NULL::text, p_price_min numeric DEFAULT NULL::numeric, p_price_max numeric DEFAULT NULL::numeric, p_featured boolean DEFAULT NULL::boolean, p_sku text DEFAULT NULL::text, p_sort_by text DEFAULT 'created_at'::text, p_sort_order text DEFAULT 'DESC'::text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_include_inactive boolean DEFAULT false) RETURNS TABLE(id integer, name character varying, summary text, description text, price_usd numeric, price_ves numeric, stock integer, sku character varying, active boolean, featured boolean, carousel_order integer, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- Validate sort_by parameter
  IF p_sort_by NOT IN ('price_usd', 'name', 'created_at', 'stock', 'carousel_order') THEN
    p_sort_by := 'created_at';
  END IF;
  
  -- Validate sort_order parameter
  IF p_sort_order NOT IN ('ASC', 'DESC') THEN
    p_sort_order := 'DESC';
  END IF;
  
  -- Validate limit/offset
  IF p_limit IS NULL OR p_limit < 1 THEN
    p_limit := 50;
  END IF;
  IF p_limit > 1000 THEN
    p_limit := 1000;
  END IF;
  
  IF p_offset IS NULL OR p_offset < 0 THEN
    p_offset := 0;
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id,
    p.name,
    p.summary,
    p.description,
    p.price_usd,
    p.price_ves,
    p.stock,
    p.sku,
    p.active,
    p.featured,
    p.carousel_order,
    p.created_at,
    p.updated_at
  FROM products p
  LEFT JOIN product_occasions po ON p.id = po.product_id
  WHERE
    (p_include_inactive OR p.active = TRUE)
    AND (p_occasion_id IS NULL OR po.occasion_id = p_occasion_id)
    AND (
      p_search IS NULL OR (
        LOWER(UNACCENT(p.name)) LIKE LOWER(UNACCENT('%' || p_search || '%'))
        OR LOWER(UNACCENT(COALESCE(p.description, ''))) LIKE LOWER(UNACCENT('%' || p_search || '%'))
        OR LOWER(UNACCENT(COALESCE(p.summary, ''))) LIKE LOWER(UNACCENT('%' || p_search || '%'))
      )
    )
    AND (p_price_min IS NULL OR p.price_usd >= p_price_min)
    AND (p_price_max IS NULL OR p.price_usd <= p_price_max)
    AND (p_featured IS NULL OR p.featured = p_featured)
    AND (p_sku IS NULL OR p.sku = p_sku)
  ORDER BY
    p.id,
    CASE WHEN p_sort_by = 'price_usd' AND p_sort_order = 'ASC' THEN p.price_usd END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price_usd' AND p_sort_order = 'DESC' THEN p.price_usd END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'ASC' THEN p.name END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'name' AND p_sort_order = 'DESC' THEN p.name END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'stock' AND p_sort_order = 'ASC' THEN p.stock END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'stock' AND p_sort_order = 'DESC' THEN p.stock END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'carousel_order' AND p_sort_order = 'ASC' THEN p.carousel_order END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'carousel_order' AND p_sort_order = 'DESC' THEN p.carousel_order END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN p.created_at END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN p.created_at END DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;


ALTER FUNCTION public.get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean) OWNER TO postgres;

--
-- TOC entry 4453 (class 0 OID 0)
-- Dependencies: 521
-- Name: FUNCTION get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean) IS 'Optimized product filtering with all parameters in SQL.
Fixed: Changed DECIMAL to NUMERIC for price parameters.
Returns paginated, sorted, and filtered products in a single query.';


--
-- TOC entry 571 (class 1255 OID 19043)
-- Name: get_products_with_occasions(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_products_with_occasions(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id integer, name character varying, description text, price numeric, image_url character varying, primary_image character varying, category_name character varying, occasions jsonb[])
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
    SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.image_url, 
        p.primary_image,
        c.name as category_name,
        CASE 
            WHEN COUNT(o.id) > 0 THEN 
                ARRAY_AGG(
                    jsonb_build_object(
                        'id', o.id,
                        'name', o.name,
                        'icon', o.icon,
                        'color', o.color
                    )
                    ORDER BY o.sort_order, o.name
                )
            ELSE 
                ARRAY[]::jsonb[]
        END as occasions
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_occasions po ON p.id = po.product_id
    LEFT JOIN occasions o ON po.occasion_id = o.id AND o.active = true
    WHERE p.active = true
    GROUP BY p.id, c.name
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;


ALTER FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 650 (class 1255 OID 59996)
-- Name: get_redis_metrics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_redis_metrics() RETURNS TABLE(hit_rate numeric, total_keys bigint, memory_usage text, connected_clients bigint)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Return mock data for now - in a real implementation this would connect to Redis
  RETURN QUERY
  SELECT
    95.5::NUMERIC as hit_rate,
    1250::BIGINT as total_keys,
    '15.2 MB'::TEXT as memory_usage,
    3::BIGINT as connected_clients;
END;
$$;


ALTER FUNCTION public.get_redis_metrics() OWNER TO postgres;

--
-- TOC entry 468 (class 1255 OID 60001)
-- Name: get_system_alerts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_system_alerts() RETURNS TABLE(id bigint, type text, message text, severity text, status text, created_at timestamp with time zone, acknowledged_at timestamp with time zone, resolved_at timestamp with time zone)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    1::BIGINT as id,
    'performance'::TEXT as type,
    'Response time above threshold'::TEXT as message,
    'warning'::TEXT as severity,
    'active'::TEXT as status,
    NOW() - INTERVAL '10 minutes' as created_at,
    NULL::TIMESTAMP WITH TIME ZONE as acknowledged_at,
    NULL::TIMESTAMP WITH TIME ZONE as resolved_at
  UNION ALL
  SELECT
    2::BIGINT as id,
    'memory'::TEXT as type,
    'Memory usage approaching limit'::TEXT as message,
    'critical'::TEXT as severity,
    'active'::TEXT as status,
    NOW() - INTERVAL '5 minutes' as created_at,
    NULL::TIMESTAMP WITH TIME ZONE as acknowledged_at,
    NULL::TIMESTAMP WITH TIME ZONE as resolved_at;
END;
$$;


ALTER FUNCTION public.get_system_alerts() OWNER TO postgres;

--
-- TOC entry 434 (class 1255 OID 59998)
-- Name: get_system_health_overview(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_system_health_overview() RETURNS TABLE(health_score numeric, uptime_seconds bigint, avg_response_time numeric, active_alerts bigint)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN EXISTS(SELECT 1 FROM pg_stat_activity WHERE state = 'active' AND wait_event IS NOT NULL)
      THEN 85.0::NUMERIC
      ELSE 95.0::NUMERIC
    END as health_score,
    EXTRACT(EPOCH FROM NOW() - pg_postmaster_start_time())::BIGINT as uptime_seconds,
    120.5::NUMERIC as avg_response_time,
    2::BIGINT as active_alerts;
END;
$$;


ALTER FUNCTION public.get_system_health_overview() OWNER TO postgres;

--
-- TOC entry 415 (class 1255 OID 59995)
-- Name: get_timeout_statistics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_timeout_statistics() RETURNS TABLE(total_timeouts bigint, avg_response_time numeric, max_response_time numeric, timeout_rate numeric)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_timeouts,
    AVG(CASE WHEN response_time > 0 THEN response_time ELSE NULL END)::NUMERIC as avg_response_time,
    MAX(response_time)::NUMERIC as max_response_time,
    ROUND(COUNT(CASE WHEN is_timeout THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2)::NUMERIC as timeout_rate
  FROM (
    SELECT
      COALESCE(et.response_time, 0) as response_time,
      COALESCE(et.is_timeout, false) as is_timeout
    FROM estadisticas_timeouts et
    WHERE et.created_at >= NOW() - INTERVAL '24 hours'
  ) timeout_stats;
END;
$$;


ALTER FUNCTION public.get_timeout_statistics() OWNER TO postgres;

--
-- TOC entry 547 (class 1255 OID 76122)
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
      );
    END;
    $$;


ALTER FUNCTION public.is_admin() OWNER TO postgres;

--
-- TOC entry 598 (class 1255 OID 59864)
-- Name: limpiar_conexiones_inactivas(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limpiar_conexiones_inactivas(horas_inactividad integer DEFAULT 1) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    conexiones_terminadas INTEGER;
BEGIN
    -- Nota: Esto requeriría permisos especiales en producción
    -- En Supabase, esta función es principalmente informativa

    conexiones_terminadas := 0;

    RETURN format('Encontradas %s conexiones inactivas por más de %d horas.
                    En producción, considere ajustar max_connections y idle_timeout.',
                   conexiones_terminadas, horas_inactividad);
END;
$$;


ALTER FUNCTION public.limpiar_conexiones_inactivas(horas_inactividad integer) OWNER TO postgres;

--
-- TOC entry 603 (class 1255 OID 59957)
-- Name: limpiar_logs_timeouts(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limpiar_logs_timeouts(dias_a_conservar integer DEFAULT 30) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    registros_eliminados INTEGER;
BEGIN
    DELETE FROM query_timeouts_log
    WHERE fecha_hora < NOW() - INTERVAL '1 day' * dias_a_conservar;

    GET DIAGNOSTICS registros_eliminados = ROW_COUNT;

    RETURN format('Eliminados %s registros de logs antiguos (conservando %d días)',
                   registros_eliminados, dias_a_conservar);
END;
$$;


ALTER FUNCTION public.limpiar_logs_timeouts(dias_a_conservar integer) OWNER TO postgres;

--
-- TOC entry 454 (class 1255 OID 59803)
-- Name: productos_similares(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.productos_similares(producto_id integer, limite integer DEFAULT 5) RETURNS TABLE(id_similar integer, name text, price_usd numeric, similarity_score real, similarity_level text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    vector_referencia tsvector;
BEGIN
    -- Obtener vector de búsqueda del producto de referencia
    SELECT search_vector INTO vector_referencia
    FROM products
    WHERE id = producto_id AND active = true;

    IF vector_referencia IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        p.id as id_similar,
        p.name,
        p.price_usd,
        ts_rank_cd(p.search_vector, vector_referencia, 32) as similarity_score,
        CASE
            WHEN ts_rank_cd(p.search_vector, vector_referencia, 32) >= 0.7 THEN 'muy similar'
            WHEN ts_rank_cd(p.search_vector, vector_referencia, 32) >= 0.5 THEN 'similar'
            WHEN ts_rank_cd(p.search_vector, vector_referencia, 32) >= 0.3 THEN 'algo similar'
            ELSE 'relacionado'
        END as similarity_level
    FROM products p
    WHERE p.id != producto_id
        AND p.active = true
        AND p.search_vector @@ vector_referencia
    ORDER BY similarity_score DESC, p.created_at DESC
    LIMIT limite;
END;
$$;


ALTER FUNCTION public.productos_similares(producto_id integer, limite integer) OWNER TO postgres;

--
-- TOC entry 643 (class 1255 OID 59816)
-- Name: registrar_busqueda(text, integer, numeric, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text DEFAULT NULL::text, user_agent text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO busquedas_log(
        termino_busqueda,
        resultados,
        tiempo_ejecucion,
        ip_cliente,
        user_agent
    ) VALUES (
        termino_busqueda,
        resultados,
        tiempo_ejecucion,
        ip_cliente,
        user_agent
    );
END;
$$;


ALTER FUNCTION public.registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text, user_agent text) OWNER TO postgres;

--
-- TOC entry 588 (class 1255 OID 51636)
-- Name: reset_sequence(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_sequence(sequence_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
    EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
  END;
  $$;


ALTER FUNCTION public.reset_sequence(sequence_name text) OWNER TO postgres;

--
-- TOC entry 618 (class 1255 OID 75916)
-- Name: reset_sequence(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_sequence(sequence_name character varying) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
    EXECUTE 'ALTER SEQUENCE ' || sequence_name || ' RESTART WITH 1';
    RETURN TRUE;
  END;
  $$;


ALTER FUNCTION public.reset_sequence(sequence_name character varying) OWNER TO postgres;

--
-- TOC entry 498 (class 1255 OID 60003)
-- Name: resolve_alert(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.resolve_alert(alert_id bigint) RETURNS boolean
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  -- In a real implementation, this would update the alerts table
  -- For now, return true to resolve the alert
  RETURN true;
END;
$$;


ALTER FUNCTION public.resolve_alert(alert_id bigint) OWNER TO postgres;

--
-- TOC entry 422 (class 1255 OID 59994)
-- Name: round(numeric, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.round(numeric, integer) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    SET search_path TO 'public'
    AS $_$
BEGIN
  RETURN pg_catalog.round($1, $2);
END;
$_$;


ALTER FUNCTION public.round(numeric, integer) OWNER TO postgres;

--
-- TOC entry 519 (class 1255 OID 59802)
-- Name: sugerencias_busqueda(text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sugerencias_busqueda(termino_parcial text, limite integer DEFAULT 10) RETURNS TABLE(sugerencia text, categoria text, frecuencia integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        CASE
            WHEN LENGTH(p.name) > 50 THEN SUBSTRING(p.name, 1, 50) || '...'
            ELSE p.name
        END as sugerencia,
        CASE
            WHEN p.featured = true THEN 'destacado'
            WHEN p.price_usd > 50 THEN 'premium'
            ELSE 'estándar'
        END as categoria,
        COUNT(*) as frecuencia
    FROM products p
    WHERE p.active = true
        AND (
            p.name ILIKE '%' || termino_parcial || '%'
            OR p.name_normalized ILIKE '%' || termino_parcial || '%'
        )
    GROUP BY p.name, p.featured, p.price_usd
    ORDER BY
        CASE WHEN p.name ILIKE termino_parcial || '%' THEN 1 ELSE 2 END,
        p.featured DESC,
        frecuencia DESC
    LIMIT limite;
END;
$$;


ALTER FUNCTION public.sugerencias_busqueda(termino_parcial text, limite integer) OWNER TO postgres;

--
-- TOC entry 611 (class 1255 OID 59775)
-- Name: sugerir_optimizaciones(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sugerir_optimizaciones() RETURNS TABLE(tabla text, sugerencia text, prioridad text, impacto text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Sugerir índices faltantes basados en consultas lentas
    RETURN QUERY
    SELECT
        'products'::TEXT,
        'Considerar índice compuesto en (active, name_normalized)'::TEXT,
        'ALTA'::TEXT,
        'Mejora búsquedas de productos en un 60%'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_products_active_name_normalized'
    )

    UNION ALL

    SELECT
        'orders'::TEXT,
        'Considerar índice en (status, created_at DESC)'::TEXT,
        'ALTA'::TEXT,
        'Mejora dashboard de pedidos en un 70%'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_orders_status_date'
    )

    UNION ALL

    SELECT
        'product_images'::TEXT,
        'Considerar índice en (product_id, is_primary DESC)'::TEXT,
        'ALTA'::TEXT,
        'Mejora carga de imágenes en un 50%'::TEXT
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'idx_product_images_product_primary'
    );
END;
$$;


ALTER FUNCTION public.sugerir_optimizaciones() OWNER TO postgres;

--
-- TOC entry 430 (class 1255 OID 77631)
-- Name: sync_payment_method_name(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_payment_method_name() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
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
    $$;


ALTER FUNCTION public.sync_payment_method_name() OWNER TO postgres;

--
-- TOC entry 543 (class 1255 OID 75915)
-- Name: update_carousel_order_atomic(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_carousel_order_atomic(p_product_id integer, p_order integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
    UPDATE products SET carousel_order = p_order, updated_at = NOW() WHERE id = p_product_id;
    RETURN TRUE;
  END;
  $$;


ALTER FUNCTION public.update_carousel_order_atomic(p_product_id integer, p_order integer) OWNER TO postgres;

--
-- TOC entry 656 (class 1255 OID 75910)
-- Name: update_order_status_with_history(integer, character varying, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
    UPDATE orders SET status = p_new_status, updated_at = NOW() WHERE id = p_order_id;
    RETURN TRUE;
  END;
  $$;


ALTER FUNCTION public.update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer) OWNER TO postgres;

--
-- TOC entry 530 (class 1255 OID 34865)
-- Name: update_order_status_with_history(integer, public.order_status, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text DEFAULT NULL::text, changed_by integer DEFAULT NULL::integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    current_status order_status;
    updated_order JSONB;
BEGIN
    -- Get current status
    SELECT status INTO current_status
    FROM public.orders
    WHERE id = order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with ID % not found', order_id;
    END IF;

    -- Update order status
    UPDATE public.orders
    SET status = new_status,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = order_id;

    -- Insert status history
    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        notes,
        changed_by
    ) VALUES (
        order_id,
        current_status,
        new_status,
        notes,
        changed_by
    );

    -- Return updated order
    SELECT jsonb_build_object(
        'id', o.id,
        'status', o.status,
        'updated_at', o.updated_at
    ) INTO updated_order
    FROM public.orders o
    WHERE o.id = order_id;

    RETURN updated_order;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update order status: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) OWNER TO postgres;

--
-- TOC entry 576 (class 1255 OID 28932)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- TOC entry 495 (class 1255 OID 77629)
-- Name: validate_order_total(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_order_total() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
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
    $$;


ALTER FUNCTION public.validate_order_total() OWNER TO postgres;

--
-- TOC entry 2673 (class 3602 OID 59796)
-- Name: floresya_spanish; Type: TEXT SEARCH CONFIGURATION; Schema: public; Owner: postgres
--

CREATE TEXT SEARCH CONFIGURATION public.floresya_spanish (
    PARSER = pg_catalog."default" );

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR asciiword WITH spanish_stem;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR word WITH spanish_stem;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR numword WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR email WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR url WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR host WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR sfloat WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR version WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR hword_numpart WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR hword_part WITH spanish_stem;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR hword_asciipart WITH spanish_stem;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR numhword WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR asciihword WITH spanish_stem;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR hword WITH spanish_stem;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR url_path WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR file WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR "float" WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR "int" WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish
    ADD MAPPING FOR uint WITH simple;


ALTER TEXT SEARCH CONFIGURATION public.floresya_spanish OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 401 (class 1259 OID 59805)
-- Name: busquedas_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.busquedas_log (
    id integer NOT NULL,
    termino_busqueda text NOT NULL,
    resultados integer NOT NULL,
    tiempo_ejecucion numeric NOT NULL,
    ip_cliente text NOT NULL,
    user_agent text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT busquedas_log_resultados_valid CHECK ((resultados >= 0)),
    CONSTRAINT busquedas_log_termino_length CHECK (((length(termino_busqueda) >= 2) AND (length(termino_busqueda) <= 255))),
    CONSTRAINT busquedas_log_tiempo_valid CHECK ((tiempo_ejecucion >= (0)::numeric))
);


ALTER TABLE public.busquedas_log OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 59804)
-- Name: busquedas_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.busquedas_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.busquedas_log_id_seq OWNER TO postgres;

--
-- TOC entry 4478 (class 0 OID 0)
-- Dependencies: 400
-- Name: busquedas_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.busquedas_log_id_seq OWNED BY public.busquedas_log.id;


--
-- TOC entry 410 (class 1259 OID 84803)
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    expense_date date DEFAULT CURRENT_DATE NOT NULL,
    payment_method text,
    receipt_url text,
    notes text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT expenses_category_check CHECK ((category = ANY (ARRAY['flores'::text, 'transporte'::text, 'empaque'::text, 'personal'::text, 'servicios'::text, 'marketing'::text, 'otros'::text]))),
    CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['efectivo'::text, 'transferencia'::text, 'tarjeta_debito'::text, 'tarjeta_credito'::text, 'pago_movil'::text, 'zelle'::text, 'otro'::text])))
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- TOC entry 412 (class 1259 OID 86920)
-- Name: daily_expenses; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.daily_expenses WITH (security_invoker='on') AS
 SELECT expense_date,
    category,
    count(id) AS expense_count,
    sum(amount) AS total_amount
   FROM public.expenses e
  WHERE (active = true)
  GROUP BY expense_date, category
  ORDER BY expense_date DESC, category;


ALTER VIEW public.daily_expenses OWNER TO postgres;

--
-- TOC entry 389 (class 1259 OID 32093)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    customer_email character varying(255) NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(20) NOT NULL,
    delivery_address text NOT NULL,
    delivery_city character varying(100) NOT NULL,
    delivery_state character varying(100) NOT NULL,
    delivery_zip character varying(20),
    delivery_date date,
    delivery_time_slot character varying(100),
    delivery_notes text,
    status public.order_status DEFAULT 'pending'::public.order_status,
    total_amount_usd numeric(10,2) NOT NULL,
    total_amount_ves numeric(10,2),
    currency_rate numeric(10,6) DEFAULT 1.0,
    notes text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    customer_name_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate((customer_name)::text, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    customer_email_normalized text GENERATED ALWAYS AS (lower((customer_email)::text)) STORED,
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT check_customer_info CHECK ((((user_id IS NOT NULL) AND (customer_email IS NOT NULL) AND (customer_name IS NOT NULL)) OR ((user_id IS NULL) AND (customer_email IS NOT NULL) AND (customer_name IS NOT NULL)))),
    CONSTRAINT orders_currency_rate_positive CHECK (((currency_rate IS NULL) OR (currency_rate > (0)::numeric))),
    CONSTRAINT orders_currency_rate_required CHECK (((total_amount_ves IS NULL) OR (currency_rate IS NOT NULL))),
    CONSTRAINT orders_customer_email_format CHECK (((customer_email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT orders_customer_email_not_empty CHECK (((customer_email IS NOT NULL) AND (TRIM(BOTH FROM customer_email) <> ''::text))),
    CONSTRAINT orders_customer_name_not_empty CHECK (((customer_name IS NOT NULL) AND (TRIM(BOTH FROM customer_name) <> ''::text))),
    CONSTRAINT orders_delivery_address_not_empty CHECK (((delivery_address IS NOT NULL) AND (TRIM(BOTH FROM delivery_address) <> ''::text))),
    CONSTRAINT orders_status_valid CHECK ((status = ANY (ARRAY['pending'::public.order_status, 'verified'::public.order_status, 'preparing'::public.order_status, 'shipped'::public.order_status, 'delivered'::public.order_status, 'cancelled'::public.order_status]))),
    CONSTRAINT orders_total_amount_positive CHECK ((total_amount_usd > (0)::numeric)),
    CONSTRAINT orders_total_amount_usd_check CHECK ((total_amount_usd >= (0)::numeric)),
    CONSTRAINT orders_total_amount_usd_positive CHECK ((total_amount_usd > (0)::numeric)),
    CONSTRAINT orders_total_amount_ves_positive CHECK (((total_amount_ves IS NULL) OR (total_amount_ves > (0)::numeric)))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 411 (class 1259 OID 86916)
-- Name: daily_sales; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.daily_sales WITH (security_invoker='on') AS
 SELECT (created_at)::date AS sale_date,
    count(id) AS total_orders,
    sum(total_amount_usd) AS total_usd,
    sum(total_amount_ves) AS total_ves
   FROM public.orders o
  WHERE ((status)::text = 'delivered'::text)
  GROUP BY ((created_at)::date)
  ORDER BY ((created_at)::date) DESC;


ALTER VIEW public.daily_sales OWNER TO postgres;

--
-- TOC entry 414 (class 1259 OID 86928)
-- Name: daily_profit_loss; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.daily_profit_loss WITH (security_invoker='on') AS
 SELECT COALESCE(s.sale_date, e.expense_date) AS date,
    COALESCE(s.total_usd, (0)::numeric) AS revenue_usd,
    COALESCE(e.total_amount, (0)::numeric) AS expenses,
    (COALESCE(s.total_usd, (0)::numeric) - COALESCE(e.total_amount, (0)::numeric)) AS profit_loss
   FROM (public.daily_sales s
     FULL JOIN ( SELECT daily_expenses.expense_date,
            sum(daily_expenses.total_amount) AS total_amount
           FROM public.daily_expenses
          GROUP BY daily_expenses.expense_date) e ON ((s.sale_date = e.expense_date)))
  ORDER BY COALESCE(s.sale_date, e.expense_date) DESC;


ALTER VIEW public.daily_profit_loss OWNER TO postgres;

--
-- TOC entry 409 (class 1259 OID 84802)
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO postgres;

--
-- TOC entry 4485 (class 0 OID 0)
-- Dependencies: 409
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- TOC entry 379 (class 1259 OID 31986)
-- Name: occasions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.occasions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug character varying NOT NULL
);


ALTER TABLE public.occasions OWNER TO postgres;

--
-- TOC entry 378 (class 1259 OID 31985)
-- Name: occasions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.occasions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.occasions_id_seq OWNER TO postgres;

--
-- TOC entry 4488 (class 0 OID 0)
-- Dependencies: 378
-- Name: occasions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.occasions_id_seq OWNED BY public.occasions.id;


--
-- TOC entry 391 (class 1259 OID 32112)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    product_name character varying(255) NOT NULL,
    product_summary text,
    unit_price_usd numeric(10,2) NOT NULL,
    unit_price_ves numeric(10,2),
    quantity integer NOT NULL,
    subtotal_usd numeric(10,2) NOT NULL,
    subtotal_ves numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT order_items_product_name_not_empty CHECK (((product_name IS NOT NULL) AND (TRIM(BOTH FROM product_name) <> ''::text))),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_quantity_positive CHECK ((quantity > 0)),
    CONSTRAINT order_items_subtotal_usd_check CHECK ((subtotal_usd >= (0)::numeric)),
    CONSTRAINT order_items_subtotal_usd_matches_calculation CHECK ((abs((subtotal_usd - (unit_price_usd * (quantity)::numeric))) < 0.01)),
    CONSTRAINT order_items_subtotal_usd_positive CHECK ((subtotal_usd > (0)::numeric)),
    CONSTRAINT order_items_subtotal_ves_positive CHECK (((subtotal_ves IS NULL) OR (subtotal_ves > (0)::numeric))),
    CONSTRAINT order_items_unit_price_positive CHECK ((unit_price_usd > (0)::numeric)),
    CONSTRAINT order_items_unit_price_usd_check CHECK ((unit_price_usd >= (0)::numeric)),
    CONSTRAINT order_items_unit_price_usd_positive CHECK ((unit_price_usd > (0)::numeric)),
    CONSTRAINT order_items_unit_price_ves_positive CHECK (((unit_price_ves IS NULL) OR (unit_price_ves > (0)::numeric)))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 32111)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 4491 (class 0 OID 0)
-- Dependencies: 390
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 393 (class 1259 OID 32136)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    old_status public.order_status,
    new_status public.order_status NOT NULL,
    notes text,
    changed_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 32135)
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_history_id_seq OWNER TO postgres;

--
-- TOC entry 4494 (class 0 OID 0)
-- Dependencies: 392
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- TOC entry 388 (class 1259 OID 32092)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 4496 (class 0 OID 0)
-- Dependencies: 388
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 395 (class 1259 OID 32156)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type public.payment_method_type NOT NULL,
    description text NOT NULL,
    account_info jsonb,
    active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 32155)
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO postgres;

--
-- TOC entry 4499 (class 0 OID 0)
-- Dependencies: 394
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- TOC entry 397 (class 1259 OID 32169)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id integer NOT NULL,
    payment_method_id integer,
    user_id integer,
    amount_usd numeric(10,2) NOT NULL,
    amount_ves numeric(10,2),
    currency_rate numeric(10,6),
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method_name character varying(100) NOT NULL,
    transaction_id character varying(255),
    reference_number character varying(255),
    payment_details jsonb,
    receipt_image_url text,
    admin_notes text,
    payment_date timestamp with time zone,
    confirmed_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT payments_amount_positive CHECK ((amount_usd > (0)::numeric)),
    CONSTRAINT payments_amount_usd_check CHECK ((amount_usd >= (0)::numeric)),
    CONSTRAINT payments_amount_ves_positive CHECK (((amount_ves IS NULL) OR (amount_ves > (0)::numeric))),
    CONSTRAINT payments_currency_rate_positive CHECK (((currency_rate IS NULL) OR (currency_rate > (0)::numeric)))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 32168)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- TOC entry 4502 (class 0 OID 0)
-- Dependencies: 396
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 399 (class 1259 OID 32525)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_index integer NOT NULL,
    size public.image_size NOT NULL,
    url text NOT NULL,
    file_hash character varying(64) NOT NULL,
    mime_type character varying(50) DEFAULT 'image/webp'::character varying NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT product_images_file_hash_format CHECK (((file_hash IS NOT NULL) AND ((file_hash)::text ~ '^[a-fA-F0-9]{64}$'::text))),
    CONSTRAINT product_images_image_index_check CHECK ((image_index > 0)),
    CONSTRAINT product_images_image_index_positive CHECK ((image_index > 0)),
    CONSTRAINT product_images_mime_type_valid CHECK (((mime_type)::text = ANY ((ARRAY['image/jpeg'::character varying, 'image/jpg'::character varying, 'image/png'::character varying, 'image/webp'::character varying, 'image/gif'::character varying, 'image/svg+xml'::character varying])::text[]))),
    CONSTRAINT product_images_size_valid CHECK ((size = ANY (ARRAY['thumb'::public.image_size, 'small'::public.image_size, 'medium'::public.image_size, 'large'::public.image_size]))),
    CONSTRAINT product_images_url_not_empty CHECK (((url IS NOT NULL) AND (TRIM(BOTH FROM url) <> ''::text)))
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 398 (class 1259 OID 32524)
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO postgres;

--
-- TOC entry 4505 (class 0 OID 0)
-- Dependencies: 398
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- TOC entry 387 (class 1259 OID 32072)
-- Name: product_occasions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_occasions (
    id integer NOT NULL,
    product_id integer NOT NULL,
    occasion_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.product_occasions OWNER TO postgres;

--
-- TOC entry 4507 (class 0 OID 0)
-- Dependencies: 387
-- Name: TABLE product_occasions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.product_occasions IS 'Relación muchos-a-muchos entre productos y ocasiones. Evita duplicados gracias al UNIQUE.';


--
-- TOC entry 386 (class 1259 OID 32071)
-- Name: product_occasions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_occasions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_occasions_id_seq OWNER TO postgres;

--
-- TOC entry 4509 (class 0 OID 0)
-- Dependencies: 386
-- Name: product_occasions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_occasions_id_seq OWNED BY public.product_occasions.id;


--
-- TOC entry 385 (class 1259 OID 32033)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    summary text,
    description text,
    price_usd numeric(10,2) NOT NULL,
    price_ves numeric(10,2),
    stock integer DEFAULT 0,
    sku character varying(50),
    active boolean DEFAULT true,
    featured boolean DEFAULT false NOT NULL,
    carousel_order integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate((name)::text, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    description_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate(description, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    search_vector tsvector,
    CONSTRAINT products_carousel_order_check CHECK ((carousel_order >= 0)),
    CONSTRAINT products_carousel_order_range CHECK (((carousel_order IS NULL) OR ((carousel_order >= 0) AND (carousel_order <= 7)))),
    CONSTRAINT products_description_not_empty_when_active CHECK ((NOT ((active = true) AND (description IS NOT NULL) AND (TRIM(BOTH FROM description) = ''::text)))),
    CONSTRAINT products_name_length CHECK ((length((name)::text) <= 255)),
    CONSTRAINT products_name_not_empty CHECK (((name IS NOT NULL) AND (TRIM(BOTH FROM name) <> ''::text))),
    CONSTRAINT products_price_usd_check CHECK ((price_usd >= (0)::numeric)),
    CONSTRAINT products_price_usd_positive CHECK ((price_usd > (0)::numeric)),
    CONSTRAINT products_price_ves_positive CHECK (((price_ves IS NULL) OR (price_ves > (0)::numeric))),
    CONSTRAINT products_sku_length CHECK (((sku IS NULL) OR (length((sku)::text) <= 50))),
    CONSTRAINT products_sku_not_empty CHECK (((sku IS NULL) OR (TRIM(BOTH FROM sku) <> ''::text))),
    CONSTRAINT products_stock_check CHECK ((stock >= 0)),
    CONSTRAINT products_stock_max_value CHECK ((stock <= 100000)),
    CONSTRAINT products_stock_non_negative CHECK ((stock >= 0))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 4511 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products IS 'Productos vendidos en la tienda. Cada producto puede tener múltiples imágenes y ocasiones.';


--
-- TOC entry 4512 (class 0 OID 0)
-- Dependencies: 385
-- Name: COLUMN products.carousel_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products.carousel_order IS 'Orden en que aparece en el carousel. NULL = no aparece. Valores >= 0.';


--
-- TOC entry 384 (class 1259 OID 32032)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 4514 (class 0 OID 0)
-- Dependencies: 384
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 403 (class 1259 OID 59940)
-- Name: query_timeouts_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.query_timeouts_log (
    id integer NOT NULL,
    nombre_consulta text NOT NULL,
    tipo_consulta text NOT NULL,
    duracion_timeout integer NOT NULL,
    tiempo_ejecucion_ms numeric(10,2),
    estado text NOT NULL,
    mensaje text,
    parametros jsonb DEFAULT '{}'::jsonb,
    usuario_id text,
    ip_cliente text,
    fecha_hora timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.query_timeouts_log OWNER TO postgres;

--
-- TOC entry 402 (class 1259 OID 59939)
-- Name: query_timeouts_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.query_timeouts_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.query_timeouts_log_id_seq OWNER TO postgres;

--
-- TOC entry 4517 (class 0 OID 0)
-- Dependencies: 402
-- Name: query_timeouts_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.query_timeouts_log_id_seq OWNED BY public.query_timeouts_log.id;


--
-- TOC entry 383 (class 1259 OID 32018)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    description text,
    type character varying(20) DEFAULT 'string'::character varying,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 382 (class 1259 OID 32017)
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- TOC entry 4520 (class 0 OID 0)
-- Dependencies: 382
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 413 (class 1259 OID 86924)
-- Name: test_daily_expenses; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.test_daily_expenses WITH (security_invoker='on') AS
 SELECT expense_date,
    category,
    count(id) AS count,
    sum(amount) AS total
   FROM public.expenses e
  WHERE (active = true)
  GROUP BY expense_date, category
  ORDER BY expense_date DESC;


ALTER VIEW public.test_daily_expenses OWNER TO postgres;

--
-- TOC entry 381 (class 1259 OID 32002)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text,
    full_name character varying(255),
    phone character varying(20) NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    full_name_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate((full_name)::text, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    email_normalized text GENERATED ALWAYS AS (lower((email)::text)) STORED,
    CONSTRAINT users_email_format CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT users_email_not_empty CHECK (((email IS NOT NULL) AND (TRIM(BOTH FROM email) <> ''::text))),
    CONSTRAINT users_full_name_min_length CHECK ((length((full_name)::text) >= 2)),
    CONSTRAINT users_full_name_not_empty_when_active CHECK ((NOT ((active = true) AND ((full_name IS NULL) OR (TRIM(BOTH FROM full_name) = ''::text))))),
    CONSTRAINT users_phone_format CHECK (((phone IS NULL) OR ((phone)::text ~ '^\+58\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}$'::text) OR ((phone)::text ~ '^\+[1-9][0-9]{1,14}$'::text))),
    CONSTRAINT users_role_valid CHECK ((role = ANY (ARRAY['user'::public.user_role, 'admin'::public.user_role])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 380 (class 1259 OID 32001)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4524 (class 0 OID 0)
-- Dependencies: 380
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3934 (class 2604 OID 59808)
-- Name: busquedas_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.busquedas_log ALTER COLUMN id SET DEFAULT nextval('public.busquedas_log_id_seq'::regclass);


--
-- TOC entry 3941 (class 2604 OID 84806)
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- TOC entry 3872 (class 2604 OID 31989)
-- Name: occasions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions ALTER COLUMN id SET DEFAULT nextval('public.occasions_id_seq'::regclass);


--
-- TOC entry 3911 (class 2604 OID 32115)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3915 (class 2604 OID 32139)
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- TOC entry 3903 (class 2604 OID 32096)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3918 (class 2604 OID 32159)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3923 (class 2604 OID 32172)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3928 (class 2604 OID 32528)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 3899 (class 2604 OID 32075)
-- Name: product_occasions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions ALTER COLUMN id SET DEFAULT nextval('public.product_occasions_id_seq'::regclass);


--
-- TOC entry 3891 (class 2604 OID 32036)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3937 (class 2604 OID 59943)
-- Name: query_timeouts_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_timeouts_log ALTER COLUMN id SET DEFAULT nextval('public.query_timeouts_log_id_seq'::regclass);


--
-- TOC entry 3885 (class 2604 OID 32021)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 3877 (class 2604 OID 32005)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4415 (class 0 OID 59805)
-- Dependencies: 401
-- Data for Name: busquedas_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4419 (class 0 OID 84803)
-- Dependencies: 410
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.expenses VALUES (1, 'flores', 'Test expense', 10.50, '2025-11-19', 'efectivo', NULL, 'Prueba de creación', NULL, '2025-11-19 15:04:09.129113+00', '2025-11-19 15:04:09.129113+00', true);


--
-- TOC entry 4393 (class 0 OID 31986)
-- Dependencies: 379
-- Data for Name: occasions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.occasions VALUES (404, 'Cumpleaños', 'Flores para cumpleaños', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'cumpleanos');
INSERT INTO public.occasions VALUES (405, 'Aniversario', 'Flores para aniversarios', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'aniversario');
INSERT INTO public.occasions VALUES (406, 'Día de la Madre', 'Flores para el día de la madre', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'dia-de-la-madre');
INSERT INTO public.occasions VALUES (407, 'San Valentín', 'Flores para san valentín', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'san-valentin');
INSERT INTO public.occasions VALUES (408, 'Boda', 'Flores para bodas', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'boda');
INSERT INTO public.occasions VALUES (409, 'Graduación', 'Flores para graduaciones', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'graduacion');
INSERT INTO public.occasions VALUES (410, 'Felicidades', 'Flores para felicitar', true, 0, '2025-11-11 23:41:17.860442+00', '2025-11-11 23:41:17.860442+00', 'felicidades');


--
-- TOC entry 4405 (class 0 OID 32112)
-- Dependencies: 391
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4407 (class 0 OID 32136)
-- Dependencies: 393
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4403 (class 0 OID 32093)
-- Dependencies: 389
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4409 (class 0 OID 32156)
-- Dependencies: 395
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payment_methods VALUES (3, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-15 11:09:04.561563+00', '2025-10-15 11:09:04.561563+00');
INSERT INTO public.payment_methods VALUES (5, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-15 13:49:34.461804+00', '2025-10-15 13:49:34.461804+00');
INSERT INTO public.payment_methods VALUES (36, 'Test Payment Method 1760835301565', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1565"', false, 65, '2025-10-19 00:55:01.71572+00', '2025-10-19 00:55:01.71572+00');
INSERT INTO public.payment_methods VALUES (37, 'Test Payment Method 1760835301592', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1592"', false, 92, '2025-10-19 00:55:01.753303+00', '2025-10-19 00:55:01.753303+00');
INSERT INTO public.payment_methods VALUES (7, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-15 18:45:22.185964+00', '2025-10-15 18:45:22.185964+00');
INSERT INTO public.payment_methods VALUES (8, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-17 01:28:41.62924+00', '2025-10-17 01:28:41.62924+00');
INSERT INTO public.payment_methods VALUES (10, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-17 23:56:24.028907+00', '2025-10-17 23:56:24.028907+00');
INSERT INTO public.payment_methods VALUES (4, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-15 11:09:04.76207+00', '2025-10-15 11:09:04.76207+00');
INSERT INTO public.payment_methods VALUES (15, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-18 05:35:46.74196+00', '2025-10-18 05:35:46.74196+00');
INSERT INTO public.payment_methods VALUES (17, 'Test Payment Method', 'bank_transfer', 'Updated description', '"0105-0000-0000-0000"', false, 99, '2025-10-18 05:52:07.073941+00', '2025-10-18 05:52:07.073941+00');
INSERT INTO public.payment_methods VALUES (35, 'Test Payment Method 1760835301320', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1320"', false, 20, '2025-10-19 00:55:01.569942+00', '2025-10-19 00:55:01.569942+00');
INSERT INTO public.payment_methods VALUES (18, 'Test Service Method', 'bank_transfer', 'Updated from service', '"0105-1111-1111-1111"', false, 88, '2025-10-18 05:52:17.879412+00', '2025-10-18 05:52:17.879412+00');
INSERT INTO public.payment_methods VALUES (19, 'test_Transferencia Bancaria Test', 'bank_transfer', 'Método de pago de prueba para transferencias bancarias', '"0102-1234-5678-9012-3456"', true, 1, '2025-10-18 15:30:44.277386+00', '2025-10-18 15:30:44.277386+00');
INSERT INTO public.payment_methods VALUES (20, 'test_Pago Móvil Test', 'mobile_payment', 'Método de pago de prueba para pago móvil', '"0414-555-5555"', true, 2, '2025-10-18 15:30:44.412523+00', '2025-10-18 15:30:44.412523+00');
INSERT INTO public.payment_methods VALUES (21, 'test_Zelle Test', 'international', 'Método de pago de prueba para Zelle', '"payments@floresya.test"', true, 3, '2025-10-18 15:30:44.544115+00', '2025-10-18 15:30:44.544115+00');
INSERT INTO public.payment_methods VALUES (22, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-18 17:47:20.459813+00', '2025-10-18 17:47:20.459813+00');
INSERT INTO public.payment_methods VALUES (24, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-19 00:54:52.687186+00', '2025-10-19 00:54:52.687186+00');
INSERT INTO public.payment_methods VALUES (26, 'Test Payment Method 1760835298267', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8267"', false, 67, '2025-10-19 00:54:58.413859+00', '2025-10-19 00:54:58.413859+00');
INSERT INTO public.payment_methods VALUES (27, 'Test Payment Method 1760835298885', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8885"', false, 85, '2025-10-19 00:54:59.018994+00', '2025-10-19 00:54:59.018994+00');
INSERT INTO public.payment_methods VALUES (28, 'Test Payment Method 1760835298168', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8168"', false, 68, '2025-10-19 00:54:59.216938+00', '2025-10-19 00:54:59.216938+00');
INSERT INTO public.payment_methods VALUES (29, 'Test Payment Method 1760835299493', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9493"', false, 93, '2025-10-19 00:54:59.616741+00', '2025-10-19 00:54:59.616741+00');
INSERT INTO public.payment_methods VALUES (31, 'Test Payment Method 1760835299710', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9710"', false, 10, '2025-10-19 00:55:00.271108+00', '2025-10-19 00:55:00.271108+00');
INSERT INTO public.payment_methods VALUES (32, 'Test Payment Method 1760835300642', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0642"', false, 42, '2025-10-19 00:55:00.778205+00', '2025-10-19 00:55:00.778205+00');
INSERT INTO public.payment_methods VALUES (33, 'Test Payment Method 1760835300853', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0853"', false, 53, '2025-10-19 00:55:01.025404+00', '2025-10-19 00:55:01.025404+00');
INSERT INTO public.payment_methods VALUES (30, 'Test Payment Method 1760835298820', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8820"', false, 20, '2025-10-19 00:55:00.255743+00', '2025-10-19 00:55:00.255743+00');
INSERT INTO public.payment_methods VALUES (34, 'Test Payment Method 1760835301059', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1059"', false, 59, '2025-10-19 00:55:01.19046+00', '2025-10-19 00:55:01.19046+00');
INSERT INTO public.payment_methods VALUES (39, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-19 00:55:02.13854+00', '2025-10-19 00:55:02.13854+00');
INSERT INTO public.payment_methods VALUES (38, 'Test Payment Method 1760835301877', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1877"', false, 77, '2025-10-19 00:55:02.009534+00', '2025-10-19 00:55:02.009534+00');
INSERT INTO public.payment_methods VALUES (41, 'Test Payment Method 1760835302287', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2287"', false, 87, '2025-10-19 00:55:02.420155+00', '2025-10-19 00:55:02.420155+00');
INSERT INTO public.payment_methods VALUES (42, 'Test Payment Method 1760835302421', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2421"', false, 21, '2025-10-19 00:55:02.547095+00', '2025-10-19 00:55:02.547095+00');
INSERT INTO public.payment_methods VALUES (40, 'Test Payment Method 1760835302217', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2217"', false, 17, '2025-10-19 00:55:02.369669+00', '2025-10-19 00:55:02.369669+00');
INSERT INTO public.payment_methods VALUES (44, 'Test Payment Method 1760835302834', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2834"', false, 34, '2025-10-19 00:55:02.975131+00', '2025-10-19 00:55:02.975131+00');
INSERT INTO public.payment_methods VALUES (45, 'Test Payment Method 1760835302894', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2894"', false, 94, '2025-10-19 00:55:03.034049+00', '2025-10-19 00:55:03.034049+00');
INSERT INTO public.payment_methods VALUES (51, 'Test Payment Method 1760835304149', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4149"', false, 49, '2025-10-19 00:55:04.272037+00', '2025-10-19 00:55:04.272037+00');
INSERT INTO public.payment_methods VALUES (46, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-3206"', false, 5, '2025-10-19 00:55:03.338648+00', '2025-10-19 00:55:03.338648+00');
INSERT INTO public.payment_methods VALUES (48, 'Test Payment Method 1760835303558', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3558"', false, 58, '2025-10-19 00:55:03.704514+00', '2025-10-19 00:55:03.704514+00');
INSERT INTO public.payment_methods VALUES (50, 'Test Payment Method 1760835304051', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4051"', false, 51, '2025-10-19 00:55:04.182198+00', '2025-10-19 00:55:04.182198+00');
INSERT INTO public.payment_methods VALUES (47, 'Test Payment Method 1760835303090', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3090"', false, 90, '2025-10-19 00:55:03.402533+00', '2025-10-19 00:55:03.402533+00');
INSERT INTO public.payment_methods VALUES (49, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3610"', false, 10, '2025-10-19 00:55:03.738623+00', '2025-10-19 00:55:03.738623+00');
INSERT INTO public.payment_methods VALUES (53, 'Test Payment Method 1760835304492', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4492"', false, 92, '2025-10-19 00:55:04.620253+00', '2025-10-19 00:55:04.620253+00');
INSERT INTO public.payment_methods VALUES (52, 'Test Payment Method 1760835303969', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3969"', false, 69, '2025-10-19 00:55:04.281669+00', '2025-10-19 00:55:04.281669+00');
INSERT INTO public.payment_methods VALUES (54, 'Test Payment Method 1760835304721', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4721"', false, 21, '2025-10-19 00:55:04.855051+00', '2025-10-19 00:55:04.855051+00');
INSERT INTO public.payment_methods VALUES (56, 'Test Payment Method 1760835305110', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5110"', false, 10, '2025-10-19 00:55:05.243604+00', '2025-10-19 00:55:05.243604+00');
INSERT INTO public.payment_methods VALUES (55, 'Test Payment Method 1760835304892', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4892"', false, 92, '2025-10-19 00:55:05.225144+00', '2025-10-19 00:55:05.225144+00');
INSERT INTO public.payment_methods VALUES (57, 'Test Payment Method 1760835305295', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5295"', false, 95, '2025-10-19 00:55:05.444637+00', '2025-10-19 00:55:05.444637+00');
INSERT INTO public.payment_methods VALUES (58, 'Test Payment Method 1760835305518', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5518"', false, 18, '2025-10-19 00:55:05.660217+00', '2025-10-19 00:55:05.660217+00');
INSERT INTO public.payment_methods VALUES (59, 'Test Payment Method 1760835305563', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5563"', false, 63, '2025-10-19 00:55:05.881802+00', '2025-10-19 00:55:05.881802+00');
INSERT INTO public.payment_methods VALUES (60, 'Test Payment Method 1760835305871', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5871"', false, 71, '2025-10-19 00:55:06.00339+00', '2025-10-19 00:55:06.00339+00');
INSERT INTO public.payment_methods VALUES (68, 'Test Payment Method 1760835307176', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7176"', false, 76, '2025-10-19 00:55:07.390587+00', '2025-10-19 00:55:07.390587+00');
INSERT INTO public.payment_methods VALUES (72, 'Test Payment Method 1760835308280', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8280"', false, 80, '2025-10-19 00:55:08.431974+00', '2025-10-19 00:55:08.431974+00');
INSERT INTO public.payment_methods VALUES (78, 'Test Payment Method 1760835310810', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0810"', false, 10, '2025-10-19 00:55:10.93115+00', '2025-10-19 00:55:10.93115+00');
INSERT INTO public.payment_methods VALUES (79, 'Test Payment Method 1760835310800', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0800"', false, 0, '2025-10-19 00:55:11.061115+00', '2025-10-19 00:55:11.061115+00');
INSERT INTO public.payment_methods VALUES (81, 'Test Payment Method 1760835311441', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1441"', false, 41, '2025-10-19 00:55:11.936035+00', '2025-10-19 00:55:11.936035+00');
INSERT INTO public.payment_methods VALUES (177, 'Test Payment Method 1760835563254', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3254"', false, 54, '2025-10-19 00:59:23.400124+00', '2025-10-19 00:59:23.400124+00');
INSERT INTO public.payment_methods VALUES (100, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-19 00:55:20.349401+00', '2025-10-19 00:55:20.349401+00');
INSERT INTO public.payment_methods VALUES (178, 'Test Payment Method 1760835563981', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3981"', false, 81, '2025-10-19 00:59:24.107258+00', '2025-10-19 00:59:24.107258+00');
INSERT INTO public.payment_methods VALUES (221, 'Test Payment Method 1760963190104', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0104"', false, 4, '2025-10-20 12:26:31.215897+00', '2025-10-20 12:26:31.215897+00');
INSERT INTO public.payment_methods VALUES (224, 'Test Payment Method 1760963191922', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1922"', false, 22, '2025-10-20 12:26:32.037609+00', '2025-10-20 12:26:32.037609+00');
INSERT INTO public.payment_methods VALUES (238, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-20 12:26:34.743954+00', '2025-10-20 12:26:34.743954+00');
INSERT INTO public.payment_methods VALUES (236, 'Test Payment Method 1760963194497', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4497"', false, 97, '2025-10-20 12:26:34.604598+00', '2025-10-20 12:26:34.604598+00');
INSERT INTO public.payment_methods VALUES (240, 'Test Payment Method 1760963195149', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5149"', false, 49, '2025-10-20 12:26:35.249233+00', '2025-10-20 12:26:35.249233+00');
INSERT INTO public.payment_methods VALUES (243, 'Test Payment Method 1760963195770', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5770"', false, 70, '2025-10-20 12:26:35.864718+00', '2025-10-20 12:26:35.864718+00');
INSERT INTO public.payment_methods VALUES (248, 'Test Payment Method 1760963197171', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7171"', false, 71, '2025-10-20 12:26:37.267081+00', '2025-10-20 12:26:37.267081+00');
INSERT INTO public.payment_methods VALUES (249, 'Test Payment Method 1760963197625', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7625"', false, 25, '2025-10-20 12:26:37.737117+00', '2025-10-20 12:26:37.737117+00');
INSERT INTO public.payment_methods VALUES (251, 'Test Payment Method 1760963198204', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8204"', false, 4, '2025-10-20 12:26:38.287471+00', '2025-10-20 12:26:38.287471+00');
INSERT INTO public.payment_methods VALUES (320, 'Test Payment Method 1760964135222', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5222"', false, 15, '2025-10-20 12:42:15.326391+00', '2025-10-20 12:42:15.326391+00');
INSERT INTO public.payment_methods VALUES (252, 'Test Payment Method 1760963198563', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8563"', false, 63, '2025-10-20 12:26:38.663304+00', '2025-10-20 12:26:38.663304+00');
INSERT INTO public.payment_methods VALUES (254, 'Test Payment Method 1760963199072', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9072"', false, 72, '2025-10-20 12:26:39.158191+00', '2025-10-20 12:26:39.158191+00');
INSERT INTO public.payment_methods VALUES (283, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-8705"', false, 5, '2025-10-20 12:42:08.804435+00', '2025-10-20 12:42:08.804435+00');
INSERT INTO public.payment_methods VALUES (256, 'Test Payment Method 1760963199473', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9473"', false, 15, '2025-10-20 12:26:39.561763+00', '2025-10-20 12:26:39.561763+00');
INSERT INTO public.payment_methods VALUES (259, 'Test Payment Method 1760963200244', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0244"', false, 44, '2025-10-20 12:26:40.343835+00', '2025-10-20 12:26:40.343835+00');
INSERT INTO public.payment_methods VALUES (260, 'Test Payment Method 1760964124111', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4111"', false, 11, '2025-10-20 12:42:04.654009+00', '2025-10-20 12:42:04.654009+00');
INSERT INTO public.payment_methods VALUES (277, 'Test Payment Method 1760964127765', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7765"', false, 65, '2025-10-20 12:42:07.851415+00', '2025-10-20 12:42:07.851415+00');
INSERT INTO public.payment_methods VALUES (278, 'Test Payment Method 1760964127979', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7979"', false, 79, '2025-10-20 12:42:08.079141+00', '2025-10-20 12:42:08.079141+00');
INSERT INTO public.payment_methods VALUES (284, 'Test Payment Method 1760964129005', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9005"', false, 5, '2025-10-20 12:42:09.090771+00', '2025-10-20 12:42:09.090771+00');
INSERT INTO public.payment_methods VALUES (304, 'Test Payment Method 1760964131987', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1987"', false, 15, '2025-10-20 12:42:12.067341+00', '2025-10-20 12:42:12.067341+00');
INSERT INTO public.payment_methods VALUES (285, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9137"', false, 37, '2025-10-20 12:42:09.237924+00', '2025-10-20 12:42:09.237924+00');
INSERT INTO public.payment_methods VALUES (288, 'Test Payment Method 1760964129598', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9598"', false, 98, '2025-10-20 12:42:09.694056+00', '2025-10-20 12:42:09.694056+00');
INSERT INTO public.payment_methods VALUES (290, 'Test Payment Method 1760964130009', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0009"', false, 9, '2025-10-20 12:42:10.117874+00', '2025-10-20 12:42:10.117874+00');
INSERT INTO public.payment_methods VALUES (296, 'Test Payment Method 1760964130694', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0694"', false, 94, '2025-10-20 12:42:10.785468+00', '2025-10-20 12:42:10.785468+00');
INSERT INTO public.payment_methods VALUES (300, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1331"', false, 31, '2025-10-20 12:42:11.406916+00', '2025-10-20 12:42:11.406916+00');
INSERT INTO public.payment_methods VALUES (301, 'Test Payment Method 1760964131597', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1597"', false, 97, '2025-10-20 12:42:11.681922+00', '2025-10-20 12:42:11.681922+00');
INSERT INTO public.payment_methods VALUES (307, 'Test Payment Method 1760964132414', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2414"', false, 14, '2025-10-20 12:42:12.493568+00', '2025-10-20 12:42:12.493568+00');
INSERT INTO public.payment_methods VALUES (310, 'Test Payment Method 1760964132930', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2930"', false, 30, '2025-10-20 12:42:13.009121+00', '2025-10-20 12:42:13.009121+00');
INSERT INTO public.payment_methods VALUES (313, 'Test Payment Method 1760964133485', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3485"', false, 85, '2025-10-20 12:42:13.573689+00', '2025-10-20 12:42:13.573689+00');
INSERT INTO public.payment_methods VALUES (327, 'Test Payment Method 1760964137001', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7001"', false, 1, '2025-10-20 12:42:17.109492+00', '2025-10-20 12:42:17.109492+00');
INSERT INTO public.payment_methods VALUES (322, 'Test Payment Method 1760964135732', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5732"', false, 32, '2025-10-20 12:42:15.822497+00', '2025-10-20 12:42:15.822497+00');
INSERT INTO public.payment_methods VALUES (321, 'Test Payment Method 1760964135661', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5661"', false, 10, '2025-10-20 12:42:15.749846+00', '2025-10-20 12:42:15.749846+00');
INSERT INTO public.payment_methods VALUES (328, 'Test Payment Method 1760964137399', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7399"', false, 99, '2025-10-20 12:42:17.497141+00', '2025-10-20 12:42:17.497141+00');
INSERT INTO public.payment_methods VALUES (333, 'Test Payment Method 1760964139557', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9557"', false, 57, '2025-10-20 12:42:19.651371+00', '2025-10-20 12:42:19.651371+00');
INSERT INTO public.payment_methods VALUES (334, 'Test Payment Method 1760964140172', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0172"', false, 72, '2025-10-20 12:42:20.267515+00', '2025-10-20 12:42:20.267515+00');
INSERT INTO public.payment_methods VALUES (335, 'Test Payment Method 1760964140762', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0762"', false, 62, '2025-10-20 12:42:20.849061+00', '2025-10-20 12:42:20.849061+00');
INSERT INTO public.payment_methods VALUES (337, 'Test Payment Method 1760964141907', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1907"', false, 7, '2025-10-20 12:42:21.999835+00', '2025-10-20 12:42:21.999835+00');
INSERT INTO public.payment_methods VALUES (347, 'Test Payment Method 1760966173196', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3196"', false, 96, '2025-10-20 13:16:13.260587+00', '2025-10-20 13:16:13.260587+00');
INSERT INTO public.payment_methods VALUES (65, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 00:55:06.817348+00', '2025-10-19 00:55:06.817348+00');
INSERT INTO public.payment_methods VALUES (61, 'Test Payment Method 1760835306066', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6066"', false, 66, '2025-10-19 00:55:06.199826+00', '2025-10-19 00:55:06.199826+00');
INSERT INTO public.payment_methods VALUES (179, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-19 18:19:27.324548+00', '2025-10-19 18:19:27.324548+00');
INSERT INTO public.payment_methods VALUES (64, 'Test Payment Method 1760835306520', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6520"', false, 15, '2025-10-19 00:55:06.651739+00', '2025-10-19 00:55:06.651739+00');
INSERT INTO public.payment_methods VALUES (62, 'Test Payment Method 1760835306152', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6152"', false, 52, '2025-10-19 00:55:06.472187+00', '2025-10-19 00:55:06.472187+00');
INSERT INTO public.payment_methods VALUES (67, 'Test Payment Method 1760835307024', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7024"', false, 24, '2025-10-19 00:55:07.154525+00', '2025-10-19 00:55:07.154525+00');
INSERT INTO public.payment_methods VALUES (66, 'Test Payment Method 1760835306919', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6919"', false, 15, '2025-10-19 00:55:07.060617+00', '2025-10-19 00:55:07.060617+00');
INSERT INTO public.payment_methods VALUES (69, 'Test Payment Method 1760835307332', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7332"', false, 32, '2025-10-19 00:55:07.449671+00', '2025-10-19 00:55:07.449671+00');
INSERT INTO public.payment_methods VALUES (257, 'Test Payment Method 1760963199677', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9677"', false, 77, '2025-10-20 12:26:39.773714+00', '2025-10-20 12:26:39.773714+00');
INSERT INTO public.payment_methods VALUES (71, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-19 00:55:07.951253+00', '2025-10-19 00:55:07.951253+00');
INSERT INTO public.payment_methods VALUES (74, 'Test Payment Method 1760835308961', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8961"', false, 61, '2025-10-19 00:55:09.114721+00', '2025-10-19 00:55:09.114721+00');
INSERT INTO public.payment_methods VALUES (264, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-20 12:42:05.385561+00', '2025-10-20 12:42:05.385561+00');
INSERT INTO public.payment_methods VALUES (73, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8648"', false, 48, '2025-10-19 00:55:08.913187+00', '2025-10-19 00:55:08.913187+00');
INSERT INTO public.payment_methods VALUES (75, 'Test Payment Method 1760835309609', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9609"', false, 9, '2025-10-19 00:55:09.735404+00', '2025-10-19 00:55:09.735404+00');
INSERT INTO public.payment_methods VALUES (76, 'Test Payment Method 1760835309802', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9802"', false, 2, '2025-10-19 00:55:10.133014+00', '2025-10-19 00:55:10.133014+00');
INSERT INTO public.payment_methods VALUES (80, 'Test Payment Method 1760835311336', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1336"', false, 36, '2025-10-19 00:55:11.47911+00', '2025-10-19 00:55:11.47911+00');
INSERT INTO public.payment_methods VALUES (82, 'Test Payment Method 1760835311901', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1901"', false, 1, '2025-10-19 00:55:12.040803+00', '2025-10-19 00:55:12.040803+00');
INSERT INTO public.payment_methods VALUES (84, 'Test Payment Method 1760835312722', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2722"', false, 22, '2025-10-19 00:55:12.976425+00', '2025-10-19 00:55:12.976425+00');
INSERT INTO public.payment_methods VALUES (86, 'Test Payment Method 1760835313654', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3654"', false, 54, '2025-10-19 00:55:13.967707+00', '2025-10-19 00:55:13.967707+00');
INSERT INTO public.payment_methods VALUES (267, 'Test Payment Method 1760964125514', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5514"', false, 14, '2025-10-20 12:42:05.638224+00', '2025-10-20 12:42:05.638224+00');
INSERT INTO public.payment_methods VALUES (89, 'Test Payment Method 1760835314576', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4576"', false, 76, '2025-10-19 00:55:14.805964+00', '2025-10-19 00:55:14.805964+00');
INSERT INTO public.payment_methods VALUES (91, 'Test Payment Method 1760835315596', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5596"', false, 96, '2025-10-19 00:55:15.735689+00', '2025-10-19 00:55:15.735689+00');
INSERT INTO public.payment_methods VALUES (98, 'Test Payment Method 1760835319479', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9479"', false, 79, '2025-10-19 00:55:19.619628+00', '2025-10-19 00:55:19.619628+00');
INSERT INTO public.payment_methods VALUES (273, 'Test Payment Method 1760964127079', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7079"', false, 79, '2025-10-20 12:42:07.192876+00', '2025-10-20 12:42:07.192876+00');
INSERT INTO public.payment_methods VALUES (282, 'Test Payment Method 1760964128414', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8414"', false, 14, '2025-10-20 12:42:08.51747+00', '2025-10-20 12:42:08.51747+00');
INSERT INTO public.payment_methods VALUES (286, 'Test Payment Method 1760964129282', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9282"', false, 82, '2025-10-20 12:42:09.467039+00', '2025-10-20 12:42:09.467039+00');
INSERT INTO public.payment_methods VALUES (289, 'Test Payment Method 1760964129768', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9768"', false, 68, '2025-10-20 12:42:09.968538+00', '2025-10-20 12:42:09.968538+00');
INSERT INTO public.payment_methods VALUES (294, 'Test Payment Method 1760964130620', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0620"', false, 20, '2025-10-20 12:42:10.716314+00', '2025-10-20 12:42:10.716314+00');
INSERT INTO public.payment_methods VALUES (309, 'Test Payment Method 1760964132806', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2806"', false, 6, '2025-10-20 12:42:12.906695+00', '2025-10-20 12:42:12.906695+00');
INSERT INTO public.payment_methods VALUES (298, 'Test Payment Method 1760964131033', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1033"', false, 33, '2025-10-20 12:42:11.128095+00', '2025-10-20 12:42:11.128095+00');
INSERT INTO public.payment_methods VALUES (302, 'Test Payment Method 1760964131734', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1734"', false, 34, '2025-10-20 12:42:11.820752+00', '2025-10-20 12:42:11.820752+00');
INSERT INTO public.payment_methods VALUES (305, 'Test Payment Method 1760964132155', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2155"', false, 55, '2025-10-20 12:42:12.229604+00', '2025-10-20 12:42:12.229604+00');
INSERT INTO public.payment_methods VALUES (316, 'Test Payment Method 1760964134366', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4366"', false, 66, '2025-10-20 12:42:14.459809+00', '2025-10-20 12:42:14.459809+00');
INSERT INTO public.payment_methods VALUES (308, 'Test Payment Method 1760964132405', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2405"', false, 15, '2025-10-20 12:42:12.497765+00', '2025-10-20 12:42:12.497765+00');
INSERT INTO public.payment_methods VALUES (323, 'Test Payment Method 1760964136089', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6089"', false, 89, '2025-10-20 12:42:16.18951+00', '2025-10-20 12:42:16.18951+00');
INSERT INTO public.payment_methods VALUES (326, 'Test Payment Method 1760964136860', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6860"', false, 60, '2025-10-20 12:42:16.942417+00', '2025-10-20 12:42:16.942417+00');
INSERT INTO public.payment_methods VALUES (339, 'Test Payment Method 1760966170752', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0752"', false, 52, '2025-10-20 13:16:10.851382+00', '2025-10-20 13:16:10.851382+00');
INSERT INTO public.payment_methods VALUES (329, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-20 12:42:17.706917+00', '2025-10-20 12:42:17.706917+00');
INSERT INTO public.payment_methods VALUES (338, 'Test Payment Method 1760966169955', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9955"', false, 55, '2025-10-20 13:16:10.07098+00', '2025-10-20 13:16:10.07098+00');
INSERT INTO public.payment_methods VALUES (340, 'Test Payment Method 1760966171391', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1391"', false, 91, '2025-10-20 13:16:11.467231+00', '2025-10-20 13:16:11.467231+00');
INSERT INTO public.payment_methods VALUES (341, 'Test Payment Method 1760966170608', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0608"', false, 8, '2025-10-20 13:16:11.654209+00', '2025-10-20 13:16:11.654209+00');
INSERT INTO public.payment_methods VALUES (342, 'Test Payment Method 1760966171987', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1987"', false, 87, '2025-10-20 13:16:12.080462+00', '2025-10-20 13:16:12.080462+00');
INSERT INTO public.payment_methods VALUES (343, 'Test Payment Method 1760966172097', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2097"', false, 97, '2025-10-20 13:16:12.171528+00', '2025-10-20 13:16:12.171528+00');
INSERT INTO public.payment_methods VALUES (346, 'Test Payment Method 1760966173019', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3019"', false, 19, '2025-10-20 13:16:13.085241+00', '2025-10-20 13:16:13.085241+00');
INSERT INTO public.payment_methods VALUES (348, 'Test Payment Method 1760966173431', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3431"', false, 31, '2025-10-20 13:16:13.48626+00', '2025-10-20 13:16:13.48626+00');
INSERT INTO public.payment_methods VALUES (349, 'Test Payment Method 1760966173824', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3824"', false, 24, '2025-10-20 13:16:13.90045+00', '2025-10-20 13:16:13.90045+00');
INSERT INTO public.payment_methods VALUES (350, 'Test Payment Method 1760966173900', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3900"', false, 0, '2025-10-20 13:16:13.97943+00', '2025-10-20 13:16:13.97943+00');
INSERT INTO public.payment_methods VALUES (351, 'Test Payment Method 1760966174217', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4217"', false, 17, '2025-10-20 13:16:14.303286+00', '2025-10-20 13:16:14.303286+00');
INSERT INTO public.payment_methods VALUES (279, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 12:42:08.232307+00', '2025-10-20 12:42:08.232307+00');
INSERT INTO public.payment_methods VALUES (63, 'Test Payment Method 1760835306467', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6467"', false, 67, '2025-10-19 00:55:06.593492+00', '2025-10-19 00:55:06.593492+00');
INSERT INTO public.payment_methods VALUES (70, 'Test Payment Method 1760835307661', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7661"', false, 61, '2025-10-19 00:55:07.786939+00', '2025-10-19 00:55:07.786939+00');
INSERT INTO public.payment_methods VALUES (77, 'Test Payment Method 1760835310290', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0290"', false, 90, '2025-10-19 00:55:10.423948+00', '2025-10-19 00:55:10.423948+00');
INSERT INTO public.payment_methods VALUES (83, 'Test Payment Method 1760835312618', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2618"', false, 18, '2025-10-19 00:55:12.749357+00', '2025-10-19 00:55:12.749357+00');
INSERT INTO public.payment_methods VALUES (85, 'Test Payment Method 1760835313202', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3202"', false, 2, '2025-10-19 00:55:13.344109+00', '2025-10-19 00:55:13.344109+00');
INSERT INTO public.payment_methods VALUES (87, 'Test Payment Method 1760835313909', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3909"', false, 9, '2025-10-19 00:55:14.043103+00', '2025-10-19 00:55:14.043103+00');
INSERT INTO public.payment_methods VALUES (88, 'Test Payment Method 1760835314477', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4477"', false, 77, '2025-10-19 00:55:14.602416+00', '2025-10-19 00:55:14.602416+00');
INSERT INTO public.payment_methods VALUES (90, 'Test Payment Method 1760835315056', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5056"', false, 56, '2025-10-19 00:55:15.193579+00', '2025-10-19 00:55:15.193579+00');
INSERT INTO public.payment_methods VALUES (92, 'Test Payment Method 1760835315816', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5816"', false, 16, '2025-10-19 00:55:16.142346+00', '2025-10-19 00:55:16.142346+00');
INSERT INTO public.payment_methods VALUES (93, 'Test Payment Method 1760835316751', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6751"', false, 51, '2025-10-19 00:55:16.891773+00', '2025-10-19 00:55:16.891773+00');
INSERT INTO public.payment_methods VALUES (109, 'Test Payment Method 1760835548545', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8545"', false, 45, '2025-10-19 00:59:08.662376+00', '2025-10-19 00:59:08.662376+00');
INSERT INTO public.payment_methods VALUES (94, 'Test Payment Method 1760835317433', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7433"', false, 15, '2025-10-19 00:55:17.595191+00', '2025-10-19 00:55:17.595191+00');
INSERT INTO public.payment_methods VALUES (95, 'Test Payment Method 1760835318046', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8046"', false, 10, '2025-10-19 00:55:18.203501+00', '2025-10-19 00:55:18.203501+00');
INSERT INTO public.payment_methods VALUES (96, 'Test Payment Method 1760835318538', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8538"', false, 38, '2025-10-19 00:55:18.685579+00', '2025-10-19 00:55:18.685579+00');
INSERT INTO public.payment_methods VALUES (97, 'Test Payment Method 1760835319173', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9173"', false, 73, '2025-10-19 00:55:19.293413+00', '2025-10-19 00:55:19.293413+00');
INSERT INTO public.payment_methods VALUES (99, 'Test Payment Method 1760835320070', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0070"', false, 70, '2025-10-19 00:55:20.205559+00', '2025-10-19 00:55:20.205559+00');
INSERT INTO public.payment_methods VALUES (101, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-19 00:59:06.910238+00', '2025-10-19 00:59:06.910238+00');
INSERT INTO public.payment_methods VALUES (104, 'Test Payment Method 1760835547710', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7710"', false, 10, '2025-10-19 00:59:07.855334+00', '2025-10-19 00:59:07.855334+00');
INSERT INTO public.payment_methods VALUES (103, 'Test Payment Method 1760835546446', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6446"', false, 46, '2025-10-19 00:59:07.828897+00', '2025-10-19 00:59:07.828897+00');
INSERT INTO public.payment_methods VALUES (105, 'Test Payment Method 1760835546450', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6450"', false, 50, '2025-10-19 00:59:07.932919+00', '2025-10-19 00:59:07.932919+00');
INSERT INTO public.payment_methods VALUES (106, 'Test Payment Method 1760835548137', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8137"', false, 37, '2025-10-19 00:59:08.261783+00', '2025-10-19 00:59:08.261783+00');
INSERT INTO public.payment_methods VALUES (108, 'Test Payment Method 1760835548297', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8297"', false, 97, '2025-10-19 00:59:08.433989+00', '2025-10-19 00:59:08.433989+00');
INSERT INTO public.payment_methods VALUES (107, 'Test Payment Method 1760835548244', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8244"', false, 44, '2025-10-19 00:59:08.398438+00', '2025-10-19 00:59:08.398438+00');
INSERT INTO public.payment_methods VALUES (110, 'Test Payment Method 1760835548660', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8660"', false, 60, '2025-10-19 00:59:08.798553+00', '2025-10-19 00:59:08.798553+00');
INSERT INTO public.payment_methods VALUES (111, 'Test Payment Method 1760835548884', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8884"', false, 84, '2025-10-19 00:59:09.001159+00', '2025-10-19 00:59:09.001159+00');
INSERT INTO public.payment_methods VALUES (112, 'Test Payment Method 1760835548992', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8992"', false, 92, '2025-10-19 00:59:09.117234+00', '2025-10-19 00:59:09.117234+00');
INSERT INTO public.payment_methods VALUES (113, 'Test Payment Method 1760835549119', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9119"', false, 19, '2025-10-19 00:59:09.274586+00', '2025-10-19 00:59:09.274586+00');
INSERT INTO public.payment_methods VALUES (115, 'Test Payment Method 1760835549443', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9443"', false, 43, '2025-10-19 00:59:09.576463+00', '2025-10-19 00:59:09.576463+00');
INSERT INTO public.payment_methods VALUES (114, 'Test Payment Method 1760835549420', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9420"', false, 20, '2025-10-19 00:59:09.557403+00', '2025-10-19 00:59:09.557403+00');
INSERT INTO public.payment_methods VALUES (116, 'Test Payment Method 1760835549649', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9649"', false, 49, '2025-10-19 00:59:09.779775+00', '2025-10-19 00:59:09.779775+00');
INSERT INTO public.payment_methods VALUES (117, 'Test Payment Method 1760835549849', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9849"', false, 49, '2025-10-19 00:59:09.981378+00', '2025-10-19 00:59:09.981378+00');
INSERT INTO public.payment_methods VALUES (119, 'Test Payment Method 1760835549999', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9999"', false, 99, '2025-10-19 00:59:10.133782+00', '2025-10-19 00:59:10.133782+00');
INSERT INTO public.payment_methods VALUES (120, 'Test Payment Method 1760835550130', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0130"', false, 30, '2025-10-19 00:59:10.258863+00', '2025-10-19 00:59:10.258863+00');
INSERT INTO public.payment_methods VALUES (121, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-19 00:59:10.302379+00', '2025-10-19 00:59:10.302379+00');
INSERT INTO public.payment_methods VALUES (118, 'Test Payment Method 1760835549986', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9986"', false, 86, '2025-10-19 00:59:10.132556+00', '2025-10-19 00:59:10.132556+00');
INSERT INTO public.payment_methods VALUES (122, 'Test Payment Method 1760835550405', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0405"', false, 5, '2025-10-19 00:59:10.524048+00', '2025-10-19 00:59:10.524048+00');
INSERT INTO public.payment_methods VALUES (124, 'Test Payment Method 1760835550556', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0556"', false, 56, '2025-10-19 00:59:10.717392+00', '2025-10-19 00:59:10.717392+00');
INSERT INTO public.payment_methods VALUES (125, 'Test Payment Method 1760835550673', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0673"', false, 73, '2025-10-19 00:59:10.805246+00', '2025-10-19 00:59:10.805246+00');
INSERT INTO public.payment_methods VALUES (127, 'Test Payment Method 1760835550843', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0843"', false, 43, '2025-10-19 00:59:10.974335+00', '2025-10-19 00:59:10.974335+00');
INSERT INTO public.payment_methods VALUES (128, 'Test Payment Method 1760835551138', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1138"', false, 38, '2025-10-19 00:59:11.268876+00', '2025-10-19 00:59:11.268876+00');
INSERT INTO public.payment_methods VALUES (132, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1602"', false, 2, '2025-10-19 00:59:11.735623+00', '2025-10-19 00:59:11.735623+00');
INSERT INTO public.payment_methods VALUES (129, 'Test Payment Method 1760835551135', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1135"', false, 35, '2025-10-19 00:59:11.288877+00', '2025-10-19 00:59:11.288877+00');
INSERT INTO public.payment_methods VALUES (130, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-19 00:59:11.31275+00', '2025-10-19 00:59:11.31275+00');
INSERT INTO public.payment_methods VALUES (133, 'Test Payment Method 1760835551745', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1745"', false, 45, '2025-10-19 00:59:11.873825+00', '2025-10-19 00:59:11.873825+00');
INSERT INTO public.payment_methods VALUES (131, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-1485"', false, 5, '2025-10-19 00:59:11.625854+00', '2025-10-19 00:59:11.625854+00');
INSERT INTO public.payment_methods VALUES (134, 'Test Payment Method 1760835552025', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2025"', false, 25, '2025-10-19 00:59:12.15772+00', '2025-10-19 00:59:12.15772+00');
INSERT INTO public.payment_methods VALUES (102, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 00:59:07.047293+00', '2025-10-19 00:59:07.047293+00');
INSERT INTO public.payment_methods VALUES (135, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2064"', false, 64, '2025-10-19 00:59:12.195319+00', '2025-10-19 00:59:12.195319+00');
INSERT INTO public.payment_methods VALUES (136, 'Test Payment Method 1760835552287', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2287"', false, 87, '2025-10-19 00:59:12.41119+00', '2025-10-19 00:59:12.41119+00');
INSERT INTO public.payment_methods VALUES (139, 'Test Payment Method 1760835552816', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2816"', false, 16, '2025-10-19 00:59:12.937636+00', '2025-10-19 00:59:12.937636+00');
INSERT INTO public.payment_methods VALUES (143, 'Test Payment Method 1760835553493', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3493"', false, 93, '2025-10-19 00:59:13.610548+00', '2025-10-19 00:59:13.610548+00');
INSERT INTO public.payment_methods VALUES (144, 'Test Payment Method 1760835553634', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3634"', false, 34, '2025-10-19 00:59:13.760641+00', '2025-10-19 00:59:13.760641+00');
INSERT INTO public.payment_methods VALUES (295, 'Test Payment Method 1760964130654', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0654"', false, 54, '2025-10-20 12:42:10.744282+00', '2025-10-20 12:42:10.744282+00');
INSERT INTO public.payment_methods VALUES (147, 'Test Payment Method 1760835554076', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4076"', false, 76, '2025-10-19 00:59:14.210842+00', '2025-10-19 00:59:14.210842+00');
INSERT INTO public.payment_methods VALUES (154, 'Test Payment Method 1760835555572', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5572"', false, 72, '2025-10-19 00:59:15.694763+00', '2025-10-19 00:59:15.694763+00');
INSERT INTO public.payment_methods VALUES (156, 'Test Payment Method 1760835555689', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5689"', false, 89, '2025-10-19 00:59:15.815587+00', '2025-10-19 00:59:15.815587+00');
INSERT INTO public.payment_methods VALUES (319, 'Test Payment Method 1760964135135', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5135"', false, 35, '2025-10-20 12:42:15.228633+00', '2025-10-20 12:42:15.228633+00');
INSERT INTO public.payment_methods VALUES (158, 'Test Payment Method 1760835556105', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6105"', false, 15, '2025-10-19 00:59:16.228304+00', '2025-10-19 00:59:16.228304+00');
INSERT INTO public.payment_methods VALUES (166, 'Test Payment Method 1760835557873', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7873"', false, 73, '2025-10-19 00:59:18.002133+00', '2025-10-19 00:59:18.002133+00');
INSERT INTO public.payment_methods VALUES (167, 'Test Payment Method 1760835558179', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8179"', false, 79, '2025-10-19 00:59:18.319732+00', '2025-10-19 00:59:18.319732+00');
INSERT INTO public.payment_methods VALUES (173, 'Test Payment Method 1760835560882', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0882"', false, 82, '2025-10-19 00:59:21.013517+00', '2025-10-19 00:59:21.013517+00');
INSERT INTO public.payment_methods VALUES (176, 'Test Payment Method 1760835562714', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2714"', false, 14, '2025-10-19 00:59:22.8441+00', '2025-10-19 00:59:22.8441+00');
INSERT INTO public.payment_methods VALUES (181, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-19 18:21:02.703736+00', '2025-10-19 18:21:02.703736+00');
INSERT INTO public.payment_methods VALUES (261, 'Test Payment Method 1760964124114', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4114"', false, 14, '2025-10-20 12:42:04.75781+00', '2025-10-20 12:42:04.75781+00');
INSERT INTO public.payment_methods VALUES (265, 'Test Payment Method 1760964125344', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5344"', false, 44, '2025-10-20 12:42:05.523636+00', '2025-10-20 12:42:05.523636+00');
INSERT INTO public.payment_methods VALUES (268, 'Test Payment Method 1760964125740', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5740"', false, 40, '2025-10-20 12:42:05.837273+00', '2025-10-20 12:42:05.837273+00');
INSERT INTO public.payment_methods VALUES (269, 'Test Payment Method 1760964126120', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6120"', false, 20, '2025-10-20 12:42:06.239829+00', '2025-10-20 12:42:06.239829+00');
INSERT INTO public.payment_methods VALUES (270, 'Test Payment Method 1760964126151', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6151"', false, 51, '2025-10-20 12:42:06.242764+00', '2025-10-20 12:42:06.242764+00');
INSERT INTO public.payment_methods VALUES (272, 'Test Payment Method 1760964126991', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6991"', false, 91, '2025-10-20 12:42:07.096619+00', '2025-10-20 12:42:07.096619+00');
INSERT INTO public.payment_methods VALUES (275, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-20 12:42:07.574554+00', '2025-10-20 12:42:07.574554+00');
INSERT INTO public.payment_methods VALUES (276, 'Test Payment Method 1760964127445', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7445"', false, 45, '2025-10-20 12:42:07.668471+00', '2025-10-20 12:42:07.668471+00');
INSERT INTO public.payment_methods VALUES (280, 'Test Payment Method 1760964128358', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8358"', false, 58, '2025-10-20 12:42:08.453547+00', '2025-10-20 12:42:08.453547+00');
INSERT INTO public.payment_methods VALUES (281, 'Test Payment Method 1760964128186', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8186"', false, 86, '2025-10-20 12:42:08.460863+00', '2025-10-20 12:42:08.460863+00');
INSERT INTO public.payment_methods VALUES (287, 'Test Payment Method 1760964129516', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9516"', false, 16, '2025-10-20 12:42:09.614624+00', '2025-10-20 12:42:09.614624+00');
INSERT INTO public.payment_methods VALUES (291, 'Test Payment Method 1760964130086', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0086"', false, 86, '2025-10-20 12:42:10.192509+00', '2025-10-20 12:42:10.192509+00');
INSERT INTO public.payment_methods VALUES (292, 'Test Payment Method 1760964130258', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0258"', false, 58, '2025-10-20 12:42:10.347663+00', '2025-10-20 12:42:10.347663+00');
INSERT INTO public.payment_methods VALUES (297, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-20 12:42:11.049122+00', '2025-10-20 12:42:11.049122+00');
INSERT INTO public.payment_methods VALUES (299, 'Test Payment Method 1760964131203', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1203"', false, 3, '2025-10-20 12:42:11.287978+00', '2025-10-20 12:42:11.287978+00');
INSERT INTO public.payment_methods VALUES (303, 'Test Payment Method 1760964131766', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1766"', false, 66, '2025-10-20 12:42:11.85958+00', '2025-10-20 12:42:11.85958+00');
INSERT INTO public.payment_methods VALUES (306, 'Test Payment Method 1760964132315', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2315"', false, 15, '2025-10-20 12:42:12.424906+00', '2025-10-20 12:42:12.424906+00');
INSERT INTO public.payment_methods VALUES (311, 'Test Payment Method 1760964132925', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2925"', false, 25, '2025-10-20 12:42:13.012102+00', '2025-10-20 12:42:13.012102+00');
INSERT INTO public.payment_methods VALUES (312, 'Test Payment Method 1760964133381', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3381"', false, 81, '2025-10-20 12:42:13.480665+00', '2025-10-20 12:42:13.480665+00');
INSERT INTO public.payment_methods VALUES (315, 'Test Payment Method 1760964134026', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4026"', false, 26, '2025-10-20 12:42:14.120462+00', '2025-10-20 12:42:14.120462+00');
INSERT INTO public.payment_methods VALUES (314, 'Test Payment Method 1760964133831', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3831"', false, 31, '2025-10-20 12:42:13.931204+00', '2025-10-20 12:42:13.931204+00');
INSERT INTO public.payment_methods VALUES (317, 'Test Payment Method 1760964134563', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4563"', false, 63, '2025-10-20 12:42:14.640441+00', '2025-10-20 12:42:14.640441+00');
INSERT INTO public.payment_methods VALUES (318, 'Test Payment Method 1760964134767', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4767"', false, 67, '2025-10-20 12:42:14.865183+00', '2025-10-20 12:42:14.865183+00');
INSERT INTO public.payment_methods VALUES (324, 'Test Payment Method 1760964136405', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6405"', false, 5, '2025-10-20 12:42:16.505058+00', '2025-10-20 12:42:16.505058+00');
INSERT INTO public.payment_methods VALUES (325, 'Test Payment Method 1760964136552', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6552"', false, 52, '2025-10-20 12:42:16.649875+00', '2025-10-20 12:42:16.649875+00');
INSERT INTO public.payment_methods VALUES (330, 'Test Payment Method 1760964137604', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7604"', false, 4, '2025-10-20 12:42:17.719363+00', '2025-10-20 12:42:17.719363+00');
INSERT INTO public.payment_methods VALUES (331, 'Test Payment Method 1760964138255', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8255"', false, 55, '2025-10-20 12:42:18.347194+00', '2025-10-20 12:42:18.347194+00');
INSERT INTO public.payment_methods VALUES (332, 'Test Payment Method 1760964138876', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8876"', false, 76, '2025-10-20 12:42:18.991029+00', '2025-10-20 12:42:18.991029+00');
INSERT INTO public.payment_methods VALUES (336, 'Test Payment Method 1760964141319', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1319"', false, 19, '2025-10-20 12:42:21.420526+00', '2025-10-20 12:42:21.420526+00');
INSERT INTO public.payment_methods VALUES (345, 'Test Payment Method 1760966172633', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2633"', false, 33, '2025-10-20 13:16:12.698612+00', '2025-10-20 13:16:12.698612+00');
INSERT INTO public.payment_methods VALUES (344, 'Test Payment Method 1760966172532', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2532"', false, 32, '2025-10-20 13:16:12.601514+00', '2025-10-20 13:16:12.601514+00');
INSERT INTO public.payment_methods VALUES (293, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 12:42:10.489706+00', '2025-10-20 12:42:10.489706+00');
INSERT INTO public.payment_methods VALUES (137, 'Test Payment Method 1760835552507', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2507"', false, 7, '2025-10-19 00:59:12.662586+00', '2025-10-19 00:59:12.662586+00');
INSERT INTO public.payment_methods VALUES (140, 'Test Payment Method 1760835552893', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2893"', false, 93, '2025-10-19 00:59:13.018952+00', '2025-10-19 00:59:13.018952+00');
INSERT INTO public.payment_methods VALUES (141, 'Test Payment Method 1760835553009', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3009"', false, 9, '2025-10-19 00:59:13.139214+00', '2025-10-19 00:59:13.139214+00');
INSERT INTO public.payment_methods VALUES (142, 'Test Payment Method 1760835553384', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3384"', false, 84, '2025-10-19 00:59:13.522471+00', '2025-10-19 00:59:13.522471+00');
INSERT INTO public.payment_methods VALUES (145, 'Test Payment Method 1760835553947', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3947"', false, 47, '2025-10-19 00:59:14.065652+00', '2025-10-19 00:59:14.065652+00');
INSERT INTO public.payment_methods VALUES (182, 'Test Payment Method 1760963181844', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1844"', false, 44, '2025-10-20 12:26:21.992953+00', '2025-10-20 12:26:21.992953+00');
INSERT INTO public.payment_methods VALUES (148, 'Test Payment Method 1760835554439', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4439"', false, 39, '2025-10-19 00:59:14.571728+00', '2025-10-19 00:59:14.571728+00');
INSERT INTO public.payment_methods VALUES (152, 'Test Payment Method 1760835555081', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5081"', false, 15, '2025-10-19 00:59:15.221105+00', '2025-10-19 00:59:15.221105+00');
INSERT INTO public.payment_methods VALUES (153, 'Test Payment Method 1760835555240', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5240"', false, 40, '2025-10-19 00:59:15.383677+00', '2025-10-19 00:59:15.383677+00');
INSERT INTO public.payment_methods VALUES (157, 'Test Payment Method 1760835555976', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5976"', false, 76, '2025-10-19 00:59:16.099084+00', '2025-10-19 00:59:16.099084+00');
INSERT INTO public.payment_methods VALUES (160, 'Test Payment Method 1760835556495', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6495"', false, 10, '2025-10-19 00:59:16.62456+00', '2025-10-19 00:59:16.62456+00');
INSERT INTO public.payment_methods VALUES (162, 'Test Payment Method 1760835556921', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6921"', false, 21, '2025-10-19 00:59:17.046812+00', '2025-10-19 00:59:17.046812+00');
INSERT INTO public.payment_methods VALUES (164, 'Test Payment Method 1760835557342', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7342"', false, 42, '2025-10-19 00:59:17.466675+00', '2025-10-19 00:59:17.466675+00');
INSERT INTO public.payment_methods VALUES (165, 'Test Payment Method 1760835557624', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7624"', false, 24, '2025-10-19 00:59:17.748211+00', '2025-10-19 00:59:17.748211+00');
INSERT INTO public.payment_methods VALUES (169, 'Test Payment Method 1760835558529', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8529"', false, 29, '2025-10-19 00:59:18.651513+00', '2025-10-19 00:59:18.651513+00');
INSERT INTO public.payment_methods VALUES (172, 'Test Payment Method 1760835560264', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0264"', false, 64, '2025-10-19 00:59:20.400089+00', '2025-10-19 00:59:20.400089+00');
INSERT INTO public.payment_methods VALUES (175, 'Test Payment Method 1760835562119', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2119"', false, 19, '2025-10-19 00:59:22.248189+00', '2025-10-19 00:59:22.248189+00');
INSERT INTO public.payment_methods VALUES (185, 'Test Payment Method 1760963183276', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3276"', false, 76, '2025-10-20 12:26:23.373423+00', '2025-10-20 12:26:23.373423+00');
INSERT INTO public.payment_methods VALUES (186, 'Test Payment Method 1760963183407', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3407"', false, 7, '2025-10-20 12:26:23.541921+00', '2025-10-20 12:26:23.541921+00');
INSERT INTO public.payment_methods VALUES (187, 'Test Payment Method 1760963183902', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3902"', false, 2, '2025-10-20 12:26:24.015445+00', '2025-10-20 12:26:24.015445+00');
INSERT INTO public.payment_methods VALUES (189, 'Test Payment Method 1760963184393', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4393"', false, 93, '2025-10-20 12:26:24.497568+00', '2025-10-20 12:26:24.497568+00');
INSERT INTO public.payment_methods VALUES (194, 'Test Payment Method 1760963185617', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5617"', false, 17, '2025-10-20 12:26:25.71997+00', '2025-10-20 12:26:25.71997+00');
INSERT INTO public.payment_methods VALUES (196, 'Test Payment Method 1760963186024', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6024"', false, 24, '2025-10-20 12:26:26.137418+00', '2025-10-20 12:26:26.137418+00');
INSERT INTO public.payment_methods VALUES (195, 'Test Payment Method 1760963185908', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5908"', false, 8, '2025-10-20 12:26:26.031042+00', '2025-10-20 12:26:26.031042+00');
INSERT INTO public.payment_methods VALUES (199, 'Test Payment Method 1760963186696', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6696"', false, 96, '2025-10-20 12:26:26.781307+00', '2025-10-20 12:26:26.781307+00');
INSERT INTO public.payment_methods VALUES (211, 'Test Payment Method 1760963188902', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8902"', false, 2, '2025-10-20 12:26:28.986776+00', '2025-10-20 12:26:28.986776+00');
INSERT INTO public.payment_methods VALUES (201, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7152"', false, 52, '2025-10-20 12:26:27.250065+00', '2025-10-20 12:26:27.250065+00');
INSERT INTO public.payment_methods VALUES (203, 'Test Payment Method 1760963187577', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7577"', false, 77, '2025-10-20 12:26:27.666652+00', '2025-10-20 12:26:27.666652+00');
INSERT INTO public.payment_methods VALUES (205, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-20 12:26:28.034627+00', '2025-10-20 12:26:28.034627+00');
INSERT INTO public.payment_methods VALUES (206, 'Test Payment Method 1760963188014', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8014"', false, 14, '2025-10-20 12:26:28.108253+00', '2025-10-20 12:26:28.108253+00');
INSERT INTO public.payment_methods VALUES (208, 'Test Payment Method 1760963188275', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8275"', false, 75, '2025-10-20 12:26:28.361819+00', '2025-10-20 12:26:28.361819+00');
INSERT INTO public.payment_methods VALUES (215, 'Test Payment Method 1760963189976', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9976"', false, 76, '2025-10-20 12:26:30.058798+00', '2025-10-20 12:26:30.058798+00');
INSERT INTO public.payment_methods VALUES (218, 'Test Payment Method 1760963190545', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0545"', false, 45, '2025-10-20 12:26:30.643818+00', '2025-10-20 12:26:30.643818+00');
INSERT INTO public.payment_methods VALUES (219, 'Test Payment Method 1760963190934', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0934"', false, 15, '2025-10-20 12:26:31.038292+00', '2025-10-20 12:26:31.038292+00');
INSERT INTO public.payment_methods VALUES (226, 'Test Payment Method 1760963192514', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2514"', false, 14, '2025-10-20 12:26:32.607204+00', '2025-10-20 12:26:32.607204+00');
INSERT INTO public.payment_methods VALUES (227, 'Test Payment Method 1760963192642', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2642"', false, 42, '2025-10-20 12:26:32.741985+00', '2025-10-20 12:26:32.741985+00');
INSERT INTO public.payment_methods VALUES (229, 'Test Payment Method 1760963193187', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3187"', false, 87, '2025-10-20 12:26:33.287761+00', '2025-10-20 12:26:33.287761+00');
INSERT INTO public.payment_methods VALUES (234, 'Test Payment Method 1760963193982', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3982"', false, 82, '2025-10-20 12:26:34.073984+00', '2025-10-20 12:26:34.073984+00');
INSERT INTO public.payment_methods VALUES (231, 'Test Payment Method 1760963193321', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3321"', false, 21, '2025-10-20 12:26:33.414822+00', '2025-10-20 12:26:33.414822+00');
INSERT INTO public.payment_methods VALUES (237, 'Test Payment Method 1760963194563', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4563"', false, 63, '2025-10-20 12:26:34.667311+00', '2025-10-20 12:26:34.667311+00');
INSERT INTO public.payment_methods VALUES (239, 'Test Payment Method 1760963195077', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5077"', false, 77, '2025-10-20 12:26:35.16937+00', '2025-10-20 12:26:35.16937+00');
INSERT INTO public.payment_methods VALUES (242, 'Test Payment Method 1760963195525', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5525"', false, 25, '2025-10-20 12:26:35.626649+00', '2025-10-20 12:26:35.626649+00');
INSERT INTO public.payment_methods VALUES (247, 'Test Payment Method 1760963197026', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7026"', false, 26, '2025-10-20 12:26:37.125808+00', '2025-10-20 12:26:37.125808+00');
INSERT INTO public.payment_methods VALUES (244, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-5803"', false, 5, '2025-10-20 12:26:35.91588+00', '2025-10-20 12:26:35.91588+00');
INSERT INTO public.payment_methods VALUES (245, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6388"', false, 88, '2025-10-20 12:26:36.495797+00', '2025-10-20 12:26:36.495797+00');
INSERT INTO public.payment_methods VALUES (253, 'Test Payment Method 1760963198579', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8579"', false, 79, '2025-10-20 12:26:38.667924+00', '2025-10-20 12:26:38.667924+00');
INSERT INTO public.payment_methods VALUES (255, 'Test Payment Method 1760963199124', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9124"', false, 24, '2025-10-20 12:26:39.216046+00', '2025-10-20 12:26:39.216046+00');
INSERT INTO public.payment_methods VALUES (197, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 12:26:26.224665+00', '2025-10-20 12:26:26.224665+00');
INSERT INTO public.payment_methods VALUES (138, 'Test Payment Method 1760835552514', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2514"', false, 14, '2025-10-19 00:59:12.668552+00', '2025-10-19 00:59:12.668552+00');
INSERT INTO public.payment_methods VALUES (146, 'Test Payment Method 1760835553894', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3894"', false, 94, '2025-10-19 00:59:14.093018+00', '2025-10-19 00:59:14.093018+00');
INSERT INTO public.payment_methods VALUES (149, 'Test Payment Method 1760835554459', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4459"', false, 59, '2025-10-19 00:59:14.583708+00', '2025-10-19 00:59:14.583708+00');
INSERT INTO public.payment_methods VALUES (150, 'Test Payment Method 1760835554632', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4632"', false, 32, '2025-10-19 00:59:14.761632+00', '2025-10-19 00:59:14.761632+00');
INSERT INTO public.payment_methods VALUES (151, 'Test Payment Method 1760835555004', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5004"', false, 4, '2025-10-19 00:59:15.128402+00', '2025-10-19 00:59:15.128402+00');
INSERT INTO public.payment_methods VALUES (155, 'Test Payment Method 1760835555570', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5570"', false, 15, '2025-10-19 00:59:15.696181+00', '2025-10-19 00:59:15.696181+00');
INSERT INTO public.payment_methods VALUES (159, 'Test Payment Method 1760835556131', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6131"', false, 31, '2025-10-19 00:59:16.259814+00', '2025-10-19 00:59:16.259814+00');
INSERT INTO public.payment_methods VALUES (161, 'Test Payment Method 1760835556718', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6718"', false, 18, '2025-10-19 00:59:16.854668+00', '2025-10-19 00:59:16.854668+00');
INSERT INTO public.payment_methods VALUES (163, 'Test Payment Method 1760835557307', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7307"', false, 7, '2025-10-19 00:59:17.449314+00', '2025-10-19 00:59:17.449314+00');
INSERT INTO public.payment_methods VALUES (183, 'Test Payment Method 1760963182641', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2641"', false, 41, '2025-10-20 12:26:22.739874+00', '2025-10-20 12:26:22.739874+00');
INSERT INTO public.payment_methods VALUES (168, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-19 00:59:18.465031+00', '2025-10-19 00:59:18.465031+00');
INSERT INTO public.payment_methods VALUES (170, 'Test Payment Method 1760835559097', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9097"', false, 97, '2025-10-19 00:59:19.237643+00', '2025-10-19 00:59:19.237643+00');
INSERT INTO public.payment_methods VALUES (171, 'Test Payment Method 1760835559670', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9670"', false, 70, '2025-10-19 00:59:19.820442+00', '2025-10-19 00:59:19.820442+00');
INSERT INTO public.payment_methods VALUES (174, 'Test Payment Method 1760835561536', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1536"', false, 36, '2025-10-19 00:59:21.67827+00', '2025-10-19 00:59:21.67827+00');
INSERT INTO public.payment_methods VALUES (184, 'Test Payment Method 1760963181913', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1913"', false, 13, '2025-10-20 12:26:23.01599+00', '2025-10-20 12:26:23.01599+00');
INSERT INTO public.payment_methods VALUES (188, 'Test Payment Method 1760963184011', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4011"', false, 11, '2025-10-20 12:26:24.101709+00', '2025-10-20 12:26:24.101709+00');
INSERT INTO public.payment_methods VALUES (190, 'Test Payment Method 1760963184606', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4606"', false, 6, '2025-10-20 12:26:24.711539+00', '2025-10-20 12:26:24.711539+00');
INSERT INTO public.payment_methods VALUES (191, 'Test Payment Method 1760963184807', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4807"', false, 7, '2025-10-20 12:26:24.913954+00', '2025-10-20 12:26:24.913954+00');
INSERT INTO public.payment_methods VALUES (192, 'Test Payment Method 1760963185281', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5281"', false, 81, '2025-10-20 12:26:25.38261+00', '2025-10-20 12:26:25.38261+00');
INSERT INTO public.payment_methods VALUES (193, 'Test Payment Method 1760963185371', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5371"', false, 71, '2025-10-20 12:26:25.477313+00', '2025-10-20 12:26:25.477313+00');
INSERT INTO public.payment_methods VALUES (198, 'Test Payment Method 1760963186426', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6426"', false, 26, '2025-10-20 12:26:26.560945+00', '2025-10-20 12:26:26.560945+00');
INSERT INTO public.payment_methods VALUES (200, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-20 12:26:26.835442+00', '2025-10-20 12:26:26.835442+00');
INSERT INTO public.payment_methods VALUES (202, 'Test Payment Method 1760963187260', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7260"', false, 60, '2025-10-20 12:26:27.351741+00', '2025-10-20 12:26:27.351741+00');
INSERT INTO public.payment_methods VALUES (204, 'Test Payment Method 1760963187778', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7778"', false, 78, '2025-10-20 12:26:27.857561+00', '2025-10-20 12:26:27.857561+00');
INSERT INTO public.payment_methods VALUES (209, 'Test Payment Method 1760963188352', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8352"', false, 52, '2025-10-20 12:26:28.448456+00', '2025-10-20 12:26:28.448456+00');
INSERT INTO public.payment_methods VALUES (210, 'Test Payment Method 1760963188785', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8785"', false, 85, '2025-10-20 12:26:28.87758+00', '2025-10-20 12:26:28.87758+00');
INSERT INTO public.payment_methods VALUES (212, 'Test Payment Method 1760963189198', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9198"', false, 98, '2025-10-20 12:26:29.305603+00', '2025-10-20 12:26:29.305603+00');
INSERT INTO public.payment_methods VALUES (213, 'Test Payment Method 1760963189447', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9447"', false, 47, '2025-10-20 12:26:29.537847+00', '2025-10-20 12:26:29.537847+00');
INSERT INTO public.payment_methods VALUES (225, 'Test Payment Method 1760963191924', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1924"', false, 24, '2025-10-20 12:26:32.221915+00', '2025-10-20 12:26:32.221915+00');
INSERT INTO public.payment_methods VALUES (214, 'Test Payment Method 1760963189590', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9590"', false, 90, '2025-10-20 12:26:29.686465+00', '2025-10-20 12:26:29.686465+00');
INSERT INTO public.payment_methods VALUES (216, 'Test Payment Method 1760963190117', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0117"', false, 17, '2025-10-20 12:26:30.234222+00', '2025-10-20 12:26:30.234222+00');
INSERT INTO public.payment_methods VALUES (217, 'Test Payment Method 1760963190540', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0540"', false, 40, '2025-10-20 12:26:30.619891+00', '2025-10-20 12:26:30.619891+00');
INSERT INTO public.payment_methods VALUES (220, 'Test Payment Method 1760963191117', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1117"', false, 17, '2025-10-20 12:26:31.206985+00', '2025-10-20 12:26:31.206985+00');
INSERT INTO public.payment_methods VALUES (228, 'Test Payment Method 1760963192788', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2788"', false, 88, '2025-10-20 12:26:32.877656+00', '2025-10-20 12:26:32.877656+00');
INSERT INTO public.payment_methods VALUES (222, 'Test Payment Method 1760963191410', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1410"', false, 10, '2025-10-20 12:26:31.502101+00', '2025-10-20 12:26:31.502101+00');
INSERT INTO public.payment_methods VALUES (223, 'Test Payment Method 1760963191920', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1920"', false, 20, '2025-10-20 12:26:32.033976+00', '2025-10-20 12:26:32.033976+00');
INSERT INTO public.payment_methods VALUES (230, 'Test Payment Method 1760963193210', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3210"', false, 10, '2025-10-20 12:26:33.319152+00', '2025-10-20 12:26:33.319152+00');
INSERT INTO public.payment_methods VALUES (233, 'Test Payment Method 1760963193823', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3823"', false, 23, '2025-10-20 12:26:33.926504+00', '2025-10-20 12:26:33.926504+00');
INSERT INTO public.payment_methods VALUES (232, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-20 12:26:33.555866+00', '2025-10-20 12:26:33.555866+00');
INSERT INTO public.payment_methods VALUES (235, 'Test Payment Method 1760963194229', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4229"', false, 29, '2025-10-20 12:26:34.321909+00', '2025-10-20 12:26:34.321909+00');
INSERT INTO public.payment_methods VALUES (246, 'Test Payment Method 1760963196535', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6535"', false, 35, '2025-10-20 12:26:36.647419+00', '2025-10-20 12:26:36.647419+00');
INSERT INTO public.payment_methods VALUES (250, 'Test Payment Method 1760963197877', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7877"', false, 77, '2025-10-20 12:26:38.035952+00', '2025-10-20 12:26:38.035952+00');
INSERT INTO public.payment_methods VALUES (258, 'Test Payment Method 1760963199856', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9856"', false, 15, '2025-10-20 12:26:39.952544+00', '2025-10-20 12:26:39.952544+00');
INSERT INTO public.payment_methods VALUES (262, 'Test Payment Method 1760964124829', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4829"', false, 29, '2025-10-20 12:42:05.006041+00', '2025-10-20 12:42:05.006041+00');
INSERT INTO public.payment_methods VALUES (263, 'Test Payment Method 1760964125192', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5192"', false, 92, '2025-10-20 12:42:05.303335+00', '2025-10-20 12:42:05.303335+00');
INSERT INTO public.payment_methods VALUES (271, 'Test Payment Method 1760964126105', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6105"', false, 5, '2025-10-20 12:42:06.740767+00', '2025-10-20 12:42:06.740767+00');
INSERT INTO public.payment_methods VALUES (274, 'Test Payment Method 1760964127323', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7323"', false, 23, '2025-10-20 12:42:07.411681+00', '2025-10-20 12:42:07.411681+00');
INSERT INTO public.payment_methods VALUES (207, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 12:26:28.236188+00', '2025-10-20 12:26:28.236188+00');
INSERT INTO public.payment_methods VALUES (352, 'Test Payment Method 1760966174423', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4423"', false, 23, '2025-10-20 13:16:14.484642+00', '2025-10-20 13:16:14.484642+00');
INSERT INTO public.payment_methods VALUES (355, 'Test Payment Method 1760966174938', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4938"', false, 38, '2025-10-20 13:16:14.994894+00', '2025-10-20 13:16:14.994894+00');
INSERT INTO public.payment_methods VALUES (357, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-20 13:16:15.323848+00', '2025-10-20 13:16:15.323848+00');
INSERT INTO public.payment_methods VALUES (358, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5683"', false, 83, '2025-10-20 13:16:15.735479+00', '2025-10-20 13:16:15.735479+00');
INSERT INTO public.payment_methods VALUES (362, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-20 13:16:16.473145+00', '2025-10-20 13:16:16.473145+00');
INSERT INTO public.payment_methods VALUES (369, 'Test Payment Method 1760966178178', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8178"', false, 78, '2025-10-20 13:16:18.24497+00', '2025-10-20 13:16:18.24497+00');
INSERT INTO public.payment_methods VALUES (373, 'Test Payment Method 1760966179442', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9442"', false, 42, '2025-10-20 13:16:19.519579+00', '2025-10-20 13:16:19.519579+00');
INSERT INTO public.payment_methods VALUES (376, 'Test Payment Method 1760966179897', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9897"', false, 97, '2025-10-20 13:16:19.946181+00', '2025-10-20 13:16:19.946181+00');
INSERT INTO public.payment_methods VALUES (379, 'Test Payment Method 1760966180278', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0278"', false, 15, '2025-10-20 13:16:20.3461+00', '2025-10-20 13:16:20.3461+00');
INSERT INTO public.payment_methods VALUES (380, 'Test Payment Method 1760966180525', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0525"', false, 25, '2025-10-20 13:16:20.596209+00', '2025-10-20 13:16:20.596209+00');
INSERT INTO public.payment_methods VALUES (386, 'Test Payment Method 1760966181290', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1290"', false, 90, '2025-10-20 13:16:21.362874+00', '2025-10-20 13:16:21.362874+00');
INSERT INTO public.payment_methods VALUES (396, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-2605"', false, 5, '2025-10-20 13:16:22.670911+00', '2025-10-20 13:16:22.670911+00');
INSERT INTO public.payment_methods VALUES (403, 'Test Payment Method 1760966183946', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3946"', false, 46, '2025-10-20 13:16:24.008973+00', '2025-10-20 13:16:24.008973+00');
INSERT INTO public.payment_methods VALUES (405, 'Test Payment Method 1760966184513', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4513"', false, 13, '2025-10-20 13:16:24.581843+00', '2025-10-20 13:16:24.581843+00');
INSERT INTO public.payment_methods VALUES (412, 'Test Payment Method 1760966186594', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6594"', false, 94, '2025-10-20 13:16:26.65614+00', '2025-10-20 13:16:26.65614+00');
INSERT INTO public.payment_methods VALUES (414, 'Test Payment Method 1760966187177', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7177"', false, 77, '2025-10-20 13:16:27.241671+00', '2025-10-20 13:16:27.241671+00');
INSERT INTO public.payment_methods VALUES (392, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 13:16:22.10846+00', '2025-10-20 13:16:22.10846+00');
INSERT INTO public.payment_methods VALUES (353, 'Test Payment Method 1760966174541', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4541"', false, 41, '2025-10-20 13:16:14.605431+00', '2025-10-20 13:16:14.605431+00');
INSERT INTO public.payment_methods VALUES (356, 'Test Payment Method 1760966174968', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4968"', false, 68, '2025-10-20 13:16:15.038314+00', '2025-10-20 13:16:15.038314+00');
INSERT INTO public.payment_methods VALUES (359, 'Test Payment Method 1760966175799', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5799"', false, 99, '2025-10-20 13:16:15.863067+00', '2025-10-20 13:16:15.863067+00');
INSERT INTO public.payment_methods VALUES (360, 'Test Payment Method 1760966176069', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6069"', false, 69, '2025-10-20 13:16:16.13252+00', '2025-10-20 13:16:16.13252+00');
INSERT INTO public.payment_methods VALUES (361, 'Test Payment Method 1760966176386', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6386"', false, 86, '2025-10-20 13:16:16.465289+00', '2025-10-20 13:16:16.465289+00');
INSERT INTO public.payment_methods VALUES (363, 'Test Payment Method 1760966176509', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6509"', false, 9, '2025-10-20 13:16:16.574071+00', '2025-10-20 13:16:16.574071+00');
INSERT INTO public.payment_methods VALUES (365, 'Test Payment Method 1760966176841', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6841"', false, 41, '2025-10-20 13:16:16.904463+00', '2025-10-20 13:16:16.904463+00');
INSERT INTO public.payment_methods VALUES (366, 'Test Payment Method 1760966176908', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6908"', false, 8, '2025-10-20 13:16:16.97442+00', '2025-10-20 13:16:16.97442+00');
INSERT INTO public.payment_methods VALUES (367, 'Test Payment Method 1760966177689', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7689"', false, 89, '2025-10-20 13:16:17.75104+00', '2025-10-20 13:16:17.75104+00');
INSERT INTO public.payment_methods VALUES (368, 'Test Payment Method 1760966177740', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7740"', false, 40, '2025-10-20 13:16:17.799782+00', '2025-10-20 13:16:17.799782+00');
INSERT INTO public.payment_methods VALUES (370, 'Test Payment Method 1760966178468', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8468"', false, 68, '2025-10-20 13:16:18.539455+00', '2025-10-20 13:16:18.539455+00');
INSERT INTO public.payment_methods VALUES (384, 'Test Payment Method 1760966181087', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1087"', false, 87, '2025-10-20 13:16:21.178544+00', '2025-10-20 13:16:21.178544+00');
INSERT INTO public.payment_methods VALUES (371, 'Test Payment Method 1760966178747', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8747"', false, 47, '2025-10-20 13:16:18.804946+00', '2025-10-20 13:16:18.804946+00');
INSERT INTO public.payment_methods VALUES (372, 'Test Payment Method 1760966178191', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8191"', false, 91, '2025-10-20 13:16:18.967246+00', '2025-10-20 13:16:18.967246+00');
INSERT INTO public.payment_methods VALUES (374, 'Test Payment Method 1760966179480', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9480"', false, 80, '2025-10-20 13:16:19.549113+00', '2025-10-20 13:16:19.549113+00');
INSERT INTO public.payment_methods VALUES (375, 'Test Payment Method 1760966179714', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9714"', false, 14, '2025-10-20 13:16:19.794999+00', '2025-10-20 13:16:19.794999+00');
INSERT INTO public.payment_methods VALUES (377, 'Test Payment Method 1760966179975', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9975"', false, 75, '2025-10-20 13:16:20.034631+00', '2025-10-20 13:16:20.034631+00');
INSERT INTO public.payment_methods VALUES (378, 'Test Payment Method 1760966180122', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0122"', false, 22, '2025-10-20 13:16:20.18887+00', '2025-10-20 13:16:20.18887+00');
INSERT INTO public.payment_methods VALUES (381, 'Test Payment Method 1760966180526', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0526"', false, 26, '2025-10-20 13:16:20.603643+00', '2025-10-20 13:16:20.603643+00');
INSERT INTO public.payment_methods VALUES (385, 'Test Payment Method 1760966181183', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1183"', false, 83, '2025-10-20 13:16:21.265891+00', '2025-10-20 13:16:21.265891+00');
INSERT INTO public.payment_methods VALUES (382, 'Test Payment Method 1760966180760', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0760"', false, 10, '2025-10-20 13:16:20.834872+00', '2025-10-20 13:16:20.834872+00');
INSERT INTO public.payment_methods VALUES (383, 'Test Payment Method 1760966180960', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0960"', false, 60, '2025-10-20 13:16:21.031551+00', '2025-10-20 13:16:21.031551+00');
INSERT INTO public.payment_methods VALUES (387, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-20 13:16:21.49889+00', '2025-10-20 13:16:21.49889+00');
INSERT INTO public.payment_methods VALUES (388, 'Test Payment Method 1760966181688', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1688"', false, 88, '2025-10-20 13:16:21.749509+00', '2025-10-20 13:16:21.749509+00');
INSERT INTO public.payment_methods VALUES (389, 'Test Payment Method 1760966181724', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1724"', false, 24, '2025-10-20 13:16:21.809454+00', '2025-10-20 13:16:21.809454+00');
INSERT INTO public.payment_methods VALUES (390, 'Test Payment Method 1760966181879', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1879"', false, 79, '2025-10-20 13:16:21.94827+00', '2025-10-20 13:16:21.94827+00');
INSERT INTO public.payment_methods VALUES (391, 'Test Payment Method 1760966181956', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1956"', false, 56, '2025-10-20 13:16:22.004151+00', '2025-10-20 13:16:22.004151+00');
INSERT INTO public.payment_methods VALUES (393, 'Test Payment Method 1760966182281', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2281"', false, 81, '2025-10-20 13:16:22.350924+00', '2025-10-20 13:16:22.350924+00');
INSERT INTO public.payment_methods VALUES (394, 'Test Payment Method 1760966182324', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2324"', false, 24, '2025-10-20 13:16:22.388213+00', '2025-10-20 13:16:22.388213+00');
INSERT INTO public.payment_methods VALUES (404, 'Test Payment Method 1760966184406', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4406"', false, 6, '2025-10-20 13:16:24.474386+00', '2025-10-20 13:16:24.474386+00');
INSERT INTO public.payment_methods VALUES (398, 'Test Payment Method 1760966182797', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2797"', false, 97, '2025-10-20 13:16:22.87211+00', '2025-10-20 13:16:22.87211+00');
INSERT INTO public.payment_methods VALUES (397, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-20 13:16:22.725235+00', '2025-10-20 13:16:22.725235+00');
INSERT INTO public.payment_methods VALUES (399, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3005"', false, 5, '2025-10-20 13:16:23.068355+00', '2025-10-20 13:16:23.068355+00');
INSERT INTO public.payment_methods VALUES (395, 'Test Payment Method 1760966182527', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2527"', false, 27, '2025-10-20 13:16:22.594204+00', '2025-10-20 13:16:22.594204+00');
INSERT INTO public.payment_methods VALUES (400, 'Test Payment Method 1760966183362', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3362"', false, 62, '2025-10-20 13:16:23.431942+00', '2025-10-20 13:16:23.431942+00');
INSERT INTO public.payment_methods VALUES (401, 'Test Payment Method 1760966183440', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3440"', false, 40, '2025-10-20 13:16:23.510913+00', '2025-10-20 13:16:23.510913+00');
INSERT INTO public.payment_methods VALUES (402, 'Test Payment Method 1760966183868', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3868"', false, 68, '2025-10-20 13:16:23.950579+00', '2025-10-20 13:16:23.950579+00');
INSERT INTO public.payment_methods VALUES (407, 'Test Payment Method 1760966185086', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5086"', false, 86, '2025-10-20 13:16:25.140523+00', '2025-10-20 13:16:25.140523+00');
INSERT INTO public.payment_methods VALUES (406, 'Test Payment Method 1760966184809', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4809"', false, 9, '2025-10-20 13:16:24.881249+00', '2025-10-20 13:16:24.881249+00');
INSERT INTO public.payment_methods VALUES (408, 'Test Payment Method 1760966185390', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5390"', false, 90, '2025-10-20 13:16:25.461722+00', '2025-10-20 13:16:25.461722+00');
INSERT INTO public.payment_methods VALUES (409, 'Test Payment Method 1760966185698', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5698"', false, 98, '2025-10-20 13:16:25.762896+00', '2025-10-20 13:16:25.762896+00');
INSERT INTO public.payment_methods VALUES (413, 'Test Payment Method 1760966186929', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6929"', false, 29, '2025-10-20 13:16:26.987915+00', '2025-10-20 13:16:26.987915+00');
INSERT INTO public.payment_methods VALUES (410, 'Test Payment Method 1760966185811', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5811"', false, 15, '2025-10-20 13:16:25.880079+00', '2025-10-20 13:16:25.880079+00');
INSERT INTO public.payment_methods VALUES (411, 'Test Payment Method 1760966186505', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6505"', false, 15, '2025-10-20 13:16:26.573342+00', '2025-10-20 13:16:26.573342+00');
INSERT INTO public.payment_methods VALUES (418, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-20 14:44:19.406927+00', '2025-10-20 14:44:19.406927+00');
INSERT INTO public.payment_methods VALUES (416, 'Test Payment Method 1760971458020', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8020"', false, 20, '2025-10-20 14:44:19.200428+00', '2025-10-20 14:44:19.200428+00');
INSERT INTO public.payment_methods VALUES (354, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 13:16:14.76245+00', '2025-10-20 13:16:14.76245+00');
INSERT INTO public.payment_methods VALUES (364, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 13:16:16.614331+00', '2025-10-20 13:16:16.614331+00');
INSERT INTO public.payment_methods VALUES (415, 'Test Payment Method 1760971458022', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8022"', false, 22, '2025-10-20 14:44:18.864586+00', '2025-10-20 14:44:18.864586+00');
INSERT INTO public.payment_methods VALUES (417, 'Test Payment Method 1760971459286', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9286"', false, 86, '2025-10-20 14:44:19.369184+00', '2025-10-20 14:44:19.369184+00');
INSERT INTO public.payment_methods VALUES (420, 'Test Payment Method 1760971459519', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9519"', false, 19, '2025-10-20 14:44:19.591497+00', '2025-10-20 14:44:19.591497+00');
INSERT INTO public.payment_methods VALUES (421, 'Test Payment Method 1760971459900', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9900"', false, 0, '2025-10-20 14:44:19.985526+00', '2025-10-20 14:44:19.985526+00');
INSERT INTO public.payment_methods VALUES (424, 'Test Payment Method 1760971460581', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0581"', false, 81, '2025-10-20 14:44:20.649048+00', '2025-10-20 14:44:20.649048+00');
INSERT INTO public.payment_methods VALUES (427, 'Test Payment Method 1760971461009', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1009"', false, 9, '2025-10-20 14:44:21.065483+00', '2025-10-20 14:44:21.065483+00');
INSERT INTO public.payment_methods VALUES (432, 'Test Payment Method 1760971461757', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1757"', false, 57, '2025-10-20 14:44:21.824424+00', '2025-10-20 14:44:21.824424+00');
INSERT INTO public.payment_methods VALUES (436, 'Test Payment Method 1760971462498', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2498"', false, 98, '2025-10-20 14:44:22.558345+00', '2025-10-20 14:44:22.558345+00');
INSERT INTO public.payment_methods VALUES (480, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-20 14:44:30.340154+00', '2025-10-20 14:44:30.340154+00');
INSERT INTO public.payment_methods VALUES (438, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-20 14:44:22.981753+00', '2025-10-20 14:44:22.981753+00');
INSERT INTO public.payment_methods VALUES (439, 'Test Payment Method 1760971463327', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3327"', false, 27, '2025-10-20 14:44:23.410213+00', '2025-10-20 14:44:23.410213+00');
INSERT INTO public.payment_methods VALUES (441, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3734"', false, 34, '2025-10-20 14:44:23.801544+00', '2025-10-20 14:44:23.801544+00');
INSERT INTO public.payment_methods VALUES (443, 'Test Payment Method 1760971463997', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3997"', false, 97, '2025-10-20 14:44:24.064649+00', '2025-10-20 14:44:24.064649+00');
INSERT INTO public.payment_methods VALUES (444, 'Test Payment Method 1760971464333', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4333"', false, 33, '2025-10-20 14:44:24.431103+00', '2025-10-20 14:44:24.431103+00');
INSERT INTO public.payment_methods VALUES (451, 'Test Payment Method 1760971465613', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5613"', false, 13, '2025-10-20 14:44:25.675884+00', '2025-10-20 14:44:25.675884+00');
INSERT INTO public.payment_methods VALUES (455, 'Test Payment Method 1760971466341', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6341"', false, 41, '2025-10-20 14:44:26.408127+00', '2025-10-20 14:44:26.408127+00');
INSERT INTO public.payment_methods VALUES (484, 'Test Payment Method 1760971471643', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1643"', false, 43, '2025-10-20 14:44:31.711143+00', '2025-10-20 14:44:31.711143+00');
INSERT INTO public.payment_methods VALUES (457, 'Test Payment Method 1760971466445', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6445"', false, 45, '2025-10-20 14:44:26.517147+00', '2025-10-20 14:44:26.517147+00');
INSERT INTO public.payment_methods VALUES (459, 'Test Payment Method 1760971466887', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6887"', false, 87, '2025-10-20 14:44:26.960525+00', '2025-10-20 14:44:26.960525+00');
INSERT INTO public.payment_methods VALUES (462, 'Test Payment Method 1760971467494', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7494"', false, 94, '2025-10-20 14:44:27.554191+00', '2025-10-20 14:44:27.554191+00');
INSERT INTO public.payment_methods VALUES (466, 'Test Payment Method 1760971468203', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8203"', false, 3, '2025-10-20 14:44:28.265055+00', '2025-10-20 14:44:28.265055+00');
INSERT INTO public.payment_methods VALUES (474, 'Test Payment Method 1760971469442', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9442"', false, 42, '2025-10-20 14:44:29.511909+00', '2025-10-20 14:44:29.511909+00');
INSERT INTO public.payment_methods VALUES (482, 'Test Payment Method 1760971470518', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0518"', false, 18, '2025-10-20 14:44:30.58424+00', '2025-10-20 14:44:30.58424+00');
INSERT INTO public.payment_methods VALUES (487, 'Test Payment Method 1760971473559', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3559"', false, 59, '2025-10-20 14:44:33.651775+00', '2025-10-20 14:44:33.651775+00');
INSERT INTO public.payment_methods VALUES (490, 'Test Payment Method 1760971476245', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6245"', false, 45, '2025-10-20 14:44:36.331965+00', '2025-10-20 14:44:36.331965+00');
INSERT INTO public.payment_methods VALUES (491, 'Test Payment Method 1760971476812', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6812"', false, 12, '2025-10-20 14:44:36.885456+00', '2025-10-20 14:44:36.885456+00');
INSERT INTO public.payment_methods VALUES (434, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 14:44:22.215416+00', '2025-10-20 14:44:22.215416+00');
INSERT INTO public.payment_methods VALUES (450, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 14:44:25.408899+00', '2025-10-20 14:44:25.408899+00');
INSERT INTO public.payment_methods VALUES (423, 'Test Payment Method 1760971460132', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0132"', false, 32, '2025-10-20 14:44:20.233672+00', '2025-10-20 14:44:20.233672+00');
INSERT INTO public.payment_methods VALUES (422, 'Test Payment Method 1760971459788', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9788"', false, 88, '2025-10-20 14:44:20.180128+00', '2025-10-20 14:44:20.180128+00');
INSERT INTO public.payment_methods VALUES (425, 'Test Payment Method 1760971460594', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0594"', false, 94, '2025-10-20 14:44:20.658841+00', '2025-10-20 14:44:20.658841+00');
INSERT INTO public.payment_methods VALUES (426, 'Test Payment Method 1760971460683', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0683"', false, 83, '2025-10-20 14:44:20.817584+00', '2025-10-20 14:44:20.817584+00');
INSERT INTO public.payment_methods VALUES (428, 'Test Payment Method 1760971461168', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1168"', false, 68, '2025-10-20 14:44:21.244532+00', '2025-10-20 14:44:21.244532+00');
INSERT INTO public.payment_methods VALUES (429, 'Test Payment Method 1760971461392', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1392"', false, 92, '2025-10-20 14:44:21.467477+00', '2025-10-20 14:44:21.467477+00');
INSERT INTO public.payment_methods VALUES (442, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-20 14:44:24.001889+00', '2025-10-20 14:44:24.001889+00');
INSERT INTO public.payment_methods VALUES (440, 'Test Payment Method 1760971463327', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3327"', false, 27, '2025-10-20 14:44:23.581559+00', '2025-10-20 14:44:23.581559+00');
INSERT INTO public.payment_methods VALUES (445, 'Test Payment Method 1760971464659', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4659"', false, 59, '2025-10-20 14:44:24.721972+00', '2025-10-20 14:44:24.721972+00');
INSERT INTO public.payment_methods VALUES (448, 'Test Payment Method 1760971465061', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5061"', false, 61, '2025-10-20 14:44:25.126304+00', '2025-10-20 14:44:25.126304+00');
INSERT INTO public.payment_methods VALUES (449, 'Test Payment Method 1760971465180', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5180"', false, 80, '2025-10-20 14:44:25.24826+00', '2025-10-20 14:44:25.24826+00');
INSERT INTO public.payment_methods VALUES (452, 'Test Payment Method 1760971465723', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5723"', false, 23, '2025-10-20 14:44:25.811926+00', '2025-10-20 14:44:25.811926+00');
INSERT INTO public.payment_methods VALUES (454, 'Test Payment Method 1760971466006', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6006"', false, 6, '2025-10-20 14:44:26.092368+00', '2025-10-20 14:44:26.092368+00');
INSERT INTO public.payment_methods VALUES (460, 'Test Payment Method 1760971467031', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7031"', false, 31, '2025-10-20 14:44:27.107561+00', '2025-10-20 14:44:27.107561+00');
INSERT INTO public.payment_methods VALUES (465, 'Test Payment Method 1760971467960', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7960"', false, 15, '2025-10-20 14:44:28.039259+00', '2025-10-20 14:44:28.039259+00');
INSERT INTO public.payment_methods VALUES (467, 'Test Payment Method 1760971468320', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8320"', false, 20, '2025-10-20 14:44:28.3875+00', '2025-10-20 14:44:28.3875+00');
INSERT INTO public.payment_methods VALUES (475, 'Test Payment Method 1760971469542', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9542"', false, 15, '2025-10-20 14:44:29.599209+00', '2025-10-20 14:44:29.599209+00');
INSERT INTO public.payment_methods VALUES (468, 'Test Payment Method 1760971468408', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8408"', false, 10, '2025-10-20 14:44:28.473537+00', '2025-10-20 14:44:28.473537+00');
INSERT INTO public.payment_methods VALUES (476, 'Test Payment Method 1760971469571', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9571"', false, 71, '2025-10-20 14:44:29.656764+00', '2025-10-20 14:44:29.656764+00');
INSERT INTO public.payment_methods VALUES (469, 'Test Payment Method 1760971468563', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8563"', false, 63, '2025-10-20 14:44:28.642995+00', '2025-10-20 14:44:28.642995+00');
INSERT INTO public.payment_methods VALUES (472, 'Test Payment Method 1760971469102', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9102"', false, 2, '2025-10-20 14:44:29.16294+00', '2025-10-20 14:44:29.16294+00');
INSERT INTO public.payment_methods VALUES (473, 'Test Payment Method 1760971469286', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9286"', false, 86, '2025-10-20 14:44:29.354735+00', '2025-10-20 14:44:29.354735+00');
INSERT INTO public.payment_methods VALUES (478, 'Test Payment Method 1760971469978', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9978"', false, 78, '2025-10-20 14:44:30.067085+00', '2025-10-20 14:44:30.067085+00');
INSERT INTO public.payment_methods VALUES (483, 'Test Payment Method 1760971471083', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1083"', false, 83, '2025-10-20 14:44:31.170232+00', '2025-10-20 14:44:31.170232+00');
INSERT INTO public.payment_methods VALUES (485, 'Test Payment Method 1760971472268', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2268"', false, 68, '2025-10-20 14:44:32.337985+00', '2025-10-20 14:44:32.337985+00');
INSERT INTO public.payment_methods VALUES (488, 'Test Payment Method 1760971474881', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4881"', false, 81, '2025-10-20 14:44:34.962606+00', '2025-10-20 14:44:34.962606+00');
INSERT INTO public.payment_methods VALUES (431, 'Test Payment Method 1760971461710', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1710"', false, 10, '2025-10-20 14:44:21.784761+00', '2025-10-20 14:44:21.784761+00');
INSERT INTO public.payment_methods VALUES (433, 'Test Payment Method 1760971461990', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1990"', false, 90, '2025-10-20 14:44:22.054698+00', '2025-10-20 14:44:22.054698+00');
INSERT INTO public.payment_methods VALUES (430, 'Test Payment Method 1760971461417', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1417"', false, 17, '2025-10-20 14:44:21.562556+00', '2025-10-20 14:44:21.562556+00');
INSERT INTO public.payment_methods VALUES (435, 'Test Payment Method 1760971462357', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2357"', false, 57, '2025-10-20 14:44:22.424634+00', '2025-10-20 14:44:22.424634+00');
INSERT INTO public.payment_methods VALUES (437, 'Test Payment Method 1760971462513', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2513"', false, 13, '2025-10-20 14:44:22.852306+00', '2025-10-20 14:44:22.852306+00');
INSERT INTO public.payment_methods VALUES (446, 'Test Payment Method 1760971464804', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4804"', false, 4, '2025-10-20 14:44:24.869483+00', '2025-10-20 14:44:24.869483+00');
INSERT INTO public.payment_methods VALUES (447, 'Test Payment Method 1760971464870', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4870"', false, 70, '2025-10-20 14:44:25.099324+00', '2025-10-20 14:44:25.099324+00');
INSERT INTO public.payment_methods VALUES (453, 'Test Payment Method 1760971465795', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5795"', false, 95, '2025-10-20 14:44:25.905641+00', '2025-10-20 14:44:25.905641+00');
INSERT INTO public.payment_methods VALUES (494, 'Test Payment Method 1760971577474', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7474"', false, 74, '2025-10-20 14:46:18.615291+00', '2025-10-20 14:46:18.615291+00');
INSERT INTO public.payment_methods VALUES (456, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-6410"', false, 5, '2025-10-20 14:44:26.476136+00', '2025-10-20 14:44:26.476136+00');
INSERT INTO public.payment_methods VALUES (495, 'Test Payment Method 1760971577473', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7473"', false, 73, '2025-10-20 14:46:18.660553+00', '2025-10-20 14:46:18.660553+00');
INSERT INTO public.payment_methods VALUES (458, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6816"', false, 16, '2025-10-20 14:44:26.883629+00', '2025-10-20 14:44:26.883629+00');
INSERT INTO public.payment_methods VALUES (461, 'Test Payment Method 1760971467234', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7234"', false, 34, '2025-10-20 14:44:27.303196+00', '2025-10-20 14:44:27.303196+00');
INSERT INTO public.payment_methods VALUES (463, 'Test Payment Method 1760971467505', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7505"', false, 5, '2025-10-20 14:44:27.579971+00', '2025-10-20 14:44:27.579971+00');
INSERT INTO public.payment_methods VALUES (464, 'Test Payment Method 1760971467642', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7642"', false, 42, '2025-10-20 14:44:27.732478+00', '2025-10-20 14:44:27.732478+00');
INSERT INTO public.payment_methods VALUES (471, 'Test Payment Method 1760971468861', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8861"', false, 61, '2025-10-20 14:44:28.94771+00', '2025-10-20 14:44:28.94771+00');
INSERT INTO public.payment_methods VALUES (470, 'Test Payment Method 1760971468825', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8825"', false, 25, '2025-10-20 14:44:28.900938+00', '2025-10-20 14:44:28.900938+00');
INSERT INTO public.payment_methods VALUES (477, 'Test Payment Method 1760971469949', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9949"', false, 15, '2025-10-20 14:44:30.015021+00', '2025-10-20 14:44:30.015021+00');
INSERT INTO public.payment_methods VALUES (481, 'Test Payment Method 1760971470392', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0392"', false, 92, '2025-10-20 14:44:30.454429+00', '2025-10-20 14:44:30.454429+00');
INSERT INTO public.payment_methods VALUES (479, 'Test Payment Method 1760971470131', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0131"', false, 31, '2025-10-20 14:44:30.203787+00', '2025-10-20 14:44:30.203787+00');
INSERT INTO public.payment_methods VALUES (486, 'Test Payment Method 1760971472918', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2918"', false, 18, '2025-10-20 14:44:33.00201+00', '2025-10-20 14:44:33.00201+00');
INSERT INTO public.payment_methods VALUES (489, 'Test Payment Method 1760971475650', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5650"', false, 50, '2025-10-20 14:44:35.726563+00', '2025-10-20 14:44:35.726563+00');
INSERT INTO public.payment_methods VALUES (492, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-20 14:46:17.855932+00', '2025-10-20 14:46:17.855932+00');
INSERT INTO public.payment_methods VALUES (498, 'Test Payment Method 1760971579316', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9316"', false, 16, '2025-10-20 14:46:19.387087+00', '2025-10-20 14:46:19.387087+00');
INSERT INTO public.payment_methods VALUES (501, 'Test Payment Method 1760971579841', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9841"', false, 41, '2025-10-20 14:46:19.908499+00', '2025-10-20 14:46:19.908499+00');
INSERT INTO public.payment_methods VALUES (503, 'Test Payment Method 1760971580286', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0286"', false, 86, '2025-10-20 14:46:20.352696+00', '2025-10-20 14:46:20.352696+00');
INSERT INTO public.payment_methods VALUES (505, 'Test Payment Method 1760971580548', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0548"', false, 48, '2025-10-20 14:46:20.635658+00', '2025-10-20 14:46:20.635658+00');
INSERT INTO public.payment_methods VALUES (506, 'Test Payment Method 1760971580746', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0746"', false, 46, '2025-10-20 14:46:20.81908+00', '2025-10-20 14:46:20.81908+00');
INSERT INTO public.payment_methods VALUES (507, 'Test Payment Method 1760971581210', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1210"', false, 10, '2025-10-20 14:46:21.291019+00', '2025-10-20 14:46:21.291019+00');
INSERT INTO public.payment_methods VALUES (508, 'Test Payment Method 1760971581244', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1244"', false, 44, '2025-10-20 14:46:21.342556+00', '2025-10-20 14:46:21.342556+00');
INSERT INTO public.payment_methods VALUES (510, 'Test Payment Method 1760971581560', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1560"', false, 60, '2025-10-20 14:46:21.649342+00', '2025-10-20 14:46:21.649342+00');
INSERT INTO public.payment_methods VALUES (509, 'Test Payment Method 1760971581085', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1085"', false, 85, '2025-10-20 14:46:21.559496+00', '2025-10-20 14:46:21.559496+00');
INSERT INTO public.payment_methods VALUES (512, 'Test Payment Method 1760971581906', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1906"', false, 6, '2025-10-20 14:46:21.98274+00', '2025-10-20 14:46:21.98274+00');
INSERT INTO public.payment_methods VALUES (522, 'Test Payment Method 1760971583946', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3946"', false, 46, '2025-10-20 14:46:24.010333+00', '2025-10-20 14:46:24.010333+00');
INSERT INTO public.payment_methods VALUES (515, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-20 14:46:22.393656+00', '2025-10-20 14:46:22.393656+00');
INSERT INTO public.payment_methods VALUES (518, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2826"', false, 26, '2025-10-20 14:46:22.914038+00', '2025-10-20 14:46:22.914038+00');
INSERT INTO public.payment_methods VALUES (519, 'Test Payment Method 1760971583005', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3005"', false, 5, '2025-10-20 14:46:23.093928+00', '2025-10-20 14:46:23.093928+00');
INSERT INTO public.payment_methods VALUES (517, 'Test Payment Method 1760971582632', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2632"', false, 32, '2025-10-20 14:46:22.808827+00', '2025-10-20 14:46:22.808827+00');
INSERT INTO public.payment_methods VALUES (521, 'Test Payment Method 1760971583287', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3287"', false, 87, '2025-10-20 14:46:23.365206+00', '2025-10-20 14:46:23.365206+00');
INSERT INTO public.payment_methods VALUES (523, 'Test Payment Method 1760971583886', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3886"', false, 86, '2025-10-20 14:46:24.278601+00', '2025-10-20 14:46:24.278601+00');
INSERT INTO public.payment_methods VALUES (527, 'Test Payment Method 1760971584780', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4780"', false, 80, '2025-10-20 14:46:24.850731+00', '2025-10-20 14:46:24.850731+00');
INSERT INTO public.payment_methods VALUES (528, 'Test Payment Method 1760971584842', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4842"', false, 42, '2025-10-20 14:46:24.917801+00', '2025-10-20 14:46:24.917801+00');
INSERT INTO public.payment_methods VALUES (530, 'Test Payment Method 1760971585165', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5165"', false, 65, '2025-10-20 14:46:25.239752+00', '2025-10-20 14:46:25.239752+00');
INSERT INTO public.payment_methods VALUES (534, 'Test Payment Method 1760971586002', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6002"', false, 2, '2025-10-20 14:46:26.080986+00', '2025-10-20 14:46:26.080986+00');
INSERT INTO public.payment_methods VALUES (533, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5602"', false, 2, '2025-10-20 14:46:25.685619+00', '2025-10-20 14:46:25.685619+00');
INSERT INTO public.payment_methods VALUES (540, 'Test Payment Method 1760971587029', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7029"', false, 29, '2025-10-20 14:46:27.100158+00', '2025-10-20 14:46:27.100158+00');
INSERT INTO public.payment_methods VALUES (541, 'Test Payment Method 1760971587040', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7040"', false, 40, '2025-10-20 14:46:27.121735+00', '2025-10-20 14:46:27.121735+00');
INSERT INTO public.payment_methods VALUES (511, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 14:46:21.78537+00', '2025-10-20 14:46:21.78537+00');
INSERT INTO public.payment_methods VALUES (496, 'Test Payment Method 1760971578724', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8724"', false, 24, '2025-10-20 14:46:18.822472+00', '2025-10-20 14:46:18.822472+00');
INSERT INTO public.payment_methods VALUES (497, 'Test Payment Method 1760971578997', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8997"', false, 97, '2025-10-20 14:46:19.073414+00', '2025-10-20 14:46:19.073414+00');
INSERT INTO public.payment_methods VALUES (499, 'Test Payment Method 1760971579427', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9427"', false, 27, '2025-10-20 14:46:19.51511+00', '2025-10-20 14:46:19.51511+00');
INSERT INTO public.payment_methods VALUES (502, 'Test Payment Method 1760971579945', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9945"', false, 45, '2025-10-20 14:46:20.015662+00', '2025-10-20 14:46:20.015662+00');
INSERT INTO public.payment_methods VALUES (500, 'Test Payment Method 1760971579353', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9353"', false, 53, '2025-10-20 14:46:19.572533+00', '2025-10-20 14:46:19.572533+00');
INSERT INTO public.payment_methods VALUES (504, 'Test Payment Method 1760971580311', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0311"', false, 11, '2025-10-20 14:46:20.485929+00', '2025-10-20 14:46:20.485929+00');
INSERT INTO public.payment_methods VALUES (513, 'Test Payment Method 1760971582028', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2028"', false, 28, '2025-10-20 14:46:22.105554+00', '2025-10-20 14:46:22.105554+00');
INSERT INTO public.payment_methods VALUES (514, 'Test Payment Method 1760971582205', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2205"', false, 5, '2025-10-20 14:46:22.347032+00', '2025-10-20 14:46:22.347032+00');
INSERT INTO public.payment_methods VALUES (516, 'Test Payment Method 1760971582482', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2482"', false, 82, '2025-10-20 14:46:22.555324+00', '2025-10-20 14:46:22.555324+00');
INSERT INTO public.payment_methods VALUES (520, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-20 14:46:23.146336+00', '2025-10-20 14:46:23.146336+00');
INSERT INTO public.payment_methods VALUES (524, 'Test Payment Method 1760971584346', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4346"', false, 46, '2025-10-20 14:46:24.419212+00', '2025-10-20 14:46:24.419212+00');
INSERT INTO public.payment_methods VALUES (526, 'Test Payment Method 1760971584628', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4628"', false, 28, '2025-10-20 14:46:24.695911+00', '2025-10-20 14:46:24.695911+00');
INSERT INTO public.payment_methods VALUES (553, 'Test Payment Method 1760971589393', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9393"', false, 93, '2025-10-20 14:46:29.463034+00', '2025-10-20 14:46:29.463034+00');
INSERT INTO public.payment_methods VALUES (529, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-5147"', false, 5, '2025-10-20 14:46:25.232637+00', '2025-10-20 14:46:25.232637+00');
INSERT INTO public.payment_methods VALUES (531, 'Test Payment Method 1760971585378', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5378"', false, 78, '2025-10-20 14:46:25.475023+00', '2025-10-20 14:46:25.475023+00');
INSERT INTO public.payment_methods VALUES (532, 'Test Payment Method 1760971585583', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5583"', false, 83, '2025-10-20 14:46:25.647542+00', '2025-10-20 14:46:25.647542+00');
INSERT INTO public.payment_methods VALUES (536, 'Test Payment Method 1760971586103', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6103"', false, 3, '2025-10-20 14:46:26.185698+00', '2025-10-20 14:46:26.185698+00');
INSERT INTO public.payment_methods VALUES (535, 'Test Payment Method 1760971586026', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6026"', false, 26, '2025-10-20 14:46:26.098846+00', '2025-10-20 14:46:26.098846+00');
INSERT INTO public.payment_methods VALUES (537, 'Test Payment Method 1760971586462', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6462"', false, 62, '2025-10-20 14:46:26.537644+00', '2025-10-20 14:46:26.537644+00');
INSERT INTO public.payment_methods VALUES (539, 'Test Payment Method 1760971586732', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6732"', false, 32, '2025-10-20 14:46:26.806295+00', '2025-10-20 14:46:26.806295+00');
INSERT INTO public.payment_methods VALUES (538, 'Test Payment Method 1760971586616', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6616"', false, 16, '2025-10-20 14:46:26.704908+00', '2025-10-20 14:46:26.704908+00');
INSERT INTO public.payment_methods VALUES (542, 'Test Payment Method 1760971587394', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7394"', false, 94, '2025-10-20 14:46:27.47733+00', '2025-10-20 14:46:27.47733+00');
INSERT INTO public.payment_methods VALUES (543, 'Test Payment Method 1760971587460', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7460"', false, 15, '2025-10-20 14:46:27.527927+00', '2025-10-20 14:46:27.527927+00');
INSERT INTO public.payment_methods VALUES (550, 'Test Payment Method 1760971588977', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8977"', false, 77, '2025-10-20 14:46:29.033416+00', '2025-10-20 14:46:29.033416+00');
INSERT INTO public.payment_methods VALUES (558, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-20 14:46:30.164553+00', '2025-10-20 14:46:30.164553+00');
INSERT INTO public.payment_methods VALUES (556, 'Test Payment Method 1760971589934', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9934"', false, 34, '2025-10-20 14:46:30.003695+00', '2025-10-20 14:46:30.003695+00');
INSERT INTO public.payment_methods VALUES (566, 'Test Payment Method 1760971595166', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5166"', false, 66, '2025-10-20 14:46:35.247423+00', '2025-10-20 14:46:35.247423+00');
INSERT INTO public.payment_methods VALUES (568, 'Test Payment Method 1760971596710', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6710"', false, 10, '2025-10-20 14:46:36.802557+00', '2025-10-20 14:46:36.802557+00');
INSERT INTO public.payment_methods VALUES (544, 'Test Payment Method 1760971587502', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7502"', false, 2, '2025-10-20 14:46:27.574846+00', '2025-10-20 14:46:27.574846+00');
INSERT INTO public.payment_methods VALUES (545, 'Test Payment Method 1760971587892', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7892"', false, 10, '2025-10-20 14:46:27.965925+00', '2025-10-20 14:46:27.965925+00');
INSERT INTO public.payment_methods VALUES (547, 'Test Payment Method 1760971588135', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8135"', false, 35, '2025-10-20 14:46:28.215791+00', '2025-10-20 14:46:28.215791+00');
INSERT INTO public.payment_methods VALUES (554, 'Test Payment Method 1760971589556', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9556"', false, 56, '2025-10-20 14:46:29.627922+00', '2025-10-20 14:46:29.627922+00');
INSERT INTO public.payment_methods VALUES (560, 'Test Payment Method 1760971591315', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1315"', false, 15, '2025-10-20 14:46:31.387438+00', '2025-10-20 14:46:31.387438+00');
INSERT INTO public.payment_methods VALUES (561, 'Test Payment Method 1760971591890', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1890"', false, 90, '2025-10-20 14:46:31.957483+00', '2025-10-20 14:46:31.957483+00');
INSERT INTO public.payment_methods VALUES (562, 'Test Payment Method 1760971592589', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2589"', false, 89, '2025-10-20 14:46:32.670936+00', '2025-10-20 14:46:32.670936+00');
INSERT INTO public.payment_methods VALUES (563, 'Test Payment Method 1760971593226', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3226"', false, 26, '2025-10-20 14:46:33.320661+00', '2025-10-20 14:46:33.320661+00');
INSERT INTO public.payment_methods VALUES (564, 'Test Payment Method 1760971593844', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3844"', false, 44, '2025-10-20 14:46:33.913869+00', '2025-10-20 14:46:33.913869+00');
INSERT INTO public.payment_methods VALUES (565, 'Test Payment Method 1760971594516', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4516"', false, 16, '2025-10-20 14:46:34.590456+00', '2025-10-20 14:46:34.590456+00');
INSERT INTO public.payment_methods VALUES (569, 'Test Payment Method 1760971597555', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7555"', false, 55, '2025-10-20 14:46:37.640612+00', '2025-10-20 14:46:37.640612+00');
INSERT INTO public.payment_methods VALUES (546, 'Test Payment Method 1760971588134', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8134"', false, 34, '2025-10-20 14:46:28.20592+00', '2025-10-20 14:46:28.20592+00');
INSERT INTO public.payment_methods VALUES (548, 'Test Payment Method 1760971588424', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8424"', false, 24, '2025-10-20 14:46:28.492182+00', '2025-10-20 14:46:28.492182+00');
INSERT INTO public.payment_methods VALUES (549, 'Test Payment Method 1760971588539', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8539"', false, 15, '2025-10-20 14:46:28.916078+00', '2025-10-20 14:46:28.916078+00');
INSERT INTO public.payment_methods VALUES (551, 'Test Payment Method 1760971589129', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9129"', false, 29, '2025-10-20 14:46:29.199199+00', '2025-10-20 14:46:29.199199+00');
INSERT INTO public.payment_methods VALUES (583, 'Test Payment Method 1760999769419', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9419"', false, 19, '2025-10-20 22:36:09.498958+00', '2025-10-20 22:36:09.498958+00');
INSERT INTO public.payment_methods VALUES (552, 'Test Payment Method 1760971589269', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9269"', false, 15, '2025-10-20 14:46:29.339857+00', '2025-10-20 14:46:29.339857+00');
INSERT INTO public.payment_methods VALUES (555, 'Test Payment Method 1760971589677', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9677"', false, 77, '2025-10-20 14:46:29.748521+00', '2025-10-20 14:46:29.748521+00');
INSERT INTO public.payment_methods VALUES (557, 'Test Payment Method 1760971590077', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0077"', false, 77, '2025-10-20 14:46:30.160709+00', '2025-10-20 14:46:30.160709+00');
INSERT INTO public.payment_methods VALUES (559, 'Test Payment Method 1760971590650', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0650"', false, 50, '2025-10-20 14:46:30.745623+00', '2025-10-20 14:46:30.745623+00');
INSERT INTO public.payment_methods VALUES (567, 'Test Payment Method 1760971595730', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5730"', false, 30, '2025-10-20 14:46:35.81611+00', '2025-10-20 14:46:35.81611+00');
INSERT INTO public.payment_methods VALUES (571, 'Test Payment Method 1760999765784', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5784"', false, 84, '2025-10-20 22:36:07.147729+00', '2025-10-20 22:36:07.147729+00');
INSERT INTO public.payment_methods VALUES (572, 'Test Payment Method 1760999767411', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7411"', false, 11, '2025-10-20 22:36:07.539356+00', '2025-10-20 22:36:07.539356+00');
INSERT INTO public.payment_methods VALUES (570, 'Test Payment Method 1760999765778', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5778"', false, 78, '2025-10-20 22:36:07.141577+00', '2025-10-20 22:36:07.141577+00');
INSERT INTO public.payment_methods VALUES (573, 'Test Payment Method 1760999767875', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7875"', false, 75, '2025-10-20 22:36:07.961209+00', '2025-10-20 22:36:07.961209+00');
INSERT INTO public.payment_methods VALUES (574, 'Test Payment Method 1760999767901', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7901"', false, 1, '2025-10-20 22:36:08.005551+00', '2025-10-20 22:36:08.005551+00');
INSERT INTO public.payment_methods VALUES (575, 'Test Payment Method 1760999768180', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8180"', false, 80, '2025-10-20 22:36:08.25523+00', '2025-10-20 22:36:08.25523+00');
INSERT INTO public.payment_methods VALUES (576, 'Test Payment Method 1760999768330', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8330"', false, 30, '2025-10-20 22:36:08.446825+00', '2025-10-20 22:36:08.446825+00');
INSERT INTO public.payment_methods VALUES (577, 'Test Payment Method 1760999768395', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8395"', false, 95, '2025-10-20 22:36:08.492945+00', '2025-10-20 22:36:08.492945+00');
INSERT INTO public.payment_methods VALUES (579, 'Test Payment Method 1760999768801', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8801"', false, 1, '2025-10-20 22:36:08.913481+00', '2025-10-20 22:36:08.913481+00');
INSERT INTO public.payment_methods VALUES (578, 'Test Payment Method 1760999768789', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8789"', false, 89, '2025-10-20 22:36:08.904956+00', '2025-10-20 22:36:08.904956+00');
INSERT INTO public.payment_methods VALUES (580, 'Test Payment Method 1760999768887', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8887"', false, 87, '2025-10-20 22:36:08.969316+00', '2025-10-20 22:36:08.969316+00');
INSERT INTO public.payment_methods VALUES (581, 'Test Payment Method 1760999769270', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9270"', false, 70, '2025-10-20 22:36:09.350485+00', '2025-10-20 22:36:09.350485+00');
INSERT INTO public.payment_methods VALUES (582, 'Test Payment Method 1760999769309', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9309"', false, 9, '2025-10-20 22:36:09.408946+00', '2025-10-20 22:36:09.408946+00');
INSERT INTO public.payment_methods VALUES (585, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-20 22:36:09.782092+00', '2025-10-20 22:36:09.782092+00');
INSERT INTO public.payment_methods VALUES (586, 'Test Payment Method 1760999769747', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9747"', false, 47, '2025-10-20 22:36:09.812613+00', '2025-10-20 22:36:09.812613+00');
INSERT INTO public.payment_methods VALUES (584, 'Test Payment Method 1760999769552', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9552"', false, 52, '2025-10-20 22:36:09.630136+00', '2025-10-20 22:36:09.630136+00');
INSERT INTO public.payment_methods VALUES (589, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-20 22:36:10.175712+00', '2025-10-20 22:36:10.175712+00');
INSERT INTO public.payment_methods VALUES (587, 'Test Payment Method 1760999769965', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9965"', false, 65, '2025-10-20 22:36:10.050672+00', '2025-10-20 22:36:10.050672+00');
INSERT INTO public.payment_methods VALUES (588, 'Test Payment Method 1760999770038', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0038"', false, 38, '2025-10-20 22:36:10.162473+00', '2025-10-20 22:36:10.162473+00');
INSERT INTO public.payment_methods VALUES (590, 'Test Payment Method 1760999770101', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0101"', false, 1, '2025-10-20 22:36:10.178254+00', '2025-10-20 22:36:10.178254+00');
INSERT INTO public.payment_methods VALUES (593, 'Test Payment Method 1760999770373', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0373"', false, 73, '2025-10-20 22:36:10.453263+00', '2025-10-20 22:36:10.453263+00');
INSERT INTO public.payment_methods VALUES (595, 'Test Payment Method 1760999770545', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0545"', false, 45, '2025-10-20 22:36:10.632784+00', '2025-10-20 22:36:10.632784+00');
INSERT INTO public.payment_methods VALUES (596, 'Test Payment Method 1760999770580', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0580"', false, 80, '2025-10-20 22:36:10.655383+00', '2025-10-20 22:36:10.655383+00');
INSERT INTO public.payment_methods VALUES (597, 'Test Payment Method 1760999770850', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0850"', false, 50, '2025-10-20 22:36:10.936257+00', '2025-10-20 22:36:10.936257+00');
INSERT INTO public.payment_methods VALUES (603, 'Test Payment Method 1760999771742', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1742"', false, 42, '2025-10-20 22:36:11.814826+00', '2025-10-20 22:36:11.814826+00');
INSERT INTO public.payment_methods VALUES (598, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-0843"', false, 5, '2025-10-20 22:36:10.941805+00', '2025-10-20 22:36:10.941805+00');
INSERT INTO public.payment_methods VALUES (600, 'Test Payment Method 1760999771145', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1145"', false, 45, '2025-10-20 22:36:11.25036+00', '2025-10-20 22:36:11.25036+00');
INSERT INTO public.payment_methods VALUES (599, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-20 22:36:11.194276+00', '2025-10-20 22:36:11.194276+00');
INSERT INTO public.payment_methods VALUES (601, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1309"', false, 9, '2025-10-20 22:36:11.411639+00', '2025-10-20 22:36:11.411639+00');
INSERT INTO public.payment_methods VALUES (604, 'Test Payment Method 1760999771717', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1717"', false, 17, '2025-10-20 22:36:11.822467+00', '2025-10-20 22:36:11.822467+00');
INSERT INTO public.payment_methods VALUES (602, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1508"', false, 8, '2025-10-20 22:36:11.57751+00', '2025-10-20 22:36:11.57751+00');
INSERT INTO public.payment_methods VALUES (605, 'Test Payment Method 1760999771859', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1859"', false, 59, '2025-10-20 22:36:11.934795+00', '2025-10-20 22:36:11.934795+00');
INSERT INTO public.payment_methods VALUES (606, 'Test Payment Method 1760999772141', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2141"', false, 41, '2025-10-20 22:36:12.217198+00', '2025-10-20 22:36:12.217198+00');
INSERT INTO public.payment_methods VALUES (608, 'Test Payment Method 1760999772277', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2277"', false, 77, '2025-10-20 22:36:12.359296+00', '2025-10-20 22:36:12.359296+00');
INSERT INTO public.payment_methods VALUES (607, 'Test Payment Method 1760999772280', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2280"', false, 80, '2025-10-20 22:36:12.358735+00', '2025-10-20 22:36:12.358735+00');
INSERT INTO public.payment_methods VALUES (609, 'Test Payment Method 1760999772580', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2580"', false, 80, '2025-10-20 22:36:12.677442+00', '2025-10-20 22:36:12.677442+00');
INSERT INTO public.payment_methods VALUES (610, 'Test Payment Method 1760999772708', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2708"', false, 8, '2025-10-20 22:36:12.804751+00', '2025-10-20 22:36:12.804751+00');
INSERT INTO public.payment_methods VALUES (612, 'Test Payment Method 1760999773185', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3185"', false, 85, '2025-10-20 22:36:13.278472+00', '2025-10-20 22:36:13.278472+00');
INSERT INTO public.payment_methods VALUES (615, 'Test Payment Method 1760999773713', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3713"', false, 13, '2025-10-20 22:36:13.81973+00', '2025-10-20 22:36:13.81973+00');
INSERT INTO public.payment_methods VALUES (619, 'Test Payment Method 1760999774237', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4237"', false, 15, '2025-10-20 22:36:14.324575+00', '2025-10-20 22:36:14.324575+00');
INSERT INTO public.payment_methods VALUES (630, 'Test Payment Method 1760999776429', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6429"', false, 29, '2025-10-20 22:36:16.525858+00', '2025-10-20 22:36:16.525858+00');
INSERT INTO public.payment_methods VALUES (637, 'Test Payment Method 1760999778090', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8090"', false, 90, '2025-10-20 22:36:18.179797+00', '2025-10-20 22:36:18.179797+00');
INSERT INTO public.payment_methods VALUES (639, 'Test Payment Method 1760999779361', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9361"', false, 61, '2025-10-20 22:36:19.451044+00', '2025-10-20 22:36:19.451044+00');
INSERT INTO public.payment_methods VALUES (611, 'Test Payment Method 1760999772820', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2820"', false, 20, '2025-10-20 22:36:12.88808+00', '2025-10-20 22:36:12.88808+00');
INSERT INTO public.payment_methods VALUES (613, 'Test Payment Method 1760999773201', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3201"', false, 1, '2025-10-20 22:36:13.288321+00', '2025-10-20 22:36:13.288321+00');
INSERT INTO public.payment_methods VALUES (614, 'Test Payment Method 1760999773430', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3430"', false, 30, '2025-10-20 22:36:13.537916+00', '2025-10-20 22:36:13.537916+00');
INSERT INTO public.payment_methods VALUES (621, 'Test Payment Method 1760999774691', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4691"', false, 15, '2025-10-20 22:36:14.76896+00', '2025-10-20 22:36:14.76896+00');
INSERT INTO public.payment_methods VALUES (627, 'Test Payment Method 1760999775747', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5747"', false, 47, '2025-10-20 22:36:15.830069+00', '2025-10-20 22:36:15.830069+00');
INSERT INTO public.payment_methods VALUES (628, 'Test Payment Method 1760999775984', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5984"', false, 10, '2025-10-20 22:36:16.076804+00', '2025-10-20 22:36:16.076804+00');
INSERT INTO public.payment_methods VALUES (640, 'Test Payment Method 1760999779939', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9939"', false, 39, '2025-10-20 22:36:20.036269+00', '2025-10-20 22:36:20.036269+00');
INSERT INTO public.payment_methods VALUES (616, 'Test Payment Method 1760999773750', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3750"', false, 50, '2025-10-20 22:36:13.834101+00', '2025-10-20 22:36:13.834101+00');
INSERT INTO public.payment_methods VALUES (624, 'Test Payment Method 1760999775119', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5119"', false, 19, '2025-10-20 22:36:15.212571+00', '2025-10-20 22:36:15.212571+00');
INSERT INTO public.payment_methods VALUES (631, 'Test Payment Method 1760999776869', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6869"', false, 69, '2025-10-20 22:36:16.966334+00', '2025-10-20 22:36:16.966334+00');
INSERT INTO public.payment_methods VALUES (617, 'Test Payment Method 1760999774011', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4011"', false, 11, '2025-10-20 22:36:14.09382+00', '2025-10-20 22:36:14.09382+00');
INSERT INTO public.payment_methods VALUES (643, 'Test Payment Method 1760999781926', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1926"', false, 26, '2025-10-20 22:36:22.014629+00', '2025-10-20 22:36:22.014629+00');
INSERT INTO public.payment_methods VALUES (618, 'Test Payment Method 1760999774174', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4174"', false, 74, '2025-10-20 22:36:14.264919+00', '2025-10-20 22:36:14.264919+00');
INSERT INTO public.payment_methods VALUES (620, 'Test Payment Method 1760999774577', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4577"', false, 77, '2025-10-20 22:36:14.652993+00', '2025-10-20 22:36:14.652993+00');
INSERT INTO public.payment_methods VALUES (625, 'Test Payment Method 1760999775128', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5128"', false, 28, '2025-10-20 22:36:15.213243+00', '2025-10-20 22:36:15.213243+00');
INSERT INTO public.payment_methods VALUES (632, 'Test Payment Method 1760999776871', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6871"', false, 71, '2025-10-20 22:36:16.970906+00', '2025-10-20 22:36:16.970906+00');
INSERT INTO public.payment_methods VALUES (636, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-20 22:36:18.062059+00', '2025-10-20 22:36:18.062059+00');
INSERT INTO public.payment_methods VALUES (638, 'Test Payment Method 1760999778754', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8754"', false, 54, '2025-10-20 22:36:18.844097+00', '2025-10-20 22:36:18.844097+00');
INSERT INTO public.payment_methods VALUES (641, 'Test Payment Method 1760999780541', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0541"', false, 41, '2025-10-20 22:36:20.638415+00', '2025-10-20 22:36:20.638415+00');
INSERT INTO public.payment_methods VALUES (622, 'Test Payment Method 1760999774702', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4702"', false, 2, '2025-10-20 22:36:14.780672+00', '2025-10-20 22:36:14.780672+00');
INSERT INTO public.payment_methods VALUES (623, 'Test Payment Method 1760999775105', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5105"', false, 5, '2025-10-20 22:36:15.207722+00', '2025-10-20 22:36:15.207722+00');
INSERT INTO public.payment_methods VALUES (635, 'Test Payment Method 1760999777807', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7807"', false, 7, '2025-10-20 22:36:17.904157+00', '2025-10-20 22:36:17.904157+00');
INSERT INTO public.payment_methods VALUES (642, 'Test Payment Method 1760999781241', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1241"', false, 41, '2025-10-20 22:36:21.371199+00', '2025-10-20 22:36:21.371199+00');
INSERT INTO public.payment_methods VALUES (659, 'Test Payment Method 1761006306155', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6155"', false, 55, '2025-10-21 00:25:06.253135+00', '2025-10-21 00:25:06.253135+00');
INSERT INTO public.payment_methods VALUES (626, 'Test Payment Method 1760999775539', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5539"', false, 15, '2025-10-20 22:36:15.648054+00', '2025-10-20 22:36:15.648054+00');
INSERT INTO public.payment_methods VALUES (629, 'Test Payment Method 1760999776297', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6297"', false, 97, '2025-10-20 22:36:16.37691+00', '2025-10-20 22:36:16.37691+00');
INSERT INTO public.payment_methods VALUES (633, 'Test Payment Method 1760999777169', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7169"', false, 69, '2025-10-20 22:36:17.256082+00', '2025-10-20 22:36:17.256082+00');
INSERT INTO public.payment_methods VALUES (634, 'Test Payment Method 1760999777500', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7500"', false, 0, '2025-10-20 22:36:17.597957+00', '2025-10-20 22:36:17.597957+00');
INSERT INTO public.payment_methods VALUES (644, 'Test Payment Method 1760999782548', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2548"', false, 48, '2025-10-20 22:36:22.660061+00', '2025-10-20 22:36:22.660061+00');
INSERT INTO public.payment_methods VALUES (645, 'Test Payment Method 1760999783195', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3195"', false, 95, '2025-10-20 22:36:23.30312+00', '2025-10-20 22:36:23.30312+00');
INSERT INTO public.payment_methods VALUES (646, 'Test Payment Method 1760999783913', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3913"', false, 13, '2025-10-20 22:36:24.013325+00', '2025-10-20 22:36:24.013325+00');
INSERT INTO public.payment_methods VALUES (647, 'Test Payment Method 1760999784658', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4658"', false, 58, '2025-10-20 22:36:24.731842+00', '2025-10-20 22:36:24.731842+00');
INSERT INTO public.payment_methods VALUES (648, 'Test Payment Method 1761006302013', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2013"', false, 13, '2025-10-21 00:25:03.600028+00', '2025-10-21 00:25:03.600028+00');
INSERT INTO public.payment_methods VALUES (650, 'Test Payment Method 1761006303834', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3834"', false, 34, '2025-10-21 00:25:04.077353+00', '2025-10-21 00:25:04.077353+00');
INSERT INTO public.payment_methods VALUES (649, 'Test Payment Method 1761006302012', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2012"', false, 12, '2025-10-21 00:25:03.588159+00', '2025-10-21 00:25:03.588159+00');
INSERT INTO public.payment_methods VALUES (651, 'Test Payment Method 1761006304219', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4219"', false, 19, '2025-10-21 00:25:04.340841+00', '2025-10-21 00:25:04.340841+00');
INSERT INTO public.payment_methods VALUES (652, 'Test Payment Method 1761006304517', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4517"', false, 17, '2025-10-21 00:25:04.634186+00', '2025-10-21 00:25:04.634186+00');
INSERT INTO public.payment_methods VALUES (653, 'Test Payment Method 1761006304765', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4765"', false, 65, '2025-10-21 00:25:04.8709+00', '2025-10-21 00:25:04.8709+00');
INSERT INTO public.payment_methods VALUES (654, 'Test Payment Method 1761006304958', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4958"', false, 58, '2025-10-21 00:25:05.050951+00', '2025-10-21 00:25:05.050951+00');
INSERT INTO public.payment_methods VALUES (655, 'Test Payment Method 1761006305173', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5173"', false, 73, '2025-10-21 00:25:05.311601+00', '2025-10-21 00:25:05.311601+00');
INSERT INTO public.payment_methods VALUES (657, 'Test Payment Method 1761006305571', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5571"', false, 71, '2025-10-21 00:25:05.679605+00', '2025-10-21 00:25:05.679605+00');
INSERT INTO public.payment_methods VALUES (658, 'Test Payment Method 1761006305731', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5731"', false, 31, '2025-10-21 00:25:05.823458+00', '2025-10-21 00:25:05.823458+00');
INSERT INTO public.payment_methods VALUES (656, 'Test Payment Method 1761006305150', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5150"', false, 50, '2025-10-21 00:25:05.582774+00', '2025-10-21 00:25:05.582774+00');
INSERT INTO public.payment_methods VALUES (660, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-21 00:25:06.400972+00', '2025-10-21 00:25:06.400972+00');
INSERT INTO public.payment_methods VALUES (661, 'Test Payment Method 1761006306300', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6300"', false, 0, '2025-10-21 00:25:06.420252+00', '2025-10-21 00:25:06.420252+00');
INSERT INTO public.payment_methods VALUES (664, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-21 00:25:06.978753+00', '2025-10-21 00:25:06.978753+00');
INSERT INTO public.payment_methods VALUES (662, 'Test Payment Method 1761006306159', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6159"', false, 59, '2025-10-21 00:25:06.476124+00', '2025-10-21 00:25:06.476124+00');
INSERT INTO public.payment_methods VALUES (665, 'Test Payment Method 1761006306899', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6899"', false, 99, '2025-10-21 00:25:07.006863+00', '2025-10-21 00:25:07.006863+00');
INSERT INTO public.payment_methods VALUES (663, 'Test Payment Method 1761006306768', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6768"', false, 68, '2025-10-21 00:25:06.882416+00', '2025-10-21 00:25:06.882416+00');
INSERT INTO public.payment_methods VALUES (668, 'Test Payment Method 1761006307232', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7232"', false, 32, '2025-10-21 00:25:07.353088+00', '2025-10-21 00:25:07.353088+00');
INSERT INTO public.payment_methods VALUES (670, 'Test Payment Method 1761006307494', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7494"', false, 94, '2025-10-21 00:25:07.597342+00', '2025-10-21 00:25:07.597342+00');
INSERT INTO public.payment_methods VALUES (673, 'Test Payment Method 1761006308072', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8072"', false, 72, '2025-10-21 00:25:08.220805+00', '2025-10-21 00:25:08.220805+00');
INSERT INTO public.payment_methods VALUES (671, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-7554"', false, 5, '2025-10-21 00:25:07.660908+00', '2025-10-21 00:25:07.660908+00');
INSERT INTO public.payment_methods VALUES (669, 'Test Payment Method 1761006307083', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7083"', false, 83, '2025-10-21 00:25:07.387095+00', '2025-10-21 00:25:07.387095+00');
INSERT INTO public.payment_methods VALUES (672, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8043"', false, 43, '2025-10-21 00:25:08.131221+00', '2025-10-21 00:25:08.131221+00');
INSERT INTO public.payment_methods VALUES (674, 'Test Payment Method 1761006308172', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8172"', false, 72, '2025-10-21 00:25:08.283061+00', '2025-10-21 00:25:08.283061+00');
INSERT INTO public.payment_methods VALUES (675, 'Test Payment Method 1761006308466', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8466"', false, 66, '2025-10-21 00:25:08.5631+00', '2025-10-21 00:25:08.5631+00');
INSERT INTO public.payment_methods VALUES (677, 'Test Payment Method 1761006308781', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8781"', false, 81, '2025-10-21 00:25:08.878666+00', '2025-10-21 00:25:08.878666+00');
INSERT INTO public.payment_methods VALUES (676, 'Test Payment Method 1761006308515', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8515"', false, 15, '2025-10-21 00:25:08.801774+00', '2025-10-21 00:25:08.801774+00');
INSERT INTO public.payment_methods VALUES (678, 'Test Payment Method 1761006308909', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8909"', false, 9, '2025-10-21 00:25:09.025991+00', '2025-10-21 00:25:09.025991+00');
INSERT INTO public.payment_methods VALUES (679, 'Test Payment Method 1761006309176', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9176"', false, 76, '2025-10-21 00:25:09.257372+00', '2025-10-21 00:25:09.257372+00');
INSERT INTO public.payment_methods VALUES (682, 'Test Payment Method 1761006309551', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9551"', false, 51, '2025-10-21 00:25:09.664989+00', '2025-10-21 00:25:09.664989+00');
INSERT INTO public.payment_methods VALUES (683, 'Test Payment Method 1761006309567', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9567"', false, 67, '2025-10-21 00:25:09.674591+00', '2025-10-21 00:25:09.674591+00');
INSERT INTO public.payment_methods VALUES (688, 'Test Payment Method 1761006310605', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0605"', false, 5, '2025-10-21 00:25:10.698073+00', '2025-10-21 00:25:10.698073+00');
INSERT INTO public.payment_methods VALUES (684, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 00:25:09.956041+00', '2025-10-21 00:25:09.956041+00');
INSERT INTO public.payment_methods VALUES (685, 'Test Payment Method 1761006310045', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0045"', false, 45, '2025-10-21 00:25:10.141444+00', '2025-10-21 00:25:10.141444+00');
INSERT INTO public.payment_methods VALUES (687, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0293"', false, 93, '2025-10-21 00:25:10.413181+00', '2025-10-21 00:25:10.413181+00');
INSERT INTO public.payment_methods VALUES (686, 'Test Payment Method 1761006310040', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0040"', false, 40, '2025-10-21 00:25:10.144205+00', '2025-10-21 00:25:10.144205+00');
INSERT INTO public.payment_methods VALUES (690, 'Test Payment Method 1761006310729', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0729"', false, 29, '2025-10-21 00:25:10.843402+00', '2025-10-21 00:25:10.843402+00');
INSERT INTO public.payment_methods VALUES (691, 'Test Payment Method 1761006311061', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1061"', false, 15, '2025-10-21 00:25:11.186708+00', '2025-10-21 00:25:11.186708+00');
INSERT INTO public.payment_methods VALUES (681, 'Test Payment Method 1761006309440', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9440"', false, 40, '2025-10-21 00:25:09.541826+00', '2025-10-21 00:25:09.541826+00');
INSERT INTO public.payment_methods VALUES (689, 'Test Payment Method 1761006310655', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0655"', false, 55, '2025-10-21 00:25:10.76267+00', '2025-10-21 00:25:10.76267+00');
INSERT INTO public.payment_methods VALUES (700, 'Test Payment Method 1761006312623', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2623"', false, 23, '2025-10-21 00:25:12.719821+00', '2025-10-21 00:25:12.719821+00');
INSERT INTO public.payment_methods VALUES (715, 'Test Payment Method 1761006317015', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7015"', false, 15, '2025-10-21 00:25:17.124766+00', '2025-10-21 00:25:17.124766+00');
INSERT INTO public.payment_methods VALUES (692, 'Test Payment Method 1761006311242', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1242"', false, 42, '2025-10-21 00:25:11.363907+00', '2025-10-21 00:25:11.363907+00');
INSERT INTO public.payment_methods VALUES (708, 'Test Payment Method 1761006315126', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5126"', false, 10, '2025-10-21 00:25:15.241431+00', '2025-10-21 00:25:15.241431+00');
INSERT INTO public.payment_methods VALUES (713, 'Test Payment Method 1761006316406', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6406"', false, 6, '2025-10-21 00:25:16.52521+00', '2025-10-21 00:25:16.52521+00');
INSERT INTO public.payment_methods VALUES (720, 'Test Payment Method 1761006318957', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8957"', false, 57, '2025-10-21 00:25:19.054987+00', '2025-10-21 00:25:19.054987+00');
INSERT INTO public.payment_methods VALUES (724, 'Test Payment Method 1761006321238', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1238"', false, 38, '2025-10-21 00:25:21.380495+00', '2025-10-21 00:25:21.380495+00');
INSERT INTO public.payment_methods VALUES (693, 'Test Payment Method 1761006311273', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1273"', false, 73, '2025-10-21 00:25:11.372636+00', '2025-10-21 00:25:11.372636+00');
INSERT INTO public.payment_methods VALUES (694, 'Test Payment Method 1761006311538', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1538"', false, 15, '2025-10-21 00:25:11.647319+00', '2025-10-21 00:25:11.647319+00');
INSERT INTO public.payment_methods VALUES (698, 'Test Payment Method 1761006312167', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2167"', false, 67, '2025-10-21 00:25:12.271663+00', '2025-10-21 00:25:12.271663+00');
INSERT INTO public.payment_methods VALUES (699, 'Test Payment Method 1761006312416', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2416"', false, 16, '2025-10-21 00:25:12.514711+00', '2025-10-21 00:25:12.514711+00');
INSERT INTO public.payment_methods VALUES (702, 'Test Payment Method 1761006313045', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3045"', false, 45, '2025-10-21 00:25:13.151377+00', '2025-10-21 00:25:13.151377+00');
INSERT INTO public.payment_methods VALUES (703, 'Test Payment Method 1761006313700', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3700"', false, 0, '2025-10-21 00:25:13.800023+00', '2025-10-21 00:25:13.800023+00');
INSERT INTO public.payment_methods VALUES (717, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-21 00:25:17.284868+00', '2025-10-21 00:25:17.284868+00');
INSERT INTO public.payment_methods VALUES (718, 'Test Payment Method 1761006317641', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7641"', false, 41, '2025-10-21 00:25:17.758227+00', '2025-10-21 00:25:17.758227+00');
INSERT INTO public.payment_methods VALUES (721, 'Test Payment Method 1761006319554', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9554"', false, 54, '2025-10-21 00:25:19.647904+00', '2025-10-21 00:25:19.647904+00');
INSERT INTO public.payment_methods VALUES (725, 'Test Payment Method 1761006321959', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1959"', false, 59, '2025-10-21 00:25:22.053101+00', '2025-10-21 00:25:22.053101+00');
INSERT INTO public.payment_methods VALUES (695, 'Test Payment Method 1761006311549', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1549"', false, 49, '2025-10-21 00:25:11.653824+00', '2025-10-21 00:25:11.653824+00');
INSERT INTO public.payment_methods VALUES (696, 'Test Payment Method 1761006311829', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1829"', false, 29, '2025-10-21 00:25:11.934769+00', '2025-10-21 00:25:11.934769+00');
INSERT INTO public.payment_methods VALUES (705, 'Test Payment Method 1761006314266', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4266"', false, 66, '2025-10-21 00:25:14.379419+00', '2025-10-21 00:25:14.379419+00');
INSERT INTO public.payment_methods VALUES (711, 'Test Payment Method 1761006315778', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5778"', false, 78, '2025-10-21 00:25:15.873733+00', '2025-10-21 00:25:15.873733+00');
INSERT INTO public.payment_methods VALUES (719, 'Test Payment Method 1761006318319', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8319"', false, 19, '2025-10-21 00:25:18.430724+00', '2025-10-21 00:25:18.430724+00');
INSERT INTO public.payment_methods VALUES (697, 'Test Payment Method 1761006312006', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2006"', false, 6, '2025-10-21 00:25:12.104852+00', '2025-10-21 00:25:12.104852+00');
INSERT INTO public.payment_methods VALUES (704, 'Test Payment Method 1761006313875', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3875"', false, 75, '2025-10-21 00:25:13.975988+00', '2025-10-21 00:25:13.975988+00');
INSERT INTO public.payment_methods VALUES (706, 'Test Payment Method 1761006314538', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4538"', false, 38, '2025-10-21 00:25:14.643348+00', '2025-10-21 00:25:14.643348+00');
INSERT INTO public.payment_methods VALUES (709, 'Test Payment Method 1761006315142', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5142"', false, 42, '2025-10-21 00:25:15.24622+00', '2025-10-21 00:25:15.24622+00');
INSERT INTO public.payment_methods VALUES (712, 'Test Payment Method 1761006316071', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6071"', false, 71, '2025-10-21 00:25:16.16861+00', '2025-10-21 00:25:16.16861+00');
INSERT INTO public.payment_methods VALUES (714, 'Test Payment Method 1761006316458', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6458"', false, 58, '2025-10-21 00:25:16.548806+00', '2025-10-21 00:25:16.548806+00');
INSERT INTO public.payment_methods VALUES (701, 'Test Payment Method 1761006313045', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3045"', false, 45, '2025-10-21 00:25:13.149522+00', '2025-10-21 00:25:13.149522+00');
INSERT INTO public.payment_methods VALUES (707, 'Test Payment Method 1761006314698', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4698"', false, 15, '2025-10-21 00:25:14.795945+00', '2025-10-21 00:25:14.795945+00');
INSERT INTO public.payment_methods VALUES (722, 'Test Payment Method 1761006320122', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0122"', false, 22, '2025-10-21 00:25:20.216108+00', '2025-10-21 00:25:20.216108+00');
INSERT INTO public.payment_methods VALUES (723, 'Test Payment Method 1761006320681', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0681"', false, 81, '2025-10-21 00:25:20.776419+00', '2025-10-21 00:25:20.776419+00');
INSERT INTO public.payment_methods VALUES (710, 'Test Payment Method 1761006315585', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5585"', false, 85, '2025-10-21 00:25:15.698511+00', '2025-10-21 00:25:15.698511+00');
INSERT INTO public.payment_methods VALUES (716, 'Test Payment Method 1761006317012', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7012"', false, 12, '2025-10-21 00:25:17.131731+00', '2025-10-21 00:25:17.131731+00');
INSERT INTO public.payment_methods VALUES (726, 'Test Payment Method 1761060297085', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7085"', false, 85, '2025-10-21 15:24:58.026493+00', '2025-10-21 15:24:58.026493+00');
INSERT INTO public.payment_methods VALUES (727, 'Test Payment Method 1761060298720', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8720"', false, 20, '2025-10-21 15:24:58.81681+00', '2025-10-21 15:24:58.81681+00');
INSERT INTO public.payment_methods VALUES (728, 'Test Payment Method 1761060299256', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9256"', false, 56, '2025-10-21 15:24:59.341486+00', '2025-10-21 15:24:59.341486+00');
INSERT INTO public.payment_methods VALUES (742, 'Test Payment Method 1761060684884', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4884"', false, 84, '2025-10-21 15:31:24.969094+00', '2025-10-21 15:31:24.969094+00');
INSERT INTO public.payment_methods VALUES (729, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 15:24:59.699569+00', '2025-10-21 15:24:59.699569+00');
INSERT INTO public.payment_methods VALUES (730, 'Test Payment Method 1761060300097', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0097"', false, 97, '2025-10-21 15:25:00.196686+00', '2025-10-21 15:25:00.196686+00');
INSERT INTO public.payment_methods VALUES (743, 'Test Payment Method 1761060685576', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5576"', false, 76, '2025-10-21 15:31:25.660387+00', '2025-10-21 15:31:25.660387+00');
INSERT INTO public.payment_methods VALUES (731, 'Test Payment Method 1761060300745', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0745"', false, 45, '2025-10-21 15:25:00.830387+00', '2025-10-21 15:25:00.830387+00');
INSERT INTO public.payment_methods VALUES (732, 'Test Payment Method 1761060301346', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1346"', false, 15, '2025-10-21 15:25:01.441333+00', '2025-10-21 15:25:01.441333+00');
INSERT INTO public.payment_methods VALUES (733, 'Test Payment Method 1761060301965', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1965"', false, 65, '2025-10-21 15:25:02.076289+00', '2025-10-21 15:25:02.076289+00');
INSERT INTO public.payment_methods VALUES (734, 'Test Payment Method 1761060302460', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2460"', false, 60, '2025-10-21 15:25:02.537918+00', '2025-10-21 15:25:02.537918+00');
INSERT INTO public.payment_methods VALUES (735, 'Test Payment Method 1761060680712', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0712"', false, 12, '2025-10-21 15:31:21.288351+00', '2025-10-21 15:31:21.288351+00');
INSERT INTO public.payment_methods VALUES (736, 'Test Payment Method 1761060681779', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1779"', false, 79, '2025-10-21 15:31:21.882446+00', '2025-10-21 15:31:21.882446+00');
INSERT INTO public.payment_methods VALUES (737, 'Test Payment Method 1761060682247', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2247"', false, 47, '2025-10-21 15:31:22.345185+00', '2025-10-21 15:31:22.345185+00');
INSERT INTO public.payment_methods VALUES (751, 'Test Payment Method 1761081202813', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2813"', false, 13, '2025-10-21 21:13:22.833427+00', '2025-10-21 21:13:22.833427+00');
INSERT INTO public.payment_methods VALUES (738, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 15:31:22.722315+00', '2025-10-21 15:31:22.722315+00');
INSERT INTO public.payment_methods VALUES (739, 'Test Payment Method 1761060683088', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3088"', false, 88, '2025-10-21 15:31:23.182386+00', '2025-10-21 15:31:23.182386+00');
INSERT INTO public.payment_methods VALUES (752, 'Test Payment Method 1761081203337', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3337"', false, 37, '2025-10-21 21:13:23.361239+00', '2025-10-21 21:13:23.361239+00');
INSERT INTO public.payment_methods VALUES (740, 'Test Payment Method 1761060683818', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3818"', false, 18, '2025-10-21 15:31:23.909056+00', '2025-10-21 15:31:23.909056+00');
INSERT INTO public.payment_methods VALUES (744, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-21 15:45:10.263056+00', '2025-10-21 15:45:10.263056+00');
INSERT INTO public.payment_methods VALUES (741, 'Test Payment Method 1761060684479', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4479"', false, 15, '2025-10-21 15:31:24.568349+00', '2025-10-21 15:31:24.568349+00');
INSERT INTO public.payment_methods VALUES (758, 'Test Payment Method 1761081208779', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8779"', false, 79, '2025-10-21 21:13:28.794323+00', '2025-10-21 21:13:28.794323+00');
INSERT INTO public.payment_methods VALUES (753, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 21:13:23.79876+00', '2025-10-21 21:13:23.79876+00');
INSERT INTO public.payment_methods VALUES (745, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-21 15:45:12.487869+00', '2025-10-21 15:45:12.487869+00');
INSERT INTO public.payment_methods VALUES (746, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-21 15:45:15.108118+00', '2025-10-21 15:45:15.108118+00');
INSERT INTO public.payment_methods VALUES (754, 'Test Payment Method 1761081204872', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4872"', false, 72, '2025-10-21 21:13:24.901034+00', '2025-10-21 21:13:24.901034+00');
INSERT INTO public.payment_methods VALUES (747, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-21 18:31:17.119464+00', '2025-10-21 18:31:17.119464+00');
INSERT INTO public.payment_methods VALUES (748, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-21 18:31:20.803961+00', '2025-10-21 18:31:20.803961+00');
INSERT INTO public.payment_methods VALUES (749, 'Updated Test Payment Method', 'bank_transfer', 'Updated description', '"Updated account info"', false, 99, '2025-10-21 18:31:23.180323+00', '2025-10-21 18:31:23.180323+00');
INSERT INTO public.payment_methods VALUES (750, 'Test Payment Method 1761081195426', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5426"', false, 26, '2025-10-21 21:13:21.523392+00', '2025-10-21 21:13:21.523392+00');
INSERT INTO public.payment_methods VALUES (759, 'Test Payment Method 1761082745884', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5884"', false, 84, '2025-10-21 21:39:07.070176+00', '2025-10-21 21:39:07.070176+00');
INSERT INTO public.payment_methods VALUES (755, 'Test Payment Method 1761081205782', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5782"', false, 82, '2025-10-21 21:13:25.80276+00', '2025-10-21 21:13:25.80276+00');
INSERT INTO public.payment_methods VALUES (756, 'Test Payment Method 1761081206563', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6563"', false, 15, '2025-10-21 21:13:26.612128+00', '2025-10-21 21:13:26.612128+00');
INSERT INTO public.payment_methods VALUES (757, 'Test Payment Method 1761081208026', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8026"', false, 26, '2025-10-21 21:13:28.108409+00', '2025-10-21 21:13:28.108409+00');
INSERT INTO public.payment_methods VALUES (760, 'Test Payment Method 1761082747873', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7873"', false, 73, '2025-10-21 21:39:07.961813+00', '2025-10-21 21:39:07.961813+00');
INSERT INTO public.payment_methods VALUES (761, 'Test Payment Method 1761082748572', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8572"', false, 72, '2025-10-21 21:39:08.643798+00', '2025-10-21 21:39:08.643798+00');
INSERT INTO public.payment_methods VALUES (763, 'Test Payment Method 1761082749451', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9451"', false, 51, '2025-10-21 21:39:09.528972+00', '2025-10-21 21:39:09.528972+00');
INSERT INTO public.payment_methods VALUES (762, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 21:39:08.998902+00', '2025-10-21 21:39:08.998902+00');
INSERT INTO public.payment_methods VALUES (766, 'Test Payment Method 1761082752157', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2157"', false, 57, '2025-10-21 21:39:12.241341+00', '2025-10-21 21:39:12.241341+00');
INSERT INTO public.payment_methods VALUES (765, 'Test Payment Method 1761082751233', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1233"', false, 15, '2025-10-21 21:39:11.342982+00', '2025-10-21 21:39:11.342982+00');
INSERT INTO public.payment_methods VALUES (764, 'Test Payment Method 1761082750141', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0141"', false, 41, '2025-10-21 21:39:10.219487+00', '2025-10-21 21:39:10.219487+00');
INSERT INTO public.payment_methods VALUES (767, 'Test Payment Method 1761082752817', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2817"', false, 17, '2025-10-21 21:39:12.905539+00', '2025-10-21 21:39:12.905539+00');
INSERT INTO public.payment_methods VALUES (768, 'Test Payment Method 1761082783198', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3198"', false, 98, '2025-10-21 21:39:43.936123+00', '2025-10-21 21:39:43.936123+00');
INSERT INTO public.payment_methods VALUES (769, 'Test Payment Method 1761082784618', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4618"', true, 18, '2025-10-21 21:39:44.709991+00', '2025-10-21 21:39:44.709991+00');
INSERT INTO public.payment_methods VALUES (770, 'Test Payment Method 1761083022024', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2024"', false, 24, '2025-10-21 21:43:43.640373+00', '2025-10-21 21:43:43.640373+00');
INSERT INTO public.payment_methods VALUES (771, 'Test Payment Method 1761083024473', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4473"', false, 73, '2025-10-21 21:43:44.586684+00', '2025-10-21 21:43:44.586684+00');
INSERT INTO public.payment_methods VALUES (6, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-15 13:49:34.667213+00', '2025-10-15 13:49:34.667213+00');
INSERT INTO public.payment_methods VALUES (772, 'Test Payment Method 1761083025094', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5094"', false, 94, '2025-10-21 21:43:45.184123+00', '2025-10-21 21:43:45.184123+00');
INSERT INTO public.payment_methods VALUES (773, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 21:43:45.607553+00', '2025-10-21 21:43:45.607553+00');
INSERT INTO public.payment_methods VALUES (774, 'Test Payment Method 1761083026387', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6387"', false, 87, '2025-10-21 21:43:46.46912+00', '2025-10-21 21:43:46.46912+00');
INSERT INTO public.payment_methods VALUES (775, 'Test Payment Method 1761083027834', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7834"', false, 34, '2025-10-21 21:43:47.912298+00', '2025-10-21 21:43:47.912298+00');
INSERT INTO public.payment_methods VALUES (777, 'Test Payment Method 1761083029375', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9375"', false, 75, '2025-10-21 21:43:49.493781+00', '2025-10-21 21:43:49.493781+00');
INSERT INTO public.payment_methods VALUES (778, 'Test Payment Method 1761083029982', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9982"', false, 82, '2025-10-21 21:43:50.103111+00', '2025-10-21 21:43:50.103111+00');
INSERT INTO public.payment_methods VALUES (779, 'Test Payment Method 1761083062346', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2346"', false, 46, '2025-10-21 21:44:23.740068+00', '2025-10-21 21:44:23.740068+00');
INSERT INTO public.payment_methods VALUES (780, 'Test Payment Method 1761083064175', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4175"', false, 75, '2025-10-21 21:44:24.251673+00', '2025-10-21 21:44:24.251673+00');
INSERT INTO public.payment_methods VALUES (786, 'Test Payment Method 1761083067402', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7402"', false, 2, '2025-10-21 21:44:27.478006+00', '2025-10-21 21:44:27.478006+00');
INSERT INTO public.payment_methods VALUES (787, 'Test Payment Method 1761083067887', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7887"', false, 87, '2025-10-21 21:44:27.992473+00', '2025-10-21 21:44:27.992473+00');
INSERT INTO public.payment_methods VALUES (806, 'Test Payment Method 1761334057195', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7195"', false, 95, '2025-10-24 19:27:37.369344+00', '2025-10-24 19:27:37.369344+00');
INSERT INTO public.payment_methods VALUES (776, 'Test Payment Method 1761083028483', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8483"', false, 15, '2025-10-21 21:43:48.579071+00', '2025-10-21 21:43:48.579071+00');
INSERT INTO public.payment_methods VALUES (781, 'Test Payment Method 1761083064607', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4607"', false, 7, '2025-10-21 21:44:24.68632+00', '2025-10-21 21:44:24.68632+00');
INSERT INTO public.payment_methods VALUES (782, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 21:44:25.006186+00', '2025-10-21 21:44:25.006186+00');
INSERT INTO public.payment_methods VALUES (783, 'Test Payment Method 1761083065481', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5481"', false, 81, '2025-10-21 21:44:25.572403+00', '2025-10-21 21:44:25.572403+00');
INSERT INTO public.payment_methods VALUES (807, 'Test Payment Method 1761334057993', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7993"', false, 93, '2025-10-24 19:27:38.107218+00', '2025-10-24 19:27:38.107218+00');
INSERT INTO public.payment_methods VALUES (784, 'Test Payment Method 1761083066161', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6161"', false, 61, '2025-10-21 21:44:26.253762+00', '2025-10-21 21:44:26.253762+00');
INSERT INTO public.payment_methods VALUES (808, 'Test Payment Method 1761334058761', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8761"', false, 61, '2025-10-24 19:27:38.870219+00', '2025-10-24 19:27:38.870219+00');
INSERT INTO public.payment_methods VALUES (785, 'Test Payment Method 1761083066878', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6878"', false, 15, '2025-10-21 21:44:26.960054+00', '2025-10-21 21:44:26.960054+00');
INSERT INTO public.payment_methods VALUES (788, 'Test Payment Method 1761087207625', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7625"', false, 25, '2025-10-21 22:53:28.859105+00', '2025-10-21 22:53:28.859105+00');
INSERT INTO public.payment_methods VALUES (789, 'Test Payment Method 1761087209433', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9433"', false, 33, '2025-10-21 22:53:29.591335+00', '2025-10-21 22:53:29.591335+00');
INSERT INTO public.payment_methods VALUES (790, 'Test Payment Method 1761087209915', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9915"', false, 15, '2025-10-21 22:53:30.075419+00', '2025-10-21 22:53:30.075419+00');
INSERT INTO public.payment_methods VALUES (791, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-21 22:53:30.436735+00', '2025-10-21 22:53:30.436735+00');
INSERT INTO public.payment_methods VALUES (792, 'Test Payment Method 1761087210853', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0853"', false, 53, '2025-10-21 22:53:31.026198+00', '2025-10-21 22:53:31.026198+00');
INSERT INTO public.payment_methods VALUES (809, 'Test Payment Method 1761334059493', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9493"', false, 93, '2025-10-24 19:27:39.610628+00', '2025-10-24 19:27:39.610628+00');
INSERT INTO public.payment_methods VALUES (793, 'Test Payment Method 1761087211678', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1678"', false, 78, '2025-10-21 22:53:31.828813+00', '2025-10-21 22:53:31.828813+00');
INSERT INTO public.payment_methods VALUES (810, 'Test Payment Method 1761334060226', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0226"', false, 26, '2025-10-24 19:27:40.323989+00', '2025-10-24 19:27:40.323989+00');
INSERT INTO public.payment_methods VALUES (794, 'Test Payment Method 1761087212365', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2365"', false, 15, '2025-10-21 22:53:32.533981+00', '2025-10-21 22:53:32.533981+00');
INSERT INTO public.payment_methods VALUES (795, 'Test Payment Method 1761087212851', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2851"', false, 51, '2025-10-21 22:53:33.006639+00', '2025-10-21 22:53:33.006639+00');
INSERT INTO public.payment_methods VALUES (796, 'Test Payment Method 1761087213445', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3445"', false, 45, '2025-10-21 22:53:33.628754+00', '2025-10-21 22:53:33.628754+00');
INSERT INTO public.payment_methods VALUES (797, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-24 14:04:22.959361+00', '2025-10-24 14:04:22.959361+00');
INSERT INTO public.payment_methods VALUES (799, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-24 14:08:05.753372+00', '2025-10-24 14:08:05.753372+00');
INSERT INTO public.payment_methods VALUES (801, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-24 14:25:22.446517+00', '2025-10-24 14:25:22.446517+00');
INSERT INTO public.payment_methods VALUES (803, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-24 14:34:39.170901+00', '2025-10-24 14:34:39.170901+00');
INSERT INTO public.payment_methods VALUES (805, 'Test Payment Method 1761334056304', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6304"', false, 4, '2025-10-24 19:27:36.446999+00', '2025-10-24 19:27:36.446999+00');
INSERT INTO public.payment_methods VALUES (811, 'Test Payment Method 1761334060859', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0859"', false, 59, '2025-10-24 19:27:40.978155+00', '2025-10-24 19:27:40.978155+00');
INSERT INTO public.payment_methods VALUES (812, 'Test Payment Method 1761334061487', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1487"', false, 87, '2025-10-24 19:27:41.590804+00', '2025-10-24 19:27:41.590804+00');
INSERT INTO public.payment_methods VALUES (814, 'Test Payment Method 1761334062252', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2252"', false, 52, '2025-10-24 19:27:42.363588+00', '2025-10-24 19:27:42.363588+00');
INSERT INTO public.payment_methods VALUES (813, 'Test Payment Method 1761334057093', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7093"', false, 93, '2025-10-24 19:27:42.089406+00', '2025-10-24 19:27:42.089406+00');
INSERT INTO public.payment_methods VALUES (815, 'Test Payment Method 1761334062847', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2847"', false, 47, '2025-10-24 19:27:42.943036+00', '2025-10-24 19:27:42.943036+00');
INSERT INTO public.payment_methods VALUES (816, 'Test Payment Method 1761334063263', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3263"', false, 63, '2025-10-24 19:27:43.409783+00', '2025-10-24 19:27:43.409783+00');
INSERT INTO public.payment_methods VALUES (817, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-24 19:27:43.708638+00', '2025-10-24 19:27:43.708638+00');
INSERT INTO public.payment_methods VALUES (818, 'Test Payment Method 1761334063607', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3607"', false, 7, '2025-10-24 19:27:43.713356+00', '2025-10-24 19:27:43.713356+00');
INSERT INTO public.payment_methods VALUES (819, 'Test Payment Method 1761334063757', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3757"', false, 57, '2025-10-24 19:27:43.860203+00', '2025-10-24 19:27:43.860203+00');
INSERT INTO public.payment_methods VALUES (821, 'Test Payment Method 1761334064238', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4238"', false, 38, '2025-10-24 19:27:44.33703+00', '2025-10-24 19:27:44.33703+00');
INSERT INTO public.payment_methods VALUES (822, 'Test Payment Method 1761334064615', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4615"', false, 15, '2025-10-24 19:27:44.752413+00', '2025-10-24 19:27:44.752413+00');
INSERT INTO public.payment_methods VALUES (823, 'Test Payment Method 1761334064880', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4880"', false, 80, '2025-10-24 19:27:44.998866+00', '2025-10-24 19:27:44.998866+00');
INSERT INTO public.payment_methods VALUES (824, 'Test Payment Method 1761334065281', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5281"', false, 81, '2025-10-24 19:27:45.392273+00', '2025-10-24 19:27:45.392273+00');
INSERT INTO public.payment_methods VALUES (825, 'Test Payment Method 1761334065359', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5359"', false, 59, '2025-10-24 19:27:45.492519+00', '2025-10-24 19:27:45.492519+00');
INSERT INTO public.payment_methods VALUES (826, 'Test Payment Method 1761334065727', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5727"', false, 27, '2025-10-24 19:27:45.818449+00', '2025-10-24 19:27:45.818449+00');
INSERT INTO public.payment_methods VALUES (827, 'Test Payment Method 1761334065918', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5918"', false, 18, '2025-10-24 19:27:46.023984+00', '2025-10-24 19:27:46.023984+00');
INSERT INTO public.payment_methods VALUES (828, 'Test Payment Method 1761334066063', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6063"', false, 63, '2025-10-24 19:27:46.171643+00', '2025-10-24 19:27:46.171643+00');
INSERT INTO public.payment_methods VALUES (829, 'Test Payment Method 1761334065239', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5239"', false, 39, '2025-10-24 19:27:46.308851+00', '2025-10-24 19:27:46.308851+00');
INSERT INTO public.payment_methods VALUES (831, 'Test Payment Method 1761334066546', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6546"', false, 46, '2025-10-24 19:27:46.64842+00', '2025-10-24 19:27:46.64842+00');
INSERT INTO public.payment_methods VALUES (832, 'Test Payment Method 1761334066636', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6636"', false, 36, '2025-10-24 19:27:46.74016+00', '2025-10-24 19:27:46.74016+00');
INSERT INTO public.payment_methods VALUES (833, 'Test Payment Method 1761334066785', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-6785"', false, 85, '2025-10-24 19:27:46.969894+00', '2025-10-24 19:27:46.969894+00');
INSERT INTO public.payment_methods VALUES (834, 'Updated Payment Method Name', 'bank_transfer', 'Updated description for the payment method', '"5555-5555-5555-5555"', false, 5, '2025-10-24 19:27:47.135876+00', '2025-10-24 19:27:47.135876+00');
INSERT INTO public.payment_methods VALUES (885, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-27 14:29:42.805989+00', '2025-10-27 14:29:42.805989+00');
INSERT INTO public.payment_methods VALUES (835, 'Test Payment Method 1761334067137', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7137"', false, 37, '2025-10-24 19:27:47.228272+00', '2025-10-24 19:27:47.228272+00');
INSERT INTO public.payment_methods VALUES (838, 'Test Payment Method 1761334067893', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7893"', false, 93, '2025-10-24 19:27:48.005681+00', '2025-10-24 19:27:48.005681+00');
INSERT INTO public.payment_methods VALUES (836, 'Test Payment Method 1761334067490', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7490"', false, 90, '2025-10-24 19:27:47.602854+00', '2025-10-24 19:27:47.602854+00');
INSERT INTO public.payment_methods VALUES (841, 'Test Payment Method 1761334068604', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8604"', false, 4, '2025-10-24 19:27:48.695816+00', '2025-10-24 19:27:48.695816+00');
INSERT INTO public.payment_methods VALUES (839, 'Test Payment Method 1761334068362', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8362"', false, 62, '2025-10-24 19:27:48.48367+00', '2025-10-24 19:27:48.48367+00');
INSERT INTO public.payment_methods VALUES (842, 'Test Payment Method 1761334068907', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8907"', false, 7, '2025-10-24 19:27:49.007551+00', '2025-10-24 19:27:49.007551+00');
INSERT INTO public.payment_methods VALUES (844, 'Test Payment Method 1761334069166', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9166"', false, 66, '2025-10-24 19:27:49.265038+00', '2025-10-24 19:27:49.265038+00');
INSERT INTO public.payment_methods VALUES (845, 'Test Payment Method 1761334069208', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9208"', false, 8, '2025-10-24 19:27:49.305682+00', '2025-10-24 19:27:49.305682+00');
INSERT INTO public.payment_methods VALUES (847, 'Test Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2345"', false, 10, '2025-10-24 19:27:49.464007+00', '2025-10-24 19:27:49.464007+00');
INSERT INTO public.payment_methods VALUES (849, 'Test Payment Method 1761334069798', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9798"', false, 98, '2025-10-24 19:27:49.910267+00', '2025-10-24 19:27:49.910267+00');
INSERT INTO public.payment_methods VALUES (850, 'Test Payment Method 1761334069810', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9810"', false, 10, '2025-10-24 19:27:49.916872+00', '2025-10-24 19:27:49.916872+00');
INSERT INTO public.payment_methods VALUES (852, 'Test Payment Method 1761334070383', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0383"', false, 83, '2025-10-24 19:27:50.550848+00', '2025-10-24 19:27:50.550848+00');
INSERT INTO public.payment_methods VALUES (854, 'Test Payment Method 1761334070769', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0769"', false, 69, '2025-10-24 19:27:50.876629+00', '2025-10-24 19:27:50.876629+00');
INSERT INTO public.payment_methods VALUES (853, 'Test Payment Method 1761334070619', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-0619"', false, 19, '2025-10-24 19:27:50.721054+00', '2025-10-24 19:27:50.721054+00');
INSERT INTO public.payment_methods VALUES (858, 'Test Payment Method 1761334071505', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1505"', false, 5, '2025-10-24 19:27:51.60221+00', '2025-10-24 19:27:51.60221+00');
INSERT INTO public.payment_methods VALUES (880, 'Test Payment Method 1761334075280', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5280"', false, 80, '2025-10-24 19:27:55.379394+00', '2025-10-24 19:27:55.379394+00');
INSERT INTO public.payment_methods VALUES (878, 'Test Payment Method 1761334075141', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5141"', false, 41, '2025-10-24 19:27:55.251944+00', '2025-10-24 19:27:55.251944+00');
INSERT INTO public.payment_methods VALUES (868, 'Test Payment Method 1761334073370', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3370"', false, 70, '2025-10-24 19:27:53.477873+00', '2025-10-24 19:27:53.477873+00');
INSERT INTO public.payment_methods VALUES (871, 'Test Payment Method 1761334073943', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3943"', false, 43, '2025-10-24 19:27:54.043287+00', '2025-10-24 19:27:54.043287+00');
INSERT INTO public.payment_methods VALUES (873, 'Test Payment Method 1761334074262', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4262"', false, 62, '2025-10-24 19:27:54.366233+00', '2025-10-24 19:27:54.366233+00');
INSERT INTO public.payment_methods VALUES (851, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 19:27:50.071385+00', '2025-10-24 19:27:50.071385+00');
INSERT INTO public.payment_methods VALUES (874, 'Test Payment Method 1761334074404', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4404"', false, 15, '2025-10-24 19:27:54.510219+00', '2025-10-24 19:27:54.510219+00');
INSERT INTO public.payment_methods VALUES (875, 'Test Payment Method 1761334074558', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4558"', false, 58, '2025-10-24 19:27:54.660864+00', '2025-10-24 19:27:54.660864+00');
INSERT INTO public.payment_methods VALUES (872, 'Test Payment Method 1761334073985', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3985"', false, 85, '2025-10-24 19:27:54.085929+00', '2025-10-24 19:27:54.085929+00');
INSERT INTO public.payment_methods VALUES (837, 'Unauthorized Update', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-7505"', false, 5, '2025-10-24 19:27:47.611221+00', '2025-10-24 19:27:47.611221+00');
INSERT INTO public.payment_methods VALUES (840, 'Test Payment Method 1761334068464', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8464"', false, 64, '2025-10-24 19:27:48.561366+00', '2025-10-24 19:27:48.561366+00');
INSERT INTO public.payment_methods VALUES (843, 'Test Payment Method 1761334068896', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-8896"', false, 96, '2025-10-24 19:27:49.014392+00', '2025-10-24 19:27:49.014392+00');
INSERT INTO public.payment_methods VALUES (846, 'Test Payment Method 1761334069211', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9211"', false, 11, '2025-10-24 19:27:49.307241+00', '2025-10-24 19:27:49.307241+00');
INSERT INTO public.payment_methods VALUES (848, 'Test Payment Method 1761334069796', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-9796"', false, 96, '2025-10-24 19:27:49.910249+00', '2025-10-24 19:27:49.910249+00');
INSERT INTO public.payment_methods VALUES (855, 'Updated Payment Method', 'bank_transfer', 'Updated description', '"0123-4567-8901-0903"', false, 5, '2025-10-24 19:27:51.008564+00', '2025-10-24 19:27:51.008564+00');
INSERT INTO public.payment_methods VALUES (876, 'Test Payment Method 1761334074688', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4688"', false, 88, '2025-10-24 19:27:54.792446+00', '2025-10-24 19:27:54.792446+00');
INSERT INTO public.payment_methods VALUES (857, 'Updated Payment Method', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1456"', false, 56, '2025-10-24 19:27:51.560344+00', '2025-10-24 19:27:51.560344+00');
INSERT INTO public.payment_methods VALUES (856, 'Test Payment Method 1761334071313', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1313"', false, 13, '2025-10-24 19:27:51.42103+00', '2025-10-24 19:27:51.42103+00');
INSERT INTO public.payment_methods VALUES (859, 'Test Payment Method 1761334071884', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1884"', false, 84, '2025-10-24 19:27:51.983598+00', '2025-10-24 19:27:51.983598+00');
INSERT INTO public.payment_methods VALUES (860, 'Test Payment Method 1761334071889', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-1889"', false, 89, '2025-10-24 19:27:51.989672+00', '2025-10-24 19:27:51.989672+00');
INSERT INTO public.payment_methods VALUES (861, 'Test Payment Method 1761334072124', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2124"', false, 24, '2025-10-24 19:27:52.217502+00', '2025-10-24 19:27:52.217502+00');
INSERT INTO public.payment_methods VALUES (862, 'Test Payment Method 1761334072334', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2334"', false, 34, '2025-10-24 19:27:52.43835+00', '2025-10-24 19:27:52.43835+00');
INSERT INTO public.payment_methods VALUES (863, 'Test Payment Method 1761334072354', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2354"', false, 54, '2025-10-24 19:27:52.462975+00', '2025-10-24 19:27:52.462975+00');
INSERT INTO public.payment_methods VALUES (864, 'Test Payment Method 1761334072729', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2729"', false, 29, '2025-10-24 19:27:52.816357+00', '2025-10-24 19:27:52.816357+00');
INSERT INTO public.payment_methods VALUES (877, 'Test Payment Method 1761334074822', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-4822"', false, 15, '2025-10-24 19:27:54.932351+00', '2025-10-24 19:27:54.932351+00');
INSERT INTO public.payment_methods VALUES (866, 'Test Payment Method 1761334072920', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2920"', false, 20, '2025-10-24 19:27:53.022671+00', '2025-10-24 19:27:53.022671+00');
INSERT INTO public.payment_methods VALUES (865, 'Test Payment Method 1761334072812', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-2812"', false, 15, '2025-10-24 19:27:52.917188+00', '2025-10-24 19:27:52.917188+00');
INSERT INTO public.payment_methods VALUES (869, 'Test Payment Method 1761334073366', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3366"', false, 66, '2025-10-24 19:27:53.483614+00', '2025-10-24 19:27:53.483614+00');
INSERT INTO public.payment_methods VALUES (867, 'Test Payment Method 1761334073283', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3283"', false, 10, '2025-10-24 19:27:53.403008+00', '2025-10-24 19:27:53.403008+00');
INSERT INTO public.payment_methods VALUES (870, 'Test Payment Method 1761334073776', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-3776"', false, 76, '2025-10-24 19:27:53.895099+00', '2025-10-24 19:27:53.895099+00');
INSERT INTO public.payment_methods VALUES (879, 'Test Payment Method 1761334075244', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5244"', false, 44, '2025-10-24 19:27:55.35166+00', '2025-10-24 19:27:55.35166+00');
INSERT INTO public.payment_methods VALUES (881, 'Updated Status Test Payment Method', 'bank_transfer', 'Status code test payment method', '"0123-4567-8901-2345"', false, 5, '2025-10-24 19:27:55.41292+00', '2025-10-24 19:27:55.41292+00');
INSERT INTO public.payment_methods VALUES (882, 'Test Payment Method 1761334075885', 'bank_transfer', 'Test payment method for integration tests', '"0123-4567-8901-5885"', false, 85, '2025-10-24 19:27:55.980318+00', '2025-10-24 19:27:55.980318+00');
INSERT INTO public.payment_methods VALUES (883, 'Banco Mercantil', 'bank_transfer', 'Transferencias bancarias', '"0105-1234-5678-9012"', true, 1, '2025-10-27 14:29:17.124073+00', '2025-10-27 14:29:17.124073+00');
INSERT INTO public.payment_methods VALUES (9, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-17 01:28:41.817813+00', '2025-10-17 01:28:41.817813+00');
INSERT INTO public.payment_methods VALUES (11, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-17 23:56:24.252994+00', '2025-10-17 23:56:24.252994+00');
INSERT INTO public.payment_methods VALUES (16, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-18 05:35:46.940834+00', '2025-10-18 05:35:46.940834+00');
INSERT INTO public.payment_methods VALUES (23, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-18 17:47:20.715424+00', '2025-10-18 17:47:20.715424+00');
INSERT INTO public.payment_methods VALUES (25, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 00:54:52.857525+00', '2025-10-19 00:54:52.857525+00');
INSERT INTO public.payment_methods VALUES (43, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 00:55:02.677906+00', '2025-10-19 00:55:02.677906+00');
INSERT INTO public.payment_methods VALUES (266, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 12:42:05.533331+00', '2025-10-20 12:42:05.533331+00');
INSERT INTO public.payment_methods VALUES (493, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 14:46:18.008742+00', '2025-10-20 14:46:18.008742+00');
INSERT INTO public.payment_methods VALUES (123, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 00:59:10.67223+00', '2025-10-19 00:59:10.67223+00');
INSERT INTO public.payment_methods VALUES (126, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 00:59:10.957985+00', '2025-10-19 00:59:10.957985+00');
INSERT INTO public.payment_methods VALUES (180, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-19 18:19:27.502362+00', '2025-10-19 18:19:27.502362+00');
INSERT INTO public.payment_methods VALUES (241, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 12:26:35.348759+00', '2025-10-20 12:26:35.348759+00');
INSERT INTO public.payment_methods VALUES (419, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 14:44:19.556425+00', '2025-10-20 14:44:19.556425+00');
INSERT INTO public.payment_methods VALUES (525, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 14:46:24.601234+00', '2025-10-20 14:46:24.601234+00');
INSERT INTO public.payment_methods VALUES (591, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 22:36:10.316913+00', '2025-10-20 22:36:10.316913+00');
INSERT INTO public.payment_methods VALUES (592, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 22:36:10.318829+00', '2025-10-20 22:36:10.318829+00');
INSERT INTO public.payment_methods VALUES (594, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-20 22:36:10.621964+00', '2025-10-20 22:36:10.621964+00');
INSERT INTO public.payment_methods VALUES (666, 'Test Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-21 00:25:07.036516+00', '2025-10-21 00:25:07.036516+00');
INSERT INTO public.payment_methods VALUES (680, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-21 00:25:09.396231+00', '2025-10-21 00:25:09.396231+00');
INSERT INTO public.payment_methods VALUES (667, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-21 00:25:07.181558+00', '2025-10-21 00:25:07.181558+00');
INSERT INTO public.payment_methods VALUES (798, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 14:04:23.090553+00', '2025-10-24 14:04:23.090553+00');
INSERT INTO public.payment_methods VALUES (802, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 14:25:22.757438+00', '2025-10-24 14:25:22.757438+00');
INSERT INTO public.payment_methods VALUES (886, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-27 14:29:43.081689+00', '2025-10-27 14:29:43.081689+00');
INSERT INTO public.payment_methods VALUES (800, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 14:08:05.981536+00', '2025-10-24 14:08:05.981536+00');
INSERT INTO public.payment_methods VALUES (804, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 14:34:39.32615+00', '2025-10-24 14:34:39.32615+00');
INSERT INTO public.payment_methods VALUES (820, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 19:27:43.872782+00', '2025-10-24 19:27:43.872782+00');
INSERT INTO public.payment_methods VALUES (830, 'Unauthorized Payment Method', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-24 19:27:46.362268+00', '2025-10-24 19:27:46.362268+00');
INSERT INTO public.payment_methods VALUES (884, 'Banco Mercantil', 'bank_transfer', 'Sin descripción', NULL, true, 0, '2025-10-27 14:29:17.287504+00', '2025-10-27 14:29:17.287504+00');


--
-- TOC entry 4411 (class 0 OID 32169)
-- Dependencies: 397
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4413 (class 0 OID 32525)
-- Dependencies: 399
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.product_images VALUES (600, 179, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_7_3_f43a3636e3f93d9c15beab832ddb3e1895c896df585732d84f2f55f3f8d5c82f.webp', 'f43a3636e3f93d9c15beab832ddb3e1895c896df585732d84f2f55f3f8d5c82f', 'image/webp', true, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (601, 179, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_2_2_1c2252a79ee507ee099618f91aa0d79353d3758b923fa4adb0ab24d4fa59ea9b.webp', '1c2252a79ee507ee099618f91aa0d79353d3758b923fa4adb0ab24d4fa59ea9b', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (602, 179, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_1_1_17e2d03c735674d8fd1770a7f042573f6ca5a4bf25d1bad7bfa76b72c9033881.webp', '17e2d03c735674d8fd1770a7f042573f6ca5a4bf25d1bad7bfa76b72c9033881', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (603, 179, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_4_3_703f65845872a02e72e1516bbe174f24a8f7ed609afcded31747857ce05ff309.webp', '703f65845872a02e72e1516bbe174f24a8f7ed609afcded31747857ce05ff309', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (604, 180, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_13_4_12ca76f2374b66fe8783434c3a8571f2f61c93c4a4044ae1c2eb169421bba8ef.webp', '12ca76f2374b66fe8783434c3a8571f2f61c93c4a4044ae1c2eb169421bba8ef', 'image/webp', true, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (605, 180, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_10_2_60428b746ec9a677e4dd7283e37d867602bdfa3fde53c2592c0214f6d1b25368.webp', '60428b746ec9a677e4dd7283e37d867602bdfa3fde53c2592c0214f6d1b25368', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (606, 180, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_106_1_234fded092ca2f02ffdbf10ea13b8c73ea5150dad853ee472b31be36f6b63ce9.webp', '234fded092ca2f02ffdbf10ea13b8c73ea5150dad853ee472b31be36f6b63ce9', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (607, 180, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_4_2_04eb4768eb6cb84374d23528fb5d5330b3683c850105a2efa17a94cebc4c00e7.webp', '04eb4768eb6cb84374d23528fb5d5330b3683c850105a2efa17a94cebc4c00e7', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (608, 181, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_7_4_4e4ae2d7a1cf1603aef25657961057884962e30488a74e90b1cf6e840cb23141.webp', '4e4ae2d7a1cf1603aef25657961057884962e30488a74e90b1cf6e840cb23141', 'image/webp', true, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (609, 181, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_4_1_7b23c0e6c08d32c2650e6018b6962be17aaa638d367acb87f879f1eb080d9b45.webp', '7b23c0e6c08d32c2650e6018b6962be17aaa638d367acb87f879f1eb080d9b45', 'image/webp', false, '2025-11-21 22:09:37.396943+00', '2025-11-21 22:09:37.396943+00', true);
INSERT INTO public.product_images VALUES (610, 181, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_12_3_e5da83e94b522e11b17d9cc608022520acdcb89a309b8cbec80434629a54de5f.webp', 'e5da83e94b522e11b17d9cc608022520acdcb89a309b8cbec80434629a54de5f', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (611, 181, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_11_1_b185482b2084a7e92f67c69046b6d3d4c0cccc911835c3c41e97164d88e93a0f.webp', 'b185482b2084a7e92f67c69046b6d3d4c0cccc911835c3c41e97164d88e93a0f', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (612, 182, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_14_1_1ebbff6e009fdad38588c522063bd0b0a8c42965a1df26c7f12d9dec4d10f640.webp', '1ebbff6e009fdad38588c522063bd0b0a8c42965a1df26c7f12d9dec4d10f640', 'image/webp', true, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (613, 182, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_12_2_64defb63144bc231795ccfd2ea89f64f292110dface20d389dfdb4e3a5e70341.webp', '64defb63144bc231795ccfd2ea89f64f292110dface20d389dfdb4e3a5e70341', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (614, 182, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_12_1_956dd99d024b7a395ed612bd65ac976ae7a2615680acc2c3938e2bd1a2d4a78f.webp', '956dd99d024b7a395ed612bd65ac976ae7a2615680acc2c3938e2bd1a2d4a78f', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (615, 182, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_107_2_f1863916521b81cdcbd6ad3d11fd19e89a8401a0304966381863fa516dfb98d2.webp', 'f1863916521b81cdcbd6ad3d11fd19e89a8401a0304966381863fa516dfb98d2', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (616, 183, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_2_3_ec9ce4c3217c4fa5962fe566e6626356582d47ebccb0762fe5a8eeec4f29c859.webp', 'ec9ce4c3217c4fa5962fe566e6626356582d47ebccb0762fe5a8eeec4f29c859', 'image/webp', true, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (617, 183, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_12_4_ac25c93b8f3d28b22ec5a0af4b5ddea8f44e741206d48abcb871db24484c175c.webp', 'ac25c93b8f3d28b22ec5a0af4b5ddea8f44e741206d48abcb871db24484c175c', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (618, 183, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_10_3_0352ce0c3b2326fd0483eced9794053fd28d05869f28dc88ff387285fc8b9a96.webp', '0352ce0c3b2326fd0483eced9794053fd28d05869f28dc88ff387285fc8b9a96', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (619, 183, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_1_4_ef3d8dd703b989b15baf319626ec0d6c3377f99c6b7032c4d7070f47fa586260.webp', 'ef3d8dd703b989b15baf319626ec0d6c3377f99c6b7032c4d7070f47fa586260', 'image/webp', false, '2025-11-21 22:09:37.634458+00', '2025-11-21 22:09:37.634458+00', true);
INSERT INTO public.product_images VALUES (620, 184, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_11_3_56426a418954cfb02df930324bd0dd0900fa2f4d25abb00fe898c32d44d3e05b.webp', '56426a418954cfb02df930324bd0dd0900fa2f4d25abb00fe898c32d44d3e05b', 'image/webp', true, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (621, 184, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_13_1_0f5d40f67f8d05ff70d6b6dd62bb05ee2d675502d78647152eb86d15b4686b8d.webp', '0f5d40f67f8d05ff70d6b6dd62bb05ee2d675502d78647152eb86d15b4686b8d', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (622, 184, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_3_1_a54078e720522a6433aa98246b29ea1568f9af6bd520351486f4142c53d239cf.webp', 'a54078e720522a6433aa98246b29ea1568f9af6bd520351486f4142c53d239cf', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (623, 184, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_9_2_31902a6d557687f069c164a929eb43a19275498482f444391c643cd0e5927d1f.webp', '31902a6d557687f069c164a929eb43a19275498482f444391c643cd0e5927d1f', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (624, 185, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_11_4_85f0bdd1c886d81554188836363bfe56d93001bffea11452e0e68560f4111332.webp', '85f0bdd1c886d81554188836363bfe56d93001bffea11452e0e68560f4111332', 'image/webp', true, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (625, 185, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_13_2_75d29c93f688e53c58702b99cd4f67da767638e3d7badbbfbd27f2e724fe0930.webp', '75d29c93f688e53c58702b99cd4f67da767638e3d7badbbfbd27f2e724fe0930', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (626, 185, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_1_2_90b58d2a3bb547c632b69b932b8fcdf6811362464549b8837ab5aa65b912f88e.webp', '90b58d2a3bb547c632b69b932b8fcdf6811362464549b8837ab5aa65b912f88e', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (627, 185, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_11_2_3013ec05e7208c7b7cb6a26ddb7079afd9504695e570c65c4f1f8ddccdc030cd.webp', '3013ec05e7208c7b7cb6a26ddb7079afd9504695e570c65c4f1f8ddccdc030cd', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (628, 186, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_9_3_f99d96a70b4e59beb42964d959d45aa4cd2b74769eb5306576eca2e416d34ccc.webp', 'f99d96a70b4e59beb42964d959d45aa4cd2b74769eb5306576eca2e416d34ccc', 'image/webp', true, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (629, 186, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_9_1_b26cfaed00334261b502e19fb48f40e21db02c5e3550a87a0f07e981047c2662.webp', 'b26cfaed00334261b502e19fb48f40e21db02c5e3550a87a0f07e981047c2662', 'image/webp', false, '2025-11-21 22:09:37.792453+00', '2025-11-21 22:09:37.792453+00', true);
INSERT INTO public.product_images VALUES (630, 186, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_5_2_735540ce4a1b90812851f0a873c4a0005da6bc3fbba4c6b662cd800387d50855.webp', '735540ce4a1b90812851f0a873c4a0005da6bc3fbba4c6b662cd800387d50855', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (631, 186, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_10_4_a3442f17209984253dc088a6ad3f2c46bd68bc1560cfdfce2c3794194e458f81.webp', 'a3442f17209984253dc088a6ad3f2c46bd68bc1560cfdfce2c3794194e458f81', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (632, 187, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_3_2_275afc6a8363b280e00a80f85fd338e5e25d6d10be6ffc3a935093eedb6e67bb.webp', '275afc6a8363b280e00a80f85fd338e5e25d6d10be6ffc3a935093eedb6e67bb', 'image/webp', true, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (633, 187, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_103_1_955959497c02f9ed157c9f9d423c29663cc46ca33e8964855bda56650538f281.webp', '955959497c02f9ed157c9f9d423c29663cc46ca33e8964855bda56650538f281', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (634, 187, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_1_3_65da340aff6eeb1a5e1c16a682bc7c52fc5a877dcadc09033af89fee3e3e8184.webp', '65da340aff6eeb1a5e1c16a682bc7c52fc5a877dcadc09033af89fee3e3e8184', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (635, 187, 4, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_7_2_5a31789270fc9364641e5823ae7df6ccdcf78691ecf122875c2fff50418fca38.webp', '5a31789270fc9364641e5823ae7df6ccdcf78691ecf122875c2fff50418fca38', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (636, 188, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_10_1_3b83d695a4dd98e49aff32326fb99214ea2838acd41ffe14fafa866022342729.webp', '3b83d695a4dd98e49aff32326fb99214ea2838acd41ffe14fafa866022342729', 'image/webp', true, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (637, 188, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_104_1_955959497c02f9ed157c9f9d423c29663cc46ca33e8964855bda56650538f281.webp', '955959497c02f9ed157c9f9d423c29663cc46ca33e8964855bda56650538f281', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (638, 188, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_7_1_2d109697081bea3d10c57431479648e9c908d9a3fe25fe6092fbfbe5f3e12b43.webp', '2d109697081bea3d10c57431479648e9c908d9a3fe25fe6092fbfbe5f3e12b43', 'image/webp', false, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (639, 189, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_8_1_ebb66be7c823ecf934632f192ea47c305238facb61d3213aefb72018ab300606.webp', 'ebb66be7c823ecf934632f192ea47c305238facb61d3213aefb72018ab300606', 'image/webp', true, '2025-11-21 22:09:37.981242+00', '2025-11-21 22:09:37.981242+00', true);
INSERT INTO public.product_images VALUES (640, 189, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_107_1_fb1aa7b52a915ae07c3792d0e471f459d3bcb953f27b665675672d762374bda5.webp', 'fb1aa7b52a915ae07c3792d0e471f459d3bcb953f27b665675672d762374bda5', 'image/webp', false, '2025-11-21 22:09:38.210231+00', '2025-11-21 22:09:38.210231+00', true);
INSERT INTO public.product_images VALUES (641, 189, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_5_1_a94420c5792bf1f5a2447f471b8bb6adfb2500a5ae395bceacd50698a340cc07.webp', 'a94420c5792bf1f5a2447f471b8bb6adfb2500a5ae395bceacd50698a340cc07', 'image/webp', false, '2025-11-21 22:09:38.210231+00', '2025-11-21 22:09:38.210231+00', true);
INSERT INTO public.product_images VALUES (642, 190, 1, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_2_1_ac1439cdc3783a9105eec13dac3eeaecea6bff84ac58daf32f2006e044bfacb3.webp', 'ac1439cdc3783a9105eec13dac3eeaecea6bff84ac58daf32f2006e044bfacb3', 'image/webp', true, '2025-11-21 22:09:38.210231+00', '2025-11-21 22:09:38.210231+00', true);
INSERT INTO public.product_images VALUES (643, 190, 2, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_6_1_28c156112854440297676d63d390f07d6d2823f52d191c7eeacb7f47b8bdd256.webp', '28c156112854440297676d63d390f07d6d2823f52d191c7eeacb7f47b8bdd256', 'image/webp', false, '2025-11-21 22:09:38.210231+00', '2025-11-21 22:09:38.210231+00', true);
INSERT INTO public.product_images VALUES (644, 190, 3, 'large', 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_13_3_5e58f5689aefd64ca1339d5757218869f491efd1ca3419e062e1ca0bf007efa2.webp', '5e58f5689aefd64ca1339d5757218869f491efd1ca3419e062e1ca0bf007efa2', 'image/webp', false, '2025-11-21 22:09:38.210231+00', '2025-11-21 22:09:38.210231+00', true);


--
-- TOC entry 4401 (class 0 OID 32072)
-- Dependencies: 387
-- Data for Name: product_occasions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4399 (class 0 OID 32033)
-- Dependencies: 385
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products VALUES (179, 'Ramo Tropical Vibrante', 'Flores tropicales exóticas vibrantes', 'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas', 45.99, 1676.34, 25, 'FY-001', true, true, 1, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-001'':21 ''aves'':13C ''color'':10C ''exot'':6B,19C ''explosion'':8C ''flor'':4B,18C ''fy'':20 ''heliconi'':16C ''parais'':15C ''ram'':1A ''tropical'':2A,5B,11C ''vibrant'':3A,7B');
INSERT INTO public.products VALUES (180, 'Bouquet Arcoíris de Rosas', 'Rosas multicolores espectaculares', 'Rosas multicolores que forman un hermoso arcoíris de emociones', 52.99, 1931.49, 30, 'FY-002', true, true, 2, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-002'':18 ''arcoiris'':2A,14C ''bouquet'':1A ''emocion'':16C ''espectacular'':7B ''form'':11C ''fy'':17 ''hermos'':13C ''multicolor'':6B,9C ''ros'':4A,5B,8C');
INSERT INTO public.products VALUES (181, 'Girasoles Gigantes Alegres', 'Girasoles enormes y radiantes', 'Girasoles enormes que irradian alegría y energía positiva', 38.99, 1421.19, 20, 'FY-003', true, false, NULL, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-003'':17 ''alegr'':3A,12C ''energ'':14C ''enorm'':5B,9C ''fy'':16 ''gigant'':2A ''girasol'':1A,4B,8C ''irradi'':11C ''posit'':15C ''radiant'':7B');
INSERT INTO public.products VALUES (182, 'Orquídeas Elegantes Premium', 'Orquídeas exóticas sofisticadas', 'Orquídeas exóticas de alta calidad en arreglo sofisticado', 68.99, 2514.69, 15, 'FY-004', true, true, 3, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-004'':16 ''alta'':10C ''arregl'':13C ''calid'':11C ''eleg'':2A ''exot'':5B,8C ''fy'':15 ''orquid'':1A,4B,7C ''premium'':3A ''sofistic'':6B,14C');
INSERT INTO public.products VALUES (183, 'Lirios Blancos Puros', 'Lirios blancos símbolo de pureza', 'Lirios blancos simbolizando pureza y elegancia', 42.99, 1566.99, 18, 'FY-005', true, false, NULL, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-005'':16 ''blanc'':2A,5B,10C ''eleg'':14C ''fy'':15 ''liri'':1A,4B,9C ''pur'':3A ''purez'':8B,12C ''simbol'':6B ''simboliz'':11C');
INSERT INTO public.products VALUES (184, 'Tulipanes Holandeses Mix', 'Tulipanes importados vibrantes', 'Tulipanes importados en colores vibrantes del valle holandés', 49.99, 1822.14, 22, 'FY-006', true, true, 4, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-006'':16 ''color'':10C ''fy'':15 ''holandes'':2A,14C ''import'':5B,8C ''mix'':3A ''tulipan'':1A,4B,7C ''vall'':13C ''vibrant'':6B,11C');
INSERT INTO public.products VALUES (185, 'Rosas Rojas Clásicas', 'Rosas rojas símbolo del amor', 'Docena de rosas rojas, el símbolo eterno del amor', 55.99, 2040.84, 40, 'FY-007', true, true, 5, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-007'':19 ''amor'':8B,17C ''clasic'':3A ''docen'':9C ''etern'':15C ''fy'':18 ''roj'':2A,5B,12C ''ros'':1A,4B,11C ''simbol'':6B,14C');
INSERT INTO public.products VALUES (186, 'Hortensias Azules Románticas', 'Hortensias azules delicadas', 'Hortensias azules en arreglo romántico y delicado', 46.99, 1712.79, 16, 'FY-008', true, false, NULL, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-008'':15 ''arregl'':10C ''azul'':2A,5B,8C ''delic'':6B,13C ''fy'':14 ''hortensi'':1A,4B,7C ''romant'':3A,11C');
INSERT INTO public.products VALUES (187, 'Claveles Multicolor Festivos', 'Claveles coloridos alegres', 'Claveles coloridos perfectos para celebraciones alegres', 32.99, 1202.49, 28, 'FY-009', true, false, NULL, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-009'':14 ''alegr'':6B,12C ''celebr'':11C ''clavel'':1A,4B,7C ''color'':5B,8C ''festiv'':3A ''fy'':13 ''multicolor'':2A ''perfect'':9C');
INSERT INTO public.products VALUES (188, 'Ramo Campestre Silvestre', 'Flores silvestres naturales', 'Flores silvestres en arreglo natural y espontáneo', 39.99, 1457.64, 24, 'FY-010', true, true, 6, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-010'':15 ''arregl'':10C ''campestr'':2A ''espontane'':13C ''flor'':4B,7C ''fy'':14 ''natural'':6B,11C ''ram'':1A ''silvestr'':3A,5B,8C');
INSERT INTO public.products VALUES (189, 'Margaritas Blancas Frescas', 'Margaritas blancas simples', 'Margaritas blancas que transmiten frescura y simplicidad', 29.99, 1093.14, 35, 'FY-011', true, false, NULL, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-011'':15 ''blanc'':2A,5B,8C ''fresc'':3A ''frescur'':11C ''fy'':14 ''margarit'':1A,4B,7C ''simpl'':6B ''simplic'':13C ''transmit'':10C');
INSERT INTO public.products VALUES (190, 'Peonías Rosadas Deluxe', 'Peonías rosadas de temporada', 'Peonías rosadas de temporada, suaves y voluminosas', 72.99, 2660.49, 12, 'FY-012', true, true, 7, '2025-11-11 23:33:29.846019+00', '2025-11-11 23:33:29.846019+00', DEFAULT, DEFAULT, '''-012'':16 ''delux'':3A ''fy'':15 ''peon'':1A,4B,8C ''ros'':2A,5B,9C ''suav'':12C ''tempor'':7B,11C ''volumin'':14C');


--
-- TOC entry 4417 (class 0 OID 59940)
-- Dependencies: 403
-- Data for Name: query_timeouts_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.query_timeouts_log VALUES (1, 'CONFIG: producto_search_%', 'busqueda', 15000, NULL, 'configuracion', 'Timeout configurado para patrón: producto_search_%', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (2, 'CONFIG: products_with_filters', 'lectura', 12000, NULL, 'configuracion', 'Timeout configurado para patrón: products_with_filters', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (3, 'CONFIG: featured_products_carousel', 'lectura', 8000, NULL, 'configuracion', 'Timeout configurado para patrón: featured_products_carousel', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (4, 'CONFIG: order_create_%', 'escritura', 25000, NULL, 'configuracion', 'Timeout configurado para patrón: order_create_%', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (5, 'CONFIG: orders_by_status', 'lectura', 15000, NULL, 'configuracion', 'Timeout configurado para patrón: orders_by_status', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (6, 'CONFIG: customer_order_history', 'lectura', 12000, NULL, 'configuracion', 'Timeout configurado para patrón: customer_order_history', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (7, 'CONFIG: fulltext_search_%', 'busqueda', 18000, NULL, 'configuracion', 'Timeout configurado para patrón: fulltext_search_%', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (8, 'CONFIG: get_search_suggestions', 'busqueda', 6000, NULL, 'configuracion', 'Timeout configurado para patrón: get_search_suggestions', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (9, 'CONFIG: find_similar_products', 'busqueda', 10000, NULL, 'configuracion', 'Timeout configurado para patrón: find_similar_products', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (10, 'CONFIG: order_analytics_%', 'analytics', 45000, NULL, 'configuracion', 'Timeout configurado para patrón: order_analytics_%', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);
INSERT INTO public.query_timeouts_log VALUES (11, 'CONFIG: get_popular_searches', 'analytics', 30000, NULL, 'configuracion', 'Timeout configurado para patrón: get_popular_searches', '{}', NULL, NULL, '2025-10-11 13:38:51.082584+00', true);


--
-- TOC entry 4397 (class 0 OID 32018)
-- Dependencies: 383
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.settings VALUES (42, 'contact_owner_name', 'María González', 'Nombre del propietario', 'string', true, '2025-10-02 17:13:50.137406+00', '2025-10-02 17:13:50.137406+00', true);
INSERT INTO public.settings VALUES (43, 'contact_owner_experience', 'Más de 15 años creando momentos inolvidables con flores', 'Experiencia del propietario', 'string', true, '2025-10-02 17:13:50.406807+00', '2025-10-02 17:13:50.406807+00', true);
INSERT INTO public.settings VALUES (44, 'contact_owner_specialty', 'Arreglos personalizados y flores frescas de temporada', 'Especialidad del propietario', 'string', true, '2025-10-02 17:13:50.539618+00', '2025-10-02 17:13:50.539618+00', true);
INSERT INTO public.settings VALUES (45, 'contact_shop_name', 'FloresYa - Tu Floristería de Confianza', 'Nombre de la tienda', 'string', true, '2025-10-02 17:13:50.681204+00', '2025-10-02 17:13:50.681204+00', true);
INSERT INTO public.settings VALUES (46, 'contact_shop_location_text', 'Nuestro local en Chacao - ¡Te esperamos!', 'Texto de ubicación del local', 'string', true, '2025-10-02 17:13:50.805441+00', '2025-10-02 17:13:50.805441+00', true);
INSERT INTO public.settings VALUES (47, 'contact_phone_primary', '+58 412-1234567', 'Teléfono principal', 'string', true, '2025-10-02 17:13:50.946552+00', '2025-10-02 17:13:50.946552+00', true);
INSERT INTO public.settings VALUES (48, 'contact_phone_secondary', '+58 212-1234567', 'Teléfono secundario', 'string', true, '2025-10-02 17:13:51.387395+00', '2025-10-02 17:13:51.387395+00', true);
INSERT INTO public.settings VALUES (49, 'contact_whatsapp_main', '+58 412-1234567', 'WhatsApp principal', 'string', true, '2025-10-02 17:13:51.513245+00', '2025-10-02 17:13:51.513245+00', true);
INSERT INTO public.settings VALUES (50, 'contact_whatsapp_special', '+58 412-1234568', 'WhatsApp para pedidos especiales', 'string', true, '2025-10-02 17:13:51.632584+00', '2025-10-02 17:13:51.632584+00', true);
INSERT INTO public.settings VALUES (51, 'contact_email_main', 'contacto@floresya.com', 'Email principal de contacto', 'string', true, '2025-10-02 17:13:51.760057+00', '2025-10-02 17:13:51.760057+00', true);
INSERT INTO public.settings VALUES (52, 'contact_email_response_time', 'Respondemos en menos de 2 horas durante horario laboral', 'Tiempo de respuesta de email', 'string', true, '2025-10-02 17:13:51.889407+00', '2025-10-02 17:13:51.889407+00', true);
INSERT INTO public.settings VALUES (53, 'contact_location_main', 'Gran Caracas, Venezuela', 'Ubicación principal', 'string', true, '2025-10-02 17:13:52.038271+00', '2025-10-02 17:13:52.038271+00', true);
INSERT INTO public.settings VALUES (54, 'contact_location_delivery_area', 'Entregamos en toda el área metropolitana de Caracas', 'Área de entrega', 'string', true, '2025-10-02 17:13:52.165184+00', '2025-10-02 17:13:52.165184+00', true);
INSERT INTO public.settings VALUES (55, 'contact_location_coverage', 'Caracas, Chacao, Baruta, Sucre, El Hatillo', 'Cobertura de entrega', 'string', true, '2025-10-02 17:13:52.297794+00', '2025-10-02 17:13:52.297794+00', true);
INSERT INTO public.settings VALUES (56, 'contact_location_address', 'Av. Principal de Chacao, Centro Comercial Flores, Local 15-B, Caracas, Venezuela', 'Dirección física completa', 'string', true, '2025-10-02 17:13:52.436806+00', '2025-10-02 17:13:52.436806+00', true);
INSERT INTO public.settings VALUES (57, 'contact_hours_weekday', '8:00 AM - 6:00 PM', 'Horario lunes a viernes', 'string', true, '2025-10-02 17:13:52.557394+00', '2025-10-02 17:13:52.557394+00', true);
INSERT INTO public.settings VALUES (58, 'contact_hours_saturday', '9:00 AM - 4:00 PM', 'Horario sábados', 'string', true, '2025-10-02 17:13:52.687792+00', '2025-10-02 17:13:52.687792+00', true);
INSERT INTO public.settings VALUES (59, 'contact_hours_sunday', '10:00 AM - 2:00 PM (Solo WhatsApp)', 'Horario domingos', 'string', true, '2025-10-02 17:13:52.804644+00', '2025-10-02 17:13:52.804644+00', true);
INSERT INTO public.settings VALUES (60, 'contact_delivery_same_day', '¡Entregas el mismo día hasta las 4:00 PM!', 'Mensaje de entrega mismo día', 'string', true, '2025-10-02 17:13:52.93348+00', '2025-10-02 17:13:52.93348+00', true);
INSERT INTO public.settings VALUES (61, 'payment_movil_venezuela_phone', '0412-1234567', 'Teléfono pago móvil Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.081046+00', '2025-10-02 17:13:53.081046+00', true);
INSERT INTO public.settings VALUES (62, 'payment_movil_venezuela_cedula', 'V-12345678', 'Cédula pago móvil Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.207632+00', '2025-10-02 17:13:53.207632+00', true);
INSERT INTO public.settings VALUES (63, 'payment_movil_banesco_phone', '0414-8765432', 'Teléfono pago móvil Banesco', 'string', true, '2025-10-02 17:13:53.335418+00', '2025-10-02 17:13:53.335418+00', true);
INSERT INTO public.settings VALUES (64, 'payment_movil_banesco_cedula', 'V-12345678', 'Cédula pago móvil Banesco', 'string', true, '2025-10-02 17:13:53.451027+00', '2025-10-02 17:13:53.451027+00', true);
INSERT INTO public.settings VALUES (65, 'payment_movil_mercantil_phone', '0424-1122334', 'Teléfono pago móvil Mercantil', 'string', true, '2025-10-02 17:13:53.589075+00', '2025-10-02 17:13:53.589075+00', true);
INSERT INTO public.settings VALUES (66, 'payment_movil_mercantil_cedula', 'V-12345678', 'Cédula pago móvil Mercantil', 'string', true, '2025-10-02 17:13:53.716076+00', '2025-10-02 17:13:53.716076+00', true);
INSERT INTO public.settings VALUES (67, 'payment_transfer_venezuela_account', '0102-1234-5678-90123456', 'Número de cuenta Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.842821+00', '2025-10-02 17:13:53.842821+00', true);
INSERT INTO public.settings VALUES (68, 'payment_transfer_venezuela_holder', 'FloresYa C.A.', 'Titular cuenta Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.95525+00', '2025-10-02 17:13:53.95525+00', true);
INSERT INTO public.settings VALUES (69, 'payment_transfer_venezuela_rif', 'J-123456789', 'RIF cuenta Banco de Venezuela', 'string', true, '2025-10-02 17:13:54.098301+00', '2025-10-02 17:13:54.098301+00', true);
INSERT INTO public.settings VALUES (70, 'payment_transfer_banesco_account', '0134-5678-9012-34567890', 'Número de cuenta Banesco', 'string', true, '2025-10-02 17:13:54.216321+00', '2025-10-02 17:13:54.216321+00', true);
INSERT INTO public.settings VALUES (71, 'payment_transfer_banesco_holder', 'María González', 'Titular cuenta Banesco', 'string', true, '2025-10-02 17:13:54.351365+00', '2025-10-02 17:13:54.351365+00', true);
INSERT INTO public.settings VALUES (72, 'payment_transfer_banesco_cedula', 'V-12345678', 'Cédula titular cuenta Banesco', 'string', true, '2025-10-02 17:13:54.492912+00', '2025-10-02 17:13:54.492912+00', true);
INSERT INTO public.settings VALUES (73, 'payment_zelle_email', 'pagos@floresya.com', 'Email para Zelle', 'string', true, '2025-10-02 17:13:54.651732+00', '2025-10-02 17:13:54.651732+00', true);
INSERT INTO public.settings VALUES (74, 'payment_zelle_name', 'María González', 'Nombre para Zelle', 'string', true, '2025-10-02 17:13:54.793294+00', '2025-10-02 17:13:54.793294+00', true);
INSERT INTO public.settings VALUES (75, 'payment_paypal_email', 'paypal@floresya.com', 'Email para PayPal', 'string', true, '2025-10-02 17:13:54.969204+00', '2025-10-02 17:13:54.969204+00', true);
INSERT INTO public.settings VALUES (76, 'social_facebook_url', 'https://facebook.com/floresya', 'URL de Facebook', 'string', true, '2025-10-02 17:13:55.100437+00', '2025-10-02 17:13:55.100437+00', true);
INSERT INTO public.settings VALUES (77, 'social_facebook_handle', '@floresya', 'Handle de Facebook', 'string', true, '2025-10-02 17:13:55.220692+00', '2025-10-02 17:13:55.220692+00', true);
INSERT INTO public.settings VALUES (78, 'social_instagram_url', 'https://instagram.com/floresya_ve', 'URL de Instagram', 'string', true, '2025-10-02 17:13:55.334223+00', '2025-10-02 17:13:55.334223+00', true);
INSERT INTO public.settings VALUES (79, 'social_instagram_handle', '@floresya_ve', 'Handle de Instagram', 'string', true, '2025-10-02 17:13:55.460812+00', '2025-10-02 17:13:55.460812+00', true);
INSERT INTO public.settings VALUES (80, 'social_tiktok_url', 'https://tiktok.com/@floresya', 'URL de TikTok', 'string', true, '2025-10-02 17:13:55.611523+00', '2025-10-02 17:13:55.611523+00', true);
INSERT INTO public.settings VALUES (81, 'social_tiktok_handle', '@floresya', 'Handle de TikTok', 'string', true, '2025-10-02 17:13:55.732401+00', '2025-10-02 17:13:55.732401+00', true);
INSERT INTO public.settings VALUES (1, 'DELIVERY_COST_USD', '7.00', 'Costo de envío a domicilio en USD', 'string', true, '2025-10-02 12:26:30.686+00', '2025-10-02 12:26:30.687+00', true);
INSERT INTO public.settings VALUES (85, 'bcv_usd_rate', '40.00', 'Tasa de cambio BCV (USD a VES) actualizada diariamente', 'string', true, '2025-10-06 17:15:21.255959+00', '2025-10-06 17:15:21.255959+00', true);


--
-- TOC entry 4395 (class 0 OID 32002)
-- Dependencies: 381
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (34, 'test-orders-1760553902211@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:02.392663+00', '2025-10-15 18:45:02.392663+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (33, 'test-orders-1760553902253@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:02.38253+00', '2025-10-15 18:45:02.38253+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (35, 'test-orders-1760553902263@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:02.428867+00', '2025-10-15 18:45:02.428867+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (72, 'guest-1760619324732@example.com', NULL, 'Guest User Test', '+58 412 999 8888', 'admin', false, false, '2025-10-16 12:55:25.080665+00', '2025-10-16 12:55:25.080665+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (71, 'guest-1760619317589@example.com', NULL, 'Guest User Test', '+58 412 999 8888', 'user', true, true, '2025-10-16 12:55:18.327983+00', '2025-10-16 12:55:18.327983+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (5, 'carlos.rodriguez@yahoo.com', NULL, 'Carlos Rodríguez', '+58 412 987 6543', 'user', true, true, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (36, 'test-orders-1760553903030@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:03.100856+00', '2025-10-15 18:45:03.100856+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (38, 'test-orders-1760553903373@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:03.457338+00', '2025-10-15 18:45:03.457338+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (37, 'test-orders-1760553903356@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:03.421312+00', '2025-10-15 18:45:03.421312+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (6, 'ana.perez@hotmail.com', NULL, 'Ana Pérez', '+58 424 555 0123', 'user', true, true, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (7, 'luis.martinez@gmail.com', NULL, 'Luis Martínez', '+58 416 789 0123', 'user', false, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (39, 'test-orders-1760553904133@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:04.198544+00', '2025-10-15 18:45:04.198544+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (40, 'test-orders-1760553904316@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:04.369304+00', '2025-10-15 18:45:04.369304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (41, 'test-orders-1760553904368@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:04.42565+00', '2025-10-15 18:45:04.42565+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (4, 'maria.gonzalez@gmail.com', NULL, 'María González', '+58 414 123 4567', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (42, 'test-orders-1760553905107@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:05.164343+00', '2025-10-15 18:45:05.164343+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (43, 'test-orders-1760553905288@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:05.346667+00', '2025-10-15 18:45:05.346667+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (44, 'test-orders-1760553905350@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:05.403492+00', '2025-10-15 18:45:05.403492+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (45, 'test-orders-1760553906256@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:06.297304+00', '2025-10-15 18:45:06.297304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (46, 'test-orders-1760553906245@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:06.318748+00', '2025-10-15 18:45:06.318748+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (47, 'test-orders-1760553907128@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:07.220504+00', '2025-10-15 18:45:07.220504+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (48, 'test-orders-1760553907310@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:07.351077+00', '2025-10-15 18:45:07.351077+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (50, 'test-orders-1760553917434@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:17.576666+00', '2025-10-15 18:45:17.576666+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (49, 'test-orders-1760553917423@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:17.573609+00', '2025-10-15 18:45:17.573609+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (51, 'test-orders-1760553917445@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:17.606204+00', '2025-10-15 18:45:17.606204+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (52, 'test-orders-1760553918574@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:18.617759+00', '2025-10-15 18:45:18.617759+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (53, 'test-orders-1760553918570@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:18.637599+00', '2025-10-15 18:45:18.637599+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (54, 'test-orders-1760553918859@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:18.890186+00', '2025-10-15 18:45:18.890186+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (55, 'test-orders-1760553919706@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:19.770121+00', '2025-10-15 18:45:19.770121+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (56, 'test-orders-1760553919742@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:19.797973+00', '2025-10-15 18:45:19.797973+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (57, 'test-orders-1760553920115@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:20.184079+00', '2025-10-15 18:45:20.184079+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (58, 'test-orders-1760553920720@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:20.768151+00', '2025-10-15 18:45:20.768151+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (59, 'test-orders-1760553920816@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:20.880706+00', '2025-10-15 18:45:20.880706+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (60, 'test-orders-1760553921181@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:21.242344+00', '2025-10-15 18:45:21.242344+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (61, 'test-orders-1760553921718@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:21.761179+00', '2025-10-15 18:45:21.761179+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (62, 'test-orders-1760553921824@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:21.912563+00', '2025-10-15 18:45:21.912563+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (63, 'test-orders-1760553922595@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:22.648212+00', '2025-10-15 18:45:22.648212+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (64, 'test-orders-1760553922929@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-15 18:45:23.195487+00', '2025-10-15 18:45:23.195487+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (65, 'test-payment-1760553924234@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-15 18:45:24.303688+00', '2025-10-15 18:45:24.303688+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (67, 'test-payment-1760553924588@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-15 18:45:24.632475+00', '2025-10-15 18:45:24.632475+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (66, 'test-payment-1760553924387@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-15 18:45:24.626543+00', '2025-10-15 18:45:24.626543+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (68, 'test-payment-1760553925182@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-15 18:45:25.245616+00', '2025-10-15 18:45:25.245616+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (3, 'admin@floresya.com', NULL, 'Admin Updated Name', '+58 412 111 2222', 'admin', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (69, 'test-payment-1760553925466@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-15 18:45:25.50811+00', '2025-10-15 18:45:25.50811+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (74, 'test@example.com', NULL, 'Test User Updated', '+58 414 888 8888', 'admin', true, false, '2025-10-18 00:46:08.69313+00', '2025-10-18 00:46:08.69313+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (198, 'testuser1760835296862@example.com', 'testpassword123', 'Test User 1760835296862', '+56935296862', 'user', false, false, '2025-10-19 00:54:57.786476+00', '2025-10-19 00:54:57.786476+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (200, 'testuser1760835298158@example.com', 'testpassword123', 'Test User 1760835298158', '+56935298158', 'user', false, false, '2025-10-19 00:54:58.290863+00', '2025-10-19 00:54:58.290863+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (202, 'testuser1760835298749@example.com', 'testpassword123', 'Test User 1760835298749', '+56935298749', 'user', false, false, '2025-10-19 00:54:58.877807+00', '2025-10-19 00:54:58.877807+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (205, 'testuser1760835299352@example.com', 'testpassword123', 'Test User 1760835299352', '+56935299352', 'user', false, false, '2025-10-19 00:54:59.486824+00', '2025-10-19 00:54:59.486824+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (210, 'testuser1760835300645@example.com', 'testpassword123', 'Test User 1760835300645', '+56935300645', 'user', false, false, '2025-10-19 00:55:00.795204+00', '2025-10-19 00:55:00.795204+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (212, 'testuser1760835301077@example.com', 'testpassword123', 'Test User 1760835301077', '+56935301077', 'user', false, false, '2025-10-19 00:55:01.20653+00', '2025-10-19 00:55:01.20653+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (211, 'testuser1760835300694@example.com', 'testpassword123', 'Test User 1760835300694', '+56935300694', 'user', false, false, '2025-10-19 00:55:00.833617+00', '2025-10-19 00:55:00.833617+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (215, 'testuser1760835301756@example.com', 'testpassword123', 'Test User 1760835301756', '+56935301756', 'user', false, false, '2025-10-19 00:55:01.9012+00', '2025-10-19 00:55:01.9012+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (216, 'testuser1760835302130@example.com', 'testpassword123', 'Test User 1760835302130', '+56935302130', 'user', false, false, '2025-10-19 00:55:02.260271+00', '2025-10-19 00:55:02.260271+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (221, 'testuser1760835303021@example.com', 'testpassword123', 'Test User 1760835303021', '+56935303021', 'user', false, false, '2025-10-19 00:55:03.148705+00', '2025-10-19 00:55:03.148705+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (220, 'testuser1760835302751@example.com', 'testpassword123', 'Test User 1760835302751', '+56935302751', 'user', false, false, '2025-10-19 00:55:02.886522+00', '2025-10-19 00:55:02.886522+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (222, 'testuser1760835303308@example.com', 'testpassword123', 'Test User 1760835303308', '+56935303308', 'user', false, false, '2025-10-19 00:55:03.432132+00', '2025-10-19 00:55:03.432132+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (224, 'testuser1760835303619@example.com', 'testpassword123', 'Test User 1760835303619', '+56935303619', 'user', false, false, '2025-10-19 00:55:03.766052+00', '2025-10-19 00:55:03.766052+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (225, 'testuser1760835303938@example.com', 'testpassword123', 'Test User 1760835303938', '+56935303938', 'user', false, false, '2025-10-19 00:55:04.064194+00', '2025-10-19 00:55:04.064194+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (227, 'testuser1760835304211@example.com', 'testpassword123', 'Test User 1760835304211', '+56935304211', 'user', false, false, '2025-10-19 00:55:04.345044+00', '2025-10-19 00:55:04.345044+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (226, 'testuser1760835303990@example.com', 'testpassword123', 'Test User 1760835303990', '+56935303990', 'user', false, false, '2025-10-19 00:55:04.138882+00', '2025-10-19 00:55:04.138882+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (228, 'testuser1760835304514@example.com', 'testpassword123', 'Test User 1760835304514', '+56935304514', 'user', false, false, '2025-10-19 00:55:04.637909+00', '2025-10-19 00:55:04.637909+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (229, 'testuser1760835304580@example.com', 'testpassword123', 'Test User 1760835304580', '+56935304580', 'user', false, false, '2025-10-19 00:55:04.718285+00', '2025-10-19 00:55:04.718285+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (231, 'testuser1760835305144@example.com', 'testpassword123', 'Test User 1760835305144', '+56935305144', 'user', false, false, '2025-10-19 00:55:05.27409+00', '2025-10-19 00:55:05.27409+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (233, 'testuser1760835305480@example.com', 'testpassword123', 'Test User 1760835305480', '+56935305480', 'user', false, false, '2025-10-19 00:55:05.609654+00', '2025-10-19 00:55:05.609654+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (235, 'testuser1760835305764@example.com', 'testpassword123', 'Test User 1760835305764', '+56935305764', 'user', false, false, '2025-10-19 00:55:05.900519+00', '2025-10-19 00:55:05.900519+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (236, 'testuser1760835306053@example.com', 'testpassword123', 'Test User 1760835306053', '+56935306053', 'user', false, false, '2025-10-19 00:55:06.196552+00', '2025-10-19 00:55:06.196552+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (238, 'testuser1760835306367@example.com', 'testpassword123', 'Test User 1760835306367', '+56935306367', 'user', false, false, '2025-10-19 00:55:06.492945+00', '2025-10-19 00:55:06.492945+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (237, 'testuser1760835306313@example.com', 'testpassword123', 'Test User 1760835306313', '+56935306313', 'user', false, false, '2025-10-19 00:55:06.450734+00', '2025-10-19 00:55:06.450734+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (239, 'testuser1760835306651@example.com', 'testpassword123', 'Test User 1760835306651', '+56935306651', 'user', false, false, '2025-10-19 00:55:06.787587+00', '2025-10-19 00:55:06.787587+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (241, 'testuser1760835306946@example.com', 'testpassword123', 'Test User 1760835306946', '+56935306946', 'user', false, false, '2025-10-19 00:55:07.088061+00', '2025-10-19 00:55:07.088061+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (240, 'testuser1760835306888@example.com', 'testpassword123', 'Test User 1760835306888', '+56935306888', 'user', false, false, '2025-10-19 00:55:07.017544+00', '2025-10-19 00:55:07.017544+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (243, 'testuser1760835307527@example.com', 'testpassword123', 'Test User 1760835307527', '+56935307527', 'user', false, false, '2025-10-19 00:55:07.65021+00', '2025-10-19 00:55:07.65021+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (244, 'testuser1760835307532@example.com', 'testpassword123', 'Test User 1760835307532', '+56935307532', 'user', false, false, '2025-10-19 00:55:07.656376+00', '2025-10-19 00:55:07.656376+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (245, 'testuser1760835308132@example.com', 'testpassword123', 'Test User 1760835308132', '+56935308132', 'user', false, false, '2025-10-19 00:55:08.264772+00', '2025-10-19 00:55:08.264772+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (246, 'testuser1760835308778@example.com', 'testpassword123', 'Test User 1760835308778', '+56935308778', 'user', false, false, '2025-10-19 00:55:08.944803+00', '2025-10-19 00:55:08.944803+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (247, 'testuser1760835309444@example.com', 'testpassword123', 'Test User 1760835309444', '+56935309444', 'user', false, false, '2025-10-19 00:55:09.592586+00', '2025-10-19 00:55:09.592586+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (248, 'testuser1760835310105@example.com', 'testpassword123', 'Test User 1760835310105', '+56935310105', 'user', false, false, '2025-10-19 00:55:10.26779+00', '2025-10-19 00:55:10.26779+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (258, 'testuser1760835546453@example.com', 'testpassword123', 'Test User 1760835546453', '+56935546453', 'user', false, false, '2025-10-19 00:59:07.207836+00', '2025-10-19 00:59:07.207836+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (70, 'test-payment-1760553925533@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-15 18:45:25.65313+00', '2025-10-15 18:45:25.65313+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (73, 'test-inactive@test.com', NULL, 'Test Inactive User', '+584121234567', 'user', false, false, '2025-10-18 00:08:57.596525+00', '2025-10-18 00:08:57.596525+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (819, 'testuser1760999783031@example.com', 'testpassword123', 'Test User 1760999783031', '+56999783031', 'user', false, false, '2025-10-20 22:36:23.138028+00', '2025-10-20 22:36:23.138028+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (199, 'testuser1760835296872@example.com', 'testpassword123', 'Test User 1760835296872', '+56935296872', 'user', false, false, '2025-10-19 00:54:58.244015+00', '2025-10-19 00:54:58.244015+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (259, 'testuser1760835547376@example.com', 'testpassword123', 'Test User 1760835547376', '+56935547376', 'user', false, false, '2025-10-19 00:59:07.525534+00', '2025-10-19 00:59:07.525534+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (261, 'testuser1760835547704@example.com', 'testpassword123', 'Test User 1760835547704', '+56935547704', 'user', false, false, '2025-10-19 00:59:07.842647+00', '2025-10-19 00:59:07.842647+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (260, 'testuser1760835546447@example.com', 'testpassword123', 'Test User 1760835546447', '+56935546447', 'user', false, false, '2025-10-19 00:59:07.679018+00', '2025-10-19 00:59:07.679018+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (262, 'testuser1760835548012@example.com', 'testpassword123', 'Test User 1760835548012', '+56935548012', 'user', false, false, '2025-10-19 00:59:08.154111+00', '2025-10-19 00:59:08.154111+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (264, 'testuser1760835548309@example.com', 'testpassword123', 'Test User 1760835548309', '+56935548309', 'user', false, false, '2025-10-19 00:59:08.438835+00', '2025-10-19 00:59:08.438835+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (263, 'testuser1760835548177@example.com', 'testpassword123', 'Test User 1760835548177', '+56935548177', 'user', false, false, '2025-10-19 00:59:08.297489+00', '2025-10-19 00:59:08.297489+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (265, 'testuser1760835548593@example.com', 'testpassword123', 'Test User 1760835548593', '+56935548593', 'user', false, false, '2025-10-19 00:59:08.737134+00', '2025-10-19 00:59:08.737134+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (201, 'testuser1760835298459@example.com', 'testpassword123', 'Test User 1760835298459', '+56935298459', 'user', false, false, '2025-10-19 00:54:58.583301+00', '2025-10-19 00:54:58.583301+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (266, 'testuser1760835548740@example.com', 'testpassword123', 'Test User 1760835548740', '+56935548740', 'user', false, false, '2025-10-19 00:59:08.878492+00', '2025-10-19 00:59:08.878492+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (203, 'testuser1760835298744@example.com', 'testpassword123', 'Test User 1760835298744', '+56935298744', 'user', false, false, '2025-10-19 00:54:58.890178+00', '2025-10-19 00:54:58.890178+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (204, 'testuser1760835299061@example.com', 'testpassword123', 'Test User 1760835299061', '+56935299061', 'user', false, false, '2025-10-19 00:54:59.196555+00', '2025-10-19 00:54:59.196555+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (206, 'testuser1760835299359@example.com', 'testpassword123', 'Test User 1760835299359', '+56935299359', 'user', false, false, '2025-10-19 00:54:59.498912+00', '2025-10-19 00:54:59.498912+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (207, 'testuser1760835299662@example.com', 'testpassword123', 'Test User 1760835299662', '+56935299662', 'user', false, false, '2025-10-19 00:54:59.796678+00', '2025-10-19 00:54:59.796678+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (208, 'testuser1760835300333@example.com', 'testpassword123', 'Test User 1760835300333', '+56935300333', 'user', false, false, '2025-10-19 00:55:00.457696+00', '2025-10-19 00:55:00.457696+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (213, 'testuser1760835301390@example.com', 'testpassword123', 'Test User 1760835301390', '+56935301390', 'user', false, false, '2025-10-19 00:55:01.535784+00', '2025-10-19 00:55:01.535784+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (214, 'testuser1760835301450@example.com', 'testpassword123', 'Test User 1760835301450', '+56935301450', 'user', false, false, '2025-10-19 00:55:01.584392+00', '2025-10-19 00:55:01.584392+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (218, 'testuser1760835302433@example.com', 'testpassword123', 'Test User 1760835302433', '+56935302433', 'user', false, false, '2025-10-19 00:55:02.568671+00', '2025-10-19 00:55:02.568671+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (217, 'testuser1760835302138@example.com', 'testpassword123', 'Test User 1760835302138', '+56935302138', 'user', false, false, '2025-10-19 00:55:02.279087+00', '2025-10-19 00:55:02.279087+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (219, 'testuser1760835302724@example.com', 'testpassword123', 'Test User 1760835302724', '+56935302724', 'user', false, false, '2025-10-19 00:55:02.860441+00', '2025-10-19 00:55:02.860441+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (223, 'testuser1760835303375@example.com', 'testpassword123', 'Test User 1760835303375', '+56935303375', 'user', false, false, '2025-10-19 00:55:03.524418+00', '2025-10-19 00:55:03.524418+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (230, 'testuser1760835304864@example.com', 'testpassword123', 'Test User 1760835304864', '+56935304864', 'user', false, false, '2025-10-19 00:55:05.050017+00', '2025-10-19 00:55:05.050017+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (232, 'testuser1760835305213@example.com', 'testpassword123', 'Test User 1760835305213', '+56935305213', 'user', false, false, '2025-10-19 00:55:05.334401+00', '2025-10-19 00:55:05.334401+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (234, 'testuser1760835305722@example.com', 'testpassword123', 'Test User 1760835305722', '+56935305722', 'user', false, false, '2025-10-19 00:55:05.86427+00', '2025-10-19 00:55:05.86427+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (242, 'testuser1760835307236@example.com', 'testpassword123', 'Test User 1760835307236', '+56935307236', 'user', false, false, '2025-10-19 00:55:07.359153+00', '2025-10-19 00:55:07.359153+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (249, 'testuser1760835310678@example.com', 'testpassword123', 'Test User 1760835310678', '+56935310678', 'user', false, false, '2025-10-19 00:55:10.80415+00', '2025-10-19 00:55:10.80415+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (250, 'testuser1760835311204@example.com', 'testpassword123', 'Test User 1760835311204', '+56935311204', 'user', false, false, '2025-10-19 00:55:11.336126+00', '2025-10-19 00:55:11.336126+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (251, 'testuser1760835311770@example.com', 'testpassword123', 'Test User 1760835311770', '+56935311770', 'user', false, false, '2025-10-19 00:55:11.899499+00', '2025-10-19 00:55:11.899499+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (252, 'testuser1760835312381@example.com', 'testpassword123', 'Test User 1760835312381', '+56935312381', 'user', false, false, '2025-10-19 00:55:12.52346+00', '2025-10-19 00:55:12.52346+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (253, 'testuser1760835313076@example.com', 'testpassword123', 'Test User 1760835313076', '+56935313076', 'user', false, false, '2025-10-19 00:55:13.199008+00', '2025-10-19 00:55:13.199008+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (254, 'testuser1760835313686@example.com', 'testpassword123', 'Test User 1760835313686', '+56935313686', 'user', false, false, '2025-10-19 00:55:13.855389+00', '2025-10-19 00:55:13.855389+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (255, 'testuser1760835314341@example.com', 'testpassword123', 'Test User 1760835314341', '+56935314341', 'user', false, false, '2025-10-19 00:55:14.474455+00', '2025-10-19 00:55:14.474455+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (256, 'testuser1760835314923@example.com', 'testpassword123', 'Test User 1760835314923', '+56935314923', 'user', false, false, '2025-10-19 00:55:15.05294+00', '2025-10-19 00:55:15.05294+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (257, 'testuser1760835315464@example.com', 'testpassword123', 'Test User 1760835315464', '+56935315464', 'user', false, false, '2025-10-19 00:55:15.58154+00', '2025-10-19 00:55:15.58154+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (461, 'testuser1760964124117@example.com', 'testpassword123', 'Test User 1760964124117', '+56964124117', 'user', false, false, '2025-10-20 12:42:04.685909+00', '2025-10-20 12:42:04.685909+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (267, 'testuser1760835548883@example.com', 'testpassword123', 'Test User 1760835548883', '+56935548883', 'user', false, false, '2025-10-19 00:59:09.001159+00', '2025-10-19 00:59:09.001159+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (641, 'testuser1760971577476@example.com', 'testpassword123', 'Test User 1760971577476', '+56971577476', 'user', false, false, '2025-10-20 14:46:18.639825+00', '2025-10-20 14:46:18.639825+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (272, 'testuser1760835549851@example.com', 'testpassword123', 'Test User 1760835549851', '+56935549851', 'user', false, false, '2025-10-19 00:59:09.984312+00', '2025-10-19 00:59:09.984312+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (472, 'testuser1760964127656@example.com', 'testpassword123', 'Test User 1760964127656', '+56964127656', 'user', false, false, '2025-10-20 12:42:07.749035+00', '2025-10-20 12:42:07.749035+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (277, 'testuser1760835550843@example.com', 'testpassword123', 'Test User 1760835550843', '+56935550843', 'user', false, false, '2025-10-19 00:59:10.970122+00', '2025-10-19 00:59:10.970122+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (281, 'testuser1760835551602@example.com', 'testpassword123', 'Test User 1760835551602', '+56935551602', 'user', false, false, '2025-10-19 00:59:11.744788+00', '2025-10-19 00:59:11.744788+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (478, 'testuser1760964128816@example.com', 'testpassword123', 'Test User 1760964128816', '+56964128816', 'user', false, false, '2025-10-20 12:42:08.903548+00', '2025-10-20 12:42:08.903548+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (283, 'testuser1760835552042@example.com', 'testpassword123', 'Test User 1760835552042', '+56935552042', 'user', false, false, '2025-10-19 00:59:12.162428+00', '2025-10-19 00:59:12.162428+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (481, 'testuser1760964129390@example.com', 'testpassword123', 'Test User 1760964129390', '+56964129390', 'user', false, false, '2025-10-20 12:42:09.469567+00', '2025-10-20 12:42:09.469567+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (285, 'testuser1760835552303@example.com', 'testpassword123', 'Test User 1760835552303', '+56935552303', 'user', false, false, '2025-10-19 00:59:12.437564+00', '2025-10-19 00:59:12.437564+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (284, 'testuser1760835552160@example.com', 'testpassword123', 'Test User 1760835552160', '+56935552160', 'user', false, false, '2025-10-19 00:59:12.28185+00', '2025-10-19 00:59:12.28185+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (286, 'testuser1760835552672@example.com', 'testpassword123', 'Test User 1760835552672', '+56935552672', 'user', false, false, '2025-10-19 00:59:12.808317+00', '2025-10-19 00:59:12.808317+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (292, 'testuser1760835553809@example.com', 'testpassword123', 'Test User 1760835553809', '+56935553809', 'user', false, false, '2025-10-19 00:59:13.951687+00', '2025-10-19 00:59:13.951687+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (491, 'testuser1760964131314@example.com', 'testpassword123', 'Test User 1760964131314', '+56964131314', 'user', false, false, '2025-10-20 12:42:11.41702+00', '2025-10-20 12:42:11.41702+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (293, 'testuser1760835554137@example.com', 'testpassword123', 'Test User 1760835554137', '+56935554137', 'user', false, false, '2025-10-19 00:59:14.256492+00', '2025-10-19 00:59:14.256492+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (490, 'testuser1760964131081@example.com', 'testpassword123', 'Test User 1760964131081', '+56964131081', 'user', false, false, '2025-10-20 12:42:11.16337+00', '2025-10-20 12:42:11.16337+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (296, 'testuser1760835554705@example.com', 'testpassword123', 'Test User 1760835554705', '+56935554705', 'user', false, false, '2025-10-19 00:59:14.82879+00', '2025-10-19 00:59:14.82879+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (297, 'testuser1760835554862@example.com', 'testpassword123', 'Test User 1760835554862', '+56935554862', 'user', false, false, '2025-10-19 00:59:14.992943+00', '2025-10-19 00:59:14.992943+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (492, 'testuser1760964131620@example.com', 'testpassword123', 'Test User 1760964131620', '+56964131620', 'user', false, false, '2025-10-20 12:42:11.699514+00', '2025-10-20 12:42:11.699514+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (300, 'testuser1760835555439@example.com', 'testpassword123', 'Test User 1760835555439', '+56935555439', 'user', false, false, '2025-10-19 00:59:15.574575+00', '2025-10-19 00:59:15.574575+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (302, 'testuser1760835555830@example.com', 'testpassword123', 'Test User 1760835555830', '+56935555830', 'user', false, false, '2025-10-19 00:59:15.990649+00', '2025-10-19 00:59:15.990649+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (494, 'testuser1760964131897@example.com', 'testpassword123', 'Test User 1760964131897', '+56964131897', 'user', false, false, '2025-10-20 12:42:11.973826+00', '2025-10-20 12:42:11.973826+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (308, 'testuser1760835558358@example.com', 'testpassword123', 'Test User 1760835558358', '+56935558358', 'user', false, false, '2025-10-19 00:59:18.503519+00', '2025-10-19 00:59:18.503519+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (310, 'testuser1760835559538@example.com', 'testpassword123', 'Test User 1760835559538', '+56935559538', 'user', false, false, '2025-10-19 00:59:19.668639+00', '2025-10-19 00:59:19.668639+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (495, 'testuser1760964132188@example.com', 'testpassword123', 'Test User 1760964132188', '+56964132188', 'user', false, false, '2025-10-20 12:42:12.272119+00', '2025-10-20 12:42:12.272119+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (312, 'testuser1760835560725@example.com', 'testpassword123', 'Test User 1760835560725', '+56935560725', 'user', false, false, '2025-10-19 00:59:20.87431+00', '2025-10-19 00:59:20.87431+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (315, 'testuser1760835562575@example.com', 'testpassword123', 'Test User 1760835562575', '+56935562575', 'user', false, false, '2025-10-19 00:59:22.708457+00', '2025-10-19 00:59:22.708457+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (497, 'testuser1760964132459@example.com', 'testpassword123', 'Test User 1760964132459', '+56964132459', 'user', false, false, '2025-10-20 12:42:12.562364+00', '2025-10-20 12:42:12.562364+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (498, 'testuser1760964132745@example.com', 'testpassword123', 'Test User 1760964132745', '+56964132745', 'user', false, false, '2025-10-20 12:42:12.830352+00', '2025-10-20 12:42:12.830352+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (500, 'testuser1760964133008@example.com', 'testpassword123', 'Test User 1760964133008', '+56964133008', 'user', false, false, '2025-10-20 12:42:13.109928+00', '2025-10-20 12:42:13.109928+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (505, 'testuser1760964133902@example.com', 'testpassword123', 'Test User 1760964133902', '+56964133902', 'user', false, false, '2025-10-20 12:42:13.98694+00', '2025-10-20 12:42:13.98694+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (507, 'testuser1760964134446@example.com', 'testpassword123', 'Test User 1760964134446', '+56964134446', 'user', false, false, '2025-10-20 12:42:14.525061+00', '2025-10-20 12:42:14.525061+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (511, 'testuser1760964136855@example.com', 'testpassword123', 'Test User 1760964136855', '+56964136855', 'user', false, false, '2025-10-20 12:42:16.946814+00', '2025-10-20 12:42:16.946814+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (516, 'testuser1760964140032@example.com', 'testpassword123', 'Test User 1760964140032', '+56964140032', 'user', false, false, '2025-10-20 12:42:20.120751+00', '2025-10-20 12:42:20.120751+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (557, 'testuser1760966177010@example.com', 'testpassword123', 'Test User 1760966177010', '+56966177010', 'user', false, false, '2025-10-20 13:16:17.100374+00', '2025-10-20 13:16:17.100374+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (558, 'testuser1760966177545@example.com', 'testpassword123', 'Test User 1760966177545', '+56966177545', 'user', false, false, '2025-10-20 13:16:17.6096+00', '2025-10-20 13:16:17.6096+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (559, 'testuser1760966177544@example.com', 'testpassword123', 'Test User 1760966177544', '+56966177544', 'user', false, false, '2025-10-20 13:16:17.614676+00', '2025-10-20 13:16:17.614676+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (268, 'testuser1760835549178@example.com', 'testpassword123', 'Test User 1760835549178', '+56935549178', 'user', false, false, '2025-10-19 00:59:09.303144+00', '2025-10-19 00:59:09.303144+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (462, 'testuser1760964125141@example.com', 'testpassword123', 'Test User 1760964125141', '+56964125141', 'user', false, false, '2025-10-20 12:42:05.291537+00', '2025-10-20 12:42:05.291537+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (270, 'testuser1760835549467@example.com', 'testpassword123', 'Test User 1760835549467', '+56935549467', 'user', false, false, '2025-10-19 00:59:09.590433+00', '2025-10-19 00:59:09.590433+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (883, 'testuser1761314656393@example.com', 'testpassword123', 'Test User 1761314656393', '+56914656393', 'user', true, false, '2025-10-24 14:04:17.77059+00', '2025-10-24 14:04:17.77059+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (271, 'testuser1760835549745@example.com', 'testpassword123', 'Test User 1760835549745', '+56935549745', 'user', false, false, '2025-10-19 00:59:09.870226+00', '2025-10-19 00:59:09.870226+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (470, 'testuser1760964127355@example.com', 'testpassword123', 'Test User 1760964127355', '+56964127355', 'user', false, false, '2025-10-20 12:42:07.442358+00', '2025-10-20 12:42:07.442358+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (278, 'testuser1760835551003@example.com', 'testpassword123', 'Test User 1760835551003', '+56935551003', 'user', false, false, '2025-10-19 00:59:11.137146+00', '2025-10-19 00:59:11.137146+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (280, 'testuser1760835551463@example.com', 'testpassword123', 'Test User 1760835551463', '+56935551463', 'user', false, false, '2025-10-19 00:59:11.610848+00', '2025-10-19 00:59:11.610848+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (477, 'testuser1760964128801@example.com', 'testpassword123', 'Test User 1760964128801', '+56964128801', 'user', false, false, '2025-10-20 12:42:08.892527+00', '2025-10-20 12:42:08.892527+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (288, 'testuser1760835553075@example.com', 'testpassword123', 'Test User 1760835553075', '+56935553075', 'user', false, false, '2025-10-19 00:59:13.217605+00', '2025-10-19 00:59:13.217605+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (289, 'testuser1760835553239@example.com', 'testpassword123', 'Test User 1760835553239', '+56935553239', 'user', false, false, '2025-10-19 00:59:13.382478+00', '2025-10-19 00:59:13.382478+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (479, 'testuser1760964129062@example.com', 'testpassword123', 'Test User 1760964129062', '+56964129062', 'user', false, false, '2025-10-20 12:42:09.155594+00', '2025-10-20 12:42:09.155594+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (291, 'testuser1760835553808@example.com', 'testpassword123', 'Test User 1760835553808', '+56935553808', 'user', false, false, '2025-10-19 00:59:13.94618+00', '2025-10-19 00:59:13.94618+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (294, 'testuser1760835554335@example.com', 'testpassword123', 'Test User 1760835554335', '+56935554335', 'user', false, false, '2025-10-19 00:59:14.456415+00', '2025-10-19 00:59:14.456415+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (485, 'testuser1760964130150@example.com', 'testpassword123', 'Test User 1760964130150', '+56964130150', 'user', false, false, '2025-10-20 12:42:10.257839+00', '2025-10-20 12:42:10.257839+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (298, 'testuser1760835554963@example.com', 'testpassword123', 'Test User 1760835554963', '+56935554963', 'user', false, false, '2025-10-19 00:59:15.084119+00', '2025-10-19 00:59:15.084119+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (301, 'testuser1760835555549@example.com', 'testpassword123', 'Test User 1760835555549', '+56935555549', 'user', false, false, '2025-10-19 00:59:15.668001+00', '2025-10-19 00:59:15.668001+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (488, 'testuser1760964130759@example.com', 'testpassword123', 'Test User 1760964130759', '+56964130759', 'user', false, false, '2025-10-20 12:42:10.863201+00', '2025-10-20 12:42:10.863201+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (304, 'testuser1760835556196@example.com', 'testpassword123', 'Test User 1760835556196', '+56935556196', 'user', false, false, '2025-10-19 00:59:16.341625+00', '2025-10-19 00:59:16.341625+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (303, 'testuser1760835555989@example.com', 'testpassword123', 'Test User 1760835555989', '+56935555989', 'user', false, false, '2025-10-19 00:59:16.117497+00', '2025-10-19 00:59:16.117497+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (502, 'testuser1760964133362@example.com', 'testpassword123', 'Test User 1760964133362', '+56964133362', 'user', false, false, '2025-10-20 12:42:13.44485+00', '2025-10-20 12:42:13.44485+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (307, 'testuser1760835557743@example.com', 'testpassword123', 'Test User 1760835557743', '+56935557743', 'user', false, false, '2025-10-19 00:59:17.867222+00', '2025-10-19 00:59:17.867222+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (313, 'testuser1760835561375@example.com', 'testpassword123', 'Test User 1760835561375', '+56935561375', 'user', false, false, '2025-10-19 00:59:21.526599+00', '2025-10-19 00:59:21.526599+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (504, 'testuser1760964133886@example.com', 'testpassword123', 'Test User 1760964133886', '+56964133886', 'user', false, false, '2025-10-20 12:42:13.975607+00', '2025-10-20 12:42:13.975607+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (509, 'testuser1760964135576@example.com', 'testpassword123', 'Test User 1760964135576', '+56964135576', 'user', false, false, '2025-10-20 12:42:15.678896+00', '2025-10-20 12:42:15.678896+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (517, 'testuser1760964140627@example.com', 'testpassword123', 'Test User 1760964140627', '+56964140627', 'user', false, false, '2025-10-20 12:42:20.719549+00', '2025-10-20 12:42:20.719549+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (560, 'testuser1760966177829@example.com', 'testpassword123', 'Test User 1760966177829', '+56966177829', 'user', false, false, '2025-10-20 13:16:17.898887+00', '2025-10-20 13:16:17.898887+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (562, 'testuser1760966178138@example.com', 'testpassword123', 'Test User 1760966178138', '+56966178138', 'user', false, false, '2025-10-20 13:16:18.200204+00', '2025-10-20 13:16:18.200204+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (563, 'testuser1760966178607@example.com', 'testpassword123', 'Test User 1760966178607', '+56966178607', 'user', false, false, '2025-10-20 13:16:18.662218+00', '2025-10-20 13:16:18.662218+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (583, 'testuser1760971459731@example.com', 'testpassword123', 'Test User 1760971459731', '+56971459731', 'user', false, false, '2025-10-20 14:44:19.806123+00', '2025-10-20 14:44:19.806123+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (588, 'testuser1760971460701@example.com', 'testpassword123', 'Test User 1760971460701', '+56971460701', 'user', false, false, '2025-10-20 14:44:20.783765+00', '2025-10-20 14:44:20.783765+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (590, 'testuser1760971461026@example.com', 'testpassword123', 'Test User 1760971461026', '+56971461026', 'user', false, false, '2025-10-20 14:44:21.097318+00', '2025-10-20 14:44:21.097318+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (592, 'testuser1760971461542@example.com', 'testpassword123', 'Test User 1760971461542', '+56971461542', 'user', false, false, '2025-10-20 14:44:21.613781+00', '2025-10-20 14:44:21.613781+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (593, 'testuser1760971461625@example.com', 'testpassword123', 'Test User 1760971461625', '+56971461625', 'user', false, false, '2025-10-20 14:44:21.693645+00', '2025-10-20 14:44:21.693645+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (595, 'testuser1760971462102@example.com', 'testpassword123', 'Test User 1760971462102', '+56971462102', 'user', false, false, '2025-10-20 14:44:22.176118+00', '2025-10-20 14:44:22.176118+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (596, 'testuser1760971462178@example.com', 'testpassword123', 'Test User 1760971462178', '+56971462178', 'user', false, false, '2025-10-20 14:44:22.239849+00', '2025-10-20 14:44:22.239849+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (597, 'testuser1760971462516@example.com', 'testpassword123', 'Test User 1760971462516', '+56971462516', 'user', false, false, '2025-10-20 14:44:22.590989+00', '2025-10-20 14:44:22.590989+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (598, 'testuser1760971462897@example.com', 'testpassword123', 'Test User 1760971462897', '+56971462897', 'user', false, false, '2025-10-20 14:44:22.969557+00', '2025-10-20 14:44:22.969557+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (460, 'testuser1760964124116@example.com', 'testpassword123', 'Test User 1760964124116', '+56964124116', 'user', false, false, '2025-10-20 12:42:04.679109+00', '2025-10-20 12:42:04.679109+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (269, 'testuser1760835549304@example.com', 'testpassword123', 'Test User 1760835549304', '+56935549304', 'user', false, false, '2025-10-19 00:59:09.440882+00', '2025-10-19 00:59:09.440882+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (273, 'testuser1760835550017@example.com', 'testpassword123', 'Test User 1760835550017', '+56935550017', 'user', false, false, '2025-10-19 00:59:10.139673+00', '2025-10-19 00:59:10.139673+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (274, 'testuser1760835550278@example.com', 'testpassword123', 'Test User 1760835550278', '+56935550278', 'user', false, false, '2025-10-19 00:59:10.403893+00', '2025-10-19 00:59:10.403893+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (276, 'testuser1760835550558@example.com', 'testpassword123', 'Test User 1760835550558', '+56935550558', 'user', false, false, '2025-10-19 00:59:10.701277+00', '2025-10-19 00:59:10.701277+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (275, 'testuser1760835550415@example.com', 'testpassword123', 'Test User 1760835550415', '+56935550415', 'user', false, false, '2025-10-19 00:59:10.537713+00', '2025-10-19 00:59:10.537713+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (279, 'testuser1760835551189@example.com', 'testpassword123', 'Test User 1760835551189', '+56935551189', 'user', false, false, '2025-10-19 00:59:11.319996+00', '2025-10-19 00:59:11.319996+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (282, 'testuser1760835551757@example.com', 'testpassword123', 'Test User 1760835551757', '+56935551757', 'user', false, false, '2025-10-19 00:59:11.878385+00', '2025-10-19 00:59:11.878385+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (287, 'testuser1760835552682@example.com', 'testpassword123', 'Test User 1760835552682', '+56935552682', 'user', false, false, '2025-10-19 00:59:12.814997+00', '2025-10-19 00:59:12.814997+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (290, 'testuser1760835553466@example.com', 'testpassword123', 'Test User 1760835553466', '+56935553466', 'user', false, false, '2025-10-19 00:59:13.64483+00', '2025-10-19 00:59:13.64483+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (295, 'testuser1760835554413@example.com', 'testpassword123', 'Test User 1760835554413', '+56935554413', 'user', false, false, '2025-10-19 00:59:14.538486+00', '2025-10-19 00:59:14.538486+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (299, 'testuser1760835555239@example.com', 'testpassword123', 'Test User 1760835555239', '+56935555239', 'user', false, false, '2025-10-19 00:59:15.38179+00', '2025-10-19 00:59:15.38179+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (305, 'testuser1760835556567@example.com', 'testpassword123', 'Test User 1760835556567', '+56935556567', 'user', false, false, '2025-10-19 00:59:16.713969+00', '2025-10-19 00:59:16.713969+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (306, 'testuser1760835557152@example.com', 'testpassword123', 'Test User 1760835557152', '+56935557152', 'user', false, false, '2025-10-19 00:59:17.297022+00', '2025-10-19 00:59:17.297022+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (309, 'testuser1760835558933@example.com', 'testpassword123', 'Test User 1760835558933', '+56935558933', 'user', false, false, '2025-10-19 00:59:19.076437+00', '2025-10-19 00:59:19.076437+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (311, 'testuser1760835560132@example.com', 'testpassword123', 'Test User 1760835560132', '+56935560132', 'user', false, false, '2025-10-19 00:59:20.260577+00', '2025-10-19 00:59:20.260577+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (314, 'testuser1760835561976@example.com', 'testpassword123', 'Test User 1760835561976', '+56935561976', 'user', false, false, '2025-10-19 00:59:22.109686+00', '2025-10-19 00:59:22.109686+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (316, 'testuser1760835563117@example.com', 'testpassword123', 'Test User 1760835563117', '+56935563117', 'user', false, false, '2025-10-19 00:59:23.237355+00', '2025-10-19 00:59:23.237355+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (317, 'testuser1760835563836@example.com', 'testpassword123', 'Test User 1760835563836', '+56935563836', 'user', false, false, '2025-10-19 00:59:23.973566+00', '2025-10-19 00:59:23.973566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (319, 'testuser1760897963349@example.com', 'testpassword123', 'Test User 1760897963349', '+56997963349', 'user', true, false, '2025-10-19 18:19:24.425945+00', '2025-10-19 18:19:24.425945+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (318, 'testuser1760897963350@example.com', 'testpassword123', 'Test User 1760897963350', '+56997963350', 'user', true, false, '2025-10-19 18:19:24.425946+00', '2025-10-19 18:19:24.425946+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (320, 'testuser1760897964847@example.com', 'testpassword123', 'Test User 1760897964847', '+56997964847', 'user', true, false, '2025-10-19 18:19:24.924316+00', '2025-10-19 18:19:24.924316+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (321, 'testuser1760897964982@example.com', 'testpassword123', 'Test User 1760897964982', '+56997964982', 'user', true, false, '2025-10-19 18:19:25.06084+00', '2025-10-19 18:19:25.06084+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (322, 'testuser1760897965136@example.com', 'testpassword123', 'Test User 1760897965136', '+56997965136', 'user', true, false, '2025-10-19 18:19:25.205929+00', '2025-10-19 18:19:25.205929+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (323, 'testuser1760897965453@example.com', 'testpassword123', 'Test User 1760897965453', '+56997965453', 'user', true, false, '2025-10-19 18:19:25.544504+00', '2025-10-19 18:19:25.544504+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (324, 'testuser1760897965440@example.com', 'testpassword123', 'Test User 1760897965440', '+56997965440', 'user', true, false, '2025-10-19 18:19:25.551446+00', '2025-10-19 18:19:25.551446+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (325, 'testuser1760897965748@example.com', 'testpassword123', 'Test User 1760897965748', '+56997965748', 'user', true, false, '2025-10-19 18:19:25.820574+00', '2025-10-19 18:19:25.820574+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (326, 'testuser1760897966038@example.com', 'testpassword123', 'Test User 1760897966038', '+56997966038', 'user', true, false, '2025-10-19 18:19:26.107102+00', '2025-10-19 18:19:26.107102+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (327, 'testuser1760897966012@example.com', 'testpassword123', 'Test User 1760897966012', '+56997966012', 'user', true, false, '2025-10-19 18:19:26.172992+00', '2025-10-19 18:19:26.172992+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (328, 'testuser1760897966325@example.com', 'testpassword123', 'Test User 1760897966325', '+56997966325', 'user', true, false, '2025-10-19 18:19:26.399244+00', '2025-10-19 18:19:26.399244+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (329, 'testuser1760897966596@example.com', 'testpassword123', 'Test User 1760897966596', '+56997966596', 'user', true, false, '2025-10-19 18:19:26.673683+00', '2025-10-19 18:19:26.673683+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (330, 'testuser1760897966627@example.com', 'testpassword123', 'Test User 1760897966627', '+56997966627', 'user', true, false, '2025-10-19 18:19:26.698182+00', '2025-10-19 18:19:26.698182+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (331, 'testuser1760897966888@example.com', 'testpassword123', 'Test User 1760897966888', '+56997966888', 'user', true, false, '2025-10-19 18:19:26.959506+00', '2025-10-19 18:19:26.959506+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (332, 'testuser1760897967026@example.com', 'testpassword123', 'Test User 1760897967026', '+56997967026', 'user', true, false, '2025-10-19 18:19:27.104057+00', '2025-10-19 18:19:27.104057+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (333, 'testuser1760897967161@example.com', 'testpassword123', 'Test User 1760897967161', '+56997967161', 'user', true, false, '2025-10-19 18:19:27.219153+00', '2025-10-19 18:19:27.219153+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (334, 'testuser1760897967439@example.com', 'testpassword123', 'Test User 1760897967439', '+56997967439', 'user', true, false, '2025-10-19 18:19:27.507156+00', '2025-10-19 18:19:27.507156+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (335, 'testuser1760897967485@example.com', 'testpassword123', 'Test User 1760897967485', '+56997967485', 'user', true, false, '2025-10-19 18:19:27.573416+00', '2025-10-19 18:19:27.573416+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (336, 'testuser1760897967713@example.com', 'testpassword123', 'Test User 1760897967713', '+56997967713', 'user', true, false, '2025-10-19 18:19:27.783082+00', '2025-10-19 18:19:27.783082+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (337, 'testuser1760897967921@example.com', 'testpassword123', 'Test User 1760897967921', '+56997967921', 'user', true, false, '2025-10-19 18:19:27.998793+00', '2025-10-19 18:19:27.998793+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (339, 'testuser1760897968305@example.com', 'testpassword123', 'Test User 1760897968305', '+56997968305', 'user', true, false, '2025-10-19 18:19:28.381348+00', '2025-10-19 18:19:28.381348+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (343, 'testuser1760897968851@example.com', 'testpassword123', 'Test User 1760897968851', '+56997968851', 'user', true, false, '2025-10-19 18:19:28.929231+00', '2025-10-19 18:19:28.929231+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (347, 'testuser1760897969563@example.com', 'testpassword123', 'Test User 1760897969563', '+56997969563', 'user', true, false, '2025-10-19 18:19:29.657506+00', '2025-10-19 18:19:29.657506+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (351, 'testuser1760897970313@example.com', 'testpassword123', 'Test User 1760897970313', '+56997970313', 'user', true, false, '2025-10-19 18:19:30.383708+00', '2025-10-19 18:19:30.383708+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (355, 'testuser1760897970871@example.com', 'testpassword123', 'Test User 1760897970871', '+56997970871', 'user', true, false, '2025-10-19 18:19:30.950012+00', '2025-10-19 18:19:30.950012+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (359, 'testuser1760897971738@example.com', 'testpassword123', 'Test User 1760897971738', '+56997971738', 'user', true, false, '2025-10-19 18:19:31.811528+00', '2025-10-19 18:19:31.811528+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (363, 'testuser1760897972332@example.com', 'testpassword123', 'Test User 1760897972332', '+56997972332', 'user', true, false, '2025-10-19 18:19:32.409945+00', '2025-10-19 18:19:32.409945+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (367, 'testuser1760897973060@example.com', 'testpassword123', 'Test User 1760897973060', '+56997973060', 'user', true, false, '2025-10-19 18:19:33.137355+00', '2025-10-19 18:19:33.137355+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (371, 'testuser1760897974489@example.com', 'testpassword123', 'Test User 1760897974489', '+56997974489', 'user', true, false, '2025-10-19 18:19:34.571819+00', '2025-10-19 18:19:34.571819+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (375, 'testuser1760897976263@example.com', 'testpassword123', 'Test User 1760897976263', '+56997976263', 'user', true, false, '2025-10-19 18:19:36.338967+00', '2025-10-19 18:19:36.338967+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (640, 'testuser1760971577477@example.com', 'testpassword123', 'Test User 1760971577477', '+56971577477', 'user', false, false, '2025-10-20 14:46:18.636998+00', '2025-10-20 14:46:18.636998+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (379, 'test-orders-1760898049020@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:49.146677+00', '2025-10-19 18:20:49.146677+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (463, 'testuser1760964125371@example.com', 'testpassword123', 'Test User 1760964125371', '+56964125371', 'user', false, false, '2025-10-20 12:42:05.458116+00', '2025-10-20 12:42:05.458116+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (382, 'test-orders-1760898053097@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:53.388159+00', '2025-10-19 18:20:53.388159+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (385, 'test-orders-1760898056784@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:56.961214+00', '2025-10-19 18:20:56.961214+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (466, 'testuser1760964126100@example.com', 'testpassword123', 'Test User 1760964126100', '+56964126100', 'user', false, false, '2025-10-20 12:42:06.191307+00', '2025-10-20 12:42:06.191307+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (391, 'test-orders-1760898061158@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:21:01.266399+00', '2025-10-19 18:21:01.266399+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (396, 'test-payment-1760898066003@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-19 18:21:06.13126+00', '2025-10-19 18:21:06.13126+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (467, 'testuser1760964126753@example.com', 'testpassword123', 'Test User 1760964126753', '+56964126753', 'user', false, false, '2025-10-20 12:42:06.845815+00', '2025-10-20 12:42:06.845815+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (475, 'testuser1760964128222@example.com', 'testpassword123', 'Test User 1760964128222', '+56964128222', 'user', false, false, '2025-10-20 12:42:08.310767+00', '2025-10-20 12:42:08.310767+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (482, 'testuser1760964129591@example.com', 'testpassword123', 'Test User 1760964129591', '+56964129591', 'user', false, false, '2025-10-20 12:42:09.687339+00', '2025-10-20 12:42:09.687339+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (503, 'testuser1760964133605@example.com', 'testpassword123', 'Test User 1760964133605', '+56964133605', 'user', false, false, '2025-10-20 12:42:13.703386+00', '2025-10-20 12:42:13.703386+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (513, 'testuser1760964138092@example.com', 'testpassword123', 'Test User 1760964138092', '+56964138092', 'user', false, false, '2025-10-20 12:42:18.209558+00', '2025-10-20 12:42:18.209558+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (515, 'testuser1760964139415@example.com', 'testpassword123', 'Test User 1760964139415', '+56964139415', 'user', false, false, '2025-10-20 12:42:19.506523+00', '2025-10-20 12:42:19.506523+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (561, 'testuser1760966178131@example.com', 'testpassword123', 'Test User 1760966178131', '+56966178131', 'user', false, false, '2025-10-20 13:16:18.190672+00', '2025-10-20 13:16:18.190672+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (564, 'testuser1760966178863@example.com', 'testpassword123', 'Test User 1760966178863', '+56966178863', 'user', false, false, '2025-10-20 13:16:18.927278+00', '2025-10-20 13:16:18.927278+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (566, 'testuser1760966179287@example.com', 'testpassword123', 'Test User 1760966179287', '+56966179287', 'user', false, false, '2025-10-20 13:16:19.349585+00', '2025-10-20 13:16:19.349585+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (565, 'testuser1760966178867@example.com', 'testpassword123', 'Test User 1760966178867', '+56966178867', 'user', false, false, '2025-10-20 13:16:18.938157+00', '2025-10-20 13:16:18.938157+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (568, 'testuser1760966180368@example.com', 'testpassword123', 'Test User 1760966180368', '+56966180368', 'user', false, false, '2025-10-20 13:16:20.441014+00', '2025-10-20 13:16:20.441014+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (570, 'testuser1760966181581@example.com', 'testpassword123', 'Test User 1760966181581', '+56966181581', 'user', false, false, '2025-10-20 13:16:21.647642+00', '2025-10-20 13:16:21.647642+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (574, 'testuser1760966183787@example.com', 'testpassword123', 'Test User 1760966183787', '+56966183787', 'user', false, false, '2025-10-20 13:16:23.866616+00', '2025-10-20 13:16:23.866616+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (576, 'testuser1760966184949@example.com', 'testpassword123', 'Test User 1760966184949', '+56966184949', 'user', false, false, '2025-10-20 13:16:25.01794+00', '2025-10-20 13:16:25.01794+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (577, 'testuser1760966185572@example.com', 'testpassword123', 'Test User 1760966185572', '+56966185572', 'user', false, false, '2025-10-20 13:16:25.631098+00', '2025-10-20 13:16:25.631098+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (586, 'testuser1760971460420@example.com', 'testpassword123', 'Test User 1760971460420', '+56971460420', 'user', false, false, '2025-10-20 14:44:20.494766+00', '2025-10-20 14:44:20.494766+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (599, 'testuser1760971462884@example.com', 'testpassword123', 'Test User 1760971462884', '+56971462884', 'user', false, false, '2025-10-20 14:44:22.977194+00', '2025-10-20 14:44:22.977194+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (600, 'testuser1760971463720@example.com', 'testpassword123', 'Test User 1760971463720', '+56971463720', 'user', false, false, '2025-10-20 14:44:23.812183+00', '2025-10-20 14:44:23.812183+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (601, 'testuser1760971463862@example.com', 'testpassword123', 'Test User 1760971463862', '+56971463862', 'user', false, false, '2025-10-20 14:44:23.940101+00', '2025-10-20 14:44:23.940101+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (338, 'testuser1760897968009@example.com', 'testpassword123', 'Test User 1760897968009', '+56997968009', 'user', true, false, '2025-10-19 18:19:28.087035+00', '2025-10-19 18:19:28.087035+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (342, 'testuser1760897968714@example.com', 'testpassword123', 'Test User 1760897968714', '+56997968714', 'user', true, false, '2025-10-19 18:19:28.778839+00', '2025-10-19 18:19:28.778839+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (346, 'testuser1760897969415@example.com', 'testpassword123', 'Test User 1760897969415', '+56997969415', 'user', true, false, '2025-10-19 18:19:29.492064+00', '2025-10-19 18:19:29.492064+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (350, 'testuser1760897970026@example.com', 'testpassword123', 'Test User 1760897970026', '+56997970026', 'user', true, false, '2025-10-19 18:19:30.112936+00', '2025-10-19 18:19:30.112936+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (354, 'testuser1760897970847@example.com', 'testpassword123', 'Test User 1760897970847', '+56997970847', 'user', true, false, '2025-10-19 18:19:30.928858+00', '2025-10-19 18:19:30.928858+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (358, 'testuser1760897971448@example.com', 'testpassword123', 'Test User 1760897971448', '+56997971448', 'user', true, false, '2025-10-19 18:19:31.519637+00', '2025-10-19 18:19:31.519637+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (362, 'testuser1760897972203@example.com', 'testpassword123', 'Test User 1760897972203', '+56997972203', 'user', true, false, '2025-10-19 18:19:32.274937+00', '2025-10-19 18:19:32.274937+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (366, 'testuser1760897972943@example.com', 'testpassword123', 'Test User 1760897972943', '+56997972943', 'user', true, false, '2025-10-19 18:19:33.02297+00', '2025-10-19 18:19:33.02297+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (370, 'testuser1760897973984@example.com', 'testpassword123', 'Test User 1760897973984', '+56997973984', 'user', true, false, '2025-10-19 18:19:34.063608+00', '2025-10-19 18:19:34.063608+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (374, 'testuser1760897975827@example.com', 'testpassword123', 'Test User 1760897975827', '+56997975827', 'user', true, false, '2025-10-19 18:19:35.903203+00', '2025-10-19 18:19:35.903203+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (642, 'testuser1760971578982@example.com', 'testpassword123', 'Test User 1760971578982', '+56971578982', 'user', false, false, '2025-10-20 14:46:19.062152+00', '2025-10-20 14:46:19.062152+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (383, 'test-orders-1760898054477@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:54.573368+00', '2025-10-19 18:20:54.573368+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (464, 'testuser1760964125570@example.com', 'testpassword123', 'Test User 1760964125570', '+56964125570', 'user', false, false, '2025-10-20 12:42:05.825092+00', '2025-10-20 12:42:05.825092+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (384, 'test-orders-1760898056122@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:56.253553+00', '2025-10-19 18:20:56.253553+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (390, 'test-orders-1760898060400@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:21:00.637536+00', '2025-10-19 18:21:00.637536+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (399, 'test-payment-1760898067498@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-19 18:21:07.597036+00', '2025-10-19 18:21:07.597036+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (469, 'testuser1760964127035@example.com', 'testpassword123', 'Test User 1760964127035', '+56964127035', 'user', false, false, '2025-10-20 12:42:07.138345+00', '2025-10-20 12:42:07.138345+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (468, 'testuser1760964126924@example.com', 'testpassword123', 'Test User 1760964126924', '+56964126924', 'user', false, false, '2025-10-20 12:42:07.012719+00', '2025-10-20 12:42:07.012719+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (471, 'testuser1760964127626@example.com', 'testpassword123', 'Test User 1760964127626', '+56964127626', 'user', false, false, '2025-10-20 12:42:07.709885+00', '2025-10-20 12:42:07.709885+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (480, 'testuser1760964129334@example.com', 'testpassword123', 'Test User 1760964129334', '+56964129334', 'user', false, false, '2025-10-20 12:42:09.425897+00', '2025-10-20 12:42:09.425897+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (483, 'testuser1760964129888@example.com', 'testpassword123', 'Test User 1760964129888', '+56964129888', 'user', false, false, '2025-10-20 12:42:09.968575+00', '2025-10-20 12:42:09.968575+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (486, 'testuser1760964130478@example.com', 'testpassword123', 'Test User 1760964130478', '+56964130478', 'user', false, false, '2025-10-20 12:42:10.585832+00', '2025-10-20 12:42:10.585832+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (489, 'testuser1760964131038@example.com', 'testpassword123', 'Test User 1760964131038', '+56964131038', 'user', false, false, '2025-10-20 12:42:11.126129+00', '2025-10-20 12:42:11.126129+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (501, 'testuser1760964133302@example.com', 'testpassword123', 'Test User 1760964133302', '+56964133302', 'user', false, false, '2025-10-20 12:42:13.406515+00', '2025-10-20 12:42:13.406515+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (508, 'testuser1760964134991@example.com', 'testpassword123', 'Test User 1760964134991', '+56964134991', 'user', false, false, '2025-10-20 12:42:15.094159+00', '2025-10-20 12:42:15.094159+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (510, 'testuser1760964136244@example.com', 'testpassword123', 'Test User 1760964136244', '+56964136244', 'user', false, false, '2025-10-20 12:42:16.346799+00', '2025-10-20 12:42:16.346799+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (514, 'testuser1760964138725@example.com', 'testpassword123', 'Test User 1760964138725', '+56964138725', 'user', false, false, '2025-10-20 12:42:18.835948+00', '2025-10-20 12:42:18.835948+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (518, 'testuser1760964141194@example.com', 'testpassword123', 'Test User 1760964141194', '+56964141194', 'user', false, false, '2025-10-20 12:42:21.276089+00', '2025-10-20 12:42:21.276089+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (519, 'testuser1760964141754@example.com', 'testpassword123', 'Test User 1760964141754', '+56964141754', 'user', false, false, '2025-10-20 12:42:21.841993+00', '2025-10-20 12:42:21.841993+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (567, 'testuser1760966179868@example.com', 'testpassword123', 'Test User 1760966179868', '+56966179868', 'user', false, false, '2025-10-20 13:16:19.909682+00', '2025-10-20 13:16:19.909682+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (569, 'testuser1760966180958@example.com', 'testpassword123', 'Test User 1760966180958', '+56966180958', 'user', false, false, '2025-10-20 13:16:21.02308+00', '2025-10-20 13:16:21.02308+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (571, 'testuser1760966182157@example.com', 'testpassword123', 'Test User 1760966182157', '+56966182157', 'user', false, false, '2025-10-20 13:16:22.213189+00', '2025-10-20 13:16:22.213189+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (572, 'testuser1760966182673@example.com', 'testpassword123', 'Test User 1760966182673', '+56966182673', 'user', false, false, '2025-10-20 13:16:22.726578+00', '2025-10-20 13:16:22.726578+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (573, 'testuser1760966183231@example.com', 'testpassword123', 'Test User 1760966183231', '+56966183231', 'user', false, false, '2025-10-20 13:16:23.295877+00', '2025-10-20 13:16:23.295877+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (575, 'testuser1760966184339@example.com', 'testpassword123', 'Test User 1760966184339', '+56966184339', 'user', false, false, '2025-10-20 13:16:24.426644+00', '2025-10-20 13:16:24.426644+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (578, 'testuser1760966186457@example.com', 'testpassword123', 'Test User 1760966186457', '+56966186457', 'user', false, false, '2025-10-20 13:16:26.518998+00', '2025-10-20 13:16:26.518998+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (579, 'testuser1760966187042@example.com', 'testpassword123', 'Test User 1760966187042', '+56966187042', 'user', false, false, '2025-10-20 13:16:27.103309+00', '2025-10-20 13:16:27.103309+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (594, 'testuser1760971461821@example.com', 'testpassword123', 'Test User 1760971461821', '+56971461821', 'user', false, false, '2025-10-20 14:44:21.886196+00', '2025-10-20 14:44:21.886196+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (340, 'testuser1760897968321@example.com', 'testpassword123', 'Test User 1760897968321', '+56997968321', 'user', true, false, '2025-10-19 18:19:28.396441+00', '2025-10-19 18:19:28.396441+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (344, 'testuser1760897969114@example.com', 'testpassword123', 'Test User 1760897969114', '+56997969114', 'user', true, false, '2025-10-19 18:19:29.199952+00', '2025-10-19 18:19:29.199952+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (348, 'testuser1760897969726@example.com', 'testpassword123', 'Test User 1760897969726', '+56997969726', 'user', true, false, '2025-10-19 18:19:29.809654+00', '2025-10-19 18:19:29.809654+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (352, 'testuser1760897970445@example.com', 'testpassword123', 'Test User 1760897970445', '+56997970445', 'user', true, false, '2025-10-19 18:19:30.518121+00', '2025-10-19 18:19:30.518121+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (356, 'testuser1760897971146@example.com', 'testpassword123', 'Test User 1760897971146', '+56997971146', 'user', true, false, '2025-10-19 18:19:31.221395+00', '2025-10-19 18:19:31.221395+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (360, 'testuser1760897971758@example.com', 'testpassword123', 'Test User 1760897971758', '+56997971758', 'user', true, false, '2025-10-19 18:19:31.838334+00', '2025-10-19 18:19:31.838334+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (364, 'testuser1760897972622@example.com', 'testpassword123', 'Test User 1760897972622', '+56997972622', 'user', true, false, '2025-10-19 18:19:32.715863+00', '2025-10-19 18:19:32.715863+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (368, 'testuser1760897973214@example.com', 'testpassword123', 'Test User 1760897973214', '+56997973214', 'user', true, false, '2025-10-19 18:19:33.280666+00', '2025-10-19 18:19:33.280666+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (372, 'testuser1760897974934@example.com', 'testpassword123', 'Test User 1760897974934', '+56997974934', 'user', true, false, '2025-10-19 18:19:35.011967+00', '2025-10-19 18:19:35.011967+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (376, 'testuser1760897976674@example.com', 'testpassword123', 'Test User 1760897976674', '+56997976674', 'user', true, false, '2025-10-19 18:19:36.749662+00', '2025-10-19 18:19:36.749662+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (820, 'testuser1760999783741@example.com', 'testpassword123', 'Test User 1760999783741', '+56999783741', 'user', false, false, '2025-10-20 22:36:23.850634+00', '2025-10-20 22:36:23.850634+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (380, 'test-orders-1760898050858@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:50.940372+00', '2025-10-19 18:20:50.940372+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (465, 'testuser1760964125990@example.com', 'testpassword123', 'Test User 1760964125990', '+56964125990', 'user', false, false, '2025-10-20 12:42:06.07796+00', '2025-10-20 12:42:06.07796+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (387, 'test-orders-1760898058474@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:58.58878+00', '2025-10-19 18:20:58.58878+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (388, 'test-orders-1760898059192@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:59.283295+00', '2025-10-19 18:20:59.283295+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (473, 'testuser1760964127938@example.com', 'testpassword123', 'Test User 1760964127938', '+56964127938', 'user', false, false, '2025-10-20 12:42:08.027032+00', '2025-10-20 12:42:08.027032+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (389, 'test-orders-1760898059983@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:21:00.072663+00', '2025-10-19 18:21:00.072663+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (392, 'test-orders-1760898061767@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:21:01.859267+00', '2025-10-19 18:21:01.859267+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (474, 'testuser1760964128215@example.com', 'testpassword123', 'Test User 1760964128215', '+56964128215', 'user', false, false, '2025-10-20 12:42:08.30993+00', '2025-10-20 12:42:08.30993+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (393, 'test-orders-1760898063253@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:21:03.351784+00', '2025-10-19 18:21:03.351784+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (395, 'test-payment-1760898065764@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-19 18:21:05.878146+00', '2025-10-19 18:21:05.878146+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (476, 'testuser1760964128513@example.com', 'testpassword123', 'Test User 1760964128513', '+56964128513', 'user', false, false, '2025-10-20 12:42:08.608733+00', '2025-10-20 12:42:08.608733+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (397, 'test-payment-1760898066348@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-19 18:21:06.444139+00', '2025-10-19 18:21:06.444139+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (484, 'testuser1760964129954@example.com', 'testpassword123', 'Test User 1760964129954', '+56964129954', 'user', false, false, '2025-10-20 12:42:10.041681+00', '2025-10-20 12:42:10.041681+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (487, 'testuser1760964130529@example.com', 'testpassword123', 'Test User 1760964130529', '+56964130529', 'user', false, false, '2025-10-20 12:42:10.612911+00', '2025-10-20 12:42:10.612911+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (493, 'testuser1760964131642@example.com', 'testpassword123', 'Test User 1760964131642', '+56964131642', 'user', false, false, '2025-10-20 12:42:11.725566+00', '2025-10-20 12:42:11.725566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (496, 'testuser1760964132191@example.com', 'testpassword123', 'Test User 1760964132191', '+56964132191', 'user', false, false, '2025-10-20 12:42:12.276705+00', '2025-10-20 12:42:12.276705+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (499, 'testuser1760964132790@example.com', 'testpassword123', 'Test User 1760964132790', '+56964132790', 'user', false, false, '2025-10-20 12:42:12.879579+00', '2025-10-20 12:42:12.879579+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (506, 'testuser1760964134223@example.com', 'testpassword123', 'Test User 1760964134223', '+56964134223', 'user', false, false, '2025-10-20 12:42:14.314271+00', '2025-10-20 12:42:14.314271+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (512, 'testuser1760964137454@example.com', 'testpassword123', 'Test User 1760964137454', '+56964137454', 'user', false, false, '2025-10-20 12:42:17.547007+00', '2025-10-20 12:42:17.547007+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (580, 'testuser1760971458025@example.com', 'testpassword123', 'Test User 1760971458025', '+56971458025', 'user', false, false, '2025-10-20 14:44:19.109752+00', '2025-10-20 14:44:19.109752+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (582, 'testuser1760971459386@example.com', 'testpassword123', 'Test User 1760971459386', '+56971459386', 'user', false, false, '2025-10-20 14:44:19.459251+00', '2025-10-20 14:44:19.459251+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (581, 'testuser1760971458023@example.com', 'testpassword123', 'Test User 1760971458023', '+56971458023', 'user', false, false, '2025-10-20 14:44:19.201611+00', '2025-10-20 14:44:19.201611+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (585, 'testuser1760971460131@example.com', 'testpassword123', 'Test User 1760971460131', '+56971460131', 'user', false, false, '2025-10-20 14:44:20.209195+00', '2025-10-20 14:44:20.209195+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (584, 'testuser1760971459764@example.com', 'testpassword123', 'Test User 1760971459764', '+56971459764', 'user', false, false, '2025-10-20 14:44:19.834747+00', '2025-10-20 14:44:19.834747+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (587, 'testuser1760971460446@example.com', 'testpassword123', 'Test User 1760971460446', '+56971460446', 'user', false, false, '2025-10-20 14:44:20.514701+00', '2025-10-20 14:44:20.514701+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (589, 'testuser1760971460994@example.com', 'testpassword123', 'Test User 1760971460994', '+56971460994', 'user', false, false, '2025-10-20 14:44:21.061857+00', '2025-10-20 14:44:21.061857+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (591, 'testuser1760971461276@example.com', 'testpassword123', 'Test User 1760971461276', '+56971461276', 'user', false, false, '2025-10-20 14:44:21.33632+00', '2025-10-20 14:44:21.33632+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (341, 'testuser1760897968575@example.com', 'testpassword123', 'Test User 1760897968575', '+56997968575', 'user', true, false, '2025-10-19 18:19:28.659283+00', '2025-10-19 18:19:28.659283+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (345, 'testuser1760897969134@example.com', 'testpassword123', 'Test User 1760897969134', '+56997969134', 'user', true, false, '2025-10-19 18:19:29.231451+00', '2025-10-19 18:19:29.231451+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (349, 'testuser1760897970012@example.com', 'testpassword123', 'Test User 1760897970012', '+56997970012', 'user', true, false, '2025-10-19 18:19:30.083016+00', '2025-10-19 18:19:30.083016+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (353, 'testuser1760897970565@example.com', 'testpassword123', 'Test User 1760897970565', '+56997970565', 'user', true, false, '2025-10-19 18:19:30.631588+00', '2025-10-19 18:19:30.631588+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (357, 'testuser1760897971331@example.com', 'testpassword123', 'Test User 1760897971331', '+56997971331', 'user', true, false, '2025-10-19 18:19:31.41233+00', '2025-10-19 18:19:31.41233+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (361, 'testuser1760897972056@example.com', 'testpassword123', 'Test User 1760897972056', '+56997972056', 'user', true, false, '2025-10-19 18:19:32.118444+00', '2025-10-19 18:19:32.118444+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (365, 'testuser1760897972668@example.com', 'testpassword123', 'Test User 1760897972668', '+56997972668', 'user', true, false, '2025-10-19 18:19:32.74904+00', '2025-10-19 18:19:32.74904+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (369, 'testuser1760897973510@example.com', 'testpassword123', 'Test User 1760897973510', '+56997973510', 'user', true, false, '2025-10-19 18:19:33.587037+00', '2025-10-19 18:19:33.587037+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (373, 'testuser1760897975420@example.com', 'testpassword123', 'Test User 1760897975420', '+56997975420', 'user', true, false, '2025-10-19 18:19:35.499179+00', '2025-10-19 18:19:35.499179+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (377, 'testuser1760897977206@example.com', 'testpassword123', 'Test User 1760897977206', '+56997977206', 'user', true, false, '2025-10-19 18:19:37.282338+00', '2025-10-19 18:19:37.282338+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (378, 'test-orders-1760898047329@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:47.438482+00', '2025-10-19 18:20:47.438482+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (882, 'testuser1761314656342@example.com', 'testpassword123', 'Test User 1761314656342', '+56914656342', 'user', true, false, '2025-10-24 14:04:17.770585+00', '2025-10-24 14:04:17.770585+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (381, 'test-orders-1760898052023@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:52.129878+00', '2025-10-19 18:20:52.129878+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (386, 'test-orders-1760898057652@example.com', NULL, 'Test Order User', '+584121234567', 'user', false, false, '2025-10-19 18:20:57.812611+00', '2025-10-19 18:20:57.812611+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (394, 'test-payment-1760898064910@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-19 18:21:05.007566+00', '2025-10-19 18:21:05.007566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (398, 'test-payment-1760898067390@example.com', NULL, 'Test Payment User', '+584121234567', 'user', false, false, '2025-10-19 18:21:07.511044+00', '2025-10-19 18:21:07.511044+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (401, 'testuser1760963179681@example.com', 'testpassword123', 'Test User 1760963179681', '+56963179681', 'user', false, false, '2025-10-20 12:26:21.51334+00', '2025-10-20 12:26:21.51334+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (400, 'testuser1760963179680@example.com', 'testpassword123', 'Test User 1760963179680', '+56963179680', 'user', false, false, '2025-10-20 12:26:21.512706+00', '2025-10-20 12:26:21.512706+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (402, 'testuser1760963182188@example.com', 'testpassword123', 'Test User 1760963182188', '+56963182188', 'user', false, false, '2025-10-20 12:26:22.317917+00', '2025-10-20 12:26:22.317917+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (404, 'testuser1760963182614@example.com', 'testpassword123', 'Test User 1760963182614', '+56963182614', 'user', false, false, '2025-10-20 12:26:22.718477+00', '2025-10-20 12:26:22.718477+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (403, 'testuser1760963182474@example.com', 'testpassword123', 'Test User 1760963182474', '+56963182474', 'user', false, false, '2025-10-20 12:26:22.58419+00', '2025-10-20 12:26:22.58419+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (405, 'testuser1760963182924@example.com', 'testpassword123', 'Test User 1760963182924', '+56963182924', 'user', false, false, '2025-10-20 12:26:23.047848+00', '2025-10-20 12:26:23.047848+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (407, 'testuser1760963183264@example.com', 'testpassword123', 'Test User 1760963183264', '+56963183264', 'user', false, false, '2025-10-20 12:26:23.377852+00', '2025-10-20 12:26:23.377852+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (406, 'testuser1760963183123@example.com', 'testpassword123', 'Test User 1760963183123', '+56963183123', 'user', false, false, '2025-10-20 12:26:23.235109+00', '2025-10-20 12:26:23.235109+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (408, 'testuser1760963183579@example.com', 'testpassword123', 'Test User 1760963183579', '+56963183579', 'user', false, false, '2025-10-20 12:26:23.679029+00', '2025-10-20 12:26:23.679029+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (410, 'testuser1760963183886@example.com', 'testpassword123', 'Test User 1760963183886', '+56963183886', 'user', false, false, '2025-10-20 12:26:23.996241+00', '2025-10-20 12:26:23.996241+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (409, 'testuser1760963183841@example.com', 'testpassword123', 'Test User 1760963183841', '+56963183841', 'user', false, false, '2025-10-20 12:26:23.962939+00', '2025-10-20 12:26:23.962939+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (411, 'testuser1760963184216@example.com', 'testpassword123', 'Test User 1760963184216', '+56963184216', 'user', false, false, '2025-10-20 12:26:24.311482+00', '2025-10-20 12:26:24.311482+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (413, 'testuser1760963184531@example.com', 'testpassword123', 'Test User 1760963184531', '+56963184531', 'user', false, false, '2025-10-20 12:26:24.657473+00', '2025-10-20 12:26:24.657473+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (414, 'testuser1760963184832@example.com', 'testpassword123', 'Test User 1760963184832', '+56963184832', 'user', false, false, '2025-10-20 12:26:24.932853+00', '2025-10-20 12:26:24.932853+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (412, 'testuser1760963184441@example.com', 'testpassword123', 'Test User 1760963184441', '+56963184441', 'user', false, false, '2025-10-20 12:26:24.547814+00', '2025-10-20 12:26:24.547814+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (415, 'testuser1760963185128@example.com', 'testpassword123', 'Test User 1760963185128', '+56963185128', 'user', false, false, '2025-10-20 12:26:25.221709+00', '2025-10-20 12:26:25.221709+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (417, 'testuser1760963185403@example.com', 'testpassword123', 'Test User 1760963185403', '+56963185403', 'user', false, false, '2025-10-20 12:26:25.507472+00', '2025-10-20 12:26:25.507472+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (416, 'testuser1760963185218@example.com', 'testpassword123', 'Test User 1760963185218', '+56963185218', 'user', false, false, '2025-10-20 12:26:25.316309+00', '2025-10-20 12:26:25.316309+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (418, 'testuser1760963185692@example.com', 'testpassword123', 'Test User 1760963185692', '+56963185692', 'user', false, false, '2025-10-20 12:26:25.77749+00', '2025-10-20 12:26:25.77749+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (420, 'testuser1760963185984@example.com', 'testpassword123', 'Test User 1760963185984', '+56963185984', 'user', false, false, '2025-10-20 12:26:26.121473+00', '2025-10-20 12:26:26.121473+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (419, 'testuser1760963185841@example.com', 'testpassword123', 'Test User 1760963185841', '+56963185841', 'user', false, false, '2025-10-20 12:26:25.931449+00', '2025-10-20 12:26:25.931449+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (421, 'testuser1760963186376@example.com', 'testpassword123', 'Test User 1760963186376', '+56963186376', 'user', false, false, '2025-10-20 12:26:26.474534+00', '2025-10-20 12:26:26.474534+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (644, 'testuser1760971579275@example.com', 'testpassword123', 'Test User 1760971579275', '+56971579275', 'user', false, false, '2025-10-20 14:46:19.342694+00', '2025-10-20 14:46:19.342694+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (422, 'testuser1760963186538@example.com', 'testpassword123', 'Test User 1760963186538', '+56963186538', 'user', false, false, '2025-10-20 12:26:26.646406+00', '2025-10-20 12:26:26.646406+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (424, 'testuser1760963187064@example.com', 'testpassword123', 'Test User 1760963187064', '+56963187064', 'user', false, false, '2025-10-20 12:26:27.156552+00', '2025-10-20 12:26:27.156552+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (520, 'testuser1760966168484@example.com', 'testpassword123', 'Test User 1760966168484', '+56966168484', 'user', false, false, '2025-10-20 13:16:09.650675+00', '2025-10-20 13:16:09.650675+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (426, 'testuser1760963187341@example.com', 'testpassword123', 'Test User 1760963187341', '+56963187341', 'user', false, false, '2025-10-20 12:26:27.435281+00', '2025-10-20 12:26:27.435281+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (522, 'testuser1760966170230@example.com', 'testpassword123', 'Test User 1760966170230', '+56966170230', 'user', false, false, '2025-10-20 13:16:10.307523+00', '2025-10-20 13:16:10.307523+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (428, 'testuser1760963187769@example.com', 'testpassword123', 'Test User 1760963187769', '+56963187769', 'user', false, false, '2025-10-20 12:26:27.859965+00', '2025-10-20 12:26:27.859965+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (427, 'testuser1760963187642@example.com', 'testpassword123', 'Test User 1760963187642', '+56963187642', 'user', false, false, '2025-10-20 12:26:27.741066+00', '2025-10-20 12:26:27.741066+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (524, 'testuser1760966170568@example.com', 'testpassword123', 'Test User 1760966170568', '+56966170568', 'user', false, false, '2025-10-20 13:16:10.676192+00', '2025-10-20 13:16:10.676192+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (429, 'testuser1760963188094@example.com', 'testpassword123', 'Test User 1760963188094', '+56963188094', 'user', false, false, '2025-10-20 12:26:28.189517+00', '2025-10-20 12:26:28.189517+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (431, 'testuser1760963188380@example.com', 'testpassword123', 'Test User 1760963188380', '+56963188380', 'user', false, false, '2025-10-20 12:26:28.481774+00', '2025-10-20 12:26:28.481774+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (433, 'testuser1760963188775@example.com', 'testpassword123', 'Test User 1760963188775', '+56963188775', 'user', false, false, '2025-10-20 12:26:28.860783+00', '2025-10-20 12:26:28.860783+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (528, 'testuser1760966171502@example.com', 'testpassword123', 'Test User 1760966171502', '+56966171502', 'user', false, false, '2025-10-20 13:16:11.579679+00', '2025-10-20 13:16:11.579679+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (436, 'testuser1760963189306@example.com', 'testpassword123', 'Test User 1760963189306', '+56963189306', 'user', false, false, '2025-10-20 12:26:29.413839+00', '2025-10-20 12:26:29.413839+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (527, 'testuser1760966171254@example.com', 'testpassword123', 'Test User 1760966171254', '+56966171254', 'user', false, false, '2025-10-20 13:16:11.321349+00', '2025-10-20 13:16:11.321349+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (440, 'testuser1760963190095@example.com', 'testpassword123', 'Test User 1760963190095', '+56963190095', 'user', false, false, '2025-10-20 12:26:30.185538+00', '2025-10-20 12:26:30.185538+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (439, 'testuser1760963189854@example.com', 'testpassword123', 'Test User 1760963189854', '+56963189854', 'user', false, false, '2025-10-20 12:26:29.940962+00', '2025-10-20 12:26:29.940962+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (530, 'testuser1760966171849@example.com', 'testpassword123', 'Test User 1760966171849', '+56966171849', 'user', false, false, '2025-10-20 13:16:11.920432+00', '2025-10-20 13:16:11.920432+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (443, 'testuser1760963190645@example.com', 'testpassword123', 'Test User 1760963190645', '+56963190645', 'user', false, false, '2025-10-20 12:26:30.734468+00', '2025-10-20 12:26:30.734468+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (442, 'testuser1760963190407@example.com', 'testpassword123', 'Test User 1760963190407', '+56963190407', 'user', false, false, '2025-10-20 12:26:30.500482+00', '2025-10-20 12:26:30.500482+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (445, 'testuser1760963190982@example.com', 'testpassword123', 'Test User 1760963190982', '+56963190982', 'user', false, false, '2025-10-20 12:26:31.076394+00', '2025-10-20 12:26:31.076394+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (532, 'testuser1760966172395@example.com', 'testpassword123', 'Test User 1760966172395', '+56966172395', 'user', false, false, '2025-10-20 13:16:12.462678+00', '2025-10-20 13:16:12.462678+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (449, 'testuser1760963193069@example.com', 'testpassword123', 'Test User 1760963193069', '+56963193069', 'user', false, false, '2025-10-20 12:26:33.162028+00', '2025-10-20 12:26:33.162028+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (533, 'testuser1760966172493@example.com', 'testpassword123', 'Test User 1760966172493', '+56966172493', 'user', false, false, '2025-10-20 13:16:12.570338+00', '2025-10-20 13:16:12.570338+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (451, 'testuser1760963194427@example.com', 'testpassword123', 'Test User 1760963194427', '+56963194427', 'user', false, false, '2025-10-20 12:26:34.521598+00', '2025-10-20 12:26:34.521598+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (456, 'testuser1760963197756@example.com', 'testpassword123', 'Test User 1760963197756', '+56963197756', 'user', false, false, '2025-10-20 12:26:37.844022+00', '2025-10-20 12:26:37.844022+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (537, 'testuser1760966173309@example.com', 'testpassword123', 'Test User 1760966173309', '+56966173309', 'user', false, false, '2025-10-20 13:16:13.37258+00', '2025-10-20 13:16:13.37258+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (457, 'testuser1760963198422@example.com', 'testpassword123', 'Test User 1760963198422', '+56963198422', 'user', false, false, '2025-10-20 12:26:38.544791+00', '2025-10-20 12:26:38.544791+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (459, 'testuser1760963199526@example.com', 'testpassword123', 'Test User 1760963199526', '+56963199526', 'user', false, false, '2025-10-20 12:26:39.62746+00', '2025-10-20 12:26:39.62746+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (538, 'testuser1760966173615@example.com', 'testpassword123', 'Test User 1760966173615', '+56966173615', 'user', false, false, '2025-10-20 13:16:13.686467+00', '2025-10-20 13:16:13.686467+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (543, 'testuser1760966174505@example.com', 'testpassword123', 'Test User 1760966174505', '+56966174505', 'user', false, false, '2025-10-20 13:16:14.565013+00', '2025-10-20 13:16:14.565013+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (542, 'testuser1760966174291@example.com', 'testpassword123', 'Test User 1760966174291', '+56966174291', 'user', false, false, '2025-10-20 13:16:14.358538+00', '2025-10-20 13:16:14.358538+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (544, 'testuser1760966174789@example.com', 'testpassword123', 'Test User 1760966174789', '+56966174789', 'user', false, false, '2025-10-20 13:16:14.862623+00', '2025-10-20 13:16:14.862623+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (546, 'testuser1760966175068@example.com', 'testpassword123', 'Test User 1760966175068', '+56966175068', 'user', false, false, '2025-10-20 13:16:15.127963+00', '2025-10-20 13:16:15.127963+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (547, 'testuser1760966175366@example.com', 'testpassword123', 'Test User 1760966175366', '+56966175366', 'user', false, false, '2025-10-20 13:16:15.429106+00', '2025-10-20 13:16:15.429106+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (554, 'testuser1760966176490@example.com', 'testpassword123', 'Test User 1760966176490', '+56966176490', 'user', false, false, '2025-10-20 13:16:16.543347+00', '2025-10-20 13:16:16.543347+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (553, 'testuser1760966176241@example.com', 'testpassword123', 'Test User 1760966176241', '+56966176241', 'user', false, false, '2025-10-20 13:16:16.320274+00', '2025-10-20 13:16:16.320274+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (556, 'testuser1760966176791@example.com', 'testpassword123', 'Test User 1760966176791', '+56966176791', 'user', false, false, '2025-10-20 13:16:16.845335+00', '2025-10-20 13:16:16.845335+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (521, 'testuser1760966168490@example.com', 'testpassword123', 'Test User 1760966168490', '+56966168490', 'user', false, false, '2025-10-20 13:16:09.650675+00', '2025-10-20 13:16:09.650675+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (423, 'testuser1760963186775@example.com', 'testpassword123', 'Test User 1760963186775', '+56963186775', 'user', false, false, '2025-10-20 12:26:26.879871+00', '2025-10-20 12:26:26.879871+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (821, 'testuser1760999784485@example.com', 'testpassword123', 'Test User 1760999784485', '+56999784485', 'user', false, false, '2025-10-20 22:36:24.575845+00', '2025-10-20 22:36:24.575845+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (425, 'testuser1760963187107@example.com', 'testpassword123', 'Test User 1760963187107', '+56963187107', 'user', false, false, '2025-10-20 12:26:27.202489+00', '2025-10-20 12:26:27.202489+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (523, 'testuser1760966170593@example.com', 'testpassword123', 'Test User 1760966170593', '+56966170593', 'user', false, false, '2025-10-20 13:16:10.677198+00', '2025-10-20 13:16:10.677198+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (430, 'testuser1760963188210@example.com', 'testpassword123', 'Test User 1760963188210', '+56963188210', 'user', false, false, '2025-10-20 12:26:28.305107+00', '2025-10-20 12:26:28.305107+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (432, 'testuser1760963188654@example.com', 'testpassword123', 'Test User 1760963188654', '+56963188654', 'user', false, false, '2025-10-20 12:26:28.746949+00', '2025-10-20 12:26:28.746949+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (525, 'testuser1760966170909@example.com', 'testpassword123', 'Test User 1760966170909', '+56966170909', 'user', false, false, '2025-10-20 13:16:10.981751+00', '2025-10-20 13:16:10.981751+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (434, 'testuser1760963188927@example.com', 'testpassword123', 'Test User 1760963188927', '+56963188927', 'user', false, false, '2025-10-20 12:26:29.055078+00', '2025-10-20 12:26:29.055078+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (435, 'testuser1760963189276@example.com', 'testpassword123', 'Test User 1760963189276', '+56963189276', 'user', false, false, '2025-10-20 12:26:29.385538+00', '2025-10-20 12:26:29.385538+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (526, 'testuser1760966171208@example.com', 'testpassword123', 'Test User 1760966171208', '+56966171208', 'user', false, false, '2025-10-20 13:16:11.28003+00', '2025-10-20 13:16:11.28003+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (437, 'testuser1760963189561@example.com', 'testpassword123', 'Test User 1760963189561', '+56963189561', 'user', false, false, '2025-10-20 12:26:29.650195+00', '2025-10-20 12:26:29.650195+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (438, 'testuser1760963189827@example.com', 'testpassword123', 'Test User 1760963189827', '+56963189827', 'user', false, false, '2025-10-20 12:26:29.923203+00', '2025-10-20 12:26:29.923203+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (529, 'testuser1760966171794@example.com', 'testpassword123', 'Test User 1760966171794', '+56966171794', 'user', false, false, '2025-10-20 13:16:11.869789+00', '2025-10-20 13:16:11.869789+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (441, 'testuser1760963190371@example.com', 'testpassword123', 'Test User 1760963190371', '+56963190371', 'user', false, false, '2025-10-20 12:26:30.470687+00', '2025-10-20 12:26:30.470687+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (444, 'testuser1760963190914@example.com', 'testpassword123', 'Test User 1760963190914', '+56963190914', 'user', false, false, '2025-10-20 12:26:31.007334+00', '2025-10-20 12:26:31.007334+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (531, 'testuser1760966172088@example.com', 'testpassword123', 'Test User 1760966172088', '+56966172088', 'user', false, false, '2025-10-20 13:16:12.175722+00', '2025-10-20 13:16:12.175722+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (446, 'testuser1760963191263@example.com', 'testpassword123', 'Test User 1760963191263', '+56963191263', 'user', false, false, '2025-10-20 12:26:31.360745+00', '2025-10-20 12:26:31.360745+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (447, 'testuser1760963191577@example.com', 'testpassword123', 'Test User 1760963191577', '+56963191577', 'user', false, false, '2025-10-20 12:26:31.659001+00', '2025-10-20 12:26:31.659001+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (534, 'testuser1760966172697@example.com', 'testpassword123', 'Test User 1760966172697', '+56966172697', 'user', false, false, '2025-10-20 13:16:12.762099+00', '2025-10-20 13:16:12.762099+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (448, 'testuser1760963192514@example.com', 'testpassword123', 'Test User 1760963192514', '+56963192514', 'user', false, false, '2025-10-20 12:26:32.606653+00', '2025-10-20 12:26:32.606653+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (450, 'testuser1760963193821@example.com', 'testpassword123', 'Test User 1760963193821', '+56963193821', 'user', false, false, '2025-10-20 12:26:33.928668+00', '2025-10-20 12:26:33.928668+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (452, 'testuser1760963195017@example.com', 'testpassword123', 'Test User 1760963195017', '+56963195017', 'user', false, false, '2025-10-20 12:26:35.101409+00', '2025-10-20 12:26:35.101409+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (535, 'testuser1760966173015@example.com', 'testpassword123', 'Test User 1760966173015', '+56966173015', 'user', false, false, '2025-10-20 13:16:13.082873+00', '2025-10-20 13:16:13.082873+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (453, 'testuser1760963195630@example.com', 'testpassword123', 'Test User 1760963195630', '+56963195630', 'user', false, false, '2025-10-20 12:26:35.73616+00', '2025-10-20 12:26:35.73616+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (536, 'testuser1760966173058@example.com', 'testpassword123', 'Test User 1760966173058', '+56966173058', 'user', false, false, '2025-10-20 13:16:13.122629+00', '2025-10-20 13:16:13.122629+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (454, 'testuser1760963196388@example.com', 'testpassword123', 'Test User 1760963196388', '+56963196388', 'user', false, false, '2025-10-20 12:26:36.48143+00', '2025-10-20 12:26:36.48143+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (455, 'testuser1760963197026@example.com', 'testpassword123', 'Test User 1760963197026', '+56963197026', 'user', false, false, '2025-10-20 12:26:37.132905+00', '2025-10-20 12:26:37.132905+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (458, 'testuser1760963198988@example.com', 'testpassword123', 'Test User 1760963198988', '+56963198988', 'user', false, false, '2025-10-20 12:26:39.085474+00', '2025-10-20 12:26:39.085474+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (540, 'testuser1760966173904@example.com', 'testpassword123', 'Test User 1760966173904', '+56966173904', 'user', false, false, '2025-10-20 13:16:13.965331+00', '2025-10-20 13:16:13.965331+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (539, 'testuser1760966173666@example.com', 'testpassword123', 'Test User 1760966173666', '+56966173666', 'user', false, false, '2025-10-20 13:16:13.745934+00', '2025-10-20 13:16:13.745934+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (541, 'testuser1760966174221@example.com', 'testpassword123', 'Test User 1760966174221', '+56966174221', 'user', false, false, '2025-10-20 13:16:14.288806+00', '2025-10-20 13:16:14.288806+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (545, 'testuser1760966174817@example.com', 'testpassword123', 'Test User 1760966174817', '+56966174817', 'user', false, false, '2025-10-20 13:16:14.876295+00', '2025-10-20 13:16:14.876295+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (549, 'testuser1760966175648@example.com', 'testpassword123', 'Test User 1760966175648', '+56966175648', 'user', false, false, '2025-10-20 13:16:15.721504+00', '2025-10-20 13:16:15.721504+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (551, 'testuser1760966175935@example.com', 'testpassword123', 'Test User 1760966175935', '+56966175935', 'user', false, false, '2025-10-20 13:16:16.005619+00', '2025-10-20 13:16:16.005619+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (550, 'testuser1760966175653@example.com', 'testpassword123', 'Test User 1760966175653', '+56966175653', 'user', false, false, '2025-10-20 13:16:15.727661+00', '2025-10-20 13:16:15.727661+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (552, 'testuser1760966176213@example.com', 'testpassword123', 'Test User 1760966176213', '+56966176213', 'user', false, false, '2025-10-20 13:16:16.279461+00', '2025-10-20 13:16:16.279461+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (555, 'testuser1760966176746@example.com', 'testpassword123', 'Test User 1760966176746', '+56966176746', 'user', false, false, '2025-10-20 13:16:16.814209+00', '2025-10-20 13:16:16.814209+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (643, 'testuser1760971579194@example.com', 'testpassword123', 'Test User 1760971579194', '+56971579194', 'user', false, false, '2025-10-20 14:46:19.259123+00', '2025-10-20 14:46:19.259123+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (602, 'testuser1760971464033@example.com', 'testpassword123', 'Test User 1760971464033', '+56971464033', 'user', false, false, '2025-10-20 14:44:24.10033+00', '2025-10-20 14:44:24.10033+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (605, 'testuser1760971464736@example.com', 'testpassword123', 'Test User 1760971464736', '+56971464736', 'user', false, false, '2025-10-20 14:44:24.831068+00', '2025-10-20 14:44:24.831068+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (606, 'testuser1760971465029@example.com', 'testpassword123', 'Test User 1760971465029', '+56971465029', 'user', false, false, '2025-10-20 14:44:25.099744+00', '2025-10-20 14:44:25.099744+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (647, 'testuser1760971579875@example.com', 'testpassword123', 'Test User 1760971579875', '+56971579875', 'user', false, false, '2025-10-20 14:46:19.940031+00', '2025-10-20 14:46:19.940031+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (608, 'testuser1760971465294@example.com', 'testpassword123', 'Test User 1760971465294', '+56971465294', 'user', false, false, '2025-10-20 14:44:25.367466+00', '2025-10-20 14:44:25.367466+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (646, 'testuser1760971579805@example.com', 'testpassword123', 'Test User 1760971579805', '+56971579805', 'user', false, false, '2025-10-20 14:46:19.875978+00', '2025-10-20 14:46:19.875978+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (609, 'testuser1760971465559@example.com', 'testpassword123', 'Test User 1760971465559', '+56971465559', 'user', false, false, '2025-10-20 14:44:25.644861+00', '2025-10-20 14:44:25.644861+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (611, 'testuser1760971465826@example.com', 'testpassword123', 'Test User 1760971465826', '+56971465826', 'user', false, false, '2025-10-20 14:44:25.893015+00', '2025-10-20 14:44:25.893015+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (652, 'testuser1760971581083@example.com', 'testpassword123', 'Test User 1760971581083', '+56971581083', 'user', false, false, '2025-10-20 14:46:21.153252+00', '2025-10-20 14:46:21.153252+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (612, 'testuser1760971466090@example.com', 'testpassword123', 'Test User 1760971466090', '+56971466090', 'user', false, false, '2025-10-20 14:44:26.165423+00', '2025-10-20 14:44:26.165423+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (662, 'testuser1760971582934@example.com', 'testpassword123', 'Test User 1760971582934', '+56971582934', 'user', false, false, '2025-10-20 14:46:23.004781+00', '2025-10-20 14:46:23.004781+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (614, 'testuser1760971466355@example.com', 'testpassword123', 'Test User 1760971466355', '+56971466355', 'user', false, false, '2025-10-20 14:44:26.422377+00', '2025-10-20 14:44:26.422377+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (613, 'testuser1760971466200@example.com', 'testpassword123', 'Test User 1760971466200', '+56971466200', 'user', false, false, '2025-10-20 14:44:26.27793+00', '2025-10-20 14:44:26.27793+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (618, 'testuser1760971467124@example.com', 'testpassword123', 'Test User 1760971467124', '+56971467124', 'user', false, false, '2025-10-20 14:44:27.191923+00', '2025-10-20 14:44:27.191923+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (666, 'testuser1760971584346@example.com', 'testpassword123', 'Test User 1760971584346', '+56971584346', 'user', false, false, '2025-10-20 14:46:24.413057+00', '2025-10-20 14:46:24.413057+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (619, 'testuser1760971467365@example.com', 'testpassword123', 'Test User 1760971467365', '+56971467365', 'user', false, false, '2025-10-20 14:44:27.435809+00', '2025-10-20 14:44:27.435809+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (621, 'testuser1760971467645@example.com', 'testpassword123', 'Test User 1760971467645', '+56971467645', 'user', false, false, '2025-10-20 14:44:27.718795+00', '2025-10-20 14:44:27.718795+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (667, 'testuser1760971584610@example.com', 'testpassword123', 'Test User 1760971584610', '+56971584610', 'user', false, false, '2025-10-20 14:46:24.679795+00', '2025-10-20 14:46:24.679795+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (673, 'testuser1760971585778@example.com', 'testpassword123', 'Test User 1760971585778', '+56971585778', 'user', false, false, '2025-10-20 14:46:25.868696+00', '2025-10-20 14:46:25.868696+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (624, 'testuser1760971468184@example.com', 'testpassword123', 'Test User 1760971468184', '+56971468184', 'user', false, false, '2025-10-20 14:44:28.261256+00', '2025-10-20 14:44:28.261256+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (626, 'testuser1760971468480@example.com', 'testpassword123', 'Test User 1760971468480', '+56971468480', 'user', false, false, '2025-10-20 14:44:28.552044+00', '2025-10-20 14:44:28.552044+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (627, 'testuser1760971468737@example.com', 'testpassword123', 'Test User 1760971468737', '+56971468737', 'user', false, false, '2025-10-20 14:44:28.795409+00', '2025-10-20 14:44:28.795409+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (675, 'testuser1760971586093@example.com', 'testpassword123', 'Test User 1760971586093', '+56971586093', 'user', false, false, '2025-10-20 14:46:26.156691+00', '2025-10-20 14:46:26.156691+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (632, 'testuser1760971471511@example.com', 'testpassword123', 'Test User 1760971471511', '+56971471511', 'user', false, false, '2025-10-20 14:44:31.587095+00', '2025-10-20 14:44:31.587095+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (634, 'testuser1760971472708@example.com', 'testpassword123', 'Test User 1760971472708', '+56971472708', 'user', false, false, '2025-10-20 14:44:32.793818+00', '2025-10-20 14:44:32.793818+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (637, 'testuser1760971475507@example.com', 'testpassword123', 'Test User 1760971475507', '+56971475507', 'user', false, false, '2025-10-20 14:44:35.582828+00', '2025-10-20 14:44:35.582828+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (677, 'testuser1760971586585@example.com', 'testpassword123', 'Test User 1760971586585', '+56971586585', 'user', false, false, '2025-10-20 14:46:26.671717+00', '2025-10-20 14:46:26.671717+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (679, 'testuser1760971586951@example.com', 'testpassword123', 'Test User 1760971586951', '+56971586951', 'user', false, false, '2025-10-20 14:46:27.02788+00', '2025-10-20 14:46:27.02788+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (682, 'testuser1760971587592@example.com', 'testpassword123', 'Test User 1760971587592', '+56971587592', 'user', false, false, '2025-10-20 14:46:27.659617+00', '2025-10-20 14:46:27.659617+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (680, 'testuser1760971587192@example.com', 'testpassword123', 'Test User 1760971587192', '+56971587192', 'user', false, false, '2025-10-20 14:46:27.281479+00', '2025-10-20 14:46:27.281479+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (688, 'testuser1760971589964@example.com', 'testpassword123', 'Test User 1760971589964', '+56971589964', 'user', false, false, '2025-10-20 14:46:30.017505+00', '2025-10-20 14:46:30.017505+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (689, 'testuser1760971590517@example.com', 'testpassword123', 'Test User 1760971590517', '+56971590517', 'user', false, false, '2025-10-20 14:46:30.586402+00', '2025-10-20 14:46:30.586402+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (692, 'testuser1760971592438@example.com', 'testpassword123', 'Test User 1760971592438', '+56971592438', 'user', false, false, '2025-10-20 14:46:32.528892+00', '2025-10-20 14:46:32.528892+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (693, 'testuser1760971593076@example.com', 'testpassword123', 'Test User 1760971593076', '+56971593076', 'user', false, false, '2025-10-20 14:46:33.16319+00', '2025-10-20 14:46:33.16319+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (694, 'testuser1760971593716@example.com', 'testpassword123', 'Test User 1760971593716', '+56971593716', 'user', false, false, '2025-10-20 14:46:33.782935+00', '2025-10-20 14:46:33.782935+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (695, 'testuser1760971594377@example.com', 'testpassword123', 'Test User 1760971594377', '+56971594377', 'user', false, false, '2025-10-20 14:46:34.456916+00', '2025-10-20 14:46:34.456916+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (645, 'testuser1760971579557@example.com', 'testpassword123', 'Test User 1760971579557', '+56971579557', 'user', false, false, '2025-10-20 14:46:19.640184+00', '2025-10-20 14:46:19.640184+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (603, 'testuser1760971464469@example.com', 'testpassword123', 'Test User 1760971464469', '+56971464469', 'user', false, false, '2025-10-20 14:44:24.530478+00', '2025-10-20 14:44:24.530478+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (604, 'testuser1760971464503@example.com', 'testpassword123', 'Test User 1760971464503', '+56971464503', 'user', false, false, '2025-10-20 14:44:24.596216+00', '2025-10-20 14:44:24.596216+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (610, 'testuser1760971465585@example.com', 'testpassword123', 'Test User 1760971465585', '+56971465585', 'user', false, false, '2025-10-20 14:44:25.65205+00', '2025-10-20 14:44:25.65205+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (649, 'testuser1760971580415@example.com', 'testpassword123', 'Test User 1760971580415', '+56971580415', 'user', false, false, '2025-10-20 14:46:20.488933+00', '2025-10-20 14:46:20.488933+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (615, 'testuser1760971466611@example.com', 'testpassword123', 'Test User 1760971466611', '+56971466611', 'user', false, false, '2025-10-20 14:44:26.678438+00', '2025-10-20 14:44:26.678438+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (651, 'testuser1760971580841@example.com', 'testpassword123', 'Test User 1760971580841', '+56971580841', 'user', false, false, '2025-10-20 14:46:20.913765+00', '2025-10-20 14:46:20.913765+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (620, 'testuser1760971467398@example.com', 'testpassword123', 'Test User 1760971467398', '+56971467398', 'user', false, false, '2025-10-20 14:44:27.463224+00', '2025-10-20 14:44:27.463224+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (625, 'testuser1760971468183@example.com', 'testpassword123', 'Test User 1760971468183', '+56971468183', 'user', false, false, '2025-10-20 14:44:28.261856+00', '2025-10-20 14:44:28.261856+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (653, 'testuser1760971581226@example.com', 'testpassword123', 'Test User 1760971581226', '+56971581226', 'user', false, false, '2025-10-20 14:46:21.291249+00', '2025-10-20 14:46:21.291249+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (628, 'testuser1760971469298@example.com', 'testpassword123', 'Test User 1760971469298', '+56971469298', 'user', false, false, '2025-10-20 14:44:29.376261+00', '2025-10-20 14:44:29.376261+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (629, 'testuser1760971469838@example.com', 'testpassword123', 'Test User 1760971469838', '+56971469838', 'user', false, false, '2025-10-20 14:44:29.907672+00', '2025-10-20 14:44:29.907672+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (654, 'testuser1760971581548@example.com', 'testpassword123', 'Test User 1760971581548', '+56971581548', 'user', false, false, '2025-10-20 14:46:21.6138+00', '2025-10-20 14:46:21.6138+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (631, 'testuser1760971470952@example.com', 'testpassword123', 'Test User 1760971470952', '+56971470952', 'user', false, false, '2025-10-20 14:44:31.023952+00', '2025-10-20 14:44:31.023952+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (635, 'testuser1760971473415@example.com', 'testpassword123', 'Test User 1760971473415', '+56971473415', 'user', false, false, '2025-10-20 14:44:33.489484+00', '2025-10-20 14:44:33.489484+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (655, 'testuser1760971581731@example.com', 'testpassword123', 'Test User 1760971581731', '+56971581731', 'user', false, false, '2025-10-20 14:46:21.845379+00', '2025-10-20 14:46:21.845379+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (658, 'testuser1760971582341@example.com', 'testpassword123', 'Test User 1760971582341', '+56971582341', 'user', false, false, '2025-10-20 14:46:22.414526+00', '2025-10-20 14:46:22.414526+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (660, 'testuser1760971582666@example.com', 'testpassword123', 'Test User 1760971582666', '+56971582666', 'user', false, false, '2025-10-20 14:46:22.732896+00', '2025-10-20 14:46:22.732896+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (665, 'testuser1760971583796@example.com', 'testpassword123', 'Test User 1760971583796', '+56971583796', 'user', false, false, '2025-10-20 14:46:23.868134+00', '2025-10-20 14:46:23.868134+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (668, 'testuser1760971584626@example.com', 'testpassword123', 'Test User 1760971584626', '+56971584626', 'user', false, false, '2025-10-20 14:46:24.708785+00', '2025-10-20 14:46:24.708785+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (669, 'testuser1760971584932@example.com', 'testpassword123', 'Test User 1760971584932', '+56971584932', 'user', false, false, '2025-10-20 14:46:25.013475+00', '2025-10-20 14:46:25.013475+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (671, 'testuser1760971585241@example.com', 'testpassword123', 'Test User 1760971585241', '+56971585241', 'user', false, false, '2025-10-20 14:46:25.310233+00', '2025-10-20 14:46:25.310233+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (672, 'testuser1760971585510@example.com', 'testpassword123', 'Test User 1760971585510', '+56971585510', 'user', false, false, '2025-10-20 14:46:25.560475+00', '2025-10-20 14:46:25.560475+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (674, 'testuser1760971585855@example.com', 'testpassword123', 'Test User 1760971585855', '+56971585855', 'user', false, false, '2025-10-20 14:46:25.958589+00', '2025-10-20 14:46:25.958589+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (678, 'testuser1760971586675@example.com', 'testpassword123', 'Test User 1760971586675', '+56971586675', 'user', false, false, '2025-10-20 14:46:26.750371+00', '2025-10-20 14:46:26.750371+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (681, 'testuser1760971587240@example.com', 'testpassword123', 'Test User 1760971587240', '+56971587240', 'user', false, false, '2025-10-20 14:46:27.30931+00', '2025-10-20 14:46:27.30931+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (684, 'testuser1760971587939@example.com', 'testpassword123', 'Test User 1760971587939', '+56971587939', 'user', false, false, '2025-10-20 14:46:28.026211+00', '2025-10-20 14:46:28.026211+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (685, 'testuser1760971588285@example.com', 'testpassword123', 'Test User 1760971588285', '+56971588285', 'user', false, false, '2025-10-20 14:46:28.362998+00', '2025-10-20 14:46:28.362998+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (686, 'testuser1760971588545@example.com', 'testpassword123', 'Test User 1760971588545', '+56971588545', 'user', false, false, '2025-10-20 14:46:28.916824+00', '2025-10-20 14:46:28.916824+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (687, 'testuser1760971589430@example.com', 'testpassword123', 'Test User 1760971589430', '+56971589430', 'user', false, false, '2025-10-20 14:46:29.495299+00', '2025-10-20 14:46:29.495299+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (696, 'testuser1760971595006@example.com', 'testpassword123', 'Test User 1760971595006', '+56971595006', 'user', false, false, '2025-10-20 14:46:35.104256+00', '2025-10-20 14:46:35.104256+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (697, 'testuser1760971595582@example.com', 'testpassword123', 'Test User 1760971595582', '+56971595582', 'user', false, false, '2025-10-20 14:46:35.651562+00', '2025-10-20 14:46:35.651562+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (698, 'testuser1760971596533@example.com', 'testpassword123', 'Test User 1760971596533', '+56971596533', 'user', false, false, '2025-10-20 14:46:36.617368+00', '2025-10-20 14:46:36.617368+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (699, 'testuser1760971597208@example.com', 'testpassword123', 'Test User 1760971597208', '+56971597208', 'user', false, false, '2025-10-20 14:46:37.283368+00', '2025-10-20 14:46:37.283368+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (715, 'testuser1760986088362@example.com', 'testpassword123', 'Test User 1760986088362', '+56986088362', 'user', false, false, '2025-10-20 18:48:08.423587+00', '2025-10-20 18:48:08.423587+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (716, 'testuser1760986088663@example.com', 'testpassword123', 'Test User 1760986088663', '+56986088663', 'user', false, false, '2025-10-20 18:48:08.711464+00', '2025-10-20 18:48:08.711464+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (717, 'testuser1760986088942@example.com', 'testpassword123', 'Test User 1760986088942', '+56986088942', 'user', false, false, '2025-10-20 18:48:08.999101+00', '2025-10-20 18:48:08.999101+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (607, 'testuser1760971465051@example.com', 'testpassword123', 'Test User 1760971465051', '+56971465051', 'user', false, false, '2025-10-20 14:44:25.116821+00', '2025-10-20 14:44:25.116821+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (648, 'testuser1760971580292@example.com', 'testpassword123', 'Test User 1760971580292', '+56971580292', 'user', false, false, '2025-10-20 14:46:20.347363+00', '2025-10-20 14:46:20.347363+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (617, 'testuser1760971466861@example.com', 'testpassword123', 'Test User 1760971466861', '+56971466861', 'user', false, false, '2025-10-20 14:44:26.922343+00', '2025-10-20 14:44:26.922343+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (616, 'testuser1760971466754@example.com', 'testpassword123', 'Test User 1760971466754', '+56971466754', 'user', false, false, '2025-10-20 14:44:26.82156+00', '2025-10-20 14:44:26.82156+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (650, 'testuser1760971580560@example.com', 'testpassword123', 'Test User 1760971580560', '+56971580560', 'user', false, false, '2025-10-20 14:46:20.627971+00', '2025-10-20 14:46:20.627971+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (622, 'testuser1760971467916@example.com', 'testpassword123', 'Test User 1760971467916', '+56971467916', 'user', false, false, '2025-10-20 14:44:27.982644+00', '2025-10-20 14:44:27.982644+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (630, 'testuser1760971470389@example.com', 'testpassword123', 'Test User 1760971470389', '+56971470389', 'user', false, false, '2025-10-20 14:44:30.458472+00', '2025-10-20 14:44:30.458472+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (656, 'testuser1760971581821@example.com', 'testpassword123', 'Test User 1760971581821', '+56971581821', 'user', false, false, '2025-10-20 14:46:21.890932+00', '2025-10-20 14:46:21.890932+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (633, 'testuser1760971472103@example.com', 'testpassword123', 'Test User 1760971472103', '+56971472103', 'user', false, false, '2025-10-20 14:44:32.185311+00', '2025-10-20 14:44:32.185311+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (636, 'testuser1760971474577@example.com', 'testpassword123', 'Test User 1760971474577', '+56971474577', 'user', false, false, '2025-10-20 14:44:34.656007+00', '2025-10-20 14:44:34.656007+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (657, 'testuser1760971582075@example.com', 'testpassword123', 'Test User 1760971582075', '+56971582075', 'user', false, false, '2025-10-20 14:46:22.13882+00', '2025-10-20 14:46:22.13882+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (638, 'testuser1760971476069@example.com', 'testpassword123', 'Test User 1760971476069', '+56971476069', 'user', false, false, '2025-10-20 14:44:36.170023+00', '2025-10-20 14:44:36.170023+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (639, 'testuser1760971476661@example.com', 'testpassword123', 'Test User 1760971476661', '+56971476661', 'user', false, false, '2025-10-20 14:44:36.750318+00', '2025-10-20 14:44:36.750318+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (659, 'testuser1760971582372@example.com', 'testpassword123', 'Test User 1760971582372', '+56971582372', 'user', false, false, '2025-10-20 14:46:22.457969+00', '2025-10-20 14:46:22.457969+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (663, 'testuser1760971583206@example.com', 'testpassword123', 'Test User 1760971583206', '+56971583206', 'user', false, false, '2025-10-20 14:46:23.283012+00', '2025-10-20 14:46:23.283012+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (661, 'testuser1760971582887@example.com', 'testpassword123', 'Test User 1760971582887', '+56971582887', 'user', false, false, '2025-10-20 14:46:22.944973+00', '2025-10-20 14:46:22.944973+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (664, 'testuser1760971583803@example.com', 'testpassword123', 'Test User 1760971583803', '+56971583803', 'user', false, false, '2025-10-20 14:46:23.860925+00', '2025-10-20 14:46:23.860925+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (670, 'testuser1760971585234@example.com', 'testpassword123', 'Test User 1760971585234', '+56971585234', 'user', false, false, '2025-10-20 14:46:25.301043+00', '2025-10-20 14:46:25.301043+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (676, 'testuser1760971586356@example.com', 'testpassword123', 'Test User 1760971586356', '+56971586356', 'user', false, false, '2025-10-20 14:46:26.436668+00', '2025-10-20 14:46:26.436668+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (683, 'testuser1760971587880@example.com', 'testpassword123', 'Test User 1760971587880', '+56971587880', 'user', false, false, '2025-10-20 14:46:27.943137+00', '2025-10-20 14:46:27.943137+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (690, 'testuser1760971591146@example.com', 'testpassword123', 'Test User 1760971591146', '+56971591146', 'user', false, false, '2025-10-20 14:46:31.256383+00', '2025-10-20 14:46:31.256383+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (691, 'testuser1760971591749@example.com', 'testpassword123', 'Test User 1760971591749', '+56971591749', 'user', false, false, '2025-10-20 14:46:31.825072+00', '2025-10-20 14:46:31.825072+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (700, 'testuser1760986081796@example.com', 'testpassword123', 'Test User 1760986081796', '+56986081796', 'user', false, false, '2025-10-20 18:48:03.210209+00', '2025-10-20 18:48:03.210209+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (701, 'testuser1760986083800@example.com', 'testpassword123', 'Test User 1760986083800', '+56986083800', 'user', false, false, '2025-10-20 18:48:03.866057+00', '2025-10-20 18:48:03.866057+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (702, 'testuser1760986084110@example.com', 'testpassword123', 'Test User 1760986084110', '+56986084110', 'user', false, false, '2025-10-20 18:48:04.183829+00', '2025-10-20 18:48:04.183829+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (703, 'testuser1760986084418@example.com', 'testpassword123', 'Test User 1760986084418', '+56986084418', 'user', false, false, '2025-10-20 18:48:04.502784+00', '2025-10-20 18:48:04.502784+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (704, 'testuser1760986084836@example.com', 'testpassword123', 'Test User 1760986084836', '+56986084836', 'user', false, false, '2025-10-20 18:48:04.918545+00', '2025-10-20 18:48:04.918545+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (705, 'testuser1760986085242@example.com', 'testpassword123', 'Test User 1760986085242', '+56986085242', 'user', false, false, '2025-10-20 18:48:05.319199+00', '2025-10-20 18:48:05.319199+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (706, 'testuser1760986085604@example.com', 'testpassword123', 'Test User 1760986085604', '+56986085604', 'user', false, false, '2025-10-20 18:48:05.669966+00', '2025-10-20 18:48:05.669966+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (707, 'testuser1760986085964@example.com', 'testpassword123', 'Test User 1760986085964', '+56986085964', 'user', false, false, '2025-10-20 18:48:06.025762+00', '2025-10-20 18:48:06.025762+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (708, 'testuser1760986086332@example.com', 'testpassword123', 'Test User 1760986086332', '+56986086332', 'user', false, false, '2025-10-20 18:48:06.398848+00', '2025-10-20 18:48:06.398848+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (709, 'testuser1760986086638@example.com', 'testpassword123', 'Test User 1760986086638', '+56986086638', 'user', false, false, '2025-10-20 18:48:06.705422+00', '2025-10-20 18:48:06.705422+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (710, 'testuser1760986086923@example.com', 'testpassword123', 'Test User 1760986086923', '+56986086923', 'user', false, false, '2025-10-20 18:48:06.993185+00', '2025-10-20 18:48:06.993185+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (711, 'testuser1760986087214@example.com', 'testpassword123', 'Test User 1760986087214', '+56986087214', 'user', false, false, '2025-10-20 18:48:07.261262+00', '2025-10-20 18:48:07.261262+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (712, 'testuser1760986087476@example.com', 'testpassword123', 'Test User 1760986087476', '+56986087476', 'user', false, false, '2025-10-20 18:48:07.553458+00', '2025-10-20 18:48:07.553458+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (713, 'testuser1760986087769@example.com', 'testpassword123', 'Test User 1760986087769', '+56986087769', 'user', false, false, '2025-10-20 18:48:07.830889+00', '2025-10-20 18:48:07.830889+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (714, 'testuser1760986088063@example.com', 'testpassword123', 'Test User 1760986088063', '+56986088063', 'user', false, false, '2025-10-20 18:48:08.13054+00', '2025-10-20 18:48:08.13054+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (718, 'testuser1760986089212@example.com', 'testpassword123', 'Test User 1760986089212', '+56986089212', 'user', false, false, '2025-10-20 18:48:09.290157+00', '2025-10-20 18:48:09.290157+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (719, 'testuser1760986089524@example.com', 'testpassword123', 'Test User 1760986089524', '+56986089524', 'user', false, false, '2025-10-20 18:48:09.599816+00', '2025-10-20 18:48:09.599816+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (720, 'testuser1760986089885@example.com', 'testpassword123', 'Test User 1760986089885', '+56986089885', 'user', false, false, '2025-10-20 18:48:09.970718+00', '2025-10-20 18:48:09.970718+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (721, 'testuser1760986090211@example.com', 'testpassword123', 'Test User 1760986090211', '+56986090211', 'user', false, false, '2025-10-20 18:48:10.292677+00', '2025-10-20 18:48:10.292677+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (722, 'testuser1760986090579@example.com', 'testpassword123', 'Test User 1760986090579', '+56986090579', 'user', false, false, '2025-10-20 18:48:10.637499+00', '2025-10-20 18:48:10.637499+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (723, 'testuser1760986090839@example.com', 'testpassword123', 'Test User 1760986090839', '+56986090839', 'user', false, false, '2025-10-20 18:48:10.906811+00', '2025-10-20 18:48:10.906811+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (724, 'testuser1760986091129@example.com', 'testpassword123', 'Test User 1760986091129', '+56986091129', 'user', false, false, '2025-10-20 18:48:11.183134+00', '2025-10-20 18:48:11.183134+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (725, 'testuser1760986091455@example.com', 'testpassword123', 'Test User 1760986091455', '+56986091455', 'user', false, false, '2025-10-20 18:48:11.511085+00', '2025-10-20 18:48:11.511085+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (726, 'testuser1760986091740@example.com', 'testpassword123', 'Test User 1760986091740', '+56986091740', 'user', false, false, '2025-10-20 18:48:11.803204+00', '2025-10-20 18:48:11.803204+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (727, 'testuser1760986092035@example.com', 'testpassword123', 'Test User 1760986092035', '+56986092035', 'user', false, false, '2025-10-20 18:48:12.098129+00', '2025-10-20 18:48:12.098129+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (728, 'testuser1760986092453@example.com', 'testpassword123', 'Test User 1760986092453', '+56986092453', 'user', false, false, '2025-10-20 18:48:12.513439+00', '2025-10-20 18:48:12.513439+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (729, 'testuser1760986092749@example.com', 'testpassword123', 'Test User 1760986092749', '+56986092749', 'user', false, false, '2025-10-20 18:48:12.804832+00', '2025-10-20 18:48:12.804832+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (730, 'testuser1760986093024@example.com', 'testpassword123', 'Test User 1760986093024', '+56986093024', 'user', false, false, '2025-10-20 18:48:13.074206+00', '2025-10-20 18:48:13.074206+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (731, 'testuser1760994339865@example.com', 'testpassword123', 'Test User 1760994339865', '+56994339865', 'user', false, false, '2025-10-20 21:05:41.175687+00', '2025-10-20 21:05:41.175687+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (732, 'testuser1760994341725@example.com', 'testpassword123', 'Test User 1760994341725', '+56994341725', 'user', false, false, '2025-10-20 21:05:41.837572+00', '2025-10-20 21:05:41.837572+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (733, 'testuser1760994342130@example.com', 'testpassword123', 'Test User 1760994342130', '+56994342130', 'user', false, false, '2025-10-20 21:05:42.211254+00', '2025-10-20 21:05:42.211254+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (734, 'testuser1760994342482@example.com', 'testpassword123', 'Test User 1760994342482', '+56994342482', 'user', false, false, '2025-10-20 21:05:42.576754+00', '2025-10-20 21:05:42.576754+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (735, 'testuser1760994342888@example.com', 'testpassword123', 'Test User 1760994342888', '+56994342888', 'user', false, false, '2025-10-20 21:05:42.977262+00', '2025-10-20 21:05:42.977262+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (736, 'testuser1760994343257@example.com', 'testpassword123', 'Test User 1760994343257', '+56994343257', 'user', false, false, '2025-10-20 21:05:43.323652+00', '2025-10-20 21:05:43.323652+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (737, 'testuser1760994343600@example.com', 'testpassword123', 'Test User 1760994343600', '+56994343600', 'user', false, false, '2025-10-20 21:05:43.66985+00', '2025-10-20 21:05:43.66985+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (738, 'testuser1760994343901@example.com', 'testpassword123', 'Test User 1760994343901', '+56994343901', 'user', false, false, '2025-10-20 21:05:43.983604+00', '2025-10-20 21:05:43.983604+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (739, 'testuser1760994344206@example.com', 'testpassword123', 'Test User 1760994344206', '+56994344206', 'user', false, false, '2025-10-20 21:05:44.284633+00', '2025-10-20 21:05:44.284633+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (740, 'testuser1760994344507@example.com', 'testpassword123', 'Test User 1760994344507', '+56994344507', 'user', false, false, '2025-10-20 21:05:44.594742+00', '2025-10-20 21:05:44.594742+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (741, 'testuser1760994344823@example.com', 'testpassword123', 'Test User 1760994344823', '+56994344823', 'user', false, false, '2025-10-20 21:05:44.907865+00', '2025-10-20 21:05:44.907865+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (742, 'testuser1760994345214@example.com', 'testpassword123', 'Test User 1760994345214', '+56994345214', 'user', false, false, '2025-10-20 21:05:45.285351+00', '2025-10-20 21:05:45.285351+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (743, 'testuser1760994345514@example.com', 'testpassword123', 'Test User 1760994345514', '+56994345514', 'user', false, false, '2025-10-20 21:05:45.59528+00', '2025-10-20 21:05:45.59528+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (744, 'testuser1760994345855@example.com', 'testpassword123', 'Test User 1760994345855', '+56994345855', 'user', false, false, '2025-10-20 21:05:45.922602+00', '2025-10-20 21:05:45.922602+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (745, 'testuser1760994346220@example.com', 'testpassword123', 'Test User 1760994346220', '+56994346220', 'user', false, false, '2025-10-20 21:05:46.281113+00', '2025-10-20 21:05:46.281113+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (746, 'testuser1760994346554@example.com', 'testpassword123', 'Test User 1760994346554', '+56994346554', 'user', false, false, '2025-10-20 21:05:46.619562+00', '2025-10-20 21:05:46.619562+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (747, 'testuser1760994346839@example.com', 'testpassword123', 'Test User 1760994346839', '+56994346839', 'user', false, false, '2025-10-20 21:05:46.919031+00', '2025-10-20 21:05:46.919031+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (748, 'testuser1760994347158@example.com', 'testpassword123', 'Test User 1760994347158', '+56994347158', 'user', false, false, '2025-10-20 21:05:47.246869+00', '2025-10-20 21:05:47.246869+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (749, 'testuser1760994347541@example.com', 'testpassword123', 'Test User 1760994347541', '+56994347541', 'user', false, false, '2025-10-20 21:05:47.62749+00', '2025-10-20 21:05:47.62749+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (750, 'testuser1760994347986@example.com', 'testpassword123', 'Test User 1760994347986', '+56994347986', 'user', false, false, '2025-10-20 21:05:48.071708+00', '2025-10-20 21:05:48.071708+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (751, 'testuser1760994348333@example.com', 'testpassword123', 'Test User 1760994348333', '+56994348333', 'user', false, false, '2025-10-20 21:05:48.403717+00', '2025-10-20 21:05:48.403717+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (752, 'testuser1760994348628@example.com', 'testpassword123', 'Test User 1760994348628', '+56994348628', 'user', false, false, '2025-10-20 21:05:48.707989+00', '2025-10-20 21:05:48.707989+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (753, 'testuser1760994348972@example.com', 'testpassword123', 'Test User 1760994348972', '+56994348972', 'user', false, false, '2025-10-20 21:05:49.047218+00', '2025-10-20 21:05:49.047218+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (823, 'testuser1761006302018@example.com', 'testpassword123', 'Test User 1761006302018', '+56906302018', 'user', false, false, '2025-10-21 00:25:03.588354+00', '2025-10-21 00:25:03.588354+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (754, 'testuser1760994349269@example.com', 'testpassword123', 'Test User 1760994349269', '+56994349269', 'user', false, false, '2025-10-20 21:05:49.340408+00', '2025-10-20 21:05:49.340408+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (755, 'testuser1760994349549@example.com', 'testpassword123', 'Test User 1760994349549', '+56994349549', 'user', false, false, '2025-10-20 21:05:49.614552+00', '2025-10-20 21:05:49.614552+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (756, 'testuser1760994349907@example.com', 'testpassword123', 'Test User 1760994349907', '+56994349907', 'user', false, false, '2025-10-20 21:05:49.985147+00', '2025-10-20 21:05:49.985147+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (757, 'testuser1760994350278@example.com', 'testpassword123', 'Test User 1760994350278', '+56994350278', 'user', false, false, '2025-10-20 21:05:50.400588+00', '2025-10-20 21:05:50.400588+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (758, 'testuser1760994350674@example.com', 'testpassword123', 'Test User 1760994350674', '+56994350674', 'user', false, false, '2025-10-20 21:05:50.788036+00', '2025-10-20 21:05:50.788036+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (759, 'testuser1760994351047@example.com', 'testpassword123', 'Test User 1760994351047', '+56994351047', 'user', false, false, '2025-10-20 21:05:51.128596+00', '2025-10-20 21:05:51.128596+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (760, 'testuser1760994351358@example.com', 'testpassword123', 'Test User 1760994351358', '+56994351358', 'user', false, false, '2025-10-20 21:05:51.428061+00', '2025-10-20 21:05:51.428061+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (761, 'testuser1760994351649@example.com', 'testpassword123', 'Test User 1760994351649', '+56994351649', 'user', false, false, '2025-10-20 21:05:51.702934+00', '2025-10-20 21:05:51.702934+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (763, 'testuser1760999765784@example.com', 'testpassword123', 'Test User 1760999765784', '+56999765784', 'user', false, false, '2025-10-20 22:36:07.149086+00', '2025-10-20 22:36:07.149086+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (762, 'testuser1760999765779@example.com', 'testpassword123', 'Test User 1760999765779', '+56999765779', 'user', false, false, '2025-10-20 22:36:07.147612+00', '2025-10-20 22:36:07.147612+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (764, 'testuser1760999767727@example.com', 'testpassword123', 'Test User 1760999767727', '+56999767727', 'user', false, false, '2025-10-20 22:36:07.819981+00', '2025-10-20 22:36:07.819981+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (766, 'testuser1760999768086@example.com', 'testpassword123', 'Test User 1760999768086', '+56999768086', 'user', false, false, '2025-10-20 22:36:08.187128+00', '2025-10-20 22:36:08.187128+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (765, 'testuser1760999768033@example.com', 'testpassword123', 'Test User 1760999768033', '+56999768033', 'user', false, false, '2025-10-20 22:36:08.128906+00', '2025-10-20 22:36:08.128906+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (767, 'testuser1760999768461@example.com', 'testpassword123', 'Test User 1760999768461', '+56999768461', 'user', false, false, '2025-10-20 22:36:08.585129+00', '2025-10-20 22:36:08.585129+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (769, 'testuser1760999768854@example.com', 'testpassword123', 'Test User 1760999768854', '+56999768854', 'user', false, false, '2025-10-20 22:36:08.958554+00', '2025-10-20 22:36:08.958554+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (768, 'testuser1760999768636@example.com', 'testpassword123', 'Test User 1760999768636', '+56999768636', 'user', false, false, '2025-10-20 22:36:08.745267+00', '2025-10-20 22:36:08.745267+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (770, 'testuser1760999769193@example.com', 'testpassword123', 'Test User 1760999769193', '+56999769193', 'user', false, false, '2025-10-20 22:36:09.334554+00', '2025-10-20 22:36:09.334554+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (771, 'testuser1760999769279@example.com', 'testpassword123', 'Test User 1760999769279', '+56999769279', 'user', false, false, '2025-10-20 22:36:09.355101+00', '2025-10-20 22:36:09.355101+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (772, 'testuser1760999769564@example.com', 'testpassword123', 'Test User 1760999769564', '+56999769564', 'user', false, false, '2025-10-20 22:36:09.660604+00', '2025-10-20 22:36:09.660604+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (774, 'testuser1760999769902@example.com', 'testpassword123', 'Test User 1760999769902', '+56999769902', 'user', false, false, '2025-10-20 22:36:09.981349+00', '2025-10-20 22:36:09.981349+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (773, 'testuser1760999769840@example.com', 'testpassword123', 'Test User 1760999769840', '+56999769840', 'user', false, false, '2025-10-20 22:36:09.911977+00', '2025-10-20 22:36:09.911977+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (775, 'testuser1760999770223@example.com', 'testpassword123', 'Test User 1760999770223', '+56999770223', 'user', false, false, '2025-10-20 22:36:10.321679+00', '2025-10-20 22:36:10.321679+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (777, 'testuser1760999770556@example.com', 'testpassword123', 'Test User 1760999770556', '+56999770556', 'user', false, false, '2025-10-20 22:36:10.632904+00', '2025-10-20 22:36:10.632904+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (776, 'testuser1760999770417@example.com', 'testpassword123', 'Test User 1760999770417', '+56999770417', 'user', false, false, '2025-10-20 22:36:10.488875+00', '2025-10-20 22:36:10.488875+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (778, 'testuser1760999770858@example.com', 'testpassword123', 'Test User 1760999770858', '+56999770858', 'user', false, false, '2025-10-20 22:36:10.936247+00', '2025-10-20 22:36:10.936247+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (780, 'testuser1760999771139@example.com', 'testpassword123', 'Test User 1760999771139', '+56999771139', 'user', false, false, '2025-10-20 22:36:11.215128+00', '2025-10-20 22:36:11.215128+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (779, 'testuser1760999770995@example.com', 'testpassword123', 'Test User 1760999770995', '+56999770995', 'user', false, false, '2025-10-20 22:36:11.087965+00', '2025-10-20 22:36:11.087965+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (781, 'testuser1760999771406@example.com', 'testpassword123', 'Test User 1760999771406', '+56999771406', 'user', false, false, '2025-10-20 22:36:11.48806+00', '2025-10-20 22:36:11.48806+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (783, 'testuser1760999771732@example.com', 'testpassword123', 'Test User 1760999771732', '+56999771732', 'user', false, false, '2025-10-20 22:36:11.811614+00', '2025-10-20 22:36:11.811614+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (782, 'testuser1760999771601@example.com', 'testpassword123', 'Test User 1760999771601', '+56999771601', 'user', false, false, '2025-10-20 22:36:11.691152+00', '2025-10-20 22:36:11.691152+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (784, 'testuser1760999772007@example.com', 'testpassword123', 'Test User 1760999772007', '+56999772007', 'user', false, false, '2025-10-20 22:36:12.095367+00', '2025-10-20 22:36:12.095367+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (786, 'testuser1760999772296@example.com', 'testpassword123', 'Test User 1760999772296', '+56999772296', 'user', false, false, '2025-10-20 22:36:12.367373+00', '2025-10-20 22:36:12.367373+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (785, 'testuser1760999772150@example.com', 'testpassword123', 'Test User 1760999772150', '+56999772150', 'user', false, false, '2025-10-20 22:36:12.230133+00', '2025-10-20 22:36:12.230133+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (787, 'testuser1760999772570@example.com', 'testpassword123', 'Test User 1760999772570', '+56999772570', 'user', false, false, '2025-10-20 22:36:12.651532+00', '2025-10-20 22:36:12.651532+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (789, 'testuser1760999772875@example.com', 'testpassword123', 'Test User 1760999772875', '+56999772875', 'user', false, false, '2025-10-20 22:36:12.95444+00', '2025-10-20 22:36:12.95444+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (788, 'testuser1760999772694@example.com', 'testpassword123', 'Test User 1760999772694', '+56999772694', 'user', false, false, '2025-10-20 22:36:12.765109+00', '2025-10-20 22:36:12.765109+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (790, 'testuser1760999773165@example.com', 'testpassword123', 'Test User 1760999773165', '+56999773165', 'user', false, false, '2025-10-20 22:36:13.262144+00', '2025-10-20 22:36:13.262144+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (824, 'testuser1761006304175@example.com', 'testpassword123', 'Test User 1761006304175', '+56906304175', 'user', false, false, '2025-10-21 00:25:04.428102+00', '2025-10-21 00:25:04.428102+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (801, 'testuser1760999775217@example.com', 'testpassword123', 'Test User 1760999775217', '+56999775217', 'user', false, false, '2025-10-20 22:36:15.295873+00', '2025-10-20 22:36:15.295873+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (800, 'testuser1760999774969@example.com', 'testpassword123', 'Test User 1760999774969', '+56999774969', 'user', false, false, '2025-10-20 22:36:15.071442+00', '2025-10-20 22:36:15.071442+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (828, 'testuser1761006305147@example.com', 'testpassword123', 'Test User 1761006305147', '+56906305147', 'user', false, false, '2025-10-21 00:25:05.571245+00', '2025-10-21 00:25:05.571245+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (806, 'testuser1760999776153@example.com', 'testpassword123', 'Test User 1760999776153', '+56999776153', 'user', false, false, '2025-10-20 22:36:16.240459+00', '2025-10-20 22:36:16.240459+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (808, 'testuser1760999776684@example.com', 'testpassword123', 'Test User 1760999776684', '+56999776684', 'user', false, false, '2025-10-20 22:36:16.777195+00', '2025-10-20 22:36:16.777195+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (829, 'testuser1761006305840@example.com', 'testpassword123', 'Test User 1761006305840', '+56906305840', 'user', false, false, '2025-10-21 00:25:06.014122+00', '2025-10-21 00:25:06.014122+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (814, 'testuser1760999779802@example.com', 'testpassword123', 'Test User 1760999779802', '+56999779802', 'user', false, false, '2025-10-20 22:36:19.887807+00', '2025-10-20 22:36:19.887807+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (832, 'testuser1761006306759@example.com', 'testpassword123', 'Test User 1761006306759', '+56906306759', 'user', false, false, '2025-10-21 00:25:06.859245+00', '2025-10-21 00:25:06.859245+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (836, 'testuser1761006308031@example.com', 'testpassword123', 'Test User 1761006308031', '+56906308031', 'user', false, false, '2025-10-21 00:25:08.133525+00', '2025-10-21 00:25:08.133525+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (842, 'testuser1761006309908@example.com', 'testpassword123', 'Test User 1761006309908', '+56906309908', 'user', false, false, '2025-10-21 00:25:09.994787+00', '2025-10-21 00:25:09.994787+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (852, 'testuser1761006312838@example.com', 'testpassword123', 'Test User 1761006312838', '+56906312838', 'user', false, false, '2025-10-21 00:25:12.923889+00', '2025-10-21 00:25:12.923889+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (864, 'testuser1761006316860@example.com', 'testpassword123', 'Test User 1761006316860', '+56906316860', 'user', false, false, '2025-10-21 00:25:16.964901+00', '2025-10-21 00:25:16.964901+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (867, 'testuser1761006317564@example.com', 'testpassword123', 'Test User 1761006317564', '+56906317564', 'user', false, false, '2025-10-21 00:25:17.858919+00', '2025-10-21 00:25:17.858919+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (869, 'testuser1761006318241@example.com', 'testpassword123', 'Test User 1761006318241', '+56906318241', 'user', false, false, '2025-10-21 00:25:18.406788+00', '2025-10-21 00:25:18.406788+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (871, 'testuser1761006318833@example.com', 'testpassword123', 'Test User 1761006318833', '+56906318833', 'user', false, false, '2025-10-21 00:25:19.118705+00', '2025-10-21 00:25:19.118705+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (881, 'testuser1761006321900@example.com', 'testpassword123', 'Test User 1761006321900', '+56906321900', 'user', false, false, '2025-10-21 00:25:22.169868+00', '2025-10-21 00:25:22.169868+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (884, 'testuser1761314658422@example.com', 'testpassword123', 'Test User 1761314658422', '+56914658422', 'user', true, false, '2025-10-24 14:04:18.494334+00', '2025-10-24 14:04:18.494334+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (886, 'testuser1761314658739@example.com', 'testpassword123', 'Test User 1761314658739', '+56914658739', 'user', true, false, '2025-10-24 14:04:18.792306+00', '2025-10-24 14:04:18.792306+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (888, 'testuser1761314659040@example.com', 'testpassword123', 'Test User 1761314659040', '+56914659040', 'user', true, false, '2025-10-24 14:04:19.21527+00', '2025-10-24 14:04:19.21527+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (890, 'testuser1761314659474@example.com', 'testpassword123', 'Test User 1761314659474', '+56914659474', 'user', true, false, '2025-10-24 14:04:19.540368+00', '2025-10-24 14:04:19.540368+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (892, 'testuser1761314659834@example.com', 'testpassword123', 'Test User 1761314659834', '+56914659834', 'user', true, false, '2025-10-24 14:04:19.875331+00', '2025-10-24 14:04:19.875331+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (894, 'testuser1761314660225@example.com', 'testpassword123', 'Test User 1761314660225', '+56914660225', 'user', true, false, '2025-10-24 14:04:20.276324+00', '2025-10-24 14:04:20.276324+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (896, 'testuser1761314660650@example.com', 'testpassword123', 'Test User 1761314660650', '+56914660650', 'user', true, false, '2025-10-24 14:04:20.698448+00', '2025-10-24 14:04:20.698448+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (898, 'testuser1761314661037@example.com', 'testpassword123', 'Test User 1761314661037', '+56914661037', 'user', true, false, '2025-10-24 14:04:21.102987+00', '2025-10-24 14:04:21.102987+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (822, 'testuser1761006302017@example.com', 'testpassword123', 'Test User 1761006302017', '+56906302017', 'user', false, false, '2025-10-21 00:25:03.588786+00', '2025-10-21 00:25:03.588786+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (792, 'testuser1760999773474@example.com', 'testpassword123', 'Test User 1760999773474', '+56999773474', 'user', false, false, '2025-10-20 22:36:13.54846+00', '2025-10-20 22:36:13.54846+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (791, 'testuser1760999773246@example.com', 'testpassword123', 'Test User 1760999773246', '+56999773246', 'user', false, false, '2025-10-20 22:36:13.371363+00', '2025-10-20 22:36:13.371363+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (825, 'testuser1761006304663@example.com', 'testpassword123', 'Test User 1761006304663', '+56906304663', 'user', false, false, '2025-10-21 00:25:04.882263+00', '2025-10-21 00:25:04.882263+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (799, 'testuser1760999774959@example.com', 'testpassword123', 'Test User 1760999774959', '+56999774959', 'user', false, false, '2025-10-20 22:36:15.033117+00', '2025-10-20 22:36:15.033117+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (804, 'testuser1760999775825@example.com', 'testpassword123', 'Test User 1760999775825', '+56999775825', 'user', false, false, '2025-10-20 22:36:15.897566+00', '2025-10-20 22:36:15.897566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (831, 'testuser1761006306486@example.com', 'testpassword123', 'Test User 1761006306486', '+56906306486', 'user', false, false, '2025-10-21 00:25:06.775073+00', '2025-10-21 00:25:06.775073+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (835, 'testuser1761006307728@example.com', 'testpassword123', 'Test User 1761006307728', '+56906307728', 'user', false, false, '2025-10-21 00:25:08.007476+00', '2025-10-21 00:25:08.007476+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (838, 'testuser1761006308636@example.com', 'testpassword123', 'Test User 1761006308636', '+56906308636', 'user', false, false, '2025-10-21 00:25:08.732662+00', '2025-10-21 00:25:08.732662+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (845, 'testuser1761006310642@example.com', 'testpassword123', 'Test User 1761006310642', '+56906310642', 'user', false, false, '2025-10-21 00:25:10.836971+00', '2025-10-21 00:25:10.836971+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (860, 'testuser1761006315599@example.com', 'testpassword123', 'Test User 1761006315599', '+56906315599', 'user', false, false, '2025-10-21 00:25:15.70263+00', '2025-10-21 00:25:15.70263+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (862, 'testuser1761006316268@example.com', 'testpassword123', 'Test User 1761006316268', '+56906316268', 'user', false, false, '2025-10-21 00:25:16.364206+00', '2025-10-21 00:25:16.364206+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (865, 'testuser1761006316972@example.com', 'testpassword123', 'Test User 1761006316972', '+56906316972', 'user', false, false, '2025-10-21 00:25:17.175504+00', '2025-10-21 00:25:17.175504+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (872, 'testuser1761006319416@example.com', 'testpassword123', 'Test User 1761006319416', '+56906319416', 'user', false, false, '2025-10-21 00:25:19.516996+00', '2025-10-21 00:25:19.516996+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (879, 'testuser1761006321298@example.com', 'testpassword123', 'Test User 1761006321298', '+56906321298', 'user', false, false, '2025-10-21 00:25:21.628458+00', '2025-10-21 00:25:21.628458+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (885, 'testuser1761314658606@example.com', 'testpassword123', 'Test User 1761314658606', '+56914658606', 'user', true, false, '2025-10-24 14:04:18.665761+00', '2025-10-24 14:04:18.665761+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (887, 'testuser1761314659018@example.com', 'testpassword123', 'Test User 1761314659018', '+56914659018', 'user', true, false, '2025-10-24 14:04:19.068757+00', '2025-10-24 14:04:19.068757+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (889, 'testuser1761314659419@example.com', 'testpassword123', 'Test User 1761314659419', '+56914659419', 'user', true, false, '2025-10-24 14:04:19.476879+00', '2025-10-24 14:04:19.476879+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (891, 'testuser1761314659768@example.com', 'testpassword123', 'Test User 1761314659768', '+56914659768', 'user', true, false, '2025-10-24 14:04:19.838043+00', '2025-10-24 14:04:19.838043+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (893, 'testuser1761314660109@example.com', 'testpassword123', 'Test User 1761314660109', '+56914660109', 'user', true, false, '2025-10-24 14:04:20.169719+00', '2025-10-24 14:04:20.169719+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (895, 'testuser1761314660434@example.com', 'testpassword123', 'Test User 1761314660434', '+56914660434', 'user', true, false, '2025-10-24 14:04:20.509879+00', '2025-10-24 14:04:20.509879+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (897, 'testuser1761314660752@example.com', 'testpassword123', 'Test User 1761314660752', '+56914660752', 'user', true, false, '2025-10-24 14:04:20.822587+00', '2025-10-24 14:04:20.822587+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (899, 'testuser1761314661062@example.com', 'testpassword123', 'Test User 1761314661062', '+56914661062', 'user', true, false, '2025-10-24 14:04:21.136123+00', '2025-10-24 14:04:21.136123+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (901, 'testuser1761314661488@example.com', 'testpassword123', 'Test User 1761314661488', '+56914661488', 'user', true, false, '2025-10-24 14:04:21.548579+00', '2025-10-24 14:04:21.548579+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (903, 'testuser1761314661921@example.com', 'testpassword123', 'Test User 1761314661921', '+56914661921', 'user', true, false, '2025-10-24 14:04:21.990132+00', '2025-10-24 14:04:21.990132+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (905, 'testuser1761314662302@example.com', 'testpassword123', 'Test User 1761314662302', '+56914662302', 'user', true, false, '2025-10-24 14:04:22.372707+00', '2025-10-24 14:04:22.372707+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (907, 'testuser1761314662609@example.com', 'testpassword123', 'Test User 1761314662609', '+56914662609', 'user', true, false, '2025-10-24 14:04:22.662812+00', '2025-10-24 14:04:22.662812+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (908, 'testuser1761314662757@example.com', 'testpassword123', 'Test User 1761314662757', '+56914662757', 'user', true, false, '2025-10-24 14:04:22.79286+00', '2025-10-24 14:04:22.79286+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (793, 'testuser1760999773760@example.com', 'testpassword123', 'Test User 1760999773760', '+56999773760', 'user', false, false, '2025-10-20 22:36:13.835009+00', '2025-10-20 22:36:13.835009+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (826, 'testuser1761006304669@example.com', 'testpassword123', 'Test User 1761006304669', '+56906304669', 'user', false, false, '2025-10-21 00:25:04.907371+00', '2025-10-21 00:25:04.907371+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (807, 'testuser1760999776408@example.com', 'testpassword123', 'Test User 1760999776408', '+56999776408', 'user', false, false, '2025-10-20 22:36:16.483174+00', '2025-10-20 22:36:16.483174+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (813, 'testuser1760999779186@example.com', 'testpassword123', 'Test User 1760999779186', '+56999779186', 'user', false, false, '2025-10-20 22:36:19.308337+00', '2025-10-20 22:36:19.308337+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (833, 'testuser1761006307080@example.com', 'testpassword123', 'Test User 1761006307080', '+56906307080', 'user', false, false, '2025-10-21 00:25:07.380578+00', '2025-10-21 00:25:07.380578+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (817, 'testuser1760999781782@example.com', 'testpassword123', 'Test User 1760999781782', '+56999781782', 'user', false, false, '2025-10-20 22:36:21.863852+00', '2025-10-20 22:36:21.863852+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (844, 'testuser1761006310523@example.com', 'testpassword123', 'Test User 1761006310523', '+56906310523', 'user', false, false, '2025-10-21 00:25:10.61339+00', '2025-10-21 00:25:10.61339+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (853, 'testuser1761006313233@example.com', 'testpassword123', 'Test User 1761006313233', '+56906313233', 'user', false, false, '2025-10-21 00:25:13.516189+00', '2025-10-21 00:25:13.516189+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (870, 'testuser1761006318795@example.com', 'testpassword123', 'Test User 1761006318795', '+56906318795', 'user', false, false, '2025-10-21 00:25:18.907944+00', '2025-10-21 00:25:18.907944+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (900, 'testuser1761314661441@example.com', 'testpassword123', 'Test User 1761314661441', '+56914661441', 'user', true, false, '2025-10-24 14:04:21.501986+00', '2025-10-24 14:04:21.501986+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (902, 'testuser1761314661771@example.com', 'testpassword123', 'Test User 1761314661771', '+56914661771', 'user', true, false, '2025-10-24 14:04:21.81786+00', '2025-10-24 14:04:21.81786+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (904, 'testuser1761314662036@example.com', 'testpassword123', 'Test User 1761314662036', '+56914662036', 'user', true, false, '2025-10-24 14:04:22.078893+00', '2025-10-24 14:04:22.078893+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (906, 'testuser1761314662364@example.com', 'testpassword123', 'Test User 1761314662364', '+56914662364', 'user', true, false, '2025-10-24 14:04:22.403784+00', '2025-10-24 14:04:22.403784+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (910, 'testuser1761314663107@example.com', 'testpassword123', 'Test User 1761314663107', '+56914663107', 'user', true, false, '2025-10-24 14:04:23.147545+00', '2025-10-24 14:04:23.147545+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (912, 'testuser1761314663470@example.com', 'testpassword123', 'Test User 1761314663470', '+56914663470', 'user', true, false, '2025-10-24 14:04:23.508912+00', '2025-10-24 14:04:23.508912+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (913, 'testuser1761314663491@example.com', 'testpassword123', 'Test User 1761314663491', '+56914663491', 'user', true, false, '2025-10-24 14:04:23.541581+00', '2025-10-24 14:04:23.541581+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (918, 'testuser1761314664361@example.com', 'testpassword123', 'Test User 1761314664361', '+56914664361', 'user', true, false, '2025-10-24 14:04:24.41542+00', '2025-10-24 14:04:24.41542+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (920, 'testuser1761314664886@example.com', 'testpassword123', 'Test User 1761314664886', '+56914664886', 'user', true, false, '2025-10-24 14:04:24.929144+00', '2025-10-24 14:04:24.929144+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (922, 'testuser1761314665297@example.com', 'testpassword123', 'Test User 1761314665297', '+56914665297', 'user', true, false, '2025-10-24 14:04:25.359746+00', '2025-10-24 14:04:25.359746+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (924, 'testuser1761314665722@example.com', 'testpassword123', 'Test User 1761314665722', '+56914665722', 'user', true, false, '2025-10-24 14:04:25.763421+00', '2025-10-24 14:04:25.763421+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (929, 'testuser1761314666559@example.com', 'testpassword123', 'Test User 1761314666559', '+56914666559', 'user', true, false, '2025-10-24 14:04:26.61494+00', '2025-10-24 14:04:26.61494+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (932, 'testuser1761314666966@example.com', 'testpassword123', 'Test User 1761314666966', '+56914666966', 'user', true, false, '2025-10-24 14:04:27.019111+00', '2025-10-24 14:04:27.019111+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (939, 'testuser1761314668987@example.com', 'testpassword123', 'Test User 1761314668987', '+56914668987', 'user', true, false, '2025-10-24 14:04:29.038502+00', '2025-10-24 14:04:29.038502+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (941, 'testuser1761314669828@example.com', 'testpassword123', 'Test User 1761314669828', '+56914669828', 'user', true, false, '2025-10-24 14:04:29.891136+00', '2025-10-24 14:04:29.891136+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (947, 'testuser1761314885893@example.com', 'testpassword123', 'Test User 1761314885893', '+56914885893', 'user', true, false, '2025-10-24 14:08:05.963621+00', '2025-10-24 14:08:05.963621+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (948, 'testuser1761314886028@example.com', 'testpassword123', 'Test User 1761314886028', '+56914886028', 'user', true, false, '2025-10-24 14:08:06.114206+00', '2025-10-24 14:08:06.114206+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (950, 'testuser1761314886382@example.com', 'testpassword123', 'Test User 1761314886382', '+56914886382', 'user', true, false, '2025-10-24 14:08:06.454039+00', '2025-10-24 14:08:06.454039+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (953, 'testuser1761314886995@example.com', 'testpassword123', 'Test User 1761314886995', '+56914886995', 'user', true, false, '2025-10-24 14:08:07.066344+00', '2025-10-24 14:08:07.066344+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (956, 'testuser1761314887578@example.com', 'testpassword123', 'Test User 1761314887578', '+56914887578', 'user', true, false, '2025-10-24 14:08:07.640882+00', '2025-10-24 14:08:07.640882+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (959, 'testuser1761314888069@example.com', 'testpassword123', 'Test User 1761314888069', '+56914888069', 'user', true, false, '2025-10-24 14:08:08.149913+00', '2025-10-24 14:08:08.149913+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (963, 'testuser1761314888951@example.com', 'testpassword123', 'Test User 1761314888951', '+56914888951', 'user', true, false, '2025-10-24 14:08:09.005448+00', '2025-10-24 14:08:09.005448+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (966, 'testuser1761314889366@example.com', 'testpassword123', 'Test User 1761314889366', '+56914889366', 'user', true, false, '2025-10-24 14:08:09.405308+00', '2025-10-24 14:08:09.405308+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (969, 'testuser1761314889944@example.com', 'testpassword123', 'Test User 1761314889944', '+56914889944', 'user', true, false, '2025-10-24 14:08:10.003396+00', '2025-10-24 14:08:10.003396+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (827, 'testuser1761006305412@example.com', 'testpassword123', 'Test User 1761006305412', '+56906305412', 'user', false, false, '2025-10-21 00:25:05.512296+00', '2025-10-21 00:25:05.512296+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (795, 'testuser1760999774046@example.com', 'testpassword123', 'Test User 1760999774046', '+56999774046', 'user', false, false, '2025-10-20 22:36:14.132705+00', '2025-10-20 22:36:14.132705+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (794, 'testuser1760999773889@example.com', 'testpassword123', 'Test User 1760999773889', '+56999773889', 'user', false, false, '2025-10-20 22:36:13.960268+00', '2025-10-20 22:36:13.960268+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (802, 'testuser1760999775528@example.com', 'testpassword123', 'Test User 1760999775528', '+56999775528', 'user', false, false, '2025-10-20 22:36:15.610084+00', '2025-10-20 22:36:15.610084+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (834, 'testuser1761006307347@example.com', 'testpassword123', 'Test User 1761006307347', '+56906307347', 'user', false, false, '2025-10-21 00:25:07.449473+00', '2025-10-21 00:25:07.449473+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (816, 'testuser1760999780993@example.com', 'testpassword123', 'Test User 1760999780993', '+56999780993', 'user', false, false, '2025-10-20 22:36:21.127467+00', '2025-10-20 22:36:21.127467+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (849, 'testuser1761006311859@example.com', 'testpassword123', 'Test User 1761006311859', '+56906311859', 'user', false, false, '2025-10-21 00:25:12.139364+00', '2025-10-21 00:25:12.139364+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (854, 'testuser1761006313629@example.com', 'testpassword123', 'Test User 1761006313629', '+56906313629', 'user', false, false, '2025-10-21 00:25:13.729568+00', '2025-10-21 00:25:13.729568+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (877, 'testuser1761006320799@example.com', 'testpassword123', 'Test User 1761006320799', '+56906320799', 'user', false, false, '2025-10-21 00:25:20.987538+00', '2025-10-21 00:25:20.987538+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (880, 'testuser1761006321782@example.com', 'testpassword123', 'Test User 1761006321782', '+56906321782', 'user', false, false, '2025-10-21 00:25:21.876478+00', '2025-10-21 00:25:21.876478+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (909, 'testuser1761314662927@example.com', 'testpassword123', 'Test User 1761314662927', '+56914662927', 'user', true, false, '2025-10-24 14:04:22.980941+00', '2025-10-24 14:04:22.980941+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (911, 'testuser1761314663201@example.com', 'testpassword123', 'Test User 1761314663201', '+56914663201', 'user', true, false, '2025-10-24 14:04:23.266004+00', '2025-10-24 14:04:23.266004+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (915, 'testuser1761314663873@example.com', 'testpassword123', 'Test User 1761314663873', '+56914663873', 'user', true, false, '2025-10-24 14:04:23.927855+00', '2025-10-24 14:04:23.927855+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (917, 'testuser1761314664339@example.com', 'testpassword123', 'Test User 1761314664339', '+56914664339', 'user', true, false, '2025-10-24 14:04:24.385631+00', '2025-10-24 14:04:24.385631+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (919, 'testuser1761314664648@example.com', 'testpassword123', 'Test User 1761314664648', '+56914664648', 'user', true, false, '2025-10-24 14:04:24.700735+00', '2025-10-24 14:04:24.700735+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (923, 'testuser1761314665458@example.com', 'testpassword123', 'Test User 1761314665458', '+56914665458', 'user', true, false, '2025-10-24 14:04:25.507337+00', '2025-10-24 14:04:25.507337+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (926, 'testuser1761314666039@example.com', 'testpassword123', 'Test User 1761314666039', '+56914666039', 'user', true, false, '2025-10-24 14:04:26.09494+00', '2025-10-24 14:04:26.09494+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (928, 'testuser1761314666321@example.com', 'testpassword123', 'Test User 1761314666321', '+56914666321', 'user', true, false, '2025-10-24 14:04:26.383551+00', '2025-10-24 14:04:26.383551+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (931, 'testuser1761314666887@example.com', 'testpassword123', 'Test User 1761314666887', '+56914666887', 'user', true, false, '2025-10-24 14:04:26.931381+00', '2025-10-24 14:04:26.931381+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (933, 'testuser1761314667186@example.com', 'testpassword123', 'Test User 1761314667186', '+56914667186', 'user', true, false, '2025-10-24 14:04:27.237667+00', '2025-10-24 14:04:27.237667+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (935, 'testuser1761314667455@example.com', 'testpassword123', 'Test User 1761314667455', '+56914667455', 'user', true, false, '2025-10-24 14:04:27.534032+00', '2025-10-24 14:04:27.534032+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (936, 'testuser1761314667772@example.com', 'testpassword123', 'Test User 1761314667772', '+56914667772', 'user', true, false, '2025-10-24 14:04:27.803507+00', '2025-10-24 14:04:27.803507+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (937, 'testuser1761314668148@example.com', 'testpassword123', 'Test User 1761314668148', '+56914668148', 'user', true, false, '2025-10-24 14:04:28.199506+00', '2025-10-24 14:04:28.199506+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (938, 'testuser1761314668559@example.com', 'testpassword123', 'Test User 1761314668559', '+56914668559', 'user', true, false, '2025-10-24 14:04:28.596997+00', '2025-10-24 14:04:28.596997+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (972, 'testuser1761314890549@example.com', 'testpassword123', 'Test User 1761314890549', '+56914890549', 'user', true, false, '2025-10-24 14:08:10.601158+00', '2025-10-24 14:08:10.601158+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (975, 'testuser1761314891230@example.com', 'testpassword123', 'Test User 1761314891230', '+56914891230', 'user', true, false, '2025-10-24 14:08:11.290921+00', '2025-10-24 14:08:11.290921+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (978, 'testuser1761314891731@example.com', 'testpassword123', 'Test User 1761314891731', '+56914891731', 'user', true, false, '2025-10-24 14:08:11.788209+00', '2025-10-24 14:08:11.788209+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (981, 'testuser1761314892262@example.com', 'testpassword123', 'Test User 1761314892262', '+56914892262', 'user', true, false, '2025-10-24 14:08:12.366813+00', '2025-10-24 14:08:12.366813+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (984, 'testuser1761314892882@example.com', 'testpassword123', 'Test User 1761314892882', '+56914892882', 'user', true, false, '2025-10-24 14:08:12.956712+00', '2025-10-24 14:08:12.956712+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (987, 'testuser1761314893334@example.com', 'testpassword123', 'Test User 1761314893334', '+56914893334', 'user', true, false, '2025-10-24 14:08:13.390403+00', '2025-10-24 14:08:13.390403+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (990, 'testuser1761314893887@example.com', 'testpassword123', 'Test User 1761314893887', '+56914893887', 'user', true, false, '2025-10-24 14:08:13.951345+00', '2025-10-24 14:08:13.951345+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (993, 'testuser1761314894604@example.com', 'testpassword123', 'Test User 1761314894604', '+56914894604', 'user', true, false, '2025-10-24 14:08:14.644005+00', '2025-10-24 14:08:14.644005+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (796, 'testuser1760999774344@example.com', 'testpassword123', 'Test User 1760999774344', '+56999774344', 'user', false, false, '2025-10-20 22:36:14.429894+00', '2025-10-20 22:36:14.429894+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (830, 'testuser1761006306155@example.com', 'testpassword123', 'Test User 1761006306155', '+56906306155', 'user', false, false, '2025-10-21 00:25:06.260556+00', '2025-10-21 00:25:06.260556+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (803, 'testuser1760999775583@example.com', 'testpassword123', 'Test User 1760999775583', '+56999775583', 'user', false, false, '2025-10-20 22:36:15.678594+00', '2025-10-20 22:36:15.678594+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (805, 'testuser1760999776109@example.com', 'testpassword123', 'Test User 1760999776109', '+56999776109', 'user', false, false, '2025-10-20 22:36:16.20008+00', '2025-10-20 22:36:16.20008+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (839, 'testuser1761006308835@example.com', 'testpassword123', 'Test User 1761006308835', '+56906308835', 'user', false, false, '2025-10-21 00:25:09.138075+00', '2025-10-21 00:25:09.138075+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (811, 'testuser1760999777952@example.com', 'testpassword123', 'Test User 1760999777952', '+56999777952', 'user', false, false, '2025-10-20 22:36:18.042371+00', '2025-10-20 22:36:18.042371+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (815, 'testuser1760999780383@example.com', 'testpassword123', 'Test User 1760999780383', '+56999780383', 'user', false, false, '2025-10-20 22:36:20.484804+00', '2025-10-20 22:36:20.484804+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (843, 'testuser1761006310109@example.com', 'testpassword123', 'Test User 1761006310109', '+56906310109', 'user', false, false, '2025-10-21 00:25:10.26565+00', '2025-10-21 00:25:10.26565+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (847, 'testuser1761006311215@example.com', 'testpassword123', 'Test User 1761006311215', '+56906311215', 'user', false, false, '2025-10-21 00:25:11.493597+00', '2025-10-21 00:25:11.493597+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (850, 'testuser1761006312289@example.com', 'testpassword123', 'Test User 1761006312289', '+56906312289', 'user', false, false, '2025-10-21 00:25:12.374667+00', '2025-10-21 00:25:12.374667+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (859, 'testuser1761006315314@example.com', 'testpassword123', 'Test User 1761006315314', '+56906315314', 'user', false, false, '2025-10-21 00:25:15.590076+00', '2025-10-21 00:25:15.590076+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (863, 'testuser1761006316401@example.com', 'testpassword123', 'Test User 1761006316401', '+56906316401', 'user', false, false, '2025-10-21 00:25:16.641483+00', '2025-10-21 00:25:16.641483+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (914, 'testuser1761314663768@example.com', 'testpassword123', 'Test User 1761314663768', '+56914663768', 'user', true, false, '2025-10-24 14:04:23.854092+00', '2025-10-24 14:04:23.854092+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (916, 'testuser1761314664084@example.com', 'testpassword123', 'Test User 1761314664084', '+56914664084', 'user', true, false, '2025-10-24 14:04:24.136474+00', '2025-10-24 14:04:24.136474+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (921, 'testuser1761314665009@example.com', 'testpassword123', 'Test User 1761314665009', '+56914665009', 'user', true, false, '2025-10-24 14:04:25.07915+00', '2025-10-24 14:04:25.07915+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (925, 'testuser1761314665724@example.com', 'testpassword123', 'Test User 1761314665724', '+56914665724', 'user', true, false, '2025-10-24 14:04:25.794684+00', '2025-10-24 14:04:25.794684+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (927, 'testuser1761314666146@example.com', 'testpassword123', 'Test User 1761314666146', '+56914666146', 'user', true, false, '2025-10-24 14:04:26.207683+00', '2025-10-24 14:04:26.207683+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (930, 'testuser1761314666599@example.com', 'testpassword123', 'Test User 1761314666599', '+56914666599', 'user', true, false, '2025-10-24 14:04:26.635028+00', '2025-10-24 14:04:26.635028+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (934, 'testuser1761314667379@example.com', 'testpassword123', 'Test User 1761314667379', '+56914667379', 'user', true, false, '2025-10-24 14:04:27.43105+00', '2025-10-24 14:04:27.43105+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (940, 'testuser1761314669433@example.com', 'testpassword123', 'Test User 1761314669433', '+56914669433', 'user', true, false, '2025-10-24 14:04:29.473294+00', '2025-10-24 14:04:29.473294+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (988, 'testuser1761314893584@example.com', 'testpassword123', 'Test User 1761314893584', '+56914893584', 'user', true, false, '2025-10-24 14:08:13.629997+00', '2025-10-24 14:08:13.629997+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (991, 'testuser1761314894263@example.com', 'testpassword123', 'Test User 1761314894263', '+56914894263', 'user', true, false, '2025-10-24 14:08:14.33209+00', '2025-10-24 14:08:14.33209+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (994, 'testuser1761314894925@example.com', 'testpassword123', 'Test User 1761314894925', '+56914894925', 'user', true, false, '2025-10-24 14:08:14.985382+00', '2025-10-24 14:08:14.985382+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (995, 'testuser1761314895466@example.com', 'testpassword123', 'Test User 1761314895466', '+56914895466', 'user', true, false, '2025-10-24 14:08:15.510815+00', '2025-10-24 14:08:15.510815+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (996, 'testuser1761314895860@example.com', 'testpassword123', 'Test User 1761314895860', '+56914895860', 'user', true, false, '2025-10-24 14:08:15.919362+00', '2025-10-24 14:08:15.919362+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (997, 'testuser1761314896295@example.com', 'testpassword123', 'Test User 1761314896295', '+56914896295', 'user', true, false, '2025-10-24 14:08:16.351634+00', '2025-10-24 14:08:16.351634+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (998, 'testuser1761314896712@example.com', 'testpassword123', 'Test User 1761314896712', '+56914896712', 'user', true, false, '2025-10-24 14:08:16.773205+00', '2025-10-24 14:08:16.773205+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (999, 'testuser1761314897349@example.com', 'testpassword123', 'Test User 1761314897349', '+56914897349', 'user', true, false, '2025-10-24 14:08:17.411125+00', '2025-10-24 14:08:17.411125+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1000, 'testuser1761314898283@example.com', 'testpassword123', 'Test User 1761314898283', '+56914898283', 'user', true, false, '2025-10-24 14:08:18.337597+00', '2025-10-24 14:08:18.337597+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1001, 'testuser1761314898683@example.com', 'testpassword123', 'Test User 1761314898683', '+56914898683', 'user', true, false, '2025-10-24 14:08:18.733677+00', '2025-10-24 14:08:18.733677+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1002, 'testuser1761315920855@example.com', 'testpassword123', 'Test User 1761315920855', '+56915920855', 'user', true, false, '2025-10-24 14:25:21.93001+00', '2025-10-24 14:25:21.93001+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (837, 'testuser1761006308255@example.com', 'testpassword123', 'Test User 1761006308255', '+56906308255', 'user', false, false, '2025-10-21 00:25:08.47004+00', '2025-10-21 00:25:08.47004+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (798, 'testuser1760999774648@example.com', 'testpassword123', 'Test User 1760999774648', '+56999774648', 'user', false, false, '2025-10-20 22:36:14.731739+00', '2025-10-20 22:36:14.731739+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (797, 'testuser1760999774438@example.com', 'testpassword123', 'Test User 1760999774438', '+56999774438', 'user', false, false, '2025-10-20 22:36:14.52818+00', '2025-10-20 22:36:14.52818+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (809, 'testuser1760999776730@example.com', 'testpassword123', 'Test User 1760999776730', '+56999776730', 'user', false, false, '2025-10-20 22:36:16.81227+00', '2025-10-20 22:36:16.81227+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (840, 'testuser1761006309306@example.com', 'testpassword123', 'Test User 1761006309306', '+56906309306', 'user', false, false, '2025-10-21 00:25:09.39916+00', '2025-10-21 00:25:09.39916+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (810, 'testuser1760999777351@example.com', 'testpassword123', 'Test User 1760999777351', '+56999777351', 'user', false, false, '2025-10-20 22:36:17.445208+00', '2025-10-20 22:36:17.445208+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (846, 'testuser1761006311131@example.com', 'testpassword123', 'Test User 1761006311131', '+56906311131', 'user', false, false, '2025-10-21 00:25:11.235643+00', '2025-10-21 00:25:11.235643+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (851, 'testuser1761006312499@example.com', 'testpassword123', 'Test User 1761006312499', '+56906312499', 'user', false, false, '2025-10-21 00:25:12.783571+00', '2025-10-21 00:25:12.783571+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (856, 'testuser1761006314419@example.com', 'testpassword123', 'Test User 1761006314419', '+56906314419', 'user', false, false, '2025-10-21 00:25:14.504248+00', '2025-10-21 00:25:14.504248+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (858, 'testuser1761006314982@example.com', 'testpassword123', 'Test User 1761006314982', '+56906314982', 'user', false, false, '2025-10-21 00:25:15.076385+00', '2025-10-21 00:25:15.076385+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (866, 'testuser1761006317484@example.com', 'testpassword123', 'Test User 1761006317484', '+56906317484', 'user', false, false, '2025-10-21 00:25:17.595138+00', '2025-10-21 00:25:17.595138+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (874, 'testuser1761006319992@example.com', 'testpassword123', 'Test User 1761006319992', '+56906319992', 'user', false, false, '2025-10-21 00:25:20.074636+00', '2025-10-21 00:25:20.074636+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (942, 'testuser1761314884439@example.com', 'testpassword123', 'Test User 1761314884439', '+56914884439', 'user', true, false, '2025-10-24 14:08:04.848046+00', '2025-10-24 14:08:04.848046+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (945, 'testuser1761314885359@example.com', 'testpassword123', 'Test User 1761314885359', '+56914885359', 'user', true, false, '2025-10-24 14:08:05.453295+00', '2025-10-24 14:08:05.453295+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (946, 'testuser1761314885695@example.com', 'testpassword123', 'Test User 1761314885695', '+56914885695', 'user', true, false, '2025-10-24 14:08:05.773765+00', '2025-10-24 14:08:05.773765+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (952, 'testuser1761314886809@example.com', 'testpassword123', 'Test User 1761314886809', '+56914886809', 'user', true, false, '2025-10-24 14:08:06.861109+00', '2025-10-24 14:08:06.861109+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (955, 'testuser1761314887301@example.com', 'testpassword123', 'Test User 1761314887301', '+56914887301', 'user', true, false, '2025-10-24 14:08:07.340859+00', '2025-10-24 14:08:07.340859+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (958, 'testuser1761314888038@example.com', 'testpassword123', 'Test User 1761314888038', '+56914888038', 'user', true, false, '2025-10-24 14:08:08.090537+00', '2025-10-24 14:08:08.090537+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (960, 'testuser1761314888340@example.com', 'testpassword123', 'Test User 1761314888340', '+56914888340', 'user', true, false, '2025-10-24 14:08:08.429346+00', '2025-10-24 14:08:08.429346+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (962, 'testuser1761314888733@example.com', 'testpassword123', 'Test User 1761314888733', '+56914888733', 'user', true, false, '2025-10-24 14:08:08.788702+00', '2025-10-24 14:08:08.788702+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (965, 'testuser1761314889333@example.com', 'testpassword123', 'Test User 1761314889333', '+56914889333', 'user', true, false, '2025-10-24 14:08:09.382908+00', '2025-10-24 14:08:09.382908+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (968, 'testuser1761314889847@example.com', 'testpassword123', 'Test User 1761314889847', '+56914889847', 'user', true, false, '2025-10-24 14:08:09.900204+00', '2025-10-24 14:08:09.900204+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (971, 'testuser1761314890309@example.com', 'testpassword123', 'Test User 1761314890309', '+56914890309', 'user', true, false, '2025-10-24 14:08:10.366819+00', '2025-10-24 14:08:10.366819+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (974, 'testuser1761314890878@example.com', 'testpassword123', 'Test User 1761314890878', '+56914890878', 'user', true, false, '2025-10-24 14:08:10.942548+00', '2025-10-24 14:08:10.942548+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (977, 'testuser1761314891546@example.com', 'testpassword123', 'Test User 1761314891546', '+56914891546', 'user', true, false, '2025-10-24 14:08:11.605388+00', '2025-10-24 14:08:11.605388+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (980, 'testuser1761314892154@example.com', 'testpassword123', 'Test User 1761314892154', '+56914892154', 'user', true, false, '2025-10-24 14:08:12.199408+00', '2025-10-24 14:08:12.199408+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (983, 'testuser1761314892791@example.com', 'testpassword123', 'Test User 1761314892791', '+56914892791', 'user', true, false, '2025-10-24 14:08:12.834201+00', '2025-10-24 14:08:12.834201+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (986, 'testuser1761314893309@example.com', 'testpassword123', 'Test User 1761314893309', '+56914893309', 'user', true, false, '2025-10-24 14:08:13.360608+00', '2025-10-24 14:08:13.360608+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (989, 'testuser1761314893894@example.com', 'testpassword123', 'Test User 1761314893894', '+56914893894', 'user', true, false, '2025-10-24 14:08:13.949281+00', '2025-10-24 14:08:13.949281+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (992, 'testuser1761314894468@example.com', 'testpassword123', 'Test User 1761314894468', '+56914894468', 'user', true, false, '2025-10-24 14:08:14.519532+00', '2025-10-24 14:08:14.519532+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (818, 'testuser1760999782366@example.com', 'testpassword123', 'Test User 1760999782366', '+56999782366', 'user', false, false, '2025-10-20 22:36:22.469582+00', '2025-10-20 22:36:22.469582+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (812, 'testuser1760999778597@example.com', 'testpassword123', 'Test User 1760999778597', '+56999778597', 'user', false, false, '2025-10-20 22:36:18.693093+00', '2025-10-20 22:36:18.693093+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (841, 'testuser1761006309517@example.com', 'testpassword123', 'Test User 1761006309517', '+56906309517', 'user', false, false, '2025-10-21 00:25:09.725566+00', '2025-10-21 00:25:09.725566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (848, 'testuser1761006311688@example.com', 'testpassword123', 'Test User 1761006311688', '+56906311688', 'user', false, false, '2025-10-21 00:25:11.792187+00', '2025-10-21 00:25:11.792187+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (855, 'testuser1761006313876@example.com', 'testpassword123', 'Test User 1761006313876', '+56906313876', 'user', false, false, '2025-10-21 00:25:14.376498+00', '2025-10-21 00:25:14.376498+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (857, 'testuser1761006314646@example.com', 'testpassword123', 'Test User 1761006314646', '+56906314646', 'user', false, false, '2025-10-21 00:25:14.933857+00', '2025-10-21 00:25:14.933857+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (861, 'testuser1761006315920@example.com', 'testpassword123', 'Test User 1761006315920', '+56906315920', 'user', false, false, '2025-10-21 00:25:16.103952+00', '2025-10-21 00:25:16.103952+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (868, 'testuser1761006318152@example.com', 'testpassword123', 'Test User 1761006318152', '+56906318152', 'user', false, false, '2025-10-21 00:25:18.257992+00', '2025-10-21 00:25:18.257992+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (873, 'testuser1761006319483@example.com', 'testpassword123', 'Test User 1761006319483', '+56906319483', 'user', false, false, '2025-10-21 00:25:19.686664+00', '2025-10-21 00:25:19.686664+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (875, 'testuser1761006320053@example.com', 'testpassword123', 'Test User 1761006320053', '+56906320053', 'user', false, false, '2025-10-21 00:25:20.320872+00', '2025-10-21 00:25:20.320872+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (876, 'testuser1761006320538@example.com', 'testpassword123', 'Test User 1761006320538', '+56906320538', 'user', false, false, '2025-10-21 00:25:20.636732+00', '2025-10-21 00:25:20.636732+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (878, 'testuser1761006321094@example.com', 'testpassword123', 'Test User 1761006321094', '+56906321094', 'user', false, false, '2025-10-21 00:25:21.193924+00', '2025-10-21 00:25:21.193924+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (943, 'testuser1761314884440@example.com', 'testpassword123', 'Test User 1761314884440', '+56914884440', 'user', true, false, '2025-10-24 14:08:04.897182+00', '2025-10-24 14:08:04.897182+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (944, 'testuser1761314885296@example.com', 'testpassword123', 'Test User 1761314885296', '+56914885296', 'user', true, false, '2025-10-24 14:08:05.375194+00', '2025-10-24 14:08:05.375194+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (949, 'testuser1761314886328@example.com', 'testpassword123', 'Test User 1761314886328', '+56914886328', 'user', true, false, '2025-10-24 14:08:06.391542+00', '2025-10-24 14:08:06.391542+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (951, 'testuser1761314886715@example.com', 'testpassword123', 'Test User 1761314886715', '+56914886715', 'user', true, false, '2025-10-24 14:08:06.762245+00', '2025-10-24 14:08:06.762245+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (954, 'testuser1761314887218@example.com', 'testpassword123', 'Test User 1761314887218', '+56914887218', 'user', true, false, '2025-10-24 14:08:07.278681+00', '2025-10-24 14:08:07.278681+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (957, 'testuser1761314887667@example.com', 'testpassword123', 'Test User 1761314887667', '+56914887667', 'user', true, false, '2025-10-24 14:08:07.71544+00', '2025-10-24 14:08:07.71544+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (961, 'testuser1761314888515@example.com', 'testpassword123', 'Test User 1761314888515', '+56914888515', 'user', true, false, '2025-10-24 14:08:08.558133+00', '2025-10-24 14:08:08.558133+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (964, 'testuser1761314889038@example.com', 'testpassword123', 'Test User 1761314889038', '+56914889038', 'user', true, false, '2025-10-24 14:08:09.074688+00', '2025-10-24 14:08:09.074688+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (967, 'testuser1761314889628@example.com', 'testpassword123', 'Test User 1761314889628', '+56914889628', 'user', true, false, '2025-10-24 14:08:09.694188+00', '2025-10-24 14:08:09.694188+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (970, 'testuser1761314890246@example.com', 'testpassword123', 'Test User 1761314890246', '+56914890246', 'user', true, false, '2025-10-24 14:08:10.291372+00', '2025-10-24 14:08:10.291372+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (973, 'testuser1761314890798@example.com', 'testpassword123', 'Test User 1761314890798', '+56914890798', 'user', true, false, '2025-10-24 14:08:10.850752+00', '2025-10-24 14:08:10.850752+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (976, 'testuser1761314891267@example.com', 'testpassword123', 'Test User 1761314891267', '+56914891267', 'user', true, false, '2025-10-24 14:08:11.312097+00', '2025-10-24 14:08:11.312097+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (979, 'testuser1761314891849@example.com', 'testpassword123', 'Test User 1761314891849', '+56914891849', 'user', true, false, '2025-10-24 14:08:11.909087+00', '2025-10-24 14:08:11.909087+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (982, 'testuser1761314892447@example.com', 'testpassword123', 'Test User 1761314892447', '+56914892447', 'user', true, false, '2025-10-24 14:08:12.499742+00', '2025-10-24 14:08:12.499742+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (985, 'testuser1761314893049@example.com', 'testpassword123', 'Test User 1761314893049', '+56914893049', 'user', true, false, '2025-10-24 14:08:13.084938+00', '2025-10-24 14:08:13.084938+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1003, 'testuser1761315920856@example.com', 'testpassword123', 'Test User 1761315920856', '+56915920856', 'user', true, false, '2025-10-24 14:25:21.949589+00', '2025-10-24 14:25:21.949589+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1004, 'testuser1761315922235@example.com', 'testpassword123', 'Test User 1761315922235', '+56915922235', 'user', true, false, '2025-10-24 14:25:22.34138+00', '2025-10-24 14:25:22.34138+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1006, 'testuser1761315922521@example.com', 'testpassword123', 'Test User 1761315922521', '+56915922521', 'user', true, false, '2025-10-24 14:25:22.613182+00', '2025-10-24 14:25:22.613182+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1008, 'testuser1761315922878@example.com', 'testpassword123', 'Test User 1761315922878', '+56915922878', 'user', true, false, '2025-10-24 14:25:22.967235+00', '2025-10-24 14:25:22.967235+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1010, 'testuser1761315923311@example.com', 'testpassword123', 'Test User 1761315923311', '+56915923311', 'user', true, false, '2025-10-24 14:25:23.409557+00', '2025-10-24 14:25:23.409557+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1011, 'testuser1761315923350@example.com', 'testpassword123', 'Test User 1761315923350', '+56915923350', 'user', true, false, '2025-10-24 14:25:23.439129+00', '2025-10-24 14:25:23.439129+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1013, 'testuser1761315923811@example.com', 'testpassword123', 'Test User 1761315923811', '+56915923811', 'user', true, false, '2025-10-24 14:25:23.908783+00', '2025-10-24 14:25:23.908783+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1014, 'testuser1761315923888@example.com', 'testpassword123', 'Test User 1761315923888', '+56915923888', 'user', true, false, '2025-10-24 14:25:23.980737+00', '2025-10-24 14:25:23.980737+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1017, 'testuser1761315924493@example.com', 'testpassword123', 'Test User 1761315924493', '+56915924493', 'user', true, false, '2025-10-24 14:25:24.571897+00', '2025-10-24 14:25:24.571897+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1018, 'testuser1761315924775@example.com', 'testpassword123', 'Test User 1761315924775', '+56915924775', 'user', true, false, '2025-10-24 14:25:24.867943+00', '2025-10-24 14:25:24.867943+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1021, 'testuser1761315925194@example.com', 'testpassword123', 'Test User 1761315925194', '+56915925194', 'user', true, false, '2025-10-24 14:25:25.271629+00', '2025-10-24 14:25:25.271629+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1022, 'testuser1761315925400@example.com', 'testpassword123', 'Test User 1761315925400', '+56915925400', 'user', true, false, '2025-10-24 14:25:25.489+00', '2025-10-24 14:25:25.489+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1025, 'testuser1761315925961@example.com', 'testpassword123', 'Test User 1761315925961', '+56915925961', 'user', true, false, '2025-10-24 14:25:26.065608+00', '2025-10-24 14:25:26.065608+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1026, 'testuser1761315926082@example.com', 'testpassword123', 'Test User 1761315926082', '+56915926082', 'user', true, false, '2025-10-24 14:25:26.173445+00', '2025-10-24 14:25:26.173445+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1029, 'testuser1761315926794@example.com', 'testpassword123', 'Test User 1761315926794', '+56915926794', 'user', true, false, '2025-10-24 14:25:26.873085+00', '2025-10-24 14:25:26.873085+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1030, 'testuser1761315926841@example.com', 'testpassword123', 'Test User 1761315926841', '+56915926841', 'user', true, false, '2025-10-24 14:25:26.942334+00', '2025-10-24 14:25:26.942334+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1033, 'testuser1761315927436@example.com', 'testpassword123', 'Test User 1761315927436', '+56915927436', 'user', true, false, '2025-10-24 14:25:27.529382+00', '2025-10-24 14:25:27.529382+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1034, 'testuser1761315927577@example.com', 'testpassword123', 'Test User 1761315927577', '+56915927577', 'user', true, false, '2025-10-24 14:25:27.66026+00', '2025-10-24 14:25:27.66026+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1037, 'testuser1761315928050@example.com', 'testpassword123', 'Test User 1761315928050', '+56915928050', 'user', true, false, '2025-10-24 14:25:28.125293+00', '2025-10-24 14:25:28.125293+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1038, 'testuser1761315928342@example.com', 'testpassword123', 'Test User 1761315928342', '+56915928342', 'user', true, false, '2025-10-24 14:25:28.423739+00', '2025-10-24 14:25:28.423739+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1041, 'testuser1761315928900@example.com', 'testpassword123', 'Test User 1761315928900', '+56915928900', 'user', true, false, '2025-10-24 14:25:28.987336+00', '2025-10-24 14:25:28.987336+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1042, 'testuser1761315928964@example.com', 'testpassword123', 'Test User 1761315928964', '+56915928964', 'user', true, false, '2025-10-24 14:25:29.355192+00', '2025-10-24 14:25:29.355192+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1045, 'testuser1761315929948@example.com', 'testpassword123', 'Test User 1761315929948', '+56915929948', 'user', true, false, '2025-10-24 14:25:30.07388+00', '2025-10-24 14:25:30.07388+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1046, 'testuser1761315930209@example.com', 'testpassword123', 'Test User 1761315930209', '+56915930209', 'user', true, false, '2025-10-24 14:25:30.286566+00', '2025-10-24 14:25:30.286566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1049, 'testuser1761315930622@example.com', 'testpassword123', 'Test User 1761315930622', '+56915930622', 'user', true, false, '2025-10-24 14:25:30.725644+00', '2025-10-24 14:25:30.725644+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1050, 'testuser1761315930923@example.com', 'testpassword123', 'Test User 1761315930923', '+56915930923', 'user', true, false, '2025-10-24 14:25:30.994197+00', '2025-10-24 14:25:30.994197+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1053, 'testuser1761315931486@example.com', 'testpassword123', 'Test User 1761315931486', '+56915931486', 'user', true, false, '2025-10-24 14:25:31.591304+00', '2025-10-24 14:25:31.591304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1054, 'testuser1761315931593@example.com', 'testpassword123', 'Test User 1761315931593', '+56915931593', 'user', true, false, '2025-10-24 14:25:31.683374+00', '2025-10-24 14:25:31.683374+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1060, 'testuser1761315934128@example.com', 'testpassword123', 'Test User 1761315934128', '+56915934128', 'user', true, false, '2025-10-24 14:25:34.211591+00', '2025-10-24 14:25:34.211591+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1061, 'testuser1761315934528@example.com', 'testpassword123', 'Test User 1761315934528', '+56915934528', 'user', true, false, '2025-10-24 14:25:34.640448+00', '2025-10-24 14:25:34.640448+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1005, 'testuser1761315922444@example.com', 'testpassword123', 'Test User 1761315922444', '+56915922444', 'user', true, false, '2025-10-24 14:25:22.549445+00', '2025-10-24 14:25:22.549445+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1007, 'testuser1761315922799@example.com', 'testpassword123', 'Test User 1761315922799', '+56915922799', 'user', true, false, '2025-10-24 14:25:22.887203+00', '2025-10-24 14:25:22.887203+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1009, 'testuser1761315923078@example.com', 'testpassword123', 'Test User 1761315923078', '+56915923078', 'user', true, false, '2025-10-24 14:25:23.159399+00', '2025-10-24 14:25:23.159399+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1012, 'testuser1761315923609@example.com', 'testpassword123', 'Test User 1761315923609', '+56915923609', 'user', true, false, '2025-10-24 14:25:23.692686+00', '2025-10-24 14:25:23.692686+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1015, 'testuser1761315924201@example.com', 'testpassword123', 'Test User 1761315924201', '+56915924201', 'user', true, false, '2025-10-24 14:25:24.286882+00', '2025-10-24 14:25:24.286882+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1016, 'testuser1761315924223@example.com', 'testpassword123', 'Test User 1761315924223', '+56915924223', 'user', true, false, '2025-10-24 14:25:24.33041+00', '2025-10-24 14:25:24.33041+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1019, 'testuser1761315924821@example.com', 'testpassword123', 'Test User 1761315924821', '+56915924821', 'user', true, false, '2025-10-24 14:25:24.923365+00', '2025-10-24 14:25:24.923365+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1020, 'testuser1761315925121@example.com', 'testpassword123', 'Test User 1761315925121', '+56915925121', 'user', true, false, '2025-10-24 14:25:25.215589+00', '2025-10-24 14:25:25.215589+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1023, 'testuser1761315925577@example.com', 'testpassword123', 'Test User 1761315925577', '+56915925577', 'user', true, false, '2025-10-24 14:25:25.656941+00', '2025-10-24 14:25:25.656941+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1024, 'testuser1761315925663@example.com', 'testpassword123', 'Test User 1761315925663', '+56915925663', 'user', true, false, '2025-10-24 14:25:25.787204+00', '2025-10-24 14:25:25.787204+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1027, 'testuser1761315926381@example.com', 'testpassword123', 'Test User 1761315926381', '+56915926381', 'user', true, false, '2025-10-24 14:25:26.475125+00', '2025-10-24 14:25:26.475125+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1028, 'testuser1761315926395@example.com', 'testpassword123', 'Test User 1761315926395', '+56915926395', 'user', true, false, '2025-10-24 14:25:26.475329+00', '2025-10-24 14:25:26.475329+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1031, 'testuser1761315927144@example.com', 'testpassword123', 'Test User 1761315927144', '+56915927144', 'user', true, false, '2025-10-24 14:25:27.230272+00', '2025-10-24 14:25:27.230272+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1032, 'testuser1761315927185@example.com', 'testpassword123', 'Test User 1761315927185', '+56915927185', 'user', true, false, '2025-10-24 14:25:27.278099+00', '2025-10-24 14:25:27.278099+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1035, 'testuser1761315927717@example.com', 'testpassword123', 'Test User 1761315927717', '+56915927717', 'user', true, false, '2025-10-24 14:25:27.81767+00', '2025-10-24 14:25:27.81767+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1036, 'testuser1761315928004@example.com', 'testpassword123', 'Test User 1761315928004', '+56915928004', 'user', true, false, '2025-10-24 14:25:28.089815+00', '2025-10-24 14:25:28.089815+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1039, 'testuser1761315928410@example.com', 'testpassword123', 'Test User 1761315928410', '+56915928410', 'user', true, false, '2025-10-24 14:25:28.519428+00', '2025-10-24 14:25:28.519428+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1040, 'testuser1761315928600@example.com', 'testpassword123', 'Test User 1761315928600', '+56915928600', 'user', true, false, '2025-10-24 14:25:28.682632+00', '2025-10-24 14:25:28.682632+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1043, 'testuser1761315929608@example.com', 'testpassword123', 'Test User 1761315929608', '+56915929608', 'user', true, false, '2025-10-24 14:25:29.699329+00', '2025-10-24 14:25:29.699329+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1044, 'testuser1761315929739@example.com', 'testpassword123', 'Test User 1761315929739', '+56915929739', 'user', true, false, '2025-10-24 14:25:29.835229+00', '2025-10-24 14:25:29.835229+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1047, 'testuser1761315930280@example.com', 'testpassword123', 'Test User 1761315930280', '+56915930280', 'user', true, false, '2025-10-24 14:25:30.387791+00', '2025-10-24 14:25:30.387791+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1048, 'testuser1761315930613@example.com', 'testpassword123', 'Test User 1761315930613', '+56915930613', 'user', true, false, '2025-10-24 14:25:30.700431+00', '2025-10-24 14:25:30.700431+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1051, 'testuser1761315931067@example.com', 'testpassword123', 'Test User 1761315931067', '+56915931067', 'user', true, false, '2025-10-24 14:25:31.166386+00', '2025-10-24 14:25:31.166386+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1052, 'testuser1761315931265@example.com', 'testpassword123', 'Test User 1761315931265', '+56915931265', 'user', true, false, '2025-10-24 14:25:31.345025+00', '2025-10-24 14:25:31.345025+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1055, 'testuser1761315931923@example.com', 'testpassword123', 'Test User 1761315931923', '+56915931923', 'user', true, false, '2025-10-24 14:25:32.012124+00', '2025-10-24 14:25:32.012124+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1056, 'testuser1761315932327@example.com', 'testpassword123', 'Test User 1761315932327', '+56915932327', 'user', true, false, '2025-10-24 14:25:32.411741+00', '2025-10-24 14:25:32.411741+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1057, 'testuser1761315932726@example.com', 'testpassword123', 'Test User 1761315932726', '+56915932726', 'user', true, false, '2025-10-24 14:25:32.8166+00', '2025-10-24 14:25:32.8166+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1058, 'testuser1761315933224@example.com', 'testpassword123', 'Test User 1761315933224', '+56915933224', 'user', true, false, '2025-10-24 14:25:33.324694+00', '2025-10-24 14:25:33.324694+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1059, 'testuser1761315933693@example.com', 'testpassword123', 'Test User 1761315933693', '+56915933693', 'user', true, false, '2025-10-24 14:25:33.789818+00', '2025-10-24 14:25:33.789818+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1063, 'testuser1761334054465@example.com', 'testpassword123', 'Test User 1761334054465', '+56934054465', 'user', false, false, '2025-10-24 19:27:35.959115+00', '2025-10-24 19:27:35.959115+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1064, 'testuser1761334056472@example.com', 'testpassword123', 'Test User 1761334056472', '+56934056472', 'user', false, false, '2025-10-24 19:27:36.585751+00', '2025-10-24 19:27:36.585751+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1062, 'testuser1761334054457@example.com', 'testpassword123', 'Test User 1761334054457', '+56934054457', 'user', false, false, '2025-10-24 19:27:35.959121+00', '2025-10-24 19:27:35.959121+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1065, 'testuser1761334056884@example.com', 'testpassword123', 'Test User 1761334056884', '+56934056884', 'user', false, false, '2025-10-24 19:27:37.000125+00', '2025-10-24 19:27:37.000125+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1067, 'testuser1761334057355@example.com', 'testpassword123', 'Test User 1761334057355', '+56934057355', 'user', false, false, '2025-10-24 19:27:37.473755+00', '2025-10-24 19:27:37.473755+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1066, 'testuser1761334056991@example.com', 'testpassword123', 'Test User 1761334056991', '+56934056991', 'user', false, false, '2025-10-24 19:27:37.129661+00', '2025-10-24 19:27:37.129661+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1068, 'testuser1761334057713@example.com', 'testpassword123', 'Test User 1761334057713', '+56934057713', 'user', false, false, '2025-10-24 19:27:37.828858+00', '2025-10-24 19:27:37.828858+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1069, 'testuser1761334057831@example.com', 'testpassword123', 'Test User 1761334057831', '+56934057831', 'user', false, false, '2025-10-24 19:27:37.946317+00', '2025-10-24 19:27:37.946317+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1070, 'testuser1761334058057@example.com', 'testpassword123', 'Test User 1761334058057', '+56934058057', 'user', false, false, '2025-10-24 19:27:38.171568+00', '2025-10-24 19:27:38.171568+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1073, 'testuser1761334058872@example.com', 'testpassword123', 'Test User 1761334058872', '+56934058872', 'user', false, false, '2025-10-24 19:27:38.973637+00', '2025-10-24 19:27:38.973637+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1074, 'testuser1761334059168@example.com', 'testpassword123', 'Test User 1761334059168', '+56934059168', 'user', false, false, '2025-10-24 19:27:39.277581+00', '2025-10-24 19:27:39.277581+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1075, 'testuser1761334059328@example.com', 'testpassword123', 'Test User 1761334059328', '+56934059328', 'user', false, false, '2025-10-24 19:27:39.446685+00', '2025-10-24 19:27:39.446685+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1078, 'testuser1761334060098@example.com', 'testpassword123', 'Test User 1761334060098', '+56934060098', 'user', false, false, '2025-10-24 19:27:40.189586+00', '2025-10-24 19:27:40.189586+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1081, 'testuser1761334060716@example.com', 'testpassword123', 'Test User 1761334060716', '+56934060716', 'user', false, false, '2025-10-24 19:27:40.822277+00', '2025-10-24 19:27:40.822277+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1084, 'testuser1761334061343@example.com', 'testpassword123', 'Test User 1761334061343', '+56934061343', 'user', false, false, '2025-10-24 19:27:41.443547+00', '2025-10-24 19:27:41.443547+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1086, 'testuser1761334061707@example.com', 'testpassword123', 'Test User 1761334061707', '+56934061707', 'user', false, false, '2025-10-24 19:27:41.803023+00', '2025-10-24 19:27:41.803023+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1088, 'testuser1761334062046@example.com', 'testpassword123', 'Test User 1761334062046', '+56934062046', 'user', false, false, '2025-10-24 19:27:42.255871+00', '2025-10-24 19:27:42.255871+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1087, 'testuser1761334062001@example.com', 'testpassword123', 'Test User 1761334062001', '+56934062001', 'user', false, false, '2025-10-24 19:27:42.216358+00', '2025-10-24 19:27:42.216358+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1089, 'testuser1761334062440@example.com', 'testpassword123', 'Test User 1761334062440', '+56934062440', 'user', false, false, '2025-10-24 19:27:42.54145+00', '2025-10-24 19:27:42.54145+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1090, 'testuser1761334062715@example.com', 'testpassword123', 'Test User 1761334062715', '+56934062715', 'user', false, false, '2025-10-24 19:27:42.810016+00', '2025-10-24 19:27:42.810016+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1093, 'testuser1761334063324@example.com', 'testpassword123', 'Test User 1761334063324', '+56934063324', 'user', false, false, '2025-10-24 19:27:43.446254+00', '2025-10-24 19:27:43.446254+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1095, 'testuser1761334063646@example.com', 'testpassword123', 'Test User 1761334063646', '+56934063646', 'user', false, false, '2025-10-24 19:27:43.763284+00', '2025-10-24 19:27:43.763284+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1094, 'testuser1761334063433@example.com', 'testpassword123', 'Test User 1761334063433', '+56934063433', 'user', false, false, '2025-10-24 19:27:43.535385+00', '2025-10-24 19:27:43.535385+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1096, 'testuser1761334063958@example.com', 'testpassword123', 'Test User 1761334063958', '+56934063958', 'user', false, false, '2025-10-24 19:27:44.062005+00', '2025-10-24 19:27:44.062005+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1097, 'testuser1761334064163@example.com', 'testpassword123', 'Test User 1761334064163', '+56934064163', 'user', false, false, '2025-10-24 19:27:44.276551+00', '2025-10-24 19:27:44.276551+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1101, 'testuser1761334065106@example.com', 'testpassword123', 'Test User 1761334065106', '+56934065106', 'user', false, false, '2025-10-24 19:27:45.22788+00', '2025-10-24 19:27:45.22788+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1105, 'testuser1761334065902@example.com', 'testpassword123', 'Test User 1761334065902', '+56934065902', 'user', false, false, '2025-10-24 19:27:46.001281+00', '2025-10-24 19:27:46.001281+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1104, 'testuser1761334065779@example.com', 'testpassword123', 'Test User 1761334065779', '+56934065779', 'user', false, false, '2025-10-24 19:27:45.878033+00', '2025-10-24 19:27:45.878033+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1109, 'testuser1761334067742@example.com', 'testpassword123', 'Test User 1761334067742', '+56934067742', 'user', false, false, '2025-10-24 19:27:47.846535+00', '2025-10-24 19:27:47.846535+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1111, 'testuser1761334069029@example.com', 'testpassword123', 'Test User 1761334069029', '+56934069029', 'user', false, false, '2025-10-24 19:27:49.124775+00', '2025-10-24 19:27:49.124775+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1112, 'testuser1761334069651@example.com', 'testpassword123', 'Test User 1761334069651', '+56934069651', 'user', false, false, '2025-10-24 19:27:49.747746+00', '2025-10-24 19:27:49.747746+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1113, 'testuser1761334070618@example.com', 'testpassword123', 'Test User 1761334070618', '+56934070618', 'user', false, false, '2025-10-24 19:27:50.719684+00', '2025-10-24 19:27:50.719684+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1119, 'testuser1761334074536@example.com', 'testpassword123', 'Test User 1761334074536', '+56934074536', 'user', false, false, '2025-10-24 19:27:54.64196+00', '2025-10-24 19:27:54.64196+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1071, 'testuser1761334058387@example.com', 'testpassword123', 'Test User 1761334058387', '+56934058387', 'user', false, false, '2025-10-24 19:27:38.480732+00', '2025-10-24 19:27:38.480732+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1072, 'testuser1761334058612@example.com', 'testpassword123', 'Test User 1761334058612', '+56934058612', 'user', false, false, '2025-10-24 19:27:38.71924+00', '2025-10-24 19:27:38.71924+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1076, 'testuser1761334059479@example.com', 'testpassword123', 'Test User 1761334059479', '+56934059479', 'user', false, false, '2025-10-24 19:27:39.600843+00', '2025-10-24 19:27:39.600843+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1077, 'testuser1761334059846@example.com', 'testpassword123', 'Test User 1761334059846', '+56934059846', 'user', false, false, '2025-10-24 19:27:39.956745+00', '2025-10-24 19:27:39.956745+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1079, 'testuser1761334060163@example.com', 'testpassword123', 'Test User 1761334060163', '+56934060163', 'user', false, false, '2025-10-24 19:27:40.263264+00', '2025-10-24 19:27:40.263264+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1080, 'testuser1761334060479@example.com', 'testpassword123', 'Test User 1761334060479', '+56934060479', 'user', false, false, '2025-10-24 19:27:40.599377+00', '2025-10-24 19:27:40.599377+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1082, 'testuser1761334060787@example.com', 'testpassword123', 'Test User 1761334060787', '+56934060787', 'user', false, false, '2025-10-24 19:27:40.899296+00', '2025-10-24 19:27:40.899296+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1083, 'testuser1761334061104@example.com', 'testpassword123', 'Test User 1761334061104', '+56934061104', 'user', false, false, '2025-10-24 19:27:41.211557+00', '2025-10-24 19:27:41.211557+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1085, 'testuser1761334061403@example.com', 'testpassword123', 'Test User 1761334061403', '+56934061403', 'user', false, false, '2025-10-24 19:27:41.512553+00', '2025-10-24 19:27:41.512553+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1091, 'testuser1761334062737@example.com', 'testpassword123', 'Test User 1761334062737', '+56934062737', 'user', false, false, '2025-10-24 19:27:42.824149+00', '2025-10-24 19:27:42.824149+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1092, 'testuser1761334063031@example.com', 'testpassword123', 'Test User 1761334063031', '+56934063031', 'user', false, false, '2025-10-24 19:27:43.130205+00', '2025-10-24 19:27:43.130205+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1098, 'testuser1761334064278@example.com', 'testpassword123', 'Test User 1761334064278', '+56934064278', 'user', false, false, '2025-10-24 19:27:44.380901+00', '2025-10-24 19:27:44.380901+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1099, 'testuser1761334064645@example.com', 'testpassword123', 'Test User 1761334064645', '+56934064645', 'user', false, false, '2025-10-24 19:27:44.73872+00', '2025-10-24 19:27:44.73872+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1100, 'testuser1761334064944@example.com', 'testpassword123', 'Test User 1761334064944', '+56934064944', 'user', false, false, '2025-10-24 19:27:45.059466+00', '2025-10-24 19:27:45.059466+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1102, 'testuser1761334065253@example.com', 'testpassword123', 'Test User 1761334065253', '+56934065253', 'user', false, false, '2025-10-24 19:27:45.364101+00', '2025-10-24 19:27:45.364101+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1103, 'testuser1761334065601@example.com', 'testpassword123', 'Test User 1761334065601', '+56934065601', 'user', false, false, '2025-10-24 19:27:45.694767+00', '2025-10-24 19:27:45.694767+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1106, 'testuser1761334066288@example.com', 'testpassword123', 'Test User 1761334066288', '+56934066288', 'user', false, false, '2025-10-24 19:27:46.386807+00', '2025-10-24 19:27:46.386807+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1107, 'testuser1761334066373@example.com', 'testpassword123', 'Test User 1761334066373', '+56934066373', 'user', false, false, '2025-10-24 19:27:46.491684+00', '2025-10-24 19:27:46.491684+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1108, 'testuser1761334067005@example.com', 'testpassword123', 'Test User 1761334067005', '+56934067005', 'user', false, false, '2025-10-24 19:27:47.099335+00', '2025-10-24 19:27:47.099335+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1110, 'testuser1761334068418@example.com', 'testpassword123', 'Test User 1761334068418', '+56934068418', 'user', false, false, '2025-10-24 19:27:48.548074+00', '2025-10-24 19:27:48.548074+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1114, 'testuser1761334071312@example.com', 'testpassword123', 'Test User 1761334071312', '+56934071312', 'user', false, false, '2025-10-24 19:27:51.447684+00', '2025-10-24 19:27:51.447684+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1115, 'testuser1761334071957@example.com', 'testpassword123', 'Test User 1761334071957', '+56934071957', 'user', false, false, '2025-10-24 19:27:52.075439+00', '2025-10-24 19:27:52.075439+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1116, 'testuser1761334072589@example.com', 'testpassword123', 'Test User 1761334072589', '+56934072589', 'user', false, false, '2025-10-24 19:27:52.698021+00', '2025-10-24 19:27:52.698021+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1117, 'testuser1761334073191@example.com', 'testpassword123', 'Test User 1761334073191', '+56934073191', 'user', false, false, '2025-10-24 19:27:53.32614+00', '2025-10-24 19:27:53.32614+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1118, 'testuser1761334073831@example.com', 'testpassword123', 'Test User 1761334073831', '+56934073831', 'user', false, false, '2025-10-24 19:27:53.940953+00', '2025-10-24 19:27:53.940953+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1120, 'testuser1761334075105@example.com', 'testpassword123', 'Test User 1761334075105', '+56934075105', 'user', false, false, '2025-10-24 19:27:55.207355+00', '2025-10-24 19:27:55.207355+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1121, 'testuser1761334075671@example.com', 'testpassword123', 'Test User 1761334075671', '+56934075671', 'user', false, false, '2025-10-24 19:27:55.781436+00', '2025-10-24 19:27:55.781436+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1122, 'testuser1761575355448@example.com', 'testpassword123', 'Test User 1761575355448', '+56975355448', 'user', true, false, '2025-10-27 14:29:16.166323+00', '2025-10-27 14:29:16.166323+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1123, 'testuser1761575355443@example.com', 'testpassword123', 'Test User 1761575355443', '+56975355443', 'user', true, false, '2025-10-27 14:29:16.166323+00', '2025-10-27 14:29:16.166323+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1124, 'testuser1761575356627@example.com', 'testpassword123', 'Test User 1761575356627', '+56975356627', 'user', true, false, '2025-10-27 14:29:16.704705+00', '2025-10-27 14:29:16.704705+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1125, 'testuser1761575356940@example.com', 'testpassword123', 'Test User 1761575356940', '+56975356940', 'user', true, false, '2025-10-27 14:29:17.017314+00', '2025-10-27 14:29:17.017314+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1126, 'testuser1761575356965@example.com', 'testpassword123', 'Test User 1761575356965', '+56975356965', 'user', true, false, '2025-10-27 14:29:17.056424+00', '2025-10-27 14:29:17.056424+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1127, 'testuser1761575357320@example.com', 'testpassword123', 'Test User 1761575357320', '+56975357320', 'user', true, false, '2025-10-27 14:29:17.38608+00', '2025-10-27 14:29:17.38608+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1128, 'testuser1761575357404@example.com', 'testpassword123', 'Test User 1761575357404', '+56975357404', 'user', true, false, '2025-10-27 14:29:17.454362+00', '2025-10-27 14:29:17.454362+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1129, 'testuser1761575357600@example.com', 'testpassword123', 'Test User 1761575357600', '+56975357600', 'user', true, false, '2025-10-27 14:29:17.665732+00', '2025-10-27 14:29:17.665732+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1130, 'testuser1761575357809@example.com', 'testpassword123', 'Test User 1761575357809', '+56975357809', 'user', true, false, '2025-10-27 14:29:17.864713+00', '2025-10-27 14:29:17.864713+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1131, 'testuser1761575357898@example.com', 'testpassword123', 'Test User 1761575357898', '+56975357898', 'user', true, false, '2025-10-27 14:29:17.961322+00', '2025-10-27 14:29:17.961322+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1132, 'testuser1761575358224@example.com', 'testpassword123', 'Test User 1761575358224', '+56975358224', 'user', true, false, '2025-10-27 14:29:18.281753+00', '2025-10-27 14:29:18.281753+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1135, 'testuser1761575358680@example.com', 'testpassword123', 'Test User 1761575358680', '+56975358680', 'user', true, false, '2025-10-27 14:29:18.748334+00', '2025-10-27 14:29:18.748334+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1139, 'testuser1761575359394@example.com', 'testpassword123', 'Test User 1761575359394', '+56975359394', 'user', true, false, '2025-10-27 14:29:19.451213+00', '2025-10-27 14:29:19.451213+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1142, 'testuser1761575359924@example.com', 'testpassword123', 'Test User 1761575359924', '+56975359924', 'user', true, false, '2025-10-27 14:29:19.980609+00', '2025-10-27 14:29:19.980609+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1144, 'testuser1761575360244@example.com', 'testpassword123', 'Test User 1761575360244', '+56975360244', 'user', true, false, '2025-10-27 14:29:20.299602+00', '2025-10-27 14:29:20.299602+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1146, 'testuser1761575360520@example.com', 'testpassword123', 'Test User 1761575360520', '+56975360520', 'user', true, false, '2025-10-27 14:29:20.576882+00', '2025-10-27 14:29:20.576882+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1148, 'testuser1761575360962@example.com', 'testpassword123', 'Test User 1761575360962', '+56975360962', 'user', true, false, '2025-10-27 14:29:21.015114+00', '2025-10-27 14:29:21.015114+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1152, 'testuser1761575361666@example.com', 'testpassword123', 'Test User 1761575361666', '+56975361666', 'user', true, false, '2025-10-27 14:29:21.740775+00', '2025-10-27 14:29:21.740775+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1156, 'testuser1761575362321@example.com', 'testpassword123', 'Test User 1761575362321', '+56975362321', 'user', true, false, '2025-10-27 14:29:22.378736+00', '2025-10-27 14:29:22.378736+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1160, 'testuser1761575362966@example.com', 'testpassword123', 'Test User 1761575362966', '+56975362966', 'user', true, false, '2025-10-27 14:29:23.02134+00', '2025-10-27 14:29:23.02134+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1164, 'testuser1761575363815@example.com', 'testpassword123', 'Test User 1761575363815', '+56975363815', 'user', true, false, '2025-10-27 14:29:23.865979+00', '2025-10-27 14:29:23.865979+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1168, 'testuser1761575364500@example.com', 'testpassword123', 'Test User 1761575364500', '+56975364500', 'user', true, false, '2025-10-27 14:29:24.55982+00', '2025-10-27 14:29:24.55982+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1172, 'testuser1761575365074@example.com', 'testpassword123', 'Test User 1761575365074', '+56975365074', 'user', true, false, '2025-10-27 14:29:25.166212+00', '2025-10-27 14:29:25.166212+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1176, 'testuser1761575366404@example.com', 'testpassword123', 'Test User 1761575366404', '+56975366404', 'user', true, false, '2025-10-27 14:29:26.453047+00', '2025-10-27 14:29:26.453047+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1180, 'testuser1761575368165@example.com', 'testpassword123', 'Test User 1761575368165', '+56975368165', 'user', true, false, '2025-10-27 14:29:28.230447+00', '2025-10-27 14:29:28.230447+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1185, 'testuser1761575384146@example.com', 'testpassword123', 'Test User 1761575384146', '+56975384146', 'user', true, false, '2025-10-27 14:29:44.204581+00', '2025-10-27 14:29:44.204581+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1187, 'testuser1761575384604@example.com', 'testpassword123', 'Test User 1761575384604', '+56975384604', 'user', true, false, '2025-10-27 14:29:44.653469+00', '2025-10-27 14:29:44.653469+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1191, 'testuser1761575385165@example.com', 'testpassword123', 'Test User 1761575385165', '+56975385165', 'user', true, false, '2025-10-27 14:29:45.20331+00', '2025-10-27 14:29:45.20331+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1195, 'testuser1761575385830@example.com', 'testpassword123', 'Test User 1761575385830', '+56975385830', 'user', true, false, '2025-10-27 14:29:45.890367+00', '2025-10-27 14:29:45.890367+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1198, 'testuser1761575386254@example.com', 'testpassword123', 'Test User 1761575386254', '+56975386254', 'user', true, false, '2025-10-27 14:29:46.307668+00', '2025-10-27 14:29:46.307668+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1205, 'testuser1761575387653@example.com', 'testpassword123', 'Test User 1761575387653', '+56975387653', 'user', true, false, '2025-10-27 14:29:47.720049+00', '2025-10-27 14:29:47.720049+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1208, 'testuser1761575388100@example.com', 'testpassword123', 'Test User 1761575388100', '+56975388100', 'user', true, false, '2025-10-27 14:29:48.1643+00', '2025-10-27 14:29:48.1643+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1212, 'testuser1761575388817@example.com', 'testpassword123', 'Test User 1761575388817', '+56975388817', 'user', true, false, '2025-10-27 14:29:48.867811+00', '2025-10-27 14:29:48.867811+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1216, 'testuser1761575389417@example.com', 'testpassword123', 'Test User 1761575389417', '+56975389417', 'user', true, false, '2025-10-27 14:29:49.489979+00', '2025-10-27 14:29:49.489979+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1220, 'testuser1761575390232@example.com', 'testpassword123', 'Test User 1761575390232', '+56975390232', 'user', true, false, '2025-10-27 14:29:50.297111+00', '2025-10-27 14:29:50.297111+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1224, 'testuser1761575390825@example.com', 'testpassword123', 'Test User 1761575390825', '+56975390825', 'user', true, false, '2025-10-27 14:29:50.877048+00', '2025-10-27 14:29:50.877048+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1228, 'testuser1761575391628@example.com', 'testpassword123', 'Test User 1761575391628', '+56975391628', 'user', true, false, '2025-10-27 14:29:51.683345+00', '2025-10-27 14:29:51.683345+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1232, 'testuser1761575392306@example.com', 'testpassword123', 'Test User 1761575392306', '+56975392306', 'user', true, false, '2025-10-27 14:29:52.358973+00', '2025-10-27 14:29:52.358973+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1236, 'testuser1761575393884@example.com', 'testpassword123', 'Test User 1761575393884', '+56975393884', 'user', true, false, '2025-10-27 14:29:53.96022+00', '2025-10-27 14:29:53.96022+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1240, 'testuser1761575395720@example.com', 'testpassword123', 'Test User 1761575395720', '+56975395720', 'user', true, false, '2025-10-27 14:29:55.789042+00', '2025-10-27 14:29:55.789042+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1133, 'testuser1761575358248@example.com', 'testpassword123', 'Test User 1761575358248', '+56975358248', 'user', true, false, '2025-10-27 14:29:18.297823+00', '2025-10-27 14:29:18.297823+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1136, 'testuser1761575358753@example.com', 'testpassword123', 'Test User 1761575358753', '+56975358753', 'user', true, false, '2025-10-27 14:29:18.811665+00', '2025-10-27 14:29:18.811665+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1140, 'testuser1761575359636@example.com', 'testpassword123', 'Test User 1761575359636', '+56975359636', 'user', true, false, '2025-10-27 14:29:19.716113+00', '2025-10-27 14:29:19.716113+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1149, 'testuser1761575361092@example.com', 'testpassword123', 'Test User 1761575361092', '+56975361092', 'user', true, false, '2025-10-27 14:29:21.160881+00', '2025-10-27 14:29:21.160881+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1153, 'testuser1761575361791@example.com', 'testpassword123', 'Test User 1761575361791', '+56975361791', 'user', true, false, '2025-10-27 14:29:21.842474+00', '2025-10-27 14:29:21.842474+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1157, 'testuser1761575362588@example.com', 'testpassword123', 'Test User 1761575362588', '+56975362588', 'user', true, false, '2025-10-27 14:29:22.633042+00', '2025-10-27 14:29:22.633042+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1161, 'testuser1761575363343@example.com', 'testpassword123', 'Test User 1761575363343', '+56975363343', 'user', true, false, '2025-10-27 14:29:23.38694+00', '2025-10-27 14:29:23.38694+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1165, 'testuser1761575363887@example.com', 'testpassword123', 'Test User 1761575363887', '+56975363887', 'user', true, false, '2025-10-27 14:29:23.935732+00', '2025-10-27 14:29:23.935732+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1169, 'testuser1761575364636@example.com', 'testpassword123', 'Test User 1761575364636', '+56975364636', 'user', true, false, '2025-10-27 14:29:24.71385+00', '2025-10-27 14:29:24.71385+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1173, 'testuser1761575365366@example.com', 'testpassword123', 'Test User 1761575365366', '+56975365366', 'user', true, false, '2025-10-27 14:29:25.45365+00', '2025-10-27 14:29:25.45365+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1177, 'testuser1761575366821@example.com', 'testpassword123', 'Test User 1761575366821', '+56975366821', 'user', true, false, '2025-10-27 14:29:26.887649+00', '2025-10-27 14:29:26.887649+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1181, 'testuser1761575368605@example.com', 'testpassword123', 'Test User 1761575368605', '+56975368605', 'user', true, false, '2025-10-27 14:29:28.687604+00', '2025-10-27 14:29:28.687604+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1184, 'testuser1761575383986@example.com', 'testpassword123', 'Test User 1761575383986', '+56975383986', 'user', true, false, '2025-10-27 14:29:44.039638+00', '2025-10-27 14:29:44.039638+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1186, 'testuser1761575384285@example.com', 'testpassword123', 'Test User 1761575384285', '+56975384285', 'user', true, false, '2025-10-27 14:29:44.331432+00', '2025-10-27 14:29:44.331432+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1188, 'testuser1761575384586@example.com', 'testpassword123', 'Test User 1761575384586', '+56975384586', 'user', true, false, '2025-10-27 14:29:44.681142+00', '2025-10-27 14:29:44.681142+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1192, 'testuser1761575385418@example.com', 'testpassword123', 'Test User 1761575385418', '+56975385418', 'user', true, false, '2025-10-27 14:29:45.471617+00', '2025-10-27 14:29:45.471617+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1194, 'testuser1761575385711@example.com', 'testpassword123', 'Test User 1761575385711', '+56975385711', 'user', true, false, '2025-10-27 14:29:45.784901+00', '2025-10-27 14:29:45.784901+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1196, 'testuser1761575385985@example.com', 'testpassword123', 'Test User 1761575385985', '+56975385985', 'user', true, false, '2025-10-27 14:29:46.044912+00', '2025-10-27 14:29:46.044912+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1201, 'testuser1761575386743@example.com', 'testpassword123', 'Test User 1761575386743', '+56975386743', 'user', true, false, '2025-10-27 14:29:46.890764+00', '2025-10-27 14:29:46.890764+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1207, 'testuser1761575387938@example.com', 'testpassword123', 'Test User 1761575387938', '+56975387938', 'user', true, false, '2025-10-27 14:29:48.006242+00', '2025-10-27 14:29:48.006242+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1211, 'testuser1761575388538@example.com', 'testpassword123', 'Test User 1761575388538', '+56975388538', 'user', true, false, '2025-10-27 14:29:48.583806+00', '2025-10-27 14:29:48.583806+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1215, 'testuser1761575389394@example.com', 'testpassword123', 'Test User 1761575389394', '+56975389394', 'user', true, false, '2025-10-27 14:29:49.431522+00', '2025-10-27 14:29:49.431522+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1219, 'testuser1761575389910@example.com', 'testpassword123', 'Test User 1761575389910', '+56975389910', 'user', true, false, '2025-10-27 14:29:49.97497+00', '2025-10-27 14:29:49.97497+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1223, 'testuser1761575390738@example.com', 'testpassword123', 'Test User 1761575390738', '+56975390738', 'user', true, false, '2025-10-27 14:29:50.8158+00', '2025-10-27 14:29:50.8158+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1227, 'testuser1761575391431@example.com', 'testpassword123', 'Test User 1761575391431', '+56975391431', 'user', true, false, '2025-10-27 14:29:51.496991+00', '2025-10-27 14:29:51.496991+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1231, 'testuser1761575392045@example.com', 'testpassword123', 'Test User 1761575392045', '+56975392045', 'user', true, false, '2025-10-27 14:29:52.102566+00', '2025-10-27 14:29:52.102566+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1235, 'testuser1761575393365@example.com', 'testpassword123', 'Test User 1761575393365', '+56975393365', 'user', true, false, '2025-10-27 14:29:53.440145+00', '2025-10-27 14:29:53.440145+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1239, 'testuser1761575395297@example.com', 'testpassword123', 'Test User 1761575395297', '+56975395297', 'user', true, false, '2025-10-27 14:29:55.345061+00', '2025-10-27 14:29:55.345061+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1134, 'testuser1761575358499@example.com', 'testpassword123', 'Test User 1761575358499', '+56975358499', 'user', true, false, '2025-10-27 14:29:18.548888+00', '2025-10-27 14:29:18.548888+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1138, 'testuser1761575359143@example.com', 'testpassword123', 'Test User 1761575359143', '+56975359143', 'user', true, false, '2025-10-27 14:29:19.203925+00', '2025-10-27 14:29:19.203925+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1145, 'testuser1761575360513@example.com', 'testpassword123', 'Test User 1761575360513', '+56975360513', 'user', true, false, '2025-10-27 14:29:20.562153+00', '2025-10-27 14:29:20.562153+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1147, 'testuser1761575360824@example.com', 'testpassword123', 'Test User 1761575360824', '+56975360824', 'user', true, false, '2025-10-27 14:29:20.891572+00', '2025-10-27 14:29:20.891572+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1151, 'testuser1761575361387@example.com', 'testpassword123', 'Test User 1761575361387', '+56975361387', 'user', true, false, '2025-10-27 14:29:21.446558+00', '2025-10-27 14:29:21.446558+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1155, 'testuser1761575362183@example.com', 'testpassword123', 'Test User 1761575362183', '+56975362183', 'user', true, false, '2025-10-27 14:29:22.251294+00', '2025-10-27 14:29:22.251294+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1159, 'testuser1761575362964@example.com', 'testpassword123', 'Test User 1761575362964', '+56975362964', 'user', true, false, '2025-10-27 14:29:23.020862+00', '2025-10-27 14:29:23.020862+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1163, 'testuser1761575363603@example.com', 'testpassword123', 'Test User 1761575363603', '+56975363603', 'user', true, false, '2025-10-27 14:29:23.658306+00', '2025-10-27 14:29:23.658306+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1167, 'testuser1761575364227@example.com', 'testpassword123', 'Test User 1761575364227', '+56975364227', 'user', true, false, '2025-10-27 14:29:24.288405+00', '2025-10-27 14:29:24.288405+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1171, 'testuser1761575365081@example.com', 'testpassword123', 'Test User 1761575365081', '+56975365081', 'user', true, false, '2025-10-27 14:29:25.147943+00', '2025-10-27 14:29:25.147943+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1175, 'testuser1761575365970@example.com', 'testpassword123', 'Test User 1761575365970', '+56975365970', 'user', true, false, '2025-10-27 14:29:26.034217+00', '2025-10-27 14:29:26.034217+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1179, 'testuser1761575367740@example.com', 'testpassword123', 'Test User 1761575367740', '+56975367740', 'user', true, false, '2025-10-27 14:29:27.796816+00', '2025-10-27 14:29:27.796816+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1190, 'testuser1761575385051@example.com', 'testpassword123', 'Test User 1761575385051', '+56975385051', 'user', true, false, '2025-10-27 14:29:45.09942+00', '2025-10-27 14:29:45.09942+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1193, 'testuser1761575385434@example.com', 'testpassword123', 'Test User 1761575385434', '+56975385434', 'user', true, false, '2025-10-27 14:29:45.497087+00', '2025-10-27 14:29:45.497087+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1203, 'testuser1761575387266@example.com', 'testpassword123', 'Test User 1761575387266', '+56975387266', 'user', true, false, '2025-10-27 14:29:47.327857+00', '2025-10-27 14:29:47.327857+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1206, 'testuser1761575387665@example.com', 'testpassword123', 'Test User 1761575387665', '+56975387665', 'user', true, false, '2025-10-27 14:29:47.723312+00', '2025-10-27 14:29:47.723312+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1209, 'testuser1761575388237@example.com', 'testpassword123', 'Test User 1761575388237', '+56975388237', 'user', true, false, '2025-10-27 14:29:48.289478+00', '2025-10-27 14:29:48.289478+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1213, 'testuser1761575388955@example.com', 'testpassword123', 'Test User 1761575388955', '+56975388955', 'user', true, false, '2025-10-27 14:29:49.007773+00', '2025-10-27 14:29:49.007773+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1217, 'testuser1761575389654@example.com', 'testpassword123', 'Test User 1761575389654', '+56975389654', 'user', true, false, '2025-10-27 14:29:49.692062+00', '2025-10-27 14:29:49.692062+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1221, 'testuser1761575390296@example.com', 'testpassword123', 'Test User 1761575390296', '+56975390296', 'user', true, false, '2025-10-27 14:29:50.347426+00', '2025-10-27 14:29:50.347426+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1225, 'testuser1761575391129@example.com', 'testpassword123', 'Test User 1761575391129', '+56975391129', 'user', true, false, '2025-10-27 14:29:51.191206+00', '2025-10-27 14:29:51.191206+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1229, 'testuser1761575391746@example.com', 'testpassword123', 'Test User 1761575391746', '+56975391746', 'user', true, false, '2025-10-27 14:29:51.806262+00', '2025-10-27 14:29:51.806262+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1233, 'testuser1761575392542@example.com', 'testpassword123', 'Test User 1761575392542', '+56975392542', 'user', true, false, '2025-10-27 14:29:52.596509+00', '2025-10-27 14:29:52.596509+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1237, 'testuser1761575394433@example.com', 'testpassword123', 'Test User 1761575394433', '+56975394433', 'user', true, false, '2025-10-27 14:29:54.496268+00', '2025-10-27 14:29:54.496268+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1241, 'testuser1761575396219@example.com', 'testpassword123', 'Test User 1761575396219', '+56975396219', 'user', true, false, '2025-10-27 14:29:56.279217+00', '2025-10-27 14:29:56.279217+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1137, 'testuser1761575359101@example.com', 'testpassword123', 'Test User 1761575359101', '+56975359101', 'user', true, false, '2025-10-27 14:29:19.163847+00', '2025-10-27 14:29:19.163847+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1141, 'testuser1761575359677@example.com', 'testpassword123', 'Test User 1761575359677', '+56975359677', 'user', true, false, '2025-10-27 14:29:19.720579+00', '2025-10-27 14:29:19.720579+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1143, 'testuser1761575360096@example.com', 'testpassword123', 'Test User 1761575360096', '+56975360096', 'user', true, false, '2025-10-27 14:29:20.166891+00', '2025-10-27 14:29:20.166891+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1150, 'testuser1761575361378@example.com', 'testpassword123', 'Test User 1761575361378', '+56975361378', 'user', true, false, '2025-10-27 14:29:21.441312+00', '2025-10-27 14:29:21.441312+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1154, 'testuser1761575361994@example.com', 'testpassword123', 'Test User 1761575361994', '+56975361994', 'user', true, false, '2025-10-27 14:29:22.056434+00', '2025-10-27 14:29:22.056434+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1158, 'testuser1761575362657@example.com', 'testpassword123', 'Test User 1761575362657', '+56975362657', 'user', true, false, '2025-10-27 14:29:22.70821+00', '2025-10-27 14:29:22.70821+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1162, 'testuser1761575363379@example.com', 'testpassword123', 'Test User 1761575363379', '+56975363379', 'user', true, false, '2025-10-27 14:29:23.423682+00', '2025-10-27 14:29:23.423682+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1166, 'testuser1761575364186@example.com', 'testpassword123', 'Test User 1761575364186', '+56975364186', 'user', true, false, '2025-10-27 14:29:24.254093+00', '2025-10-27 14:29:24.254093+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1170, 'testuser1761575364783@example.com', 'testpassword123', 'Test User 1761575364783', '+56975364783', 'user', true, false, '2025-10-27 14:29:24.841839+00', '2025-10-27 14:29:24.841839+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1174, 'testuser1761575365550@example.com', 'testpassword123', 'Test User 1761575365550', '+56975365550', 'user', true, false, '2025-10-27 14:29:25.604685+00', '2025-10-27 14:29:25.604685+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1178, 'testuser1761575367295@example.com', 'testpassword123', 'Test User 1761575367295', '+56975367295', 'user', true, false, '2025-10-27 14:29:27.358628+00', '2025-10-27 14:29:27.358628+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1182, 'testuser1761575382607@example.com', 'testpassword123', 'Test User 1761575382607', '+56975382607', 'user', true, false, '2025-10-27 14:29:43.72887+00', '2025-10-27 14:29:43.72887+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1189, 'testuser1761575384910@example.com', 'testpassword123', 'Test User 1761575384910', '+56975384910', 'user', true, false, '2025-10-27 14:29:44.957394+00', '2025-10-27 14:29:44.957394+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1197, 'testuser1761575386243@example.com', 'testpassword123', 'Test User 1761575386243', '+56975386243', 'user', true, false, '2025-10-27 14:29:46.307973+00', '2025-10-27 14:29:46.307973+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1199, 'testuser1761575386522@example.com', 'testpassword123', 'Test User 1761575386522', '+56975386522', 'user', true, false, '2025-10-27 14:29:46.566749+00', '2025-10-27 14:29:46.566749+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1200, 'testuser1761575386777@example.com', 'testpassword123', 'Test User 1761575386777', '+56975386777', 'user', true, false, '2025-10-27 14:29:46.834069+00', '2025-10-27 14:29:46.834069+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1202, 'testuser1761575387078@example.com', 'testpassword123', 'Test User 1761575387078', '+56975387078', 'user', true, false, '2025-10-27 14:29:47.12402+00', '2025-10-27 14:29:47.12402+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1204, 'testuser1761575387336@example.com', 'testpassword123', 'Test User 1761575387336', '+56975387336', 'user', true, false, '2025-10-27 14:29:47.42102+00', '2025-10-27 14:29:47.42102+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1210, 'testuser1761575388534@example.com', 'testpassword123', 'Test User 1761575388534', '+56975388534', 'user', true, false, '2025-10-27 14:29:48.582738+00', '2025-10-27 14:29:48.582738+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1214, 'testuser1761575389121@example.com', 'testpassword123', 'Test User 1761575389121', '+56975389121', 'user', true, false, '2025-10-27 14:29:49.175924+00', '2025-10-27 14:29:49.175924+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1218, 'testuser1761575389860@example.com', 'testpassword123', 'Test User 1761575389860', '+56975389860', 'user', true, false, '2025-10-27 14:29:49.925967+00', '2025-10-27 14:29:49.925967+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1222, 'testuser1761575390547@example.com', 'testpassword123', 'Test User 1761575390547', '+56975390547', 'user', true, false, '2025-10-27 14:29:50.592958+00', '2025-10-27 14:29:50.592958+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1226, 'testuser1761575391190@example.com', 'testpassword123', 'Test User 1761575391190', '+56975391190', 'user', true, false, '2025-10-27 14:29:51.242156+00', '2025-10-27 14:29:51.242156+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1230, 'testuser1761575392024@example.com', 'testpassword123', 'Test User 1761575392024', '+56975392024', 'user', true, false, '2025-10-27 14:29:52.07967+00', '2025-10-27 14:29:52.07967+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1234, 'testuser1761575392957@example.com', 'testpassword123', 'Test User 1761575392957', '+56975392957', 'user', true, false, '2025-10-27 14:29:53.0135+00', '2025-10-27 14:29:53.0135+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (1238, 'testuser1761575394865@example.com', 'testpassword123', 'Test User 1761575394865', '+56975394865', 'user', true, false, '2025-10-27 14:29:54.928702+00', '2025-10-27 14:29:54.928702+00', DEFAULT, DEFAULT);


--
-- TOC entry 4526 (class 0 OID 0)
-- Dependencies: 400
-- Name: busquedas_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.busquedas_log_id_seq', 1, false);


--
-- TOC entry 4527 (class 0 OID 0)
-- Dependencies: 409
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, true);


--
-- TOC entry 4528 (class 0 OID 0)
-- Dependencies: 378
-- Name: occasions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.occasions_id_seq', 410, true);


--
-- TOC entry 4529 (class 0 OID 0)
-- Dependencies: 390
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1083, true);


--
-- TOC entry 4530 (class 0 OID 0)
-- Dependencies: 392
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 844, true);


--
-- TOC entry 4531 (class 0 OID 0)
-- Dependencies: 388
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 614, true);


--
-- TOC entry 4532 (class 0 OID 0)
-- Dependencies: 394
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 886, true);


--
-- TOC entry 4533 (class 0 OID 0)
-- Dependencies: 396
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 206, true);


--
-- TOC entry 4534 (class 0 OID 0)
-- Dependencies: 398
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 644, true);


--
-- TOC entry 4535 (class 0 OID 0)
-- Dependencies: 386
-- Name: product_occasions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_occasions_id_seq', 126, true);


--
-- TOC entry 4536 (class 0 OID 0)
-- Dependencies: 384
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 190, true);


--
-- TOC entry 4537 (class 0 OID 0)
-- Dependencies: 402
-- Name: query_timeouts_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.query_timeouts_log_id_seq', 11, true);


--
-- TOC entry 4538 (class 0 OID 0)
-- Dependencies: 382
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 85, true);


--
-- TOC entry 4539 (class 0 OID 0)
-- Dependencies: 380
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1241, true);


--
-- TOC entry 4126 (class 2606 OID 59813)
-- Name: busquedas_log busquedas_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.busquedas_log
    ADD CONSTRAINT busquedas_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4139 (class 2606 OID 84817)
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4008 (class 2606 OID 32000)
-- Name: occasions occasions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_name_key UNIQUE (name);


--
-- TOC entry 4011 (class 2606 OID 31998)
-- Name: occasions occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 4013 (class 2606 OID 32573)
-- Name: occasions occasions_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_slug_unique UNIQUE (slug);


--
-- TOC entry 4098 (class 2606 OID 32124)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4101 (class 2606 OID 32144)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4091 (class 2606 OID 32105)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4104 (class 2606 OID 32167)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 4110 (class 2606 OID 32180)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 4122 (class 2606 OID 32537)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4124 (class 2606 OID 32539)
-- Name: product_images product_images_product_id_image_index_size_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_image_index_size_key UNIQUE (product_id, image_index, size);


--
-- TOC entry 4066 (class 2606 OID 32079)
-- Name: product_occasions product_occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 4068 (class 2606 OID 32081)
-- Name: product_occasions product_occasions_product_id_occasion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_occasion_id_key UNIQUE (product_id, occasion_id);


--
-- TOC entry 4057 (class 2606 OID 32048)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4059 (class 2606 OID 32050)
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- TOC entry 4137 (class 2606 OID 59949)
-- Name: query_timeouts_log query_timeouts_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.query_timeouts_log
    ADD CONSTRAINT query_timeouts_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4029 (class 2606 OID 32031)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 4032 (class 2606 OID 32029)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4022 (class 2606 OID 32016)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4024 (class 2606 OID 77922)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email_normalized);


--
-- TOC entry 4026 (class 2606 OID 32014)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4127 (class 1259 OID 59815)
-- Name: idx_busquedas_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_busquedas_fecha ON public.busquedas_log USING btree (created_at DESC);


--
-- TOC entry 4128 (class 1259 OID 77627)
-- Name: idx_busquedas_ip_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_busquedas_ip_fecha ON public.busquedas_log USING btree (ip_cliente, created_at);


--
-- TOC entry 4129 (class 1259 OID 77813)
-- Name: idx_busquedas_log_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_busquedas_log_active ON public.busquedas_log USING btree (active);


--
-- TOC entry 4130 (class 1259 OID 77628)
-- Name: idx_busquedas_resultados; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_busquedas_resultados ON public.busquedas_log USING btree (resultados) WHERE (resultados = 0);


--
-- TOC entry 4131 (class 1259 OID 59814)
-- Name: idx_busquedas_termino_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_busquedas_termino_fecha ON public.busquedas_log USING btree (termino_busqueda, created_at DESC);


--
-- TOC entry 4140 (class 1259 OID 84822)
-- Name: idx_expenses_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_active ON public.expenses USING btree (active);


--
-- TOC entry 4141 (class 1259 OID 86509)
-- Name: idx_expenses_amount; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_amount ON public.expenses USING btree (amount DESC);


--
-- TOC entry 4142 (class 1259 OID 86506)
-- Name: idx_expenses_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_category ON public.expenses USING btree (category);


--
-- TOC entry 4143 (class 1259 OID 86511)
-- Name: idx_expenses_category_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_category_date ON public.expenses USING btree (category, expense_date DESC);


--
-- TOC entry 4144 (class 1259 OID 86510)
-- Name: idx_expenses_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_created_at ON public.expenses USING btree (created_at DESC);


--
-- TOC entry 4145 (class 1259 OID 84820)
-- Name: idx_expenses_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_created_by ON public.expenses USING btree (created_by);


--
-- TOC entry 4146 (class 1259 OID 86507)
-- Name: idx_expenses_expense_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_expense_date ON public.expenses USING btree (expense_date DESC);


--
-- TOC entry 4147 (class 1259 OID 86508)
-- Name: idx_expenses_payment_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expenses_payment_method ON public.expenses USING btree (payment_method);


--
-- TOC entry 4004 (class 1259 OID 77804)
-- Name: idx_occasions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_occasions_active ON public.occasions USING btree (active);


--
-- TOC entry 4005 (class 1259 OID 77626)
-- Name: idx_occasions_active_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_occasions_active_display_order ON public.occasions USING btree (active, display_order);


--
-- TOC entry 4006 (class 1259 OID 67986)
-- Name: idx_occasions_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_occasions_is_active ON public.occasions USING btree (active) WHERE (active = true);


--
-- TOC entry 4092 (class 1259 OID 77811)
-- Name: idx_order_items_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_active ON public.order_items USING btree (active);


--
-- TOC entry 4093 (class 1259 OID 86504)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 4094 (class 1259 OID 59745)
-- Name: idx_order_items_order_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_product ON public.order_items USING btree (order_id, product_id);


--
-- TOC entry 4095 (class 1259 OID 86505)
-- Name: idx_order_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);


--
-- TOC entry 4096 (class 1259 OID 59746)
-- Name: idx_order_items_product_quantity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_product_quantity ON public.order_items USING btree (product_id, quantity DESC);


--
-- TOC entry 4099 (class 1259 OID 77812)
-- Name: idx_order_status_history_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_status_history_active ON public.order_status_history USING btree (active);


--
-- TOC entry 4069 (class 1259 OID 77807)
-- Name: idx_orders_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_active ON public.orders USING btree (active);


--
-- TOC entry 4070 (class 1259 OID 59742)
-- Name: idx_orders_amount_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_amount_date ON public.orders USING btree (total_amount_usd DESC, created_at DESC);


--
-- TOC entry 4071 (class 1259 OID 86495)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 4072 (class 1259 OID 86498)
-- Name: idx_orders_customer_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (customer_email);


--
-- TOC entry 4073 (class 1259 OID 52861)
-- Name: idx_orders_customer_email_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_email_normalized ON public.orders USING btree (customer_email_normalized);


--
-- TOC entry 4074 (class 1259 OID 86497)
-- Name: idx_orders_customer_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_name ON public.orders USING btree (customer_name);


--
-- TOC entry 4075 (class 1259 OID 52849)
-- Name: idx_orders_customer_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_name_normalized ON public.orders USING btree (customer_name_normalized);


--
-- TOC entry 4076 (class 1259 OID 86500)
-- Name: idx_orders_customer_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_phone ON public.orders USING btree (customer_phone);


--
-- TOC entry 4077 (class 1259 OID 59741)
-- Name: idx_orders_delivered; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_delivered ON public.orders USING btree (created_at DESC) WHERE (status = 'delivered'::public.order_status);


--
-- TOC entry 4078 (class 1259 OID 86499)
-- Name: idx_orders_delivery_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_delivery_address ON public.orders USING btree (delivery_address);


--
-- TOC entry 4079 (class 1259 OID 86502)
-- Name: idx_orders_delivery_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_delivery_date ON public.orders USING btree (delivery_date);


--
-- TOC entry 4080 (class 1259 OID 59740)
-- Name: idx_orders_recent_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_recent_active ON public.orders USING btree (created_at DESC) WHERE (status = ANY (ARRAY['pending'::public.order_status, 'verified'::public.order_status, 'preparing'::public.order_status]));


--
-- TOC entry 4081 (class 1259 OID 86496)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 4082 (class 1259 OID 77931)
-- Name: idx_orders_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_created ON public.orders USING btree (status, created_at DESC);


--
-- TOC entry 4083 (class 1259 OID 86503)
-- Name: idx_orders_status_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_created_at ON public.orders USING btree (status, created_at DESC);


--
-- TOC entry 4084 (class 1259 OID 59738)
-- Name: idx_orders_status_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status_date ON public.orders USING btree (status, created_at DESC);


--
-- TOC entry 4085 (class 1259 OID 67988)
-- Name: idx_orders_total_amount; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_total_amount ON public.orders USING btree (total_amount_usd);


--
-- TOC entry 4086 (class 1259 OID 86501)
-- Name: idx_orders_total_amount_usd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_total_amount_usd ON public.orders USING btree (total_amount_usd DESC);


--
-- TOC entry 4087 (class 1259 OID 67991)
-- Name: idx_orders_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_created ON public.orders USING btree (user_id, created_at DESC);


--
-- TOC entry 4088 (class 1259 OID 59739)
-- Name: idx_orders_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_date ON public.orders USING btree (user_id, created_at DESC) WHERE (user_id IS NOT NULL);


--
-- TOC entry 4089 (class 1259 OID 32199)
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- TOC entry 4102 (class 1259 OID 77805)
-- Name: idx_payment_methods_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_methods_active ON public.payment_methods USING btree (active);


--
-- TOC entry 4105 (class 1259 OID 77808)
-- Name: idx_payments_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_active ON public.payments USING btree (active);


--
-- TOC entry 4106 (class 1259 OID 32203)
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- TOC entry 4107 (class 1259 OID 67990)
-- Name: idx_payments_payment_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_payment_date ON public.payments USING btree (payment_date) WHERE (payment_date IS NOT NULL);


--
-- TOC entry 4108 (class 1259 OID 32204)
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- TOC entry 4111 (class 1259 OID 77809)
-- Name: idx_product_images_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_active ON public.product_images USING btree (active);


--
-- TOC entry 4112 (class 1259 OID 58597)
-- Name: idx_product_images_file_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_file_hash ON public.product_images USING btree (file_hash);


--
-- TOC entry 4113 (class 1259 OID 59744)
-- Name: idx_product_images_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_hash ON public.product_images USING btree (file_hash) WHERE (file_hash IS NOT NULL);


--
-- TOC entry 4114 (class 1259 OID 32548)
-- Name: idx_product_images_only_one_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_product_images_only_one_primary ON public.product_images USING btree (product_id) WHERE (is_primary = true);


--
-- TOC entry 4115 (class 1259 OID 58513)
-- Name: idx_product_images_only_one_primary_per_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_product_images_only_one_primary_per_size ON public.product_images USING btree (product_id, size) WHERE (is_primary = true);


--
-- TOC entry 4116 (class 1259 OID 32546)
-- Name: idx_product_images_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_primary ON public.product_images USING btree (product_id, is_primary) WHERE (is_primary = true);


--
-- TOC entry 4117 (class 1259 OID 32545)
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- TOC entry 4118 (class 1259 OID 58514)
-- Name: idx_product_images_product_id_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_id_active ON public.product_images USING btree (product_id) WHERE (is_primary = true);


--
-- TOC entry 4119 (class 1259 OID 59743)
-- Name: idx_product_images_product_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_primary ON public.product_images USING btree (product_id, is_primary DESC, image_index);


--
-- TOC entry 4120 (class 1259 OID 32547)
-- Name: idx_product_images_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_size ON public.product_images USING btree (size);


--
-- TOC entry 4061 (class 1259 OID 77810)
-- Name: idx_product_occasions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_occasions_active ON public.product_occasions USING btree (active);


--
-- TOC entry 4062 (class 1259 OID 86494)
-- Name: idx_product_occasions_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_occasions_composite ON public.product_occasions USING btree (occasion_id, product_id);


--
-- TOC entry 4063 (class 1259 OID 86493)
-- Name: idx_product_occasions_occasion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_occasions_occasion_id ON public.product_occasions USING btree (occasion_id);


--
-- TOC entry 4064 (class 1259 OID 86492)
-- Name: idx_product_occasions_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_occasions_product_id ON public.product_occasions USING btree (product_id);


--
-- TOC entry 4033 (class 1259 OID 86483)
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active ON public.products USING btree (active);


--
-- TOC entry 4034 (class 1259 OID 86491)
-- Name: idx_products_active_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_created ON public.products USING btree (active, created_at);


--
-- TOC entry 4035 (class 1259 OID 59733)
-- Name: idx_products_active_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_created_at ON public.products USING btree (active DESC, created_at DESC) WHERE (active = true);


--
-- TOC entry 4036 (class 1259 OID 86489)
-- Name: idx_products_active_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_featured ON public.products USING btree (active, featured);


--
-- TOC entry 4037 (class 1259 OID 59732)
-- Name: idx_products_active_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_name_normalized ON public.products USING btree (active, name_normalized) WHERE (active = true);


--
-- TOC entry 4038 (class 1259 OID 86490)
-- Name: idx_products_active_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_price ON public.products USING btree (active, price_usd);


--
-- TOC entry 4039 (class 1259 OID 59800)
-- Name: idx_products_active_search_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_search_gin ON public.products USING gin (search_vector) WHERE (active = true);


--
-- TOC entry 4040 (class 1259 OID 86487)
-- Name: idx_products_carousel_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_carousel_order ON public.products USING btree (carousel_order);


--
-- TOC entry 4041 (class 1259 OID 86488)
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at DESC);


--
-- TOC entry 4042 (class 1259 OID 52886)
-- Name: idx_products_description_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_description_normalized ON public.products USING btree (description_normalized);


--
-- TOC entry 4043 (class 1259 OID 86484)
-- Name: idx_products_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_featured ON public.products USING btree (featured);


--
-- TOC entry 4044 (class 1259 OID 59735)
-- Name: idx_products_featured_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_featured_active ON public.products USING btree (featured DESC, carousel_order) WHERE ((active = true) AND (featured = true));


--
-- TOC entry 4045 (class 1259 OID 67987)
-- Name: idx_products_featured_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_featured_created ON public.products USING btree (featured DESC, created_at DESC) WHERE (active = true);


--
-- TOC entry 4046 (class 1259 OID 86482)
-- Name: idx_products_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_name ON public.products USING btree (name);


--
-- TOC entry 4047 (class 1259 OID 52873)
-- Name: idx_products_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_name_normalized ON public.products USING btree (name_normalized);


--
-- TOC entry 4048 (class 1259 OID 59736)
-- Name: idx_products_price_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_price_active ON public.products USING btree (price_usd, active) WHERE (active = true);


--
-- TOC entry 4049 (class 1259 OID 86481)
-- Name: idx_products_price_usd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_price_usd ON public.products USING btree (price_usd);


--
-- TOC entry 4050 (class 1259 OID 59734)
-- Name: idx_products_search_full; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_search_full ON public.products USING btree (name_normalized, description_normalized) WHERE (active = true);


--
-- TOC entry 4051 (class 1259 OID 77625)
-- Name: idx_products_search_vector; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_search_vector ON public.products USING gin (search_vector);


--
-- TOC entry 4052 (class 1259 OID 59799)
-- Name: idx_products_search_vector_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_search_vector_gin ON public.products USING gin (search_vector) WHERE (active = true);


--
-- TOC entry 4053 (class 1259 OID 86485)
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- TOC entry 4054 (class 1259 OID 86486)
-- Name: idx_products_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_stock ON public.products USING btree (stock);


--
-- TOC entry 4055 (class 1259 OID 59737)
-- Name: idx_products_stock_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_stock_active ON public.products USING btree (stock, active) WHERE (active = true);


--
-- TOC entry 4132 (class 1259 OID 59952)
-- Name: idx_query_timeouts_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_timeouts_estado ON public.query_timeouts_log USING btree (estado, fecha_hora DESC);


--
-- TOC entry 4133 (class 1259 OID 59950)
-- Name: idx_query_timeouts_fecha_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_timeouts_fecha_hora ON public.query_timeouts_log USING btree (fecha_hora DESC);


--
-- TOC entry 4134 (class 1259 OID 77814)
-- Name: idx_query_timeouts_log_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_timeouts_log_active ON public.query_timeouts_log USING btree (active);


--
-- TOC entry 4135 (class 1259 OID 59951)
-- Name: idx_query_timeouts_nombre_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_query_timeouts_nombre_fecha ON public.query_timeouts_log USING btree (nombre_consulta, fecha_hora DESC);


--
-- TOC entry 4027 (class 1259 OID 77806)
-- Name: idx_settings_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_active ON public.settings USING btree (active);


--
-- TOC entry 4014 (class 1259 OID 77803)
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active ON public.users USING btree (active);


--
-- TOC entry 4015 (class 1259 OID 32205)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4016 (class 1259 OID 58515)
-- Name: idx_users_email_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_active ON public.users USING btree (email) WHERE (active = true);


--
-- TOC entry 4017 (class 1259 OID 52907)
-- Name: idx_users_email_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_normalized ON public.users USING btree (email_normalized);


--
-- TOC entry 4018 (class 1259 OID 52896)
-- Name: idx_users_full_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_full_name_normalized ON public.users USING btree (full_name_normalized);


--
-- TOC entry 4019 (class 1259 OID 77930)
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- TOC entry 4020 (class 1259 OID 58516)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role) WHERE (active = true);


--
-- TOC entry 4009 (class 1259 OID 77924)
-- Name: occasions_name_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX occasions_name_unique_idx ON public.occasions USING btree (upper((name)::text));


--
-- TOC entry 4060 (class 1259 OID 77923)
-- Name: products_sku_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_unique_idx ON public.products USING btree (upper((sku)::text)) WHERE (sku IS NOT NULL);


--
-- TOC entry 4030 (class 1259 OID 77926)
-- Name: settings_key_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_unique_idx ON public.settings USING btree (upper((key)::text));


--
-- TOC entry 4168 (class 2620 OID 59798)
-- Name: products actualizar_search_products; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER actualizar_search_products BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.actualizar_vector_busqueda_productos();


--
-- TOC entry 4171 (class 2620 OID 77769)
-- Name: payments trigger_sync_payment_method_name; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_sync_payment_method_name BEFORE INSERT OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.sync_payment_method_name();


--
-- TOC entry 4170 (class 2620 OID 77768)
-- Name: order_items trigger_validate_order_total; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_validate_order_total AFTER INSERT OR DELETE OR UPDATE ON public.order_items FOR EACH STATEMENT EXECUTE FUNCTION public.validate_order_total();


--
-- TOC entry 4169 (class 2620 OID 75911)
-- Name: products update_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4154 (class 2606 OID 77881)
-- Name: order_items fk_order_items_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4155 (class 2606 OID 77886)
-- Name: order_items fk_order_items_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 4158 (class 2606 OID 77916)
-- Name: order_status_history fk_order_status_history_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4152 (class 2606 OID 77876)
-- Name: orders fk_orders_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4161 (class 2606 OID 77891)
-- Name: payments fk_payments_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4162 (class 2606 OID 77896)
-- Name: payments fk_payments_payment_method; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_payment_method FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- TOC entry 4166 (class 2606 OID 77901)
-- Name: product_images fk_product_images_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4148 (class 2606 OID 77911)
-- Name: product_occasions fk_product_occasions_occasion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT fk_product_occasions_occasion FOREIGN KEY (occasion_id) REFERENCES public.occasions(id) ON DELETE CASCADE;


--
-- TOC entry 4149 (class 2606 OID 77906)
-- Name: product_occasions fk_product_occasions_product; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT fk_product_occasions_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4156 (class 2606 OID 32125)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4157 (class 2606 OID 32130)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 4159 (class 2606 OID 32150)
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4160 (class 2606 OID 32145)
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4153 (class 2606 OID 32106)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4163 (class 2606 OID 32181)
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4164 (class 2606 OID 32186)
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- TOC entry 4165 (class 2606 OID 32191)
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4167 (class 2606 OID 32540)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4150 (class 2606 OID 32087)
-- Name: product_occasions product_occasions_occasion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_occasion_id_fkey FOREIGN KEY (occasion_id) REFERENCES public.occasions(id) ON DELETE CASCADE;


--
-- TOC entry 4151 (class 2606 OID 32082)
-- Name: product_occasions product_occasions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4360 (class 3256 OID 76309)
-- Name: occasions Admins can create occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create occasions" ON public.occasions FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4366 (class 3256 OID 76315)
-- Name: payment_methods Admins can create payment methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create payment methods" ON public.payment_methods FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4370 (class 3256 OID 76319)
-- Name: product_images Admins can create product images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create product images" ON public.product_images FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4374 (class 3256 OID 76323)
-- Name: product_occasions Admins can create product occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create product occasions" ON public.product_occasions FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4378 (class 3256 OID 76327)
-- Name: products Admins can create products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create products" ON public.products FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4384 (class 3256 OID 76333)
-- Name: settings Admins can create settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can create settings" ON public.settings FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4362 (class 3256 OID 76311)
-- Name: occasions Admins can delete occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete occasions" ON public.occasions FOR DELETE USING (public.is_admin());


--
-- TOC entry 4368 (class 3256 OID 76317)
-- Name: payment_methods Admins can delete payment methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete payment methods" ON public.payment_methods FOR DELETE USING (public.is_admin());


--
-- TOC entry 4372 (class 3256 OID 76321)
-- Name: product_images Admins can delete product images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete product images" ON public.product_images FOR DELETE USING (public.is_admin());


--
-- TOC entry 4376 (class 3256 OID 76325)
-- Name: product_occasions Admins can delete product occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete product occasions" ON public.product_occasions FOR DELETE USING (public.is_admin());


--
-- TOC entry 4380 (class 3256 OID 76329)
-- Name: products Admins can delete products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());


--
-- TOC entry 4386 (class 3256 OID 76335)
-- Name: settings Admins can delete settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete settings" ON public.settings FOR DELETE USING (public.is_admin());


--
-- TOC entry 4390 (class 3256 OID 76339)
-- Name: users Admins can delete users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (public.is_admin());


--
-- TOC entry 4361 (class 3256 OID 76310)
-- Name: occasions Admins can update occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update occasions" ON public.occasions FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 4367 (class 3256 OID 76316)
-- Name: payment_methods Admins can update payment methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update payment methods" ON public.payment_methods FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 4371 (class 3256 OID 76320)
-- Name: product_images Admins can update product images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update product images" ON public.product_images FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 4375 (class 3256 OID 76324)
-- Name: product_occasions Admins can update product occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update product occasions" ON public.product_occasions FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 4379 (class 3256 OID 76328)
-- Name: products Admins can update products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 4385 (class 3256 OID 76334)
-- Name: settings Admins can update settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- TOC entry 4357 (class 3256 OID 76306)
-- Name: busquedas_log Admins can view search logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view search logs" ON public.busquedas_log FOR SELECT USING (public.is_admin());


--
-- TOC entry 4381 (class 3256 OID 76330)
-- Name: query_timeouts_log Admins can view timeout logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view timeout logs" ON public.query_timeouts_log FOR SELECT USING (public.is_admin());


--
-- TOC entry 4358 (class 3256 OID 76307)
-- Name: busquedas_log Allow search log insertion; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow search log insertion" ON public.busquedas_log FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- TOC entry 4351 (class 3256 OID 76197)
-- Name: busquedas_log Allow search log insertion from functions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow search log insertion from functions" ON public.busquedas_log FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- TOC entry 4364 (class 3256 OID 76313)
-- Name: order_status_history Allow status history insertion; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow status history insertion" ON public.order_status_history FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- TOC entry 4382 (class 3256 OID 76331)
-- Name: query_timeouts_log Allow timeout log insertion; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow timeout log insertion" ON public.query_timeouts_log FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- TOC entry 4352 (class 3256 OID 86934)
-- Name: expenses Authenticated users can create expenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);


--
-- TOC entry 4353 (class 3256 OID 86935)
-- Name: expenses Authenticated users can update expenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update expenses" ON public.expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- TOC entry 4350 (class 3256 OID 86933)
-- Name: expenses Authenticated users can view expenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view expenses" ON public.expenses FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4342 (class 3256 OID 86806)
-- Name: expenses Enable full access for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable full access for authenticated users" ON public.expenses TO authenticated USING (true) WITH CHECK (true);


--
-- TOC entry 4359 (class 3256 OID 76308)
-- Name: occasions Everyone can view active occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view active occasions" ON public.occasions FOR SELECT USING ((active = true));


--
-- TOC entry 4365 (class 3256 OID 76314)
-- Name: payment_methods Everyone can view active payment methods; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view active payment methods" ON public.payment_methods FOR SELECT USING ((active = true));


--
-- TOC entry 4377 (class 3256 OID 76326)
-- Name: products Everyone can view active products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view active products" ON public.products FOR SELECT USING ((active = true));


--
-- TOC entry 4369 (class 3256 OID 76318)
-- Name: product_images Everyone can view product images; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view product images" ON public.product_images FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.products p
  WHERE ((p.id = product_images.product_id) AND (p.active = true)))));


--
-- TOC entry 4373 (class 3256 OID 76322)
-- Name: product_occasions Everyone can view product occasions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view product occasions" ON public.product_occasions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.products p
  WHERE ((p.id = product_occasions.product_id) AND (p.active = true)))));


--
-- TOC entry 4383 (class 3256 OID 76332)
-- Name: settings Everyone can view public settings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view public settings" ON public.settings FOR SELECT USING (((is_public = true) OR public.is_admin()));


--
-- TOC entry 4355 (class 3256 OID 76222)
-- Name: settings Everyone can view public settings, admins can view all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view public settings, admins can view all" ON public.settings FOR SELECT USING (((is_public = true) OR public.is_admin()));


--
-- TOC entry 4388 (class 3256 OID 76337)
-- Name: users Users can create own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create own profile" ON public.users FOR INSERT WITH CHECK (((id)::text = (auth.uid())::text));


--
-- TOC entry 4389 (class 3256 OID 76338)
-- Name: users Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (((id)::text = (auth.uid())::text));


--
-- TOC entry 4354 (class 3256 OID 76202)
-- Name: order_status_history Users can view order status history of own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view order status history of own orders" ON public.order_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_status_history.order_id) AND ((o.user_id)::text = (auth.uid())::text)))));


--
-- TOC entry 4363 (class 3256 OID 76312)
-- Name: order_status_history Users can view own order history; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own order history" ON public.order_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_status_history.order_id) AND ((o.user_id)::text = (auth.uid())::text)))));


--
-- TOC entry 4387 (class 3256 OID 76336)
-- Name: users Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING ((((id)::text = (auth.uid())::text) OR public.is_admin()));


--
-- TOC entry 4356 (class 3256 OID 76226)
-- Name: users Users can view own profile, admins can view all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile, admins can view all" ON public.users FOR SELECT USING ((((id)::text = (auth.uid())::text) OR public.is_admin()));


--
-- TOC entry 4335 (class 0 OID 59805)
-- Dependencies: 401
-- Name: busquedas_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.busquedas_log ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4337 (class 0 OID 84803)
-- Dependencies: 410
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4341 (class 3256 OID 86784)
-- Name: expenses expenses_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_delete_policy ON public.expenses FOR DELETE TO authenticated USING (true);


--
-- TOC entry 4339 (class 3256 OID 86782)
-- Name: expenses expenses_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_insert_policy ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);


--
-- TOC entry 4338 (class 3256 OID 86781)
-- Name: expenses expenses_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_select_policy ON public.expenses FOR SELECT TO authenticated USING ((active = true));


--
-- TOC entry 4340 (class 3256 OID 86783)
-- Name: expenses expenses_update_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY expenses_update_policy ON public.expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- TOC entry 4324 (class 0 OID 31986)
-- Dependencies: 379
-- Name: occasions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4330 (class 0 OID 32112)
-- Dependencies: 391
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4347 (class 3256 OID 76127)
-- Name: order_items order_items_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_admin_all ON public.order_items USING (public.is_admin());


--
-- TOC entry 4346 (class 3256 OID 76126)
-- Name: order_items order_items_select_visible; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY order_items_select_visible ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND (public.compare_user_id(orders.user_id) OR public.is_admin())))));


--
-- TOC entry 4331 (class 0 OID 32136)
-- Dependencies: 393
-- Name: order_status_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4329 (class 0 OID 32093)
-- Dependencies: 389
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4345 (class 3256 OID 76125)
-- Name: orders orders_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_admin_all ON public.orders USING (public.is_admin());


--
-- TOC entry 4344 (class 3256 OID 76124)
-- Name: orders orders_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_insert_own ON public.orders FOR INSERT WITH CHECK ((public.compare_user_id(user_id) OR (auth.uid() IS NULL)));


--
-- TOC entry 4343 (class 3256 OID 76123)
-- Name: orders orders_select_own_or_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY orders_select_own_or_admin ON public.orders FOR SELECT USING ((public.compare_user_id(user_id) OR public.is_admin()));


--
-- TOC entry 4332 (class 0 OID 32156)
-- Dependencies: 395
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4333 (class 0 OID 32169)
-- Dependencies: 397
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4349 (class 3256 OID 76129)
-- Name: payments payments_admin_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_admin_all ON public.payments USING (public.is_admin());


--
-- TOC entry 4348 (class 3256 OID 76128)
-- Name: payments payments_select_visible; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY payments_select_visible ON public.payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = payments.order_id) AND (public.compare_user_id(orders.user_id) OR public.is_admin())))));


--
-- TOC entry 4334 (class 0 OID 32525)
-- Dependencies: 399
-- Name: product_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4328 (class 0 OID 32072)
-- Dependencies: 387
-- Name: product_occasions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4327 (class 0 OID 32033)
-- Dependencies: 385
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4336 (class 0 OID 59940)
-- Dependencies: 403
-- Name: query_timeouts_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.query_timeouts_log ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4326 (class 0 OID 32018)
-- Dependencies: 383
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4325 (class 0 OID 32002)
-- Dependencies: 381
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4426 (class 0 OID 0)
-- Dependencies: 107
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON SCHEMA public TO prisma;


--
-- TOC entry 4427 (class 0 OID 0)
-- Dependencies: 545
-- Name: FUNCTION acknowledge_alert(alert_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.acknowledge_alert(alert_id bigint) TO anon;
GRANT ALL ON FUNCTION public.acknowledge_alert(alert_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.acknowledge_alert(alert_id bigint) TO service_role;
GRANT ALL ON FUNCTION public.acknowledge_alert(alert_id bigint) TO prisma;


--
-- TOC entry 4428 (class 0 OID 0)
-- Dependencies: 610
-- Name: FUNCTION actualizar_vector_busqueda_productos(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.actualizar_vector_busqueda_productos() TO anon;
GRANT ALL ON FUNCTION public.actualizar_vector_busqueda_productos() TO authenticated;
GRANT ALL ON FUNCTION public.actualizar_vector_busqueda_productos() TO service_role;
GRANT ALL ON FUNCTION public.actualizar_vector_busqueda_productos() TO prisma;


--
-- TOC entry 4429 (class 0 OID 0)
-- Dependencies: 574
-- Name: FUNCTION analizar_consulta(consulta_sql text, parametros text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.analizar_consulta(consulta_sql text, parametros text[]) TO anon;
GRANT ALL ON FUNCTION public.analizar_consulta(consulta_sql text, parametros text[]) TO authenticated;
GRANT ALL ON FUNCTION public.analizar_consulta(consulta_sql text, parametros text[]) TO service_role;
GRANT ALL ON FUNCTION public.analizar_consulta(consulta_sql text, parametros text[]) TO prisma;


--
-- TOC entry 4430 (class 0 OID 0)
-- Dependencies: 658
-- Name: FUNCTION analizar_rendimiento_conexiones(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.analizar_rendimiento_conexiones() TO anon;
GRANT ALL ON FUNCTION public.analizar_rendimiento_conexiones() TO authenticated;
GRANT ALL ON FUNCTION public.analizar_rendimiento_conexiones() TO service_role;
GRANT ALL ON FUNCTION public.analizar_rendimiento_conexiones() TO prisma;


--
-- TOC entry 4431 (class 0 OID 0)
-- Dependencies: 429
-- Name: FUNCTION buscar_productos_ranking(termino_busqueda text, limite integer, offset_param integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.buscar_productos_ranking(termino_busqueda text, limite integer, offset_param integer) TO anon;
GRANT ALL ON FUNCTION public.buscar_productos_ranking(termino_busqueda text, limite integer, offset_param integer) TO authenticated;
GRANT ALL ON FUNCTION public.buscar_productos_ranking(termino_busqueda text, limite integer, offset_param integer) TO service_role;
GRANT ALL ON FUNCTION public.buscar_productos_ranking(termino_busqueda text, limite integer, offset_param integer) TO prisma;


--
-- TOC entry 4432 (class 0 OID 0)
-- Dependencies: 483
-- Name: FUNCTION compare_user_id(order_user_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.compare_user_id(order_user_id integer) TO anon;
GRANT ALL ON FUNCTION public.compare_user_id(order_user_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.compare_user_id(order_user_id integer) TO service_role;
GRANT ALL ON FUNCTION public.compare_user_id(order_user_id integer) TO prisma;


--
-- TOC entry 4433 (class 0 OID 0)
-- Dependencies: 421
-- Name: FUNCTION configuracion_conexiones(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.configuracion_conexiones() TO anon;
GRANT ALL ON FUNCTION public.configuracion_conexiones() TO authenticated;
GRANT ALL ON FUNCTION public.configuracion_conexiones() TO service_role;
GRANT ALL ON FUNCTION public.configuracion_conexiones() TO prisma;


--
-- TOC entry 4434 (class 0 OID 0)
-- Dependencies: 478
-- Name: FUNCTION configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text) TO anon;
GRANT ALL ON FUNCTION public.configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text) TO authenticated;
GRANT ALL ON FUNCTION public.configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text) TO service_role;
GRANT ALL ON FUNCTION public.configurar_timeout_consulta(patron_consulta text, timeout_ms integer, tipo_consulta text) TO prisma;


--
-- TOC entry 4435 (class 0 OID 0)
-- Dependencies: 625
-- Name: FUNCTION consultas_problematicas(porcentaje_minimo_timeout numeric, consultas_minimas integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.consultas_problematicas(porcentaje_minimo_timeout numeric, consultas_minimas integer) TO anon;
GRANT ALL ON FUNCTION public.consultas_problematicas(porcentaje_minimo_timeout numeric, consultas_minimas integer) TO authenticated;
GRANT ALL ON FUNCTION public.consultas_problematicas(porcentaje_minimo_timeout numeric, consultas_minimas integer) TO service_role;
GRANT ALL ON FUNCTION public.consultas_problematicas(porcentaje_minimo_timeout numeric, consultas_minimas integer) TO prisma;


--
-- TOC entry 4436 (class 0 OID 0)
-- Dependencies: 497
-- Name: FUNCTION create_order_with_items(order_data jsonb, order_items jsonb[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO anon;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO service_role;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO prisma;


--
-- TOC entry 4437 (class 0 OID 0)
-- Dependencies: 560
-- Name: FUNCTION create_order_with_items(p_order_data jsonb, p_order_items jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_order_with_items(p_order_data jsonb, p_order_items jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_order_with_items(p_order_data jsonb, p_order_items jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_order_with_items(p_order_data jsonb, p_order_items jsonb) TO service_role;
GRANT ALL ON FUNCTION public.create_order_with_items(p_order_data jsonb, p_order_items jsonb) TO prisma;


--
-- TOC entry 4438 (class 0 OID 0)
-- Dependencies: 621
-- Name: FUNCTION create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO anon;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO authenticated;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO service_role;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO prisma;


--
-- TOC entry 4439 (class 0 OID 0)
-- Dependencies: 473
-- Name: FUNCTION create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]) TO anon;
GRANT ALL ON FUNCTION public.create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]) TO service_role;
GRANT ALL ON FUNCTION public.create_product_with_occasions(p_product_data jsonb, p_occasion_ids integer[]) TO prisma;


--
-- TOC entry 4440 (class 0 OID 0)
-- Dependencies: 553
-- Name: FUNCTION delete_product_images_safe(product_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO anon;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO service_role;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO prisma;


--
-- TOC entry 4441 (class 0 OID 0)
-- Dependencies: 596
-- Name: FUNCTION ejecutar_con_timeout(consulta_sql text, timeout_ms integer, nombre_consulta text, tipo_consulta text, parametros jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.ejecutar_con_timeout(consulta_sql text, timeout_ms integer, nombre_consulta text, tipo_consulta text, parametros jsonb) TO anon;
GRANT ALL ON FUNCTION public.ejecutar_con_timeout(consulta_sql text, timeout_ms integer, nombre_consulta text, tipo_consulta text, parametros jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.ejecutar_con_timeout(consulta_sql text, timeout_ms integer, nombre_consulta text, tipo_consulta text, parametros jsonb) TO service_role;
GRANT ALL ON FUNCTION public.ejecutar_con_timeout(consulta_sql text, timeout_ms integer, nombre_consulta text, tipo_consulta text, parametros jsonb) TO prisma;


--
-- TOC entry 4442 (class 0 OID 0)
-- Dependencies: 595
-- Name: FUNCTION estadisticas_rendimiento(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.estadisticas_rendimiento() TO anon;
GRANT ALL ON FUNCTION public.estadisticas_rendimiento() TO authenticated;
GRANT ALL ON FUNCTION public.estadisticas_rendimiento() TO service_role;
GRANT ALL ON FUNCTION public.estadisticas_rendimiento() TO prisma;


--
-- TOC entry 4443 (class 0 OID 0)
-- Dependencies: 627
-- Name: FUNCTION estadisticas_timeouts(horas_atras integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.estadisticas_timeouts(horas_atras integer) TO anon;
GRANT ALL ON FUNCTION public.estadisticas_timeouts(horas_atras integer) TO authenticated;
GRANT ALL ON FUNCTION public.estadisticas_timeouts(horas_atras integer) TO service_role;
GRANT ALL ON FUNCTION public.estadisticas_timeouts(horas_atras integer) TO prisma;


--
-- TOC entry 4444 (class 0 OID 0)
-- Dependencies: 486
-- Name: FUNCTION generar_alertas_conexiones(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generar_alertas_conexiones() TO anon;
GRANT ALL ON FUNCTION public.generar_alertas_conexiones() TO authenticated;
GRANT ALL ON FUNCTION public.generar_alertas_conexiones() TO service_role;
GRANT ALL ON FUNCTION public.generar_alertas_conexiones() TO prisma;


--
-- TOC entry 4445 (class 0 OID 0)
-- Dependencies: 631
-- Name: FUNCTION get_backend_messages(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_backend_messages() TO anon;
GRANT ALL ON FUNCTION public.get_backend_messages() TO authenticated;
GRANT ALL ON FUNCTION public.get_backend_messages() TO service_role;
GRANT ALL ON FUNCTION public.get_backend_messages() TO prisma;


--
-- TOC entry 4446 (class 0 OID 0)
-- Dependencies: 546
-- Name: FUNCTION get_database_metrics(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_database_metrics() TO anon;
GRANT ALL ON FUNCTION public.get_database_metrics() TO authenticated;
GRANT ALL ON FUNCTION public.get_database_metrics() TO service_role;
GRANT ALL ON FUNCTION public.get_database_metrics() TO prisma;


--
-- TOC entry 4447 (class 0 OID 0)
-- Dependencies: 442
-- Name: FUNCTION get_existing_image_by_hash(hash_input character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO anon;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO authenticated;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO service_role;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO prisma;


--
-- TOC entry 4448 (class 0 OID 0)
-- Dependencies: 471
-- Name: FUNCTION get_expenses_filtered(p_category text, p_date_from date, p_date_to date, p_payment_method text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_expenses_filtered(p_category text, p_date_from date, p_date_to date, p_payment_method text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_expenses_filtered(p_category text, p_date_from date, p_date_to date, p_payment_method text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_expenses_filtered(p_category text, p_date_from date, p_date_to date, p_payment_method text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO service_role;
GRANT ALL ON FUNCTION public.get_expenses_filtered(p_category text, p_date_from date, p_date_to date, p_payment_method text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO prisma;


--
-- TOC entry 4449 (class 0 OID 0)
-- Dependencies: 529
-- Name: FUNCTION get_optimization_messages(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_optimization_messages() TO anon;
GRANT ALL ON FUNCTION public.get_optimization_messages() TO authenticated;
GRANT ALL ON FUNCTION public.get_optimization_messages() TO service_role;
GRANT ALL ON FUNCTION public.get_optimization_messages() TO prisma;


--
-- TOC entry 4450 (class 0 OID 0)
-- Dependencies: 460
-- Name: FUNCTION get_orders_filtered(p_status text, p_year integer, p_date_from date, p_date_to date, p_search text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_orders_filtered(p_status text, p_year integer, p_date_from date, p_date_to date, p_search text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_orders_filtered(p_status text, p_year integer, p_date_from date, p_date_to date, p_search text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_orders_filtered(p_status text, p_year integer, p_date_from date, p_date_to date, p_search text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO service_role;
GRANT ALL ON FUNCTION public.get_orders_filtered(p_status text, p_year integer, p_date_from date, p_date_to date, p_search text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer) TO prisma;


--
-- TOC entry 4451 (class 0 OID 0)
-- Dependencies: 517
-- Name: FUNCTION get_product_occasions(p_product_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO anon;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO service_role;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO prisma;


--
-- TOC entry 4452 (class 0 OID 0)
-- Dependencies: 646
-- Name: FUNCTION get_products_by_occasion(p_occasion_id integer, p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO service_role;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO prisma;


--
-- TOC entry 4454 (class 0 OID 0)
-- Dependencies: 521
-- Name: FUNCTION get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean) TO anon;
GRANT ALL ON FUNCTION public.get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean) TO service_role;
GRANT ALL ON FUNCTION public.get_products_filtered(p_occasion_id integer, p_search text, p_price_min numeric, p_price_max numeric, p_featured boolean, p_sku text, p_sort_by text, p_sort_order text, p_limit integer, p_offset integer, p_include_inactive boolean) TO prisma;


--
-- TOC entry 4455 (class 0 OID 0)
-- Dependencies: 571
-- Name: FUNCTION get_products_with_occasions(p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO service_role;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO prisma;


--
-- TOC entry 4456 (class 0 OID 0)
-- Dependencies: 650
-- Name: FUNCTION get_redis_metrics(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_redis_metrics() TO anon;
GRANT ALL ON FUNCTION public.get_redis_metrics() TO authenticated;
GRANT ALL ON FUNCTION public.get_redis_metrics() TO service_role;
GRANT ALL ON FUNCTION public.get_redis_metrics() TO prisma;


--
-- TOC entry 4457 (class 0 OID 0)
-- Dependencies: 468
-- Name: FUNCTION get_system_alerts(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_system_alerts() TO anon;
GRANT ALL ON FUNCTION public.get_system_alerts() TO authenticated;
GRANT ALL ON FUNCTION public.get_system_alerts() TO service_role;
GRANT ALL ON FUNCTION public.get_system_alerts() TO prisma;


--
-- TOC entry 4458 (class 0 OID 0)
-- Dependencies: 434
-- Name: FUNCTION get_system_health_overview(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_system_health_overview() TO anon;
GRANT ALL ON FUNCTION public.get_system_health_overview() TO authenticated;
GRANT ALL ON FUNCTION public.get_system_health_overview() TO service_role;
GRANT ALL ON FUNCTION public.get_system_health_overview() TO prisma;


--
-- TOC entry 4459 (class 0 OID 0)
-- Dependencies: 415
-- Name: FUNCTION get_timeout_statistics(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_timeout_statistics() TO anon;
GRANT ALL ON FUNCTION public.get_timeout_statistics() TO authenticated;
GRANT ALL ON FUNCTION public.get_timeout_statistics() TO service_role;
GRANT ALL ON FUNCTION public.get_timeout_statistics() TO prisma;


--
-- TOC entry 4460 (class 0 OID 0)
-- Dependencies: 547
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;
GRANT ALL ON FUNCTION public.is_admin() TO prisma;


--
-- TOC entry 4461 (class 0 OID 0)
-- Dependencies: 598
-- Name: FUNCTION limpiar_conexiones_inactivas(horas_inactividad integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.limpiar_conexiones_inactivas(horas_inactividad integer) TO anon;
GRANT ALL ON FUNCTION public.limpiar_conexiones_inactivas(horas_inactividad integer) TO authenticated;
GRANT ALL ON FUNCTION public.limpiar_conexiones_inactivas(horas_inactividad integer) TO service_role;
GRANT ALL ON FUNCTION public.limpiar_conexiones_inactivas(horas_inactividad integer) TO prisma;


--
-- TOC entry 4462 (class 0 OID 0)
-- Dependencies: 603
-- Name: FUNCTION limpiar_logs_timeouts(dias_a_conservar integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.limpiar_logs_timeouts(dias_a_conservar integer) TO anon;
GRANT ALL ON FUNCTION public.limpiar_logs_timeouts(dias_a_conservar integer) TO authenticated;
GRANT ALL ON FUNCTION public.limpiar_logs_timeouts(dias_a_conservar integer) TO service_role;
GRANT ALL ON FUNCTION public.limpiar_logs_timeouts(dias_a_conservar integer) TO prisma;


--
-- TOC entry 4463 (class 0 OID 0)
-- Dependencies: 454
-- Name: FUNCTION productos_similares(producto_id integer, limite integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.productos_similares(producto_id integer, limite integer) TO anon;
GRANT ALL ON FUNCTION public.productos_similares(producto_id integer, limite integer) TO authenticated;
GRANT ALL ON FUNCTION public.productos_similares(producto_id integer, limite integer) TO service_role;
GRANT ALL ON FUNCTION public.productos_similares(producto_id integer, limite integer) TO prisma;


--
-- TOC entry 4464 (class 0 OID 0)
-- Dependencies: 643
-- Name: FUNCTION registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text, user_agent text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text, user_agent text) TO anon;
GRANT ALL ON FUNCTION public.registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text, user_agent text) TO authenticated;
GRANT ALL ON FUNCTION public.registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text, user_agent text) TO service_role;
GRANT ALL ON FUNCTION public.registrar_busqueda(termino_busqueda text, resultados integer, tiempo_ejecucion numeric, ip_cliente text, user_agent text) TO prisma;


--
-- TOC entry 4465 (class 0 OID 0)
-- Dependencies: 588
-- Name: FUNCTION reset_sequence(sequence_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO anon;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO authenticated;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO service_role;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO prisma;


--
-- TOC entry 4466 (class 0 OID 0)
-- Dependencies: 618
-- Name: FUNCTION reset_sequence(sequence_name character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reset_sequence(sequence_name character varying) TO anon;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name character varying) TO authenticated;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name character varying) TO service_role;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name character varying) TO prisma;


--
-- TOC entry 4467 (class 0 OID 0)
-- Dependencies: 498
-- Name: FUNCTION resolve_alert(alert_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.resolve_alert(alert_id bigint) TO anon;
GRANT ALL ON FUNCTION public.resolve_alert(alert_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.resolve_alert(alert_id bigint) TO service_role;
GRANT ALL ON FUNCTION public.resolve_alert(alert_id bigint) TO prisma;


--
-- TOC entry 4468 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION round(numeric, integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.round(numeric, integer) TO anon;
GRANT ALL ON FUNCTION public.round(numeric, integer) TO authenticated;
GRANT ALL ON FUNCTION public.round(numeric, integer) TO service_role;
GRANT ALL ON FUNCTION public.round(numeric, integer) TO prisma;


--
-- TOC entry 4469 (class 0 OID 0)
-- Dependencies: 519
-- Name: FUNCTION sugerencias_busqueda(termino_parcial text, limite integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sugerencias_busqueda(termino_parcial text, limite integer) TO anon;
GRANT ALL ON FUNCTION public.sugerencias_busqueda(termino_parcial text, limite integer) TO authenticated;
GRANT ALL ON FUNCTION public.sugerencias_busqueda(termino_parcial text, limite integer) TO service_role;
GRANT ALL ON FUNCTION public.sugerencias_busqueda(termino_parcial text, limite integer) TO prisma;


--
-- TOC entry 4470 (class 0 OID 0)
-- Dependencies: 611
-- Name: FUNCTION sugerir_optimizaciones(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sugerir_optimizaciones() TO anon;
GRANT ALL ON FUNCTION public.sugerir_optimizaciones() TO authenticated;
GRANT ALL ON FUNCTION public.sugerir_optimizaciones() TO service_role;
GRANT ALL ON FUNCTION public.sugerir_optimizaciones() TO prisma;


--
-- TOC entry 4471 (class 0 OID 0)
-- Dependencies: 430
-- Name: FUNCTION sync_payment_method_name(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_payment_method_name() TO anon;
GRANT ALL ON FUNCTION public.sync_payment_method_name() TO authenticated;
GRANT ALL ON FUNCTION public.sync_payment_method_name() TO service_role;
GRANT ALL ON FUNCTION public.sync_payment_method_name() TO prisma;


--
-- TOC entry 4472 (class 0 OID 0)
-- Dependencies: 543
-- Name: FUNCTION update_carousel_order_atomic(p_product_id integer, p_order integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_carousel_order_atomic(p_product_id integer, p_order integer) TO anon;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(p_product_id integer, p_order integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(p_product_id integer, p_order integer) TO service_role;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(p_product_id integer, p_order integer) TO prisma;


--
-- TOC entry 4473 (class 0 OID 0)
-- Dependencies: 656
-- Name: FUNCTION update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer) TO anon;
GRANT ALL ON FUNCTION public.update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer) TO service_role;
GRANT ALL ON FUNCTION public.update_order_status_with_history(p_order_id integer, p_new_status character varying, p_notes text, p_changed_by integer) TO prisma;


--
-- TOC entry 4474 (class 0 OID 0)
-- Dependencies: 530
-- Name: FUNCTION update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO anon;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO service_role;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO prisma;


--
-- TOC entry 4475 (class 0 OID 0)
-- Dependencies: 576
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO prisma;


--
-- TOC entry 4476 (class 0 OID 0)
-- Dependencies: 495
-- Name: FUNCTION validate_order_total(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_order_total() TO anon;
GRANT ALL ON FUNCTION public.validate_order_total() TO authenticated;
GRANT ALL ON FUNCTION public.validate_order_total() TO service_role;
GRANT ALL ON FUNCTION public.validate_order_total() TO prisma;


--
-- TOC entry 4477 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE busquedas_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.busquedas_log TO anon;
GRANT ALL ON TABLE public.busquedas_log TO authenticated;
GRANT ALL ON TABLE public.busquedas_log TO service_role;
GRANT ALL ON TABLE public.busquedas_log TO prisma;


--
-- TOC entry 4479 (class 0 OID 0)
-- Dependencies: 400
-- Name: SEQUENCE busquedas_log_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.busquedas_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.busquedas_log_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.busquedas_log_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.busquedas_log_id_seq TO prisma;


--
-- TOC entry 4480 (class 0 OID 0)
-- Dependencies: 410
-- Name: TABLE expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.expenses TO anon;
GRANT ALL ON TABLE public.expenses TO authenticated;
GRANT ALL ON TABLE public.expenses TO service_role;
GRANT ALL ON TABLE public.expenses TO prisma;


--
-- TOC entry 4481 (class 0 OID 0)
-- Dependencies: 412
-- Name: TABLE daily_expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.daily_expenses TO anon;
GRANT ALL ON TABLE public.daily_expenses TO authenticated;
GRANT ALL ON TABLE public.daily_expenses TO service_role;
GRANT ALL ON TABLE public.daily_expenses TO prisma;


--
-- TOC entry 4482 (class 0 OID 0)
-- Dependencies: 389
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.orders TO prisma;


--
-- TOC entry 4483 (class 0 OID 0)
-- Dependencies: 411
-- Name: TABLE daily_sales; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.daily_sales TO anon;
GRANT ALL ON TABLE public.daily_sales TO authenticated;
GRANT ALL ON TABLE public.daily_sales TO service_role;
GRANT ALL ON TABLE public.daily_sales TO prisma;


--
-- TOC entry 4484 (class 0 OID 0)
-- Dependencies: 414
-- Name: TABLE daily_profit_loss; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.daily_profit_loss TO anon;
GRANT ALL ON TABLE public.daily_profit_loss TO authenticated;
GRANT ALL ON TABLE public.daily_profit_loss TO service_role;
GRANT ALL ON TABLE public.daily_profit_loss TO prisma;


--
-- TOC entry 4486 (class 0 OID 0)
-- Dependencies: 409
-- Name: SEQUENCE expenses_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.expenses_id_seq TO anon;
GRANT ALL ON SEQUENCE public.expenses_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.expenses_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.expenses_id_seq TO prisma;


--
-- TOC entry 4487 (class 0 OID 0)
-- Dependencies: 379
-- Name: TABLE occasions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.occasions TO anon;
GRANT ALL ON TABLE public.occasions TO authenticated;
GRANT ALL ON TABLE public.occasions TO service_role;
GRANT ALL ON TABLE public.occasions TO prisma;


--
-- TOC entry 4489 (class 0 OID 0)
-- Dependencies: 378
-- Name: SEQUENCE occasions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.occasions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO prisma;


--
-- TOC entry 4490 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.order_items TO prisma;


--
-- TOC entry 4492 (class 0 OID 0)
-- Dependencies: 390
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO prisma;


--
-- TOC entry 4493 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE order_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_history TO anon;
GRANT ALL ON TABLE public.order_status_history TO authenticated;
GRANT ALL ON TABLE public.order_status_history TO service_role;
GRANT ALL ON TABLE public.order_status_history TO prisma;


--
-- TOC entry 4495 (class 0 OID 0)
-- Dependencies: 392
-- Name: SEQUENCE order_status_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO prisma;


--
-- TOC entry 4497 (class 0 OID 0)
-- Dependencies: 388
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.orders_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.orders_id_seq TO prisma;


--
-- TOC entry 4498 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_methods TO anon;
GRANT ALL ON TABLE public.payment_methods TO authenticated;
GRANT ALL ON TABLE public.payment_methods TO service_role;
GRANT ALL ON TABLE public.payment_methods TO prisma;


--
-- TOC entry 4500 (class 0 OID 0)
-- Dependencies: 394
-- Name: SEQUENCE payment_methods_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO prisma;


--
-- TOC entry 4501 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;
GRANT ALL ON TABLE public.payments TO prisma;


--
-- TOC entry 4503 (class 0 OID 0)
-- Dependencies: 396
-- Name: SEQUENCE payments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.payments_id_seq TO prisma;


--
-- TOC entry 4504 (class 0 OID 0)
-- Dependencies: 399
-- Name: TABLE product_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;
GRANT ALL ON TABLE public.product_images TO prisma;


--
-- TOC entry 4506 (class 0 OID 0)
-- Dependencies: 398
-- Name: SEQUENCE product_images_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO prisma;


--
-- TOC entry 4508 (class 0 OID 0)
-- Dependencies: 387
-- Name: TABLE product_occasions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_occasions TO anon;
GRANT ALL ON TABLE public.product_occasions TO authenticated;
GRANT ALL ON TABLE public.product_occasions TO service_role;
GRANT ALL ON TABLE public.product_occasions TO prisma;


--
-- TOC entry 4510 (class 0 OID 0)
-- Dependencies: 386
-- Name: SEQUENCE product_occasions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO prisma;


--
-- TOC entry 4513 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.products TO prisma;


--
-- TOC entry 4515 (class 0 OID 0)
-- Dependencies: 384
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.products_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.products_id_seq TO prisma;


--
-- TOC entry 4516 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE query_timeouts_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.query_timeouts_log TO anon;
GRANT ALL ON TABLE public.query_timeouts_log TO authenticated;
GRANT ALL ON TABLE public.query_timeouts_log TO service_role;
GRANT ALL ON TABLE public.query_timeouts_log TO prisma;


--
-- TOC entry 4518 (class 0 OID 0)
-- Dependencies: 402
-- Name: SEQUENCE query_timeouts_log_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.query_timeouts_log_id_seq TO anon;
GRANT ALL ON SEQUENCE public.query_timeouts_log_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.query_timeouts_log_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.query_timeouts_log_id_seq TO prisma;


--
-- TOC entry 4519 (class 0 OID 0)
-- Dependencies: 383
-- Name: TABLE settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settings TO anon;
GRANT ALL ON TABLE public.settings TO authenticated;
GRANT ALL ON TABLE public.settings TO service_role;
GRANT ALL ON TABLE public.settings TO prisma;


--
-- TOC entry 4521 (class 0 OID 0)
-- Dependencies: 382
-- Name: SEQUENCE settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.settings_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.settings_id_seq TO prisma;


--
-- TOC entry 4522 (class 0 OID 0)
-- Dependencies: 413
-- Name: TABLE test_daily_expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.test_daily_expenses TO anon;
GRANT ALL ON TABLE public.test_daily_expenses TO authenticated;
GRANT ALL ON TABLE public.test_daily_expenses TO service_role;
GRANT ALL ON TABLE public.test_daily_expenses TO prisma;


--
-- TOC entry 4523 (class 0 OID 0)
-- Dependencies: 381
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO prisma;


--
-- TOC entry 4525 (class 0 OID 0)
-- Dependencies: 380
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.users_id_seq TO prisma;


--
-- TOC entry 2698 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;


--
-- TOC entry 2675 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2697 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;


--
-- TOC entry 2677 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2696 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;


--
-- TOC entry 2676 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- Completed on 2025-11-22 20:16:47 -03

--
-- PostgreSQL database dump complete
--

\unrestrict eBkse3eg3aumsA54PslbfN3K0LEfS5M6PvPofSp4YwwXrgRfGAm0L5nxaoKFTaJ

