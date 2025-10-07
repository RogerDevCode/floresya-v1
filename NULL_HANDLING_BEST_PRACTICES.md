# Mejores Prácticas: Manejo de null/undefined/NaN en FloresYa

## 🎯 Áreas Más Problemáticas

### **1. Base de Datos (CRÍTICO)**

```javascript
// ❌ PROBLEMÁTICO
const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
if (data.price_usd === null) {
  // ← Puede causar errores en cálculos
  total = 0 // ← Valor por defecto silencioso
}

// ✅ RECOMENDADO
const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
if (error) throw new DatabaseError('SELECT', 'products', error, { productId: id })
if (!data) throw new NotFoundError('Product', id)

// Sanitizar datos inmediatamente después de obtenerlos
const sanitizedProduct = sanitizeProductData(data)
const safePrice = sanitizedProduct.price_usd || 0 // ← Explícito y controlado
```

### **2. APIs Externas (ALTO RIESGO)**

```javascript
// ❌ PROBLEMÁTICO
const response = await fetch('/api/external-service')
const data = await response.json()
const result = data.value * 2 // ← data.value podría ser null

// ✅ RECOMENDADO
const response = await fetch('/api/external-service')
if (!response.ok) throw new ExternalServiceError('ExternalAPI', 'GET', new Error('API Error'))

const data = await response.json()
const safeValue = sanitizeNumber(data.value, { defaultValue: 0 })
const result = safeValue * 2
```

### **3. Formularios y User Input (MEDIO)**

```javascript
// ❌ PROBLEMÁTICO
const quantity = parseInt(req.body.quantity) // ← NaN si no es número válido
if (quantity > 0) {
  /* lógica */
} // ← NaN > 0 es false, pero no es explícito

// ✅ RECOMENDADO
const rawQuantity = req.body.quantity
const quantity = sanitizeNumber(rawQuantity, {
  min: 1,
  max: 100,
  defaultValue: 1
})

if (quantity > 0) {
  /* lógica segura */
}
```

### **4. Cálculos Financieros (CRÍTICO)**

```javascript
// ❌ PROBLEMÁTICO
const total = price * quantity // ← Si price es null, total = 0 (silencioso)
const taxes = total * 0.16 // ← 0 * 0.16 = 0 (incorrecto pero silencioso)

// ✅ RECOMENDADO
const safePrice = sanitizeNumber(price, { min: 0, defaultValue: 0 })
const safeQuantity = sanitizeNumber(quantity, { min: 1, defaultValue: 1 })

if (safePrice <= 0) throw new ValidationError('Precio debe ser mayor a 0')
if (safeQuantity <= 0) throw new ValidationError('Cantidad debe ser mayor a 0')

const total = safePrice * safeQuantity
const taxes = total * 0.16
```

## 🛠️ Técnicas Recomendadas

### **1. Sanitización Inmediata (DEFENSIVA)**

```javascript
// Crear función de sanitización por tabla
export function sanitizeProductData(data) {
  return {
    name: sanitizeString(data.name, { defaultValue: 'Producto sin nombre' }),
    price_usd: sanitizeNumber(data.price_usd, { min: 0, defaultValue: 0 }),
    stock: sanitizeNumber(data.stock, { min: 0, defaultValue: 0 }),
    active: sanitizeBoolean(data.active, true), // Default activo
    featured: sanitizeBoolean(data.featured, false)
  }
}

// Usar inmediatamente después de consultas DB
const { data: product } = await supabase.from('products').select('*').eq('id', id).single()
const safeProduct = sanitizeProductData(product)
```

### **2. Validación Estricta (PREVENTIVA)**

```javascript
// Validar ANTES de usar datos
function validateProductData(data) {
  const errors = {}

  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Nombre es requerido y debe ser string'
  }

  if (data.price_usd === null || data.price_usd === undefined || isNaN(data.price_usd)) {
    errors.price_usd = 'Precio debe ser un número válido'
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Datos de producto inválidos', errors)
  }
}

// Usar validación estricta en entradas
export async function createProduct(productData) {
  validateProductData(productData) // ← Fallará rápido si hay problemas
  const sanitizedData = sanitizeProductData(productData) // ← Sanitizar después
  // ... resto de lógica
}
```

### **3. Default Values Explícitos (DOCUMENTADA)**

```javascript
// ❌ PROBLEMÁTICO
const stock = product.stock || 0 // ← Silencioso, ¿intencional?

// ✅ RECOMENDADO
const stock = sanitizeNumber(product.stock, {
  min: 0,
  defaultValue: 0, // ← Explícito: "sin stock" significa 0
  context: 'product_stock_default_zero'
})
```

### **4. Fail-Fast con Contexto (PROACTIVA)**

```javascript
// ❌ PROBLEMÁTICO
try {
  const result = riskyOperation()
} catch (error) {
  console.log(error) // ← Silencioso, no informa al usuario
  return null // ← Retorna null silenciosamente
}

// ✅ RECOMENDADO
try {
  const result = riskyOperation()
  if (result === null) {
    throw new ValidationError('Operación retornó resultado vacío', { operation: 'riskyOperation' })
  }
} catch (error) {
  console.error('Operación fallida:', error)
  if (error.name?.includes('Error')) {
    throw error // ← Re-throw errores conocidos
  }
  throw new InternalServerError('Error interno en operación', { originalError: error.message })
}
```

