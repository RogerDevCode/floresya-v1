# Comprehensive Supabase Mocking Strategy

This directory contains a comprehensive mocking strategy for Supabase that supports both unit tests (with DI container) and integration tests with proper database simulation.

## Architecture Overview

The mocking strategy consists of three main components:

1. **Global Test Setup** (`tests/setup-global.js`) - Provides global Supabase mocking for all tests
2. **Mocking Utilities** (`mocking-utils.js`) - Core mocking functions for unit tests
3. **Test Utilities** (`test-utils.js`) - Integration test helpers and legacy utilities

## Quick Start

### For Unit Tests

Import the mocking utilities and use them directly:

```javascript
import { describe, it, expect } from 'vitest'
import { createMockSupabaseClient, mockDataFactories, mockDatabase } from '../mocking-utils.js'

describe('My Unit Test', () => {
  it('should test with mocked Supabase', async () => {
    const mockSupabase = createMockSupabaseClient({
      mockResponses: {
        products: { data: [mockDataFactories.product()], error: null }
      }
    })

    // Use mockSupabase in your test
    const result = await mockSupabase.from('products').select('*').single()
    expect(result.data).toBeDefined()
  })
})
```

### For Integration Tests with DI Container

The global setup automatically mocks Supabase for DI container tests:

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import DIContainer from '../../architecture/di-container.js'
import { initializeDIContainer } from '../../architecture/di-container.js'

describe('Service with DI Container', () => {
  let productRepository

  beforeEach(() => {
    DIContainer.clear()
    DIContainer.registerInstance('SupabaseClient', mockSupabase)
    initializeDIContainer()
    productRepository = DIContainer.resolve('ProductRepository')
  })

  afterEach(() => {
    DIContainer.clear()
  })

  it('should work with mocked repository', async () => {
    // Repository uses the globally mocked Supabase
    const result = await productRepository.findAllWithFilters({})
    expect(result).toBeDefined()
  })
})
```

## Mock Data Factories

Generate consistent test data across all tests:

```javascript
import { mockDataFactories } from '../mocking-utils.js'

const user = mockDataFactories.user({ email: 'custom@example.com' })
const product = mockDataFactories.product({ name: 'Custom Product' })
const order = mockDataFactories.order({ status: 'completed' })
```

Available factories: `user`, `product`, `order`, `occasion`, `payment`

## Mock Supabase Client

Create comprehensive Supabase client mocks:

```javascript
const mockSupabase = createMockSupabaseClient({
  mockResponses: {
    products: { data: [mockDataFactories.product()], error: null },
    users: { data: null, error: { code: 'PGRST116', message: 'Not found' } }
  },
  authResponses: {
    getUser: { data: { user: mockDataFactories.user() }, error: null }
  },
  storageResponses: {
    upload: { data: { path: 'uploaded-file.jpg' }, error: null }
  }
})
```

### Database Operations

```javascript
// Basic queries
const result = await mockSupabase.from('products').select('*').single()

// Complex queries with chaining
const products = await mockSupabase
  .from('products')
  .select('*')
  .eq('active', true)
  .order('created_at', { ascending: false })
  .limit(10)
  .single()
```

### Auth Operations

```javascript
// Sign up
await mockSupabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
})

// Get user
const {
  data: { user }
} = await mockSupabase.auth.getUser()
```

### Storage Operations

```javascript
// Upload file
await mockSupabase.storage.from('products').upload('path.jpg', file)

// Get public URL
const {
  data: { publicUrl }
} = mockSupabase.storage.from('products').getPublicUrl('path.jpg')
```

## Database Simulation

For integration tests that need realistic database behavior:

```javascript
import { mockDatabase } from '../mocking-utils.js'

describe('Database Simulation', () => {
  beforeEach(() => {
    mockDatabase.reset()
  })

  it('should simulate CRUD operations', async () => {
    const product = mockDataFactories.product()

    // Create
    const createResult = await mockDatabase.create('products', product)
    expect(createResult.data.id).toBe(1)

    // Read
    const findResult = await mockDatabase.findById('products', 1)
    expect(findResult.data.name).toBe(product.name)

    // Update
    const updateResult = await mockDatabase.update('products', 1, { name: 'Updated' })
    expect(updateResult.data.name).toBe('Updated')

    // Delete
    const deleteResult = await mockDatabase.delete('products', 1)
    expect(deleteResult.data.id).toBe(1)
  })
})
```

## Mock Query Builder

Advanced query building with fluent interface:

```javascript
const queryBuilder = createMockQueryBuilder({
  data: mockDataFactories.product(),
  error: null
})

