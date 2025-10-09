# 🚀 Automatización del Contrato OpenAPI - FloresYa

## 📋 Visión General

Este proyecto implementa un sistema completo de automatización para mantener la documentación del contrato OpenAPI siempre actualizada y sincronizada con la implementación real.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenAPI Automation                       │
├─────────────────────────────────────────────────────────────┤
│  📝 JSDoc Annotations → 📋 Spec Generation → ✅ Validation │
│  👀 File Watcher      → 🔄 Auto-regeneration → 📊 Reports  │
│  🔬 CI/CD Pipeline    → 🚀 Deployment Ready → 📚 Docs     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Herramientas Implementadas

### 1. **Generador Automático** (`scripts/generate-openapi-spec.js`)

- **Función:** Genera especificación OpenAPI 3.1 desde anotaciones JSDoc
- **Salida:** `api/docs/openapi-spec.json` y `api/docs/openapi-spec.yaml`
- **Características:**
  - Validación automática de estructura
  - Reporte de generación con métricas
  - Detección de problemas comunes

### 2. **Watcher en Tiempo Real** (`scripts/watch-openapi.js`)

- **Función:** Vigila cambios en archivos API y regenera documentación
- **Características:**
  - Monitoreo de cambios en controladores, rutas y servicios
  - Regeneración automática con feedback inmediato
  - Manejo elegante de señales de terminación

### 3. **Validación CI/CD** (`scripts/validate-contract-ci.js`)

- **Función:** Validación completa para pipelines automatizados
- **Características:**
  - Códigos de salida apropiados para CI/CD
  - Reportes detallados en JSON
  - Verificaciones de calidad de anotaciones

## 🚀 Guía de Uso

### Desarrollo Local

#### Generación Manual

```bash
# Generar especificación OpenAPI
npm run generate:openapi

# Ver documentación interactiva
# Abrir http://localhost:3000/api-docs/
```

#### Desarrollo con Watcher

```bash
# Iniciar watcher (regenera automáticamente al cambiar archivos)
npm run watch:openapi

# El watcher detectará cambios en:
# - api/controllers/*.js
# - api/routes/*.js
# - api/docs/openapi-annotations.js
# - api/services/*.js
# - api/middleware/*.js
```

#### Validación Completa

```bash
# Validar contrato completo (generación + tests)
npm run validate:contract
```

### CI/CD Pipeline

#### GitHub Actions / GitLab CI

```yaml
# .github/workflows/openapi-validation.yml
name: OpenAPI Contract Validation
on:
  push:
    paths:
      - 'api/**/*.js'
      - 'scripts/generate-openapi-spec.js'

jobs:
  validate-contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run validate:contract:ci
```

#### Script de Validación

```bash
# Validación para CI/CD (códigos de salida apropiados)
npm run validate:contract:ci
```

## 📁 Estructura de Archivos

```
scripts/
├── generate-openapi-spec.js      # Generador principal
├── watch-openapi.js             # Watcher en tiempo real
└── validate-contract-ci.js      # Validación CI/CD

api/docs/
├── openapi-annotations.js       # Anotaciones JSDoc (fuente)
├── openapi-spec.json           # Especificación generada (JSON)
├── openapi-spec.yaml           # Especificación generada (YAML)
├── generation-summary.json     # Reporte de generación
└── ci-contract-report.json     # Reporte CI/CD completo
```

## 🎯 Mejores Prácticas

### 1. **Estructura de Anotaciones**

#### Endpoint Básico

```javascript
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
```

#### Parámetros Reutilizables

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 */
```

### 2. **Convenciones de Nombres**

- **Tags:** Siempre usar nombres en plural (`Products`, `Orders`, `Users`)
- **Summaries:** Comenzar con verbo en infinitivo (`Get product`, `Create order`)
- **Parameters:** Usar referencias `$ref` para parámetros comunes
- **Responses:** Siempre incluir códigos de respuesta apropiados

### 3. **Esquemas de Datos**

#### Modelo Básico

```javascript
/**
 * @swagger
 * Product:
 *   type: object
 *   properties:
 *     id: { type: integer, example: 1 }
 *     name: { type: string, example: 'Red Roses' }
 *     price_usd: { type: number, format: decimal, example: 29.99 }
 *     created_at: { type: string, format: date-time }
 */
