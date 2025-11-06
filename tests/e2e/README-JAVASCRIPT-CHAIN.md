# JavaScript Chain Validation Test Suite

Este conjunto de tests E2E verifica que todos los scripts JavaScript se cargan correctamente **después de que el DOM esté totalmente cargado**, sin enlaces rotos, y siguiendo la cadena completa de dependencias sin errores.

## 📋 Tests Incluidos

### 1. **javascript-loading-chain.test.js**

Verifica la cadena completa de carga de JavaScript:

**Verificaciones principales:**

- ✅ Scripts cargan sin errores 404
- ✅ Scripts se ejecutan después de DOMContentLoaded
- ✅ Orden correcto de carga de scripts
- ✅ No hay dependencias circulares
- ✅ Manejo graceful de fallos de carga
- ✅ Preloads de scripts críticos
- ✅ Verificación de integrity checks
- ✅ No hay scripts duplicados
- ✅ Scripts inline se ejecutan sin errores
- ✅ Scripts ES6 modules cargan correctamente
- ✅ Scripts cargan en orden óptimo para rendimiento

**Tests específicos:**

- Carga de archivos JS sin 404
- Ejecución después de DOMContentLoaded
- Orden correcto de carga
- Detección de dependencias circulares
- Manejo de fallos graceful
- Verificación de preloads
- Scripts con integrity
- Scripts duplicados
- Scripts inline
- Scripts de tipo module
- Óptimo orden de carga para rendimiento

### 2. **javascript-chain-tracker.test.js**

Rastrea la cadena completa de dependencias:

**Verificaciones principales:**

- ✅ Mapeo completo de cadena de dependencias
- ✅ Todos los scripts cargan con status 200
- ✅ Tracking de timing de carga de scripts
- ✅ Detección y reporte de errores en cadena
- ✅ Verificación de orden de ejecución
- ✅ Manejo de carga dinámica de scripts
- ✅ Validación de ES6 modules
- ✅ Reporte completo de estado de cadena

**Funcionalidades:**

- Rastreo recursivo de dependencias
- Verificación de status HTTP 200
- Métricas de rendimiento (startTime, duration)
- Detección de errores de sintaxis y referencia
- Tracking de orden de ejecución
- Instrumentación de eventos DOM
- Detección de loaders dinámicos
- Validación de módulos ES6

### 3. **javascript-dom-ready.test.js**

Verifica timing específico de carga vs DOM:

**Verificaciones principales:**

- ✅ Scripts cargan DESPUÉS del DOM
- ✅ Scripts no bloquean renderización
- ✅ Uso correcto de atributos defer/async
- ✅ Timing de ejecución de scripts inline
- ✅ DOM es interactivo antes de ejecución de scripts
- ✅ Reporte completo de cadena DOM ready

**Métricas clave:**

- Tiempo hasta DOM Interactive
- Tiempo hasta DOMContentLoaded
- Tiempo hasta First Contentful Paint
- Scripts antes/después de DOMContentLoaded
- Scripts synchronous vs async/defer
- Orden de ejecución de scripts inline
- Accesos al DOM (queries)
- Eventos completos de timing de navegación

## 🚀 Cómo Ejecutar

### Opción 1: Runner personalizado (recomendado)

```bash
node scripts/run-js-chain-validation.js
```

Este comando:

- Ejecuta todos los tests de JavaScript chain
- Genera reporte HTML visual (`javascript-chain-validation-report.html`)
- Genera reporte de consola (`javascript-chain-validation-console.txt`)
- Muestra progreso en tiempo real
- Calcula tasa de éxito

### Opción 2: Ejecutar tests específicos

```bash
# Solo tests de carga de cadena
npx playwright test tests/e2e/javascript-loading-chain.test.js

# Solo tracker de cadena
npx playwright test tests/e2e/javascript-chain-tracker.test.js

# Solo tests de DOM ready
npx playwright test tests/e2e/javascript-dom-ready.test.js
```

### Opción 3: Todos los tests juntos

```bash
npx playwright test tests/e2e/javascript-*.test.js
```

### Opción 4: Modo UI

```bash
npx playwright test tests/e2e/javascript-*.test.js --ui
```

### Opción 5: Con reporter específico

```bash
npx playwright test tests/e2e/javascript-*.test.js --reporter=html
```

## 📊 Reportes

### HTML Report

Ubicación: `javascript-chain-validation-report.html`

Incluye:

- ✅ Total de tests pasados/fallidos
- 📊 Tasa de éxito visual
- 📄 Lista detallada de cada test
- 🔍 Checkmarks de verificaciones realizadas
- 🎨 Interfaz visual profesional

### Console Report

Ubicación: `javascript-chain-validation-console.txt`

Incluye:

- Resumen de resultados
- Detalles de cada test
- Lista de validaciones realizadas
- Recomendaciones

### Playwright Report

```bash
npx playwright show-report
```

Muestra:

- Screenshots de fallos
- Videos de ejecución
- Trazas de errores
- Consola del navegador
- Detalles de red

## 📈 Métricas Reportadas

### JavaScript Loading Chain

- Número total de scripts detectados
- Scripts con status 404/200
- Scripts antes/después de DOMContentLoaded
- Dependencias circulares encontradas
- Errores de sintaxis
- Scripts con defer/async/module

### Chain Tracker

- Profundidad de cadena de dependencias
- Tiempo de carga (startTime, duration, endTime)
- Scripts con errores de carga
- Orden de ejecución registrado
- Scripts cargados dinámicamente
- ES6 modules detectados

### DOM Ready

