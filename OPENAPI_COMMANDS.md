# 🎯 OpenAPI Contract System - Comandos de Validación

**Última actualización**: 2025-10-08
**Estado**: ✅ Limpiado y optimizado

---

## 📋 Comando Principal

### `npm run validate:full` ⭐ **USAR ESTE**

**Descripción**: Ejecuta el pipeline completo de validación OpenAPI.

**Incluye**:

1. ✅ Validación CI/CD del contrato OpenAPI
2. ✅ Sincronización Cliente ↔ Spec
3. ✅ Cumplimiento de contrato en Frontend

**Cuándo usar**:

- Antes de hacer commits importantes
- Antes de crear pull requests
- En pipelines de CI/CD
- Después de cambios en la API

**Ejemplo**:

```bash
npm run validate:full
```

**Salida esperada**:

```
✅ All CI/CD contract validations passed!
📊 Synchronization Summary: Coverage: 75.71%
✅ Frontend contract compliance validated successfully!
```

---

## 🔧 Comandos Individuales

### Generación

#### `npm run generate:openapi`

**Descripción**: Genera especificación OpenAPI desde anotaciones JSDoc.

**Archivos generados**:

- `api/docs/openapi-spec.json` (especificación JSON)
- `api/docs/openapi-spec.yaml` (especificación YAML)
- `api/docs/generation-summary.json` (reporte de generación)

**Cuándo usar**:

- Después de modificar anotaciones JSDoc en `api/docs/openapi-annotations.js`
- Después de agregar nuevos endpoints en controllers
- Cuando se actualiza documentación de la API

**Ejemplo**:

```bash
npm run generate:openapi
```

---

#### `npm run generate:client`

**Descripción**: Genera cliente API JavaScript desde especificación OpenAPI.

**Archivos generados**:

- `public/js/shared/api-client.js` (cliente generado)
- `public/js/shared/api-types.js` (tipos TypeScript)
- `public/js/shared/API_USAGE.md` (guía de uso)

**Cuándo usar**:

- Después de ejecutar `generate:openapi`
- Cuando se agregan nuevos endpoints a la API
- Para regenerar el cliente con cambios de spec

**Ejemplo**:

```bash
npm run generate:client
```

---

### Validación

#### `npm run validate:contract:ci`

**Descripción**: Valida el contrato OpenAPI para CI/CD.

**Checks realizados**:

1. Generación de especificación OpenAPI
2. Cumplimiento del contrato
3. Estructura de especificación
4. Calidad de anotaciones

**Archivo generado**: `api/docs/ci-contract-report.json`

**Cuándo usar**:

- En pipelines de CI/CD
- Para validar solo el contrato OpenAPI
- Debugging de problemas de documentación

**Ejemplo**:

```bash
npm run validate:contract:ci
```

---

#### `npm run validate:client:sync`

**Descripción**: Valida sincronización entre cliente generado y especificación OpenAPI.

**Checks realizados**:

1. Cobertura spec → cliente (endpoints sin métodos)
2. Métodos huérfanos (cliente sin spec)
3. Consistencia de parámetros
4. Consistencia de HTTP methods

**Archivo generado**: `api/docs/client-spec-sync-report.json`

**Cuándo usar**:

- Después de regenerar el cliente
- Para verificar cobertura de endpoints
- Debugging de métodos faltantes

**Ejemplo**:

```bash
npm run validate:client:sync
```

---

#### `npm run validate:frontend`

**Descripción**: Valida cumplimiento de contrato OpenAPI en código frontend.

**Checks realizados**:

1. Uso de api-client.js (no fetch directo)
2. No URLs hardcodeadas de API
3. No uso de bibliotecas HTTP externas (axios, etc.)

**Archivo generado**: `frontend-contract-report.json`

**Cuándo usar**:

- Después de cambios en código frontend
- Para detectar violaciones de contrato
- Antes de pull requests

**Ejemplo**:

```bash
npm run validate:frontend
```

---

## 📊 Flujo de Trabajo Recomendado

### 1. **Desarrollo de nueva funcionalidad**

```bash
# 1. Modificar anotaciones en api/docs/openapi-annotations.js
# 2. Generar spec actualizada
npm run generate:openapi

# 3. Regenerar cliente
npm run generate:client

# 4. Validar todo
npm run validate:full
```

---

### 2. **Antes de commit/PR**

```bash
npm run validate:full
```

---

### 3. **CI/CD Pipeline**

```bash
npm run validate:contract:ci
```

---

## 🛠️ Utilidades Adicionales

### `npm run watch:openapi`

**Descripción**: Observa cambios en archivos de API y regenera spec automáticamente.

**Cuándo usar**:

- Durante desarrollo activo de API
- Para regeneración automática en tiempo real

**Ejemplo**:

```bash
npm run watch:openapi
# Deja corriendo en terminal separada
```

---

## 📁 Archivos y Reportes Generados

| Archivo                                 | Generado por           | Propósito                     |
| --------------------------------------- | ---------------------- | ----------------------------- |
| `api/docs/openapi-spec.json`            | `generate:openapi`     | Especificación OpenAPI (JSON) |
| `api/docs/openapi-spec.yaml`            | `generate:openapi`     | Especificación OpenAPI (YAML) |
| `api/docs/generation-summary.json`      | `generate:openapi`     | Reporte de generación         |
| `api/docs/ci-contract-report.json`      | `validate:contract:ci` | Reporte validación CI/CD      |
| `api/docs/client-spec-sync-report.json` | `validate:client:sync` | Reporte sincronización        |
| `frontend-contract-report.json`         | `validate:frontend`    | Reporte cumplimiento frontend |
| `public/js/shared/api-client.js`        | `generate:client`      | Cliente API generado          |
| `public/js/shared/api-types.js`         | `generate:client`      | Tipos TypeScript              |
| `public/js/shared/API_USAGE.md`         | `generate:client`      | Guía de uso del cliente       |

---

## ❌ Comandos Eliminados (Legacy)

Los siguientes comandos fueron removidos en la limpieza:

- ~~`verify:spec`~~ → Reemplazado por `validate:contract:ci`
- ~~`verify:contract`~~ → Reemplazado por `validate:full`
- ~~`validate:contract`~~ → Reemplazado por `validate:full`
- ~~`enforce:contract`~~ → No se usaba
- ~~`enforce:contract:pre-commit`~~ → No se usaba
- ~~`enforce:contract:ci`~~ → Reemplazado por `validate:contract:ci`

---

## 🎯 Quick Reference

| Objetivo                        | Comando                        |
| ------------------------------- | ------------------------------ |
| **Validar TODO**                | `npm run validate:full` ⭐     |
| Generar spec OpenAPI            | `npm run generate:openapi`     |
| Generar cliente API             | `npm run generate:client`      |
| Solo validar contrato           | `npm run validate:contract:ci` |
| Ver sincronización cliente-spec | `npm run validate:client:sync` |
| Ver violaciones frontend        | `npm run validate:frontend`    |
| Watch mode (desarrollo)         | `npm run watch:openapi`        |

---

## 💡 Tips

1. **Workflow típico**: `generate:openapi` → `generate:client` → `validate:full`
2. **Antes de commit**: Siempre ejecutar `validate:full`
3. **CI/CD**: Usar `validate:contract:ci` para validación rápida
4. **Debugging**: Revisar archivos `*-report.json` para detalles de errores
5. **Watch mode**: Útil en desarrollo activo, pero consumes recursos

---

**✅ Sistema limpio y optimizado - Solo comandos esenciales**
