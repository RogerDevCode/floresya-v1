# FloresYa - Arquitectura MVC para E-Commerce Unificada

## 🚨 MANDATORY: Read Before Starting

**Before writing ANY code, read:**

```
.factory/droids/MANDATORY_RULES.md
```

**Or run:**

```bash
./.factory/droids/SESSION_START.sh
```

This file contains critical ESLint rules and checklists that MUST be followed at all times.

---

## Stack Técnico

- Express 5 + Node.js + Supabase (PostgreSQL) + Tailwind v4 + ES6 Modules.

## Principios Fundamentales (Obligatorios)

1. **KISS First**: Prioriza soluciones simples sobre complejas. Prohibido introducir abstracciones innecesarias que compliquen el mantenimiento.
2. **MVC Strict**: Flujo estricto: Controllers → Services → Database. Prohibido cualquier acceso directo a la base de datos desde controllers o rutas.
3. **Service Layer Exclusivo**: Solo los archivos en `api/services/` pueden importar y acceder a `supabaseClient.js`. Cualquier violación debe ser corregida inmediatamente.
4. **Fail Fast**: Lanza errores específicos e inmediatos en todas las operaciones críticas. Prohibido usar valores por defecto silenciosos, operadores de fallback (`||`, `??`), o manejar errores en silencio. Todo try-catch debe tener un parámetro `error`, loguear el error con `console.error(error)`, y relanzar el error.
5. **Soft-Delete**: Usa flags como `active` o `is_active` para desactivar registros. Prohibido eliminar datos físicamente; siempre implementa parámetro `includeInactive` (default: false) en consultas relevantes, controlado por roles (e.g., admin only).
6. **OpenAPI Contract**: Toda la API debe estar documentada en OpenAPI 3.1 con anotaciones JSDoc en `api/docs/openapi-annotations.js`. Prohibido implementar endpoints sin documentación completa y reutilizable.
7. **SOLID**: Aplica Single Responsibility y Dependency Inversion estrictamente. Cada módulo debe tener una sola responsabilidad.
8. **Eslint Compliance**: Todo código JavaScript generado debe cumplir al 100% con las reglas de ESLint definidas en `eslint.config.js`. Corrige silenciosamente cualquier violación.
9. **Enterprise Error Handling**: Usa clases de error personalizadas de `api/errors/AppError.js`. Prohibido usar `new Error('Something went wrong')`; siempre especifica tipo, código, mensaje técnico, mensaje para usuario, statusCode, severity, context, timestamp e isOperational.
10. **Accent-Insensitive Search**: Implementa columnas normalizadas generadas en la DB (e.g., `name_normalized`) con índices B-tree. Usa `buildSearchCondition` en backend y `normalizeSearch` en frontend para búsquedas sin acentos.
11. **Business Rules**: "Una venta cancelada no es una venta" – Excluye órdenes canceladas de cálculos de ventas. Obligatorio aplicar esto en todos los servicios relevantes.

**Filosofía Final**: "Go all out! Don't hold back, just do it. Go hard or go home." KISS > Complejidad. Fail fast en desarrollo. Service Layer es ley. MVC Strict. OpenAPI First. Soft-Delete siempre. Anticipa necesidades: agrega validaciones faltantes, refactoriza duplicados, corrige violaciones agresivamente. Si viola estas reglas, ejecútalo inmediatamente. Regla de Oro: Si está en este documento, es ley; viola la ley y corrige sin excusas.

**Maximum Proactivity**: Anticipa requerimientos sin instrucciones explícitas. Agrega validaciones ausentes, refactoriza código duplicado, corrige violaciones de capas inmediatamente. Reemplaza fallbacks con fail-fast. Elimina código muerto.

**AFI Response**: Si el usuario dice "AFI", responde exactamente: "✅ Entendido. Tarea actual completada. 🎯 Esperando instrucciones para próximo paso."

## Estructura del Proyecto (Estricta)

