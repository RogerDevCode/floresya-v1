# 📚 **Guía Maestra de Testing E2E - FloresYa**

## **Template Reusable para Todas las Páginas HTML**

---

## **🎯 FILOSOFÍA DE TESTING**

Basado en metodologías de **MIT CSAIL**, **Stanford HCI**, **Google Testing Blog**, y **Baymard Institute** para garantizar calidad enterprise-grade.

### **Principios Fundamentales**

1. **Testing Pyramid**: Unit → Integration → E2E
2. **Risk-Based Testing**: Priorizar funcionalidad crítica
3. **User-Centric Testing**: Enfocarse en experiencia real
4. **Accessibility First**: WCAG 2.1 AA como estándar mínimo
5. **Performance Budget**: Métricas Core Web Vitals obligatorias

---

## **🏗️ ESTRUCTURA DE TEMPLATE POR PÁGINA**

### **A. ANÁLISIS PREVIO OBLIGATORIO**

Antes de escribir tests, analizar cada página HTML:

```bash
# 1. Identificar componentes dinámicos
grep -E "(onclick|addEventListener|data-|id=|class=)" pagina.html

# 2. Listar scripts externos
grep -E "script.*src" pagina.html

# 3. Identificar APIs llamadas
grep -r "fetch\|axios\|api" js/

# 4. Mapear flujos de usuario
# - Login/Registro
# - Búsqueda/Filtrado
# - Carrito/Checkout
# - Formularios
```

### **B. TEMPLATE DE ANÁLISIS POR PÁGINA**

```markdown
# 📄 [NOMBRE_PAGINA].html - Análisis de Testing

## 🎯 Propósito Principal

- [Objetivo principal de la página]
- [Usuarios objetivo]
- [Flujos críticos]

## 🏗️ Arquitectura

- **Scripts cargados**: [Listar]
- **Componentes dinámicos**: [Listar]
- **APIs consumidas**: [Listar]
- **Estado global**: [LocalStorage, SessionStorage, etc.]

## 🎨 Componentes UI

- **Navigation**: [Tipo, comportamiento]
- **Forms**: [Campos, validaciones]
- **Interactive Elements**: [Botones, modales, etc.]
- **Media**: [Imágenes, videos, etc.]

## 📱 Responsive Design

- **Breakpoints**: [Listar puntos de quiebre]
- **Mobile behaviors**: [Comportamientos móviles específicos]
- **Touch gestures**: [Gestos táctiles]
```

---

## **🔥 TEMPLATE DE TESTING POR CATEGORÍA**

### **CATEGORÍA 1: FUNDAMENTOS (OBLIGATORIO)**

```javascript
// Test template para cualquier página
describe('[NOMBRE_PAGINA] - Core Functionality', () => {
  beforeEach(() => {
    cy.visit('/[ruta-pagina]')
  })

  // 1. Page Loading & DOM
  test('should load page completely', () => {
    cy.document().should('be.visible')
    cy.title().should('not.be.empty')
  })

  test('should load all critical resources', () => {
    // Scripts
    cy.get('script[src*="index.js"]').should('exist')
    // CSS
    cy.get('link[href*="styles.css"]').should('exist')
    // Images
    cy.get('img[loading="eager"]').should('be.visible')
  })

  test('should have correct SEO meta tags', () => {
    cy.get('meta[name="description"]').should('exist')
    cy.get('meta[property="og:title"]').should('exist')
    cy.get('link[rel="canonical"]').should('exist')
  })
})
```

### **CATEGORÍA 2: COMPONENTES UI (ESPECÍFICO POR PÁGINA)**

```javascript
// Template para componentes específicos
describe('[NOMBRE_PAGINA] - UI Components', () => {
  test('should render navigation correctly', () => {
    // Adaptar según navegación de la página
    cy.get('[data-testid="main-nav"]').should('be.visible')
    cy.get('[data-testid="nav-logo"]').should('be.visible')
  })

  test('should handle responsive behavior', () => {
    // Mobile
    cy.viewport(375, 667)
    cy.get('[data-testid="mobile-menu"]').should('exist')

    // Desktop
    cy.viewport(1280, 720)
    cy.get('[data-testid="desktop-nav"]').should('be.visible')
  })
})
```

### **CATEGORÍA 3: FUNCIONALIDAD DINÁMICA**

```javascript
// Template para interactividad
describe('[NOMBRE_PAGINA] - Dynamic Functionality', () => {
  test('should handle user interactions', () => {
    // Botones
    cy.get('[data-testid="primary-button"]').click()
    cy.get('[data-testid="result-element"]').should('be.visible')

    // Forms
    cy.get('[data-testid="search-input"]').type('test query')
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="search-results"]').should('contain', 'test')
  })

  test('should validate form inputs', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="submit-button"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'email')
  })
})
```

---

## **📱 CHECKLIST DE TESTING POR TIPO DE PÁGINA**

### **LANDING PAGES (index.html, home.html)**

```yaml
Critical Tests:
  - Hero section CTA functionality
  - Product carousel/navigation
  - Lead capture forms
  - Theme switching
  - Mobile menu functionality

Performance Tests:
  - Page load < 3s
  - Image optimization
  - Above-the-fold content

Accessibility Tests:
  - Skip navigation links
  - Keyboard navigation
  - Screen reader compatibility
```

### **PRODUCT PAGES (product-detail.html, products.html)**

```yaml
Critical Tests:
  - Product image gallery
  - Add to cart functionality
  - Product information accuracy
  - Price calculation
  - Stock availability

E-commerce Tests:
  - Cart synchronization
  - Wishlist functionality
  - Product comparison
  - Related products

User Experience:
  - Image zoom functionality
  - Product reviews
  - Size/variant selection
```

