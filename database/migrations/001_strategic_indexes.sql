-- Database Performance Optimization: Strategic Indexing Migration
-- Migration: 001_strategic_indexes.sql
-- Date: 2025-11-12
-- Description: Adds compound indexes for common query patterns identified in QA audit

-- =====================================================
-- STRATEGIC INDEXES FOR COMMON QUERY PATTERNS
-- =====================================================

-- Index 1: featured + active (most common pattern for featured products)
-- Used in: ProductRepository.findFeatured(), findAllWithFilters() with featured=true
-- Performance impact: Eliminates need for separate WHERE clauses on featured and active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured_active
ON products(featured, active)
WHERE featured = true AND active = true;

-- Index 2: active + featured (alternative order for different query patterns)
-- Used in: General product listings that filter by active first, then featured
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_featured
ON products(active, featured)
WHERE active = true;

-- Index 3: price_usd + active (for price range queries on active products)
-- Used in: ProductRepository.findAllWithFilters() with price_min/price_max filters
-- Performance impact: Enables efficient range queries on price for active products only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_active
ON products(price_usd, active)
WHERE active = true;

-- Index 4: product_id + size (for product images queries)
-- Used in: ProductRepository.findByIdWithImages(), product image filtering by size
-- Performance impact: Optimizes image queries that filter by product and size
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_size
ON product_images(product_id, size);

-- Index 5: product_id + is_primary (for primary image queries)
-- Used in: Finding primary images for products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_primary
ON product_images(product_id, is_primary)
WHERE is_primary = true;

-- Index 6: active + created_at (for recent active products)
-- Used in: Product listings sorted by creation date for active products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_created
ON products(active, created_at DESC)
WHERE active = true;

-- Index 7: featured + carousel_order (for featured product ordering)
-- Used in: ProductRepository.findFeatured() with carousel_order sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured_carousel
ON products(featured, carousel_order)
WHERE featured = true;

-- Index 8: order_id + created_at (for order items chronological queries)
-- Used in: Order item queries sorted by creation time
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_created
ON order_items(order_id, created_at);

-- Index 9: user_id + status (for user order status queries)
-- Used in: Finding orders by user and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status
ON orders(user_id, status);

-- Index 10: status + created_at (for order status listings)
-- Used in: Order listings filtered by status and sorted by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created
ON orders(status, created_at DESC);

-- =====================================================
-- INDEX MAINTENANCE AND MONITORING
-- =====================================================

-- Function to analyze index usage (for monitoring)
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE (
    schemaname text,
    tablename text,
    indexname text,
    idx_scan bigint,
    idx_tup_read bigint,
    idx_tup_fetch bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.schemaname::text,
        ps.tablename::text,
        ps.indexname::text,
        ps.idx_scan,
        ps.idx_tup_read,
        ps.idx_tup_fetch
    FROM pg_stat_user_indexes ps
    WHERE ps.schemaname = 'public'
    ORDER BY ps.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to identify unused indexes (potential cleanup candidates)
CREATE OR REPLACE FUNCTION get_unused_indexes()
RETURNS TABLE (
    schemaname text,
    tablename text,
    indexname text,
    idx_scan bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.schemaname::text,
        ps.tablename::text,
        ps.indexname::text,
        ps.idx_scan
    FROM pg_stat_user_indexes ps
    WHERE ps.schemaname = 'public'
    AND ps.idx_scan = 0
    ORDER BY ps.tablename, ps.indexname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

-- Verify indexes were created successfully
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname IN (
        'idx_products_featured_active',
        'idx_products_active_featured',
        'idx_products_price_active',
        'idx_product_images_product_size',
        'idx_product_images_product_primary',
        'idx_products_active_created',
        'idx_products_featured_carousel',
        'idx_order_items_order_created',
        'idx_orders_user_status',
        'idx_orders_status_created'
    );

    RAISE NOTICE 'Created % out of 10 strategic indexes', index_count;

    IF index_count < 10 THEN
        RAISE WARNING 'Some indexes may not have been created. Please check manually.';
    END IF;
END $$;

-- =====================================================
-- PERFORMANCE BASELINE QUERIES
-- =====================================================

-- Store baseline query performance for comparison
-- These queries can be run before and after migration to measure improvement

/*
-- Query 1: Featured products (should use idx_products_featured_active)
EXPLAIN ANALYZE
SELECT id, name, price_usd, price_ves
FROM products
WHERE featured = true AND active = true
ORDER BY carousel_order
LIMIT 10;

-- Query 2: Price range on active products (should use idx_products_price_active)
EXPLAIN ANALYZE
SELECT id, name, price_usd, price_ves
FROM products
WHERE active = true AND price_usd BETWEEN 10 AND 50
ORDER BY price_usd;

-- Query 3: Product images by product and size (should use idx_product_images_product_size)
EXPLAIN ANALYZE
SELECT id, url, size
FROM product_images
WHERE product_id = 'some-uuid' AND size = 'medium'
ORDER BY image_index;

-- Query 4: Recent active products (should use idx_products_active_created)
EXPLAIN ANALYZE
SELECT id, name, created_at
FROM products
WHERE active = true
ORDER BY created_at DESC
LIMIT 20;
*/

COMMENT ON SCHEMA public IS 'FloresYa Database - Optimized with strategic compound indexes for common query patterns';