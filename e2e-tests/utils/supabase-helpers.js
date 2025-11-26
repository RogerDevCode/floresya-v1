import { createClient } from '@supabase/supabase-js'

// Configure Supabase for testing environment
const supabaseUrl = 'https://test-project.supabase.co'
const supabaseAnonKey = 'test-anon-key'

// Create test Supabase client
export const createTestSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createTestSupabaseClient()

// Initialize Supabase client in the browser (if needed for specific tests)
export const initSupabase = async page => {
  await page.evaluate(
    ({ url, key }) => {
      // @ts-ignore
      if (!window.supabase) {
        // For now, we rely on the app's own initialization
        // In Playwright, we usually let the app initialize itself.
        // If we need to inject, we might need to expose a function.
      }
    },
    { url: supabaseUrl, key: supabaseAnonKey }
  )
}

// Sign up a test user
export const supabaseSignUp = async (email, password, userData = {}) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
}

// Sign in a test user
export const supabaseSignIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

// Sign out
export const supabaseSignOut = async () => {
  return await supabase.auth.signOut()
}

// Get current user
export const supabaseGetCurrentUser = async () => {
  return await supabase.auth.getUser()
}

// Get current session
export const supabaseGetSession = async () => {
  return await supabase.auth.getSession()
}

// Query Supabase table
export const supabaseQuery = async (table, query = {}) => {
  let supabaseQuery = supabase.from(table).select('*')

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

  return await supabaseQuery
}

// Insert data into Supabase table
export const supabaseInsert = async (table, data) => {
  return await supabase.from(table).insert(data).select()
}

// Update data in Supabase table
export const supabaseUpdate = async (table, updates, filters = {}) => {
  let query = supabase.from(table).update(updates)

  // Apply filters
  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value)
  })

  return await query.select()
}

// Delete data from Supabase table
export const supabaseDelete = async (table, filters = {}) => {
  let query = supabase.from(table).delete()

  // Apply filters
  Object.entries(filters).forEach(([column, value]) => {
    query = query.eq(column, value)
  })

  return await query.select()
}

// Call Supabase RPC function
export const supabaseRpc = async (functionName, params = {}) => {
  return await supabase.rpc(functionName, params)
}

// Upload file to Supabase Storage
export const supabaseUpload = async (bucket, path, file, options = {}) => {
  return await supabase.storage.from(bucket).upload(path, file, options)
}

// Download file from Supabase Storage
export const supabaseDownload = async (bucket, path) => {
  return await supabase.storage.from(bucket).download(path)
}

// Get public URL for Supabase Storage file
export const supabaseGetPublicUrl = (bucket, path) => {
  return supabase.storage.from(bucket).getPublicUrl(path)
}

// Remove file from Supabase Storage
export const supabaseRemove = async (bucket, paths) => {
  return await supabase.storage.from(bucket).remove(paths)
}

// List files in Supabase Storage
export const supabaseList = async (bucket, path = '', options = {}) => {
  return await supabase.storage.from(bucket).list(path, options)
}

// Set up test data
export const setupTestData = () => {
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

  // In Playwright/Node environment, we can't use localStorage like in Cypress browser
  // We might return this data to be used in tests or store it in a global variable if needed
  // For now, just returning it
  return testData
}

// Clean up test data
export const cleanupTestData = async () => {
  // Logic to clean up data from Supabase if needed
  // This might involve deleting the test data we inserted
  // For now, keeping it simple as per Cypress command which just cleared localStorage
  // But in real E2E, we should probably clean up the DB
}

// Test real-time subscriptions
export const testRealtimeSubscription = (table, callback) => {
  const channel = supabase
    .channel(`test:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()

  return channel
}
