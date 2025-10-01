--
-- PostgreSQL database dump
--

\restrict Rq0QoRU2uJEe3T9gsXFYPwbBMWfyEhEifcTKo3QgQcsafgOwTAcChqsgRdKKc9B

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.6 (Ubuntu 17.6-2.pgdg24.04+1)

-- Started on 2025-09-30 12:23:05 -03

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
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 52
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1254 (class 1247 OID 32337)
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
-- TOC entry 1215 (class 1247 OID 31954)
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
-- TOC entry 1196 (class 1247 OID 28694)
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
-- TOC entry 1218 (class 1247 OID 31968)
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
-- TOC entry 1221 (class 1247 OID 31980)
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
-- TOC entry 482 (class 1255 OID 34868)
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
-- TOC entry 505 (class 1255 OID 34867)
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
-- TOC entry 3969 (class 0 OID 0)
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
-- TOC entry 3972 (class 0 OID 0)
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
-- TOC entry 3975 (class 0 OID 0)
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
-- TOC entry 3978 (class 0 OID 0)
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
-- TOC entry 3981 (class 0 OID 0)
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
-- TOC entry 3984 (class 0 OID 0)
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
-- TOC entry 3987 (class 0 OID 0)
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
-- TOC entry 3989 (class 0 OID 0)
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
-- TOC entry 3991 (class 0 OID 0)
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
    CONSTRAINT products_carousel_order_check CHECK ((carousel_order >= 0)),
    CONSTRAINT products_price_usd_check CHECK ((price_usd >= (0)::numeric)),
    CONSTRAINT products_stock_check CHECK ((stock >= 0))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE products; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.products IS 'Productos vendidos en la tienda. Cada producto puede tener múltiples imágenes y ocasiones.';


--
-- TOC entry 3994 (class 0 OID 0)
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
-- TOC entry 3996 (class 0 OID 0)
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
-- TOC entry 3999 (class 0 OID 0)
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
    updated_at timestamp with time zone DEFAULT now()
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
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 351
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3648 (class 2604 OID 31989)
-- Name: occasions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions ALTER COLUMN id SET DEFAULT nextval('public.occasions_id_seq'::regclass);


--
-- TOC entry 3677 (class 2604 OID 32115)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3680 (class 2604 OID 32139)
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- TOC entry 3673 (class 2604 OID 32096)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3682 (class 2604 OID 32159)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3687 (class 2604 OID 32172)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3691 (class 2604 OID 32528)
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- TOC entry 3670 (class 2604 OID 32075)
-- Name: product_occasions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions ALTER COLUMN id SET DEFAULT nextval('public.product_occasions_id_seq'::regclass);


