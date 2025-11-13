-- Database Performance Optimization: Stored Functions for Atomic Operations
-- Migration: 002_stored_functions.sql
-- Date: 2025-11-12
-- Description: Implements stored functions for atomic operations and complex queries

-- =====================================================
-- STOCK MANAGEMENT FUNCTIONS (ATOMIC OPERATIONS)
-- =====================================================

-- Function: Atomic stock decrement with validation
-- Prevents race conditions and ensures stock never goes negative
CREATE OR REPLACE FUNCTION decrement_product_stock(
    p_product_id UUID,
    p_quantity INTEGER
) RETURNS JSON AS $$
DECLARE
    v_current_stock INTEGER;
    v_updated_stock INTEGER;
    v_product_name TEXT;
BEGIN
    -- Input validation
    IF p_quantity <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Quantity must be positive',
            'product_id', p_product_id
        );
    END IF;

    -- Lock the row for atomic operation
    SELECT stock, name INTO v_current_stock, v_product_name
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    -- Check if product exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found',
            'product_id', p_product_id
        );
    END IF;

    -- Check sufficient stock
    IF v_current_stock < p_quantity THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient stock',
            'product_id', p_product_id,
            'requested', p_quantity,
            'available', v_current_stock,
            'product_name', v_product_name
        );
    END IF;

    -- Atomic stock decrement
    UPDATE products
    SET
        stock = stock - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Get updated stock for confirmation
    GET DIAGNOSTICS v_updated_stock = ROW_COUNT;

    RETURN json_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'previous_stock', v_current_stock,
        'new_stock', v_current_stock - p_quantity,
        'decremented', p_quantity,
        'updated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Atomic stock increment
CREATE OR REPLACE FUNCTION increment_product_stock(
    p_product_id UUID,
    p_quantity INTEGER
) RETURNS JSON AS $$
DECLARE
    v_current_stock INTEGER;
    v_product_name TEXT;
BEGIN
    -- Input validation
    IF p_quantity <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Quantity must be positive',
            'product_id', p_product_id
        );
    END IF;

    -- Lock the row for atomic operation
    SELECT stock, name INTO v_current_stock, v_product_name
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    -- Check if product exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Product not found',
            'product_id', p_product_id
        );
    END IF;

    -- Atomic stock increment
    UPDATE products
    SET
        stock = stock + p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;

    RETURN json_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'previous_stock', v_current_stock,
        'new_stock', v_current_stock + p_quantity,
        'incremented', p_quantity,
        'updated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Batch stock update for multiple products
CREATE OR REPLACE FUNCTION batch_update_stock(
    p_stock_updates JSONB
) RETURNS JSON AS $$
DECLARE
    v_update_record JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_operation TEXT;
    v_results JSONB := '[]'::jsonb;
    v_result JSONB;
BEGIN
    -- Process each stock update
    FOR v_update_record IN SELECT * FROM jsonb_array_elements(p_stock_updates)
    LOOP
        v_product_id := (v_update_record->>'product_id')::UUID;
        v_quantity := (v_update_record->>'quantity')::INTEGER;
        v_operation := COALESCE(v_update_record->>'operation', 'set');

        -- Perform the appropriate operation
        CASE v_operation
            WHEN 'decrement' THEN
                SELECT decrement_product_stock(v_product_id, v_quantity) INTO v_result;
            WHEN 'increment' THEN
                SELECT increment_product_stock(v_product_id, v_quantity) INTO v_result;
            WHEN 'set' THEN
                -- Direct set operation
                UPDATE products
                SET
                    stock = v_quantity,
                    updated_at = NOW()
                WHERE id = v_product_id;

                v_result := json_build_object(
                    'success', true,
                    'product_id', v_product_id,
                    'operation', 'set',
                    'new_stock', v_quantity
                );
            ELSE
                v_result := json_build_object(
                    'success', false,
                    'product_id', v_product_id,
                    'error', 'Invalid operation: ' || v_operation
                );
        END CASE;

        -- Add result to results array
        v_results := v_results || jsonb_build_array(v_result);
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'total_updates', jsonb_array_length(p_stock_updates),
        'results', v_results
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ORDER MANAGEMENT FUNCTIONS (ATOMIC OPERATIONS)
-- =====================================================

