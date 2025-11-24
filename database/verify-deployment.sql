-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- DEPLOYMENT VERIFICATION SCRIPT
-- Use this to verify Supabase configuration for Vercel deployment
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. Verify extensions are in 'extensions' schema (not 'public')
SELECT 
  e.extname AS extension_name,
  n.nspname AS schema_name,
  CASE 
    WHEN n.nspname = 'extensions' THEN '✅ Correcto'
    WHEN n.nspname = 'public' THEN '⚠️  Mover a extensions'
    ELSE '❓ Revisar'
  END AS status
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname IN ('pg_trgm', 'unaccent')
ORDER BY e.extname;

-- 2. Verify RLS policies on main tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Políticas configuradas (' || COUNT(*)::text || ')'
    ELSE '⚠️  Sin políticas RLS'
  END AS rls_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'occasions', 'product_occasions', 'product_images')
GROUP BY schemaname, tablename

UNION ALL

SELECT 
  'public' AS schemaname,
  t.table_name AS tablename,
  '❌ Sin políticas RLS' AS rls_status
FROM information_schema.tables t
LEFT JOIN pg_policies p ON t.table_name = p.tablename
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN ('products', 'occasions', 'product_occasions', 'product_images')
  AND p.tablename IS NULL
ORDER BY tablename;

-- 3. Verify stored functions exist
SELECT 
  routine_name AS function_name,
  routine_type AS type,
  '✅ Existe' AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name IN (
    'get_products_with_occasions',
    'get_featured_products',
    'get_carousel_products'
  )
ORDER BY routine_name;

-- 4. Verify critical columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'price_usd' THEN '✅ Columna correcta'
    WHEN column_name = 'is_active' THEN '✅ Soft delete habilitado'
    WHEN column_name = 'carousel_featured' THEN '✅ Carousel config OK'
    ELSE '✓ OK'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name IN ('price_usd', 'price_ves', 'is_active', 'carousel_featured', 'carousel_order')
ORDER BY column_name;

-- 5. Check for deprecated columns (should NOT exist)
SELECT 
  table_name,
  column_name,
  '⚠️  DEPRECADO - Eliminar' AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name IN ('price', 'rating')
ORDER BY column_name;

-- 6. Sample data verification
SELECT 
  COUNT(*) AS total_products,
  COUNT(*) FILTER (WHERE is_active = true) AS active_products,
  COUNT(*) FILTER (WHERE carousel_featured = true) AS carousel_products,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Productos disponibles'
    ELSE '⚠️  Sin productos'
  END AS status
FROM products;

-- 7. Verify occasions exist
SELECT 
  COUNT(*) AS total_occasions,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ Ocasiones disponibles'
    ELSE '⚠️  Pocas ocasiones'
  END AS status
FROM occasions
WHERE is_active = true;

-- 8. Check product_occasions relationships
SELECT 
  COUNT(DISTINCT product_id) AS products_with_occasions,
  COUNT(*) AS total_relationships,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Relaciones configuradas'
    ELSE '⚠️  Sin relaciones'
  END AS status
FROM product_occasions;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EXPECTED OUTPUT:
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- 1. Extensions: Both in 'extensions' schema ✅
-- 2. RLS: Políticas configuradas para todas las tablas públicas ✅
-- 3. Functions: get_products_with_occasions, get_featured_products, get_carousel_products ✅
-- 4. Columns: price_usd exists, price NOT exists ✅
-- 5. Data: Products > 0, Occasions > 0, Relationships > 0 ✅
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 9. QUICK FIX: If extensions are in 'public' schema, run this:
/*
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION unaccent SET SCHEMA extensions;
*/

-- 10. QUICK FIX: If RLS is blocking anonymous queries, add public SELECT policies:
/*
-- Enable RLS on table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anonymous SELECT on active products
CREATE POLICY "Public read access for active products"
  ON products
  FOR SELECT
  USING (is_active = true);

-- Same for occasions
ALTER TABLE occasions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for active occasions"
  ON occasions
  FOR SELECT
  USING (is_active = true);
*/
