# FloresYa - MVC Backend Architecture

## Objetivo

Desarrollar una plataforma de e-commerce backend con arquitectura MVC profesional para entrega de flores, siguiendo principios SOLID y Spring Boot-inspired patterns.

**Características principales:**

- Arquitectura MVC (Model-View-Controller)
- Capa de servicios estricta (Service Layer)
- Express 5 + Node.js
- Supabase (PostgreSQL)
- OpenAPI 3.1 (Swagger) para contratos de API
- Soft-delete pattern (active/is_active flags)
- Fail-fast philosophy
- Code formatting automático (Prettier + Husky)

---

## Principios Fundamentales

1. **KISS First**: Prefiere código simple y directo sobre abstracciones complejas
2. **MVC Strict**: Controllers (HTTP) → Services (Business Logic) → Database
3. **Service Layer Exclusivo**: Solo los servicios pueden acceder a Supabase
4. **SOLID Principles**: Single Responsibility, Dependency Inversion
5. **Fail Fast**: Si algo falla, lanza error y termina. Nada de valores por defecto silenciosos
6. **OpenAPI Contract**: API contract explícito para frontend
7. **Soft-Delete**: Usar flags `active`/`is_active` en lugar de eliminación física

---

## Estructura del Proyecto

```
floresya-v1/
├── api/                              # Backend MVC Architecture
│   ├── app.js                        # Express app configuration & middleware setup
│   ├── server.js                     # Server entry point (PORT 3000, imports app.js)
│   │
│   ├── config/                       # Configuration files
│   │   └── swagger.js                # OpenAPI 3.1 specification (swagger-jsdoc)
│   │
│   ├── controllers/                  # HTTP Controllers (HTTP Layer) - 7 controllers
│   │   ├── occasionController.js     # Occasions CRUD endpoints
│   │   ├── orderController.js        # Orders CRUD + status management
│   │   ├── paymentController.js      # Payments CRUD
│   │   ├── productController.js      # Products CRUD + carousel
│   │   ├── productImageController.js # Product images CRUD (NEW)
│   │   ├── settingsController.js     # Settings CRUD (key-value store)
│   │   └── userController.js         # Users CRUD + auth
│   │
│   ├── services/                     # Business Logic (ONLY layer with DB access) - 10 services
│   │   ├── supabaseClient.js         # Supabase client + DB_SCHEMA + DB_FUNCTIONS (SSOT)
│   │   ├── authService.js            # Authentication logic (simulated JWT)
│   │   ├── occasionService.js        # Occasions business logic
│   │   ├── orderService.js           # Orders business logic
│   │   ├── orderStatusService.js     # Order status transitions
│   │   ├── paymentService.js         # Payments business logic
│   │   ├── productService.js         # Products business logic
│   │   ├── productImageService.js    # Product images relationship (NEW)
│   │   ├── settingsService.js        # Settings business logic
│   │   └── userService.js            # Users business logic
│   │
│   ├── routes/                       # Express route definitions - 7 routes
│   │   ├── occasionRoutes.js         # /api/occasions
│   │   ├── orderRoutes.js            # /api/orders
│   │   ├── paymentRoutes.js          # /api/payments
│   │   ├── productRoutes.js          # /api/products + /api/products/:id/images
│   │   ├── productImageRoutes.js     # Product images routes (standalone, NEW)
│   │   ├── settingsRoutes.js         # /api/settings
│   │   └── userRoutes.js             # /api/users
│   │
│   ├── middleware/                   # Express middleware - 6 files
│   │   ├── auth.js                   # Authentication & authorization (simulated JWT)
│   │   ├── errorHandler.js           # Global error handler + asyncHandler
│   │   ├── logger.js                 # Winston logger (info, warn, error)
│   │   ├── schemas.js                # Validation schemas (SSOT, matches OpenAPI) (NEW)
│   │   ├── security.js               # Helmet, CORS, Rate Limiting, XSS, Sanitization
│   │   └── validate.js               # Request validation helpers (validate, validateId, validatePagination)
│   │
│   ├── errors/                       # Custom error classes
│   │   └── AppError.js               # BadRequestError, NotFoundError, UnauthorizedError, etc.
│   │
│   └── docs/                         # API Documentation
│       └── openapi-annotations.js    # 60+ Swagger JSDoc annotations for all endpoints
│
├── public/                           # Static files served by express.static()
│   ├── index.html                    # Landing page (NO inline JS/CSS)
│   ├── index.js                      # Index page logic (ES6 module, paired with index.html)
│   │
│   ├── pages/                        # HTML pages + JS modules
│   │   ├── product-detail.html       # Product detail page (IMPLEMENTED)
│   │   ├── product-detail.js         # Product detail page logic (IMPLEMENTED)
│   │   ├── productos.html            # Products page (TODO)
│   │   ├── productos.js              # Products page logic (TODO)
│   │   ├── checkout.html             # Checkout page (TODO)
│   │   └── checkout.js               # Checkout page logic (TODO)
│   │
│   ├── js/                           # JavaScript modules
│   │   ├── shared/                   # SSOT - Shared code
│   │   │   ├── api.js                # API client (fetchJSON, api methods)
│   │   │   ├── validators.js         # Input validators
│   │   │   └── dom.js                # DOM helpers
│   │   ├── components/               # Reusable UI components
│   │   │   ├── imageCarousel.js      # Product image carousel (IMPLEMENTED)
│   │   │   ├── modal.js              # Modal component (TODO)
│   │   │   ├── toast.js              # Toast notifications (TODO)
│   │   │   └── form.js               # Form component (TODO)
│   │   └── lucide-icons.js           # Icon loader (CSP-compatible)
│   │
│   ├── css/
│   │   ├── input.css                 # Tailwind source (with @import 'tailwindcss')
│   │   ├── tailwind.css              # Compiled Tailwind CSS (generated, do not edit)
│   │   └── styles.css                # Custom CSS tradicional (editable)
│   ├── images/                       # Static images
│   │   ├── favicon.ico
│   │   ├── hero-flowers.webp
│   │   ├── logoFloresYa.jpeg
│   │   └── placeholder-flower.svg
│   └── products/                     # Product images (10+ sample images)
│       └── *.jpg
│
├── styles/                           # Legacy CSS (kept for compatibility)
│   └── main.css
│
├── database/                         # Database scripts (optional)
│
├── .env.local                        # Local environment variables (not committed)
├── .prettierrc                       # Prettier configuration
├── .husky/                           # Git hooks (pre-commit formatting)
├── eslint.config.js                  # ESLint 9 flat config
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration (Tailwind + Autoprefixer)
├── package.json                      # Dependencies & scripts
├── vercel.json                       # Vercel deployment config (dual-mode)
├── server.js                         # Legacy server entry (not used)
├── CLAUDE.md                         # This file (architecture documentation)
└── test-*.js                         # Test scripts (CRUD, API, DB)
```

