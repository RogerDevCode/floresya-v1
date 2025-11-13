# 🧪 Orders E2E Tests - FloresYa Admin Panel

## 📋 Resumen

Suite de tests end-to-end (E2E) **atómicos** para la página de gestión de pedidos (`/pages/admin/orders.html`).

Cada test es **independiente** y verifica una **única funcionalidad**, siguiendo los principios **KISS** (Keep It Simple, Stupid) y **SOLID** (Single Responsibility).

---

## ✅ Tests Implementados

### 1. **orders-page-loads.test.js**

**Objetivo**: Verificar que la página carga sin errores

**Cobertura**:

- ✅ Sin errores JavaScript
- ✅ Sin warnings críticos
- ✅ Todos los elementos principales visibles
- ✅ Filtros presentes
- ✅ Tabla y paginación visibles
- ✅ Íconos Lucide renderizados
- ✅ Modales ocultos al cargar
- ✅ Valores por defecto correctos

**Tests**: 11 casos de prueba

---

### 2. **orders-table-display.test.js**

**Objetivo**: Verificar que la tabla muestra pedidos correctamente

**Cobertura**:

- ✅ Pedidos cargan desde API
- ✅ Datos en columnas correctas (Cliente, Productos, Total, Fecha, Estado, Acciones, Historial)
- ✅ Información del cliente formateada
- ✅ Conteo de productos correcto
- ✅ Montos en formato USD
- ✅ Fechas en formato válido
- ✅ Badges de estado visibles
- ✅ Botones de acción presentes
- ✅ Conteo coincide con DB
- ✅ Estado vacío cuando sin resultados
- ✅ Orden descendente por fecha

**Tests**: 12 casos de prueba

---

### 3. **orders-statistics.test.js**

**Objetivo**: Verificar que las estadísticas son correctas

**Cobertura**:

- ✅ 4 tarjetas de estadísticas con valores
- ✅ Coincidencia con base de datos
- ✅ Suma de stats = total de pedidos
- ✅ **Pendientes** (status: pending)
- ✅ **En Proceso** (status: verified + preparing + shipped)
- ✅ **Completados** (status: delivered)
- ✅ **Cancelados** (status: cancelled)
- ✅ Estilos y colores correctos
- ✅ Íconos presentes en cada tarjeta
- ✅ Indicador de filtros visible

**Tests**: 10 casos de prueba

---

### 4. **orders-filters.test.js**

**Objetivo**: Verificar que los filtros funcionan correctamente

**Cobertura**:

- ✅ Filtro por **status** (pending, delivered, etc.)
- ✅ Filtro por **año**
- ✅ Filtro por **rango de fechas** (30, 60, 90 días)
- ✅ Filtro por **búsqueda** (cliente, email, ID)
- ✅ **Combinación de múltiples filtros**
- ✅ Botón **"Limpiar Filtros"** restaura estado
- ✅ Indicador de filtros se actualiza
- ✅ Filtros "hoy" y "mes actual"
- ✅ UI de rango personalizado
- ✅ Cambio de **items por página**
- ✅ Paginación con filtros

**Tests**: 15 casos de prueba

---

### 5. **orders-status-change.test.js**

**Objetivo**: Verificar cambio de estado y actualización de estadísticas

**Cobertura**:

- ✅ Dropdown de estado presente
- ✅ **Cambio pending → verified + estadísticas**
- ✅ **Cambio verified → preparing + estadísticas**
- ✅ **Cambio preparing → shipped + estadísticas**
- ✅ **Cambio shipped → delivered + estadísticas**
- ✅ **Cambio a cancelled + estadísticas**
- ✅ Badge de estado actualiza color
- ✅ Otros datos se preservan
- ✅ Validación integral con DB
- ✅ **CRÍTICO**: Estadísticas siempre correctas después de cada cambio

**Tests**: 10 casos de prueba

---

### 6. **orders-detail-modal.test.js**

**Objetivo**: Verificar modal de detalle del pedido

**Cobertura**:

- ✅ Modal se abre con botón "Ver"
- ✅ Título del modal
- ✅ Información del cliente
- ✅ Lista de items/productos
- ✅ Monto total
- ✅ Información de entrega
- ✅ Cerrar con botón X
- ✅ Cerrar con overlay
- ✅ Datos coinciden con DB
- ✅ Detalles de cada producto
- ✅ Estado del pedido visible
- ✅ Contenido scrollable
- ✅ Validación integral

**Tests**: 13 casos de prueba

---

### 7. **orders-statistics-vs-filters.test.js**

**Objetivo**: Verificar que estadísticas están acorde a filtros

**Cobertura**:

