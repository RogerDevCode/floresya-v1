/**
 * DOM-Specific Commands for Cypress Testing
 * Test-Driven Development Implementation
 * FloresYa Project - Core DOM Loading & Initialization Tests
 */

// Add custom DOM-related commands
Cypress.Commands.add('verifyDomCompleteLoad', (options = {}) => {
  cy.testLog('Verifying complete DOM load...')

  return cy.window({ timeout: options.timeout || 30000 }).should(win => {
    // 1. Verify document state
    expect(win.document.readyState).to.equal('complete')

    // 2. Verify critical elements exist
    const criticalElements = ['html', 'head', 'body', 'title']

    criticalElements.forEach(element => {
      expect(win.document.querySelector(element)).to.exist
    })

    cy.testLog('DOM elements verified successfully')
  })
})

Cypress.Commands.add('verifyHtmlStructureIntegrity', () => {
  cy.testLog('Verifying HTML structure integrity...')

  return cy.get('html').should(html => {
    // 1. Verify HTML tag attributes
    expect(html).to.have.attr('lang', 'es')
    expect(html).to.have.attr('data-theme') // Theme should be present

    // 2. Verify head section
    cy.get('head').within(() => {
      // Meta charset
      cy.get('meta[charset="UTF-8"]').should('exist')

      // Viewport meta
      cy.get('meta[name="viewport"]')
        .should('exist')
        .and('have.attr', 'content', 'width=device-width, initial-scale=1.0')

      // Title
      cy.get('title').should('exist').and('contain.text', 'FloresYa')

      // Description meta
      cy.get('meta[name="description"]')
        .should('exist')
        .and('have.attr', 'content')
        .and('match', /flores|floristería/i)
    })

    // 3. Verify body structure
    cy.get('body').should('exist').and('be.visible')

    // 4. Verify critical sections exist
    const criticalSections = ['nav[role="navigation"]', 'main', 'footer']

    criticalSections.forEach(selector => {
      cy.get(selector).should('exist')
    })

    cy.testLog('HTML structure integrity verified')
  })
})

Cypress.Commands.add('verifyDocumentTitle', (expectedTitle = null) => {
  cy.testLog('Verifying document title...')

  return cy.title().should(title => {
    expect(title).to.be.a('string')
    expect(title.length).to.be.greaterThan(0)

    if (expectedTitle) {
      expect(title).to.equal(expectedTitle)
    } else {
      // Default expectation for FloresYa
      expect(title).to.contain('FloresYa')
    }
  })
})

Cypress.Commands.add('verifyLanguageAndDirection', () => {
  cy.testLog('Verifying language and direction...')

  return cy.get('html').should(html => {
    expect(html).to.have.attr('lang', 'es')
    expect(html).to.have.attr('dir', 'ltr')
  })
})

Cypress.Commands.add('verifyNoBrokenLinks', (timeout = 10000) => {
  cy.testLog('Checking for broken links...')

  return cy.get('a[href]').each($link => {
    const href = $link.attr('href')

    // Skip external links, mailto, tel, and javascript links
    if (
      href &&
      !href.startsWith('http') &&
      !href.startsWith('mailto:') &&
      !href.startsWith('tel:') &&
      !href.startsWith('javascript:') &&
      !href.startsWith('#')
    ) {
      cy.request({
        url: href,
        failOnStatusCode: false,
        timeout
      }).then(response => {
        expect(response.status).to.not.equal(404)
      })
    }
  })
})

Cypress.Commands.add('verifyImagesLoaded', (timeout = 10000) => {
  cy.testLog('Verifying images are loaded...')

  return cy.get('img').each($img => {
    const src = $img.attr('src')

    if (src && !src.startsWith('data:')) {
      cy.wrap($img).should('be.visible')

      // Check naturalWidth and naturalHeight to confirm image loaded
      cy.wrap($img).should($img => {
        expect($img[0].naturalWidth).to.be.greaterThan(0)
        expect($img[0].naturalHeight).to.be.greaterThan(0)
      })
    }
  })
})

Cypress.Commands.add('verifyConsoleErrors', () => {
  cy.testLog('Checking for console errors...')

  return cy.window().then(win => {
    const originalError = win.console.error
    const errors = []

    // Override console.error to catch errors
    win.console.error = (...args) => {
      errors.push(args.join(' '))
      originalError.apply(win.console, args)
    }

    // Wait a bit for any errors to occur
    cy.wait(100).then(() => {
      if (errors.length > 0) {
        cy.testLog(`Console errors detected: ${errors.join(', ')}`, 'error')
        throw new Error(`Console errors found: ${errors.join(', ')}`)
      } else {
        cy.testLog('No console errors detected')
      }
    })
  })
})

// Custom assertion helpers
Cypress.Commands.add('shouldHaveAttribute', { prevSubject: true }, (subject, attr, value) => {
  cy.wrap(subject).should('have.attr', attr, value)
})

Cypress.Commands.add('shouldHaveClasses', { prevSubject: true }, (subject, classes) => {
  cy.wrap(subject).should('have.class', classes)
})

// Performance-related DOM commands
Cypress.Commands.add('measureDomLoadTime', () => {
  cy.testLog('Measuring DOM load time...')

  return cy.window().then(win => {
    const navigation = win.performance.getEntriesByType('navigation')[0]

    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      domInteractive: navigation.domInteractive - navigation.navigationStart
    }
  })
})

export {}
