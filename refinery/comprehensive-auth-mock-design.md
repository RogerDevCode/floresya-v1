# Comprehensive Authentication Mock Design Specification

## Executive Summary

This document provides a complete design specification for an enhanced authentication mock that accurately replicates Supabase Auth behavior while following the project's strict development guidelines. The design addresses all limitations of the current implementation and incorporates comprehensive research findings on Supabase auth patterns.

## 1. Analysis of Current Implementation

### 1.1 Current Implementation Strengths

Based on the analysis of [`rev.js`](rev.js), the current implementation has several strengths:

1. **JWT-like Token Structure**: Already implements basic JWT-like tokens with header, payload, and signature
2. **Multiple User Roles**: Includes admin, moderator, customer, guest, and inactive users
3. **Token Expiration**: Implements token expiration and refresh flow
4. **Error Classes**: Mock error classes following AppError pattern
5. **Password Policies**: Includes proper password validation
6. **Supabase API Compatibility**: Method signatures match Supabase auth API

### 1.2 Current Implementation Limitations

1. **Incomplete User Schema**: Missing many standard Supabase user fields
2. **Limited Token Validation**: Basic token validation without comprehensive checks
3. **Simplified Session Management**: Basic session storage without advanced features
4. **Missing Auth Methods**: Some Supabase auth methods are not fully implemented
5. **No Development/Production Modes**: Single mode operation without environment-specific behavior
6. **Limited Test Integration**: Minimal integration with testing frameworks

## 2. Comprehensive Token Management System

### 2.1 Token Structure Design

```typescript
interface TokenHeader {
  alg: 'HS256'           // Algorithm
  typ: 'JWT'             // Token type
  kid: string            // Key ID
}

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
```

### 2.2 Token Generation Strategy

```typescript
class TokenManager {
  private readonly config: TokenConfig
  private readonly keyStore: Map<string, string> // Key ID -> Key mapping
  
  /**
   * Generate a new token with comprehensive validation
   */
  generateToken(
    userId: string, 
    user: SupabaseUser, 
    type: 'access' | 'refresh',
    customExpiry?: number
  ): string
    
  /**
   * Decode and validate token with extensive checks
   */
  decodeToken(token: string): TokenPayload
    
  /**
   * Validate token against session and user status
   */
  validateToken(token: string, type: 'access' | 'refresh'): {
    payload: TokenPayload
    user: SupabaseUser
    session?: Session
  }
  
  /**
   * Refresh token with rotation strategy
   */
  rotateRefreshToken(refreshToken: string): {
    newAccessToken: string
    newRefreshToken: string
  }
  
  /**
   * Revoke all tokens for a user
   */
  revokeAllUserTokens(userId: string): void
  
  /**
   * Check if token is expired with grace period
   */
  isTokenExpired(payload: TokenPayload, gracePeriodMs?: number): boolean
}
```

### 2.3 Token Configuration

```typescript
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
```

## 3. Complete Supabase User Schema Interfaces

### 3.1 Core User Interface

```typescript
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
}
```

### 3.2 Supporting Interfaces

```typescript
interface AuthFactor {
  id: string
  created_at: string
  updated_at: string
  status: 'verified' | 'unverified'
  friendly_name?: string
  factor_type: 'totp' | 'webauthn' | 'phone' | 'email'
}

interface Identity {
  id: string
  user_id: string
  identity_data: Record<string, any>
  provider: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
}

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
```

### 3.3 Mock User Data Structure

```typescript
interface MockUserDatabase {
  [userId: string]: SupabaseUser & {
    // Mock-specific fields (not in real Supabase)
    password: string            // Plain text for mock only
    __mockType: 'predefined' | 'runtime'
  }
}

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
    // ... complete Supabase user fields
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
    // ... complete Supabase user fields
  },
  
  // Unverified user (email not confirmed)
  '00000000-0000-0000-0000-000000000003': {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'unverified@floresya.local',
    password: 'UnverPass123!',
    email_confirmed_at: null,
    email_confirmed: false,
    confirmation_token: 'mock-confirmation-token',
    confirmation_sent_at: '2023-01-01T00:00:00.000Z',
    // ... complete Supabase user fields
  },
  
  // Suspended user (inactive)
  '00000000-0000-0000-0000-000000000004': {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'suspended@floresya.local',
    password: 'SuspPass123!',
    active: false,
    banned: false,
    // ... complete Supabase user fields
  },
  
  // Banned user
  '00000000-0000-0000-0000-000000000005': {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'banned@floresya.local',
    password: 'BannedPass123!',
    active: true,
    banned: true,
    // ... complete Supabase user fields
  }
}
```

