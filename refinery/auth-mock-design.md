# Improved Authentication Mock Design

## Overview

This document outlines the design for an improved authentication mock that realistically simulates Supabase Auth behavior while following the project's strict development guidelines. The mock will provide comprehensive authentication flows with proper error handling, JWT token management, and state management.

## Analysis of Current Implementation

### Existing Auth Mock Limitations

1. **Static Token System**: Current mock uses hardcoded tokens (`mock-admin-token`, `mock-customer-token`) without proper JWT structure
2. **Limited User Scenarios**: Only admin and customer roles, missing edge cases (unverified, suspended, etc.)
3. **No Token Expiration**: Tokens don't expire, missing refresh flow simulation
4. **Simplified Error Handling**: Basic error objects without proper AppError pattern
5. **No Session Management**: Missing realistic session behavior
6. **No Timing Simulation**: Instant responses without network delay simulation

### Current Rev.js Strengths

1. **JWT-like Token Structure**: Already implements basic JWT-like tokens
2. **Multiple User Roles**: Includes admin, moderator, customer, guest, and inactive users
3. **Token Expiration**: Implements token expiration and refresh flow
4. **Error Classes**: Mock error classes following AppError pattern
5. **Password Policies**: Includes proper password validation

## Design Principles

Following the project's strict development guidelines:

1. **KISS Principle**: Simple, straightforward implementation without unnecessary abstractions
2. **MVC Architecture**: Clear separation between authentication logic and data
3. **Service Layer Pattern**: Authentication logic encapsulated in service functions
4. **Fail-Fast Error Handling**: Proper error throwing with AppError pattern
5. **Soft-Delete Support**: Active/inactive user status handling
6. **Controller JSON Spec**: Consistent `{ success, data/error, message }` response format

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Mock                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Token Utils   │  │   User Store    │  │  Error Utils │ │
│  │                 │  │                 │  │              │ │
│  │ - generateToken │  │ - mockUsers     │  │ - AppError   │ │
│  │ - decodeToken   │  │ - refreshTokens │  │ - Subclasses  │ │
│  │ - validateToken │  │ - sessions      │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Auth Service Layer                          │ │
│  │                                                         │ │
│  │ - signUp()                                              │ │
│  │ - signIn()                                              │ │
│  │ - signOut()                                             │ │
│  │ - refreshToken()                                        │ │
│  │ - getUser()                                             │ │
│  │ - resetPassword()                                       │ │
│  │ - updatePassword()                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               Configuration Layer                         │ │
│  │                                                         │ │
│  │ - Network delay simulation                              │ │
│  │ - Token expiration settings                             │ │
│  │ - User scenarios configuration                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Structures

### User Data Structure

```javascript
const mockUsers = {
  admin: {
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
    ]
  },
  moderator: {
    // Similar structure with moderator role
  },
  customer: {
    // Similar structure with user role
  },
  unverified: {
    // Similar structure but email_confirmed_at: null
  },
  suspended: {
    // Similar structure but active: false
  }
}
```

### Session Data Structure

```javascript
const session = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expires_in: 3600,
  expires_at: 1640995200,
  user: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@floresya.local',
    user_metadata: { /* ... */ },
    email_confirmed_at: '2023-01-01T00:00:00.000Z',
    // ... other user fields
  }
}
```

### Token Structure

```javascript
// JWT-like token structure
const tokenPayload = {
  sub: '00000000-0000-0000-0000-000000000001', // User ID
  email: 'admin@floresya.local',
  role: 'admin',
  iat: 1640991600, // Issued at timestamp
  exp: 1640995200, // Expiration timestamp
  type: 'access' | 'refresh',
  session_id: 'session-uuid',
  app_metadata: {
    provider: 'email',
    providers: ['email']
  },
  user_metadata: {
    full_name: 'Admin User',
    phone: '+584141234567',
    role: 'admin'
  }
}
```

## Token Utilities

### Token Generation

