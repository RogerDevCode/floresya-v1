/**
 * Centralized Configuration Loader
 * Loads and validates all environment variables and configuration settings
 * Ensures application starts with valid configuration
 *
 * Usage:
 * import config from './configLoader.js'
 * console.log(config.database.url)
 */

import { ConfigurationError } from '../errors/AppError.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local in development
const IS_VERCEL = process.env.VERCEL === '1'
if (!IS_VERCEL) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  dotenv.config({ path: join(__dirname, '../../.env.local') })
}

/**
 * Get environment variable with validation
 */
function getEnvVar(name, required = true, defaultValue = null) {
  const value = process.env[name] || defaultValue

  if (required && !value) {
    throw new ConfigurationError(`Missing required environment variable: ${name}`, {
      variable: name,
      required: true
    })
  }

  return value
}

/**
 * Parse boolean environment variable
 */
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue
  }
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Parse integer environment variable
 */
function parseInteger(value, defaultValue, min = null, max = null) {
  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    return defaultValue
  }

  if (min !== null && parsed < min) {
    throw new ConfigurationError(`Value ${parsed} is below minimum ${min}`, {
      variable: value,
      min
    })
  }

  if (max !== null && parsed > max) {
    throw new ConfigurationError(`Value ${parsed} is above maximum ${max}`, {
      variable: value,
      max
    })
  }

  return parsed
}

/**
 * Parse array environment variable (comma-separated)
 */
function parseArray(value, defaultValue = []) {
  if (!value) {
    return defaultValue
  }
  return value
    .split(',')
    .map(item => item.trim())
    .filter(item => item)
}

/**
 * Centralized configuration object
 */
const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database Configuration
  database: {
    url: getEnvVar('SUPABASE_URL'),
    key: getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('SUPABASE_ANON_KEY'),
    anonKey: getEnvVar('SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
    options: {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  },

  // Server Configuration
  server: {
    port: parseInteger(process.env.PORT, 3000, 1, 65535),
    host: process.env.HOST || 'localhost',
    cors: {
      allowedOrigins: parseArray(process.env.ALLOWED_ORIGINS, [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ]),
      credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
      methods: parseArray(process.env.CORS_METHODS, [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
      ])
    }
  },

  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    domain: process.env.CUSTOM_DOMAIN || 'floresya-v1.vercel.app'
  },

  // Security Configuration
  security: {
    jwt: {
      secret: getEnvVar('JWT_SECRET', false), // Optional for development
      expiryTime: process.env.JWT_EXPIRY || '7d',
      refreshExpiryTime: process.env.JWT_REFRESH_EXPIRY || '30d'
    },
    bcrypt: {
      rounds: parseInteger(process.env.BCRYPT_ROUNDS, 12, 10, 15)
    },
    rateLimit: {
      windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW, 15 * 60 * 1000, 60 * 1000), // 15 minutes
      maxRequests: parseInteger(process.env.RATE_LIMIT_MAX, 100, 10, 1000),
      message: 'Too many requests from this IP, please try again later.'
    },
    session: {
      secret: getEnvVar('SESSION_SECRET', false), // Optional
      maxAge: parseInteger(process.env.SESSION_MAX_AGE, 24 * 60 * 60 * 1000, 60 * 60 * 1000) // 24 hours
    }
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInteger(process.env.UPLOAD_MAX_SIZE, 5 * 1024 * 1024, 1024 * 1024), // 5MB
    allowedTypes: parseArray(process.env.UPLOAD_ALLOWED_TYPES, [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]),
    storage: {
      bucket: process.env.STORAGE_BUCKET || 'uploads',
      publicUrl: process.env.STORAGE_PUBLIC_URL
    }
  },

  // Cache Configuration
  cache: {
    defaultTtl: parseInteger(process.env.CACHE_DEFAULT_TTL, 300, 60), // 5 minutes
    maxKeys: parseInteger(process.env.CACHE_MAX_KEYS, 1000, 100)
  },

  // Email Configuration (Optional)
  email: {
    provider: process.env.EMAIL_PROVIDER || null,
    from: process.env.EMAIL_FROM || 'noreply@floresya.com',
    smtp: process.env.EMAIL_SMTP
      ? {
          host: process.env.EMAIL_SMTP_HOST,
          port: parseInteger(process.env.EMAIL_SMTP_PORT, 587, 1, 65535),
          secure: parseBoolean(process.env.EMAIL_SMTP_SECURE, false),
          auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS
          }
        }
      : null
  },

  // Payment Configuration (Optional)
  payment: {
    provider: process.env.PAYMENT_PROVIDER || null,
    currency: process.env.PAYMENT_CURRENCY || 'USD',
    defaultCurrencyRate: parseFloat(process.env.DEFAULT_CURRENCY_RATE || '40')
  },

  // Monitoring & Logging
  monitoring: {
    enabled: parseBoolean(process.env.MONITORING_ENABLED, false),
    sentryDsn: process.env.SENTRY_DSN || null,
    datadogApiKey: process.env.DATADOG_API_KEY || null
  },

  // Business Rules
  business: {
    maxOrderItems: parseInteger(process.env.MAX_ORDER_ITEMS, 50, 1, 100),
    minOrderAmount: parseFloat(process.env.MIN_ORDER_AMOUNT || '10.00'),
    defaultCurrencyRate: parseFloat(process.env.DEFAULT_CURRENCY_RATE || '40'),
    supportEmail: process.env.SUPPORT_EMAIL || 'support@floresya.com',
    companyName: process.env.COMPANY_NAME || 'FloresYa'
  },

  // Feature Flags
  features: {
    registrationEnabled: parseBoolean(process.env.FEATURE_REGISTRATION, true),
    emailVerificationRequired: parseBoolean(process.env.FEATURE_EMAIL_VERIFICATION, true),
    passwordResetEnabled: parseBoolean(process.env.FEATURE_PASSWORD_RESET, true),
    adminPanelEnabled: parseBoolean(process.env.FEATURE_ADMIN_PANEL, true),
    apiDocumentationEnabled: parseBoolean(process.env.FEATURE_API_DOCS, true)
  }
}

