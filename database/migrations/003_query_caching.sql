-- Database Performance Optimization: Query Result Caching System
-- Migration: 003_query_caching.sql
-- Date: 2025-11-12
-- Description: Implements database-level query result caching with TTL and invalidation

-- =====================================================
-- QUERY CACHE TABLES
-- =====================================================

-- Table for storing cached query results
CREATE TABLE IF NOT EXISTS query_cache (
    cache_key TEXT PRIMARY KEY,
    query_hash TEXT NOT NULL,
    result_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    query_metadata JSONB DEFAULT '{}',
    cache_tags TEXT[] DEFAULT '{}'
);

-- Table for cache invalidation tags
CREATE TABLE IF NOT EXISTS cache_invalidation_tags (
    tag TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_invalidated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invalidation_count INTEGER DEFAULT 0
);

-- Table for cache performance metrics
CREATE TABLE IF NOT EXISTS cache_performance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('hit', 'miss', 'set', 'invalidate')),
    response_time_ms INTEGER,
    result_size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR CACHE TABLES
-- =====================================================

-- Indexes for query_cache
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_cache_expires_at ON query_cache(expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_cache_query_hash ON query_cache(query_hash);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_cache_last_accessed ON query_cache(last_accessed);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_cache_tags ON query_cache USING GIN(cache_tags);

-- Indexes for cache_invalidation_tags
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cache_tags_last_invalidated ON cache_invalidation_tags(last_invalidated);

-- Indexes for cache_performance_log
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cache_perf_operation ON cache_performance_log(operation);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cache_perf_created_at ON cache_performance_log(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cache_perf_cache_key ON cache_performance_log(cache_key);

-- =====================================================
-- CACHE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function: Get cached query result
CREATE OR REPLACE FUNCTION get_cached_query_result(
    p_cache_key TEXT,
    p_query_hash TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_result JSONB;
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
    -- Try to get from cache
    SELECT result_data, expires_at INTO v_result, v_expires_at
    FROM query_cache
    WHERE cache_key = p_cache_key
    AND expires_at > NOW()
    FOR UPDATE SKIP LOCKED;

    IF FOUND THEN
        -- Update access statistics
        UPDATE query_cache
        SET
            access_count = access_count + 1,
            last_accessed = NOW()
        WHERE cache_key = p_cache_key;

        -- Log cache hit
        INSERT INTO cache_performance_log (
            cache_key, operation, response_time_ms, result_size_bytes
        ) VALUES (
            p_cache_key,
            'hit',
            EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
            pg_column_size(v_result)
        );

        RETURN json_build_object(
            'success', true,
            'cached', true,
            'data', v_result,
            'expires_at', v_expires_at
        );
    ELSE
        -- Log cache miss
        INSERT INTO cache_performance_log (
            cache_key, operation, response_time_ms
        ) VALUES (
            p_cache_key,
            'miss',
            EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000
        );

        RETURN json_build_object(
            'success', false,
            'cached', false,
            'message', 'Cache miss'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Set cached query result
CREATE OR REPLACE FUNCTION set_cached_query_result(
    p_cache_key TEXT,
    p_query_hash TEXT,
    p_result_data JSONB,
    p_ttl_seconds INTEGER DEFAULT 300,
    p_cache_tags TEXT[] DEFAULT '{}',
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSON AS $$
DECLARE
    v_expires_at TIMESTAMP WITH TIME ZONE;
    v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
    v_expires_at := NOW() + INTERVAL '1 second' * p_ttl_seconds;

    -- Insert or update cache entry
    INSERT INTO query_cache (
        cache_key, query_hash, result_data, expires_at, query_metadata, cache_tags
    ) VALUES (
        p_cache_key, p_query_hash, p_result_data, v_expires_at, p_metadata, p_cache_tags
    )
    ON CONFLICT (cache_key) DO UPDATE SET
        query_hash = EXCLUDED.query_hash,
        result_data = EXCLUDED.result_data,
        expires_at = EXCLUDED.expires_at,
        query_metadata = EXCLUDED.query_metadata,
        cache_tags = EXCLUDED.cache_tags,
        created_at = NOW(),
        access_count = 0,
        last_accessed = NOW();

    -- Update invalidation tags
    IF array_length(p_cache_tags, 1) > 0 THEN
        INSERT INTO cache_invalidation_tags (tag)
        SELECT unnest(p_cache_tags)
        ON CONFLICT (tag) DO NOTHING;
    END IF;

    -- Log cache set
    INSERT INTO cache_performance_log (
        cache_key, operation, response_time_ms, result_size_bytes
    ) VALUES (
        p_cache_key,
        'set',
        EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
        pg_column_size(p_result_data)
    );

    RETURN json_build_object(
        'success', true,
        'cache_key', p_cache_key,
        'expires_at', v_expires_at,
        'ttl_seconds', p_ttl_seconds
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Invalidate cache by tags
CREATE OR REPLACE FUNCTION invalidate_cache_by_tags(
    p_tags TEXT[]
) RETURNS JSON AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
    -- Delete cache entries with matching tags
    WITH deleted_entries AS (
        DELETE FROM query_cache
        WHERE cache_tags && p_tags
        RETURNING cache_key
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_entries;

    -- Update invalidation tags
    UPDATE cache_invalidation_tags
    SET
        last_invalidated = NOW(),
        invalidation_count = invalidation_count + 1
    WHERE tag = ANY(p_tags);

    -- Log invalidation
    INSERT INTO cache_performance_log (
        cache_key, operation, response_time_ms
    ) SELECT
        'tag_invalidation:' || unnest(p_tags),
        'invalidate',
        EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;

    RETURN json_build_object(
        'success', true,
        'tags_invalidated', p_tags,
        'entries_deleted', v_deleted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Invalidate specific cache key
CREATE OR REPLACE FUNCTION invalidate_cache_key(
    p_cache_key TEXT
) RETURNS JSON AS $$
DECLARE
    v_deleted BOOLEAN := false;
    v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
    -- Delete specific cache entry
    DELETE FROM query_cache WHERE cache_key = p_cache_key;

    GET DIAGNOSTICS v_deleted = ROW_COUNT > 0;

    -- Log invalidation
    INSERT INTO cache_performance_log (
        cache_key, operation, response_time_ms
    ) VALUES (
        p_cache_key,
        'invalidate',
        EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000
    );

    RETURN json_build_object(
        'success', true,
        'cache_key', p_cache_key,
        'deleted', v_deleted
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clean expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS JSON AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
BEGIN
    -- Delete expired entries
    WITH deleted_entries AS (
        DELETE FROM query_cache
        WHERE expires_at <= NOW()
        RETURNING cache_key
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_entries;

    RETURN json_build_object(
        'success', true,
        'expired_entries_cleaned', v_deleted_count,
        'cleanup_time_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SPECIFIC QUERY CACHING FUNCTIONS
-- =====================================================

-- Function: Cached featured products query
CREATE OR REPLACE FUNCTION get_cached_featured_products(
    p_limit INTEGER DEFAULT 10
) RETURNS JSON AS $$
DECLARE
    v_cache_key TEXT;
    v_query_hash TEXT;
    v_cache_result JSON;
    v_fresh_data JSONB;
BEGIN
    -- Generate cache key
    v_cache_key := 'featured_products:limit:' || p_limit;
    v_query_hash := 'featured_products_v1';

    -- Try cache first
    SELECT get_cached_query_result(v_cache_key, v_query_hash) INTO v_cache_result;

    IF (v_cache_result->>'success')::BOOLEAN AND (v_cache_result->>'cached')::BOOLEAN THEN
        RETURN v_cache_result;
    END IF;

    -- Cache miss - get fresh data
    SELECT jsonb_agg(
        json_build_object(
            'id', p.id,
            'name', p.name,
            'summary', p.summary,
            'price_usd', p.price_usd,
            'price_ves', p.price_ves,
            'stock', p.stock,
            'sku', p.sku,
            'carousel_order', p.carousel_order
        )
    )
    INTO v_fresh_data
    FROM products p
    WHERE p.active = true AND p.featured = true
    ORDER BY p.carousel_order ASC NULLS LAST, p.created_at DESC
    LIMIT p_limit;

    -- Cache the result
    PERFORM set_cached_query_result(
        v_cache_key,
        v_query_hash,
        COALESCE(v_fresh_data, '[]'::jsonb),
        1800, -- 30 minutes TTL
        ARRAY['products', 'featured'],
        json_build_object('limit', p_limit, 'query_type', 'featured_products')
    );

    RETURN json_build_object(
        'success', true,
        'cached', false,
        'data', COALESCE(v_fresh_data, '[]'::jsonb),
        'count', jsonb_array_length(COALESCE(v_fresh_data, '[]'::jsonb))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Cached products by price range
CREATE OR REPLACE FUNCTION get_cached_products_by_price_range(
    p_min_price DECIMAL(10,2) DEFAULT 0,
    p_max_price DECIMAL(10,2) DEFAULT 999999,
    p_limit INTEGER DEFAULT 50
) RETURNS JSON AS $$
DECLARE
    v_cache_key TEXT;
    v_query_hash TEXT;
    v_cache_result JSON;
    v_fresh_data JSONB;
BEGIN
    -- Generate cache key
    v_cache_key := format('products_price_range:min:%s:max:%s:limit:%s',
                         replace(p_min_price::text, '.', '_'),
                         replace(p_max_price::text, '.', '_'),
                         p_limit);
    v_query_hash := 'products_price_range_v1';

    -- Try cache first
    SELECT get_cached_query_result(v_cache_key, v_query_hash) INTO v_cache_result;

    IF (v_cache_result->>'success')::BOOLEAN AND (v_cache_result->>'cached')::BOOLEAN THEN
        RETURN v_cache_result;
    END IF;

    -- Cache miss - get fresh data
    SELECT jsonb_agg(
        json_build_object(
            'id', p.id,
            'name', p.name,
            'summary', p.summary,
            'price_usd', p.price_usd,
            'price_ves', p.price_ves,
            'stock', p.stock,
            'sku', p.sku,
            'featured', p.featured
        )
    )
    INTO v_fresh_data
    FROM products p
    WHERE p.active = true
    AND p.price_usd BETWEEN p_min_price AND p_max_price
    ORDER BY p.price_usd ASC
    LIMIT p_limit;

    -- Cache the result
    PERFORM set_cached_query_result(
        v_cache_key,
        v_query_hash,
        COALESCE(v_fresh_data, '[]'::jsonb),
        600, -- 10 minutes TTL
        ARRAY['products', 'price_range'],
        json_build_object(
            'min_price', p_min_price,
            'max_price', p_max_price,
            'limit', p_limit,
            'query_type', 'price_range'
        )
    );

    RETURN json_build_object(
        'success', true,
        'cached', false,
        'data', COALESCE(v_fresh_data, '[]'::jsonb),
        'count', jsonb_array_length(COALESCE(v_fresh_data, '[]'::jsonb))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CACHE INVALIDATION TRIGGERS
-- =====================================================

-- Trigger: Invalidate product-related cache when products change
CREATE OR REPLACE FUNCTION invalidate_product_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate product-related cache tags
    PERFORM invalidate_cache_by_tags(ARRAY['products', 'featured', 'price_range']);

    -- Also invalidate specific product cache
    IF TG_OP = 'UPDATE' AND OLD.id != NEW.id THEN
        PERFORM invalidate_cache_key('product:id:' || OLD.id);
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        PERFORM invalidate_cache_key('product:id:' || NEW.id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table
DROP TRIGGER IF EXISTS trigger_invalidate_product_cache ON products;
CREATE TRIGGER trigger_invalidate_product_cache
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION invalidate_product_cache();

-- Trigger: Invalidate occasion-related cache when product_occasions change
CREATE OR REPLACE FUNCTION invalidate_occasion_cache()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM invalidate_cache_by_tags(ARRAY['products', 'occasions']);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to product_occasions table
DROP TRIGGER IF EXISTS trigger_invalidate_occasion_cache ON product_occasions;
CREATE TRIGGER trigger_invalidate_occasion_cache
    AFTER INSERT OR UPDATE OR DELETE ON product_occasions
    FOR EACH ROW EXECUTE FUNCTION invalidate_occasion_cache();

-- =====================================================
-- CACHE MONITORING FUNCTIONS
-- =====================================================

-- Function: Get cache performance statistics
CREATE OR REPLACE FUNCTION get_cache_performance_stats()
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'total_entries', (SELECT COUNT(*) FROM query_cache),
        'expired_entries', (SELECT COUNT(*) FROM query_cache WHERE expires_at <= NOW()),
        'active_entries', (SELECT COUNT(*) FROM query_cache WHERE expires_at > NOW()),
        'total_size_bytes', (SELECT COALESCE(SUM(pg_column_size(result_data)), 0) FROM query_cache),
        'hit_rate_last_24h', (
            SELECT CASE
                WHEN (hits.total + misses.total) > 0
                THEN ROUND((hits.total::DECIMAL / (hits.total + misses.total)) * 100, 2)
                ELSE 0
            END
            FROM (
                SELECT COUNT(*) as total FROM cache_performance_log
                WHERE operation = 'hit' AND created_at >= NOW() - INTERVAL '24 hours'
            ) hits,
            (
                SELECT COUNT(*) as total FROM cache_performance_log
                WHERE operation = 'miss' AND created_at >= NOW() - INTERVAL '24 hours'
            ) misses
        ),
        'performance_by_operation', (
            SELECT json_object_agg(
                operation,
                json_build_object(
                    'count', op_count,
                    'avg_response_time', avg_time,
                    'total_response_time', total_time
                )
            )
            FROM (
                SELECT
                    operation,
                    COUNT(*) as op_count,
                    ROUND(AVG(response_time_ms), 2) as avg_time,
                    SUM(response_time_ms) as total_time
                FROM cache_performance_log
                WHERE created_at >= NOW() - INTERVAL '24 hours'
                GROUP BY operation
            ) ops
        ),
        'top_cache_keys', (
            SELECT json_agg(
                json_build_object(
                    'cache_key', cache_key,
                    'access_count', access_count,
                    'size_bytes', pg_column_size(result_data),
                    'expires_at', expires_at
                )
            )
            FROM query_cache
            WHERE expires_at > NOW()
            ORDER BY access_count DESC
            LIMIT 10
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTOMATED CACHE MAINTENANCE
-- =====================================================

-- Function: Automated cache cleanup (call via cron or scheduled job)
CREATE OR REPLACE FUNCTION perform_cache_maintenance()
RETURNS JSON AS $$
DECLARE
    v_cleanup_result JSON;
    v_stats_result JSON;
BEGIN
    -- Clean expired entries
    SELECT cleanup_expired_cache() INTO v_cleanup_result;

    -- Get current stats
    SELECT get_cache_performance_stats() INTO v_stats_result;

    RETURN json_build_object(
        'maintenance_completed', true,
        'timestamp', NOW(),
        'cleanup_result', v_cleanup_result,
        'current_stats', v_stats_result
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

-- Verify cache tables and functions were created
DO $$
DECLARE
    v_table_count INTEGER;
    v_function_count INTEGER;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('query_cache', 'cache_invalidation_tags', 'cache_performance_log');

    -- Check functions
    SELECT COUNT(*) INTO v_function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'get_cached_query_result', 'set_cached_query_result', 'invalidate_cache_by_tags',
        'invalidate_cache_key', 'cleanup_expired_cache', 'get_cached_featured_products',
        'get_cached_products_by_price_range', 'get_cache_performance_stats', 'perform_cache_maintenance'
    );

    RAISE NOTICE 'Created % out of 3 cache tables', v_table_count;
    RAISE NOTICE 'Created % out of 9 cache functions', v_function_count;

    IF v_table_count < 3 OR v_function_count < 9 THEN
        RAISE WARNING 'Some cache components may not have been created. Please check manually.';
    END IF;
END $$;

COMMENT ON SCHEMA public IS 'FloresYa Database - Optimized with database-level query caching system';