```javascript
const TokenUtils = {
  /**
   * Generate a mock JWT-like token with proper structure
   * @param {string} userId - User ID
   * @param {Object} user - User object
   * @param {string} type - Token type: 'access' | 'refresh'
   * @param {number} expiresInMinutes - Token expiration in minutes
   * @returns {string} Mock token
   */
  generateToken(userId, user, type = 'access', expiresInMinutes = 15) {
    const now = Math.floor(Date.now() / 1000)
    const expirationTime = now + (expiresInMinutes * 60)
    
    const header = btoa(JSON.stringify({ 
      alg: 'HS256', 
      typ: 'JWT',
      kid: 'mock-key-id'
    }))
    
    const payload = btoa(JSON.stringify({
      sub: userId,
      email: user.email,
      role: user.user_metadata.role,
      iat: now,
      exp: expirationTime,
      type,
      session_id: this.generateSessionId(),
      app_metadata: {
        provider: 'email',
        providers: ['email']
      },
      user_metadata: user.user_metadata
    }))
    
    const signature = btoa('mock-signature')
    return `${header}.${payload}.${signature}`
  },

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
  },

  /**
   * Decode and validate a mock token
   * @param {string} token - Token to decode
   * @returns {Object} Decoded payload
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  decodeToken(token) {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError('Token is required and must be a string')
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new UnauthorizedError('Invalid token format')
    }

    try {
      const payload = JSON.parse(atob(parts[1]))
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedError('Token has expired')
      }

      return payload
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError('Invalid token payload')
    }
  },

  /**
   * Validate token against stored session
   * @param {string} token - Access token
   * @returns {Object} User object
   * @throws {UnauthorizedError} If token is invalid or session not found
   */
  validateToken(token) {
    const payload = this.decodeToken(token)
    
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type')
    }

    // Check if session exists and is valid
    const session = sessions.get(payload.session_id)
    if (!session || session.expires_at < Date.now()) {
      throw new UnauthorizedError('Session expired or invalid')
    }

    // Find user
    const user = Object.values(mockUsers).find(u => u.id === payload.sub)
    if (!user || !user.active) {
      throw new UnauthorizedError('User not found or inactive')
    }

    return user
  }
}
```

## Authentication Service Methods

### Sign Up

```javascript
/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} metadata - Additional user metadata
 * @returns {Object} { success, data, message }
 * @throws {BadRequestError} If input validation fails
 * @throws {ConflictError} If email already exists
 */
async function signUp(email, password, metadata = {}) {
  // Simulate network delay (200-500ms)
  await simulateNetworkDelay()
  
  // Input validation
  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email is required and must be a string', { email })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new BadRequestError('Invalid email format', { email })
  }

  if (!password || typeof password !== 'string') {
    throw new BadRequestError('Password is required and must be a string')
  }

  // Password policy validation
  validatePassword(password)

  // Check if email already exists
  const existingUser = Object.values(mockUsers).find(user => user.email === email)
  if (existingUser) {
    throw new ConflictError('User already registered: ' + email, { email })
  }

  // Create new user (in mock scenario)
  const newUser = {
    id: generateUUID(),
    email,
    user_metadata: {
      full_name: metadata.full_name || null,
      phone: metadata.phone || null,
      role: 'user',
      avatar_url: null,
      website: null,
      ...metadata
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
    ]
  }

  // Add to mock users (for testing purposes)
  mockUsers[newUser.id] = newUser

  return {
    success: true,
    data: {
      user: sanitizeUser(newUser),
      session: null // No session until email is confirmed
    },
    message: 'Signup successful. Please check your email to verify your account.'
  }
}
```

### Sign In

