# Middleware Organization & Configuration Guide

## Overview

This document describes the organized middleware implementation, centralized configuration management, and consistent logging system for the FloresYa API.

---

## 📋 Table of Contents

1. [Middleware Organization](#middleware-organization)
2. [Configuration Management](#configuration-management)
3. [Logging System](#logging-system)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

---

## 🏗️ Middleware Organization

### Directory Structure

```
api/middleware/
├── index.js                          # Centralized exports
├── auth.js                           # Authentication & authorization
├── validate.js                       # Request validation
├── errorHandler.js                   # Centralized error handling
├── logger.js                         # Logging middleware (re-export)
├── security.js                       # CORS, Helmet, Rate limiting
├── rateLimit.js                      # Dedicated rate limiting
├── schemas.js                        # Validation schemas
├── sanitize.js                       # Input sanitization
├── openapiValidator.js               # API contract validation
├── responseStandard.js               # Response formatting
└── ... (other middleware)
```

### Middleware Categories

#### Core Middleware (Essential)

- **errorHandler.js**: Catches all errors, formats responses
- **logger.js**: Request/response logging
- **auth.js**: Authentication & authorization

#### Validation

- **validate.js**: Manual validation helpers
- **schemas.js**: Reusable validation schemas
- **sanitize.js**: Input sanitization
- **advancedValidation.js**: Complex validation rules

#### Security

- **security.js**: CORS, Helmet, rate limiting
- **rateLimit.js**: Dedicated rate limiting
- **sessionSecurity.js**: Session security headers

#### Performance

- **cache.js**: Response caching
- **circuitBreaker.js**: Circuit breaker pattern

#### API

- **openapiValidator.js**: Contract validation
- **enhancedOpenApiValidator.js**: Advanced validation
- **responseStandard.js**: Standardized responses

### Using Middleware

#### Import from Centralized Index

```javascript
import {
  errorHandler,
  auth,
  validate,
  requestLoggingMiddleware,
  logger
} from '../middleware/index.js'
```

#### Import Specific Category

```javascript
// Authentication
import { authenticate, authorize } from '../middleware/auth.js'

// Validation
import { validate, validateId } from '../middleware/validate.js'

// Security
import { configureCors, rateLimiter } from '../middleware/security.js'
```

---

## ⚙️ Configuration Management

### Centralized Configuration

All configuration is centralized in `api/config/configLoader.js` which provides:

- Environment variable validation
- Type parsing (boolean, integer, array)
- Default values
- Configuration freezing (immutable)
- Error handling

### Configuration Structure

```
api/config/
├── index.js              # Centralized exports
├── configLoader.js       # Main configuration loader
├── constants.js          # Business rules & limits
├── errorCodes.js         # Error code constants
└── swagger.js            # Swagger/OpenAPI config
```

### Configuration Categories

#### Database

```javascript
config.database.url // Supabase URL
config.database.key // Service role or anon key
config.database.options // Connection options
```

#### Server

```javascript
config.server.port // Server port (default: 3000)
config.server.host // Server host
config.server.cors.allowedOrigins.credentials.methods // CORS configuration // Array of allowed origins // Allow credentials // Allowed HTTP methods
```

#### Security

```javascript
config.security.jwt.secret.expiryTime // JWT configuration // JWT secret // Token expiry
config.security.rateLimit.windowMs.maxRequests // Rate limiting // Time window (ms) // Max requests per window
config.security.bcrypt.rounds // Password hashing // bcrypt rounds
```

#### Business Rules

```javascript
config.business.maxOrderItems // Max items per order
config.business.minOrderAmount // Minimum order amount
config.business.defaultCurrencyRate // USD to VES rate
config.business.supportEmail // Support contact
```

### Using Configuration

#### Import Configuration

```javascript
import config from '../config/index.js'
// or
import { config, getConfig, isFeatureEnabled } from '../config/index.js'
```

#### Access Configuration

```javascript
// Direct access
const port = config.server.port
const dbUrl = config.database.url

// Module-specific config
const dbConfig = getConfig('database')
const corsConfig = getConfig('server.cors')

// Feature flags
if (isFeatureEnabled('emailVerificationRequired')) {
  // Require email verification
}
```

#### Environment Variables

Create `.env.local` file:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server
PORT=3000
LOG_LEVEL=info
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Business
MAX_ORDER_ITEMS=50
MIN_ORDER_AMOUNT=10.00
DEFAULT_CURRENCY_RATE=40

# Features
FEATURE_REGISTRATION=true
FEATURE_EMAIL_VERIFICATION=true
FEATURE_API_DOCS=true
```

### Configuration Validation

Configuration is validated on load:

- Required variables are checked
- Types are validated (integers, booleans)
- Ranges are checked (min/max values)
- Production-specific validation

Errors throw `ConfigurationError` with detailed context.

---

## 📝 Logging System

### Centralized Logger

The logging system is in `api/utils/logger.js` and provides:

- Structured logging (JSON format)
- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- File and console output
- Request correlation (requestId)
- Context-aware logging
- Performance monitoring

### Log Levels

```javascript
logger.debug('Detailed information', context) // Development only
logger.info('General information', context) // Normal operations
logger.warn('Warning messages', context) // Recoverable errors
logger.error('Error messages', error, context) // Application errors
logger.fatal('Fatal errors', error, context) // Critical failures
```

### Structured Logging

All logs include:

- Timestamp
- Log level
- Message
- Context/metadata
- Caller information (function, file)
- Request ID (when available)
- User ID (when available)

Example log entry:

```json
{
  "timestamp": "2025-10-31T15:45:00.000Z",
  "level": "ERROR",
  "message": "CRITICAL ERROR: ValidationError",
  "caller": {
    "function": "validateProduct",
    "file": "productService.js"
  },
  "context": {
    "errorName": "ValidationError",
    "errorCode": 1001,
    "statusCode": 400,
    "path": "/api/products",
    "requestId": "req_123456789"
  },
  "error": {
    "name": "ValidationError",
    "message": "Product validation failed",
    "stack": "..."
  }
}
```

### Logging Utilities

#### Request Logging

```javascript
import { requestLoggingMiddleware } from '../middleware/logger.js'

// Add to Express app
app.use(requestLoggingMiddleware)
```

#### Error Logging

```javascript
import { log } from '../utils/logger.js'

try {
  // Operation
} catch (error) {
  log.error('Operation failed', error, { userId: 123 })
}
```

#### Service Logging

```javascript
import { log } from '../utils/logger.js'

// Log service operation
log.info('Creating product', { productId: 456, userId: 123 })

// Log database operation
log.database('INSERT', 'products', 45, { productId: 456 })

// Log business event
log.business('order_created', { orderId: 789, total: 99.99 })
```

#### Security Logging

```javascript
import { log } from '../utils/logger.js'

// Log security events
log.security('Unauthorized access attempt', 'high', {
  ip: '192.168.1.1',
  path: '/api/admin/products'
})
```

### Module-Specific Loggers

```javascript
import { createModuleLogger } from '../utils/logger.js'

const logger = createModuleLogger('ProductService')

logger.info('Getting product', { productId: 123 })
logger.error('Failed to get product', error, { productId: 123 })
```

### Error Handling Wrapper

```javascript
import { withErrorHandling } from '../utils/logger.js'

export async function getProduct(id) {
  return withErrorHandling(
    async () => {
      // Your service logic
      const product = await db.select('products').eq('id', id)
      return product
    },
    'getProduct',
    { productId: id }
  )()
}
```

---

## 💡 Usage Examples

### Setting Up Middleware in Express App

```javascript
import express from 'express'
import {
  configureCors,
  configureHelmet,
  rateLimiter,
  requestLoggingMiddleware,
  errorHandler,
  notFoundHandler,
  validate,
  validateId
} from './middleware/index.js'
import config from './config/index.js'

const app = express()

// Security middleware
app.use(configureCors())
app.use(configureHelmet())
app.use(rateLimiter()) // Uses config.security.rateLimit

// Logging middleware
app.use(requestLoggingMiddleware)

// Body parsing
app.use(express.json())

// Routes
app.get(
  '/api/products',
  validateQuery,
  asyncHandler(async (req, res) => {
    // Your route logic
  })
)

// Error handling (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port}`)
})
```

### Using Validation Middleware

```javascript
import { validate, validateId } from './middleware/index.js'
import { commonSchemas } from './middleware/schemas.js'

// Validate request body
app.post(
  '/api/products',
  validate({
    name: { type: 'string', required: true, minLength: 2 },
    price: { type: 'number', required: true, min: 0 }
  }),
  asyncHandler(async (req, res) => {
    // req.body is validated
  })
)

// Validate ID parameter
app.get(
  '/api/products/:id',
  validateId('id'),
  asyncHandler(async (req, res) => {
    // req.params.id is validated
  })
)
```

### Using Authentication Middleware

```javascript
import { authenticate, authorize } from './middleware/auth.js'
import { PERMISSIONS } from './config/constants.js'

// Require authentication
app.get(
  '/api/profile',
  authenticate,
  asyncHandler(async (req, res) => {
    // req.user is available
  })
)

// Require specific role
app.post(
  '/api/products',
  authenticate,
  authorize([PERMISSIONS.CREATE_PRODUCT]),
  asyncHandler(async (req, res) => {
    // Only users with CREATE_PRODUCT permission
  })
)
```

### Using Logger in Services

```javascript
import { log } from '../utils/logger.js'
import { withErrorHandling } from '../utils/logger.js'

export async function createProduct(data) {
  return withErrorHandling(
    async () => {
      log.info('Creating product', { name: data.name, userId: req.user?.id })

      const product = await supabase.from('products').insert(data).select().single()

      log.business('product_created', { productId: product.id })

      return product
    },
    'createProduct',
    { name: data.name }
  )()
}
```

---

## ✅ Best Practices

### Middleware

1. **Order Matters**: Register middleware in correct order

   ```javascript
   app.use(cors()) // First: CORS
   app.use(helmet()) // Second: Security headers
   app.use(rateLimiter()) // Third: Rate limiting
   app.use(requestLogger) // Fourth: Request logging
   app.use(bodyParser) // Fifth: Body parsing
   ```

2. **Use Centralized Exports**: Import from `middleware/index.js`

   ```javascript
   import { errorHandler } from './middleware/index.js'
   ```

3. **Error Handler Last**: Always register error handler last
   ```javascript
   app.use(notFoundHandler)
   app.use(errorHandler) // Must be last
   ```

### Configuration

1. **Use Config Object**: Don't access `process.env` directly

   ```javascript
   // Bad
   const port = process.env.PORT || 3000

   // Good
   import config from './config/index.js'
   const port = config.server.port
   ```

2. **Validate on Load**: Configuration is validated when imported

   ```javascript
   // This will throw ConfigurationError if invalid
   import config from './config/index.js'
   ```

3. **Use Feature Flags**: Control features via configuration
   ```javascript
   if (isFeatureEnabled('emailVerificationRequired')) {
     // Require email verification
   }
   ```

### Logging

1. **Use Structured Logging**: Always include context

   ```javascript
   // Bad
   logger.error('Error')

   // Good
   log.error('Failed to create product', error, { productId: 123 })
   ```

2. **Use Appropriate Level**: Choose correct log level

   ```javascript
   logger.debug('Detailed trace') // Development only
   logger.info('Normal operation') // Success events
   logger.warn('Recoverable error') // Warnings
   logger.error('Application error') // Errors
   logger.fatal('Critical failure') // Fatal errors
   ```

3. **Use Error Wrapper**: Wrap async operations

   ```javascript
   export async function myService() {
     return withErrorHandling(
       async () => {
         /* logic */
       },
       'myService',
       { context }
     )()
   }
   ```

4. **Use Module Loggers**: Create module-specific loggers

   ```javascript
   const logger = createModuleLogger('ProductService')
   logger.info('Message', { context })
   ```

5. **Include Request ID**: Track requests across logs

   ```javascript
   app.use(requestLoggingMiddleware) // Adds req.requestId

   log.info('Operation', {
     requestId: req.requestId,
     userId: req.user?.id
   })
   ```

---

## 📊 Monitoring

### Log Files

Logs are written to `logs/` directory:

- `error.log` - Error and fatal logs
- `combined.log` - All logs
- `http.log` - HTTP request logs (production)
- `YYYY-MM-DD.log` - Daily rotation

### Metrics

The logger provides built-in metrics:

- Request duration
- Database operation timing
- Error rates by severity
- Slow request detection

### Integration

Easy integration with monitoring services:

```javascript
// Sentry
if (config.monitoring.sentryDsn) {
  logger.add(Sentry)
}

// Datadog
if (config.monitoring.datadogApiKey) {
  logger.add(DataDog)
}
```

---

## 🎯 Summary

✅ **Organized Middleware**: Categorized, documented, centralized exports
✅ **Centralized Config**: Validated, typed, frozen, environment-aware
✅ **Consistent Logging**: Structured, contextual, correlated, multi-level
✅ **Best Practices**: ESLint compliant, fail-fast, error handling, security-first

The middleware, configuration, and logging systems are now enterprise-grade and production-ready!
