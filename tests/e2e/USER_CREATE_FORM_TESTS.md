# User Create Form E2E Tests

## 📋 Descripción

Tests end-to-end para el formulario de creación/edición de usuarios en el panel de administración de FloresYa.

Siguiendo los principios de **CLAUDE.md**:

- ✅ **KISS**: Un test por funcionalidad específica
- ✅ **SOLID**: Single Responsibility - cada test se enfoca en un comportamiento único
- ✅ **Fail-fast**: Assertions claras con mensajes descriptivos

## 🎯 Cobertura de Tests

### 1. Modal Behavior (Comportamiento del Modal)

- ✅ Apertura del modal al hacer clic en "Nuevo Usuario"
- ✅ Cierre del modal con botón X sin cambios
- ✅ Cierre del modal con botón "Cancelar" sin cambios

### 2. Cancel with Unsaved Changes (Cancelar con Cambios sin Guardar)

- ✅ Confirmación al cerrar con X cuando hay cambios sin guardar
- ✅ Confirmación al cancelar cuando hay cambios sin guardar
- ✅ Cierre del modal al confirmar descarte de cambios

### 3. Field Validation (Validación de Campos)

- ✅ Validación de campos requeridos al enviar formulario vacío
- ✅ Validación de formato de email
- ✅ Validación de longitud mínima de contraseña (8 caracteres)
- ✅ Toggle de visibilidad de contraseña

### 4. Form Interactions (Interacciones del Formulario)

- ✅ Llenado correcto de todos los campos
- ✅ Selección de diferentes roles de usuario
- ✅ Campo de teléfono es opcional

### 5. Form Submission (Envío del Formulario)

- ✅ Estado de carga al enviar formulario
- ✅ Envío exitoso y cierre del modal
- ✅ Manejo de errores de API

### 6. Accessibility (Accesibilidad)

- ✅ Labels apropiados y atributos ARIA
- ✅ Navegación por teclado

## 🚀 Cómo Ejecutar los Tests

### Pre-requisitos

1. **Iniciar el servidor de desarrollo:**

```bash
npm run dev
```

El servidor debe estar corriendo en `http://localhost:3000`

2. **Asegurarse de que Playwright está instalado:**

```bash
npx playwright install
```

### Ejecutar Tests

#### Todos los tests del formulario de usuario:

```bash
npx playwright test user-create-form.test.js
```

#### Con reporte HTML:

```bash
npx playwright test user-create-form.test.js --reporter=html
```

#### Solo en Chrome:

```bash
npx playwright test user-create-form.test.js --project=chromium
```

#### En modo UI interactivo:

```bash
npx playwright test user-create-form.test.js --ui
```

#### Solo un grupo específico de tests:

```bash
# Solo tests de validación
npx playwright test user-create-form.test.js -g "Field Validation"

# Solo tests de modal behavior
npx playwright test user-create-form.test.js -g "Modal Behavior"

# Solo tests de cancel con cambios
npx playwright test user-create-form.test.js -g "Cancel with Unsaved Changes"
```

#### En modo debug:

```bash
npx playwright test user-create-form.test.js --debug
```

## 📝 Estructura de los Tests

Los tests están organizados en **6 grupos (describe blocks)**, siguiendo el principio de **Single Responsibility**:

```javascript
test.describe('User Create Form - Modal Behavior', () => {
  // Tests de apertura y cierre básico del modal
})

test.describe('User Create Form - Cancel with Unsaved Changes', () => {
  // Tests de confirmación de descarte de cambios
})

test.describe('User Create Form - Field Validation', () => {
  // Tests de validación de campos
})

test.describe('User Create Form - Form Interactions', () => {
  // Tests de interacción con campos
})

test.describe('User Create Form - Form Submission', () => {
  // Tests de envío del formulario
})

test.describe('User Create Form - Accessibility', () => {
  // Tests de accesibilidad
})
```

## 🔧 Funcionalidad Implementada

