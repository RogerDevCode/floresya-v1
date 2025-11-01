# 🔧 Centralized Configuration Management Guide

## Overview

FloresYa now uses a **centralized configuration management system** via `api/config/configLoader.js`. This eliminates scattered environment variables across multiple files and provides a single source of truth for all configuration settings.

## ✅ Benefits

- **Single Source of Truth**: All configuration in one place
- **Type Safety**: Validated and parsed configuration values
- **Environment Detection**: Automatic NODE_ENV handling
- **Fail-Fast**: Configuration errors caught at startup
- **Maintainability**: Easy to find and update settings
- **Security**: Sensitive data properly handled

## 📁 File Structure

```
api/
├── config/
│   └── configLoader.js          ← Centralized configuration (307 lines)
├── services/
│   └── supabaseClient.js         ← Uses configLoader ✓
├── server.js                     ← Uses configLoader ✓
├── app.js                        ← Uses configLoader ✓
└── middleware/                   ← All updated to use configLoader ✓
    ├── api/
    ├── auth/
    ├── error/
    └── contract/
```

## 🔑 Configuration Modules

### Database Configuration

```javascript
import config from './config/configLoader.js'

config.database.url // SUPABASE_URL
config.database.key // Service role or anon key
config.database.anonKey // SUPABASE_ANON_KEY
config.database.serviceRoleKey // SUPABASE_SERVICE_ROLE_KEY
config.database.options // Client options
```

### Server Configuration

```javascript
config.server.port // PORT (default: 3000)
config.server.host // HOST (default: localhost)
config.server.cors.allowedOrigins.credentials.methods // CORS settings
```

### Security Configuration

```javascript
config.security.jwt.secret.expiryTime.refreshExpiryTime // JWT settings // JWT_SECRET // JWT_EXPIRY (default: 7d) // JWT_REFRESH_EXPIRY (default: 30d)

config.security.bcrypt.rounds // Bcrypt settings // BCRYPT_ROUNDS (default: 12)

config.security.rateLimit.windowMs.maxRequests.message // Rate limiting settings // RATE_LIMIT_WINDOW (default: 15min) // RATE_LIMIT_MAX (default: 100) // Error message

config.security.session.secret.maxAge // Session settings // SESSION_SECRET // SESSION_MAX_AGE (default: 24h)
```

### Frontend Configuration

```javascript
config.frontend.url // FRONTEND_URL
config.frontend.domain // CUSTOM_DOMAIN
```

### Upload Configuration

```javascript
config.upload.maxSize // UPLOAD_MAX_SIZE (default: 5MB)
config.upload.allowedTypes // UPLOAD_ALLOWED_TYPES
config.upload.storage.bucket.publicUrl // Storage settings // STORAGE_BUCKET // STORAGE_PUBLIC_URL
```

### Cache Configuration

```javascript
config.cache.defaultTtl // CACHE_DEFAULT_TTL (default: 300s)
config.cache.maxKeys // CACHE_MAX_KEYS (default: 1000)
```

### Email Configuration (Optional)

```javascript
config.email.provider // EMAIL_PROVIDER
config.email.from // EMAIL_FROM
config.email.smtp.host.port.secure.auth // EMAIL_SMTP settings // EMAIL_SMTP_HOST // EMAIL_SMTP_PORT // EMAIL_SMTP_SECURE // Authentication settings
```

### Payment Configuration (Optional)

```javascript
config.payment.provider // PAYMENT_PROVIDER
config.payment.currency // PAYMENT_CURRENCY (default: USD)
config.payment.defaultCurrencyRate // DEFAULT_CURRENCY_RATE (default: 40)
```

### Monitoring Configuration

```javascript
config.monitoring.enabled // MONITORING_ENABLED
config.monitoring.sentryDsn // SENTRY_DSN
config.monitoring.datadogApiKey // DATADOG_API_KEY
```

### Business Rules

```javascript
config.business.maxOrderItems // MAX_ORDER_ITEMS (default: 50)
config.business.minOrderAmount // MIN_ORDER_AMOUNT (default: 10.00)
config.business.supportEmail // SUPPORT_EMAIL
config.business.companyName // COMPANY_NAME (default: FloresYa)
```

### Feature Flags

```javascript
config.features.registrationEnabled // FEATURE_REGISTRATION
config.features.emailVerificationRequired // FEATURE_EMAIL_VERIFICATION
config.features.passwordResetEnabled // FEATURE_PASSWORD_RESET
config.features.adminPanelEnabled // FEATURE_ADMIN_PANEL
config.features.apiDocumentationEnabled // FEATURE_API_DOCS
```

