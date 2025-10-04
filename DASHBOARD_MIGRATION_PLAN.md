# Dashboard Migration Plan - FloresYa Admin

**Fecha Inicio**: 2025-10-03
**Estado**: En Progreso (Fase 1 completada)

---

## Objetivo

Migrar el dashboard de admin a un sistema completo de estadísticas con filtros avanzados, gráficos de ventas mensuales y productos más vendidos.

---

## Plan Atómico de Modificaciones

### ✅ Fase 1: Filtros Globales (COMPLETADA)

**Archivo**: `dashboard.html`

- [x] Agregar dropdown de Año (2025-2030, default: 2025)
- [x] Actualizar dropdown de Período (Todos, Día de hoy, Este mes, Mes pasado, 30/60/90 días)
- [x] Ubicar filtros en header del dashboard (top-right)

**Resultado**: Filtros visibles en UI, pendiente conectar lógica

---

### ✅ Fase 2: Estadísticas por Estado (COMPLETADA)

**Archivos**: `dashboard.html`, `dashboard.js`

#### 2.1 Actualizar HTML - Stats Cards

- [x] Reemplazar 4 stats actuales por 6 cards de estados:
  - Pendientes (pending) - Azul
  - Verificados (verified) - Índigo
  - Preparando (preparing) - Amarillo
  - Enviados (shipped) - Púrpura
  - Entregados (delivered) - Verde
  - Cancelados (cancelled) - Rojo
- [x] Agregar card de "Ventas Totales USD" (solo pedidos NO cancelados)
- [x] Agregar card de "Total Pedidos" (incluye todos, nota: "incluye cancelados")
- [x] Agregar indicador de filtros activos debajo de stats

#### 2.2 Actualizar JavaScript - Lógica de Filtros

- [x] Crear variable global `dashboardYearFilter = '2025'`
- [x] Actualizar `dashboardDateFilter` con nuevos valores
- [x] Modificar `updateDashboardStats()` para:
  - Obtener pedidos filtrados por año
  - Aplicar filtro de período (today, current-month, last-month, 30/60/90)
  - Calcular stats por cada estado
  - Calcular ventas totales (excluir cancelled)
  - Mostrar indicador de filtros activos

#### 2.3 Funciones de Filtrado

```javascript
function applyDashboardFilters(orders) {
  // Filtrar por año
  // Filtrar por período
  // Retornar órdenes filtradas
}

function calculateStatsByState(orders) {
  // Contar por cada estado
  // Calcular ventas (sin cancelados)
  // Retornar objeto con stats
}
```

---

### ✅ Fase 3: Gráfico de Ventas Mensuales (COMPLETADA)

**Archivos**: `dashboard.html`, `dashboard.js`

#### 3.1 Instalar Chart.js

