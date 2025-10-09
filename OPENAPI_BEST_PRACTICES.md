# 📚 Mejores Prácticas para Anotaciones OpenAPI - FloresYa

## 🎯 Principios Fundamentales

### 1. **Consistencia es Clave**

- **Nombres consistentes:** Usa los mismos nombres para tags, parámetros y esquemas
- **Estilo uniforme:** Sigue el mismo patrón en todas las anotaciones
- **Terminología estándar:** Usa términos REST estándar (GET, POST, PUT, DELETE)

### 2. **Documentación como Código**

- **Anotaciones obligatorias:** Todo endpoint público debe tener documentación completa
- **Actualización inmediata:** Documenta cambios al mismo tiempo que implementas
- **Validación automática:** Usa herramientas para verificar consistencia

## 🏗️ Estructura de Anotaciones

### Endpoint Completo (Ejemplo Modelo)

```javascript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     description: |
 *       Retrieves a specific product by its ID.
 *       Returns product details including images and availability.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: imageSize
 *         in: query
 *         schema:
 *           type: string
 *           enum: [thumb, small, medium, large]
 *         description: Include product with specific image size
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

## 📋 Componentes Reutilizables

### Parámetros Comunes

```javascript
/**
 * @swagger
 * IdParam:
 *   name: id
 *   in: path
 *   required: true
 *   schema: { type: integer, minimum: 1 }
 *   description: Resource ID

 * LimitParam:
 *   name: limit
 *   in: query
 *   schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *   description: Number of items to return

 * OffsetParam:
 *   name: offset
 *   in: query
 *   schema: { type: integer, minimum: 0, default: 0 }
 *   description: Number of items to skip
 */
```

### Respuestas Estándar

```javascript
/**
 * @swagger
 * SuccessResponse:
 *   type: object
 *   properties:
 *     success: { type: boolean, example: true }
 *     data: { type: object, description: 'Response data' }
 *     message: { type: string, example: 'Operation completed successfully' }

 * ErrorResponse:
 *   type: object
 *   properties:
 *     success: { type: boolean, example: false }
 *     error: { type: string, example: 'Error name' }
 *     message: { type: string, example: 'Error description' }
 *     details: { type: array, items: { type: string } }
 */
```

## 🏷️ Organización por Tags

### Tags Definidos en FloresYa

| Tag         | Descripción               | Endpoints          |
| ----------- | ------------------------- | ------------------ |
| `Products`  | Gestión de productos      | `/api/products/*`  |
| `Orders`    | Gestión de pedidos        | `/api/orders/*`    |
| `Users`     | Gestión de usuarios       | `/api/users/*`     |
| `Payments`  | Gestión de pagos          | `/api/payments/*`  |
| `Occasions` | Gestión de ocasiones      | `/api/occasions/*` |
| `Settings`  | Configuración del sistema | `/api/settings/*`  |

### Uso de Tags

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]  // ✅ Correcto
 *     summary: Get all products
 *
 * /api/orders:
 *   post:
 *     tags: [Orders]    // ✅ Correcto
 *     summary: Create order
 */
```

## 📝 Convenciones de Escritura

### 1. **Summaries y Descriptions**

#### ✅ Correcto

```javascript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: |
 *       Retrieves detailed information about a specific product.
 *       Includes product images, pricing, and availability status.
 */
```

#### ❌ Incorrecto

```javascript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: get product by id  // ❌ Minúsculas
 *     description: Gets product  // ❌ Muy breve
 */
```

### 2. **Parámetros**

#### Parámetros de Path

```javascript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Unique identifier for the product
 */
```

#### Parámetros de Query

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     parameters:
 *       - name: featured
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by featured products only
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in product name and description
 */
```

### 3. **Códigos de Respuesta**

#### Respuestas Completas

```javascript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *                 message: { type: string }
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
```

## 🎨 Patrones Avanzados

### 1. **Esquemas Anidados**

```javascript
/**
 * @swagger
 * OrderWithItems:
 *   allOf:
 *     - $ref: '#/components/schemas/Order'
 *     - type: object
 *       properties:
 *         order_items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 */
```

### 2. **Arrays y Enumeraciones**

```javascript
/**
 * @swagger
 * ProductFilters:
 *   type: object
 *   properties:
 *     featured:
 *       type: boolean
 *       description: Filter by featured products
 *     sortBy:
 *       type: string
 *       enum:
 *         - name_asc
 *         - name_desc
 *         - price_asc
 *         - price_desc
 *         - created_at
 *       description: Sort field and direction
 */
```

