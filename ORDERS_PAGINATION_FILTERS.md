# FloresYa - Gestión de Pedidos: Paginación y Filtros

## Implementación Completa

### ✅ Características Agregadas

#### 1. **Filtros por Fecha**

- **Últimos 30 días**: Pedidos de los últimos 30 días
- **Últimos 60 días**: Pedidos de los últimos 60 días
- **Últimos 90 días**: Pedidos de los últimos 90 días
- **Todas**: Todos los pedidos sin límite de fecha

#### 2. **Paginación**

- **20 pedidos por página** (configurable vía `itemsPerPage`)
- **Navegación completa**:
  - Primer página (chevrons-left icon)
  - Página anterior (chevron-left icon)
  - Página siguiente (chevron-right icon)
  - Última página (chevrons-right icon)
- **Indicador de progreso**: "Mostrando 1 a 20 de 100 pedidos"
- **Botones deshabilitados** cuando no aplicable

#### 3. **Ordenamiento**

- Todos los pedidos ordenados por **fecha DESC** (más recientes primero)
- Ordenamiento aplicado desde la API y mantenido en filtros

---

## Arquitectura

### Estado Global

```javascript
let currentFilter = 'all' // Estado filtro: all, pending, verified, etc.
let currentDateFilter = 'all' // Filtro fecha: 30, 60, 90, 'all'
let currentPage = 1 // Página actual
const itemsPerPage = 20 // Pedidos por página
let allOrders = [] // Todos los pedidos desde API
let orders = [] // Pedidos filtrados
```

### Flujo de Datos

```
API (/api/orders)
  ↓ fetchOrdersFromAPI()
allOrders (100 pedidos, ordenados DESC)
  ↓ applyFilters()
orders (filtrados por estado + fecha)
  ↓ renderPage()
Página actual (20 pedidos)
  ↓ renderOrdersTable()
DOM (tabla visible)
```

### Funciones Principales

#### `fetchOrdersFromAPI()`

- Fetch desde `/api/orders`
- Mapea campos API → frontend
- Ordena por `created_at DESC`
- Guarda en `allOrders`
- Llama `applyFilters()`

#### `applyFilters()`

- Filtra por fecha (30/60/90 días o todas)
- Filtra por estado (pending/verified/etc.)
- Actualiza `orders` con resultados
- Llama `updateStats()` y `renderPage()`

#### `renderPage()`

- Calcula índices: `startIdx = (currentPage - 1) * itemsPerPage`
- Slice de `orders`: `orders.slice(startIdx, endIdx)`
- Renderiza tabla con `renderOrdersTable()`
- Actualiza UI de paginación con `updatePaginationUI()`

#### `updatePaginationUI()`

- Actualiza "Mostrando X a Y de Z pedidos"
- Actualiza "Página X de Y"
- Habilita/deshabilita botones según página actual

---

## UI/UX

### HTML Agregado

**Filtros por Fecha** (`orders.html:150-182`):

```html
<div>
  <label class="block text-sm font-medium text-gray-700 mb-2">Filtrar por Fecha</label>
  <div class="flex flex-wrap gap-3">
    <button
      id="date-filter-30"
      class="date-filter-btn bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
      data-days="30"
    >
      Últimos 30 días
    </button>
    <!-- ... otros botones ... -->
  </div>
</div>
```

**Paginación** (`orders.html:218-261`):

```html
<div id="pagination-container" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
  <div class="flex items-center justify-between">
    <div class="text-sm text-gray-700">
      Mostrando <span id="showing-from">0</span> a <span id="showing-to">0</span> de
      <span id="total-orders">0</span> pedidos
    </div>
    <div class="flex items-center space-x-2">
      <button id="btn-first-page" ...><i data-lucide="chevrons-left"></i></button>
      <button id="btn-prev-page" ...><i data-lucide="chevron-left"></i></button>
      <span>Página <span id="current-page">1</span> de <span id="total-pages">1</span></span>
      <button id="btn-next-page" ...><i data-lucide="chevron-right"></i></button>
      <button id="btn-last-page" ...><i data-lucide="chevrons-right"></i></button>
    </div>
  </div>
</div>
```

### Iconos Lucide Agregados

- `chevrons-left`: Primer página
- `chevrons-right`: Última página

---

## Comportamiento

### Cambio de Filtro por Estado

1. Usuario hace clic en filtro (Todos/Pendientes/etc.)
2. `setActiveFilter()` actualiza botones (bg-pink-600 activo)
3. `currentFilter` se actualiza
4. `currentPage = 1` (resetea a primera página)
5. `applyFilters()` → filtra + renderiza

### Cambio de Filtro por Fecha

1. Usuario hace clic en filtro de fecha (30/60/90/Todas)
2. `setActiveDateFilter()` actualiza botones
3. `currentDateFilter` se actualiza
4. `currentPage = 1` (resetea a primera página)
5. `applyFilters()` → calcula `cutoffDate` → filtra + renderiza

### Navegación de Páginas

1. Usuario hace clic en botón de paginación
2. `goToPage(page)` valida página (1 ≤ page ≤ totalPages)
3. `currentPage` se actualiza
4. `renderPage()` → renderiza nueva página

### Cambio de Estado de Pedido

