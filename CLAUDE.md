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
│   ├── controllers/                  # HTTP Layer (7 files)
│   │   ├── productController.js
│   │   ├── productImageController.js
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   ├── occasionController.js
│   │   ├── paymentController.js
│   │   └── settingsController.js
│   ├── services/                     # Business Logic (10 files) - ONLY DB ACCESS
│   │   ├── supabaseClient.js         # SSOT: DB_SCHEMA + DB_FUNCTIONS
│   │   ├── productService.js
│   │   ├── productImageService.js
│   │   ├── orderService.js
│   │   ├── orderStatusService.js
│   │   ├── userService.js
│   │   ├── authService.js
│   │   ├── occasionService.js
│   │   ├── paymentService.js
│   │   └── settingsService.js
│   ├── routes/                       # Route definitions (7 files)
│   ├── middleware/                   # 6 files
│   │   ├── auth.js                   # JWT simulation
│   │   ├── schemas.js                # 11 validation schemas (SSOT)
│   │   ├── validate.js               # Validators (validateId, validatePagination)
│   │   ├── security.js               # Helmet, CORS, Rate Limit, XSS
│   │   ├── logger.js                 # Winston
│   │   └── errorHandler.js           # Global error handler
│   ├── utils/normalize.js            # Text normalization (accent-insensitive search)
│   ├── errors/AppError.js            # 15+ custom error classes
│   └── docs/openapi-annotations.js   # 60+ endpoint annotations
│
├── public/                           # Frontend (Static Files)
│   ├── index.html + index.js         # Landing page
│   ├── pages/                        # HTML + paired JS modules
│   │   ├── product-detail.html + .js
│   │   ├── productos.html + .js
│   │   └── checkout.html + .js
│   ├── js/
│   │   ├── shared/                   # SSOT
│   │   │   ├── api.js                # API client (fetchJSON)
│   │   │   ├── validators.js
│   │   │   └── dom.js                # Helpers (showError, showLoading)
│   │   ├── components/               # Reusable UI
│   │   │   ├── imageCarousel.js
│   │   │   ├── modal.js
│   │   │   ├── toast.js
│   │   │   └── form.js
│   │   └── lucide-icons.js           # CSP-compatible icons
│   ├── css/
│   │   ├── input.css                 # Tailwind source (@import 'tailwindcss')
│   │   ├── tailwind.css              # Compiled (DO NOT EDIT)
│   │   └── styles.css                # Custom CSS
│   ├── images/                       # Static assets
│   └── products/                     # Product images (10+)
│
├── .env.local                        # SUPABASE_URL, SUPABASE_KEY
├── vercel.json                       # Dual-mode deployment
├── eslint.config.js                  # ESLint 9 flat config
├── tailwind.config.js                # Tailwind v4 config
├── postcss.config.js                 # Tailwind + Autoprefixer
└── package.json                      # Scripts: dev, build:css, format, test
```

---

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

## Accent-Insensitive Search (Normalized Columns)

All text search uses **indexed normalized columns** for performance and accent-insensitive matching.

**Database**: PostgreSQL GENERATED columns with B-tree indexes

- `products`: `name_normalized`, `description_normalized`
- `orders`: `customer_name_normalized`, `customer_email_normalized`
- `users`: `full_name_normalized`, `email_normalized`

**Backend** (`api/utils/normalize.js`):

```javascript
import { buildSearchCondition } from '../utils/normalize.js'

const SEARCH_COLUMNS = DB_SCHEMA.products.search // ['name_normalized', 'description_normalized']

const searchCondition = buildSearchCondition(SEARCH_COLUMNS, filters.search)
if (searchCondition) {
  query = query.or(searchCondition) // Uses .ilike with normalized text
}
```

**Frontend**: Use `normalizeSearch()` in search inputs before sending to API

```javascript
import { normalizeSearch } from './shared/api.js' // Or create utility