### Environment Detection

```javascript
config.NODE_ENV // NODE_ENV (development/production/test)
config.IS_PRODUCTION // true if NODE_ENV === 'production'
config.IS_DEVELOPMENT // true if NODE_ENV === 'development'
config.IS_TEST // true if NODE_ENV === 'test'
config.LOG_LEVEL // LOG_LEVEL (default: info)
```

## 🚀 Usage Examples

### In Controllers

```javascript
import config from '../config/configLoader.js'

export const getProducts = async (req, res) => {
  // Use configuration
  const limit = req.query.limit || 10
  const products = await productService.getAll({ limit })

  // Check environment
  if (config.IS_DEVELOPMENT) {
    console.log('Debug mode enabled')
  }

  res.json({ success: true, data: products })
}
```

### In Services

```javascript
import config from '../config/configLoader.js'
import { supabase } from './supabaseClient.js'

export const createProduct = async productData => {
  // Validation with configuration
  if (!productData.name) {
    throw new ValidationError('Name is required')
  }

  // Database operation
  const { data, error } = await supabase.from('products').insert(productData)

  if (error) throw error

  return data
}
```

### In Middleware

```javascript
import config from '../config/configLoader.js'

export const rateLimiter = (req, res, next) => {
  // Use rate limit config
  const maxRequests = config.security.rateLimit.maxRequests
  const windowMs = config.security.rateLimit.windowMs

  // Implementation...
}
```

## 📝 Environment Variables

### Required Variables

```bash
# Database (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Server
NODE_ENV=development|production|test
PORT=3000
```

### Optional Variables

```bash
# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000

# Email
EMAIL_PROVIDER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email
EMAIL_SMTP_PASS=your-password

# Payment
PAYMENT_PROVIDER=stripe
PAYMENT_CURRENCY=USD
DEFAULT_CURRENCY_RATE=40

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key

# Business Rules
MAX_ORDER_ITEMS=50
MIN_ORDER_AMOUNT=10.00
SUPPORT_EMAIL=support@floresya.com
COMPANY_NAME=FloresYa

# Feature Flags
FEATURE_REGISTRATION=true
FEATURE_EMAIL_VERIFICATION=true
FEATURE_PASSWORD_RESET=true
FEATURE_ADMIN_PANEL=true
FEATURE_API_DOCS=true
```

## ✅ Migration Status

### Files Updated (9/9)

| File                                             | Status     | Description                                                    |
| ------------------------------------------------ | ---------- | -------------------------------------------------------------- |
| `api/services/supabaseClient.js`                 | ✅ Updated | Uses `config.database.*`                                       |
| `api/server.js`                                  | ✅ Updated | Uses `config.server.port`                                      |
| `api/app.js`                                     | ✅ Updated | Uses `config.security.rateLimit.*` and `config.IS_DEVELOPMENT` |
| `api/middleware/api/openapiValidator.js`         | ✅ Updated | Uses `config.IS_DEVELOPMENT`                                   |
| `api/middleware/api/enhancedOpenApiValidator.js` | ✅ Updated | Uses `config.IS_DEVELOPMENT`                                   |
| `api/middleware/error/errorHandler.js`           | ✅ Updated | Uses `config.IS_DEVELOPMENT`                                   |
| `api/middleware/auth/auth.js`                    | ✅ Updated | Uses `config.IS_DEVELOPMENT`                                   |
| `api/middleware/auth/sessionSecurity.js`         | ✅ Updated | Uses `config.security.session.*` and `config.IS_PRODUCTION`    |
| `api/contract/divergenceDetector.js`             | ✅ Updated | Uses `config.IS_TEST`                                          |
| `api/contract/contractEnforcement.js`            | ✅ Updated | Uses `config.IS_TEST` and `config.IS_DEVELOPMENT`              |
| `api/contract/documentationSync.js`              | ✅ Updated | Uses `config.IS_DEVELOPMENT`                                   |

### Before (Scattered)

```javascript
// supabaseClient.js
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// server.js
const PORT = process.env.PORT || 3000

// app.js
const isDevelopment = process.env.NODE_ENV !== 'production'
max: process.env.NODE_ENV === 'production' ? 500 : 1000

// middleware files
const isDevelopment = process.env.NODE_ENV === 'development'
```

### After (Centralized)

```javascript
// supabaseClient.js
import config from './config/configLoader.js'
const supabaseUrl = config.database.url
const supabaseKey = config.database.key

// server.js
import config from './config/configLoader.js'
const PORT = config.server.port

// app.js
import config from './config/configLoader.js'
const isDevelopment = config.IS_DEVELOPMENT
max: config.security.rateLimit.maxRequests

// middleware files
import config from '../config/configLoader.js'
const isDevelopment = config.IS_DEVELOPMENT
```

