# Gestión de Ocasiones - Auto-Generación y Popularidad

## 📋 Resumen

Sistema KISS para gestión de ocasiones con auto-generación de campos y ordenamiento por popularidad.

## ✨ Características Implementadas

### 1. **Campos Auto-Generados** (No Visibles)

#### Slug

- **Generado automáticamente** del nombre de la ocasión
- Normalización de texto (sin acentos, lowercase, URL-safe)
- Ejemplo: "San Valentín" → "san-valentin"
- Actualización en tiempo real mientras escribes el nombre

#### Icono

- **Asignado aleatoriamente** de biblioteca Lucide local
- Evita colisiones con ocasiones existentes
- 22 iconos disponibles: heart, gift, cake, flower, sparkles, etc.
- Solo se asigna para **nuevas ocasiones** (no cambia al editar)

#### Orden de Visualización

- **Calculado automáticamente** basado en popularidad
- Ocasiones más seleccionadas aparecen primero
- Tracking en localStorage (KISS approach)
- Fallback alfabético cuando no hay datos de popularidad

### 2. **Sistema de Popularidad KISS**

#### Almacenamiento

```javascript
// localStorage: 'floresya_occasion_popularity'
{
  "16": 45,  // Cumpleaños: 45 veces seleccionado
  "17": 32,  // Aniversario: 32 veces
  "18": 89   // San Valentín: 89 veces (más popular)
}
```

#### Ordenamiento

1. **Primario**: Por número de selecciones (descendente)
2. **Secundario**: Alfabético (cuando empatan en popularidad)

#### Tracking

- Se incrementa cuando el usuario selecciona una ocasión en dropdowns
- Persiste en navegador (localStorage)
- No requiere cambios en backend

### 3. **Botón Cancelar y Flecha**

#### Detección de Cambios

- Compara valores actuales vs originales
- Detecta cambios en: nombre, descripción, color, estado activo
- Solo pregunta si hay cambios sin guardar

#### Confirmación

```
¿Descartar cambios?

Has realizado cambios en el formulario. Si continúas, los cambios se perderán.
```

#### Navegación

- **Cancelar**: Resetea formulario
- **Flecha (←)**: Retorna al dashboard con confirmación si hay cambios

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`/public/js/shared/occasion-helpers.js`**
   - `generateSlug(name)` - Genera slug desde nombre
   - `getRandomIcon(existingOccasions)` - Icono aleatorio sin colisiones
   - `getRandomColor()` - Color aleatorio para ocasión

2. **`/public/js/shared/occasion-popularity.js`**
   - `trackOccasionSelection(id)` - Incrementa contador
   - `sortByPopularity(occasions)` - Ordena por popularidad
   - `getDisplayOrder(id, occasions)` - Calcula orden
   - `resetPopularityData()` - Limpia datos (admin)

### Archivos Modificados

3. **`/public/pages/admin/occasions.html`**
   - Campos slug, icon, display_order ocultos (`<input type="hidden">`)
   - Flecha de retorno como `<button>` con ID
   - Layout simplificado (solo 3 campos visibles)

4. **`/public/pages/admin/occasions.js`**
   - Imports de utilidades helper y popularity
   - Auto-generación de slug en tiempo real
   - Auto-asignación de icono para nuevas ocasiones
   - Detección de cambios para cancelar/flecha
   - Ordenamiento por popularidad en tabla
   - Funciones: `hasFormChanges()`, `handleCancel()`, `captureOriginalValues()`

## 🎯 Uso

### Crear Nueva Ocasión

1. Click en "Nueva Ocasión"
2. **Escribir solo**: Nombre, Descripción (opcional), Color
3. Slug e icono se generan automáticamente
4. Guardar

**Ejemplo**:

```
Nombre: Día de la Madre
Descripción: Honra a mamá en su día especial
Color: #8b5cf6

→ Auto-generado:
   Slug: dia-de-la-madre
   Icon: flower (aleatorio)
   Display Order: 0 (nueva)
```

### Editar Ocasión

