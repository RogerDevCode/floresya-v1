# Guía Técnica de Desarrollo - Proyecto FloresYa

## Introducción y Objetivos

Esta guía técnica establece los estándares de desarrollo para el proyecto FloresYa basado en las mejores prácticas implementadas durante la refactorización y correcciones realizadas. El objetivo es mantener la consistencia, calidad y mantenibilidad del código a lo largo del tiempo.

### Principios Fundamentales Aplicados

- **KISS (Keep It Simple, Stupid)**: Soluciones simples y directas
- **DRY (Don't Repeat Yourself)**: Eliminación de duplicación mediante funciones helper reutilizables
- **SSOT (Single Source of Truth)**: Centralización de constantes y configuraciones

## Patrón Estándar Establecido

### Estructura de Controladores Estándar

Todos los controladores siguen un patrón consistente que garantiza uniformidad en el manejo de operaciones HTTP:

```javascript
/**
 * Controller Name
 * Handles HTTP logic for entity operations
 * Delegates business logic to service layer
 */

import * as serviceName from '../services/serviceName.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * Helper Functions - Common utilities following KISS, DRY, and SSOT principles
 */

/**
 * Creates standardized API response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

/**
 * Gets appropriate HTTP status code for operation
 * @param {string} operation - Operation type (create, update, delete, etc.)
 * @returns {number} HTTP status code
 */
const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200,
    reactivate: 200,
    display: 200
  }
  return statusCodes[operation] || 200
}

/**
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'Entity') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deactivated successfully`,
    reactivate: `${entity} reactivated successfully`,
    display: 'Display order updated successfully',
    retrieve: `${entity} retrieved successfully`,
    methods: 'Entities retrieved successfully'
  }
  return messages[operation] || `${entity} operation completed successfully`
}

// HTTP endpoint handlers...
```

### Funciones Helper Obligatorias

Cada controlador debe implementar estas tres funciones helper:

1. **`createResponse(data, message)`**: Estandariza el formato de respuesta
2. **`getStatusCode(operation)`**: Define códigos HTTP apropiados por operación
3. **`getSuccessMessage(operation, entity)`**: Mensajes de éxito consistentes

### Patrón de Respuestas Consistente

Todas las respuestas API siguen el formato estándar:

```javascript
// Respuesta exitosa
{
  success: true,
  data: { /* datos de respuesta */ },
  message: "Entity operation completed successfully"
}

// Respuesta de error (manejo automático por errorHandler)
{
  success: false,
  error: "ErrorType",
  code: "ERROR_CODE",
  message: "User-friendly error message",
  details: { /* contexto adicional en desarrollo */ },
  timestamp: "2025-10-18T11:21:26.635Z"
}
```

## Sistema de Errores Empresarial

### Clase Base AppError

Todos los errores personalizados extienden de `AppError`:

```javascript
import { AppError } from '../errors/AppError.js'

throw new AppError('Error message', {
  statusCode: 400,
  code: 'CUSTOM_ERROR',
  context: {
    /* datos adicionales */
  },
  userMessage: 'Mensaje amigable para el usuario',
  severity: 'low' // low | medium | high | critical
})
```

### Errores Específicos Implementados

- **Validación**: `ValidationError` - Campos inválidos
- **No encontrado**: `NotFoundError` - Recursos inexistentes
- **Conflictos**: `ConflictError` - Violaciones de constraints
- **Base de datos**: `DatabaseError`, `DatabaseConstraintError`
- **Lógica de negocio**: `InsufficientStockError`, `PaymentFailedError`
- **Servicios externos**: `ExternalServiceError`

### Manejo de Errores en Servicios

Los servicios implementan manejo de errores consistente:

```javascript
/**
 * Enhanced error handler with consistent logging (DRY principle)
 */
async function withErrorHandling(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName} failed:`, { error: error.message, context })
    throw error
  }
}

/**
 * Handles database operation results consistently (DRY principle)
 */
function handleDatabaseResult(result, operation, table, error, context = {}) {
  if (error) {
    if (error.code === '23505') {
      throw new DatabaseConstraintError('unique_email', table, {
        ...context,
        message: `User with email ${context.email} already exists`
      })
    }
    throw new DatabaseError(operation, table, error, context)
  }
  if (!result) {
    throw new DatabaseError(operation, table, new InternalServerError('No data returned'), context)
  }
}
```

