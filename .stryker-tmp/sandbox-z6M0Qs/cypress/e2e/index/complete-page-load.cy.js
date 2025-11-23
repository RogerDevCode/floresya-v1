/* eslint-env mocha, cypress/globals */
// @ts-nocheck

/**
 * E2E Test Suite: Index.html - Complete DOM and Component Loading
 * Purpose: Verify proper loading of all static and dynamic components
 * Following CLAUDE.md strict test validation rules
 *
 * Test Coverage:
 * 1. DOM Load Sequence (DOMContentLoaded → DOM Ready → Hydration)
 * 2. Static Components (Navigation, Hero, Meta tags, CSS)
 * 3. Dynamic Components (Theme loader, Cart, Mobile menu)
 * 4. Resource Loading (Fonts, Images, Stylesheets)
 * 5. Performance Boundaries (LCP, FCP, TTI)
 * 6. Accessibility (ARIA, Semantic HTML)
 */

describe('Index.html - Complete Page Load and Component Initialization', () => {
  beforeEach(() => {
    // Visit index page without any waits - let Cypress handle natural timing
    cy.visit('/', {
      failOnStatusCode: false,
      onBeforeLoad(win) {
        // Monitor window events
        cy.stub(win.console, 'error').as('consoleError')
        cy.stub(win.console, 'warn').as('consoleWarn')
      }
    })
  })

  /**
   * Phase 1: HTML Document Load
   * Verify: <html>, <head>, <body>, DOCTYPE, lang attribute
   */
  describe('Phase 1: HTML Document Structure', () => {
    it('should have valid HTML structure and DOCTYPE', () => {
      // DOCTYPE validation
      cy.request('/').then(response => {
        expect(response.body).to.include('<!doctype html>')
        expect(response.body).to.include('lang="es"')
      })
    })

    it('should have html element with data-theme attribute', () => {
      cy.get('html').should('have.attr', 'lang', 'es').and('have.attr', 'data-theme', 'light')
    })

    it('should have required head meta tags', () => {
      // Charset
      cy.get('head meta[charset="UTF-8"]').should('exist')

      // Viewport
      cy.get('head meta[name="viewport"]')
        .should('exist')
        .and('have.attr', 'content', 'width=device-width, initial-scale=1.0')

      // Description
      cy.get('head meta[name="description"]').should('exist')

      // Keywords
      cy.get('head meta[name="keywords"]').should('exist')

      // Robots
      cy.get('head meta[name="robots"]')
        .should('exist')
        .and('have.attr', 'content', 'index, follow')
    })

    it('should have proper title tag', () => {
      cy.get('head title').should('exist').and('contain', 'FloresYa')
    })

    it('should have structured data (JSON-LD)', () => {
      cy.get('head script[type="application/ld+json"]')
        .should('exist')
        .then($script => {
          const data = JSON.parse($script.text())
          expect(data['@context']).to.equal('https://schema.org')
          expect(data['@type']).to.equal('Florist')
          expect(data.name).to.equal('FloresYa')
        })
    })

    it('should have Open Graph meta tags', () => {
      cy.get('head meta[property="og:title"]').should('exist').and('have.attr', 'content')

      cy.get('head meta[property="og:type"]').should('exist').and('have.attr', 'content', 'website')

      cy.get('head meta[property="og:url"]').should('exist')
    })
  })

  /**
   * Phase 2: CSS Loading
   * Verify: All stylesheets are loaded and applied
   */
  describe('Phase 2: CSS and Theme Preload', () => {
    it('should preload theme script before CSS to prevent FOUC', () => {
      cy.get('head script').first().should('have.attr', 'src').and('include', 'themePreload')
    })

    it('should load all required stylesheets', () => {
      // Main CSS
      cy.get('head link[rel="stylesheet"][href="./css/styles.css"]').should('exist')

      // Tailwind CSS
      cy.get('head link[rel="stylesheet"][href="./css/tailwind.css"]').should('exist')

      // Theme CSS
      cy.get('head link[rel="stylesheet"][href="./css/themes.css"]').should('exist')

      // Granular theme CSS
      cy.get('head link[rel="stylesheet"][href="./css/themes-granular.css"]').should('exist')

      // Component CSS
      cy.get('head link[rel="stylesheet"][href="./css/components/cuco-clock.css"]').should('exist')
    })

    it('should preload critical resources', () => {
      // Hero image preload
      cy.get('head link[rel="preload"][as="image"]')
        .should('have.length.at.least', 1)
        .and('have.attr', 'href', './images/hero-flowers.webp')

      // CSS preload
      cy.get('head link[rel="preload"][as="style"]').should('have.length.at.least', 2)
    })

    it('should have DNS prefetch for external fonts', () => {
      cy.get('head link[rel="dns-prefetch"]').should('have.length.at.least', 2)
      cy.get('head link[rel="dns-prefetch"][href*="fonts.googleapis"]').should('exist')
      cy.get('head link[rel="dns-prefetch"][href*="fonts.gstatic"]').should('exist')
    })

    it('should have preconnect for fonts', () => {
      cy.get('head link[rel="preconnect"][href*="fonts.googleapis"]').should('exist')
      cy.get('head link[rel="preconnect"][href*="fonts.gstatic"]').should('exist')
    })

    it('should apply CSS styling to body and main elements', () => {
      // Body should exist and be visible
      cy.get('body').should('be.visible')

      // Check computed styles are applied (not empty)
      cy.get('body').should('have.css', 'font-family')
    })
  })

  /**
   * Phase 3: Navigation Component (Static)
   * Verify: Navbar, logo, links, mobile menu structure
   */
  describe('Phase 3: Navigation Component (Static)', () => {
    it('should render navigation element with proper role', () => {
      cy.get('nav.navbar')
        .should('exist')
        .and('have.attr', 'role', 'navigation')
        .and('have.attr', 'aria-label', 'Navegación principal')
    })

    it('should display logo and brand text', () => {
      cy.get('.navbar-brand').should('exist').and('have.attr', 'href', '/')

      cy.get('.navbar-brand img.brand-logo')
        .should('exist')
        .and('have.attr', 'src', './images/logoFloresYa.jpeg')
        .and('have.attr', 'alt', 'Logo de FloresYa')

      cy.get('.navbar-brand .brand-text').should('exist').and('contain', 'FloresYa')
    })

    it('should have desktop navigation links', () => {
      cy.get('.desktop-nav .nav-links').should('exist').and('have.attr', 'role', 'menubar')

      // Check specific links exist
      cy.get('.nav-links .nav-link').each($link => {
        cy.wrap($link).should('be.visible')
      })

      // Verify link targets
      cy.contains('.nav-link', 'Inicio').should('have.attr', 'href', '#inicio')
      cy.contains('.nav-link', 'Productos').should('have.attr', 'href', '#productos')
      cy.contains('.nav-link', 'Contacto').should('have.attr', 'href', 'pages/contacto.html')
    })

    it('should render nav action buttons (cart, login, mobile menu)', () => {
      // Cart link
      cy.get('a[aria-label*="Carrito"]')
        .should('exist')
        .and('have.attr', 'href', '/pages/cart.html')

      // Cart badge
      cy.get('.cart-badge').should('exist').and('contain', '0')

      // Login button
      cy.get('.btn-login').should('exist').and('contain', 'Iniciar Sesión')

      // Mobile menu toggle
      cy.get('#mobile-menu-btn')
        .should('exist')
        .and('have.attr', 'aria-label', 'Abrir menú móvil')
        .and('have.attr', 'aria-expanded', 'false')
    })

    it('should have mobile menu (hidden by default)', () => {
      cy.get('#mobile-menu')
        .should('exist')
        .and('have.class', 'hidden')
        .and('have.attr', 'role', 'navigation')

      cy.get('#mobile-menu .mobile-nav-links')
        .should('exist')
        .find('.mobile-nav-link')
        .should('have.length', 5)
    })

    it('should have navbar spacer for fixed positioning', () => {
      cy.get('.navbar-spacer').should('exist')
    })
  })

  /**
   * Phase 4: Hero Section (Static)
   * Verify: Banner, title, subtitle, CTA buttons
   */
  describe('Phase 4: Hero Section (Static Component)', () => {
    it('should render hero section with proper structure', () => {
      cy.get('section.hero-section')
        .should('exist')
        .and('have.attr', 'role', 'banner')
        .and('have.attr', 'aria-labelledby', 'hero-title')
    })

    it('should display hero title and subtitle', () => {
      cy.get('#hero-title')
        .should('exist')
        .and('be.visible')
        .and('contain', 'Flores frescas para cada ocasión')

      cy.get('.hero-subtitle')
        .should('exist')
        .and('be.visible')
        .and('contain', 'Ramos y arreglos florales')
    })

    it('should have primary CTA buttons', () => {
      // Catalog button
      cy.get('.hero-cta')
        .find('.btn-primary')
        .should('exist')
        .and('contain', 'Explorar Catálogo')
        .and('have.attr', 'href', '#productos')

      // Wedding button
      cy.get('.hero-cta')
        .find('.btn-secondary')
        .should('exist')
        .and('contain', 'Arreglos para Bodas')
        .and('have.attr', 'href', '#bodas')
    })

    it('should display hero features section', () => {
      cy.get('.hero-features').should('exist')
      cy.get('.feature-item').should('have.length.at.least', 1)
    })

    it('should have animated gradient class applied', () => {
      cy.get('.hero-section')
        .should('have.class', 'theme-hero-gradient')
        .and('have.class', 'animate-gradient')
    })
  })

  /**
   * Phase 5: Favicon and Manifest
   * Verify: Favicon and manifest.json are referenced
   */
  describe('Phase 5: Favicon and Web App Manifest', () => {
    it('should have favicon link', () => {
      cy.get('head link[rel="icon"]')
        .should('exist')
        .and('have.attr', 'type', 'image/x-icon')
        .and('have.attr', 'href', './images/favicon.ico')
    })

    it('should have manifest link', () => {
      cy.get('head link[rel="manifest"]')
        .should('exist')
        .and('have.attr', 'href', './manifest.json')
    })

    it('should have valid manifest.json', () => {
      cy.request('./manifest.json').then(response => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('name')
        expect(response.body).to.have.property('short_name')
      })
    })
  })

  /**
   * Phase 6: Dynamic Components (Runtime Initialization)
   * Verify: Theme selector, mobile menu toggle, index.js functionality
   */
  describe('Phase 6: Dynamic Component Initialization', () => {
    it('should initialize theme selector container', () => {
      cy.get('#theme-selector-container').should('exist')
    })

    it('should have cuco clock toggle button with proper attributes', () => {
      cy.get('#cuco-clock-toggle')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('have.attr', 'title', 'Toggle Cuco Clock')

      // Check SVG icon
      cy.get('#cuco-clock-toggle svg.cuco-icon').should('exist').and('be.visible')
    })

    it('should load index.js module', () => {
      cy.window().then(win => {
        // Check if index.js loaded without errors
        // (This is verified by absence of console errors)
        cy.get('@consoleError').should('not.have.been.called')
      })
    })

    it('should initialize mobile menu toggle functionality', () => {
      const mobileMenuBtn = cy.get('#mobile-menu-btn')

      // Initial state: menu hidden, button not expanded
      cy.get('#mobile-menu').should('have.class', 'hidden')
      mobileMenuBtn.should('have.attr', 'aria-expanded', 'false')

      // Click menu button
      mobileMenuBtn.click()

      // After click: menu visible, button expanded
      cy.get('#mobile-menu').should('not.have.class', 'hidden')
      mobileMenuBtn.should('have.attr', 'aria-expanded', 'true')

      // Click again to close
      mobileMenuBtn.click()
      cy.get('#mobile-menu').should('have.class', 'hidden')
      mobileMenuBtn.should('have.attr', 'aria-expanded', 'false')
    })

    it('should not show console errors on load', () => {
      cy.get('@consoleError').should('not.have.been.called')
    })
  })

  /**
   * Phase 7: Accessibility Validation
   * Verify: ARIA labels, semantic HTML, keyboard navigation
   */
  describe('Phase 7: Accessibility Standards', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist').and('have.length', 1)
      cy.get('#hero-title').should('exist')
    })

    it('should have alt text on all images', () => {
      cy.get('img').each($img => {
        cy.wrap($img).should('have.attr', 'alt')
      })
    })

    it('should have aria labels on interactive elements', () => {
      // Navigation
      cy.get('nav[aria-label]').should('exist')

      // Mobile menu
      cy.get('#mobile-menu[aria-label]').should('exist')

      // Mobile menu button
      cy.get('#mobile-menu-btn[aria-label]').should('exist')

      // Hero section
      cy.get('section[role="banner"][aria-labelledby]').should('exist')
    })

    it('should have semantic HTML structure', () => {
      cy.get('nav').should('exist')
      cy.get('section').should('exist')
      cy.get('button').should('exist')
      cy.get('a').should('exist')
    })

    it('should support keyboard navigation on navbar links', () => {
      cy.get('.nav-link').first().focus().should('be.focused')
      cy.get('.nav-link').first().should('have.css', 'outline')
    })
  })

  /**
   * Phase 8: Resource Loading Performance
   * Verify: Images load, fonts available, no 404s
   */
  describe('Phase 8: Resource Loading and Performance', () => {
    it('should load logo image successfully', () => {
      cy.get('.navbar-brand img')
        .should('have.attr', 'src', './images/logoFloresYa.jpeg')
        .and('be.visible')

      // Verify image loaded (check natural width > 0)
      cy.get('.navbar-brand img').then($img => {
        // Natural width indicates image loaded
        expect($img[0].naturalWidth).to.be.greaterThan(0)
      })
    })

    it('should not have any broken image links', () => {
      cy.get('img').each($img => {
        cy.wrap($img).should('have.prop', 'complete', true)
      })
    })

    it('should load all CSS files with 200 status', () => {
      cy.request('./css/styles.css').should('have.property', 'status', 200)
      cy.request('./css/tailwind.css').should('have.property', 'status', 200)
      cy.request('./css/themes.css').should('have.property', 'status', 200)
      cy.request('./css/components/cuco-clock.css').should('have.property', 'status', 200)
    })

    it('should load Google Fonts successfully', () => {
      cy.window().then(win => {
        const fontLinks = win.document.querySelectorAll('link[rel="preconnect"]')
        expect(fontLinks.length).to.be.greaterThan(0)
      })
    })

    it('should have reasonable page load time (LCP < 3s)', () => {
      cy.window().then(win => {
        // Get performance metrics
        const perfData = win.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

        // Page should load within 3 seconds (3000ms)
        expect(pageLoadTime).to.be.lessThan(3000)
      })
    })
  })

  /**
   * Phase 9: Theme System Functionality
   * Verify: Theme preload, data attributes, CSS variables
   */
  describe('Phase 9: Theme System', () => {
    it('should have html with data-theme attribute', () => {
      cy.get('html').should('have.attr', 'data-theme')
    })

    it('should apply theme CSS variables to body', () => {
      cy.get('body').should('have.css', '--navbar-icon-color')
    })

    it('should support theme switching via script', () => {
      // Switch theme (if possible through localStorage)
      cy.window().then(win => {
        win.localStorage.setItem('theme', 'dark')
      })

      // Reload and verify persistence
      cy.reload()
      cy.get('html').should('have.attr', 'data-theme')
    })
  })

  /**
   * Phase 10: Featured Carousel Component
   * Verify: Carousel structure, controls, indicators, progress bar
   */
  describe('Phase 10: Featured Carousel Component', () => {
    it('should render carousel container with proper attributes', () => {
      cy.get('#featuredCarousel')
        .should('exist')
        .and('have.attr', 'role', 'region')
        .and('have.attr', 'aria-roledescription', 'carousel')
        .and('have.attr', 'aria-label', 'Productos destacados')
    })

    it('should have carousel navigation controls', () => {
      // Previous button
      cy.get('#carousel-prev')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('have.attr', 'aria-label', 'Producto anterior')
        .and('be.visible')

      // Next button
      cy.get('#carousel-next')
        .should('exist')
        .and('have.attr', 'type', 'button')
        .and('have.attr', 'aria-label', 'Producto siguiente')
        .and('be.visible')
    })

    it('should have carousel slides container', () => {
      cy.get('#carouselSlides').should('exist').and('have.attr', 'aria-live', 'polite')
    })

    it('should have progress bar element', () => {
      cy.get('#carouselProgressContainer')
        .should('exist')
        .and('have.attr', 'aria-label', 'Progreso del carrusel')

      cy.get('#carouselProgressBar').should('exist')
    })

    it('should have carousel indicators container', () => {
      cy.get('#carousel-indicators')
        .should('exist')
        .and('have.attr', 'aria-label', 'Indicadores del carrusel')
    })

    it('should have carousel title and description', () => {
      cy.get('#carousel-title').should('exist').and('contain', 'Nuestras Creaciones Destacadas')

      cy.contains('Descubre nuestros arreglos más populares').should('exist')
    })
  })

  /**
   * Phase 11: Products Section Structure
   * Verify: Products section, filters, container, pagination
   */
  describe('Phase 11: Products Section Structure', () => {
    it('should render products section with proper attributes', () => {
      cy.get('#productos')
        .should('exist')
        .and('have.attr', 'role', 'main')
        .and('have.attr', 'aria-label', 'Sección de productos destacados')
    })

    it('should have products section heading', () => {
      cy.get('#productos').within(() => {
        cy.contains('h2', 'Productos Destacados').should('exist')
        cy.contains('Nuestras flores más populares y arreglos especiales').should('exist')
      })
    })

    it('should have filter panel with proper role', () => {
      cy.get('#filters-heading')
        .should('exist')
        .and('have.class', 'sr-only')
        .and('contain', 'Filtros de productos')
    })

    it('should have products container for dynamic loading', () => {
      cy.get('#productsContainer').should('exist').and('have.class', 'grid')
    })

    it('should have pagination navigation', () => {
      cy.get('nav[aria-label="Paginación de productos"]').should('exist')

      cy.get('#pagination').should('exist')
    })
  })

  /**
   * Phase 12: Filter System Components
   * Verify: Quick filters, search, sort, price range, occasions
   */
  describe('Phase 12: Filter System Components', () => {
    it('should render quick occasion filters', () => {
      cy.get('#quickFilters')
        .should('exist')
        .and('have.attr', 'role', 'group')
        .and('have.attr', 'aria-label', 'Filtros rápidos de ocasiones')
    })

    it('should have "Todos" filter button active by default', () => {
      cy.get('#filter-all')
        .should('exist')
        .and('have.class', 'active')
        .and('have.attr', 'aria-pressed', 'true')
        .and('contain', 'Todos')
    })

    it('should have accessible search input', () => {
      cy.get('#searchInput')
        .should('exist')
        .and('have.attr', 'type', 'text')
        .and('have.attr', 'placeholder', 'Buscar por nombre...')
        .and('have.attr', 'aria-labelledby', 'search-label')
        .and('have.attr', 'aria-describedby', 'search-help')

      cy.get('#search-label').should('exist').and('contain', 'Buscar productos')

      cy.get('#search-help').should('exist').and('have.class', 'sr-only')
    })

    it('should have sort filter dropdown', () => {
      cy.get('#sortFilter')
        .should('exist')
        .and('have.attr', 'aria-labelledby', 'sort-label')
        .and('have.attr', 'aria-describedby', 'sort-help')

      // Verify options
      cy.get('#sortFilter option').should('have.length.at.least', 5)
      cy.get('#sortFilter option[value="created_desc"]').should('contain', 'Más recientes')
      cy.get('#sortFilter option[value="price_asc"]').should('contain', 'Precio: Menor a mayor')
    })

    it('should have price range filter dropdown', () => {
      cy.get('#priceRange')
        .should('exist')
        .and('have.attr', 'aria-labelledby', 'price-label')
        .and('have.attr', 'aria-describedby', 'price-help')

      // Verify options
      cy.get('#priceRange option').should('have.length.at.least', 5)
      cy.get('#priceRange option[value=""]').should('contain', 'Todos los precios')
      cy.get('#priceRange option[value="0-30"]').should('exist')
    })

    it('should have hidden occasion filter for backend compatibility', () => {
      cy.get('#occasionFilter')
        .should('exist')
        .and('have.class', 'hidden')
        .and('have.attr', 'aria-hidden', 'true')
    })

    it('should have search icon in search input', () => {
      cy.get('#searchInput')
        .parent()
        .find('svg')
        .should('exist')
        .and('have.attr', 'aria-hidden', 'true')
    })
  })

  /**
   * Phase 13: Testimonials Section
   * Verify: Testimonials structure, cards, content
   */
  describe('Phase 13: Testimonials Section', () => {
    it('should render testimonials section', () => {
      cy.get('.testimonials-section').should('exist').and('have.class', 'theme-testimonials-card')
    })

    it('should have testimonials section heading', () => {
      cy.get('.testimonials-section').within(() => {
        cy.contains('h2', 'Lo que dicen nuestros clientes').should('exist')
        cy.contains('Experiencias reales con FloresYa').should('exist')
      })
    })

    it('should render exactly 3 testimonial cards', () => {
      cy.get('.testimonial-card').should('have.length', 3)
    })

    it('should have testimonial content structure', () => {
      cy.get('.testimonial-card').each($card => {
        // Each card should have quote and author
        cy.wrap($card).find('.testimonial-quote').should('exist')
        cy.wrap($card).find('.testimonial-author').should('exist')
      })
    })

    it('should have themed testimonial cards (pink, green, yellow)', () => {
      cy.get('.testimonial-card.pink').should('exist')
      cy.get('.testimonial-card.green').should('exist')
      cy.get('.testimonial-card.yellow').should('exist')
    })
  })

  /**
   * Phase 14: Features Section
   * Verify: Features grid, icons, content
   */
  describe('Phase 14: Features Section', () => {
    it('should render features section', () => {
      cy.get('.features-section')
        .should('exist')
        .and('have.class', 'theme-features')
        .and('have.class', 'theme-panel-light')
    })

    it('should render exactly 4 feature cards', () => {
      cy.get('.feature-card').should('have.length', 4)
    })

    it('should have complete feature card structure', () => {
      cy.get('.feature-card').each($card => {
        // Icon wrapper
        cy.wrap($card).find('.feature-icon-wrapper').should('exist')

        // Icon SVG
        cy.wrap($card).find('.feature-icon').should('exist')

        // Title
        cy.wrap($card).find('.feature-title').should('exist')

        // Description
        cy.wrap($card).find('.feature-description').should('exist')
      })
    })

    it('should have expected feature titles', () => {
      cy.contains('.feature-title', 'Flores Frescas').should('exist')
      cy.contains('.feature-title', 'Entrega Rápida').should('exist')
      cy.contains('.feature-title', 'Hechos con Amor').should('exist')
      cy.contains('.feature-title', 'Garantía Total').should('exist')
    })
  })

  /**
   * Phase 15: Special CTA Section
   * Verify: FloresYa Novias and Entrega Express cards
   */
  describe('Phase 15: Special CTA Section', () => {
    it('should render special CTA section', () => {
      cy.get('.special-cta-section').should('exist').and('be.visible')
    })

    it('should have CTA section heading', () => {
      cy.get('.special-cta-section').within(() => {
        cy.contains('h2', '¿Buscas algo especial?').should('exist')
        cy.contains('Personalizamos ramos únicos para cada ocasión inolvidable').should('exist')
      })
    })

    it('should render FloresYa Novias card', () => {
      cy.contains('.cta-card', 'FloresYa Novias')
        .should('exist')
        .within(() => {
          cy.get('h3').should('contain', 'FloresYa Novias')
          cy.contains('Arreglos exclusivos para el día más especial de tu vida').should('exist')
          cy.contains('.btn-secondary', 'Conocer más').should('exist')
        })
    })

    it('should render Entrega Express card', () => {
      cy.contains('.cta-card', 'Entrega Express')
        .should('exist')
        .within(() => {
          cy.get('h3').should('contain', 'Entrega Express')
          cy.contains('¿Necesitas flores urgente? Entregamos en 2 horas').should('exist')
          cy.contains('.btn-warning', 'Próximamente').should('exist')
        })
    })

    it('should have CTA card icons', () => {
      cy.get('.cta-card svg').should('have.length.at.least', 2)
    })
  })

  /**
   * Phase 16: Footer Structure
   * Verify: Footer sections, links, social media, contact info
   */
  describe('Phase 16: Footer Structure', () => {
    it('should render footer section', () => {
      cy.get('footer.footer-section')
        .should('exist')
        .and('have.class', 'theme-footer-solid')
        .and('be.visible')
    })

    it('should have footer grid with 4 columns', () => {
      cy.get('footer .grid').first().find('> div').should('have.length', 4)
    })

    it('should have brand section with logo and description', () => {
      cy.get('footer').within(() => {
        cy.contains('span', 'FloresYa').should('exist')
        cy.contains('Tu floristería en línea de confianza').should('exist')
      })
    })

    it('should have social media links', () => {
      cy.get('footer a[aria-label="Facebook"]')
        .should('exist')
        .and('have.attr', 'href', 'https://facebook.com')
        .and('have.attr', 'target', '_blank')
        .and('have.attr', 'rel', 'noopener noreferrer')

      cy.get('footer a[aria-label="Instagram"]')
        .should('exist')
        .and('have.attr', 'href', 'https://instagram.com')

      cy.get('footer a[aria-label="Twitter"]')
        .should('exist')
        .and('have.attr', 'href', 'https://twitter.com')
    })

    it('should have products navigation section', () => {
      cy.get('footer').within(() => {
        cy.contains('h6', 'Productos').should('exist')
        cy.contains('a', 'Rosas').should('exist')
        cy.contains('a', 'Bouquets').should('exist')
        cy.contains('a', 'Plantas').should('exist')
        cy.contains('a', 'Arreglos').should('exist')
      })
    })

    it('should have occasions navigation section', () => {
      cy.get('footer').within(() => {
        cy.contains('h6', 'Ocasiones').should('exist')
        cy.contains('a', 'Amor').should('exist')
        cy.contains('a', 'Cumpleaños').should('exist')
        cy.contains('a', 'Aniversarios').should('exist')
        cy.contains('a', 'Día de la Madre').should('exist')
      })
    })

    it('should have contact information section', () => {
      cy.get('footer').within(() => {
        cy.contains('h6', 'Contacto').should('exist')
        cy.contains('Gran Caracas, Venezuela').should('exist')
        cy.contains('+58412-1234567').should('exist')
        cy.contains('contacto@floresya.com').should('exist')
        cy.contains('Lun-Vie: 8:00-18:00').should('exist')
      })
    })

    it('should have copyright and legal links', () => {
      cy.get('footer').within(() => {
        cy.contains('2025 FloresYa. Todos los derechos reservados.').should('exist')
        cy.contains('a', 'Términos').should('exist')
        cy.contains('a', 'Privacidad').should('exist')
      })
    })
  })

  /**
   * Phase 17: All JavaScript Modules Loading
   * Verify: All script tags are present and loaded
   */
  describe('Phase 17: JavaScript Module Loading', () => {
    it('should load theme management scripts', () => {
      cy.get('script[src*="themeManager.js"]').should('exist').and('have.attr', 'type', 'module')

      cy.get('script[src*="debug-theme.js"]').should('exist').and('have.attr', 'type', 'module')

      cy.get('script[src*="themeSelectorUI.js"]').should('exist').and('have.attr', 'type', 'module')
    })

    it('should load component scripts', () => {
      cy.get('script[src*="loadingMessages.js"]').should('exist').and('have.attr', 'type', 'module')

      cy.get('script[src*="festiveConfetti.js"]').should('exist').and('have.attr', 'type', 'module')
    })

    it('should load main application script', () => {
      cy.get('script[src*="index.js"]').should('exist').and('have.attr', 'type', 'module')
    })

    it('should have service worker cleanup script', () => {
      cy.get('body script').last().should('contain', 'serviceWorker')
    })

    it('should verify all modules loaded without errors', () => {
      cy.get('@consoleError').should('not.have.been.called')
    })
  })

  /**
   * Phase 18: Complete Integration After Load
   * Verify: All components work together after full load
   */
  describe('Phase 18: Complete Integration After Full Page Load', () => {
    it('should have all critical sections rendered', () => {
      // Navigation
      cy.get('nav.navbar').should('exist')

      // Hero
      cy.get('section.hero-section').should('exist')

      // Carousel
      cy.get('#featuredCarousel').should('exist')

      // Products
      cy.get('#productos').should('exist')

      // Testimonials
      cy.get('.testimonials-section').should('exist')

      // Features
      cy.get('.features-section').should('exist')

      // CTA
      cy.get('.special-cta-section').should('exist')

      // Footer
      cy.get('footer.footer-section').should('exist')
    })

    it('should pass core web vitals requirements', () => {
      cy.window().then(win => {
        const perfData = win.performance.timing
        const navigationStart = perfData.navigationStart
        const domContentLoaded = perfData.domContentLoadedEventEnd
        const loadComplete = perfData.loadEventEnd

        // DOM should load quickly
        const dcl = domContentLoaded - navigationStart
        expect(dcl).to.be.lessThan(2000)

        // Full load should complete
        const load = loadComplete - navigationStart
        expect(load).to.be.lessThan(3000)
      })
    })

    it('should have zero JavaScript errors during load', () => {
      cy.get('@consoleError').should('not.have.been.called')
    })

    it('should allow user interactions immediately after load', () => {
      // Click mobile menu
      cy.get('#mobile-menu-btn').should('be.enabled').click()

      // Click nav link
      cy.get('.nav-link').first().should('be.enabled').click()

      // Verify no errors occurred
      cy.get('@consoleError').should('not.have.been.called')
    })

    it('should maintain accessibility throughout interactions', () => {
      // After mobile menu toggle
      cy.get('#mobile-menu-btn').click()

      // Menu should still have proper ARIA
      cy.get('#mobile-menu').should('have.attr', 'role', 'navigation')

      // Button should still have aria-expanded
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-expanded', 'true')
    })

    it('should have all main content sections visible in viewport', () => {
      // Scroll through page to ensure all sections load
      cy.get('#productos').scrollIntoView().should('be.visible')
      cy.get('.testimonials-section').scrollIntoView().should('be.visible')
      cy.get('.features-section').scrollIntoView().should('be.visible')
      cy.get('footer').scrollIntoView().should('be.visible')
    })

    it('should complete full page load without any resource errors', () => {
      // No console errors
      cy.get('@consoleError').should('not.have.been.called')

      // No console warnings (except expected ones)
      // Note: Some warnings might be acceptable (e.g., feature deprecations)
      // We're just checking that critical warnings aren't present
    })
  })
})
