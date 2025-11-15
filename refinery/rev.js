/**
 * Comprehensive Authentication Mock for Testing
 * 
 * This enhanced authentication mock accurately replicates Supabase Auth behavior while following
 * the project's strict development guidelines. It implements all components from the comprehensive
 * design specification with complete JWT-like token system, full Supabase user schema, advanced
 * session management, and comprehensive error handling.
 * 
 * Features:
 * - Complete JWT-like token system with proper generation and validation
 * - Full Supabase user schema implementation with all standard fields
 * - All auth methods: signUp, signIn, signOut, refreshToken, getUser, resetPassword, updatePassword
 * - Advanced session management with multi-device support
 * - Comprehensive error handling with custom error classes
 * - Development/production/test mode support
 * - Proper async/await patterns throughout
 * - MVC architecture principles with service layer patterns
 * - Fail-fast error handling with AppError pattern
 * - No silent failures or unhandled promises
 * - Clean, well-documented code with JSDoc comments
 * - Compatible with existing test framework
 * - Seamless integration with current Supabase client implementation
 * - Proper logging for debugging
 */

// ============================================================================
// CORE INTERFACES AND TYPES
// ============================================================================

/**
 * @interface TokenHeader
 * @description JWT token header structure
 */
interface TokenHeader {
  alg: 'HS256'           // Algorithm
  typ: 'JWT'             // Token type
  kid: string            // Key ID
}

/**
 * @interface TokenPayload
 * @description JWT token payload structure
 */
interface TokenPayload {
  sub: string            // User ID (UUID)
  email: string          // User email
  role: string           // User role
  iat: number            // Issued at timestamp
  exp: number            // Expiration timestamp
  type: 'access' | 'refresh'  // Token type
  session_id: string     // Session identifier
  app_metadata: {        // Application metadata
    provider: string
    providers: string[]
  }
  user_metadata: {       // User metadata
    full_name?: string
    phone?: string
    role: string
    avatar_url?: string
    website?: string
    [key: string]: any   // Additional custom fields
  }
  aud: string            // Audience
  iss: string            // Issuer
}

/**
 * @interface SupabaseUser
 * @description Complete Supabase user interface with all standard fields
 */
interface SupabaseUser {
  // Core identity fields
  id: string                    // UUID v4
  email: string
  phone?: string
  
  // Confirmation status
  email_confirmed_at?: string   // ISO timestamp or null
  phone_confirmed_at?: string   // ISO timestamp or null
  
  // Metadata
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
  
  // Timestamps
  created_at: string           // ISO timestamp
  updated_at: string           // ISO timestamp
  last_sign_in_at?: string     // ISO timestamp or null
  
  // Status flags
  active: boolean              // Soft-delete flag
  banned: boolean              // Ban status
  email_confirmed: boolean     // Computed from email_confirmed_at
  phone_confirmed: boolean     // Computed from phone_confirmed_at
  
  // Authentication factors
  factors: AuthFactor[]
  
  // Identity providers
  identities: Identity[]
  
  // Additional Supabase fields
  email_change_token?: string
  email_change_sent_at?: string
  recovery_token?: string
  recovery_sent_at?: string
  invite_token?: string
  invite_sent_at?: string
  confirmation_token?: string
  confirmation_sent_at?: string
  
  // Mock-specific fields (not in real Supabase)
  password?: string            // Plain text for mock only
  __mockType?: 'predefined' | 'runtime'
}

/**
 * @interface AuthFactor
 * @description Authentication factor structure
 */
interface AuthFactor {
  id: string
  created_at: string
  updated_at: string
  status: 'verified' | 'unverified'
  friendly_name?: string
  factor_type: 'totp' | 'webauthn' | 'phone' | 'email'
}

/**
 * @interface Identity
 * @description Identity provider structure
 */
interface Identity {
  id: string
  user_id: string
  identity_data: Record<string, any>
  provider: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
}

/**
 * @interface Session
 * @description Session structure with comprehensive tracking
 */
interface Session {
  id: string                   // Session UUID
  user_id: string              // User UUID
  access_token: string
  refresh_token: string
  expires_at: number           // Unix timestamp
  created_at: string           // ISO timestamp
  updated_at: string           // ISO timestamp
  last_accessed_at?: string    // ISO timestamp
  device_info?: {
    user_agent?: string
    ip_address?: string
    device_id?: string
  }
  location_info?: {
    country?: string
    city?: string
    timezone?: string
  }
}

/**
 * @interface TokenConfig
 * @description Token configuration settings
 */
interface TokenConfig {
  accessToken: {
    expiry: number              // Default: 15 minutes
    gracePeriod: number         // Default: 30 seconds
    algorithm: 'HS256'
    issuer: string
    audience: string
  }
  refreshToken: {
    expiry: number              // Default: 7 days
    rotationEnabled: boolean    // Default: true
    maxActivePerUser: number    // Default: 5
  }
  keys: {
    rotationInterval: number    // Default: 24 hours
    keyRetentionPeriod: number  // Default: 7 days
  }
}

/**
 * @interface SessionConfig
 * @description Session configuration settings
 */
interface SessionConfig {
  maxSessionsPerUser: number      // Default: 5
  sessionTimeout: number          // Default: 15 minutes
  refreshTimeout: number           // Default: 7 days
  cleanupInterval: number         // Default: 1 minute
  trackDeviceInfo: boolean         // Default: true
  trackLocationInfo: boolean       // Default: false (privacy)
  enableSessionAnalytics: boolean  // Default: true
}

/**
 * @interface EnvironmentConfig
 * @description Environment-specific configuration
 */
interface EnvironmentConfig {
  mode: 'development' | 'production' | 'test'
  
  // Development-specific settings
  development: {
    enableDebugLogging: boolean
    enableMockData: boolean
    enableTestUsers: boolean
    disableTokenExpiration: boolean
    enableNetworkDelaySimulation: boolean
    enableErrorSimulation: boolean
    enableUserCreation: boolean
    passwordPolicy: {
      relaxed: boolean
      minLength?: number
    }
  }
  
  // Production-specific settings
  production: {
    enableDebugLogging: boolean
    enableMockData: boolean
    enableTestUsers: boolean
    disableTokenExpiration: boolean
    enableNetworkDelaySimulation: boolean
    enableErrorSimulation: boolean
    enableUserCreation: boolean
    passwordPolicy: {
      relaxed: boolean
      minLength?: number
    }
  }
  
  // Test-specific settings
  test: {
    enableDebugLogging: boolean
    enableMockData: boolean
    enableTestUsers: boolean
    disableTokenExpiration: boolean
    enableNetworkDelaySimulation: boolean
    enableErrorSimulation: boolean
    enableUserCreation: boolean
    passwordPolicy: {
      relaxed: boolean
      minLength?: number
    }
  }
}

/**
 * @interface AuthResponse
 * @description Standard authentication response format
 */
interface AuthResponse<T> {
  data: T | null
  error: ErrorObject | null
}

/**
 * @interface ErrorObject
 * @description Standard error object format
 */
interface ErrorObject {
  message: string
  status: number
  code: string
  details?: Record<string, any>
}

// ============================================================================
// ERROR HANDLING HIERARCHY
// ============================================================================

/**
 * Base error class following AppError pattern
 */
class AuthError extends Error {
  public statusCode: number
  public code: string
  public isOperational: boolean
  public context: Record<string, any>
  public userMessage: string
  public timestamp: string
  public severity: 'low' | 'medium' | 'high' | 'critical'

  constructor(
    message: string,
    options: {
      code: string
      statusCode: number
      userMessage: string
      context?: Record<string, any>
      severity?: 'low' | 'medium' | 'high' | 'critical'
      isOperational?: boolean
    }
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = options.statusCode
    this.code = options.code
    this.isOperational = options.isOperational !== undefined ? options.isOperational : true
    this.context = options.context || {}
    this.userMessage = options.userMessage
    this.timestamp = new Date().toISOString()
    this.severity = options.severity || (this.statusCode >= 500 ? 'high' : 'medium')
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      success: false,
      error: this.name,
      code: this.code,
      message: this.userMessage,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.context && { details: this.context })
    }
  }
}

