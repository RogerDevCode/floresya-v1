/**
 * Server Entry Point
 * Starts the Express server (local) or exports app (Vercel)
 *
 * Uses centralized configuration from configLoader
 */

import config from './config/configLoader.js'
import app from './app.js'
import { log as logger } from './utils/logger.js'

const PORT = config.server.port
const NODE_ENV = config.NODE_ENV
const IS_VERCEL = process.env.VERCEL === '1'

// Validate required environment variables
if (IS_VERCEL) {
  // In Vercel, validation happens in configLoader
} else {
  // In local development, configLoader already validates
  logger.info(`Starting FloresYa API with centralized configuration`)
}

// Export app for Vercel serverless
export default app

// Start server only in local development
if (!IS_VERCEL && (NODE_ENV !== 'test' || process.env.CI)) {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 FloresYa API running in ${NODE_ENV} mode`)
    logger.info(`🌐 Server listening on port ${PORT}`)
    logger.info(`📊 Health check: http://localhost:${PORT}/health`)
    logger.info(`🔧 Configuration: Centralized via configLoader`)

    // Final confirmation message
    setTimeout(() => {
      console.log(`✅ Servidor iniciado sin problemas en http://localhost:${PORT}`)
    }, 100)
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
}
