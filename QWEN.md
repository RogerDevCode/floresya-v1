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
│   ├── index.js                      # Express app configuration & middleware setup
│   ├── server.js                     # Server entry point (PORT 3000)
│   │
│   ├── config/                       # Configuration files
│   │   └── swagger.js                # OpenAPI 3.1 specification (swagger-jsdoc)
│   │
│   ├── controllers/                  # HTTP Controllers (HTTP Layer)
│   │   ├── occasionController.js     # Occasions CRUD endpoints
│   │   ├── orderController.js        # Orders CRUD + status management
│   │   ├── paymentController.js      # Payments CRUD
│   │   ├── productController.js      # Products CRUD + carousel
│   │   ├── settingsController.js     # Settings CRUD (key-value store)
│   │   └── userController.js         # Users CRUD + auth
│   │
│   ├── services/                     # Business Logic (ONLY layer with DB access)
│   │   ├── supabaseClient.js         # Supabase client + DB_SCHEMA + DB_FUNCTIONS (SSOT)
│   │   ├── authService.js            # Authentication logic (simulated JWT)
│   │   ├── occasionService.js        # Occasions business logic
│   │   ├── orderService.js           # Orders business logic
│   │   ├── orderStatusService.js     # Order status transitions
│   │   ├── paymentService.js         # Payments business logic
│   │   ├── productService.js         # Products business logic
│   │   ├── productImageService.js    # Product images relationship
│   │   ├── settingsService.js        # Settings business logic
│   │   └── userService.js            # Users business logic
│   │
│   ├── routes/                       # Express route definitions
│   │   ├── occasionRoutes.js         # /api/occasions
│   │   ├── orderRoutes.js            # /api/orders
│   │   ├── paymentRoutes.js          # /api/payments
│   │   ├── productRoutes.js          # /api/products
│   │   ├── settingsRoutes.js         # /api/settings
│   │   └── userRoutes.js             # /api/users
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # Authentication & authorization (simulated JWT)
│   │   ├── errorHandler.js           # Global error handler
│   │   ├── logger.js                 # Winston logger (info, warn, error)
│   │   ├── security.js               # Helmet, CORS, Rate Limiting, XSS, Sanitization
│   │   └── validate.js               # Request validation helpers
│   │
│   ├── errors/                       # Custom error classes
│   │   └── AppError.js               # BadRequestError, NotFoundError, UnauthorizedError, etc.
│   │
│   └── docs/                         # API Documentation
│       └── openapi-annotations.js    # 60+ Swagger JSDoc annotations for all endpoints
│
├── public/                           # Static files served by express.static()
│   ├── index.html                    # Landing page
│   ├── css/
│   │   └── styles.css                # Frontend styles
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
├── package.json                      # Dependencies & scripts
├── vercel.json                       # Vercel deployment config (dual-mode)
├── server.js                         # Legacy server entry (not used)
├── QWEN.md                         # This file (architecture documentation)
└── test-*.js                         # Test scripts (CRUD, API, DB)
```

### Descripción de Directorios

#### `api/` - Backend MVC

**Purpose:** Toda la lógica del backend usando arquitectura MVC.

**Subdirectorios clave:**

- `controllers/`: Manejan HTTP requests/responses, validan inputs, llaman servicios
- `services/`: Contienen toda la lógica de negocio, **única capa con acceso a Supabase**
- `routes/`: Definen endpoints REST y aplican middleware
- `middleware/`: Autenticación, logging, seguridad, validación
- `errors/`: Custom error classes (extends Error)
- `docs/`: OpenAPI 3.1 annotations (JSDoc)
- `config/`: Configuraciones (Swagger, DB)

#### `public/` - Frontend Estático

**Purpose:** Archivos servidos por `express.static('public')`.

**Contenido:**

- `index.html`: Landing page principal
- `css/`: Estilos CSS
- `images/`: Imágenes estáticas (logo, favicon, hero)
- `products/`: Imágenes de productos (10 samples)

**URL Mapping:**

- `http://localhost:3000/` → `public/index.html`
- `http://localhost:3000/images/logo.jpeg` → `public/images/logoFloresYa.jpeg`
- `http://localhost:3000/css/styles.css` → `public/css/styles.css`

#### `database/` - Scripts de BD

**Purpose:** Scripts SQL, dumps, migraciones (opcional).

#### Root Files