const searchTerm = normalizeSearch(inputValue) // "jose" === "josé"
const results = await api.getProducts({ search: searchTerm })
```

**Rule**: Search queries MUST normalize text client-side to match server-side indexed columns.

---

## Reglas Obligatorias

### 1. MVC Architecture

**Controllers**

- Handle HTTP request/response
- Extract query/body params
- Call service methods
- Return standardized JSON: `{ success, data, message }`
- **NEVER access database directly**
- Use `asyncHandler` wrapper

**Services**

- All business logic
- **ONLY layer with Supabase access**
- Implement `includeInactive` param for soft-delete
- Fail-fast: throw specific errors, never return defaults
- Always use try-catch

**Routes**

- Define endpoints (GET, POST, PUT, PATCH, DELETE)
- Apply middleware: `authenticate`, `authorize('admin')`, `validate(schema)`
- Use helpers: `validateId()`, `validatePagination()`

### 2. Soft-Delete Pattern

Services with `active`/`is_active` must implement:

```javascript
export async function getAllProducts(filters = {}, includeInactive = false) {
  try {
    let query = supabase.from(TABLE).select('*')

    if (!includeInactive) {
      query = query.eq('active', true) // Default: only active
    }

    const { data, error } = await query
    if (error) throw new DatabaseError('SELECT', TABLE, error)
    if (!data) throw new NotFoundError('Products')
    return data
  } catch (error) {
    console.error('getAllProducts failed:', error)
    throw error
  }
}
```

**Controller decides when to use `includeInactive`:**

```javascript
export const getAllProducts = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'

  const filters = { limit: req.query.limit, offset: req.query.offset }
  const products = await productService.getAllProducts(filters, includeInactive)

  res.status(200).json({ success: true, data: products, message: 'Products retrieved' })
})
```

### 3. Enterprise Error Handling

**15 Custom Error Classes** (`api/errors/AppError.js`):

**HTTP 4xx**:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)

**HTTP 5xx**:

- `InternalServerError` (500)
- `ServiceUnavailableError` (503)

**Database** (severity: critical):

- `DatabaseError`
- `DatabaseConnectionError`
- `DatabaseConstraintError`

**Business Logic**:

- `InsufficientStockError`
- `PaymentFailedError`
- `OrderNotProcessableError`
- `InvalidStateTransitionError`

**External**:

- `ExternalServiceError`
- `RateLimitExceededError` (429)

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
  isOperational: false,                // true = expected, false = bug
  stack: '...'
}
```

**Service Example**:

```javascript
import { BadRequestError, NotFoundError, DatabaseError } from '../errors/AppError.js'

export async function getProductById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
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
    if (error.name?.includes('Error')) throw error // Re-throw AppErrors
    console.error(`getProductById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { productId: id })
  }
}
```

**Error Handler** (`api/middleware/errorHandler.js`):

```javascript
export function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development'
  const response = err.toJSON(isDev)

  // Security: never expose internals in production
  if (!isDev && err.statusCode >= 500) delete response.details

  res.status(err.statusCode).json(response)
}
```

**API Response**:

```json
{
  "success": false,
  "error": "NotFoundError",
  "code": "NOT_FOUND",
  "message": "Product 123 not found",
  "details": { "productId": 123 },
  "timestamp": "2025-10-02T14:23:45.123Z"
}
```

**ANTI-PATTERNS** (Prohibido):

```javascript
// ❌ NUNCA - Generic errors
throw new Error('Something went wrong')

// ❌ NUNCA - Silent fallbacks
const products = (await getProducts()) || []

// ❌ NUNCA - Swallow errors
try {
  await dangerousOp()
} catch (e) {
  console.log(e)
  return []
}

// ✅ CORRECTO
throw new DatabaseError('INSERT', 'products', error, { sku: data.sku })
throw new InsufficientStockError(productId, requested, available)
```

### 4. API Response Format

**Success**:

```json
{ "success": true, "data": {...}, "message": "Operation successful" }
```

**Error**:

```json
{ "success": false, "error": "ErrorName", "message": "...", "stack": "..." }
```

### 5. OpenAPI 3.1 Documentation

All endpoints in `api/docs/openapi-annotations.js`:

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
 *         description: Products retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
```