## 📋 Estrategia Recomendada para FloresYa

### **1. Prevención (80% del esfuerzo)**

```javascript
// Database constraints
ALTER TABLE products ADD CONSTRAINT check_price_positive CHECK (price_usd > 0);
ALTER TABLE products ADD CONSTRAINT check_stock_non_negative CHECK (stock >= 0);

// Application-level validation
const productSchema = {
  name: { type: 'string', required: true, minLength: 1 },
  price_usd: { type: 'number', required: true, min: 0.01 },
  stock: { type: 'number', required: true, integer: true, min: 0 }
}
```

### **2. Sanitización (15% del esfuerzo)**

```javascript
// Middleware de sanitización global
app.use((req, res, next) => {
  // Sanitizar query params
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string' && !isNaN(value)) {
        req.query[key] = Number(value)
      }
    }
  }
  next()
})
```

### **3. Manejo de Errores (5% del esfuerzo)**

```javascript
// Centralized error handling
export function handleNullSafety(value, type, defaultValue, context) {
  if (value === null || value === undefined) {
    logger.warn('Null value encountered', { type, context, defaultValue: defaultValue })
    return defaultValue
  }

  if (typeof value === 'number' && isNaN(value)) {
    logger.warn('NaN value encountered', { type, context, defaultValue: defaultValue })
    return defaultValue
  }

  return value
}
```

## 🎯 Patrón Recomendado: Defense in Depth

### **Nivel 1: Base de Datos**

```sql
-- Constraints estrictos
ALTER TABLE products ADD CONSTRAINT positive_price CHECK (price_usd > 0);
ALTER TABLE products ADD CONSTRAINT non_negative_stock CHECK (stock >= 0);
ALTER TABLE products ADD CONSTRAINT valid_name CHECK (length(name) > 0);
```

### **Nivel 2: Sanitización de Datos**

```javascript
// Inmediatamente después de consultas DB
const { data } = await supabase.from('products').select('*').eq('id', id).single()
const safeData = sanitizeProductData(data)
```

### **Nivel 3: Validación de Negocio**

```javascript
// Antes de operaciones críticas
if (safeData.price_usd <= 0) {
  throw new ValidationError('Precio debe ser mayor a 0', { price_usd: safeData.price_usd })
}
```

### **Nivel 4: Manejo de Errores**

```javascript
// Logging y monitoreo
catch (error) {
  logger.error('Error en operación de producto', {
    error: error.message,
    productId: id,
    context: 'create_order_calculation'
  })
  throw new InternalServerError('Error interno procesando producto')
}
```

## 🚨 Recomendaciones Específicas para FloresYa

### **1. Implementar Sanitización Global**

```javascript
// Crear middleware de sanitización
export function sanitizeMiddleware(req, res, next) {
  // Sanitizar request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body, FIELD_TYPES)
  }

  // Sanitizar query parameters
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        if (!isNaN(value)) {
          req.query[key] = Number(value)
        }
      }
    }
  }

  next()
}
```

### **2. Database-Level Defaults**

```sql
-- Usar DEFAULT values en columnas críticas
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0;
ALTER TABLE products ALTER COLUMN active SET DEFAULT true;
ALTER TABLE products ALTER COLUMN featured SET DEFAULT false;
```

### **3. Application-Level Validation**

```javascript
// Validación estricta en todos los servicios
export function validateRequired(value, fieldName, type = 'string') {
  if (value === null || value === undefined) {
    throw new ValidationError(`${fieldName} es requerido`, { fieldName, value })
  }

  if (type === 'number' && isNaN(value)) {
    throw new ValidationError(`${fieldName} debe ser un número válido`, { fieldName, value })
  }

  return value
}
```

### **4. Monitoring y Alertas**

```javascript
// Monitorear valores problemáticos
export function monitorDataQuality(data, context) {
  const issues = []

  if (data.price_usd === 0) issues.push('Precio cero detectado')
  if (data.stock === 0) issues.push('Stock agotado')
  if (!data.name) issues.push('Nombre vacío')

  if (issues.length > 0) {
    logger.warn('Problemas de calidad de datos detectados', {
      context,
      issues,
      data: sanitizeEntity(data)
    })
  }

  return issues
}
```

## 📊 Métricas de Éxito

- **0% valores null/undefined/NaN** en operaciones críticas
- **100% cobertura de sanitización** en entradas de usuario
- **Tiempo de respuesta < 100ms** para operaciones con datos sanitizados
- **0 errores silenciosos** por datos inválidos
- **Logs claros** para debugging y monitoreo

## 🎯 Conclusión

**Estrategia Óptima:** "Prevención + Sanitización + Validación + Monitoring"

1. **Prevención (70%)**: Database constraints + default values
2. **Sanitización (20%)**: Limpieza automática de datos
3. **Validación (5%)**: Verificación estricta antes de operaciones
4. **Monitoring (5%)**: Alertas y logging para problemas restantes

**Esta aproximación asegura datos confiables mientras mantiene el performance y la experiencia de usuario.**
