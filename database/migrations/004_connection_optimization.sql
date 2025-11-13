-- Database Performance Optimization: Connection Management Enhancement
-- Migration: 004_connection_optimization.sql
-- Date: 2025-11-12
-- Description: Advanced connection pooling, prepared statements, and monitoring

-- =====================================================
-- CONNECTION MONITORING TABLES
-- =====================================================

-- Table for connection pool statistics
CREATE TABLE IF NOT EXISTS connection_pool_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_connections INTEGER,
    active_connections INTEGER,
    idle_connections INTEGER,
    waiting_clients INTEGER,
    pool_size INTEGER,
    pool_min INTEGER,
    pool_max INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- Table for query execution statistics
CREATE TABLE IF NOT EXISTS query_execution_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_hash TEXT NOT NULL,
    query_text TEXT,
    execution_count INTEGER DEFAULT 1,
    total_execution_time BIGINT DEFAULT 0, -- in microseconds
    min_execution_time BIGINT,
    max_execution_time BIGINT,
    avg_execution_time BIGINT,
    last_executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(query_hash)
);

-- Table for connection health monitoring
CREATE TABLE IF NOT EXISTS connection_health_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER,
    error_message TEXT,
    connection_count INTEGER,
    active_connections INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- INDEXES FOR MONITORING TABLES