Access: `http://localhost:3000/api-docs/`

### 6. Manual Validation (No Zod)

**Architecture**:

```
api/middleware/
├── validate.js   # Generic validator, validateId, validatePagination
└── schemas.js    # 11 schemas (SSOT, matches OpenAPI 3.1)
```

**Schemas** (11 total):

- `productCreateSchema`, `productUpdateSchema`, `productFilterSchema`
- `orderCreateSchema`, `orderStatusUpdateSchema`
- `userCreateSchema`, `userUpdateSchema`
- `occasionCreateSchema`
- `settingCreateSchema`
- `paymentCreateSchema`
- `productImageCreateSchema`

**Usage**:

```javascript
import { validate, validateId } from '../middleware/validate.js'
import { productCreateSchema } from '../middleware/schemas.js'

router.post('/', authenticate, authorize('admin'), validate(productCreateSchema), controller.create)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  validate(productUpdateSchema),
  controller.update
)
```

**Schema Example**:

```javascript
export const productCreateSchema = {
  name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
  price_usd: { type: 'number', required: true, min: 0 },
  stock: { type: 'number', required: false, integer: true, min: 0 },
  featured: { type: 'boolean', required: false }
}
```

**Features**:

- Type checking (string, number, boolean, array, object)
- String: minLength, maxLength, pattern (RegEx), email
- Number: min, max, integer
- Array: minLength, maxLength, items type
- Enum validation
- Fail-fast on errors

### 7. Code Formatting

```bash
npm run format        # Format all files (Prettier)
npm run format:check  # Check formatting
```

Husky + lint-staged run Prettier on pre-commit.

---

## Frontend Rules (ES6 Modules)

### HTML/JS Strict Rules

1. **NO inline JS/CSS**
   - ❌ `<script>...</script>` inline
   - ❌ `<style>...</style>` inline
   - ❌ `style="..."` attributes
   - ❌ `onclick="..."` handlers
   - ✅ `<script type="module" src="./index.js"></script>`
   - ✅ `<link rel="stylesheet" href="./css/styles.css">`

2. **ES6 Module Architecture**
   - Each `.html` has paired `.js` (e.g., `index.html` + `index.js`)
   - New pages in `pages/` (e.g., `productos.html` + `productos.js`)
   - Shared code in `js/shared/` (SSOT)
   - Reusable components in `js/components/`

3. **SSOT Frontend**
   - `js/shared/api.js`: API client (fetchJSON, HTTP methods)
   - `js/shared/validators.js`: Reusable validations
   - `js/shared/dom.js`: DOM helpers (showError, showLoading)

4. **CSP Strict**
   - `script-src: 'self'` (local scripts only)
   - No `'unsafe-inline'`, no `'unsafe-eval'`
   - All scripts: `<script type="module">`

5. **Tailwind v4 + Custom CSS**
   - **Tailwind**:
     - Source: `public/css/input.css` (uses `@import 'tailwindcss'`)
     - Output: `public/css/tailwind.css` (generated, DO NOT EDIT)
     - Build: `npm run build:css`
     - Watch: `npm run watch:css`
     - Config: `tailwind.config.js`
     - **NEVER use `@apply` in v4** (use vanilla CSS properties)
     - Custom components: `@layer components { ... }` with standard CSS
   - **Custom CSS**:
     - Source: `public/css/styles.css` (editable)
     - Loads first, then tailwind.css
     - Both coexist (Tailwind higher specificity)

### Example (New Page)

```html
<!-- pages/productos.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <link rel="stylesheet" href="../css/styles.css" />
  </head>
  <body>
    <main id="productos-container"></main>
    <script type="module" src="./productos.js"></script>
  </body>
</html>
```

