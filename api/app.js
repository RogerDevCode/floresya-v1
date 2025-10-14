/**
 * Main Express Application
 * Configures middleware, routes, and error handling
 */

import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js'
import {
  configureCors,
  configureHelmet,
  configureSanitize,
  xssProtection,
  rateLimiter
} from './middleware/security.js'
import { requestLoggingMiddleware } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import {
  withDatabaseCircuitBreaker,
  circuitBreakerHealthCheck
} from './middleware/circuitBreaker.js'
import {
  metricsMiddleware,
  getMetricsReport,
  getRealtimeMetrics
} from './monitoring/metricsCollector.js'
import {
  comprehensiveHealthCheck,
  getRecoveryStatus,
  forceRecovery,
  updateRecoveryConfig
} from './recovery/autoRecovery.js'
import { standardResponse } from './middleware/responseStandard.js'
import { initializeOpenApiValidator } from './middleware/openapiValidator.js'
import { createDivergenceDetectionMiddleware } from './contract/divergenceDetector.js'
import { createDocumentationComplianceMiddleware } from './contract/documentationSync.js'
import {
  configureSecureSession,
  sessionSecurityHeaders,
  validateSession
} from './middleware/sessionSecurity.js'
import { NotFoundError } from './errors/AppError.js'
import { cacheMiddleware } from './middleware/cache.js'

// Import routes
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import userRoutes from './routes/userRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import occasionRoutes from './routes/occasionRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import adminSettingsRoutes from './routes/admin/settingsRoutes.js'

const app = express()

// Session security (MUST be before body parsing)
app.use(configureSecureSession())
// Note: sessionSecurityHeaders will be applied after Helmet to override its values
app.use(validateSession)

// Body parsing (MUST be before routes)
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

// Metrics endpoints
app.get('/health/metrics', getRealtimeMetrics)
app.get('/health/metrics/report', getMetricsReport)

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
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 500 : 1000 // 500 prod, 1000 dev requests per window
  })
)

// Logging middleware
app.use(requestLoggingMiddleware)

// Cache headers (HTTP caching - replaces Service Worker)
app.use(cacheMiddleware)

// Circuit breaker for database operations
app.use(withDatabaseCircuitBreaker())

// Metrics collection middleware
app.use(metricsMiddleware)

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
app.use(
  express.static('public', {
    maxAge: '1y', // 1 year for immutable assets
    immutable: true,
    setHeaders: (res, path) => {
      // Override for HTML files (1 day cache with revalidation)
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate')
      }
      // Images get long cache
      else if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
      // JS and CSS get long cache
      else if (/\.(js|css)$/i.test(path)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      }
    }
  })
)

// API routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/occasions', occasionRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/admin/settings', adminSettingsRoutes)

// 404 handler (MUST be after all routes)
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`))
})

// Global error handler (MUST be last)
app.use(errorHandler)

export default app