--
-- TOC entry 3664 (class 2604 OID 32036)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3659 (class 2604 OID 32021)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 3653 (class 2604 OID 32005)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3929 (class 0 OID 31986)
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
-- TOC entry 3941 (class 0 OID 32112)
-- Dependencies: 362
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3943 (class 0 OID 32136)
-- Dependencies: 364
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3939 (class 0 OID 32093)
-- Dependencies: 360
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3945 (class 0 OID 32156)
-- Dependencies: 366
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3947 (class 0 OID 32169)
-- Dependencies: 368
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3949 (class 0 OID 32525)
-- Dependencies: 370
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3937 (class 0 OID 32072)
-- Dependencies: 358
-- Data for Name: product_occasions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3935 (class 0 OID 32033)
-- Dependencies: 356
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products VALUES (67, 'Ramo Tropical Vibrante', 'Explosión de colores tropicales', 'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas', 45.99, 1837.96, 15, 'FY-001', true, true, 1, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (68, 'Bouquet Arcoíris de Rosas', 'Rosas multicolores vibrantes', 'Rosas multicolores que forman un hermoso arcoíris de emociones', 52.99, 2119.60, 20, 'FY-002', true, true, 2, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (69, 'Girasoles Gigantes Alegres', 'Girasoles enormes y alegres', 'Girasoles enormes que irradian alegría y energía positiva', 38.99, 1559.60, 25, 'FY-003', true, false, NULL, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (70, 'Orquídeas Fucsia Exóticas', 'Orquídeas sofisticadas', 'Orquídeas fucsia exóticas en un arreglo sofisticado y elegante', 67.99, 2719.60, 10, 'FY-004', true, true, 3, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (71, 'Mix Primaveral Colorido', 'Mezcla primaveral colorida', 'Mezcla primaveral con tulipanes, narcisos y flores de temporada', 41.99, 1679.60, 18, 'FY-005', true, false, NULL, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (72, 'Rosas Coral Románticas', 'Rosas coral románticas', 'Rosas en tonos coral que expresan amor y ternura', 49.99, 1999.60, 22, 'FY-006', true, true, 4, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (73, 'Lirios Naranjas Vibrantes', 'Lirios naranjas energéticos', 'Lirios naranjas que aportan energía y vitalidad a cualquier espacio', 44.99, 1799.60, 12, 'FY-007', true, false, NULL, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (74, 'Peonías Rosa Suave', 'Peonías delicadas', 'Peonías delicadas en tonos rosa suave para momentos románticos', 58.99, 2359.60, 8, 'FY-008', true, true, 5, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (75, 'Claveles Multicolor Festivos', 'Claveles vibrantes festivos', 'Claveles vibrantes en colores festivos perfectos para celebraciones', 35.99, 1439.60, 30, 'FY-009', true, false, NULL, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');
INSERT INTO public.products VALUES (76, 'Bouquet Nupcial Elegante', 'Ramo nupcial elegante', 'Ramo nupcial con rosas blancas, peonías rosa y follaje elegante', 89.99, 3599.60, 5, 'FY-010', true, true, 6, '2025-09-30 02:22:35.04999+00', '2025-09-30 02:22:35.04999+00');


--
-- TOC entry 3933 (class 0 OID 32018)
-- Dependencies: 354
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3931 (class 0 OID 32002)
-- Dependencies: 352
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (3, 'admin@floresya.com', NULL, 'Admin FloresYa', '+58 212 555 0001', 'admin', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00');
INSERT INTO public.users VALUES (4, 'maria.gonzalez@gmail.com', NULL, 'María González', '+58 414 123 4567', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00');
INSERT INTO public.users VALUES (5, 'carlos.rodriguez@yahoo.com', NULL, 'Carlos Rodríguez', '+58 412 987 6543', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00');
INSERT INTO public.users VALUES (6, 'ana.perez@hotmail.com', NULL, 'Ana Pérez', '+58 424 555 0123', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00');
INSERT INTO public.users VALUES (7, 'luis.martinez@gmail.com', NULL, 'Luis Martínez', '+58 416 789 0123', 'user', true, false, '2025-09-25 05:06:02.672304+00', '2025-09-25 05:06:02.672304+00');


--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 349
-- Name: occasions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.occasions_id_seq', 87, true);


--
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 361
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 363
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 1, false);


--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 359
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 365
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 1, false);


--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 367
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 369
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 140, true);


--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 357
-- Name: product_occasions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_occasions_id_seq', 80, true);


--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 355
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 76, true);


--
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 353
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 351
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 32, true);


--
-- TOC entry 3707 (class 2606 OID 32000)
-- Name: occasions occasions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_name_key UNIQUE (name);


--
-- TOC entry 3709 (class 2606 OID 31998)
-- Name: occasions occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 3711 (class 2606 OID 32573)
-- Name: occasions occasions_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.occasions
    ADD CONSTRAINT occasions_slug_unique UNIQUE (slug);


--
-- TOC entry 3740 (class 2606 OID 32124)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 2606 OID 32144)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 3737 (class 2606 OID 32105)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3744 (class 2606 OID 32167)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3748 (class 2606 OID 32180)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3754 (class 2606 OID 32537)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 3756 (class 2606 OID 32539)
-- Name: product_images product_images_product_id_image_index_size_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_image_index_size_key UNIQUE (product_id, image_index, size);


--
-- TOC entry 3730 (class 2606 OID 32079)
-- Name: product_occasions product_occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 3732 (class 2606 OID 32081)
-- Name: product_occasions product_occasions_product_id_occasion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_occasion_id_key UNIQUE (product_id, occasion_id);


--
-- TOC entry 3725 (class 2606 OID 32048)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3727 (class 2606 OID 32050)
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- TOC entry 3718 (class 2606 OID 32031)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 3720 (class 2606 OID 32029)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3714 (class 2606 OID 32016)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3716 (class 2606 OID 32014)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3738 (class 1259 OID 32202)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 3733 (class 1259 OID 32201)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 3734 (class 1259 OID 32200)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 3735 (class 1259 OID 32199)
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- TOC entry 3745 (class 1259 OID 32203)
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- TOC entry 3746 (class 1259 OID 32204)
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- TOC entry 3749 (class 1259 OID 32548)
-- Name: idx_product_images_only_one_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_product_images_only_one_primary ON public.product_images USING btree (product_id) WHERE (is_primary = true);


--
-- TOC entry 3750 (class 1259 OID 32546)
-- Name: idx_product_images_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_primary ON public.product_images USING btree (product_id, is_primary) WHERE (is_primary = true);


--
-- TOC entry 3751 (class 1259 OID 32545)
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- TOC entry 3752 (class 1259 OID 32547)
-- Name: idx_product_images_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_size ON public.product_images USING btree (size);


--
-- TOC entry 3728 (class 1259 OID 32198)
-- Name: idx_product_occasions_occasion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_occasions_occasion_id ON public.product_occasions USING btree (occasion_id);


--
-- TOC entry 3721 (class 1259 OID 32207)
-- Name: idx_products_active_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active_featured ON public.products USING btree (active, featured);


--
-- TOC entry 3722 (class 1259 OID 32208)
-- Name: idx_products_carousel_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_carousel_order ON public.products USING btree (carousel_order) WHERE (carousel_order IS NOT NULL);


--
-- TOC entry 3723 (class 1259 OID 32206)
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- TOC entry 3712 (class 1259 OID 32205)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3760 (class 2606 OID 32125)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3761 (class 2606 OID 32130)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 3762 (class 2606 OID 32150)
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3763 (class 2606 OID 32145)
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3759 (class 2606 OID 32106)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3764 (class 2606 OID 32181)
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3765 (class 2606 OID 32186)
-- Name: payments payments_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;


--
-- TOC entry 3766 (class 2606 OID 32191)
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3767 (class 2606 OID 32540)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 3757 (class 2606 OID 32087)
-- Name: product_occasions product_occasions_occasion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_occasion_id_fkey FOREIGN KEY (occasion_id) REFERENCES public.occasions(id) ON DELETE CASCADE;


--
-- TOC entry 3758 (class 2606 OID 32082)
-- Name: product_occasions product_occasions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 3916 (class 0 OID 31986)
-- Dependencies: 350
-- Name: occasions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3922 (class 0 OID 32112)
-- Dependencies: 362
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3923 (class 0 OID 32136)
-- Dependencies: 364
-- Name: order_status_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3921 (class 0 OID 32093)
-- Dependencies: 360
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3924 (class 0 OID 32156)
-- Dependencies: 366
-- Name: payment_methods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3925 (class 0 OID 32169)
-- Dependencies: 368
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3926 (class 0 OID 32525)
-- Dependencies: 370
-- Name: product_images; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3920 (class 0 OID 32072)
-- Dependencies: 358
-- Name: product_occasions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3919 (class 0 OID 32033)
-- Dependencies: 356
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3918 (class 0 OID 32018)
-- Dependencies: 354
-- Name: settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3917 (class 0 OID 32002)
-- Dependencies: 352
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 52
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON SCHEMA public TO prisma;


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 460
-- Name: FUNCTION create_order_with_items(order_data jsonb, order_items jsonb[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO anon;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO service_role;
GRANT ALL ON FUNCTION public.create_order_with_items(order_data jsonb, order_items jsonb[]) TO prisma;


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 482
-- Name: FUNCTION create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO anon;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO authenticated;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO service_role;
GRANT ALL ON FUNCTION public.create_product_images_atomic(product_id integer, image_index integer, images_data jsonb[], is_primary boolean) TO prisma;


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 505
-- Name: FUNCTION create_product_with_occasions(product_data jsonb, occasion_ids integer[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO anon;
GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO service_role;
GRANT ALL ON FUNCTION public.create_product_with_occasions(product_data jsonb, occasion_ids integer[]) TO prisma;


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 446
-- Name: FUNCTION delete_product_images_safe(product_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO anon;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO service_role;
GRANT ALL ON FUNCTION public.delete_product_images_safe(product_id integer) TO prisma;


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 390
-- Name: FUNCTION get_existing_image_by_hash(hash_input character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO anon;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO authenticated;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO service_role;
GRANT ALL ON FUNCTION public.get_existing_image_by_hash(hash_input character varying) TO prisma;


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 376
-- Name: FUNCTION get_product_occasions(p_product_id integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO anon;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO service_role;
GRANT ALL ON FUNCTION public.get_product_occasions(p_product_id integer) TO prisma;


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION get_products_by_occasion(p_occasion_id integer, p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO service_role;
GRANT ALL ON FUNCTION public.get_products_by_occasion(p_occasion_id integer, p_limit integer) TO prisma;


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION get_products_with_occasions(p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO service_role;
GRANT ALL ON FUNCTION public.get_products_with_occasions(p_limit integer, p_offset integer) TO prisma;


--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 383
-- Name: FUNCTION update_carousel_order_atomic(product_id integer, new_order integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO anon;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO service_role;
GRANT ALL ON FUNCTION public.update_carousel_order_atomic(product_id integer, new_order integer) TO prisma;


--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 434
-- Name: FUNCTION update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO anon;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO authenticated;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO service_role;
GRANT ALL ON FUNCTION public.update_order_status_with_history(order_id integer, new_status public.order_status, notes text, changed_by integer) TO prisma;


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO prisma;


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 350
-- Name: TABLE occasions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.occasions TO anon;
GRANT ALL ON TABLE public.occasions TO authenticated;
GRANT ALL ON TABLE public.occasions TO service_role;
GRANT ALL ON TABLE public.occasions TO prisma;


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 349
-- Name: SEQUENCE occasions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.occasions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.occasions_id_seq TO prisma;


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.order_items TO prisma;


--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 361
-- Name: SEQUENCE order_items_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_items_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.order_items_id_seq TO prisma;


--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE order_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_history TO anon;
GRANT ALL ON TABLE public.order_status_history TO authenticated;
GRANT ALL ON TABLE public.order_status_history TO service_role;
GRANT ALL ON TABLE public.order_status_history TO prisma;


--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 363
-- Name: SEQUENCE order_status_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.order_status_history_id_seq TO prisma;


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.orders TO prisma;


--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 359
-- Name: SEQUENCE orders_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.orders_id_seq TO anon;
GRANT ALL ON SEQUENCE public.orders_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.orders_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.orders_id_seq TO prisma;


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE payment_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_methods TO anon;
GRANT ALL ON TABLE public.payment_methods TO authenticated;
GRANT ALL ON TABLE public.payment_methods TO service_role;
GRANT ALL ON TABLE public.payment_methods TO prisma;


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 365
-- Name: SEQUENCE payment_methods_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.payment_methods_id_seq TO prisma;


--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;
GRANT ALL ON TABLE public.payments TO prisma;


--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 367
-- Name: SEQUENCE payments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.payments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.payments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.payments_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.payments_id_seq TO prisma;


--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE product_images; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_images TO anon;
GRANT ALL ON TABLE public.product_images TO authenticated;
GRANT ALL ON TABLE public.product_images TO service_role;
GRANT ALL ON TABLE public.product_images TO prisma;


--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 369
-- Name: SEQUENCE product_images_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_images_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.product_images_id_seq TO prisma;


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE product_occasions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.product_occasions TO anon;
GRANT ALL ON TABLE public.product_occasions TO authenticated;
GRANT ALL ON TABLE public.product_occasions TO service_role;
GRANT ALL ON TABLE public.product_occasions TO prisma;


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 357
-- Name: SEQUENCE product_occasions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO anon;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.product_occasions_id_seq TO prisma;


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.products TO prisma;


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 355
-- Name: SEQUENCE products_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.products_id_seq TO anon;
GRANT ALL ON SEQUENCE public.products_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.products_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.products_id_seq TO prisma;


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settings TO anon;
GRANT ALL ON TABLE public.settings TO authenticated;
GRANT ALL ON TABLE public.settings TO service_role;
GRANT ALL ON TABLE public.settings TO prisma;


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 353
-- Name: SEQUENCE settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.settings_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.settings_id_seq TO prisma;


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;
GRANT ALL ON TABLE public.users TO prisma;


--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 351
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO anon;
GRANT ALL ON SEQUENCE public.users_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.users_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.users_id_seq TO prisma;


--
-- TOC entry 2474 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;


--
-- TOC entry 2451 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2473 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO prisma;


--
-- TOC entry 2453 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2472 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;


--
-- TOC entry 2452 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- Completed on 2025-09-30 12:23:20 -03

--
-- PostgreSQL database dump complete
--

\unrestrict Rq0QoRU2uJEe3T9gsXFYPwbBMWfyEhEifcTKo3QgQcsafgOwTAcChqsgRdKKc9B