- ✅ **Suma de estadísticas = total de pedidos** (SIEMPRE)
- ✅ Estadísticas vs filtro de año
- ✅ Estadísticas vs filtro de rango de fechas (30, 60, 90 días)
- ✅ Estadísticas vs filtro de status (delivered, pending, etc.)
- ✅ Estadísticas vs filtros combinados (año + fecha)
- ✅ Estadísticas vs filtros triples (año + fecha + status)
- ✅ Estadísticas se restauran al limpiar filtros
- ✅ Estadísticas coinciden con tabla visible
- ✅ Actualización en tiempo real con cambios rápidos
- ✅ Validación integral contra DB
- ✅ **FUNDAMENTAL**: Estadísticas SIEMPRE reflejan filtros activos

**Tests**: 11 casos de prueba

---

### 8. **orders-pagination.test.js**

**Objetivo**: Verificar funcionalidad de paginación

**Cobertura**:

- ✅ Información de paginación correcta
- ✅ Inicia en página 1
- ✅ Botones First/Previous deshabilitados en página 1
- ✅ Navegación a siguiente página
- ✅ Navegación a página anterior
- ✅ Navegación a última página
- ✅ Navegación a primera página
- ✅ Botones Next/Last deshabilitados en última página
- ✅ Número correcto de filas por página
- ✅ Cambio de items por página
- ✅ Paginación se actualiza con filtros
- ✅ Showing-from y showing-to correctos
- ✅ Paginación tras cambio de estado
- ✅ Validación integral

**Tests**: 14 casos de prueba

---

### 9. **orders-history-modal.test.js**

**Objetivo**: Verificar modal de historial de estados

**Cobertura**:

- ✅ Botón de historial presente
- ✅ Modal se abre correctamente
- ✅ Título "Historial de Estados"
- ✅ Entradas de historial visibles
- ✅ Timestamps en historial
- ✅ Cerrar con botón X
- ✅ Cerrar con overlay
- ✅ Datos desde DB
- ✅ Orden cronológico
- ✅ Contenido scrollable
- ✅ Diferentes historiales para diferentes pedidos
- ✅ No se muestran modales simultáneos
- ✅ Validación integral

**Tests**: 12 casos de prueba

---

## 🚀 Cómo Ejecutar

### Ejecutar todos los tests de orders:

```bash
npm run test:e2e -- tests/e2e/orders/
```

### Ejecutar un test específico:

```bash
npm run test:e2e -- tests/e2e/orders/orders-page-loads.test.js
npm run test:e2e -- tests/e2e/orders/orders-table-display.test.js
npm run test:e2e -- tests/e2e/orders/orders-statistics.test.js
npm run test:e2e -- tests/e2e/orders/orders-filters.test.js
npm run test:e2e -- tests/e2e/orders/orders-status-change.test.js
npm run test:e2e -- tests/e2e/orders/orders-detail-modal.test.js
npm run test:e2e -- tests/e2e/orders/orders-statistics-vs-filters.test.js
npm run test:e2e -- tests/e2e/orders/orders-pagination.test.js
npm run test:e2e -- tests/e2e/orders/orders-history-modal.test.js
```

### Ejecutar en modo debug:

```bash
npm run test:e2e -- tests/e2e/orders/orders-page-loads.test.js --debug
```

### Ejecutar solo en Chromium:

```bash
npm run test:e2e -- tests/e2e/orders/ --project=chromium
```

---

## 📦 Dependencias

- **Playwright**: Framework de testing E2E
- **Supabase JS Client**: Para validación contra base de datos
- **dotenv**: Para variables de entorno

---

## ⚙️ Configuración

### Variables de Entorno Requeridas (`.env.local`):

```env
BASE_URL=http://localhost:3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxxxxx
```

---

## 🎯 Principios de Testing

### 1. **Atomicidad**

- Cada test verifica una **única funcionalidad**
- Tests independientes entre sí
- No hay dependencias de orden de ejecución

### 2. **KISS (Keep It Simple, Stupid)**

- Tests simples y legibles
- Sin abstracciones innecesarias
- Código directo y claro

### 3. **SOLID (Single Responsibility)**

- Un archivo = Una responsabilidad
- `orders-page-loads.test.js` → Solo carga de página
- `orders-filters.test.js` → Solo filtros
- No mezclar concerns

### 4. **Validación contra DB**

- Tests validan datos reales de Supabase
- No usan datos mockeados
- Aseguran sincronización frontend ↔ backend

### 5. **Logging Claro**

- Cada test imprime lo que está probando
- Resultados intermedios visibles
- Facilita debugging

---

## 📊 Cobertura Actual

