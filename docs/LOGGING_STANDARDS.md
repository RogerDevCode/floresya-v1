# 📊 Logging Standards Guide

## Overview

This document defines the **logging standards and best practices** for the FloresYa project. It ensures consistent, structured logging across the entire codebase for improved debugging, monitoring, and audit trails.

## 🎯 Why Structured Logging?

### Benefits

- **Consistency**: All logs follow the same format
- **Searchability**: Structured data can be easily queried
- **Debugging**: Rich context helps identify issues quickly
- **Monitoring**: Automatic integration with monitoring tools
- **Audit Trails**: Complete history of operations

### Before (Unstructured)

```javascript
console.log('User created', userId, 'at', timestamp)
// Hard to parse, no context, inconsistent format
```

### After (Structured)

```javascript
logger.info('User created', {
  userId: '123',
  timestamp: '2025-10-31T15:00:00Z',
  requestId: 'req_123456_1'
})
// Easy to query, rich context, consistent format
```

## 🏗️ Structured Logging System

### Location

```
api/utils/logger.js
```

### Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Structured Output**: JSON format with timestamps
- **Context Enrichment**: Automatic request ID, user ID, caller info
- **File Rotation**: Automatic log rotation (10MB files, keep 5)
- **Colorized Console**: Easy-to-read console output
- **Performance Logging**: Built-in performance monitoring

## 📋 Logging Levels

### Level Hierarchy

```javascript
DEBUG (0)    → Detailed diagnostic information
INFO (1)     → General operational messages
WARN (2)     → Warning messages for unusual conditions
ERROR (3)    → Error messages for failed operations
FATAL (4)    → Fatal errors causing application crash
```

### Usage Guidelines

#### DEBUG

```javascript
logger.debug('Query executed', {
  table: 'products',
  query: 'SELECT * FROM products',
  duration: '45ms'
})
```

**Use for**: Detailed execution flow, query parameters, internal state

#### INFO

```javascript
logger.info('User login successful', {
  userId: '123',
  email: 'user@example.com',
  requestId: 'req_123456_1'
})
```

**Use for**: Business events, successful operations, user actions

#### WARN

```javascript
logger.warn('Rate limit approaching', {
  userId: '123',
  currentRequests: 95,
  maxRequests: 100
})
```

**Use for**: Unusual conditions, approaching limits, recoverable errors

#### ERROR

```javascript
logger.error('Database connection failed', error, {
  operation: 'getProducts',
  table: 'products',
  requestId: 'req_123456_1'
})
```

**Use for**: Failed operations, exceptions, unexpected errors

#### FATAL

```javascript
logger.fatal('Application crash', error, {
  memoryUsage: '2GB',
  uptime: '3600s'
})
```

**Use for**: Application crashes, system failures, unrecoverable errors

## 🔧 Usage Examples

### Import the Logger

```javascript
// In services, controllers, middleware
import { log as logger } from '../utils/logger.js'

// Or import specific methods
import { logger, log } from '../utils/logger.js'
```

### Basic Logging

```javascript
// Simple message
logger.info('Operation completed')

// With context
logger.info('User created', { userId: '123' })

// With error
try {
  await someOperation()
} catch (error) {
  logger.error('Operation failed', error, { userId: '123' })
}
```

### Request Context

```javascript
logger.info('API request received', {
  requestId: req.requestId,
  method: req.method,
  url: req.url,
  userId: req.user?.id,
  ip: req.ip
})
```

### Database Operations

```javascript
logger.database('SELECT', 'products', duration, {
  requestId: req.requestId,
  rowsReturned: 5
})
```

### Business Events

```javascript
logger.business('Order created', {
  orderId: '456',
  userId: '123',
  amount: 99.99,
  itemsCount: 3
})
```

### Security Events

```javascript
logger.security('Failed login attempt', 'medium', {
  email: 'user@example.com',
  ip: '192.168.1.1',
  attempts: 3
})
```

### Performance Monitoring

```javascript
logger.performance('API response time', 2500, 2000, {
  endpoint: '/api/products',
  requestId: 'req_123456_1'
})
```

