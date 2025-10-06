# FloresYa - MVC E-Commerce Architecture

## Stack

Express 5 + Node.js + Supabase (PostgreSQL) + Tailwind v4 + ES6 Modules

## Core Principles

1. **KISS First**: Simple > Complex
2. **MVC Strict**: Controllers → Services → Database
3. **Service Layer Exclusivo**: Solo servicios acceden a Supabase
4. **Fail Fast**: Lanza errores específicos, nunca valores por defecto silenciosos
5. **Soft-Delete**: Flags `active`/`is_active`, nunca eliminación física
6. **OpenAPI Contract**: Documentación explícita para frontend
7. **SOLID**: Single Responsibility, Dependency Inversion

---

## Project Structure

```
floresya-v1/
├── api/                              # Backend MVC
│   ├── app.js                        # Express app config
│   ├── server.js                     # Entry point (PORT 3000)
│   ├── config/swagger.js             # OpenAPI 3.1 spec
│   ├── controllers/                  # HTTP Layer
│   ├── services/                     # Business Logic - ONLY DB ACCESS
│   │   ├── supabaseClient.js         # SSOT: DB_SCHEMA + DB_FUNCTIONS
│   │   └── ...Service.js
│   ├── routes/                       # Route definitions
│   ├── middleware/                   # Auth, validation, security, logging
│   │   ├── schemas.js                # Validation schemas (SSOT)
│   │   └── validate.js               # Validators
│   ├── utils/normalize.js            # Text normalization (accent-insensitive)
│   ├── errors/AppError.js            # Custom error classes
│   └── docs/openapi-annotations.js   # Endpoint annotations
│
├── public/                           # Frontend (Static Files)
│   ├── index.html + index.js         # Landing page
│   ├── pages/                        # HTML + paired JS modules
│   ├── js/
│   │   ├── shared/                   # SSOT (api.js, validators.js, dom.js)
│   │   ├── components/               # Reusable UI
│   │   └── lucide-icons.js           # CSP-compatible icons
│   └── css/
│       ├── input.css                 # Tailwind source (@import 'tailwindcss')
│       ├── tailwind.css              # Compiled (DO NOT EDIT)
│       └── styles.css                # Custom CSS
│
├── .env.local                        # Environment variables
├── vercel.json                       # Deployment config
├── eslint.config.js                  # ESLint 9 flat config
└── package.json                      # Scripts: dev, build:css, format, test
```

## MVC Data Flow

```
Frontend (fetch)
  ↓ HTTP Request
Router (routes/)
  ↓ Middleware (validate, auth)
Controller (controllers/)
  ↓ Extract params, call service
Service (services/)
  ↓ Business logic, Supabase query
Database (PostgreSQL)
  ↓ Return data
Service → Controller → JSON Response
```

**CRITICAL**: Only `api/services/` can import `supabaseClient.js`

---

## Accent-Insensitive Search

All text search uses **indexed normalized columns** for performance.

**Database**: PostgreSQL GENERATED columns with B-tree indexes

- `products`: `name_normalized`, `description_normalized`
- `orders`: `customer_name_normalized`, `customer_email_normalized`
- `users`: `full_name_normalized`, `email_normalized`

**Backend**:

```javascript
import { buildSearchCondition } from '../utils/normalize.js'

const SEARCH_COLUMNS = DB_SCHEMA.products.search
const searchCondition = buildSearchCondition(SEARCH_COLUMNS, filters.search)
if (searchCondition) query = query.or(searchCondition)
```

**Frontend**:

```javascript
import { normalizeSearch } from './shared/api.js'
const searchTerm = normalizeSearch(inputValue) // "jose" === "josé"
```

---

## Reglas Obligatorias

"All generated JavaScript code must fully comply with eslint rules."

"Every try-catch block must have a catch with an error parameter (e.g., 'catch(error)')."

"Every catch block must contain a 'console.log(error)' (or optionally 'console.error(error)') displaying the original caught error. No catch block can be empty or fail to show the caught error."