## Lecciones Aprendidas

### Qué Hacer (Mejores Prácticas)

✅ **Aplicar principios KISS, DRY, SSOT consistentemente**

- Crear funciones helper reutilizables
- Centralizar constantes y mensajes
- Mantener lógica simple y directa

✅ **Implementar manejo de errores empresarial**

- Usar AppError para todos los errores personalizados
- Proporcionar mensajes amigables al usuario
- Incluir contexto suficiente para debugging

✅ **Separar responsabilidades claramente**

- Controllers: Lógica HTTP y respuestas
- Services: Lógica de negocio y acceso a datos
- Middleware: Validaciones transversales

✅ **Validar datos estrictamente**

- Validar en servicios con fail-fast
- Proporcionar mensajes de error específicos
- Incluir contexto de validación

✅ **Implementar soft-delete estándar**

- Usar campo `is_active` para borrado lógico
- Filtrar automáticamente usuarios no-admin
- Proporcionar endpoints de reactivación

### Qué NO Hacer (Errores Comunes Identificados)

❌ **No duplicar lógica entre controladores**

- Cada controlador debe seguir el patrón estándar
- No crear respuestas personalizadas
- No manejar errores manualmente

❌ **No exponer información sensible**

- Nunca mostrar stack traces en producción
- No incluir datos internos en respuestas de error
- Usar userMessage para mensajes seguros

❌ **No ignorar validaciones**

- Siempre validar datos de entrada
- No asumir tipos de datos
- No permitir operaciones sin validación

❌ **No mezclar responsabilidades**

- Controllers no deben acceder directamente a base de datos
- Services no deben manejar respuestas HTTP
- Middleware no debe contener lógica de negocio

## Guía de Desarrollo Práctica

### Cómo Crear Nuevos Controladores

1. **Copiar patrón estándar**:

```bash
# Crear nuevo controlador siguiendo el patrón
cp api/controllers/orderController.js api/controllers/nuevoController.js
```

2. **Actualizar imports y nombres**:

```javascript
// Cambiar imports según la entidad
import * as nuevoService from '../services/nuevoService.js'

// Actualizar comentarios y nombres de funciones
const createResponse = (data, message) => ({ ... })
const getStatusCode = operation => { ... }
const getSuccessMessage = (operation, entity = 'Nuevo') => { ... }
```

3. **Implementar endpoints específicos**:

```javascript
// GET /api/nuevos
export const getAllNuevos = asyncHandler(async (req, res) => {
  const filters = {
    /* filtros específicos */
  }
  const includeInactive = req.user?.role === 'admin'
  const nuevos = await nuevoService.getAllNuevos(filters, includeInactive)

  const response = createResponse(nuevos, getSuccessMessage('retrieve', 'Nuevos'))
  res.json(response)
})

// POST /api/nuevos
export const createNuevo = asyncHandler(async (req, res) => {
  const nuevo = await nuevoService.createNuevo(req.body)

  const response = createResponse(nuevo, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
})

// PUT /api/nuevos/:id
export const updateNuevo = asyncHandler(async (req, res) => {
  const nuevo = await nuevoService.updateNuevo(req.params.id, req.body)

  const response = createResponse(nuevo, getSuccessMessage('update'))
  res.json(response)
})

// DELETE /api/nuevos/:id
export const deleteNuevo = asyncHandler(async (req, res) => {
  const nuevo = await nuevoService.deleteNuevo(req.params.id)

  const response = createResponse(nuevo, getSuccessMessage('delete'))
  res.json(response)
})
```

### Cómo Crear Nuevos Servicios

1. **Seguir patrón de funciones helper**:

```javascript
// Validaciones DRY
function validateEntityId(id, operation = 'operation') {
  if (!id || typeof id !== 'number') {
    throw new BadRequestError(`Invalid entity ID: must be a number`, { entityId: id, operation })
  }
}

// Manejo de errores consistente
async function withErrorHandling(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName} failed:`, { error: error.message, context })
    throw error
  }
}

