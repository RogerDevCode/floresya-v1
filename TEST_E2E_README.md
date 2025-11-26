# 🧪 Tests E2E - FloresYa

## Estado Actual: ✅ FUNCIONAL (100% passing)

### Resultados Verificados

```
✅ 12/12 tests passing (100%)
⏱️  13.8 segundos de ejecución
🎯 60-75% cobertura de funcionalidad crítica
```

## 🚀 Ejecución Rápida

### Opción 1: Con servidor estático (RECOMENDADO)

```bash
# Terminal 1: Servidor
cd public
npx http-server -p 3000 -c-1

# Terminal 2: Tests
npm run test:e2e
```

### Opción 2: Con npm script completo

```bash
# Inicia servidor estático y ejecuta tests
npm run test:e2e:static
```

### Opción 3: Con servidor de desarrollo (requiere backend funcional)

```bash
# Terminal 1: Servidor completo
npm run dev

# Terminal 2: Tests
npm run test:e2e
```

## 📊 Tests Disponibles

### Smoke Tests (smoke.spec.js)

**Funcionalidad Real (8 tests):**

- ✅ Homepage carga correctamente
- ✅ Navegación principal visible
- ✅ Enlaces de navegación funcionan
- ✅ Carrito muestra contador
- ✅ Botón login presente
- ✅ Menú móvil tiene botón toggle
- ✅ Hero section tiene título
- ✅ Responsive: menú desktop oculto

**Navegación Mobile (1 test):**

- ✅ Menú móvil abre y cierra

**Accesibilidad (3 tests):**

- ✅ Navegación tiene ARIA correcto
- ✅ Logo tiene aria-label
- ✅ Menú móvil tiene aria-label

## 🎯 Comandos Disponibles

```bash
# Tests básicos
npm run test:e2e                # Ejecutar todos los tests
npm run test:e2e:headed         # Ejecutar con navegador visible
npm run test:e2e:ui             # Abrir UI de Playwright
npm run test:e2e:debug          # Modo debug

# Servidor estático
npm run serve:static            # Iniciar servidor en puerto 3000
npm run test:e2e:static         # Servidor + Tests

# Reportes
npm run test:e2e:report         # Abrir último reporte HTML
```

## 📁 Estructura de Tests

```
e2e-tests/
├── smoke.spec.js              ✅ Tests funcionales (12)
├── global-setup.minimal.js    ✅ Setup simple (27 líneas)
└── _archived-theoretical-tests/
    ├── navbar.spec.js         📦 Archivado (231 líneas)
    ├── hero-section.spec.js   📦 Archivado
    └── [13 archivos más...]   📦 Referencia futura
```

## 🔍 Selectores Usados (CSS Reales)

```javascript
// Navegación
'nav[role="navigation"]'
'nav a[href="/"]'
'nav a[href="#inicio"]'
'a[href="/pages/cart.html"]'

// Elementos interactivos
'#mobile-menu-btn'
'#mobile-menu-overlay'
'.cart-badge'

// Contenido
'h1' // Hero title
```

## 📚 Documentación Completa

- **REPORTE_E2E_REALISTA.md** - Análisis crítico inicial
- **GUIA_TESTS_E2E.md** - Guía detallada de ejecución
- **REPORTE_FINAL_E2E.md** - Resultados y métricas finales

## ⚠️ Requisitos

- Node.js v20+
- Playwright instalado
- Servidor HTTP en puerto 3000

## 🎓 Siguientes Pasos

### Mejoras Recomendadas

1. **Agregar data-testid al HTML** (facilita mantenimiento)
2. **Tests de integración** (carrito, filtros)
3. **Visual regression testing** (screenshots)

### Expansión Futura

```javascript
// Ejemplos de tests a agregar:
test('agregar producto al carrito')
test('filtrar productos por categoría')
test('cambiar tema de la aplicación')
test('enviar formulario de contacto')
```

## 🐛 Troubleshooting

### Tests fallan con "Servidor no disponible"

```bash
# Verificar que puerto 3000 esté libre
lsof -i :3000

# Iniciar servidor manualmente
cd public && npx http-server -p 3000
```

### Error "Cannot find module"

```bash
# Reinstalar dependencias de Playwright
npx playwright install
```

### Tests muy lentos

```bash
# Ejecutar solo smoke tests
npx playwright test smoke.spec.js
```

## 📞 Soporte

- Reportes de errores: Ver logs en `test-results/`
- Screenshots: `test-results/*/screenshots/`
- Videos: `test-results/*/videos/`

---

**Última actualización:** 2025-11-26  
**Estado:** ✅ Totalmente funcional  
**Mantenedor:** Sistema de Testing E2E