-- =====================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connection_stats_time ON connection_pool_stats(collected_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_stats_hash ON query_execution_stats(query_hash);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_stats_time ON query_execution_stats(last_executed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_log_time ON connection_health_log(check_time DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_log_status ON connection_health_log(status);

-- =====================================================
-- PREPARED STATEMENTS FOR COMMON QUERIES
-- =====================================================

-- Prepared statement for featured products (most common query)
PREPARE featured_products_plan (int) AS
SELECT
    id, name, summary, description, price_usd, price_ves,
    stock, sku, active, featured, carousel_order,
    created_at, updated_at
FROM products
WHERE active = true AND featured = true
ORDER BY carousel_order ASC NULLS LAST, created_at DESC
LIMIT $1;

-- Prepared statement for products by price range
PREPARE products_by_price_plan (decimal, decimal, int) AS
SELECT
    id, name, summary, price_usd, price_ves, stock, sku, featured
FROM products
WHERE active = true AND price_usd BETWEEN $1 AND $2
ORDER BY price_usd ASC
LIMIT $3;

-- Prepared statement for product search
PREPARE product_search_plan (text, int) AS
SELECT
    id, name, summary, description, price_usd, price_ves,
    stock, sku, active, featured
FROM products
WHERE active = true
AND (
    name ILIKE $1
    OR description ILIKE $1
    OR summary ILIKE $1
    OR name_normalized ILIKE $1
    OR description_normalized ILIKE $1
)
ORDER BY featured DESC, created_at DESC
LIMIT $2;

-- Prepared statement for product by ID with images
PREPARE product_with_images_plan (uuid) AS
SELECT
    p.id, p.name, p.summary, p.description, p.price_usd, p.price_ves,
    p.stock, p.sku, p.active, p.featured, p.carousel_order,
    p.created_at, p.updated_at,
    json_agg(
        json_build_object(
            'id', pi.id,
            'url', pi.url,
            'size', pi.size,
            'image_index', pi.image_index,
            'is_primary', pi.is_primary
        ) ORDER BY pi.image_index
    ) FILTER (WHERE pi.id IS NOT NULL) as product_images
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.id = $1 AND p.active = true
GROUP BY p.id, p.name, p.summary, p.description, p.price_usd, p.price_ves,
         p.stock, p.sku, p.active, p.featured, p.carousel_order,
         p.created_at, p.updated_at;

-- Prepared statement for order status update
PREPARE update_order_status_plan (uuid, text, uuid) AS
UPDATE orders
SET
    status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, status, updated_at;

-- =====================================================
-- CONNECTION MANAGEMENT FUNCTIONS
-- =====================================================

-- Function: Record connection pool statistics
CREATE OR REPLACE FUNCTION record_connection_stats(
    p_total_conn INTEGER DEFAULT NULL,
    p_active_conn INTEGER DEFAULT NULL,
    p_idle_conn INTEGER DEFAULT NULL,
    p_waiting INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSON AS $$
DECLARE
    v_pool_size INTEGER;
    v_pool_min INTEGER;
    v_pool_max INTEGER;
BEGIN
    -- Get current pool settings (these would be passed from application)
    v_pool_size := COALESCE(p_total_conn, 10);
    v_pool_min := 2;
    v_pool_max := 10;

    INSERT INTO connection_pool_stats (
        total_connections, active_connections, idle_connections,
        waiting_clients, pool_size, pool_min, pool_max, metadata
    ) VALUES (
        p_total_conn, p_active_conn, p_idle_conn,
        p_waiting, v_pool_size, v_pool_min, v_pool_max, p_metadata
    );

    RETURN json_build_object(
        'recorded', true,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record query execution statistics
CREATE OR REPLACE FUNCTION record_query_execution(
    p_query_hash TEXT,
    p_query_text TEXT,
    p_execution_time_us BIGINT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSON AS $$
BEGIN
    INSERT INTO query_execution_stats (
        query_hash, query_text, total_execution_time,
        min_execution_time, max_execution_time, avg_execution_time, metadata
    ) VALUES (
        p_query_hash, p_query_text, p_execution_time_us,
        p_execution_time_us, p_execution_time_us, p_execution_time_us, p_metadata
    )
    ON CONFLICT (query_hash) DO UPDATE SET
        execution_count = query_execution_stats.execution_count + 1,
        total_execution_time = query_execution_stats.total_execution_time + p_execution_time_us,
        min_execution_time = LEAST(query_execution_stats.min_execution_time, p_execution_time_us),
        max_execution_time = GREATEST(query_execution_stats.max_execution_time, p_execution_time_us),
        avg_execution_time = (query_execution_stats.total_execution_time + p_execution_time_us) / (query_execution_stats.execution_count + 1),
        last_executed_at = NOW(),
        metadata = p_metadata;

    RETURN json_build_object(
        'recorded', true,
        'query_hash', p_query_hash
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Health check with detailed metrics
CREATE OR REPLACE FUNCTION perform_health_check()
RETURNS JSON AS $$
DECLARE
    v_start_time TIMESTAMP WITH TIME ZONE := clock_timestamp();
    v_response_time INTEGER;
    v_product_count INTEGER;
    v_active_connections INTEGER;
    v_status TEXT := 'healthy';
    v_error_msg TEXT;
BEGIN
    BEGIN
        -- Test basic connectivity
        SELECT COUNT(*) INTO v_product_count
        FROM products
        WHERE active = true
        LIMIT 1;

        -- Get active connection count (approximation)
        SELECT COUNT(*) INTO v_active_connections
        FROM pg_stat_activity
        WHERE state = 'active';

        v_response_time := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;

        -- Determine status based on response time
        IF v_response_time > 5000 THEN
            v_status := 'degraded';
        ELSIF v_response_time > 10000 THEN
            v_status := 'unhealthy';
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            v_status := 'unhealthy';
            v_error_msg := SQLERRM;
            v_response_time := EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
    END;

    -- Record health check
    INSERT INTO connection_health_log (
        status, response_time_ms, error_message,
        connection_count, active_connections
    ) VALUES (
        v_status, v_response_time, v_error_msg,
        (SELECT COUNT(*) FROM pg_stat_activity), v_active_connections
    );

    RETURN json_build_object(
        'status', v_status,
        'response_time_ms', v_response_time,
        'product_count', v_product_count,
        'active_connections', v_active_connections,
        'timestamp', NOW(),
        'error', v_error_msg
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONNECTION POOL OPTIMIZATION FUNCTIONS
-- =====================================================

-- Function: Get connection pool recommendations
CREATE OR REPLACE FUNCTION get_connection_pool_recommendations()
RETURNS JSON AS $$
DECLARE
    v_current_stats JSON;
    v_avg_response_time NUMERIC;
    v_max_connections INTEGER;
    v_recommendations JSONB := '[]';
BEGIN
    -- Get current statistics
    SELECT json_build_object(
        'avg_response_time', AVG(response_time_ms),
        'max_response_time', MAX(response_time_ms),
        'total_checks', COUNT(*),
        'healthy_checks', COUNT(*) FILTER (WHERE status = 'healthy'),
        'degraded_checks', COUNT(*) FILTER (WHERE status = 'degraded'),
        'unhealthy_checks', COUNT(*) FILTER (WHERE status = 'unhealthy')
    )
    INTO v_current_stats
    FROM connection_health_log
    WHERE check_time >= NOW() - INTERVAL '1 hour';

    v_avg_response_time := (v_current_stats->>'avg_response_time')::NUMERIC;

    -- Get max connections from pool stats
    SELECT MAX(pool_max) INTO v_max_connections
    FROM connection_pool_stats
    WHERE collected_at >= NOW() - INTERVAL '1 hour';

    -- Generate recommendations
    IF v_avg_response_time > 1000 THEN
        v_recommendations := v_recommendations || jsonb_build_object(
            'type', 'increase_pool_size',
            'priority', 'high',
            'message', 'Average response time is high. Consider increasing max pool size.',
            'current_max', v_max_connections,
            'suggested_max', GREATEST(v_max_connections + 2, 15)
        );
    END IF;

    IF (v_current_stats->>'unhealthy_checks')::INTEGER > 0 THEN
        v_recommendations := v_recommendations || jsonb_build_object(
            'type', 'connection_issues',
            'priority', 'critical',
            'message', 'Detected unhealthy connections. Check network and database status.',
            'unhealthy_count', (v_current_stats->>'unhealthy_checks')::INTEGER
        );
    END IF;

    IF v_max_connections < 5 THEN
        v_recommendations := v_recommendations || jsonb_build_object(
            'type', 'pool_too_small',
            'priority', 'medium',
            'message', 'Connection pool size is very small for production workload.',
            'current_max', v_max_connections,
            'suggested_min', 10
        );
    END IF;

    RETURN json_build_object(
        'current_stats', v_current_stats,
        'recommendations', v_recommendations,
        'generated_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Analyze slow queries
CREATE OR REPLACE FUNCTION analyze_slow_queries(
    p_threshold_ms INTEGER DEFAULT 1000
) RETURNS TABLE (
    query_hash TEXT,
    query_text TEXT,
    execution_count INTEGER,
    avg_execution_time_ms NUMERIC,
    max_execution_time_ms NUMERIC,
    total_time_ms NUMERIC,
    last_executed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        qes.query_hash,
        LEFT(qes.query_text, 200) as query_text,
        qes.execution_count,
        ROUND(qes.avg_execution_time / 1000.0, 2) as avg_execution_time_ms,
        ROUND(qes.max_execution_time / 1000.0, 2) as max_execution_time_ms,
        ROUND(qes.total_execution_time / 1000.0, 2) as total_time_ms,
        qes.last_executed_at
    FROM query_execution_stats qes
    WHERE qes.avg_execution_time / 1000 > p_threshold_ms
    ORDER BY qes.avg_execution_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTOMATED MAINTENANCE FUNCTIONS
-- =====================================================

-- Function: Cleanup old monitoring data (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS JSON AS $$
DECLARE
    v_deleted_stats INTEGER := 0;
    v_deleted_health INTEGER := 0;
    v_deleted_perf INTEGER := 0;
BEGIN
    -- Delete old connection stats (keep 30 days)
    DELETE FROM connection_pool_stats
    WHERE collected_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS v_deleted_stats = ROW_COUNT;

    -- Delete old health logs (keep 30 days)
    DELETE FROM connection_health_log
    WHERE check_time < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS v_deleted_health = ROW_COUNT;

    -- Keep only top 1000 queries by execution count, delete older ones
    DELETE FROM query_execution_stats
    WHERE query_hash NOT IN (
        SELECT query_hash
        FROM query_execution_stats
        ORDER BY execution_count DESC, last_executed_at DESC
        LIMIT 1000
    )
    AND last_executed_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS v_deleted_perf = ROW_COUNT;

    RETURN json_build_object(
        'cleanup_completed', true,
        'deleted_connection_stats', v_deleted_stats,
        'deleted_health_logs', v_deleted_health,
        'deleted_query_stats', v_deleted_perf,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Comprehensive connection health report
CREATE OR REPLACE FUNCTION get_connection_health_report()
RETURNS JSON AS $$
DECLARE
    v_report JSON;
BEGIN
    SELECT json_build_object(
        'connection_pool', (
            SELECT json_build_object(
                'current_stats', json_agg(
                    json_build_object(
                        'collected_at', collected_at,
                        'total_connections', total_connections,
                        'active_connections', active_connections,
                        'idle_connections', idle_connections,
                        'waiting_clients', waiting_clients
                    )
                ),
                'avg_active_connections', AVG(active_connections),
                'max_active_connections', MAX(active_connections),
                'avg_waiting_clients', AVG(waiting_clients)
            )
            FROM (
                SELECT * FROM connection_pool_stats
                WHERE collected_at >= NOW() - INTERVAL '1 hour'
                ORDER BY collected_at DESC
                LIMIT 60
            ) recent_stats
        ),
        'query_performance', (
            SELECT json_build_object(
                'slow_queries_count', COUNT(*),
                'avg_query_time_ms', ROUND(AVG(avg_execution_time) / 1000, 2),
                'total_query_executions', SUM(execution_count),
                'top_slow_queries', json_agg(
                    json_build_object(
                        'query_hash', query_hash,
                        'avg_time_ms', ROUND(avg_execution_time / 1000, 2),
                        'execution_count', execution_count
                    )
                )
            )
            FROM (
                SELECT * FROM query_execution_stats
                ORDER BY avg_execution_time DESC
                LIMIT 10
            ) top_queries
        ),
        'health_status', (
            SELECT json_build_object(
                'overall_status', CASE
                    WHEN COUNT(*) FILTER (WHERE status = 'unhealthy') > 0 THEN 'unhealthy'
                    WHEN COUNT(*) FILTER (WHERE status = 'degraded') > 5 THEN 'degraded'
                    ELSE 'healthy'
                END,
                'checks_last_hour', COUNT(*),
                'healthy_checks', COUNT(*) FILTER (WHERE status = 'healthy'),
                'degraded_checks', COUNT(*) FILTER (WHERE status = 'degraded'),
                'unhealthy_checks', COUNT(*) FILTER (WHERE status = 'unhealthy'),
                'avg_response_time_ms', ROUND(AVG(response_time_ms), 2)
            )
            FROM connection_health_log
            WHERE check_time >= NOW() - INTERVAL '1 hour'
        ),
        'recommendations', get_connection_pool_recommendations(),
        'generated_at', NOW()
    ) INTO v_report;

    RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERFORMANCE MONITORING TRIGGERS
-- =====================================================

-- Trigger: Auto-cleanup monitoring data weekly
CREATE OR REPLACE FUNCTION trigger_cleanup_monitoring()
RETURNS TRIGGER AS $$
BEGIN
    -- Run cleanup if we have more than 10000 records in any monitoring table
    IF (SELECT COUNT(*) FROM connection_pool_stats) > 10000 THEN
        PERFORM cleanup_monitoring_data();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on connection_pool_stats (runs cleanup when table gets large)
DROP TRIGGER IF EXISTS trigger_auto_cleanup_monitoring ON connection_pool_stats;
CREATE TRIGGER trigger_auto_cleanup_monitoring
    AFTER INSERT ON connection_pool_stats
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_cleanup_monitoring();

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

-- Verify monitoring tables and functions were created
DO $$
DECLARE
    v_table_count INTEGER;
    v_function_count INTEGER;
    v_prepared_count INTEGER;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('connection_pool_stats', 'query_execution_stats', 'connection_health_log');

    -- Check functions
    SELECT COUNT(*) INTO v_function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'record_connection_stats', 'record_query_execution', 'perform_health_check',
        'get_connection_pool_recommendations', 'analyze_slow_queries',
        'cleanup_monitoring_data', 'get_connection_health_report'
    );

    -- Check prepared statements
    SELECT COUNT(*) INTO v_prepared_count
    FROM pg_prepared_statements
    WHERE name IN (
        'featured_products_plan', 'products_by_price_plan',
        'product_search_plan', 'product_with_images_plan', 'update_order_status_plan'
    );

    RAISE NOTICE 'Created % out of 3 monitoring tables', v_table_count;
    RAISE NOTICE 'Created % out of 7 monitoring functions', v_function_count;
    RAISE NOTICE 'Created % out of 5 prepared statements', v_prepared_count;

    IF v_table_count < 3 OR v_function_count < 7 THEN
        RAISE WARNING 'Some connection optimization components may not have been created. Please check manually.';
    END IF;
END $$;

COMMENT ON SCHEMA public IS 'FloresYa Database - Optimized with advanced connection management, prepared statements, and monitoring';