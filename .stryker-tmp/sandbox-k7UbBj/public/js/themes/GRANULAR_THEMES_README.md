# 🎨 Sistema de Temas Granulares - FloresYa

**Fase 1: Infraestructura Completada**

## 📋 Descripción

Sistema avanzado de temas que permite aplicar estilos granulares a cada panel/componente de la página de forma independiente, proporcionando flexibilidad total en el diseño.

## 🏗️ Arquitectura

```
📁 public/
├── 📁 css/
│   └── themes-granular.css        # Variables CSS y clases granulares
└── 📁 js/
    └── 📁 themes/
        ├── granularThemeConfig.js # Configuración de temas
        └── GRANULAR_THEMES_README.md
```

## 🎯 Paneles Disponibles

### 1. **Navegación** (`navigation`)

- `primary` - Navbar estándar con fondo sólido
- `glass` - Navbar con efecto glassmorphism
- `solid` - Navbar con borde inferior marcado

### 2. **Breadcrumb** (`breadcrumb`)

- `standard` - Breadcrumb con fondo y borde
- `minimal` - Breadcrumb sin fondo

### 3. **Hero Section** (`hero`)

- `gradient` - Fondo con gradiente animado
- `image` - Fondo con imagen y overlay
- `solid` - Fondo sólido con sombra
- `minimal` - Estilo minimal con mucho espacio

### 4. **Carousel** (`carousel`)

- `light` - Estilo claro estándar
- `dark` - Estilo oscuro para contraste
- `card` - Estilo card con bordes redondeados
- `premium` - Estilo premium con sombras y gradiente

### 5. **Productos** (`products`)

- `grid` - Grid estándar de productos
- `cards` - Cards con hover y elevación
- `masonry` - Layout masonry para Pinterest-like

### 6. **Detalle de Producto** (`productDetail`)

- `standard` - Layout estándar de dos columnas
- `premium` - Layout premium con sombras y efectos

### 7. **Carrito** (`cart`)

- `overlay` - Carrito con fondo overlay y gradiente
- `card` - Carrito con cards glassmorphism
- `premium` - Carrito premium con borde gradiente
- `minimal` - Carrito minimal sin sombras

### 8. **Formularios** (`forms`)

- `standard` - Formulario con estilo estándar
- `outlined` - Formulario solo con bordes
- `filled` - Formulario con fondo de color
- `premium` - Formulario premium con glassmorphism

### 9. **Botones** (`buttons`)

- `soft` - Bordes redondeados con elevación
- `sharp` - Bordes rectos, estilo tech
- `ghost` - Solo texto/icono, fondo transparente
- `gradient` - Gradiente animado

### 10. **Testimonios** (`testimonials`)

- `card` - Cards con elevación y bordes coloreados

### 11. **Features** (`features`)

- `standard` - Features con iconos y hover

### 12. **Footer** (`footer`)

- `solid` - Footer oscuro estándar
- `light` - Footer claro para contraste

## 📦 Presets de Página

### `homepage`

```javascript
{
  navigation: 'glass',
  hero: 'gradient',
  carousel: 'premium',
  products: 'cards',
  testimonials: 'card',
  features: 'standard',
  footer: 'solid',
}
```

### `cart`

```javascript
{
  navigation: 'glass',
  cart: 'card',
  buttons: 'soft',
  footer: 'solid',
}
```

### `payment`

```javascript
{
  navigation: 'glass',
  forms: 'premium',
  cart: 'premium',
  buttons: 'gradient',
  footer: 'solid',
}
```

### `productDetail`

```javascript
{
  navigation: 'glass',
  breadcrumb: 'standard',
  productDetail: 'premium',
  buttons: 'gradient',
  footer: 'solid',
}
```

## 🚀 Uso

### Opción 1: Aplicar tema a un elemento específico

```javascript
import { applyGranularTheme, granularThemes } from '/js/themes/granularThemeConfig.js'

// Aplicar navegación glassmorphism
const navbar = document.querySelector('nav')
applyGranularTheme(navbar, 'navigation', 'glass')
```

### Opción 2: Aplicar preset completo

```javascript
import { applyPagePreset } from '/js/themes/granularThemeConfig.js'

// Mapeo de elementos DOM
const mappings = {
  navigation: document.querySelector('nav'),
  hero: document.querySelector('.hero-section'),
  carousel: document.querySelector('#featuredCarousel'),
  products: document.querySelector('#productos'),
  testimonials: document.querySelector('.testimonials-section'),
  features: document.querySelector('.features-section'),
  footer: document.querySelector('footer')
}

// Aplicar preset de página de inicio
applyPagePreset('homepage', mappings)
```

### Opción 3: Configuración manual

```javascript
import { granularThemes } from '/js/themes/granularThemeConfig.js'

// Obtener configuración de un tema
const theme = granularThemes.navigation.glass
console.log(theme.name) // "Navegación Glassmorphism"
console.log(theme.styles) // "theme-nav-glass"
console.log(theme.variables) // { '--nav-bg': 'var(--nav-bg-glass)', ... }

// Aplicar manualmente
const navbar = document.querySelector('nav')
navbar.classList.add(theme.styles)

// Aplicar variables
Object.entries(theme.variables).forEach(([property, value]) => {
  navbar.style.setProperty(property, value)
})
```

## 📝 En el HTML

### index.html