// Validación estricta de datos
function validateEntityData(data, isUpdate = false) {
  // Validaciones específicas con mensajes detallados
  if (!isUpdate && !data.nombre) {
    throw new ValidationError('Nombre is required', {
      field: 'nombre',
      value: data.nombre,
      rule: 'required field'
    })
  }
}
```

2. **Implementar operaciones CRUD estándar**:

```javascript
export function getAllEntities(filters = {}, includeInactive = false) {
  return withErrorHandling(
    async () => {
      // Lógica de consulta con filtros
      // Aplicar filtros de actividad
      // Retornar datos validados
    },
    'getAllEntities',
    { filters, includeInactive }
  )
}

export function getEntityById(id, includeInactive = false) {
  return withErrorHandling(
    async () => {
      validateEntityId(id, 'getEntityById')
      // Lógica de consulta por ID
    },
    `getEntityById(${id})`,
    { entityId: id }
  )
}

export function createEntity(entityData) {
  return withErrorHandling(
    async () => {
      validateEntityData(entityData, false)
      // Lógica de creación
    },
    'createEntity',
    {
      /* contexto */
    }
  )
}

export function updateEntity(id, updates) {
  return withErrorHandling(
    async () => {
      validateEntityId(id, 'updateEntity')
      validateEntityData(updates, true)
      // Lógica de actualización
    },
    `updateEntity(${id})`,
    { entityId: id }
  )
}

export function deleteEntity(id) {
  return withErrorHandling(
    async () => {
      validateEntityId(id, 'deleteEntity')
      // Lógica de soft-delete
    },
    `deleteEntity(${id})`,
    { entityId: id }
  )
}
```

### Cómo Mantener Consistencia

1. **Usar siempre las funciones helper estándar**
2. **Seguir el patrón de nombres establecido**
3. **Mantener comentarios JSDoc consistentes**
4. **Respetar la estructura de archivos establecida**

### Cómo Evitar Errores Comunes

1. **No crear respuestas personalizadas** - Usar siempre `createResponse()`
2. **No manejar errores manualmente** - Dejar que `asyncHandler` y `errorHandler` se encarguen
3. **No acceder directamente a `req.body`** - Siempre validar primero en servicios
4. **No duplicar lógica de filtros** - Usar funciones helper como `applyActivityFilter()`

## Estándares de Calidad

### Reglas ESLint Obligatorias

El proyecto utiliza configuración estricta de ESLint:

```javascript
// Reglas aplicadas automáticamente
{
  // Calidad de código
  'prefer-const': 'error',
  'no-var': 'error',
  eqeqeq: ['error', 'always'],
  curly: ['error', 'all'],

  // Variables no utilizadas
  'no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_'
  }],

  // Imports duplicados
  'no-duplicate-imports': 'error',

  // Código unreachable
  'no-unreachable': 'error'
}
```

### Validaciones Requeridas

1. **Validar IDs numéricos**:

```javascript
function validateEntityId(id, operation = 'operation') {
  if (!id || typeof id !== 'number') {
    throw new BadRequestError(`Invalid entity ID: must be a number`, { entityId: id, operation })
  }
}
```

2. **Validar datos de entrada**:

```javascript
function validateEntityData(data, isUpdate = false) {
  // Validaciones específicas con mensajes detallados
  if (!isUpdate && !data.email?.includes('@')) {
    throw new ValidationError('Invalid email format', {
      field: 'email',
      value: data.email,
      rule: 'valid email format required'
    })
  }
}
```

3. **Validar enums y valores permitidos**:

```javascript
const VALID_ROLES = ['user', 'admin', 'moderator']
if (data.role && !VALID_ROLES.includes(data.role)) {
  throw new ValidationError(`Invalid role: must be one of ${VALID_ROLES.join(', ')}`, {
    field: 'role',
    value: data.role,
    validValues: VALID_ROLES
  })
}
```

### Manejo de Errores Estándar

1. **Siempre usar AppError para errores personalizados**
2. **Proporcionar contexto suficiente para debugging**
3. **Incluir mensajes amigables para usuarios**
4. **Establecer severidad apropiada**

## Proceso de Corrección

### Cómo Identificar Problemas

1. **Revisar logs de errores**:

```javascript
// Buscar patrones de errores
console.error('Operation failed:', { error: error.message, context })
```

2. **Verificar cumplimiento de estándares**:

```bash
# Ejecutar ESLint para identificar problemas de calidad
npm run lint

