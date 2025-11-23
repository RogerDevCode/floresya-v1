# API Client Migration Guide

## Overview

This document explains how to migrate from direct fetch calls to the centralized `api-client.js` in the FloresYa e-commerce platform. The migration provides benefits like type safety, consistent error handling, and better maintainability.

## Benefits of Using the API Client

1. **Centralized Error Handling**: All API calls have consistent error handling
2. **Type Safety**: Better IDE support and fewer runtime errors
3. **Maintainability**: Changes to API structure only need to be updated in one place
4. **Authorization Support**: Built-in support for authentication tokens
5. **Validation**: Built-in request/response validation

## API Client Features

The `api-client.js` provides several key features:

### Authentication Support

```javascript
import { apiClient } from './js/shared/api-client.js'

// Set auth token for admin operations
apiClient.setAuthToken('Bearer admin:1:admin')

// Clear auth token when logging out
apiClient.clearAuthToken()
```

### Available Methods

The API client provides methods for all major operations:

- **Products**: `getProducts()`, `getProduct()`, `createProduct()`, `updateProduct()`, `getCarouselProducts()`, `getProductsByOccasion()`
- **Product Images**: `getProductImages()`, `uploadProductImages()`, `deleteProductImage()`, `getPrimaryImage()`
- **Orders**: `getOrders()`, `getOrder()`, `createOrder()`, `updateOrderStatus()`, `cancelOrder()`, `getOrderStatusHistory()`, `getUserOrders()`
- **Users**: `getUsers()`, `getUser()`, `createUser()`, `updateUser()`
- **Settings**: `getPublicSettings()`, `getSettingsMap()`, `getSettingValue()`, `uploadSettingImage()`, `updateBcvPrice()`
- **Occasions**: `getOccasions()`, `getOccasionById()`, `createOccasion()`, `updateOccasion()`, `deleteOccasion()`

## Migration Process

### Step 1: Import the API Client

Add the import statement at the top of your JavaScript file:

```javascript
import { api } from './js/shared/api-client.js'
```

### Step 2: Replace Direct Fetch Calls

Replace direct fetch calls with API client methods:

#### Before (Direct Fetch):

```javascript
async function loadProducts() {
  try {
    const response = await fetch('/api/products')
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data
  } catch (error) {
    console.error('Failed to load products:', error)
    throw error
  }
}
```

#### After (API Client):

```javascript
async function loadProducts() {
  try {
    const result = await api.getProducts()

    // The API client already handles error cases
    if (!result.success) {
      throw new Error(result.message)
    }

    return result.data
  } catch (error) {
    console.error('Failed to load products:', error)
    throw error
  }
}
```

### Step 3: Handle Query Parameters

When using query parameters, pass them as an object:

#### Before:

```javascript
const response = await fetch('/api/products?limit=10&offset=20')
```

#### After:

```javascript
const result = await api.getProducts({ limit: 10, offset: 20 })
```

### Step 4: Handle Authorization for Admin Operations

For admin operations that require authentication:

```javascript
import { apiClient } from './js/shared/api-client.js'

// Set the auth token before making admin API calls
apiClient.setAuthToken('Bearer admin:1:admin')

// Now API calls will include the auth header
const result = await api.getProducts({ includeInactive: true })
```

### Step 5: Handle File Uploads

For file uploads, use the dedicated upload methods:

#### Before:

```javascript
const formData = new FormData()
formData.append('image', imageFile)
formData.append('setting_key', 'hero_image')

const response = await fetch('/api/admin/settings/image', {
  method: 'POST',
  body: formData
})
```

#### After:

```javascript
const result = await api.uploadSettingImage('hero_image', imageFile)
```

## Common Migration Patterns

### Loading Products with Filters

```javascript
// Before
const response = await fetch('/api/products?featured=true&limit=12')
const result = await response.json()

// After
const result = await api.getProducts({ featured: true, limit: 12 })
```

### Individual Product Fetch

```javascript
// Before
const response = await fetch(`/api/products/${productId}`)
const result = await response.json()

// After
const result = await api.getProduct(productId)
```

### Creating/Updating Resources

```javascript
// Before
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData)
})
const result = await response.json()

// After
const result = await api.createProduct(productData)
```

### Working with Images

```javascript
// Before
const response = await fetch(`/api/products/${productId}/images`)
const result = await response.json()

// After
const result = await api.getProductImages(productId)
```

## Handling Authorization in Migration

Many admin pages use authorization headers. When migrating these files, you'll need to set the auth token:

```javascript
// At the beginning of admin files
import { apiClient } from '../js/shared/api-client.js'

// Set auth token for admin operations
apiClient.setAuthToken('Bearer admin:1:admin')

// Then use the api methods as normal
const result = await api.getProducts({ includeInactive: true })
```

## Migration Checklist

- [ ] Add import statement: `import { api } from './js/shared/api-client.js'`
- [ ] Replace all `fetch()` calls with appropriate `api.methodName()` calls
- [ ] Update request/response handling to match API client format
- [ ] Set auth tokens for admin operations using `apiClient.setAuthToken()`
- [ ] Test functionality after migration
- [ ] Update any custom error handling if needed

## Running the Automated Migration

The project includes a migration script to help automate the process:

```bash
node scripts/migrate-to-api-client.js
```

This script will process the files identified as needing migration and apply basic transformations.

## Best Practices

1. **Consistent Error Handling**: The API client provides consistent error responses in the format `{ success: boolean, data/error: mixed, message: string }`
2. **Parameter Objects**: Pass query parameters as objects rather than building URLs manually
3. **Type Safety**: The API client methods are designed to match backend endpoints, so use the correct method for your use case
4. **Validation**: Use the validation methods provided: `api.validateProduct()`, `api.validateOrder()`
5. **User-Friendly Errors**: Use `api.handleError()` to convert technical errors to user-friendly messages

## Troubleshooting

### Missing Methods

If you encounter an API call that doesn't have a corresponding method in the client, add it following the existing patterns in `api-client.js`.

### Authorization Issues

If admin functions stop working after migration, ensure you're setting the auth token before making the API calls.

### File Upload Issues

For file uploads, ensure you're using the dedicated methods like `uploadProductImages()` or `uploadSettingImage()`.

---

For more details on specific API methods, check the JSDoc comments in `public/js/shared/api-client.js`.
