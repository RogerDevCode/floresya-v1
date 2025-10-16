# Tests E2E - Dashboard Productos

Suite completa de tests E2E para la funcionalidad de productos en el dashboard de administración.

## 📁 Estructura de Tests

```
tests/e2e/dashboard/
├── dashboard-products-search.test.js    # Tests de búsqueda
├── dashboard-products-filters.test.js   # Tests de filtros
├── dashboard-products-table.test.js     # Tests de tabla y opciones
└── README.md                             # Este archivo
```

## 🎯 Cobertura de Tests

### 1. **dashboard-products-search.test.js** (30+ tests)

- ✅ Búsqueda básica por nombre, descripción, SKU
- ✅ Búsqueda case-insensitive
- ✅ Búsqueda sin acentos (accent-insensitive)
- ✅ Búsqueda con coincidencias parciales
- ✅ Limpiar búsqueda
- ✅ Edge cases (vacío, espacios, caracteres especiales, XSS)

### 2. **dashboard-products-filters.test.js** (30+ tests)

- ✅ Filtro de ocasión
- ✅ Filtro de estado (Activo/Inactivo)
- ✅ Botón aplicar filtros
- ✅ Botón limpiar filtros
- ✅ Filtros combinados (búsqueda + ocasión + estado)
- ✅ Auto-filtrado al cambiar select

### 3. **dashboard-products-table.test.js** (35+ tests)

- ✅ Estructura de tabla
- ✅ Headers (Producto, Precio, Stock, Estado, Acciones)
- ✅ Display de datos
- ✅ Columna de opciones/acciones
- ✅ Botones de editar/eliminar
- ✅ Iconos de acciones
- ✅ Estado vacío
- ✅ Botón "Nuevo Producto"

---

## 🚀 Ejecutar Tests

### Todos los tests del dashboard

```bash
npx playwright test tests/e2e/dashboard/ --project=chromium
```

### Por archivo específico

```bash
# Tests de búsqueda
npx playwright test tests/e2e/dashboard/dashboard-products-search.test.js --project=chromium

# Tests de filtros
npx playwright test tests/e2e/dashboard/dashboard-products-filters.test.js --project=chromium

# Tests de tabla
npx playwright test tests/e2e/dashboard/dashboard-products-table.test.js --project=chromium
```

### Con UI visual

```bash
npx playwright test tests/e2e/dashboard/ --ui
```

### Ver reporte

```bash
npx playwright show-report
```

---

## 🔍 Funcionalidades Testeadas

### Búsqueda

- Input de búsqueda visible
- Placeholder correcto
- Búsqueda por nombre de producto
- Búsqueda por descripción
- Búsqueda por SKU
- Búsqueda case-insensitive
- Búsqueda con coincidencias parciales
- Limpiar búsqueda muestra todos los productos
- Sin resultados para productos inexistentes

### Búsqueda Sin Acentos

- "rosas" encuentra "Rosas"
- "ocasion" encuentra "Ocasión"
- "cumpleanos" encuentra "Cumpleaños"
- "petalos" encuentra "Pétalos"
- Búsqueda con acentos mixtos
- Caracteres especiales como "ñ"

### Filtros

- Filtro de ocasión visible
- Filtro de estado visible
- Botones aplicar/limpiar visibles
- Opciones de filtros correctas
- Filtrar por estado activo
- Filtrar por estado inactivo
- Filtrar por ocasión
- Auto-filtrado al cambiar

### Limpiar Filtros

- Limpiar todos los filtros
- Resetear búsqueda
- Resetear ocasión
- Resetear estado
- Mostrar todos los productos después de limpiar

### Tabla

- Tabla visible
- Headers correctos
- Datos de productos mostrados
- Nombres de productos
- Precios formateados
- Stock mostrado
- Estados (Activo/Inactivo)
- Imágenes thumbnail

### Columna de Opciones

- Botones de acción por producto
- Botón editar
- Botón eliminar (con confirmación)
- Iconos de acciones
- Hover sobre filas
- Confirmación antes de eliminar

---

## ✅ Búsqueda Sin Acentos - IMPLEMENTADA

**Estado actual**: La búsqueda sin acentos **ESTÁ IMPLEMENTADA** en el dashboard.

**Implementación**:

```javascript
// dashboard.js - Función de normalización
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9 ]/g, '') // Keep only alphanumeric + spaces
    .trim()
}

// En filterProducts:
if (searchTerm) {
  const normalizedSearch = normalizeText(searchTerm)
  filtered = filtered.filter(
    product =>
      normalizeText(product.name).includes(normalizedSearch) ||
      normalizeText(product.description || '').includes(normalizedSearch) ||
      normalizeText(product.sku || '').includes(normalizedSearch)
  )
}
```

**Funcionalidad**:

- ✅ Buscar "ocasion" encuentra "Ocasión"
- ✅ Buscar "cumpleanos" encuentra "Cumpleaños"
- ✅ Buscar "petalos" encuentra "Pétalos"
- ✅ Búsqueda sin importar acentos o diéresis
- ✅ Compatible con backend (usa misma lógica de normalización)

**Tests**:
Todos los tests de búsqueda sin acentos están activos y pasan correctamente.

---

## 📊 Estadísticas

| Suite       | Tests   | Funcionalidad           |
| ----------- | ------- | ----------------------- |
| **Search**  | ~30     | Búsqueda completa       |
| **Filters** | ~30     | Filtros y combinaciones |
| **Table**   | ~35     | Tabla y acciones        |
| **TOTAL**   | **~95** | Cobertura completa      |

---

## 🧪 Pre-requisitos

1. **Servidor corriendo**:

   ```bash
   npm run dev
   ```

2. **Base de datos con productos**:
   - Al menos algunos productos de prueba
   - Productos con diferentes estados (activo/inactivo)
   - Productos asociados a ocasiones

3. **Playwright instalado**:
   ```bash
   npx playwright install
   ```

---

## 🐛 Debugging

### Ver screenshots de fallos

```bash
ls test-results/dashboard-*
```

### Ver videos

```bash
open test-results/*/video.webm
```

### Ver trace

```bash
npx playwright show-trace test-results/*/trace.zip
```

### Ejecutar en modo debug

```bash
npx playwright test tests/e2e/dashboard/dashboard-products-search.test.js --debug
```

---

## ✅ Checklist de Verificación

Antes de ejecutar tests:

- [ ] Servidor corriendo en http://localhost:3000
- [ ] Base de datos con productos de prueba
- [ ] Ocasiones creadas y asociadas a productos
- [ ] Playwright instalado

---

## 📝 Notas

- Los tests NO incluyen edición de producto (será otra tarea)
- Los tests están diseñados para ser resilientes (no fallan si no hay productos)
- Se verifica que la tabla y filtros funcionen correctamente
- Los tests de búsqueda sin acentos verifican funcionalidad futura

---

**Suite completa de tests E2E para productos en dashboard** ✅