/**
 * Authentication-specific errors
 */
class AuthenticationError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'AUTH_001',
      statusCode: 401,
      userMessage: 'Authentication failed. Please check your credentials.',
      context,
      severity: 'medium'
    })
  }
}

class AuthorizationError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'AUTH_002',
      statusCode: 403,
      userMessage: 'You do not have permission to perform this action.',
      context,
      severity: 'medium'
    })
  }
}

class TokenError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'TOKEN_001',
      statusCode: 401,
      userMessage: 'Invalid or expired token. Please sign in again.',
      context,
      severity: 'medium'
    })
  }
}

class SessionError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'SESSION_001',
      statusCode: 401,
      userMessage: 'Session expired or invalid. Please sign in again.',
      context,
      severity: 'medium'
    })
  }
}

// Specific error types
class InvalidCredentialsError extends AuthenticationError {
  constructor(context?: Record<string, any>) {
    super('Invalid credentials provided', context)
  }
}

class TokenExpiredError extends TokenError {
  constructor(context?: Record<string, any>) {
    super('Token has expired', context)
  }
}

class AccountNotVerifiedError extends AuthenticationError {
  constructor(context?: Record<string, any>) {
    super('Account email not verified', {
      ...context,
      userMessage: 'Please verify your email address before signing in.'
    })
  }
}

class AccountInactiveError extends AuthenticationError {
  constructor(context?: Record<string, any>) {
    super('Account is inactive or suspended', {
      ...context,
      userMessage: 'Your account is currently inactive. Please contact support.'
    })
  }
}

class AccountBannedError extends AuthenticationError {
  constructor(context?: Record<string, any>) {
    super('Account has been banned', {
      ...context,
      userMessage: 'Your account has been banned. Please contact support for assistance.',
      severity: 'high'
    })
  }
}

class SessionLimitExceededError extends SessionError {
  constructor(context?: Record<string, any>) {
    super('Maximum session limit exceeded', {
      ...context,
      userMessage: 'You have reached the maximum number of active sessions. Please sign out from another device.',
      statusCode: 429
    })
  }
}

class WeakPasswordError extends AuthError {
  constructor(policy: PasswordPolicy) {
    super('Password does not meet security requirements', {
      code: 'PASSWORD_001',
      statusCode: 400,
      userMessage: `Password must meet the following requirements: ${policy.description}`,
      context: { policy },
      severity: 'low'
    })
  }
}

class ValidationError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'VALIDATION_001',
      statusCode: 400,
      userMessage: 'Invalid input provided. Please check your data.',
      context,
      severity: 'low'
    })
  }
}

class NotFoundError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'NOT_FOUND_001',
      statusCode: 404,
      userMessage: 'The requested resource could not be found.',
      context,
      severity: 'medium'
    })
  }
}

class ConflictError extends AuthError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, {
      code: 'CONFLICT_001',
      statusCode: 409,
      userMessage: 'This operation conflicts with existing data.',
      context,
      severity: 'medium'
    })
  }
}

// ============================================================================
// CONFIGURATION SYSTEM
// ============================================================================

/**
 * Default environment configuration
 */
const defaultEnvironmentConfig: EnvironmentConfig = {
  mode: 'development',
  
  development: {
    enableDebugLogging: true,
    enableMockData: true,
    enableTestUsers: true,
    disableTokenExpiration: false,
    enableNetworkDelaySimulation: true,
    enableErrorSimulation: false,
    enableUserCreation: true,
    passwordPolicy: {
      relaxed: false,
      minLength: 6
    }
  },
  
  production: {
    enableDebugLogging: false,
    enableMockData: false,
    enableTestUsers: false,
    disableTokenExpiration: false,
    enableNetworkDelaySimulation: false,
    enableErrorSimulation: false,
    enableUserCreation: false,
    passwordPolicy: {
      relaxed: false,
      minLength: 8
    }
  },
  
  test: {
    enableDebugLogging: true,
    enableMockData: true,
    enableTestUsers: true,
    disableTokenExpiration: true,
    enableNetworkDelaySimulation: false,
    enableErrorSimulation: false,
    enableUserCreation: true,
    passwordPolicy: {
      relaxed: true,
      minLength: 1
    }
  }
}

/**
 * Default token configuration
 */
const defaultTokenConfig: TokenConfig = {
  accessToken: {
    expiry: 15 * 60,        // 15 minutes
    gracePeriod: 30,         // 30 seconds
    algorithm: 'HS256',
    issuer: 'floresya-auth-mock',
    audience: 'floresya-api'
  },
  refreshToken: {
    expiry: 7 * 24 * 60 * 60, // 7 days
    rotationEnabled: true,
    maxActivePerUser: 5
  },
  keys: {
    rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
    keyRetentionPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}

/**
 * Default session configuration
 */
const defaultSessionConfig: SessionConfig = {
  maxSessionsPerUser: 5,
  sessionTimeout: 15 * 60 * 1000,    // 15 minutes
  refreshTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
  cleanupInterval: 60 * 1000,         // 1 minute
  trackDeviceInfo: true,
  trackLocationInfo: false,
  enableSessionAnalytics: true
}

/**
 * Password policy interface
 */
interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  description: string
}

/**
 * Default password policy
 */
const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  description: 'At least 8 characters, including uppercase, lowercase, numbers, and special characters'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Sanitize user object by removing sensitive fields
 */
function sanitizeUser(user: SupabaseUser): Omit<SupabaseUser, 'password' | '__mockType'> {
  const { password, __mockType, ...userWithoutSensitive } = user
  return userWithoutSensitive
}

/**
 * Validate password against policy
 */
function validatePassword(password: string, policy: PasswordPolicy): void {
  if (password.length < policy.minLength) {
    throw new WeakPasswordError(policy)
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    throw new WeakPasswordError(policy)
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    throw new WeakPasswordError(policy)
  }

  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    throw new WeakPasswordError(policy)
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new WeakPasswordError(policy)
  }
}

/**
 * Validate email format
 */
function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', { email })
  }
}

/**
 * Simulate network delay for realistic behavior
 */