```javascript
// pages/productos.js
import { api } from '../js/shared/api.js'
import { showError, showLoading } from '../js/shared/dom.js'

async function loadProducts() {
  try {
    showLoading('productos-container')
    const products = await api.getProducts()
    renderProducts(products)
  } catch (error) {
    showError(error.message, 'productos-container')
    throw error // Fail-fast
  }
}

function renderProducts(products) {
  const container = document.getElementById('productos-container')
  container.innerHTML = products
    .map(
      p => `
    <div class="product-card">
      <h3>${p.name}</h3>
      <p>$${p.price_usd}</p>
    </div>
  `
    )
    .join('')
}

document.addEventListener('DOMContentLoaded', loadProducts)
```

---

## Prohibido

### Backend

- ❌ TypeScript, tRPC, Zod, complex build tools
- ❌ Import `supabaseClient.js` outside `api/services/`
- ❌ Use `||`, `??` in critical operations
- ❌ Silent error handling (always log + throw)
- ❌ Duplicate logic (extract to functions/services)
- ❌ Missing try-catch in services
- ❌ DB access from controllers
- ❌ `module.exports` (use ES6 `export`)

### Frontend

- ❌ Inline JS/CSS (violates CSP)
- ❌ Scripts without `type="module"`
- ❌ Duplicate logic (use `js/shared/`)
- ❌ Ignore fail-fast (always throw)
- ❌ Inline event handlers
- ❌ External CDNs without CSP check

---

## API Endpoints (26 Routes)

### Public (No Auth)

**Products** (8):

- `GET /api/products` - List with filters
- `GET /api/products/:id` - By ID
- `GET /api/products/sku/:sku` - By SKU
- `GET /api/products/carousel` - Featured products
- `GET /api/products/with-occasions` - With occasions (stored function)
- `GET /api/products/occasion/:occasionId` - By occasion
- `GET /api/products/:id/images` - Product images
- `GET /api/products/:id/images/primary` - Primary image

**Occasions** (3):

- `GET /api/occasions` - List all
- `GET /api/occasions/:id` - By ID
- `GET /api/occasions/slug/:slug` - By slug

**Settings** (1):

- `GET /api/settings/public` - Public settings

**Users** (1):

- `POST /api/users` - Register (public)

**Health** (1):

- `GET /health` - Health check

### Protected (Auth Required)

**Products (admin)** (7):

- `POST /api/products` - Create
- `POST /api/products/with-occasions` - Create with occasions
- `PUT /api/products/:id` - Update
- `PATCH /api/products/:id/carousel-order` - Update carousel order
- `PATCH /api/products/:id/stock` - Update stock
- `DELETE /api/products/:id` - Soft-delete
- `PATCH /api/products/:id/reactivate` - Reactivate

**Orders (admin/owner)** (6):

- `GET /api/orders` - List all (admin)
- `GET /api/orders/:id` - By ID
- `GET /api/orders/user/:userId` - By user
- `GET /api/orders/:id/status-history` - Status history
- `PATCH /api/orders/:id/status` - Update status
- `PATCH /api/orders/:id/cancel` - Cancel

**Users (admin/owner)** (4):

- `GET /api/users` - List all (admin)
- `GET /api/users/:id` - By ID
- `PUT /api/users/:id` - Update
- `DELETE /api/users/:id` - Soft-delete (admin)

**Occasions (admin)** (3):

- `POST /api/occasions` - Create
- `PUT /api/occasions/:id` - Update
- `DELETE /api/occasions/:id` - Soft-delete

**Settings (admin)** (4):

- `GET /api/settings` - List all
- `POST /api/settings` - Create
- `PUT /api/settings/:id` - Update
- `DELETE /api/settings/:id` - Delete

**Payments (admin)** (3):

- `GET /api/payments` - List all
- `GET /api/payments/methods` - Available methods
- `POST /api/payments/:id/confirm` - Confirm payment

**Docs** (3):

- `GET /api-docs` → Redirect to /api-docs/
- `GET /api-docs/` → Swagger UI
- `GET /api-docs.json` → OpenAPI spec

---

## Deployment

### Local Dev

```bash
npm run dev  # http://localhost:3000
```

