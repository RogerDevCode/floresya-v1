/**
 * Procesado por B
 */

/**
 * Enhanced Authentication Middleware with Advanced Security Features
 * Provides production-grade security against authentication attacks
 * Includes JWT hardening, rate limiting, threat detection, and session security
 *
 * CRITICAL: Implements comprehensive authentication security measures
 * - Advanced JWT validation and threat protection
 * - Rate limiting for authentication attempts
 * - Attack vector detection and prevention
 * - Session security enhancements
 * - Security event monitoring and alerting
 */

import { getUser } from '../../services/authService.index.js'
import { UnauthorizedError, ForbiddenError, TooManyRequestsError } from '../../errors/AppError.js'
import { log as logger } from '../../utils/logger.js'
import { IS_DEV, DEV_MOCK_USER, getUserRole } from './auth.helpers.js'
import { ROLE_PERMISSIONS } from '../../config/constants.js'

// Security threat types
const THREAT_TYPES = {
  BRUTE_FORCE: 'BRUTE_FORCE',
  TOKEN_THEFT: 'TOKEN_THEFT',
  SESSION_HIJACKING: 'SESSION_HIJACKING',
  PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  MULTIPLE_INVALID_TOKENS: 'MULTIPLE_INVALID_TOKENS'
}

// Rate limiting configuration
const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { window: 900000, max: 5 }, // 5 attempts per 15 minutes
  TOKEN_VALIDATION: { window: 60000, max: 100 }, // 100 validations per minute
  PASSWORD_RESET: { window: 3600000, max: 3 }, // 3 resets per hour
  SESSION_CREATION: { window: 60000, max: 10 } // 10 sessions per minute
}

// JWT Security Configuration
const JWT_SECURITY = {
  MAX_TOKEN_AGE: 86400, // 24 hours
  LEeway_SECONDS: 300, // 5 minutes clock skew allowance
  REQUIRED_ALGORITHMS: ['HS256'],
  FORBIDDEN_ALGORITHMS: ['none', 'HS384', 'HS512'],
  MIN_TOKEN_LENGTH: 50,
  MAX_TOKEN_LENGTH: 8192
}

// Session security configuration
const SESSION_SECURITY = {
  MAX_CONCURRENT_SESSIONS: 5,
  SESSION_TIMEOUT: 3600000, // 1 hour
  SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  IP_CHANGE_THRESHOLD: 2 // Number of IP changes before flagging
}

/**
 * Security Event Monitoring System
 */
class SecurityEventMonitor {
  constructor() {
    this.events = new Map()
    this.threats = new Map()
    this.suspiciousIPs = new Map()
    this.userSessions = new Map()
  }

  /**
   * Record security event
   */
  recordEvent(type, data) {
    const event = {
      type,
      timestamp: Date.now(),
      ...data
    }

    // Store event
    const key = `${type}:${data.userId || data.ip || 'unknown'}`
    if (!this.events.has(key)) {
      this.events.set(key, [])
    }
    this.events.get(key).push(event)

    // Analyze for threats
    this.analyzeThreats(event)

    // Cleanup old events
    this.cleanupEvents(key)

    return event
  }

  /**
   * Analyze events for security threats
   */
  analyzeThreats(event) {
    const { type, userId, ip } = event

    // Check for brute force attacks
    if (type === 'AUTH_FAILED') {
      this.checkBruteForce(ip, userId)
    }

    // Check for token theft attempts
    if (type === 'INVALID_TOKEN' || type === 'TOKEN_EXPIRED') {
      this.checkTokenTheft(userId, ip)
    }

    // Check for session hijacking
    if (type === 'SUSPICIOUS_ACTIVITY') {
      this.checkSessionHijacking(userId, ip)
    }
  }