```javascript
/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} { success, data, message }
 * @throws {BadRequestError} If input validation fails
 * @throws {UnauthorizedError} If credentials are invalid or user is inactive
 */
async function signIn(email, password) {
  // Simulate network delay
  await simulateNetworkDelay()
  
  // Input validation
  if (!email || typeof email !== 'string') {
    throw new BadRequestError('Email is required', { email })
  }

  if (!password || typeof password !== 'string') {
    throw new BadRequestError('Password is required')
  }

  // Find user by email
  const user = Object.values(mockUsers).find(u => u.email === email)
  if (!user) {
    throw new UnauthorizedError('Invalid login credentials', { email })
  }

  // Check if user is active (soft-delete check)
  if (!user.active || user.banned) {
    throw new UnauthorizedError('Account is inactive. Please contact support.', { email })
  }

  // Check if email is confirmed
  if (!user.email_confirmed) {
    throw new UnauthorizedError('Please verify your email before signing in', { email })
  }

  // Check password
  if (user.password !== password) {
    throw new UnauthorizedError('Invalid login credentials', { email })
  }

  // Generate tokens
  const sessionId = TokenUtils.generateSessionId()
  const accessToken = TokenUtils.generateToken(user.id, user, 'access', 15) // 15 minutes
  const refreshToken = TokenUtils.generateToken(user.id, user, 'refresh', 7 * 24 * 60) // 7 days

  // Store session
  const sessionData = {
    sessionId,
    userId: user.id,
    accessToken,
    refreshToken,
    expires_at: Date.now() + (15 * 60 * 1000), // 15 minutes
    created_at: new Date().toISOString()
  }
  sessions.set(sessionId, sessionData)
  refreshTokens.set(refreshToken, {
    userId: user.id,
    sessionId,
    createdAt: new Date()
  })

  // Update last sign in
  user.last_sign_in_at = new Date().toISOString()
  user.updated_at = new Date().toISOString()

  return {
    success: true,
    data: {
      user: sanitizeUser(user),
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 15 * 60,
        expires_at: Math.floor(Date.now() / 1000) + (15 * 60),
        user: sanitizeUser(user)
      }
    },
    message: 'Signed in successfully'
  }
}
```

### Sign Out

```javascript
/**
 * Sign out user and invalidate session
 * @param {string} accessToken - User access token
 * @returns {Object} { success, data, message }
 * @throws {UnauthorizedError} If token is invalid
 */
async function signOut(accessToken) {
  await simulateNetworkDelay()
  
  if (!accessToken) {
    throw new BadRequestError('Access token is required')
  }

  // Validate token and get session
  const payload = TokenUtils.decodeToken(accessToken)
  
  // Remove session
  if (payload.session_id) {
    sessions.delete(payload.session_id)
  }

  // Remove refresh token
  const user = Object.values(mockUsers).find(u => u.id === payload.sub)
  if (user) {
    // Find and remove refresh tokens for this user
    for (const [token, data] of refreshTokens.entries()) {
      if (data.userId === user.id) {
        refreshTokens.delete(token)
      }
    }
  }

  return {
    success: true,
    data: null,
    message: 'Signed out successfully'
  }
}
```

### Refresh Token

```javascript
/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} { success, data, message }
 * @throws {UnauthorizedError} If refresh token is invalid
 */
async function refreshToken(refreshToken) {
  await simulateNetworkDelay()
  
  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required')
  }

  // Check if refresh token exists and is valid
  const storedToken = refreshTokens.get(refreshToken)
  if (!storedToken) {
    throw new UnauthorizedError('Invalid refresh token')
  }

  // Decode and validate refresh token
  const payload = TokenUtils.decodeToken(refreshToken)
  
  if (payload.type !== 'refresh') {
    throw new UnauthorizedError('Invalid token type')
  }

  // Find user
  const user = Object.values(mockUsers).find(u => u.id === payload.sub)
  if (!user || !user.active) {
    throw new UnauthorizedError('User not found or inactive')
  }

  // Generate new access token
  const newAccessToken = TokenUtils.generateToken(user.id, user, 'access', 15)

  // Update session with new access token
  if (storedToken.sessionId) {
    const session = sessions.get(storedToken.sessionId)
    if (session) {
      session.accessToken = newAccessToken
      session.expires_at = Date.now() + (15 * 60 * 1000)
      sessions.set(storedToken.sessionId, session)
    }
  }

  return {
    success: true,
    data: {
      session: {
        access_token: newAccessToken,
        refresh_token: refreshToken, // Keep the same refresh token
        expires_in: 15 * 60,
        expires_at: Math.floor(Date.now() / 1000) + (15 * 60),
        user: sanitizeUser(user)
      }
    },
    message: 'Token refreshed successfully'
  }
}
```

### Get User