- [x] `npm install chart.js`
- [x] Importar Chart.js desde CDN (https://cdn.jsdelivr.net/npm/chart.js@4.4.1/auto/+esm)

#### 3.2 Crear Sección de Gráfico

- [x] Reemplazar placeholder de gráfico en HTML
- [x] Agregar canvas con id `monthly-sales-chart`
- [x] Agregar dropdown de filtro de estado (independiente)
- [x] Agregar subtítulo dinámico: "Ventas mensuales (pedidos no cancelados)" o según filtro

#### 3.3 Implementar Lógica de Gráfico

- [x] `renderMonthlySalesChart(orders)` implementada
- [x] Últimos 12 meses desde mes actual hacia atrás
- [x] Filtro por estado (all-non-cancelled, all, pending, verified, etc.)
- [x] Datasets: Monto USD (barras) + Cantidad (línea)
- [x] `updateChartSubtitle()` para subtítulo dinámico
- [x] `setupChartFilter()` para listener de filtro

**Configuración Chart.js**:

- [x] Tipo: Mixed (Bar + Line)
- [x] Eje X: Meses (ej: "Oct 2024", "Nov 2024", ...)
- [x] Eje Y izquierdo: USD (con formato $)
- [x] Eje Y derecho: Cantidad (stepSize: 1)
- [x] Colores: Rosa (barras USD) / Púrpura (línea cantidad)

---

### ✅ Fase 4: Productos Más Vendidos (COMPLETADA)

**Archivos**: `dashboard.html`, `dashboard.js`

#### 4.1 Crear Sección HTML

- [x] Agregar sección "Top 3 Productos Más Vendidos"
- [x] Agregar subtítulo con indicador de filtros: "Filtros: Año 2025, Todos los períodos (excluye cancelados)"
- [x] Diseño: Cards horizontales con badge de posición, nombre, ID, cantidad vendida

#### 4.2 Implementar Lógica

- [x] `getTopProducts(orders, limit = 3)` implementada
- [x] Filtrar pedidos NO cancelados
- [x] Aplicar filtros globales (año + período) con `applyDashboardFilters()`
- [x] Agrupar por product_id desde order_items
- [x] Sumar cantidades vendidas (no por ingresos)
- [x] Ordenar DESC por cantidad
- [x] Retornar top 3
- [x] `renderTopProducts()` con badges numéricos (1, 2, 3)
- [x] `updateTopProductsSubtitle()` para sincronizar con filtros globales

---

### ✅ Fase 5: Indicadores Visuales (COMPLETADA)

**Archivos**: `dashboard.html`, `dashboard.js`

#### 5.1 Indicador Global de Filtros

- [x] Crear banner con filtros activos (ID: `dashboard-filter-indicator`)
- [x] Formato: "📊 Mostrando: Año 2025 | Todos los pedidos"
- [x] Ubicación: Debajo de header, antes de stats
- [x] `updateFilterIndicator()` actualiza texto dinámicamente

#### 5.2 Indicadores por Sección

- [x] Stats: Indicador global de filtros (año + período)
- [x] Gráfico: Subtítulo dinámico según filtro de estado (`updateChartSubtitle()`)
- [x] Productos: Subtítulo con filtros aplicados (`updateTopProductsSubtitle()`)

#### 5.3 Notas Aclaratorias

- [x] "Total Pedidos" → Nota: "(incluye cancelados)"
- [x] "Ventas Totales USD" → Nota: "(excluye cancelados)"
- [x] Gráfico → Subtítulo: "Últimos 12 meses (pedidos no cancelados)" o según filtro
- [x] Productos → Subtítulo: "Filtros: Año 2025 | Todos los pedidos (excluye cancelados)"

---

## Reglas de Negocio

### Pedidos Cancelados

- ❌ **NO** contar en ventas totales (monto USD)
- ❌ **NO** contar en productos más vendidos
- ❌ **NO** contar en gráfico de ventas (por default)
- ✅ **SÍ** contar en "Total Pedidos" (con nota aclaratoria)
- ✅ **SÍ** contar en stat card de "Cancelados"

### Filtros

- **Default**: Año actual (2025) + Todos los pedidos
- **Año**: Aplicar a todas las secciones
- **Período**: Aplicar a todas las secciones
- **Estado (gráfico)**: Solo para gráfico, independiente de filtros globales

### Productos Más Vendidos

- **Ordenar por**: Cantidad vendida (NO por ingresos)
- **Mostrar**: Top 3
- **Excluir**: Pedidos cancelados
- **Aplicar**: Filtros globales (año + período)

---

## Archivos Modificados

### ✅ Todos Completados

- [x] `dashboard.html` - Filtros, stats cards, gráfico, productos
- [x] `dashboard.js` - Toda la lógica de filtros y gráficos
- [x] `package.json` - Chart.js agregado
- [x] `CLAUDE.md` - Nueva sección "Admin Panel Architecture" documentada

---

## Progreso por Fase

- [x] Fase 1: Filtros Globales - **100%**
- [x] Fase 2: Estadísticas por Estado - **100%**
- [x] Fase 3: Gráfico de Ventas Mensuales - **100%**
- [x] Fase 4: Productos Más Vendidos - **100%**
- [x] Fase 5: Indicadores Visuales - **100%** (implementado en fases anteriores)

**Total**: 100% completado ✅

---

## ✅ Trabajo Completado

### Sesión 2025-10-03

1. ✅ Completar Fase 2: Stats cards + lógica de filtros
2. ✅ Completar Fase 3: Gráfico de ventas mensuales con Chart.js
3. ✅ Completar Fase 4: Productos más vendidos (Top 3)
4. ✅ Completar Fase 5: Indicadores visuales en todas las secciones

### Funcionalidades Implementadas

- **Filtros Globales**: Año (2025-2030) + Período (hoy, mes actual, mes pasado, 30/60/90 días)
- **8 Stats Cards**: Total Pedidos, Ventas Totales USD, 6 estados (pending, verified, preparing, shipped, delivered, cancelled)
- **Gráfico Interactivo**: Chart.js con últimos 12 meses, barras USD + línea cantidad, filtro de estado independiente
- **Top 3 Productos**: Por cantidad vendida, excluye cancelados, aplica filtros globales
- **Indicadores Visuales**: Filtros activos, notas aclaratorias, subtítulos dinámicos
- **Business Rule**: Pedidos cancelados NO cuentan en ventas ni productos más vendidos

---

## Notas Técnicas

- **Chart.js**: Usar versión 4.x (última estable)
- **Colores**: Mantener consistencia con theme (rosa/púrpura)
- **Responsive**: Gráfico debe adaptarse a móvil
- **Performance**: Cachear cálculos de stats si hay muchos pedidos
- **UX**: Indicadores claros, evitar confusión con cancelados

---

**Estado Final**: ✅ COMPLETADO - 2025-10-03 22:12 UTC

### Ajustes Post-Implementación

- ✅ Fixed: Solapamiento navbar (agregado `margin-top` a `.main-content`)
- ✅ Fixed: Chart.js local (copiado de node_modules a `/public/js/chart.min.js`)
- ✅ Added: Script `postinstall` para copiar Chart.js automáticamente

---

## Resumen de Archivos Modificados

### ✅ Completados

- [x] `dashboard.html` - Filtros, 8 stats cards, gráfico canvas, top products
- [x] `dashboard.js` - Toda la lógica (filtros, Chart.js, stats, top products)
- [x] `package.json` - Chart.js@4.4.1 agregado
- [x] `DASHBOARD_MIGRATION_PLAN.md` - Plan completo y ejecutado
- [x] `CLAUDE.md` - Documentación actualizada (sección "Admin Panel Architecture")

---

**Última Actualización**: 2025-10-03 21:57 UTC