  /**
   * Check for brute force attacks
   */
  checkBruteForce(ip, userId) {
    const key = `BRUTE_FORCE:${ip}`
    const events = this.events.get(key) || []
    const recent = events.filter(e => Date.now() - e.timestamp < RATE_LIMITS.LOGIN_ATTEMPTS.window)

    if (recent.length >= RATE_LIMITS.LOGIN_ATTEMPTS.max) {
      this.threats.set(`${key}:${Date.now()}`, {
        type: THREAT_TYPES.BRUTE_FORCE,
        severity: 'HIGH',
        ip,
        userId,
        attempts: recent.length,
        window: RATE_LIMITS.LOGIN_ATTEMPTS.window
      })

      logger.warn('BRUTE FORCE ATTACK DETECTED', {
        ip,
        userId,
        attempts: recent.length,
        window: RATE_LIMITS.LOGIN_ATTEMPTS.window
      })
    }
  }

  /**
   * Check for token theft attempts
   */
  checkTokenTheft(userId, ip) {
    if (!userId) {
      return
    }

    const key = `TOKEN_THEFT:${userId}`
    const events = this.events.get(key) || []
    const recent = events.filter(e => Date.now() - e.timestamp < 300000) // Last 5 minutes

    if (recent.length >= 10) {
      this.threats.set(`${key}:${Date.now()}`, {
        type: THREAT_TYPES.TOKEN_THEFT,
        severity: 'CRITICAL',
        userId,
        ip,
        attempts: recent.length
      })

      logger.error('POTENTIAL TOKEN THEFT DETECTED', {
        userId,
        ip,
        attempts: recent.length
      })
    }
  }

  /**
   * Check for session hijacking
   */
  checkSessionHijacking(userId, ip) {
    if (!userId) {
      return
    }

    const userEvents = this.events.get(`SESSION:${userId}`) || []
    const recent = userEvents.filter(e => Date.now() - e.timestamp < 60000) // Last minute

    const uniqueIPs = new Set(recent.map(e => e.ip))
    if (uniqueIPs.size >= SESSION_SECURITY.IP_CHANGE_THRESHOLD) {
      this.threats.set(`SESSION_HIJACK:${userId}:${Date.now()}`, {
        type: THREAT_TYPES.SESSION_HIJACKING,
        severity: 'HIGH',
        userId,
        ipChanges: uniqueIPs.size,
        recentEvents: recent.length
      })

      logger.warn('POTENTIAL SESSION HIJACKING DETECTED', {
        userId,
        ipChanges: uniqueIPs.size,
        ips: Array.from(uniqueIPs)
      })
    }
  }

  /**
   * Check if IP is suspicious
   */
  isSuspiciousIP(ip) {
    const suspicious = this.suspiciousIPs.get(ip)
    return suspicious && Date.now() - suspicious.timestamp < 3600000 // 1 hour
  }

  /**
   * Mark IP as suspicious
   */
  markSuspiciousIP(ip, reason) {
    this.suspiciousIPs.set(ip, {
      timestamp: Date.now(),
      reason,
      violations: (this.suspiciousIPs.get(ip)?.violations || 0) + 1
    })
  }

  /**
   * Get security metrics
   */
  getMetrics() {
    return {
      totalEvents: Array.from(this.events.values()).reduce((sum, events) => sum + events.length, 0),
      activeThreats: this.threats.size,
      suspiciousIPs: this.suspiciousIPs.size,
      threatsByType: this.getThreatDistribution()
    }
  }

  /**
   * Get threat distribution
   */
  getThreatDistribution() {
    const distribution = {}
    for (const threat of this.threats.values()) {
      distribution[threat.type] = (distribution[threat.type] || 0) + 1
    }
    return distribution
  }

  /**
   * Cleanup old events
   */
  cleanupEvents(key) {
    const events = this.events.get(key) || []
    const recent = events.filter(e => Date.now() - e.timestamp < 3600000) // 1 hour

    if (recent.length === 0) {
      this.events.delete(key)
    } else {
      this.events.set(key, recent)
    }
  }
}

// Global security monitor instance
const securityMonitor = new SecurityEventMonitor()

/**
 * Advanced JWT Validator with threat protection
 */
