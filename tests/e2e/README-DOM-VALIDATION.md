# DOM Validation Test Suite

Este conjunto de tests E2E verifica que todas las páginas HTML del proyecto se cargan correctamente, sin errores de JavaScript, referencias rotas, o problemas de DOM.

## 📋 Tests Incluidos

### 1. **pages-loading-comprehensive.test.js**

Verifica la carga completa de DOM en todas las páginas principales:

- Homepage
- Product Detail
- Cart
- Payment
- Order Confirmation
- Contact
- Designs Gallery
- Admin Dashboard
- Admin Create Product
- Admin Edit Product
- Admin Orders Management
- Admin Occasions Management

**Verificaciones:**

- ✅ DOM se carga sin errores de JavaScript
- ✅ Estructura HTML válida (html, head, body)
- ✅ Sin errores 404 para recursos críticos
- ✅ Meta tags apropiados (charset, viewport)
- ✅ Responsive design (mobile, tablet, desktop)

### 2. **resources-loading.test.js**

Verifica que todos los recursos estáticos se cargan correctamente:

- Archivos CSS
- Archivos JavaScript
- Imágenes críticas
- Enlaces de navegación
- Recursos pre-cargados
- Caché de recursos estáticos
- Manejo de red lenta

### 3. **homepage-dom.test.js**

Tests específicos para la homepage:

- Elementos críticos visibles (header, footer, navegación)
- Navegación móvil funcional
- Grid de productos
- Imágenes con alt text
- HTML estructurado correctamente
- Navegación accesible
- Responsive design

### 4. **cart-dom.test.js**

Tests específicos para la página del carrito:

- Contenedor del carrito
- Sección de total
- Botón de checkout
- Controles de cantidad
- Mensajes de carrito vacío
- Responsive design

### 5. **product-detail-dom.test.js**

Tests específicos para detalle de producto:

- Galería de imágenes
- Información del producto
- Botón agregar al carrito
- Selector de cantidad
- Especificaciones
- Breadcrumbs
- Responsive design

### 6. **admin-pages-dom.test.js**

Tests para páginas de administración:

- Dashboard (widgets, estadísticas, gráficos)
- Create Product (formulario, carga de imágenes)
- Edit Product
- Orders Management (tabla, filtros)
- Occasions Management (lista, botón crear)
- Navegación de admin
- Responsive design

### 7. **other-pages-dom.test.js**

Tests para otras páginas:

- Payment (formulario, métodos de pago, botón submit)
- Contact (formulario, información de contacto)
- Designs Gallery (grid, filtros)
- Order Confirmation (detalles, botón continuar)
- Theme Pages (páginas de diseños)

### 8. **static-html-validation.test.js**

Validación estática de HTML:

- DOCTYPE presente
- Meta charset y viewport
- Title en todas las páginas
- Enlaces internos válidos
- Referencias CSS y JS correctas
- Imágenes con alt text
- IDs únicos (sin duplicados)

## 🚀 Cómo Ejecutar

### Opción 1: Ejecutar todos los tests

```bash
npm test
# o
npx playwright test
```

### Opción 2: Ejecutar tests específicos

```bash
# Solo tests de páginas
npx playwright test tests/e2e/pages-loading-comprehensive.test.js

# Solo homepage
npx playwright test tests/e2e/homepage-dom.test.js

# Solo validación estática
npx playwright test tests/e2e/static-html-validation.test.js
```

### Opción 3: Usar el runner personalizado

```bash
node scripts/run-dom-validation-tests.js
```

Este comando:

- Ejecuta todos los tests de DOM
- Genera un reporte HTML (`dom-validation-report.html`)
- Muestra el progreso en tiempo real
- Calcula la tasa de éxito

### Opción 4: Ejecutar en modo UI

```bash
npx playwright test --ui
```

## 📊 Reportes

### HTML Report

Después de ejecutar los tests, se genera un reporte visual en:

```
dom-validation-report.html
```

Este reporte incluye:

- ✅ Número de tests pasados/fallidos
- 📊 Tasa de éxito
- 📄 Lista detallada de cada test
- 🎨 Interfaz visual atractiva

### Playwright Report

```bash
npx playwright show-report
```