## 4. Session State Management Architecture

### 4.1 Session Storage Design

```typescript
interface SessionStore {
  // In-memory storage for active sessions
  sessions: Map<string, Session>
  
  // Refresh token storage
  refreshTokens: Map<string, {
    userId: string
    sessionId: string
    createdAt: Date
    lastUsedAt: Date
    expiresAt: Date
  }>
  
  // Device tracking
  deviceSessions: Map<string, Set<string>> // deviceId -> sessionIds
  
  // Geographic tracking
  locationSessions: Map<string, Set<string>> // locationId -> sessionIds
}

class SessionManager {
  private store: SessionStore
  private config: SessionConfig
  
  /**
   * Create a new session with comprehensive tracking
   */
  createSession(
    userId: string, 
    deviceInfo?: DeviceInfo,
    locationInfo?: LocationInfo
  ): Session
  
  /**
   * Validate session and update last accessed
   */
  validateSession(sessionId: string): Session
  
  /**
   * Invalidate specific session
   */
  invalidateSession(sessionId: string): void
  
  /**
   * Invalidate all sessions for user
   */
  invalidateUserSessions(userId: string): void
  
  /**
   * Get all active sessions for user
   */
  getUserSessions(userId: string): Session[]
  
  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number
  
  /**
   * Check session limits per user
   */
  isSessionLimitReached(userId: string): boolean
  
  /**
   * Get session analytics
   */
  getSessionAnalytics(userId?: string): SessionAnalytics
}
```

### 4.2 Session Configuration

```typescript
interface SessionConfig {
  maxSessionsPerUser: number      // Default: 5
  sessionTimeout: number          // Default: 15 minutes
  refreshTimeout: number           // Default: 7 days
  cleanupInterval: number         // Default: 1 minute
  trackDeviceInfo: boolean         // Default: true
  trackLocationInfo: boolean       // Default: false (privacy)
  enableSessionAnalytics: boolean  // Default: true
}

interface DeviceInfo {
  user_agent: string
  device_id?: string
  platform?: string
  browser?: string
  os?: string
}

interface LocationInfo {
  ip_address: string
  country?: string
  city?: string
  timezone?: string
}

interface SessionAnalytics {
  totalSessions: number
  activeSessions: number
  averageSessionDuration: number
  devicesUsed: number
  locationsUsed: number
  lastSignInAt?: string
}
```

## 5. Error Handling Strategy

### 5.1 Error Class Hierarchy

```typescript
// Base error class following AppError pattern
class AuthError extends AppError {
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
    super(message, options)
  }
}

// Authentication-specific errors
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
```

### 5.2 Error Handling Patterns

```typescript
interface ErrorHandler {
  /**
   * Wrap async functions with consistent error handling
   */
  withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<{ data?: T; error?: ErrorObject }>
  
  /**
   * Convert errors to Supabase-compatible format
   */
  toSupabaseError(error: Error): ErrorObject
  
  /**
   * Log errors with context
   */
  logError(error: Error, context?: Record<string, any>): void
}

interface ErrorObject {
  message: string
  status: number
  code: string
  details?: Record<string, any>
}
```

## 6. Auth Service Method Signatures and Implementations

### 6.1 Core Authentication Methods

