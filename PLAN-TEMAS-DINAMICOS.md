# Plan de Implementación: Sistema de Temas Dinámicos - FloresYa

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Fase 1: Fundamentos](#fase-1-fundamentos)
4. [Fase 2: Gestor de Temas](#fase-2-gestor-de-temas)
5. [Fase 3: Componente UI](#fase-3-componente-ui)
6. [Fase 4: Galería Visual](#fase-4-galería-visual)
7. [Fase 5: Migración y Optimización](#fase-5-migración-y-optimización)
8. [Testing y Validación](#testing-y-validación)
9. [Deployment CI/CD](#deployment-cicd)

---

## 🎯 Visión General

### Objetivo

Implementar un sistema de temas dinámicos que permita:

- Cambio instantáneo entre 7 temas (5 elaborados + 2 básicos)
- Persistencia en localStorage
- Sin parpadeos al cambiar tema
- Variables CSS granulares (40+ por componente)
- Texturas complejas preservadas vía CSS inline

### Estrategia Técnica

- **Colores:** Variables CSS (`--theme-*`)
- **Texturas:** CSS inline inyectado dinámicamente
- **Carga:** String templates en JavaScript
- **UI:** Dropdown navbar + galería visual opcional

### Temas Disponibles

1. **Light** (básico) - Tema claro por defecto
2. **Dark** (básico) - Tema oscuro simple
3. **Elegancia Moderna** - Mármol blanco con vetas azules
4. **Vintage Romántico** - Papel antiguo con flores vintage
5. **Tropical Vibrante** - Selva tropical con hibiscus
6. **Jardín Natural** - Naturaleza orgánica
7. **Zen Minimalista** - Minimalismo tranquilo

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
floresya-v1/
├── public/
│   ├── css/
│   │   ├── styles.css                    # [MODIFICAR] Añadir variables base
│   │   ├── input.css                     # [MODIFICAR] Integrar variables
│   │   └── themes/                       # [NUEVO] Carpeta de temas
│   │       └── base-variables.css        # [NUEVO] Variables CSS globales
│   │
│   ├── js/
│   │   ├── themes/                       # [NUEVO] Sistema de temas
│   │   │   ├── themeDefinitions.js       # Definiciones de los 7 temas
│   │   │   ├── themeStyles.js            # CSS inline por tema
│   │   │   └── themeManager.js           # Gestor central
│   │   │
│   │   └── components/
│   │       ├── ThemeSelector.js          # [NUEVO] Dropdown navbar
│   │       └── ThemeGallery.js           # [NUEVO] Galería visual
│   │
│   ├── pages/
│   │   ├── theme-gallery.html            # [NUEVO] Página de galería
│   │   └── theme-gallery.js              # [NUEVO] Lógica de galería
│   │
│   ├── index.html                        # [MODIFICAR] Añadir selector
│   └── index.js                          # [MODIFICAR] Inicializar sistema
│
└── docs/
    └── TEMAS-GUIA.md                     # [NUEVO] Guía para crear temas
```

### Flujo de Datos

```
Usuario hace clic en tema
        ↓
ThemeSelector (UI)
        ↓
ThemeManager.setTheme(themeName)
        ↓
1. Aplicar variables CSS (colores)
2. Inyectar <style> tag (texturas)
3. Guardar en localStorage
4. Emitir evento 'themeChanged'
        ↓
UI actualiza checkmarks/estado
```

---

## 🚀 Fase 1: Fundamentos

### Objetivos

- Crear estructura base de variables CSS
- Definir las 40+ variables por componente
- Establecer convenciones de nomenclatura

### Tareas

#### 1.1 Crear Variables CSS Base

**Archivo:** `/public/css/themes/base-variables.css`

```css
/**
 * FloresYa - Variables CSS Base para Sistema de Temas
 * Este archivo define todas las variables CSS que serán sobrescritas por cada tema.
 */

:root {
  /* ==================== COLORES GLOBALES ==================== */

  /* Primarios */
  --theme-primary: #ec4899;
  --theme-primary-dark: #db2777;
  --theme-primary-light: #f9a8d4;
  --theme-primary-hover: #be185d;

  /* Secundarios */
  --theme-secondary: #10b981;
  --theme-secondary-dark: #059669;
  --theme-secondary-light: #6ee7b7;

  /* Acentos */
  --theme-accent: #f59e0b;
  --theme-accent-dark: #d97706;
  --theme-accent-light: #fbbf24;

  /* Fondos */
  --theme-bg-primary: #ffffff;
  --theme-bg-secondary: #f8fafc;
  --theme-bg-tertiary: #f1f5f9;

  /* Texto */
  --theme-text-primary: #1f2937;
  --theme-text-secondary: #6b7280;
  --theme-text-tertiary: #9ca3af;
  --theme-text-inverted: #ffffff;

  /* Bordes */
  --theme-border-light: #e5e7eb;
  --theme-border-medium: #d1d5db;
  --theme-border-dark: #9ca3af;

  /* Estados */
  --theme-success: #10b981;
  --theme-warning: #f59e0b;
  --theme-error: #ef4444;
  --theme-info: #3b82f6;

  /* ==================== NAVBAR ==================== */

  --navbar-bg: rgba(255, 255, 255, 0.95);
  --navbar-text: #374151;
  --navbar-text-hover: #ec4899;
  --navbar-border: #e5e7eb;
  --navbar-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  --navbar-brand-color: #db2777;
  --navbar-icon-color: #6b7280;
  --navbar-icon-hover: #ec4899;

  /* ==================== HERO SECTION ==================== */

  --hero-bg-start: #fdf2f8;
  --hero-bg-end: #fce7f3;
  --hero-title-color: #1f2937;
  --hero-subtitle-color: #6b7280;
  --hero-accent-color: #ec4899;
  --hero-shadow: 0 0 100px rgba(236, 72, 153, 0.1);

  /* ==================== CAROUSEL ==================== */

  --carousel-bg: #ffffff;
  --carousel-nav-bg: rgba(0, 0, 0, 0.5);
  --carousel-nav-hover: rgba(0, 0, 0, 0.7);
  --carousel-nav-color: #ffffff;
  --carousel-indicator-inactive: rgba(255, 255, 255, 0.4);
  --carousel-indicator-active: #ffffff;
  --carousel-indicator-bg: rgba(0, 0, 0, 0.5);
  --carousel-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* ==================== PRODUCT CARDS ==================== */

  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  --card-shadow-hover: 0 20px 25px rgba(0, 0, 0, 0.1);
  --card-title-color: #1f2937;
  --card-text-color: #6b7280;
  --card-price-color: #ec4899;
  --card-badge-bg: #ec4899;
  --card-badge-text: #ffffff;
  --card-overlay-bg: rgba(0, 0, 0, 0.7);

  /* ==================== BUTTONS ==================== */

  --btn-primary-bg: #ec4899;
  --btn-primary-hover: #db2777;
  --btn-primary-text: #ffffff;
  --btn-primary-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);

  --btn-secondary-bg: transparent;
  --btn-secondary-border: #ec4899;
  --btn-secondary-text: #ec4899;
  --btn-secondary-hover-bg: #ec4899;
  --btn-secondary-hover-text: #ffffff;

  --btn-warning-bg: #f59e0b;
  --btn-warning-hover: #d97706;
  --btn-warning-text: #ffffff;

  /* ==================== FOOTER ==================== */

  --footer-bg: #1f2937;
  --footer-text: #d1d5db;
  --footer-heading: #f9a8d4;
  --footer-link-hover: #ec4899;
  --footer-border: #374151;

  /* ==================== TESTIMONIALS ==================== */

  --testimonial-bg: #fdf2f8;
  --testimonial-border: #ec4899;
  --testimonial-text: #374151;
  --testimonial-author: #ec4899;
  --testimonial-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  /* ==================== FORMS ==================== */

  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --input-border-focus: #ec4899;
  --input-text: #1f2937;
  --input-placeholder: #9ca3af;
  --input-shadow-focus: 0 0 0 3px rgba(236, 72, 153, 0.1);

  /* ==================== BADGES ==================== */

  --badge-primary-bg: #ec4899;
  --badge-primary-text: #ffffff;
  --badge-secondary-bg: #10b981;
  --badge-secondary-text: #ffffff;
  --badge-warning-bg: #f59e0b;
  --badge-warning-text: #ffffff;

  /* ==================== SHADOWS ==================== */

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* ==================== TRANSITIONS ==================== */

  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-theme: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### 1.2 Modificar styles.css

**Archivo:** `/public/css/styles.css`

Añadir al inicio del archivo:

```css
/* ===== IMPORT THEME VARIABLES ===== */
@import './themes/base-variables.css';

/* ===== THEME TRANSITIONS ===== */
* {
  transition:
    background-color var(--transition-theme),
    color var(--transition-theme),
    border-color var(--transition-theme);
}

/* Excepciones (elementos que no deben transicionar) */
.no-theme-transition,
.product-carousel-image,
.carousel-nav,
button,
a {
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal),
    border-color var(--transition-normal),
    transform var(--transition-normal);
}
```

#### 1.3 Aplicar Variables a Componentes Existentes

**Archivo:** `/public/css/styles.css` (modificaciones)

```css
/* ===== NAVBAR ===== */
.navbar {
  background: var(--navbar-bg);
  backdrop-filter: blur(12px);
  box-shadow: var(--navbar-shadow);
  border-bottom: 1px solid var(--navbar-border);
}

.navbar-brand {
  color: var(--navbar-brand-color);
}

.brand-text {
  color: var(--navbar-brand-color);
}

.nav-link {
  color: var(--navbar-text);
}

.nav-link:hover {
  color: var(--navbar-text-hover);
}

.nav-icon {
  color: var(--navbar-icon-color);
}

.nav-icon:hover {
  color: var(--navbar-icon-hover);
}

.cart-badge {
  background: var(--badge-primary-bg);
  color: var(--badge-primary-text);
}

/* ===== HERO SECTION ===== */
.hero-section {
  background: linear-gradient(135deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%);
  box-shadow: inset 0 0 100px var(--hero-shadow);
}

.hero-title {
  color: var(--hero-title-color);
}

.hero-subtitle {
  color: var(--hero-subtitle-color);
}

/* ===== BUTTONS ===== */
.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  box-shadow: var(--btn-primary-shadow);
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
}

.btn-secondary {
  background: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
  border: 2px solid var(--btn-secondary-border);
}

.btn-secondary:hover {
  background: var(--btn-secondary-hover-bg);
  color: var(--btn-secondary-hover-text);
}

/* ===== PRODUCT CARDS ===== */
.product-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow);
}

.product-card:hover {
  box-shadow: var(--card-shadow-hover);
}

.product-card h3 {
  color: var(--card-title-color);
}

.product-card p {
  color: var(--card-text-color);
}

.product-card .price {
  color: var(--card-price-color);
}

/* ===== CAROUSEL ===== */
.carousel-nav {
  background-color: var(--carousel-nav-bg);
  color: var(--carousel-nav-color);
}

.carousel-nav:hover {
  background-color: var(--carousel-nav-hover);
}

.carousel-indicators {
  background-color: var(--carousel-indicator-bg);
}

.indicator-dot {
  background-color: var(--carousel-indicator-inactive);
}

.indicator-dot.active {
  background-color: var(--carousel-indicator-active);
}

/* ===== FOOTER ===== */
.footer-section {
  background-color: var(--footer-bg);
  color: var(--footer-text);
  border-top: 1px solid var(--footer-border);
}

.footer-section h6 {
  color: var(--footer-heading);
}

.footer-section a:hover {
  color: var(--footer-link-hover);
}

/* ===== TESTIMONIALS ===== */
.testimonial-card {
  background: var(--testimonial-bg);
  border-left: 4px solid var(--testimonial-border);
  box-shadow: var(--testimonial-shadow);
}

.testimonial-quote {
  color: var(--testimonial-text);
}

.testimonial-author {
  color: var(--testimonial-author);
}

/* ===== FORMS ===== */
input[type='text'],
input[type='email'],
input[type='tel'],
input[type='search'],
input[type='password'],
input[type='number'],
textarea,
select {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--input-text);
}

input::placeholder,
textarea::placeholder {
  color: var(--input-placeholder);
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--input-border-focus);
  box-shadow: var(--input-shadow-focus);
}

/* ===== BADGES ===== */
.badge {
  background: var(--badge-primary-bg);
  color: var(--badge-primary-text);
}

.badge-secondary {
  background: var(--badge-secondary-bg);
  color: var(--badge-secondary-text);
}

.badge-warning {
  background: var(--badge-warning-bg);
  color: var(--badge-warning-text);
}
```

### Entregables Fase 1

- ✅ `/public/css/themes/base-variables.css` creado
- ✅ `/public/css/styles.css` modificado con variables
- ✅ Todos los componentes usan variables CSS

### Testing Fase 1

```bash
# 1. Verificar que no hay errores de CSS
npm run build:css

# 2. Abrir navegador y verificar que todo se ve igual
# 3. Cambiar manualmente variables en DevTools para probar
```

---

## 🎨 Fase 2: Gestor de Temas

### Objetivos

- Crear definiciones de los 7 temas
- Implementar ThemeManager
- Generar CSS inline para texturas

### Tareas

#### 2.1 Definiciones de Temas

**Archivo:** `/public/js/themes/themeDefinitions.js`

```javascript
/**
 * FloresYa - Definiciones de Temas
 * Cada tema define sus colores mediante variables CSS
 */

export const themes = {
  light: {
    id: 'light',
    name: 'Claro',
    description: 'Tema claro clásico',
    icon: '☀️',
    category: 'basic',
    variables: {
      // Primarios
      '--theme-primary': '#ec4899',
      '--theme-primary-dark': '#db2777',
      '--theme-primary-light': '#f9a8d4',
      '--theme-primary-hover': '#be185d',

      // Secundarios
      '--theme-secondary': '#10b981',
      '--theme-secondary-dark': '#059669',
      '--theme-secondary-light': '#6ee7b7',

      // Acentos
      '--theme-accent': '#f59e0b',
      '--theme-accent-dark': '#d97706',
      '--theme-accent-light': '#fbbf24',

      // Fondos
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#f8fafc',
      '--theme-bg-tertiary': '#f1f5f9',

      // Texto
      '--theme-text-primary': '#1f2937',
      '--theme-text-secondary': '#6b7280',
      '--theme-text-tertiary': '#9ca3af',
      '--theme-text-inverted': '#ffffff',

      // Bordes
      '--theme-border-light': '#e5e7eb',
      '--theme-border-medium': '#d1d5db',
      '--theme-border-dark': '#9ca3af',

      // Navbar
      '--navbar-bg': 'rgba(255, 255, 255, 0.95)',
      '--navbar-text': '#374151',
      '--navbar-text-hover': '#ec4899',
      '--navbar-border': '#e5e7eb',
      '--navbar-shadow': '0 2px 12px rgba(0, 0, 0, 0.08)',
      '--navbar-brand-color': '#db2777',
      '--navbar-icon-color': '#6b7280',
      '--navbar-icon-hover': '#ec4899',

      // Hero
      '--hero-bg-start': '#fdf2f8',
      '--hero-bg-end': '#fce7f3',
      '--hero-title-color': '#1f2937',
      '--hero-subtitle-color': '#6b7280',
      '--hero-accent-color': '#ec4899',

      // Cards
      '--card-bg': '#ffffff',
      '--card-border': '#e5e7eb',
      '--card-shadow': '0 4px 6px rgba(0, 0, 0, 0.05)',
      '--card-shadow-hover': '0 20px 25px rgba(0, 0, 0, 0.1)',
      '--card-title-color': '#1f2937',
      '--card-text-color': '#6b7280',
      '--card-price-color': '#ec4899',

      // Buttons
      '--btn-primary-bg': '#ec4899',
      '--btn-primary-hover': '#db2777',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#ec4899',
      '--btn-secondary-text': '#ec4899',

      // Footer
      '--footer-bg': '#1f2937',
      '--footer-text': '#d1d5db',
      '--footer-heading': '#f9a8d4',
      '--footer-link-hover': '#ec4899',

      // Carousel
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(0, 0, 0, 0.5)',
      '--carousel-nav-hover': 'rgba(0, 0, 0, 0.7)',
      '--carousel-indicator-inactive': 'rgba(255, 255, 255, 0.4)',
      '--carousel-indicator-active': '#ffffff'
    }
  },

  dark: {
    id: 'dark',
    name: 'Oscuro',
    description: 'Tema oscuro para reducir fatiga visual',
    icon: '🌙',
    category: 'basic',
    variables: {
      // Primarios
      '--theme-primary': '#f472b6',
      '--theme-primary-dark': '#ec4899',
      '--theme-primary-light': '#fbcfe8',
      '--theme-primary-hover': '#db2777',

      // Fondos
      '--theme-bg-primary': '#0f172a',
      '--theme-bg-secondary': '#1e293b',
      '--theme-bg-tertiary': '#334155',

      // Texto
      '--theme-text-primary': '#f1f5f9',
      '--theme-text-secondary': '#cbd5e1',
      '--theme-text-tertiary': '#94a3b8',
      '--theme-text-inverted': '#0f172a',

      // Bordes
      '--theme-border-light': '#334155',
      '--theme-border-medium': '#475569',
      '--theme-border-dark': '#64748b',

      // Navbar
      '--navbar-bg': 'rgba(15, 23, 42, 0.95)',
      '--navbar-text': '#cbd5e1',
      '--navbar-text-hover': '#f472b6',
      '--navbar-border': '#334155',
      '--navbar-shadow': '0 2px 12px rgba(0, 0, 0, 0.3)',
      '--navbar-brand-color': '#f472b6',
      '--navbar-icon-color': '#94a3b8',
      '--navbar-icon-hover': '#f472b6',

      // Hero
      '--hero-bg-start': '#1e293b',
      '--hero-bg-end': '#334155',
      '--hero-title-color': '#f1f5f9',
      '--hero-subtitle-color': '#cbd5e1',
      '--hero-accent-color': '#f472b6',

      // Cards
      '--card-bg': '#1e293b',
      '--card-border': '#334155',
      '--card-shadow': '0 4px 6px rgba(0, 0, 0, 0.3)',
      '--card-shadow-hover': '0 20px 25px rgba(0, 0, 0, 0.4)',
      '--card-title-color': '#f1f5f9',
      '--card-text-color': '#cbd5e1',
      '--card-price-color': '#f472b6',

      // Buttons
      '--btn-primary-bg': '#f472b6',
      '--btn-primary-hover': '#ec4899',
      '--btn-primary-text': '#0f172a',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#f472b6',
      '--btn-secondary-text': '#f472b6',

      // Footer
      '--footer-bg': '#020617',
      '--footer-text': '#94a3b8',
      '--footer-heading': '#f472b6',
      '--footer-link-hover': '#fbcfe8',

      // Carousel
      '--carousel-bg': '#1e293b',
      '--carousel-nav-bg': 'rgba(241, 245, 249, 0.1)',
      '--carousel-nav-hover': 'rgba(241, 245, 249, 0.2)',
      '--carousel-indicator-inactive': 'rgba(241, 245, 249, 0.3)',
      '--carousel-indicator-active': '#f472b6'
    }
  },

  eleganciaModerna: {
    id: 'eleganciaModerna',
    name: 'Elegancia Moderna',
    description: 'Minimalismo con mármol blanco y vetas azules',
    icon: '💎',
    category: 'premium',
    variables: {
      // Primarios
      '--theme-primary': '#1e293b',
      '--theme-primary-dark': '#0f172a',
      '--theme-primary-light': '#334155',

      // Secundarios
      '--theme-secondary': '#3b82f6',
      '--theme-secondary-dark': '#2563eb',
      '--theme-secondary-light': '#60a5fa',

      // Acentos
      '--theme-accent': '#8b5cf6',
      '--theme-accent-dark': '#7c3aed',
      '--theme-accent-light': '#a78bfa',

      // Fondos
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#f8fafc',
      '--theme-bg-tertiary': '#f1f5f9',

      // Texto
      '--theme-text-primary': '#334155',
      '--theme-text-secondary': '#64748b',
      '--theme-text-tertiary': '#94a3b8',

      // Navbar
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-text': '#64748b',
      '--navbar-text-hover': '#3b82f6',
      '--navbar-brand-color': '#1e293b',

      // Hero
      '--hero-bg-start': '#f8fafc',
      '--hero-bg-end': '#f1f5f9',
      '--hero-title-color': '#1e293b',
      '--hero-subtitle-color': '#64748b',

      // Cards
      '--card-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-border': 'rgba(226, 232, 240, 0.6)',
      '--card-title-color': '#1e293b',
      '--card-price-color': '#3b82f6',

      // Buttons
      '--btn-primary-bg': '#1e293b',
      '--btn-primary-hover': '#0f172a',
      '--btn-secondary-border': '#3b82f6',

      // Footer
      '--footer-bg': '#0f172a',
      '--footer-text': '#cbd5e1',
      '--footer-heading': '#60a5fa'
    }
  },

  vintageRomantico: {
    id: 'vintageRomantico',
    name: 'Vintage Romántico',
    description: 'Papel antiguo con flores vintage',
    icon: '🌸',
    category: 'premium',
    variables: {
      // Primarios
      '--theme-primary': '#e3b5a4',
      '--theme-primary-dark': '#d4a59a',
      '--theme-primary-light': '#f5e1d8',

      // Acentos
      '--theme-accent': '#d4af37',
      '--theme-accent-dark': '#c9a02b',
      '--theme-accent-light': '#e8c878',

      // Fondos
      '--theme-bg-primary': '#fef5f7',
      '--theme-bg-secondary': '#fce8ec',
      '--theme-bg-tertiary': '#f9ecef',

      // Texto
      '--theme-text-primary': '#6b5b52',
      '--theme-text-secondary': '#8b7267',
      '--theme-text-tertiary': '#a89489',

      // Navbar
      '--navbar-bg': 'rgba(255, 249, 249, 0.98)',
      '--navbar-text': '#8b7267',
      '--navbar-text-hover': '#d4af37',
      '--navbar-brand-color': '#d4a59a',
      '--navbar-border': '#f5d4cf',

      // Hero
      '--hero-bg-start': '#fef5f7',
      '--hero-bg-end': '#fce8ec',
      '--hero-title-color': '#d4a59a',
      '--hero-subtitle-color': '#8b7267',

      // Cards
      '--card-bg': '#fffbf8',
      '--card-border': '#f5d4cf',
      '--card-title-color': '#d4a59a',
      '--card-price-color': '#d4af37',

      // Buttons
      '--btn-primary-bg': '#e3b5a4',
      '--btn-primary-hover': '#d4a59a',
      '--btn-secondary-border': '#f5d4cf',

      // Footer
      '--footer-bg': '#4a3f39',
      '--footer-text': '#e3ccc4',
      '--footer-heading': '#d4af37'
    }
  },

  tropicalVibrante: {
    id: 'tropicalVibrante',
    name: 'Tropical Vibrante',
    description: 'Energía tropical con colores vivos',
    icon: '🌺',
    category: 'premium',
    variables: {
      // Primarios
      '--theme-primary': '#10b981',
      '--theme-primary-dark': '#059669',
      '--theme-primary-light': '#6ee7b7',

      // Secundarios
      '--theme-secondary': '#14b8a6',
      '--theme-secondary-dark': '#0d9488',
      '--theme-secondary-light': '#5eead4',

      // Acentos
      '--theme-accent': '#f59e0b',
      '--theme-accent-dark': '#d97706',
      '--theme-accent-light': '#fbbf24',

      // Fondos
      '--theme-bg-primary': '#ecfdf5',
      '--theme-bg-secondary': '#d1fae5',
      '--theme-bg-tertiary': '#a7f3d0',

      // Texto
      '--theme-text-primary': '#064e3b',
      '--theme-text-secondary': '#065f46',
      '--theme-text-tertiary': '#047857',

      // Navbar
      '--navbar-bg': 'rgba(236, 253, 245, 0.98)',
      '--navbar-text': '#065f46',
      '--navbar-text-hover': '#10b981',
      '--navbar-brand-color': '#10b981',
      '--navbar-border': '#10b981',

      // Hero
      '--hero-bg-start': '#ecfdf5',
      '--hero-bg-end': '#d1fae5',
      '--hero-title-color': '#064e3b',
      '--hero-subtitle-color': '#065f46',

      // Cards
      '--card-bg': '#ffffff',
      '--card-border': '#d1fae5',
      '--card-title-color': '#064e3b',
      '--card-price-color': '#10b981',

      // Buttons
      '--btn-primary-bg': '#10b981',
      '--btn-primary-hover': '#059669',
      '--btn-secondary-border': '#14b8a6',

      // Footer
      '--footer-bg': '#064e3b',
      '--footer-text': '#d1fae5',
      '--footer-heading': '#6ee7b7'
    }
  },

  jardinNatural: {
    id: 'jardinNatural',
    name: 'Jardín Natural',
    description: 'Naturaleza orgánica y serena',
    icon: '🌿',
    category: 'premium',
    variables: {
      // Primarios
      '--theme-primary': '#22c55e',
      '--theme-primary-dark': '#16a34a',
      '--theme-primary-light': '#86efac',

      // Secundarios
      '--theme-secondary': '#84cc16',
      '--theme-secondary-dark': '#65a30d',
      '--theme-secondary-light': '#bef264',

      // Acentos
      '--theme-accent': '#eab308',
      '--theme-accent-dark': '#ca8a04',
      '--theme-accent-light': '#fde047',

      // Fondos
      '--theme-bg-primary': '#f7fee7',
      '--theme-bg-secondary': '#ecfccb',
      '--theme-bg-tertiary': '#d9f99d',

      // Texto
      '--theme-text-primary': '#1a2e05',
      '--theme-text-secondary': '#365314',
      '--theme-text-tertiary': '#4d7c0f',

      // Navbar
      '--navbar-bg': 'rgba(247, 254, 231, 0.98)',
      '--navbar-text': '#365314',
      '--navbar-text-hover': '#22c55e',
      '--navbar-brand-color': '#16a34a',

      // Hero
      '--hero-bg-start': '#f7fee7',
      '--hero-bg-end': '#ecfccb',
      '--hero-title-color': '#1a2e05',

      // Cards
      '--card-bg': '#ffffff',
      '--card-border': '#d9f99d',
      '--card-title-color': '#1a2e05',
      '--card-price-color': '#22c55e',

      // Buttons
      '--btn-primary-bg': '#22c55e',
      '--btn-primary-hover': '#16a34a',

      // Footer
      '--footer-bg': '#14532d',
      '--footer-text': '#d9f99d',
      '--footer-heading': '#86efac'
    }
  },

  zenMinimalista: {
    id: 'zenMinimalista',
    name: 'Zen Minimalista',
    description: 'Minimalismo tranquilo y equilibrado',
    icon: '🧘',
    category: 'premium',
    variables: {
      // Primarios
      '--theme-primary': '#78716c',
      '--theme-primary-dark': '#57534e',
      '--theme-primary-light': '#a8a29e',

      // Secundarios
      '--theme-secondary': '#059669',
      '--theme-secondary-dark': '#047857',
      '--theme-secondary-light': '#10b981',

      // Acentos
      '--theme-accent': '#d97706',
      '--theme-accent-dark': '#b45309',
      '--theme-accent-light': '#f59e0b',

      // Fondos
      '--theme-bg-primary': '#fafaf9',
      '--theme-bg-secondary': '#f5f5f4',
      '--theme-bg-tertiary': '#e7e5e4',

      // Texto
      '--theme-text-primary': '#1c1917',
      '--theme-text-secondary': '#44403c',
      '--theme-text-tertiary': '#78716c',

      // Navbar
      '--navbar-bg': 'rgba(250, 250, 249, 0.98)',
      '--navbar-text': '#44403c',
      '--navbar-text-hover': '#78716c',
      '--navbar-brand-color': '#57534e',

      // Hero
      '--hero-bg-start': '#fafaf9',
      '--hero-bg-end': '#f5f5f4',
      '--hero-title-color': '#1c1917',

      // Cards
      '--card-bg': '#ffffff',
      '--card-border': '#e7e5e4',
      '--card-title-color': '#1c1917',
      '--card-price-color': '#78716c',

      // Buttons
      '--btn-primary-bg': '#78716c',
      '--btn-primary-hover': '#57534e',

      // Footer
      '--footer-bg': '#292524',
      '--footer-text': '#d6d3d1',
      '--footer-heading': '#a8a29e'
    }
  }
}

export const DEFAULT_THEME = 'light'
export const THEME_STORAGE_KEY = 'floresya-theme-preference'

/**
 * Obtiene lista de temas por categoría
 */
export function getThemesByCategory(category) {
  return Object.values(themes).filter(theme => theme.category === category)
}

/**
 * Obtiene información de un tema
 */
export function getTheme(themeId) {
  return themes[themeId] || themes[DEFAULT_THEME]
}
```

#### 2.2 CSS Inline por Tema (Texturas)

**Archivo:** `/public/js/themes/themeStyles.js`

```javascript
/**
 * FloresYa - Estilos CSS Inline por Tema
 * Contiene las texturas y backgrounds complejos de cada tema
 */

export const themeStyles = {
  light: `
    /* Tema Light - Sin texturas especiales */
    body {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
    }

    .hero-section {
      background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
    }
  `,

  dark: `
    /* Tema Dark - Sin texturas especiales */
    body {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    }

    .hero-section {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }
  `,

  eleganciaModerna: `
    /* ==================== ELEGANCIA MODERNA ==================== */
    /* Mármol blanco Carrara con vetas azules */

    body {
      background:
        /* Vetas de mármol diagonales principales */
        linear-gradient(
          125deg,
          transparent 0%,
          transparent 45%,
          rgba(59, 130, 246, 0.15) 47%,
          rgba(71, 139, 252, 0.18) 48%,
          rgba(59, 130, 246, 0.15) 49%,
          transparent 51%,
          transparent 100%
        ),
        linear-gradient(
          -35deg,
          transparent 0%,
          transparent 62%,
          rgba(139, 92, 246, 0.12) 64%,
          rgba(147, 102, 251, 0.14) 65%,
          rgba(139, 92, 246, 0.12) 66%,
          transparent 68%,
          transparent 100%
        ),
        /* Base mármol blanco */
        linear-gradient(
          135deg,
          #ffffff 0%,
          #f8fafc 15%,
          #f1f5f9 30%,
          #f8fafc 50%,
          #ffffff 70%,
          #f8fafc 85%,
          #ffffff 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(
        ellipse at top right,
        rgba(59, 130, 246, 0.22) 0%,
        rgba(59, 130, 246, 0.15) 20%,
        rgba(139, 92, 246, 0.1) 40%,
        transparent 60%
      );
      pointer-events: none;
      z-index: 0;
    }

    .navbar {
      background:
        linear-gradient(
          135deg,
          transparent 48%,
          rgba(59, 130, 246, 0.03) 48%,
          rgba(59, 130, 246, 0.03) 52%,
          transparent 52%
        ),
        rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
    }

    .hero-section {
      background:
        /* Flores art déco en esquinas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.8"><path d="M60,60 L80,40 L100,60 L80,80 Z" fill="%233b82f6" opacity="0.2"/><circle cx="80" cy="60" r="12" fill="%233b82f6" opacity="0.2"/></g></svg>'),
        /* Degradado base */
        linear-gradient(135deg, #f8fafc 0%, #ffffff 40%, #f1f5f9 100%);
      background-size: 1200px 800px, 100% 100%;
      background-position: center;
    }

    .product-card {
      background:
        /* Vetas sutiles */
        linear-gradient(
          135deg,
          transparent 48%,
          rgba(59, 130, 246, 0.08) 49%,
          rgba(59, 130, 246, 0.12) 50%,
          rgba(59, 130, 246, 0.08) 51%,
          transparent 52%
        ),
        /* Base glassmorphism */
        linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 100%);
      backdrop-filter: blur(10px);
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1px;
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.3) 0%,
        rgba(139, 92, 246, 0.2) 50%,
        rgba(59, 130, 246, 0.1) 100%
      );
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s;
    }

    .product-card:hover::before {
      opacity: 1;
    }
  `,

  vintageRomantico: `
    /* ==================== VINTAGE ROMÁNTICO ==================== */
    /* Jardín de rosas vintage sobre papel antiguo */

    body {
      background:
        /* Rosas grandes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><defs><radialGradient id="rose1"><stop offset="0%" stop-color="%23e3b5a4" stop-opacity="0.7"/><stop offset="50%" stop-color="%23d4a59a" stop-opacity="0.5"/><stop offset="100%" stop-color="%23c9a89a" stop-opacity="0.2"/></radialGradient></defs><g opacity="0.85"><g transform="translate(120,150) rotate(-15)"><circle cx="0" cy="0" r="45" fill="url(%23rose1)"/><circle cx="0" cy="0" r="18" fill="%23d4a59a" opacity="0.7"/></g><g transform="translate(480,380) rotate(25)"><circle cx="0" cy="0" r="50" fill="%23f5d4cf" opacity="0.6"/><circle cx="0" cy="0" r="20" fill="%23e3b5a4" opacity="0.65"/></g></g></svg>'),
        /* Pétalos dispersos */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><g opacity="0.35"><ellipse cx="40" cy="50" rx="12" ry="18" fill="%23f5d4cf" transform="rotate(30 40 50)"/><ellipse cx="180" cy="90" rx="10" ry="16" fill="%23e3b5a4" transform="rotate(-45 180 90)"/></g></svg>'),
        /* Base papel envejecido */
        linear-gradient(
          135deg,
          #fef5f7 0%,
          #fce8ec 20%,
          #f9ecef 40%,
          #fce8ec 60%,
          #fef5f7 80%,
          #f9ecef 100%
        );
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        /* Bordes quemados */
        radial-gradient(
          ellipse at top,
          transparent 60%,
          rgba(139, 105, 75, 0.15) 90%,
          rgba(107, 91, 82, 0.2) 100%
        ) no-repeat,
        radial-gradient(
          ellipse at bottom,
          transparent 60%,
          rgba(139, 105, 75, 0.15) 90%,
          rgba(107, 91, 82, 0.2) 100%
        ) no-repeat;
      background-size: 100% 200px, 100% 200px;
      background-position: top, bottom;
      pointer-events: none;
      z-index: 0;
    }

    .navbar {
      background:
        linear-gradient(135deg, #fff9f9 0%, #fef5f7 100%);
      border-bottom: 2px solid #f5d4cf;
    }

    .navbar::after {
      content: '✿ ❀ ✿';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      color: #e3b5a4;
      font-size: 0.75rem;
      opacity: 0.5;
      letter-spacing: 1rem;
    }

    .hero-section {
      background:
        /* Rosas vintage en esquinas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.8"><g transform="translate(100,100) rotate(-15)"><circle cx="0" cy="0" r="50" fill="%23e3b5a4" opacity="0.25"/><circle cx="0" cy="0" r="20" fill="%23d4a59a" opacity="0.25"/></g></g></svg>'),
        /* Marco dorado */
        linear-gradient(
          to right,
          rgba(212, 175, 55, 0.25) 0%,
          rgba(212, 175, 55, 0.15) 1%,
          transparent 3%,
          transparent 97%,
          rgba(212, 175, 55, 0.15) 99%,
          rgba(212, 175, 55, 0.25) 100%
        ),
        /* Base */
        linear-gradient(135deg, #fef5f7 0%, #fce8ec 50%, #fef5f7 100%);
    }

    .hero-section::after {
      content: '❀';
      position: absolute;
      bottom: 10%;
      left: 5%;
      font-size: 22rem;
      color: #d4af37;
      opacity: 0.22;
      transform: rotate(25deg);
      animation: gentle-spin 20s ease-in-out infinite;
    }

    @keyframes gentle-spin {
      0%, 100% {
        transform: rotate(25deg) scale(1);
      }
      50% {
        transform: rotate(30deg) scale(1.05);
      }
    }

    .product-card {
      background:
        /* Rosas en esquinas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><g opacity="0.5"><g transform="translate(60,60) rotate(-15)"><circle cx="0" cy="0" r="30" fill="%23e3b5a4" opacity="0.4"/></g></g></svg>'),
        /* Base crema */
        linear-gradient(135deg, #fffbf8 0%, #fef5f7 100%);
      border: 3px solid transparent;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: -3px;
      background: repeating-linear-gradient(
        45deg,
        #d4af37 0px,
        #e8c878 2px,
        #d4af37 4px,
        #c9a02b 6px
      );
      border-radius: 20px;
      opacity: 0;
      transition: opacity 0.4s;
      z-index: -1;
    }

    .product-card:hover::before {
      opacity: 1;
    }

    .product-card::after {
      content: '✿';
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 50px;
      color: #d4af37;
      opacity: 0.1;
    }
  `,

  tropicalVibrante: `
    /* ==================== TROPICAL VIBRANTE ==================== */
    /* Selva tropical con flores hibiscus y orquídeas */

    body {
      background:
        /* Flores hibiscus grandes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><defs><radialGradient id="hibiscus1"><stop offset="0%" stop-color="%23fb7185" stop-opacity="0.75"/><stop offset="60%" stop-color="%23f43f5e" stop-opacity="0.5"/><stop offset="100%" stop-color="%23fb7185" stop-opacity="0.2"/></radialGradient></defs><g opacity="0.9"><g transform="translate(150,180) rotate(15)"><path d="M0,-40 Q20,-50 35,-35 Q48,-18 42,0 Q35,20 15,30 Q-5,35 -25,25 Q-42,12 -45,-10 Q-42,-30 -22,-42 Q0,-48 0,-40 Z" fill="url(%23hibiscus1)"/><circle cx="0" cy="0" r="12" fill="%23f59e0b" opacity="0.9"/></g></g></svg>'),
        /* Hojas monstera */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><g opacity="0.4"><path d="M200,300 Q180,350 170,400 Q180,450 200,500 Q220,450 230,400 Q220,350 200,300 Z" fill="%2310b981"/><ellipse cx="190" cy="360" rx="15" ry="20" fill="%23ecfdf5" opacity="0.5"/></g></svg>'),
        /* Degradado tropical */
        linear-gradient(
          135deg,
          #d1fae5 0%,
          #a7f3d0 20%,
          #6ee7b7 40%,
          #34d399 60%,
          #10b981 80%,
          #059669 100%
        );
      animation: tropical-breeze 40s linear infinite;
    }

    @keyframes tropical-breeze {
      0% { background-position: 0 0, 100px 50px, 0 0; }
      100% { background-position: 400px 400px, 500px 450px, 0 0; }
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g opacity="0.15" fill="%23065f46"><path d="M100,100 Q120,90 140,100 Q130,110 120,105 Q110,110 100,100 Z"/></g></svg>');
      animation: birds-fly 60s linear infinite;
      pointer-events: none;
    }

    @keyframes birds-fly {
      0% { background-position: -800px center; }
      100% { background-position: 1600px center; }
    }

    .hero-section {
      background:
        /* Hibiscus gigantes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><g opacity="0.85"><g transform="translate(150,150) rotate(-15)"><path d="M0,-50 Q25,-60 45,-42 Q60,-22 52,2 Q42,28 18,38 Q-8,42 -32,32 Q-52,18 -56,-14 Q-52,-40 -28,-54 Q0,-60 0,-50 Z" fill="%23fb7185" opacity="0.5"/><circle cx="0" cy="0" r="18" fill="%23f59e0b" opacity="0.6"/></g></g></svg>'),
        /* Hojas colgantes */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="250"><g opacity="0.5"><path d="M100,0 Q115,-25 130,0 L130,110 Q115,140 100,110 Z" fill="%2310b981"/></g></svg>') no-repeat top center,
        /* Degradado */
        linear-gradient(135deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 70%, #6ee7b7 100%);
    }

    .hero-section::after {
      content: '🌺';
      position: absolute;
      top: 15%;
      right: -3%;
      font-size: 28rem;
      opacity: 0.35;
      transform: rotate(-20deg);
      animation: pulse-tropical 4s ease-in-out infinite;
      filter: drop-shadow(0 0 30px rgba(251, 113, 133, 0.5));
    }

    @keyframes pulse-tropical {
      0%, 100% {
        transform: rotate(-20deg) scale(1);
        opacity: 0.35;
      }
      50% {
        transform: rotate(-15deg) scale(1.08);
        opacity: 0.5;
      }
    }

    .product-card {
      background:
        /* Flores decorativas */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><g opacity="0.45"><g transform="translate(60,60)"><path d="M0,-16 Q8,-20 13,-13 Q18,-5 10,-1 Q0,3 -10,-1 Q-18,-5 -13,-13 Q-8,-20 0,-16 Z" fill="%23fb7185"/><circle cx="0" cy="-5" r="9" fill="%23f59e0b"/></g></g></svg>'),
        /* Base */
        white;
      border: 3px solid transparent;
    }

    .product-card::before {
      content: '';
      position: absolute;
      inset: -3px;
      background: linear-gradient(
        135deg,
        #10b981,
        #14b8a6,
        #f59e0b
      );
      border-radius: 24px;
      opacity: 0;
      transition: opacity 0.4s;
      z-index: -1;
    }

    .product-card:hover::before {
      opacity: 1;
    }
  `,

  jardinNatural: `
    /* ==================== JARDÍN NATURAL ==================== */
    /* Naturaleza orgánica y serena */

    body {
      background:
        /* Hojas naturales */
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><g opacity="0.6"><path d="M100,50 Q80,100 70,150 Q80,200 100,250 Q120,200 130,150 Q120,100 100,50 Z" fill="%2322c55e"/><ellipse cx="90" cy="120" rx="12" ry="20" fill="%23f7fee7" opacity="0.6"/></g></svg>'),
        /* Degradado natural */
        linear-gradient(
          135deg,
          #f7fee7 0%,
          #ecfccb 25%,
          #d9f99d 50%,
          #bef264 75%,
          #a3e635 100%
        );
    }

    .hero-section {
      background:
        linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%);
    }

    .product-card {
      background: white;
      border: 2px solid #d9f99d;
    }
  `,

  zenMinimalista: `
    /* ==================== ZEN MINIMALISTA ==================== */
    /* Minimalismo tranquilo y equilibrado */

    body {
      background:
        /* Textura sutil */
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 49px,
          rgba(120, 113, 108, 0.03) 49px,
          rgba(120, 113, 108, 0.03) 50px,
          transparent 50px,
          transparent 99px
        ),
        /* Base neutra */
        linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%);
    }

    .hero-section {
      background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%);
    }

    .product-card {
      background: white;
      border: 1px solid #e7e5e4;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  `
}
```

#### 2.3 Theme Manager

**Archivo:** `/public/js/themes/themeManager.js`

```javascript
import { themes, DEFAULT_THEME, THEME_STORAGE_KEY } from './themeDefinitions.js'
import { themeStyles } from './themeStyles.js'

/**
 * Theme Manager - Gestor Central de Temas
 * Maneja la aplicación de temas, persistencia y eventos
 */
export class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || DEFAULT_THEME
    this.styleElement = null
  }

  /**
   * Inicializa el sistema de temas
   */
  init() {
    console.log('🎨 [ThemeManager] Initializing...')

    // Crear elemento <style> para CSS inline
    this.createStyleElement()

    // Aplicar tema guardado
    this.applyTheme(this.currentTheme, false)

    // Escuchar cambios en otras pestañas
    window.addEventListener('storage', e => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        console.log('🎨 [ThemeManager] Theme changed in another tab:', e.newValue)
        this.applyTheme(e.newValue, false)
      }
    })

    console.log('✅ [ThemeManager] Initialized with theme:', this.currentTheme)
  }

  /**
   * Crea el elemento <style> para CSS inline
   */
  createStyleElement() {
    this.styleElement = document.createElement('style')
    this.styleElement.id = 'theme-dynamic-styles'
    document.head.appendChild(this.styleElement)
  }

  /**
   * Obtiene el tema guardado en localStorage
   */
  getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && themes[stored]) {
        return stored
      }
      return null
    } catch (error) {
      console.warn('⚠️ [ThemeManager] Could not read stored theme:', error)
      return null
    }
  }

  /**
   * Guarda el tema en localStorage
   */
  saveTheme(themeId) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
      console.log('💾 [ThemeManager] Theme saved:', themeId)
    } catch (error) {
      console.warn('⚠️ [ThemeManager] Could not save theme:', error)
    }
  }

  /**
   * Aplica un tema específico
   * @param {string} themeId - ID del tema a aplicar
   * @param {boolean} save - Si debe guardarse en localStorage
   */
  applyTheme(themeId, save = true) {
    const theme = themes[themeId]

    if (!theme) {
      console.error('❌ [ThemeManager] Theme not found:', themeId)
      return false
    }

    console.log('🎨 [ThemeManager] Applying theme:', theme.name)

    // 1. Aplicar variables CSS (colores)
    this.applyThemeVariables(theme.variables)

    // 2. Aplicar CSS inline (texturas)
    this.applyThemeStyles(themeId)

    // 3. Actualizar data attribute en body
    document.body.setAttribute('data-theme', themeId)

    // 4. Guardar en localStorage si se solicita
    if (save) {
      this.saveTheme(themeId)
    }

    // 5. Actualizar estado interno
    this.currentTheme = themeId

    // 6. Emitir evento personalizado
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: {
          themeId,
          themeName: theme.name,
          themeData: theme
        }
      })
    )

    console.log('✅ [ThemeManager] Theme applied successfully:', theme.name)
    return true
  }

  /**
   * Aplica las variables CSS del tema
   */
  applyThemeVariables(variables) {
    const root = document.documentElement

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    console.log('✅ [ThemeManager] Applied', Object.keys(variables).length, 'CSS variables')
  }

  /**
   * Aplica los estilos inline del tema (texturas)
   */
  applyThemeStyles(themeId) {
    if (!this.styleElement) {
      console.warn('⚠️ [ThemeManager] Style element not found, creating...')
      this.createStyleElement()
    }

    const styles = themeStyles[themeId] || ''
    this.styleElement.textContent = styles

    console.log('✅ [ThemeManager] Applied inline styles for theme:', themeId)
  }

  /**
   * Cambia al siguiente tema disponible (ciclado)
   */
  cycleTheme() {
    const themeIds = Object.keys(themes)
    const currentIndex = themeIds.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themeIds.length
    const nextThemeId = themeIds[nextIndex]

    console.log('🔄 [ThemeManager] Cycling to next theme:', nextThemeId)
    return this.setTheme(nextThemeId)
  }

  /**
   * Establece un tema específico
   */
  setTheme(themeId) {
    return this.applyTheme(themeId, true)
  }

  /**
   * Obtiene el ID del tema actual
   */
  getCurrentTheme() {
    return this.currentTheme
  }

  /**
   * Obtiene la definición del tema actual
   */
  getCurrentThemeDefinition() {
    return themes[this.currentTheme] || themes[DEFAULT_THEME]
  }

  /**
   * Obtiene lista de todos los temas disponibles
   */
  getAvailableThemes() {
    return Object.values(themes).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      icon: theme.icon,
      category: theme.category
    }))
  }

  /**
   * Obtiene temas por categoría
   */
  getThemesByCategory(category) {
    return this.getAvailableThemes().filter(theme => theme.category === category)
  }
}

