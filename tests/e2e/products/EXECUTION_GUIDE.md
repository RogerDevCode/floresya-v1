# Guía de Ejecución - Tests E2E Crear Producto

## 📋 Tests Creados

### ✅ Suite Completa (6 archivos, ~80+ tests)

1. **`create-product-form-validation.test.js`** (22 tests)
   - Validación de campos requeridos
   - Constraints de inputs
   - Estados de validación

2. **`create-product-basic-fields.test.js`** (18 tests)
   - Campos básicos (nombre, descripción, SKU, stock)
   - Caracteres especiales
   - Interacciones de campos

3. **`create-product-navigation.test.js`** (15 tests)
   - ✅ Bug corregido: Flecha retorna a #products
   - Cancelar y volver
   - Navegación del navegador

4. **`create-product-pricing.test.js`** (20 tests)
   - Precios USD
   - Conversión automática BCV → VES
   - Valores extremos

5. **`create-product-images.test.js`** (12 tests)
   - Descarga imágenes de Unsplash
   - Upload de 1-5 imágenes
   - Verificación WebP en 4 tamaños
   - Establecer imagen principal

6. **`create-product-extreme-values.test.js`** (15 tests)
   - Valores mínimos/máximos
   - Caracteres especiales
   - XSS prevention

---

## 🚀 Ejecutar Tests

### Pre-requisitos

```bash
# 1. Servidor corriendo
npm run dev

# 2. Base de datos con datos de prueba (opcional)
# 3. Variables de entorno configuradas
```

### Comandos de Ejecución

```bash
# ====================================
# TODOS LOS TESTS DE CREAR PRODUCTO
# ====================================
npx playwright test tests/e2e/products/

# ====================================
# TEST ESPECÍFICO
# ====================================

# Validación de formulario (22 tests)
npx playwright test tests/e2e/products/create-product-form-validation.test.js

# Campos básicos (18 tests)
npx playwright test tests/e2e/products/create-product-basic-fields.test.js

# Navegación (15 tests) - Incluye bug fix
npx playwright test tests/e2e/products/create-product-navigation.test.js

# Precios (20 tests)
npx playwright test tests/e2e/products/create-product-pricing.test.js

# Imágenes (12 tests) - Descarga de internet
npx playwright test tests/e2e/products/create-product-images.test.js

# Valores extremos (15 tests)
npx playwright test tests/e2e/products/create-product-extreme-values.test.js

# ====================================
# CON OPCIONES
# ====================================

# Solo Chrome (más rápido)
npx playwright test tests/e2e/products/ --project=chromium

# Con interfaz visual
npx playwright test tests/e2e/products/ --ui

# Con reporte HTML
npx playwright test tests/e2e/products/ --reporter=html

# Modo debug
npx playwright test tests/e2e/products/create-product-form-validation.test.js --debug

# Ver resultados
npx playwright show-report
```

---

## 📊 Cobertura de Tests

### Por Funcionalidad

| Funcionalidad                | Tests   | Estado                |
| ---------------------------- | ------- | --------------------- |
| **Validación de Formulario** | 22      | ✅ Completo           |
| **Campos Básicos**           | 18      | ✅ Completo           |
| **Navegación**               | 15      | ✅ Completo + Bug Fix |
| **Precios y BCV**            | 20      | ✅ Completo           |
| **Imágenes**                 | 12      | ✅ Con download       |
| **Valores Extremos**         | 15      | ✅ Completo           |
| **Total**                    | **102** | ✅                    |

### Por Tipo de Test

| Tipo           | Tests | Descripción                 |
| -------------- | ----- | --------------------------- |
| **Happy Path** | 25    | Casos exitosos normales     |
| **Validación** | 30    | Campos requeridos, formatos |
| **Edge Cases** | 25    | Valores límite, extremos    |
| **Errores**    | 12    | Manejo de errores           |
| **Navegación** | 10    | Flujos de navegación        |

---

## 🔧 Configuración de Tests de Imágenes

### Descarga Automática desde Unsplash

Los tests de imágenes descargan automáticamente fotos de ramos de flores desde Unsplash (royalty-free):

```javascript
// 5 imágenes de prueba pre-configuradas:
1. Rosas rojas
2. Ramo mixto
3. Orquídeas blancas
4. Girasoles
5. Tulipanes coloridos
```

**Ubicación**: `tests/e2e/products/temp-images/`

### Verificación en Supabase

Los tests verifican:

- ✅ Upload exitoso a Supabase Storage
- ✅ Conversión a formato WebP
- ✅ Generación de 4 tamaños:
  - `thumb` (150x150px)
  - `small` (300x300px)
  - `medium` (600x600px)
  - `large` (1200x1200px)

---

## 🐛 Bug Corregido

### Problema Original

Al hacer clic en la flecha de "Volver", navegaba incorrectamente al dashboard en vez de a la sección de productos.

### Solución Implementada

