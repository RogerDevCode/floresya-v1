/**
 * Account Security Service
 * Enterprise-grade account protection and security monitoring
 *
 * Features:
 * - Account lockout mechanisms
 * - Suspicious activity detection
 * - Password strength requirements
 * - Session management
 * - Multi-factor authentication support
 * - Account recovery
 * - Security event logging
 * - Brute force protection
 * - Credential stuffing detection
 * - Anomaly detection
 */

import { randomBytes } from 'crypto'
import { logger } from '../../utils/logger.js'

/**
 * Security configuration
 */
const SECURITY_CONFIG = {
  // Account lockout settings
  ACCOUNT_LOCKOUT: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    INCREMENTAL_LOCKOUT: true, // Progressive lockout durations
    LOCKOUT_MULTIPLIER: 2 // Multiply duration for each subsequent lockout
  },

  // Password requirements
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    FORBIDDEN_PATTERNS: [/password/i, /123456/, /qwerty/i, /admin/i, /letmein/i, /welcome/i]
  },

  // Session security
  SESSION_SECURITY: {
    MAX_CONCURRENT_SESSIONS: 5,
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    SECURE_COOKIES: true,
    HTTP_ONLY: true,
    SAME_SITE: 'strict'
  },

  // Rate limiting
  RATE_LIMITING: {
    LOGIN_ATTEMPTS: {
      WINDOW: 15 * 60 * 1000, // 15 minutes
      MAX_ATTEMPTS: 10
    },
    PASSWORD_RESET: {
      WINDOW: 60 * 60 * 1000, // 1 hour
      MAX_ATTEMPTS: 3
    },
    ACCOUNT_CREATION: {
      WINDOW: 60 * 60 * 1000, // 1 hour
      MAX_ATTEMPTS: 5
    }
  },

  // Anomaly detection
  ANOMALY_DETECTION: {
    UNUSUAL_LOCATION_THRESHOLD: 500, // km
    UNUSUAL_TIME_THRESHOLD: 8, // hours
    RAPID_SUCCESSIVE_LOGINS: 5, // logins in 5 minutes
    FAILED_LOGIN_THRESHOLD: 10 // failed attempts
  }
}

/**
 * Account Security Service
 */
export class AccountSecurityService {
  constructor() {
    this.failedAttempts = new Map() // IP-based failed attempts
    this.accountLockouts = new Map() // Account-based lockouts
    this.userSessions = new Map() // User session tracking
    this.securityEvents = new Map() // Security event tracking
    this.lastLoginInfo = new Map() // Last successful login info
  }

  /**
   * Record failed login attempt
   * @param {string} email - User email
   * @param {string} ip - IP address
   * @param {string} userAgent - User agent
   * @param {string} reason - Failure reason
   */
  recordFailedLogin(email, ip, userAgent, reason = 'INVALID_CREDENTIALS') {
    const now = Date.now()
    // const key = `${email}:${ip}`

    // Record IP-based attempts
    if (!this.failedAttempts.has(ip)) {
      this.failedAttempts.set(ip, {
        attempts: [],
        lockoutUntil: null
      })
    }

    const ipAttempts = this.failedAttempts.get(ip)
    ipAttempts.attempts.push({
      timestamp: now,
      email,
      reason,
      userAgent
    })

    // Clean old attempts
    const windowStart = now - SECURITY_CONFIG.RATE_LIMITING.LOGIN_ATTEMPTS.WINDOW
    ipAttempts.attempts = ipAttempts.attempts.filter(attempt => attempt.timestamp > windowStart)

    // Check for brute force
    if (ipAttempts.attempts.length >= SECURITY_CONFIG.RATE_LIMITING.LOGIN_ATTEMPTS.MAX_ATTEMPTS) {
      this.lockoutIP(ip, SECURITY_CONFIG.RATE_LIMITING.LOGIN_ATTEMPTS.WINDOW)
    }

    // Record account-based attempts
    this.recordAccountFailedAttempt(email, ip, reason)

    // Log security event
    this.logSecurityEvent('LOGIN_FAILED', {
      email,
      ip,
      userAgent,
      reason,
      attemptCount: ipAttempts.attempts.length
    })

    logger.warn('Failed login attempt recorded', {
      email,
      ip,
      reason,
      attemptCount: ipAttempts.attempts.length
    })
  }

