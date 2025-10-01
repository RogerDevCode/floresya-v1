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
import { requestLogger } from './middleware/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { NotFoundError } from './errors/AppError.js'

// Import routes
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import userRoutes from './routes/userRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import occasionRoutes from './routes/occasionRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'

const app = express()

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

// Security middleware
app.use(configureCors())
app.use(configureHelmet())
app.use(configureSanitize())
app.use(xssProtection)

// Rate limiting (for API routes only)
app.use(
  '/api',
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per window
  })
)

// Logging middleware
app.use(requestLogger)

// Serve static files from public directory
app.use(express.static('public'))

// API routes
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/occasions', occasionRoutes)
app.use('/api/settings', settingsRoutes)

// 404 handler (MUST be after all routes)
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`))
})

// Global error handler (MUST be last)
app.use(errorHandler)

export default app