class AdvancedJWTValidator {
  /**
   * Validate JWT with enhanced security checks
   */
  static validateJWT(token, req) {
    // Basic validation
    if (!token) {
      throw new UnauthorizedError('Authentication token required')
    }

    // Length validation
    if (
      token.length < JWT_SECURITY.MIN_TOKEN_LENGTH ||
      token.length > JWT_SECURITY.MAX_TOKEN_LENGTH
    ) {
      securityMonitor.recordEvent('INVALID_TOKEN', {
        ip: req.ip,
        reason: 'Invalid token length',
        userId: req.user?.id
      })
      throw new UnauthorizedError('Invalid authentication token format')
    }

    // Pattern validation (JWT should have 3 parts separated by dots)
    const parts = token.split('.')
    if (parts.length !== 3) {
      securityMonitor.recordEvent('INVALID_TOKEN', {
        ip: req.ip,
        reason: 'Invalid JWT structure',
        userId: req.user?.id
      })
      throw new UnauthorizedError('Invalid authentication token structure')
    }

    // Suspicious pattern detection
    if (this.hasSuspiciousPatterns(token)) {
      securityMonitor.recordEvent('SUSPICIOUS_ACTIVITY', {
        ip: req.ip,
        reason: 'Suspicious token patterns detected',
        userId: req.user?.id
      })
      throw new UnauthorizedError('Suspicious authentication patterns detected')
    }

    return true
  }