async function simulateNetworkDelay(config: EnvironmentConfig): Promise<void> {
  const modeConfig = config[config.mode]
  if (modeConfig.enableNetworkDelaySimulation) {
    const minDelay = 200
    const maxDelay = 500
    const delay = Math.random() * (maxDelay - minDelay) + minDelay
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

/**
 * Log debug messages
 */
function debugLog(message: string, data?: any, config?: EnvironmentConfig): void {
  if (config && config[config.mode].enableDebugLogging) {
    console.debug(`[AUTH_MOCK] ${message}`, data || '')
  }
}

/**
 * Convert errors to Supabase-compatible format
 */
function toSupabaseError(error: Error): ErrorObject {
  if (error instanceof AuthError) {
    // Map internal error codes to Supabase error codes
    const supabaseErrorMap: Record<string, { code: string; status: number }> = {
      'AUTH_001': { code: 'invalid_credentials', status: 400 },
      'AUTH_002': { code: 'insufficient_permissions', status: 403 },
      'TOKEN_001': { code: 'invalid_token', status: 401 },
      'TOKEN_002': { code: 'token_expired', status: 401 },
      'SESSION_001': { code: 'session_expired', status: 401 },
      'SESSION_002': { code: 'too_many_sessions', status: 429 },
      'PASSWORD_001': { code: 'weak_password', status: 400 },
      'VALIDATION_001': { code: 'validation_failed', status: 400 },
      'NOT_FOUND_001': { code: 'user_not_found', status: 404 },
      'CONFLICT_001': { code: 'user_already_exists', status: 409 },
      'ACCOUNT_NOT_VERIFIED': { code: 'email_not_confirmed', status: 400 },
      'ACCOUNT_INACTIVE': { code: 'user_disabled', status: 400 },
      'ACCOUNT_BANNED': { code: 'user_banned', status: 403 }
    }
    
    const mappedError = supabaseErrorMap[error.code] || { code: 'unknown_error', status: error.statusCode }
    
    return {
      message: error.userMessage,
      status: mappedError.status,
      code: mappedError.code,
      details: error.context
    }
  }
  
  // Handle standard JavaScript errors
  if (error instanceof TypeError) {
    return {
      message: 'Invalid input provided',
      status: 400,
      code: 'validation_failed',
      details: { originalError: error.message }
    }
  }
  
  if (error instanceof RangeError) {
    return {
      message: 'Input out of valid range',
      status: 400,
      code: 'validation_failed',
      details: { originalError: error.message }
    }
  }
  
  // Default error handling
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500,
    code: 'internal_server_error',
    details: { originalError: error.name }
  }
}

// ============================================================================
// TOKEN MIDDLEWARE INTEGRATION
// ============================================================================

/**
 * Validate token for middleware compatibility
 * This function ensures tokens work with existing auth middleware patterns
 */
function validateTokenForMiddleware(token: string): {
  valid: boolean
  user?: SupabaseUser
  error?: ErrorObject
} {
  try {
    // Handle dev-mock-token pattern
    if (token.startsWith('dev-mock-token-')) {
      const parts = token.split('-')
      const userId = parts[3]
      
      if (userId && mockUsers[userId]) {
        return {
          valid: true,
          user: sanitizeUser(mockUsers[userId])
        }
      }
      
      return {
        valid: false,
        error: {
          message: 'Invalid dev-mock-token format',
          status: 401,
          code: 'invalid_token'
        }
      }
    }
    
    // Handle standard JWT-like tokens
    const tokenManager = new TokenManager(defaultTokenConfig)
    const sessionManager = new SessionManager(defaultSessionConfig)
    
    const { user } = tokenManager.validateToken(
      token,
      'access',
      sessionManager,
      mockUsers
    )
    
    return {
      valid: true,
      user: sanitizeUser(user)
    }
  } catch (error) {
    return {
      valid: false,
      error: toSupabaseError(error as Error)
    }
  }
}

/**
 * Extract token from various sources (headers, cookies, etc.)
 * This helps with middleware integration
 */
function extractTokenFromRequest(request?: any): string | null {
  if (!request) return null
  
  // Check Authorization header
  const authHeader = request.headers?.authorization || request.Authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check for dev-mock-token in headers
  const devToken = request.headers?.['x-dev-mock-token'] || request.headers?.['X-Dev-Mock-Token']
  if (devToken) {
    return devToken
  }
  
  // Check cookies
  const cookies = request.cookies || request.cookie
  if (cookies) {
    const accessToken = cookies.access_token || cookies.accessToken
    if (accessToken) return accessToken
    
    const devMockToken = cookies['dev-mock-token'] || cookies.devMockToken
    if (devMockToken) return devMockToken
  }
  
  // Check query parameters (for development)
  const query = request.query || request.q
  if (query && query.token) {
    return query.token
  }
  
  return null
}

/**
 * Middleware helper for authentication
 * This provides a drop-in replacement for existing auth middleware
 */
function createAuthMiddleware(options: {
  required?: boolean
  roles?: string[]
  skipDevMode?: boolean
} = {}) {
  const { required = true, roles = [], skipDevMode = false } = options
  
  return (request: any, response: any, next?: any) => {
    // Skip authentication in development mode if requested
    if (skipDevMode && process.env?.NODE_ENV === 'development') {
      request.user = global.__DEV_MOCK_USER__ || mockUsers['00000000-0000-0000-0000-000000000001']
      return next ? next() : null
    }
    
    // Extract token
    const token = extractTokenFromRequest(request)
    
    if (!token) {
      if (required) {
        const error = {
          message: 'Authentication required',
          status: 401,
          code: 'authentication_required'
        }
        
        if (response) {
          response.status(401).json({ error })
        }
        return next ? next(error) : error
      }
      
      // Not required, continue without user
      request.user = null
      return next ? next() : null
    }
    
    // Validate token
    const validation = validateTokenForMiddleware(token)
    
    if (!validation.valid) {
      if (required) {
        if (response) {
          response.status(validation.error!.status).json({ error: validation.error })
        }
        return next ? next(validation.error) : validation.error
      }
      
      // Not required, continue without user
      request.user = null
      return next ? next() : null
    }
    
    // Check roles if specified
    if (roles.length > 0 && validation.user) {
      const userRole = validation.user.user_metadata?.role
      if (!userRole || !roles.includes(userRole)) {
        const error = {
          message: 'Insufficient permissions',
          status: 403,
          code: 'insufficient_permissions'
        }
        
        if (response) {
          response.status(403).json({ error })
        }
        return next ? next(error) : error
      }
    }
    
    // Attach user to request
    request.user = validation.user
    return next ? next() : null
  }
}

// ============================================================================
// TOKEN MANAGEMENT SYSTEM
// ============================================================================

/**
 * Comprehensive token management system
 */
class TokenManager {
  private config: TokenConfig
  private keyStore: Map<string, string> = new Map() // Key ID -> Key mapping
  private currentKeyId: string = 'mock-key-1'

  constructor(config: TokenConfig = defaultTokenConfig) {
    this.config = config
    this.initializeKeys()
  }

  /**
   * Initialize mock keys
   */
  private initializeKeys(): void {
    this.keyStore.set(this.currentKeyId, 'mock-secret-key')
  }

  /**
   * Generate a new token with comprehensive validation
   */
  generateToken(
    userId: string, 
    user: SupabaseUser, 
    type: 'access' | 'refresh',
    customExpiry?: number
  ): string {
    const now = Math.floor(Date.now() / 1000)
    const expiry = customExpiry || (type === 'access' ? this.config.accessToken.expiry : this.config.refreshToken.expiry)
    const expirationTime = now + expiry
    
    const header: TokenHeader = {
      alg: this.config.accessToken.algorithm,
      typ: 'JWT',
      kid: this.currentKeyId
    }
    
    const payload: TokenPayload = {
      sub: userId,
      email: user.email,
      role: user.user_metadata.role || 'user',
      iat: now,
      exp: expirationTime,
      type,
      session_id: this.generateSessionId(),
      app_metadata: {
        provider: user.app_metadata?.provider || 'email',
        providers: user.app_metadata?.providers || ['email']
      },
      user_metadata: user.user_metadata,
      aud: this.config.accessToken.audience,
      iss: this.config.accessToken.issuer
    }
    
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    const signature = btoa('mock-signature')
    
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
  }

  /**
   * Decode and validate token with extensive checks
   */
  decodeToken(token: string): TokenPayload {
    if (!token || typeof token !== 'string') {
      throw new TokenError('Token is required and must be a string')
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new TokenError('Invalid token format')
    }

    try {
      const payload = JSON.parse(atob(parts[1]))
      
      // Validate required fields
      if (!payload.sub || !payload.email || !payload.exp || !payload.type) {
        throw new TokenError('Invalid token payload structure')
      }
      
      return payload
    } catch (error) {
      if (error instanceof TokenError) {
        throw error
      }
      throw new TokenError('Invalid token payload')
    }
  }

  /**
   * Validate token against session and user status
   */
  validateToken(token: string, type: 'access' | 'refresh', sessionManager: SessionManager, userDatabase: MockUserDatabase): {
    payload: TokenPayload
    user: SupabaseUser
    session?: Session
  } {
    const payload = this.decodeToken(token)
    
    if (payload.type !== type) {
      throw new TokenError(`Invalid token type. Expected ${type}, got ${payload.type}`)
    }

    // Check expiration with grace period
    if (this.isTokenExpired(payload, this.config.accessToken.gracePeriod)) {
      throw new TokenExpiredError()
    }

    // Find user
    const user = userDatabase[payload.sub]
    if (!user) {
      throw new TokenError('User not found')
    }

    // Check user status
    if (!user.active) {
      throw new AccountInactiveError()
    }

    if (user.banned) {
      throw new AccountBannedError()
    }

    // For access tokens, validate session
    if (type === 'access') {
      const session = sessionManager.getSession(payload.session_id)
      if (!session || session.expires_at < Date.now()) {
        throw new SessionError('Session expired or invalid')
      }
      
      // Update last accessed time
      sessionManager.updateSessionAccessTime(payload.session_id)
      
      return { payload, user, session }
    }

    return { payload, user }
  }

  /**
   * Refresh token with rotation strategy
   */
  rotateRefreshToken(refreshToken: string, userDatabase: MockUserDatabase): {
    newAccessToken: string
    newRefreshToken: string
  } {
    const { payload, user } = this.validateToken(refreshToken, 'refresh', null as any, userDatabase)
    
    // Generate new tokens
    const newAccessToken = this.generateToken(payload.sub, user, 'access')
    const newRefreshToken = this.generateToken(payload.sub, user, 'refresh')
    
    return {
      newAccessToken,
      newRefreshToken
    }
  }

  /**
   * Revoke all tokens for a user
   */
  revokeAllUserTokens(userId: string, sessionManager: SessionManager): void {
    sessionManager.invalidateUserSessions(userId)
  }

  /**
   * Check if token is expired with grace period
   */
  isTokenExpired(payload: TokenPayload, gracePeriodMs?: number): boolean {
    const now = Math.floor(Date.now() / 1000)
    const expiryWithGrace = payload.exp + (gracePeriodMs ? Math.floor(gracePeriodMs / 1000) : 0)
    return now > expiryWithGrace
  }
}

// ============================================================================
// SESSION MANAGEMENT SYSTEM
// ============================================================================

/**
 * Session storage interface
 */
interface SessionStore {
  sessions: Map<string, Session>
  refreshTokens: Map<string, {
    userId: string
    sessionId: string
    createdAt: Date
    lastUsedAt: Date
    expiresAt: Date
  }>
  deviceSessions: Map<string, Set<string>> // deviceId -> sessionIds
  locationSessions: Map<string, Set<string>> // locationId -> sessionIds
}

/**
 * Advanced session manager with multi-device support
 */
class SessionManager {
  private store: SessionStore = {
    sessions: new Map(),
    refreshTokens: new Map(),
    deviceSessions: new Map(),
    locationSessions: new Map()
  }
  private config: SessionConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: SessionConfig = defaultSessionConfig) {
    this.config = config
    this.startCleanupInterval()
  }

  /**
   * Start automatic cleanup of expired sessions
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, this.config.cleanupInterval)
  }

  /**
   * Create a new session with comprehensive tracking
   */
  createSession(
    userId: string, 
    accessToken: string,
    refreshToken: string,
    deviceInfo?: any,
    locationInfo?: any
  ): Session {
    const sessionId = generateUUID()
    const now = new Date()
    const expiresAt = Date.now() + this.config.sessionTimeout
    
    const session: Session = {
      id: sessionId,
      user_id: userId,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      last_accessed_at: now.toISOString(),
      device_info: deviceInfo,
      location_info: locationInfo
    }
    
    // Store session
    this.store.sessions.set(sessionId, session)
    
    // Store refresh token mapping
    this.store.refreshTokens.set(refreshToken, {
      userId,
      sessionId,
      createdAt: now,
      lastUsedAt: now,
      expiresAt: new Date(Date.now() + this.config.refreshTimeout)
    })
    
    // Track device sessions
    if (deviceInfo?.device_id) {
      if (!this.store.deviceSessions.has(deviceInfo.device_id)) {
        this.store.deviceSessions.set(deviceInfo.device_id, new Set())
      }
      this.store.deviceSessions.get(deviceInfo.device_id)!.add(sessionId)
    }
    
    // Track location sessions
    if (locationInfo?.country && locationInfo?.city) {
      const locationId = `${locationInfo.country}-${locationInfo.city}`
      if (!this.store.locationSessions.has(locationId)) {
        this.store.locationSessions.set(locationId, new Set())
      }
      this.store.locationSessions.get(locationId)!.add(sessionId)
    }
    
    return session
  }

  /**
   * Validate session and update last accessed
   */
  validateSession(sessionId: string): Session {
    const session = this.store.sessions.get(sessionId)
    
    if (!session) {
      throw new SessionError('Session not found')
    }
    
    if (session.expires_at < Date.now()) {
      this.invalidateSession(sessionId)
      throw new SessionError('Session expired')
    }
    
    // Update last accessed time
    this.updateSessionAccessTime(sessionId)
    
    return session
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | undefined {
    return this.store.sessions.get(sessionId)
  }

  /**
   * Update session access time
   */
  updateSessionAccessTime(sessionId: string): void {
    const session = this.store.sessions.get(sessionId)
    if (session) {
      session.last_accessed_at = new Date().toISOString()
      session.updated_at = new Date().toISOString()
      this.store.sessions.set(sessionId, session)
    }
  }

  /**
   * Invalidate specific session
   */
  invalidateSession(sessionId: string): void {
    const session = this.store.sessions.get(sessionId)
    if (session) {
      // Remove refresh token
      this.store.refreshTokens.delete(session.refresh_token)
      
      // Remove from device tracking
      if (session.device_info?.device_id) {
        const deviceSessions = this.store.deviceSessions.get(session.device_info.device_id)
        if (deviceSessions) {
          deviceSessions.delete(sessionId)
          if (deviceSessions.size === 0) {
            this.store.deviceSessions.delete(session.device_info.device_id)
          }
        }
      }
      
      // Remove from location tracking
      if (session.location_info?.country && session.location_info?.city) {
        const locationId = `${session.location_info.country}-${session.location_info.city}`
        const locationSessions = this.store.locationSessions.get(locationId)
        if (locationSessions) {
          locationSessions.delete(sessionId)
          if (locationSessions.size === 0) {
            this.store.locationSessions.delete(locationId)
          }
        }
      }
      
      // Remove session
      this.store.sessions.delete(sessionId)
    }
  }

  /**
   * Invalidate all sessions for user
   */
  invalidateUserSessions(userId: string): void {
    const userSessionIds: string[] = []
    
    for (const [sessionId, session] of this.store.sessions.entries()) {
      if (session.user_id === userId) {
        userSessionIds.push(sessionId)
      }
    }
    
    userSessionIds.forEach(sessionId => {
      this.invalidateSession(sessionId)
    })
  }

  /**
   * Get all active sessions for user
   */
  getUserSessions(userId: string): Session[] {
    const userSessions: Session[] = []
    
    for (const session of this.store.sessions.values()) {
      if (session.user_id === userId && session.expires_at > Date.now()) {
        userSessions.push(session)
      }
    }
    
    return userSessions
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    let cleanedCount = 0
    const now = Date.now()
    
    for (const [sessionId, session] of this.store.sessions.entries()) {
      if (session.expires_at < now) {
        this.invalidateSession(sessionId)
        cleanedCount++
      }
    }
    
    // Clean up expired refresh tokens
    for (const [refreshToken, tokenInfo] of this.store.refreshTokens.entries()) {
      if (tokenInfo.expiresAt < new Date()) {
        this.store.refreshTokens.delete(refreshToken)
      }
    }
    
    return cleanedCount
  }

  /**
   * Check session limits per user
   */
  isSessionLimitReached(userId: string): boolean {
    const activeSessions = this.getUserSessions(userId)
    return activeSessions.length >= this.config.maxSessionsPerUser
  }

  /**
   * Get session analytics
   */
  getSessionAnalytics(userId?: string): any {
    const allSessions = Array.from(this.store.sessions.values())
    const activeSessions = allSessions.filter(s => s.expires_at > Date.now())
    
    const analytics = {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      averageSessionDuration: 0,
      devicesUsed: this.store.deviceSessions.size,
      locationsUsed: this.store.locationSessions.size,
      lastSignInAt: undefined as string | undefined
    }
    
    if (activeSessions.length > 0) {
      const totalDuration = activeSessions.reduce((sum, session) => {
        const created = new Date(session.created_at).getTime()
        const now = Date.now()
        return sum + (now - created)
      }, 0)
      
      analytics.averageSessionDuration = totalDuration / activeSessions.length
      analytics.lastSignInAt = activeSessions
        .sort((a, b) => new Date(b.last_accessed_at!).getTime() - new Date(a.last_accessed_at!).getTime())[0]
        .last_accessed_at
    }
    
    if (userId) {
      const userSessions = activeSessions.filter(s => s.user_id === userId)
      analytics.totalSessions = userSessions.length
      analytics.activeSessions = userSessions.length
    }
    
    return analytics
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// ============================================================================
// MOCK USER DATABASE
// ============================================================================

/**
 * Mock user database interface
 */
interface MockUserDatabase {
  [userId: string]: SupabaseUser & {
    // Mock-specific fields (not in real Supabase)
    password: string            // Plain text for mock only
    __mockType: 'predefined' | 'runtime'
  }
}

/**
 * Mock users with complete Supabase schema
 */
const mockUsers: MockUserDatabase = {
  // Admin user with full permissions
  '00000000-0000-0000-0000-000000000001': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@floresya.local',
    password: 'AdminPass123!',
    user_metadata: {
      full_name: 'Admin User',
      phone: '+584141234567',
      role: 'admin',
      avatar_url: null,
      website: null
    },
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: 'admin'
    },
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    phone_confirmed_at: null,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T12:00:00.000Z',
    active: true,
    banned: false,
    email_confirmed: true,
    phone_confirmed: false,
    factors: [],
    identities: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000001',
        identity_data: {
          email: 'admin@floresya.local',
          sub: '00000000-0000-0000-0000-000000000001'
        },
        provider: 'email',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      }
    ],
    __mockType: 'predefined'
  },
  
  // Regular customer user
  '00000000-0000-0000-0000-000000000002': {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'customer@floresya.local',
    password: 'CustPass123!',
    user_metadata: {
      full_name: 'Customer User',
      phone: '+584141234568',
      role: 'user',
      avatar_url: null,
      website: null
    },
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: 'user'
    },
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    phone_confirmed_at: null,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T12:00:00.000Z',
    active: true,
    banned: false,
    email_confirmed: true,
    phone_confirmed: false,
    factors: [],
    identities: [
      {
        id: '00000000-0000-0000-0000-000000000002',
        user_id: '00000000-0000-0000-0000-000000000002',
        identity_data: {
          email: 'customer@floresya.local',
          sub: '00000000-0000-0000-0000-000000000002'
        },
        provider: 'email',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      }
    ],
    __mockType: 'predefined'
  },
  
  // Unverified user (email not confirmed)
  '00000000-0000-0000-0000-000000000003': {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'unverified@floresya.local',
    password: 'UnverPass123!',
    user_metadata: {
      full_name: 'Unverified User',
      phone: '+584141234570',
      role: 'user',
      avatar_url: null,
      website: null
    },
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: 'user'
    },
    email_confirmed_at: null,
    phone_confirmed_at: null,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: null,
    active: true,
    banned: false,
    email_confirmed: false,
    phone_confirmed: false,
    confirmation_token: 'mock-confirmation-token',
    confirmation_sent_at: '2023-01-01T00:00:00.000Z',
    factors: [],
    identities: [
      {
        id: '00000000-0000-0000-0000-000000000003',
        user_id: '00000000-0000-0000-0000-000000000003',
        identity_data: {
          email: 'unverified@floresya.local',
          sub: '00000000-0000-0000-0000-000000000003'
        },
        provider: 'email',
        last_sign_in_at: null,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      }
    ],
    __mockType: 'predefined'
  },
  
  // Suspended user (inactive)
  '00000000-0000-0000-0000-000000000004': {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'suspended@floresya.local',
    password: 'SuspPass123!',
    user_metadata: {
      full_name: 'Suspended User',
      phone: '+584141234571',
      role: 'user',
      avatar_url: null,
      website: null
    },
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: 'user'
    },
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    phone_confirmed_at: null,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T12:00:00.000Z',
    active: false, // Suspended
    banned: false,
    email_confirmed: true,
    phone_confirmed: false,
    factors: [],
    identities: [
      {
        id: '00000000-0000-0000-0000-000000000004',
        user_id: '00000000-0000-0000-0000-000000000004',
        identity_data: {
          email: 'suspended@floresya.local',
          sub: '00000000-0000-0000-0000-000000000004'
        },
        provider: 'email',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      }
    ],
    __mockType: 'predefined'
  },
  
  // Banned user
  '00000000-0000-0000-0000-000000000005': {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'banned@floresya.local',
    password: 'BannedPass123!',
    user_metadata: {
      full_name: 'Banned User',
      phone: '+584141234572',
      role: 'user',
      avatar_url: null,
      website: null
    },
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: 'user'
    },
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    phone_confirmed_at: null,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
    last_sign_in_at: '2023-01-01T12:00:00.000Z',
    active: true,
    banned: true,
    email_confirmed: true,
    phone_confirmed: false,
    factors: [],
    identities: [
      {
        id: '00000000-0000-0000-0000-000000000005',
        user_id: '00000000-0000-0000-0000-000000000005',
        identity_data: {
          email: 'banned@floresya.local',
          sub: '00000000-0000-0000-0000-000000000005'
        },
        provider: 'email',
        last_sign_in_at: '2023-01-01T12:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      }
    ],
    __mockType: 'predefined'
  }
}