// Instancia global singleton
export const themeManager = new ThemeManager()

// Export por defecto
export default themeManager
```

### Entregables Fase 2

- ✅ `/public/js/themes/themeDefinitions.js` creado
- ✅ `/public/js/themes/themeStyles.js` creado
- ✅ `/public/js/themes/themeManager.js` creado
- ✅ 7 temas definidos (2 básicos + 5 premium)

### Testing Fase 2

```javascript
// En consola del navegador:
import('/js/themes/themeManager.js').then(m => {
  const tm = m.themeManager
  tm.init()

  // Probar cambio de tema
  tm.setTheme('dark')
  tm.setTheme('eleganciaModerna')
  tm.setTheme('tropicalVibrante')

  // Probar ciclado
  tm.cycleTheme()
})
```

---

## 🎛️ Fase 3: Componente UI

### Objetivos

- Crear selector dropdown en navbar
- Implementar UI responsive
- Integrar con ThemeManager

### Tareas

#### 3.1 Theme Selector Component

**Archivo:** `/public/js/components/ThemeSelector.js`

```javascript
import { themeManager } from '../themes/themeManager.js'
import { createIcons } from '../'

/**
 * Theme Selector Component
 * Dropdown en navbar para seleccionar temas
 */
export class ThemeSelector {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.dropdown = null
    this.toggleBtn = null
    this.isOpen = false

