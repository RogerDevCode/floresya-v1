# FloresYa - Tests E2E (End-to-End)

## Descripción

Este directorio contiene tests end-to-end completos para FloresYa que validan el ciclo de vida completo de las órdenes y todos los flujos de compra de la aplicación.

## Tests Disponibles

### `order-lifecycle.test.js`

Test comprehensivo que cubre:

1. **Flujo de compra desde Hero Section (Página Principal)**
   - CTA "Explorar Catálogo"
   - CTA "Arreglos para Bodas"
   - Navegación a productos
   - Compra directa con "Buy Now"
   - Agregar al carrito y checkout

2. **Flujo de compra desde Product Cards (Grid View)**
   - Agregar múltiples productos al carrito
   - Vista rápida (Quick View - ícono de ojo)
   - Click en imagen de producto
   - Botón "Agregar al Carrito"
   - Botón "Comprar Ahora"

3. **Flujo de compra desde Carousel (Productos Destacados)**
   - Agregar producto desde slide activo
   - Navegación con botones Prev/Next
   - Navegación con indicadores
   - Múltiples productos desde diferentes slides

4. **Ciclo de Vida Completo del Pedido**
   - Agregar productos → Carrito → Checkout → Pago → Confirmación
   - Manejo de carrito vacío
   - Validación de formularios de pago

5. **Gestión de Órdenes por Admin (skipped por defecto)**
   - Login como admin
   - Visualizar órdenes pendientes
   - Transiciones de estado: pending → processing → shipped → delivered
   - Historial de estados

6. **Funcionalidades Adicionales**
   - Búsqueda de productos
   - Filtros por ocasión
   - Ordenamiento por precio
   - Paginación
   - Responsive (mobile viewport)

### `homepage.test.js`

Tests básicos de la página principal:

- Carga correcta del título
- Elementos de navegación visibles
- Hero section con contenido correcto
- Sección de productos destacados

## Requisitos Previos

1. **Dependencias instaladas**:

   ```bash
   npm install
   ```

2. **Playwright instalado**:

   ```bash
   npx playwright install
   ```

3. **Servidor local corriendo** en `http://localhost:3000`:
   ```bash
   npm run dev
   ```

## Ejecutar Tests

### Modo Normal (Headless)

Ejecuta todos los tests E2E en modo headless:

```bash
npm run test:e2e
```

### Modo UI (Interfaz Gráfica)

Ejecuta los tests con interfaz gráfica de Playwright:

```bash
npm run test:e2e:ui
```

Esta opción permite:

- Ver los tests ejecutándose en tiempo real
- Inspeccionar cada paso
- Ver screenshots y videos
- Debugging visual

### Modo Debug

Ejecuta tests en modo debug paso a paso:

```bash
npm run test:e2e:debug
```

### Ejecutar Test Específico

Ejecuta solo el test de order lifecycle:

```bash
npx playwright test order-lifecycle
```

Ejecuta solo tests de homepage:

```bash
npx playwright test homepage
```

### Ejecutar en un Navegador Específico

Solo Chromium:

```bash
npx playwright test --project=chromium
```

Solo Firefox:

```bash
npx playwright test --project=firefox
```

Solo WebKit (Safari):

```bash
npx playwright test --project=webkit
```

## Configuración

La configuración de Playwright se encuentra en `/playwright.config.js`:

- **Base URL**: `http://localhost:3000`
- **Viewport**: 1280x720
- **Timeouts**:
  - Action timeout: 15 segundos
  - Navigation timeout: 30 segundos
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Retries**: 1 retry (2 en CI)

## Estructura de Tests

Cada test suite (`test.describe`) agrupa tests relacionados:

```javascript
test.describe('Nombre del Suite', () => {
  test('debe hacer algo específico', async ({ page }) => {
    // Arrange
    await page.goto(BASE_URL)

    // Act
    await page.locator('.button').click()

    // Assert
    await expect(page).toHaveURL(/expected-url/)
  })
})
```

## Tests Skipped

Algunos tests están marcados con `test.skip()` porque requieren configuración adicional:

- **Admin Order Management**: Requiere autenticación de admin implementada
- **API Status Transitions**: Requiere setup de API client con tokens

Para habilitar estos tests:

1. Implementa la funcionalidad requerida
2. Configura credenciales en variables de entorno
3. Remueve `.skip` del test

## Debugging

### Ver Trace de Ejecución

Después de ejecutar tests con fallos:

```bash
npx playwright show-report
```

Esto abrirá un reporte HTML con:

- Screenshots de cada paso
- Videos de ejecución
- Logs de consola
- Network requests
- DOM snapshots

### Inspector de Playwright

Para inspeccionar un test específico:

```bash
npx playwright test --debug order-lifecycle
```

Esto abrirá el Playwright Inspector donde puedes:

- Ejecutar paso a paso
- Inspeccionar selectores
- Ver el DOM en tiempo real
- Editar y re-ejecutar tests

## Mejores Prácticas

1. **Espera Explícita**: Usa `waitForSelector`, `waitForTimeout` cuando sea necesario
2. **Selectores Estables**: Prefiere selectores por role, texto, o data attributes
3. **Assertions Claras**: Usa `expect` de Playwright para mejores mensajes de error
4. **Aislamiento**: Cada test debe ser independiente
5. **Cleanup**: Usa `beforeEach` y `afterEach` para setup/teardown

## Solución de Problemas Comunes

### Error: "Target page, context or browser has been closed"

**Solución**: Aumenta los timeouts en `playwright.config.js`

### Error: "waiting for selector to be visible"

**Solución**:

- Verifica que el servidor esté corriendo
- Verifica que el selector sea correcto
- Aumenta el timeout específico del selector

### Tests Fallando en CI pero Pasando Localmente

**Solución**:

- Verifica que las dependencias estén instaladas en CI
- Asegúrate de que el servidor esté levantado antes de los tests
- Aumenta timeouts para CI (ya configurado con `retries: 2`)

### Error: "net::ERR_CONNECTION_REFUSED"

**Solución**:

- Verifica que el servidor esté corriendo en puerto 3000
- Ejecuta `npm run dev` antes de los tests

## Reportes

Los reportes se generan automáticamente en:

- **HTML Report**: `playwright-report/index.html`
- **Screenshots**: `test-results/`
- **Videos**: `test-results/`

Para ver el reporte:

```bash
npx playwright show-report
```

## CI/CD Integration

En CI/CD (GitHub Actions, GitLab CI, etc.):

1. **Install dependencies**:

   ```bash
   npm ci
   npx playwright install --with-deps
   ```

2. **Start server**:

   ```bash
   npm run dev &
   ```

3. **Run tests**:

   ```bash
   npm run test:e2e
   ```

4. **Upload artifacts** (opcional):
   - `playwright-report/`
   - `test-results/`

## Cobertura de Tests

Los tests E2E actuales cubren:

✅ **Flujos de Usuario**:

- Navegación desde hero section
- Compra desde product cards
- Compra desde carousel
- Búsqueda y filtrado
- Paginación
- Responsive (mobile)

✅ **Ciclo de Vida de Orden**:

- Agregar al carrito
- Checkout
- Formulario de pago
- Confirmación de orden

⏳ **Pendiente** (requiere implementación):

- Login/Logout de usuarios
- Admin dashboard completo
- Transiciones de estado vía API
- Payment gateway integration

## Contribuir

Para agregar nuevos tests:

1. Crea un nuevo archivo `.test.js` en `/tests/e2e/`
2. Importa las dependencias necesarias
3. Estructura tu test con `test.describe` y `test`
4. Ejecuta y verifica que pasen
5. Commit con mensaje descriptivo

Ejemplo:

```javascript
import { test, expect } from '@playwright/test'

test.describe('Nueva Funcionalidad', () => {
  test('debe hacer algo', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // ... test logic
  })
})
```

## Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Playwright Inspector](https://playwright.dev/docs/inspector)

---

**Última actualización**: 2025-10-10
**Versión**: 1.0.0
**Mantenedor**: FloresYa Team