```javascript
/**
 * Get user from access token
 * @param {string} accessToken - User access token
 * @returns {Object} User data
 * @throws {UnauthorizedError} If token is invalid or user is inactive
 */
async function getUser(accessToken) {
  await simulateNetworkDelay()
  
  if (!accessToken) {
    throw new BadRequestError('Access token is required')
  }

  // Validate token and get user
  const user = TokenUtils.validateToken(accessToken)

  // Return user data without password
  return sanitizeUser(user)
}
```

## Error Handling Strategy

Following the AppError pattern from the project:

```javascript
// Import error classes from the project's AppError.js
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
  ValidationError
} from '../api/errors/AppError.js'

// Custom auth-specific error classes
class AuthError extends AppError {
  constructor(message, context = {}) {
    super(message, {
      statusCode: 401,
      code: 1001, // AUTH_ERROR
      context,
      userMessage: 'Authentication failed. Please try again.',
      severity: 'medium'
    })
  }
}

class TokenExpiredError extends AuthError {
  constructor(context = {}) {
    super('Token has expired', {
      statusCode: 401,
      code: 1002, // TOKEN_EXPIRED
      context,
      userMessage: 'Your session has expired. Please sign in again.',
      severity: 'medium'
    })
  }
}

class InvalidCredentialsError extends AuthError {
  constructor(context = {}) {
    super('Invalid credentials', {
      statusCode: 401,
      code: 1003, // INVALID_CREDENTIALS
      context,
      userMessage: 'Invalid email or password.',
      severity: 'low'
    })
  }
}

class AccountNotVerifiedError extends AuthError {
  constructor(context = {}) {
    super('Account not verified', {
      statusCode: 401,
      code: 1004, // ACCOUNT_NOT_VERIFIED
      context,
      userMessage: 'Please verify your email before signing in.',
      severity: 'medium'
    })
  }
}

class AccountInactiveError extends AuthError {
  constructor(context = {}) {
    super('Account inactive', {
      statusCode: 401,
      code: 1005, // ACCOUNT_INACTIVE
      context,
      userMessage: 'Your account is inactive. Please contact support.',
      severity: 'medium'
    })
  }
}
```

## State Management Approach

### In-Memory Storage

```javascript
// Session storage
const sessions = new Map()

// Refresh token storage
const refreshTokens = new Map()

// User storage (pre-defined users + runtime created users)
const mockUsers = {
  // Pre-defined users
}

// Runtime state management
const StateManager = {
  /**
   * Add a new user to the mock database
   * @param {Object} user - User object
   */
  addUser(user) {
    mockUsers[user.id] = user
  },

  /**
   * Update user data
   * @param {string} userId - User ID
   * @param {Object} updates - User updates
   */
  updateUser(userId, updates) {
    if (mockUsers[userId]) {
      mockUsers[userId] = { ...mockUsers[userId], ...updates }
    }
  },

  /**
   * Deactivate user (soft delete)
   * @param {string} userId - User ID
   */
  deactivateUser(userId) {
    if (mockUsers[userId]) {
      mockUsers[userId].active = false
      mockUsers[userId].updated_at = new Date().toISOString()
    }
  },

  /**
   * Get all active sessions for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of sessions
   */
  getUserSessions(userId) {
    const userSessions = []
    for (const [sessionId, session] of sessions.entries()) {
      if (session.userId === userId && session.expires_at > Date.now()) {
        userSessions.push({ sessionId, ...session })
      }
    }
    return userSessions
  },

  /**
   * Invalidate all sessions for a user
   * @param {string} userId - User ID
   */
  invalidateUserSessions(userId) {
    for (const [sessionId, session] of sessions.entries()) {
      if (session.userId === userId) {
        sessions.delete(sessionId)
      }
    }
  },

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now()
    for (const [sessionId, session] of sessions.entries()) {
      if (session.expires_at < now) {
        sessions.delete(sessionId)
      }
    }
  }
}
```

## Configuration Options