-- Function: Create order with items atomically
CREATE OR REPLACE FUNCTION create_order_with_items(
    p_user_id UUID,
    p_customer_email TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_delivery_address TEXT,
    p_delivery_date DATE DEFAULT NULL,
    p_delivery_time_slot TEXT DEFAULT NULL,
    p_delivery_notes TEXT DEFAULT NULL,
    p_currency_rate DECIMAL(10,4) DEFAULT 1.0,
    p_order_items JSONB
) RETURNS JSON AS $$
DECLARE
    v_order_id UUID;
    v_total_usd DECIMAL(10,2) := 0;
    v_total_ves DECIMAL(10,2) := 0;
    v_item_record JSONB;
    v_product_id UUID;
    v_quantity INTEGER;
    v_unit_price_usd DECIMAL(10,2);
    v_unit_price_ves DECIMAL(10,2);
    v_stock_result JSON;
    v_order_result JSON;
BEGIN
    -- Start transaction
    BEGIN
        -- Validate order items exist
        IF jsonb_array_length(p_order_items) = 0 THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Order must contain at least one item'
            );
        END IF;

        -- Calculate totals and validate stock
        FOR v_item_record IN SELECT * FROM jsonb_array_elements(p_order_items)
        LOOP
            v_product_id := (v_item_record->>'product_id')::UUID;
            v_quantity := (v_item_record->>'quantity')::INTEGER;

            -- Get product details and check stock
            SELECT
                price_usd,
                price_ves * p_currency_rate,
                stock,
                name
            INTO v_unit_price_usd, v_unit_price_ves, v_stock_result
            FROM products
            WHERE id = v_product_id AND active = true;

            IF NOT FOUND THEN
                RETURN json_build_object(
                    'success', false,
                    'error', 'Product not found or inactive',
                    'product_id', v_product_id
                );
            END IF;

            -- Check stock availability
            IF (v_stock_result->>'stock')::INTEGER < v_quantity THEN
                RETURN json_build_object(
                    'success', false,
                    'error', 'Insufficient stock',
                    'product_id', v_product_id,
                    'product_name', v_stock_result->>'name',
                    'requested', v_quantity,
                    'available', (v_stock_result->>'stock')::INTEGER
                );
            END IF;

            -- Accumulate totals
            v_total_usd := v_total_usd + (v_unit_price_usd * v_quantity);
            v_total_ves := v_total_ves + (v_unit_price_ves * v_quantity);
        END LOOP;

        -- Create order
        INSERT INTO orders (
            user_id,
            customer_email,
            customer_name,
            customer_phone,
            delivery_address,
            delivery_date,
            delivery_time_slot,
            delivery_notes,
            total_amount_usd,
            total_amount_ves,
            currency_rate,
            status
        ) VALUES (
            p_user_id,
            p_customer_email,
            p_customer_name,
            p_customer_phone,
            p_delivery_address,
            p_delivery_date,
            p_delivery_time_slot,
            p_delivery_notes,
            v_total_usd,
            v_total_ves,
            p_currency_rate,
            'pending'
        ) RETURNING id INTO v_order_id;

        -- Create order items and decrement stock
        FOR v_item_record IN SELECT * FROM jsonb_array_elements(p_order_items)
        LOOP
            v_product_id := (v_item_record->>'product_id')::UUID;
            v_quantity := (v_item_record->>'quantity')::INTEGER;

            -- Get current product details
            SELECT price_usd, price_ves, name
            INTO v_unit_price_usd, v_unit_price_ves, v_stock_result
            FROM products
            WHERE id = v_product_id;

            -- Create order item
            INSERT INTO order_items (
                order_id,
                product_id,
                product_name,
                unit_price_usd,
                unit_price_ves,
                quantity,
                subtotal_usd,
                subtotal_ves
            ) VALUES (
                v_order_id,
                v_product_id,
                v_stock_result->>'name',
                v_unit_price_usd,
                v_unit_price_ves,
                v_quantity,
                v_unit_price_usd * v_quantity,
                v_unit_price_ves * v_quantity
            );

            -- Decrement stock atomically
            SELECT decrement_product_stock(v_product_id, v_quantity) INTO v_stock_result;
            IF NOT (v_stock_result->>'success')::BOOLEAN THEN
                RAISE EXCEPTION 'Stock decrement failed: %', v_stock_result->>'error';
            END IF;
        END LOOP;

        -- Return success result
        RETURN json_build_object(
            'success', true,
            'order_id', v_order_id,
            'total_amount_usd', v_total_usd,
            'total_amount_ves', v_total_ves,
            'item_count', jsonb_array_length(p_order_items),
            'status', 'pending',
            'created_at', NOW()
        );

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback will happen automatically
            RETURN json_build_object(
                'success', false,
                'error', SQLERRM,
                'detail', SQLSTATE
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update order status with history tracking
CREATE OR REPLACE FUNCTION update_order_status_with_history(
    p_order_id UUID,
    p_new_status TEXT,
    p_changed_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_old_status TEXT;
    v_order_exists BOOLEAN;
BEGIN
    -- Validate status
    IF p_new_status NOT IN ('pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid status: ' || p_new_status
        );
    END IF;

    -- Check if order exists and get current status
    SELECT status INTO v_old_status
    FROM orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Order not found',
            'order_id', p_order_id
        );
    END IF;

    -- Prevent invalid status transitions
    IF v_old_status = 'cancelled' AND p_new_status != 'cancelled' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot change status from cancelled'
        );
    END IF;

    IF v_old_status = 'delivered' AND p_new_status != 'delivered' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Cannot change status from delivered'
        );
    END IF;

    -- Start transaction
    BEGIN
        -- Update order status
        UPDATE orders
        SET
            status = p_new_status,
            updated_at = NOW(),
            delivered_at = CASE WHEN p_new_status = 'delivered' THEN NOW() ELSE delivered_at END
        WHERE id = p_order_id;

        -- Record status change in history
        INSERT INTO order_status_history (
            order_id,
            old_status,
            new_status,
            notes,
            changed_by
        ) VALUES (
            p_order_id,
            v_old_status,
            p_new_status,
            p_notes,
            p_changed_by
        );

        -- Return success
        RETURN json_build_object(
            'success', true,
            'order_id', p_order_id,
            'old_status', v_old_status,
            'new_status', p_new_status,
            'updated_at', NOW()
        );

    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object(
                'success', false,
                'error', SQLERRM
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PRODUCT MANAGEMENT FUNCTIONS
-- =====================================================

-- Function: Create product with occasions atomically
CREATE OR REPLACE FUNCTION create_product_with_occasions(
    p_name TEXT,
    p_summary TEXT,
    p_description TEXT,
    p_price_usd DECIMAL(10,2),
    p_price_ves DECIMAL(10,2),
    p_stock INTEGER,
    p_sku TEXT,
    p_active BOOLEAN DEFAULT true,
    p_featured BOOLEAN DEFAULT false,
    p_carousel_order INTEGER DEFAULT NULL,
    p_occasion_ids UUID[] DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_product_id UUID;
    v_occasion_id UUID;
BEGIN
    -- Start transaction
    BEGIN
        -- Validate SKU uniqueness
        IF EXISTS (SELECT 1 FROM products WHERE sku = p_sku) THEN
            RETURN json_build_object(
                'success', false,
                'error', 'SKU already exists',
                'sku', p_sku
            );
        END IF;

        -- Create product
        INSERT INTO products (
            name, summary, description, price_usd, price_ves,
            stock, sku, active, featured, carousel_order,
            name_normalized, description_normalized
        ) VALUES (
            p_name, p_summary, p_description, p_price_usd, p_price_ves,
            p_stock, p_sku, p_active, p_featured, p_carousel_order,
            lower(p_name), lower(COALESCE(p_description, ''))
        ) RETURNING id INTO v_product_id;

        -- Link occasions if provided
        IF p_occasion_ids IS NOT NULL AND array_length(p_occasion_ids, 1) > 0 THEN
            FOREACH v_occasion_id IN ARRAY p_occasion_ids
            LOOP
                INSERT INTO product_occasions (product_id, occasion_id)
                VALUES (v_product_id, v_occasion_id);
            END LOOP;
        END IF;

        -- Return success
        RETURN json_build_object(
            'success', true,
            'product_id', v_product_id,
            'name', p_name,
            'sku', p_sku,
            'occasions_linked', COALESCE(array_length(p_occasion_ids, 1), 0),
            'created_at', NOW()
        );

    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object(
                'success', false,
                'error', SQLERRM
            );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =====================================================

-- Function: Get products by occasion (optimized)
CREATE OR REPLACE FUNCTION get_products_by_occasion(
    p_occasion_id UUID,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    id UUID,
    name TEXT,
    summary TEXT,
    description TEXT,
    price_usd DECIMAL(10,2),
    price_ves DECIMAL(10,2),
    stock INTEGER,
    sku TEXT,
    active BOOLEAN,
    featured BOOLEAN,
    carousel_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id, p.name, p.summary, p.description,
        p.price_usd, p.price_ves, p.stock, p.sku,
        p.active, p.featured, p.carousel_order,
        p.created_at, p.updated_at
    FROM products p
    INNER JOIN product_occasions po ON p.id = po.product_id
    WHERE po.occasion_id = p_occasion_id
    AND p.active = true
    ORDER BY p.featured DESC, p.carousel_order ASC NULLS LAST, p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get products with occasions (optimized join)
CREATE OR REPLACE FUNCTION get_products_with_occasions(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_featured_only BOOLEAN DEFAULT false
) RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_price_usd DECIMAL(10,2),
    product_price_ves DECIMAL(10,2),
    product_stock INTEGER,
    product_featured BOOLEAN,
    product_active BOOLEAN,
    occasions JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        p.price_usd as product_price_usd,
        p.price_ves as product_price_ves,
        p.stock as product_stock,
        p.featured as product_featured,
        p.active as product_active,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', o.id,
                    'name', o.name,
                    'slug', o.slug,
                    'active', o.active
                )
            ) FILTER (WHERE o.id IS NOT NULL),
            '[]'::json
        ) as occasions
    FROM products p
    LEFT JOIN product_occasions po ON p.id = po.product_id
    LEFT JOIN occasions o ON po.occasion_id = o.id
    WHERE p.active = true
    AND (NOT p_featured_only OR p.featured = true)
    GROUP BY p.id, p.name, p.price_usd, p.price_ves, p.stock, p.featured, p.active
    ORDER BY p.featured DESC, p.carousel_order ASC NULLS LAST, p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERFORMANCE MONITORING FUNCTIONS