"It is strictly forbidden to generate code with a catch block without an error parameter, or a catch block that does not log the received error variable."

### 1. Arquitectura MVC

**Controllers (HTTP Layer)**

- Manejan requests/responses HTTP
- Validan parámetros de entrada
- Llaman a servicios
- Retornan respuestas JSON estandarizadas
- **NO acceden directamente a la base de datos**

**Services (Business Logic Layer)**

- Contienen toda la lógica de negocio
- **Única capa con acceso a Supabase**
- Implementan parámetro `includeInactive` para soft-delete
- Fail-fast: lanzan errores específicos, nunca retornan valores por defecto
- Siempre usan try-catch
- Usan clases de error personalizadas (`BadRequestError`, `NotFoundError`, `DatabaseError`, etc.)
- Incluyen metadata en errores como `code`, `userMessage`, `statusCode`, `context`, `timestamp`

**Routes**

- Definen endpoints y métodos HTTP
- Asocian rutas con controllers
- Aplican middleware (auth, validation)

### 2. Soft-Delete Pattern

Todos los servicios con campos `active` o `is_active` deben implementar el patrón `includeInactive`:

```javascript
/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {boolean} includeInactive - Include inactive products (default: false, admin only)
 */
export async function getAllProducts(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    // By default, only return active products
    if (!includeInactive) {
      query = query.eq('active', true)
    }

    // ... rest of filters
    const { data, error } = await query

    if (error) throw new Error(`Database error: ${error.message}`)
    if (!data) throw new Error('No products found')

    return data
  } catch (error) {
    console.error('getAllProducts failed:', error)
    throw error
  }
}
```

**Controllers deciden cuándo usar `includeInactive`:**

```javascript
export const getAllProducts = asyncHandler(async (req, res) => {
  const { limit, offset, featured, search } = req.query

  // Admin can see inactive products with query param
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'

  const filters = { limit, offset, featured, search }
  const products = await productService.getAllProducts(filters, includeInactive)

  res.status(200).json({
    success: true,
    data: products,
    message: 'Products retrieved successfully'
  })
})
```

### 3. Enterprise Error Handling

**Custom Error Classes** (`api/errors/AppError.js`):

- **HTTP 4xx**: `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`
- **HTTP 5xx**: `InternalServerError`, `ServiceUnavailableError`
- **Database**: `DatabaseError`, `DatabaseConnectionError`, `DatabaseConstraintError`
- **Business Logic**: `InsufficientStockError`, `PaymentFailedError`, `OrderNotProcessableError`, `InvalidStateTransitionError`
- **External**: `ExternalServiceError`, `RateLimitExceededError`

**Error Metadata**:

```javascript
{
  name: 'DatabaseError',
  code: 'DATABASE_ERROR',              // UPPER_SNAKE_CASE
  message: 'Technical message',        // For logs
  userMessage: 'User-friendly msg',    // Safe for frontend
  statusCode: 500,
  severity: 'critical',                // low | medium | high | critical
  context: { operation: 'SELECT', table: 'products', productId: 123 },
  timestamp: '2025-10-02T...',
  isOperational: false                 // true = expected, false = bug
}
```

**Service Pattern**:

```javascript
import { BadRequestError, NotFoundError, DatabaseError } from '../errors/AppError.js'

export async function getProductById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID', { productId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)
    if (!includeInactive) query = query.eq('active', true)

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundError('Product', id)
      throw new DatabaseError('SELECT', TABLE, error, { productId: id })
    }
    if (!data) throw new NotFoundError('Product', id)

    return data
  } catch (error) {
    if (error.name?.includes('Error')) throw error
    console.error(`getProductById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { productId: id })
  }
}
```

**ANTI-PATTERNS** (Prohibido):

```javascript
// ❌ NUNCA
throw new Error('Something went wrong')
const products = (await getProducts()) || []
try {
  await op()
} catch (e) {
  console.log(e)
  return []
}