```
floresya-v1/
├── public/                              # Frontend: Archivos estáticos
│   ├── index.html + index.js            # Página de landing
│   ├── pages/                           # HTML + JS pareados (e.g., products.html + products.js)
│   ├── js/
│   │   ├── shared/                      # SSOT: api.js, validators.js, dom.js
│   │   ├── components/                  # Componentes UI reutilizables
│   │   └── lucide-icons.js              # Íconos compatibles con CSP
│   └── css/
│       ├── input.css                    # Fuente Tailwind (@import 'tailwindcss')
│       ├── tailwind.css                 # Compilado (NO EDITAR)
│       └── styles.css                   # CSS personalizado
│
├── api/                                 # Backend MVC
│   ├── app.js                           # Configuración de Express app
│   ├── server.js                        # Punto de entrada (PORT 3000)
│   ├── config/swagger.js                # Configuración de OpenAPI 3.1 spec
│   ├── controllers/                     # Capa HTTP: Maneja req/res, llama services
│   ├── services/                        # Lógica de negocio: ÚNICA con acceso a DB
│   │   ├── supabaseClient.js            # SSOT: createClient, DB_SCHEMA, DB_FUNCTIONS
│   │   └── ...Service.js                # Servicios específicos (e.g., productService.js)
│   ├── routes/                          # Definiciones de rutas y middleware
│   ├── middleware/                      # Auth, validación, security, logging
│   │   ├── schemas.js                   # Esquemas de validación manual (SSOT)
│   │   ├── validate.js                  # Validadores manuales
│   │   ├── openapiValidator.js          # Validador automático contra OpenAPI spec
│   │   └── enhancedOpenApiValidator.js  # Monitoreo y detección de divergencias
│   ├── utils/normalize.js               # Normalización de texto (accent-insensitive)
│   ├── errors/AppError.js               # Clases de error personalizadas
│   ├── docs/                            # Documentación OpenAPI
│   │   ├── openapi-annotations.js       # Anotaciones JSDoc (fuente de verdad)
│   │   ├── openapi-spec.json            # Spec generada (JSON)
│   │   ├── openapi-spec.yaml            # Spec generada (YAML)
│   │   ├── generation-summary.json      # Reporte de generación
│   │   └── ci-contract-report.json      # Reporte CI/CD
│   └── tests/                           # Tests de integración y unidad
│
├── scripts/                             # Automatización OpenAPI
│   ├── generate-openapi-spec.js         # Generador automático desde JSDoc
│   ├── watch-openapi.js                 # Watcher para regeneración en tiempo real
│   └── validate-contract-ci.js          # Validación para CI/CD
│
├── .env.local                           # Variables de entorno
├── vercel.json                          # Configuración de despliegue
├── eslint.config.js                     # Configuración ESLint 9 flat
├── package.json                         # Scripts: dev, build:css, format, test, generate:openapi, etc.
└── tests/                               # Tests globales (Vitest + Happy DOM)
```

## Flujo de Datos MVC (Estrictamente Obligatorio)

```
Frontend (fetch) → HTTP Request
Router (routes/) → Middleware (validate, auth)
Controller (controllers/) → Extrae params, llama service
Service (services/) → Lógica de negocio, query Supabase
Database (PostgreSQL) → Retorna data
Service → Controller → JSON Response
```

Prohibido saltar capas o acceder a DB fuera de services.

## Arquitectura MVC Detallada

### Controllers (Capa HTTP)

- Manejan req/res HTTP.
- Extraen y validan params/query/body.
- Llaman métodos de services.
- Retornan JSON estandarizado: `{ success: true/false, data/error, message }`.
- Usan `asyncHandler` para manejo de errores.
- Deciden `includeInactive` basado en rol de usuario (e.g., admin only).
- Prohibido: Acceso a DB, lógica de negocio.

Ejemplo Obligatorio:

```javascript
import * as productService from '../services/productService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAllProducts = asyncHandler(async (req, res) => {
  const { limit, offset, featured, search } = req.query
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'
  const filters = { limit, offset, featured, search }
  const products = await productService.getAllProducts(filters, includeInactive)
  res
    .status(200)
    .json({ success: true, data: products, message: 'Products retrieved successfully' })
})
```

### Services (Capa de Lógica de Negocio)

- Contienen toda la lógica de negocio.
- Única capa con acceso a Supabase.
- Implementan `includeInactive` en todas las consultas con soft-delete.
- Fail-fast: Lanza errores específicos usando clases personalizadas.
- Siempre usan try-catch con log y re-throw.
- Incluyen metadata en errores.

Ejemplo Obligatorio:

```javascript
import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { BadRequestError, NotFoundError, DatabaseError } from '../errors/AppError.js'

const TABLE = DB_SCHEMA.products.table

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
    console.error(`getProductById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { productId: id })
  }
}
```

### Routes

- Definen endpoints y métodos HTTP.
- Aplican middleware: authenticate, authorize, validate.
- Usan helpers como validateId(), validatePagination().

Ejemplo Obligatorio:

```javascript
import express from 'express'
import * as productController from '../controllers/productController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)
router.post('/', authenticate, authorize(['admin']), productController.createProduct)
export default router
```

### Supabase Client (SSOT Obligatorio)

- En `api/services/supabaseClient.js`.
- Crea el cliente con validación de env vars.
- Define DB_SCHEMA (tablas, columnas, enums) y DB_FUNCTIONS (funciones almacenadas).

Ejemplo Obligatorio:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_KEY')
}
export const supabase = createClient(supabaseUrl, supabaseKey)

// DB_SCHEMA y DB_FUNCTIONS definidos aquí como constantes.
```

### Manual Validation (No Zod)

- Esquemas en `api/middleware/schemas.js` (e.g., { type: 'string', required: true, minLength: 2 }).
- Validación fail-fast: Lanza errores si falla.
- Aplica en middleware: validate(schema).

Prohibido: Usar bibliotecas como Zod; solo validación manual simple.

## Frontend Rules (ES6 Modules, Estrictas)

