/**
 * Procesado por B
 */

/**
 * Middleware Logger - Uses Centralized Logging System
 * Re-exports the centralized logger from utils/logger.js
 * Ensures consistent logging across all middleware
 *
 * Usage:
 * import { logger, log, requestLoggingMiddleware } from './middleware/logger.js'
 */

export {
  logger,
  requestLoggingMiddleware,
  slowRequestMiddleware,
  errorLoggingMiddleware,
  databaseLoggingMiddleware,
  log
} from '../../utils/logger.js'