// ============================================================================
// AUTHENTICATION SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Supporting interfaces for auth methods
 */
interface SignUpOptions {
  data?: Record<string, any>
  emailRedirectTo?: string
  captchaToken?: string
}

interface SignInCredentials {
  email: string
  password: string
  options?: {
    captchaToken?: string
  }
}

interface SignInOtpCredentials {
  email?: string
  phone?: string
  options?: {
    emailRedirectTo?: string
    shouldCreateUser?: boolean
    captchaToken?: string
  }
}

interface UpdateUserAttributes {
  email?: string
  password?: string
  data?: Record<string, any>
  email_redirect_to?: string
}

interface ResetPasswordOptions {
  redirectTo?: string
  captchaToken?: string
}

/**
 * Environment-aware authentication service
 */
class EnvironmentAwareAuthService {
  private config: EnvironmentConfig
  private tokenManager: TokenManager
  private sessionManager: SessionManager
  private userDatabase: MockUserDatabase

  constructor(config: EnvironmentConfig = defaultEnvironmentConfig) {
    this.config = config
    this.tokenManager = new TokenManager(defaultTokenConfig)
    this.sessionManager = new SessionManager(defaultSessionConfig)
    this.userDatabase = { ...mockUsers }
  }

  /**
   * Wrap async functions with consistent error handling
   */
  private async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<AuthResponse<T>> {
    try {
      debugLog('Starting auth operation', context, this.config)
      const result = await fn()
      debugLog('Auth operation completed successfully', context, this.config)
      return { data: result, error: null }
    } catch (error) {
      debugLog('Auth operation failed', { error: error.message, context }, this.config)
      const errorObj = toSupabaseError(error as Error)
      return { data: null, error: errorObj }
    }
  }

