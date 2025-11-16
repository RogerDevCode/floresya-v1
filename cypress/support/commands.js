// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for authentication
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-cy=email-input]').type(email)
    cy.get('[data-cy=password-input]').type(password)
    cy.get('[data-cy=login-button]').click()
    cy.url().should('not.include', '/login')
  })
})

// Custom command for API authentication
Cypress.Commands.add('apiLogin', (email, password) => {
  cy.request('POST', '/api/auth/login', { email, password })
    .its('body')
    .then(body => {
      window.localStorage.setItem('token', body.token)
      window.localStorage.setItem('user', JSON.stringify(body.user))
    })
})

// Custom command to set up test user
Cypress.Commands.add('setupTestUser', () => {
  cy.window().then(win => {
    // Set up test user in local storage
    const testUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    }
    win.localStorage.setItem('testUser', JSON.stringify(testUser))
  })
})

// Custom command to clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then(win => {
    // Clean up test data from local storage
    win.localStorage.removeItem('testUser')
    win.localStorage.removeItem('cart')
    win.localStorage.removeItem('checkoutData')
  })
})

// Custom command to mock Supabase responses
Cypress.Commands.add('mockSupabaseResponse', (table, response) => {
  cy.intercept('POST', '**/rest/v1/**', req => {
    if (req.url.includes(table)) {
      req.reply({ statusCode: 200, body: response })
    }
  }).as(`mock${table}Response`)
})

// Custom command to intercept and mock API calls
Cypress.Commands.add('interceptApi', (method, url, response) => {
  cy.intercept(method, url, response).as(`${method}${url.replace(/[^a-zA-Z0-9]/g, '')}`)
})

// Custom command to test accessibility
Cypress.Commands.add('checkA11y', (context = null, options = {}) => {
  cy.injectAxe()
  cy.checkA11y(context, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21aa']
    },
    ...options
  })
})

// Custom command to test performance
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then(win => {
    const perfData = win.performance.getEntriesByType('navigation')[0]
    cy.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`)
    expect(perfData.loadEventEnd - perfData.loadEventStart).to.be.lessThan(3000)
  })
})

// Custom command to test form validation
Cypress.Commands.add('testFormValidation', (formSelector, testCases) => {
  testCases.forEach(testCase => {
    cy.get(formSelector).within(() => {
      // Clear all inputs
      cy.get('input, textarea, select').each($el => {
        cy.wrap($el).clear()
      })

      // Fill form with test data
      Object.entries(testCase.data).forEach(([field, value]) => {
        cy.get(`[name="${field}"], [data-cy="${field}"], #${field}`).type(value)
      })

      // Submit form
      cy.get('[type="submit"], [data-cy="submit"], .submit-button').click()

      // Check for expected validation messages
      if (testCase.expectError) {
        testCase.expectError.forEach(errorSelector => {
          cy.get(errorSelector).should('be.visible')
        })
      }
    })
  })
})

// Custom command to test responsive design
Cypress.Commands.add('testResponsive', breakpoints => {
  Object.entries(breakpoints).forEach(([device, size]) => {
    cy.viewport(size.width, size.height)
    cy.visit('/') // or current page
    cy.get('body').should('be.visible')

    // Test key elements are visible at this breakpoint
    cy.get('header, nav, .navigation').should('be.visible')
    cy.get('main, .main-content').should('be.visible')
    cy.get('footer, .footer').should('be.visible')
  })
})

// Custom command to test shopping cart functionality
Cypress.Commands.add('testAddToCart', productSelector => {
  cy.get(productSelector).click()
  cy.get('[data-cy="cart-notification"], .cart-notification')
    .should('be.visible')
    .and('contain', 'added to cart')

  cy.get('[data-cy="cart-count"], .cart-count').should('contain', '1')
})

// Custom command to test checkout process
Cypress.Commands.add('testCheckout', () => {
  // Add item to cart first
  cy.testAddToCart('[data-cy="add-to-cart"], .add-to-cart')

  // Navigate to cart
  cy.get('[data-cy="cart-link"], .cart-link').click()

  // Proceed to checkout
  cy.get('[data-cy="checkout-button"], .checkout-button').click()

  // Fill checkout form
  cy.get('[data-cy="checkout-form"]').within(() => {
    cy.get('[name="email"]').type('test@example.com')
    cy.get('[name="name"]').type('Test User')
    cy.get('[name="address"]').type('123 Test Street')
    cy.get('[name="city"]').type('Test City')
    cy.get('[name="zip"]').type('12345')

    // Select payment method if needed
    cy.get('[name="payment-method"]').check()

    // Submit order
    cy.get('[type="submit"], [data-cy="place-order"]').click()
  })

  // Verify order completion
  cy.url().should('include', '/order-confirmation')
  cy.get('[data-cy="order-success"], .order-success').should('contain', 'Order confirmed')
})

// Custom command to test search functionality
Cypress.Commands.add('testSearch', (searchTerm, expectedResults) => {
  cy.get('[data-cy="search-input"], .search-input, #search').type(searchTerm)
  cy.get('[data-cy="search-button"], .search-button, [type="submit"]').click()

  cy.get('[data-cy="search-results"], .search-results').should('be.visible')

  if (expectedResults > 0) {
    cy.get('[data-cy="product-item"], .product-item').should('have.length.at.least', 1)
  } else {
    cy.get('[data-cy="no-results"], .no-results').should('contain', 'No results found')
  }
})

// Custom command to test filter functionality
Cypress.Commands.add('testFilter', (filterSelector, filterValue) => {
  cy.get(filterSelector).select(filterValue)
  cy.get('[data-cy="apply-filter"], .apply-filter').click()

  // Verify filter is applied
  cy.get(filterSelector).should('have.value', filterValue)

  // Check that results are filtered
  cy.get('[data-cy="filtered-results"], .filtered-results').should('contain', filterValue)
})

// Custom command to wait for API calls
Cypress.Commands.add('waitForApi', alias => {
  cy.wait(alias)
  cy.get('@' + alias)
    .its('response.statusCode')
    .should('eq', 200)
})

// Custom command to handle file uploads
Cypress.Commands.add('uploadFile', (selector, fileName, fileType = '') => {
  cy.fixture(fileName, 'base64').then(fileContent => {
    const blob = Cypress.Blob.base64StringToBlob(fileContent, fileType)
    const file = new File([blob], fileName, { type: fileType })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    cy.get(selector).trigger('drop', { dataTransfer })
  })
})