  /**
   * Check for suspicious patterns in token
   */
  static hasSuspiciousPatterns(token) {
    const suspiciousPatterns = [
      /[<>'"&]/, // XSS patterns
      /script|javascript|vbscript/i, // Script injection
      /union|select|insert|delete|update/i, // SQL injection patterns
      /\.\./, // Path traversal
      /eval\(|exec\(|system\(/i // Code execution
    ]

    return suspiciousPatterns.some(pattern => pattern.test(token))
  }

  /**
   * Validate token claims
   */
  static validateClaims(payload, req) {
    const now = Math.floor(Date.now() / 1000)

    // Check expiration
    if (payload.exp && payload.exp < now - JWT_SECURITY.LEeway_SECONDS) {
      securityMonitor.recordEvent('TOKEN_EXPIRED', {
        ip: req.ip,
        userId: payload.sub || payload.user_id,
        expiredAt: new Date(payload.exp * 1000).toISOString()
      })
      throw new UnauthorizedError('Authentication token expired')
    }

    // Check not before
    if (payload.nbf && payload.nbf > now + JWT_SECURITY.LEeway_SECONDS) {
      throw new UnauthorizedError('Authentication token not yet valid')
    }

    // Validate issuer if present
    if (payload.iss && payload.iss !== 'supabase') {
      securityMonitor.recordEvent('INVALID_TOKEN', {
        ip: req.ip,
        reason: 'Invalid token issuer',
        userId: payload.sub || payload.user_id
      })
      throw new UnauthorizedError('Invalid authentication token issuer')
    }

    return true
  }
}

/**
 * Rate Limiter for authentication attempts
 */
class AuthRateLimiter {
  constructor() {
    this.attempts = new Map()
  }

  /**
   * Check rate limit for specific operation
   */
  checkLimit(key, limitConfig) {
    const now = Date.now()
    const windowStart = now - limitConfig.window

    if (!this.attempts.has(key)) {
      this.attempts.set(key, [])
    }

    const userAttempts = this.attempts.get(key)

    // Remove old attempts outside window
    const recentAttempts = userAttempts.filter(timestamp => timestamp > windowStart)

    if (recentAttempts.length >= limitConfig.max) {
      return false
    }

    // Record this attempt
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)

    return true
  }

  /**
   * Reset rate limit for key
   */
  reset(key) {
    this.attempts.delete(key)
  }
}

// Global rate limiter instance
const authRateLimiter = new AuthRateLimiter()

/**
 * Enhanced Authenticate user with advanced security features
 * - Development: Use authService (allows test mocking)
 * - Test Mode: Use authService mocks directly
 * - Production: Enhanced JWT verification with threat protection
 */
export async function authenticate(req, res, next) {
  const startTime = Date.now()
  let user = null

  try {
    // DEVELOPMENT MODE: Use authService (allows proper test mocking)
    if (IS_DEV && process.env.NODE_ENV !== 'test') {
      logger.debug('🔍 AUTH MIDDLEWARE - Development mode, using authService')
      req.user = DEV_MOCK_USER
      req.token = 'dev-mock-token'
      logger.info('🔓 DEV MODE: Auto-authenticated', {
        email: DEV_MOCK_USER.email,
        role: DEV_MOCK_USER.user_metadata.role
      })
      return next()
    }

    // Rate limiting check for token validation
    const rateLimitKey = `token_validation:${req.ip}`
    if (!authRateLimiter.checkLimit(rateLimitKey, RATE_LIMITS.TOKEN_VALIDATION)) {
      securityMonitor.recordEvent('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        type: 'TOKEN_VALIDATION',
        path: req.path
      })
      throw new TooManyRequestsError('Too many token validation attempts. Please try again later.')
    }

    // Check if IP is flagged as suspicious
    if (securityMonitor.isSuspiciousIP(req.ip)) {
      securityMonitor.recordEvent('SUSPICIOUS_IP_ACCESS', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('user-agent')
      })
      throw new UnauthorizedError('Access denied: suspicious activity detected')
    }

    // PRODUCTION MODE: Enhanced JWT verification
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      securityMonitor.recordEvent('AUTH_FAILED', {
        ip: req.ip,
        reason: 'No token provided',
        path: req.path,
        method: req.method
      })

      logger.warn('Authentication failed: No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip
      })
      throw new UnauthorizedError('Authentication required: No token provided', {
        path: req.path,
        hasAuthHeader: !!authHeader
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Enhanced JWT validation
    try {
      AdvancedJWTValidator.validateJWT(token, req)
    } catch (jwtError) {
      securityMonitor.recordEvent('INVALID_TOKEN', {
        ip: req.ip,
        reason: jwtError.message,
        path: req.path,
        tokenLength: token.length
      })
      throw jwtError
    }

    // Verify token with Supabase (enhanced error handling)
    try {
      user = await getUser(token)
    } catch (supabaseError) {
      // Record authentication failure
      securityMonitor.recordEvent('AUTH_FAILED', {
        ip: req.ip,
        reason: supabaseError.message,
        path: req.path,
        method: req.method
      })

      // Enhanced error classification
      if (supabaseError.message?.includes('Invalid JWT')) {
        securityMonitor.recordEvent('INVALID_TOKEN', {
          ip: req.ip,
          reason: 'Supabase JWT validation failed',
          path: req.path
        })
      } else if (supabaseError.message?.includes('expired')) {
        securityMonitor.recordEvent('TOKEN_EXPIRED', {
          ip: req.ip,
          path: req.path
        })
      }

      throw supabaseError
    }

    // Additional security validations
    if (!user || !user.id) {
      securityMonitor.recordEvent('INVALID_TOKEN', {
        ip: req.ip,
        reason: 'No user data returned',
        path: req.path
      })
      throw new UnauthorizedError('Invalid authentication token: no user data')
    }

    // Enhanced user validation
    const userRole = getUserRole(user)
    if (!userRole) {
      securityMonitor.recordEvent('INVALID_USER', {
        ip: req.ip,
        userId: user.id,
        reason: 'No valid role assigned',
        path: req.path
      })
      throw new UnauthorizedError('Invalid user profile: no role assigned')
    }

    // Session security checks
    const sessionKey = `session:${user.id}`
    const existingSessions = securityMonitor.userSessions.get(sessionKey) || []

    // Check for concurrent session limit
    if (existingSessions.length >= SESSION_SECURITY.MAX_CONCURRENT_SESSIONS) {
      logger.warn('Session limit exceeded', {
        userId: user.id,
        activeSessions: existingSessions.length,
        limit: SESSION_SECURITY.MAX_CONCURRENT_SESSIONS,
        ip: req.ip
      })
    }

    // Record successful authentication
    securityMonitor.recordEvent('AUTH_SUCCESS', {
      ip: req.ip,
      userId: user.id,
      role: userRole,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent')
    })

    // Update session tracking
    const sessionInfo = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      loginTime: Date.now(),
      lastActivity: Date.now()
    }

    existingSessions.push(sessionInfo)
    securityMonitor.userSessions.set(sessionKey, existingSessions)

    // Attach user and token to request
    req.user = user
    req.token = token
    req.sessionInfo = sessionInfo

    // Enhanced logging with security context
    logger.info('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      role: userRole,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      sessionAge: Date.now() - sessionInfo.loginTime,
      activeSessions: existingSessions.length,
      processingTime: Date.now() - startTime
    })

    next()
  } catch (error) {
    const processingTime = Date.now() - startTime

    // Enhanced error logging with security context
    logger.warn('Authentication failed', {
      error: error.message,
      errorType: error.constructor.name,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      processingTime,
      isSecurityError: error.name === 'UnauthorizedError' || error.name === 'TooManyRequestsError'
    })

    // Don't leak user information in error messages
    if (error.name === 'UnauthorizedError' && user) {
      error.message = 'Authentication failed'
    }

    next(error)
  }
}

