-- Database Query Optimization Script
-- FloresYa v1 - Performance Optimizations
-- Generated: 2025-11-11

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Products table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price_usd);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_featured ON products(active, featured) WHERE active = true AND featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_price ON products(active, price_usd) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_created ON products(active, created_at DESC) WHERE active = true;

-- Product images indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_size ON product_images(product_id, size);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_image_index ON product_images(product_id, image_index);

-- Product occasions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_occasions_product_id ON product_occasions(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_occasions_occasion_id ON product_occasions(occasion_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_occasions_composite ON product_occasions(product_id, occasion_id);

-- Orders indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_total ON orders(total_amount_usd);

-- Order items indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Payments indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_method_id ON payments(payment_method_id);

-- Users indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;

-- Occasions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_occasions_active ON occasions(active) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_occasions_display_order ON occasions(display_order);

-- Settings indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_public ON settings(is_public) WHERE is_public = true;

-- ===========================================
-- FULL-TEXT SEARCH INDEXES
-- ===========================================

-- Enable full-text search for products
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search ON products USING gin(
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(summary, ''))
);

-- Full-text search for occasions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_occasions_search ON occasions USING gin(
  to_tsvector('spanish', name || ' ' || COALESCE(description, ''))
);

-- ===========================================
-- PARTITIONING (for large tables)
-- ===========================================

-- Example: Partition orders by year (if table grows large)
-- CREATE TABLE orders_2024 PARTITION OF orders
--   FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- ===========================================
-- VIEWS FOR OPTIMIZED QUERIES
-- ===========================================

-- View for active products with images
CREATE OR REPLACE VIEW v_active_products_with_images AS
SELECT
  p.id,
  p.name,
  p.summary,
  p.price_usd,
  p.featured,
  p.carousel_order,
  pi.url as primary_image_url,
  pi.size as primary_image_size
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.active = true;

-- View for featured products
CREATE OR REPLACE VIEW v_featured_products AS
SELECT
  p.id,
  p.name,
  p.summary,
  p.price_usd,
  p.carousel_order,
  pi.url as primary_image_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
WHERE p.active = true AND p.featured = true
ORDER BY p.carousel_order ASC NULLS LAST;

-- View for order statistics
CREATE OR REPLACE VIEW v_order_stats AS
SELECT
  status,
  COUNT(*) as order_count,
  SUM(total_amount_usd) as total_revenue,
  AVG(total_amount_usd) as avg_order_value
FROM orders
GROUP BY status;

-- View for product statistics
CREATE OR REPLACE VIEW v_product_stats AS
SELECT
  active,
  COUNT(*) as product_count,
  COUNT(*) FILTER (WHERE featured = true) as featured_count,
  AVG(price_usd) as avg_price
FROM products
GROUP BY active;

-- ===========================================
-- FUNCTIONS FOR PERFORMANCE
-- ===========================================

-- Function to get products with pagination (optimized)
CREATE OR REPLACE FUNCTION get_products_paginated(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_active_only BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  summary TEXT,
  price_usd DECIMAL,
  featured BOOLEAN,
  primary_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.summary,
    p.price_usd,
    p.featured,
    pi.url
  FROM products p
  LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
  WHERE (NOT p_active_only OR p.active = true)
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to search products (optimized)
CREATE OR REPLACE FUNCTION search_products(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  summary TEXT,
  price_usd DECIMAL,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.summary,
    p.price_usd,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.summary, '')),
      plainto_tsquery('english', p_search_term)
    ) as rank
  FROM products p
  WHERE p.active = true
    AND to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.summary, ''))
      @@ plainto_tsquery('english', p_search_term)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get product with occasions
CREATE OR REPLACE FUNCTION get_product_with_occasions(p_product_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  description TEXT,
  price_usd DECIMAL,
  occasion_id INTEGER,
  occasion_name TEXT,
  occasion_slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.price_usd,
    o.id as occasion_id,
    o.name as occasion_name,
    o.slug as occasion_slug
  FROM products p
  LEFT JOIN product_occasions po ON p.id = po.product_id
  LEFT JOIN occasions o ON po.occasion_id = o.id
  WHERE p.id = p_product_id AND p.active = true;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGERS FOR CACHE INVALIDATION
-- ===========================================

-- Function to invalidate product cache
CREATE OR REPLACE FUNCTION invalidate_product_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify cache invalidation (application should listen)
  PERFORM pg_notify('invalidate_product_cache', OLD.id::TEXT);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
DROP TRIGGER IF EXISTS trigger_invalidate_product_cache ON products;
CREATE TRIGGER trigger_invalidate_product_cache
  AFTER UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_product_cache();

-- ===========================================
-- STATISTICS COLLECTION
-- ===========================================

-- Enable auto-vacuum and analyze
ALTER TABLE products SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE product_images SET (autovacuum_vacuum_scale_factor = 0.1);

-- Update table statistics
ANALYZE products;
ANALYZE orders;
ANALYZE order_items;
ANALYZE payments;
ANALYZE product_images;
ANALYZE product_occasions;

-- ===========================================
-- PERFORMANCE MONITORING
-- ===========================================

-- View for slow queries (requires pg_stat_statements extension)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Query to find slow queries (run manually)
-- SELECT query, mean_time, calls, total_time
-- FROM pg_stat_statements
-- ORDER BY mean_time DESC
-- LIMIT 20;

-- ===========================================
-- MAINTENANCE
-- ===========================================

-- Script to run regularly (daily)
-- VACUUM ANALYZE products;
-- REINDEX TABLE products;
-- REINDEX DATABASE floresya;

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================

DO $$
BEGIN
  RAISE NOTICE 'Database optimization completed successfully!';
  RAISE NOTICE 'Created % indexes', (
    SELECT COUNT(*) FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
  );
  RAISE NOTICE 'Created % views', (
    SELECT COUNT(*) FROM pg_views
    WHERE schemaname = 'public' AND viewname LIKE 'v_%'
  );
  RAISE NOTICE 'Created % functions', (
    SELECT COUNT(*) FROM pg_proc
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname LIKE 'get_%' OR proname LIKE 'search_%'
  );
END
$$;