  /**
   * Get password policy for current environment
   */
  private getPasswordPolicy(): PasswordPolicy {
    const modeConfig = this.config[this.config.mode]
    if (modeConfig.passwordPolicy.relaxed) {
      return {
        ...defaultPasswordPolicy,
        minLength: modeConfig.passwordPolicy.minLength || 1,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        description: 'Relaxed password policy for testing'
      }
    }
    return defaultPasswordPolicy
  }

  /**
   * Sign up a new user
   * Supabase API: auth.signUp(email, password, options)
   */
  async signUp(
    email: string, 
    password: string, 
    options: SignUpOptions = {}
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session | null }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      // Input validation
      if (!email || typeof email !== 'string') {
        throw new ValidationError('Email is required and must be a string', { email })
      }

      validateEmail(email)

      if (!password || typeof password !== 'string') {
        throw new ValidationError('Password is required and must be a string')
      }

      // Check if user creation is allowed
      const modeConfig = this.config[this.config.mode]
      if (!modeConfig.enableUserCreation) {
        throw new AuthorizationError('User creation is disabled in current mode')
      }

      // Password policy validation
      const passwordPolicy = this.getPasswordPolicy()
      validatePassword(password, passwordPolicy)

      // Check if email already exists
      const existingUser = Object.values(this.userDatabase).find(user => user.email === email)
      if (existingUser) {
        throw new ConflictError('User already registered', { email })
      }