    if (!this.container) {
      console.error('❌ [ThemeSelector] Container not found:', containerId)
      return
    }

    this.init()
  }

  /**
   * Inicializa el componente
   */
  init() {
    console.log('🎨 [ThemeSelector] Initializing...')

    this.render()
    this.bindEvents()
    this.updateCurrentThemeDisplay()

    // Escuchar cambios de tema
    window.addEventListener('themeChanged', e => {
      console.log('🎨 [ThemeSelector] Theme changed event received:', e.detail)
      this.updateCurrentThemeDisplay()
    })

    console.log('✅ [ThemeSelector] Initialized')
  }

  /**
   * Renderiza el componente
   */
  render() {
    const currentTheme = themeManager.getCurrentThemeDefinition()
    const themes = themeManager.getAvailableThemes()

    this.container.innerHTML = `
      <div class="theme-selector relative">
        <!-- Toggle Button -->
        <button
          id="theme-toggle-btn"
          class="theme-toggle-btn flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          type="button"
          aria-label="Cambiar tema"
          aria-haspopup="true"
          aria-expanded="false"
          title="Cambiar tema (actual: ${currentTheme.name})"
        >
          <span class="text-xl">${currentTheme.icon}</span>
          <i data-lucide="chevron-down" class="h-4 w-4 text-gray-600 dark:text-gray-300 theme-chevron"></i>
        </button>

        <!-- Dropdown Menu -->
        <div
          id="theme-dropdown"
          class="theme-dropdown absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden z-50 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-toggle-btn"
        >
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Seleccionar Tema
              </h3>
              <a
                href="/pages/theme-gallery.html"
                class="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1"
                title="Ver galería de temas"
              >
                <i data-lucide="layout-grid" class="h-3 w-3"></i>
                Ver todos
              </a>
            </div>
          </div>

          <!-- Basic Themes -->
          <div class="py-2">
            <div class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Básicos
            </div>
            ${this.renderThemeGroup(themes.filter(t => t.category === 'basic'))}
          </div>

          <!-- Premium Themes -->
          <div class="py-2 border-t border-gray-200 dark:border-gray-700">
            <div class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Premium
            </div>
            ${this.renderThemeGroup(themes.filter(t => t.category === 'premium'))}
          </div>

          <!-- Actions -->
          <div class="border-t border-gray-200 dark:border-gray-700 py-2">
            <button
              id="cycle-theme-btn"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
              type="button"
              role="menuitem"
              title="Cambiar al siguiente tema"
            >
              <i data-lucide="refresh-ccw" class="h-4 w-4"></i>
              <span>Cambiar automáticamente</span>
            </button>
          </div>
        </div>
      </div>
    `

    // Renderizar iconos
    createIcons()

    // Guardar referencias
    this.toggleBtn = document.getElementById('theme-toggle-btn')
    this.dropdown = document.getElementById('theme-dropdown')
  }

  /**
   * Renderiza un grupo de temas
   */
  renderThemeGroup(themes) {
    return themes
      .map(
        theme => `
      <button
        class="theme-option w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between transition-colors group"
        type="button"
        role="menuitem"
        data-theme="${theme.id}"
        title="${theme.description}"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">${theme.icon}</span>
          <div>
            <div class="font-medium">${theme.name}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${theme.description}</div>
          </div>
        </div>
        <i data-lucide="check" class="h-4 w-4 text-pink-600 dark:text-pink-400 hidden theme-check"></i>
      </button>
    `
      )
      .join('')
  }

  /**
   * Vincula los eventos
   */
  bindEvents() {
    if (!this.toggleBtn || !this.dropdown) {
      console.error('❌ [ThemeSelector] Toggle button or dropdown not found')
      return
    }

    // Toggle dropdown
    this.toggleBtn.addEventListener('click', e => {
      e.stopPropagation()
      this.toggleDropdown()
    })

    // Seleccionar tema
    const themeOptions = this.dropdown.querySelectorAll('.theme-option')
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const themeId = option.dataset.theme
        console.log('🎨 [ThemeSelector] Theme selected:', themeId)
        themeManager.setTheme(themeId)
        this.closeDropdown()
      })
    })

    // Ciclar temas
    const cycleBtn = document.getElementById('cycle-theme-btn')
    if (cycleBtn) {
      cycleBtn.addEventListener('click', () => {
        console.log('🔄 [ThemeSelector] Cycling theme')
        themeManager.cycleTheme()
        this.closeDropdown()
      })
    }

    // Cerrar al hacer clic fuera
    document.addEventListener('click', e => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown()
      }
    })

    // Cerrar con ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDropdown()
      }
    })
  }

  /**
   * Alterna el dropdown
   */
  toggleDropdown() {
    this.isOpen = !this.isOpen

    if (this.isOpen) {
      this.openDropdown()
    } else {
      this.closeDropdown()
    }
  }

  /**
   * Abre el dropdown
   */
  openDropdown() {
    this.dropdown.classList.remove('hidden')
    this.toggleBtn.setAttribute('aria-expanded', 'true')
    this.isOpen = true

    // Rotar chevron
    const chevron = this.toggleBtn.querySelector('.theme-chevron')
    if (chevron) {
      chevron.style.transform = 'rotate(180deg)'
    }

    this.updateCurrentThemeDisplay()
    console.log('🎨 [ThemeSelector] Dropdown opened')
  }

  /**
   * Cierra el dropdown
   */
  closeDropdown() {
    this.dropdown.classList.add('hidden')
    this.toggleBtn.setAttribute('aria-expanded', 'false')
    this.isOpen = false

    // Rotar chevron
    const chevron = this.toggleBtn.querySelector('.theme-chevron')
    if (chevron) {
      chevron.style.transform = 'rotate(0deg)'
    }

    console.log('🎨 [ThemeSelector] Dropdown closed')
  }

  /**
   * Actualiza la visualización del tema actual
   */
  updateCurrentThemeDisplay() {
    const currentThemeId = themeManager.getCurrentTheme()
    const currentTheme = themeManager.getCurrentThemeDefinition()

    // Actualizar ícono en el botón
    const iconSpan = this.toggleBtn.querySelector('span')
    if (iconSpan) {
      iconSpan.textContent = currentTheme.icon
    }

    // Actualizar title
    this.toggleBtn.title = `Cambiar tema (actual: ${currentTheme.name})`

    // Actualizar checkmarks
    const themeOptions = this.dropdown.querySelectorAll('.theme-option')
    themeOptions.forEach(option => {
      const themeId = option.dataset.theme
      const checkIcon = option.querySelector('.theme-check')

      if (themeId === currentThemeId) {
        option.classList.add('bg-gray-100', 'dark:bg-gray-700')
        if (checkIcon) {
          checkIcon.classList.remove('hidden')
        }
      } else {
        option.classList.remove('bg-gray-100', 'dark:bg-gray-700')
        if (checkIcon) {
          checkIcon.classList.add('hidden')
        }
      }
    })

    // Re-renderizar iconos
    createIcons()
  }
}

