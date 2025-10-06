--
-- PostgreSQL database dump
--

\restrict VFADMZ0IDEqqiUZ8rtpUmpCvA5aGMkGCpjqgy7wMcdkjvfa72W9RA036BgwwfnH

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-2.pgdg24.04+1)

-- Started on 2025-10-03 13:42:39 -03

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
-- TOC entry 52 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 52
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1255 (class 1247 OID 32337)
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
-- TOC entry 1216 (class 1247 OID 31954)
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
-- TOC entry 1197 (class 1247 OID 28694)
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
-- TOC entry 1219 (class 1247 OID 31968)
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
-- TOC entry 1222 (class 1247 OID 31980)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 460 (class 1255 OID 34864)
-- Name: create_order_with_items(jsonb, jsonb[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    new_order_id INTEGER;
    item_record JSONB;
    result_order JSONB;
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

    -- Insert order items
    FOREACH item_record IN ARRAY order_items LOOP
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
            (item_record->>'product_id')::INTEGER,
            item_record->>'product_name',
            item_record->>'product_summary',
            (item_record->>'unit_price_usd')::NUMERIC,
            (item_record->>'unit_price_ves')::NUMERIC,
            (item_record->>'quantity')::INTEGER,
            (item_record->>'subtotal_usd')::NUMERIC,
            (item_record->>'subtotal_ves')::NUMERIC
        );
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
        'Order created'
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
        -- Transaction will be rolled back automatically
        RAISE EXCEPTION 'Failed to create order: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) OWNER TO postgres;

--
-- TOC entry 483 (class 1255 OID 34868)
-- Name: create_product_images_atomic(integer, integer, jsonb[], boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean DEFAULT false) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
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
-- TOC entry 506 (class 1255 OID 34867)
-- Name: create_product_with_occasions(jsonb, integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) RETURNS jsonb[]
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    new_product_id INTEGER;
    occasion_id INTEGER;
    result_product JSONB;
BEGIN
    -- Insert product
    INSERT INTO public.products (
        name,
        summary,
        description,
        price_usd,
        price_ves,
        stock,
        sku,
        active,
        featured,
        carousel_order
    ) VALUES (
        product_data->>'name',
        product_data->>'summary',
        product_data->>'description',
        (product_data->>'price_usd')::NUMERIC,
        (product_data->>'price_ves')::NUMERIC,
        (product_data->>'stock')::INTEGER,
        product_data->>'sku',
        COALESCE((product_data->>'active')::BOOLEAN, true),
        COALESCE((product_data->>'featured')::BOOLEAN, false),
        (product_data->>'carousel_order')::INTEGER
    ) RETURNING id INTO new_product_id;

    -- Insert occasion associations if provided
    IF occasion_ids IS NOT NULL AND array_length(occasion_ids, 1) > 0 THEN
        FOREACH occasion_id IN ARRAY occasion_ids LOOP
            INSERT INTO public.product_occasions (
                product_id,
                occasion_id
            ) VALUES (
                new_product_id,
                occasion_id
            );
        END LOOP;
    END IF;

    -- Return created product
    SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'summary', p.summary,
        'description', p.description,
        'price_usd', p.price_usd,
        'price_ves', p.price_ves,
        'stock', p.stock,
        'sku', p.sku,
        'active', p.active,
        'featured', p.featured,
        'carousel_order', p.carousel_order,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO result_product
    FROM public.products p
    WHERE p.id = new_product_id;

    RETURN ARRAY[result_product];

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create product with occasions: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) OWNER TO postgres;