# Ejecutar pruebas para encontrar errores funcionales
npm run test
```

3. **Analizar métricas de error**:

```javascript
// Revisar tasas de error en logs
// Buscar operaciones que fallen consistentemente
```

### Cómo Aplicar Correcciones

1. **Corregir estructura de controladores**:

```javascript
// ❌ Mal - respuesta inconsistente
res.json({ data: result })

// ✅ Bien - usar patrón estándar
const response = createResponse(result, getSuccessMessage('create'))
res.status(getStatusCode('create')).json(response)
```

2. **Corregir manejo de errores**:

```javascript
// ❌ Mal - manejo manual de errores
try {
  const result = await operation()
  res.json({ success: true, data: result })
} catch (error) {
  res.status(500).json({ success: false, message: error.message })
}

// ✅ Bien - usar asyncHandler y AppError
export const endpoint = asyncHandler(async (req, res) => {
  const result = await service.operation()
  const response = createResponse(result, getSuccessMessage('retrieve'))
  res.json(response)
})
```

3. **Corregir validaciones**:

```javascript
// ❌ Mal - validación débil
if (!data.email) {
  /* error débil */
}

// ✅ Bien - validación estricta con contexto
if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
  throw new ValidationError('Invalid email: must be valid email string', {
    field: 'email',
    value: data.email,
    rule: 'valid email format required'
  })
}
```

### Cómo Verificar Soluciones

1. **Ejecutar pruebas automatizadas**:

```bash
npm run test
npm run test:e2e
```

2. **Verificar cumplimiento de ESLint**:

```bash
npm run lint
```

3. **Probar endpoints manualmente**:

```bash
# Usar herramientas como Postman o curl para verificar respuestas
curl -X GET http://localhost:3000/api/endpoint
```

4. **Revisar logs de aplicación**:

```bash
# Verificar que no hay errores en consola
# Confirmar que respuestas siguen formato estándar
```

## Ejemplos Prácticos del Código

### Ejemplo Completo: Controlador de Producto

```javascript
/**
 * Product Controller
 * Handles HTTP logic for product operations
 * Delegates business logic to productService
 */

import * as productService from '../services/productService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * Helper Functions
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200,
    reactivate: 200
  }
  return statusCodes[operation] || 200
}

const getSuccessMessage = (operation, entity = 'Product') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deactivated successfully`,
    reactivate: `${entity} reactivated successfully`,
    retrieve: `${entity} retrieved successfully`,
    products: 'Products retrieved successfully'
  }
  return messages[operation] || `${entity} operation completed successfully`
}

/**
 * GET /api/products
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    category: req.query.category,
    price_min: req.query.price_min,
    price_max: req.query.price_max,
    limit: req.query.limit,
    offset: req.query.offset
  }

  const includeInactive = req.user?.role === 'admin'
  const products = await productService.getAllProducts(filters, includeInactive)

  const response = createResponse(products, getSuccessMessage('products'))
  res.json(response)
})

/**
 * GET /api/products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const product = await productService.getProductById(req.params.id, includeInactive)

  const response = createResponse(product, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * POST /api/products
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body)

  const response = createResponse(product, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
})

/**
 * PUT /api/products/:id
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body)

  const response = createResponse(product, getSuccessMessage('update'))
  res.json(response)
})

/**
 * DELETE /api/products/:id
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id)

  const response = createResponse(product, getSuccessMessage('delete'))
  res.json(response)
})
```

### Ejemplo Completo: Servicio con Validaciones