export default ThemeSelector
```

#### 3.2 Estilos para Theme Selector

**Archivo:** `/public/css/styles.css` (añadir al final)

```css
/* ==================== THEME SELECTOR ==================== */

.theme-selector {
  position: relative;
}

.theme-toggle-btn {
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.theme-chevron {
  transition: transform var(--transition-normal);
}

.theme-dropdown {
  animation: dropdown-fade-in 200ms ease-out;
  transform-origin: top right;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.theme-option {
  cursor: pointer;
  user-select: none;
}

.theme-option:active {
  transform: scale(0.98);
}

.theme-check {
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .theme-dropdown {
    width: calc(100vw - 2rem);
    max-width: 20rem;
  }
}
```

#### 3.3 Integrar en index.html

**Archivo:** `/public/index.html` (modificar navbar)

```html
<!-- En la sección nav-actions, añadir antes del carrito -->
<div class="nav-actions">
  <!-- Theme Selector -->
  <div id="theme-selector-container"></div>

  <!-- Carrito (existente) -->
  <a href="/pages/cart.html" class="nav-icon" aria-label="Carrito">
    <i data-lucide="shopping-cart" class="icon"></i>
    <span class="cart-badge">0</span>
  </a>

  <!-- Resto del contenido... -->
</div>
```

#### 3.4 Inicializar en index.js

**Archivo:** `/public/index.js` (añadir)

```javascript
import ThemeSelector from './js/components/ThemeSelector.js'
import { themeManager } from './js/themes/themeManager.js'

async function init() {
  try {
    console.log('🚀 [index.js] Starting initialization...')

    // ... código existente ...

    // Inicializar Theme Manager
    themeManager.init()

    // Inicializar Theme Selector
    const themeSelectorContainer = document.getElementById('theme-selector-container')
    if (themeSelectorContainer) {
      new ThemeSelector('theme-selector-container')
      console.log('✅ [index.js] Theme selector initialized')
    }

    // ... resto del código ...

    console.log('✅ [index.js] Initialization complete')
  } catch (error) {
    console.error('❌ [index.js] Initialization failed:', error)
    throw error
  }
}

// Ejecutar cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
```

### Entregables Fase 3

- ✅ `/public/js/components/ThemeSelector.js` creado
- ✅ Estilos en `/public/css/styles.css` añadidos
- ✅ `/public/index.html` modificado (navbar)
- ✅ `/public/index.js` modificado (inicialización)

### Testing Fase 3

1. Abrir navegador en `http://localhost:3000`
2. Verificar que aparece ícono de tema en navbar
3. Hacer clic y verificar que abre dropdown
4. Seleccionar diferentes temas y verificar cambios
5. Recargar página y verificar persistencia
6. Abrir 2 pestañas y verificar sincronización

---

## 🎨 Fase 4: Galería Visual

### Objetivos

- Crear página de galería de temas
- Mostrar previsualizaciones visuales
- Implementar filtros por categoría

### Tareas

#### 4.1 HTML de Galería

**Archivo:** `/public/pages/theme-gallery.html`

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Galería de Temas - FloresYa</title>
    <meta name="description" content="Explora y prueba todos los temas disponibles en FloresYa" />

    <!-- Styles -->
    <link rel="stylesheet" href="/css/tailwind.css" />
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <!-- Navbar (igual que index.html) -->
    <nav class="navbar">
      <div class="container navbar-content">
        <a href="/" class="navbar-brand">
          <img src="/images/logo.svg" alt="FloresYa" class="brand-logo" />
          <span class="brand-text">FloresYa</span>
        </a>

        <div class="nav-actions">
          <div id="theme-selector-container"></div>
          <a href="/pages/cart.html" class="nav-icon">
            <i data-lucide="shopping-cart" class="icon"></i>
            <span class="cart-badge">0</span>
          </a>
          <a href="#login" class="btn btn-login">Iniciar Sesión</a>
        </div>
      </div>
    </nav>

    <div class="navbar-spacer"></div>

    <!-- Main Content -->
    <main class="py-12">
      <div class="container">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Galería de Temas
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explora y prueba todos nuestros temas. Haz clic en cualquier tema para aplicarlo
            instantáneamente.
          </p>
        </div>

        <!-- Filters -->
        <div class="flex justify-center gap-4 mb-8">
          <button
            class="filter-btn active px-6 py-2 rounded-full font-medium transition-all"
            data-filter="all"
          >
            Todos
          </button>
          <button
            class="filter-btn px-6 py-2 rounded-full font-medium transition-all"
            data-filter="basic"
          >
            Básicos
          </button>
          <button
            class="filter-btn px-6 py-2 rounded-full font-medium transition-all"
            data-filter="premium"
          >
            Premium
          </button>
        </div>

        <!-- Theme Grid -->
        <div id="theme-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Se genera dinámicamente -->
        </div>
      </div>
    </main>

    <!-- Footer (igual que index.html) -->

    <!-- Scripts -->
    <script type="module" src="/js/"></script>
    <script type="module" src="theme-gallery.js"></script>
  </body>
</html>
```

#### 4.2 JavaScript de Galería

**Archivo:** `/public/pages/theme-gallery.js`

```javascript
import { themeManager } from '../js/themes/themeManager.js'
import ThemeSelector from '../js/components/ThemeSelector.js'
import { createIcons } from '../js/'

/**
 * Theme Gallery Page
 * Muestra todos los temas disponibles con previsualizaciones
 */

let currentFilter = 'all'

/**
 * Inicializa la galería
 */
function init() {
  console.log('🎨 [ThemeGallery] Initializing...')

  // Inicializar theme manager
  themeManager.init()

  // Inicializar theme selector
  const themeSelectorContainer = document.getElementById('theme-selector-container')
  if (themeSelectorContainer) {
    new ThemeSelector('theme-selector-container')
  }

  // Renderizar galería
  renderThemeGrid()

  // Bind filter buttons
  bindFilterButtons()

  // Escuchar cambios de tema
  window.addEventListener('themeChanged', () => {
    updateActiveTheme()
  })

  console.log('✅ [ThemeGallery] Initialized')
}

/**
 * Renderiza la galería de temas
 */
function renderThemeGrid() {
  const grid = document.getElementById('theme-grid')
  if (!grid) return

  const themes = themeManager.getAvailableThemes()
  const currentThemeId = themeManager.getCurrentTheme()

  const filteredThemes =
    currentFilter === 'all' ? themes : themes.filter(t => t.category === currentFilter)

  grid.innerHTML = filteredThemes
    .map(theme => {
      const isActive = theme.id === currentThemeId

      return `
      <div class="theme-card" data-category="${theme.category}">
        <div class="theme-card-inner ${isActive ? 'active' : ''}" data-theme="${theme.id}">
          <!-- Preview -->
          <div class="theme-preview">
            <div class="preview-header">
              <div class="preview-nav"></div>
              <div class="preview-content"></div>
            </div>
            <div class="preview-body">
              <div class="preview-card"></div>
              <div class="preview-card"></div>
            </div>
            ${
              isActive
                ? `
              <div class="active-badge">
                <i data-lucide="check-circle"></i>
                <span>Activo</span>
              </div>
            `
                : ''
            }
          </div>

          <!-- Info -->
          <div class="theme-info">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-3xl">${theme.icon}</span>
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">
                  ${theme.name}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  ${theme.category === 'basic' ? 'Básico' : 'Premium'}
                </p>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
              ${theme.description}
            </p>
            <button class="apply-theme-btn w-full py-2 px-4 rounded-lg font-medium transition-all ${
              isActive
                ? 'bg-green-600 text-white cursor-default'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }" ${isActive ? 'disabled' : ''}>
              ${isActive ? 'Tema Actual' : 'Aplicar Tema'}
            </button>
          </div>
        </div>
      </div>
    `
    })
    .join('')

  // Bind events
  bindThemeCards()

  // Renderizar iconos
  createIcons()
}

/**
 * Vincula eventos a las tarjetas de temas
 */
function bindThemeCards() {
  const cards = document.querySelectorAll('.theme-card-inner')

  cards.forEach(card => {
    const themeId = card.dataset.theme
    const applyBtn = card.querySelector('.apply-theme-btn')

    if (applyBtn && !applyBtn.disabled) {
      applyBtn.addEventListener('click', e => {
        e.stopPropagation()
        console.log('🎨 [ThemeGallery] Applying theme:', themeId)
        themeManager.setTheme(themeId)
      })
    }

    // También permitir click en toda la card
    if (!applyBtn.disabled) {
      card.addEventListener('click', () => {
        console.log('🎨 [ThemeGallery] Applying theme:', themeId)
        themeManager.setTheme(themeId)
      })
    }
  })
}

/**
 * Vincula eventos a los botones de filtro
 */
function bindFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn')

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter

      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      // Update filter
      currentFilter = filter
      renderThemeGrid()

      console.log('🎨 [ThemeGallery] Filter changed:', filter)
    })
  })
}