Muestra:

- Screenshots de fallos
- Videos de ejecución
- Trazas de errores
- Detalles de cada test

## 🔧 Configuración

### Playwright Config

El archivo `playwright.config.js` ya está configurado con:

- Browser: Chromium, Firefox, Safari
- Headless: false (para ver la ejecución)
- Timeout: 30 segundos por test
- Retries: 1 retry para tests fallidos

### Variables de Entorno

Crear `.env` en la raíz del proyecto:

```env
BASE_URL=http://localhost:3000
HEADLESS=true
```

## 📝 Páginas Testadas

### Páginas Públicas (9)

1. `/` - Homepage
2. `/pages/product-detail.html` - Detalle de producto
3. `/pages/cart.html` - Carrito
4. `/pages/payment.html` - Pago
5. `/pages/order-confirmation.html` - Confirmación
6. `/pages/contacto.html` - Contacto
7. `/pages/disenos.html` - Galería de diseños
8. `/pages/theme-gallery.html` - Galería de temas
9. Páginas de temas (5 diseños)

### Páginas Admin (5)

1. `/pages/admin/dashboard.html` - Dashboard
2. `/pages/admin/create-product.html` - Crear producto
3. `/pages/admin/edit-product.html` - Editar producto
4. `/pages/admin/orders.html` - Gestión de órdenes
5. `/pages/admin/occasions.html` - Gestión de ocasiones

## ✅ Criterios de Éxito

Un test pasa si:

- ✅ La página carga sin errores de JavaScript
- ✅ Todos los elementos críticos están visibles
- ✅ No hay recursos 404 (excepto favicon)
- ✅ La estructura HTML es válida
- ✅ Es responsive en mobile, tablet y desktop
- ✅ Enlaces internos apuntan a archivos existentes
- ✅ CSS y JS se cargan correctamente

## ❌ Criterios de Fallo

Un test falla si:

- ❌ Error de JavaScript crítico
- ❌ Elementos críticos no visibles
- ❌ Recursos 404 (CSS, JS, imágenes críticas)
- ❌ Estructura HTML inválida
- ❌ Scroll horizontal excesivo
- ❌ Enlaces rotos
- ❌ Imágenes sin alt text

## 🛠️ Solución de Problemas

### Test falla por timeout

```bash
# Aumentar timeout en playwright.config.js
timeout: 60000 // 60 segundos
```

### Fallos intermitentes

```bash
# Usar retries
retries: 2
```

### Querer ejecutar en paralelo

```bash
# En playwright.config.js
fullyParallel: true
```

## 📈 Mejores Prácticas

1. **Ejecutar tests antes de deploy**

   ```bash
   npm run test:e2e
   ```

2. **Ejecutar tests después de cambios en HTML/CSS/JS**

   ```bash
   npx playwright test tests/e2e/pages-loading-comprehensive.test.js
   ```

3. **Generar reporte HTML regularmente**

   ```bash
   node scripts/run-dom-validation-tests.js
   ```

4. **Monitorear la tasa de éxito**
   - Objetivo: 100%
   - Aceptable: >95%
   - Revisar si: <90%

## 🎯 Objetivos

- [x] Verificar carga correcta de DOM en todas las páginas
- [x] Detectar errores de JavaScript
- [x] Validar recursos estáticos (CSS, JS, imágenes)
- [x] Verificar enlaces internos
- [x] Comprobar responsive design
- [x] Validar estructura HTML
- [x] Detectar IDs duplicados
- [x] Verificar alt text en imágenes
- [x] Generar reportes visuales
- [x] Ejecutar tests automáticamente

## 📞 Soporte

Si encuentras un fallo:

1. Verificar que el servidor esté corriendo
2. Revisar el screenshot en el reporte
3. Leer el mensaje de error detallado
4. Ejecutar test específico en modo UI
5. Verificar recursos faltantes en DevTools

## 🔄 CI/CD Integration

Para usar en GitHub Actions o similar:

```yaml
- name: Run DOM Validation Tests
  run: |
    npm install
    npx playwright install
    node scripts/run-dom-validation-tests.js
```

---

**Nota:** Estos tests complementan, no reemplazan, los tests unitarios y de integración.