/**
 * Authorize by role (works in both modes)
 * @param {string|string[]} allowedRoles - Roles allowed to access route
 */
export function authorize(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', { path: req.path }))
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    const userRole = getUserRole(req.user)

    if (!roles.includes(userRole)) {
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      })

      return next(
        new ForbiddenError('Insufficient permissions: role check failed', {
          required: roles,
          current: userRole,
          path: req.path
        })
      )
    }

    logger.info('Authorization granted (role-based)', {
      userId: req.user.id,
      role: userRole,
      path: req.path
    })

    next()
  }
}

/**
 * Authorize by permission (more granular than role-based)
 * @param {string|string[]} allowedPermissions - Permissions required to access route
 */
export function authorizeByPermission(allowedPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', { path: req.path }))
    }
    const userRole = getUserRole(req.user)
    const userPermissions = ROLE_PERMISSIONS[userRole] || []

    const requiredPermissions = Array.isArray(allowedPermissions)
      ? allowedPermissions
      : [allowedPermissions]

    // Check if user has all required permissions
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        email: req.user.email,
        role: userRole,
        requiredPermissions,
        userPermissions,
        path: req.path,
        method: req.method
      })

      return next(
        new ForbiddenError('Insufficient permissions: permission check failed', {
          required: requiredPermissions,
          userRole,
          path: req.path
        })
      )
    }

    logger.info('Authorization granted (permission-based)', {
      userId: req.user.id,
      role: userRole,
      permissions: requiredPermissions,
      path: req.path
    })

    next()
  }
}

/**
 * Require email verification (PRODUCTION ONLY)
 * In development, this is bypassed
 */
export function requireEmailVerified(req, res, next) {
  // DEVELOPMENT MODE: Skip email verification
  if (IS_DEV) {
    return next()
  }

  // PRODUCTION MODE: Check email confirmation
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required', {}))
  }

  if (!req.user.email_confirmed_at) {
    return next(
      new ForbiddenError('Email verification required', {
        email: req.user.email
      })
    )
  }

  next()
}

/**
 * Optional authentication (works in both modes)
 * Attaches user if token is present, but doesn't fail if missing
 */
export async function optionalAuth(req, res, next) {
  // DEVELOPMENT MODE: Auto-inject mock user
  if (IS_DEV) {
    req.user = DEV_MOCK_USER
    req.token = 'dev-mock-token'
    return next()
  }

  // PRODUCTION MODE: Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const user = await getUser(token)
    req.user = user
    req.token = token
  } catch {
    // Silently fail for optional auth
    logger.debug('Optional auth failed')
  }
  next()
}

/**
 * Check if authenticated user is owner of resource
 * @param {Function} getResourceOwnerId - Function that extracts owner ID from request
 */
export function checkOwnership(getResourceOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', {}))
    }

    // Admin bypass (works in both modes)
    const userRole = req.user.user_metadata?.role || req.user?.role || 'user'
    if (userRole === 'admin') {
      logger.info('Ownership check bypassed (admin)', {
        userId: req.user.id,
        path: req.path
      })
      return next()
    }

    const ownerId = getResourceOwnerId(req)

    if (req.user.id !== ownerId) {
      logger.warn('Ownership check failed', {
        userId: req.user.id,
        resourceOwnerId: ownerId,
        path: req.path
      })

      return next(
        new ForbiddenError('Access denied: not resource owner', {
          userId: req.user.id,
          resourceOwnerId: ownerId
        })
      )
    }

    next()
  }
}
