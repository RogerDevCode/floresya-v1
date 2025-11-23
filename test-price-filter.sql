-- ============================================================================
-- TEST: Price Filter Function
-- ============================================================================

-- Test 1: Sin filtros de precio
SELECT 
  id, 
  name, 
  price_usd,
  'Test 1: No price filter' as test
FROM get_products_filtered(
  p_limit := 5
);

-- Test 2: Con filtro de precio mínimo
SELECT 
  id, 
  name, 
  price_usd,
  'Test 2: Min price 0' as test
FROM get_products_filtered(
  p_price_min := 0,
  p_limit := 5
);

-- Test 3: Con filtro de precio máximo
SELECT 
  id, 
  name, 
  price_usd,
  'Test 3: Max price 30' as test
FROM get_products_filtered(
  p_price_max := 30,
  p_limit := 5
);

-- Test 4: Con rango de precios
SELECT 
  id, 
  name, 
  price_usd,
  'Test 4: Price range 0-30' as test
FROM get_products_filtered(
  p_price_min := 0,
  p_price_max := 30,
  p_limit := 5
);

-- Test 5: Verificar tipos de datos
SELECT 
  proname as function_name,
  proargnames as parameter_names,
  proargtypes as parameter_types
FROM pg_proc 
WHERE proname = 'get_products_filtered';