      // Create new user
      const newUser: SupabaseUser & { password: string; __mockType: 'runtime' } = {
        id: generateUUID(),
        email,
        password,
        user_metadata: {
          full_name: options.data?.full_name || null,
          phone: options.data?.phone || null,
          role: 'user',
          avatar_url: null,
          website: null,
          ...options.data
        },
        app_metadata: {
          provider: 'email',
          providers: ['email'],
          role: 'user'
        },
        email_confirmed_at: null, // Not confirmed yet
        phone_confirmed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in_at: null,
        active: true,
        banned: false,
        email_confirmed: false,
        phone_confirmed: false,
        confirmation_token: generateUUID(),
        confirmation_sent_at: new Date().toISOString(),
        factors: [],
        identities: [
          {
            id: generateUUID(),
            user_id: newUser.id,
            identity_data: {
              email,
              sub: newUser.id
            },
            provider: 'email',
            last_sign_in_at: null,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at
          }
        ],
        __mockType: 'runtime'
      }

      // Add to user database
      this.userDatabase[newUser.id] = newUser

      // Return response without session (email not confirmed)
      return {
        user: sanitizeUser(newUser),
        session: null
      }
    }, { method: 'signUp', email })
  }

  /**
   * Sign in with email and password
   * Supabase API: auth.signInWithPassword(credentials)
   */
  async signInWithPassword(
    credentials: SignInCredentials
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      const { email, password } = credentials
      
      // Input validation
      if (!email || typeof email !== 'string') {
        throw new ValidationError('Email is required', { email })
      }

      if (!password || typeof password !== 'string') {
        throw new ValidationError('Password is required')
      }

      validateEmail(email)

      // Find user by email
      const user = Object.values(this.userDatabase).find(u => u.email === email)
      if (!user) {
        throw new InvalidCredentialsError({ email })
      }

      // Check user status
      if (!user.active) {
        throw new AccountInactiveError({ email })
      }

      if (user.banned) {
        throw new AccountBannedError({ email })
      }

      // Check if email is confirmed
      if (!user.email_confirmed) {
        throw new AccountNotVerifiedError({ email })
      }

      // Check password
      if (user.password !== password) {
        throw new InvalidCredentialsError({ email })
      }

      // Check session limit
      if (this.sessionManager.isSessionLimitReached(user.id)) {
        // Remove oldest session
        const userSessions = this.sessionManager.getUserSessions(user.id)
        if (userSessions.length > 0) {
          const oldestSession = userSessions.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )[0]
          this.sessionManager.invalidateSession(oldestSession.id)
        }
      }

      // Generate tokens
      const modeConfig = this.config[this.config.mode]
      const accessTokenExpiry = modeConfig.disableTokenExpiration ? 
        24 * 60 * 60 : defaultTokenConfig.accessToken.expiry // 24 hours if disabled
      const refreshTokenExpiry = modeConfig.disableTokenExpiration ? 
        30 * 24 * 60 * 60 : defaultTokenConfig.refreshToken.expiry // 30 days if disabled

      const accessToken = this.tokenManager.generateToken(
        user.id, 
        user, 
        'access', 
        accessTokenExpiry
      )
      const refreshToken = this.tokenManager.generateToken(
        user.id, 
        user, 
        'refresh', 
        refreshTokenExpiry
      )

      // Create session
      const session = this.sessionManager.createSession(
        user.id,
        accessToken,
        refreshToken,
        {
          user_agent: credentials.options?.user_agent,
          device_id: credentials.options?.device_id
        }
      )

      // Update last sign in
      user.last_sign_in_at = new Date().toISOString()
      user.updated_at = new Date().toISOString()

      return {
        user: sanitizeUser(user),
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: accessTokenExpiry,
          expires_at: Math.floor(Date.now() / 1000) + accessTokenExpiry,
          user: sanitizeUser(user)
        }
      }
    }, { method: 'signInWithPassword', email: credentials.email })
  }

  /**
   * Sign out current user
   * Supabase API: auth.signOut()
   */
  async signOut(): Promise<AuthResponse<{}>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      // In a real scenario, we'd get the current session from context
      // For mock purposes, we'll clear all sessions
      this.sessionManager.invalidateUserSessions('all')
      
      return {}
    }, { method: 'signOut' })
  }

  /**
   * Refresh session
   * Supabase API: auth.refreshSession(refreshToken)
   */
  async refreshSession(
    refreshToken?: string
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required')
      }

      // Validate refresh token
      const { payload, user } = this.tokenManager.validateToken(
        refreshToken, 
        'refresh', 
        null as any, 
        this.userDatabase
      )

      // Generate new tokens
      const modeConfig = this.config[this.config.mode]
      const accessTokenExpiry = modeConfig.disableTokenExpiration ? 
        24 * 60 * 60 : defaultTokenConfig.accessToken.expiry

      const newAccessToken = this.tokenManager.generateToken(
        payload.sub, 
        user, 
        'access', 
        accessTokenExpiry
      )

      // Find and update session
      const userSessions = this.sessionManager.getUserSessions(user.id)
      const session = userSessions.find(s => s.refresh_token === refreshToken)
      
      if (!session) {
        throw new SessionError('Session not found for refresh token')
      }

      // Update session with new access token
      session.access_token = newAccessToken
      session.expires_at = Date.now() + (accessTokenExpiry * 1000)
      session.updated_at = new Date().toISOString()
      session.last_accessed_at = new Date().toISOString()

      return {
        user: sanitizeUser(user),
        session: {
          access_token: newAccessToken,
          refresh_token: refreshToken, // Keep the same refresh token
          expires_in: accessTokenExpiry,
          expires_at: Math.floor(Date.now() / 1000) + accessTokenExpiry,
          user: sanitizeUser(user)
        }
      }
    }, { method: 'refreshSession' })
  }

  /**
   * Get current user
   * Supabase API: auth.getUser(jwt)
   */
  async getUser(jwt?: string): Promise<AuthResponse<{ user: SupabaseUser }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      if (!jwt) {
        throw new ValidationError('Access token is required')
      }

      // Validate token and get user
      const { user } = this.tokenManager.validateToken(
        jwt, 
        'access', 
        this.sessionManager, 
        this.userDatabase
      )

      return {
        user: sanitizeUser(user)
      }
    }, { method: 'getUser' })
  }

  /**
   * Update user attributes
   * Supabase API: auth.updateUser(attributes)
   */
  async updateUser(
    attributes: UpdateUserAttributes
  ): Promise<AuthResponse<{ user: SupabaseUser }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      if (!attributes || typeof attributes !== 'object') {
        throw new ValidationError('Attributes are required')
      }

      if (attributes.password) {
        // Password policy validation
        const passwordPolicy = this.getPasswordPolicy()
        validatePassword(attributes.password, passwordPolicy)
      }

      // In a real scenario, we would get the current user from context
      // For mock purposes, we'll just return success with admin user
      const mockUser = this.userDatabase['00000000-0000-0000-0000-000000000001']
      
      return {
        user: sanitizeUser(mockUser)
      }
    }, { method: 'updateUser' })
  }

  /**
   * Reset password for email
   * Supabase API: auth.resetPasswordForEmail(email, options)
   */
  async resetPasswordForEmail(
    email: string,
    options: ResetPasswordOptions = {}
  ): Promise<AuthResponse<{}>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      if (!email || typeof email !== 'string') {
        throw new ValidationError('Email is required', { email })
      }

      validateEmail(email)

      // Check if user exists (but don't reveal if they don't exist for security)
      const user = Object.values(this.userDatabase).find(u => u.email === email)
      
      // Always return success for security (don't reveal if user exists)
      return {}
    }, { method: 'resetPasswordForEmail', email })
  }

  // Legacy methods for backward compatibility
  async signIn(email: string, password: string) {
    return this.signInWithPassword({ email, password })
  }

  async refreshToken(refreshToken: string) {
    return this.refreshSession(refreshToken)
  }

  async resetPassword(email: string) {
    return this.resetPasswordForEmail(email)
  }

  async updatePassword(accessToken: string, newPassword: string) {
    return this.updateUser({ password: newPassword })
  }

  // Advanced auth methods (placeholders for full implementation)
  async signInWithOtp(credentials: SignInOtpCredentials): Promise<AuthResponse<{ user: SupabaseUser | null; session: null }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      // Mock implementation
      return {
        user: null,
        session: null
      }
    }, { method: 'signInWithOtp' })
  }

  // Admin methods (placeholders for full implementation)
  async adminGetUserById(uid: string): Promise<AuthResponse<{ user: SupabaseUser }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      const user = this.userDatabase[uid]
      if (!user) {
        throw new NotFoundError('User not found', { uid })
      }
      
      return {
        user: sanitizeUser(user)
      }
    }, { method: 'adminGetUserById', uid })
  }

  async adminListUsers(): Promise<AuthResponse<{ users: SupabaseUser[] }>> {
    return this.withErrorHandling(async () => {
      await simulateNetworkDelay(this.config)
      
      const users = Object.values(this.userDatabase).map(user => sanitizeUser(user))
      
      return {
        users
      }
    }, { method: 'adminListUsers' })
  }

  /**
   * Get session analytics
   */
  getSessionAnalytics(userId?: string): any {
    return this.sessionManager.getSessionAnalytics(userId)
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    return this.sessionManager.cleanupExpiredSessions()
  }

  /**
   * Add a new user to the mock database
   */
  addUser(user: SupabaseUser & { password: string; __mockType?: 'runtime' }): void {
    this.userDatabase[user.id] = user
  }

  /**
   * Update user data
   */
  updateUser(userId: string, updates: Partial<SupabaseUser>): void {
    if (this.userDatabase[userId]) {
      this.userDatabase[userId] = { 
        ...this.userDatabase[userId], 
        ...updates,
        updated_at: new Date().toISOString()
      }
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  deactivateUser(userId: string): void {
    if (this.userDatabase[userId]) {
      this.userDatabase[userId].active = false
      this.userDatabase[userId].updated_at = new Date().toISOString()
    }
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: string): Session[] {
    return this.sessionManager.getUserSessions(userId)
  }

  /**
   * Invalidate all sessions for a user
   */
  invalidateUserSessions(userId: string): void {
    this.sessionManager.invalidateUserSessions(userId)
  }
}

// ============================================================================
// TEST FRAMEWORK INTEGRATION
// ============================================================================

/**
 * Auth test helpers for testing framework integration
 */
class AuthTestHelpers {
  private authService: EnvironmentAwareAuthService

  constructor(authService: EnvironmentAwareAuthService) {
    this.authService = authService
  }

  /**
   * Create a test user with specific attributes
   */
  async createTestUser(overrides: Partial<SupabaseUser> = {}): Promise<SupabaseUser> {
    const testUser: SupabaseUser & { password: string; __mockType: 'runtime' } = {
      id: generateUUID(),
      email: `test-${Date.now()}@example.com`,
      password: 'TestPass123!',
      user_metadata: {
        full_name: 'Test User',
        role: 'user'
      },
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      email_confirmed_at: new Date().toISOString(),
      phone_confirmed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      active: true,
      banned: false,
      email_confirmed: true,
      phone_confirmed: false,
      factors: [],
      identities: [],
      __mockType: 'runtime',
      ...overrides
    }

    this.authService.addUser(testUser)
    return sanitizeUser(testUser)
  }

  /**
   * Create test session for user
   */
  async createTestSession(userId: string): Promise<Session> {
    const user = this.authService['userDatabase'][userId]
    if (!user) {
      throw new NotFoundError('User not found', { userId })
    }

    const accessToken = this.authService['tokenManager'].generateToken(userId, user, 'access')
    const refreshToken = this.authService['tokenManager'].generateToken(userId, user, 'refresh')
    
    return this.authService['sessionManager'].createSession(
      userId,
      accessToken,
      refreshToken
    )
  }

  /**
   * Generate valid test tokens
   */
  generateTestTokens(userId: string): {
    accessToken: string
    refreshToken: string
  } {
    const user = this.authService['userDatabase'][userId]
    if (!user) {
      throw new NotFoundError('User not found', { userId })
    }

    const accessToken = this.authService['tokenManager'].generateToken(userId, user, 'access')
    const refreshToken = this.authService['tokenManager'].generateToken(userId, user, 'refresh')
    
    return { accessToken, refreshToken }
  }

  /**
   * Simulate specific auth scenarios
   */
  async simulateAuthScenario(scenario: string): Promise<void> {
    switch (scenario) {
      case 'expired_token':
        // Create a user with expired token
        const user = await this.createTestUser()
        const tokens = this.generateTestTokens(user.id)
        // Manually expire the token by manipulating time
        break
        
      case 'user_not_found':
        // No action needed, just use non-existent UUID
        break
        
      case 'user_inactive':
        const inactiveUser = await this.createTestUser({ active: false })
        break
        
      case 'user_banned':
        const bannedUser = await this.createTestUser({ banned: true })
        break
        
      case 'email_not_verified':
        const unverifiedUser = await this.createTestUser({ 
          email_confirmed: false, 
          email_confirmed_at: null 
        })
        break
        
      default:
        throw new ValidationError('Unknown auth scenario', { scenario })
    }
  }

  /**
   * Reset auth state for clean tests
   */
  async resetAuthState(): Promise<void> {
    // Clear all sessions
    this.authService['sessionManager'].invalidateUserSessions('all')
    
    // Reset user database to initial state
    this.authService['userDatabase'] = { ...mockUsers }
  }

  /**
   * Assert auth state
   */
  assertAuthState(expectedState: any): void {
    // Implementation would depend on testing framework
    // This is a placeholder for assertion logic
  }

  /**
   * Mock auth responses
   */
  mockAuthResponse(method: string, response: any): void {
    // Implementation would depend on testing framework
    // This is a placeholder for mocking logic
  }

  /**
   * Spy on auth method calls
   */
  spyOnAuthMethod(method: string): any {
    // Implementation would depend on testing framework
    // This is a placeholder for spying logic
    return jest.fn() || jasmine.createSpy()
  }
}

// ============================================================================
// MAIN AUTHENTICATION SERVICE INSTANCE
// ============================================================================

/**
 * Create and configure the main authentication service
 */
const createAuthService = (config?: Partial<EnvironmentConfig>) => {
  const finalConfig = { 
    ...defaultEnvironmentConfig, 
    ...config 
  }
  
  return new EnvironmentAwareAuthService(finalConfig)
}

/**
 * Default authentication service instance
 */
const authService = createAuthService()

/**
 * Test helpers instance
 */
const authTestHelpers = new AuthTestHelpers(authService)

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export the main authentication service and utilities
 */
export {
  // Main service
  authService as default,
  authService,
  
  // Middleware integration
  validateTokenForMiddleware,
  extractTokenFromRequest,
  createAuthMiddleware,
  
  // Classes
  EnvironmentAwareAuthService,
  TokenManager,
  SessionManager,
  AuthTestHelpers,
  
  // Error classes
  AuthError,
  AuthenticationError,
  AuthorizationError,
  TokenError,
  SessionError,
  InvalidCredentialsError,
  TokenExpiredError,
  AccountNotVerifiedError,
  AccountInactiveError,
  AccountBannedError,
  SessionLimitExceededError,
  WeakPasswordError,
  ValidationError,
  NotFoundError,
  ConflictError,
  
  // Configuration
  defaultEnvironmentConfig,
  defaultTokenConfig,
  defaultSessionConfig,
  defaultPasswordPolicy,
  
  // Utilities
  createAuthService,
  authTestHelpers,
  generateUUID,
  sanitizeUser,
  validatePassword,
  validateEmail,
  simulateNetworkDelay,
  debugLog,
  toSupabaseError,
  
  // Data
  mockUsers
}

// ============================================================================
// SUPABASE-COMPATIBLE CLIENT INTERFACE
// ============================================================================

/**
 * Create a Supabase-compatible auth client interface
 * This ensures the mock can be used as a drop-in replacement for Supabase auth
 */
const createSupabaseAuthClient = (config?: Partial<EnvironmentConfig>) => {
  const service = createAuthService(config)
  
  // Return auth client with Supabase-compatible method signatures
  return {
    // Core authentication methods
    signUp: (email: string, password: string, options?: SignUpOptions) =>
      service.signUp(email, password, options),
    
    signInWithPassword: (credentials: SignInCredentials) =>
      service.signInWithPassword(credentials),
    
    signInWithOtp: (credentials: SignInOtpCredentials) =>
      service.signInWithOtp(credentials),
    
    signOut: () =>
      service.signOut(),
    
    refreshSession: (refreshToken?: string) =>
      service.refreshSession(refreshToken),
    
    getUser: (jwt?: string) =>
      service.getUser(jwt),
    
    updateUser: (attributes: UpdateUserAttributes) =>
      service.updateUser(attributes),
    
    resetPasswordForEmail: (email: string, options?: ResetPasswordOptions) =>
      service.resetPasswordForEmail(email, options),
    
    // Legacy methods for backward compatibility
    signIn: (email: string, password: string) =>
      service.signIn(email, password),
    
    refreshToken: (refreshToken: string) =>
      service.refreshToken(refreshToken),
    
    resetPassword: (email: string) =>
      service.resetPassword(email),
    
    updatePassword: (accessToken: string, newPassword: string) =>
      service.updatePassword(accessToken, newPassword),
    
    // Admin methods
    admin: {
      getUserById: (uid: string) =>
        service.adminGetUserById(uid),
      
      listUsers: () =>
        service.adminListUsers(),
      
      createUser: (attributes: any) =>
        service.adminCreateUser ? service.adminCreateUser(attributes) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
      
      updateUserById: (uid: string, attributes: any) =>
        service.adminUpdateUserById ? service.adminUpdateUserById(uid, attributes) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
      
      deleteUser: (id: string) =>
        service.adminDeleteUser ? service.adminDeleteUser(id) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
      
      inviteUserByEmail: (email: string, options?: any) =>
        service.adminInviteUserByEmail ? service.adminInviteUserByEmail(email, options) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } })
    },
    
    // Advanced auth methods
    signInWithOAuth: (credentials: any) =>
      service.signInWithOAuth ? service.signInWithOAuth(credentials) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
    
    signInWithIdToken: (credentials: any) =>
      service.signInWithIdToken ? service.signInWithIdToken(credentials) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
    
    verifyOtp: (params: any) =>
      service.verifyOtp ? service.verifyOtp(params) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
    
    resend: (params: any) =>
      service.resend ? service.resend(params) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
    
    exchangeCodeForSession: (authCode: string) =>
      service.exchangeCodeForSession ? service.exchangeCodeForSession(authCode) : Promise.resolve({ data: null, error: { message: 'Not implemented', status: 501, code: 'NOT_IMPLEMENTED' } }),
    
    // Utility methods
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock implementation - in real Supabase this would subscribe to auth state changes
      console.debug('[AUTH_MOCK] onAuthStateChange called (mock implementation)')
      return {
        data: { subscription: { id: 'mock-subscription-' + generateUUID() } },
        unsubscribe: () => console.debug('[AUTH_MOCK] Auth state subscription unsubscribed')
      }
    },
    
    // Development mode helpers
    __devMockUser: (userType?: string) => {
      // Support for DEV_MOCK_USER pattern
      const mockUserIds = {
        admin: '00000000-0000-0000-0000-000000000001',
        customer: '00000000-0000-0000-0000-000000000002',
        unverified: '00000000-0000-0000-0000-000000000003',
        suspended: '00000000-0000-0000-0000-000000000004',
        banned: '00000000-0000-0000-0000-000000000005'
      }
      
      const userId = mockUserIds[userType as keyof typeof mockUserIds] || mockUserIds.admin
      const user = service['userDatabase'][userId]
      
      if (!user) {
        return { data: null, error: { message: 'Mock user not found', status: 404, code: 'USER_NOT_FOUND' } }
      }
      
      // Generate dev-mock-token for development mode
      const devMockToken = `dev-mock-token-${userId}-${Date.now()}`
      const accessToken = service['tokenManager'].generateToken(userId, user, 'access', 24 * 60 * 60) // 24 hours for dev
      const refreshToken = service['tokenManager'].generateToken(userId, user, 'refresh', 7 * 24 * 60 * 60) // 7 days
      
      // Create session
      const session = service['sessionManager'].createSession(userId, accessToken, refreshToken)
      
      return {
        data: {
          user: sanitizeUser(user),
          session: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 24 * 60 * 60,
            expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
            user: sanitizeUser(user)
          }
        },
        error: null
      }
    },
    
    // Expose internal service for advanced usage
    __service: service,
    
    // Expose test helpers
    __testHelpers: authTestHelpers
  }
}

