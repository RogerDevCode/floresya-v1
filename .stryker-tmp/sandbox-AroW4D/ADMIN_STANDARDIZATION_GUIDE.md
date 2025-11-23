# Sistema de Estandarización UI/UX para Admin Pages

## 📋 RESUMEN DE IMPLEMENTACIÓN

### ✅ Archivos Creados

1. **`public/js/components/admin-navbar.js`** - Componente JavaScript del navbar
2. **`public/css/admin-theme.css`** - Estilos de tema claro/oscuro con colores florales
3. **`public/components/admin-footer.html`** - Footer estandarizado
4. **`public/js/utils/admin-page-helper.js`** - Helper para breadcrumbs y utilidades

### 🎨 Características Implementadas

#### 1. Breadcrumbs (Migas de Pan)

- Navegación jerárquica visible
- Dashboard / Sección / Página actual
- Links clicables para navegación rápida

#### 2. Tema Claro/Oscuro

- **Botón en navbar** para cambiar tema
- **Guardado en localStorage** (persiste entre sesiones)
- **Modo Claro**: Colores florales suaves (rosa pastel, lavanda)
- **Modo Oscuro**: Púrpura oscuro profesional con acentos florales
- **Contraste optimizado** para todos los componentes

#### 3. Notificaciones/Alertas

- Badge con contador
- Panel dropdown
- Sistema preparado para integrar con API

#### 4. Footer Informativo

- Información de contacto (email, teléfono, ubicación)
- Enlaces útiles
- Versión del sistema
- Usuario conectado
- Copyright dinámico

#### 5. Navegación Consistente

- Botón "Volver" con `window.history.back()`
- Logo clickable
- User info visible
- Logout button

### 🎨 Paleta de Colores

#### Modo Claro (Floral Suave)

```css
--bg-primary: #fef5f8; /* Rosa muy suave */
--bg-secondary: #fff9fb; /* Rosa casi blanco */
--text-primary: #2d1b2e; /* Púrpura oscuro */
--accent-primary: #e91e8c; /* Rosa FloresYa */
```

#### Modo Oscuro (Profesional)

```css
--bg-primary: #1a1625; /* Púrpura muy oscuro */
--bg-secondary: #251d30; /* Púrpura oscuro */
--text-primary: #f5f3f7; /* Casi blanco lavanda */
--accent-primary: #f472b6; /* Rosa brillante */
```

## 🚀 CÓMO USAR EN CADA PÁGINA

### Paso 1: Agregar CSS del Tema

```html
<head>
  ...
  <link rel="stylesheet" href="../../css/styles.css" />
  <link rel="stylesheet" href="../../css/tailwind.css" />
  <link rel="stylesheet" href="../../css/admin-theme.css" />
  <!-- NUEVO -->
  ...
</head>
```

### Paso 2: Estructura HTML del Navbar

```html
<body class="font-sans antialiased">
  <!-- Navbar -->
  <nav
    class="navbar bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md fixed top-0 left-0 right-0 z-50"
    role="navigation"
  >
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Back Button -->
        <button
          id="back-btn"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg>...</svg>
          <span class="hidden sm:inline text-sm font-medium">Volver</span>
        </button>

        <!-- Center: Logo + Breadcrumb -->
        <div class="flex items-center space-x-3">
          <a href="../../index.html" class="flex items-center space-x-2">
            <img
              src="../../images/logoFloresYa.jpeg"
              class="h-10 w-10 rounded-full ring-2 ring-pink-200 dark:ring-pink-800"
            />
            <span class="text-xl font-bold text-pink-600 dark:text-pink-400 hidden md:block">
              FloresYa Admin
            </span>
          </a>

          <!-- Breadcrumb Container -->
          <nav class="hidden lg:flex items-center text-sm">
            <ol id="breadcrumb-container" class="flex items-center space-x-2">
              <li>
                <a
                  href="./dashboard.html"
                  class="text-gray-500 dark:text-gray-400 hover:text-pink-600"
                >
                  Dashboard
                </a>
              </li>
              <!-- JS añadirá breadcrumbs aquí -->
            </ol>
          </nav>
        </div>

        <!-- Right: Theme + Notifications + User + Logout -->
        <div class="flex items-center space-x-2">
          <!-- Theme Toggle -->
          <button
            id="theme-toggle-btn"
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg>...</svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button id="notifications-btn" class="relative p-2">
              <svg>...</svg>
              <span
                id="notification-badge"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center hidden"
              ></span>
            </button>
            <div
              id="notifications-panel"
              class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            >
              <div id="notifications-list"></div>
            </div>
          </div>

          <!-- User Info -->
          <div
            class="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700"
          >
            <span
              id="admin-user-display"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Admin
            </span>
          </div>

          <!-- Logout -->
          <button id="logout-btn" class="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600">
            <svg>...</svg>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Spacer for fixed navbar -->
  <div class="h-16"></div>

  <!-- Main Content -->
  <main class="container mx-auto px-4 py-8 min-h-screen">...</main>

  <!-- Footer -->
  <!-- Incluir desde public/components/admin-footer.html -->
</body>
```