### Descripción de Directorios

#### `api/` - Backend MVC

**Purpose:** Toda la lógica del backend usando arquitectura MVC.

**Subdirectorios clave:**

- `controllers/` (7 files): Manejan HTTP requests/responses, llaman servicios
  - productController, productImageController, orderController, userController, etc.
  - Usan `asyncHandler` para manejo de errores
  - Retornan respuestas estandarizadas: `{ success, data, message }`

- `services/` (10 files): Contienen toda la lógica de negocio, **única capa con acceso a Supabase**
  - supabaseClient.js: SSOT para DB_SCHEMA + DB_FUNCTIONS
  - productService, orderService, userService, authService, etc.
  - Implementan soft-delete pattern con `includeInactive` param
  - Fail-fast: siempre lanzan errores, nunca retornan valores por defecto

- `routes/` (7 files): Definen endpoints REST y aplican middleware
  - Usan validation schemas centralizados desde `middleware/schemas.js`
  - Aplican `authenticate` y `authorize('admin')` para rutas protegidas
  - Usan `validateId()` y `validatePagination()` helpers

- `middleware/` (6 files): Autenticación, logging, seguridad, validación
  - `auth.js`: JWT simulation, authenticate, authorize(role)
  - `schemas.js`: 11 validation schemas (SSOT, matches OpenAPI 3.1)
  - `validate.js`: Generic validator, validateId, validatePagination
  - `security.js`: Helmet, CORS, Rate Limiting, XSS, Sanitization
  - `logger.js`: Winston logger (info, warn, error)
  - `errorHandler.js`: Global error handler + asyncHandler wrapper

- `errors/`: Custom error classes (extends Error)
  - BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError, etc.

- `docs/`: OpenAPI 3.1 annotations (JSDoc)
  - openapi-annotations.js: 60+ endpoint annotations

- `config/`: Configuraciones (Swagger, DB)
  - swagger.js: swagger-jsdoc configuration

#### `public/` - Frontend Estático

**Purpose:** Archivos servidos por `express.static('public')`.

**Contenido:**