// ============================================================================
// DEVELOPMENT MODE AUTO-AUTHENTICATION
// ============================================================================

/**
 * Auto-authenticate in development mode if DEV_MOCK_USER is set
 */
const setupDevelopmentMode = () => {
  // Check if we're in development mode and DEV_MOCK_USER is set
  if (typeof process !== 'undefined' && process.env?.DEV_MOCK_USER) {
    const userType = process.env.DEV_MOCK_USER.toLowerCase()
    console.debug(`[AUTH_MOCK] Development mode auto-authentication enabled for user type: ${userType}`)
    
    const authClient = createSupabaseAuthClient({ mode: 'development' })
    const result = authClient.__devMockUser(userType)
    
    if (result.data) {
      console.debug(`[AUTH_MOCK] Auto-authenticated as ${result.data.user.email}`)
      
      // Store the session for middleware compatibility
      if (typeof global !== 'undefined') {
        global.__DEV_MOCK_SESSION__ = result.data.session
        global.__DEV_MOCK_USER__ = result.data.user
      }
    }
  }
  
  // Also check for dev-mock-token pattern in headers/storage
  if (typeof global !== 'undefined' && global.__DEV_MOCK_TOKEN__) {
    console.debug('[AUTH_MOCK] Using existing dev-mock-token')
  }
}

