# Tests E2E - Filtros de Ocasiones en Product Cards

## 📋 Descripción

Este conjunto de tests e2e está diseñado para identificar y corregir problemas con los filtros de ocasiones en las product cards de la aplicación FloresYa.

**Problema a resolver:** Los filtros de ocasiones ('todos', 'cumpleaños', 'graduación', etc.) no están funcionando correctamente.

## 🎯 Qué Validan

### Test Suite 1: `filtros-ocasiones-productos.test.js`

Tests individuales para cada filtro de ocasión:

- ✅ **Filter "Todos"**: Verifica que muestra todos los productos
- ✅ **Filter "Cumpleaños"**: Verifica filtrado por ocasión cumpleaños
- ✅ **Filter "Aniversario"**: Verifica filtrado por ocasión aniversario
- ✅ **Filter "San Valentín"**: Verifica filtrado por ocasión san-valentín
- ✅ **Filter "Día de la Madre"**: Verifica filtrado por ocasión dia-de-la-madre
- ✅ **Filter "Graduación"**: Verifica filtrado por ocasión graduacion

**Validaciones en cada test:**

- Botón visible y clickeable
- Estado activo después del click (clase `.active`)
- `window.currentFilters.occasion` actualizado correctamente
- Productos filtrados mostrados
- Screenshots antes/después
- Sin errores en console

### Test Suite 2: `filtros-ocasiones-flujos.test.js`

Tests de flujo completo:

- ✅ **Filter Transitions**: Cambio entre múltiples filtros
- ✅ **Combined Filters**: Ocasión + orden + búsqueda
- ✅ **Dynamic Loading**: Carga dinámica de botones desde API
- ✅ **Responsive**: Comportamiento en mobile/tablet/desktop

### Test Suite 3: `filtros-ocasiones-debug.test.js`

Tests de debug con logging detallado:

- ✅ **State Debug**: Tracking detallado de `window.currentFilters`
- ✅ **API Debug**: Inspección de requests/responses
- ✅ **DOM Debug**: Estructura DOM y CSS classes
- ✅ **Products Debug**: Loading y filtering de productos

## 🚀 Cómo Ejecutar

### Prerrequisitos

```bash
# Instalar dependencias
npm install

# Asegurarse que la aplicación está corriendo
npm run dev  # o el comando que uses para correr el servidor
```

### Ejecutar Todos los Tests

```bash
# Todos los tests de filtros
npm run test:e2e filtros-ocasiones

# Con reporter HTML
npx playwright test filtros-ocasiones --reporter=html
```

### Ejecutar Test Específico

```bash
# Test de una ocasión específica
npx playwright test --grep "Cumpleaños"

# Test de una suite específica
npx playwright test filtros-ocasiones-productos

# Test de debug
npx playwright test filtros-ocasiones-debug
```

### Ejecutar en Navegador Específico

```bash
# Solo Firefox (como los tests existentes)
npx playwright test filtros-ocasiones --project=firefox

# Chrome y Firefox
npx playwright test filtros-ocasiones --project=chromium,firefox
```

### Modo Debug

```bash
# Con interfaz visual
npx playwright test filtros-ocasiones --debug

# Con trace
npx playwright test filtros-ocasiones --trace on

# Con video
npx playwright test filtros-ocasiones --video on
```

### Scripts Disponibles

```bash
# package.json scripts
npm run test:e2e                   # Todos los tests e2e
npm run test:e2e:loading          # Tests de carga
npm run test:e2e:domcontentloaded # Tests de DOM
npm run test:e2e:admin            # Tests de admin
npm run test:e2e:comprehensive    # Tests comprehensivos
```

## 📊 Interpretar Resultados

### ✅ Test PASSED

- Botón clickeable
- Filtro funciona correctamente
- `window.currentFilters` actualizado
- Productos filtrados
- Sin errores en console

### ❌ Test FAILED - Causas Comunes

#### 1. **Botón no encontrado**

```
Error: locator('.model-4-filter[data-filter="cumpleanos"]') not found
```

**Causa**: API de ocasiones no responde o botones no se generan
**Solución**: Verificar API `/api/occasions` está funcionando
**Debug**: Usar `filtros-ocasiones-debug.test.js`

#### 2. **Click no actualiza estado**

```
Error: Expectation failed: expected 'cumpleanos' but got ''
```

**Causa**: Event handler no adjunto o falla silenciosa
**Solución**: Verificar `handleOccasionFilterClick()` se ejecuta
**Debug**: Revisar console.log en test de debug

#### 3. **Productos no se filtran**

```
Error: Product count unchanged
```

**Causa**: API de productos no recibe parámetros o no filtra
**Solución**: Verificar que request incluye `occasion` param
**Debug**: Usar API debug test para inspeccionar requests

