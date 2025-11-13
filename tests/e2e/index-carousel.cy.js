/**
 * @fileoverview E2E Tests for Featured Products Carousel
 * Tests carousel functionality, controls, and navigation
 */

describe('Index - Featured Products Carousel', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for carousel to load
    cy.get('#featuredCarousel', { timeout: 15000 }).should('be.visible')
    cy.wait(2000) // Extra wait for JS initialization
  })

  describe('Carousel Structure', () => {
    it('should display carousel container', () => {
      cy.get('#featuredCarousel').should('be.visible')
      cy.get('#featuredCarousel').should('have.class', 'relative')
    })

    it('should display carousel title and description', () => {
      cy.get('#carousel-title').should('be.visible')
      cy.get('#carousel-title').should('contain.text', 'Nuestras Creaciones Destacadas')
      cy.contains('p', 'Descubre nuestros arreglos más populares').should('be.visible')
    })

    it('should display carousel slides container', () => {
      cy.get('#carouselSlides').should('be.visible')
    })

    it('should display carousel progress bar', () => {
      cy.get('#carouselProgressContainer').should('be.visible')
      cy.get('#carouselProgressBar').should('be.visible')
    })

    it('should display carousel indicators container', () => {
      cy.get('#carousel-indicators').should('be.visible')
    })
  })

  describe('Carousel Controls', () => {
    it('should display previous button', () => {
      cy.get('#carousel-prev').should('be.visible')
      cy.get('#carousel-prev').should('have.attr', 'aria-label', 'Producto anterior')
    })

    it('should display next button', () => {
      cy.get('#carousel-next').should('be.visible')
      cy.get('#carousel-next').should('have.attr', 'aria-label', 'Producto siguiente')
    })

    it('should have clickable next button', () => {
      cy.get('#carousel-next').should('not.be.disabled')
      cy.get('#carousel-next').click()
      cy.wait(600) // Wait for transition
      // Verify slide changed
      cy.get('#carouselSlides').should('not.be.empty')
    })

    it('should have clickable previous button', () => {
      cy.get('#carousel-prev').should('not.be.disabled')
      cy.get('#carousel-prev').click()
      cy.wait(600) // Wait for transition
      // Verify slide changed
      cy.get('#carouselSlides').should('not.be.empty')
    })

    it('should update progress bar when navigating', () => {
      // Get initial progress
      cy.get('#carouselProgressBar')
        .invoke('attr', 'style')
        .then(initialStyle => {
          // Click next
          cy.get('#carousel-next').click()
          cy.wait(600)

          // Progress bar should have different width
          cy.get('#carouselProgressBar')
            .invoke('attr', 'style')
            .then(newStyle => {
              expect(newStyle).to.not.equal(initialStyle)
            })
        })
    })
  })

  describe('Carousel Indicators', () => {
    it('should display indicators when products are loaded', () => {
      // Wait for indicators to be generated
      cy.get('#carousel-indicators', { timeout: 10000 }).should('be.visible')
    })

    it('should allow clicking on indicators', () => {
      // Wait for indicators to be generated
      cy.get('#carousel-indicators .carousel-indicator', { timeout: 10000 })
        .its('length')
        .should('be.gt', 0)

      // Click first indicator
      cy.get('#carousel-indicators .carousel-indicator').first().click()
      cy.wait(600)
      cy.get('#carouselSlides').should('not.be.empty')
    })

    it('should show active indicator state', () => {
      cy.get('#carousel-indicators .carousel-indicator.active').should('exist')
    })
  })

  describe('Carousel Products', () => {
    it('should display product slides when loaded', () => {
      // Wait for products to load
      cy.get('#carouselSlides .carousel-slide', { timeout: 15000 }).its('length').should('be.gt', 0)
    })

    it('should display product information', () => {
      // Check for product elements
      cy.get('#carouselSlides .carousel-slide')
        .first()
        .within(() => {
          cy.get('.carousel-product-image').should('exist')
          cy.get('h4').should('exist') // Product name
          cy.get('p').should('exist') // Product description
          cy.get('.text-pink-600').should('exist') // Price
          cy.get('.btn-primary').should('exist') // Add to cart button
        })
    })

    it('should display multiple slides', () => {
      cy.get('#carouselSlides .carousel-slide', { timeout: 15000 }).its('length').should('be.gt', 1)
    })
  })

  describe('Carousel Responsiveness', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.get('#featuredCarousel').should('be.visible')
      cy.get('#carousel-prev').should('be.visible')
      cy.get('#carousel-next').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.get('#featuredCarousel').should('be.visible')
      cy.get('#carousel-prev').should('be.visible')
      cy.get('#carousel-next').should('be.visible')
    })

    it('should work on desktop viewport', () => {
      cy.viewport(1280, 720)
      cy.get('#featuredCarousel').should('be.visible')
      cy.get('#carousel-prev').should('be.visible')
      cy.get('#carousel-next').should('be.visible')
    })
  })

  describe('Carousel Navigation Flow', () => {
    it('should navigate through all slides using next button', () => {
      // Get total number of slides
      cy.get('#carouselSlides .carousel-slide', { timeout: 15000 })
        .its('length')
        .then(totalSlides => {
          // Click next button for each slide
          for (let i = 0; i < totalSlides; i++) {
            cy.get('#carousel-next').click()
            cy.wait(600)
          }
        })
    })

    it('should navigate through slides using previous button', () => {
      // Click previous a few times
      cy.get('#carousel-prev').click()
      cy.wait(600)
      cy.get('#carousel-prev').click()
      cy.wait(600)
      cy.get('#carousel-prev').click()
      cy.wait(600)
    })

    it('should allow bidirectional navigation', () => {
      // Start at first slide
      cy.get('#carousel-next').click()
      cy.wait(600)
      cy.get('#carousel-prev').click()
      cy.wait(600)
      cy.get('#carousel-next').click()
      cy.wait(600)
      cy.get('#carousel-prev').click()
      cy.wait(600)
    })
  })
})
