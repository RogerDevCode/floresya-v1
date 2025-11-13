/**
 * Main Express Application
 * Configures middleware, routes, and error handling
 *
 * Uses centralized configuration from configLoader
 */

import express from 'express'
import swaggerUi from 'swagger-ui-express'
import config from './config/configLoader.js'
import { swaggerSpec } from './config/swagger.js'
import {
  configureCors,
  configureHelmet,
  configureSanitize,
  xssProtection,
  rateLimiterSimple,
  adminAuditLogger
} from './middleware/security/index.js'
import { requestLoggingMiddleware } from './utils/logger.js'
import { errorHandler } from './middleware/error/index.js'
import {
  withDatabaseCircuitBreaker,
  circuitBreakerHealthCheck
} from './middleware/performance/index.js'
import { metricsMiddleware } from './monitoring/metricsCollector.js'
// Conditional import for profiling middleware (not needed in tests)
let profilingMiddleware = null
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  const { profilingMiddleware: pm } = await import('./monitoring/clinicIntegration.js')
  profilingMiddleware = pm
}
import {
  comprehensiveHealthCheck,
  getRecoveryStatus,
  forceRecovery,
  updateRecoveryConfig
} from './recovery/autoRecovery.js'
import { standardResponse, initializeOpenApiValidator } from './middleware/api/index.js'
import { createDivergenceDetectionMiddleware } from './contract/divergenceDetector.js'
import { createDocumentationComplianceMiddleware } from './contract/documentationSync.js'
import {
  configureSecureSession,
  sessionSecurityHeaders,
  validateSession,
  csrfToken,
  validateCsrf
} from './middleware/auth/index.js'
import { NotFoundError } from './errors/AppError.js'
import { initializeDIContainer } from './architecture/di-container.js'

const app = express()

// Initialize DI Container (MUST be first - before any route handlers)
// This registers all repositories and services
initializeDIContainer()

// Import routes after DI container initialization
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import userRoutes from './routes/userRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import paymentMethodRoutes from './routes/paymentMethodRoutes.js'
import occasionRoutes from './routes/occasionRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import adminSettingsRoutes from './routes/admin/settingsRoutes.js'
import migrationRoutes from './routes/migrationRoutes.js'
import healthRoutes from './routes/healthRoutes.js'

// Session security (MUST be before body parsing)
app.use(configureSecureSession())
// CSRF token generation (after session)
app.use(csrfToken)
// Note: sessionSecurityHeaders will be applied after Helmet to override its values
app.use(validateSession)

// Body parsing (MUST be before CSRF validation)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// OpenAPI documentation (before security middleware)
app.get('/api-docs', (req, res) => res.redirect('/api-docs/'))
app.use(
  '/api-docs/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FloresYa API Documentation',
    customfavIcon: '/favicon.ico'
  })
)

// OpenAPI spec JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'Service is running'
  })
})

// Circuit breaker health check
app.get('/health/circuit-breaker', circuitBreakerHealthCheck)

// Metrics endpoints (TODO: Fix imports)
// app.get('/health/metrics', getRealtimeMetrics)
// app.get('/health/metrics/report', getMetricsReport)

// Recovery endpoints
app.get('/health/recovery', getRecoveryStatus)
app.post('/health/recovery/trigger', forceRecovery)
app.put('/health/recovery/config', updateRecoveryConfig)

// Comprehensive health check (replaces basic one)
app.get('/health/comprehensive', comprehensiveHealthCheck)

// Security middleware
app.use(configureCors())
app.use(configureHelmet())
app.use(configureSanitize())
app.use(xssProtection)
// Apply session security headers after Helmet to override its values
app.use(sessionSecurityHeaders)

// Rate limiting (for API routes only)
// More generous limits to support multiple simultaneous requests (carousel, occasions, products, etc.)
app.use(
  '/api',
  rateLimiterSimple({
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.maxRequests
  })
)

// Logging middleware
app.use(requestLoggingMiddleware)

// Cache headers (HTTP caching - replaces Service Worker)
// Note: Cache middleware removed - Redis functionality eliminated

// Circuit breaker for database operations
app.use(withDatabaseCircuitBreaker())

// Metrics collection middleware
app.use(metricsMiddleware)

// Profiling middleware (conditional profiling based on health)
// Skip in test environment
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.use(profilingMiddleware)
}

// CSRF validation for state-changing operations
app.use(validateCsrf)

// Standard response format middleware (antes de rutas API)
app.use(standardResponse)

// Initialize OpenAPI validator (antes de rutas API)
// Valida requests contra esquemas OpenAPI - contrato enforceable
try {
  await initializeOpenApiValidator(app)
  // Add divergence detector middleware
  app.use(createDivergenceDetectionMiddleware())
  // Add documentation compliance middleware
  app.use(createDocumentationComplianceMiddleware())
} catch (error) {
  console.error('❌ Failed to initialize OpenAPI validator:', error)
}

// Serve static files from public directory with custom cache control
// In development: no cache for JS/CSS to facilitate hot reloading
// In production: aggressive caching for immutable assets
const isDevelopment = config.IS_DEVELOPMENT

app.use(
  express.static('public', {
    maxAge: isDevelopment ? 0 : '1y',
    immutable: !isDevelopment,
    setHeaders: (res, path) => {
      // Set correct MIME types
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
      } else if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml')
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png')
      } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg')
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif')
      } else if (path.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon')
      }

      if (isDevelopment) {
        // Development: no cache for JS/CSS, short cache for everything else
        if (/\.(js|css)$/i.test(path)) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
        } else if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate')
        } else {
          res.setHeader('Cache-Control', 'public, max-age=300') // 5 min for images
        }
      } else {
        // Production: aggressive caching
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate')
        } else if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(path)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        } else if (/\.(js|css)$/i.test(path)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      }
    }
  })
)

// Serve admin pages with /admin/ prefix mapping to public/pages/admin/
app.use(
  '/admin',
  express.static('public/pages/admin', {
    maxAge: isDevelopment ? 0 : '1h',
    setHeaders: (res, path) => {
      // Set correct MIME types for admin assets
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8')
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      } else if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml')
      }

      if (isDevelopment) {
        // Development: no cache for HTML/JS/CSS
        if (/\.(js|css)$/i.test(path)) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
          res.setHeader('Pragma', 'no-cache')
        } else if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate')
        }
      } else {
        // Production: moderate caching for admin pages
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate')
        }
      }
    }
  })
)

// Health check routes (before API routes for monitoring)
app.use('/health', healthRoutes)

// Admin audit logging (before admin routes)
app.use(adminAuditLogger)

// API routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/payment-methods', paymentMethodRoutes)
app.use('/api/occasions', occasionRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/admin/settings', adminSettingsRoutes)
app.use('/api/migrations', migrationRoutes)

// 404 handler (MUST be after all routes)
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`))
})

// Global error handler (MUST be last)
app.use(errorHandler)

export default app
