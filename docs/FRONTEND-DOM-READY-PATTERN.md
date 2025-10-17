# Frontend DOM-Ready Pattern - FloresYa

## 📋 Overview

Este documento describe el patrón estandarizado para la inicialización segura de scripts en el frontend de FloresYa. Siguiendo los principios de CLAUDE.md, este patrón garantiza que todos los scripts se ejecuten solo después de que el DOM esté completamente cargado.

## 🎯 Problema Resuelto

**Problema Anterior:**

- Scripts con atributo `async` se ejecutaban antes de que el DOM estuviera listo
- Uso inconsistente de `DOMContentLoaded` en diferentes archivos
- Race conditions entre múltiples inicializaciones
- Código no ejecutándose por timing incorrecto

**Solución Implementada:**

- Módulo centralizado `dom-ready.js` con utilidades de inicialización
- Patrón consistente en todo el codebase frontend
- Manejo defensivo de estados de carga del DOM
- Uso de microtasks para comportamiento consistente

## 📦 Módulo Core: `dom-ready.js`

Ubicación: `/public/js/shared/dom-ready.js`

### Funciones Disponibles

#### 1. `onDOMReady(callback)`

Ejecuta el callback cuando el DOM está listo.

```javascript
import { onDOMReady } from './js/shared/dom-ready.js'

onDOMReady(() => {
  console.log('DOM is ready!')
  // Your initialization code here
})
```

**Características:**

- Si el DOM ya está cargado, ejecuta el callback inmediatamente usando `queueMicrotask()`
- Si el DOM está cargando, espera el evento `DOMContentLoaded`
- Usa `{ once: true }` para auto-cleanup del listener
- Fail-fast: valida que el callback sea una función

#### 2. `onWindowLoad(callback)`

Ejecuta el callback cuando TODOS los recursos (imágenes, CSS, etc.) están cargados.

```javascript
import { onWindowLoad } from './js/shared/dom-ready.js'

onWindowLoad(() => {
  console.log('All resources loaded!')
  // Code that depends on images, styles, etc.
})
```

#### 3. `initSequence(...callbacks)`

Ejecuta múltiples callbacks en secuencia, esperando que cada uno termine antes de ejecutar el siguiente.

```javascript
import { initSequence } from './js/shared/dom-ready.js'

await initSequence(initIcons, initCart, loadProducts)
```

#### 4. `waitForElement(selector, timeout)`

Espera a que un elemento específico aparezca en el DOM (útil para contenido dinámico).

```javascript
import { waitForElement } from './js/shared/dom-ready.js'

const button = await waitForElement('#dynamic-button', 5000)
button.addEventListener('click', handleClick)
```

#### 5. `safeQuerySelector(selector)`

QuerySelector que espera a que el DOM esté listo antes de buscar.

```javascript
import { safeQuerySelector } from './js/shared/dom-ready.js'

const element = await safeQuerySelector('#my-element')
if (element) {
  // Do something with element
}
```

## 🔧 Patrón de Uso Estándar

### Estructura Recomendada para Páginas

```javascript
/**
 * Page Name - Description
 */

// 1. Imports
import { onDOMReady } from '/js/shared/dom-ready.js'
import { createIcons } from '/js/'
import { api } from '/js/shared/api-client.js'

// 2. State/Constants
let currentData = null

// 3. Helper Functions
function helperFunction() {
  // ...
}

// 4. Initialization Functions
function initFeatureA() {
  // ...
}

function initFeatureB() {
  // ...
}

// 5. Main Initialization
async function init() {
  try {
    console.log('🚀 Starting initialization...')

    // Initialize in logical order
    createIcons()
    initFeatureA()
    await initFeatureB() // If async

    // Mark page as loaded
    document.documentElement.classList.add('loaded')
    console.log('✅ Page fully initialized')
  } catch (error) {
    console.error('❌ Initialization failed:', error)
    throw error // Fail-fast
  }
}

// 6. Execute on DOM Ready
onDOMReady(init)
```

## 📝 Archivos Migrados

Los siguientes archivos ya implementan el nuevo patrón:

### Páginas Principales

- ✅ `/public/index.js`
- ✅ `/public/pages/product-detail.js`
- ✅ `/public/pages/cart.js`
- ✅ `/public/pages/payment.js`
- ✅ `/public/pages/contacto.js`
- ✅ `/public/pages/contacto-page.js`
- ✅ `/public/pages/order-confirmation.js`

