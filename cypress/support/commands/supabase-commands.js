// Supabase-specific Cypress commands
// These commands provide a bridge between Cypress tests and Supabase mock implementations

// Import Supabase client configuration for testing
import { createClient } from '@supabase/supabase-js'

// Configure Supabase for testing environment
const supabaseUrl = 'https://test-project.supabase.co'
const supabaseAnonKey = 'test-anon-key'

// Create test Supabase client
const createTestSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Custom command to initialize Supabase client
Cypress.Commands.add('initSupabase', () => {
  cy.window().then(win => {
    // Initialize Supabase client in the browser
    const supabase = createTestSupabaseClient()
    win.supabase = supabase

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      cy.log(`Auth state changed: ${event}`)
      if (session) {
        win.localStorage.setItem('supabase.auth.token', session.access_token)
      } else {
        win.localStorage.removeItem('supabase.auth.token')
      }
    })
  })
})

// Custom command to sign up a test user
Cypress.Commands.add('supabaseSignUp', (email, password, userData = {}) => {
  return cy.window().then(win => {
    return win.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
  })
})

// Custom command to sign in a test user
Cypress.Commands.add('supabaseSignIn', (email, password) => {
  return cy.window().then(win => {
    return win.supabase.auth.signInWithPassword({
      email,
      password
    })
  })
})

// Custom command to sign out
Cypress.Commands.add('supabaseSignOut', () => {
  return cy.window().then(win => {
    return win.supabase.auth.signOut()
  })
})

// Custom command to get current user
Cypress.Commands.add('supabaseGetCurrentUser', () => {
  return cy.window().then(win => {
    return win.supabase.auth.getUser()
  })
})

// Custom command to get current session
Cypress.Commands.add('supabaseGetSession', () => {
  return cy.window().then(win => {
    return win.supabase.auth.getSession()
  })
})

// Custom command to query Supabase table
Cypress.Commands.add('supabaseQuery', (table, query = {}) => {
  return cy.window().then(win => {
    let supabaseQuery = win.supabase.from(table).select('*')

    // Apply filters
    if (query.eq) {
      Object.entries(query.eq).forEach(([column, value]) => {
        supabaseQuery = supabaseQuery.eq(column, value)
      })
    }

    if (query.neq) {
      Object.entries(query.neq).forEach(([column, value]) => {
        supabaseQuery = supabaseQuery.neq(column, value)
      })
    }

    if (query.gt) {
      Object.entries(query.gt).forEach(([column, value]) => {
        supabaseQuery = supabaseQuery.gt(column, value)
      })
    }

    if (query.gte) {
      Object.entries(query.gte).forEach(([column, value]) => {
        supabaseQuery = supabaseQuery.gte(column, value)
      })
    }

    if (query.lt) {
      Object.entries(query.lt).forEach(([column, value]) => {
        supabaseQuery = supabaseQuery.lt(column, value)
      })
    }

    if (query.lte) {
      Object.entries(query.lte).forEach(([column, value]) => {
        supabaseQuery = supabaseQuery.lte(column, value)
      })
    }

    if (query.like) {
      Object.entries(query.like).forEach(([column, pattern]) => {
        supabaseQuery = supabaseQuery.like(column, pattern)
      })
    }

    if (query.ilike) {
      Object.entries(query.ilike).forEach(([column, pattern]) => {
        supabaseQuery = supabaseQuery.ilike(column, pattern)
      })
    }

    if (query.in) {
      Object.entries(query.in).forEach(([column, values]) => {
        supabaseQuery = supabaseQuery.in(column, values)
      })
    }

    if (query.order) {
      Object.entries(query.order).forEach(([column, options]) => {
        supabaseQuery = supabaseQuery.order(column, options)
      })
    }

    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit)
    }

    if (query.range) {
      supabaseQuery = supabaseQuery.range(query.range.from, query.range.to)
    }

    return supabaseQuery
  })
})

// Custom command to insert data into Supabase table
Cypress.Commands.add('supabaseInsert', (table, data) => {
  return cy.window().then(win => {
    return win.supabase.from(table).insert(data).select()
  })
})

// Custom command to update data in Supabase table
Cypress.Commands.add('supabaseUpdate', (table, updates, filters = {}) => {
  return cy.window().then(win => {
    let query = win.supabase.from(table).update(updates)

    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      query = query.eq(column, value)
    })

    return query.select()
  })
})

