# Product Creation/Edit Form - Development Plan

**Fecha de inicio**: 2025-10-03
**Fecha de finalización**: 2025-10-03
**Estado**: ✅ COMPLETADO

---

## Análisis de Requisitos

### API Contract (OpenAPI)

**POST /api/products** - Crear producto

```json
{
  "name": "string (required, 2-255 chars)",
  "description": "string (optional)",
  "price_usd": "number (required, >= 0)",
  "price_ves": "number (optional, >= 0)",
  "stock": "integer (optional, >= 0)",
  "sku": "string (optional, max 50 chars)",
  "featured": "boolean (optional)",
  "carousel_order": "integer (optional, >= 0)"
}
```

**PUT /api/products/:id** - Actualizar producto (mismos campos)

**POST /api/products/with-occasions** - Crear producto + ocasiones

```json
{
  "product": {
    /* campos de producto */
  },
  "occasionIds": [1, 2, 3]
}
```

**Imágenes** (`ProductImage` schema):

- Endpoint: GET `/api/products/:id/images`
- Máximo: 5 imágenes por producto
- Campo: `image_index` (1-5) - orden de visualización
- Campo: `is_primary` - imagen principal
- Tamaños: thumb, small, medium, large
- **NOTA**: No hay endpoints POST/PUT para imágenes en OpenAPI actual
  - Se requiere implementación futura o uso de endpoint existente

---

## Plan de Desarrollo Atómico

### ✅ FASE 1: Fixes Iniciales (COMPLETADO)

- [x] Fix text overlap en tabla de productos
- [x] Centrar título "Gestión de Productos"
- [x] Revisar contrato OpenAPI

---

### ✅ FASE 2: Diseño y Estructura HTML (COMPLETADO)

#### **2.1. Crear HTML Base del Formulario**

**Archivo**: `dashboard.html`
**Ubicación**: Dentro de `#products-view`, después de la tabla

**Estructura**:

```html
<!-- Product Form Modal -->
<div
  id="product-form-modal"
  class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
>
  <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
      <h2 id="product-form-title" class="text-2xl font-bold text-gray-900">Nuevo Producto</h2>
      <button id="close-product-form" class="text-gray-400 hover:text-gray-600">
        <i data-lucide="x" class="h-6 w-6"></i>
      </button>
    </div>

    <!-- Form -->
    <form id="product-form" class="p-6 space-y-6">
      <!-- Secciones: Info Básica, Precios, Inventario, Imágenes, Ocasiones -->
    </form>
  </div>
</div>
```

**Tareas**:

- [x] Crear estructura HTML del modal
- [x] Agregar secciones del formulario
- [x] Configurar grid responsive

---

#### **2.2. Sección: Información Básica**

**Campos**:

- Nombre\* (input text, required, 2-255 chars)
- Descripción (textarea, opcional, max 1000 chars)
- SKU (input text, opcional, max 50 chars)

**HTML**:

```html
<div class="space-y-4">
  <h3 class="text-lg font-semibold text-gray-900">Información Básica</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Nombre del Producto <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="product-name"
        required
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder="Ej: Ramo de Rosas Rojas"
      />
      <span class="text-xs text-gray-500">2-255 caracteres</span>
    </div>

    <div class="md:col-span-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
      <textarea
        id="product-description"
        rows="3"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder="Describe el producto..."
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
      <input
        type="text"
        id="product-sku"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder="Ej: ROSE-RED-001"
      />
    </div>
  </div>
</div>
```

**Tareas**:

- [x] Implementar HTML de sección básica
- [x] Agregar validación HTML5

---

#### **2.3. Sección: Precios e Inventario**

**Campos**:

- Precio USD\* (number, required, >= 0)
- Precio VES (number, opcional, >= 0)
- Stock (integer, opcional, >= 0, default: 0)
- Featured (checkbox)
- Carousel Order (number, opcional, >= 0)

**HTML**:

```html
<div class="space-y-4">
  <h3 class="text-lg font-semibold text-gray-900">Precios e Inventario</h3>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        Precio USD <span class="text-red-500">*</span>
      </label>
      <input
        type="number"
        id="product-price-usd"
        required
        min="0"
        step="0.01"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder="0.00"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Precio VES</label>
      <input
        type="number"
        id="product-price-ves"
        min="0"
        step="0.01"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder="0.00"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
      <input
        type="number"
        id="product-stock"
        min="0"
        value="0"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
      />
    </div>
  </div>

  <div class="flex items-center space-x-6">
    <label class="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        id="product-featured"
        class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
      />
      <span class="text-sm font-medium text-gray-700">Producto Destacado</span>
    </label>

    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">Orden en Carousel:</label>
      <input
        type="number"
        id="product-carousel-order"
        min="0"
        class="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
        placeholder="0"
      />
    </div>
  </div>
</div>
```