--
-- TOC entry 446 (class 1255 OID 34869)
-- Name: delete_product_images_safe(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_product_images_safe(product_id integer) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
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
-- TOC entry 390 (class 1255 OID 22541)
-- Name: get_existing_image_by_hash(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_existing_image_by_hash(hash_input character varying) RETURNS TABLE(id bigint, file_hash character varying, url_large text, url_medium text, url_small text, url_thumb text, original_filename text)
    LANGUAGE plpgsql
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
-- TOC entry 376 (class 1255 OID 19036)
-- Name: get_product_occasions(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_product_occasions(p_product_id integer) RETURNS TABLE(id integer, name character varying, description text, icon character varying, color character varying)
    LANGUAGE sql STABLE
    AS $$
    SELECT o.id, o.name, o.description, o.icon, o.color
    FROM occasions o
    JOIN product_occasions po ON o.id = po.occasion_id
    WHERE po.product_id = p_product_id AND o.active = true
    ORDER BY o.sort_order, o.name;
$$;


ALTER FUNCTION public.get_product_occasions(p_product_id integer) OWNER TO postgres;

--
-- TOC entry 422 (class 1255 OID 19037)
-- Name: get_products_by_occasion(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer DEFAULT 50) RETURNS TABLE(id integer, name character varying, description text, price numeric, image_url character varying, primary_image character varying)
    LANGUAGE sql STABLE
    AS $$
    SELECT p.id, p.name, p.description, p.price, p.image_url, p.primary_image
    FROM products p
    JOIN product_occasions po ON p.id = po.product_id
    WHERE po.occasion_id = p_occasion_id 
    AND p.active = true
    ORDER BY p.featured DESC, p.created_at DESC
    LIMIT p_limit;
$$;


ALTER FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) OWNER TO postgres;

--
-- TOC entry 456 (class 1255 OID 19043)
-- Name: get_products_with_occasions(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_products_with_occasions(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0) RETURNS TABLE(id integer, name character varying, description text, price numeric, image_url character varying, primary_image character varying, category_name character varying, occasions jsonb[])
    LANGUAGE sql STABLE
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
-- TOC entry 469 (class 1255 OID 51636)
-- Name: reset_sequence(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reset_sequence(sequence_name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
  BEGIN
    EXECUTE format('ALTER SEQUENCE %I RESTART WITH 1', sequence_name);
  END;
  $$;


ALTER FUNCTION public.reset_sequence(sequence_name text) OWNER TO postgres;

--
-- TOC entry 383 (class 1255 OID 34866)
-- Name: update_carousel_order_atomic(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    current_order INTEGER;
    affected_products INTEGER[];
    result_product JSONB;
BEGIN
    -- Get current carousel order
    SELECT carousel_order INTO current_order
    FROM public.products
    WHERE id = product_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found', product_id;
    END IF;

    -- If setting to null, just update this product
    IF new_order IS NULL THEN
        UPDATE public.products
        SET carousel_order = NULL,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = product_id;

        SELECT jsonb_build_object(
            'id', p.id,
            'carousel_order', p.carousel_order,
            'updated_at', p.updated_at
        ) INTO result_product
        FROM public.products p
        WHERE p.id = product_id;

        RETURN result_product;
    END IF;

    -- Handle carousel order reassignment
    -- Get all products that need to be shifted
    SELECT array_agg(id)
    INTO affected_products
    FROM public.products
    WHERE carousel_order >= new_order
      AND carousel_order IS NOT NULL
      AND id != product_id
    ORDER BY carousel_order;

    -- Shift existing products
    IF array_length(affected_products, 1) > 0 THEN
        UPDATE public.products
        SET carousel_order = carousel_order + 1,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = ANY(affected_products)
          AND carousel_order <= 6; -- Prevent overflow beyond 7 positions

        -- Remove products that would exceed max positions
        UPDATE public.products
        SET carousel_order = NULL,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = ANY(affected_products)
          AND carousel_order > 7;
    END IF;

    -- Update target product
    UPDATE public.products
    SET carousel_order = new_order,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = product_id;

    -- Return updated product
    SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'carousel_order', p.carousel_order,
        'updated_at', p.updated_at
    ) INTO result_product
    FROM public.products p
    WHERE p.id = product_id;

    RETURN result_product;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to update carousel order: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) OWNER TO postgres;

--
-- TOC entry 434 (class 1255 OID 34865)
-- Name: update_order_status_with_history(integer, public.order_status, text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text DEFAULT NULL::text, changed_by integer DEFAULT NULL::integer) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
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
-- TOC entry 461 (class 1255 OID 28932)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 350 (class 1259 OID 31986)
-- Name: occasions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.occasions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    slug character varying NOT NULL
);


ALTER TABLE public.occasions OWNER TO postgres;

--
-- TOC entry 349 (class 1259 OID 31985)
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
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 349
-- Name: occasions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.occasions_id_seq OWNED BY public.occasions.id;


--
-- TOC entry 362 (class 1259 OID 32112)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer,
    product_name character varying(255) NOT NULL,
    product_summary text,
    unit_price_usd numeric(10,2) NOT NULL,
    unit_price_ves numeric(10,2),
    quantity integer NOT NULL,
    subtotal_usd numeric(10,2) NOT NULL,
    subtotal_ves numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_subtotal_usd_check CHECK ((subtotal_usd >= (0)::numeric)),
    CONSTRAINT order_items_unit_price_usd_check CHECK ((unit_price_usd >= (0)::numeric))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 361 (class 1259 OID 32111)
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
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 361
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 364 (class 1259 OID 32136)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    old_status public.order_status,
    new_status public.order_status NOT NULL,
    notes text,
    changed_by integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- TOC entry 363 (class 1259 OID 32135)
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
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 363
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- TOC entry 360 (class 1259 OID 32093)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    customer_email character varying(255) NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_phone character varying(20),
    delivery_address text NOT NULL,
    delivery_city character varying(100),
    delivery_state character varying(100),
    delivery_zip character varying(20),
    delivery_date date,
    delivery_time_slot character varying(100),
    delivery_notes text,
    status public.order_status DEFAULT 'pending'::public.order_status,
    total_amount_usd numeric(10,2) NOT NULL,
    total_amount_ves numeric(10,2),
    currency_rate numeric(10,6),
    notes text,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    customer_name_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate((customer_name)::text, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    customer_email_normalized text GENERATED ALWAYS AS (lower((customer_email)::text)) STORED,
    CONSTRAINT check_customer_info CHECK ((((user_id IS NOT NULL) AND (customer_email IS NOT NULL) AND (customer_name IS NOT NULL)) OR ((user_id IS NULL) AND (customer_email IS NOT NULL) AND (customer_name IS NOT NULL)))),
    CONSTRAINT orders_total_amount_usd_check CHECK ((total_amount_usd >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 359 (class 1259 OID 32092)
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
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 359
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 366 (class 1259 OID 32156)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_methods (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type public.payment_method_type NOT NULL,
    description text,
    account_info jsonb,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payment_methods OWNER TO postgres;

--
-- TOC entry 365 (class 1259 OID 32155)
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
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 365
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- TOC entry 368 (class 1259 OID 32169)
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
    CONSTRAINT payments_amount_usd_check CHECK ((amount_usd >= (0)::numeric))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 367 (class 1259 OID 32168)
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
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 367
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 370 (class 1259 OID 32525)
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
    CONSTRAINT product_images_image_index_check CHECK ((image_index > 0))
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 369 (class 1259 OID 32524)
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
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 369
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- TOC entry 358 (class 1259 OID 32072)
-- Name: product_occasions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_occasions (
    id integer NOT NULL,
    product_id integer NOT NULL,
    occasion_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.product_occasions OWNER TO postgres;

--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE product_occasions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.product_occasions IS 'Relación muchos-a-muchos entre productos y ocasiones. Evita duplicados gracias al UNIQUE.';


--
-- TOC entry 357 (class 1259 OID 32071)
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
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 357
-- Name: product_occasions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_occasions_id_seq OWNED BY public.product_occasions.id;


--
-- TOC entry 356 (class 1259 OID 32033)
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
    featured boolean DEFAULT false,
    carousel_order integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate((name)::text, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    description_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate(description, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    CONSTRAINT products_carousel_order_check CHECK ((carousel_order >= 0)),
    CONSTRAINT products_price_usd_check CHECK ((price_usd >= (0)::numeric)),
    CONSTRAINT products_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products IS 'Productos vendidos en la tienda. Cada producto puede tener múltiples imágenes y ocasiones.';


--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 356
-- Name: COLUMN products.carousel_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.products.carousel_order IS 'Orden en que aparece en el carousel. NULL = no aparece. Valores >= 0.';


--
-- TOC entry 355 (class 1259 OID 32032)
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
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 355
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 354 (class 1259 OID 32018)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    description text,
    type character varying(20) DEFAULT 'string'::character varying,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 353 (class 1259 OID 32017)
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
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 353
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 352 (class 1259 OID 32002)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text,
    full_name character varying(255),
    phone character varying(20),
    role public.user_role DEFAULT 'user'::public.user_role,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    full_name_normalized text GENERATED ALWAYS AS (lower(regexp_replace(translate((full_name)::text, 'áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑçÇ'::text, 'aeiouAEIOUaeiouAEIOUaeiouAEIOUaeiouAEIOUnNcC'::text), '[^a-z0-9 ]'::text, ''::text, 'gi'::text))) STORED,
    email_normalized text GENERATED ALWAYS AS (lower((email)::text)) STORED
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 351 (class 1259 OID 32001)
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
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 351
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3649 (class 2604 OID 31989)
-- Name: occasions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions ALTER COLUMN id SET DEFAULT nextval('public.occasions_id_seq'::regclass);


--
-- TOC entry 3684 (class 2604 OID 32115)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3687 (class 2604 OID 32139)
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- TOC entry 3678 (class 2604 OID 32096)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3689 (class 2604 OID 32159)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3694 (class 2604 OID 32172)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3698 (class 2604 OID 32528)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 3675 (class 2604 OID 32075)
-- Name: product_occasions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions ALTER COLUMN id SET DEFAULT nextval('public.product_occasions_id_seq'::regclass);


--
-- TOC entry 3667 (class 2604 OID 32036)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3662 (class 2604 OID 32021)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 3654 (class 2604 OID 32005)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3942 (class 0 OID 31986)
-- Dependencies: 350
-- Data for Name: occasions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.occasions VALUES (16, 'Cumpleaños', 'Celebra un cumpleaños especial', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'cumpleanos');
INSERT INTO public.occasions VALUES (17, 'Aniversario', 'Conmemora un aniversario importante', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'aniversario');
INSERT INTO public.occasions VALUES (18, 'San Valentín', 'Expresa tu amor en el día de los enamorados', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'san-valentin');
INSERT INTO public.occasions VALUES (19, 'Día de la Madre', 'Honra a mamá en su día especial', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'dia-de-la-madre');
INSERT INTO public.occasions VALUES (20, 'Graduación', 'Felicita por un logro académico', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'graduacion');
INSERT INTO public.occasions VALUES (21, 'Condolencias', 'Expresa solidaridad en momentos difíciles', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'condolencias');
INSERT INTO public.occasions VALUES (22, 'Nueva Casa', 'Celebra un nuevo hogar', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'nueva-casa');
INSERT INTO public.occasions VALUES (23, 'Boda', 'Celebra la unión matrimonial', true, 0, '2025-09-25 05:04:48.026907+00', '2025-09-25 05:04:48.026907+00', 'boda');


--
-- TOC entry 3954 (class 0 OID 32112)
-- Dependencies: 362
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_items VALUES (1, 1, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (2, 1, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (3, 1, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (4, 2, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 1, 29.99, 1093.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (5, 2, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (6, 3, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (7, 4, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 1, 55.99, 2040.84, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (8, 4, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 1, 29.99, 1093.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (9, 4, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 1, 38.99, 1421.19, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (10, 5, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (11, 6, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 3, 140.97, 5138.36, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (12, 6, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 3, 167.97, 6122.51, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (13, 7, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (14, 8, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (15, 9, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 2, 59.98, 2186.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (16, 9, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (17, 10, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 3, 89.97, 3279.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (18, 10, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (19, 11, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 3, 158.97, 5794.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (20, 11, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 2, 91.98, 3352.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (21, 11, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 3, 140.97, 5138.36, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (22, 12, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 2, 59.98, 2186.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (23, 13, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 2, 99.98, 3644.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (24, 14, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (25, 14, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (26, 14, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (27, 15, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (28, 15, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (29, 15, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 3, 89.97, 3279.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (30, 16, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 2, 137.98, 5029.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (31, 17, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 1, 29.99, 1093.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (32, 18, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (33, 18, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (34, 18, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 1, 45.99, 1676.34, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (35, 19, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 1, 29.99, 1093.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (36, 19, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 3, 218.97, 7981.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (37, 19, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 3, 137.97, 5029.01, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (38, 20, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 2, 99.98, 3644.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (39, 21, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (40, 21, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (41, 22, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (42, 23, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 3, 140.97, 5138.36, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (43, 23, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (44, 23, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 3, 218.97, 7981.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (45, 24, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (46, 25, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 1, 46.99, 1712.79, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (47, 25, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (48, 25, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 2, 137.98, 5029.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (49, 26, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 1, 52.99, 1931.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (50, 26, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (51, 26, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 2, 65.98, 2404.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (52, 27, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 2, 91.98, 3352.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (53, 27, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 1, 42.99, 1566.99, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (54, 27, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 2, 85.98, 3133.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (55, 28, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 3, 158.97, 5794.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (56, 29, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 2, 99.98, 3644.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (57, 30, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 1, 42.99, 1566.99, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (58, 31, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (59, 31, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 2, 65.98, 2404.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (60, 32, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 2, 65.98, 2404.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (61, 33, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (62, 33, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 3, 89.97, 3279.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (63, 34, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 1, 46.99, 1712.79, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (64, 34, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (65, 34, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (66, 35, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (67, 35, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 3, 119.97, 4372.91, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (68, 35, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (69, 36, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (70, 36, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (71, 36, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 1, 55.99, 2040.84, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (72, 37, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (73, 38, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 2, 91.98, 3352.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (74, 38, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (75, 38, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 3, 119.97, 4372.91, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (76, 39, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 2, 91.98, 3352.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (77, 39, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 1, 55.99, 2040.84, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (78, 40, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 1, 52.99, 1931.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (79, 40, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 2, 59.98, 2186.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (80, 41, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (81, 41, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (82, 42, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 3, 137.97, 5029.01, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (83, 43, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 2, 85.98, 3133.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (84, 43, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (85, 43, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (86, 44, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 3, 137.97, 5029.01, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (87, 44, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 1, 52.99, 1931.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (88, 44, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 1, 29.99, 1093.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (89, 45, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 2, 85.98, 3133.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (90, 45, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (91, 46, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (92, 46, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (93, 46, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (94, 47, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (95, 47, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 3, 167.97, 6122.51, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (96, 47, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 3, 158.97, 5794.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (97, 48, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (98, 48, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (99, 49, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (100, 49, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (101, 49, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (102, 50, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (103, 50, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 1, 38.99, 1421.19, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (104, 51, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 2, 85.98, 3133.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (105, 51, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (106, 52, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (107, 52, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 3, 140.97, 5138.36, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (108, 52, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 1, 49.99, 1822.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (109, 53, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (110, 53, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (111, 53, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (112, 54, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (113, 54, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (114, 55, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (115, 56, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (116, 56, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 2, 65.98, 2404.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (117, 57, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 3, 158.97, 5794.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (118, 58, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (119, 58, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 1, 49.99, 1822.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (120, 59, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 3, 167.97, 6122.51, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (121, 59, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 1, 55.99, 2040.84, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (122, 59, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 1, 38.99, 1421.19, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (123, 60, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 3, 140.97, 5138.36, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (124, 60, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (125, 60, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 2, 111.98, 4081.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (126, 61, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 3, 140.97, 5138.36, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (127, 61, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (128, 61, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (129, 62, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (130, 63, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (131, 64, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 3, 167.97, 6122.51, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (132, 65, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (133, 65, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 1, 45.99, 1676.34, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (134, 66, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 2, 65.98, 2404.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (135, 66, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (136, 66, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 2, 85.98, 3133.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (137, 67, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (138, 68, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 1, 55.99, 2040.84, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (139, 68, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (140, 69, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 1, 52.99, 1931.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (141, 69, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 2, 77.98, 2842.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (142, 69, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 2, 137.98, 5029.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (143, 70, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 1, 38.99, 1421.19, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (144, 70, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 2, 99.98, 3644.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (145, 70, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 3, 149.97, 5466.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (146, 71, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 2, 79.98, 2915.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (147, 71, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 3, 149.97, 5466.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (148, 72, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (149, 73, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (150, 73, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 2, 59.98, 2186.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (151, 73, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 2, 59.98, 2186.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (152, 74, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 2, 91.98, 3352.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (153, 74, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 2, 137.98, 5029.37, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (154, 74, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 3, 149.97, 5466.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (155, 75, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (156, 75, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 3, 218.97, 7981.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (157, 76, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (158, 76, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 1, 52.99, 1931.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (159, 76, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 3, 167.97, 6122.51, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (160, 77, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (161, 77, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 3, 158.97, 5794.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (162, 77, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (163, 78, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 3, 128.97, 4700.96, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (164, 78, 87, 'Lirios Blancos Puros', 'Lirios Blancos Puros', 42.99, 1566.99, 2, 85.98, 3133.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (165, 78, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (166, 79, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 2, 99.98, 3644.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (167, 79, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 2, 79.98, 2915.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (168, 79, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (169, 80, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (170, 80, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 2, 105.98, 3862.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (171, 80, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (172, 81, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 2, 111.98, 4081.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (173, 81, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (174, 81, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 3, 218.97, 7981.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (175, 82, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (176, 82, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (177, 83, 83, 'Ramo Tropical Vibrante', 'Ramo Tropical Vibrante', 45.99, 1676.34, 1, 45.99, 1676.34, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (178, 84, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (179, 84, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 1, 46.99, 1712.79, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (180, 84, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 3, 98.97, 3607.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (181, 85, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (182, 85, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 3, 89.97, 3279.41, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (183, 86, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 1, 49.99, 1822.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (184, 87, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 1, 29.99, 1093.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (185, 88, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (186, 88, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (187, 89, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (188, 89, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 2, 111.98, 4081.67, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (189, 89, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (190, 90, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 1, 52.99, 1931.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (191, 90, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 1, 72.99, 2660.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (192, 91, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 1, 46.99, 1712.79, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (193, 92, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 1, 55.99, 2040.84, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (194, 93, 93, 'Margaritas Blancas Frescas', 'Margaritas Blancas Frescas', 29.99, 1093.14, 2, 59.98, 2186.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (195, 94, 94, 'Peonías Rosadas Deluxe', 'Peonías Rosadas Deluxe', 72.99, 2660.49, 2, 145.98, 5320.97, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (196, 95, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (197, 95, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 2, 99.98, 3644.27, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (198, 95, 84, 'Bouquet Arcoíris de Rosas', 'Bouquet Arcoíris de Rosas', 52.99, 1931.49, 3, 158.97, 5794.46, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (199, 96, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 1, 68.99, 2514.69, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (200, 97, 91, 'Claveles Multicolor Festivos', 'Claveles Multicolor Festivos', 32.99, 1202.49, 1, 32.99, 1202.49, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (201, 97, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 1, 39.99, 1457.64, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (202, 97, 88, 'Tulipanes Holandeses Mix', 'Tulipanes Holandeses Mix', 49.99, 1822.14, 1, 49.99, 1822.14, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (203, 98, 89, 'Rosas Rojas Clásicas', 'Rosas Rojas Clásicas', 55.99, 2040.84, 3, 167.97, 6122.51, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (204, 98, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 1, 46.99, 1712.79, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (205, 99, 85, 'Girasoles Gigantes Alegres', 'Girasoles Gigantes Alegres', 38.99, 1421.19, 3, 116.97, 4263.56, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (206, 99, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (207, 100, 92, 'Ramo Campestre Silvestre', 'Ramo Campestre Silvestre', 39.99, 1457.64, 3, 119.97, 4372.91, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (208, 100, 90, 'Hortensias Azules Románticas', 'Hortensias Azules Románticas', 46.99, 1712.79, 2, 93.98, 3425.57, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');
INSERT INTO public.order_items VALUES (209, 100, 86, 'Orquídeas Elegantes Premium', 'Orquídeas Elegantes Premium', 68.99, 2514.69, 3, 206.97, 7544.06, '2025-10-03 12:11:37.246958+00', '2025-10-03 12:11:37.246958+00');


--
-- TOC entry 3956 (class 0 OID 32136)
-- Dependencies: 364
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_status_history VALUES (1, 1, NULL, 'pending', 'Pedido creado', 3, '2025-09-11 20:26:51.107+00');
INSERT INTO public.order_status_history VALUES (2, 1, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-12 02:26:51.107+00');
INSERT INTO public.order_status_history VALUES (3, 1, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-12 04:26:51.107+00');
INSERT INTO public.order_status_history VALUES (4, 1, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-12 06:26:51.107+00');
INSERT INTO public.order_status_history VALUES (5, 1, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-12 13:26:51.107+00');
INSERT INTO public.order_status_history VALUES (6, 2, NULL, 'pending', 'Pedido creado', 3, '2025-09-26 13:50:09.082+00');
INSERT INTO public.order_status_history VALUES (7, 2, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-26 16:50:09.082+00');
INSERT INTO public.order_status_history VALUES (8, 2, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-26 19:50:09.082+00');
INSERT INTO public.order_status_history VALUES (9, 2, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-27 01:50:09.082+00');
INSERT INTO public.order_status_history VALUES (10, 2, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-27 07:50:09.082+00');
INSERT INTO public.order_status_history VALUES (11, 3, NULL, 'pending', 'Pedido creado', 3, '2025-07-23 23:06:46.235+00');
INSERT INTO public.order_status_history VALUES (12, 3, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-24 02:06:46.235+00');
INSERT INTO public.order_status_history VALUES (13, 3, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-24 04:06:46.235+00');
INSERT INTO public.order_status_history VALUES (14, 3, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-24 09:06:46.235+00');
INSERT INTO public.order_status_history VALUES (15, 3, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-24 13:06:46.235+00');
INSERT INTO public.order_status_history VALUES (16, 4, NULL, 'pending', 'Pedido creado', 3, '2025-08-21 21:14:48.22+00');
INSERT INTO public.order_status_history VALUES (17, 4, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-21 23:14:48.22+00');
INSERT INTO public.order_status_history VALUES (18, 4, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-22 00:14:48.22+00');
INSERT INTO public.order_status_history VALUES (19, 4, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-22 09:14:48.22+00');
INSERT INTO public.order_status_history VALUES (20, 4, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-23 03:14:48.22+00');
INSERT INTO public.order_status_history VALUES (21, 5, NULL, 'pending', 'Pedido creado', 3, '2025-09-21 11:08:59.899+00');
INSERT INTO public.order_status_history VALUES (22, 5, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-21 13:08:59.899+00');
INSERT INTO public.order_status_history VALUES (23, 5, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-21 14:08:59.899+00');
INSERT INTO public.order_status_history VALUES (24, 5, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-21 19:08:59.899+00');
INSERT INTO public.order_status_history VALUES (25, 5, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-22 02:08:59.899+00');
INSERT INTO public.order_status_history VALUES (26, 6, NULL, 'pending', 'Pedido creado', 3, '2025-08-07 20:37:53.802+00');
INSERT INTO public.order_status_history VALUES (27, 6, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-07 23:37:53.802+00');
INSERT INTO public.order_status_history VALUES (28, 6, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-08 00:37:53.802+00');
INSERT INTO public.order_status_history VALUES (29, 6, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-08 08:37:53.802+00');
INSERT INTO public.order_status_history VALUES (30, 6, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-08 18:37:53.802+00');
INSERT INTO public.order_status_history VALUES (31, 7, NULL, 'pending', 'Pedido creado', 3, '2025-07-15 00:25:31.396+00');
INSERT INTO public.order_status_history VALUES (32, 7, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-15 04:25:31.396+00');
INSERT INTO public.order_status_history VALUES (33, 7, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-15 05:25:31.396+00');
INSERT INTO public.order_status_history VALUES (34, 7, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-15 15:25:31.396+00');
INSERT INTO public.order_status_history VALUES (35, 7, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-16 10:25:31.396+00');
INSERT INTO public.order_status_history VALUES (36, 8, NULL, 'pending', 'Pedido creado', 3, '2025-07-22 21:52:12.409+00');
INSERT INTO public.order_status_history VALUES (37, 8, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-23 03:52:12.409+00');
INSERT INTO public.order_status_history VALUES (38, 8, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-23 05:52:12.409+00');
INSERT INTO public.order_status_history VALUES (39, 8, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-23 13:52:12.409+00');
INSERT INTO public.order_status_history VALUES (40, 8, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-24 12:52:12.409+00');
INSERT INTO public.order_status_history VALUES (41, 9, NULL, 'pending', 'Pedido creado', 3, '2025-08-11 01:18:32.569+00');
INSERT INTO public.order_status_history VALUES (42, 9, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-11 02:18:32.569+00');
INSERT INTO public.order_status_history VALUES (43, 9, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-11 04:18:32.569+00');
INSERT INTO public.order_status_history VALUES (44, 9, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-11 08:18:32.569+00');
INSERT INTO public.order_status_history VALUES (45, 9, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-11 14:18:32.569+00');
INSERT INTO public.order_status_history VALUES (46, 10, NULL, 'pending', 'Pedido creado', 3, '2025-07-27 23:49:02.097+00');
INSERT INTO public.order_status_history VALUES (47, 10, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-28 02:49:02.097+00');
INSERT INTO public.order_status_history VALUES (48, 10, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-28 05:49:02.097+00');
INSERT INTO public.order_status_history VALUES (49, 10, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-28 10:49:02.097+00');
INSERT INTO public.order_status_history VALUES (50, 10, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-28 14:49:02.097+00');
INSERT INTO public.order_status_history VALUES (51, 11, NULL, 'pending', 'Pedido creado', 3, '2025-10-01 21:48:02.563+00');
INSERT INTO public.order_status_history VALUES (52, 11, 'pending', 'verified', 'Pago confirmado', 3, '2025-10-02 00:48:02.563+00');
INSERT INTO public.order_status_history VALUES (53, 12, NULL, 'pending', 'Pedido creado', 3, '2025-08-16 05:29:44.484+00');
INSERT INTO public.order_status_history VALUES (54, 12, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-16 10:29:44.484+00');
INSERT INTO public.order_status_history VALUES (55, 12, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-16 12:29:44.484+00');
INSERT INTO public.order_status_history VALUES (56, 12, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-16 21:29:44.484+00');
INSERT INTO public.order_status_history VALUES (57, 12, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-17 13:29:44.484+00');
INSERT INTO public.order_status_history VALUES (58, 13, NULL, 'pending', 'Pedido creado', 3, '2025-07-31 05:33:25.657+00');
INSERT INTO public.order_status_history VALUES (59, 13, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-31 06:33:25.657+00');
INSERT INTO public.order_status_history VALUES (60, 13, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-31 08:33:25.657+00');
INSERT INTO public.order_status_history VALUES (61, 13, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-31 19:33:25.657+00');
INSERT INTO public.order_status_history VALUES (62, 13, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-01 03:33:25.657+00');
INSERT INTO public.order_status_history VALUES (63, 14, NULL, 'pending', 'Pedido creado', 3, '2025-07-09 08:15:15.268+00');
INSERT INTO public.order_status_history VALUES (64, 14, 'pending', 'cancelled', 'Producto no disponible', 3, '2025-07-09 13:15:15.268+00');
INSERT INTO public.order_status_history VALUES (65, 15, NULL, 'pending', 'Pedido creado', 3, '2025-07-23 13:05:09.814+00');
INSERT INTO public.order_status_history VALUES (66, 15, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-23 17:05:09.814+00');
INSERT INTO public.order_status_history VALUES (67, 15, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-23 19:05:09.814+00');
INSERT INTO public.order_status_history VALUES (68, 15, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-24 06:05:09.814+00');
INSERT INTO public.order_status_history VALUES (69, 15, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-24 09:05:09.814+00');
INSERT INTO public.order_status_history VALUES (70, 16, NULL, 'pending', 'Pedido creado', 3, '2025-09-20 12:58:42.739+00');
INSERT INTO public.order_status_history VALUES (71, 16, 'pending', 'cancelled', 'Cambio de dirección no disponible', 3, '2025-09-20 13:58:42.739+00');
INSERT INTO public.order_status_history VALUES (72, 17, NULL, 'pending', 'Pedido creado', 3, '2025-07-18 18:59:42.195+00');
INSERT INTO public.order_status_history VALUES (73, 17, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-19 00:59:42.195+00');
INSERT INTO public.order_status_history VALUES (74, 17, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-19 02:59:42.195+00');
INSERT INTO public.order_status_history VALUES (75, 17, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-19 12:59:42.195+00');
INSERT INTO public.order_status_history VALUES (76, 17, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-20 09:59:42.195+00');
INSERT INTO public.order_status_history VALUES (77, 18, NULL, 'pending', 'Pedido creado', 3, '2025-09-03 14:38:20.853+00');
INSERT INTO public.order_status_history VALUES (78, 18, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-03 16:38:20.853+00');
INSERT INTO public.order_status_history VALUES (79, 18, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-03 19:38:20.853+00');
INSERT INTO public.order_status_history VALUES (80, 18, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-04 00:38:20.853+00');
INSERT INTO public.order_status_history VALUES (81, 18, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-05 00:38:20.853+00');
INSERT INTO public.order_status_history VALUES (82, 19, NULL, 'pending', 'Pedido creado', 3, '2025-07-23 10:20:40.615+00');
INSERT INTO public.order_status_history VALUES (83, 19, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-23 11:20:40.615+00');
INSERT INTO public.order_status_history VALUES (84, 19, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-23 13:20:40.615+00');
INSERT INTO public.order_status_history VALUES (85, 19, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-23 17:20:40.615+00');
INSERT INTO public.order_status_history VALUES (86, 19, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-24 10:20:40.615+00');
INSERT INTO public.order_status_history VALUES (87, 20, NULL, 'pending', 'Pedido creado', 3, '2025-09-14 12:18:48.498+00');
INSERT INTO public.order_status_history VALUES (88, 20, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-14 16:18:48.498+00');
INSERT INTO public.order_status_history VALUES (89, 20, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-14 19:18:48.498+00');
INSERT INTO public.order_status_history VALUES (90, 20, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-14 23:18:48.498+00');
INSERT INTO public.order_status_history VALUES (91, 20, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-15 08:18:48.498+00');
INSERT INTO public.order_status_history VALUES (92, 21, NULL, 'pending', 'Pedido creado', 3, '2025-08-07 04:11:43.35+00');
INSERT INTO public.order_status_history VALUES (93, 21, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-07 06:11:43.35+00');
INSERT INTO public.order_status_history VALUES (94, 21, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-07 09:11:43.35+00');
INSERT INTO public.order_status_history VALUES (95, 21, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-07 19:11:43.35+00');
INSERT INTO public.order_status_history VALUES (96, 21, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-07 21:11:43.35+00');
INSERT INTO public.order_status_history VALUES (97, 22, NULL, 'pending', 'Pedido creado', 3, '2025-08-03 14:50:54.543+00');
INSERT INTO public.order_status_history VALUES (98, 22, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-03 17:50:54.543+00');
INSERT INTO public.order_status_history VALUES (99, 22, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-03 20:50:54.543+00');
INSERT INTO public.order_status_history VALUES (100, 22, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-04 06:50:54.543+00');
INSERT INTO public.order_status_history VALUES (101, 22, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-04 09:50:54.543+00');
INSERT INTO public.order_status_history VALUES (102, 23, NULL, 'pending', 'Pedido creado', 3, '2025-07-29 23:38:15.874+00');
INSERT INTO public.order_status_history VALUES (103, 23, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-30 05:38:15.874+00');
INSERT INTO public.order_status_history VALUES (104, 23, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-30 07:38:15.874+00');
INSERT INTO public.order_status_history VALUES (105, 23, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-30 16:38:15.874+00');
INSERT INTO public.order_status_history VALUES (106, 23, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-31 12:38:15.874+00');
INSERT INTO public.order_status_history VALUES (107, 24, NULL, 'pending', 'Pedido creado', 3, '2025-07-20 16:28:28.299+00');
INSERT INTO public.order_status_history VALUES (108, 24, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-20 22:28:28.299+00');
INSERT INTO public.order_status_history VALUES (109, 24, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-20 23:28:28.299+00');
INSERT INTO public.order_status_history VALUES (110, 24, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-21 04:28:28.299+00');
INSERT INTO public.order_status_history VALUES (111, 24, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-21 13:28:28.299+00');
INSERT INTO public.order_status_history VALUES (112, 25, NULL, 'pending', 'Pedido creado', 3, '2025-08-06 11:27:09.962+00');
INSERT INTO public.order_status_history VALUES (113, 25, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-06 12:27:09.962+00');
INSERT INTO public.order_status_history VALUES (114, 25, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-06 15:27:09.962+00');
INSERT INTO public.order_status_history VALUES (115, 25, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-07 01:27:09.962+00');
INSERT INTO public.order_status_history VALUES (116, 25, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-07 23:27:09.962+00');
INSERT INTO public.order_status_history VALUES (117, 26, NULL, 'pending', 'Pedido creado', 3, '2025-07-28 03:08:15.885+00');
INSERT INTO public.order_status_history VALUES (118, 26, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-28 06:08:15.885+00');
INSERT INTO public.order_status_history VALUES (119, 26, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-28 08:08:15.885+00');
INSERT INTO public.order_status_history VALUES (120, 26, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-28 10:08:15.885+00');
INSERT INTO public.order_status_history VALUES (121, 26, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-29 04:08:15.885+00');
INSERT INTO public.order_status_history VALUES (122, 27, NULL, 'pending', 'Pedido creado', 3, '2025-08-23 09:58:00.276+00');
INSERT INTO public.order_status_history VALUES (123, 27, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-23 12:58:00.276+00');
INSERT INTO public.order_status_history VALUES (124, 27, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-23 14:58:00.276+00');
INSERT INTO public.order_status_history VALUES (125, 27, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-24 02:58:00.276+00');
INSERT INTO public.order_status_history VALUES (126, 27, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-24 23:58:00.276+00');
INSERT INTO public.order_status_history VALUES (127, 28, NULL, 'pending', 'Pedido creado', 3, '2025-10-02 04:17:57.106+00');
INSERT INTO public.order_status_history VALUES (128, 28, 'pending', 'verified', 'Pago confirmado', 3, '2025-10-02 07:17:57.106+00');
INSERT INTO public.order_status_history VALUES (129, 28, 'verified', 'preparing', 'Preparando pedido', 3, '2025-10-02 10:17:57.106+00');
INSERT INTO public.order_status_history VALUES (130, 28, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-10-02 16:17:57.106+00');
INSERT INTO public.order_status_history VALUES (131, 29, NULL, 'pending', 'Pedido creado', 3, '2025-09-05 05:52:49.629+00');
INSERT INTO public.order_status_history VALUES (132, 29, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-05 11:52:49.629+00');
INSERT INTO public.order_status_history VALUES (133, 29, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-05 12:52:49.629+00');
INSERT INTO public.order_status_history VALUES (134, 29, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-05 17:52:49.629+00');
INSERT INTO public.order_status_history VALUES (135, 29, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-06 08:52:49.629+00');
INSERT INTO public.order_status_history VALUES (136, 30, NULL, 'pending', 'Pedido creado', 3, '2025-07-13 09:35:18.171+00');
INSERT INTO public.order_status_history VALUES (137, 30, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-13 13:35:18.171+00');
INSERT INTO public.order_status_history VALUES (138, 30, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-13 16:35:18.171+00');
INSERT INTO public.order_status_history VALUES (139, 30, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-13 22:35:18.171+00');
INSERT INTO public.order_status_history VALUES (140, 30, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-14 16:35:18.171+00');
INSERT INTO public.order_status_history VALUES (141, 31, NULL, 'pending', 'Pedido creado', 3, '2025-08-06 20:17:59.744+00');
INSERT INTO public.order_status_history VALUES (142, 31, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-07 01:17:59.744+00');
INSERT INTO public.order_status_history VALUES (143, 31, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-07 02:17:59.744+00');
INSERT INTO public.order_status_history VALUES (144, 31, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-07 09:17:59.744+00');
INSERT INTO public.order_status_history VALUES (145, 31, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-07 16:17:59.744+00');
INSERT INTO public.order_status_history VALUES (146, 32, NULL, 'pending', 'Pedido creado', 3, '2025-08-21 11:51:03.455+00');
INSERT INTO public.order_status_history VALUES (147, 32, 'pending', 'cancelled', 'Producto no disponible', 3, '2025-08-21 17:51:03.455+00');
INSERT INTO public.order_status_history VALUES (148, 33, NULL, 'pending', 'Pedido creado', 3, '2025-08-17 18:18:24.377+00');
INSERT INTO public.order_status_history VALUES (149, 33, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-17 23:18:24.377+00');
INSERT INTO public.order_status_history VALUES (150, 33, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-18 01:18:24.377+00');
INSERT INTO public.order_status_history VALUES (151, 33, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-18 06:18:24.377+00');
INSERT INTO public.order_status_history VALUES (152, 33, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-18 08:18:24.377+00');
INSERT INTO public.order_status_history VALUES (153, 34, NULL, 'pending', 'Pedido creado', 3, '2025-08-11 12:31:36.925+00');
INSERT INTO public.order_status_history VALUES (154, 34, 'pending', 'cancelled', 'Cambio de dirección no disponible', 3, '2025-08-11 14:31:36.925+00');
INSERT INTO public.order_status_history VALUES (155, 35, NULL, 'pending', 'Pedido creado', 3, '2025-08-21 21:34:40.406+00');
INSERT INTO public.order_status_history VALUES (156, 35, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-21 23:34:40.406+00');
INSERT INTO public.order_status_history VALUES (157, 35, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-22 00:34:40.406+00');
INSERT INTO public.order_status_history VALUES (158, 35, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-22 11:34:40.406+00');
INSERT INTO public.order_status_history VALUES (159, 35, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-22 13:34:40.406+00');
INSERT INTO public.order_status_history VALUES (160, 36, NULL, 'pending', 'Pedido creado', 3, '2025-08-31 13:57:18.308+00');
INSERT INTO public.order_status_history VALUES (161, 36, 'pending', 'cancelled', 'Cliente canceló el pedido', 3, '2025-08-31 18:57:18.308+00');
INSERT INTO public.order_status_history VALUES (162, 37, NULL, 'pending', 'Pedido creado', 3, '2025-07-14 17:20:43.647+00');
INSERT INTO public.order_status_history VALUES (163, 37, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-14 21:20:43.647+00');
INSERT INTO public.order_status_history VALUES (164, 37, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-14 23:20:43.647+00');
INSERT INTO public.order_status_history VALUES (165, 37, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-15 11:20:43.647+00');
INSERT INTO public.order_status_history VALUES (166, 37, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-15 15:20:43.647+00');
INSERT INTO public.order_status_history VALUES (167, 38, NULL, 'pending', 'Pedido creado', 3, '2025-09-17 13:46:15.092+00');
INSERT INTO public.order_status_history VALUES (168, 38, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-17 15:46:15.092+00');
INSERT INTO public.order_status_history VALUES (169, 38, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-17 17:46:15.092+00');
INSERT INTO public.order_status_history VALUES (170, 38, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-18 00:46:15.092+00');
INSERT INTO public.order_status_history VALUES (171, 38, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-19 00:46:15.092+00');
INSERT INTO public.order_status_history VALUES (172, 39, NULL, 'pending', 'Pedido creado', 3, '2025-08-22 10:45:13.786+00');
INSERT INTO public.order_status_history VALUES (173, 39, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-22 11:45:13.786+00');
INSERT INTO public.order_status_history VALUES (174, 39, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-22 14:45:13.786+00');
INSERT INTO public.order_status_history VALUES (175, 39, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-22 21:45:13.786+00');
INSERT INTO public.order_status_history VALUES (176, 39, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-23 14:45:13.786+00');
INSERT INTO public.order_status_history VALUES (177, 40, NULL, 'pending', 'Pedido creado', 3, '2025-07-26 09:56:43.681+00');
INSERT INTO public.order_status_history VALUES (178, 40, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-26 15:56:43.681+00');
INSERT INTO public.order_status_history VALUES (179, 40, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-26 18:56:43.681+00');
INSERT INTO public.order_status_history VALUES (180, 40, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-26 20:56:43.681+00');
INSERT INTO public.order_status_history VALUES (181, 40, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-27 09:56:43.681+00');
INSERT INTO public.order_status_history VALUES (182, 41, NULL, 'pending', 'Pedido creado', 3, '2025-09-10 16:16:32.169+00');
INSERT INTO public.order_status_history VALUES (183, 41, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-10 17:16:32.169+00');
INSERT INTO public.order_status_history VALUES (184, 41, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-10 19:16:32.169+00');
INSERT INTO public.order_status_history VALUES (185, 41, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-11 04:16:32.169+00');
INSERT INTO public.order_status_history VALUES (186, 41, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-11 18:16:32.169+00');
INSERT INTO public.order_status_history VALUES (187, 42, NULL, 'pending', 'Pedido creado', 3, '2025-08-28 13:08:01.324+00');
INSERT INTO public.order_status_history VALUES (188, 42, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-28 18:08:01.324+00');
INSERT INTO public.order_status_history VALUES (189, 42, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-28 19:08:01.324+00');
INSERT INTO public.order_status_history VALUES (190, 42, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-28 22:08:01.324+00');
INSERT INTO public.order_status_history VALUES (191, 42, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-29 19:08:01.324+00');
INSERT INTO public.order_status_history VALUES (192, 43, NULL, 'pending', 'Pedido creado', 3, '2025-09-25 19:20:35.688+00');
INSERT INTO public.order_status_history VALUES (193, 43, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-25 21:20:35.688+00');
INSERT INTO public.order_status_history VALUES (194, 43, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-25 23:20:35.688+00');
INSERT INTO public.order_status_history VALUES (195, 43, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-26 03:20:35.688+00');
INSERT INTO public.order_status_history VALUES (196, 43, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-26 13:20:35.688+00');
INSERT INTO public.order_status_history VALUES (197, 44, NULL, 'pending', 'Pedido creado', 3, '2025-08-07 03:11:36.248+00');
INSERT INTO public.order_status_history VALUES (198, 44, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-07 06:11:36.248+00');
INSERT INTO public.order_status_history VALUES (199, 44, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-07 09:11:36.248+00');
INSERT INTO public.order_status_history VALUES (200, 44, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-07 19:11:36.248+00');
INSERT INTO public.order_status_history VALUES (201, 44, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-08 09:11:36.248+00');
INSERT INTO public.order_status_history VALUES (202, 45, NULL, 'pending', 'Pedido creado', 3, '2025-08-21 15:46:16.255+00');
INSERT INTO public.order_status_history VALUES (203, 45, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-21 18:46:16.255+00');
INSERT INTO public.order_status_history VALUES (204, 45, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-21 19:46:16.255+00');
INSERT INTO public.order_status_history VALUES (205, 45, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-22 05:46:16.255+00');
INSERT INTO public.order_status_history VALUES (206, 45, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-23 03:46:16.255+00');
INSERT INTO public.order_status_history VALUES (207, 46, NULL, 'pending', 'Pedido creado', 3, '2025-07-29 00:23:43.35+00');
INSERT INTO public.order_status_history VALUES (208, 46, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-29 06:23:43.35+00');
INSERT INTO public.order_status_history VALUES (209, 46, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-29 09:23:43.35+00');
INSERT INTO public.order_status_history VALUES (210, 46, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-29 20:23:43.35+00');
INSERT INTO public.order_status_history VALUES (211, 46, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-30 07:23:43.35+00');
INSERT INTO public.order_status_history VALUES (212, 47, NULL, 'pending', 'Pedido creado', 3, '2025-09-11 08:28:00.466+00');
INSERT INTO public.order_status_history VALUES (213, 47, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-11 10:28:00.466+00');
INSERT INTO public.order_status_history VALUES (214, 47, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-11 13:28:00.466+00');
INSERT INTO public.order_status_history VALUES (215, 47, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-11 15:28:00.466+00');
INSERT INTO public.order_status_history VALUES (216, 48, NULL, 'pending', 'Pedido creado', 3, '2025-09-26 06:04:32.588+00');
INSERT INTO public.order_status_history VALUES (217, 48, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-26 08:04:32.588+00');
INSERT INTO public.order_status_history VALUES (218, 48, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-26 11:04:32.588+00');
INSERT INTO public.order_status_history VALUES (219, 48, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-26 16:04:32.588+00');
INSERT INTO public.order_status_history VALUES (220, 48, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-27 03:04:32.588+00');
INSERT INTO public.order_status_history VALUES (221, 49, NULL, 'pending', 'Pedido creado', 3, '2025-07-30 16:06:15.465+00');
INSERT INTO public.order_status_history VALUES (222, 49, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-30 17:06:15.465+00');
INSERT INTO public.order_status_history VALUES (223, 49, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-30 20:06:15.465+00');
INSERT INTO public.order_status_history VALUES (224, 49, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-30 23:06:15.465+00');
INSERT INTO public.order_status_history VALUES (225, 49, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-31 20:06:15.465+00');
INSERT INTO public.order_status_history VALUES (226, 50, NULL, 'pending', 'Pedido creado', 3, '2025-09-16 13:18:09.882+00');
INSERT INTO public.order_status_history VALUES (227, 50, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-16 18:18:09.882+00');
INSERT INTO public.order_status_history VALUES (228, 50, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-16 21:18:09.882+00');
INSERT INTO public.order_status_history VALUES (229, 50, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-17 01:18:09.882+00');
INSERT INTO public.order_status_history VALUES (230, 50, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-17 17:18:09.882+00');
INSERT INTO public.order_status_history VALUES (231, 51, NULL, 'pending', 'Pedido creado', 3, '2025-08-29 02:40:04.458+00');
INSERT INTO public.order_status_history VALUES (232, 51, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-29 05:40:04.458+00');
INSERT INTO public.order_status_history VALUES (233, 51, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-29 07:40:04.458+00');
INSERT INTO public.order_status_history VALUES (234, 51, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-29 17:40:04.458+00');
INSERT INTO public.order_status_history VALUES (235, 52, NULL, 'pending', 'Pedido creado', 3, '2025-09-05 08:19:04.545+00');
INSERT INTO public.order_status_history VALUES (236, 52, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-05 12:19:04.545+00');
INSERT INTO public.order_status_history VALUES (237, 52, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-05 15:19:04.545+00');
INSERT INTO public.order_status_history VALUES (238, 52, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-05 23:19:04.545+00');
INSERT INTO public.order_status_history VALUES (239, 52, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-06 22:19:04.545+00');
INSERT INTO public.order_status_history VALUES (240, 53, NULL, 'pending', 'Pedido creado', 3, '2025-07-10 03:32:24.417+00');
INSERT INTO public.order_status_history VALUES (241, 53, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-10 08:32:24.417+00');
INSERT INTO public.order_status_history VALUES (242, 53, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-10 10:32:24.417+00');
INSERT INTO public.order_status_history VALUES (243, 53, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-10 17:32:24.417+00');
INSERT INTO public.order_status_history VALUES (244, 53, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-11 02:32:24.417+00');
INSERT INTO public.order_status_history VALUES (245, 54, NULL, 'pending', 'Pedido creado', 3, '2025-09-08 15:49:21.526+00');
INSERT INTO public.order_status_history VALUES (246, 54, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-08 18:49:21.526+00');
INSERT INTO public.order_status_history VALUES (247, 54, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-08 21:49:21.526+00');
INSERT INTO public.order_status_history VALUES (248, 54, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-09 07:49:21.526+00');
INSERT INTO public.order_status_history VALUES (249, 54, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-09 17:49:21.526+00');
INSERT INTO public.order_status_history VALUES (250, 55, NULL, 'pending', 'Pedido creado', 3, '2025-10-02 09:58:39.515+00');
INSERT INTO public.order_status_history VALUES (251, 55, 'pending', 'verified', 'Pago confirmado', 3, '2025-10-02 13:58:39.515+00');
INSERT INTO public.order_status_history VALUES (252, 56, NULL, 'pending', 'Pedido creado', 3, '2025-09-17 00:45:55.06+00');
INSERT INTO public.order_status_history VALUES (253, 56, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-17 04:45:55.06+00');
INSERT INTO public.order_status_history VALUES (254, 56, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-17 06:45:55.06+00');
INSERT INTO public.order_status_history VALUES (255, 56, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-17 16:45:55.06+00');
INSERT INTO public.order_status_history VALUES (256, 56, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-17 20:45:55.06+00');
INSERT INTO public.order_status_history VALUES (257, 57, NULL, 'pending', 'Pedido creado', 3, '2025-07-10 13:22:38.319+00');
INSERT INTO public.order_status_history VALUES (258, 57, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-10 14:22:38.319+00');
INSERT INTO public.order_status_history VALUES (259, 57, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-10 16:22:38.319+00');
INSERT INTO public.order_status_history VALUES (260, 57, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-10 18:22:38.319+00');
INSERT INTO public.order_status_history VALUES (261, 57, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-11 14:22:38.319+00');
INSERT INTO public.order_status_history VALUES (262, 58, NULL, 'pending', 'Pedido creado', 3, '2025-08-02 19:51:11.879+00');
INSERT INTO public.order_status_history VALUES (263, 58, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-03 00:51:11.879+00');
INSERT INTO public.order_status_history VALUES (264, 58, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-03 01:51:11.879+00');
INSERT INTO public.order_status_history VALUES (265, 58, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-03 11:51:11.879+00');
INSERT INTO public.order_status_history VALUES (266, 58, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-03 23:51:11.879+00');
INSERT INTO public.order_status_history VALUES (267, 59, NULL, 'pending', 'Pedido creado', 3, '2025-09-23 06:45:37.612+00');
INSERT INTO public.order_status_history VALUES (268, 59, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-23 12:45:37.612+00');
INSERT INTO public.order_status_history VALUES (269, 59, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-23 14:45:37.612+00');
INSERT INTO public.order_status_history VALUES (270, 59, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-23 21:45:37.612+00');
INSERT INTO public.order_status_history VALUES (271, 59, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-24 19:45:37.612+00');
INSERT INTO public.order_status_history VALUES (272, 60, NULL, 'pending', 'Pedido creado', 3, '2025-07-30 11:20:35.4+00');
INSERT INTO public.order_status_history VALUES (273, 60, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-30 12:20:35.4+00');
INSERT INTO public.order_status_history VALUES (274, 60, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-30 14:20:35.4+00');
INSERT INTO public.order_status_history VALUES (275, 60, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-31 02:20:35.4+00');
INSERT INTO public.order_status_history VALUES (276, 61, NULL, 'pending', 'Pedido creado', 3, '2025-07-28 04:00:14.854+00');
INSERT INTO public.order_status_history VALUES (277, 61, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-28 10:00:14.854+00');
INSERT INTO public.order_status_history VALUES (278, 61, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-28 11:00:14.854+00');
INSERT INTO public.order_status_history VALUES (279, 61, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-28 18:00:14.854+00');
INSERT INTO public.order_status_history VALUES (280, 61, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-29 06:00:14.854+00');
INSERT INTO public.order_status_history VALUES (281, 62, NULL, 'pending', 'Pedido creado', 3, '2025-10-02 18:44:56.212+00');
INSERT INTO public.order_status_history VALUES (282, 62, 'pending', 'verified', 'Pago confirmado', 3, '2025-10-02 22:44:56.212+00');
INSERT INTO public.order_status_history VALUES (283, 62, 'verified', 'preparing', 'Preparando pedido', 3, '2025-10-03 01:44:56.212+00');
INSERT INTO public.order_status_history VALUES (284, 62, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-10-03 08:44:56.212+00');
INSERT INTO public.order_status_history VALUES (285, 63, NULL, 'pending', 'Pedido creado', 3, '2025-07-13 20:57:20.391+00');
INSERT INTO public.order_status_history VALUES (286, 63, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-14 00:57:20.391+00');
INSERT INTO public.order_status_history VALUES (287, 63, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-14 03:57:20.391+00');
INSERT INTO public.order_status_history VALUES (288, 63, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-14 12:57:20.391+00');
INSERT INTO public.order_status_history VALUES (289, 63, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-15 07:57:20.391+00');
INSERT INTO public.order_status_history VALUES (290, 64, NULL, 'pending', 'Pedido creado', 3, '2025-08-04 22:31:15.81+00');
INSERT INTO public.order_status_history VALUES (291, 64, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-05 00:31:15.81+00');
INSERT INTO public.order_status_history VALUES (292, 64, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-05 02:31:15.81+00');
INSERT INTO public.order_status_history VALUES (293, 64, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-05 06:31:15.81+00');
INSERT INTO public.order_status_history VALUES (294, 64, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-05 08:31:15.81+00');
INSERT INTO public.order_status_history VALUES (295, 65, NULL, 'pending', 'Pedido creado', 3, '2025-07-23 11:21:19.001+00');
INSERT INTO public.order_status_history VALUES (296, 65, 'pending', 'cancelled', 'Cliente no respondió', 3, '2025-07-23 14:21:19.001+00');
INSERT INTO public.order_status_history VALUES (297, 66, NULL, 'pending', 'Pedido creado', 3, '2025-09-02 15:45:54.054+00');
INSERT INTO public.order_status_history VALUES (298, 66, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-02 20:45:54.054+00');
INSERT INTO public.order_status_history VALUES (299, 66, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-02 22:45:54.054+00');
INSERT INTO public.order_status_history VALUES (300, 66, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-03 02:45:54.054+00');
INSERT INTO public.order_status_history VALUES (301, 66, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-03 12:45:54.054+00');
INSERT INTO public.order_status_history VALUES (302, 67, NULL, 'pending', 'Pedido creado', 3, '2025-08-04 23:03:46.06+00');
INSERT INTO public.order_status_history VALUES (303, 67, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-05 04:03:46.06+00');
INSERT INTO public.order_status_history VALUES (304, 67, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-05 07:03:46.06+00');
INSERT INTO public.order_status_history VALUES (305, 67, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-05 13:03:46.06+00');
INSERT INTO public.order_status_history VALUES (306, 67, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-06 11:03:46.06+00');
INSERT INTO public.order_status_history VALUES (307, 68, NULL, 'pending', 'Pedido creado', 3, '2025-08-09 02:23:14.404+00');
INSERT INTO public.order_status_history VALUES (308, 68, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-09 06:23:14.404+00');
INSERT INTO public.order_status_history VALUES (309, 68, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-09 08:23:14.404+00');
INSERT INTO public.order_status_history VALUES (310, 68, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-09 11:23:14.404+00');
INSERT INTO public.order_status_history VALUES (311, 68, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-09 16:23:14.404+00');
INSERT INTO public.order_status_history VALUES (312, 69, NULL, 'pending', 'Pedido creado', 3, '2025-08-02 02:12:24.965+00');
INSERT INTO public.order_status_history VALUES (313, 69, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-02 07:12:24.965+00');
INSERT INTO public.order_status_history VALUES (314, 69, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-02 09:12:24.965+00');
INSERT INTO public.order_status_history VALUES (315, 69, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-02 21:12:24.965+00');
INSERT INTO public.order_status_history VALUES (316, 69, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-03 01:12:24.965+00');
INSERT INTO public.order_status_history VALUES (317, 70, NULL, 'pending', 'Pedido creado', 3, '2025-07-24 05:20:43.353+00');
INSERT INTO public.order_status_history VALUES (318, 70, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-24 09:20:43.353+00');
INSERT INTO public.order_status_history VALUES (319, 70, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-24 11:20:43.353+00');
INSERT INTO public.order_status_history VALUES (320, 70, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-24 20:20:43.353+00');
INSERT INTO public.order_status_history VALUES (321, 70, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-25 12:20:43.353+00');
INSERT INTO public.order_status_history VALUES (322, 71, NULL, 'pending', 'Pedido creado', 3, '2025-08-13 09:40:00.88+00');
INSERT INTO public.order_status_history VALUES (323, 71, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-13 12:40:00.88+00');
INSERT INTO public.order_status_history VALUES (324, 71, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-13 14:40:00.88+00');
INSERT INTO public.order_status_history VALUES (325, 71, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-13 16:40:00.88+00');
INSERT INTO public.order_status_history VALUES (326, 71, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-13 21:40:00.88+00');
INSERT INTO public.order_status_history VALUES (327, 72, NULL, 'pending', 'Pedido creado', 3, '2025-07-31 07:11:19.764+00');
INSERT INTO public.order_status_history VALUES (328, 72, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-31 13:11:19.764+00');
INSERT INTO public.order_status_history VALUES (329, 72, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-31 16:11:19.764+00');
INSERT INTO public.order_status_history VALUES (330, 72, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-31 23:11:19.764+00');
INSERT INTO public.order_status_history VALUES (331, 72, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-01 01:11:19.764+00');
INSERT INTO public.order_status_history VALUES (332, 73, NULL, 'pending', 'Pedido creado', 3, '2025-07-08 15:01:27.846+00');
INSERT INTO public.order_status_history VALUES (333, 73, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-08 16:01:27.846+00');
INSERT INTO public.order_status_history VALUES (334, 73, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-08 17:01:27.846+00');
INSERT INTO public.order_status_history VALUES (335, 73, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-09 05:01:27.846+00');
INSERT INTO public.order_status_history VALUES (336, 73, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-09 18:01:27.846+00');
INSERT INTO public.order_status_history VALUES (337, 74, NULL, 'pending', 'Pedido creado', 3, '2025-09-05 08:36:05.264+00');
INSERT INTO public.order_status_history VALUES (338, 74, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-05 11:36:05.264+00');
INSERT INTO public.order_status_history VALUES (339, 74, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-05 12:36:05.264+00');
INSERT INTO public.order_status_history VALUES (340, 74, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-06 00:36:05.264+00');
INSERT INTO public.order_status_history VALUES (341, 74, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-06 17:36:05.264+00');
INSERT INTO public.order_status_history VALUES (342, 75, NULL, 'pending', 'Pedido creado', 3, '2025-07-25 20:03:30.156+00');
INSERT INTO public.order_status_history VALUES (343, 75, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-25 23:03:30.156+00');
INSERT INTO public.order_status_history VALUES (344, 75, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-26 02:03:30.156+00');
INSERT INTO public.order_status_history VALUES (345, 75, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-26 05:03:30.156+00');
INSERT INTO public.order_status_history VALUES (346, 75, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-26 08:03:30.156+00');
INSERT INTO public.order_status_history VALUES (347, 76, NULL, 'pending', 'Pedido creado', 3, '2025-08-13 13:31:11.796+00');
INSERT INTO public.order_status_history VALUES (348, 76, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-13 14:31:11.796+00');
INSERT INTO public.order_status_history VALUES (349, 76, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-13 17:31:11.796+00');
INSERT INTO public.order_status_history VALUES (350, 76, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-14 03:31:11.796+00');
INSERT INTO public.order_status_history VALUES (351, 76, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-14 08:31:11.796+00');
INSERT INTO public.order_status_history VALUES (352, 77, NULL, 'pending', 'Pedido creado', 3, '2025-07-08 22:53:43.895+00');
INSERT INTO public.order_status_history VALUES (353, 77, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-09 00:53:43.895+00');
INSERT INTO public.order_status_history VALUES (354, 77, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-09 02:53:43.895+00');
INSERT INTO public.order_status_history VALUES (355, 77, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-09 09:53:43.895+00');
INSERT INTO public.order_status_history VALUES (356, 77, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-09 13:53:43.895+00');
INSERT INTO public.order_status_history VALUES (357, 78, NULL, 'pending', 'Pedido creado', 3, '2025-08-31 02:38:30.247+00');
INSERT INTO public.order_status_history VALUES (358, 78, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-31 06:38:30.247+00');
INSERT INTO public.order_status_history VALUES (359, 78, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-31 08:38:30.247+00');
INSERT INTO public.order_status_history VALUES (360, 78, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-31 14:38:30.247+00');
INSERT INTO public.order_status_history VALUES (361, 78, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-01 09:38:30.247+00');
INSERT INTO public.order_status_history VALUES (362, 79, NULL, 'pending', 'Pedido creado', 3, '2025-07-04 16:01:48.34+00');
INSERT INTO public.order_status_history VALUES (363, 79, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-04 21:01:48.34+00');
INSERT INTO public.order_status_history VALUES (364, 79, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-05 00:01:48.34+00');
INSERT INTO public.order_status_history VALUES (365, 79, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-05 02:01:48.34+00');
INSERT INTO public.order_status_history VALUES (366, 79, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-05 21:01:48.34+00');
INSERT INTO public.order_status_history VALUES (367, 80, NULL, 'pending', 'Pedido creado', 3, '2025-08-18 14:00:02.994+00');
INSERT INTO public.order_status_history VALUES (368, 80, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-18 15:00:02.994+00');
INSERT INTO public.order_status_history VALUES (369, 80, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-18 18:00:02.994+00');
INSERT INTO public.order_status_history VALUES (370, 80, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-19 04:00:02.994+00');
INSERT INTO public.order_status_history VALUES (371, 80, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-20 04:00:02.994+00');
INSERT INTO public.order_status_history VALUES (372, 81, NULL, 'pending', 'Pedido creado', 3, '2025-08-20 20:26:40.15+00');
INSERT INTO public.order_status_history VALUES (373, 81, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-21 02:26:40.15+00');
INSERT INTO public.order_status_history VALUES (374, 81, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-21 05:26:40.15+00');
INSERT INTO public.order_status_history VALUES (375, 81, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-21 11:26:40.15+00');
INSERT INTO public.order_status_history VALUES (376, 81, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-22 05:26:40.15+00');
INSERT INTO public.order_status_history VALUES (377, 82, NULL, 'pending', 'Pedido creado', 3, '2025-09-27 22:58:32.289+00');
INSERT INTO public.order_status_history VALUES (378, 82, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-28 01:58:32.289+00');
INSERT INTO public.order_status_history VALUES (379, 82, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-28 02:58:32.289+00');
INSERT INTO public.order_status_history VALUES (380, 82, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-28 11:58:32.289+00');
INSERT INTO public.order_status_history VALUES (381, 82, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-29 07:58:32.289+00');
INSERT INTO public.order_status_history VALUES (382, 83, NULL, 'pending', 'Pedido creado', 3, '2025-09-26 15:12:49.043+00');
INSERT INTO public.order_status_history VALUES (383, 83, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-26 17:12:49.043+00');
INSERT INTO public.order_status_history VALUES (384, 83, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-26 18:12:49.043+00');
INSERT INTO public.order_status_history VALUES (385, 83, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-26 21:12:49.043+00');
INSERT INTO public.order_status_history VALUES (386, 83, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-27 17:12:49.043+00');
INSERT INTO public.order_status_history VALUES (387, 84, NULL, 'pending', 'Pedido creado', 3, '2025-07-31 18:52:57.631+00');
INSERT INTO public.order_status_history VALUES (388, 84, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-31 19:52:57.631+00');
INSERT INTO public.order_status_history VALUES (389, 84, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-31 21:52:57.631+00');
INSERT INTO public.order_status_history VALUES (390, 84, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-01 04:52:57.631+00');
INSERT INTO public.order_status_history VALUES (391, 84, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-01 10:52:57.631+00');
INSERT INTO public.order_status_history VALUES (392, 85, NULL, 'pending', 'Pedido creado', 3, '2025-07-31 23:35:32.669+00');
INSERT INTO public.order_status_history VALUES (393, 85, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-01 01:35:32.669+00');
INSERT INTO public.order_status_history VALUES (394, 85, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-01 02:35:32.669+00');
INSERT INTO public.order_status_history VALUES (395, 85, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-01 13:35:32.669+00');
INSERT INTO public.order_status_history VALUES (396, 86, NULL, 'pending', 'Pedido creado', 3, '2025-08-19 03:15:35.232+00');
INSERT INTO public.order_status_history VALUES (397, 86, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-19 04:15:35.232+00');
INSERT INTO public.order_status_history VALUES (398, 86, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-19 05:15:35.232+00');
INSERT INTO public.order_status_history VALUES (399, 86, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-19 10:15:35.232+00');
INSERT INTO public.order_status_history VALUES (400, 86, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-20 03:15:35.232+00');
INSERT INTO public.order_status_history VALUES (401, 87, NULL, 'pending', 'Pedido creado', 3, '2025-08-19 15:01:18.202+00');
INSERT INTO public.order_status_history VALUES (402, 87, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-19 17:01:18.202+00');
INSERT INTO public.order_status_history VALUES (403, 87, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-19 19:01:18.202+00');
INSERT INTO public.order_status_history VALUES (404, 87, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-20 00:01:18.202+00');
INSERT INTO public.order_status_history VALUES (405, 87, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-20 12:01:18.202+00');
INSERT INTO public.order_status_history VALUES (406, 88, NULL, 'pending', 'Pedido creado', 3, '2025-09-07 22:33:50.158+00');
INSERT INTO public.order_status_history VALUES (407, 88, 'pending', 'cancelled', 'Cliente no respondió', 3, '2025-09-08 04:33:50.158+00');
INSERT INTO public.order_status_history VALUES (408, 89, NULL, 'pending', 'Pedido creado', 3, '2025-08-15 00:01:01.715+00');
INSERT INTO public.order_status_history VALUES (409, 89, 'pending', 'verified', 'Pago confirmado', 3, '2025-08-15 01:01:01.715+00');
INSERT INTO public.order_status_history VALUES (410, 89, 'verified', 'preparing', 'Preparando pedido', 3, '2025-08-15 02:01:01.715+00');
INSERT INTO public.order_status_history VALUES (411, 89, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-15 11:01:01.715+00');
INSERT INTO public.order_status_history VALUES (412, 89, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-15 21:01:01.715+00');
INSERT INTO public.order_status_history VALUES (413, 90, NULL, 'pending', 'Pedido creado', 3, '2025-09-13 04:35:02.922+00');
INSERT INTO public.order_status_history VALUES (414, 90, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-13 05:35:02.922+00');
INSERT INTO public.order_status_history VALUES (415, 90, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-13 07:35:02.922+00');
INSERT INTO public.order_status_history VALUES (416, 90, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-13 10:35:02.922+00');
INSERT INTO public.order_status_history VALUES (417, 90, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-14 00:35:02.922+00');
INSERT INTO public.order_status_history VALUES (418, 91, NULL, 'pending', 'Pedido creado', 3, '2025-07-24 14:31:52.774+00');
INSERT INTO public.order_status_history VALUES (419, 91, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-24 15:31:52.774+00');
INSERT INTO public.order_status_history VALUES (420, 91, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-24 16:31:52.774+00');
INSERT INTO public.order_status_history VALUES (421, 91, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-24 22:31:52.774+00');
INSERT INTO public.order_status_history VALUES (422, 91, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-25 21:31:52.774+00');
INSERT INTO public.order_status_history VALUES (423, 92, NULL, 'pending', 'Pedido creado', 3, '2025-07-10 12:54:42.648+00');
INSERT INTO public.order_status_history VALUES (424, 92, 'pending', 'cancelled', 'Cliente canceló el pedido', 3, '2025-07-10 16:54:42.648+00');
INSERT INTO public.order_status_history VALUES (425, 93, NULL, 'pending', 'Pedido creado', 3, '2025-08-08 10:17:17.883+00');
INSERT INTO public.order_status_history VALUES (426, 93, 'pending', 'cancelled', 'Producto no disponible', 3, '2025-08-08 13:17:17.883+00');
INSERT INTO public.order_status_history VALUES (427, 94, NULL, 'pending', 'Pedido creado', 3, '2025-09-15 01:39:25.251+00');
INSERT INTO public.order_status_history VALUES (428, 94, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-15 02:39:25.251+00');
INSERT INTO public.order_status_history VALUES (429, 94, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-15 03:39:25.251+00');
INSERT INTO public.order_status_history VALUES (430, 94, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-15 10:39:25.251+00');
INSERT INTO public.order_status_history VALUES (431, 95, NULL, 'pending', 'Pedido creado', 3, '2025-07-31 16:32:20.302+00');
INSERT INTO public.order_status_history VALUES (432, 95, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-31 19:32:20.302+00');
INSERT INTO public.order_status_history VALUES (433, 95, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-31 22:32:20.302+00');
INSERT INTO public.order_status_history VALUES (434, 95, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-08-01 02:32:20.302+00');
INSERT INTO public.order_status_history VALUES (435, 95, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-08-01 12:32:20.302+00');
INSERT INTO public.order_status_history VALUES (436, 96, NULL, 'pending', 'Pedido creado', 3, '2025-07-28 21:29:11.478+00');
INSERT INTO public.order_status_history VALUES (437, 96, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-28 23:29:11.478+00');
INSERT INTO public.order_status_history VALUES (438, 96, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-29 02:29:11.478+00');
INSERT INTO public.order_status_history VALUES (439, 96, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-29 13:29:11.478+00');
INSERT INTO public.order_status_history VALUES (440, 96, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-29 16:29:11.478+00');
INSERT INTO public.order_status_history VALUES (441, 97, NULL, 'pending', 'Pedido creado', 3, '2025-09-04 09:25:02.849+00');
INSERT INTO public.order_status_history VALUES (442, 97, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-04 12:25:02.849+00');
INSERT INTO public.order_status_history VALUES (443, 97, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-04 13:25:02.849+00');
INSERT INTO public.order_status_history VALUES (444, 97, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-04 19:25:02.849+00');
INSERT INTO public.order_status_history VALUES (445, 97, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-05 13:25:02.849+00');
INSERT INTO public.order_status_history VALUES (446, 98, NULL, 'pending', 'Pedido creado', 3, '2025-09-15 20:58:16.907+00');
INSERT INTO public.order_status_history VALUES (447, 98, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-16 01:58:16.907+00');
INSERT INTO public.order_status_history VALUES (448, 98, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-16 02:58:16.907+00');
INSERT INTO public.order_status_history VALUES (449, 98, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-16 09:58:16.907+00');
INSERT INTO public.order_status_history VALUES (450, 98, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-16 13:58:16.907+00');
INSERT INTO public.order_status_history VALUES (451, 99, NULL, 'pending', 'Pedido creado', 3, '2025-09-14 04:39:37.406+00');
INSERT INTO public.order_status_history VALUES (452, 99, 'pending', 'verified', 'Pago confirmado', 3, '2025-09-14 10:39:37.406+00');
INSERT INTO public.order_status_history VALUES (453, 99, 'verified', 'preparing', 'Preparando pedido', 3, '2025-09-14 11:39:37.406+00');
INSERT INTO public.order_status_history VALUES (454, 99, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-09-14 18:39:37.406+00');
INSERT INTO public.order_status_history VALUES (455, 99, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-09-15 18:39:37.406+00');
INSERT INTO public.order_status_history VALUES (456, 100, NULL, 'pending', 'Pedido creado', 3, '2025-07-21 02:10:44.507+00');
INSERT INTO public.order_status_history VALUES (457, 100, 'pending', 'verified', 'Pago confirmado', 3, '2025-07-21 05:10:44.507+00');
INSERT INTO public.order_status_history VALUES (458, 100, 'verified', 'preparing', 'Preparando pedido', 3, '2025-07-21 07:10:44.507+00');
INSERT INTO public.order_status_history VALUES (459, 100, 'preparing', 'shipped', 'Pedido enviado', 3, '2025-07-21 09:10:44.507+00');
INSERT INTO public.order_status_history VALUES (460, 100, 'shipped', 'delivered', 'Pedido entregado exitosamente', 3, '2025-07-22 08:10:44.507+00');


--
-- TOC entry 3952 (class 0 OID 32093)
-- Dependencies: 360
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders VALUES (1, 3, 'rosa_silva@gmail.com', 'Rosa Silva', '+58 412-367-8917', 'Urbanización Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-12', '15:00-18:00', '', 'delivered', 390.93, 14249.40, 36.450000, 'Cumpleaños', NULL, '2025-09-11 20:26:51.107+00', '2025-09-11 20:26:51.107+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (2, 3, 'eduardosuarez@gmail.com', 'Eduardo Suárez', '+58 424-632-7423', 'Centro Plaza, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-09-29', '12:00-15:00', '', 'delivered', 123.97, 4518.71, 36.450000, 'Regalo', NULL, '2025-09-26 13:50:09.082+00', '2025-09-26 13:50:09.082+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (3, 3, 'roberto_ramos@hotmail.com', 'Roberto Ramos', '+58 424-629-7263', 'Los Dos Caminos, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-07-29', '09:00-12:00', 'Torre A, piso 5', 'delivered', 68.99, 2514.69, 36.450000, 'Ocasión especial', NULL, '2025-07-23 23:06:46.235+00', '2025-07-23 23:06:46.235+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (4, 3, 'alejandro_salazar@hotmail.com', 'Alejandro Salazar', '+58 416-383-3934', 'Av. Libertador, Altamira, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-08-22', '12:00-15:00', '', 'delivered', 124.97, 4555.16, 36.450000, 'Regalo', NULL, '2025-08-21 21:14:48.22+00', '2025-08-21 21:14:48.22+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (5, 3, 'antonio77@outlook.com', 'Antonio Castro', '+58 426-723-9062', 'Centro Comercial Sambil, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-09-27', '12:00-15:00', '', 'delivered', 206.97, 7544.06, 36.450000, 'Cumpleaños', NULL, '2025-09-21 11:08:59.899+00', '2025-09-21 11:08:59.899+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (6, 3, 'gabrielagutierrez@hotmail.com', 'Gabriela Gutiérrez', '+58 414-411-9937', 'Carretera Baruta-El Hatillo, Miranda', 'Miranda', 'Miranda', '1060', '2025-08-09', '15:00-18:00', 'Torre A, piso 5', 'delivered', 308.94, 11260.86, 36.450000, 'Aniversario', NULL, '2025-08-07 20:37:53.802+00', '2025-08-07 20:37:53.802+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (7, 3, 'jose15@hotmail.com', 'José Gutiérrez', '+58 412-403-8432', 'Av. Principal de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-19', '12:00-15:00', 'Torre A, piso 5', 'delivered', 98.97, 3607.46, 36.450000, 'Cumpleaños', NULL, '2025-07-15 00:25:31.396+00', '2025-07-15 00:25:31.396+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (8, 3, 'diegomendoza@outlook.com', 'Diego Mendoza', '+58 414-197-6103', 'Calle Paris, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-07-27', '12:00-15:00', 'Torre A, piso 5', 'delivered', 98.97, 3607.46, 36.450000, '', NULL, '2025-07-22 21:52:12.409+00', '2025-07-22 21:52:12.409+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (9, 3, 'ricardoperez@hotmail.com', 'Ricardo Pérez', '+58 412-189-5739', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '', '2025-08-12', '09:00-12:00', 'Llamar al llegar', 'delivered', 128.97, 4700.96, 36.450000, '', NULL, '2025-08-11 01:18:32.569+00', '2025-08-11 01:18:32.569+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (10, 3, 'isabelortiz@hotmail.com', 'Isabel Ortiz', '+58 414-223-4081', 'Urbanización Colinas de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-01', '', 'Torre A, piso 5', 'delivered', 183.95, 6704.98, 36.450000, 'Ocasión especial', NULL, '2025-07-27 23:49:02.097+00', '2025-07-27 23:49:02.097+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (11, 3, 'rafaelvasquez@hotmail.com', 'Rafael Vásquez', '+58 426-586-3274', 'Los Ruices, Miranda', 'Miranda', 'Miranda', '1070', '2025-10-08', '12:00-15:00', 'Llamar al llegar', 'verified', 391.92, 14285.48, 36.450000, '', NULL, '2025-10-01 21:48:02.563+00', '2025-10-01 21:48:02.563+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (12, 3, 'antonio_jimenez@yahoo.com', 'Antonio Jiménez', '+58 416-535-1560', 'Av. Francisco de Miranda, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-22', '09:00-12:00', '', 'delivered', 59.98, 2186.27, 36.450000, 'Ocasión especial', NULL, '2025-08-16 05:29:44.484+00', '2025-08-16 05:29:44.484+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (13, 3, 'valentina.ortiz@yahoo.com', 'Valentina Ortiz', '+58 424-314-4357', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-03', '15:00-18:00', 'Llamar al llegar', 'delivered', 99.98, 3644.27, 36.450000, 'Ocasión especial', NULL, '2025-07-31 05:33:25.657+00', '2025-07-31 05:33:25.657+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (14, 3, 'ricardo14@gmail.com', 'Ricardo Martínez', '+58 414-790-1514', 'Av. Orinoco, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-12', '15:00-18:00', 'Torre A, piso 5', 'cancelled', 351.92, 12827.48, 36.450000, 'Aniversario', NULL, '2025-07-09 08:15:15.268+00', '2025-07-09 08:15:15.268+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (15, 3, 'miguel80@gmail.com', 'Miguel Sánchez', '+58 414-997-1396', 'Av. Abraham Lincoln, Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-07-30', '15:00-18:00', 'Torre A, piso 5', 'delivered', 279.93, 10203.45, 36.450000, '', NULL, '2025-07-23 13:05:09.814+00', '2025-07-23 13:05:09.814+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (16, 3, 'jose23@gmail.com', 'José Sánchez', '+58 412-513-1959', 'Urbanización La Florida, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-26', '12:00-15:00', '', 'cancelled', 137.98, 5029.37, 36.450000, 'Regalo', NULL, '2025-09-20 12:58:42.739+00', '2025-09-20 12:58:42.739+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (17, 3, 'ricardo.martinez@yahoo.com', 'Ricardo Martínez', '+58 426-450-2665', 'Av. Andrés Bello, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-07-23', '12:00-15:00', 'Torre A, piso 5', 'delivered', 29.99, 1093.14, 36.450000, 'Ocasión especial', NULL, '2025-07-18 18:59:42.195+00', '2025-07-18 18:59:42.195+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (18, 3, 'victoria.gutierrez@gmail.com', 'Victoria Gutiérrez', '+58 416-345-4566', 'Lomas de La Lagunita, Miranda', 'Miranda', 'Miranda', '1070', '2025-09-07', '09:00-12:00', 'Llamar al llegar', 'delivered', 118.97, 4336.46, 36.450000, 'Regalo', NULL, '2025-09-03 14:38:20.853+00', '2025-09-03 14:38:20.853+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (19, 3, 'carmen69@gmail.com', 'Carmen Fernández', '+58 416-754-1086', 'Urbanización Colinas de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-30', '15:00-18:00', 'Torre A, piso 5', 'delivered', 386.93, 14103.60, 36.450000, 'Regalo', NULL, '2025-07-23 10:20:40.615+00', '2025-07-23 10:20:40.615+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (20, 3, 'manuel86@gmail.com', 'Manuel Silva', '+58 426-536-3656', 'Urbanización La Trinidad, Miranda', 'Miranda', 'Miranda', '1040', '2025-09-21', '12:00-15:00', 'Dejar con portero', 'delivered', 99.98, 3644.27, 36.450000, 'Regalo', NULL, '2025-09-14 12:18:48.498+00', '2025-09-14 12:18:48.498+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (21, 3, 'jose.suarez@hotmail.com', 'José Suárez', '+58 414-432-6689', 'Urbanización La Trinidad, Miranda', 'Miranda', 'Miranda', '1040', '2025-08-11', '', 'Dejar con portero', 'delivered', 110.97, 4044.86, 36.450000, '', NULL, '2025-08-07 04:11:43.35+00', '2025-08-07 04:11:43.35+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (22, 3, 'antonio56@gmail.com', 'Antonio Vargas', '+58 416-859-3062', 'Calle Madrid, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-05', '', 'Dejar con portero', 'delivered', 105.98, 3862.97, 36.450000, 'Cumpleaños', NULL, '2025-08-03 14:50:54.543+00', '2025-08-03 14:50:54.543+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (23, 3, 'carmen84@gmail.com', 'Carmen Romero', '+58 424-954-2940', 'Centro Plaza, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-07-30', '15:00-18:00', '', 'delivered', 465.92, 16982.78, 36.450000, 'Regalo', NULL, '2025-07-29 23:38:15.874+00', '2025-07-29 23:38:15.874+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (24, 3, 'victoria_ramirez@outlook.com', 'Victoria Ramírez', '+58 414-928-5583', 'Residencias El Rosal, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-07-23', '12:00-15:00', 'Dejar con portero', 'delivered', 128.97, 4700.96, 36.450000, 'Aniversario', NULL, '2025-07-20 16:28:28.299+00', '2025-07-20 16:28:28.299+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (25, 3, 'isabella_jimenez@outlook.com', 'Isabella Jiménez', '+58 414-778-7405', 'Urbanización La Florida, Caracas', 'Caracas', 'Distrito Capital', '', '2025-08-09', '12:00-15:00', 'Llamar al llegar', 'delivered', 262.95, 9584.53, 36.450000, '', NULL, '2025-08-06 11:27:09.962+00', '2025-08-06 11:27:09.962+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (26, 3, 'sofia.suarez@yahoo.com', 'Sofía Suárez', '+58 412-808-6592', 'Residencias El Rosal, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-08-03', '15:00-18:00', 'Torre A, piso 5', 'delivered', 247.94, 9037.41, 36.450000, 'Ocasión especial', NULL, '2025-07-28 03:08:15.885+00', '2025-07-28 03:08:15.885+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (27, 3, 'luciagarcia@gmail.com', 'Lucía García', '+58 416-689-4734', 'Urbanización Santa Fe Norte, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-08-28', '', 'Torre A, piso 5', 'delivered', 220.95, 8053.63, 36.450000, 'Regalo', NULL, '2025-08-23 09:58:00.276+00', '2025-08-23 09:58:00.276+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (28, 3, 'maria.alvarez@yahoo.com', 'María Álvarez', '+58 412-301-2735', 'Urbanización La Florida, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-10-07', '12:00-15:00', '', 'shipped', 158.97, 5794.46, 36.450000, '', NULL, '2025-10-02 04:17:57.106+00', '2025-10-02 04:17:57.106+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (29, 3, 'ricardo_ortiz@gmail.com', 'Ricardo Ortiz', '+58 414-627-1036', 'Lomas de La Lagunita, Miranda', 'Miranda', 'Miranda', '', '2025-09-07', '15:00-18:00', 'Llamar al llegar', 'delivered', 99.98, 3644.27, 36.450000, 'Ocasión especial', NULL, '2025-09-05 05:52:49.629+00', '2025-09-05 05:52:49.629+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (30, 3, 'luis_gutierrez@outlook.com', 'Luis Gutiérrez', '+58 412-610-2551', 'Av. Luis Roche, Altamira, Caracas', 'Caracas', 'Distrito Capital', '', '2025-07-20', '15:00-18:00', 'Llamar al llegar', 'delivered', 42.99, 1566.99, 36.450000, 'Cumpleaños', NULL, '2025-07-13 09:35:18.171+00', '2025-07-13 09:35:18.171+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (31, 3, 'victoriafernandez@outlook.com', 'Victoria Fernández', '+58 416-915-0930', 'Av. Abraham Lincoln, Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-08-07', '12:00-15:00', '', 'delivered', 194.95, 7105.93, 36.450000, 'Cumpleaños', NULL, '2025-08-06 20:17:59.744+00', '2025-08-06 20:17:59.744+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (32, 3, 'paula19@gmail.com', 'Paula Ramírez', '+58 424-915-5069', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-28', '09:00-12:00', 'Dejar con portero', 'cancelled', 65.98, 2404.97, 36.450000, '', NULL, '2025-08-21 11:51:03.455+00', '2025-08-21 11:51:03.455+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (33, 3, 'manuel40@gmail.com', 'Manuel Gutiérrez', '+58 426-572-7944', 'Los Ruices, Miranda', 'Miranda', 'Miranda', '1080', '2025-08-18', '', 'Llamar al llegar', 'delivered', 167.95, 6121.78, 36.450000, 'Aniversario', NULL, '2025-08-17 18:18:24.377+00', '2025-08-17 18:18:24.377+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (34, 3, 'antonio_vasquez@yahoo.com', 'Antonio Vásquez', '+58 416-973-6757', 'Los Dos Caminos, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-08-18', '09:00-12:00', 'Dejar con portero', 'cancelled', 225.96, 8236.24, 36.450000, 'Regalo', NULL, '2025-08-11 12:31:36.925+00', '2025-08-11 12:31:36.925+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (35, 3, 'anasanchez@yahoo.com', 'Ana Sánchez', '+58 414-871-5601', 'Av. Orinoco, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-27', '15:00-18:00', '', 'delivered', 288.93, 10531.50, 36.450000, 'Aniversario', NULL, '2025-08-21 21:34:40.406+00', '2025-08-21 21:34:40.406+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (36, 3, 'mariarojas@outlook.com', 'María Rojas', '+58 412-791-9490', 'Av. Andrés Bello, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-09-04', '', 'Llamar al llegar', 'cancelled', 187.95, 6850.78, 36.450000, 'Ocasión especial', NULL, '2025-08-31 13:57:18.308+00', '2025-08-31 13:57:18.308+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (37, 3, 'diego39@gmail.com', 'Diego Castro', '+58 424-602-2264', 'Centro Comercial San Ignacio, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-18', '15:00-18:00', 'Dejar con portero', 'delivered', 206.97, 7544.06, 36.450000, 'Cumpleaños', NULL, '2025-07-14 17:20:43.647+00', '2025-07-14 17:20:43.647+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (38, 3, 'ricardo_perez@outlook.com', 'Ricardo Pérez', '+58 412-352-9487', 'Urbanización Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-09-21', '12:00-15:00', 'Llamar al llegar', 'delivered', 357.93, 13046.55, 36.450000, 'Regalo', NULL, '2025-09-17 13:46:15.092+00', '2025-09-17 13:46:15.092+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (39, 3, 'robertomendoza@outlook.com', 'Roberto Mendoza', '+58 416-773-4221', 'Av. Orinoco, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-08-25', '09:00-12:00', '', 'delivered', 147.97, 5393.51, 36.450000, 'Ocasión especial', NULL, '2025-08-22 10:45:13.786+00', '2025-08-22 10:45:13.786+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (40, 3, 'carlosalvarez@gmail.com', 'Carlos Álvarez', '+58 414-989-8478', 'Parque Cristal, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-07-27', '09:00-12:00', 'Llamar al llegar', 'delivered', 112.97, 4117.76, 36.450000, 'Ocasión especial', NULL, '2025-07-26 09:56:43.681+00', '2025-07-26 09:56:43.681+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (41, 3, 'daniela.hernandez@hotmail.com', 'Daniela Hernández', '+58 412-638-1067', 'Calle Principal de Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-09-15', '12:00-15:00', 'Torre A, piso 5', 'delivered', 178.97, 6523.46, 36.450000, 'Regalo', NULL, '2025-09-10 16:16:32.169+00', '2025-09-10 16:16:32.169+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (42, 3, 'sofia_lopez@yahoo.com', 'Sofía López', '+58 424-939-8363', 'Los Ruices, Miranda', 'Miranda', 'Miranda', '1070', '2025-09-01', '12:00-15:00', '', 'delivered', 137.97, 5029.01, 36.450000, 'Ocasión especial', NULL, '2025-08-28 13:08:01.324+00', '2025-08-28 13:08:01.324+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (43, 3, 'daniela27@outlook.com', 'Daniela Ramírez', '+58 412-487-3765', 'Av. Principal de La Castellana, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-09-27', '', 'Torre A, piso 5', 'delivered', 257.94, 9401.91, 36.450000, 'Ocasión especial', NULL, '2025-09-25 19:20:35.688+00', '2025-09-25 19:20:35.688+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (44, 3, 'miguel33@hotmail.com', 'Miguel Rodríguez', '+58 424-435-6918', 'Residencias El Rosal, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-11', '09:00-12:00', 'Torre A, piso 5', 'delivered', 220.95, 8053.63, 36.450000, 'Cumpleaños', NULL, '2025-08-07 03:11:36.248+00', '2025-08-07 03:11:36.248+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (45, 3, 'rafael_fernandez@gmail.com', 'Rafael Fernández', '+58 424-870-5876', 'Los Ruices, Miranda', 'Miranda', 'Miranda', '1060', '2025-08-24', '15:00-18:00', '', 'delivered', 292.95, 10678.03, 36.450000, 'Cumpleaños', NULL, '2025-08-21 15:46:16.255+00', '2025-08-21 15:46:16.255+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (46, 3, 'gabrielaramirez@gmail.com', 'Gabriela Ramírez', '+58 412-282-7026', 'Lomas de La Lagunita, Miranda', 'Miranda', 'Miranda', '1070', '2025-08-04', '09:00-12:00', '', 'delivered', 178.96, 6523.09, 36.450000, 'Aniversario', NULL, '2025-07-29 00:23:43.35+00', '2025-07-29 00:23:43.35+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (47, 3, 'valentinasilva@hotmail.com', 'Valentina Silva', '+58 424-911-4046', 'Av. Principal de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-09-12', '', 'Llamar al llegar', 'shipped', 395.93, 14431.65, 36.450000, 'Regalo', NULL, '2025-09-11 08:28:00.466+00', '2025-09-11 08:28:00.466+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (48, 3, 'eduardo28@yahoo.com', 'Eduardo Ramos', '+58 416-784-7858', 'Av. Principal de Chuao, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-28', '', '', 'delivered', 138.96, 5065.09, 36.450000, '', NULL, '2025-09-26 06:04:32.588+00', '2025-09-26 06:04:32.588+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (49, 3, 'fernando_medina@yahoo.com', 'Fernando Medina', '+58 426-664-7322', 'Calle Los Samanes, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '', '2025-08-06', '', 'Torre A, piso 5', 'delivered', 275.92, 10057.28, 36.450000, 'Regalo', NULL, '2025-07-30 16:06:15.465+00', '2025-07-30 16:06:15.465+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (50, 3, 'pedrogarcia@hotmail.com', 'Pedro García', '+58 412-893-8952', 'Av. Francisco de Miranda, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-09-19', '09:00-12:00', '', 'delivered', 78.98, 2878.82, 36.450000, '', NULL, '2025-09-16 13:18:09.882+00', '2025-09-16 13:18:09.882+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (51, 3, 'valentinavargas@hotmail.com', 'Valentina Vargas', '+58 424-202-9250', 'Centro Comercial San Ignacio, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-09-05', '09:00-12:00', 'Dejar con portero', 'shipped', 191.96, 6996.94, 36.450000, 'Aniversario', NULL, '2025-08-29 02:40:04.458+00', '2025-08-29 02:40:04.458+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (52, 3, 'sofia_rodriguez@hotmail.com', 'Sofía Rodríguez', '+58 414-257-6527', 'Urbanización Colinas de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-06', '15:00-18:00', '', 'delivered', 336.94, 12281.46, 36.450000, '', NULL, '2025-09-05 08:19:04.545+00', '2025-09-05 08:19:04.545+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (53, 3, 'elenahernandez@gmail.com', 'Elena Hernández', '+58 416-770-0780', 'Los Ruices, Miranda', 'Miranda', 'Miranda', '1050', '2025-07-16', '', '', 'delivered', 363.93, 13265.25, 36.450000, 'Cumpleaños', NULL, '2025-07-10 03:32:24.417+00', '2025-07-10 03:32:24.417+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (54, 3, 'eduardo_alvarez@gmail.com', 'Eduardo Álvarez', '+58 426-837-7746', 'Urbanización Colinas de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-09', '12:00-15:00', 'Dejar con portero', 'delivered', 138.96, 5065.09, 36.450000, 'Aniversario', NULL, '2025-09-08 15:49:21.526+00', '2025-09-08 15:49:21.526+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (55, 3, 'pedrojimenez@yahoo.com', 'Pedro Jiménez', '+58 414-277-6864', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '', '2025-10-06', '15:00-18:00', 'Dejar con portero', 'verified', 206.97, 7544.06, 36.450000, 'Ocasión especial', NULL, '2025-10-02 09:58:39.515+00', '2025-10-02 09:58:39.515+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (56, 3, 'ricardo65@yahoo.com', 'Ricardo Gutiérrez', '+58 426-611-5863', 'Urbanización La Florida, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-09-20', '15:00-18:00', 'Dejar con portero', 'delivered', 182.95, 6668.53, 36.450000, 'Aniversario', NULL, '2025-09-17 00:45:55.06+00', '2025-09-17 00:45:55.06+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (57, 3, 'manuel_torres@outlook.com', 'Manuel Torres', '+58 412-461-8293', 'Residencias El Rosal, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-07-13', '12:00-15:00', '', 'delivered', 158.97, 5794.46, 36.450000, 'Aniversario', NULL, '2025-07-10 13:22:38.319+00', '2025-07-10 13:22:38.319+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (58, 3, 'marianamedina@outlook.com', 'Mariana Medina', '+58 412-710-8400', 'Calle Principal de Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-08-05', '', 'Torre A, piso 5', 'delivered', 256.96, 9366.19, 36.450000, '', NULL, '2025-08-02 19:51:11.879+00', '2025-08-02 19:51:11.879+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (59, 3, 'daniela78@hotmail.com', 'Daniela Salazar', '+58 426-251-4061', 'Calle Real de Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-09-26', '', 'Llamar al llegar', 'delivered', 262.95, 9584.53, 36.450000, 'Regalo', NULL, '2025-09-23 06:45:37.612+00', '2025-09-23 06:45:37.612+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (60, 3, 'roberto.vasquez@hotmail.com', 'Roberto Vásquez', '+58 412-391-6811', 'Centro Plaza, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '', '2025-07-31', '15:00-18:00', '', 'shipped', 351.92, 12827.48, 36.450000, '', NULL, '2025-07-30 11:20:35.4+00', '2025-07-30 11:20:35.4+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (61, 3, 'elena58@hotmail.com', 'Elena Silva', '+58 424-336-2866', 'Urbanización La Florida, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-08-01', '12:00-15:00', 'Torre A, piso 5', 'delivered', 335.92, 12244.28, 36.450000, 'Cumpleaños', NULL, '2025-07-28 04:00:14.854+00', '2025-07-28 04:00:14.854+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (62, 3, 'andres_medina@gmail.com', 'Andrés Medina', '+58 416-270-5586', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-10-03', '12:00-15:00', 'Dejar con portero', 'shipped', 68.99, 2514.69, 36.450000, 'Ocasión especial', NULL, '2025-10-02 18:44:56.212+00', '2025-10-02 18:44:56.212+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (63, 3, 'gabriela.gonzalez@outlook.com', 'Gabriela González', '+58 414-867-0825', 'Centro Comercial San Ignacio, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-07-16', '09:00-12:00', 'Dejar con portero', 'delivered', 105.98, 3862.97, 36.450000, 'Ocasión especial', NULL, '2025-07-13 20:57:20.391+00', '2025-07-13 20:57:20.391+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (64, 3, 'victoria.silva@outlook.com', 'Victoria Silva', '+58 412-975-8963', 'Carretera Baruta-El Hatillo, Miranda', 'Miranda', 'Miranda', '1080', '2025-08-09', '12:00-15:00', 'Torre A, piso 5', 'delivered', 167.97, 6122.51, 36.450000, 'Aniversario', NULL, '2025-08-04 22:31:15.81+00', '2025-08-04 22:31:15.81+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (65, 3, 'maria.garcia@gmail.com', 'María García', '+58 412-113-6608', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-26', '09:00-12:00', 'Llamar al llegar', 'cancelled', 78.98, 2878.82, 36.450000, 'Regalo', NULL, '2025-07-23 11:21:19.001+00', '2025-07-23 11:21:19.001+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (66, 3, 'isabelfernandez@outlook.com', 'Isabel Fernández', '+58 416-159-3826', 'Urbanización Colinas de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-09-07', '09:00-12:00', '', 'delivered', 224.95, 8199.43, 36.450000, 'Aniversario', NULL, '2025-09-02 15:45:54.054+00', '2025-09-02 15:45:54.054+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (67, 3, 'eduardo_ramirez@gmail.com', 'Eduardo Ramírez', '+58 424-229-7978', 'Av. Principal de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-08-10', '09:00-12:00', 'Torre A, piso 5', 'delivered', 145.98, 5320.97, 36.450000, '', NULL, '2025-08-04 23:03:46.06+00', '2025-08-04 23:03:46.06+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (68, 3, 'javiertorres@outlook.com', 'Javier Torres', '+58 414-104-1452', 'Centro Comercial Sambil, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-08-15', '15:00-18:00', 'Dejar con portero', 'delivered', 95.98, 3498.47, 36.450000, '', NULL, '2025-08-09 02:23:14.404+00', '2025-08-09 02:23:14.404+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (69, 3, 'luis.hernandez@yahoo.com', 'Luis Hernández', '+58 424-286-9560', 'Residencias El Rosal, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-08-03', '15:00-18:00', 'Torre A, piso 5', 'delivered', 268.95, 9803.23, 36.450000, 'Regalo', NULL, '2025-08-02 02:12:24.965+00', '2025-08-02 02:12:24.965+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (70, 3, 'javierrojas@yahoo.com', 'Javier Rojas', '+58 426-364-6499', 'Av. Francisco de Miranda, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-29', '12:00-15:00', 'Llamar al llegar', 'delivered', 288.94, 10531.86, 36.450000, 'Aniversario', NULL, '2025-07-24 05:20:43.353+00', '2025-07-24 05:20:43.353+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (71, 3, 'andrea.martinez@gmail.com', 'Andrea Martínez', '+58 424-839-0773', 'Los Ruices, Miranda', 'Miranda', 'Miranda', '1080', '2025-08-20', '09:00-12:00', '', 'delivered', 229.95, 8381.68, 36.450000, 'Ocasión especial', NULL, '2025-08-13 09:40:00.88+00', '2025-08-13 09:40:00.88+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (72, 3, 'sofia.vasquez@outlook.com', 'Sofía Vásquez', '+58 424-394-4159', 'Centro Comercial Sambil, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-08-02', '', 'Llamar al llegar', 'delivered', 68.99, 2514.69, 36.450000, 'Aniversario', NULL, '2025-07-31 07:11:19.764+00', '2025-07-31 07:11:19.764+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (73, 3, 'elena.salazar@yahoo.com', 'Elena Salazar', '+58 412-966-9245', 'Urbanización La Florida, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-07-13', '15:00-18:00', 'Dejar con portero', 'delivered', 236.93, 8636.10, 36.450000, 'Regalo', NULL, '2025-07-08 15:01:27.846+00', '2025-07-08 15:01:27.846+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (74, 3, 'lauramendoza@hotmail.com', 'Laura Mendoza', '+58 414-624-0024', 'Centro Plaza, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-10', '', '', 'delivered', 379.93, 13848.45, 36.450000, 'Aniversario', NULL, '2025-09-05 08:36:05.264+00', '2025-09-05 08:36:05.264+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (75, 3, 'rosaromero@hotmail.com', 'Rosa Romero', '+58 416-704-3163', 'Av. Abraham Lincoln, Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-29', '09:00-12:00', 'Llamar al llegar', 'delivered', 258.96, 9439.09, 36.450000, 'Regalo', NULL, '2025-07-25 20:03:30.156+00', '2025-07-25 20:03:30.156+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (76, 3, 'manuelmorales@yahoo.com', 'Manuel Morales', '+58 416-527-5546', 'Av. Libertador, Altamira, Caracas', 'Caracas', 'Distrito Capital', '', '2025-08-20', '09:00-12:00', 'Torre A, piso 5', 'delivered', 314.94, 11479.56, 36.450000, 'Aniversario', NULL, '2025-08-13 13:31:11.796+00', '2025-08-13 13:31:11.796+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (77, 3, 'alejandro_ortiz@outlook.com', 'Alejandro Ortiz', '+58 414-190-0991', 'Los Dos Caminos, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-13', '12:00-15:00', '', 'delivered', 290.93, 10604.40, 36.450000, 'Aniversario', NULL, '2025-07-08 22:53:43.895+00', '2025-07-08 22:53:43.895+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (78, 3, 'rafael99@gmail.com', 'Rafael Rodríguez', '+58 416-462-3475', 'Urbanización Santa Fe Norte, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-09-04', '', 'Dejar con portero', 'delivered', 287.94, 10495.41, 36.450000, '', NULL, '2025-08-31 02:38:30.247+00', '2025-08-31 02:38:30.247+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (79, 3, 'carlos_castro@yahoo.com', 'Carlos Castro', '+58 414-482-8119', 'Av. Francisco de Miranda, Chacao, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-07-08', '09:00-12:00', 'Llamar al llegar', 'delivered', 252.95, 9220.03, 36.450000, 'Cumpleaños', NULL, '2025-07-04 16:01:48.34+00', '2025-07-04 16:01:48.34+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (80, 3, 'luis.hernandez@outlook.com', 'Luis Hernández', '+58 412-549-2015', 'Centro Comercial San Ignacio, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-08-19', '09:00-12:00', 'Torre A, piso 5', 'delivered', 291.94, 10641.21, 36.450000, 'Ocasión especial', NULL, '2025-08-18 14:00:02.994+00', '2025-08-18 14:00:02.994+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (81, 3, 'carmen.fernandez@yahoo.com', 'Carmen Fernández', '+58 412-725-1966', 'Av. Andrés Bello, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-08-27', '', 'Dejar con portero', 'delivered', 429.92, 15670.58, 36.450000, 'Aniversario', NULL, '2025-08-20 20:26:40.15+00', '2025-08-20 20:26:40.15+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (82, 3, 'fernandoramirez@hotmail.com', 'Fernando Ramírez', '+58 412-762-8066', 'Av. Libertador, Altamira, Caracas', 'Caracas', 'Distrito Capital', '', '2025-10-02', '15:00-18:00', 'Llamar al llegar', 'delivered', 239.96, 8746.54, 36.450000, '', NULL, '2025-09-27 22:58:32.289+00', '2025-09-27 22:58:32.289+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (83, 3, 'rafael51@gmail.com', 'Rafael Romero', '+58 412-611-6357', 'Parque Cristal, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-09-27', '09:00-12:00', 'Dejar con portero', 'delivered', 45.99, 1676.34, 36.450000, 'Regalo', NULL, '2025-09-26 15:12:49.043+00', '2025-09-26 15:12:49.043+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (84, 3, 'daniela44@yahoo.com', 'Daniela Sánchez', '+58 426-672-4386', 'Los Dos Caminos, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-08-01', '15:00-18:00', '', 'delivered', 291.94, 10641.21, 36.450000, '', NULL, '2025-07-31 18:52:57.631+00', '2025-07-31 18:52:57.631+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (85, 3, 'luis23@gmail.com', 'Luis Fernández', '+58 412-162-8804', 'Urbanización La Trinidad, Miranda', 'Miranda', 'Miranda', '1060', '2025-08-04', '09:00-12:00', 'Dejar con portero', 'shipped', 129.96, 4737.04, 36.450000, 'Regalo', NULL, '2025-07-31 23:35:32.669+00', '2025-07-31 23:35:32.669+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (86, 3, 'victoria.lopez@yahoo.com', 'Victoria López', '+58 426-254-2078', 'Calle Real de Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '', '2025-08-21', '09:00-12:00', '', 'delivered', 49.99, 1822.14, 36.450000, '', NULL, '2025-08-19 03:15:35.232+00', '2025-08-19 03:15:35.232+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (87, 3, 'jorge47@hotmail.com', 'Jorge Ramos', '+58 416-890-3527', 'Calle Paris, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1040', '2025-08-22', '09:00-12:00', 'Torre A, piso 5', 'delivered', 29.99, 1093.14, 36.450000, 'Cumpleaños', NULL, '2025-08-19 15:01:18.202+00', '2025-08-19 15:01:18.202+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (88, 3, 'ricardo_ramirez@yahoo.com', 'Ricardo Ramírez', '+58 412-707-9479', 'Av. Abraham Lincoln, Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-09-13', '', 'Llamar al llegar', 'cancelled', 189.96, 6924.04, 36.450000, 'Ocasión especial', NULL, '2025-09-07 22:33:50.158+00', '2025-09-07 22:33:50.158+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (89, 3, 'diegovargas@yahoo.com', 'Diego Vargas', '+58 416-612-0588', 'Av. Abraham Lincoln, Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '1050', '2025-08-21', '12:00-15:00', 'Dejar con portero', 'delivered', 274.95, 10021.93, 36.450000, '', NULL, '2025-08-15 00:01:01.715+00', '2025-08-15 00:01:01.715+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (90, 3, 'luis.rodriguez@yahoo.com', 'Luis Rodríguez', '+58 412-763-0973', 'Urbanización La Trinidad, Miranda', 'Miranda', 'Miranda', '1060', '2025-09-15', '09:00-12:00', 'Dejar con portero', 'delivered', 125.98, 4591.97, 36.450000, 'Regalo', NULL, '2025-09-13 04:35:02.922+00', '2025-09-13 04:35:02.922+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (91, 3, 'isabelrodriguez@gmail.com', 'Isabel Rodríguez', '+58 424-432-9291', 'Urbanización Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-07-28', '15:00-18:00', '', 'delivered', 46.99, 1712.79, 36.450000, '', NULL, '2025-07-24 14:31:52.774+00', '2025-07-24 14:31:52.774+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (92, 3, 'valentinaalvarez@hotmail.com', 'Valentina Álvarez', '+58 416-413-5691', 'Lomas de La Lagunita, Miranda', 'Miranda', 'Miranda', '1040', '2025-07-13', '09:00-12:00', 'Llamar al llegar', 'cancelled', 55.99, 2040.84, 36.450000, '', NULL, '2025-07-10 12:54:42.648+00', '2025-07-10 12:54:42.648+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (93, 3, 'diegosanchez@yahoo.com', 'Diego Sánchez', '+58 426-879-7481', 'Av. Principal de Bello Monte, Caracas', 'Caracas', 'Distrito Capital', '', '2025-08-11', '09:00-12:00', 'Dejar con portero', 'cancelled', 59.98, 2186.27, 36.450000, 'Cumpleaños', NULL, '2025-08-08 10:17:17.883+00', '2025-08-08 10:17:17.883+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (94, 3, 'pedrorodriguez@gmail.com', 'Pedro Rodríguez', '+58 412-359-4199', 'Av. Abraham Lincoln, Sabana Grande, Caracas', 'Caracas', 'Distrito Capital', '', '2025-09-18', '09:00-12:00', '', 'shipped', 145.98, 5320.97, 36.450000, 'Cumpleaños', NULL, '2025-09-15 01:39:25.251+00', '2025-09-15 01:39:25.251+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (95, 3, 'javierjimenez@yahoo.com', 'Javier Jiménez', '+58 426-494-6634', 'Urbanización La Trinidad, Miranda', 'Miranda', 'Miranda', '1040', '2025-08-03', '15:00-18:00', 'Dejar con portero', 'delivered', 291.94, 10641.21, 36.450000, 'Ocasión especial', NULL, '2025-07-31 16:32:20.302+00', '2025-07-31 16:32:20.302+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (96, 3, 'daniela79@gmail.com', 'Daniela González', '+58 426-741-4765', 'Calle Paris, Las Mercedes, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-07-30', '15:00-18:00', 'Llamar al llegar', 'delivered', 68.99, 2514.69, 36.450000, 'Ocasión especial', NULL, '2025-07-28 21:29:11.478+00', '2025-07-28 21:29:11.478+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (97, 3, 'sofia.gonzalez@yahoo.com', 'Sofía González', '+58 412-608-3745', 'Calle Los Samanes, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1070', '2025-09-05', '15:00-18:00', 'Torre A, piso 5', 'delivered', 122.97, 4482.26, 36.450000, 'Aniversario', NULL, '2025-09-04 09:25:02.849+00', '2025-09-04 09:25:02.849+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (98, 3, 'andrea_rojas@yahoo.com', 'Andrea Rojas', '+58 424-886-5095', 'Calle Los Samanes, Los Palos Grandes, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-09-19', '12:00-15:00', 'Torre A, piso 5', 'delivered', 214.96, 7835.29, 36.450000, '', NULL, '2025-09-15 20:58:16.907+00', '2025-09-15 20:58:16.907+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (99, 3, 'pedro.perez@hotmail.com', 'Pedro Pérez', '+58 416-517-9829', 'Calle La Guairita, Chuao, Caracas', 'Caracas', 'Distrito Capital', '1060', '2025-09-17', '', 'Torre A, piso 5', 'delivered', 210.95, 7689.13, 36.450000, '', NULL, '2025-09-14 04:39:37.406+00', '2025-09-14 04:39:37.406+00', DEFAULT, DEFAULT);
INSERT INTO public.orders VALUES (100, 3, 'mariana_salazar@yahoo.com', 'Mariana Salazar', '+58 416-822-1402', 'Av. Luis Roche, Altamira, Caracas', 'Caracas', 'Distrito Capital', '1080', '2025-07-23', '12:00-15:00', 'Llamar al llegar', 'delivered', 420.92, 15342.53, 36.450000, 'Regalo', NULL, '2025-07-21 02:10:44.507+00', '2025-07-21 02:10:44.507+00', DEFAULT, DEFAULT);


--
-- TOC entry 3958 (class 0 OID 32156)
-- Dependencies: 366
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3960 (class 0 OID 32169)
-- Dependencies: 368
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payments VALUES (1, 1, NULL, 3, 390.93, 14249.40, 36.450000, 'completed', 'paypal', 'TXN-1759493446996-6647', 'REF-142913', NULL, NULL, 'Pago verificado', '2025-09-12 00:26:51.107+00', '2025-09-12 00:47:51.107+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (2, 2, NULL, 3, 123.97, 4518.71, 36.450000, 'completed', 'paypal', 'TXN-1759493447623-5905', 'REF-650038', NULL, NULL, 'Pago verificado', '2025-09-26 14:50:09.082+00', '2025-09-26 15:42:09.082+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (3, 3, NULL, 3, 68.99, 2514.69, 36.450000, 'completed', 'pago_movil', 'TXN-1759493448361-1871', 'REF-395016', NULL, NULL, 'Pago verificado', '2025-07-24 01:06:46.235+00', '2025-07-24 01:47:46.235+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (4, 4, NULL, 3, 124.97, 4555.16, 36.450000, 'completed', 'binance', 'TXN-1759493448820-3488', 'REF-529240', NULL, NULL, 'Pago verificado', '2025-08-21 23:14:48.22+00', '2025-08-21 23:49:48.22+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (5, 5, NULL, 3, 206.97, 7544.06, 36.450000, 'completed', 'cash', 'TXN-1759493449170-8835', 'REF-882503', NULL, NULL, 'Pago verificado', '2025-09-21 12:08:59.899+00', '2025-09-21 12:37:59.899+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (6, 6, NULL, 3, 308.94, 11260.86, 36.450000, 'completed', 'cash', 'TXN-1759493449569-5349', 'REF-592291', NULL, NULL, 'Pago verificado', '2025-08-08 01:37:53.802+00', '2025-08-08 02:34:53.802+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (7, 7, NULL, 3, 98.97, 3607.46, 36.450000, 'completed', 'paypal', 'TXN-1759493450037-2808', 'REF-358762', NULL, NULL, 'Pago verificado', '2025-07-15 05:25:31.396+00', '2025-07-15 06:05:31.396+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (8, 8, NULL, 3, 98.97, 3607.46, 36.450000, 'completed', 'binance', 'TXN-1759493450381-2911', 'REF-867288', NULL, NULL, 'Pago verificado', '2025-07-23 00:52:12.409+00', '2025-07-23 01:52:12.409+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (9, 9, NULL, 3, 128.97, 4700.96, 36.450000, 'completed', 'binance', 'TXN-1759493450780-8801', 'REF-264188', NULL, NULL, 'Pago verificado', '2025-08-11 02:18:32.569+00', '2025-08-11 02:51:32.569+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (10, 10, NULL, 3, 183.95, 6704.98, 36.450000, 'completed', 'paypal', 'TXN-1759493451515-8946', 'REF-491545', NULL, NULL, 'Pago verificado', '2025-07-28 03:49:02.097+00', '2025-07-28 04:29:02.097+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (11, 11, NULL, 3, 391.92, 14285.48, 36.450000, 'completed', 'pago_movil', 'TXN-1759493452145-2681', 'REF-338831', NULL, NULL, 'Pago verificado', '2025-10-01 23:48:02.563+00', '2025-10-02 00:46:02.563+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (12, 12, NULL, 3, 59.98, 2186.27, 36.450000, 'completed', 'zelle', 'TXN-1759493452687-9023', 'REF-760642', NULL, NULL, 'Pago verificado', '2025-08-16 07:29:44.484+00', '2025-08-16 08:16:44.484+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (13, 13, NULL, 3, 99.98, 3644.27, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493453322-7830', 'REF-604390', NULL, NULL, 'Pago verificado', '2025-07-31 08:33:25.657+00', '2025-07-31 09:12:25.657+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (14, 14, NULL, 3, 351.92, 12827.48, 36.450000, 'failed', 'paypal', 'TXN-1759493453783-8390', 'REF-526193', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (15, 15, NULL, 3, 279.93, 10203.45, 36.450000, 'completed', 'zelle', 'TXN-1759493454302-2272', 'REF-799091', NULL, NULL, 'Pago verificado', '2025-07-23 19:05:09.814+00', '2025-07-23 19:15:09.814+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (16, 16, NULL, 3, 137.98, 5029.37, 36.450000, 'failed', 'pago_movil', 'TXN-1759493454744-5181', 'REF-586775', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (17, 17, NULL, 3, 29.99, 1093.14, 36.450000, 'completed', 'cash', 'TXN-1759493455269-7292', 'REF-305165', NULL, NULL, 'Pago verificado', '2025-07-18 19:59:42.195+00', '2025-07-18 20:14:42.195+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (18, 18, NULL, 3, 118.97, 4336.46, 36.450000, 'completed', 'paypal', 'TXN-1759493455636-7445', 'REF-975216', NULL, NULL, 'Pago verificado', '2025-09-03 17:38:20.853+00', '2025-09-03 18:08:20.853+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (19, 19, NULL, 3, 386.93, 14103.60, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493455967-9582', 'REF-785067', NULL, NULL, 'Pago verificado', '2025-07-23 16:20:40.615+00', '2025-07-23 16:58:40.615+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (20, 20, NULL, 3, 99.98, 3644.27, 36.450000, 'completed', 'pago_movil', 'TXN-1759493456452-6496', 'REF-613518', NULL, NULL, 'Pago verificado', '2025-09-14 14:18:48.498+00', '2025-09-14 15:03:48.498+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (21, 21, NULL, 3, 110.97, 4044.86, 36.450000, 'completed', 'zelle', 'TXN-1759493456870-7363', 'REF-965277', NULL, NULL, 'Pago verificado', '2025-08-07 07:11:43.35+00', '2025-08-07 07:52:43.35+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (22, 22, NULL, 3, 105.98, 3862.97, 36.450000, 'completed', 'zelle', 'TXN-1759493457247-3605', 'REF-447764', NULL, NULL, 'Pago verificado', '2025-08-03 15:50:54.543+00', '2025-08-03 16:35:54.543+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (23, 23, NULL, 3, 465.92, 16982.78, 36.450000, 'completed', 'paypal', 'TXN-1759493457825-4601', 'REF-610614', NULL, NULL, 'Pago verificado', '2025-07-30 00:38:15.874+00', '2025-07-30 00:54:15.874+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (24, 24, NULL, 3, 128.97, 4700.96, 36.450000, 'completed', 'binance', 'TXN-1759493458174-4868', 'REF-875080', NULL, NULL, 'Pago verificado', '2025-07-20 22:28:28.299+00', '2025-07-20 23:13:28.299+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (25, 25, NULL, 3, 262.95, 9584.53, 36.450000, 'completed', 'pago_movil', 'TXN-1759493458726-5459', 'REF-580778', NULL, NULL, 'Pago verificado', '2025-08-06 14:27:09.962+00', '2025-08-06 14:49:09.962+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (26, 26, NULL, 3, 247.94, 9037.41, 36.450000, 'completed', 'zelle', 'TXN-1759493459320-2840', 'REF-640330', NULL, NULL, 'Pago verificado', '2025-07-28 06:08:15.885+00', '2025-07-28 06:35:15.885+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (27, 27, NULL, 3, 220.95, 8053.63, 36.450000, 'completed', 'binance', 'TXN-1759493459869-1110', 'REF-495237', NULL, NULL, 'Pago verificado', '2025-08-23 13:58:00.276+00', '2025-08-23 14:26:00.276+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (28, 28, NULL, 3, 158.97, 5794.46, 36.450000, 'completed', 'binance', 'TXN-1759493460285-3514', 'REF-603649', NULL, NULL, 'Pago verificado', '2025-10-02 10:17:57.106+00', '2025-10-02 10:59:57.106+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (29, 29, NULL, 3, 99.98, 3644.27, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493460887-3317', 'REF-955230', NULL, NULL, 'Pago verificado', '2025-09-05 08:52:49.629+00', '2025-09-05 09:24:49.629+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (30, 30, NULL, 3, 42.99, 1566.99, 36.450000, 'completed', 'cash', 'TXN-1759493461217-6241', 'REF-814040', NULL, NULL, 'Pago verificado', '2025-07-13 14:35:18.171+00', '2025-07-13 14:52:18.171+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (31, 31, NULL, 3, 194.95, 7105.93, 36.450000, 'completed', 'paypal', 'TXN-1759493461685-6904', 'REF-781579', NULL, NULL, 'Pago verificado', '2025-08-07 01:17:59.744+00', '2025-08-07 01:45:59.744+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (32, 32, NULL, 3, 65.98, 2404.97, 36.450000, 'failed', 'pago_movil', 'TXN-1759493462185-8935', 'REF-858333', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (33, 33, NULL, 3, 167.95, 6121.78, 36.450000, 'completed', 'binance', 'TXN-1759493462527-6475', 'REF-996259', NULL, NULL, 'Pago verificado', '2025-08-17 23:18:24.377+00', '2025-08-17 23:30:24.377+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (34, 34, NULL, 3, 225.96, 8236.24, 36.450000, 'failed', 'paypal', 'TXN-1759493462941-9860', 'REF-378332', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (35, 35, NULL, 3, 288.93, 10531.50, 36.450000, 'completed', 'zelle', 'TXN-1759493463485-1735', 'REF-667774', NULL, NULL, 'Pago verificado', '2025-08-21 22:34:40.406+00', '2025-08-21 22:59:40.406+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (36, 36, NULL, 3, 187.95, 6850.78, 36.450000, 'failed', 'pago_movil', 'TXN-1759493463820-3480', 'REF-898942', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (37, 37, NULL, 3, 206.97, 7544.06, 36.450000, 'completed', 'paypal', 'TXN-1759493464343-7756', 'REF-498340', NULL, NULL, 'Pago verificado', '2025-07-14 19:20:43.647+00', '2025-07-14 20:09:43.647+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (38, 38, NULL, 3, 357.93, 13046.55, 36.450000, 'completed', 'zelle', 'TXN-1759493464855-6943', 'REF-374090', NULL, NULL, 'Pago verificado', '2025-09-17 17:46:15.092+00', '2025-09-17 18:32:15.092+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (39, 39, NULL, 3, 147.97, 5393.51, 36.450000, 'completed', 'zelle', 'TXN-1759493465288-9354', 'REF-434116', NULL, NULL, 'Pago verificado', '2025-08-22 14:45:13.786+00', '2025-08-22 14:56:13.786+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (40, 40, NULL, 3, 112.97, 4117.76, 36.450000, 'completed', 'pago_movil', 'TXN-1759493465720-6844', 'REF-235250', NULL, NULL, 'Pago verificado', '2025-07-26 11:56:43.681+00', '2025-07-26 12:23:43.681+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (41, 41, NULL, 3, 178.97, 6523.46, 36.450000, 'completed', 'pago_movil', 'TXN-1759493466149-9610', 'REF-867813', NULL, NULL, 'Pago verificado', '2025-09-10 21:16:32.169+00', '2025-09-10 22:05:32.169+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (42, 42, NULL, 3, 137.97, 5029.01, 36.450000, 'completed', 'cash', 'TXN-1759493466492-7176', 'REF-633125', NULL, NULL, 'Pago verificado', '2025-08-28 15:08:01.324+00', '2025-08-28 15:50:01.324+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (43, 43, NULL, 3, 257.94, 9401.91, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493466920-7786', 'REF-684230', NULL, NULL, 'Pago verificado', '2025-09-25 21:20:35.688+00', '2025-09-25 21:47:35.688+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (44, 44, NULL, 3, 220.95, 8053.63, 36.450000, 'completed', 'pago_movil', 'TXN-1759493467300-3355', 'REF-189399', NULL, NULL, 'Pago verificado', '2025-08-07 06:11:36.248+00', '2025-08-07 06:51:36.248+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (45, 45, NULL, 3, 292.95, 10678.03, 36.450000, 'completed', 'paypal', 'TXN-1759493467970-3330', 'REF-417214', NULL, NULL, 'Pago verificado', '2025-08-21 20:46:16.255+00', '2025-08-21 20:58:16.255+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (46, 46, NULL, 3, 178.96, 6523.09, 36.450000, 'completed', 'binance', 'TXN-1759493468741-4368', 'REF-701511', NULL, NULL, 'Pago verificado', '2025-07-29 05:23:43.35+00', '2025-07-29 06:23:43.35+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (47, 47, NULL, 3, 395.93, 14431.65, 36.450000, 'completed', 'paypal', 'TXN-1759493469721-8311', 'REF-299859', NULL, NULL, 'Pago verificado', '2025-09-11 09:28:00.466+00', '2025-09-11 09:59:00.466+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (48, 48, NULL, 3, 138.96, 5065.09, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493470183-1498', 'REF-763032', NULL, NULL, 'Pago verificado', '2025-09-26 10:04:32.588+00', '2025-09-26 10:14:32.588+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (49, 49, NULL, 3, 275.92, 10057.28, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493470740-2639', 'REF-357658', NULL, NULL, 'Pago verificado', '2025-07-30 22:06:15.465+00', '2025-07-30 22:52:15.465+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (50, 50, NULL, 3, 78.98, 2878.82, 36.450000, 'completed', 'pago_movil', 'TXN-1759493471082-3214', 'REF-874825', NULL, NULL, 'Pago verificado', '2025-09-16 18:18:09.882+00', '2025-09-16 18:56:09.882+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (51, 51, NULL, 3, 191.96, 6996.94, 36.450000, 'completed', 'zelle', 'TXN-1759493471444-7299', 'REF-233661', NULL, NULL, 'Pago verificado', '2025-08-29 05:40:04.458+00', '2025-08-29 06:23:04.458+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (52, 52, NULL, 3, 336.94, 12281.46, 36.450000, 'completed', 'cash', 'TXN-1759493471848-5592', 'REF-597146', NULL, NULL, 'Pago verificado', '2025-09-05 09:19:04.545+00', '2025-09-05 09:41:04.545+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (53, 53, NULL, 3, 363.93, 13265.25, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493472260-4590', 'REF-556606', NULL, NULL, 'Pago verificado', '2025-07-10 06:32:24.417+00', '2025-07-10 07:28:24.417+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (54, 54, NULL, 3, 138.96, 5065.09, 36.450000, 'completed', 'pago_movil', 'TXN-1759493472929-4476', 'REF-779551', NULL, NULL, 'Pago verificado', '2025-09-08 21:49:21.526+00', '2025-09-08 22:20:21.526+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (55, 55, NULL, 3, 206.97, 7544.06, 36.450000, 'completed', 'zelle', 'TXN-1759493473602-3649', 'REF-292986', NULL, NULL, 'Pago verificado', '2025-10-02 14:58:39.515+00', '2025-10-02 15:47:39.515+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (56, 56, NULL, 3, 182.95, 6668.53, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493474183-5746', 'REF-625148', NULL, NULL, 'Pago verificado', '2025-09-17 02:45:55.06+00', '2025-09-17 03:20:55.06+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (57, 57, NULL, 3, 158.97, 5794.46, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493474721-8337', 'REF-251300', NULL, NULL, 'Pago verificado', '2025-07-10 15:22:38.319+00', '2025-07-10 15:54:38.319+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (58, 58, NULL, 3, 256.96, 9366.19, 36.450000, 'completed', 'binance', 'TXN-1759493475275-4957', 'REF-828439', NULL, NULL, 'Pago verificado', '2025-08-02 20:51:11.879+00', '2025-08-02 21:18:11.879+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (59, 59, NULL, 3, 262.95, 9584.53, 36.450000, 'completed', 'binance', 'TXN-1759493475854-3153', 'REF-840753', NULL, NULL, 'Pago verificado', '2025-09-23 12:45:37.612+00', '2025-09-23 13:17:37.612+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (60, 60, NULL, 3, 351.92, 12827.48, 36.450000, 'completed', 'zelle', 'TXN-1759493476693-3083', 'REF-134685', NULL, NULL, 'Pago verificado', '2025-07-30 15:20:35.4+00', '2025-07-30 15:57:35.4+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (61, 61, NULL, 3, 335.92, 12244.28, 36.450000, 'completed', 'binance', 'TXN-1759493477315-7328', 'REF-829059', NULL, NULL, 'Pago verificado', '2025-07-28 05:00:14.854+00', '2025-07-28 05:17:14.854+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (62, 62, NULL, 3, 68.99, 2514.69, 36.450000, 'completed', 'cash', 'TXN-1759493477718-9212', 'REF-778028', NULL, NULL, 'Pago verificado', '2025-10-02 21:44:56.212+00', '2025-10-02 22:17:56.212+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (63, 63, NULL, 3, 105.98, 3862.97, 36.450000, 'completed', 'pago_movil', 'TXN-1759493478381-8123', 'REF-431980', NULL, NULL, 'Pago verificado', '2025-07-13 22:57:20.391+00', '2025-07-13 23:10:20.391+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (64, 64, NULL, 3, 167.97, 6122.51, 36.450000, 'completed', 'paypal', 'TXN-1759493478941-3767', 'REF-477245', NULL, NULL, 'Pago verificado', '2025-08-05 04:31:15.81+00', '2025-08-05 04:47:15.81+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (65, 65, NULL, 3, 78.98, 2878.82, 36.450000, 'failed', 'cash', 'TXN-1759493479466-5721', 'REF-968991', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (66, 66, NULL, 3, 224.95, 8199.43, 36.450000, 'completed', 'paypal', 'TXN-1759493479822-4084', 'REF-915615', NULL, NULL, 'Pago verificado', '2025-09-02 18:45:54.054+00', '2025-09-02 19:09:54.054+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (67, 67, NULL, 3, 145.98, 5320.97, 36.450000, 'completed', 'zelle', 'TXN-1759493480193-3107', 'REF-711516', NULL, NULL, 'Pago verificado', '2025-08-05 02:03:46.06+00', '2025-08-05 02:52:46.06+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (68, 68, NULL, 3, 95.98, 3498.47, 36.450000, 'completed', 'cash', 'TXN-1759493480702-7483', 'REF-740426', NULL, NULL, 'Pago verificado', '2025-08-09 05:23:14.404+00', '2025-08-09 05:41:14.404+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (69, 69, NULL, 3, 268.95, 9803.23, 36.450000, 'completed', 'cash', 'TXN-1759493481321-3174', 'REF-103030', NULL, NULL, 'Pago verificado', '2025-08-02 07:12:24.965+00', '2025-08-02 07:51:24.965+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (70, 70, NULL, 3, 288.94, 10531.86, 36.450000, 'completed', 'binance', 'TXN-1759493481672-3100', 'REF-512067', NULL, NULL, 'Pago verificado', '2025-07-24 07:20:43.353+00', '2025-07-24 08:15:43.353+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (71, 71, NULL, 3, 229.95, 8381.68, 36.450000, 'completed', 'pago_movil', 'TXN-1759493482116-5124', 'REF-703513', NULL, NULL, 'Pago verificado', '2025-08-13 13:40:00.88+00', '2025-08-13 14:35:00.88+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (72, 72, NULL, 3, 68.99, 2514.69, 36.450000, 'completed', 'paypal', 'TXN-1759493482489-2369', 'REF-836185', NULL, NULL, 'Pago verificado', '2025-07-31 09:11:19.764+00', '2025-07-31 09:32:19.764+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (73, 73, NULL, 3, 236.93, 8636.10, 36.450000, 'completed', 'paypal', 'TXN-1759493482985-1833', 'REF-100043', NULL, NULL, 'Pago verificado', '2025-07-08 19:01:27.846+00', '2025-07-08 19:48:27.846+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (74, 74, NULL, 3, 379.93, 13848.45, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493483319-7661', 'REF-958723', NULL, NULL, 'Pago verificado', '2025-09-05 12:36:05.264+00', '2025-09-05 12:59:05.264+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (75, 75, NULL, 3, 258.96, 9439.09, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493483834-7827', 'REF-574158', NULL, NULL, 'Pago verificado', '2025-07-26 01:03:30.156+00', '2025-07-26 01:19:30.156+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (76, 76, NULL, 3, 314.94, 11479.56, 36.450000, 'completed', 'cash', 'TXN-1759493484177-6509', 'REF-595697', NULL, NULL, 'Pago verificado', '2025-08-13 16:31:11.796+00', '2025-08-13 17:08:11.796+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (77, 77, NULL, 3, 290.93, 10604.40, 36.450000, 'completed', 'pago_movil', 'TXN-1759493484685-9511', 'REF-400244', NULL, NULL, 'Pago verificado', '2025-07-09 01:53:43.895+00', '2025-07-09 02:18:43.895+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (78, 78, NULL, 3, 287.94, 10495.41, 36.450000, 'completed', 'cash', 'TXN-1759493485205-3887', 'REF-525118', NULL, NULL, 'Pago verificado', '2025-08-31 05:38:30.247+00', '2025-08-31 06:35:30.247+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (79, 79, NULL, 3, 252.95, 9220.03, 36.450000, 'completed', 'cash', 'TXN-1759493485768-5262', 'REF-553097', NULL, NULL, 'Pago verificado', '2025-07-04 22:01:48.34+00', '2025-07-04 22:30:48.34+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (80, 80, NULL, 3, 291.94, 10641.21, 36.450000, 'completed', 'paypal', 'TXN-1759493486224-1214', 'REF-140861', NULL, NULL, 'Pago verificado', '2025-08-18 19:00:02.994+00', '2025-08-18 20:00:02.994+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (81, 81, NULL, 3, 429.92, 15670.58, 36.450000, 'completed', 'bank_transfer', 'TXN-1759493486885-7555', 'REF-930031', NULL, NULL, 'Pago verificado', '2025-08-20 22:26:40.15+00', '2025-08-20 22:36:40.15+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (82, 82, NULL, 3, 239.96, 8746.54, 36.450000, 'completed', 'binance', 'TXN-1759493487450-7946', 'REF-430326', NULL, NULL, 'Pago verificado', '2025-09-28 03:58:32.289+00', '2025-09-28 04:18:32.289+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (83, 83, NULL, 3, 45.99, 1676.34, 36.450000, 'completed', 'cash', 'TXN-1759493488241-9786', 'REF-675607', NULL, NULL, 'Pago verificado', '2025-09-26 21:12:49.043+00', '2025-09-26 21:23:49.043+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (84, 84, NULL, 3, 291.94, 10641.21, 36.450000, 'completed', 'paypal', 'TXN-1759493488868-8268', 'REF-132375', NULL, NULL, 'Pago verificado', '2025-07-31 23:52:57.631+00', '2025-08-01 00:36:57.631+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (85, 85, NULL, 3, 129.96, 4737.04, 36.450000, 'completed', 'cash', 'TXN-1759493489637-7681', 'REF-810554', NULL, NULL, 'Pago verificado', '2025-08-01 03:35:32.669+00', '2025-08-01 04:33:32.669+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (86, 86, NULL, 3, 49.99, 1822.14, 36.450000, 'completed', 'cash', 'TXN-1759493490550-7167', 'REF-679885', NULL, NULL, 'Pago verificado', '2025-08-19 05:15:35.232+00', '2025-08-19 05:49:35.232+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (87, 87, NULL, 3, 29.99, 1093.14, 36.450000, 'completed', 'pago_movil', 'TXN-1759493491008-8804', 'REF-768003', NULL, NULL, 'Pago verificado', '2025-08-19 18:01:18.202+00', '2025-08-19 18:34:18.202+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (88, 88, NULL, 3, 189.96, 6924.04, 36.450000, 'failed', 'cash', 'TXN-1759493491359-6570', 'REF-260716', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (89, 89, NULL, 3, 274.95, 10021.93, 36.450000, 'completed', 'zelle', 'TXN-1759493491728-1668', 'REF-206335', NULL, NULL, 'Pago verificado', '2025-08-15 02:01:01.715+00', '2025-08-15 02:25:01.715+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (90, 90, NULL, 3, 125.98, 4591.97, 36.450000, 'completed', 'paypal', 'TXN-1759493492262-7617', 'REF-130012', NULL, NULL, 'Pago verificado', '2025-09-13 06:35:02.922+00', '2025-09-13 07:14:02.922+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (91, 91, NULL, 3, 46.99, 1712.79, 36.450000, 'completed', 'pago_movil', 'TXN-1759493492638-2502', 'REF-561376', NULL, NULL, 'Pago verificado', '2025-07-24 15:31:52.774+00', '2025-07-24 16:28:52.774+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (92, 92, NULL, 3, 55.99, 2040.84, 36.450000, 'failed', 'paypal', 'TXN-1759493493001-5781', 'REF-528177', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (93, 93, NULL, 3, 59.98, 2186.27, 36.450000, 'failed', 'bank_transfer', 'TXN-1759493493422-8526', 'REF-815839', NULL, NULL, NULL, NULL, NULL, '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (94, 94, NULL, 3, 145.98, 5320.97, 36.450000, 'completed', 'zelle', 'TXN-1759493493931-5563', 'REF-931765', NULL, NULL, 'Pago verificado', '2025-09-15 03:39:25.251+00', '2025-09-15 04:14:25.251+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (95, 95, NULL, 3, 291.94, 10641.21, 36.450000, 'completed', 'cash', 'TXN-1759493494461-3469', 'REF-470595', NULL, NULL, 'Pago verificado', '2025-07-31 22:32:20.302+00', '2025-07-31 23:09:20.302+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (96, 96, NULL, 3, 68.99, 2514.69, 36.450000, 'completed', 'cash', 'TXN-1759493495072-5185', 'REF-489295', NULL, NULL, 'Pago verificado', '2025-07-28 22:29:11.478+00', '2025-07-28 23:21:11.478+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (97, 97, NULL, 3, 122.97, 4482.26, 36.450000, 'completed', 'paypal', 'TXN-1759493495668-5312', 'REF-866708', NULL, NULL, 'Pago verificado', '2025-09-04 13:25:02.849+00', '2025-09-04 13:55:02.849+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (98, 98, NULL, 3, 214.96, 7835.29, 36.450000, 'completed', 'pago_movil', 'TXN-1759493496086-6925', 'REF-817196', NULL, NULL, 'Pago verificado', '2025-09-16 00:58:16.907+00', '2025-09-16 01:50:16.907+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (99, 99, NULL, 3, 210.95, 7689.13, 36.450000, 'completed', 'zelle', 'TXN-1759493496519-6494', 'REF-167825', NULL, NULL, 'Pago verificado', '2025-09-14 07:39:37.406+00', '2025-09-14 08:17:37.406+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');
INSERT INTO public.payments VALUES (100, 100, NULL, 3, 420.92, 15342.53, 36.450000, 'completed', 'binance', 'TXN-1759493497058-1159', 'REF-270821', NULL, NULL, 'Pago verificado', '2025-07-21 08:10:44.507+00', '2025-07-21 08:55:44.507+00', '2025-10-03 12:11:38.233028+00', '2025-10-03 12:11:38.233028+00');


--
-- TOC entry 3962 (class 0 OID 32525)
-- Dependencies: 370
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3950 (class 0 OID 32072)
-- Dependencies: 358
-- Data for Name: product_occasions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3948 (class 0 OID 32033)
-- Dependencies: 356
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products VALUES (83, 'Ramo Tropical Vibrante', 'Flores tropicales exóticas vibrantes', 'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas', 45.99, 1676.34, 25, 'FY-001', true, true, 1, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (84, 'Bouquet Arcoíris de Rosas', 'Rosas multicolores espectaculares', 'Rosas multicolores que forman un hermoso arcoíris de emociones', 52.99, 1931.49, 30, 'FY-002', true, true, 2, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (85, 'Girasoles Gigantes Alegres', 'Girasoles enormes y radiantes', 'Girasoles enormes que irradian alegría y energía positiva', 38.99, 1421.19, 20, 'FY-003', true, false, NULL, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (86, 'Orquídeas Elegantes Premium', 'Orquídeas exóticas sofisticadas', 'Orquídeas exóticas de alta calidad en arreglo sofisticado', 68.99, 2514.69, 15, 'FY-004', true, true, 3, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (87, 'Lirios Blancos Puros', 'Lirios blancos símbolo de pureza', 'Lirios blancos simbolizando pureza y elegancia', 42.99, 1566.99, 18, 'FY-005', true, false, NULL, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (88, 'Tulipanes Holandeses Mix', 'Tulipanes importados vibrantes', 'Tulipanes importados en colores vibrantes del valle holandés', 49.99, 1822.14, 22, 'FY-006', true, true, 4, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (89, 'Rosas Rojas Clásicas', 'Rosas rojas símbolo del amor', 'Docena de rosas rojas, el símbolo eterno del amor', 55.99, 2040.84, 40, 'FY-007', true, true, 5, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (90, 'Hortensias Azules Románticas', 'Hortensias azules delicadas', 'Hortensias azules en arreglo romántico y delicado', 46.99, 1712.79, 16, 'FY-008', true, false, NULL, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (91, 'Claveles Multicolor Festivos', 'Claveles coloridos alegres', 'Claveles coloridos perfectos para celebraciones alegres', 32.99, 1202.49, 28, 'FY-009', true, false, NULL, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (92, 'Ramo Campestre Silvestre', 'Flores silvestres naturales', 'Flores silvestres en arreglo natural y espontáneo', 39.99, 1457.64, 24, 'FY-010', true, true, 6, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (93, 'Margaritas Blancas Frescas', 'Margaritas blancas simples', 'Margaritas blancas que transmiten frescura y simplicidad', 29.99, 1093.14, 35, 'FY-011', true, false, NULL, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);
INSERT INTO public.products VALUES (94, 'Peonías Rosadas Deluxe', 'Peonías rosadas de temporada', 'Peonías rosadas de temporada, suaves y voluminosas', 72.99, 2660.49, 12, 'FY-012', true, true, 7, '2025-10-02 23:53:39.778903+00', '2025-10-02 23:53:39.778903+00', DEFAULT, DEFAULT);


--
-- TOC entry 3946 (class 0 OID 32018)
-- Dependencies: 354
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.settings VALUES (1, 'DELIVERY_COST_USD', '5.00', 'Costo de envío a domicilio en USD', 'string', true, '2025-10-02 12:26:30.686+00', '2025-10-02 12:26:30.687+00');
INSERT INTO public.settings VALUES (42, 'contact_owner_name', 'María González', 'Nombre del propietario', 'string', true, '2025-10-02 17:13:50.137406+00', '2025-10-02 17:13:50.137406+00');
INSERT INTO public.settings VALUES (43, 'contact_owner_experience', 'Más de 15 años creando momentos inolvidables con flores', 'Experiencia del propietario', 'string', true, '2025-10-02 17:13:50.406807+00', '2025-10-02 17:13:50.406807+00');
INSERT INTO public.settings VALUES (44, 'contact_owner_specialty', 'Arreglos personalizados y flores frescas de temporada', 'Especialidad del propietario', 'string', true, '2025-10-02 17:13:50.539618+00', '2025-10-02 17:13:50.539618+00');
INSERT INTO public.settings VALUES (45, 'contact_shop_name', 'FloresYa - Tu Floristería de Confianza', 'Nombre de la tienda', 'string', true, '2025-10-02 17:13:50.681204+00', '2025-10-02 17:13:50.681204+00');
INSERT INTO public.settings VALUES (46, 'contact_shop_location_text', 'Nuestro local en Chacao - ¡Te esperamos!', 'Texto de ubicación del local', 'string', true, '2025-10-02 17:13:50.805441+00', '2025-10-02 17:13:50.805441+00');
INSERT INTO public.settings VALUES (47, 'contact_phone_primary', '+58 412-1234567', 'Teléfono principal', 'string', true, '2025-10-02 17:13:50.946552+00', '2025-10-02 17:13:50.946552+00');
INSERT INTO public.settings VALUES (48, 'contact_phone_secondary', '+58 212-1234567', 'Teléfono secundario', 'string', true, '2025-10-02 17:13:51.387395+00', '2025-10-02 17:13:51.387395+00');
INSERT INTO public.settings VALUES (49, 'contact_whatsapp_main', '+58 412-1234567', 'WhatsApp principal', 'string', true, '2025-10-02 17:13:51.513245+00', '2025-10-02 17:13:51.513245+00');
INSERT INTO public.settings VALUES (50, 'contact_whatsapp_special', '+58 412-1234568', 'WhatsApp para pedidos especiales', 'string', true, '2025-10-02 17:13:51.632584+00', '2025-10-02 17:13:51.632584+00');
INSERT INTO public.settings VALUES (51, 'contact_email_main', 'contacto@floresya.com', 'Email principal de contacto', 'string', true, '2025-10-02 17:13:51.760057+00', '2025-10-02 17:13:51.760057+00');
INSERT INTO public.settings VALUES (52, 'contact_email_response_time', 'Respondemos en menos de 2 horas durante horario laboral', 'Tiempo de respuesta de email', 'string', true, '2025-10-02 17:13:51.889407+00', '2025-10-02 17:13:51.889407+00');
INSERT INTO public.settings VALUES (53, 'contact_location_main', 'Gran Caracas, Venezuela', 'Ubicación principal', 'string', true, '2025-10-02 17:13:52.038271+00', '2025-10-02 17:13:52.038271+00');
INSERT INTO public.settings VALUES (54, 'contact_location_delivery_area', 'Entregamos en toda el área metropolitana de Caracas', 'Área de entrega', 'string', true, '2025-10-02 17:13:52.165184+00', '2025-10-02 17:13:52.165184+00');
INSERT INTO public.settings VALUES (55, 'contact_location_coverage', 'Caracas, Chacao, Baruta, Sucre, El Hatillo', 'Cobertura de entrega', 'string', true, '2025-10-02 17:13:52.297794+00', '2025-10-02 17:13:52.297794+00');
INSERT INTO public.settings VALUES (56, 'contact_location_address', 'Av. Principal de Chacao, Centro Comercial Flores, Local 15-B, Caracas, Venezuela', 'Dirección física completa', 'string', true, '2025-10-02 17:13:52.436806+00', '2025-10-02 17:13:52.436806+00');
INSERT INTO public.settings VALUES (57, 'contact_hours_weekday', '8:00 AM - 6:00 PM', 'Horario lunes a viernes', 'string', true, '2025-10-02 17:13:52.557394+00', '2025-10-02 17:13:52.557394+00');
INSERT INTO public.settings VALUES (58, 'contact_hours_saturday', '9:00 AM - 4:00 PM', 'Horario sábados', 'string', true, '2025-10-02 17:13:52.687792+00', '2025-10-02 17:13:52.687792+00');
INSERT INTO public.settings VALUES (59, 'contact_hours_sunday', '10:00 AM - 2:00 PM (Solo WhatsApp)', 'Horario domingos', 'string', true, '2025-10-02 17:13:52.804644+00', '2025-10-02 17:13:52.804644+00');
INSERT INTO public.settings VALUES (60, 'contact_delivery_same_day', '¡Entregas el mismo día hasta las 4:00 PM!', 'Mensaje de entrega mismo día', 'string', true, '2025-10-02 17:13:52.93348+00', '2025-10-02 17:13:52.93348+00');
INSERT INTO public.settings VALUES (61, 'payment_movil_venezuela_phone', '0412-1234567', 'Teléfono pago móvil Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.081046+00', '2025-10-02 17:13:53.081046+00');
INSERT INTO public.settings VALUES (62, 'payment_movil_venezuela_cedula', 'V-12345678', 'Cédula pago móvil Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.207632+00', '2025-10-02 17:13:53.207632+00');
INSERT INTO public.settings VALUES (63, 'payment_movil_banesco_phone', '0414-8765432', 'Teléfono pago móvil Banesco', 'string', true, '2025-10-02 17:13:53.335418+00', '2025-10-02 17:13:53.335418+00');
INSERT INTO public.settings VALUES (64, 'payment_movil_banesco_cedula', 'V-12345678', 'Cédula pago móvil Banesco', 'string', true, '2025-10-02 17:13:53.451027+00', '2025-10-02 17:13:53.451027+00');
INSERT INTO public.settings VALUES (65, 'payment_movil_mercantil_phone', '0424-1122334', 'Teléfono pago móvil Mercantil', 'string', true, '2025-10-02 17:13:53.589075+00', '2025-10-02 17:13:53.589075+00');
INSERT INTO public.settings VALUES (66, 'payment_movil_mercantil_cedula', 'V-12345678', 'Cédula pago móvil Mercantil', 'string', true, '2025-10-02 17:13:53.716076+00', '2025-10-02 17:13:53.716076+00');
INSERT INTO public.settings VALUES (67, 'payment_transfer_venezuela_account', '0102-1234-5678-90123456', 'Número de cuenta Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.842821+00', '2025-10-02 17:13:53.842821+00');
INSERT INTO public.settings VALUES (68, 'payment_transfer_venezuela_holder', 'FloresYa C.A.', 'Titular cuenta Banco de Venezuela', 'string', true, '2025-10-02 17:13:53.95525+00', '2025-10-02 17:13:53.95525+00');
INSERT INTO public.settings VALUES (69, 'payment_transfer_venezuela_rif', 'J-123456789', 'RIF cuenta Banco de Venezuela', 'string', true, '2025-10-02 17:13:54.098301+00', '2025-10-02 17:13:54.098301+00');
INSERT INTO public.settings VALUES (70, 'payment_transfer_banesco_account', '0134-5678-9012-34567890', 'Número de cuenta Banesco', 'string', true, '2025-10-02 17:13:54.216321+00', '2025-10-02 17:13:54.216321+00');
INSERT INTO public.settings VALUES (71, 'payment_transfer_banesco_holder', 'María González', 'Titular cuenta Banesco', 'string', true, '2025-10-02 17:13:54.351365+00', '2025-10-02 17:13:54.351365+00');
INSERT INTO public.settings VALUES (72, 'payment_transfer_banesco_cedula', 'V-12345678', 'Cédula titular cuenta Banesco', 'string', true, '2025-10-02 17:13:54.492912+00', '2025-10-02 17:13:54.492912+00');
INSERT INTO public.settings VALUES (73, 'payment_zelle_email', 'pagos@floresya.com', 'Email para Zelle', 'string', true, '2025-10-02 17:13:54.651732+00', '2025-10-02 17:13:54.651732+00');
INSERT INTO public.settings VALUES (74, 'payment_zelle_name', 'María González', 'Nombre para Zelle', 'string', true, '2025-10-02 17:13:54.793294+00', '2025-10-02 17:13:54.793294+00');
INSERT INTO public.settings VALUES (75, 'payment_paypal_email', 'paypal@floresya.com', 'Email para PayPal', 'string', true, '2025-10-02 17:13:54.969204+00', '2025-10-02 17:13:54.969204+00');
INSERT INTO public.settings VALUES (76, 'social_facebook_url', 'https://facebook.com/floresya', 'URL de Facebook', 'string', true, '2025-10-02 17:13:55.100437+00', '2025-10-02 17:13:55.100437+00');
INSERT INTO public.settings VALUES (77, 'social_facebook_handle', '@floresya', 'Handle de Facebook', 'string', true, '2025-10-02 17:13:55.220692+00', '2025-10-02 17:13:55.220692+00');
INSERT INTO public.settings VALUES (78, 'social_instagram_url', 'https://instagram.com/floresya_ve', 'URL de Instagram', 'string', true, '2025-10-02 17:13:55.334223+00', '2025-10-02 17:13:55.334223+00');
INSERT INTO public.settings VALUES (79, 'social_instagram_handle', '@floresya_ve', 'Handle de Instagram', 'string', true, '2025-10-02 17:13:55.460812+00', '2025-10-02 17:13:55.460812+00');
INSERT INTO public.settings VALUES (80, 'social_tiktok_url', 'https://tiktok.com/@floresya', 'URL de TikTok', 'string', true, '2025-10-02 17:13:55.611523+00', '2025-10-02 17:13:55.611523+00');
INSERT INTO public.settings VALUES (82, 'hero_image', NULL, 'URL de la imagen hero de la página principal', 'string', true, '2025-10-05 12:00:00.000+00', '2025-10-05 12:00:00.000+00');
INSERT INTO public.settings VALUES (83, 'site_logo', NULL, 'URL del logo del sitio', 'string', true, '2025-10-05 12:00:00.000+00', '2025-10-05 12:00:00.000+00');
INSERT INTO public.settings VALUES (84, 'bcv_usd_rate', NULL, 'Tipo de cambio USD según BCV (Banco Central de Venezuela)', 'string', true, '2025-10-05 12:00:00.000+00', '2025-10-05 12:00:00.000+00');


--
-- TOC entry 3944 (class 0 OID 32002)
-- Dependencies: 352
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (3, 'admin@floresya.com', NULL, 'Admin FloresYa', '+58 212 555 0001', 'admin', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (4, 'maria.gonzalez@gmail.com', NULL, 'María González', '+58 414 123 4567', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (5, 'carlos.rodriguez@yahoo.com', NULL, 'Carlos Rodríguez', '+58 412 987 6543', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (6, 'ana.perez@hotmail.com', NULL, 'Ana Pérez', '+58 424 555 0123', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);
INSERT INTO public.users VALUES (7, 'luis.martinez@gmail.com', NULL, 'Luis Martínez', '+58 416 789 0123', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00', DEFAULT, DEFAULT);


--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 349
-- Name: occasions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.occasions_id_seq', 87, true);


--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 361
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 210, true);


--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 363
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 460, true);


--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 359
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 101, true);


--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 365
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 2, true);


--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 367
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 100, true);


--
-- TOC entry 4024 (class 0 OID 0)
-- Dependencies: 369
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 396, true);


--
-- TOC entry 4025 (class 0 OID 0)
-- Dependencies: 357
-- Name: product_occasions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_occasions_id_seq', 86, true);


--
-- TOC entry 4026 (class 0 OID 0)
-- Dependencies: 355
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 95, true);


--
-- TOC entry 4027 (class 0 OID 0)
-- Dependencies: 353
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 84, true);


--
-- TOC entry 4028 (class 0 OID 0)
-- Dependencies: 351
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 32, true);


--
-- TOC entry 3714 (class 2606 OID 32000)
-- Name: occasions occasions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_name_key UNIQUE (name);


--
-- TOC entry 3716 (class 2606 OID 31998)
-- Name: occasions occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 3718 (class 2606 OID 32573)
-- Name: occasions occasions_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_slug_unique UNIQUE (slug);


--
-- TOC entry 3753 (class 2606 OID 32124)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3755 (class 2606 OID 32144)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3750 (class 2606 OID 32105)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3757 (class 2606 OID 32167)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3761 (class 2606 OID 32180)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3767 (class 2606 OID 32537)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3769 (class 2606 OID 32539)
-- Name: product_images product_images_product_id_image_index_size_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_image_index_size_key UNIQUE (product_id, image_index, size);


--
-- TOC entry 3741 (class 2606 OID 32079)
-- Name: product_occasions product_occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 3743 (class 2606 OID 32081)
-- Name: product_occasions product_occasions_product_id_occasion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_occasion_id_key UNIQUE (product_id, occasion_id);


--
-- TOC entry 3736 (class 2606 OID 32048)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 2606 OID 32050)
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- TOC entry 3727 (class 2606 OID 32031)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 3729 (class 2606 OID 32029)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3723 (class 2606 OID 32016)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3725 (class 2606 OID 32014)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3751 (class 1259 OID 32202)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 3744 (class 1259 OID 32201)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 3745 (class 1259 OID 52861)
-- Name: idx_orders_customer_email_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_email_normalized ON public.orders USING btree (customer_email_normalized);


--
-- TOC entry 3746 (class 1259 OID 52849)
-- Name: idx_orders_customer_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_name_normalized ON public.orders USING btree (customer_name_normalized);


--
-- TOC entry 3747 (class 1259 OID 32200)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 3748 (class 1259 OID 32199)
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- TOC entry 3758 (class 1259 OID 32203)
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- TOC entry 3759 (class 1259 OID 32204)
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- TOC entry 3762 (class 1259 OID 32548)
-- Name: idx_product_images_only_one_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_product_images_only_one_primary ON public.product_images USING btree (product_id) WHERE (is_primary = true);


--
-- TOC entry 3763 (class 1259 OID 32546)
-- Name: idx_product_images_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_primary ON public.product_images USING btree (product_id, is_primary) WHERE (is_primary = true);


--
-- TOC entry 3764 (class 1259 OID 32545)
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- TOC entry 3765 (class 1259 OID 32547)
-- Name: idx_product_images_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_size ON public.product_images USING btree (size);


--
-- TOC entry 3739 (class 1259 OID 32198)
-- Name: idx_product_occasions_occasion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_occasions_occasion_id ON public.product_occasions USING btree (occasion_id);


--
-- TOC entry 3730 (class 1259 OID 32207)
-- Name: idx_products_active_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_featured ON public.products USING btree (active, featured);


--
-- TOC entry 3731 (class 1259 OID 32208)
-- Name: idx_products_carousel_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_carousel_order ON public.products USING btree (carousel_order) WHERE (carousel_order IS NOT NULL);


--
-- TOC entry 3732 (class 1259 OID 52886)
-- Name: idx_products_description_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_description_normalized ON public.products USING btree (description_normalized);


--
-- TOC entry 3733 (class 1259 OID 52873)
-- Name: idx_products_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_name_normalized ON public.products USING btree (name_normalized);


--
-- TOC entry 3734 (class 1259 OID 32206)
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- TOC entry 3719 (class 1259 OID 32205)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3720 (class 1259 OID 52907)
-- Name: idx_users_email_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email_normalized ON public.users USING btree (email_normalized);


--
-- TOC entry 3721 (class 1259 OID 52896)
-- Name: idx_users_full_name_normalized; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_full_name_normalized ON public.users USING btree (full_name_normalized);


--
-- TOC entry 3773 (class 2606 OID 32125)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3774 (class 2606 OID 32130)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 3775 (class 2606 OID 32150)
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3776 (class 2606 OID 32145)
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3772 (class 2606 OID 32106)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3777 (class 2606 OID 32181)
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3778 (class 2606 OID 32186)
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- TOC entry 3779 (class 2606 OID 32191)
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3780 (class 2606 OID 32540)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 3770 (class 2606 OID 32087)
-- Name: product_occasions product_occasions_occasion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_occasion_id_fkey FOREIGN KEY (occasion_id) REFERENCES public.occasions(id) ON DELETE CASCADE;


--
-- TOC entry 3771 (class 2606 OID 32082)
-- Name: product_occasions product_occasions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 3929 (class 0 OID 31986)
-- Dependencies: 350
-- Name: occasions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3935 (class 0 OID 32112)
-- Dependencies: 362
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3936 (class 0 OID 32136)
-- Dependencies: 364
-- Name: order_status_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3934 (class 0 OID 32093)
-- Dependencies: 360
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3937 (class 0 OID 32156)
-- Dependencies: 366
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3938 (class 0 OID 32169)
-- Dependencies: 368
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3939 (class 0 OID 32525)
-- Dependencies: 370
-- Name: product_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3933 (class 0 OID 32072)
-- Dependencies: 358
-- Name: product_occasions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3932 (class 0 OID 32033)
-- Dependencies: 356
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3931 (class 0 OID 32018)
-- Dependencies: 354
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3930 (class 0 OID 32002)
-- Dependencies: 352
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 52
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON SCHEMA public TO prisma;


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 460
-- Name: FUNCTION create_order_with_items(order_data jsonb, order_items jsonb[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO anon;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO service_role;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO prisma;


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 483
-- Name: FUNCTION create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO anon;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO authenticated;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO service_role;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO prisma;


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 506
-- Name: FUNCTION create_product_with_occasions(product_data jsonb, occasion_ids integer[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO anon;
GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO service_role;
GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO prisma;


--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 446
-- Name: FUNCTION delete_product_images_safe(product_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO anon;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO service_role;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO prisma;


--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 390
-- Name: FUNCTION get_existing_image_by_hash(hash_input character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO anon;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO authenticated;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO service_role;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO prisma;


--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 376
-- Name: FUNCTION get_product_occasions(p_product_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO anon;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO service_role;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO prisma;


--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION get_products_by_occasion(p_occasion_id integer, p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO service_role;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO prisma;


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION get_products_with_occasions(p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO service_role;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO prisma;


--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 469
-- Name: FUNCTION reset_sequence(sequence_name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO anon;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO authenticated;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO service_role;
GRANT ALL ON FUNCTION public.reset_sequence(sequence_name text) TO prisma;


--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 383
-- Name: FUNCTION update_carousel_order_atomic(product_id integer, new_order integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO anon;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO service_role;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO prisma;


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 434
-- Name: FUNCTION update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO anon;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO service_role;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO prisma;


--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO prisma;


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 350
-- Name: TABLE occasions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.occasions TO anon;
GRANT ALL ON TABLE public.occasions TO authenticated;
GRANT ALL ON TABLE public.occasions TO service_role;
GRANT ALL ON TABLE public.occasions TO prisma;


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 349
-- Name: SEQUENCE occasions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.occasions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO prisma;


--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.order_items TO prisma;


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 361
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO prisma;


--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE order_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_history TO anon;
GRANT ALL ON TABLE public.order_status_history TO authenticated;
GRANT ALL ON TABLE public.order_status_history TO service_role;
GRANT ALL ON TABLE public.order_status_history TO prisma;


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 363
-- Name: SEQUENCE order_status_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO prisma;


--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.orders TO prisma;


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 359
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.orders_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.orders_id_seq TO prisma;


--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_methods TO anon;
GRANT ALL ON TABLE public.payment_methods TO authenticated;
GRANT ALL ON TABLE public.payment_methods TO service_role;
GRANT ALL ON TABLE public.payment_methods TO prisma;


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 365
-- Name: SEQUENCE payment_methods_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO prisma;


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;
GRANT ALL ON TABLE public.payments TO prisma;


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 367
-- Name: SEQUENCE payments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.payments_id_seq TO prisma;


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE product_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;
GRANT ALL ON TABLE public.product_images TO prisma;


--
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 369
-- Name: SEQUENCE product_images_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO prisma;


--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE product_occasions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_occasions TO anon;
GRANT ALL ON TABLE public.product_occasions TO authenticated;
GRANT ALL ON TABLE public.product_occasions TO service_role;
GRANT ALL ON TABLE public.product_occasions TO prisma;


--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 357
-- Name: SEQUENCE product_occasions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO prisma;


--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.products TO prisma;


--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 355
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.products_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.products_id_seq TO prisma;


--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settings TO anon;
GRANT ALL ON TABLE public.settings TO authenticated;
GRANT ALL ON TABLE public.settings TO service_role;
GRANT ALL ON TABLE public.settings TO prisma;


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 353
-- Name: SEQUENCE settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.settings_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.settings_id_seq TO prisma;


--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO prisma;


--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 351
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.users_id_seq TO prisma;


--
-- TOC entry 2475 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;


--
-- TOC entry 2452 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2474 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;


--
-- TOC entry 2454 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2473 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;


--
-- TOC entry 2453 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- Completed on 2025-10-03 13:42:56 -03

--
-- PostgreSQL database dump complete
--

\unrestrict VFADMZ0IDEqqiUZ8rtpUmpCvA5aGMkGCpjqgy7wMcdkjvfa72W9RA036BgwwfnH