// ✅ CORRECTO
throw new DatabaseError('INSERT', 'products', error, { sku })
throw new InsufficientStockError(productId, requested, available)
```

### 4. Respuestas API Estandarizadas

Todos los endpoints retornan este formato:

**Éxito:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Products retrieved successfully"
}
```

**Error:**

```json
{
  "success": false,
  "error": "Product not found",
  "message": "Product 123 not found",
  "stack": "..." // Solo en development
}
```

### 5. OpenAPI 3.1 Contract

Todos los endpoints están documentados en `api/docs/openapi-annotations.js` usando JSDoc:

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with filters
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
```

Acceder a documentación interactiva: `http://localhost:3000/api-docs/`

### 6. Manual Validation (No Zod)

**Schemas** in `api/middleware/schemas.js`:

```javascript
export const productCreateSchema = {
  name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
  price_usd: { type: 'number', required: true, min: 0 },
  featured: { type: 'boolean', required: false }
}
```

**Usage**:

```javascript
import { validate, validateId } from '../middleware/validate.js'
import { productCreateSchema } from '../middleware/schemas.js'

router.post('/', authenticate, authorize('admin'), validate(productCreateSchema), controller.create)
```

**Features**: Type checking, string length/pattern, number min/max, enum, fail-fast

### 7. Code Formatting Automático

**Prettier** formatea código automáticamente en pre-commit:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

**Husky + lint-staged** ejecutan Prettier antes de cada commit.

---

## Frontend Rules (ES6 Modules)

### HTML/JS Strict Rules

1. **NO inline JS/CSS**
   - ❌ `<script>...</script>` inline, `style="..."`, `onclick="..."`
   - ✅ `<script type="module" src="./index.js"></script>`
   - ✅ `<link rel="stylesheet" href="./css/styles.css">`

2. **ES6 Module Architecture**
   - Each `.html` has paired `.js`
   - Shared code in `js/shared/` (SSOT)
   - Reusable components in `js/components/`

3. **SSOT Frontend**
   - `js/shared/api.js`: API client (fetchJSON, HTTP methods)
   - `js/shared/validators.js`: Reusable validations
   - `js/shared/dom.js`: DOM helpers

4. **CSP Strict**
   - `script-src: 'self'` only
   - No `'unsafe-inline'`, no `'unsafe-eval'`

5. **Tailwind v4 + Custom CSS**
   - Source: `public/css/input.css` (`@import 'tailwindcss'`)
   - Output: `public/css/tailwind.css` (DO NOT EDIT)
   - Build: `npm run build:css`
   - **NEVER use `@apply` in v4**
   - Custom CSS: `public/css/styles.css`

### Example

```javascript
// pages/productos.js
import { api } from '../js/shared/api.js'
import { showError, showLoading } from '../js/shared/dom.js'

async function loadProducts() {
  try {
    showLoading('container')
    const products = await api.getProducts()
    renderProducts(products)
  } catch (error) {
    showError(error.message, 'container')
    throw error // Fail-fast
  }
}
```

---

## Prohibido

**Backend**:

- ❌ TypeScript, tRPC, Zod, complex build tools
- ❌ Import `supabaseClient.js` outside `api/services/`
- ❌ Use `||`, `??` in critical operations
- ❌ Silent error handling
- ❌ DB access from controllers

**Frontend**:

- ❌ Inline JS/CSS (violates CSP)
- ❌ Scripts without `type="module"`
- ❌ Duplicate logic (use SSOT)
- ❌ External CDNs without CSP check

---

## Ejemplos Correctos

### Controller (HTTP Layer)

```javascript
// api/controllers/productController.js
import * as productService from '../services/productService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAllProducts = asyncHandler(async (req, res) => {
  const { limit, offset, featured, search } = req.query
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'

  const filters = { limit, offset, featured, search }
  const products = await productService.getAllProducts(filters, includeInactive)

  res.status(200).json({
    success: true,
    data: products,
    message: 'Products retrieved successfully'
  })
})
```

