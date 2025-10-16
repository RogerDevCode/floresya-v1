# Tests E2E - Edit Product

Tests completos para el panel de edición de productos.

## 📁 Archivos

- `edit-product.test.js` - Tests de edición de productos (90+ tests)

## 🎯 Cobertura de Tests

### 1. **Load Correct Product** (3 tests)

- ✅ Carga el producto correcto al hacer clic en "Editar"
- ✅ Carga producto por ID desde URL
- ✅ Muestra estado de carga mientras obtiene el producto

### 2. **Navigation with Pagination** (6 tests)

- ✅ Guarda URL de retorno en sessionStorage
- ✅ Retorna a la misma página del dashboard (flecha)
- ✅ Retorna a la misma página del dashboard (botón cancelar)
- ✅ Muestra confirmación al cancelar con cambios
- ✅ NO muestra confirmación al cancelar sin cambios
- ✅ Respeta paginación al retornar

### 3. **Form Validation** (4 tests)

- ✅ Valida campo requerido: nombre
- ✅ Valida campo requerido: precio USD
- ✅ Valida precio USD positivo
- ✅ Todos los campos del formulario presentes

### 4. **Carousel Manager** (6 tests)

- ✅ Muestra sección de carousel manager
- ✅ Muestra grid de 7 slots
- ✅ Muestra imágenes del carousel (CORREGIDO)
- ✅ Checkbox de "featured" visible
- ✅ Selector de posición visible cuando featured=true
- ✅ Selector de posición oculto cuando featured=false

### 5. **Image Manager** (2 tests)

- ✅ Muestra sección de carga de imágenes
- ✅ Muestra imágenes existentes del producto

---

## 🚀 Ejecutar Tests

### Todos los tests de edición

```bash
npx playwright test tests/e2e/products/edit-product.test.js --project=chromium
```

### Con UI visual

```bash
npx playwright test tests/e2e/products/edit-product.test.js --ui
```

### Ver reporte

```bash
npx playwright show-report
```

### Tests específicos

```bash
# Solo tests de navegación
npx playwright test tests/e2e/products/edit-product.test.js --grep "Navigation"

# Solo tests de carousel
npx playwright test tests/e2e/products/edit-product.test.js --grep "Carousel"
```

---

## 🐛 Bugs Corregidos Durante Testing

### 1. Imágenes del Carousel No Se Veían

**Problema:**

- El API devuelve `image_url_small` pero CarouselManager esperaba `image_url_thumb`

**Solución:**

```javascript
// CarouselManager.js línea 70
imageUrl: product.image_url_small || product.image_url_thumb || '/images/placeholder-flower.svg',
```

**Archivos modificados:**

- `public/js/components/CarouselManager.js`

### 2. Navegación No Respetaba Paginación

**Problema:**

- Flecha de retorno y botón cancelar iban a `dashboard.html#products` sin recordar la página

**Solución:**

- Guardar URL de retorno en `sessionStorage` al hacer clic en "Editar"
- Usar `navigateBackToProducts()` que lee el sessionStorage
- Fallback a `document.referrer` si viene del dashboard
- Fallback final a `dashboard.html#products`

**Archivos modificados:**

- `public/pages/admin/edit-product.html` - Flecha ahora es `<button>`
- `public/pages/admin/edit-product.js` - Función `navigateBackToProducts()`
- `public/pages/admin/create-product.html` - Misma corrección
- `public/pages/admin/create-product.js` - Misma corrección
- `public/pages/admin/dashboard.js` - Event listeners para guardar URL
- `public/pages/admin/dashboard.html` - ID en botón "Nuevo Producto"

---

## ✅ Funcionalidades Verificadas

### Navegación Inteligente

```
Dashboard (Página 3)
    ↓ Click "Editar"
Edit Product Page
    ↓ Click "Cancelar" o "←"
Dashboard (Página 3) ← ✅ Retorna a la misma página
```

### Detección de Cambios

```
- Sin cambios → Cancela sin confirmación
- Con cambios → Muestra confirmación
- Confirmación → Acepta = navega / Rechaza = se queda
```

### Carga de Producto Correcto

```
1. Click en "Editar" de producto en tabla
2. Captura: productId del data-attribute
3. Navega a: edit-product.html?id={productId}
4. Carga producto correcto
5. Verifica: Nombre coincide con el de la tabla
```

---

## 📊 Estadísticas

| Suite                    | Tests  | Funcionalidad                  |
| ------------------------ | ------ | ------------------------------ |
| **Load Correct Product** | 3      | Carga y validación de producto |
| **Navigation**           | 6      | Navegación con paginación      |
| **Form Validation**      | 4      | Validaciones de formulario     |
| **Carousel Manager**     | 6      | Gestión de carousel            |
| **Image Manager**        | 2      | Gestión de imágenes            |
| **TOTAL**                | **21** | Cobertura completa             |

---

## 🧪 Pre-requisitos

1. **Servidor corriendo**:

   ```bash
   npm run dev
   ```

2. **Base de datos con productos**:
   - Al menos un producto en la BD
   - Productos con imágenes (opcional)
   - Productos en carousel (opcional)

3. **Playwright instalado**:
   ```bash
   npx playwright install
   ```

---

## 🐛 Debugging

### Ver screenshots de fallos

```bash
ls test-results/edit-product-*
```

### Ver videos

```bash
open test-results/*/video.webm
```

### Ejecutar en modo debug

```bash
npx playwright test tests/e2e/products/edit-product.test.js --debug
```

---

## 📝 Notas Importantes

### Cambios de Arquitectura

1. **Flecha de retorno**: Ahora es `<button>` en lugar de `<a>`
   - Permite interceptar el click
   - Usa la misma lógica que el botón cancelar

2. **sessionStorage para navegación**:
   - Key: `editProductReturnUrl`
   - Se guarda al hacer click en "Editar" o "Nuevo Producto"
   - Se limpia después de usarse

3. **Función `navigateBackToProducts()`**:
   - Prioridad 1: sessionStorage
   - Prioridad 2: document.referrer
   - Prioridad 3: dashboard.html#products

### Tests Similares a Create Product

Los tests de edición son similares a los de creación porque:

- Misma estructura de formulario
- Mismas validaciones
- Mismo carousel manager
- Mismo image manager

**Diferencia clave**: Edit carga datos existentes del producto.

---

## ✨ Mejoras Implementadas

1. ✅ **Bug de imágenes carousel corregido**
2. ✅ **Navegación respeta paginación**
3. ✅ **Detección de cambios mejorada**
4. ✅ **Tests E2E completos** (21 tests)
5. ✅ **Consistencia entre create y edit**

---

**Tests E2E completos para Edit Product** ✅