// Validate critical configuration
function validateConfig() {
  const errors = []

  // Check required database configuration
  if (!config.database.url) {
    errors.push('SUPABASE_URL is required')
  }

  if (!config.database.key) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required')
  }

  // Check security configuration
  if (config.IS_PRODUCTION) {
    if (!config.security.jwt.secret) {
      errors.push('JWT_SECRET is required in production')
    }

    if (!config.security.session.secret) {
      errors.push('SESSION_SECRET is required in production')
    }
  }

  // Check payment configuration if payment is enabled
  if (config.payment.provider && !config.payment.defaultCurrencyRate) {
    errors.push('DEFAULT_CURRENCY_RATE is required when payment provider is configured')
  }

  if (errors.length > 0) {
    throw new ConfigurationError('Configuration validation failed', {
      errors,
      nodeEnv: config.NODE_ENV
    })
  }
}

// Validate on load
try {
  validateConfig()
} catch (error) {
  console.error('Configuration validation error:', error)
  // Don't throw in test environment to allow tests to run
  if (config.NODE_ENV !== 'test') {
    throw error
  }
}

// Freeze configuration to prevent accidental modifications
Object.freeze(config)
Object.freeze(config.database)
Object.freeze(config.server)
Object.freeze(config.security)
Object.freeze(config.upload)
Object.freeze(config.cache)
Object.freeze(config.monitoring)
Object.freeze(config.business)
Object.freeze(config.features)

/**
 * Get configuration for a specific module
 */
export function getConfig(module) {
  if (!config[module]) {
    throw new ConfigurationError(`Configuration module "${module}" not found`, {
      module,
      availableModules: Object.keys(config)
    })
  }
  return config[module]
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature) {
  return config.features[feature] === true
}

/**
 * Get environment variable with config
 */
export function getEnv(name, defaultValue = null) {
  return process.env[name] || defaultValue
}

export { config }
export default config