```typescript
interface AuthService {
  /**
   * Sign up a new user
   * Supabase API: auth.signUp(email, password, options)
   */
  signUp(
    email: string, 
    password: string, 
    options?: SignUpOptions
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session | null }>>
  
  /**
   * Sign in with email and password
   * Supabase API: auth.signInWithPassword(credentials)
   */
  signInWithPassword(
    credentials: SignInCredentials
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>>
  
  /**
   * Sign in with magic link
   * Supabase API: auth.signInWithOtp(credentials)
   */
  signInWithOtp(
    credentials: SignInOtpCredentials
  ): Promise<AuthResponse<{ user: SupabaseUser | null; session: null }>>
  
  /**
   * Sign out current user
   * Supabase API: auth.signOut()
   */
  signOut(): Promise<AuthResponse<{}>>
  
  /**
   * Refresh session
   * Supabase API: auth.refreshSession(refreshToken)
   */
  refreshSession(
    refreshToken?: string
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>>
  
  /**
   * Get current user
   * Supabase API: auth.getUser(jwt)
   */
  getUser(jwt?: string): Promise<AuthResponse<{ user: SupabaseUser }>>
  
  /**
   * Update user attributes
   * Supabase API: auth.updateUser(attributes)
   */
  updateUser(
    attributes: UpdateUserAttributes
  ): Promise<AuthResponse<{ user: SupabaseUser }>>
  
  /**
   * Reset password for email
   * Supabase API: auth.resetPasswordForEmail(email, options)
   */
  resetPasswordForEmail(
    email: string,
    options?: ResetPasswordOptions
  ): Promise<AuthResponse<{}>>
}

// Supporting interfaces
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

interface AuthResponse<T> {
  data: T | null
  error: ErrorObject | null
}
```

### 6.2 Advanced Authentication Methods

```typescript
interface AdvancedAuthService extends AuthService {
  /**
   * Sign in with OAuth provider
   * Supabase API: auth.signInWithOAuth(credentials)
   */
  signInWithOAuth(
    credentials: SignInOAuthCredentials
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>>
  
  /**
   * Sign in with ID token (SSO)
   * Supabase API: auth.signInWithIdToken(credentials)
   */
  signInWithIdToken(
    credentials: SignInIdTokenCredentials
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>>
  
  /**
   * Verify OTP
   * Supabase API: auth.verifyOtp(params)
   */
  verifyOtp(
    params: VerifyOtpParams
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>>
  
  /**
   * Resend confirmation email
   * Supabase API: auth.resend(params)
   */
  resend(
    params: ResendParams
  ): Promise<AuthResponse<{}>>
  
  /**
   * Exchange code for session
   * Supabase API: auth.exchangeCodeForSession(authCode)
   */
  exchangeCodeForSession(
    authCode: string
  ): Promise<AuthResponse<{ user: SupabaseUser; session: Session }>>
  
  /**
   * Get user by ID
   * Supabase API: auth.admin.getUserById(uid)
   */
  adminGetUserById(
    uid: string
  ): Promise<AuthResponse<{ user: SupabaseUser }>>
  
  /**
   * List users
   * Supabase API: auth.admin.listUsers(params)
   */
  adminListUsers(
    params?: AdminListUsersParams
  ): Promise<AuthResponse<{ users: SupabaseUser[] }>>
  
  /**
   * Create user
   * Supabase API: auth.admin.createUser(attributes)
   */
  adminCreateUser(
    attributes: AdminCreateUserAttributes
  ): Promise<AuthResponse<{ user: SupabaseUser }>>
  
  /**
   * Update user by ID
   * Supabase API: auth.admin.updateUserById(uid, attributes)
   */
  adminUpdateUserById(
    uid: string,
    attributes: AdminUpdateUserAttributes
  ): Promise<AuthResponse<{ user: SupabaseUser }>>
  
  /**
   * Delete user
   * Supabase API: auth.admin.deleteUser(id)
   */
  adminDeleteUser(
    id: string
  ): Promise<AuthResponse<{}>>
  
  /**
   * Invite user by email
   * Supabase API: auth.admin.inviteUserByEmail(email, options)
   */
  adminInviteUserByEmail(
    email: string,
    options?: AdminInviteUserOptions
  ): Promise<AuthResponse<{ user: SupabaseUser }>>
}
```

## 7. Development vs Production Mode Handling

### 7.1 Environment Configuration

```typescript
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
```

### 7.2 Mode-Specific Behavior

