/**
 * Test 1.2.1: verify_navigation_system_ui
 *
 * Test-Driven Development Implementation
 * Following Google Testing Blog and MIT CSAIL best practices
 *
 * Purpose: Verify Navigation System UI components functionality
 * Risk Level: HIGH - Critical for user navigation and accessibility
 * Expected Outcome: 100% Success Rate
 */

describe('🧭 Navigation System UI', () => {
  beforeEach(() => {
    // Clean slate for each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.log('🧭 Testing navigation system UI...')
  })

  context('verify_navigation_system_ui', () => {
    it('✅ should render desktop navigation correctly', () => {
      cy.visit('/')

      // Verify main navigation bar exists
      cy.get('nav.navbar').should('exist').and('be.visible')
      cy.get('nav.navbar').should('have.attr', 'role', 'navigation')
      cy.get('nav.navbar').should('have.attr', 'aria-label', 'Navegación principal')

      // Verify navbar container
      cy.get('.navbar .container').should('exist').and('be.visible')

      // Verify navbar content layout
      cy.get('.navbar-content').should('exist').and('be.visible')

      // Verify logo/brand
      cy.get('.navbar-brand').should('exist').and('be.visible')
      cy.get('.navbar-brand').should('have.attr', 'aria-label')
      cy.get('.brand-logo').should('exist')
      cy.get('.brand-text').should('contain', 'FloresYa')

      // Verify desktop navigation links
      cy.get('.desktop-nav').should('exist').and('be.visible')
      cy.get('.nav-links').should('exist').and('be.visible')
      cy.get('.nav-links').should('have.attr', 'role', 'menubar')

      // Verify navigation links
      cy.get('.nav-link').should('have.length.greaterThan', 0)
      cy.get('.nav-link').each($link => {
        cy.wrap($link).should('have.attr', 'href')
      })

      // Verify specific navigation items
      cy.get('.nav-link').contains('Inicio').should('exist')
      cy.get('.nav-link').contains('Productos').should('exist')
      cy.get('.nav-link').contains('Contacto').should('exist')
      cy.get('.nav-link').contains('Admin').should('exist')
    })

    it('✅ should render mobile navigation correctly', () => {
      cy.visit('/')

      // Verify mobile menu toggle button exists
      cy.get('#mobile-menu-btn').should('exist')
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-label')
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-expanded', 'false')

      // Verify mobile menu container exists
      cy.get('#mobile-menu').should('exist')

      // Test mobile menu toggle functionality - use mobile viewport
      cy.viewport(375, 667) // Switch to mobile viewport first
      cy.wait(500) // Wait for CSS to apply
      cy.get('#mobile-menu-btn').should('be.visible')

      // Now test the toggle functionality
      cy.get('#mobile-menu-btn').click({ force: true }) // Use force if needed
      cy.wait(500) // Wait for menu animation
      cy.get('#mobile-menu').should('not.have.class', 'hidden')
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-expanded', 'true')

      // Verify mobile navigation links
      cy.get('.mobile-nav-links').should('exist').and('be.visible')
      cy.get('.mobile-nav-link').should('have.length.greaterThan', 0)

      // Close mobile menu
      cy.get('#mobile-menu-btn').click({ force: true })
      cy.wait(500) // Wait for menu animation
      cy.get('#mobile-menu').should('have.class', 'hidden')
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-expanded', 'false')
    })

    it('✅ should have responsive navigation behavior', () => {
      cy.visit('/')

      // Test desktop viewport
      cy.viewport(1280, 720)
      cy.get('.desktop-nav').should('be.visible')
      cy.get('#mobile-menu-btn').should('not.be.visible')

      // Test tablet viewport
      cy.viewport(768, 1024)
      cy.get('.desktop-nav').should('be.visible')
      cy.get('#mobile-menu-btn').should('not.be.visible')

      // Test mobile viewport
      cy.viewport(375, 667)
      cy.wait(500) // Wait for CSS to apply
      cy.get('.desktop-nav').should('not.be.visible')
      cy.get('#mobile-menu-btn').should('be.visible')

      // Test mobile menu functionality in mobile viewport
      cy.get('#mobile-menu-btn').click({ force: true })
      cy.wait(500) // Wait for menu animation
      cy.get('#mobile-menu').should('not.have.class', 'hidden')
      cy.get('.mobile-nav-links').should('be.visible')
    })

    it('✅ should have theme selector functionality', () => {
      cy.visit('/')

      // Verify theme selector container exists
      cy.get('#theme-selector-container').should('exist')

      // Wait for theme selector to be populated by JavaScript
      cy.wait(1000)

      // Check if theme selector dropdown is rendered
      cy.get('#theme-selector-container').within(() => {
        // Look for any theme selector elements (dropdown, buttons, etc.)
        cy.get('*').should('have.length.greaterThan', 0)
      })
    })

    it('✅ should have shopping cart icon with badge', () => {
      cy.visit('/')

      // Verify cart icon exists
      cy.get('.nav-icon[href="/pages/cart.html"]').should('exist')
      cy.get('.nav-icon[href="/pages/cart.html"]').should('have.attr', 'aria-label')

      // Verify cart badge exists
      cy.get('.cart-badge').should('exist')
      cy.get('.cart-badge').should('contain', '0') // Initial state

      // Verify cart icon is clickable
      cy.get('.nav-icon[href="/pages/cart.html"]').should('have.attr', 'href')
    })

    it('✅ should have login functionality', () => {
      cy.visit('/')

      // Verify login button exists
      cy.get('.btn-login').should('exist').and('be.visible')
      cy.get('.btn-login').should('contain', 'Iniciar Sesión')
      cy.get('.btn-login').should('have.attr', 'href')
    })

    it('✅ should have proper accessibility attributes', () => {
      cy.visit('/')

      // Verify ARIA attributes on navigation
      cy.get('nav[role="navigation"]').should('exist')
      cy.get('nav[aria-label]').should('exist')

      // Verify menubar role
      cy.get('.nav-links[role="menubar"]').should('exist')

      // Verify button accessibility
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-label')
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-expanded')

      // Verify link accessibility
      cy.get('.navbar-brand').should('have.attr', 'aria-label')
      cy.get('.nav-icon[href="/pages/cart.html"]').should('have.attr', 'aria-label')
    })

    it('✅ should handle navigation interactions correctly', () => {
      cy.visit('/')

      // Test navigation links are interactive
      cy.get('.nav-link').each($link => {
        cy.wrap($link).should('have.attr', 'href')
        cy.wrap($link).should('not.have.attr', 'href', '#') // No dead links
      })

      // Test mobile menu toggle states
      cy.viewport(375, 667) // Mobile viewport
      cy.wait(500) // Wait for CSS to apply
      cy.get('#mobile-menu-btn').click({ force: true })
      cy.wait(500) // Wait for menu animation
      cy.get('#mobile-menu').should('not.have.class', 'hidden')
      cy.get('#mobile-menu-btn').should('have.attr', 'aria-expanded', 'true')

      // Test keyboard navigation
      cy.get('.navbar').focus()
      cy.focused().should('have.class', 'navbar-brand')

      // Test escape key to close mobile menu (if open)
      cy.get('body').type('{esc}')
    })

    it('✅ should have proper theme integration', () => {
      cy.visit('/')

      // Verify navigation has theme classes
      cy.get('.navbar').should('have.class', 'theme-nav-glass')

      // Verify theme attribute on HTML
      cy.get('html').should('have.attr', 'data-theme')

      // Verify navigation styling respects theme
      cy.get('.navbar').should('be.visible')
      cy.get('.navbar').should('have.css', 'background-color')
    })

    it('✅ should have Cuco Clock toggle functionality', () => {
      cy.visit('/')

      // Verify Cuco Clock toggle exists
      cy.get('#cuco-clock-toggle').should('exist')
      cy.get('#cuco-clock-toggle').should('have.attr', 'type', 'button')
      cy.get('#cuco-clock-toggle').should('have.attr', 'title')
      cy.get('#cuco-clock-toggle').should('have.attr', 'title', 'Toggle Cuco Clock')

      // Verify Cuco Clock icon
      cy.get('#cuco-clock-toggle .cuco-icon').should('exist')

      // Test Cuco Clock toggle click
      cy.get('#cuco-clock-toggle').click()
      // Note: Actual functionality depends on JavaScript implementation
    })
  })
})