- `index.html` + `index.js`: Landing page principal (ES6 module)
- `pages/`: Páginas HTML + JS modules
  - `product-detail.html` + `product-detail.js` (IMPLEMENTED)
  - `productos.html` + `productos.js` (TODO)
  - `checkout.html` + `checkout.js` (TODO)
- `js/shared/`: SSOT - Código compartido
  - `api.js`: API client (fetchJSON, métodos HTTP)
  - `validators.js`: Validaciones reutilizables
  - `dom.js`: Helpers DOM (showError, showLoading, etc.)
- `js/components/`: Componentes UI reutilizables
  - `imageCarousel.js`: Product image carousel (IMPLEMENTED)
  - `modal.js`, `toast.js`, `form.js` (TODO)
- `css/`: Estilos CSS
  - `input.css`: Tailwind source (usa `@import 'tailwindcss'`)
  - `tailwind.css`: Compiled CSS (generado, NO editar)
  - `styles.css`: CSS tradicional custom
- `images/`: Imágenes estáticas (logo, favicon, hero)
- `products/`: Imágenes de productos (10+ samples)

**URL Mapping:**

- `http://localhost:3000/` → `public/index.html`
- `http://localhost:3000/pages/product-detail.html?id=67` → Product detail page
- `http://localhost:3000/images/logo.jpeg` → `public/images/logoFloresYa.jpeg`
- `http://localhost:3000/css/tailwind.css` → Compiled Tailwind CSS
- `http://localhost:3000/js/components/imageCarousel.js` → ES6 module

**Reglas estrictas:**

- ❌ NO usar JS o CSS inline en HTML
- ✅ Todos los scripts como ES6 modules (`type="module"`)
- ✅ CSP-compatible (`script-src: 'self'`, no `'unsafe-inline'`)
- ✅ Cada página `.html` tiene su `.js` paired module

#### `database/` - Scripts de BD

**Purpose:** Scripts SQL, dumps, migraciones (opcional).

#### Root Files

- `.env.local`: Variables de entorno (SUPABASE_URL, SUPABASE_KEY)
- `vercel.json`: Configuración para Vercel (dual-mode: local Node + serverless)
- `eslint.config.js`: ESLint 9 flat config
- `.prettierrc`: Prettier code formatting
- `tailwind.config.js`: Tailwind CSS config (content paths, theme, plugins)
- `postcss.config.js`: PostCSS config (Tailwind + Autoprefixer)
- `package.json`: Dependencies, scripts (dev, build:css, watch:css, format, start)

---

## Flujo de Datos (MVC)

```
Frontend (HTML + fetch)
  ↓ HTTP Request
Express Router (routes/)
  ↓ Route to controller
Controller (controllers/)
  ↓ Call service method
Service (services/)
  ↓ Supabase query
Database (PostgreSQL)
  ↓ Return data
Service → Controller → Response (JSON)
```

**Regla crítica:** Solo los archivos en `api/services/` pueden importar `supabaseClient.js`

---

## Reglas Obligatorias

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
- Lanzan errores en caso de fallo (fail-fast)
- Retornan datos o lanzan excepciones

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

### 3. Fail-Fast con Custom Error Classes (ENTERPRISE-GRADE)

**FILOSOFÍA**: Los errores son datos valiosos. Lanza errores específicos con metadata rica para debugging y monitoring.

#### Error Class Hierarchy

**Arquitectura:**

```
api/errors/
└── AppError.js                    # Base error + 15 specialized error classes
    ├── HTTP 4xx Errors
    │   ├── BadRequestError        # 400 - Invalid input
    │   ├── UnauthorizedError      # 401 - Auth required
    │   ├── ForbiddenError         # 403 - Access denied
    │   ├── NotFoundError          # 404 - Resource not found
    │   ├── ConflictError          # 409 - Resource conflict
    │   └── ValidationError        # 422 - Validation failed
    ├── HTTP 5xx Errors
    │   ├── InternalServerError    # 500 - Programming error
    │   └── ServiceUnavailableError # 503 - Service down
    ├── Database Errors (severity: critical)
    │   ├── DatabaseError          # Generic DB operation error
    │   ├── DatabaseConnectionError # DB connection failed
    │   └── DatabaseConstraintError # Unique/FK constraint violation
    ├── Business Logic Errors
    │   ├── InsufficientStockError  # Stock validation
    │   ├── PaymentFailedError      # Payment processing
    │   ├── OrderNotProcessableError # Order validation
    │   └── InvalidStateTransitionError # State machine
    └── External Service Errors
        ├── ExternalServiceError    # 3rd party API failure
        └── RateLimitExceededError  # 429 - Too many requests
```

#### Error Metadata (Structured)