```typescript
class EnvironmentAwareAuthService implements AdvancedAuthService {
  private config: EnvironmentConfig
  private baseService: AdvancedAuthService
  
  constructor(config: EnvironmentConfig) {
    this.config = config
    this.baseService = this.createServiceForMode(config.mode)
  }
  
  private createServiceForMode(mode: string): AdvancedAuthService {
    switch (mode) {
      case 'development':
        return new DevelopmentAuthService()
      case 'production':
        return new ProductionAuthService()
      case 'test':
        return new TestAuthService()
      default:
        throw new Error(`Unsupported environment mode: ${mode}`)
    }
  }
  
  // Delegate all methods to the appropriate service implementation
  async signUp(email: string, password: string, options?: SignUpOptions) {
    return this.baseService.signUp(email, password, options)
  }
  
  // ... other methods
}

class DevelopmentAuthService implements AdvancedAuthService {
  private readonly config = defaultEnvironmentConfig.development
  
  async signUp(email: string, password: string, options?: SignUpOptions) {
    // Development-specific behavior:
    // - Relaxed password policy if enabled
    // - Debug logging
    // - Mock data integration
    
    if (this.config.enableDebugLogging) {
      console.debug(`[DEV] Signing up user: ${email}`)
    }
    
    // ... implementation
  }
  
  // ... other methods with development-specific behavior
}

class ProductionAuthService implements AdvancedAuthService {
  private readonly config = defaultEnvironmentConfig.production
  
  async signUp(email: string, password: string, options?: SignUpOptions) {
    // Production-specific behavior:
    // - Strict password policy
    // - No debug logging
    // - No mock data
    // - Enhanced security measures
    
    // ... implementation
  }
  
  // ... other methods with production-specific behavior
}

class TestAuthService implements AdvancedAuthService {
  private readonly config = defaultEnvironmentConfig.test
  
  async signUp(email: string, password: string, options?: SignUpOptions) {
    // Test-specific behavior:
    // - No token expiration
    // - No network delays
    // - Deterministic behavior
    // - Test data isolation
    
    // ... implementation
  }
  
  // ... other methods with test-specific behavior
}
```

## 8. Integration with Existing Test Framework

### 8.1 Test Helper Utilities

```typescript
interface AuthTestHelpers {
  /**
   * Create a test user with specific attributes
   */
  createTestUser(overrides?: Partial<SupabaseUser>): Promise<SupabaseUser>
  
  /**
   * Create test session for user
   */
  createTestSession(userId: string): Promise<Session>
  
  /**
   * Generate valid test tokens
   */
  generateTestTokens(userId: string): {
    accessToken: string
    refreshToken: string
  }
  
  /**
   * Simulate specific auth scenarios
   */
  simulateAuthScenario(scenario: AuthScenario): Promise<void>
  
  /**
   * Reset auth state for clean tests
   */
  resetAuthState(): Promise<void>
  
  /**
   * Assert auth state
   */
  assertAuthState(expectedState: AuthState): void
  
  /**
   * Mock auth responses
   */
  mockAuthResponse(method: string, response: any): void
  
  /**
   * Spy on auth method calls
   */
  spyOnAuthMethod(method: string): jasmine.Spy | jest.SpyInstance
}

type AuthScenario = 
  | 'expired_token'
  | 'invalid_token'
  | 'user_not_found'
  | 'user_inactive'
  | 'user_banned'
  | 'email_not_verified'
  | 'session_expired'
  | 'too_many_sessions'
  | 'weak_password'
  | 'email_already_exists'

interface AuthState {
  currentUser?: SupabaseUser
  currentSession?: Session
  activeSessions?: Session[]
  refreshTokens?: string[]
  lastError?: Error
}
```

### 8.2 Test Framework Adapters

```typescript
// Jest adapter
interface JestAuthTestUtils {
  beforeEachAuth(): Promise<void>
  afterEachAuth(): Promise<void>
  withAuthUser(user: SupabaseUser): void
  withAuthSession(session: Session): void
  withExpiredToken(): void
  withInvalidToken(): void
  expectAuthError(errorClass: Constructor<AuthError>): void
  expectAuthSuccess(): void
}

// Jasmine adapter
interface JasmineAuthTestUtils {
  setupAuthTestSuite(): void
  teardownAuthTestSuite(): void
  givenAuthUser(user: SupabaseUser): void
  givenAuthSession(session: Session): void
  givenExpiredToken(): void
  givenInvalidToken(): void
  authShouldFailWith(errorClass: Constructor<AuthError>): void
  authShouldSucceed(): void
}

// Mocha adapter
interface MochaAuthTestUtils {
  beforeAuth(): Promise<void>
  afterAuth(): Promise<void>
  withAuthUser(user: SupabaseUser): void
  withAuthSession(session: Session): void
  withExpiredToken(): void
  withInvalidToken(): void
  expectAuthError(errorClass: Constructor<AuthError>): void
  expectAuthSuccess(): void
}
```

### 8.3 Test Data Management