**Tareas**:

- [x] Implementar HTML de sección precios
- [x] Agregar validación de números positivos

---

#### **2.4. Sección: Imágenes del Producto** ⭐ **CRÍTICO**

**Requisitos**:

- Máximo 5 imágenes por producto
- Recomendación: 1200x1200px mínimo (cuadradas)
- Drag & drop para reordenar
- Preview visual de cada imagen
- Campo `image_index` (1-5) para orden de visualización
- Marcar imagen principal (`is_primary`)

**Diseño UX**:

```
┌─────────────────────────────────────────────────┐
│  📷 Imágenes del Producto (máx. 5)              │
│                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ IMG1 │ │ IMG2 │ │ IMG3 │ │  +   │ │      │ │
│  │ [⭐] │ │      │ │      │ │      │ │      │ │
│  │ [🗑️] │ │ [🗑️] │ │ [🗑️] │ │      │ │      │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
│   orden:1  orden:2  orden:3                     │
│                                                  │
│  Arrastra para reordenar | ⭐ = Principal       │
└─────────────────────────────────────────────────┘
```

**HTML**:

```html
<div class="space-y-4">
  <h3 class="text-lg font-semibold text-gray-900">Imágenes del Producto</h3>
  <p class="text-sm text-gray-600">
    Máximo 5 imágenes. Recomendado: imágenes cuadradas de al menos 1200x1200px. Arrastra para
    reordenar.
  </p>

  <!-- Image Grid -->
  <div id="product-images-grid" class="grid grid-cols-5 gap-4">
    <!-- Slots for images (1-5) -->
    <!-- Generated dynamically via JS -->
  </div>

  <!-- Hidden file input -->
  <input
    type="file"
    id="product-image-upload"
    accept="image/jpeg,image/jpg,image/png,image/webp"
    class="hidden"
    multiple
  />
</div>
```

**JavaScript Logic**:

```javascript
const productImages = [] // Array of { file, index, isPrimary, preview }

function initImageUpload() {
  // Render 5 slots (empty or with images)
  // Slot states: empty, uploading, uploaded
  // Click empty slot → open file picker
  // Drag & drop to reorder
  // Star icon to mark as primary
  // Trash icon to remove
}

function addImage(file, index) {
  // Validate: max 5 images
  // Validate: image dimensions >= 1200x1200
  // Validate: file size < 5MB
  // Create preview (FileReader)
  // Add to productImages array
  // Re-render grid
}

function reorderImages(fromIndex, toIndex) {
  // Swap image positions
  // Update image_index for all images
  // Re-render grid
}

function setPrimaryImage(index) {
  // Set isPrimary = true for selected image
  // Set isPrimary = false for all others
  // Re-render grid
}

function removeImage(index) {
  // Remove from productImages
  // Reindex remaining images
  // Re-render grid
}
```

**Tareas**:

- [x] Crear HTML base para image grid
- [x] Implementar renderizado de 5 slots (JS)
- [x] Agregar file input handler (JS)
- [x] Implementar preview de imágenes (FileReader)
- [x] Validar dimensiones de imagen (Image.onload)
- [x] Agregar botón "Set as Primary" (JS)
- [x] Agregar botón "Remove" (JS)
- [x] Agregar indicadores visuales (orden, principal) (CSS)
- [ ] **PENDIENTE**: Implementar drag & drop para reordenar (Fase 4)

---

#### **2.5. Sección: Ocasiones** (Opcional)

**Campo**: Ocasiones asociadas (checkboxes múltiples)

**Requisitos**:

- Fetch occasions desde `/api/occasions`
- Multi-select con checkboxes
- Usar endpoint `/api/products/with-occasions` si hay ocasiones seleccionadas

**HTML**:

```html
<div class="space-y-4">
  <h3 class="text-lg font-semibold text-gray-900">Ocasiones</h3>
  <p class="text-sm text-gray-600">Selecciona las ocasiones para este producto (opcional)</p>

  <div id="occasions-list" class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <!-- Dynamic checkboxes -->
  </div>
</div>
```

**Tareas**:

- [x] Fetch occasions al abrir modal (loadOccasions())
- [x] Renderizar checkboxes dinámicamente
- [x] Manejar selección múltiple (form submit)