1. Usuario cambia dropdown de estado
2. `handleStatusChange()` actualiza estado en `allOrders`
3. `updateStats()` recalcula estadísticas
4. `applyFilters()` → re-filtra y renderiza (mantiene paginación)

---

## Ejemplo de Uso

### Escenario: Filtrar pedidos pendientes de últimos 30 días

**Estado inicial**:

- 100 pedidos en `allOrders`
- `currentFilter = 'all'`
- `currentDateFilter = 'all'`
- `currentPage = 1`

**Usuario hace clic en "Pendientes"**:

```javascript
currentFilter = 'pending'
currentPage = 1
applyFilters()
  → filtered = allOrders.filter(o => o.status === 'pending')  // 25 pendientes
  → orders = [25 pedidos]
  → renderPage()
    → pageOrders = orders.slice(0, 20)  // Página 1: pedidos 1-20
    → "Mostrando 1 a 20 de 25 pedidos"
    → "Página 1 de 2"
```

**Usuario hace clic en "Últimos 30 días"**:

```javascript
currentDateFilter = '30'
currentPage = 1
applyFilters()
  → cutoffDate = hoy - 30 días
  → filtered = allOrders.filter(o => new Date(o.created_at) >= cutoffDate)  // 40 pedidos
  → filtered = filtered.filter(o => o.status === 'pending')  // 10 pendientes
  → orders = [10 pedidos]
  → renderPage()
    → pageOrders = orders.slice(0, 10)  // Página 1: pedidos 1-10
    → "Mostrando 1 a 10 de 10 pedidos"
    → "Página 1 de 1"
    → Botones "Siguiente" y "Última" deshabilitados
```

---

## Estadísticas

**Siempre muestran totales de `allOrders`** (sin filtro de fecha):

- Pendientes: todos los pedidos con `status === 'pending'`
- En Proceso: todos los pedidos con `status === 'processing'`
- Completados: todos los pedidos con `status === 'completed'`
- Cancelados: todos los pedidos con `status === 'cancelled'`

---

## Performance

### Índices Utilizados (Backend)

- `idx_orders_status` → filtro por estado
- `idx_orders_status_created_at` → filtro estado + ordenamiento DESC

### Cálculos en Frontend

- Filtro por fecha: O(n) - itera sobre `allOrders`
- Filtro por estado: O(n) - itera sobre resultados de fecha
- Paginación: O(1) - slice de array
- Total complejidad: **O(n) donde n = pedidos totales**

---

## Archivos Modificados

### `/public/pages/admin/orders.html`

- Agregado: Sección de filtros por fecha (líneas 150-182)
- Agregado: Paginación UI (líneas 218-261)

### `/public/pages/admin/orders.js`

- **Estado global**: `currentDateFilter`, `currentPage`, `itemsPerPage`, `allOrders`, `orders`
- **Funciones agregadas**:
  - `setActiveDateFilter(days)` - Activa botón de filtro de fecha
  - `applyFilters()` - Aplica filtros de estado + fecha
  - `goToPage(page)` - Navega a página específica
  - `renderPage()` - Renderiza página actual
  - `updatePaginationUI()` - Actualiza botones y textos de paginación
- **Funciones modificadas**:
  - `fetchOrdersFromAPI()` - Guarda en `allOrders` y ordena DESC
  - `setupEventListeners()` - Agrega listeners para fecha y paginación
  - `handleStatusChange()` - Usa `applyFilters()` en vez de `loadOrders()`
- **Funciones eliminadas**: `loadOrders()` (reemplazada por `applyFilters()` + `renderPage()`)

### `/public/js/lucide-icons.js`

- Agregado: `chevrons-left` icon
- Agregado: `chevrons-right` icon

---

## Testing Manual

### Casos de Prueba

1. **Carga inicial**: Verifica 100 pedidos desde API, mostrando página 1 (1-20)
2. **Filtro estado**: Click "Pendientes" → solo muestra pendientes
3. **Filtro fecha**: Click "Últimos 30 días" → solo muestra pedidos recientes
4. **Combinación**: Pendientes + Últimos 30 días → intersección
5. **Paginación**: Navegación completa (primera/anterior/siguiente/última)
6. **Cambio estado**: Cambio en dropdown → actualiza stats + re-filtra
7. **Botones deshabilitados**: Primera página → botones "Anterior/Primera" deshabilitados
8. **Empty state**: Filtro sin resultados → muestra "No hay pedidos con este filtro"

---

## Próximas Mejoras (Opcional)

1. **Búsqueda por texto**: Filtro por nombre de cliente/email
2. **Rango de fechas**: Date picker para desde/hasta
3. **Items por página**: Selector de 10/20/50/100
4. **Exportar CSV**: Descargar pedidos filtrados
5. **URL state**: Guardar filtros en query params para compartir
6. **Infinite scroll**: Cargar más pedidos al hacer scroll
7. **Server-side pagination**: Paginar en backend para >1000 pedidos

---

## Conclusión

✅ Implementación completa de paginación + filtros por fecha
✅ 0 errores ESLint
✅ UI/UX consistente con diseño existente
✅ Performance optimizada con filtros en memoria
✅ Iconos Lucide agregados (chevrons-left/right)
✅ Estado global bien manejado
✅ Funciones fail-fast (validaciones explícitas)