```typescript
interface AuthTestDataManager {
  /**
   * Load test data from fixtures
   */
  loadFixtures(fixturePath: string): Promise<void>
  
  /**
   * Create test database with users
   */
  createTestDatabase(users: SupabaseUser[]): Promise<void>
  
  /**
   * Clean up test data
   */
  cleanupTestData(): Promise<void>
  
  /**
   * Seed test data
   */
  seedTestData(scenario: string): Promise<void>
  
  /**
   * Export current state for debugging
   */
  exportAuthState(): AuthStateExport
  
  /**
   * Import auth state for testing
   */
  importAuthState(state: AuthStateExport): Promise<void>
}

interface AuthStateExport {
  users: SupabaseUser[]
  sessions: Session[]
  refreshTokens: Array<{
    token: string
    userId: string
    sessionId: string
  }>
  config: EnvironmentConfig
  timestamp: string
}
```

## 9. Comprehensive Documentation for the Mock Structure

### 9.1 API Documentation Structure

```typescript
interface AuthApiDocumentation {
  overview: {
    purpose: string
    features: string[]
    architecture: string
    usage: string
  }
  
  methods: {
    [methodName: string]: {
      description: string
      parameters: ParameterDocumentation[]
      returnType: string
      examples: CodeExample[]
      errors: ErrorDocumentation[]
      notes: string[]
    }
  }
  
  types: {
    [typeName: string]: {
      description: string
      properties: PropertyDocumentation[]
      examples: CodeExample[]
    }
  }
  
  errors: {
    [errorName: string]: {
      description: string
      statusCode: number
      code: string
      userMessage: string
      causes: string[]
      resolution: string
    }
  }
  
  configuration: {
    [configKey: string]: {
      description: string
      type: string
      defaultValue: any
      options?: any[]
      impact: string
    }
  }
}

interface ParameterDocumentation {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: any
  validation?: string[]
}

interface PropertyDocumentation {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: any
  readonly?: boolean
}

interface CodeExample {
  title: string
  description: string
  code: string
  language: string
  context?: string
}

interface ErrorDocumentation {
  errorClass: string
  condition: string
  statusCode: number
  code: string
  message: string
}
```

### 9.2 Usage Examples

```typescript
// Basic authentication flow
const basicAuthExample = {
  title: 'Basic Authentication Flow',
  description: 'Complete authentication flow from sign up to sign out',
  code: `
import { authService } from './auth-service'

// Sign up
const { data, error } = await authService.signUp(
  'user@example.com',
  'SecurePass123!',
  { data: { full_name: 'John Doe' } }
)

if (error) {
  console.error('Sign up failed:', error)
  return
}

// Sign in
const { data: signInData, error: signInError } = await authService.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!'
})

if (signInError) {
  console.error('Sign in failed:', signInError)
  return
}

const { user, session } = signInData
console.log('Signed in as:', user.email)

// Get current user
const { data: userData } = await authService.getUser(session.access_token)
console.log('Current user:', userData.user.email)

// Sign out
await authService.signOut()
console.log('Signed out')
`,
  language: 'typescript'
}

// Token refresh example
const tokenRefreshExample = {
  title: 'Token Refresh Flow',
  description: 'Handling token expiration and refresh',
  code: `
import { authService } from './auth-service'

// Initial sign in
const { data: signInData } = await authService.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!'
})

const { session } = signInData

// Simulate token expiration (in real app, this would be detected by API calls)
setTimeout(async () => {
  try {
    // Try to use expired token
    await authService.getUser(session.access_token)
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      // Refresh the token
      const { data: refreshData } = await authService.refreshSession(
        session.refresh_token
      )
      
      const { session: newSession } = refreshData
      console.log('Token refreshed successfully')
      
      // Continue using new access token
      const { data: userData } = await authService.getUser(newSession.access_token)
      console.log('User data:', userData.user.email)
    }
  }
}, 15 * 60 * 1000) // 15 minutes
`,
  language: 'typescript'
}

// Error handling example
const errorHandlingExample = {
  title: 'Comprehensive Error Handling',
  description: 'Handling different types of authentication errors',
  code: `
import { authService, 
         InvalidCredentialsError,
         AccountNotVerifiedError,
         TokenExpiredError } from './auth-service'