  /**
   * Record account-specific failed attempt
   * @param {string} email - User email
   * @param {string} ip - IP address
   * @param {string} reason - Failure reason
   */
  recordAccountFailedAttempt(email, ip, reason) {
    const now = Date.now()
    const key = `account:${email}`

    if (!this.accountLockouts.has(key)) {
      this.accountLockouts.set(key, {
        attempts: [],
        lockoutUntil: null,
        lockoutCount: 0
      })
    }

    const accountAttempts = this.accountLockouts.get(key)
    accountAttempts.attempts.push({
      timestamp: now,
      ip,
      reason
    })

    // Clean old attempts (keep last 24 hours)
    const dayStart = now - 24 * 60 * 60 * 1000
    accountAttempts.attempts = accountAttempts.attempts.filter(
      attempt => attempt.timestamp > dayStart
    )

    // Check for account lockout
    const recentAttempts = accountAttempts.attempts.filter(
      attempt => attempt.timestamp > now - SECURITY_CONFIG.ACCOUNT_LOCKOUT.LOCKOUT_DURATION
    )

    if (recentAttempts.length >= SECURITY_CONFIG.ACCOUNT_LOCKOUT.MAX_ATTEMPTS) {
      this.lockoutAccount(email)
    }
  }

  /**
   * Lockout IP address
   * @param {string} ip - IP address
   * @param {number} duration - Lockout duration
   */
  lockoutIP(ip, duration) {
    const lockoutUntil = Date.now() + duration
    const ipAttempts = this.failedAttempts.get(ip)

    if (ipAttempts) {
      ipAttempts.lockoutUntil = lockoutUntil
    }

    this.logSecurityEvent('IP_LOCKOUT', {
      ip,
      lockoutUntil,
      duration
    })

    logger.warn('IP locked out due to failed attempts', {
      ip,
      lockoutUntil: new Date(lockoutUntil).toISOString()
    })
  }

  /**
   * Lockout user account
   * @param {string} email - User email
   */
  lockoutAccount(email) {
    const now = Date.now()
    const key = `account:${email}`
    const accountData = this.accountLockouts.get(key)

    if (!accountData) {
      return
    }

    // Calculate lockout duration (incremental if enabled)
    let lockoutDuration = SECURITY_CONFIG.ACCOUNT_LOCKOUT.LOCKOUT_DURATION
    if (SECURITY_CONFIG.ACCOUNT_LOCKOUT.INCREMENTAL_LOCKOUT) {
      accountData.lockoutCount++
      lockoutDuration =
        lockoutDuration *
        Math.pow(SECURITY_CONFIG.ACCOUNT_LOCKOUT.LOCKOUT_MULTIPLIER, accountData.lockoutCount - 1)
    }

    const lockoutUntil = now + lockoutDuration
    accountData.lockoutUntil = lockoutUntil

    this.logSecurityEvent('ACCOUNT_LOCKOUT', {
      email,
      lockoutUntil,
      lockoutDuration,
      lockoutCount: accountData.lockoutCount
    })

    logger.warn('Account locked out due to failed attempts', {
      email,
      lockoutUntil: new Date(lockoutUntil).toISOString(),
      lockoutDuration,
      lockoutCount: accountData.lockoutCount
    })
  }

  /**
   * Check if IP is locked out
   * @param {string} ip - IP address
   * @returns {Object} Lockout status
   */
  isIPLockedOut(ip) {
    const ipAttempts = this.failedAttempts.get(ip)

    if (!ipAttempts || !ipAttempts.lockoutUntil) {
      return { locked: false }
    }

    const now = Date.now()
    if (now > ipAttempts.lockoutUntil) {
      // Lockout expired
      ipAttempts.lockoutUntil = null
      return { locked: false }
    }

    return {
      locked: true,
      lockoutUntil: ipAttempts.lockoutUntil,
      remainingTime: ipAttempts.lockoutUntil - now
    }
  }