Todas las custom errors incluyen:

```javascript
{
  name: 'DatabaseError',           // Error class name
  code: 'DATABASE_ERROR',          // Machine-readable code (UPPER_SNAKE_CASE)
  message: 'Technical message',    // For logs
  userMessage: 'User-friendly msg', // Safe for frontend
  statusCode: 500,                 // HTTP status
  severity: 'critical',            // 'low' | 'medium' | 'high' | 'critical'
  context: {                       // Additional metadata
    operation: 'SELECT',
    table: 'products',
    productId: 123
  },
  timestamp: '2025-10-02T...',     // ISO timestamp
  isOperational: false,            // true = expected, false = bug
  stack: '...'                     // Stack trace
}
```

#### Ejemplo Correcto (Service Layer)

```javascript
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  InsufficientStockError
} from '../errors/AppError.js'

export async function getProductById(id, includeInactive = false) {
  try {
    // Validación de entrada
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID: must be a number', { productId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    // Error específico de DB
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Product', id, { includeInactive })
      }
      throw new DatabaseError('SELECT', TABLE, error, { productId: id })
    }

    // Data missing (fail-fast)
    if (!data) {
      throw new NotFoundError('Product', id, { includeInactive })
    }

    return data
  } catch (error) {
    // Re-throw AppError instances as-is (fail-fast)
    if (error.name && error.name.includes('Error')) {
      throw error
    }
    // Wrap unexpected errors
    console.error(`getProductById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { productId: id })
  }
}

// Business logic error example
export async function decrementStock(id, quantity) {
  const product = await getProductById(id)

  // ENTERPRISE FAIL-FAST: Specific business error with context
  if (product.stock < quantity) {
    throw new InsufficientStockError(id, quantity, product.stock)
    // Results in:
    // {
    //   code: 'INSUFFICIENT_STOCK',
    //   statusCode: 409,
    //   context: { productId: 123, requested: 5, available: 2 },
    //   userMessage: 'Only 2 units available. Please adjust quantity.'
    // }
  }

  return await updateStock(id, product.stock - quantity)
}
```

#### Serialización Automática

Todas las errors tienen `.toJSON()`:

```javascript
// api/middleware/errorHandler.js
export function errorHandler(err, req, res, _next) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const response = err.toJSON(isDevelopment)

  // SECURITY: Never expose internals in production
  if (!isDevelopment && err.statusCode >= 500) {
    delete response.details
  }

  res.status(err.statusCode).json(response)
}
```

**Respuesta API:**

```json
{
  "success": false,
  "error": "InsufficientStockError",
  "code": "INSUFFICIENT_STOCK",
  "message": "Only 2 units available. Please adjust quantity.",
  "details": {
    "productId": 123,
    "requested": 5,
    "available": 2
  },
  "timestamp": "2025-10-02T14:23:45.123Z"
}
```

#### Logging por Severity

```javascript
// Severity-based logging (not just statusCode)
switch (error.severity) {
  case 'critical':
    logger.error('CRITICAL ERROR', { ...metadata, stack })
    // TODO: Send to Sentry/Datadog
    break
  case 'high':
    logger.error('High Severity', metadata)
    break
  case 'medium':
    logger.warn('Medium Severity', metadata)
    break
  case 'low':
    logger.info('Low Severity', metadata)
    break
}
```

#### Prohibido (ANTI-PATTERNS)

```javascript
// ❌ NUNCA - Generic errors sin metadata
throw new Error('Something went wrong')

// ❌ NUNCA - Fallbacks silenciosos
const products = (await getProducts()) || []

// ❌ NUNCA - Swallow errors
try {
  await dangerousOperation()
} catch (e) {
  console.log('Error:', e)
  return [] // ❌ Silent failure
}

// ❌ NUNCA - Exponer stack traces en producción
if (process.env.NODE_ENV === 'production') {
  response.stack = error.stack // ❌ SECURITY RISK
}

// ✅ CORRECTO - Custom error con contexto
throw new DatabaseError('INSERT', 'products', error, {
  sku: productData.sku
})

// ✅ CORRECTO - Business logic error específico
throw new InsufficientStockError(productId, requested, available)

// ✅ CORRECTO - Fail-fast sin catch
const product = await getProductById(id) // Throws NotFoundError if missing

// ✅ CORRECTO - Re-throw AppErrors as-is
catch (error) {
  if (error.name && error.name.includes('Error')) {
    throw error // Preserve error metadata
  }
  throw new InternalServerError('Unexpected error', { originalError: error.message })
}
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

### 6. Validación Manual Robusta (SSOT)