### Service (Business Logic)

```javascript
// api/services/productService.js
import { supabase, DB_SCHEMA } from './supabaseClient.js'

const TABLE = DB_SCHEMA.products.table

export async function getAllProducts(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(`Database error: ${error.message}`)
    if (!data) throw new Error('No products found')

    return data
  } catch (error) {
    console.error('getAllProducts failed:', error)
    throw error
  }
}
```

### Route Definition

```javascript
// api/routes/productRoutes.js
import express from 'express'
import * as productController from '../controllers/productController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)
router.post('/', authenticate, authorize(['admin']), productController.createProduct)
router.put('/:id', authenticate, authorize(['admin']), productController.updateProduct)
router.delete('/:id', authenticate, authorize(['admin']), productController.deleteProduct)

export default router
```

### Supabase Client (SSOT)

```javascript
// api/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema constants (SSOT)
export const DB_SCHEMA = {
  products: {
    table: 'products',
    columns: [
      'id',
      'name',
      'description',
      'price_usd',
      'price_ves',
      'stock',
      'sku',
      'active',
      'featured',
      'carousel_order'
    ]
  },
  users: {
    table: 'users',
    columns: ['id', 'email', 'full_name', 'phone', 'role', 'is_active', 'email_verified'],
    enums: {
      role: ['user', 'admin']
    }
  },
  orders: {
    table: 'orders',
    columns: ['id', 'user_id', 'total_usd', 'total_ves', 'status', 'created_at']
  }
}

// Database stored functions
export const DB_FUNCTIONS = {
  getProductsWithOccasions: 'get_products_with_occasions',
  getProductsByOccasion: 'get_products_by_occasion',
  createProductWithOccasions: 'create_product_with_occasions',
  updateCarouselOrderAtomic: 'update_carousel_order_atomic'
}
```

---

## Deployment

### Local Dev

```bash
npm run dev  # http://localhost:3000
```

### Production (Vercel)

**Config**: `vercel.json` (dual-mode: serverless API + static files)

**Env Vars**: `SUPABASE_URL`, `SUPABASE_KEY`, `NODE_ENV=production`

---

## Testing (Vitest + Happy DOM)

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

**Example**:

```javascript
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

vi.mock('../../services/productService.js', () => ({
  getProductById: vi.fn(id => {
    if (id === 67) return Promise.resolve({ id: 67, name: 'Test' })
    throw new NotFoundError('Product', id)
  })
}))

describe('Product Controller', () => {
  it('should return product for valid ID', async () => {
    const res = await request(app).get('/api/products/67').expect(200)
    expect(res.body.success).toBe(true)
  })
})
```

---

## Philosophy

**"Go all out! Don't hold back, just do it."**

- **KISS > Complexity**: Simple solution > complex potential failure
- **Fail Fast**: Break early > silent data corruption
- **Service Layer is Law**: Only source of business logic
- **MVC Strict**: Controllers → Services → Database
- **OpenAPI First**: API contract is truth
- **Soft-Delete**: Never delete data, deactivate

### Maximum Proactivity

- **Anticipate needs** without explicit instructions
- Missing validation → **add it**
- Duplicate code → **refactor**
- Service Layer violation → **fix immediately**

### Aggressive Auto-Fix

- Linting errors → fix silently
- Type inconsistencies → adjust
- Missing try-catch → add
- Fallback operators (`||`, `??`) → replace with fail-fast
- Dead code → delete

### Golden Rule

**"If it's in QWEN.md, it's law. If it violates law, execute immediately."**

### AFI (Awaiting Further Instruction)

When user says "AFI":

```
✅ Entendido. Tarea actual completada.
🎯 Esperando instrucciones para próximo paso.
```

---

## Business Rules

**"Una venta cancelada no es una venta"** - Cancelled orders excluded from sales calculations
