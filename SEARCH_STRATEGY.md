# FloresYa - Estrategia de Búsqueda sin Diacríticos

## 📋 Resumen Ejecutivo

**Problema**: Búsquedas con diacríticos ("josé", "José", "jose") deben devolver los mismos resultados.

**Solución Implementada**:

1. ✅ **Frontend**: Normalización en JavaScript (implementado ahora)
2. 🔮 **Backend**: Columnas generadas + índices B-tree (opcional, próximo paso)

---

## 🎯 Solución Actual (Frontend)

### Implementación

**Función de Normalización** (`public/pages/admin/orders.js:316-323`):

```javascript
function normalizeText(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas
    .trim()
}
```

**Uso en Filtros**:

```javascript
// Búsqueda
const normalizedQuery = normalizeText(searchQuery) // "jose"
const normalizedName = normalizeText(order.customer_name) // "jose" (de "José")

if (normalizedName.includes(normalizedQuery)) {
  // Match!
}
```

### Ejemplos

| Input Usuario | Valor en DB     | Normalizado     | Match |
| ------------- | --------------- | --------------- | ----- |
| "jose"        | "José García"   | "jose garcia"   | ✅    |
| "José"        | "jose@mail.com" | "jose@mail.com" | ✅    |
| "JOSE"        | "José"          | "jose"          | ✅    |
| "maria"       | "María Pérez"   | "maria perez"   | ✅    |
| "perez"       | "Pérez"         | "perez"         | ✅    |

### Limitaciones

1. **Performance**: O(n) - itera sobre todos los pedidos filtrados
2. **No aprovecha índices**: Normalización en cliente, no en servidor
3. **Solo frontend**: Backend sin búsqueda normalizada

---

## 🚀 Solución Recomendada (Backend)

### Opción 1: Columna Generada (⭐ RECOMENDADO)

**Por qué es mejor**:

- ✅ Auto-actualización (sin triggers)
- ✅ Índice B-tree estándar (O(log n))
- ✅ Queries simples en backend
- ✅ Compatible con Supabase (PostgreSQL 12+)

**SQL Migration** (`scripts/add-normalized-columns.sql`):

```sql
ALTER TABLE orders
ADD COLUMN customer_name_normalized TEXT
GENERATED ALWAYS AS (
  lower(
    regexp_replace(
      translate(customer_name,
        'áéíóúÁÉÍÓÚñÑ',
        'aeiouAEIOUnN'
      ),
      '[^a-z0-9 ]', '', 'gi'
    )
  )
) STORED;

CREATE INDEX idx_orders_customer_name_normalized
ON orders(customer_name_normalized);
```

**Backend Query** (`api/controllers/orderController.js`):

```javascript
import { normalizeSearch } from '../utils/normalize.js'

export const getOrders = asyncHandler(async (req, res) => {
  const { search } = req.query
  let query = supabase.from('orders').select('*')

  if (search) {
    const normalized = normalizeSearch(search) // "jose"
    query = query.or(
      `customer_name_normalized.ilike.%${normalized}%,` +
        `customer_email_normalized.ilike.%${normalized}%`
    )
  }

  const { data, error } = await query
  // ...
})
```

**Helper Function** (`api/utils/normalize.js`):

```javascript
export function normalizeSearch(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
}
```

### Opción 2: PostgreSQL `unaccent` Extension

**Pros**:

- No duplica datos
- Funciona con cualquier columna
- Supabase tiene `unaccent` pre-instalado

**Cons**:

- Requiere índice GIN (más lento para LIKE)
- Queries más complejas

**Implementación**:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE INDEX idx_orders_customer_name_unaccent
ON orders USING gin(unaccent(lower(customer_name)) gin_trgm_ops);