### 3. **Esquemas con Ejemplos**

```javascript
/**
 * @swagger
 * Product:
 *   type: object
 *   properties:
 *     id:
 *       type: integer
 *       example: 67
 *     name:
 *       type: string
 *       example: "Ramo Tropical Vibrante"
 *     price_usd:
 *       type: number
 *       format: decimal
 *       example: 45.99
 *     featured:
 *       type: boolean
 *       example: true
 */
```

## 🚨 Errores Comunes y Cómo Evitarlos

### 1. **Referencias Rotas**

#### ❌ Incorrecto

```javascript
// Usa esquema que no existe
data: {
  $ref: '#/components/schemas/Producto'
} // ❌ Error de tipeo
```

#### ✅ Correcto

```javascript
// Usa esquema correcto
data: {
  $ref: '#/components/schemas/Product'
} // ✅ Correcto
```

### 2. **Parámetros Incompletos**

#### ❌ Incorrecto

```javascript
parameters:
  - name: id  // ❌ Faltan in, required, schema
```

#### ✅ Correcto

```javascript
parameters:
  - name: id
    in: path
    required: true
    schema:
      type: integer
      minimum: 1
```

### 3. **Respuestas Incompletas**

#### ❌ Incorrecto

```javascript
responses:
  200:
    description: OK  // ❌ Muy breve, sin content
```

#### ✅ Correcto

```javascript
responses:
  200:
    description: Product retrieved successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/SuccessResponse'
```

## 🔧 Herramientas de Validación

### Validación Manual

```bash
# Generar y validar especificación
npm run generate:openapi
npm run verify:spec

# Validación completa
npm run validate:contract
```

### Validación Automática

```bash
# Para desarrollo
npm run watch:openapi

# Para CI/CD
npm run validate:contract:ci
```

## 📊 Métricas de Calidad

### Indicadores de Buena Documentación

| Métrica          | Objetivo             | Cómo Medir                  |
| ---------------- | -------------------- | --------------------------- |
| **Cobertura**    | 100% endpoints       | `generation-summary.json`   |
| **Completitud**  | Todas respuestas     | Revisión manual + tests     |
| **Consistencia** | Tags uniformes       | `grep -r "tags:" api/docs/` |
| **Claridad**     | Descripciones útiles | Revisión por pares          |

### Scripts de Análisis

```bash
# Contar endpoints por tag
grep -r "tags:" api/docs/openapi-annotations.js | sort | uniq -c

# Verificar respuestas estándar
grep -r "SuccessResponse" api/docs/openapi-annotations.js | wc -l

# Encontrar endpoints sin descripción
grep -A 5 -B 5 "summary:" api/docs/openapi-annotations.js | grep -v "description:"
```

## 🎓 Guía de Inicio Rápido

### Para Nuevo Endpoint

1. **Copia patrón base:**

```javascript
/**
 * @swagger
 * /api/nuevo-endpoint:
 *   get:
 *     tags: [NombreTag]
 *     summary: Breve descripción
 *     description: |
 *       Descripción detallada de lo que hace el endpoint.
 *       Explicar parámetros y casos de uso.
 *     parameters:
 *       - $ref: '#/components/parameters/ParametroComun'
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Respuesta' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

2. **Personaliza según necesidades:**
   - Agrega parámetros específicos
   - Define esquema de respuesta
   - Incluye ejemplos relevantes

3. **Valida inmediatamente:**

```bash
npm run generate:openapi
# Verificar que aparece en http://localhost:3000/api-docs/
```

### Para Modificar Endpoint Existente

1. **Localiza anotación actual**
2. **Actualiza descripción si cambió lógica**
3. **Agrega nuevos parámetros si aplica**
4. **Actualiza ejemplos si cambiaron**
5. **Regenera especificación**

## 🚀 Próximas Mejoras

### Automatización Avanzada

- [ ] **Validación de ejemplos contra datos reales**
- [ ] **Detección automática de endpoints sin documentar**

### Calidad de Documentación

- [ ] **Linter específico para anotaciones OpenAPI**
- [ ] **Generador de ejemplos automático**
- [ ] **Validación de referencias cruzadas**

### Integración con Frontend

- [ ] **Cliente API desde especificación OpenAPI**
- [ ] **Validación de contratos en tiempo de compilación**

---

**🎯 Siguiendo estas mejores prácticas, mantendrás una documentación OpenAPI de alta calidad que evoluciona automáticamente con tu código.**