**Endpoints**:

- `/` → Landing page
- `/health` → Health check
- `/api-docs/` → Swagger UI
- `/api/*` → REST API (26 endpoints)

### Production (Vercel)

**Dual-mode**: Local Node.js server + Vercel serverless

**Config**: `vercel.json`

- API: `@vercel/node` (serverless)
- Static: `@vercel/static`

**Env Vars**:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NODE_ENV=production`

---

## Dependencies

**Production**:

- `@supabase/supabase-js`, `express`, `dotenv`, `cors`, `helmet`
- `swagger-jsdoc`, `swagger-ui-express`
- `winston`, `xss-clean`
- `lucide`, `http-proxy-middleware`

**Dev**:

- `eslint`, `prettier`, `husky`, `lint-staged`
- `tailwindcss`, `autoprefixer`, `postcss`
- `vitest`, `@vitest/ui`, `happy-dom`, `supertest`

**Engines**: Node.js >= 20, npm >= 10

---

## Testing (Vitest + Happy DOM)

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report
```

**Test Structure**:

```
api/controllers/__tests__/
api/services/__tests__/
public/js/components/__tests__/
public/pages/__tests__/
```

**Example**:

```javascript
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

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
    expect(res.body.data.id).toBe(67)
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

---

## YOLO MODE (Claude Code Instructions)

### 1. EXECUTE WITHOUT ASKING

- **NEVER ask for confirmation** on code changes
- Identify error → **fix immediately**
- Need to create/modify files → **do it directly**
- **Exceptions ONLY**: delete files, git force push/hard reset, production config changes

### 2. MAXIMUM PROACTIVITY

- **Anticipate needs** without explicit instructions
- Code inconsistent with CLAUDE.md → **auto-fix**
- Missing validation → **add it**
- Duplicate code → **refactor**
- Service Layer violation → **remove import + restructure**
- **NO "Do you want me to...?"** → just do + report

### 3. AGGRESSIVE AUTO-FIX

- Linting errors → fix silently
- Type inconsistencies → adjust
- Missing try-catch → add
- Fallback operators (`||`, `??`) → replace with fail-fast
- Unnecessary console.logs → remove
- Disordered imports → organize
- Dead code → delete
- Service layer violations → fix immediately

### YOLO Response Format

```
✓ Fixed: [brief description]
✓ Refactored: [file:line]
✓ Added: [feature]
⚠ Blocked: [reason] (only if truly cannot continue)
```

**Example**:

```
✓ Fixed: Service layer violation in productController.js:45
✓ Added: includeInactive parameter to userService.getAllUsers()
✓ Refactored: Removed || fallback from orderService.js:78
✓ Cleaned: Removed 3 unused imports
```

### AFI (Awaiting Further Instruction)

When user says "AFI":

- ✅ Current task completed correctly
- ✅ User ready for next step
- ✅ Wait for instructions for next task
- ❌ NOT "do it automatically" - wait for explicit instruction

**Response**:

```
✅ Entendido. Tarea actual completada.
🎯 Esperando instrucciones para próximo paso.
```

### Prohibido en YOLO

- ❌ "Do you want...?", "Should I...?", "Does that seem...?"
- ❌ Long explanations before acting
- ❌ Wait for approval on obvious fixes
- ❌ Create docs unless requested
- ❌ Add TODOs or "// Fix later" comments

### Permitido en YOLO

- ✅ Modify any .js/.css/.html file
- ✅ Create files to achieve goal
- ✅ Run npm install, linting, testing
- ✅ Refactor code violating CLAUDE.md
- ✅ Delete dead/duplicate code
- ✅ Parallelize independent operations
- ✅ Add `includeInactive` to soft-delete services

### Golden Rule

**"If it's in CLAUDE.md, it's law. If it violates law, execute immediately. No questions, no warnings."**

**Additional**:

- If request too broad → ask to narrow scope
- Think more: use "Chain-of-thought", plan carefully, solve step-by-step

**AFI (Awaiting Further Instruction)**