/**
 * Actualiza el tema activo en la UI
 */
function updateActiveTheme() {
  renderThemeGrid()
}

// Inicializar cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
```

#### 4.3 Estilos de Galería

**Archivo:** `/public/css/styles.css` (añadir al final)

```css
/* ==================== THEME GALLERY ==================== */

.filter-btn {
  background: var(--theme-bg-secondary);
  color: var(--theme-text-secondary);
  border: 2px solid transparent;
}

.filter-btn:hover {
  background: var(--theme-bg-tertiary);
  color: var(--theme-text-primary);
}

.filter-btn.active {
  background: var(--theme-primary);
  color: white;
  border-color: var(--theme-primary-dark);
}

.theme-card {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.theme-card-inner {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.theme-card-inner:hover {
  transform: translateY(-8px);
  box-shadow: var(--card-shadow-hover);
  border-color: var(--theme-primary);
}

.theme-card-inner.active {
  border-color: var(--theme-success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.theme-preview {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  overflow: hidden;
}

.preview-header {
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
}

.preview-nav {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.preview-content {
  margin-top: 0.5rem;
  height: 4px;
  width: 60%;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.preview-body {
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
}

.preview-card {
  flex: 1;
  height: 120px;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.active-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(16, 185, 129, 0.95);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.active-badge i {
  width: 1rem;
  height: 1rem;
}

.theme-info {
  padding: 1.5rem;
}

.apply-theme-btn {
  transition: all 0.2s ease;
}

.apply-theme-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}

.apply-theme-btn:not(:disabled):active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .theme-preview {
    height: 160px;
  }

  .preview-body {
    padding: 0.75rem;
  }

  .preview-card {
    height: 80px;
  }
}
```

### Entregables Fase 4

- ✅ `/public/pages/theme-gallery.html` creado
- ✅ `/public/pages/theme-gallery.js` creado
- ✅ Estilos en `/public/css/styles.css` añadidos

### Testing Fase 4

1. Navegar a `/pages/theme-gallery.html`
2. Verificar que se muestran todos los temas
3. Probar filtros (Todos, Básicos, Premium)
4. Hacer clic en diferentes temas y verificar cambios
5. Verificar que el tema actual se muestra como "Activo"
6. Verificar responsive en móvil

---

## ⚡ Fase 5: Migración y Optimización

### Objetivos

- Migrar todas las páginas al sistema de temas
- Optimizar rendimiento
- Añadir preload de temas

### Tareas

#### 5.1 Migrar Otras Páginas

**Archivos a modificar:**

- `/public/pages/products.html` + `.js`
- `/public/pages/cart.html` + `.js`
- `/public/pages/checkout.html` + `.js`
- `/public/pages/admin/*.html` + `.js`

**Patrón de migración:**

```javascript
// Añadir al inicio de cada archivo .js
import { themeManager } from '../js/themes/themeManager.js'
import ThemeSelector from '../js/components/ThemeSelector.js'

function init() {
  // Inicializar theme manager
  themeManager.init()

  // Inicializar theme selector
  const themeSelectorContainer = document.getElementById('theme-selector-container')
  if (themeSelectorContainer) {
    new ThemeSelector('theme-selector-container')
  }

  // ... resto del código existente ...
}
```

**En cada HTML:**

```html
<!-- Añadir en navbar -->
<div class="nav-actions">
  <div id="theme-selector-container"></div>
  <!-- ... resto ... -->
</div>
```

#### 5.2 Preload de Tema

**Archivo:** Crear `/public/js/themes/themePreload.js`

```javascript
/**
 * Theme Preload - Evita flash of unstyled content
 * Se ejecuta ANTES de que el DOM cargue completamente
 */

;(function () {
  const THEME_STORAGE_KEY = 'floresya-theme-preference'
  const DEFAULT_THEME = 'light'

  // Leer tema guardado
  let savedTheme = DEFAULT_THEME
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME
  } catch (error) {
    console.warn('Could not read saved theme')
  }

  // Aplicar data-theme inmediatamente
  document.documentElement.setAttribute('data-theme', savedTheme)

  console.log('⚡ [ThemePreload] Applied theme:', savedTheme)
})()
```

**Añadir en `<head>` de todos los HTML:**

```html
<head>
  <!-- ... meta tags ... -->

  <!-- Theme Preload (ANTES de CSS) -->
  <script src="/js/themes/themePreload.js"></script>

  <!-- CSS -->
  <link rel="stylesheet" href="/css/tailwind.css" />
  <link rel="stylesheet" href="/css/styles.css" />
</head>
```

#### 5.3 Optimización de Performance

**Archivo:** `/public/js/themes/themeManager.js` (modificar)

```javascript
// Añadir debounce para apply theme
let applyThemeTimeout = null

applyTheme(themeId, save = true) {
  // Cancelar aplicación pendiente
  if (applyThemeTimeout) {
    clearTimeout(applyThemeTimeout)
  }

  // Debounce de 50ms
  applyThemeTimeout = setTimeout(() => {
    this._applyThemeImmediate(themeId, save)
  }, 50)
}

_applyThemeImmediate(themeId, save) {
  // ... código existente de applyTheme ...
}
```

#### 5.4 Lazy Load de Texturas

**Archivo:** `/public/js/themes/themeStyles.js` (modificar)

```javascript
/**
 * Lazy load de texturas complejas
 */
export async function loadThemeStyles(themeId) {
  // Si es tema básico, retornar inmediatamente
  if (themeId === 'light' || themeId === 'dark') {
    return themeStyles[themeId]
  }

  // Para temas premium, simular lazy load
  return new Promise(resolve => {
    // Simular latencia de red (solo en dev)
    const delay = import.meta.env.DEV ? 100 : 0

    setTimeout(() => {
      resolve(themeStyles[themeId])
    }, delay)
  })
}
```

### Entregables Fase 5

- ✅ Todas las páginas migradas al sistema
- ✅ Theme preload implementado
- ✅ Optimizaciones de performance aplicadas
- ✅ Lazy load de texturas (opcional)

### Testing Fase 5

1. Navegar por todas las páginas
2. Cambiar tema y verificar que se aplica en todas
3. Recargar y verificar que no hay flash
4. Verificar performance con DevTools
5. Probar en dispositivos móviles

---

## ✅ Testing y Validación

### Test Plan

#### Test 1: Funcionalidad Básica

- [ ] Cambio de tema funciona
- [ ] Persistencia en localStorage
- [ ] Sincronización entre pestañas
- [ ] Tema se mantiene al recargar
- [ ] Dropdown funciona correctamente

#### Test 2: Visual

- [ ] Colores se aplican correctamente
- [ ] Texturas se ven bien
- [ ] No hay flickering al cambiar tema
- [ ] Transiciones suaves
- [ ] Responsive en móvil/tablet/desktop

#### Test 3: Performance

- [ ] Tiempo de cambio de tema < 300ms
- [ ] No hay bloqueo del main thread
- [ ] CSS variables aplican rápidamente
- [ ] Lazy load funciona (temas premium)

#### Test 4: Accesibilidad

- [ ] Keyboard navigation funciona
- [ ] Screen readers anuncian cambios
- [ ] ARIA attributes correctos
- [ ] Contraste de colores adecuado

#### Test 5: Cross-browser

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Safari iOS
- [ ] Chrome Android

#### Test 6: Edge Cases

- [ ] localStorage bloqueado/deshabilitado
- [ ] Tema inválido en localStorage
- [ ] Múltiples pestañas abiertas
- [ ] Navegación rápida entre páginas
- [ ] Tema cambia mientras página carga

### Herramientas de Testing

```bash
# Lighthouse Performance
npm run lighthouse

# CSS Validation
npm run validate:css

# Accessibility Testing
npm run test:a11y

# Visual Regression
npm run test:visual
```

---

## 🚀 Deployment CI/CD

### Pipeline de Deployment

#### Stage 1: Build

```yaml
# .github/workflows/deploy.yml
name: Deploy FloresYa

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build CSS
        run: npm run build:css

      - name: Lint JavaScript
        run: npm run lint

      - name: Run tests
        run: npm test
```

#### Stage 2: Deploy (Vercel)

```bash
# vercel.json (actualizar)
{
  "buildCommand": "npm run build:css",
  "outputDirectory": "public",
  "rewrites": [
    { "source": "/pages/(.*)", "destination": "/pages/$1" }
  ],
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Stage 3: Post-Deploy

```bash
# Scripts para verificar deployment
npm run verify:themes        # Verifica que todos los temas funcionen
npm run lighthouse:prod      # Performance audit en producción
npm run test:e2e:prod       # E2E tests en producción
```

### Rollback Plan

Si hay problemas:

1. **Rollback inmediato:**

   ```bash
   vercel rollback
   ```

2. **Desactivar temas temporalmente:**

   ```javascript
   // En themeManager.js
   const THEMES_ENABLED = false // Feature flag
   ```

3. **Volver a tema por defecto:**
   ```javascript
   // Forzar tema light
   localStorage.setItem('floresya-theme-preference', 'light')
   ```

### Monitoring

```javascript
// Añadir analytics para temas
window.addEventListener('themeChanged', e => {
  // Google Analytics
  gtag('event', 'theme_changed', {
    theme_name: e.detail.themeName,
    theme_id: e.detail.themeId
  })

  // Custom analytics
  console.log('📊 [Analytics] Theme changed:', e.detail)
})
```

---

## 📚 Documentación Adicional

### Crear Guía para Nuevos Temas

**Archivo:** `/docs/TEMAS-GUIA.md`

```markdown
# Guía: Cómo Crear un Nuevo Tema

## Paso 1: Definir Colores

Añade tu tema en `themeDefinitions.js`:

\`\`\`javascript
miNuevoTema: {
id: 'miNuevoTema',
name: 'Mi Nuevo Tema',
description: 'Descripción del tema',
icon: '🎨',
category: 'premium',
variables: {
'--theme-primary': '#ff6b6b',
// ... resto de variables
}
}
\`\`\`

## Paso 2: Crear Texturas

Añade CSS en `themeStyles.js`:

\`\`\`javascript
miNuevoTema: \`
body {
background: linear-gradient(135deg, #ff6b6b, #ff8e53);
}
\`
\`\`\`

## Paso 3: Probar

\`\`\`bash
npm run dev

# Abrir navegador y seleccionar tu tema

\`\`\`
```

### Variables CSS Referencia

Crear archivo `/docs/CSS-VARIABLES.md` con todas las variables documentadas.

---

## 🎯 Checklist Final

### Pre-Deploy

- [ ] Todos los tests pasan
- [ ] Performance audit OK (Lighthouse > 90)
- [ ] Accesibilidad OK (a11y score > 95)
- [ ] Cross-browser testing completado
- [ ] Documentación actualizada
- [ ] README.md actualizado con sección de temas

### Deploy

- [ ] Build exitoso
- [ ] Deploy a staging
- [ ] QA en staging
- [ ] Deploy a producción
- [ ] Smoke tests en producción

### Post-Deploy

- [ ] Monitorear analytics
- [ ] Verificar que no hay errores en consola
- [ ] Verificar localStorage functionality
- [ ] Revisar feedback de usuarios
- [ ] Documentar issues encontrados

---

## 📊 Métricas de Éxito

### KPIs

- **Tiempo de cambio de tema:** < 300ms
- **Lighthouse Performance:** > 90
- **Lighthouse Accessibility:** > 95
- **Error rate:** < 0.1%
- **User adoption:** > 30% usuarios cambian tema

### Analytics a Trackear

- Temas más populares
- Frecuencia de cambio de tema
- Tiempo de sesión por tema
- Bounce rate por tema
- Conversión por tema

---

## 🔮 Roadmap Futuro

### Fase 6 (Post-MVP)

- [ ] Tema Auto (detecta preferencia del sistema)
- [ ] Customización avanzada (crear tema personalizado)
- [ ] Preview en tiempo real antes de aplicar
- [ ] Exportar/importar configuración de tema
- [ ] Temas por horario (auto dark mode por la noche)

### Fase 7 (Avanzado)

- [ ] API pública de temas
- [ ] Marketplace de temas comunitarios
- [ ] A/B testing de temas
- [ ] Personalización por usuario (guardar en backend)

---

## 🆘 Troubleshooting

### Problema: Tema no se aplica

**Solución:**

```javascript
// Verificar en consola:
themeManager.getCurrentTheme()
themeManager.setTheme('light')
localStorage.getItem('floresya-theme-preference')
```

### Problema: Flickering al cargar

**Solución:** Verificar que `themePreload.js` se carga ANTES del CSS.

### Problema: Texturas no se ven

**Solución:** Verificar que `themeStyles.js` tiene el CSS correcto y que `styleElement` está creado.

### Problema: localStorage no funciona

**Solución:** Fallback a sessionStorage o cookies.

---

## 📝 Notas Finales

Este plan implementa un sistema de temas **robusto, escalable y performante** siguiendo las mejores prácticas:

✅ **Variables CSS** para colores (40+ variables granulares)
✅ **CSS Inline** para texturas complejas (sin parpadeos)
✅ **7 temas** (2 básicos + 5 premium elaborados)
✅ **Persistencia** en localStorage
✅ **UI dual** (dropdown + galería visual)
✅ **Performance** optimizado (< 300ms cambio de tema)
✅ **Accesibilidad** completa (ARIA, keyboard nav)
✅ **CI/CD** ready

**Siguiente paso:** Implementar por fases comenzando con Fase 1.

¿Listo para comenzar? 🚀