// Method chaining
const result = await queryBuilder
  .select('id, name, price_usd')
  .eq('active', true)
  .gt('price_usd', 10)
  .order('created_at', { ascending: false })
  .limit(20)
  .single()

expect(result.data).toBeDefined()
```

## Error Simulation

Simulate various error conditions:

```javascript
// Database errors
const mockSupabase = createMockSupabaseClient({
  mockResponses: {
    products: { data: null, error: { code: 'PGRST116', message: 'Not found' } }
  }
})

// Auth errors
const mockSupabaseWithAuthError = createMockSupabaseClient({
  authResponses: {
    signInWithPassword: {
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    }
  }
})

// Storage errors
const mockSupabaseWithStorageError = createMockSupabaseClient({
  storageResponses: {
    upload: { data: null, error: { message: 'Upload failed' } }
  }
})
```

## Integration Test Helpers

For integration tests that need to interact with the actual API:

```javascript
import { createTestUser, createTestProduct, createTestScenario } from '../test-utils.js'

describe('Integration Tests', () => {
  it('should create test data', async () => {
    const user = await createTestUser()
    const product = await createTestProduct()

    expect(user.id).toBeDefined()
    expect(product.id).toBeDefined()
  })

  it('should create complete test scenario', async () => {
    const scenario = await createTestScenario()

    expect(scenario.user).toBeDefined()
    expect(scenario.product).toBeDefined()
    expect(scenario.order).toBeDefined()

    // Cleanup
    await scenario.cleanup()
  })
})
```

## Best Practices

### 1. Use Appropriate Mocking Level

- **Unit Tests**: Use `mocking-utils.js` for isolated testing
- **Integration Tests**: Use global setup with DI container
- **API Tests**: Use `test-utils.js` integration helpers

### 2. Reset State Between Tests

```javascript
beforeEach(() => {
  vi.clearAllMocks()
  mockDatabase.reset()
  DIContainer.clear()
})
```

### 3. Use Consistent Data

```javascript
// Use factories for consistent data
const product = mockDataFactories.product({ name: 'Test Product' })

// Override specific fields as needed
const premiumProduct = mockDataFactories.product({
  name: 'Premium Product',
  price_usd: 99.99
})
```

### 4. Test Error Conditions

```javascript
it('should handle errors gracefully', async () => {
  mockSupabase.from.mockReturnValueOnce({
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' }
    })
  })

  await expect(myFunction()).rejects.toThrow()
})
```

### 5. Mock at the Right Level

```javascript
// Good: Mock Supabase client for repository testing
DIContainer.registerInstance('SupabaseClient', mockSupabase)

// Good: Mock service methods for controller testing
const mockService = {
  getAllProducts: vi.fn().mockResolvedValue([])
}
DIContainer.registerInstance('ProductService', mockService)
```

## Migration Guide

### From Old Test Utils

If you're migrating from the old `test-utils.js`:

1. **For unit tests**: Switch to `mocking-utils.js`
2. **For integration tests**: Keep using `test-utils.js` for API helpers
3. **Update imports**: Change `createMockQueryBuilder` usage to the new API

### Backward Compatibility

The existing `test-utils.js` maintains backward compatibility for integration test helpers, but new tests should use `mocking-utils.js` for better isolation.

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure to import from the correct file:
   - Unit tests: `../mocking-utils.js`
   - Integration tests: `../test-utils.js`

2. **Mock Not Working**: Ensure `vi.clearAllMocks()` is called in `beforeEach`

3. **DI Container Issues**: Call `DIContainer.clear()` in `afterEach`

4. **Database State**: Reset `mockDatabase` between tests

### Debug Tips

```javascript
// Log mock calls
console.log(mockSupabase.from.mock.calls)

// Inspect mock return values
console.log(mockSupabase.from.mock.results)

// Check DI container state
console.log(DIContainer.has('SupabaseClient'))
```

## Examples

See `simple-mocking-demo.test.js` for comprehensive examples of all mocking features.
