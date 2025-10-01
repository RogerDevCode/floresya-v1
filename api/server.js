/**
 * Server Entry Point
 * Starts the Express server
 */

import app from './app.js'
import { logger } from './middleware/logger.js'

const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY']
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  process.exit(1)
}

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 FloresYa API running in ${NODE_ENV} mode`)
  logger.info(`🌐 Server listening on port ${PORT}`)
  logger.info(`📊 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
const gracefulShutdown = signal => {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught errors
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export default server