```javascript
const AuthConfig = {
  // Token settings
  token: {
    accessTokenExpiry: 15 * 60, // 15 minutes in seconds
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days in seconds
    issuer: 'floresya-auth-mock',
    audience: 'floresya-api'
  },

  // Network simulation
  network: {
    enabled: true,
    minDelay: 200, // Minimum delay in ms
    maxDelay: 500  // Maximum delay in ms
  },

  // Password policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },

  // User scenarios
  scenarios: {
    enableUnverifiedUsers: true,
    enableSuspendedUsers: true,
    enableBannedUsers: true
  },

  // Session management
  session: {
    maxSessionsPerUser: 5,
    cleanupInterval: 60 * 1000, // 1 minute
    autoCleanup: true
  }
}

/**
 * Simulate network delay for realistic behavior
 */
async function simulateNetworkDelay() {
  if (AuthConfig.network.enabled) {
    const delay = Math.random() * 
      (AuthConfig.network.maxDelay - AuthConfig.network.minDelay) + 
      AuthConfig.network.minDelay
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}
```

## Usage Examples

### Basic Authentication Flow

```javascript
import authService from './rev.js'

// Sign up
try {
  const signUpResult = await authService.signUp(
    'newuser@example.com',
    'SecurePass123!',
    { full_name: 'New User', phone: '+1234567890' }
  )
  console.log('Sign up successful:', signUpResult.message)
} catch (error) {
  console.error('Sign up failed:', error.toJSON())
}

// Sign in
try {
  const signInResult = await authService.signIn(
    'customer@floresya.local',
    'CustPass123!'
  )
  console.log('Sign in successful:', signInResult.message)
  const { access_token, refresh_token } = signInResult.data.session
  
  // Get user
  const user = await authService.getUser(access_token)
  console.log('Current user:', user.email)
} catch (error) {
  console.error('Sign in failed:', error.toJSON())
}
```

### Token Refresh Flow

```javascript
try {
  const refreshResult = await authService.refreshToken(refreshToken)
  console.log('Token refreshed:', refreshResult.message)
  const newAccessToken = refreshResult.data.session.access_token
  
  // Continue using new access token
  const user = await authService.getUser(newAccessToken)
} catch (error) {
  console.error('Token refresh failed:', error.toJSON())
  // Redirect to sign in
}
```

### Error Handling Examples

```javascript
try {
  await authService.signIn('invalid@email.com', 'wrongpassword')
} catch (error) {
  if (error instanceof UnauthorizedError) {
    console.log('Invalid credentials:', error.userMessage)
  }
  
  // Full error details
  console.log('Error details:', error.toJSON())
}
```

### State Management Examples

```javascript
import { StateManager } from './rev.js'

// Add a new user at runtime
const newUser = {
  id: 'custom-user-id',
  email: 'custom@example.com',
  password: 'CustomPass123!',
  user_metadata: { role: 'user' },
  // ... other user fields
}
StateManager.addUser(newUser)

// Deactivate a user
StateManager.deactivateUser('user-id-to-deactivate')

// Get user sessions
const userSessions = StateManager.getUserSessions('user-id')
console.log('Active sessions:', userSessions.length)

// Invalidate all user sessions
StateManager.invalidateUserSessions('user-id')
```

## Implementation Guidelines

1. **Follow KISS Principle**: Keep implementation simple and straightforward
2. **Use Proper Error Handling**: Always throw appropriate AppError subclasses
3. **Maintain Consistent Response Format**: Use `{ success, data/error, message }`
4. **Implement Soft-Delete**: Use `active` flag instead of hard deletes
5. **Simulate Realistic Behavior**: Add network delays and proper token expiration
6. **Maintain State**: Keep track of sessions and refresh tokens
7. **Validate Inputs**: Implement comprehensive input validation
8. **Follow Project Patterns**: Use the same patterns as the existing authService

## Testing Considerations

1. **Test All User Scenarios**: Admin, moderator, customer, unverified, suspended
2. **Test Token Expiration**: Verify expired tokens are rejected
3. **Test Refresh Flow**: Ensure token refresh works correctly
4. **Test Error Cases**: Verify proper error handling for all scenarios
5. **Test State Management**: Ensure sessions and tokens are managed correctly
6. **Test Concurrent Sessions**: Verify multiple sessions per user work
7. **Test Session Cleanup**: Ensure expired sessions are cleaned up

## Conclusion

This design provides a comprehensive, realistic authentication mock that follows Supabase Auth patterns while maintaining the project's strict development guidelines. The implementation will provide accurate testing capabilities for authentication flows, error handling, and edge cases while keeping the code simple and maintainable.