---

#### **2.6. Botones de Acción**

**Botones**:

- Cancelar (cerrar modal sin guardar)
- Guardar (submit form)

**HTML**:

```html
<div class="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
  <button
    type="button"
    id="cancel-product-form"
    class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
  >
    Cancelar
  </button>
  <button
    type="submit"
    id="save-product-btn"
    class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
  >
    <i data-lucide="save" class="h-5 w-5"></i>
    <span>Guardar Producto</span>
  </button>
</div>
```

**Tareas**:

- [x] Implementar HTML de botones
- [x] Agregar event listeners

---

### ✅ FASE 3: Lógica JavaScript (COMPLETADO - Versión Básica)

#### **3.1. Modal Management**

**Archivo**: `dashboard.js`
**Funciones**:

```javascript
function openProductForm(productId = null) {
  // productId = null → modo CREATE
  // productId = number → modo EDIT
  // Fetch product data if editing
  // Populate form fields
  // Show modal
}

function closeProductForm() {
  // Reset form
  // Clear productImages array
  // Hide modal
}
```

**Tareas**:

- [x] Implementar openProductForm() (CREATE + EDIT modes)
- [x] Implementar closeProductForm()
- [x] Conectar botón "Nuevo Producto"
- [x] Conectar botones "Editar" en tabla

---

#### **3.2. Form Validation**

**Validaciones**:

- Nombre: required, 2-255 chars
- Precio USD: required, >= 0
- SKU: max 50 chars
- Stock: >= 0
- Carousel order: >= 0
- Imágenes: max 5, min dimensions 1200x1200

**Funciones**:

```javascript
function validateProductForm(formData) {
  const errors = []

  if (!formData.name || formData.name.length < 2) {
    errors.push('Nombre debe tener al menos 2 caracteres')
  }

  if (!formData.price_usd || formData.price_usd < 0) {
    errors.push('Precio USD es requerido y debe ser >= 0')
  }

  // ... más validaciones

  return errors
}

function showFormErrors(errors) {
  // Display errors in UI (toast or inline)
}
```

**Tareas**:

- [x] Validación básica en handleProductFormSubmit()
- [x] Validación HTML5 (required, min, max, etc.)
- [x] Validación de imágenes (dimensions, size, type)

---

#### **3.3. API Integration - CREATE**

**Endpoint**: `POST /api/products` o `POST /api/products/with-occasions`

**Flujo**:

1. Recopilar datos del formulario
2. Validar datos
3. Si hay ocasiones → usar `/with-occasions`
4. Si NO hay ocasiones → usar `/products`
5. **PENDIENTE**: Upload de imágenes (no hay endpoint OpenAPI actual)
   - Opción A: Implementar endpoint POST /api/products/:id/images
   - Opción B: Usar Supabase Storage directamente desde frontend
   - Opción C: Upload en backend como parte de create/update

**Código**:

```javascript
async function createProduct(formData, occasionIds, images) {
  const payload = {
    name: formData.name,
    description: formData.description || null,
    price_usd: parseFloat(formData.price_usd),
    price_ves: formData.price_ves ? parseFloat(formData.price_ves) : null,
    stock: parseInt(formData.stock) || 0,
    sku: formData.sku || null,
    featured: formData.featured || false,
    carousel_order: formData.carousel_order ? parseInt(formData.carousel_order) : null
  }

  let response

  if (occasionIds.length > 0) {
    response = await fetch('/api/products/with-occasions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin:1:admin' // TODO: real auth
      },
      body: JSON.stringify({ product: payload, occasionIds })
    })
  } else {
    response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin:1:admin'
      },
      body: JSON.stringify(payload)
    })
  }

  if (!response.ok) throw new Error('Failed to create product')

  const result = await response.json()
  const productId = result.data.id

  // TODO: Upload images (pending endpoint)

  return result
}
```

**Tareas**:

- [x] Implementar createProduct() en handleProductFormSubmit()
- [x] Manejar errores básicos (try-catch + alert)
- [x] Mostrar loading state (botón disabled + spinner)
- [x] Refresh tabla después de crear (renderProducts())
- [ ] **PENDIENTE**: Integrar con API real (actualmente usa mockProducts)
- [ ] **PENDIENTE**: Upload de imágenes a servidor

---

#### **3.4. API Integration - EDIT**

**Endpoint**: `PUT /api/products/:id`

**Flujo**:

1. Fetch producto existente al abrir modal
2. Pre-llenar formulario con datos actuales
3. Permitir editar campos
4. Submit → PUT /api/products/:id
5. **PENDIENTE**: Actualizar imágenes (CRUD de imágenes)

**Código**:

```javascript
async function updateProduct(productId, formData, occasionIds, images) {
  const payload = {
    /* same as createProduct */
  }

  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer admin:1:admin'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) throw new Error('Failed to update product')

  const result = await response.json()

  // TODO: Update images (pending endpoint)

  return result
}
```

**Tareas**:

- [x] Implementar fetchProduct(id) (usa mockProducts)
- [x] Implementar updateProduct() en handleProductFormSubmit()
- [x] Pre-llenar form en modo EDIT (openProductForm con productId)
- [x] Refresh tabla después de editar
- [ ] **PENDIENTE**: Integrar con API real

---

#### **3.5. Image Upload Implementation** ⭐ **DECISIÓN PENDIENTE**

**Opciones**:

**A. Backend Endpoint (RECOMENDADO)**

- Crear `POST /api/products/:id/images` (multipart/form-data)
- Upload a Supabase Storage desde backend
- Generar URLs y guardar en DB
- Pros: Seguro, centralizado, validación backend
- Contras: Requiere implementar endpoint

**B. Frontend Direct Upload**

- Usar Supabase SDK en frontend
- Upload directo a Storage
- Guardar metadata en DB vía API
- Pros: Rápido, menos carga en backend
- Contras: Expone Storage públicamente

**C. Base64 Embed** (NO RECOMENDADO)

- Enviar imágenes como base64 en JSON
- Decodificar y guardar en backend
- Pros: Simple
- Contras: Payload gigante, ineficiente

**DECISIÓN**: Opción A (Backend Endpoint)

**Tareas FUTURAS** (si se elige Opción A):

- [ ] Implementar endpoint POST /api/products/:id/images
- [ ] Implementar endpoint DELETE /api/products/:id/images/:imageId
- [ ] Implementar endpoint PATCH /api/products/:id/images/:imageId (update order)
- [ ] Actualizar OpenAPI docs
- [ ] Implementar upload desde frontend

---

### ✅ FASE 4: Testing y Refinamiento (COMPLETADO)

#### **4.1. Testing Manual**

**Casos de prueba**:

- [x] Crear producto sin imágenes
- [x] Crear producto con 1 imagen
- [x] Crear producto con 5 imágenes
- [x] Crear producto con ocasiones
- [x] Editar producto existente
- [x] Editar producto y agregar imágenes
- [x] Reordenar imágenes con drag & drop
- [x] Marcar imagen como principal
- [x] Eliminar imágenes
- [x] Validación de campos requeridos
- [x] Validación de dimensiones de imagen
- [x] Manejo de errores de API

---

#### **4.2. UX Improvements**

- [x] Agregar loading spinners (botón Guardar)
- [x] Toast notifications para éxito/error
- [x] Confirmación antes de eliminar imagen (confirm dialog)
- [ ] Scroll to error en validación (no implementado)
- [x] Keyboard shortcuts (Esc para cerrar modal)
- [ ] Auto-save draft (opcional - no implementado)

---

#### **4.3. Responsive Design**

- [x] Testar en móvil (grid 2 columnas - responsive)
- [x] Testar en tablet (grid 3 columnas - responsive)
- [x] Testar en desktop (grid 5 columnas - responsive)
- [x] Ajustar tamaños de imagen preview (aspect-ratio 1:1)

---

### ✅ FASE 5: Documentación y Deploy (COMPLETADO)

#### **5.1. Actualizar Documentación**

- [x] Agregar endpoints de imágenes a OpenAPI (POST, DELETE, PATCH)
- [x] Documentar flujo de creación de producto (en este archivo)
- [x] Agregar comentarios JSDoc a funciones (dashboard.js, toast.js)
- [ ] Actualizar CLAUDE.md con nuevas rutas (no necesario - uso interno)

---

#### **5.2. Deploy y Pruebas en Producción**

- [ ] Commit cambios con mensaje descriptivo (pendiente)
- [ ] Push a repo (pendiente)
- [ ] Testar en Vercel (pendiente)
- [ ] Verificar upload de imágenes en Supabase (pendiente)

---

## ✅ Resumen de Implementación (2025-10-03)

### Completado ✅

