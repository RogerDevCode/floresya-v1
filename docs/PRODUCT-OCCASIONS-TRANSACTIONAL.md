# Product-Occasions: Implementación Transaccional

## 🎯 Problema

Actualmente, la actualización de ocasiones de un producto se hace en 2 pasos desde el frontend:

1. Desenlazar todas las ocasiones existentes (`DELETE`)
2. Enlazar las nuevas ocasiones seleccionadas (`POST`)

**Problema**: Si algo falla entre el paso 1 y 2, el producto queda sin ocasiones (inconsistencia de datos).

## ✅ Solución: Endpoint Transaccional

### Backend Endpoint (Recomendado)

```javascript
/**
 * @route PUT /api/products/:id/occasions
 * @desc Replace all occasions for a product (transactional)
 * @access Admin
 */
router.put(
  '/:id/occasions',
  authenticate,
  authorize(['admin']),
  productController.replaceProductOccasions
)
```

### Controller

```javascript
// api/controllers/productController.js
export async function replaceProductOccasions(req, res) {
  try {
    const productId = parseInt(req.params.id)
    const { occasion_ids } = req.body // Array de IDs [16, 17, 18]

    const result = await productService.replaceProductOccasions(productId, occasion_ids)

    res.status(200).json({
      success: true,
      data: result,
      message: 'Occasions updated successfully'
    })
  } catch (error) {
    console.error('replaceProductOccasions failed:', error)
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    })
  }
}
```

### Service (CON TRANSACCIÓN)

```javascript
// api/services/productService.js
import { supabase, DB_SCHEMA } from './supabaseClient.js'

export async function replaceProductOccasions(productId, occasionIds) {
  try {
    if (!productId || !Array.isArray(occasionIds)) {
      throw new Error('Invalid parameters')
    }

    // CRITICAL: Use Supabase transaction (RPC function)
    // Opción 1: Stored Procedure (MEJOR - atomicity garantizada)
    const { data, error } = await supabase.rpc('replace_product_occasions', {
      p_product_id: productId,
      p_occasion_ids: occasionIds
    })

    if (error) {
      throw new Error(`Transaction failed: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('replaceProductOccasions failed:', error)
    throw error
  }
}
```

### Database Function (PostgreSQL)

```sql
-- Migration: Create transactional function
CREATE OR REPLACE FUNCTION replace_product_occasions(
  p_product_id INTEGER,
  p_occasion_ids INTEGER[]
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  -- 1. Delete all existing product_occasions for this product
  DELETE FROM product_occasions
  WHERE product_id = p_product_id;

  -- 2. Insert new occasion links (if any)
  IF array_length(p_occasion_ids, 1) > 0 THEN
    INSERT INTO product_occasions (product_id, occasion_id)
    SELECT p_product_id, unnest(p_occasion_ids);
  END IF;

  -- 3. Return confirmation
  result := json_build_object(
    'product_id', p_product_id,
    'occasion_count', array_length(p_occasion_ids, 1),
    'success', true
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback automático en PostgreSQL
    RAISE EXCEPTION 'Failed to replace occasions: %', SQLERRM;
END;
$$;
```

## 🔧 Migración

```bash
# Crear archivo de migración
touch migrations/YYYYMMDD_HHMMSS_add_replace_product_occasions_function.sql
```

```sql
-- migrations/YYYYMMDD_HHMMSS_add_replace_product_occasions_function.sql

-- Function: Replace product occasions transactionally
CREATE OR REPLACE FUNCTION replace_product_occasions(
  p_product_id INTEGER,
  p_occasion_ids INTEGER[]
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  deleted_count INTEGER;
  inserted_count INTEGER;
BEGIN
  -- Validate product exists
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product % not found', p_product_id;
  END IF;

  -- 1. Delete all existing product_occasions
  DELETE FROM product_occasions
  WHERE product_id = p_product_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- 2. Insert new occasion links (if any)
  inserted_count := 0;
  IF p_occasion_ids IS NOT NULL AND array_length(p_occasion_ids, 1) > 0 THEN
    INSERT INTO product_occasions (product_id, occasion_id)
    SELECT p_product_id, unnest(p_occasion_ids);

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
  END IF;

  -- 3. Return detailed result
  result := json_build_object(
    'product_id', p_product_id,
    'deleted_count', deleted_count,
    'inserted_count', inserted_count,
    'success', true,
    'message', format('Replaced %s occasions (deleted: %s, inserted: %s)',
                      inserted_count, deleted_count, inserted_count)
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback automático
    RAISE EXCEPTION 'Failed to replace occasions for product %: %', p_product_id, SQLERRM;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION replace_product_occasions(INTEGER, INTEGER[]) IS
'Transactionally replaces all occasions for a product. Deletes existing links and inserts new ones atomically.';
```

## 📝 Frontend Usage

```javascript
// api-client.js
replaceProductOccasions(productId, occasionIds) {
  const endpoint = `/api/products/${productId}/occasions`
  return this.request(endpoint, {
    method: 'PUT',
    body: { occasion_ids: occasionIds }
  })
}

// edit-product.js
async function replaceProductOccasions(productId, selectedOccasionIds) {
  try {
    const result = await api.replaceProductOccasions(productId, selectedOccasionIds)
    console.log('✓ Occasions replaced:', result)
    return result
  } catch (error) {
    console.error('Failed to replace occasions:', error)
    throw error
  }
}
```

## ✅ Ventajas de este Approach

1. **Atomicidad**: DELETE e INSERT en una sola transacción
2. **Rollback automático**: Si falla algo, todo se revierte
3. **Performance**: Una sola llamada a DB en vez de N+1
4. **Simplicidad**: Frontend solo envía array de IDs finales
5. **Consistencia**: Sin estados intermedios inconsistentes

## ⚠️ Solución Temporal (Actual)

Mientras no se implemente el endpoint transaccional, el frontend hace:

```javascript
// TEMPORAL - NO ideal pero funcional
async function replaceProductOccasions(productId, selectedOccasionIds) {
  // 1. Get current
  const current = await api.getProductOccasions(productId)

  // 2. Unlink all
  await Promise.all(current.map(occ => api.unlinkProductOccasion(productId, occ.id)))

  // 3. Link new
  await Promise.all(selectedOccasionIds.map(id => api.linkProductOccasion(productId, id)))
}
```

**Problema**: Si falla en paso 3, el producto queda sin ocasiones.

**Workaround**: Implementar try-catch con rollback manual (complicado y propenso a errores).

## 🎯 Siguiente Paso

1. Crear migración con función `replace_product_occasions()`
2. Implementar endpoint `PUT /api/products/:id/occasions`
3. Agregar método al `api-client.js`
4. Actualizar `edit-product.js` para usar nuevo método

---

**Prioridad**: Alta  
**Complejidad**: Media  
**Impacto**: Elimina riesgo de inconsistencias de datos