### Componentes

- ✅ `/public/js/` (auto-init mejorado)

## 🚫 Qué NO Hacer

### ❌ Incorrecto

```javascript
// NO uses async en module scripts
;<script type="module" src="./index.js" async></script>

// NO accedas al DOM fuera de onDOMReady
const button = document.getElementById('my-button') // Puede fallar
button.addEventListener('click', handler)

// NO uses DOMContentLoaded directamente
document.addEventListener('DOMContentLoaded', init)
```

### ✅ Correcto

```javascript
// Script module sin async
;<script type="module" src="./index.js"></script>

// Accede al DOM dentro de onDOMReady
onDOMReady(() => {
  const button = document.getElementById('my-button')
  if (button) {
    button.addEventListener('click', handler)
  }
})

// Usa la utilidad onDOMReady
onDOMReady(init)
```

## 🔍 Debugging

### Log de Inicialización

Todos los archivos migrados incluyen logs detallados:

```javascript
console.log('🚀 [filename.js] Starting initialization...')
console.log('✅ [filename.js] Feature initialized')
console.error('❌ [filename.js] Initialization failed:', error)
```

### Verificar Estado del DOM

```javascript
import { isDOMReady } from './js/shared/dom-ready.js'

if (isDOMReady()) {
  console.log('DOM is ready right now')
} else {
  console.log('DOM is still loading')
}
```

## 🧪 Testing

### Test Manual

1. Abre DevTools → Console
2. Verifica que veas los logs de inicialización en orden:

   ```
   🚀 [index.js] Starting initialization...
   ✅ [index.js] Icons initialized
   ✅ [index.js] Cart initialized
   ...
   ✅ [index.js] Page fully initialized
   ```

3. No deberías ver errores de "Cannot read property of null"

### Test Automatizado

Usa la página de prueba creada:

- `/test-page.html` - Verifica que todos los módulos se carguen correctamente

## 📚 Referencias

- **Estándar HTML Living**: [https://html.spec.whatwg.org/#dom-document-readystate](https://html.spec.whatwg.org/#dom-document-readystate)
- **MDN DOMContentLoaded**: [https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)
- **queueMicrotask**: [https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)

## 🎓 Best Practices

1. **Siempre usa `onDOMReady`** para cualquier código que acceda al DOM
2. **Try-catch en init()**: Envuelve la inicialización en try-catch para fail-fast
3. **Logging consistente**: Usa emojis y prefijos [filename.js] para debug fácil
4. **Validate inputs**: Verifica que los elementos existan antes de usarlos
5. **Microtasks para consistencia**: `queueMicrotask()` mantiene comportamiento async consistente

## 🔄 Migration Script

Para migrar archivos nuevos o existentes:

```bash
# Ejecutar script de migración automática
bash scripts/migrate-dom-ready.sh

# O manualmente:
# 1. Agregar import: import { onDOMReady } from '/js/shared/dom-ready.js'
# 2. Reemplazar: document.addEventListener('DOMContentLoaded', init)
#    con: onDOMReady(init)
```

## ✅ Checklist para Nuevos Archivos

Cuando crees un nuevo archivo JS para una página:

- [ ] Importar `onDOMReady` de `/js/shared/dom-ready.js`
- [ ] Envolver toda inicialización en función `init()`
- [ ] Agregar try-catch con fail-fast en `init()`
- [ ] Usar logs con emojis y prefijos
- [ ] Ejecutar `init()` con `onDOMReady(init)`
- [ ] No usar `async` en el `<script>` tag
- [ ] Validar que elementos existan antes de usarlos
- [ ] Agregar `document.documentElement.classList.add('loaded')` al final

## 🎯 Resultado

Con este patrón, garantizamos:

- ✅ **100% confiabilidad**: Scripts siempre se ejecutan después del DOM
- ✅ **Consistencia**: Mismo patrón en todo el codebase
- ✅ **Debugging fácil**: Logs claros y estructurados
- ✅ **CSP-compliant**: No inline scripts ni eval
- ✅ **Performance**: Uso eficiente de microtasks
- ✅ **Mantenibilidad**: Código predecible y fácil de entender

---

**Documentado por**: Claude Code
**Fecha**: 2025-10-12
**Versión**: 1.0.0
**Siguiendo**: CLAUDE.md principles (KISS, Fail-Fast, CSP-compliant)
