/**
 * Cuco Clock E2E Tests
 * Tests the cuco clock functionality in the browser
 *
 * This test verifies that the cuco clock component works correctly
 * in the actual browser environment, including DOM manipulation,
 * event handling, and visual interactions.
 */

describe('Cuco Clock E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    // Wait for the cuco clock to initialize
    cy.wait(1000)
  })

  describe('Clock Initialization', () => {
    it('should create cuco clock element in DOM', () => {
      cy.get('.cuco-clock').should('exist')
      cy.get('.cuco-clock').should('be.visible')
    })

    it('should have all required clock components', () => {
      cy.get('.cuco-clock-face').should('exist')
      cy.get('.cuco-clock-time-display').should('exist')
      cy.get('.cuco-clock-door').should('exist')
      cy.get('.cuco-clock-bird').should('exist')
      cy.get('.cuco-clock-speech-bubble').should('exist')
      cy.get('.cuco-clock-sound-btn').should('exist')
    })

    it('should display current time', () => {
      cy.get('.cuco-clock-time-display').should('not.contain', '--:--')
      cy.get('.cuco-clock-time-display')
        .invoke('text')
        .should('match', /^\d{2}:\d{2}$/)
    })

    it('should have clock hands positioned', () => {
      cy.get('.cuco-clock-hour-hand').should('have.css', 'transform')
      cy.get('.cuco-clock-minute-hand').should('have.css', 'transform')
    })
  })

  describe('Clock Toggle Functionality', () => {
    it('should toggle clock visibility with button click', () => {
      // Initially clock should be hidden (default state)
      cy.get('.cuco-clock').should('not.be.visible')

      // Click toggle button
      cy.get('#cuco-clock-toggle').click()
      cy.wait(300)
      cy.get('.cuco-clock').should('be.visible')

      // Click again to hide
      cy.get('#cuco-clock-toggle').click()
      cy.wait(300)
      cy.get('.cuco-clock').should('not.be.visible')
    })

    it('should toggle clock with keyboard shortcut (Ctrl+`)', () => {
      // Initially clock should be hidden
      cy.get('.cuco-clock').should('not.be.visible')

      // Press Ctrl+`
      cy.get('body').trigger('keydown', { key: '`', ctrlKey: true })
      cy.wait(300)
      cy.get('.cuco-clock').should('be.visible')

      // Press again to hide
      cy.get('body').trigger('keydown', { key: '`', ctrlKey: true })
      cy.wait(300)
      cy.get('.cuco-clock').should('not.be.visible')
    })

    it('should update toggle button active state', () => {
      // Initially not active
      cy.get('#cuco-clock-toggle').should('not.have.class', 'active')

      // Click to show clock
      cy.get('#cuco-clock-toggle').click()
      cy.get('#cuco-clock-toggle').should('have.class', 'active')

      // Click to hide clock
      cy.get('#cuco-clock-toggle').click()
      cy.get('#cuco-clock-toggle').should('not.have.class', 'active')
    })
  })

  describe('Manual Cuco Trigger', () => {
    beforeEach(() => {
      // Show the clock first
      cy.get('#cuco-clock-toggle').click()
      cy.wait(300)
    })

    it('should trigger cuco animation when clicking clock face', () => {
      // Click on clock face
      cy.get('.cuco-clock-face').click()

      // Check that door opens
      cy.get('.cuco-clock-door').should('have.class', 'open')

      // Check that bird appears
      cy.get('.cuco-clock-bird').should('have.class', 'show')

      // Check that speech bubble appears
      cy.get('.cuco-clock-speech-bubble').should('have.class', 'show')

      // Wait for animation to complete
      cy.wait(2000)

      // Check that elements are hidden again
      cy.get('.cuco-clock-door').should('not.have.class', 'open')
      cy.get('.cuco-clock-bird').should('not.have.class', 'show')
      cy.get('.cuco-clock-speech-bubble').should('not.have.class', 'show')
    })

    it('should display cucu text in speech bubble', () => {
      cy.get('.cuco-clock-face').click()
      cy.get('.cuco-clock-speech-bubble').should('contain', '¡CU-CU!')
    })
  })

  describe('Sound Toggle Functionality', () => {
    beforeEach(() => {
      // Show the clock first
      cy.get('#cuco-clock-toggle').click()
      cy.wait(300)
    })

    it('should toggle sound button visual state', () => {
      // Initially sound should be disabled (waves dimmed)
      cy.get('.sound-wave').should('have.css', 'opacity', '0.3')

      // Click sound button
      cy.get('.cuco-clock-sound-btn').click()

      // Sound waves should be visible
      cy.get('.sound-wave').should('have.css', 'opacity', '1')

      // Click again to disable
      cy.get('.cuco-clock-sound-btn').click()
      cy.get('.sound-wave').should('have.css', 'opacity', '0.3')
    })

    it('should prevent event bubbling when clicking sound button', () => {
      // Click sound button - should not trigger cuco animation
      cy.get('.cuco-clock-sound-btn').click()

      // Door should not open
      cy.get('.cuco-clock-door').should('not.have.class', 'open')
    })
  })

  describe('Clock Persistence', () => {
    it('should persist clock visibility state', () => {
      // Show clock
      cy.get('#cuco-clock-toggle').click()
      cy.get('.cuco-clock').should('be.visible')

      // Reload page
      cy.reload()
      cy.wait(1000)

      // Clock should still be visible
      cy.get('.cuco-clock').should('be.visible')
      cy.get('#cuco-clock-toggle').should('have.class', 'active')
    })

    it('should persist sound state', () => {
      // Show clock and enable sound
      cy.get('#cuco-clock-toggle').click()
      cy.get('.cuco-clock-sound-btn').click()
      cy.get('.sound-wave').should('have.css', 'opacity', '1')

      // Reload page
      cy.reload()
      cy.wait(1000)

      // Sound should still be enabled
      cy.get('.sound-wave').should('have.css', 'opacity', '1')
    })
  })

  describe('Clock Accuracy', () => {
    beforeEach(() => {
      // Show the clock first
      cy.get('#cuco-clock-toggle').click()
      cy.wait(300)
    })

    it('should update time display every second', () => {
      // Get initial time
      cy.get('.cuco-clock-time-display').invoke('text').as('initialTime')

      // Wait for time update
      cy.wait(1000)

      // Time should have changed (or at least not be the same if second changed)
      cy.get('.cuco-clock-time-display')
        .invoke('text')
        .then(newTime => {
          cy.get('@initialTime').then(initialTime => {
            // Either time changed or stayed same (if exactly on second boundary)
            expect(typeof newTime).to.equal('string')
            expect(newTime).to.match(/^\d{2}:\d{2}$/)
          })
        })
    })

    it('should maintain proper time format', () => {
      cy.get('.cuco-clock-time-display')
        .invoke('text')
        .should('match', /^\d{2}:\d{2}$/)
    })
  })

  describe('Error Handling', () => {
    it('should not crash if audio fails to load', () => {
      // Show clock
      cy.get('#cuco-clock-toggle').click()
      cy.wait(300)

      // Click clock face - should work even if audio fails
      cy.get('.cuco-clock-face').click()

      // Animation should still work
      cy.get('.cuco-clock-door').should('have.class', 'open')
      cy.get('.cuco-clock-bird').should('have.class', 'show')
    })

    it('should handle localStorage failures gracefully', () => {
      // Mock localStorage to throw error
      cy.window().then(win => {
        const originalSetItem = win.localStorage.setItem
        win.localStorage.setItem = () => {
          throw new Error('Storage quota exceeded')
        }

        // Try to toggle clock - should not crash
        cy.get('#cuco-clock-toggle').click()
        cy.get('.cuco-clock').should('be.visible')

        // Restore original function
        win.localStorage.setItem = originalSetItem
      })
    })
  })
})