### Paso 3: Inicializar JavaScript

```html
<script>
  // Configurar página antes de cargar navbar.js
  window.adminNavbarConfig = {
    currentPage: 'Usuarios',
    breadcrumbs: [
      { name: 'Gestión', url: null },
      { name: 'Usuarios', url: null }
    ],
    showSidebar: false
  }
</script>
<script type="module" src="../../js/components/admin-navbar.js"></script>
```

### Paso 4: En el JS de la página

```javascript
import { AdminNavbar } from '../../js/components/admin-navbar.js'

// Inicializar con breadcrumbs
const navbar = new AdminNavbar({
  currentPage: 'Gestión de Usuarios',
  breadcrumbs: [{ name: 'Usuarios', url: null }]
})

// La navbar manejará automáticamente:
// - Tema (carga desde localStorage)
// - Notificaciones
// - User display
// - Logout
```

## 📝 CONTRASTE Y ACCESIBILIDAD

### Clases para Contraste Optimizado

```html
<!-- Textos -->
<p class="text-gray-900 dark:text-gray-100">Texto principal</p>
<p class="text-gray-600 dark:text-gray-300">Texto secundario</p>
<p class="text-gray-500 dark:text-gray-400">Texto terciario</p>

<!-- Backgrounds -->
<div class="bg-white dark:bg-gray-800">Card principal</div>
<div class="bg-gray-50 dark:bg-gray-900">Card secundario</div>

<!-- Borders -->
<div class="border border-gray-200 dark:border-gray-700">...</div>

<!-- Buttons -->
<button class="bg-pink-600 dark:bg-pink-500 text-white hover:bg-pink-700 dark:hover:bg-pink-600">
  Acción Principal
</button>

<!-- Inputs -->
<input
  class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
/>
```

## 🔄 MIGRACIÓN DE PÁGINAS EXISTENTES

### Para cada página en `public/pages/admin/*.html`:

1. ✅ Agregar `<link href="../../css/admin-theme.css" />`
2. ✅ Actualizar navbar con nueva estructura
3. ✅ Agregar `id="breadcrumb-container"` en breadcrumb nav
4. ✅ Agregar botones: `theme-toggle-btn`, `notifications-btn`, `logout-btn`, `back-btn`
5. ✅ Agregar clases dark mode: `dark:bg-*`, `dark:text-*`, `dark:border-*`
6. ✅ Incluir footer component
7. ✅ Inicializar `AdminNavbar` en JS

## 🎯 PÁGINAS A ACTUALIZAR

- [x] `user-form.html` - MODELO CREADO
- [ ] `user-delete-confirm.html`
- [ ] `dashboard.html`
- [ ] `occasions.html`
- [ ] `orders.html`
- [ ] `product-editor.html`
- [ ] `contact-editor.html`
- [ ] `create-product.html`
- [ ] `edit-product.html`

## 💡 TIPS DE IMPLEMENTACIÓN

1. **Copiar navbar** de `user-form.html` (una vez actualizado) como plantilla
2. **Ajustar breadcrumbs** según la página (Dashboard > Sección > Página)
3. **Verificar contraste** en ambos temas
4. **Probar toggle** de tema en cada página
5. **Validar responsive** en mobile/tablet/desktop

## 🐛 TROUBLESHOOTING

**Tema no cambia:**

- Verificar que `admin-navbar.js` esté cargado
- Revisar console del navegador
- Confirmar que localStorage funciona

**Breadcrumbs no aparecen:**

- Verificar `id="breadcrumb-container"` existe
- Confirmar configuración en `window.adminNavbarConfig`
- Revisar que el script se ejecute después del DOM

**Colores no se aplican:**

- Asegurar que `admin-theme.css` se carga después de `tailwind.css`
- Verificar clase `dark` en `<html>` o `document.documentElement`
- Usar DevTools para inspeccionar variables CSS

## 📚 RECURSOS

- **Archivo Modelo**: `public/pages/admin/user-form.html` (actualizar como ejemplo)
- **Componentes**: `public/components/admin-*.html`
- **Estilos**: `public/css/admin-theme.css`
- **Scripts**: `public/js/components/admin-navbar.js`

---

**Próximo Paso**: Actualizar `user-form.html` como modelo completo y luego aplicar recursivamente a todas las páginas.