- Tiempo hasta DOM Interactive
- Tiempo hasta DOMContentLoaded
- Tiempo hasta First Contentful Paint
- Scripts bloqueando renderización
- Atributos defer/async utilizados
- Scripts inline ejecutados
- DOM queries realizadas

## ✅ Criterios de Éxito

Un test pasa si:

- ✅ Todos los scripts cargan con status < 400
- ✅ Scripts se ejecutan después de DOMContentLoaded
- ✅ No hay dependencias circulares
- ✅ No hay errores de sintaxis o referencia
- ✅ Scripts no bloquean First Contentful Paint
- ✅ Uso apropiado de defer/async
- ✅ Scripts inline se ejecutan sin errores
- ✅ ES6 modules cargan correctamente
- ✅ No hay scripts duplicados

## ❌ Criterios de Fallo

Un test falla si:

- ❌ Scripts con status 404/500
- ❌ Errores de sintaxis JavaScript
- ❌ Referencias a variables no definidas
- ❌ Dependencias circulares
- ❌ Scripts bloquean renderización (>500ms)
- ❌ Scripts ejecutan antes del DOM
- ❌ Módulos ES6 no cargan
- ❌ Scripts duplicados detectados

## 🛠️ Solución de Problemas

### Error: "Script 404"

**Problema:** Archivo JavaScript no encontrado
**Solución:**

```bash
# Verificar que el archivo existe
ls -la public/js/

# Verificar ruta en HTML
grep "script src" public/index.html

# Corregir ruta o subir archivo faltante
```

### Error: "Circular dependency"

**Problema:** Script A requiere Script B, Script B requiere Script A
**Solución:**

- Refactorizar dependencias
- Usar módulos ES6 con import/export
- Verificar build process

### Error: "Scripts blocking render"

**Problema:** Scripts síncronos bloquean First Contentful Paint
**Solución:**

```html
<!-- Usar defer para scripts que necesitan orden -->
<script src="vendor.js" defer></script>
<script src="app.js" defer></script>

<!-- O async para scripts independientes -->
<script src="analytics.js" async></script>
```

### Error: "SyntaxError"

**Problema:** Error de sintaxis en JavaScript
**Solución:**

```bash
# Verificar sintaxis con Node.js
node -c public/js/archivo.js

# O usar linter
npx eslint public/js/archivo.js
```

### Error: "Module not loading"

**Problema:** ES6 module no carga
**Solución:**

```html
<!-- Verificar tipo module -->
<script type="module" src="module.js"></script>

<!-- Verificar CORS headers si es necesario -->
<!-- Access-Control-Allow-Origin: * -->
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Verificar cadena completa

```javascript
// En el navegador
const scripts = Array.from(document.querySelectorAll('script[src]'))
console.log('Scripts detectados:', scripts.length)
```

### Ejemplo 2: Rastrear dependencias

```javascript
// Los tests automáticamente rastrean:
require('./module-a.js')
import { func } from './module-b.js'
```

### Ejemplo 3: Verificar timing

```javascript
// Los tests miden:
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Ready!')
})
```

## 🔄 Integración CI/CD

### GitHub Actions

```yaml
- name: Run JavaScript Chain Validation
  run: |
    npm install
    npx playwright install
    node scripts/run-js-chain-validation.js
    # Fallar si algún test falla
    if [ $? -ne 0 ]; then exit 1; fi

- name: Upload Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: js-chain-validation-report
    path: javascript-chain-validation-report.html
```

### Jenkins

```groovy
pipeline {
    agent any
    stages {
        stage('JS Chain Validation') {
            steps {
                sh 'node scripts/run-js-chain-validation.js'
            }
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'javascript-chain-validation-report.html',
                reportName: 'JS Chain Report'
            ])
        }
    }
}
```

## 📊 Dashboard de Métricas

Métricas clave a monitorear:

- **Tasa de éxito:** Objetivo 100%
- **Scripts con 404:** Objetivo 0
- **Dependencias circulares:** Objetivo 0
- **Tiempo de bloqueo:** < 500ms
- **Scripts async/defer:** > 80%

## 🎯 Objetivos

- [x] Verificar carga sin errores de todos los scripts
- [x] Confirmar ejecución después del DOM
- [x] Detectar dependencias circulares
- [x] Validar orden de carga
- [x] Verificar uso de defer/async
- [x] Rastrear cadena completa de dependencias
- [x] Medir timing de carga
- [x] Detectar scripts bloqueantes
- [x] Validar ES6 modules
- [x] Generar reportes visuales

## 📞 Soporte

Si encuentras fallos:

1. **Verificar sintaxis:**

   ```bash
   node -c public/js/archivo.js
   ```

2. **Revisar reporte HTML:**

   ```bash
   open javascript-chain-validation-report.html
   ```

3. **Ejecutar en modo UI:**

   ```bash
   npx playwright test --ui
   ```

4. **Revisar logs de consola:**
   ```bash
   cat javascript-chain-validation-console.txt
   ```

## 🔄 Actualizaciones

### v1.0.0 (Actual)

- Tests completos de carga de scripts
- Rastreo de dependencias
- Verificación DOM ready
- Reportes visuales
- Integración CI/CD

### Próximas mejoras (v1.1.0)

- [ ] Verificación de source maps
- [ ] Detección de memory leaks
- [ ] Cobertura de tests de scripts
- [ ] Benchmark de rendimiento
- [ ] Integración con bundles (webpack, etc.)

---

**Nota:** Estos tests son complementarios a los tests de DOM y validan específicamente la cadena de carga y ejecución de JavaScript.