**Archivos modificados**:

1. `/public/pages/admin/create-product.html`
2. `/public/pages/admin/edit-product.html`

**Cambio**:

```html
<!-- ANTES -->
<a href="./dashboard.html" title="Volver al Dashboard">
  <!-- DESPUÉS -->
  <a href="./dashboard.html#products" title="Volver a Productos"></a
></a>
```

**Tests que verifican**:

- `create-product-navigation.test.js`:
  - "should navigate to products section when clicking back arrow"
  - "should have correct title on back button"
  - "should preserve URL hash when navigating back"

---

## 📝 Casos de Prueba Cubiertos

### Validación de Formulario

✅ Campos requeridos (nombre, precio, stock)  
✅ No acepta precios negativos  
✅ No acepta stock negativo  
✅ Acepta decimales en precio (0.01)  
✅ Solo enteros en stock (step="1")  
✅ Marcadores de campos requeridos (\*)  
✅ Tipos de input correctos  
✅ Placeholders informativos

### Campos Básicos

✅ Llenar nombre exitosamente  
✅ Llenar descripción (opcional)  
✅ Llenar SKU (opcional)  
✅ Llenar stock  
✅ Caracteres especiales en nombre  
✅ Múltiples líneas en descripción  
✅ Formatos de SKU variados  
✅ Toggles de featured/active

### Navegación

✅ Botón volver visible  
✅ Navega a dashboard#products  
✅ Título correcto "Volver a Productos"  
✅ Icono de flecha visible  
✅ Confirmación si hay cambios sin guardar  
✅ Sin confirmación si form vacío  
✅ Manejo de browser back/forward

### Precios

✅ Precio USD válido  
✅ Precio mínimo 0.01  
✅ Precio cero  
✅ Precios grandes (9999.99)  
✅ 1-2 decimales  
✅ Conversión automática BCV → VES  
✅ Actualización VES en cambios USD  
✅ Override manual de VES

### Imágenes

✅ Área de upload visible  
✅ Upload imagen única  
✅ Thumbnail visible  
✅ Primera imagen = principal  
✅ Eliminar imagen  
✅ Upload múltiples (máx 5)  
✅ Límite de 5 imágenes  
✅ Reordenar imágenes  
✅ Cambiar imagen principal  
✅ Validación JPG/PNG  
✅ Info de tamaño de archivo

### Valores Extremos

✅ Nombre 1 carácter  
✅ Nombre 500 caracteres  
✅ Caracteres especiales  
✅ Emojis en nombre  
✅ Múltiples espacios  
✅ HTML tags (no render)  
✅ Precio 0.01  
✅ Precio 99999.99  
✅ Stock 0  
✅ Stock 999999  
✅ Descripción vacía  
✅ Descripción 5000 caracteres  
✅ Unicode/multilingual  
✅ XSS prevention

---

## 🎯 Ejecución Recomendada

### Para Desarrollo

```bash
# Test rápido (solo validación)
npx playwright test tests/e2e/products/create-product-form-validation.test.js --project=chromium

# Test completo sin imágenes (más rápido)
npx playwright test tests/e2e/products/ --project=chromium --grep-invert "images"
```

### Para CI/CD

```bash
# Todos los tests, todos los navegadores
npx playwright test tests/e2e/products/ --reporter=html,json
```

### Para Debug

```bash
# Modo debug con UI
npx playwright test tests/e2e/products/create-product-form-validation.test.js --debug --project=chromium
```

---

## 📈 Resultados Esperados

### Primera Ejecución

- ⏱️ Duración: ~5-7 minutos (con descarga de imágenes)
- 📊 Tests pasando: ~85-95%
- ⚠️ Algunos tests pueden fallar si:
  - Mock auth no está configurado
  - Supabase Storage no accesible
  - BCV rate no cargado

### Ejecuciones Subsecuentes

- ⏱️ Duración: ~2-3 minutos (imágenes en cache)
- 📊 Tests pasando: ~90-100%

---

## 🔍 Debugging

### Ver screenshots de fallos

```bash
# Ubicación: test-results/
ls test-results/*/
```

### Ver videos de ejecución

```bash
# Ubicación: test-results/
open test-results/*/*.webm
```

### Ver trace de Playwright

```bash
npx playwright show-trace test-results/*/trace.zip
```

---

## ✅ Checklist de Verificación

Antes de ejecutar tests:

- [ ] Servidor corriendo en http://localhost:3000
- [ ] Base de datos accesible
- [ ] Supabase Storage accesible (para tests de imágenes)
- [ ] Variables de entorno configuradas
- [ ] Playwright instalado: `npx playwright install`

---

## 📚 Documentación Adicional

- Playwright Docs: https://playwright.dev
- Test Patterns: `/tests/e2e/products/README.md`
- API Docs: `/api/docs/openapi-spec.yaml`

---

**¡Suite de tests completa y lista para ejecutar!** 🎉
