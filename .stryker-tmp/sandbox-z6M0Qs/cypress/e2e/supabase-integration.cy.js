/**
 * Comprehensive Supabase E2E Tests
 * Testing real Supabase integration and user workflows
 */
// @ts-nocheck

describe('Supabase Integration E2E Tests', () => {
  beforeEach(() => {
    // Set up Supabase client for testing
    cy.initSupabase()
    cy.setupTestData()
  })

  afterEach(() => {
    // Clean up test data
    cy.cleanupTestData()
  })

  describe('Database Operations E2E', () => {
    test('should perform complete CRUD operations on users table', () => {
      // CREATE - Insert new user
      cy.supabaseInsert('users', {
        email: 'e2e-test@example.com',
        name: 'E2E Test User'
      }).then(result => {
        expect(result.error).to.be.null
        expect(result.data).to.have.length(1)
        expect(result.data[0].email).to.equal('e2e-test@example.com')
        expect(result.data[0].name).to.equal('E2E Test User')
      })

      // READ - Query the inserted user
      cy.supabaseQuery('users', {
        eq: { email: 'e2e-test@example.com' }
      }).then(result => {
        expect(result.error).to.be.null
        expect(result.data).to.have.length(1)
        expect(result.data[0].email).to.equal('e2e-test@example.com')
      })

      // UPDATE - Modify the user
      cy.supabaseUpdate(
        'users',
        { name: 'Updated E2E Test User' },
        { email: 'e2e-test@example.com' }
      ).then(result => {
        expect(result.error).to.be.null
        expect(result.data[0].name).to.equal('Updated E2E Test User')
      })

      // DELETE - Remove the user
      cy.supabaseDelete('users', {
        email: 'e2e-test@example.com'
      }).then(result => {
        expect(result.error).to.be.null
        expect(result.data[0].email).to.equal('e2e-test@example.com')
      })
    })

    test('should handle complex queries with multiple filters', () => {
      cy.supabaseQuery('products', {
        gte: { price: 20 },
        lte: { price: 50 },
        eq: { is_active: true },
        order: { price: { ascending: true } },
        limit: 5
      }).then(result => {
        expect(result.error).to.be.null
        expect(result.data).to.be.an('array')

        if (result.data.length > 0) {
          // Verify filtering
          result.data.forEach(product => {
            expect(product.price).to.be.at.least(20)
            expect(product.price).to.be.at.most(50)
            expect(product.is_active).to.be.true
          })

          // Verify ordering
          for (let i = 0; i < result.data.length - 1; i++) {
            expect(result.data[i].price).to.be.at.most(result.data[i + 1].price)
          }
        }
      })
    })

    test('should handle RPC function calls', () => {
      cy.supabaseRpc('get_user_profile', { user_id: 1 }).then(result => {
        expect(result.error).to.be.null
        expect(result.data).to.be.an('object')
        expect(result.data).to.have.property('id')
        expect(result.data).to.have.property('name')
        expect(result.data).to.have.property('email')
      })
    })
  })

  describe('Authentication E2E', () => {
    test('should handle user sign up and authentication flow', () => {
      const testEmail = `signup-test-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'

      // Sign up new user
      cy.supabaseSignUp(testEmail, testPassword, {
        name: 'Sign Up Test User'
      }).then(result => {
        expect(result.error).to.be.null
        expect(result.data.user).to.be.an('object')
        expect(result.data.user.email).to.equal(testEmail)
        expect(result.data.session).to.be.an('object')
      })

      // Sign out
      cy.supabaseSignOut().then(result => {
        expect(result.error).to.be.null
      })

      // Sign back in
      cy.supabaseSignIn(testEmail, testPassword).then(result => {
        expect(result.error).to.be.null
        expect(result.data.user.email).to.equal(testEmail)
      })
    })

    test('should handle authentication state persistence', () => {
      const testEmail = 'auth-state-test@example.com'
      const testPassword = 'TestPassword123!'

      // Sign up and sign in
      cy.supabaseSignUp(testEmail, testPassword)
        .then(() => cy.supabaseSignIn(testEmail, testPassword))
        .then(result => {
          expect(result.data.user.email).to.equal(testEmail)

          // Check session persistence
          return cy.supabaseGetSession()
        })
        .then(sessionResult => {
          expect(sessionResult.error).to.be.null
          expect(sessionResult.data.session).to.be.an('object')

          // Check current user
          return cy.supabaseGetCurrentUser()
        })
        .then(userResult => {
          expect(userResult.error).to.be.null
          expect(userResult.data.user.email).to.equal(testEmail)
        })
    })
  })

  describe('Storage Operations E2E', () => {
    test('should handle file upload and download', () => {
      const bucketName = 'test-bucket'
      const fileName = 'test-file.txt'
      const fileContent = 'This is test file content'

      // Create a test file
      const testFile = new File([fileContent], fileName, { type: 'text/plain' })

      // Upload file
      cy.supabaseUpload(bucketName, fileName, testFile).then(result => {
        expect(result.error).to.be.null
        expect(result.data.path).to.equal(fileName)
        expect(result.data.bucket).to.equal(bucketName)
      })

      // Download file
      cy.supabaseDownload(bucketName, fileName).then(result => {
        expect(result.error).to.be.null
        expect(result.data).to.be.an('instanceof', Blob)
      })

      // Get public URL
      cy.supabaseGetPublicUrl(bucketName, fileName).then(result => {
        expect(result.error).to.be.null
        expect(result.data.publicUrl).to.contain(fileName)
      })

      // List files
      cy.supabaseList(bucketName).then(result => {
        expect(result.error).to.be.null
        expect(result.data).to.be.an('array')
      })

      // Remove file
      cy.supabaseRemove(bucketName, [fileName]).then(result => {
        expect(result.error).to.be.null
        expect(result.data[0].path).to.equal(fileName)
      })
    })
  })

  describe('Error Handling E2E', () => {
    test('should handle database constraint violations', () => {
      // Try to insert duplicate email (should fail)
      cy.supabaseInsert('users', {
        email: 'user1@example.com', // This should already exist
        name: 'Duplicate User'
      }).then(result => {
        expect(result.error).to.not.be.null
        expect(result.error.code).to.equal('23505') // Unique violation
      })

      // Try to reference non-existent foreign key
      cy.supabaseInsert('profiles', {
        user_id: 99999, // Non-existent user
        bio: 'Orphan profile'
      }).then(result => {
        expect(result.error).to.not.be.null
        expect(result.error.code).to.equal('23503') // Foreign key violation
      })
    })

    test('should handle network timeouts and connection errors', () => {
      // Mock a timeout scenario
      cy.intercept('POST', '**/rest/v1/**', req => {
        // Simulate timeout by not responding
        // This will test timeout handling
      })

      cy.supabaseQuery('users').then(result => {
        expect(result.error).to.not.be.null
        expect(result.error.message).to.contain('timeout')
      })
    })
  })

  describe('Real-time Subscriptions E2E', () => {
    test('should handle real-time database changes', () => {
      let changeReceived = false

      // Set up real-time subscription
      cy.testRealtimeSubscription('users', payload => {
        changeReceived = true
        cy.log(`Received real-time change: ${payload.eventType}`)

        expect(payload.eventType).to.be.oneOf(['INSERT', 'UPDATE', 'DELETE'])
        expect(payload.table).to.equal('users')
      }).then(channel => {
        // Insert a record to trigger the subscription
        cy.supabaseInsert('users', {
          email: 'realtime-test@example.com',
          name: 'Real-time Test User'
        }).then(() => {
          cy.waitForSupabase()

          // Verify the subscription received the change
          expect(changeReceived).to.be.true

          // Clean up
          return channel.unsubscribe()
        })
      })
    })
  })

  describe('Performance and Monitoring E2E', () => {
    test('should monitor query performance', () => {
      const startTime = Date.now()

      cy.supabaseQuery('products').then(result => {
        const endTime = Date.now()
        const duration = endTime - startTime

        expect(result.error).to.be.null
        expect(duration).to.be.lessThan(5000) // Should complete within 5 seconds
        cy.log(`Query completed in ${duration}ms`)
      })
    })

    test('should handle concurrent operations', () => {
      // Execute multiple operations concurrently
      const operations = [
        cy.supabaseQuery('users'),
        cy.supabaseQuery('products'),
        cy.supabaseQuery('profiles')
      ]

      cy.all(...operations).then(results => {
        results.forEach((result, index) => {
          expect(result.error).to.be.null
          expect(result.data).to.be.an('array')
          cy.log(`Operation ${index + 1} completed successfully`)
        })
      })
    })
  })
})

describe('Supabase with UI Integration E2E', () => {
  beforeEach(() => {
    cy.initSupabase()
    cy.setupTestData()

    // Set up test user
    cy.apiLogin('test@example.com', 'password123')
  })

  test('should integrate Supabase with user interface', () => {
    cy.visit('/dashboard')

    // Wait for the page to load
    cy.get('[data-cy="dashboard-header"]').should('be.visible')

    // Fetch user data via UI interactions
    cy.get('[data-cy="user-profile"]').click()

    // Verify user data is displayed
    cy.get('[data-cy="user-email"]').should('contain', 'test@example.com')
    cy.get('[data-cy="user-name"]').should('contain', 'Test User')

    // Test data refresh
    cy.get('[data-cy="refresh-data"]').click()
    cy.waitForSupabase()

    // Verify data is still correct after refresh
    cy.get('[data-cy="user-email"]').should('contain', 'test@example.com')
  })

  test('should handle CRUD operations through UI', () => {
    cy.visit('/products')

    // CREATE - Add new product
    cy.get('[data-cy="add-product-button"]').click()
    cy.get('[data-cy="product-name"]').type('E2E Test Product')
    cy.get('[data-cy="product-price"]').type('29.99')
    cy.get('[data-cy="product-category"]').select('test')
    cy.get('[data-cy="save-product"]').click()

    cy.get('[data-cy="success-message"]').should('contain', 'Product created')

    // READ - Verify product appears in list
    cy.get('[data-cy="product-list"]').should('contain', 'E2E Test Product')

    // UPDATE - Edit product
    cy.get('[data-cy="edit-product"]').last().click()
    cy.get('[data-cy="product-name"]').clear().type('Updated E2E Test Product')
    cy.get('[data-cy="save-product"]').click()

    cy.get('[data-cy="success-message"]').should('contain', 'Product updated')
    cy.get('[data-cy="product-list"]').should('contain', 'Updated E2E Test Product')

    // DELETE - Remove product
    cy.get('[data-cy="delete-product"]').last().click()
    cy.get('[data-cy="confirm-delete"]').click()

    cy.get('[data-cy="success-message"]').should('contain', 'Product deleted')
    cy.get('[data-cy="product-list"]').should('not.contain', 'Updated E2E Test Product')
  })

  test('should handle authentication flow through UI', () => {
    cy.visit('/login')

    // Sign in through UI
    cy.get('[data-cy="email-input"]').type('e2e-auth@example.com')
    cy.get('[data-cy="password-input"]').type('password123')
    cy.get('[data-cy="login-button"]').click()

    // Verify successful login
    cy.url().should('not.include', '/login')
    cy.get('[data-cy="user-menu"]').should('be.visible')
    cy.get('[data-cy="logout-button"]').should('be.visible')

    // Sign out through UI
    cy.get('[data-cy="logout-button"]').click()

    // Verify successful logout
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
  })
})

describe('Mobile and Responsive E2E', () => {
  beforeEach(() => {
    cy.initSupabase()
    cy.setupTestData()
  })

  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ]

  breakpoints.forEach(breakpoint => {
    test(`should work correctly on ${breakpoint.name}`, () => {
      cy.viewport(breakpoint.width, breakpoint.height)

      cy.visit('/products')

      // Verify page loads correctly
      cy.get('body').should('be.visible')

      // Test product list display
      cy.get('[data-cy="product-grid"]').should('be.visible')

      // Test responsive navigation
      if (breakpoint.name === 'mobile') {
        cy.get('[data-cy="mobile-menu-button"]').should('be.visible')
        cy.get('[data-cy="mobile-menu-button"]').click()
        cy.get('[data-cy="mobile-nav"]').should('be.visible')
      } else {
        cy.get('[data-cy="desktop-nav"]').should('be.visible')
      }

      // Test search functionality
      cy.get('[data-cy="search-input"]').type('test')
      cy.get('[data-cy="search-button"]').click()

      // Verify search works on all screen sizes
      cy.get('[data-cy="search-results"]').should('be.visible')
    })
  })
})

describe('Accessibility E2E', () => {
  beforeEach(() => {
    cy.initSupabase()
    cy.setupTestData()
  })

  test('should meet accessibility standards', () => {
    cy.visit('/')

    // Run accessibility checks
    cy.checkA11y()

    // Test keyboard navigation
    cy.get('body').tab()
    cy.focused().should('have.class', 'skip-link')

    cy.get('body').tab()
    cy.focused().should('have.class', 'nav-link')

    // Test form accessibility
    cy.visit('/contact')
    cy.checkA11y('form')

    // Verify form labels
    cy.get('[data-cy="name-input"]').should('have.attr', 'aria-label')
    cy.get('[data-cy="email-input"]').should('have.attr', 'aria-label')
    cy.get('[data-cy="message-input"]').should('have.attr', 'aria-label')

    // Test error message accessibility
    cy.get('[data-cy="contact-form"]').submit()
    cy.get('[data-cy="error-messages"]').should('have.attr', 'role', 'alert')
  })

  test('should work with screen readers', () => {
    cy.visit('/')

    // Test page landmarks
    cy.get('header').should('have.attr', 'role', 'banner')
    cy.get('nav').should('have.attr', 'role', 'navigation')
    cy.get('main').should('have.attr', 'role', 'main')
    cy.get('footer').should('have.attr', 'role', 'contentinfo')

    // Test heading structure
    cy.get('h1').should('exist')

    // Test alt text for images
    cy.get('img').each($img => {
      cy.wrap($img).should('have.attr', 'alt')
    })
  })
})

describe('Performance E2E', () => {
  test('should meet performance benchmarks', () => {
    // Measure page load performance
    cy.visit('/')
    cy.measurePageLoad()

    // Test API response times
    cy.window().then(win => {
      const startTime = performance.now()

      cy.supabaseQuery('products').then(() => {
        const endTime = performance.now()
        const apiDuration = endTime - startTime

        expect(apiDuration).to.be.lessThan(2000) // API should respond within 2 seconds
        cy.log(`API response time: ${apiDuration.toFixed(2)}ms`)
      })
    })

    // Test bundle size (this would need webpack-bundle-analyzer in real implementation)
    cy.visit('/')
    cy.window().its('performance.timing.loadEventEnd').should('exist')
  })

  test('should handle large datasets efficiently', () => {
    // Test pagination with large dataset
    cy.visit('/products')

    cy.get('[data-cy="items-per-page"]').select('50')
    cy.get('[data-cy="products-table"] tbody tr').should('have.length.at.most', 50)

    // Test search performance with large dataset
    cy.get('[data-cy="search-input"]').type('Product 500')
    cy.get('[data-cy="search-results"]').should('contain', 'Product 500')
  })
})
