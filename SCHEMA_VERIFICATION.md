# FloresYa - Verificación de Columnas Normalizadas

## ✅ Columnas Corregidas en Migration Script

### Discrepancias Encontradas y Corregidas

**Problema Original**: El script SQL usaba nombres de columnas incorrectos basados en suposiciones.

**Solución**: Verificado contra `supabase_schema.sql` y corregido.

---

## 📋 Columnas Correctas por Tabla

### 1. **orders** ✅

| Columna Original | Columna Normalizada         | Estado      |
| ---------------- | --------------------------- | ----------- |
| `customer_name`  | `customer_name_normalized`  | ✅ Correcto |
| `customer_email` | `customer_email_normalized` | ✅ Correcto |

**Script SQL**:

```sql
ALTER TABLE orders
ADD COLUMN customer_name_normalized TEXT
GENERATED ALWAYS AS (
  lower(regexp_replace(translate(customer_name, 'áéíóúÁÉÍÓÚñÑ', 'aeiouAEIOUnN'), '[^a-z0-9 ]', '', 'gi'))
) STORED;

CREATE INDEX idx_orders_customer_name_normalized ON orders(customer_name_normalized);
```

---

### 2. **products** ✅

| Columna Original | Columna Normalizada      | Estado      |
| ---------------- | ------------------------ | ----------- |
| `name`           | `name_normalized`        | ✅ Correcto |
| `description`    | `description_normalized` | ✅ Correcto |

**Script SQL**:

```sql
ALTER TABLE products
ADD COLUMN name_normalized TEXT
GENERATED ALWAYS AS (
  lower(regexp_replace(translate(name, 'áéíóúÁÉÍÓÚñÑ', 'aeiouAEIOUnN'), '[^a-z0-9 ]', '', 'gi'))
) STORED;

CREATE INDEX idx_products_name_normalized ON products(name_normalized);
```

---

### 3. **users** ⚠️ CORREGIDO

| Columna Original       | Columna Normalizada                          | Estado       |
| ---------------------- | -------------------------------------------- | ------------ |
| ~~`name`~~ `full_name` | ~~`name_normalized`~~ `full_name_normalized` | ✅ CORREGIDO |
| `email`                | `email_normalized`                           | ✅ Correcto  |

**❌ Script Original (INCORRECTO)**:

```sql
-- ESTO ESTABA MAL
ALTER TABLE users
ADD COLUMN name_normalized TEXT  -- ❌ 'name' no existe
```

**✅ Script Corregido**:

```sql
-- ESTO ESTÁ CORRECTO
ALTER TABLE users
ADD COLUMN full_name_normalized TEXT
GENERATED ALWAYS AS (
  lower(regexp_replace(translate(full_name, 'áéíóúÁÉÍÓÚñÑ', 'aeiouAEIOUnN'), '[^a-z0-9 ]', '', 'gi'))
) STORED;

CREATE INDEX idx_users_full_name_normalized ON users(full_name_normalized);
```

---

### 4. **occasions** ✅ (Opcional)

| Columna Original | Columna Normalizada | Estado                            |
| ---------------- | ------------------- | --------------------------------- |
| `name`           | `name_normalized`   | ✅ Correcto (comentado, opcional) |
| `slug`           | -                   | ✅ Ya normalizado                 |

**Nota**: Occasions ya tiene `slug` que está normalizado. Solo descomentar si necesitas búsqueda por `name` con tildes.

---

## 🔧 Cambios Realizados en Scripts

### Archivo: `scripts/add-normalized-columns.sql`

**Líneas 93-111** - Corregido `users.name` → `users.full_name`:

```sql
-- Before (WRONG):
ALTER TABLE users
ADD COLUMN name_normalized TEXT
GENERATED ALWAYS AS (...translate(name,...)...) STORED;

-- After (CORRECT):
ALTER TABLE users
ADD COLUMN full_name_normalized TEXT
GENERATED ALWAYS AS (...translate(full_name,...)...) STORED;
```

**Líneas 197-202** - Corregido índices en ROLLBACK:

```sql
-- Before (WRONG):
DROP INDEX IF EXISTS idx_users_name_normalized;

-- After (CORRECT):
DROP INDEX IF EXISTS idx_users_full_name_normalized;
```

**Líneas 205-210** - Corregido columnas en ROLLBACK:

```sql
-- Before (WRONG):
ALTER TABLE users DROP COLUMN IF EXISTS name_normalized;

-- After (CORRECT):
ALTER TABLE users DROP COLUMN IF EXISTS full_name_normalized;
```