// Custom command to delete data from Supabase table
Cypress.Commands.add('supabaseDelete', (table, filters = {}) => {
  return cy.window().then(win => {
    let query = win.supabase.from(table).delete()

    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      query = query.eq(column, value)
    })

    return query.select()
  })
})

// Custom command to call Supabase RPC function
Cypress.Commands.add('supabaseRpc', (functionName, params = {}) => {
  return cy.window().then(win => {
    return win.supabase.rpc(functionName, params)
  })
})

// Custom command to upload file to Supabase Storage
Cypress.Commands.add('supabaseUpload', (bucket, path, file, options = {}) => {
  return cy.window().then(win => {
    return win.supabase.storage.from(bucket).upload(path, file, options)
  })
})

// Custom command to download file from Supabase Storage
Cypress.Commands.add('supabaseDownload', (bucket, path) => {
  return cy.window().then(win => {
    return win.supabase.storage.from(bucket).download(path)
  })
})

// Custom command to get public URL for Supabase Storage file
Cypress.Commands.add('supabaseGetPublicUrl', (bucket, path) => {
  return cy.window().then(win => {
    return win.supabase.storage.from(bucket).getPublicUrl(path)
  })
})

// Custom command to remove file from Supabase Storage
Cypress.Commands.add('supabaseRemove', (bucket, paths) => {
  return cy.window().then(win => {
    return win.supabase.storage.from(bucket).remove(paths)
  })
})

// Custom command to list files in Supabase Storage
Cypress.Commands.add('supabaseList', (bucket, path = '', options = {}) => {
  return cy.window().then(win => {
    return win.supabase.storage.from(bucket).list(path, options)
  })
})

// Custom command to mock Supabase responses for testing
Cypress.Commands.add('mockSupabaseOperation', (operation, table, response, shouldError = false) => {
  cy.intercept('POST', '**/rest/v1/**', req => {
    if (req.url.includes(table)) {
      if (shouldError) {
        req.reply({
          statusCode: 400,
          body: { error: { message: 'Mocked error', code: 'PGRST001' } }
        })
      } else {
        req.reply({
          statusCode: 200,
          body: response
        })
      }
    }
  }).as(`mock${operation}${table}`)
})

// Custom command to set up test data
Cypress.Commands.add('setupTestData', () => {
  const testData = {
    users: [
      {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        email: 'admin@example.com',
        name: 'Admin User',
        created_at: new Date().toISOString()
      }
    ],
    profiles: [
      {
        id: 1,
        user_id: 1,
        bio: 'Test user profile',
        avatar_url: null,
        created_at: new Date().toISOString()
      }
    ],
    products: [
      {
        id: 1,
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        category: 'test',
        stock_quantity: 10,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  }

  cy.window().then(win => {
    // Store test data in localStorage for easy access
    win.localStorage.setItem('testData', JSON.stringify(testData))
  })

  return testData
})

// Custom command to clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  cy.window().then(win => {
    win.localStorage.removeItem('testData')

    // Clear any Supabase-related local storage
    const keysToRemove = Object.keys(win.localStorage).filter(
      key => key.includes('supabase') || key.includes('auth') || key.includes('user')
    )

    keysToRemove.forEach(key => {
      win.localStorage.removeItem(key)
    })
  })
})

// Custom command to wait for Supabase operations
Cypress.Commands.add('waitForSupabase', () => {
  cy.wait(500) // Give Supabase time to process
})

// Custom command to test real-time subscriptions
Cypress.Commands.add('testRealtimeSubscription', (table, callback) => {
  return cy.window().then(win => {
    const channel = win.supabase
      .channel(`test:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe()

    return channel
  })
})

// Custom command to test row level security
Cypress.Commands.add('testRLS', (userId, table, operation, data) => {
  return cy.window().then(win => {
    // Set user context for RLS testing
    return win.supabase.rpc('set_test_user_context', { user_id: userId }).then(() => {
      // Perform operation that should be subject to RLS
      switch (operation) {
        case 'select':
          return win.supabase.from(table).select()
        case 'insert':
          return win.supabase.from(table).insert(data).select()
        case 'update':
          return win.supabase.from(table).update(data).select()
        case 'delete':
          return win.supabase.from(table).delete()
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }
    })
  })
})