**Sin Zod.** Validación manual en JavaScript puro con schemas centralizados.

**Arquitectura:**

```
api/middleware/
├── validate.js        # Generic validator + helpers (validateId, validatePagination)
└── schemas.js         # Validation schemas (SSOT, matches OpenAPI 3.1 exactly)
```

**schemas.js** contiene 11 schemas que coinciden 100% con OpenAPI:

- `productCreateSchema` - Required: name, price_usd (line 168 OpenAPI)
- `productUpdateSchema` - All optional (line 234 OpenAPI)
- `productFilterSchema` - Query params (limit, offset, featured, etc.)
- `orderCreateSchema` - With custom array validation for items
- `orderStatusUpdateSchema` - Enum: pending, verified, preparing, etc.
- `userCreateSchema` - Email validation + phone pattern
- `userUpdateSchema` - Optional fields with role enum
- `occasionCreateSchema` - Slug pattern validation (lowercase-hyphen)
- `settingCreateSchema` - Key pattern (UPPERCASE_SNAKE_CASE)
- `paymentCreateSchema` - Amount validation
- `productImageCreateSchema` - Size enum + URL pattern

**Ejemplo de uso en routes:**

```javascript
import { validate, validateId } from '../middleware/validate.js'
import { productCreateSchema, productUpdateSchema } from '../middleware/schemas.js'

// Create product with centralized schema
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(productCreateSchema), // From schemas.js - matches OpenAPI exactly
  productController.createProduct
)

// Update product
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(), // Validates id param is positive integer
  validate(productUpdateSchema), // From schemas.js
  productController.updateProduct
)
```

**Características de validación:**

- Type checking (string, number, boolean, array, object)
- String: minLength, maxLength, pattern (RegEx), email
- Number: min, max, integer
- Array: minLength, maxLength, items type
- Enum validation
- Custom validation functions
- Required/optional fields
- Fail-fast on validation errors

**Ejemplo de schema:**

```javascript
export const productCreateSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 255
  },
  price_usd: {
    type: 'number',
    required: true,
    min: 0
  },
  stock: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  featured: {
    type: 'boolean',
    required: false
  }
}
```

### 7. Code Formatting Automático

**Prettier** formatea código automáticamente en pre-commit:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

**Husky + lint-staged** ejecutan Prettier antes de cada commit.

---

## Frontend Architecture (ES6 Modules)

### Reglas estrictas para HTML/JS

1. **NUNCA usar JS o CSS inline en HTML**
   - ❌ Prohibido: `<script>...</script>` inline
   - ❌ Prohibido: `<style>...</style>` inline
   - ❌ Prohibido: `style="..."` attributes
   - ❌ Prohibido: `onclick="..."` handlers
   - ✅ Correcto: `<script type="module" src="./index.js"></script>`
   - ✅ Correcto: `<link rel="stylesheet" href="./css/styles.css">`

2. **Arquitectura de módulos ES6**
   - Cada `.html` tiene su `.js` al mismo nivel (ej: `index.html` + `index.js`)
   - Páginas nuevas en `pages/` (ej: `pages/productos.html` + `pages/productos.js`)
   - Código compartido en `js/shared/` (SSOT)
   - Componentes reutilizables en `js/components/`

3. **SSOT en Frontend**
   - `js/shared/api.js`: Cliente API (fetchJSON, métodos HTTP)
   - `js/shared/validators.js`: Validaciones reutilizables
   - `js/shared/dom.js`: Helpers DOM (showError, showLoading, etc)

4. **Compatible con CSP strict**
   - `script-src: 'self'` (solo scripts locales)
   - No `'unsafe-inline'`, no `'unsafe-eval'`
   - Módulos ES6: `<script type="module">`

5. **Tailwind CSS v4 + CSS Tradicional**
   - **Tailwind:**
     - Source: `public/css/input.css` (usa `@import 'tailwindcss'` en lugar de `@tailwind` directives)
     - Output: `public/css/tailwind.css` (generado, NO editar directamente)
     - Build: `npm run build:css` (compila y minifica a tailwind.css)
     - Watch: `npm run watch:css` (compila en watch mode)
     - Config: `tailwind.config.js` (content paths, theme extend, plugins)
     - PostCSS: `postcss.config.js` (Tailwind + Autoprefixer)
     - **NUNCA usar `@apply` en Tailwind v4** (escribir CSS vanilla con propiedades estándar)
     - Custom components en `@layer components { ... }` con CSS estándar
   - **CSS Tradicional:**
     - Source: `public/css/styles.css` (editable, estilos custom sin Tailwind)
     - Se carga primero en HTML, luego tailwind.css
     - Ambos CSS conviven sin conflictos (Tailwind tiene mayor especificidad por orden de carga)

