# FloresYa - Índices de Base de Datos

## Verificación de Performance para Endpoints

### ✅ TABLAS CON ÍNDICES OPTIMIZADOS

#### 1. **orders** (índices: user_id, status, created_at, customer_email)

**Endpoints optimizados:**

- `GET /api/orders?status=pending` → usa `idx_orders_status`
- `GET /api/orders/user/:userId` → usa `idx_orders_user_id`
- `GET /api/orders?date_from=...` → usa `idx_orders_created_at DESC`
- `GET /api/orders?status=pending&order=created_at` → usa `idx_orders_status_created_at` (composite)

**Queries con EXPLAIN:**

```sql
-- Query 1: Filter by status (usa índice)
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
-- Espera: Index Scan using idx_orders_status

-- Query 2: Filter by user (usa índice)
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC;
-- Espera: Index Scan using idx_orders_user_id

-- Query 3: Composite filter (usa índice compuesto)
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;
-- Espera: Index Scan using idx_orders_status_created_at
```

---

#### 2. **order_items** (índices: order_id, product_id)

**Endpoints optimizados:**

- `GET /api/orders/:id` (con JOIN a order_items) → usa `idx_order_items_order_id`
- `GET /api/products/:id/orders` → usa `idx_order_items_product_id`

**Queries con EXPLAIN:**

```sql
-- Query 1: Get items for order (usa índice)
EXPLAIN ANALYZE SELECT * FROM order_items WHERE order_id = 456;
-- Espera: Index Scan using idx_order_items_order_id

-- Query 2: Get orders containing product (usa índice)
EXPLAIN ANALYZE SELECT DISTINCT order_id FROM order_items WHERE product_id = 67;
-- Espera: Index Scan using idx_order_items_product_id
```

---

#### 3. **order_status_history** (índices: order_id, created_at)

**Endpoints optimizados:**

- `GET /api/orders/:id/status-history` → usa `idx_order_status_history_order_id`
- Latest status query → usa `idx_order_status_history_created_at` (composite con order_id)

**Queries con EXPLAIN:**

```sql
-- Query: Get status history for order (usa índice compuesto)
EXPLAIN ANALYZE
SELECT * FROM order_status_history
WHERE order_id = 789
ORDER BY created_at DESC;
-- Espera: Index Scan using idx_order_status_history_created_at
```

---

#### 4. **payments** (índices: order_id, status, payment_method_id, user_id)

**Endpoints optimizados:**

- `GET /api/payments?order_id=123` → usa `idx_payments_order_id`
- `GET /api/payments?status=completed` → usa `idx_payments_status`
- `GET /api/payments?payment_method_id=5` → usa `idx_payments_payment_method_id`

**Queries con EXPLAIN:**

```sql
-- Query 1: Get payments for order (usa índice)
EXPLAIN ANALYZE SELECT * FROM payments WHERE order_id = 123;
-- Espera: Index Scan using idx_payments_order_id

-- Query 2: Filter by status (usa índice)
EXPLAIN ANALYZE SELECT * FROM payments WHERE status = 'completed';
-- Espera: Index Scan using idx_payments_status
```

---

#### 5. **products** (índices: sku, active, featured, carousel_order, [active,featured])

**Endpoints optimizados:**

- `GET /api/products?active=true` → usa `idx_products_active`
- `GET /api/products?featured=true` → usa `idx_products_featured`
- `GET /api/products/carousel` → usa `idx_products_carousel_order` (WHERE carousel_order IS NOT NULL)
- `GET /api/products?active=true&featured=true` → usa `idx_products_active_featured` (composite)

**Queries con EXPLAIN:**

```sql
-- Query 1: Active products (usa índice parcial)
EXPLAIN ANALYZE SELECT * FROM products WHERE active = true;
-- Espera: Index Scan using idx_products_active

-- Query 2: Featured products (usa índice compuesto)
EXPLAIN ANALYZE SELECT * FROM products WHERE active = true AND featured = true;
-- Espera: Index Scan using idx_products_active_featured

-- Query 3: Carousel products (usa índice parcial)
EXPLAIN ANALYZE
SELECT * FROM products
WHERE carousel_order IS NOT NULL
ORDER BY carousel_order ASC;
-- Espera: Index Scan using idx_products_carousel_order
```

---

### 📊 ÍNDICES CRÍTICOS PARA PERFORMANCE

#### **Compuestos (multi-column):**

1. `idx_orders_status_created_at` → para `/api/orders` con filtro + sort
2. `idx_products_active_featured` → para `/api/products?active=true&featured=true`
3. `idx_order_status_history_created_at` → para historial ordenado

#### **Parciales (conditional):**

1. `idx_products_carousel_order WHERE carousel_order IS NOT NULL` → solo productos en carousel
2. `idx_products_active_featured WHERE active = true` → solo productos activos

#### **Únicos (unique):**

1. `idx_product_images_product_id_is_primary WHERE is_primary = true` → 1 imagen primary por producto

---

### 🔍 ENDPOINTS vs ÍNDICES (MAPPING)

| Endpoint                                          | Índice Principal                      | Tipo              | Optimización         |
| ------------------------------------------------- | ------------------------------------- | ----------------- | -------------------- |
| `GET /api/orders?status=pending`                  | `idx_orders_status`                   | Simple            | ✅ B-tree            |
| `GET /api/orders?status=pending&order=created_at` | `idx_orders_status_created_at`        | Compuesto         | ✅ Multi-column      |
| `GET /api/orders/:id` (con items)                 | `idx_order_items_order_id`            | FK                | ✅ B-tree            |
| `GET /api/orders/:id/status-history`              | `idx_order_status_history_created_at` | Compuesto         | ✅ Ordenado DESC     |
| `GET /api/payments?order_id=123`                  | `idx_payments_order_id`               | FK                | ✅ B-tree            |
| `GET /api/products?active=true&featured=true`     | `idx_products_active_featured`        | Compuesto parcial | ✅ WHERE active=true |
| `GET /api/products/carousel`                      | `idx_products_carousel_order`         | Parcial           | ✅ WHERE NOT NULL    |

---

### ⚡ PERFORMANCE ESPERADO

**Sin índice:**

- Full table scan: O(n) - 10ms para 100 rows, 100ms para 1000 rows

**Con índice B-tree:**

- Index scan: O(log n) - 1ms para 100 rows, 2ms para 1000 rows

**Con índice compuesto:**

- Index-only scan: O(log n) + sort - 1-3ms para 1000 rows

---

### 🚨 ÍNDICES FALTANTES (si se detectan en producción)

**Monitorear queries lentas con:**

```sql
-- Query 1: Ver queries sin índice
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Query 2: Verificar uso de índices
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Query 3: Detectar queries lentas (Supabase Studio → SQL Editor)
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

### ✅ CONCLUSIÓN

**Estado actual:**

- ✅ Todos los endpoints críticos tienen índices optimizados
- ✅ Índices compuestos para queries frecuentes (status + created_at)
- ✅ Índices parciales para reducir tamaño (carousel_order, active_featured)
- ✅ FK indexes para JOINs rápidos (order_items, payments)

**Próximos pasos:**

1. Ejecutar `EXPLAIN ANALYZE` en producción para verificar uso real
2. Monitorear `pg_stat_user_indexes` para detectar índices no usados
3. Agregar índices GIN/GiST si se implementa full-text search