```

#### Respuestas Estandarizadas

```javascript
/**
 * @swagger
 * SuccessResponse:
 *   type: object
 *   properties:
 *     success: { type: boolean, example: true }
 *     data: { type: object }
 *     message: { type: string }
 */
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
# Especificar servidores adicionales
OPENAPI_SERVERS='[
  {"url": "https://api.floresya.com", "description": "Production API"},
  {"url": "https://staging.floresya.com", "description": "Staging API"}
]'

# Configurar nivel de detalle de logs
OPENAPI_LOG_LEVEL=debug
```

### Configuración de Watcher

El watcher puede ser configurado modificando `WATCH_PATTERNS` en `scripts/watch-openapi.js`:

```javascript
const WATCH_PATTERNS = [
  'api/controllers/**/*.js',
  'api/routes/**/*.js',
  'api/services/**/*.js'
  // Agregar más patrones según necesidades
]
```

## 🚨 Solución de Problemas

### Problema: "No se generan endpoints"

**Causa:** Anotaciones JSDoc mal formateadas
**Solución:**

```bash
# Verificar estructura de anotaciones
npm run generate:openapi

# Revisar logs para errores específicos
```

### Problema: "Watcher no detecta cambios"

**Causa:** Patrones de watch muy restrictivos
**Solución:**

```javascript
// En scripts/watch-openapi.js, agregar patrones:
const WATCH_PATTERNS = [
  'api/**/*.js', // Más amplio
  'scripts/**/*.js' // Incluir cambios en scripts
]
```

### Problema: "Validación CI/CD falla"

**Causa:** Especificación incompleta o inválida
**Solución:**

```bash
# Ejecutar validación local primero
npm run validate:contract

# Revisar reporte detallado
cat api/docs/ci-contract-report.json
```

## 📊 Métricas y Reportes

### Reporte de Generación (`api/docs/generation-summary.json`)

```json
{
  "timestamp": "2025-10-08T...",
  "version": "1.0.0",
  "endpoints": 24,
  "schemas": 8,
  "tags": 5,
  "generation": {
    "success": true,
    "duration": "245ms"
  }
}
```

### Reporte CI/CD (`api/docs/ci-contract-report.json`)

```json
{
  "success": true,
  "timestamp": "2025-10-08T...",
  "checks": [
    {
      "name": "openapi_generation",
      "status": "PASS",
      "details": {...}
    }
  ],
  "summary": {
    "totalChecks": 4,
    "passedChecks": 4,
    "failedChecks": 0
  }
}
```

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrolladores

1. **Escribir código** con anotaciones JSDoc completas
2. **Guardar archivo** → Watcher regenera automáticamente
3. **Verificar documentación** en `http://localhost:3000/api-docs/`
4. **Ejecutar tests** para validar contrato
5. **Commit con confianza** sabiendo que la documentación está actualizada

### Para CI/CD

1. **Pull Request** → Ejecutar `validate:contract:ci`
2. **Verificar reporte** en `api/docs/ci-contract-report.json`
3. **Deploy solo si** todas las validaciones pasan
4. **Documentación se despliega** automáticamente con la aplicación

## 🎉 Beneficios Implementados

- ✅ **Documentación siempre actualizada** - Se regenera automáticamente
- ✅ **Detección temprana de problemas** - Validación en tiempo real
- ✅ **Consistencia garantizada** - Entre implementación y documentación
- ✅ **Productividad mejorada** - Los desarrolladores se enfocan en código
- ✅ **Calidad asegurada** - Validación automática en CI/CD
- ✅ **Mantenimiento simplificado** - Un comando para actualizar todo

## 🚦 Próximos Pasos

1. **Configurar GitHub Actions** para validación automática en PRs
2. **Agregar notificaciones** Slack/Discord para cambios importantes
3. **Implementar versionado** automático de especificaciones
4. **Crear dashboard** web para métricas de contrato
5. **Agregar integración** con herramientas de testing de contratos

---

**🎯 Con esta automatización, mantener el contrato OpenAPI actualizado se convierte en una tarea automática y transparente para el equipo de desarrollo.**