---

## 📊 Schema Actual (Referencia)

### users (supabase_schema.sql:10-21)

```sql
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,                    -- ✅ full_name (no 'name')
    phone TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### orders (supabase_schema.sql:78-99)

```sql
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,      -- ✅ customer_email
    customer_name TEXT NOT NULL,       -- ✅ customer_name
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    -- ... resto de columnas
);
```

### products (supabase_schema.sql:24-38)

```sql
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,                -- ✅ name
    summary TEXT,
    description TEXT,                  -- ✅ description
    price_usd NUMERIC(10, 2) NOT NULL,
    -- ... resto de columnas
);
```

---

## ✅ Verificación Final

### Comando de Verificación (después de ejecutar migration)

```sql
-- Verificar que todas las columnas existen
SELECT
  table_name,
  column_name,
  data_type,
  is_generated
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name LIKE '%_normalized'
ORDER BY table_name, column_name;
```

**Resultado Esperado**:

```
table_name | column_name                    | data_type | is_generated
-----------|--------------------------------|-----------|-------------
orders     | customer_email_normalized      | text      | ALWAYS
orders     | customer_name_normalized       | text      | ALWAYS
products   | description_normalized         | text      | ALWAYS
products   | name_normalized                | text      | ALWAYS
users      | email_normalized               | text      | ALWAYS
users      | full_name_normalized           | text      | ALWAYS
```

### Verificar Índices

```sql
-- Verificar que todos los índices existen
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%_normalized'
ORDER BY tablename, indexname;
```

**Resultado Esperado** (6 índices):

```
orders     | idx_orders_customer_email_normalized
orders     | idx_orders_customer_name_normalized
products   | idx_products_description_normalized
products   | idx_products_name_normalized
users      | idx_users_email_normalized
users      | idx_users_full_name_normalized
```

---

## 🧪 Test Queries

### Test 1: users.full_name_normalized

```sql
-- Setup
INSERT INTO users (email, password_hash, full_name)
VALUES ('test@mail.com', 'hash123', 'José María García');

-- Verify normalized column is auto-populated
SELECT id, full_name, full_name_normalized
FROM users
WHERE email = 'test@mail.com';

-- Expected Result:
-- full_name: "José María García"
-- full_name_normalized: "jose maria garcia"

-- Test search
SELECT * FROM users
WHERE full_name_normalized LIKE '%jose%';

-- Expected: Finds the user
```

### Test 2: orders.customer_name_normalized

```sql
-- Setup
INSERT INTO orders (customer_email, customer_name, customer_phone, delivery_address, total_amount_usd)
VALUES ('cliente@mail.com', 'María Pérez', '+58-412-1234567', 'Caracas, Venezuela', 50.00);

-- Verify
SELECT id, customer_name, customer_name_normalized
FROM orders
WHERE customer_email = 'cliente@mail.com';

-- Expected:
-- customer_name: "María Pérez"
-- customer_name_normalized: "maria perez"

-- Test search
SELECT * FROM orders
WHERE customer_name_normalized LIKE '%maria%';

-- Expected: Finds the order
```

### Test 3: products.name_normalized

```sql
-- Verify existing products have normalized column
SELECT id, name, name_normalized
FROM products
LIMIT 5;

-- Test search
SELECT * FROM products
WHERE name_normalized LIKE '%rosas%';

-- Expected: Finds "Rosas Rojas", "12 Rosas", etc.
```

---

## 📝 Resumen de Correcciones

| Aspecto                   | Antes                          | Después                             | Estado    |
| ------------------------- | ------------------------------ | ----------------------------------- | --------- |
| users columna             | `name` ❌                      | `full_name` ✅                      | CORREGIDO |
| users índice              | `idx_users_name_normalized` ❌ | `idx_users_full_name_normalized` ✅ | CORREGIDO |
| users columna normalizada | `name_normalized` ❌           | `full_name_normalized` ✅           | CORREGIDO |
| orders                    | ✅ Correcto desde inicio       | ✅ Sin cambios                      | OK        |
| products                  | ✅ Correcto desde inicio       | ✅ Sin cambios                      | OK        |

---

## ✅ Estado Final

**Script SQL**: `scripts/add-normalized-columns.sql`

- ✅ Verificado contra `supabase_schema.sql`
- ✅ Todas las columnas corregidas
- ✅ Índices con nombres correctos
- ✅ ROLLBACK script actualizado
- ✅ Listo para ejecutar en Supabase

**Próximo Paso**:

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres < scripts/add-normalized-columns.sql
```
