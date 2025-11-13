/**
 * @fileoverview E2E Tests for Index Navigation and Links
 * Tests all navigation elements, menu items, and links in index.html
 */

describe('Index - Navigation and Links', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Desktop Navigation', () => {
    it('should display the navbar with all elements', () => {
      // Check navbar exists
      cy.get('nav.navbar').should('be.visible')

      // Check logo
      cy.get('a.navbar-brand').should('be.visible')
      cy.get('a.navbar-brand img.brand-logo').should('be.visible')
      cy.get('a.navbar-brand .brand-text').should('contain.text', 'FloresYa')

      // Check navigation links
      cy.get('ul.nav-links li').should('have.length.at.least', 4)
      cy.contains('ul.nav-links a', 'Inicio').should('be.visible')
      cy.contains('ul.nav-links a', 'Productos').should('be.visible')
      cy.contains('ul.nav-links a', 'Contacto').should('be.visible')
      cy.contains('ul.nav-links a', 'Admin').should('be.visible')
    })

    it('should navigate to Products section when clicking nav link', () => {
      cy.get('a.nav-link[href="#productos"]').click()
      cy.url().should('include', '#productos')
      cy.get('#productos').should('be.visible')
    })

    it('should navigate to Inicio section when clicking Inicio link', () => {
      cy.get('a.nav-link[href="#inicio"]').click()
      cy.url().should('include', '#inicio')
    })

    it('should navigate to Contacto page when clicking Contacto link', () => {
      cy.get('a.nav-link[href="pages/contacto.html"]').click()
      cy.url().should('include', 'pages/contacto.html')
      cy.go('back') // Return to index
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    it('should navigate to Admin dashboard when clicking Admin link', () => {
      cy.get('a.nav-link[href="pages/admin/dashboard.html"]').click()
      cy.url().should('include', 'pages/admin/dashboard.html')
      cy.go('back')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    it('should display theme selector in nav actions', () => {
      cy.get('#theme-selector-container').should('exist')
    })

    it('should display cuco clock toggle button', () => {
      cy.get('#cuco-clock-toggle').should('be.visible')
    })

    it('should display cart icon with badge', () => {
      cy.get('a.nav-icon[href="/pages/cart.html"]').should('be.visible')
      cy.get('.cart-badge').should('be.visible')
    })

    it('should display Login button', () => {
      cy.get('a.btn-login').should('be.visible')
      cy.get('a.btn-login').should('contain.text', 'Iniciar Sesión')
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should hide desktop nav on mobile', () => {
      cy.get('ul.nav-links').should('not.be.visible')
    })

    it('should display mobile menu toggle button', () => {
      cy.get('button.mobile-menu-toggle').should('be.visible')
      cy.get('button.mobile-menu-toggle').should('have.attr', 'aria-label', 'Abrir menú móvil')
    })

    it('should open mobile menu when toggle is clicked', () => {
      cy.get('button.mobile-menu-toggle').click()
      cy.get('.mobile-menu').should('not.have.class', 'hidden')
      cy.get('button.mobile-menu-toggle').should('have.attr', 'aria-expanded', 'true')
    })

    it('should close mobile menu when clicking close action', () => {
      // Open menu
      cy.get('button.mobile-menu-toggle').click()
      cy.get('.mobile-menu').should('not.have.class', 'hidden')

      // Close by clicking toggle again
      cy.get('button.mobile-menu-toggle').click()
      cy.get('.mobile-menu').should('have.class', 'hidden')
    })

    it('should display mobile nav links when menu is open', () => {
      cy.get('button.mobile-menu-toggle').click()
      cy.get('ul.mobile-nav-links').should('be.visible')
      cy.contains('ul.mobile-nav-links a', 'Inicio').should('be.visible')
      cy.contains('ul.mobile-nav-links a', 'Productos').should('be.visible')
      cy.contains('ul.mobile-nav-links a', 'Contacto').should('be.visible')
      cy.contains('ul.mobile-nav-links a', 'Admin').should('be.visible')
      cy.contains('ul.mobile-nav-links a', 'Iniciar Sesión').should('be.visible')
    })
  })

  describe('Hero Section Links', () => {
    it('should display hero section with title and subtitle', () => {
      cy.get('section.hero-section').should('be.visible')
      cy.get('#hero-title').should('contain.text', 'Flores frescas para cada ocasión')
      cy.get('.hero-subtitle').should('be.visible')
    })

    it('should display hero CTA buttons', () => {
      cy.get('.hero-cta').should('be.visible')
      cy.get('.hero-cta a.btn-primary').should('contain.text', 'Explorar Catálogo')
      cy.get('.hero-cta a.btn-secondary').should('contain.text', 'Arreglos para Bodas')
    })

    it('should navigate to products when clicking Explorar Catálogo', () => {
      cy.get('.hero-cta a.btn-primary').click()
      cy.url().should('include', '#productos')
      cy.get('#productos').should('be.visible')
    })

    it('should display hero image', () => {
      cy.get('.hero-image').should('be.visible')
      cy.get('.hero-image').should('have.attr', 'src').and('not.be.empty')
    })

    it('should display hero features', () => {
      cy.get('.hero-features').should('be.visible')
      cy.get('.hero-features .feature-item').should('have.length.at.least', 3)
      cy.contains('.hero-features', 'Entrega gratis').should('be.visible')
      cy.contains('.hero-features', '100% garantizado').should('be.visible')
      cy.contains('.hero-features', 'Entrega el mismo día').should('be.visible')
    })
  })

  describe('Footer Links', () => {
    it('should display footer with all sections', () => {
      cy.get('footer.footer-section').scrollIntoView().should('be.visible')
      cy.get('footer .container').should('be.visible')
    })

    it('should display social media links in footer', () => {
      cy.get('footer').scrollIntoView()
      cy.get('footer a[href="https://facebook.com"]').should('be.visible')
      cy.get('footer a[href="https://instagram.com"]').should('be.visible')
      cy.get('footer a[href="https://twitter.com"]').should('be.visible')
    })

    it('should display product links in footer', () => {
      cy.get('footer').scrollIntoView()
      cy.contains('footer h6', 'Productos').should('be.visible')
      cy.contains('footer ul li a', 'Rosas').should('be.visible')
      cy.contains('footer ul li a', 'Bouquets').should('be.visible')
      cy.contains('footer ul li a', 'Plantas').should('be.visible')
      cy.contains('footer ul li a', 'Arreglos').should('be.visible')
    })

    it('should display occasions links in footer', () => {
      cy.get('footer').scrollIntoView()
      cy.contains('footer h6', 'Ocasiones').should('be.visible')
      cy.contains('footer ul li a', 'Amor').should('be.visible')
      cy.contains('footer ul li a', 'Cumpleaños').should('be.visible')
      cy.contains('footer ul li a', 'Aniversarios').should('be.visible')
      cy.contains('footer ul li a', 'Día de la Madre').should('be.visible')
    })

    it('should display contact information in footer', () => {
      cy.get('footer').scrollIntoView()
      cy.contains('footer h6', 'Contacto').should('be.visible')
      cy.contains('footer', 'Gran Caracas, Venezuela').should('be.visible')
      cy.contains('footer', '+58412-1234567').should('be.visible')
      cy.contains('footer', 'contacto@floresya.com').should('be.visible')
      cy.contains('footer', 'Lun-Vie: 8:00-18:00').should('be.visible')
    })

    it('should display legal links in footer', () => {
      cy.get('footer').scrollIntoView()
      cy.contains('footer a', 'Términos').should('be.visible')
      cy.contains('footer a', 'Privacidad').should('be.visible')
    })
  })

  describe('Logo Link', () => {
    it('should navigate to home when clicking logo', () => {
      cy.get('a.navbar-brand').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })
})