### **CART & CHECKOUT (cart.html, checkout.html, payment.html)**

```yaml
Critical Tests:
  - Cart item management
  - Price calculation accuracy
  - Form validation
  - Payment processing
  - Order confirmation

Security Tests:
  - CSRF protection
  - Input sanitization
  - HTTPS enforcement
  - Data encryption

Error Handling:
  - Network errors
  - Payment failures
  - Validation errors
  - Timeout handling
```

### **ADMIN PAGES (dashboard.html, admin/\*.html)**

```yaml
Critical Tests:
  - Authentication/Authorization
  - CRUD operations
  - Data validation
  - Bulk operations

Performance Tests:
  - Large dataset handling
  - Table pagination
  - Search/filter performance

Security Tests:
  - Role-based access
  - Session management
  - Audit logging
  - Data export security
```

### **FORM PAGES (contacto.html, registro.html)**

```yaml
Critical Tests:
  - Form validation
  - File upload functionality
  - Email delivery simulation
  - Success/error states

Usability Tests:
  - Progressive disclosure
  - Help text availability
  - Error clarity
  - Mobile keyboard optimization

Integration Tests:
  - CRM connectivity
  - Email service integration
  - Data persistence
```

---

## **🛠️ HERRAMIENTAS Y CONFIGURACIÓN**

### **Setup Inicial**

```bash
# 1. Instalar Cypress
npm install --save-dev cypress

# 2. Instalar plugins de accesibilidad
npm install --save-dev cypress-axe

# 3. Instalar plugins de visual testing
npm install --save-dev @percy/cypress

# 4. Configurar CI/CD
# GitHub Actions: .github/workflows/e2e.yml
# GitLab CI: .gitlab-ci.yml
```

### **cypress.config.js Template**

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      // Variables de entorno por ambiente
      apiUrl: process.env.API_URL || 'http://localhost:3001',
      // Mock data configuration
      mockData: true
    }
  },
  // Configuración de componentes
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
})
```

---

## **📊 MÉTRICAS Y REPORTING**

### **Coverage Report Template**

```javascript
// cypress/support/coverage.js
const { defineConfig } = require('@cypress/code-coverage/task')

module.exports = defineConfig({
  setupNodeEvents(on, config) {
    // Code coverage
    on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'))

    // Custom reporting
    on('after:spec', (spec, results) => {
      // Custom metrics
      console.log(`Test: ${spec.name}, Duration: ${results.duration}ms`)
    })
  }
})
```

### **Performance Testing Integration**

```javascript
// cypress/support/performance.js
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then(win => {
    const perfData = win.performance.getEntriesByType('navigation')[0]
    const metrics = {
      loadTime: perfData.loadEventEnd - perfData.navigationStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      firstPaint: win.performance.getEntriesByType('paint')[0]?.startTime,
      firstContentfulPaint: win.performance.getEntriesByType('paint')[1]?.startTime
    }

    cy.log('Performance Metrics:', metrics)
    expect(metrics.loadTime).to.be.lessThan(3000) // 3s max
  })
})
```

---

## **🚀 ESTRATEGIA DE IMPLEMENTACIÓN**

### **Phase 1: Setup Foundation (Semana 1)**

```bash
# 1. Configurar entorno
mkdir -p cypress/{e2e,support,fixtures,plugins}
npm install cypress @cypress/axe @percy/cypress

# 2. Crear estructura de archivos
touch cypress.config.js
touch cypress/support/commands.js
touch cypress/support/e2e.js

# 3. Configurar CI/CD
mkdir -p .github/workflows
```

### **Phase 2: Critical Path Testing (Semanas 2-3)**

1. **Página más importante primero** (usualmente index.html)
2. **Flujo crítico de negocio** (e-commerce completo)
3. **Mobile responsiveness** (50%+ tráfico móvil)
4. **Accesibilidad básica** (cumplimiento legal)

### **Phase 3: Comprehensive Coverage (Semanas 4-6)**

1. **Todas las páginas restantes**
2. **Casos extremos y edge cases**
3. **Performance optimization**
4. **Visual regression testing**

### **Phase 4: Maintenance (Ongoing)**

1. **Tests en cada PR**
2. **Nightly builds**
3. **Release gates**
4. **Performance monitoring**

---

## **✅ CRITERIOS DE ÉXITO**

### **Calidad de Tests**

- **95%** de code coverage en funcionalidad crítica
- **100%** de WCAG 2.1 AA compliance
- **Core Web Vitals** en rango verde
- **0** flaky tests en 10 ejecuciones consecutivas

### **Performance Gates**

```javascript
// No deploy si:
const performanceGates = {
  pageLoadTime: 3000, // ms
  firstContentfulPaint: 1800, // ms
  largestContentfulPaint: 2500, // ms
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100 // ms
}
```

### **Métricas de Maintainability**

- **Tiempo de ejecución**: < 10 min por suite
- **Mantenimiento**: < 2h/semana
- **Flaky rate**: < 1%
- **Documentación**: 100% de tests documentados

---

## **🔄 MEJORAS CONTINUAS**

### **Semanalmente**

- Revisión de flaky tests
- Actualización de fixtures
- Optimización de performance
- Limpieza de código duplicado

### **Mensualmente**

- Análisis de coverage gaps
- Actualización de dependencias
- Revisión de métricas de performance
- Capacitación del equipo

### **Trimestralmente**

- Revisión completa de estrategia
- Actualización de herramientas
- Evaluación de ROI
- Planning de mejoras

---

**📈 Esta guía sirve como template estándar para testing E2E de todas las páginas del proyecto FloresYa, garantizando consistencia, calidad y mantenibilidad.**