async function handleSignIn(email: string, password: string) {
  try {
    const { data, error } = await authService.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      // Handle specific error types
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
          throw new InvalidCredentialsError({ email })
          
        case 'ACCOUNT_NOT_VERIFIED':
          throw new AccountNotVerifiedError({ email })
          
        case 'TOKEN_EXPIRED':
          throw new TokenExpiredError()
          
        default:
          throw new Error(\`Authentication failed: \${error.message}\`)
      }
    }
    
    return data
  } catch (error) {
    // Log error for debugging
    console.error('Authentication error:', {
      type: error.constructor.name,
      message: error.message,
      context: error.context
    })
    
    // Re-throw for UI to handle
    throw error
  }
}

// Usage
try {
  const { user, session } = await handleSignIn('user@example.com', 'password')
  console.log('Authentication successful')
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    // Show invalid credentials message
  } else if (error instanceof AccountNotVerifiedError) {
    // Show verification required message
  } else {
    // Show generic error message
  }
}
`,
  language: 'typescript'
}
```

## 10. Review and Finalize the Complete Design Specification

### 10.1 Design Validation Checklist

- [x] **Complete Supabase Compatibility**: All auth methods match Supabase API signatures
- [x] **Comprehensive Token Management**: JWT-like tokens with proper expiration and refresh
- [x] **Complete User Schema**: All Supabase user fields included with proper types
- [x] **Advanced Session Management**: Multi-device support, tracking, and analytics
- [x] **Robust Error Handling**: Comprehensive error hierarchy with proper context
- [x] **Environment Awareness**: Development, production, and test mode support
- [x] **Test Framework Integration**: Helpers, adapters, and utilities for testing
- [x] **MVC Architecture Compliance**: Clear separation of concerns
- [x] **Service Layer Pattern**: Authentication logic properly encapsulated
- [x] **Fail-Fast Error Handling**: Proper error throwing with AppError pattern
- [x] **Soft-Delete Support**: Active/inactive user status handling
- [x] **Clean Async/Await Patterns**: No callback hell or promise chaining
- [x] **No Silent Failures**: All errors properly handled and reported

### 10.2 Implementation Priorities

1. **Phase 1: Core Infrastructure**
   - Token management system
   - User schema interfaces
   - Error handling framework
   - Basic session management

2. **Phase 2: Authentication Methods**
   - Core auth methods (signUp, signIn, signOut, etc.)
   - Token refresh functionality
   - Password management

3. **Phase 3: Advanced Features**
   - Multi-device session management
   - Admin methods
   - OAuth and SSO support

4. **Phase 4: Testing and Documentation**
   - Test framework integration
   - Comprehensive documentation
   - Usage examples and guides

### 10.3 Migration Strategy

1. **Backward Compatibility**: Maintain compatibility with existing [`rev.js`](rev.js) implementation
2. **Gradual Migration**: Allow incremental adoption of new features
3. **Configuration-Driven**: Enable/disable features via configuration
4. **Testing Coverage**: Ensure all existing tests continue to pass
5. **Documentation Updates**: Update all relevant documentation

### 10.4 Performance Considerations

1. **Memory Management**: Efficient session storage and cleanup
2. **Token Validation**: Optimized token parsing and validation
3. **Concurrent Sessions**: Handle multiple user sessions efficiently
4. **Network Simulation**: Optional network delays for realistic testing
5. **State Synchronization**: Ensure consistent state across operations

### 10.5 Security Considerations

1. **Token Security**: Proper token generation and validation
2. **Session Security**: Secure session management and cleanup
3. **Password Security**: Strong password policies and validation
4. **Error Information**: Avoid leaking sensitive information in errors
5. **Rate Limiting**: Prevent brute force attacks

## Conclusion

This comprehensive design specification provides a complete blueprint for an enhanced authentication mock that accurately replicates Supabase Auth behavior while following the project's strict development guidelines. The design addresses all limitations of the current implementation and provides a robust foundation for authentication testing and development.

The modular architecture allows for incremental implementation and customization based on specific project needs. The comprehensive error handling, session management, and testing integration ensure reliable and maintainable authentication functionality.

This design will enable developers to:

1. Test authentication flows with realistic behavior
2. Handle edge cases and error scenarios effectively
3. Maintain consistency with Supabase Auth API
4. Develop in different environments with appropriate configurations
5. Integrate seamlessly with existing test frameworks

The next step would be to implement this design following the outlined phases and priorities, ensuring thorough testing at each stage.