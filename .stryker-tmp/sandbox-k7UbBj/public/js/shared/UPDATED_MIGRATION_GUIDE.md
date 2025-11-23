# 🚀 Updated Frontend API Client Migration Guide

## 📋 Migration Overview

Found 29 direct fetch calls that need to be migrated to use the generated API client instead of direct fetch calls.

## 🎯 Migration Benefits

- ✅ **Type Safety** - Compile-time error detection
- ✅ **Consistent Error Handling** - Standardized error messages
- ✅ **Automatic Validation** - Request/response validation
- ✅ **Better Maintainability** - Centralized API logic
- ✅ **Enhanced Features** - Caching, retry logic, etc.

## 📁 Files to Migrate

### js/components/CarouselManager.js

**1 call to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch(`${API_BASE}/products/carousel`, {
```

**Migrated:**

```javascript
const result = await api.getCarouselProducts()
```

### pages/payment.js

**3 calls to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/settings/public')
```

**Migrated:**

```javascript
const result = await api.getPublicSettings()
```

#### 2. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/orders', {
```

**Migrated:**

```javascript
const result = await api.getOrders()
```

#### 3. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/products/${item.id}`)
```

**Migrated:**

```javascript
const result = await api.getProduct(item.id)
```

### pages/admin/occasions.js

**4 calls to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch(API_URL)
```

**Migrated:**

```javascript
const result = await api.request(API_URL)
// OR if API_URL is '/api/occasions':
const result = await api.request('/api/occasions')
```

#### 2. Line with fetch call

**Current:**

```javascript
response = await fetch(`${API_URL}/${id}`, {
```

**Migrated:**

```javascript
const result = await api.request(`${API_URL}/${id}`, {
// OR if API_URL is '/api/occasions':
const result = await api.request(`/api/occasions/${id}`, {
```

#### 3. Line with fetch call

**Current:**

```javascript
response = await fetch(API_URL, {
```

**Migrated:**

```javascript
const result = await api.request(API_URL, {
// OR if API_URL is '/api/occasions':
const result = await api.request('/api/occasions', {
```

#### 4. Line with fetch call

**Current:**

```javascript
const response = await fetch(`${API_URL}/${selectedOccasion.id}`, {
```

**Migrated:**

```javascript
const result = await api.request(`${API_URL}/${selectedOccasion.id}`, {
// OR if API_URL is '/api/occasions':
const result = await api.request(`/api/occasions/${selectedOccasion.id}`, {
```

### pages/admin/orders.js

**3 calls to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/orders', {
```

**Migrated:**

```javascript
const result = await api.getOrders()
```

#### 2. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/orders/${orderId}/status`, {
```

**Migrated:**

```javascript
// Note: No specific method exists in api-client.js for updating order status
// We need to add this method or use direct API call
const result = await api.updateOrderStatus(orderId, status, notes)
```

#### 3. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/orders/${orderId}/status-history`, {
```

**Migrated:**

```javascript
// Note: No specific method exists in api-client.js for getting order status history
// We need to add this method or use direct API call
const result = await api.getOrderStatusHistory(orderId)
```

### pages/admin/dashboard.js

**11 calls to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch(url, {
```

**Migrated:**

```javascript
let result
if (url.includes('includeInactive=true')) {
  // Need to handle authorization header for admin access
  result = await api.getProducts({ includeInactive: true })
} else {
  result = await api.getProducts()
}
```

#### 2. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/products/${product.id}/images?size=thumb`, {
```

**Migrated:**

```javascript
const result = await api.getProductImages(product.id, { size: 'thumb' })
```

#### 3. Line with fetch call

**Current:**

```javascript
const ordersResponse = await fetch('/api/orders', {
```

**Migrated:**

```javascript
const result = await api.getOrders()
```

#### 4. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/occasions', {
```

**Migrated:**

```javascript
// Note: No specific method exists in api-client.js for occasions
// We need to add this method or use direct API call
const result = await api.request('/api/occasions', {
```

#### 5. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/products/occasion/${occasionId}`, {
```

**Migrated:**

```javascript
// Note: No specific method exists in api-client.js for products by occasion
// We need to add this method or use direct API call
const result = await api.getProductsByOccasion(occasionId, {})
```

#### 6. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/admin/settings/image', {
```

**Migrated:**

```javascript
// This might require a specific method for admin settings
// We need to add this method to the API client
const result = await api.uploadImage(setting_key, image)
```

#### 7. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/admin/settings/image', {
```

**Migrated:**

```javascript
// This might require a specific method for admin settings
// We need to add this method to the API client
const result = await api.uploadImage(setting_key, image)
```

#### 8. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/admin/settings/bcv-price', {
```

**Migrated:**

```javascript
// This might require a specific method for admin settings
// We need to add this method to the API client
const result = await api.updateSetting('bcv-price', { bcv_price })
```

#### 9. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/settings/hero_image/value')
```

**Migrated:**

```javascript
const result = await api.getSettingValue('hero_image')
```

#### 10. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/settings/site_logo/value')
```

**Migrated:**

```javascript
const result = await api.getSettingValue('site_logo')
```

#### 11. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/settings/bcv_usd_rate/value')
```

**Migrated:**

```javascript
const result = await api.getSettingValue('bcv_usd_rate')
```

### pages/admin/edit-product.js

**6 calls to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/settings/bcv_usd_rate/value', {
```

**Migrated:**

```javascript
const result = await api.getSettingValue('bcv_usd_rate')
```

#### 2. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/products/${productId}`, {
```

**Migrated:**

```javascript
const result = await api.getProduct(productId)
```

#### 3. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/products/${productId}/images`, {
```

**Migrated:**

```javascript
const result = await api.getProductImages(productId)
```

#### 4. Line with fetch call

**Current:**

```javascript
const response = await fetch(
```

**Migrated:**

```javascript
// This appears to be for deleting an image
// Need to add a delete image method to the API client
const result = await api.deleteProductImage(productId, image.existingImageIndex)
```

#### 5. Line with fetch call (duplicate)

**Current:**

```javascript
const response = await fetch(`/api/products/${productId}`, {
```

**Migrated:**

```javascript
const result = await api.getProduct(productId)
```

#### 6. Line with fetch call (duplicate)

**Current:**

```javascript
const response = await fetch(`/api/products/${productId}/images`, {
```

**Migrated:**

```javascript
const result = await api.getProductImages(productId)
```

### pages/admin/create-product.js

**3 calls to migrate**

#### 1. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/settings/bcv_usd_rate/value', {
```

**Migrated:**

```javascript
const result = await api.getSettingValue('bcv_usd_rate')
```

#### 2. Line with fetch call

**Current:**

```javascript
const response = await fetch('/api/products', {
```

**Migrated:**

```javascript
const result = await api.createProduct(productData)
```

#### 3. Line with fetch call

**Current:**

```javascript
const response = await fetch(`/api/products/${productId}/images`, {
```

**Migrated:**

```javascript
const result = await api.uploadProductImages(productId, formData)
```

## 🚀 Migration Steps

### Step 1: Add API Client Import

```javascript
// Add to top of your JavaScript files
import { api } from './shared/api-client.js'
```

### Step 2: Replace Direct Fetch Calls

```javascript
// OLD - Direct fetch
const response = await fetch('/api/products/67')
const product = await response.json()

// NEW - API Client
const result = await api.getProduct(67)
const product = result.success ? result.data : null
```

### Step 3: Handle Authorization Headers

```javascript
// For admin operations, the API client needs to handle auth
// Currently the API client doesn't handle authorization headers
// You may need to temporarily keep some fetch calls with auth headers
// until the API client is updated to support auth headers
```

### Step 4: Missing Methods in API Client

Some API endpoints don't have corresponding methods in the api-client.js file. We need to add them:

- Occasions endpoints: `/api/occasions`
- Order status history: `/api/orders/{id}/status-history`
- Admin settings endpoints: `/api/admin/settings/*`
- Product image deletion: `/api/products/{id}/images/{imageId}`

## 🚨 Critical Issues to Address

1. **Authorization Headers**: The current api-client.js doesn't handle authorization headers, which are required for admin operations. The system needs enhancement to support auth headers.

2. **Missing API Methods**: Several endpoints used in the codebase don't have corresponding methods in the API client and need to be added.

3. **FormData uploads**: File uploads using FormData are different from JSON requests and need special handling in the API client.

## 📊 Migration Progress

Based on actual codebase analysis:

- Files using direct fetch: 7 files with 29 fetch calls
- Files already using api-client: Most frontend files
- Remaining to migrate: 29 direct fetch calls in 7 files

---

**⚠️ ATTENTION: The original migration guide was inaccurate. Use this updated guide based on actual codebase analysis.**