-- =====================================================

-- Function: Get database performance metrics
CREATE OR REPLACE FUNCTION get_database_performance_metrics()
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'table_sizes', (
            SELECT json_agg(
                json_build_object(
                    'table_name', schemaname || '.' || tablename,
                    'total_size', pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)),
                    'table_size', pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)),
                    'index_size', pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename))
                )
            )
            FROM pg_tables
            WHERE schemaname = 'public'
        ),
        'index_usage', (
            SELECT json_agg(
                json_build_object(
                    'index_name', indexname,
                    'table_name', tablename,
                    'scans', idx_scan,
                    'tuples_read', idx_tup_read,
                    'tuples_fetched', idx_tup_fetch
                )
            )
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            ORDER BY idx_scan DESC
        ),
        'query_stats', (
            SELECT json_agg(
                json_build_object(
                    'query', query,
                    'calls', calls,
                    'total_time', total_time,
                    'mean_time', mean_time,
                    'rows', rows
                )
            )
            FROM pg_stat_statements
            WHERE query LIKE '%products%' OR query LIKE '%orders%'
            ORDER BY total_time DESC
            LIMIT 10
        ),
        'timestamp', NOW()
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

-- Verify functions were created successfully
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'decrement_product_stock',
        'increment_product_stock',
        'batch_update_stock',
        'create_order_with_items',
        'update_order_status_with_history',
        'create_product_with_occasions',
        'get_products_by_occasion',
        'get_products_with_occasions',
        'get_database_performance_metrics'
    );

    RAISE NOTICE 'Created % out of 9 stored functions', function_count;

    IF function_count < 9 THEN
        RAISE WARNING 'Some functions may not have been created. Please check manually.';
    END IF;
END $$;

COMMENT ON SCHEMA public IS 'FloresYa Database - Optimized with atomic stored functions for complex operations';