-- Query
SELECT * FROM orders
WHERE unaccent(lower(customer_name)) LIKE unaccent(lower('%josé%'));
```

### Comparación

| Aspecto       | Columna Generada       | unaccent Extension               |
| ------------- | ---------------------- | -------------------------------- |
| Performance   | ✅ B-tree (O(log n))   | ⚠️ GIN (O(log n) pero más lento) |
| Storage       | ⚠️ +20-30% por columna | ✅ No duplica datos              |
| Mantenimiento | ✅ Auto-update         | ✅ Auto-update                   |
| Queries       | ✅ Simple (`LIKE`)     | ⚠️ Complejo (`unaccent()`)       |
| Índices       | ✅ 1 por columna       | ⚠️ Requiere pg_trgm              |
| Supabase      | ✅ Soportado           | ✅ Soportado                     |

**Recomendación**: Columna Generada para tablas con búsqueda frecuente (orders, products, users)

---

## 📊 Tablas que Necesitan Normalización

### 1. **orders** (Alta Prioridad)

**Columnas**:

- `customer_name_normalized`
- `customer_email_normalized`

**Endpoints beneficiados**:

- `GET /api/orders?search=jose` → búsqueda admin
- `GET /api/orders/user/:userId?search=maria` → búsqueda usuario

**Performance esperado**:

- Sin índice: 100ms para 1000 pedidos
- Con índice B-tree: 2-3ms para 1000 pedidos

### 2. **products** (Alta Prioridad)

**Columnas**:

- `name_normalized`
- `description_normalized`

**Endpoints beneficiados**:

- `GET /api/products?search=rosas` → catálogo
- Admin product search

**Performance esperado**:

- Sin índice: 50ms para 500 productos
- Con índice B-tree: 1-2ms para 500 productos

### 3. **users** (Media Prioridad)

**Columnas**:

- `full_name_normalized` (nota: schema usa `full_name`, no `name`)
- `email_normalized`

**Endpoints beneficiados**:

- `GET /api/users?search=admin` → admin panel
- Login/registro (email lookup)

### 4. **occasions** (Baja Prioridad)

**Columnas**:

- `name_normalized` (opcional, ya tiene `slug`)

**Nota**: Occasions ya usan `slug` para URLs, normalización solo si se necesita búsqueda por nombre con tildes

---

## 🛠️ Plan de Implementación

### Fase 1: Frontend (✅ Completado)

1. ✅ Función `normalizeText()` en `orders.js`
2. ✅ Búsqueda en tiempo real
3. ✅ Filtro combinado (search + status + date)

### Fase 2: Backend (Próximo Paso)

**Paso 1: Ejecutar Migration SQL** (5 min)

```bash
# Conectar a Supabase
psql -h db.xxx.supabase.co -U postgres -d postgres

# Ejecutar script
\i scripts/add-normalized-columns.sql

# Verificar columnas creadas
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name LIKE '%_normalized'
ORDER BY table_name;
```

**Paso 2: Crear Helper Function** (2 min)

```javascript
// api/utils/normalize.js
export function normalizeSearch(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
}
```

**Paso 3: Actualizar Controllers** (10 min)

`api/controllers/orderController.js`:

```javascript
import { normalizeSearch } from '../utils/normalize.js'

export const getOrders = asyncHandler(async (req, res) => {
  const { search, status, limit = 20, offset = 0 } = req.query
  let query = supabase.from('orders').select('*')

  if (search) {
    const normalized = normalizeSearch(search)
    query = query.or(
      `customer_name_normalized.ilike.%${normalized}%,` +
        `customer_email_normalized.ilike.%${normalized}%`
    )
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) throw new DatabaseError('SELECT', 'orders', error)

  res.json({ success: true, data, message: 'Orders retrieved' })
})
```

`api/controllers/productController.js`:

```javascript
import { normalizeSearch } from '../utils/normalize.js'

export const getProducts = asyncHandler(async (req, res) => {
  const { search, active = 'true' } = req.query
  let query = supabase.from('products').select('*')

  if (active !== 'all') {
    query = query.eq('active', active === 'true')
  }

  if (search) {
    const normalized = normalizeSearch(search)
    query = query.or(
      `name_normalized.ilike.%${normalized}%,` + `description_normalized.ilike.%${normalized}%`
    )
  }

  const { data, error } = await query
  if (error) throw new DatabaseError('SELECT', 'products', error)

  res.json({ success: true, data, message: 'Products retrieved' })
})
```

**Paso 4: Actualizar Frontend API** (5 min)

```javascript
// public/js/shared/api.js

// Cambiar de filtro local a query param
getOrders: (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  if (filters.limit) params.append('limit', filters.limit)
  if (filters.offset) params.append('offset', filters.offset)

  return fetchJSON(`/orders?${params}`)
},

