# E2E Tests - FloresYa

Test suite de End-to-End (E2E) para validar que todas las páginas HTML carguen correctamente y que el patrón DOMContentLoaded funcione como se espera.

## 📋 Tabla de Contenidos

- [Configuración](#configuración)
- [Tests Disponibles](#tests-disponibles)
- [Ejecución](#ejecución)
- [Scripts Personalizados](#scripts-personalizados)
- [Reportes](#reportes)
- [Troubleshooting](#troubleshooting)

## 🚀 Configuración

### Prerrequisitos

1. **Node.js** y **npm** instalados
2. **Playwright** instalado (ya viene configurado en el proyecto)
3. Dependencias del proyecto instaladas: `npm install`

### Instalación de Navegadores Playwright

```bash
# Instalar navegadores para Playwright
npx playwright install

# O instalar navegadores específicos
npx playwright install chromium firefox webkit
```

## 📋 Tests Disponibles

### 1. **Page Loading Tests** (`page-loading-comprehensive.test.js`)

Valida que todas las páginas HTML del proyecto carguen correctamente.

**Coverage:**

- ✅ 23 páginas HTML totales
- ✅ Main pages (index, cart, contacto, etc.)
- ✅ Design pages (diseno-1.html, diseno-2.html, etc.)
- ✅ Admin pages (dashboard, orders, product editor, etc.)
- ✅ Demo pages (hamburger-menu-demo, product-integration-demo)

**Validaciones:**

- Status code 200
- Títulos correctos
- DOCTYPE HTML
- Estructura básica del DOM
- Ausencia de errores JavaScript
- Tiempos de carga aceptables

### 2. **DOMContentLoaded Pattern Validation** (`domcontentloaded-pattern.test.js`)

Valida específicamente que el patrón DOMContentLoaded funcione correctamente.

**Validaciones:**

- Scripts se ejecutan después de DOM ready
- Manejo de errores de carga de scripts
- Orden correcto de carga dinámica
- Timing correcto de ejecución
- Funcionalidad posterior a carga
- Compatibilidad entre navegadores

### 3. **Admin Pages Loading Tests** (`admin-pages-loading.test.js`)

Valida las páginas de administración con patrones de carga complejos.

**Coverage:**

- Dashboard (con Chart.js)
- Orders management
- Product creation/editing
- Image management
- Contact editor
- Occasions management

**Validaciones:**

- Carga de Chart.js
- Funcionalidad de image upload
- Diseño responsive
- Manejo de dependencias faltantes
- Funcionalidad con problemas de red

### 4. **Design Pages Loading Tests** (`design-pages-loading.test.js`)

Valida las páginas de diseños y temas.

**Coverage:**

- Gallery de diseños
- 5 páginas de diseños específicas
- Theme gallery
- Theme preloader

**Validaciones:**

- Carga de temas y preloader
- Estilos específicos de diseños
- Comportamiento responsive
- Características interactivas
- Manejo de recursos faltantes

## 🎯 Ejecución

### Scripts Disponibles

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Tests específicos de carga de páginas
npm run test:e2e:loading

# Tests específicos de DOMContentLoaded
npm run test:e2e:domcontentloaded

# Tests de páginas de administración
npm run test:e2e:admin

# Tests de páginas de diseños
npm run test:e2e:design

# Tests completos (comprehensive)
npm run test:e2e:comprehensive
```

### Ejecución Manual

```bash
# Usar Playwright directamente
npx playwright test

# Ejecutar tests específicos
npx playwright test page-loading-comprehensive.test.js

# Ejecutar con interfaz gráfica
npx playwright test --ui

# Ejecutar en modo debug
npx playwright test --debug

# Ejecutar en específico navegador
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Ejecución con Servidor Automático

El script `run-e2e-tests.cjs` se encarga de:

1. ✅ Verificar si el servidor ya está corriendo
2. 🚀 Iniciar el servidor de desarrollo si es necesario
3. ⏳ Esperar a que el servidor esté listo
4. 🧪 Ejecutar los tests E2E
5. 🛑 Limpiar el proceso del servidor

```bash
# Usar el script automatizado
node scripts/run-e2e-tests.cjs

# Con patrón específico
node scripts/run-e2e-tests.cjs --pattern="DOMContentLoaded"
```

## 📊 Reportes

### Reporte HTML

```bash
# Generar reporte HTML
npx playwright test --reporter=html

# Ver reporte
npx playwright show-report
```

### Reportes en Consola

Los tests muestran información detallada en la consola:

```
🚀 Testing Homepage at /
✅ Homepage loaded successfully
🚀 Testing Cart at /pages/cart.html
✅ Cart loaded successfully
...
📊 SUMMARY:
   ✅ Success: 23 files
   ⚠️  Warnings: 0 files
   ❌ Errors: 0 files
```

## 🔧 Scripts Personalizados

### `run-e2e-tests.cjs`

Script principal que orquestra la ejecución de tests E2E.

**Opciones:**

```bash
node scripts/run-e2e-tests.cjs --pattern="PATRÓN_DE_BÚSQUEDA"
```

**Patrones disponibles:**

- `Page Loading` - Tests de carga general
- `DOMContentLoaded` - Tests del patrón DOMContentLoaded
- `Admin Pages` - Tests de páginas de administración
- `Design Pages` - Tests de páginas de diseños
- `Comprehensive` - Tests completos

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. **Servidor no inicia**

```bash
Error: Server failed to start within timeout period
```

**Solución:**

- Verificar que el puerto 3000 esté disponible
- Revisar variables de entorno (.env)
- Ejecutar `npm run dev` manualmente para ver errores

#### 2. **Tests fallan por tiempo de espera**

```bash
Test timeout of 30000ms exceeded
```

**Solución:**

- Incrementar timeout en playwright.config.js
- Verificar que el servidor esté corriendo rápido
- Revisar dependencias de red externas

#### 3. **Navegadores no instalados**

```bash
Error: Executable doesn't exist
```

**Solución:**

```bash
npx playwright install
npx playwright install-deps
```

#### 4. **Scripts no cargan**

```bash
Script initialization failed
```

**Solución:**

- Verificar que los archivos JS existan
- Revisar rutas en los HTML
- Verificar sintaxis JavaScript

### Debugging

#### Modo Debug

```bash
npx playwright test --debug
```

#### Ver Consola del Navegador

```javascript
// En los tests, monitorear la consola
page.on('console', msg => console.log(msg.text()))
page.on('pageerror', error => console.log(error.message))
```

#### Screenshots en Fallos

Los tests automáticamente toman screenshots cuando fallan. Se encuentran en:

```
test-results/
├── chrome/
├── firefox/
└── webkit/
```

## 📈 Métricas y Benchmarks

### Tiempos de Carga Esperados

- **Main pages**: < 3 segundos
- **Admin pages**: < 5 segundos
- **Demo pages**: < 2 segundos

### Cobertura Actual

- ✅ **23 páginas HTML** cubiertas
- ✅ **3 navegadores** (Chrome, Firefox, Safari)
- ✅ **3 viewports** (Desktop, Tablet, Mobile)
- ✅ **4 categorías** de tests
- ✅ **50+ casos** de prueba

## 🔄 Integración CI/CD

### GitHub Actions

```yaml
- name: Run E2E tests
  run: npm run test:e2e:ci
```

### Variables de Entorno

```bash
# Para CI
PLAYWRIGHT_BROWSERS_PATH=0
CI=true
```

## 📝 Mejores Prácticas

1. **Ejecutar tests localmente antes de commits**
2. **Usar patrones específicos para debugging**
3. **Mantener actualizados los navegadores Playwright**
4. **Revisar reportes HTML para análisis detallado**
5. **Monitorear tiempos de carga en cada ejecución**

## 🆘 Ayuda

Para ayuda adicional:

```bash
# Ayuda de Playwright
npx playwright --help

# Listar tests disponibles
npx playwright test --list

# Ver configuración
npx playwright test --config=playwright.config.js --dry-run
```

---

**Nota:** Estos tests están diseñados para complementar los tests unitarios y de integración existentes. Se enfocan específicamente en validar que las páginas HTML carguen correctamente con el patrón DOMContentLoaded implementado.