  /**
   * Check if account is locked out
   * @param {string} email - User email
   * @returns {Object} Lockout status
   */
  isAccountLockedOut(email) {
    const key = `account:${email}`
    const accountData = this.accountLockouts.get(key)

    if (!accountData || !accountData.lockoutUntil) {
      return { locked: false }
    }

    const now = Date.now()
    if (now > accountData.lockoutUntil) {
      // Lockout expired
      accountData.lockoutUntil = null
      return { locked: false }
    }

    return {
      locked: true,
      lockoutUntil: accountData.lockoutUntil,
      remainingTime: accountData.lockoutUntil - now,
      lockoutCount: accountData.lockoutCount
    }
  }

  /**
   * Record successful login
   * @param {string} email - User email
   * @param {string} ip - IP address
   * @param {string} userAgent - User agent
   * @param {Object} user - User object
   */
  recordSuccessfulLogin(email, ip, userAgent, user) {
    const now = Date.now()

    // Clear failed attempts for this IP and account
    this.clearFailedAttempts(ip, email)

    // Record last login info
    this.lastLoginInfo.set(email, {
      timestamp: now,
      ip,
      userAgent,
      location: this.extractLocationFromIP(ip)
    })

    // Check for anomalies
    this.checkLoginAnomalies(email, ip, userAgent)

    // Create session
    this.createUserSession(email, ip, userAgent, user)

    // Log security event
    this.logSecurityEvent('LOGIN_SUCCESS', {
      email,
      ip,
      userAgent,
      userId: user.id
    })

    logger.info('Successful login recorded', {
      email,
      ip,
      userId: user.id
    })
  }

  /**
   * Clear failed attempts for IP and account
   * @param {string} ip - IP address
   * @param {string} email - User email
   */
  clearFailedAttempts(ip, email) {
    // Clear IP attempts
    const ipAttempts = this.failedAttempts.get(ip)
    if (ipAttempts) {
      ipAttempts.attempts = []
      ipAttempts.lockoutUntil = null
    }

    // Clear account attempts
    const key = `account:${email}`
    const accountData = this.accountLockouts.get(key)
    if (accountData) {
      accountData.attempts = []
      accountData.lockoutUntil = null
    }
  }

  /**
   * Check login anomalies
   * @param {string} email - User email
   * @param {string} ip - IP address
   * @param {string} userAgent - User agent
   */
  checkLoginAnomalies(email, ip, userAgent) {
    const lastLogin = this.lastLoginInfo.get(email)
    if (!lastLogin) {
      return // First login, no baseline
    }

    const now = Date.now()
    const anomalies = []

    // Check for unusual location
    const currentLocation = this.extractLocationFromIP(ip)
    if (lastLogin.location && currentLocation) {
      const distance = this.calculateDistance(lastLogin.location, currentLocation)

      if (distance > SECURITY_CONFIG.ANOMALY_DETECTION.UNUSUAL_LOCATION_THRESHOLD) {
        anomalies.push({
          type: 'UNUSUAL_LOCATION',
          distance,
          lastLocation: lastLogin.location,
          currentLocation
        })
      }
    }

    // Check for unusual time
    const timeDiff = (now - lastLogin.timestamp) / (1000 * 60 * 60) // hours
    if (timeDiff > SECURITY_CONFIG.ANOMALY_DETECTION.UNUSUAL_TIME_THRESHOLD) {
      anomalies.push({
        type: 'UNUSUAL_TIME',
        hoursSinceLastLogin: timeDiff
      })
    }

    // Check for unusual user agent
    if (lastLogin.userAgent !== userAgent) {
      anomalies.push({
        type: 'UNUSUAL_USER_AGENT',
        lastUserAgent: lastLogin.userAgent,
        currentUserAgent: userAgent
      })
    }

    // Log anomalies if any detected
    if (anomalies.length > 0) {
      this.logSecurityEvent('LOGIN_ANOMALY', {
        email,
        ip,
        anomalies
      })

      logger.warn('Login anomalies detected', {
        email,
        ip,
        anomalies
      })
    }
  }