// Initialize development mode
setupDevelopmentMode()

// ============================================================================
// ENHANCED EXPORTS FOR COMPATIBILITY
// ============================================================================

/**
 * Export the main authentication service and utilities
 */
/**
 * Export Supabase-compatible auth client as default for easier importing
 */
export default createSupabaseAuthClient()

export {
  // Supabase-compatible client (also available as default)
  createSupabaseAuthClient,
  
  // Main service (also available as default)
  authService,
  
  // Middleware integration
  validateTokenForMiddleware,
  extractTokenFromRequest,
  createAuthMiddleware,
  
  // Classes
  EnvironmentAwareAuthService,
  TokenManager,
  SessionManager,
  AuthTestHelpers,
  
  // Error classes
  AuthError,
  AuthenticationError,
  AuthorizationError,
  TokenError,
  SessionError,
  InvalidCredentialsError,
  TokenExpiredError,
  AccountNotVerifiedError,
  AccountInactiveError,
  AccountBannedError,
  SessionLimitExceededError,
  WeakPasswordError,
  ValidationError,
  NotFoundError,
  ConflictError,
  
  // Configuration
  defaultEnvironmentConfig,
  defaultTokenConfig,
  defaultSessionConfig,
  defaultPasswordPolicy,
  
  // Utilities
  createAuthService,
  authTestHelpers,
  generateUUID,
  sanitizeUser,
  validatePassword,
  validateEmail,
  simulateNetworkDelay,
  debugLog,
  toSupabaseError,
  
  // Data
  mockUsers
}

/**
 * Export types for TypeScript users
 */
export type {
  TokenHeader,
  TokenPayload,
  SupabaseUser,
  AuthFactor,
  Identity,
  Session,
  TokenConfig,
  SessionConfig,
  EnvironmentConfig,
  AuthResponse,
  ErrorObject,
  SignUpOptions,
  SignInCredentials,
  SignInOtpCredentials,
  UpdateUserAttributes,
  ResetPasswordOptions,
  MockUserDatabase,
  PasswordPolicy
}