## 📝 Logging Patterns by Category

### 1. Service Layer

```javascript
// Get operation
export async function getProductById(id) {
  logger.info('Fetching product', { productId: id })

  const product = await supabase.from(TABLE).select('*').eq('id', id)

  logger.info('Product fetched', { productId: id, found: !!product })

  return product
}

// Create operation
export async function createProduct(data) {
  logger.info('Creating product', { name: data.name })

  const result = await supabase.from(TABLE).insert(data)

  if (result.error) {
    logger.error('Failed to create product', result.error, {
      name: data.name
    })
    throw result.error
  }

  logger.info('Product created', { productId: result.data.id })
  return result.data
}
```

### 2. Controller Layer

```javascript
export const getProduct = asyncHandler(async (req, res) => {
  logger.info('Product request', {
    requestId: req.requestId,
    productId: req.params.id
  })

  const product = await productService.getProductById(req.params.id)

  res.json({
    success: true,
    data: product
  })
})
```

### 3. Middleware Layer

```javascript
export function authMiddleware(req, res, next) {
  logger.info('Authentication request', {
    requestId: req.requestId,
    hasToken: !!req.headers.authorization
  })

  try {
    // Authentication logic
    next()
  } catch (error) {
    logger.error('Authentication failed', error, {
      requestId: req.requestId
    })
    throw error
  }
}
```

### 4. Error Handling

```javascript
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'riskyOperation',
    userId: req.user?.id,
    requestId: req.requestId
  })
  throw error // Always re-throw
}
```

## 🎨 Formatting Standards

### Log Entry Structure

```json
{
  "timestamp": "2025-10-31T15:00:00.123Z",
  "level": "INFO",
  "message": "Product created",
  "caller": {
    "function": "createProduct",
    "file": "/api/services/productService.js"
  },
  "context": {
    "productId": "123",
    "requestId": "req_123456_1"
  },
  "requestId": "req_123456_1",
  "userId": "456"
}
```

### Context Best Practices

```javascript
// ✅ GOOD: Rich, searchable context
logger.info('Order processed', {
  orderId: '123',
  userId: '456',
  amount: 99.99,
  currency: 'USD',
  items: 5,
  requestId: 'req_123456_1'
})

// ❌ BAD: Missing important context
logger.info('Order processed')
```

## 📊 Special Logging Methods

### Request Logging

```javascript
// Automatically logs HTTP requests
logger.request(req) // Returns request ID

// Logs HTTP responses
logger.response(requestId, 200, 150) // statusCode, duration
```

### Database Logging

```javascript
// Logs database operations
logger.database('INSERT', 'orders', 45, {
  requestId: req.requestId,
  rowsInserted: 1
})
```

### Business Logic Logging

```javascript
// Logs business events
logger.business('User registered', {
  userId: '123',
  email: 'user@example.com',
  source: 'web'
})
```

### Security Logging

```javascript
// Logs security events
logger.security('Password reset requested', 'medium', {
  email: 'user@example.com',
  ip: req.ip
})
```

## 🚫 What NOT to Log

### Sensitive Data

```javascript
// ❌ NEVER log passwords, tokens, or PII
logger.info('User login', {
  email: 'user@example.com',
  password: 'secret123' // NEVER!
})

// ✅ Log safely
logger.info('User login attempt', {
  email: 'user@example.com',
  success: false
})
```

### Excessive Data

```javascript
// ❌ DON'T log entire objects
logger.info('Order created', {
  order: orderObject // Too much data!
})

// ✅ Log relevant fields only
logger.info('Order created', {
  orderId: '123',
  amount: 99.99
})
```

## 🔍 Log Configuration

### Environment Variables

```bash
# Set logging level
LOG_LEVEL=DEBUG      # Development
LOG_LEVEL=INFO       # Production
LOG_LEVEL=WARN       # Minimal logging
LOG_LEVEL=ERROR      # Only errors

# Disable console logging in production
ENABLE_CONSOLE_LOGGING=false

# Log to files
ENABLE_FILE_LOGGING=true
LOG_DIR=/var/log/floresya
```