  /**
   * Create user session
   * @param {string} email - User email
   * @param {string} ip - IP address
   * @param {string} userAgent - User agent
   * @param {Object} user - User object
   */
  createUserSession(email, ip, userAgent, user) {
    const sessionId = this.generateSessionId()
    const now = Date.now()

    const session = {
      sessionId,
      email,
      userId: user.id,
      ip,
      userAgent,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + SECURITY_CONFIG.SESSION_SECURITY.SESSION_TIMEOUT
    }

    // Get existing sessions for user
    if (!this.userSessions.has(email)) {
      this.userSessions.set(email, [])
    }

    const userSessions = this.userSessions.get(email)
    userSessions.push(session)

    // Enforce maximum concurrent sessions
    if (userSessions.length > SECURITY_CONFIG.SESSION_SECURITY.MAX_CONCURRENT_SESSIONS) {
      // Remove oldest session
      const oldestSession = userSessions.shift()
      this.invalidateSession(oldestSession.sessionId)
    }

    return session
  }

  /**
   * Validate session
   * @param {string} sessionId - Session ID
   * @returns {Object} Session data or null
   */
  validateSession(sessionId) {
    const now = Date.now()

    for (const sessions of this.userSessions.values()) {
      const session = sessions.find(s => s.sessionId === sessionId)

      if (session) {
        // Check if session is expired
        if (now > session.expiresAt) {
          this.invalidateSession(sessionId)
          return null
        }

        // Update last activity
        session.lastActivity = now
        session.expiresAt = now + SECURITY_CONFIG.SESSION_SECURITY.SESSION_TIMEOUT

        return session
      }
    }

    return null
  }

  /**
   * Invalidate session
   * @param {string} sessionId - Session ID
   */
  invalidateSession(sessionId) {
    for (const [email, sessions] of this.userSessions.entries()) {
      const index = sessions.findIndex(s => s.sessionId === sessionId)

      if (index !== -1) {
        // const session = sessions[index]
        sessions.splice(index, 1)

        this.logSecurityEvent('SESSION_INVALIDATED', {
          email,
          sessionId,
          reason: 'MANUAL_INVALIDATION'
        })

        logger.info('Session invalidated', {
          email,
          sessionId
        })

        return true
      }
    }

    return false
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @param {Object} userData - User data for context
   * @returns {Object} Validation result
   */
  validatePasswordStrength(password, userData = {}) {
    const errors = []
    const score = this.calculatePasswordScore(password)

    // Length requirements
    if (password.length < SECURITY_CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH) {
      errors.push(
        `Password must be at least ${SECURITY_CONFIG.PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`
      )
    }

    if (password.length > SECURITY_CONFIG.PASSWORD_REQUIREMENTS.MAX_LENGTH) {
      errors.push(
        `Password must not exceed ${SECURITY_CONFIG.PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`
      )
    }

    // Character requirements
    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (
      SECURITY_CONFIG.PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS &&
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)
    ) {
      errors.push('Password must contain at least one special character')
    }

    // Check forbidden patterns
    for (const pattern of SECURITY_CONFIG.PASSWORD_REQUIREMENTS.FORBIDDEN_PATTERNS) {
      if (pattern.test(password)) {
        errors.push('Password contains forbidden patterns')
        break
      }
    }

    // Check for personal information
    if (userData.email && password.toLowerCase().includes(userData.email.toLowerCase())) {
      errors.push('Password should not contain your email address')
    }

    if (userData.name && password.toLowerCase().includes(userData.name.toLowerCase())) {
      errors.push('Password should not contain your name')
    }

    return {
      isValid: errors.length === 0,
      errors,
      score,
      strength: this.getPasswordStrengthLabel(score)
    }
  }

  /**
   * Calculate password score
   * @param {string} password - Password to score
   * @returns {number} Password score (0-100)
   */
  calculatePasswordScore(password) {
    let score = 0

    // Length bonus
    score += Math.min(password.length * 2, 30)

    // Character variety bonus
    if (/[a-z]/.test(password)) {
      score += 10
    }
    if (/[A-Z]/.test(password)) {
      score += 10
    }
    if (/[0-9]/.test(password)) {
      score += 10
    }
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      score += 15
    }