| Funcionalidad          | Test                                   | Estado | Tests |
| ---------------------- | -------------------------------------- | ------ | ----- |
| Carga sin errores      | `orders-page-loads.test.js`            | ✅     | 11    |
| Tabla muestra datos    | `orders-table-display.test.js`         | ✅     | 12    |
| Estadísticas correctas | `orders-statistics.test.js`            | ✅     | 10    |
| Filtros funcionan      | `orders-filters.test.js`               | ✅     | 15    |
| Cambio de estado       | `orders-status-change.test.js`         | ✅     | 10    |
| Ver detalle (modal)    | `orders-detail-modal.test.js`          | ✅     | 13    |
| Stats vs filtros       | `orders-statistics-vs-filters.test.js` | ✅     | 11    |
| Paginación             | `orders-pagination.test.js`            | ✅     | 14    |
| Historial de estados   | `orders-history-modal.test.js`         | ✅     | 12    |

**Total: 9 archivos, 108 tests individuales** 🎉

---

## 🐛 Debugging

### Ver screenshots de fallos:

```bash
ls -la test-results/orders-*
```

### Ver videos de ejecución:

```bash
ls -la test-results/orders-*/video.webm
```

### Generar reporte HTML:

```bash
npx playwright show-report
```

---

## 📝 Estructura de un Test Atómico

```javascript
import { test, expect } from '@playwright/test'

/**
 * TEST ATÓMICO X: [Descripción clara]
 *
 * Objetivo:
 * - [Objetivo específico 1]
 * - [Objetivo específico 2]
 *
 * Principio KISS: [Explicación]
 */

test.describe('Orders Page - [Feature Name]', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
  const ORDERS_URL = `${BASE_URL}/pages/admin/orders.html`

  test('should [specific behavior]', async ({ page }) => {
    console.log('🧪 TEST: [What is being tested]...')

    // Arrange
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Act
    // ... perform actions ...

    // Assert
    expect(something).toBe(expected)
    console.log('✅ [Success message]')
  })

  // More tests...
})
```

---

## 🎨 Mejores Prácticas

1. **Esperar a que los datos carguen**:

   ```javascript
   await page.waitForTimeout(2000) // Dar tiempo a la API
   ```

2. **Validar contra DB cuando sea posible**:

   ```javascript
   const { data } = await supabase.from('orders').select('*')
   expect(displayedCount).toBe(data.length)
   ```

3. **Skip tests cuando no hay datos**:

   ```javascript
   if (rowCount === 0) {
     console.log('⏭️ Skipping test - no data')
     it.skip()
   }
   ```

4. **Log valores intermedios**:
   ```javascript
   console.log(`📊 Expected: ${expected}, Got: ${actual}`)
   ```

---

## 🔄 CI/CD Integration

Estos tests están diseñados para ejecutarse en pipelines de CI/CD:

```yaml
# .github/workflows/e2e-tests.yml
- name: Run Orders E2E Tests
  run: npm run test:e2e -- tests/e2e/orders/
```

---

## 📚 Referencias

- **Playwright Docs**: https://playwright.dev/
- **FloresYa Coding Guidelines**: `/CLAUDE.md`
- **Orders Page Source**: `/public/pages/admin/orders.html` + `orders.js`
- **API Endpoint**: `GET /api/orders` (`orderController.js`)
- **DB Schema**: `orders` table in Supabase

---

---

## 🎯 Énfasis en Estadísticas

Como solicitado, **las estadísticas son fundamentales** y se verifican exhaustivamente:

### ✅ Validaciones de Estadísticas en Todos los Tests:

1. **TEST 3** (`orders-statistics.test.js`):
   - Estadísticas iniciales coinciden con DB
   - Cada stat card validado individualmente
   - Suma de stats = total de pedidos

2. **TEST 5** (`orders-status-change.test.js`):
   - **CRÍTICO**: Estadísticas actualizadas después de CADA cambio de estado
   - Validación antes/después del cambio
   - Verificación contra DB en cada paso
   - pending → verified: pending-1, processing+1
   - verified → preparing: processing sin cambio
   - preparing → shipped: processing sin cambio
   - shipped → delivered: processing-1, completed+1
   - any → cancelled: cancelled+1, origen-1

3. **TEST 7** (`orders-statistics-vs-filters.test.js`):
   - **FUNDAMENTAL**: Estadísticas SIEMPRE reflejan filtros activos
   - Filtro de año → stats solo de ese año
   - Filtro de fecha → stats solo de ese rango
   - Filtro de status → solo ese stat ≠ 0
   - Combinación de filtros → stats correctas
   - Limpiar filtros → stats restauradas
   - Validación contra DB en cada caso

### 🔢 Regla de Oro de Estadísticas:

```javascript
pending + processing + completed + cancelled = total_orders (SIEMPRE)
```

Esta invariante se verifica en **TODOS** los tests que involucran estadísticas.

---

**Última actualización**: 2025-10-15  
**Autor**: FloresYa Development Team  
**Versión**: 2.0.0 (Suite Completa)