- `.env.local`: Variables de entorno (SUPABASE_URL, SUPABASE_KEY)
- `vercel.json`: Configuración para Vercel (dual-mode: local Node + serverless)
- `eslint.config.js`: ESLint 9 flat config
- `.prettierrc`: Prettier code formatting
- `package.json`: Dependencies, scripts (dev, format, start)

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

### 3. Fail-Fast en Servicios

Toda función de servicio debe usar try-catch y lanzar errores:

```javascript
export async function getProductById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid product ID: must be a number')
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error } = await query.single()

    if (error) throw new Error(`Database error: ${error.message}`)
    if (!data) throw new Error(`Product ${id} not found`)

    return data
  } catch (error) {
    console.error(`getProductById(${id}) failed:`, error)
    throw error // Fail-fast: always throw
  }
}
```

**Ejemplo incorrecto:**

```javascript
const products = (await getProducts()) || [] // ❌ NUNCA usar fallbacks silenciosos
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

### 6. Validación Manual Simple

Sin Zod. Usa validaciones directas en JS:

```javascript
function validateProductData(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Invalid name: must be a non-empty string')
    }
    if (!data.price_usd || typeof data.price_usd !== 'number' || data.price_usd <= 0) {
      throw new Error('Invalid price_usd: must be a positive number')
    }
  }

  if (data.price_usd !== undefined && (typeof data.price_usd !== 'number' || data.price_usd <= 0)) {
    throw new Error('Invalid price_usd: must be a positive number')
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

## Prohibido

- ❌ Usar TypeScript, tRPC, Zod, o herramientas de compilación complejas
- ❌ Importar `supabaseClient.js` fuera de `api/services/`
- ❌ Usar `||`, `??`, o valores por defecto en operaciones críticas
- ❌ Manejar errores en silencio (siempre log y throw)
- ❌ Duplicar lógica (extrae a funciones o servicios)
- ❌ Olvidar try-catch en funciones de servicios
- ❌ Acceder a la base de datos desde controllers
- ❌ Usar `module.exports` (usar ES6 `export` en su lugar)

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

## Despliegue

### Desarrollo Local

```bash
npm run dev  # Inicia servidor en http://localhost:3000
```

**Endpoints disponibles:**

- `http://localhost:3000/` → Landing page (index.html)
- `http://localhost:3000/health` → Health check
- `http://localhost:3000/api-docs/` → Swagger UI
- `http://localhost:3000/api/*` → REST API

### Producción (Vercel)

El proyecto está configurado para dual-mode:

- **Local**: Node.js server (`npm run dev`)
- **Vercel**: Serverless functions (automático)

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    { "src": "api/server.js", "use": "@vercel/node" },
    { "src": "public/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/health", "dest": "api/server.js" },
    { "src": "/api-docs(.*)", "dest": "api/server.js" },
    { "src": "/api/(.*)", "dest": "api/server.js" },
    { "src": "/(.*\\.(css|js|png|jpg|jpeg|svg|webp|ico|json))", "dest": "/public/$1" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
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
    "@supabase/supabase-js": "^2.47.10",
    "express": "^5.0.1",
    "express-rate-limit": "^7.4.0",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "winston": "^3.17.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "prettier": "^3.3.3",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.11",
    "eslint": "^9.18.0"
  }
}
```

Sin frameworks complejos, sin bundlers, sin TypeScript.

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

## MODO YOLO - Instrucciones para QWEN Code

### 1. EJECUTAR SIN PREGUNTAR

- **NUNCA pidas confirmación** para hacer cambios en código
- Si identificas un error, **corrígelo inmediatamente**
- Si necesitas crear/modificar archivos para cumplir el objetivo, **hazlo directamente**
- Las únicas excepciones son: eliminar archivos, operaciones destructivas en git (force push, hard reset), o cambios en configuración de producción

### 2. PROACTIVIDAD MÁXIMA

- **Anticipa necesidades** sin esperar instrucciones explícitas
- Si detectas código inconsistente con las reglas de QWEN.md, **corrígelo automáticamente**
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
- ✅ Refactorizar código que viole QWEN.md
- ✅ Eliminar código muerto o duplicado
- ✅ Paralelizar operaciones independientes
- ✅ Agregar `includeInactive` a servicios con soft-delete

### Regla de Oro YOLO

**"Si está en QWEN.md, es ley. Si viola la ley, se ejecuta inmediatamente. Sin preguntas, sin warnings."**