### Ejemplo correcto de página nueva

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
// pages/productos.js (ES6 Module)
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

- ❌ Usar TypeScript, tRPC, Zod, o herramientas de compilación complejas
- ❌ Importar `supabaseClient.js` fuera de `api/services/`
- ❌ Usar `||`, `??`, o valores por defecto en operaciones críticas
- ❌ Manejar errores en silencio (siempre log y throw)
- ❌ Duplicar lógica (extrae a funciones o servicios)
- ❌ Olvidar try-catch en funciones de servicios
- ❌ Acceder a la base de datos desde controllers
- ❌ Usar `module.exports` (usar ES6 `export` en su lugar)

### Frontend

- ❌ JS o CSS inline en HTML (viola CSP)
- ❌ Scripts sin `type="module"`
- ❌ Duplicar lógica (usa `js/shared/`)
- ❌ Ignorar fail-fast (siempre throw errors)
- ❌ Event handlers inline (`onclick="..."`)
- ❌ CDNs externos sin verificar CSP

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

## API Endpoints (26 rutas)

### Public Endpoints (sin autenticación)

**Products:**

- `GET /api/products` - Lista de productos con filtros (limit, offset, featured, sku, search, sortBy)
- `GET /api/products/:id` - Producto por ID
- `GET /api/products/sku/:sku` - Producto por SKU
- `GET /api/products/carousel` - Productos destacados para carousel
- `GET /api/products/with-occasions` - Productos con ocasiones (stored function)
- `GET /api/products/occasion/:occasionId` - Productos por ocasión
- `GET /api/products/:id/images` - Imágenes de producto (query: size)
- `GET /api/products/:id/images/primary` - Imagen principal de producto

**Occasions:**

- `GET /api/occasions` - Lista de ocasiones
- `GET /api/occasions/:id` - Ocasión por ID
- `GET /api/occasions/slug/:slug` - Ocasión por slug

**Settings:**

- `GET /api/settings/public` - Settings públicos

**Users:**

- `POST /api/users` - Registro de usuario (public)

**Health:**

- `GET /health` - Health check

### Protected Endpoints (requiere autenticación)

**Admin Only:**

**Products (admin):**

- `POST /api/products` - Crear producto
- `POST /api/products/with-occasions` - Crear producto con ocasiones
- `PUT /api/products/:id` - Actualizar producto
- `PATCH /api/products/:id/carousel-order` - Actualizar orden en carousel
- `PATCH /api/products/:id/stock` - Actualizar stock
- `DELETE /api/products/:id` - Soft-delete producto
- `PATCH /api/products/:id/reactivate` - Reactivar producto

**Orders (admin/owner):**

- `GET /api/orders` - Lista de todas las órdenes (admin)
- `GET /api/orders/:id` - Orden por ID (admin/owner)
- `GET /api/orders/user/:userId` - Órdenes por usuario (admin/owner)
- `GET /api/orders/:id/status-history` - Historial de cambios de status
- `PATCH /api/orders/:id/status` - Actualizar status de orden
- `PATCH /api/orders/:id/cancel` - Cancelar orden

**Users (admin/owner):**

- `GET /api/users` - Lista de usuarios (admin)
- `GET /api/users/:id` - Usuario por ID (admin/owner)
- `PUT /api/users/:id` - Actualizar usuario (admin/owner)
- `DELETE /api/users/:id` - Soft-delete usuario (admin)

**Occasions (admin):**

- `POST /api/occasions` - Crear ocasión
- `PUT /api/occasions/:id` - Actualizar ocasión
- `DELETE /api/occasions/:id` - Soft-delete ocasión

**Settings (admin):**

- `GET /api/settings` - Todos los settings
- `POST /api/settings` - Crear setting
- `PUT /api/settings/:id` - Actualizar setting
- `DELETE /api/settings/:id` - Eliminar setting

**Payments (admin):**

- `GET /api/payments` - Lista de pagos
- `GET /api/payments/methods` - Métodos de pago disponibles
- `POST /api/payments/:id/confirm` - Confirmar pago

**Documentación:**

- `GET /api-docs` → Redirect a /api-docs/
- `GET /api-docs/` → Swagger UI interactivo
- `GET /api-docs.json` → OpenAPI 3.1 spec JSON

---

## Despliegue

### Desarrollo Local

```bash
npm run dev  # Inicia servidor en http://localhost:3000
```

**Endpoints locales:**

