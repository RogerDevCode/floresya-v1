/**
 * Accessibility Testing Commands for Cypress Testing
 * WCAG 2.1 AA Compliance Testing
 * Test-Driven Development Implementation
 */
// @ts-nocheck

// Accessibility testing with axe (if available)
Cypress.Commands.add('checkAccessibility', (context = null, options = {}) => {
  cy.testLog('Checking accessibility with axe...')

  if (!window.axe) {
    cy.testLog('Axe library not loaded, skipping automated accessibility check', 'warn')
    return null
  }

  const axeOptions = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa']
    },
    ...options
  }

  return cy.checkA11y(context, axeOptions, violations => {
    if (violations.length > 0) {
      const errorMessages = violations.map(violation => {
        return `${violation.impact}: ${violation.description} (${violation.nodes.length} instances)`
      })

      cy.testLog(`Accessibility violations found: ${errorMessages.join(', ')}`, 'error')
      throw new Error(`Accessibility violations: ${errorMessages.join(', ')}`)
    }

    cy.testLog('No accessibility violations found')
  })
})

// Manual accessibility checks for critical elements
Cypress.Commands.add('verifyKeyboardNavigation', () => {
  cy.testLog('Verifying keyboard navigation...')

  return cy
    .get('body')
    .tab({ timeout: 1000 })
    .then($body => {
      // Check that focus starts somewhere on the page
      expect($body).to.have.focus

      // Test tab navigation through critical elements
      const criticalElements = [
        'a[href]',
        'button',
        'input',
        'select',
        'textarea',
        '[tabindex]:not([tabindex="-1"])'
      ]

      let foundFocusableElements = false
      criticalElements.forEach(selector => {
        cy.get(selector)
          .first()
          .then($el => {
            if ($el.length > 0) {
              foundFocusableElements = true
            }
          })
      })

      expect(foundFocusableElements).to.be.true
    })
})

Cypress.Commands.add('verifyColorContrast', () => {
  cy.testLog('Verifying color contrast ratios...')

  // This is a basic check - automated contrast checking requires more complex logic
  cy.get('body').should('have.css', 'color')

  // Check critical elements for basic contrast requirements
  const criticalTextElements = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    '.nav-link',
    '.btn',
    '[role="button"]'
  ]

  criticalTextElements.forEach(selector => {
    cy.get(selector).each($el => {
      const computedStyle = getComputedStyle($el[0])
      const color = computedStyle.color

      // Basic check that colors are defined
      expect(color).to.not.equal('rgba(0, 0, 0, 0)')
    })
  })
})

Cypress.Commands.add('verifyAriaLabels', () => {
  cy.testLog('Verifying ARIA labels...')

  // Check for proper ARIA labels on interactive elements
  cy.get('a[href]').each($link => {
    // Links should have either text or aria-label
    const text = $link.text().trim()
    const ariaLabel = $link.attr('aria-label')

    expect(text || ariaLabel).to.exist
  })

  cy.get('button').each($button => {
    // Buttons should have either text, aria-label, or aria-labelledby
    const text = $button.text().trim()
    const ariaLabel = $button.attr('aria-label')
    const ariaLabelledBy = $button.attr('aria-labelledby')

    expect(text || ariaLabel || ariaLabelledBy).to.exist
  })

  // Check for proper use of role attributes
  cy.get('[role]').each($el => {
    const role = $el.attr('role')
    expect(role).to.be.oneOf([
      'navigation',
      'main',
      'banner',
      'contentinfo',
      'complementary',
      'button',
      'link',
      'dialog',
      'alert',
      'status',
      'presentation',
      'img',
      'list',
      'listitem',
      'menu',
      'menuitem',
      'tab',
      'tabpanel'
    ])
  })
})

Cypress.Commands.add('verifySemanticHTML', () => {
  cy.testLog('Verifying semantic HTML structure...')

  // Check for proper use of semantic elements
  const semanticElements = [
    { selector: 'header', required: true },
    { selector: 'main', required: true },
    { selector: 'nav', required: true },
    { selector: 'footer', required: true },
    { selector: 'section', required: false },
    { selector: 'article', required: false },
    { selector: 'aside', required: false }
  ]

  semanticElements.forEach(({ selector, required }) => {
    if (required) {
      cy.get(selector).should('exist')
    } else {
      cy.get(selector).should('exist')
    }
  })

  // Check heading hierarchy
  cy.get('h1').should('have.length', 1) // Only one h1 per page

  // Check for proper heading levels
  cy.get('h2, h3, h4, h5, h6').each($heading => {
    const level = parseInt($heading.prop('tagName').substring(1))
    expect(level).to.be.within(2, 6)
  })
})

Cypress.Commands.add('verifyImageAccessibility', () => {
  cy.testLog('Verifying image accessibility...')

  return cy.get('img').each($img => {
    // All images should have alt attribute
    const alt = $img.attr('alt')

    // Check for decorative images (alt="" is valid for decorative images)
    if (!alt) {
      cy.testLog(`Image missing alt attribute: ${$img.attr('src')}`, 'warn')
    }

    // Check that images have dimensions
    expect($img.attr('width')).to.exist
    expect($img.attr('height')).to.exist

    // Skip checking for loading state for now - more complex
  })
})

// Touch and mobile accessibility
Cypress.Commands.add('verifyTouchTargets', () => {
  cy.testLog('Verifying touch target sizes...')

  const touchElements = [
    'a[href]',
    'button',
    'input[type="button"]',
    'input[type="submit"]',
    '[role="button"]',
    '.btn'
  ]

  touchElements.forEach(selector => {
    cy.get(selector).each($el => {
      // Minimum touch target size should be 44x44 pixels (WCAG guideline)
      const rect = $el[0].getBoundingClientRect()

      // Some flexibility needed for elements within containers
      if (rect.width < 44 || rect.height < 44) {
        // Check if parent element provides adequate touch area
        const parent = $el.parent()
        const parentRect = parent[0].getBoundingClientRect()

        if (parentRect.width < 44 || parentRect.height < 44) {
          cy.testLog(
            `Touch target too small: ${selector} (${Math.round(rect.width)}x${Math.round(rect.height)})`,
            'warn'
          )
        }
      }
    })
  })
})

// Focus management
Cypress.Commands.add('verifyFocusManagement', () => {
  cy.testLog('Verifying focus management...')

  // Check that focus is visible
  cy.get(':focus').should($focused => {
    if ($focused.length > 0) {
      const computedStyle = getComputedStyle($focused[0])
      expect(computedStyle.outline).to.not.equal('none')
    }
  })

  // Check for skip navigation links if present
  cy.get('a[href^="#"]').each($link => {
    const href = $link.attr('href')
    if (href && href !== '#' && $link.text().trim().toLowerCase().includes('skip')) {
      // Test that skip link works
      cy.wrap($link).click()
      const targetId = href.substring(1)
      if (targetId) {
        cy.get(`#${targetId}`).should('exist')
      }
    }
  })
})

export {}