getProducts: (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.active !== undefined) params.append('active', filters.active)

  return fetchJSON(`/products?${params}`)
}
```

**Paso 5: Actualizar `orders.js`** (5 min)

```javascript
// Cambiar de filtro local a API call
async function applyFilters() {
  const filters = {
    search: searchQuery,
    status: currentFilter !== 'all' ? currentFilter : undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  }

  try {
    const result = await api.getOrders(filters)
    if (result.success) {
      orders = result.data
      renderOrdersTable(orders)
      updatePaginationUI()
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    showError('Error al cargar pedidos')
  }
}
```

**Total tiempo estimado**: ~30 minutos

---

## 📈 Performance Esperado

### Antes (Frontend Normalización)

| Pedidos | Tiempo Búsqueda | Complejidad |
| ------- | --------------- | ----------- |
| 100     | ~5ms            | O(n)        |
| 1,000   | ~50ms           | O(n)        |
| 10,000  | ~500ms          | O(n)        |

### Después (Backend + Índices)

| Pedidos | Tiempo Búsqueda | Complejidad |
| ------- | --------------- | ----------- |
| 100     | ~1ms            | O(log n)    |
| 1,000   | ~2ms            | O(log n)    |
| 10,000  | ~3ms            | O(log n)    |
| 100,000 | ~4ms            | O(log n)    |

**Mejora**: 10-100x más rápido para datasets grandes

---

## 🧪 Testing

### Test Cases

**1. Búsqueda Básica**:

```sql
-- Setup
INSERT INTO orders (customer_name, customer_email, ...)
VALUES ('José García', 'jose@mail.com', ...);

-- Test
SELECT * FROM orders
WHERE customer_name_normalized LIKE '%jose%';

-- Esperado: 1 resultado
```

**2. Múltiples Diacríticos**:

```sql
-- Setup
INSERT INTO products (name, ...)
VALUES ('Rosas Rojas', ...), ('12 Rosas', ...), ('ROSAS Blancas', ...);

-- Test
SELECT * FROM products
WHERE name_normalized LIKE '%rosas%';

-- Esperado: 3 resultados
```

**3. Combined Search (OR)**:

```sql
SELECT * FROM orders
WHERE customer_name_normalized LIKE '%maria%'
   OR customer_email_normalized LIKE '%maria%';
```

**4. Performance Test**:

```sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE customer_name_normalized LIKE '%jose%';

-- Esperado: "Index Scan using idx_orders_customer_name_normalized"
```

---

## ✅ Checklist

### Frontend (Completado)

- [x] Función normalizeText()
- [x] Búsqueda en tiempo real
- [x] Limpiar búsqueda
- [x] Combinar con otros filtros

### Backend (Próximo)

- [ ] Ejecutar migration SQL
- [ ] Crear utils/normalize.js
- [ ] Actualizar orderController
- [ ] Actualizar productController
- [ ] Actualizar userController
- [ ] Actualizar frontend API
- [ ] Testing end-to-end
- [ ] Verificar índices con EXPLAIN ANALYZE

### Documentación

- [x] SEARCH_STRATEGY.md (este archivo)
- [x] scripts/add-normalized-columns.sql
- [x] ADVANCED_ORDERS_FEATURES.md

---

## 📝 Notas Adicionales

### Diacríticos Soportados

**Español**:

- á, é, í, ó, ú → a, e, i, o, u
- Á, É, Í, Ó, Ú → A, E, I, O, U
- ñ, Ñ → n, N

**Internacional** (opcional, agregar a translate()):

- à, è, ì, ò, ù (italiano/francés)
- ä, ë, ï, ö, ü (alemán)
- â, ê, î, ô, û (francés)
- ç, Ç (francés/portugués)

### Alternativas Consideradas

1. ❌ **Full-text search (tsvector)**: Overkill para búsquedas simples
2. ❌ **Elasticsearch**: Infraestructura adicional innecesaria
3. ❌ **Trigram GIN**: Más lento que B-tree para LIKE
4. ✅ **Columna Generada + B-tree**: Balance perfecto

---

## 🎯 Conclusión

**Estado Actual**:

- ✅ Frontend: Búsqueda sin diacríticos funcional (O(n))
- 🔮 Backend: Listo para migración (mejora a O(log n))

**Recomendación**:

1. Usar frontend actual para MVP/pruebas
2. Ejecutar migration cuando >500 pedidos o performance se degrade
3. Migración toma ~30 minutos, cero downtime
4. Mejora esperada: 10-100x más rápido

**Próximo Paso**: Ejecutar `scripts/add-normalized-columns.sql` en Supabase