- `http://localhost:3000/` → Landing page (index.html)
- `http://localhost:3000/health` → Health check
- `http://localhost:3000/api-docs/` → Swagger UI
- `http://localhost:3000/api/*` → REST API (26 endpoints)

### Producción (Vercel)

El proyecto está configurado para dual-mode:

- **Local**: Node.js server (`npm run dev`)
- **Vercel**: Serverless functions (automático)

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/server.js"
    },
    {
      "source": "/health",
      "destination": "/api/server.js"
    },
    {
      "source": "/api-docs:path*",
      "destination": "/api/server.js"
    },
    {
      "source": "/",
      "destination": "/public/index.html"
    },
    {
      "source": "/css/:path*",
      "destination": "/public/css/:path*"
    },
    {
      "source": "/js/:path*",
      "destination": "/public/js/:path*"
    },
    {
      "source": "/images/:path*",
      "destination": "/public/images/:path*"
    },
    {
      "source": "/products/:path*",
      "destination": "/public/products/:path*"
    },
    {
      "source": "/pages/:path*",
      "destination": "/public/pages/:path*"
    },
    {
      "source": "/:path*.js",
      "destination": "/public/:path*.js"
    },
    {
      "source": "/:path*.css",
      "destination": "/public/:path*.css"
    },
    {
      "source": "/:path*.html",
      "destination": "/public/:path*.html"
    },
    {
      "source": "/:path*.(png|jpg|jpeg|svg|webp|ico)",
      "destination": "/public/:path*.$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,HEAD,PUT,PATCH,POST,DELETE"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "*"
        }
      ]
    },
    {
      "source": "/(.*)\\.js$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    },
    {
      "source": "/(.*)\\.css$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        }
      ]
    },
    {
      "source": "/(.*)\\.html$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/html; charset=utf-8"
        }
      ]
    },
    {
      "source": "/(.*)\\.json$",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json; charset=utf-8"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Variables de entorno en Vercel:**

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NODE_ENV=production`

---

## Dependencias

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.48.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "helmet": "^8.0.0",
    "http-proxy-middleware": "^3.0.5",
    "lucide": "^0.544.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "winston": "^3.17.0",
    "xss-clean": "^0.1.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@tailwindcss/cli": "^4.1.13",
    "@vitest/ui": "^3.2.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.17.0",
    "globals": "^15.14.0",
    "happy-dom": "^19.0.2",
    "husky": "^9.1.7",
    "lint-staged": "^16.2.3",
    "postcss": "^8.5.6",
    "prettier": "^3.6.2",
    "serve": "^14.2.5",
    "supertest": "^7.1.4",
    "tailwindcss": "^4.1.13",
    "vitest": "^3.2.4"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

**Nuevas dependencias agregadas:**

- `http-proxy-middleware`: Proxy para desarrollo
- `lucide`: Iconos SVG (CSP-compatible, sin CDN)
- `xss-clean`: Sanitización XSS
- `vitest` + `@vitest/ui` + `happy-dom`: Testing framework (reemplaza Jest)
- `supertest`: Testing de HTTP endpoints
- `serve`: Static file server para testing

Sin frameworks complejos, sin bundlers, sin TypeScript. Tailwind v4 para estilos CSS.

---

## Testing (Vitest + Happy DOM)

**Framework:** Vitest 3.2.4 (reemplaza Jest, más rápido)

**Estructura de tests:**

```
api/
├── controllers/__tests__/
│   ├── productController.test.js
│   └── productImageController.test.js
├── services/__tests__/
│   └── productImageService.test.js
public/
├── js/components/__tests__/
│   └── imageCarousel.test.js
└── pages/__tests__/
    └── product-detail.test.js
```

**Scripts de testing:**

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI (interactive)
npm run test:coverage # Coverage report
```

**Configuración:**

- **Vitest:** Fast unit testing, compatible con ESM
- **Happy DOM:** Lightweight DOM implementation (sin JSDOM)
- **Supertest:** HTTP endpoint testing
- **Mocking:** `vi.mock()` para services y fetch

**Ejemplo de test (controller):**

```javascript
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

// Mock service
vi.mock('../../services/productService.js', () => ({
  getProductById: vi.fn((productId, _includeInactive) => {
    if (productId === 67) {
      return Promise.resolve({ id: 67, name: 'Test Product' })
    }
    throw new Error('Product not found')
  })
}))

describe('Product Controller', () => {
  it('should return product for valid ID', async () => {
    const response = await request(app).get('/api/products/67').expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data.id).toBe(67)
  })
})
```

**Coverage actual:** Parcial (controllers + components implementados)

**TODO:** Aumentar coverage a 80%+ (services, routes, middleware)

---

## Filosofía Final

**"Go all out!"**
**"Don't hold back, just do it."**
**"Go hard or go home."**
**"No warnings, no tears."**

- **KISS > Complejidad**: Una solución simple que funciona es mejor que una compleja que podría fallar
- **Fail fast**: Mejor que se rompa temprano que corromper datos en silencio
- **Service Layer es ley**: Nunca lo saltes. Es tu única fuente de lógica de negocio
- **MVC estricto**: Controllers (HTTP) → Services (Logic) → Database
- **OpenAPI first**: El contrato de API es la verdad
- **Soft-delete**: Nunca elimines datos, solo desactívalos

---

## MODO YOLO - Instrucciones para Claude Code

### 1. EJECUTAR SIN PREGUNTAR

- **NUNCA pidas confirmación** para hacer cambios en código
- Si identificas un error, **corrígelo inmediatamente**
- Si necesitas crear/modificar archivos para cumplir el objetivo, **hazlo directamente**
- Las únicas excepciones son: eliminar archivos, operaciones destructivas en git (force push, hard reset), o cambios en configuración de producción

### 2. PROACTIVIDAD MÁXIMA

- **Anticipa necesidades** sin esperar instrucciones explícitas
- Si detectas código inconsistente con las reglas de CLAUDE.md, **corrígelo automáticamente**
- Si falta validación, **agrégala**
- Si hay código duplicado, **refactorízalo**
- Si un import viola la Service Layer, **elimínalo y reestructura**
- **No preguntes "¿quieres que...?"** → simplemente hazlo y reporta qué hiciste

### 3. AUTO-FIX AGRESIVO

- **Linting errors**: corrígelos sin avisar
- **Type inconsistencies**: ajústalos directamente
- **Missing try-catch**: agrégalos automáticamente
- **Fallback operators (||, ??)**: reemplázalos por fail-fast
- **Console.logs innecesarios**: elimínalos
- **Imports desordenados**: organízalos
- **Código muerto**: elimínalo
- **Service layer violations**: corrige inmediatamente

### Formato de Respuesta YOLO

Cuando hagas cambios automáticos, usa este formato ultra-conciso:

```
✓ Fixed: [descripción breve]
✓ Refactored: [archivo:línea]
✓ Added: [funcionalidad]
⚠ Blocked: [razón] (solo si realmente no puedes continuar)
```

**Ejemplo:**

```
✓ Fixed: Service layer violation in productController.js:45
✓ Added: includeInactive parameter to userService.getAllUsers()
✓ Refactored: Removed || fallback from orderService.js:78
✓ Cleaned: Removed 3 unused imports
```

### AFI (Awaiting Further Instruction)

**Definición**: "AFI" significa "Awaiting Further Instruction" (Esperando Más Instrucciones).

**Uso**: Cuando el usuario dice "AFI", significa:

- ✅ Has completado la tarea actual correctamente
- ✅ Usuario está listo para siguiente paso
- ✅ Espera instrucciones para próxima tarea
- ❌ NO significa "hazlo automáticamente" - espera instrucción explícita

**Respuesta correcta a AFI**:

```
✅ Entendido. Tarea actual completada.
🎯 Esperando instrucciones para próximo paso.
```

### Prohibido en Modo YOLO

- ❌ Frases como "¿Quieres que...?", "¿Debería...?", "¿Te parece bien...?"
- ❌ Explicaciones largas antes de actuar
- ❌ Esperar aprobación para fixes obvios
- ❌ Crear documentación sin que se solicite
- ❌ Añadir TODOs o comentarios "// Fix later"

### Permitido en Modo YOLO

- ✅ Modificar cualquier archivo .js/.css/.html
- ✅ Crear archivos necesarios para cumplir el objetivo
- ✅ Ejecutar npm install, linting, testing
- ✅ Refactorizar código que viole CLAUDE.md
- ✅ Eliminar código muerto o duplicado
- ✅ Paralelizar operaciones independientes
- ✅ Agregar `includeInactive` a servicios con soft-delete

### Regla de Oro YOLO

**"Si está en CLAUDE.md, es ley. Si viola la ley, se ejecuta inmediatamente. Sin preguntas, sin warnings."**

- si soy muy amplio en mi solicitud de una tarea, pregunta para ajustar la tarea y ser mas especifico
- think more, usa "Chain-of-thought", planifica y piensa detenidamente, soluciona paso a paso

AFI (Awaiting Further Instruction)