#### 4. **Error en JavaScript**

```
Console errors detected: [Error] TypeError: Cannot read property 'occasion' of undefined
```

**Causa**: `window.currentFilters` no inicializado
**Solución**: Verificar `initEnhancedFilters()` se ejecuta
**Debug**: Usar JS errors debug test

## 🔍 Debug Paso a Paso

### Paso 1: Verificar Carga Inicial

```bash
npx playwright test filtros-ocasiones-debug --grep "inspect API calls"
```

**Revisar**: ¿Se llama `/api/occasions`? ¿Qué status code?

### Paso 2: Verificar Estado

```bash
npx playwright test filtros-ocasiones-debug --grep "track window.currentFilters"
```

**Revisar**: ¿`window.currentFilters` existe? ¿Se actualiza?

### Paso 3: Verificar DOM

```bash
npx playwright test filtros-ocasiones-debug --grep "inspect complete DOM structure"
```

**Revisar**: ¿Botones se insertan en `#quickFilters`? ¿Tienen `data-filter`?

### Paso 4: Verificar API de Productos

```bash
npx playwright test filtros-ocasiones-debug --grep "inspect API calls"
```

**Revisar**: ¿Request a `/api/products` incluye `occasion`? ¿Qué params?

### Paso 5: Probar un Filtro

```bash
npx playwright test filtros-ocasiones-productos --grep "Cumpleaños"
```

**Revisar**: Screenshots antes/después. ¿Cambian los productos?

## 📁 Archivos Generados

### Screenshots

```
test-results/
├── antes-todos-1234567890.png
├── despues-todos-1234567890.png
├── antes-cumpleanos-1234567890.png
├── despues-cumpleanos-1234567890.png
├── ...
└── debug-state-tracking-1234567890.png
```

### Reporte HTML

```
playwright-report/index.html
```

**Abre en navegador para ver reporte visual completo**

### Videos (on failure)

```
test-results/
├── test-filtros-todos-chromium-video-webm
├── test-filtros-cumpleanos-firefox-video-webm
└── ...
```

### Traces

```bash
# Para ver trace
npx playwright show-trace trace.zip
```

## 🛠️ Troubleshooting

### Error: "No se encuentra la página"

```bash
# Verificar que la app esté corriendo
curl http://localhost:3000

# O cambiar baseURL en playwright.config.js
```

### Error: "Timeout"

```bash
# Aumentar timeout en test
test('should...', async ({ page }) => {
  page.setDefaultTimeout(30000) // 30 segundos
})
```

### Error: "Tests skipped"

- Verificar que la app esté cargando datos
- API puede estar fallando
- Usar test de debug para ver console errors

### Filtros funcionan manualmente pero fallan en test

- Verificar selectors son correctos
- Test puede necesitar más wait time
- Usar `page.waitForTimeout(2000)` antes de click

## 📝 Logs y Debug

Cada test genera logs detallados:

### Console Messages

```javascript
// Activar logging detallado
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('ERROR:', msg.text())
  }
})
```

### Network Requests

```javascript
// Capturar requests
page.on('request', request => {
  console.log('>>', request.method(), request.url())
})
```

### State Changes

```javascript
// Trackear estado
await page.evaluate(() => {
  console.log('currentFilters:', window.currentFilters)
})
```

## 🎯 Validaciones Específicas

### Botón "Todos" (id: `#filter-all`)

- Visible al cargar página
- Estado activo por defecto
- Click limpia `window.currentFilters.occasion`

### Botones de Ocasión (class: `.model-4-filter`)

- Generados dinámicamente desde API `/api/occasions`
- Atributo `data-filter` con slug de ocasión
- Click activa botón y actualiza estado
- Solo una ocasión activa a la vez

### Estado Global (`window.currentFilters`)

```javascript
{
  category: 'all',
  sort: 'created_desc',
  priceRange: '',
  search: '',
  occasion: 'cumpleanos'  // Se actualiza al click
}
```

## 📈 Métricas de Éxito

- ✅ Todos los tests pasan
- ✅ Sin errores en console
- ✅ Screenshots muestran filtrado correcto
- ✅ `window.currentFilters` se actualiza
- ✅ API calls incluyen parámetros correctos
- ✅ Productos cambian después de filtro

## 🔗 Referencias

- **Playwright Docs**: https://playwright.dev/
- **FloresYa Project**: /home/manager/Sync/floresya-v1/
- **Tests existentes**: /home/manager/Sync/floresya-v1/tests/e2e/
- **Frontend**: /home/manager/Sync/floresya-v1/public/index.js

## 👨‍💻 Autor

Tests creados para debuggear filtros de ocasiones en FloresYa
Fecha: 2025-11-07

## 📄 Licencia

Tests para proyecto FloresYa
