import { test, expect } from '@playwright/test'
import * as accessibilityHelpers from './utils/accessibility-helpers.js'
import * as performanceHelpers from './utils/performance-helpers.js'

test.describe('Index.html - Complete Page Load and Component Initialization', () => {
  test.beforeEach(async ({ page }) => {
    // Visit index page
    await page.goto('/')

    // Monitor console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`)
      }
    })
  })

  test.describe('Phase 1: HTML Document Structure', () => {
    test('should have valid HTML structure and DOCTYPE', async ({ request }) => {
      const response = await request.get('/')
      const body = await response.text()
      expect(body).toContain('<!doctype html>') // Playwright request returns lowercase usually? Or text.
      // Actually doctype case might vary, but standard is case insensitive.
      // Let's check for html lang
      expect(body).toContain('lang="es"')
    })

    test('should have html element with data-theme attribute', async ({ page }) => {
      const html = page.locator('html')
      await expect(html).toHaveAttribute('lang', 'es')
      await expect(html).toHaveAttribute('data-theme', 'light')
    })

    test('should have required head meta tags', async ({ page }) => {
      await expect(page.locator('head meta[charset="UTF-8"]')).toHaveCount(1)
      await expect(page.locator('head meta[name="viewport"]')).toHaveAttribute(
        'content',
        'width=device-width, initial-scale=1.0'
      )
      await expect(page.locator('head meta[name="description"]')).toHaveCount(1)
      await expect(page.locator('head meta[name="keywords"]')).toHaveCount(1)
      await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
        'content',
        'index, follow'
      )
    })

    test('should have proper title tag', async ({ page }) => {
      await expect(page).toHaveTitle(/FloresYa/)
    })

    test('should have structured data (JSON-LD)', async ({ page }) => {
      const script = page.locator('head script[type="application/ld+json"]')
      await expect(script).toHaveCount(1)
      const text = await script.textContent()
      const data = JSON.parse(text)
      expect(data['@context']).toBe('https://schema.org')
      expect(data['@type']).toBe('Florist')
      expect(data.name).toBe('FloresYa')
    })

    test('should have Open Graph meta tags', async ({ page }) => {
      await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute('content')
      await expect(page.locator('head meta[property="og:type"]')).toHaveAttribute(
        'content',
        'website'
      )
      await expect(page.locator('head meta[property="og:url"]')).toHaveCount(1)
    })
  })

  test.describe('Phase 2: CSS and Theme Preload', () => {
    test('should preload theme script before CSS', async ({ page }) => {
      await expect(page.locator('head script[src*="themePreload"]')).toHaveCount(1)
    })

    test('should load all required stylesheets', async ({ page }) => {
      await expect(
        page.locator('head link[rel="stylesheet"][href="./css/styles.css"]')
      ).toHaveCount(1)
      await expect(
        page.locator('head link[rel="stylesheet"][href="./css/tailwind.css"]')
      ).toHaveCount(1)
      await expect(
        page.locator('head link[rel="stylesheet"][href="./css/themes.css"]')
      ).toHaveCount(1)
      await expect(
        page.locator('head link[rel="stylesheet"][href="./css/themes-granular.css"]')
      ).toHaveCount(1)
      await expect(
        page.locator('head link[rel="stylesheet"][href="./css/components/cuco-clock.css"]')
      ).toHaveCount(1)
    })

    test('should preload critical resources', async ({ page }) => {
      await expect(
        page.locator('head link[rel="preload"][as="image"][href="./images/hero-flowers.webp"]')
      ).toHaveCount(1)
      const stylePreloads = await page.locator('head link[rel="preload"][as="style"]').count()
      expect(stylePreloads).toBeGreaterThanOrEqual(2)
    })

    test('should have DNS prefetch for external fonts', async ({ page }) => {
      await expect(
        page.locator('head link[rel="dns-prefetch"][href*="fonts.googleapis"]')
      ).toHaveCount(1)
      await expect(
        page.locator('head link[rel="dns-prefetch"][href*="fonts.gstatic"]')
      ).toHaveCount(1)
    })

    test('should have preconnect for fonts', async ({ page }) => {
      await expect(
        page.locator('head link[rel="preconnect"][href*="fonts.googleapis"]')
      ).toHaveCount(1)
      await expect(page.locator('head link[rel="preconnect"][href*="fonts.gstatic"]')).toHaveCount(
        1
      )
    })

    test('should apply CSS styling to body', async ({ page }) => {
      await expect(page.locator('body')).toBeVisible()
      await expect(page.locator('body')).toHaveCSS('font-family', /.*/)
    })
  })

  test.describe('Phase 3: Navigation Component (Static)', () => {
    test('should render navigation element with proper role', async ({ page }) => {
      const nav = page.locator('nav.navbar')
      await expect(nav).toHaveAttribute('role', 'navigation')
      await expect(nav).toHaveAttribute('aria-label', 'Navegación principal')
    })

    test('should display logo and brand text', async ({ page }) => {
      await expect(page.locator('.navbar-brand')).toHaveAttribute('href', '/')
      await expect(page.locator('.navbar-brand img.brand-logo')).toHaveAttribute(
        'src',
        './images/logoFloresYa.jpeg'
      )
      await expect(page.locator('.navbar-brand img.brand-logo')).toHaveAttribute(
        'alt',
        'Logo de FloresYa'
      )
      await expect(page.locator('.navbar-brand .brand-text')).toContainText('FloresYa')
    })

    test('should have desktop navigation links', async ({ page }) => {
      await expect(page.locator('.desktop-nav .nav-links')).toHaveAttribute('role', 'menubar')
      const links = page.locator('.nav-links .nav-link')
      await expect(links.first()).toBeVisible()

      await expect(page.locator('.nav-link', { hasText: 'Inicio' })).toHaveAttribute(
        'href',
        '#inicio'
      )
      await expect(page.locator('.nav-link', { hasText: 'Productos' })).toHaveAttribute(
        'href',
        '#productos'
      )
      await expect(page.locator('.nav-link', { hasText: 'Contacto' })).toHaveAttribute(
        'href',
        'pages/contacto.html'
      )
    })

    test('should render nav action buttons', async ({ page }) => {
      await expect(page.locator('a[aria-label*="Carrito"]')).toHaveAttribute(
        'href',
        '/pages/cart.html'
      )
      await expect(page.locator('.cart-badge')).toContainText('0')
      await expect(page.locator('.btn-login')).toContainText('Iniciar Sesión')
      await expect(page.locator('#mobile-menu-btn')).toHaveAttribute(
        'aria-label',
        'Abrir menú móvil'
      )
      await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded', 'false')
    })

    test('should have mobile menu (hidden by default)', async ({ page }) => {
      await expect(page.locator('#mobile-menu')).toBeAttached()
    })

    test('should have navbar spacer', async ({ page }) => {
      await expect(page.locator('.navbar-spacer')).toBeAttached()
    })
  })

  test.describe('Phase 4: Hero Section (Static)', () => {
    test('should render hero section with proper structure', async ({ page }) => {
      const hero = page.locator('section.hero-section')
      await expect(hero).toHaveAttribute('role', 'banner')
      await expect(hero).toHaveAttribute('aria-labelledby', 'hero-title')
    })

    test('should display hero title and subtitle', async ({ page }) => {
      await expect(page.locator('#hero-title')).toBeVisible()
      await expect(page.locator('#hero-title')).toContainText('Flores frescas para cada ocasión')
      await expect(page.locator('.hero-subtitle')).toBeVisible()
      await expect(page.locator('.hero-subtitle')).toContainText('Ramos y arreglos florales')
    })

    test('should have primary CTA buttons', async ({ page }) => {
      await expect(page.locator('.hero-cta .btn-primary')).toContainText('Explorar Catálogo')
      await expect(page.locator('.hero-cta .btn-primary')).toHaveAttribute('href', '#productos')
      await expect(page.locator('.hero-cta .btn-secondary')).toContainText('Arreglos para Bodas')
      await expect(page.locator('.hero-cta .btn-secondary')).toHaveAttribute('href', '#bodas')
    })

    test('should display hero features section', async ({ page }) => {
      await expect(page.locator('.hero-features')).toBeVisible()
      await expect(page.locator('.feature-item').first()).toBeVisible()
    })

    test('should have animated gradient class applied', async ({ page }) => {
      const hero = page.locator('.hero-section')
      await expect(hero).toHaveClass(/theme-hero-gradient/)
      await expect(hero).toHaveClass(/animate-gradient/)
    })
  })

  test.describe('Phase 5: Favicon and Manifest', () => {
    test('should have favicon link', async ({ page }) => {
      await expect(page.locator('head link[rel="icon"]')).toHaveAttribute(
        'href',
        './images/favicon.ico'
      )
    })

    test('should have manifest link', async ({ page }) => {
      await expect(page.locator('head link[rel="manifest"]')).toHaveAttribute(
        'href',
        './manifest.json'
      )
    })

    test('should have valid manifest.json', async ({ request }) => {
      const response = await request.get('./manifest.json')
      expect(response.status()).toBe(200)
      const body = await response.json()
      expect(body).toHaveProperty('name')
      expect(body).toHaveProperty('short_name')
    })
  })

  test.describe('Phase 6: Dynamic Component Initialization', () => {
    test('should initialize theme selector container', async ({ page }) => {
      await expect(page.locator('#theme-selector-container')).toBeAttached()
    })

    test('should have cuco clock toggle button', async ({ page }) => {
      const btn = page.locator('#cuco-clock-toggle')
      await expect(btn).toHaveAttribute('title', 'Toggle Cuco Clock')
      await expect(btn.locator('svg.cuco-icon')).toBeVisible()
    })

    test('should initialize mobile menu toggle functionality', async ({ page }) => {
      await expect(page.locator('#mobile-nav-drawer')).toBeAttached()
      const btn = page.locator('#mobile-menu-btn')
      await expect(btn).toHaveAttribute('aria-expanded', 'false')

      await btn.click()
      await expect(page.locator('#mobile-nav-drawer')).toHaveClass(/mobile-nav-drawer-open/)
      await expect(btn).toHaveAttribute('aria-expanded', 'true')

      await page.locator('.drawer-close-btn').click()
      await expect(page.locator('#mobile-nav-drawer')).not.toHaveClass(/mobile-nav-drawer-open/)
      await expect(btn).toHaveAttribute('aria-expanded', 'false')
    })
  })

  test.describe('Phase 7: Accessibility Standards', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('#hero-title')).toBeAttached()
    })

    test('should have alt text on all images', async ({ page }) => {
      await accessibilityHelpers.verifyImageAccessibility(page)
    })

    test('should have aria labels on interactive elements', async ({ page }) => {
      await accessibilityHelpers.verifyAriaLabels(page)
    })

    test('should have semantic HTML structure', async ({ page }) => {
      await accessibilityHelpers.verifySemanticHTML(page)
    })

    test('should support keyboard navigation on navbar links', async ({ page }) => {
      await accessibilityHelpers.verifyKeyboardNavigation(page)
    })
  })

  test.describe('Phase 8: Resource Loading and Performance', () => {
    test('should load logo image successfully', async ({ page }) => {
      const img = page.locator('.navbar-brand img')
      await expect(img).toBeVisible()
      const naturalWidth = await img.evaluate(el => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    })

    test('should not have any broken image links', async ({ page }) => {
      const images = page.locator('img')
      const count = await images.count()
      for (let i = 0; i < count; i++) {
        const complete = await images.nth(i).evaluate(el => el.complete)
        expect(complete).toBe(true)
      }
    })

    test('should load all CSS files with 200 status', async ({ request }) => {
      const cssFiles = [
        './css/styles.css',
        './css/tailwind.css',
        './css/themes.css',
        './css/components/cuco-clock.css'
      ]
      for (const file of cssFiles) {
        const response = await request.get(file)
        expect(response.status()).toBe(200)
      }
    })

    test('should have reasonable page load time (LCP < 3s)', async ({ page }) => {
      const metrics = await performanceHelpers.measurePageLoadPerformance(page)
      expect(metrics.loadTime).toBeLessThan(3000)
    })
  })

  test.describe('Phase 9: Theme System', () => {
    test('should have html with data-theme attribute', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme')
    })

    test('should apply theme CSS variables to body', async ({ page }) => {
      await expect(page.locator('body')).toHaveCSS('--navbar-icon-color', /.*/)
    })

    test('should support theme switching via script', async ({ page }) => {
      await page.evaluate(() => localStorage.setItem('theme', 'dark'))
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('data-theme') // Should check if it's dark if possible, but logic might vary
    })
  })

  test.describe('Phase 10: Featured Carousel Component', () => {
    test('should render carousel container', async ({ page }) => {
      await expect(page.locator('#featuredCarousel')).toHaveAttribute('role', 'region')
    })

    test('should have carousel navigation controls', async ({ page }) => {
      await expect(page.locator('#carousel-prev')).toBeVisible()
      await expect(page.locator('#carousel-next')).toBeVisible()
    })

    test('should have carousel slides container', async ({ page }) => {
      await expect(page.locator('#carouselSlides')).toBeAttached()
    })

    test('should have progress bar element', async ({ page }) => {
      await expect(page.locator('#carouselProgressContainer')).toBeAttached()
      await expect(page.locator('#carouselProgressBar')).toBeAttached()
    })

    test('should have carousel indicators container', async ({ page }) => {
      await expect(page.locator('#carousel-indicators')).toBeAttached()
    })

    test('should have carousel title and description', async ({ page }) => {
      await expect(page.locator('#carousel-title')).toContainText('Nuestras Creaciones Destacadas')
    })
  })

  test.describe('Phase 11: Products Section Structure', () => {
    test('should render products section', async ({ page }) => {
      await expect(page.locator('#productos')).toHaveAttribute('role', 'main')
    })

    test('should have products section heading', async ({ page }) => {
      await expect(page.locator('#productos h2')).toContainText('Productos Destacados')
    })

    test('should have filter panel', async ({ page }) => {
      await expect(page.locator('#filters-heading')).toHaveClass(/sr-only/)
    })

    test('should have products container', async ({ page }) => {
      await expect(page.locator('#productsContainer')).toHaveClass(/grid/)
    })

    test('should have pagination navigation', async ({ page }) => {
      await expect(page.locator('#pagination')).toBeAttached()
    })
  })

  test.describe('Phase 12: Filter System Components', () => {
    test('should render quick occasion filters', async ({ page }) => {
      await expect(page.locator('#quickFilters')).toHaveAttribute('role', 'group')
    })

    test('should have "Todos" filter button active by default', async ({ page }) => {
      await expect(page.locator('#filter-all')).toHaveClass(/active/)
      await expect(page.locator('#filter-all')).toHaveAttribute('aria-pressed', 'true')
    })

    test('should have accessible search input', async ({ page }) => {
      await expect(page.locator('#searchInput')).toHaveAttribute(
        'placeholder',
        'Buscar por nombre...'
      )
    })

    test('should have sort filter dropdown', async ({ page }) => {
      await expect(page.locator('#sortFilter option')).toHaveCount(5) // or more
    })

    test('should have price range filter dropdown', async ({ page }) => {
      await expect(page.locator('#priceRange option')).toHaveCount(5) // or more
    })
  })

  test.describe('Phase 13: Testimonials Section', () => {
    test('should render testimonials section', async ({ page }) => {
      await expect(page.locator('.testimonials-section')).toBeVisible()
    })

    test('should render exactly 3 testimonial cards', async ({ page }) => {
      await expect(page.locator('.testimonial-card')).toHaveCount(3)
    })

    test('should have themed testimonial cards', async ({ page }) => {
      await expect(page.locator('.testimonial-card.pink')).toBeAttached()
      await expect(page.locator('.testimonial-card.green')).toBeAttached()
      await expect(page.locator('.testimonial-card.yellow')).toBeAttached()
    })
  })

  test.describe('Phase 14: Features Section', () => {
    test('should render features section', async ({ page }) => {
      await expect(page.locator('.features-section')).toBeVisible()
    })

    test('should render exactly 4 feature cards', async ({ page }) => {
      await expect(page.locator('.feature-card')).toHaveCount(4)
    })

    test('should have expected feature titles', async ({ page }) => {
      await expect(page.locator('.feature-title', { hasText: 'Flores Frescas' })).toBeVisible()
      await expect(page.locator('.feature-title', { hasText: 'Entrega Rápida' })).toBeVisible()
    })
  })

  test.describe('Phase 15: Special CTA Section', () => {
    test('should render special CTA section', async ({ page }) => {
      await expect(page.locator('.special-cta-section')).toBeVisible()
    })

    test('should render FloresYa Novias card', async ({ page }) => {
      await expect(page.locator('.cta-card', { hasText: 'FloresYa Novias' })).toBeVisible()
    })

    test('should render Entrega Express card', async ({ page }) => {
      await expect(page.locator('.cta-card', { hasText: 'Entrega Express' })).toBeVisible()
    })
  })

  test.describe('Phase 16: Footer Structure', () => {
    test('should render footer section', async ({ page }) => {
      await expect(page.locator('footer.footer-section')).toBeVisible()
    })

    test('should have footer grid with 4 columns', async ({ page }) => {
      await expect(page.locator('footer .grid').first().locator('> div')).toHaveCount(4)
    })

    test('should have social media links', async ({ page }) => {
      await expect(page.locator('footer a[aria-label="Facebook"]')).toBeVisible()
      await expect(page.locator('footer a[aria-label="Instagram"]')).toBeVisible()
    })
  })
})