## 🔍 Validation

The configLoader includes built-in validation:

### Automatic Validation on Load

```javascript
// Validates required database configuration
if (!config.database.url) {
  throw new ConfigurationError('SUPABASE_URL is required')
}

if (!config.database.key) {
  throw new ConfigurationError('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required')
}

// Validates security in production
if (config.IS_PRODUCTION) {
  if (!config.security.jwt.secret) {
    throw new ConfigurationError('JWT_SECRET is required in production')
  }
}
```

### Manual Validation

```javascript
import config from './config/configLoader.js'
import { getConfig } from './config/configLoader.js'

// Get full config
const fullConfig = config

// Get specific module
const dbConfig = getConfig('database')
const serverConfig = getConfig('server')
```

## 🧪 Testing

### In Tests

```javascript
import config from '../api/config/configLoader.js'

describe('Product Service', () => {
  test('should work with config', () => {
    expect(config.database.url).toBeDefined()
    expect(config.server.port).toBeGreaterThan(0)
  })
})
```

### Mocking in Tests

```javascript
vi.mock('../api/config/configLoader.js', () => ({
  default: {
    NODE_ENV: 'test',
    IS_TEST: true,
    database: {
      url: 'test-url',
      key: 'test-key'
    }
  }
}))
```

## 🛠️ Adding New Configuration

### 1. Add to configLoader.js

```javascript
const config = {
  // ... existing config

  // New module
  newModule: {
    setting1: getEnvVar('NEW_SETTING1'),
    setting2: parseInteger(process.env.NEW_SETTING2, 100),
    setting3: parseBoolean(process.env.NEW_SETTING3, false)
  }
}
```

### 2. Add Environment Variables

```bash
# In .env.local
NEW_SETTING1=value1
NEW_SETTING2=200
NEW_SETTING3=true
```

### 3. Use in Code

```javascript
import config from './config/configLoader.js'

// Access configuration
const value = config.newModule.setting1
```

## 📊 Configuration Statistics

- **Total Configuration Modules**: 11
- **Total Environment Variables Supported**: 50+
- **Files Updated**: 11
- **Lines of Configuration Code**: 307
- **Validation Functions**: 4 (getEnvVar, parseBoolean, parseInteger, parseArray)

## 🎯 Best Practices

### ✅ DO

- Use `config.IS_DEVELOPMENT` instead of `process.env.NODE_ENV === 'development'`
- Use `config.IS_PRODUCTION` instead of `process.env.NODE_ENV === 'production'`
- Use `config.IS_TEST` instead of `process.env.NODE_ENV === 'test'`
- Access database config via `config.database.*`
- Access security config via `config.security.*`
- Validate required env vars in configLoader

### ❌ DON'T

- Use `process.env.*` directly in application code
- Mix config sources (some from process.env, some from config)
- Hardcode configuration values
- Forget to add environment variables to `.env.local`
- Use configLoader in test files (mock it instead)

## 🔐 Security Notes

- **Production Requirements**: JWT_SECRET and SESSION_SECRET are required in production
- **Validation**: All configuration is validated on startup
- **Fail-Fast**: Application won't start with invalid configuration
- **Frozen Objects**: Configuration objects are frozen to prevent modifications

## 📚 Related Files

- `api/config/configLoader.js` - Centralized configuration module
- `.env.local` - Environment variables file
- `api/services/supabaseClient.js` - Database client (uses config)
- `api/server.js` - Server entry point (uses config)
- `api/app.js` - Express app (uses config)

## 🆘 Troubleshooting

### Configuration Error

```
ConfigurationError: Missing required environment variable: SUPABASE_URL
```

**Solution**: Add SUPABASE_URL to `.env.local`

### Validation Error

```
ConfigurationError: Configuration validation failed
```

**Solution**: Check `.env.local` for missing required variables

### Import Error

```
Cannot resolve module './config/configLoader.js'
```

**Solution**: Check file path is correct relative to current file

## 📈 Future Enhancements

- [ ] Add configuration hot-reload in development
- [ ] Support configuration profiles (dev, staging, prod)
- [ ] Add configuration migration tools
- [ ] Support configuration from remote source
- [ ] Add configuration change webhooks

---

**Status**: ✅ **COMPLETE** - Configuration fully centralized
**Last Updated**: 2025-10-31
**Maintained By**: Architecture Team