### Log Files

```
logs/
├── debug_2025-10-31.log
├── info_2025-10-31.log
├── warn_2025-10-31.log
├── error_2025-10-31.log
└── fatal_2025-10-31.log
```

## 📈 Performance Considerations

### Impact Mitigation

- **Async Logging**: All logging is non-blocking
- **Smart Filtering**: Logs below threshold level are discarded early
- **Batch Processing**: Multiple logs can be batched
- **Circular Buffers**: For high-frequency events

### When to Log

```javascript
// ✅ Log operations > 100ms
const start = Date.now()
await operation()
const duration = Date.now() - start

if (duration > 100) {
  logger.info('Slow operation detected', {
    operation: 'getProducts',
    duration: `${duration}ms`
  })
}
```

## 🧪 Testing Logs

### Verify Logging in Tests

```javascript
import { logger } from '../utils/logger.js'

describe('Product Service', () => {
  test('should log product creation', () => {
    const spy = vi.spyOn(logger, 'info')

    await productService.createProduct(testData)

    expect(spy).toHaveBeenCalledWith(
      'Creating product',
      expect.objectContaining({
        name: testData.name
      })
    )
  })
})
```

## 🛠️ Migration Guide

### Converting console.log to Structured Logging

#### Before

```javascript
console.log('Loading products')
console.error('Failed to load products:', error)
console.warn('Rate limit exceeded')
```

#### After

```javascript
logger.info('Loading products')
logger.error('Failed to load products', error)
logger.warn('Rate limit exceeded', {
  currentRequests: 95,
  maxRequests: 100
})
```

### Quick Reference

| Old Pattern               | New Pattern              |
| ------------------------- | ------------------------ |
| `console.log(msg)`        | `logger.info(msg)`       |
| `console.error(msg, err)` | `logger.error(msg, err)` |
| `console.warn(msg)`       | `logger.warn(msg)`       |
| `console.debug(msg)`      | `logger.debug(msg)`      |

## 🎯 Best Practices

### ✅ DO

- Always use structured logging with context
- Include requestId for tracking
- Log errors with error object
- Use appropriate log levels
- Include relevant business context
- Log at entry and exit of functions

### ❌ DON'T

- Use console.log directly (except temporary debugging)
- Log sensitive data (passwords, tokens)
- Log excessive data (entire objects)
- Ignore errors silently
- Use wrong log levels
- Forget to add context

## 📚 Related Documentation

- `api/utils/logger.js` - Logger implementation
- `CLAUDE.md` - Project architecture
- `.factory/droids/MANDATORY_RULES.md` - ESLint rules

## 🔧 Troubleshooting

### Logs Not Appearing

**Check**: LOG_LEVEL environment variable

```bash
export LOG_LEVEL=DEBUG
```

### Too Many Logs

**Solution**: Increase threshold or filter in production

```javascript
// Only log warnings and errors in production
const LEVEL = config.IS_PRODUCTION ? 'WARN' : 'DEBUG'
```

### Performance Impact

**Solution**: Use DEBUG level sparingly in production

```javascript
logger.debug('Detailed trace', ...)  // Set LOG_LEVEL=INFO to disable
```

## 📊 Metrics

- **Log Levels**: 5 (DEBUG, INFO, WARN, ERROR, FATAL)
- **File Rotation**: 10MB files, keep 5
- **Supported Methods**: 15+ specialized logging methods
- **Context Fields**: requestId, userId, sessionId, etc.
- **Performance**: <1ms per log entry

## ✅ Compliance Checklist

- [ ] All new code uses logger (not console.\*)
- [ ] Appropriate log levels used
- [ ] Rich context provided
- [ ] Errors logged with error objects
- [ ] Sensitive data not logged
- [ ] Request ID tracked
- [ ] Performance logged for slow operations
- [ ] Business events logged
- [ ] Security events logged

---

**Status**: ✅ **ACTIVE** - All new code must follow these standards
**Last Updated**: 2025-10-31
**Owner**: Architecture Team
**Review**: Quarterly