1. Click en fila de la tabla
2. Modificar campos visibles
3. Slug NO cambia (mantiene el original)
4. Icono NO cambia (mantiene el original)
5. Cancelar con confirmación si hay cambios

### Ver Ocasiones Ordenadas

- Tabla se ordena automáticamente
- **Más populares primero** (basado en selecciones)
- Alfabético cuando no hay datos
- Aplica a filtros: Todas, Activas, Inactivas

## 🔧 Integración Futura

### En Dropdowns de Productos

Para trackear selecciones en formularios de productos:

```javascript
// En create-product.js / edit-product.js
import { trackOccasionSelection } from '../../js/shared/occasion-popularity.js'

// Al seleccionar ocasión en checkbox/dropdown
occasionCheckbox.addEventListener('change', e => {
  if (e.target.checked) {
    const occasionId = parseInt(e.target.value)
    trackOccasionSelection(occasionId)
  }
})
```

### Mostrar Ocasiones Ordenadas

```javascript
import { sortByPopularity } from '../../js/shared/occasion-popularity.js'

async function loadOccasionsDropdown() {
  let occasions = await api.getAllOccasions()
  occasions = sortByPopularity(occasions) // Más populares primero

  // Renderizar dropdown...
}
```

## 📊 Ventajas del Approach KISS

### ✅ Pros

- **Sin cambios en backend** - Solo localStorage
- **Rápido** - No requiere API calls
- **Simple** - Lógica clara y directa
- **Offline** - Funciona sin conexión
- **User-specific** - Cada navegador su propia popularidad

### ⚠️ Limitaciones

- Datos por navegador (no sincroniza entre devices)
- Se pierde al limpiar localStorage
- No es global (cada usuario ve su propia popularidad)

### 💡 Alternativa (Futuro)

Si necesitas popularidad global:

- Agregar campo `selection_count` en DB
- Endpoint `POST /api/occasions/:id/track`
- Incrementar en backend
- Ordenar por `selection_count DESC`

Pero **KISS es suficiente** para mayoría de casos.

## 🧪 Testing Manual

### Test 1: Auto-Generación de Slug

1. Nueva Ocasión
2. Escribir "Día del Padre"
3. **Verificar**: Campo oculto slug tiene "dia-del-padre"

### Test 2: Icono Aleatorio

1. Nueva Ocasión
2. Guardar sin llenar icono
3. **Verificar**: En edición, tiene icono asignado
4. Crear otra ocasión
5. **Verificar**: Icono diferente (si posible)

### Test 3: Cancelar con Cambios

1. Editar ocasión existente
2. Cambiar nombre
3. Click Cancelar
4. **Verificar**: Muestra confirmación
5. Cancelar confirmación
6. **Verificar**: Datos NO se perdieron

### Test 4: Flecha con Cambios

1. Nueva ocasión
2. Escribir nombre
3. Click flecha (←)
4. **Verificar**: Muestra confirmación
5. Aceptar
6. **Verificar**: Retorna a dashboard

### Test 5: Popularidad

1. Seleccionar ocasión en producto (cuando se integre)
2. Volver a gestión de ocasiones
3. **Verificar**: Ocasión seleccionada subió en la tabla

## 🎨 UI/UX Improvements

### Campos Visibles (Simplificados)

- ✅ Nombre \*
- ✅ Descripción
- ✅ Color
- ✅ Activa (checkbox)

### Campos Ocultos (Auto)

- 🤖 Slug
- 🤖 Icono
- 🤖 Orden

### Menos Clutter = Mejor UX

- Formulario más limpio
- Menos decisiones para el usuario
- Menos errores potenciales
- Más rápido de completar

## 📖 Referencias

- **Lucide Icons**: https://lucide.dev/icons/
- **localStorage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **String.normalize()**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize

## 🚀 Próximos Pasos

1. ✅ Implementación base completa
2. ⏳ Integrar tracking en formularios de productos
3. ⏳ Testing E2E de ocasiones
4. ⏳ Considerar migrar a DB si se necesita popularidad global

---

**Autor**: FloresYa Dev Team  
**Fecha**: 2025-01-15  
**Versión**: 1.0.0