```html
<nav class="navbar theme-nav-glass">
  <!-- contenido -->
</nav>

<section class="hero-section theme-hero-gradient animate-gradient">
  <!-- contenido -->
</section>

<section class="carousel-container theme-carousel-premium">
  <!-- contenido -->
</section>

<section id="productos" class="products-section theme-products-cards">
  <!-- contenido -->
</section>

<section class="testimonials theme-testimonials-card">
  <!-- contenido -->
</section>

<footer class="footer theme-footer-solid">
  <!-- contenido -->
</footer>
```

### cart.html

```html
<nav class="navbar theme-nav-glass"></nav>

<div class="cart-container theme-cart-overlay">
  <div class="cart-grid">
    <div class="cart-items theme-cart-card">
      <!-- contenido -->
    </div>

    <div class="order-summary theme-cart-premium">
      <!-- contenido -->
    </div>
  </div>
</div>
```

### payment.html

```html
<nav class="navbar theme-nav-glass"></nav>

<div class="payment-container theme-cart-overlay">
  <div class="payment-grid">
    <div class="customer-form theme-form-premium">
      <!-- contenido -->
    </div>

    <div class="payment-panels">
      <div class="order-summary theme-cart-card">
        <!-- contenido -->
      </div>

      <div class="payment-methods theme-form-outlined">
        <!-- contenido -->
      </div>
    </div>
  </div>
</div>
```

### product-detail.html

```html
<nav class="navbar theme-nav-glass"></nav>

<nav class="breadcrumb theme-breadcrumb-standard">
  <!-- contenido -->
</nav>

<main class="theme-product-detail">
  <div class="grid">
    <div class="gallery theme-product-detail-gallery">
      <!-- contenido -->
    </div>

    <div class="info theme-product-detail-info">
      <!-- contenido -->
    </div>
  </div>
</main>
```

## 🎨 CSS Personalizado

### Variables CSS Disponibles

```css
/* Navegación */
--nav-bg-primary
--nav-bg-glass
--nav-text-primary
--nav-border
--nav-shadow

/* Hero */
--hero-bg-gradient
--hero-bg-image
--hero-text-primary
--hero-overlay
--hero-shadow

/* Carousel */
--carousel-bg
--carousel-border
--carousel-shadow
--carousel-control-bg
--carousel-indicator-active

/* Productos */
--products-bg
--products-card-bg
--products-card-hover

/* Carrito */
--cart-bg-card
--cart-backdrop-blur
--cart-shadow
--cart-shadow-premium

/* Formularios */
--form-bg
--form-border-focus
--form-shadow
--form-shadow-focus

/* Botones */
--btn-bg-primary
--btn-bg-primary-hover
--btn-shadow
--btn-shadow-hover

/* Y más... */
```

### Ejemplo de Variable Personalizada

```css
/* En tu CSS personalizado */
.theme-product-detail-premium {
  --product-detail-custom-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --product-detail-custom-text: white;
}

/* Uso en HTML */
<div class="theme-product-detail theme-product-detail-premium">
  <!-- contenido -->
</div>
```

## 🔧 Utilidades

### listAvailableThemes(panelType)

Lista todos los temas disponibles para un panel específico.

```javascript
import { listAvailableThemes } from '/js/themes/granularThemeConfig.js'

const navigationThemes = listAvailableThemes('navigation')
console.log(navigationThemes)
/*
[
  {
    key: 'primary',
    name: 'Navegación Primaria',
    description: 'Navbar estándar con fondo sólido',
    responsive: true,
    darkMode: true,
  },
  ...
]
*/
```

### getGranularThemeConfig(panelType, themeName)

Obtiene la configuración completa de un tema específico.

```javascript
import { getGranularThemeConfig } from '/js/themes/granularThemeConfig.js'

const config = getGranularThemeConfig('navigation', 'glass')
console.log(config)
/*
{
  name: 'Navegación Glassmorphism',
  description: 'Navbar con efecto cristal translúcido',
  styles: 'theme-nav-glass',
  variables: { '--nav-bg': 'var(--nav-bg-glass)', ... },
  responsive: true,
  darkMode: true,
}
*/
```

## 🌙 Soporte Dark Mode

Todos los temas granulares son compatibles con el sistema de dark mode existente. Las variables se ajustan automáticamente según el tema activo.

## 📱 Responsive

Todos los temas incluyen ajustes responsive. Se pueden deshabilitar animaciones en dispositivos móviles con `prefers-reduced-motion`.

## ♿ Accesibilidad

- Soporte para `prefers-contrast: high`
- Soporte para `prefers-reduced-motion: reduce`
- Colores con contraste WCAG 2.1 AA
- Focus visible en todos los elementos interactivos

## 🔄 Próximos Pasos (Fase 2)

1. **Navegación** - Aplicar theme-nav-glass por defecto
2. **Carrito** - Aplicar theme-cart-card + theme-cart-premium
3. **Formularios** - Aplicar theme-form-premium

## 🐛 Debugging

```javascript
import { granularThemeDebug } from '/js/themes/granularThemeConfig.js'

// Ver toda la configuración
console.table(granularThemeDebug.themes)

// Ver presets
console.table(granularThemeDebug.presets)
```

## 📄 Archivos

- ✅ `themes-granular.css` - Variables y clases CSS
- ✅ `granularThemeConfig.js` - Configuración y utilidades
- ✅ `GRANULAR_THEMES_README.md` - Esta documentación

---

**¡Fase 1: Infraestructura Completada!** 🎉

Listo para proceder con la Fase 2: Aplicación a Paneles Críticos.