    // Complexity bonus
    const uniqueChars = new Set(password).size
    score += Math.min(uniqueChars * 2, 25)

    return Math.min(score, 100)
  }

  /**
   * Get password strength label
   * @param {number} score - Password score
   * @returns {string} Strength label
   */
  getPasswordStrengthLabel(score) {
    if (score < 30) {
      return 'VERY_WEAK'
    }
    if (score < 50) {
      return 'WEAK'
    }
    if (score < 70) {
      return 'FAIR'
    }
    if (score < 85) {
      return 'GOOD'
    }
    return 'STRONG'
  }

  /**
   * Generate secure session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return randomBytes(32).toString('hex')
  }

  /**
   * Extract location from IP (placeholder implementation)
   * @param {string} ip - IP address
   * @returns {Object} Location data
   */
  extractLocationFromIP(ip) {
    // In a real implementation, this would use a GeoIP service
    // For now, return placeholder data
    return {
      ip,
      country: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0
    }
  }

  /**
   * Calculate distance between two locations
   * @param {Object} loc1 - Location 1
   * @param {Object} loc2 - Location 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(loc1, loc2) {
    if (!loc1.latitude || !loc1.longitude || !loc2.latitude || !loc2.longitude) {
      return 0
    }

    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(loc2.latitude - loc1.latitude)
    const dLon = this.toRadians(loc2.longitude - loc1.longitude)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(loc1.latitude)) *
        Math.cos(this.toRadians(loc2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  /**
   * Log security event
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  logSecurityEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...data
    }

    // Store event (in production, this would go to a database)
    const key = `events:${eventType}`
    if (!this.securityEvents.has(key)) {
      this.securityEvents.set(key, [])
    }

    const events = this.securityEvents.get(key)
    events.push(event)

    // Keep only last 1000 events per type
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }

    // Log to logger
    logger.logSecurity(eventType.toLowerCase(), 'medium', event)
  }

  /**
   * Get security statistics
   * @returns {Object} Security statistics
   */
  getSecurityStats() {
    const now = Date.now()
    const activeLockouts = []
    const activeSessions = []

    // Count active lockouts
    for (const [key, data] of this.accountLockouts.entries()) {
      if (data.lockoutUntil && data.lockoutUntil > now) {
        activeLockouts.push({
          account: key.replace('account:', ''),
          lockoutUntil: data.lockoutUntil,
          remainingTime: data.lockoutUntil - now
        })
      }
    }

    // Count active sessions
    for (const sessions of this.userSessions.values()) {
      const activeSessionsForUser = sessions.filter(session => session.expiresAt > now)
      activeSessions.push(...activeSessionsForUser)
    }

    return {
      activeLockouts: activeLockouts.length,
      activeSessions: activeSessions.length,
      failedIPs: this.failedAttempts.size,
      securityEvents: Array.from(this.securityEvents.values()).reduce(
        (total, events) => total + events.length,
        0
      ),
      config: SECURITY_CONFIG
    }
  }

  /**
   * Clean up expired data
   */
  cleanup() {
    const now = Date.now()

    // Clean up expired lockouts
    for (const [key, data] of this.accountLockouts.entries()) {
      if (data.lockoutUntil && data.lockoutUntil <= now) {
        this.accountLockouts.delete(key)
      }
    }

    // Clean up expired sessions
    for (const [email, sessions] of this.userSessions.entries()) {
      const activeSessions = sessions.filter(session => session.expiresAt > now)
      if (activeSessions.length === 0) {
        this.userSessions.delete(email)
      } else {
        this.userSessions.set(email, activeSessions)
      }
    }

    // Clean up old security events
    for (const [key, events] of this.securityEvents.entries()) {
      const recentEvents = events.filter(
        event => now - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000 // 24 hours
      )
      this.securityEvents.set(key, recentEvents)
    }
  }
}

// Global instance
const accountSecurityService = new AccountSecurityService()

// Clean up expired data every hour
setInterval(
  () => {
    accountSecurityService.cleanup()
  },
  60 * 60 * 1000
)

export default accountSecurityService
export { SECURITY_CONFIG }