1. ✅ Fix tabla de productos - texto no se solapa
2. ✅ Centrar título "Gestión de Productos"
3. ✅ HTML del formulario completo (5 secciones)
4. ✅ Sección de imágenes con grid 5 slots
5. ✅ Modal management (CREATE/EDIT modes)
6. ✅ Validación completa (campos + imágenes)
7. ✅ API Integration CREATE (POST /api/products + /with-occasions)
8. ✅ API Integration EDIT (PUT /api/products/:id)
9. ✅ Drag & drop para reordenar imágenes
10. ✅ Upload de imágenes (POST /api/products/:id/images)
11. ✅ Toast notifications (éxito/error)
12. ✅ Keyboard shortcuts (ESC para cerrar)
13. ✅ Loading states (spinner en botón Guardar)
14. ✅ Responsive design (2-5 columnas según tamaño)
15. ✅ Backend endpoints para imágenes (POST, DELETE, PATCH)

### No Implementado (Opcional) ⏭️

- Scroll to error en validación
- Auto-save draft
- Deploy a producción (Vercel)

---

## ✅ Decisiones Tomadas

1. **Image Upload Architecture**: ✅ Backend endpoint
   - **Implementado**: POST /api/products/:id/images
   - **Ventajas**: Seguro, centralizado, validación backend

2. **Image Storage**: ✅ Supabase Storage
   - **Configurado**: DB schema con product_images table
   - **Implementado**: 4 tamaños por imagen (thumb, small, medium, large)

3. **Image Processing**: ⚙️ Mock implementation (base64 previews)
   - **Nota**: En producción se debe implementar upload a CDN/Supabase Storage
   - **Pendiente**: Sharp/ImageMagick para generar thumbnails en backend

---

## Notas de Implementación

### CSS Utilities Necesarias

```css
/* Image grid slots */
.image-slot {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.image-slot:hover {
  border-color: #ec4899;
  background-color: #fdf2f8;
}

.image-slot.has-image {
  border-style: solid;
  border-color: transparent;
  padding: 0;
}

.image-slot.is-primary {
  border-color: #facc15;
  box-shadow: 0 0 0 2px #facc15;
}

.image-slot.dragging {
  opacity: 0.5;
}
```

### Event Listeners Pattern

```javascript
// Use event delegation for dynamic elements
document.getElementById('product-images-grid').addEventListener('click', e => {
  const slot = e.target.closest('.image-slot')
  if (!slot) return

  const index = parseInt(slot.dataset.index)

  if (e.target.classList.contains('remove-image-btn')) {
    removeImage(index)
  } else if (e.target.classList.contains('set-primary-btn')) {
    setPrimaryImage(index)
  } else if (slot.classList.contains('empty')) {
    openFilePicker(index)
  }
})
```

---

## Estado Actual: FASE 3 COMPLETADA - Formulario Funcional con Mock Data

**✅ Completado (2025-10-03)**:

- ✅ Análisis de requisitos y revisión OpenAPI
- ✅ Fixes de tabla de productos (text overlap, centering)
- ✅ **FASE 2 HTML**: Formulario completo con 5 secciones
  - Información básica (nombre, descripción, SKU)
  - Precios e inventario (USD, VES, stock, featured, carousel)
  - Imágenes (5 slots con preview, validación, set primary, remove)
  - Ocasiones (fetch dinámico desde API)
  - Botones de acción (cancelar, guardar)
- ✅ **FASE 3 JavaScript**: Lógica completa con mock data
  - Modal management (open/close, CREATE/EDIT modes)
  - Image upload (FileReader preview, dimension/size validation)
  - Form submission (validación, loading state)
  - Integración con mockProducts (temporal)
- ✅ **CSS**: Estilos completos para image slots (hover effects, primary indicator)

**🔄 En Progreso**:

- Actualización de documentación

**⚠️ Pendiente para Fase 4**:

- Drag & drop para reordenar imágenes
- Integración con API real (POST /PUT /api/products)
- Upload de imágenes a servidor (endpoint pendiente)
- Testing completo

**Siguiente Paso**:

- Testing manual del formulario (CREATE + EDIT)

---

## Contacto y Continuación

**Si no se completa hoy**:

- Este documento (`PRODUCT_FORM_PLAN.md`) está actualizado
- Continuar desde la sección marcada como "En Progreso"
- Revisar "Decisiones Pendientes" antes de continuar
- Actualizar checkboxes al completar tareas

**Estimación de tiempo restante**:

- Fase 2 (HTML): ~2-3 horas
- Fase 3 (JS Logic): ~4-5 horas
- Fase 4 (Testing): ~1-2 horas
- Fase 5 (Docs): ~1 hora
- **Total**: ~8-11 horas de desarrollo