Como parte de estos tests, se implementó en [dashboard.js:1935-1988](../../public/pages/admin/dashboard.js#L1935-L1988):

### `hasUnsavedUserFormChanges()`

Verifica si el formulario tiene cambios sin guardar.

```javascript
/**
 * Check if user form has unsaved changes
 * @returns {boolean} True if form has changes
 */
function hasUnsavedUserFormChanges() {
  const email = document.getElementById('user-email')?.value || ''
  const fullName = document.getElementById('user-full-name')?.value || ''
  const phone = document.getElementById('user-phone')?.value || ''
  const role = document.getElementById('user-role')?.value || ''
  const password = document.getElementById('user-password')?.value || ''

  return (
    email.trim() !== '' ||
    fullName.trim() !== '' ||
    phone.trim() !== '' ||
    role !== '' ||
    password !== ''
  )
}
```

### `closeUserModal()` - Actualizada

Ahora incluye confirmación antes de cerrar si hay cambios sin guardar.

```javascript
/**
 * Close user modal with unsaved changes confirmation
 */
function closeUserModal() {
  // Check for unsaved changes
  if (hasUnsavedUserFormChanges()) {
    const confirmDiscard = window.confirm(
      '¿Estás seguro de que quieres cerrar? Hay cambios sin guardar que se perderán.'
    )
    if (!confirmDiscard) {
      return // Usuario canceló, mantener modal abierto
    }
  }

  // Reset form y cerrar modal
  const form = document.getElementById('user-form')
  if (form) form.reset()

  const modal = document.getElementById('user-modal')
  if (modal) modal.classList.add('hidden')

  currentEditingUser = null
}
```

## ✅ Verificación de Comportamiento

### Botón Cancel sin cambios:

- ❌ **Antes**: Cerraba sin verificar cambios
- ✅ **Ahora**: Cierra inmediatamente si no hay cambios

### Botón Cancel con cambios:

- ❌ **Antes**: Cerraba y perdía datos
- ✅ **Ahora**: Muestra confirmación y permite cancelar el cierre

### Botón X sin cambios:

- ❌ **Antes**: Cerraba sin verificar cambios
- ✅ **Ahora**: Cierra inmediatamente si no hay cambios

### Botón X con cambios:

- ❌ **Antes**: Cerraba y perdía datos
- ✅ **Ahora**: Muestra confirmación y permite cancelar el cierre

## 🎨 Principios Seguidos

### KISS (Keep It Simple, Stupid)

- Un test por funcionalidad específica
- Tests fáciles de leer y mantener
- Sin complejidad innecesaria

### SOLID

- **Single Responsibility**: Cada test verifica un solo comportamiento
- Helpers reutilizables (`navigateToUsersView`, `openCreateUserModal`, `fillUserForm`)
- Separación clara de concerns

### Fail-Fast

- Assertions claras e inmediatas
- Mensajes de error descriptivos
- Try-catch con logs y re-throw

## 📊 Resultados Esperados

Al ejecutar los tests con el servidor corriendo:

```
✓ 18 tests across 6 suites (chromium + firefox + webkit)
  ✓ Modal Behavior (3 tests)
  ✓ Cancel with Unsaved Changes (3 tests)
  ✓ Field Validation (4 tests)
  ✓ Form Interactions (3 tests)
  ✓ Form Submission (3 tests)
  ✓ Accessibility (2 tests)
```

## 🐛 Troubleshooting

### Error: `net::ERR_CONNECTION_REFUSED`

**Solución**: Asegúrate de que el servidor esté corriendo en `http://localhost:3000`

```bash
npm run dev
```

### Tests fallan por timeout

**Solución**: Aumenta el timeout en `playwright.config.js`

```javascript
use: {
  actionTimeout: 15000,
  navigationTimeout: 30000
}
```

### Modal no se encuentra

**Solución**: Verifica que estés navegando correctamente a la vista de usuarios:

```javascript
await navigateToUsersView(page)
await openCreateUserModal(page)
```

## 📚 Referencias

- [Playwright Documentation](https://playwright.dev/)
- [CLAUDE.md](../../CLAUDE.md) - Principios del proyecto
- [Dashboard HTML](../../public/pages/admin/dashboard.html#L961-L1102) - Código del modal
- [Dashboard JS](../../public/pages/admin/dashboard.js#L1789-L2000) - Lógica del modal