1. **Prohibido Inline JS/CSS**: No `<script>...</script>`, no `style="..."`, no `onclick="..."`. Usa `<script type="module" src="...">` y `<link rel="stylesheet" href="...">`.
2. **Estructura**: Cada HTML tiene JS pareado. Shared en `js/shared/` (api.js para fetch, validators.js, dom.js). Componentes en `js/components/`.
3. **CSP Strict**: `script-src: 'self'` only. Prohibido `'unsafe-inline'`, `'unsafe-eval'`, CDNs sin check.
4. **Tailwind v4**: Fuente en input.css, compilado en tailwind.css (NO EDITAR). Build: `npm run build:css`. Prohibido `@apply`. CSS custom en styles.css.
5. **Fail-Fast**: En JS frontend, try-catch con log y throw.
6. **DOM-Ready Pattern**: OBLIGATORIO usar `onDOMReady()` de `/js/shared/dom-ready.js` para toda inicialización que acceda al DOM. Prohibido `document.addEventListener('DOMContentLoaded')` directo. Prohibido atributo `async` en `<script type="module">`. Todo código debe ejecutarse solo después de que el DOM esté completamente cargado. Referencia: `/docs/FRONTEND-DOM-READY-PATTERN.md`.

Ejemplo Obligatorio:

```javascript
import { onDOMReady } from '/js/shared/dom-ready.js'
import { api } from '../js/shared/api-client.js'
import { createIcons } from '../js/lucide-icons.js'

async function init() {
  try {
    console.log('🚀 Starting initialization...')

    // Initialize in logical order
    createIcons()
    const products = await api.getAllProducts()
    renderProducts(products)

    // Mark page as loaded
    document.documentElement.classList.add('loaded')
    console.log('✅ Page fully initialized')
  } catch (error) {
    console.error('❌ Initialization failed:', error)
    throw error // Fail-fast
  }
}

// Execute on DOM ready using the safe utility
onDOMReady(init)
```

## Contract Enforcement System (Obligatorio)

- **100% Sincronización**: Valida todas las requests/responses contra OpenAPI spec usando `express-openapi-validator` en middleware.
- **Monitoreo Real-Time**: Detecta divergencias, viola contratos y rechaza con 400 Bad Request.
- **Spec Location**: `api/docs/openapi-spec.yaml` define endpoints, params, responses, tipos, formatos, constraints (minLength, pattern, etc.).
- **Error Response**: `{ success: false, error: "Request validation failed against API contract", message: "...", details: { path, method } }`.
- **Testing**: En `tests/integration/contractEnforcement.test.js`. Verifica validaciones y rechazos. Run: `npm run verify:spec`.
- **Monitoring**: Logs todas las violaciones. Genera reports con `npm run verify:contract`.

- curly: ["error", "all"] - Siempre usar llaves
- prefer-const - Usar const cuando no hay reasignación
- no-unused-vars - No declarar variables sin usar
- require-await - No usar async sin await

Prohibido: Ignorar violaciones; siempre rechaza y loguea.

## Automatización OpenAPI (Obligatoria)

- **Generador**: `scripts/generate-openapi-spec.js` crea spec desde JSDoc. Salidas: .json, .yaml, generation-summary.json.
- **Watcher**: `scripts/watch-openapi.js` vigila cambios en api/\*_/_.js y regenera automáticamente.
- **Validación CI/CD**: `scripts/validate-contract-ci.js` para pipelines; salida JSON en ci-contract-report.json.
- **Uso**: `npm run generate:openapi`, `npm run watch:openapi`, `npm run validate:contract:ci`.
- **Patrones de Watch**: Incluye controllers, routes, services, middleware, docs.

Obligatorio: Mantener documentación siempre actualizada; regenera en cada cambio.

## Mejores Prácticas OpenAPI (Obligatorias)

- **Estructura**: Usa tags plurales (Products), summaries con verbo infinitivo, descriptions detalladas, $ref para reutilizables.
- **Componentes**: Parámetros comunes (IdParam, LimitParam), respuestas estándar (SuccessResponse, ErrorResponse).
- **Esquemas**: Con examples, allOf para composición, enums para valores fijos.
- **Convenciones**: Respuestas completas con content/schema, validación de tipos/formatos/constraints.
- **Prohibido**: Referencias rotas, params incompletos, respuestas breves.
- **Validación**: Usa scripts para contar tags, verificar completitud.

Obligatorio: 100% cobertura de endpoints; valida con `npm run validate:contract`.

## Prohibiciones Globales

- TypeScript, tRPC, Zod, build tools complejos.
- Import supabaseClient fuera de services.
- Manejo silencioso de errores.
- Duplicación de lógica (usa SSOT).
- Inline JS/CSS en frontend.
- DB access desde controllers.
- Fallbacks en operaciones críticas.
- Endpoints sin OpenAPI docs.

## Deployment y Testing

- **Local**: `npm run dev` (localhost:3000).
- **Vercel**: vercel.json para serverless + static. Env: SUPABASE_URL, SUPABASE_KEY, NODE_ENV=production.
- **Testing**: Vitest. `npm test`, `npm run test:coverage`. Mock services para isolation.
- **Formatting**: Prettier en pre-commit con Husky/lint-staged. `npm run format`.

Obligatorio: Tests cubren validaciones, errores, contract enforcement.