```javascript
/**
 * Product Service
 * Business logic for product operations
 */

import { supabase, DB_SCHEMA } from './supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError
} from '../errors/AppError.js'

const TABLE = DB_SCHEMA.products.table

/**
 * Validate product ID (DRY principle)
 */
function validateProductId(id, operation = 'operation') {
  if (!id || typeof id !== 'number') {
    throw new BadRequestError(`Invalid product ID: must be a number`, { productId: id, operation })
  }
}

/**
 * Validate product data (ENTERPRISE FAIL-FAST)
 */
function validateProductData(data, isUpdate = false) {
  if (!isUpdate && !data.name) {
    throw new ValidationError('Product name is required', {
      field: 'name',
      value: data.name,
      rule: 'required field'
    })
  }

  if (data.price_usd !== undefined && (typeof data.price_usd !== 'number' || data.price_usd < 0)) {
    throw new ValidationError('Invalid price: must be a positive number', {
      field: 'price_usd',
      value: data.price_usd,
      rule: 'positive number required'
    })
  }

  if (data.stock !== undefined && (typeof data.stock !== 'number' || data.stock < 0)) {
    throw new ValidationError('Invalid stock: must be a non-negative number', {
      field: 'stock',
      value: data.stock,
      rule: 'non-negative number required'
    })
  }
}

/**
 * Enhanced error handler (DRY principle)
 */
async function withErrorHandling(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName} failed:`, { error: error.message, context })
    throw error
  }
}

/**
 * Get all products with filters
 */
export function getAllProducts(filters = {}, includeInactive = false) {
  return withErrorHandling(
    async () => {
      let query = supabase.from(TABLE).select('*')

      // Apply search filter if provided
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply activity filter
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      // Apply other filters...
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new DatabaseError('SELECT', TABLE, error, { filters })
      }

      if (!data) {
        throw new NotFoundError('Products', null)
      }

      return data
    },
    'getAllProducts',
    { filters, includeInactive }
  )
}

/**
 * Get product by ID
 */
export function getProductById(id, includeInactive = false) {
  return withErrorHandling(
    async () => {
      validateProductId(id, 'getProductById')

      let query = supabase.from(TABLE).select('*').eq('id', id)

      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Product', id, { includeInactive })
        }
        throw new DatabaseError('SELECT', TABLE, error, { productId: id })
      }

      if (!data) {
        throw new NotFoundError('Product', id, { includeInactive })
      }

      return data
    },
    `getProductById(${id})`,
    { productId: id, includeInactive }
  )
}

/**
 * Create new product
 */
export function createProduct(productData) {
  return withErrorHandling(
    async () => {
      validateProductData(productData, false)

      const { data, error } = await supabase
        .from(TABLE)
        .insert({ ...productData, is_active: true })
        .select()
        .single()

      if (error) {
        throw new DatabaseError('INSERT', TABLE, error, { productData })
      }

      return data
    },
    'createProduct',
    { productName: productData.name }
  )
}

/**
 * Update product
 */
export function updateProduct(id, updates) {
  return withErrorHandling(
    async () => {
      validateProductId(id, 'updateProduct')
      validateProductData(updates, true)

      const { data, error } = await supabase
        .from(TABLE)
        .update(updates)
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Product', id, { active: true })
        }
        throw new DatabaseError('UPDATE', TABLE, error, { productId: id })
      }

      if (!data) {
        throw new NotFoundError('Product', id, { active: true })
      }

      return data
    },
    `updateProduct(${id})`,
    { productId: id }
  )
}

/**
 * Soft-delete product
 */
export function deleteProduct(id) {
  return withErrorHandling(
    async () => {
      validateProductId(id, 'deleteProduct')

      const { data, error } = await supabase
        .from(TABLE)
        .update({ is_active: false })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundError('Product', id, { active: true })
        }
        throw new DatabaseError('UPDATE', TABLE, error, { productId: id })
      }

      if (!data) {
        throw new NotFoundError('Product', id, { active: true })
      }

      return data
    },
    `deleteProduct(${id})`,
    { productId: id }
  )
}
```

## Conclusión

Esta guía establece los estándares definitivos para el desarrollo en el proyecto FloresYa. Al seguir estos patrones consistentemente, garantizamos:

- **Mantenibilidad**: Código fácil de entender y modificar
- **Consistencia**: Comportamiento uniforme en todos los endpoints
- **Calidad**: Estándares estrictos de calidad de código
- **Robustez**: Manejo de errores empresarial-grade
- **Escalabilidad**: Arquitectura preparada para crecimiento

**Recuerda**: Siempre seguir los principios KISS, DRY y SSOT. Cuando tengas dudas, revisa los controladores y servicios existentes como referencia del patrón establecido.
